import { aws_cognito as cognito, aws_ssm as ssm, Duration } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export interface CognitoProps {
  appName: string
}

export class Cognito extends Construct {
  constructor(scope: Construct, id: string, props: CognitoProps) {
    super(scope, id)

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
      email: cognito.UserPoolEmail.withCognito(), // Dont' use SES for now
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

    // User pool groups
    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: userPool.userPoolId,
      description: 'Application admin',
      groupName: 'Admin',
      precedence: 0
    })

  }
}
