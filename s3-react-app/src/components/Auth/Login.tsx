import React, { useContext, useRef, useState } from 'react'
import AuthContext from 'store/auth-context'
import { Link as RouteLink, useNavigate } from 'react-router-dom'
import { Auth } from 'aws-amplify'
import { CognitoUser } from '@aws-amplify/auth'
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Link,
  Button,
  Heading,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  Checkbox
} from '@chakra-ui/react'

interface AuthUser extends CognitoUser {
  challengeName: 'NEW_PASSWORD_REQUIRED' | 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA' | 'MFA_SETUP'
}

interface AuthError {
  code:
    | 'NotAuthorizedException'
    | 'UserNotFoundException'
    | 'PasswordResetRequiredException'
    | 'UserNotConfirmedException'
  message: string
}

const Login = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')

  const authCtx = useContext(AuthContext)
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [badPassword, setBadPassword] = useState<string>('')
  const [newPasswordRequired, setNewPasswordRequired] = useState<boolean>(false)
  const [cognitoUser, setCognitoUser] = useState<CognitoUser>()

  const submitHandler = (event: React.FormEvent): void => {
    event.preventDefault()

    if (newPasswordRequired === false) {
      setIsLoading(true)
      Auth.signIn(email, password)
        .then((user: AuthUser) => {
          setIsLoading(false)

          if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
            console.log('New password required')
            setCognitoUser(user)
            setNewPasswordRequired(true)
            setPassword('')
          } else {
            authCtx?.login(user)
            navigate('/', { replace: true })
          }
        })
        .catch((error: AuthError) => {
          setIsLoading(false)
          if (error.code === 'NotAuthorizedException') {
            setBadPassword(error.message)
          }
          // Handler other error codes
        })
    } else if (password !== confirmPassword) {
      // first sign-in attempt - set new password
      setBadPassword('Passwords do not match. Please try again')
    } else {
      // first sign-in attempt - set new password
      setIsLoading(true)
      setBadPassword('')
      Auth.completeNewPassword(cognitoUser, password)
        .then((user) => {
          setIsLoading(false)
          // at this time the user is logged in if no MFA required
          authCtx?.login(user as CognitoUser)
          navigate('/', { replace: true })
        })
        .catch((error: AuthError) => {
          console.log(error)
          setIsLoading(false)
          setBadPassword(error.message)
        })
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">
            {!newPasswordRequired ? 'Sign in to your account' : 'Set a new password'}
          </Heading>
        </Stack>
        <Box w="400px" rounded="lg" bg="white" boxShadow="lg" p={8}>
          <form onSubmit={submitHandler}>
            <Stack spacing={4}>
              {!newPasswordRequired && (
                <FormControl id="email">
                  <FormLabel>Email address</FormLabel>
                  <Input
                    type="email"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(event.target.value)
                    }
                  />
                </FormControl>
              )}
              <FormControl id="password">
                <FormLabel>{!newPasswordRequired ? 'Password' : 'New Password'}</FormLabel>
                <Input
                  type="password"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(event.target.value)
                  }
                  value={password}
                />
              </FormControl>
              {newPasswordRequired && (
                <FormControl id="confirmPassword">
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(event.target.value)
                    }
                  />
                </FormControl>
              )}
              <Stack spacing={8}>
                {!newPasswordRequired && (
                  <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    align="start"
                    justify="space-between"
                  >
                    <Checkbox>Remember me</Checkbox>
                    <Link as={RouteLink} to="/password-reset" color="blue.400">
                      Forgot password?
                    </Link>
                  </Stack>
                )}

                <Button
                  isLoading={isLoading}
                  type="submit"
                  bg="blue.400"
                  color="white"
                  _hover={{
                    bg: 'blue.500'
                  }}
                >
                  {!newPasswordRequired ? 'Sign in' : 'Set new password'}
                </Button>
                {badPassword && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>{badPassword}</AlertDescription>
                  </Alert>
                )}
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  )
}

export default Login
