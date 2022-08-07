import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider'

interface CreateUserEvent {
  arguments: {
    input: {
      email: string,
      isAdmin: boolean,
      name: string,
      lastName: string
    }
  }
}
interface User {
  email: string
}

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION })

export const lambdaHandler = async (event: CreateUserEvent): Promise<User | Error> => {
  console.log(event)

  try {
    // Create user
    let response = await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: event.arguments.input.email,
        UserAttributes: [{
          Name: 'email',
          Value: event.arguments.input.email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        },
        {
          Name: 'name',
          Value: event.arguments.input.name
        },
        {
          Name: 'family_name',
          Value: event.arguments.input.lastName
        }],
        TemporaryPassword: Math.random().toString(36).slice(-8)
      })
    )
    console.log(response)

    // Add user to group
    if (event.arguments.input.isAdmin) {
      response = await cognito.send(
        new AdminAddUserToGroupCommand({
          Username: event.arguments.input.email,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          GroupName: 'Admin'
        })
      )
      console.log(response)
    }

    return {
      email: event.arguments.input.email
    }

  } catch (err) {
    console.error(err)
    const error = err as Error
    throw Error(error.message as string)
  }

}