import React from 'react'
import {
  Box,
  Flex,
  Text,
  CloseButton,
  BoxProps,
  useColorModeValue,
  Heading
} from '@chakra-ui/react'
import { AiFillDashboard, AiOutlineTable, AiOutlineFileText } from 'react-icons/ai'
import { IconType } from 'react-icons'
import NavItem from './NavItem'

interface SidebarProps extends BoxProps {
  onClose: () => void
}

interface LinkItemProps {
  name: string
  linkPath: string
  icon: IconType
}
const Sidebar = ({ onClose, ...rest }: SidebarProps) => {
  const LinkItems: Array<LinkItemProps> = [
    { name: 'Dashboard', linkPath: '/', icon: AiFillDashboard },
    { name: 'Table', linkPath: '/table', icon: AiOutlineTable },
    { name: 'Files', linkPath: '/files', icon: AiOutlineFileText }
  ]

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Heading as="h1" color="textPrimary" size="lg">
          React App
        </Heading>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} linkPath={link.linkPath} icon={link.icon}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}

export default Sidebar
