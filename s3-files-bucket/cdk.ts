import { aws_s3 as s3 } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export interface BucketProps {
  bucketName: string
}

export class FilesBucket extends Construct {
  constructor(scope: Construct, id: string, props: BucketProps) {
    super(scope, id)

    new s3.Bucket(this, 'Bucket', {
      bucketName: props.bucketName,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.POST,
          s3.HttpMethods.PUT,
          s3.HttpMethods.DELETE,
          s3.HttpMethods.HEAD
        ],
        allowedHeaders: ['*'],
        exposedHeaders: ['ETag'],
        allowedOrigins: ['*'] // NEED TO CHANGE THIS LATER
      }]
    })

  }
}