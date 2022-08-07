import * as path from 'path'
import {
  aws_s3 as s3,
  aws_s3_deployment as s3_deployment,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as cloudfront_origins,
  CfnOutput
} from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface StaticSiteProps {
  appName: string
}

export class StaticSite extends Construct {
  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id)

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `${props.appName.toLowerCase()}-website-cdk`,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    })

    const cfDistribution = new cloudfront.Distribution(this, 'CFDistribution', {
      defaultBehavior: { origin: new cloudfront_origins.S3Origin(websiteBucket) }
    })

    // Only deploy site when this env variable is defined - avoid issues with missing build folder
    if (process.env.DEPLOY_SITE) {
      new s3_deployment.BucketDeployment(this, 'ReactAppDeployment', {
        sources: [s3_deployment.Source.asset(path.join(__dirname, 'build'))],
        destinationBucket: websiteBucket,
        distribution: cfDistribution,
        distributionPaths: ['/*']
      })
    }

    new CfnOutput(this, 'SiteUrl', {
      value: cfDistribution.distributionDomainName
    })
  }
}
