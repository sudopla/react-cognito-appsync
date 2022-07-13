import React, { ReactText } from 'react'
import { Flex, Link, Icon, FlexProps } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { IconType } from 'react-icons'

interface NavItemProps extends FlexProps {
  icon: IconType
  linkPath: string
  active?: boolean
  children: ReactText
}
const NavItem = ({ icon, linkPath, active, children, ...rest }: NavItemProps) => {
  const location = useLocation()

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeLink: string): boolean => {
    return location.pathname === routeLink
  }

  return (
    <Link
      as={RouterLink}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      to={linkPath}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'cyan.400',
          color: 'white'
        }}
        bg={activeRoute(linkPath) ? 'cyan.200' : undefined}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="20"
            _groupHover={{
              color: 'white'
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

export default NavItem
