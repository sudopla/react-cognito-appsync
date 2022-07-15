import {
  aws_codepipeline as codepipeline,
  aws_codepipeline_actions as codepipeline_actions,
  aws_codebuild as codebuild,
  aws_iam as iam,
  aws_ssm as ssm
} from 'aws-cdk-lib'
import { Construct } from 'constructs'


// Utils functions
interface BuildActionProps {
  scope: Construct,
  sourceArtifact: codepipeline.Artifact,
  codeBuildRole: iam.Role,
  awsAccount: string,
  awsRegion: string,
  actionName: string,
  environmentVariables?: {[key: string]: any},
  installCommands: string[],
  buildCommands: string[]
}
const buildAction = (props: BuildActionProps): codepipeline_actions.CodeBuildAction => {
  const action = new codepipeline_actions.CodeBuildAction({
    actionName: props.actionName,
    input: props.sourceArtifact,
    project: new codebuild.PipelineProject(props.scope, `${props.actionName}-CodeBuildProject`, {
      role: props.codeBuildRole,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true, // true to enable docker,
        environmentVariables: {
          AWS_ACCOUNT: {
            value: props.awsAccount
          },
          AWS_REGIONS: {
            value: props.awsRegion
          },
          ...props.environmentVariables
        }
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: props.installCommands
          },
          build: {
            commands: props.buildCommands
          }
        }
      })
    }),
    runOrder: 1
  })

  return action
}

// Pipeline Stack
export interface DeploymentPipelineProps {
  awsAccount: string,
  awsRegion: string,
  repoOwner: string,
  repoName: string,
  appName: string
}

export class DeploymentPipeline extends Construct {
  constructor(scope: Construct, id: string, props: DeploymentPipelineProps) {
    super(scope, id)

    const sourceArtifact = new codepipeline.Artifact()

    // CodeBuild role to deploy CDK stacks
    const codeBuildRole = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    })
    // Restrict these policies later
    codeBuildRole.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['*']
    }))

    new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: props.appName,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.CodeStarConnectionsSourceAction({
              actionName: 'GithubSource',
              owner: props.repoOwner,
              repo: props.repoName,
              branch: 'main',
              connectionArn: ssm.StringParameter.valueForStringParameter(this, 'Github-Connection'),
              output: sourceArtifact
            })
          ]
        },
        {
          stageName: 'DeployApp',
          actions: [
            buildAction({
              scope: this,
              sourceArtifact: sourceArtifact,
              codeBuildRole: codeBuildRole,
              awsAccount: props.awsAccount,
              awsRegion: props.awsRegion,
              actionName: 'DeployCognitoTableStack',
              installCommands: [
                'yarn install'
              ],
              buildCommands: [
                'yarn run cdk deploy <app-name>-CognitoStack <app-name>-TableStack --require-approval never'
              ]
            }),
            buildAction({
              scope: this,
              sourceArtifact: sourceArtifact,
              codeBuildRole: codeBuildRole,
              awsAccount: props.awsAccount,
              awsRegion: props.awsRegion,
              actionName: 'DeployAppSyncStack',
              installCommands: [
                'yarn install'
              ],
              buildCommands: [
                'yarn run cdk deploy <app-name>-AppSyncStack --require-approval never'
              ]
            }),
            buildAction({
              scope: this,
              sourceArtifact: sourceArtifact,
              codeBuildRole: codeBuildRole,
              awsAccount: props.awsAccount,
              awsRegion: props.awsRegion,
              actionName: 'DeployStaticSiteStack',
              environmentVariables: {
                REACT_APP_USER_POOL_ID: {
                  type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
                  value: `/${props.appName}/cognito/userPoolId`
                },
                REACT_APP_WEBCLIENT_ID: {
                  type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
                  value: `/${props.appName}/cognito/webClientId`
                },
                REACT_APP_API_URL: {
                  type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
                  value: `/${props.appName}/graphqlUrl`
                }
              },
              installCommands: [
                'cd s3-react-ap',
                'yarn install'
              ],
              buildCommands: [
                'yarn build',
                'cd ..',
                'yarn run cdk deploy <app-name>-StaticSiteStack --require-approval never'
              ]
            })
          ]
        }
      ]
    })
  }
}