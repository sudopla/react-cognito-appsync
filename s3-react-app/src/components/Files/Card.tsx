import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'

interface CardProps extends BoxProps {
  children: React.ReactNode
}

const Card = ({ children, ...rest }: CardProps) => {
  return (
    <Box
      p="22px"
      display="flex"
      flexDirection="column"
      width="100%"
      boxShadow="0px 5px 14px rgba(0, 0, 0, 0.05)"
      borderRadius="20px"
      position="relative"
      backgroundClip="border-box"
      {...rest}
    >
      {children}
    </Box>
  )
}

export default Card
