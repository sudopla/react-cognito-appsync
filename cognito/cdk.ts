import { IdentityPool, UserPoolAuthenticationProvider, IdentityPoolProviderUrl } from '@aws-cdk/aws-cognito-identitypool-alpha'
import { aws_cognito as cognito, aws_ssm as ssm, Duration, aws_iam as iam, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as perms from './iam_perms'

export interface CognitoProps {
  appName: string,
  bucketName: string
}

export class Cognito extends Construct {
  constructor(scope: Construct, id: string, props: CognitoProps) {
    super(scope, id)

    /**
     * Cognito User Pool and groups
     */
    const userPool = new cognito.UserPool(this, 'CognitoUserPool', {
      userPoolName: `${props.appName}-userPool`,
      signInAliases: { email: true }, // how users will sign in
      signInCaseSensitive: false,
      standardAttributes: {
        email: {
          required: true
        }
      },
      customAttributes: {
        tenantId: new cognito.StringAttribute({ minLen: 1, maxLen: 256, mutable: false })
      },
      passwordPolicy: {
        // all requirements are enabled by default
        minLength: 8,
        tempPasswordValidity: Duration.days(5)
      },
      selfSignUpEnabled: false, // Users will be created by admin
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: { sms: true, otp: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      email: cognito.UserPoolEmail.withCognito(), // Don't use SES for now
      userInvitation: {
        emailSubject: 'Invite to join our awesome app!',
        emailBody:
          'Hello {username}, you have been invited to join our awesome app! Your temporary password is {####}',
        smsMessage: 'Hello {username}, your temporary password for our awesome app is {####}'
      },
      deviceTracking: {
        challengeRequiredOnNewDevice: false,
        deviceOnlyRememberedOnUserPrompt: false
      }
    })

    // Add new app client to user pool
    const userPoolClient = userPool.addClient('ReactClient', {
      authFlows: {
        userSrp: true
      }
    })

    // Create SSM Parameters
    new ssm.StringParameter(this, 'UserPoolId', {
      description: `${props.appName} Cognito User Pool ID`,
      parameterName: `/${props.appName}/cognito/userPoolId`,
      stringValue: userPool.userPoolId
    })
    new ssm.StringParameter(this, 'UserPoolWebClientId', {
      description: `${props.appName} Cognito User Pool Web Client ID`,
      parameterName: `/${props.appName}/cognito/webClientId`,
      stringValue: userPoolClient.userPoolClientId
    })

    /**
     * Cognito Identity Pool + Authenticated Role
     */
    const identityPool = new IdentityPool(this, 'myIdentityPool', {
      identityPoolName: `${props.appName}-identityPool`,
      authenticationProviders: {
        userPools: [new UserPoolAuthenticationProvider({
          userPool,
          userPoolClient
        })]
      },
      roleMappings: [{
        mappingKey: 'cognito', // this value can be anything, it's only for the CF mapping
        providerUrl: IdentityPoolProviderUrl.userPool(
          `cognito-idp.${Stack.of(this).region}.amazonaws.com/${userPool.userPoolId}:${userPoolClient.userPoolClientId}`
        ),
        useToken: true, // use role from token
        resolveAmbiguousRoles: true
      }]
    })
    identityPool.authenticatedRole.addToPrincipalPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [...perms.S3_READ_ACCESS, ...perms.S3_WRITE_ACCESS],
      resources: [`arn:aws:s3:::${props.bucketName}`, `arn:aws:s3:::${props.bucketName}/*`]
    }))

    new ssm.StringParameter(this, 'IdentityPoolId', {
      description: `${props.appName} Identity Pool ID`,
      parameterName: `/${props.appName}/cognito/identityPoolId`,
      stringValue: identityPool.identityPoolId
    })

    /**
     * User Pool Admin group and Role
     */
    const adminRole = new iam.Role(this, 'authRole', {
      roleName: `${props.appName}-IdentityPool-Default-Auth-Role`,
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com', {
          'StringEquals': {
            'cognito-identity.amazonaws.com:aud': identityPool.identityPoolId
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated'
          }
        }, 'sts:AssumeRoleWithWebIdentity'
      )
    })
    adminRole.addToPolicy(new iam.PolicyStatement({
      actions: [...perms.S3_READ_ACCESS, ...perms.S3_WRITE_ACCESS, ...perms.S3_DELETE_ACCESS],
      resources: [`arn:aws:s3:::${props.bucketName}`, `arn:aws:s3:::${props.bucketName}/*`]
    }))

    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: userPool.userPoolId,
      description: 'Application admin',
      groupName: 'Admin',
      roleArn: adminRole.roleArn,
      precedence: 0
    })

  }
}
