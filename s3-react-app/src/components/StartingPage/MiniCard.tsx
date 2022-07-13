import React from 'react'
import { Box, BoxProps, Flex, Stat, StatLabel, StatNumber } from '@chakra-ui/react'

interface MiniCardProps extends BoxProps {
  title: string
  amount: string
  icon: JSX.Element
}

const MiniCard = ({ title, amount, icon }: MiniCardProps) => {
  return (
    <Box
      p="22px"
      display="flex"
      flexDirection="column"
      width="100%"
      position="relative"
      minWidth="0px"
      backgroundClip="border-box"
      bg="white"
      boxShadow="0px 3.5px 5.5px rgba(0, 0, 0, 0.02)"
      borderRadius="15px"
    >
      <Box display="flex" width="100%">
        <Flex flexDirection="row" align="center" justify="center" w="100%">
          <Stat me="auto">
            <StatLabel fontSize="sm" color="gray.500" fontWeight="bold" pb=".1rem">
              {title}
            </StatLabel>
            <StatNumber fontSize="lg" color="gray.700">
              {amount}
            </StatNumber>
          </Stat>
          <Flex alignItems="center" justifyContent="center">
            {icon}
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}

export default MiniCard
