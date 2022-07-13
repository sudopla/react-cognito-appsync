import { gql } from '@apollo/client'

export const GET_NUM_RESOURCES = gql`
  query AwsNumberOfResources {
    awsNumberOfResources {
      lambdas
      tables
      queues
      streams
    }
  }
`

export const GET_AWS_COSTS = gql`
  query AwsCosts {
    awsCosts {
      date
      value
    }
  }
`
