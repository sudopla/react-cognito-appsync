/**
 * Create Cognito Admin user
 *
 * Run -> npx ts-node create_cognito_user.ts 'email_address' 'name' 'last_name' '<group>'
 */
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider'

const args = process.argv.slice(2)
const emailInput = args[0]
const nameInput = args[1]
const lastNameInput = args[2]
const groupInput = args[3]
const cognito = new CognitoIdentityProviderClient({ region: 'us-east-1' })

const createUser =async (
  email : string,
  name: string,
  last_name: string,
  resendInvite: boolean,
  group: string
) => {

  try {
    // Create user
    let response = await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: process.env.REACT_APP_USER_POOL_ID,
        Username: email,
        UserAttributes: [
          {
            Name: 'email',
            Value: email
          },
          {
            Name: 'email_verified',
            Value: 'true'
          },
          {
            Name: 'name',
            Value: name
          },
          {
            Name: 'family_name',
            Value: last_name
          }
        ],
        TemporaryPassword: Math.random().toString(36).slice(-8),
        MessageAction: resendInvite ? 'RESEND' : undefined
      })
    )
    console.log(response)

    // Add user to group
    if (group) {
      response = await cognito.send(
        new AdminAddUserToGroupCommand({
          Username: email,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          GroupName: group
        })
      )
      console.log(response)
    }

  } catch (err) {
    console.log(err)
    throw Error()
  }

}

createUser(emailInput, nameInput, lastNameInput, false, groupInput)
  .then(() => console.log('User created successfully'))
  .catch(() => console.log('Failed to create user'))
