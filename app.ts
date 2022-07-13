#!/usr/bin/env node
import { Stack, StackProps } from 'aws-cdk-lib'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Cognito } from './cognito/cdk'
import { Table } from './database/cdk'
import { AppSyncApi } from './graphql-api/cdk'
import { StaticSite } from './s3-react-app/cdk'
import { getAwsAccount, getAwsRegion } from './utils'

// Get AWS account and region
const awsEnv = { account: getAwsAccount(), region: getAwsRegion() }

const app = new cdk.App()
const appName = 'React-App'
const tableName = `${appName}-Table`

// Cognito
class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    new Cognito(this, 'CognitoUserPool', {
      appName
    })
  }
}
new CognitoStack(app, `${appName}-CognitoStack`, {
  env: awsEnv,
  description: `${appName} Cognito Stack`
})

// DynamoDB table
class TableStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    new Table(this, 'Table', {
      tableName
    })
  }
}
new TableStack(app, `${appName}-TableStack`, {
  env: awsEnv,
  description: `${appName} DynamoDB Stack`
})

// AppSync + Lambdas
class AppSyncStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    new AppSyncApi(this, 'AppSyncApi', {
      appName,
      tableName
    })
  }
}
new AppSyncStack(app, `${appName}-AppSyncStack`, {
  env: awsEnv,
  description: `${appName} AppSync Stack`
})

// Static Site
class StaticSiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    new StaticSite(this, 'StaticSite', {
      appName
    })
  }
}
new StaticSiteStack(app, `${appName}-StaticSiteStack`, {
  env: awsEnv,
  description: `${appName} Static Site Stack`
})
