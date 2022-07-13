import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Auth } from 'aws-amplify'
import {
  ChakraProvider,
  Grid,
  Flex,
  VStack,
  Box,
  Drawer,
  DrawerContent,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Sidebar from 'components/Sidebar/Sidebar'
import TopNav from 'components/TopNav/TopNav'
import HomePage from 'views/HomePage'
import ProfilePage from 'views/ProfilePage'
import TablePage from 'views/Table'
import LoginForm from 'components/Auth/Login'
import ChangePassword from 'components/Auth/ChangePassword'
import ResetPassword from 'components/Auth/ResetPassword'
import AuthContext from 'store/auth-context'
import NewUser from 'components/NewUser/NewUser'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  createHttpLink
} from '@apollo/client'
import { createAuthLink, AuthOptions } from 'aws-appsync-auth-link'

const App = () => {
  const authCtx = useContext(AuthContext)

  // Apollo client
  const url = process.env.REACT_APP_API_URL as string
  console.log('API URL')
  console.log(url)
  const region = 'us-east-1'
  const auth: AuthOptions = {
    type: 'AMAZON_COGNITO_USER_POOLS',
    jwtToken: async () => {
      try {
        return (await Auth.currentSession()).getIdToken().getJwtToken()
      } catch (e) {
        console.error(e)
        return ''
      }
    }
  }

  const link = ApolloLink.from([
    createAuthLink({ url, region, auth }),
    createHttpLink({ uri: url })
  ])
  const client = new ApolloClient({
    link,
    cache: new InMemoryCache()
  })

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <ChakraProvider>
      <ApolloProvider client={client}>
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
          {authCtx?.isLoggedIn && (
            <>
              <Sidebar onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
              <Drawer
                autoFocus={false}
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full"
              >
                <DrawerContent>
                  <Sidebar onClose={onClose} />
                </DrawerContent>
              </Drawer>
              <TopNav onOpen={onOpen} />
            </>
          )}

          <Box ml={{ base: 0, md: authCtx?.isLoggedIn ? 60 : 0 }} p={authCtx?.isLoggedIn ? 4 : 0}>
            <Routes>
              {!authCtx?.isLoggedIn && <Route path="/login" element={<LoginForm />} />}
              <Route path="/password-reset" element={<ResetPassword />} />
              {authCtx?.isLoggedIn && (
                <Route path="/password-change" element={<ChangePassword />} />
              )}
              <Route
                path="/"
                element={authCtx?.isLoggedIn ? <HomePage /> : <Navigate to="/login" />}
              />
              {authCtx?.isLoggedIn && authCtx.isAdmin && (
                <Route path="/new-user" element={<NewUser />} />
              )}
              <Route
                path="/profile"
                element={authCtx?.isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
              />
              <Route
                path="/table"
                element={authCtx?.isLoggedIn ? <TablePage /> : <Navigate to="/login" />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </Box>
      </ApolloProvider>
    </ChakraProvider>
  )
}

export default App
