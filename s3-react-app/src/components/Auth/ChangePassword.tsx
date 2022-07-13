import React, { useState } from 'react'
import { Auth } from 'aws-amplify'
import {
  Flex,
  Box,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react'

interface AuthError {
  code: 'InvalidPasswordException' | 'NotAuthorizedException'
  message: string
}

const ChangePassword = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [oldPassword, setOldPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [badPasswordMessage, setBadPasswordMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<boolean>(false)

  const submitHandler = (event: React.FormEvent): void => {
    event.preventDefault()
    setIsLoading(true)
    if (badPasswordMessage) setBadPasswordMessage('')

    if (newPassword === confirmPassword) {
      Auth.currentAuthenticatedUser()
        .then((user) => {
          return Auth.changePassword(user, oldPassword, newPassword)
        })
        .then((data) => {
          console.log(data)
          setIsLoading(false)
          setSuccessMessage(true)
          setOldPassword('')
          setNewPassword('')
          setConfirmPassword('')
        })
        .catch((err: AuthError) => {
          setIsLoading(false)
          console.log(err)
          switch (err.code) {
            case 'InvalidPasswordException':
              setBadPasswordMessage(err.message)
              break
            case 'NotAuthorizedException':
              setBadPasswordMessage('Incorrect old password')
              break
            default:
              break
          }
        })
    } else {
      setIsLoading(false)
      setBadPasswordMessage('Passwords do not match')
    }
  }

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justify="center"
      pt={{ base: '60px', md: '20px' }}
    >
      <Box
        mt={6}
        p="22px"
        display="flex"
        flexDirection="column"
        width="50%"
        position="relative"
        minWidth="300px"
        backgroundClip="border-box"
        bg="white"
        boxShadow="0px 3.5px 5.5px rgba(0, 0, 0, 0.02)"
        borderRadius="15px"
      >
        <Stack spacing={4}>
          <Heading fontSize="2xl">Change Password</Heading>
          <form onSubmit={submitHandler}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Old Password</FormLabel>
                <Input type="password" onChange={(event) => setOldPassword(event.target.value)} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <Input type="password" onChange={(event) => setNewPassword(event.target.value)} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </FormControl>
              <Stack spacing={6} direction="row" justifyContent="right">
                <Button
                  bg="blue.400"
                  color="white"
                  _hover={{
                    bg: 'blue.500'
                  }}
                  type="submit"
                  isLoading={isLoading}
                >
                  Change Password
                </Button>
              </Stack>
              {badPasswordMessage && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription>{badPasswordMessage}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert status="success">
                  <AlertIcon />
                  <AlertDescription>Password was update successfully</AlertDescription>
                </Alert>
              )}
            </Stack>
          </form>
        </Stack>
      </Box>
    </Flex>
  )
}

export default ChangePassword
