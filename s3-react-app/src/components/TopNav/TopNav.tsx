import React, { useContext, useEffect, useState } from 'react'
import { Auth } from 'aws-amplify'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  Text,
  HStack,
  VStack,
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuDivider,
  IconButton,
  FlexProps,
  Avatar,
  useColorModeValue,
  Link as ChakraLink
} from '@chakra-ui/react'
import { FiMenu, FiChevronDown, FiBell } from 'react-icons/fi'
import AuthContext from 'store/auth-context'

interface MobileProps extends FlexProps {
  onOpen: () => void
}

interface UserAttributes {
  email: string
  name: string
  family_name: string
}

interface UserInfo {
  attributes: UserAttributes
}

const TopNav = ({ onOpen, ...rest }: MobileProps) => {
  const authCtx = useContext(AuthContext)
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string>('')

  const logoutHandler = () => {
    authCtx?.logout()
    navigate('/auth')
  }

  useEffect(() => {
    Auth.currentUserInfo()
      .then((userInfo: UserInfo) => {
        setUserName(`${userInfo.attributes.name} ${userInfo.attributes.family_name}`)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Logo
      </Text>

      <HStack spacing={{ base: '0', md: '6' }}>
        <IconButton size="lg" variant="ghost" aria-label="open menu" icon={<FiBell />} />
        <Flex alignItems="center">
          <Menu>
            <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
              <HStack>
                <Avatar size="sm" name={userName} />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{userName}</Text>
                  {authCtx?.isAdmin && (
                    <Text fontSize="xs" color="gray.600">
                      Admin
                    </Text>
                  )}
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
              {authCtx?.isAdmin && (
                <MenuItem onClick={() => navigate('/new-user')}>New User</MenuItem>
              )}

              <MenuItem onClick={() => navigate('/password-change')}>Change Password</MenuItem>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  )
}

export default TopNav
