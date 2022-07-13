import { aws_dynamodb as dynamodb } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export interface TableProps {
  tableName: string
}

export class Table extends Construct {
  constructor(scope: Construct, id: string, props: TableProps) {
    super(scope, id)

    // New Dynamo table
    new dynamodb.Table(this, 'Table', {
      tableName: props.tableName,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-Demand
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true // Enable Backups
    })

  }
}