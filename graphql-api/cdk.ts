import * as fs from 'fs'
import * as path from 'path'
import * as appsync from '@aws-cdk/aws-appsync-alpha'
import {
  aws_ssm as ssm,
  aws_iam as iam,
  aws_cognito as cognito,
  aws_lambda_nodejs as nodeLambda,
  aws_dynamodb as dynamodb,
  Duration,
  Stack
} from 'aws-cdk-lib'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'

export interface AppSyncApiProps {
  appName: string,
  tableName: string
}

export class AppSyncApi extends Construct {
  constructor(scope: Construct, id: string, props: AppSyncApiProps) {
    super(scope, id)

    // Required SSM parameters + other variables
    const cognitoUserPoolId = ssm.StringParameter.valueForStringParameter(this, `/${props.appName}/cognito/userPoolId`)
    const region = Stack.of(this).region
    const account = Stack.of(this).account
    const userPoolArn = `arn:aws:cognito-idp:${region}:${account}:userpool/${cognitoUserPoolId}`

    /**
     * Util Functions
     */
    enum OperationType {
      QUERY = 'Query',
      MUTATION = 'Mutation',
    }
    const create_lambda_resolver = (
      lambdaName: string,
      fieldName: string,
      graphqlOperation: OperationType,
      lambdaEnvVariables?: {[key: string]: string}
    ): nodeLambda.NodejsFunction => {
      const lambda = new nodeLambda.NodejsFunction(this, `${lambdaName}Lambda`, {
        functionName: lambdaName,
        entry: path.join(__dirname, lambdaName, 'index.ts'),
        handler: 'lambdaHandler',
        runtime: Runtime.NODEJS_14_X,
        environment: lambdaEnvVariables,
        timeout: Duration.seconds(5)
      })
      const lambdaDS = api.addLambdaDataSource(`${lambdaName}-Datasource`, lambda)
      lambdaDS.createResolver({
        fieldName: fieldName,
        typeName: graphqlOperation
      })

      return lambda
    }

    /**
     * Graphql API
     */
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: `${props.appName}-api`,
      schema: appsync.Schema.fromAsset(path.join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: cognito.UserPool.fromUserPoolId(this, 'CognitoUserPool', cognitoUserPoolId)
          }
        }
      },
      xrayEnabled: true,
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ERROR
      }
    })

    // Create SSM Parameters for API
    new ssm.StringParameter(this, 'apiURL', {
      description: 'GraphQL API URL',
      stringValue: api.graphqlUrl,
      parameterName: `/${props.appName}/graphqlUrl`
    })

    /**
     * DataSources, Resolvers and Lambdas
     */
    const table = dynamodb.Table.fromTableName(this, 'Table', props.tableName)
    const tableDS = api.addDynamoDbDataSource(`${props.tableName}-DataSource`, table)

    // Mutations
    const createUserLambda = create_lambda_resolver(
      'CreateUser', 'createUser', OperationType.MUTATION, { COGNITO_USER_POOL_ID: cognitoUserPoolId }
    )
    createUserLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:AdminCreateUser', 'cognito-idp:AdminAddUserToGroup'],
      resources: [userPoolArn]
    }))

    // See https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html#aws-appsync-resolver-mapping-template-reference-dynamodb-putitem
    tableDS.createResolver({
      typeName: OperationType.MUTATION,
      fieldName: 'newAlbum',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version" : "2017-02-28",
          "operation" : "PutItem",
          "key": {
            "PK": $util.dynamodb.toDynamoDBJson("ARTIST#$ctx.args.input.Artist"),
            "SK": $util.dynamodb.toDynamoDBJson("ALBUM#$ctx.args.input.AlbumName")
          },
          "attributeValues": {
            "AlbumName": $util.dynamodb.toDynamoDBJson($ctx.args.input.AlbumName),
            "Artist": $util.dynamodb.toDynamoDBJson($ctx.args.input.Artist),
            "NumSongs": $util.dynamodb.toDynamoDBJson($ctx.args.input.NumSongs),
            "RecordLabel": $util.dynamodb.toDynamoDBJson($ctx.args.input.RecordLabel),
            "ReleaseYear": $util.dynamodb.toDynamoDBJson($ctx.args.input.ReleaseYear),
            "Sales": $util.dynamodb.toDynamoDBJson($ctx.args.input.Sales)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
    })

    // Queries
    const listUserLambda = create_lambda_resolver(
      'ListUsers', 'getUsers', OperationType.QUERY, { COGNITO_USER_POOL_ID: cognitoUserPoolId }
    )
    listUserLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:ListUsers'],
      resources: [userPoolArn]
    }))

    const getNumberOfAwsResourcesLambda = create_lambda_resolver(
      'GetNumberOfAwsResources', 'awsNumberOfResources', OperationType.QUERY
    )
    getNumberOfAwsResourcesLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'lambda:ListFunctions',
        'dynamodb:ListTables',
        'sqs:ListQueues',
        'kinesis:ListStreams'
      ],
      resources: ['*']
    }))

    const getAwsCosts = create_lambda_resolver(
      'GetAwsCosts', 'awsCosts', OperationType.QUERY
    )
    getAwsCosts.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ce:GetCostAndUsage'],
      resources: ['*']
    }))

    // See https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html#aws-appsync-resolver-mapping-template-reference-dynamodb-scan
    tableDS.createResolver({
      typeName: OperationType.QUERY,
      fieldName: 'allAlbums',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version" : "2017-02-28",
          "operation" : "Scan",
          "limit" : $util.toJson($ctx.args.limit),
          #if($ctx.args.nextToken)
            "nextToken": $util.toJson($ctx.args.nextToken)
          #end
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if($ctx.error)
        $util.error($ctx.error.message, $ctx.error.type)
        #end
        {
          "albums": $utils.toJson($ctx.result.items)
          #if($ctx.result.nextToken)
            ,"nextToken": $util.toJson($ctx.result.nextToken)
          #end
        }
      `)
    })

  }
}