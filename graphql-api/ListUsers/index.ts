import { CognitoIdentityProviderClient, ListUsersCommand, ListUsersCommandOutput } from '@aws-sdk/client-cognito-identity-provider'


type CognitoUser = ListUsersCommandOutput['Users']

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION })

export const lambdaHandler = async (event: {}): Promise<CognitoUser| Error> => {
  console.log(event)

  try {
    const response = await cognito.send(
      new ListUsersCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID
      })
    )
    console.log(response)
    return response.Users

  } catch (err) {
    console.log(err)
    const error = err as Error
    throw Error(error.message as string)
  }

}