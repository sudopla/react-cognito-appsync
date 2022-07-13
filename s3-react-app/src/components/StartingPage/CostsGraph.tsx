import React from 'react'
import { Box, Heading, Flex, Text } from '@chakra-ui/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface CostsGraphProps {
  title: string
  labels: string[]
  values: string[]
}

const CostsGraph = ({ title, labels, values }: CostsGraphProps) => {
  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          display: true,
          drawBorder: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    }
  }

  const graphData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ['#6EB4D1']
      }
    ]
  }

  return (
    <Box
      mt={6}
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
      <Flex w="100%" direction="column" alignSelf="flex-start">
        <Box display="flex" width="100%" mb="20px" pl="22px">
          <Text fontSize="lg" color="gray.600" fontWeight="bold" mb="6px">
            {title}
          </Text>
        </Box>
        <Box w="100%" h={{ sm: '300px' }} ps="8px">
          <Bar options={graphOptions} data={graphData} />
        </Box>
      </Flex>
    </Box>
  )
}

export default CostsGraph
