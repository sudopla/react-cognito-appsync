import React, { useContext, useState } from 'react'
import AuthContext from 'store/auth-context'
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom'
import { Auth } from 'aws-amplify'
import {
  Button,
  FormControl,
  FormLabel,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  Link
} from '@chakra-ui/react'

interface AuthError {
  code: string
  message: string
}

const ResetPassword = () => {
  const [email, setEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isSettingNewPassword, setIsSettingNewPassword] = useState<boolean>(false)
  const [code, setCode] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [resetPasswordSuccessful, setResetPasswordSuccessful] = useState<boolean>(false)

  const navigate = useNavigate()

  const submitHandler = (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    if (!isSettingNewPassword) {
      // Send confirmation code to user's email
      Auth.forgotPassword(email)
        .then((data) => {
          console.log(data)
          setIsLoading(false)
          setIsSettingNewPassword(true)
        })
        .catch((err: AuthError) => {
          console.log(err)
          setIsLoading(false)
          setErrorMessage(err.message)
        })
    } else {
      // Collect confirmation code and new password, then
      Auth.forgotPasswordSubmit(email, code, newPassword)
        .then((data) => {
          console.log(data)
          setResetPasswordSuccessful(true)
        })
        .catch((err: AuthError) => {
          setIsLoading(false)
          console.log(err)
          setErrorMessage(err.message)
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
      <Stack
        spacing={4}
        w="full"
        maxW="md"
        bg={useColorModeValue('white', 'gray.700')}
        rounded="xl"
        boxShadow="lg"
        p={6}
        my={12}
      >
        {!resetPasswordSuccessful ? (
          <>
            <Heading lineHeight={1.1} fontSize={{ base: '2xl', md: '2xl' }}>
              Forgot your password?
            </Heading>
            <Text fontSize={{ base: 'sm', sm: 'md' }} color="gray.800">
              You&apos;ll get an email with a reset link
            </Text>
            <form onSubmit={submitHandler}>
              <Stack spacing={4}>
                <FormControl id="email">
                  {isSettingNewPassword && <FormLabel>Email address</FormLabel>}
                  <Input
                    placeholder="your-email@example.com"
                    type="email"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </FormControl>
                {isSettingNewPassword && (
                  <>
                    <FormControl id="code">
                      <FormLabel>Code</FormLabel>
                      <Input type="text" onChange={(event) => setCode(event.target.value)} />
                    </FormControl>
                    <FormControl id="new_password">
                      <FormLabel>New Password</FormLabel>
                      <Input
                        type="password"
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                    </FormControl>
                  </>
                )}
                <Stack spacing={6}>
                  <Button
                    bg="blue.400"
                    color="white"
                    _hover={{
                      bg: 'blue.500'
                    }}
                    type="submit"
                    isLoading={isLoading}
                  >
                    {isSettingNewPassword ? 'Set new password' : 'Request Reset'}
                  </Button>
                </Stack>
                {errorMessage && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                {isSettingNewPassword && (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertDescription>A confirmation code was set to your email.</AlertDescription>
                  </Alert>
                )}
              </Stack>
            </form>
          </>
        ) : (
          <>
            <Alert status="success">
              <AlertIcon />
              <Heading as="h4" fontSize={{ base: 'xl', sm: 'lg' }} textAlign="left">
                Password was reset successfully
              </Heading>
            </Alert>
            <Link as={RouterLink} color="blue.400" textAlign="center" to="/">
              Go back to login page?
            </Link>
          </>
        )}
      </Stack>
    </Flex>
  )
}

export default ResetPassword
