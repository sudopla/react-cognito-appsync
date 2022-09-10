import { DynamoDBClient, ListTablesCommand, ListTablesCommandOutput } from '@aws-sdk/client-dynamodb'
import { KinesisClient, ListStreamsCommand } from '@aws-sdk/client-kinesis'
import { LambdaClient, ListFunctionsCommand, ListFunctionsCommandOutput } from '@aws-sdk/client-lambda'
import { SQSClient, ListQueuesCommand } from '@aws-sdk/client-sqs'

interface NumberOfResources {
  lambdas: number,
  tables: number,
  queues: number,
  streams: number
}

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION })
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION })
const sqsClient = new SQSClient({ region: process.env.AWS_REGION })
const kinesisClient = new KinesisClient({ region: process.env.AWS_REGION })

export const lambdaHandler = async (): Promise<NumberOfResources | Error> => {

  try {
    // Get number of Lambda functions
    let numLambdas = 0
    let marker: string | undefined = undefined
    do {
      const response: ListFunctionsCommandOutput = await lambdaClient.send(
        new ListFunctionsCommand({ Marker: marker })
      )
      numLambdas += response.Functions?.length || 0
      marker = response.NextMarker
    } while (marker !== undefined)
    console.log(`Number of Lambda functions - ${numLambdas}`)

    // Get number of DynamoDB tables
    let numTables = 0
    let lastEvaluatedTableName = undefined
    do {
      const response: ListTablesCommandOutput = await dynamoClient.send(
        new ListTablesCommand({ ExclusiveStartTableName: lastEvaluatedTableName })
      )
      numTables += response.TableNames?.length || 0
      lastEvaluatedTableName = response.LastEvaluatedTableName
    } while (lastEvaluatedTableName !== undefined)
    console.log(`Number of DynamoDB Tables - ${numTables}`)

    // Get number of queues
    const sqsResp = await sqsClient.send(
      new ListQueuesCommand({})
    )
    const numQueues = sqsResp.QueueUrls?.length || 0
    console.log(`Number of SQS queues - ${numQueues}`)

    // Get number of Kinesis streams
    const streamResp = await kinesisClient.send(
      new ListStreamsCommand({})
    )
    const numStreams = streamResp.StreamNames?.length || 0
    console.log(`Number of Kinesis streams - ${numStreams}`)

    return {
      lambdas: numLambdas,
      tables: numTables,
      queues: numQueues,
      streams: numStreams
    }

  } catch (err) {
    console.error(err)
    const error = err as Error
    throw Error(error.message as string)
  }

}