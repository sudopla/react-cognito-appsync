import React, { useState } from 'react'
import styled from 'styled-components'
import { gql, useMutation } from '@apollo/client'
import {
  Stack,
  Heading,
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertDescription,
  Checkbox,
  AlertIcon
} from '@chakra-ui/react'

const CREATE_USER = gql`
  mutation createUser($input: UserInput!) {
    createUser(input: $input) {
      email
    }
  }
`
interface User {
  email: string
  isAdmin: boolean
  name: string
  lastName: string
}

const NewUser = () => {
  const [name, setName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [createUser] = useMutation<null, { input: User }>(CREATE_USER)

  const submitHandler = (event: React.FormEvent): void => {
    event.preventDefault()
    if (successMessage) setSuccessMessage(false)
    setIsLoading(true)
    createUser({ variables: { input: { email, isAdmin, name, lastName } } })
      .then((data) => {
        console.log(data)
        setIsLoading(false)
        setName('')
        setEmail('')
        setIsAdmin(false)
        setSuccessMessage(true)
      })
      .catch((e: Error) => {
        console.error(e)
        setIsLoading(false)
        setErrorMessage(e.message)
      })
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
          <Heading fontSize="2xl">Create New User</Heading>
          <form onSubmit={submitHandler}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input type="text" onChange={(event) => setName(event.target.value)} value={name} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  type="text"
                  onChange={(event) => setLastName(event.target.value)}
                  value={lastName}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  placeholder="your-email@example.com"
                  onChange={(event) => setEmail(event.target.value)}
                  value={email}
                />
              </FormControl>
              <FormControl>
                <Checkbox
                  type="checkbox"
                  id="admingroup"
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  isChecked={isAdmin}
                >
                  Administrator
                </Checkbox>
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
                  Create User
                </Button>
              </Stack>
              {errorMessage && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <Alert status="success">
                  <AlertIcon />
                  <AlertDescription>User was created successfully</AlertDescription>
                </Alert>
              )}
            </Stack>
          </form>
        </Stack>
      </Box>
    </Flex>
  )
}

export default NewUser
