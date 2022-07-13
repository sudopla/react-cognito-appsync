import React, { useEffect, useState } from 'react'
import { Auth } from 'aws-amplify'
import { CognitoUser } from '@aws-amplify/auth'

export interface AuthContextInterface {
  user: CognitoUser | null
  isLoggedIn: boolean
  isAdmin: boolean
  login: (user: CognitoUser) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextInterface | null>(null)

// Amplify configuration for Cognito User Pool
Auth.configure({
  region: 'us-east-1',
  userPoolId: process.env.REACT_APP_USER_POOL_ID, // Cognito User Pool ID
  userPoolWebClientId: process.env.REACT_APP_WEBCLIENT_ID, // Cognito Web Client ID
  mandatorySignIn: true,
  authenticationFlowType: 'USER_SRP_AUTH'
})

// const getSession = (): Promise<CognitoUserSession | null> => Auth.currentSession()

const getCognitoUserGroups = (user: CognitoUser): string[] => {
  const groups = user.getSignInUserSession()?.getAccessToken().payload['cognito:groups'] as string[]
  return groups === undefined ? [] : groups
}
interface Props {
  children: React.ReactNode
}

export const AuthContextProvider: React.FC<Props> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CognitoUser | null>(null)
  const [userGroups, setUserGroups] = useState<string[]>([])

  const userIsLoggedIn = !!currentUser
  const isAdmin = userGroups.indexOf('Admin') >= 0

  const checkLogin = () => {
    Auth.currentAuthenticatedUser()
      .then((user: CognitoUser) => {
        setCurrentUser(user)
        setUserGroups(getCognitoUserGroups(user))
      })
      .catch(() => setCurrentUser(null))
  }

  useEffect(() => {
    checkLogin()
  }, [])

  const loginHandler = (user: CognitoUser) => {
    console.log(user)
    setCurrentUser(user)
    setUserGroups(getCognitoUserGroups(user))
  }

  const logoutHandler = () => {
    setCurrentUser(null)
    Auth.signOut().catch((err) => console.log(err))
  }

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const contextValue: AuthContextInterface = {
    user: currentUser,
    isLoggedIn: userIsLoggedIn,
    isAdmin,
    login: loginHandler,
    logout: logoutHandler
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthContext
