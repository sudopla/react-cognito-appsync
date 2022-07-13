import React from 'react'
import { useQuery } from '@apollo/client'
import { Flex, Stack, Heading, SimpleGrid, Center, Spinner, HStack } from '@chakra-ui/react'
import { DynamoLogo, KinesisStreamLogo, LambdaLogo, SQSLogo } from './aws_icons'
import MiniCard from './MiniCard'
import CostsGraph from './CostsGraph'
import { GET_AWS_COSTS, GET_NUM_RESOURCES } from './queries'

interface AWSNumberOfResources {
  awsNumberOfResources: {
    lambdas: number
    tables: number
    queues: number
    streams: number
  }
}

interface AWSCost {
  awsCosts: {
    date: string
    value: string
  }[]
}

const StartingPageContent = () => {
  const { loading: awsResourcesLoading, data: awsResourcesData } =
    useQuery<AWSNumberOfResources>(GET_NUM_RESOURCES)
  const { loading: awsCostsLoading, data: awsCostsData } = useQuery<AWSCost>(GET_AWS_COSTS)

  return (
    <Flex flexDirection="column" pt={{ base: '60px', md: '20px' }}>
      {awsResourcesLoading || awsCostsLoading ? (
        <Center>
          <Spinner size="xl" />
        </Center>
      ) : (
        <>
          <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing="24px">
            <MiniCard
              title="Num. of Lambdas"
              amount={awsResourcesData?.awsNumberOfResources.lambdas.toString() || ''}
              icon={<LambdaLogo h="45px" w="45px" />}
            />
            <MiniCard
              title="Num. of Tables"
              amount={awsResourcesData?.awsNumberOfResources.tables.toString() || ''}
              icon={<DynamoLogo h="45px" w="45px" color="white" />}
            />
            <MiniCard
              title="Num. of Queues"
              amount={awsResourcesData?.awsNumberOfResources.queues.toString() || ''}
              icon={<SQSLogo h="45px" w="45px" color="white" />}
            />
            <MiniCard
              title="Num. of Streams"
              amount={awsResourcesData?.awsNumberOfResources.streams.toString() || ''}
              icon={<KinesisStreamLogo h="45px" w="45px" color="white" />}
            />
          </SimpleGrid>
          <SimpleGrid
            templateColumns={{ sm: '1fr', lg: '1.8fr 1.5fr' }}
            templateRows={{ sm: 'repeat(2, 1fr)', lg: '1fr' }}
            gap="24px"
          >
            <CostsGraph
              title="AWS Costs per month"
              labels={awsCostsData ? awsCostsData.awsCosts?.map((val) => val.date.slice(0, 7)) : []}
              values={awsCostsData ? awsCostsData.awsCosts?.map((val) => val.value) : []}
            />
          </SimpleGrid>
        </>
      )}
    </Flex>
  )
}

export default StartingPageContent
