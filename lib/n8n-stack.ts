import {
  aws_ec2, aws_ecs, aws_iam, aws_logs, aws_rds,
  RemovalPolicy, Stack
} from 'aws-cdk-lib'
import { Construct } from 'constructs'

const databaseUser = 'n8n'
const databaseName = 'n8n'
const port = 5678

export class N8NStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const vpc = new aws_ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
      natGateways: 2,
      subnetConfiguration: [
        { name: 'Public', subnetType: aws_ec2.SubnetType.PUBLIC },
      ]
    })

    const dbSecret = new aws_rds.DatabaseSecret(this, 'DBSecret', {
      username: databaseUser,
      secretName: 'N8NDatabaseSecret'
    })

    const dbSecurityGroup = new aws_ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc,
      securityGroupName: 'N8NDatabase'
    })

    const database = new aws_rds.DatabaseInstance(this, 'Instance', {
      databaseName,
      instanceIdentifier: databaseName,
      vpc,
      vpcSubnets: {
        onePerAz: true,
        subnetType: aws_ec2.SubnetType.PUBLIC
      },
      securityGroups: [ dbSecurityGroup ],
      engine: aws_rds.DatabaseInstanceEngine.postgres({
        version: aws_rds.PostgresEngineVersion.VER_11_15
      }),
      credentials: aws_rds.Credentials.fromSecret(dbSecret),
      removalPolicy: RemovalPolicy.DESTROY,
      instanceType: aws_ec2.InstanceType.of(
        aws_ec2.InstanceClass.BURSTABLE3,
        aws_ec2.InstanceSize.SMALL,
      ),
    })

    const ecsCluster = new aws_ecs.Cluster(this, 'Cluster', { vpc })
    const appSecurityGroup = new aws_ec2.SecurityGroup(this, 'AppSecurityGroup', { vpc })

    const taskRole = new aws_iam.Role(this, 'AppTaskRole', {
      roleName: 'n8nTask',
      assumedBy: new aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    })

    const taskDefinition = new aws_ecs.FargateTaskDefinition(this, 'AppTaskDefinition', {
      taskRole,
      executionRole: taskRole,
    })

    const logGroup = new aws_logs.LogGroup(this, 'AppLogs', {
      logGroupName: '/n8n/logs'
    })

    taskDefinition.addContainer('n8n', {
      image: aws_ecs.ContainerImage.fromRegistry('n8nio/n8n'),
      command: ['n8n', 'start', '--tunnel'],
      environment: {
        DB_TYPE: 'postgresdb',
        DB_POSTGRESDB_HOST: database.dbInstanceEndpointAddress,
        DB_POSTGRESDB_PORT: database.dbInstanceEndpointPort,
        DB_POSTGRESDB_DATABASE: databaseName,
        DB_POSTGRESDB_USER: databaseUser,
        DB_POSTGRESDB_PASSWORD: dbSecret.secretValueFromJson('password').unsafeUnwrap(),
        N8N_BASIC_AUTH_ACTIVE: 'false',
        N8N_DIAGNOSTICS_ENABLED: 'true',
      },
      logging: new aws_ecs.AwsLogDriver({
        logGroup,
        streamPrefix: '/'
      }),
      healthCheck: {
        command: [
          'CMD-SHELL',
          `curl --fail http://localhost:${port}/healthz || exit 1`
        ],
        retries: 10
      },
      portMappings: [{
        containerPort: port,
        hostPort: port
      }]
    })

    const service = new aws_ecs.FargateService(this, 'Service', {
      serviceName: 'n8n',
      cluster: ecsCluster,
      desiredCount: 1,
      assignPublicIp: true,
      taskDefinition,
      securityGroups: [appSecurityGroup],
    })

    service.connections.allowTo(dbSecurityGroup, aws_ec2.Port.tcp(5432))
    service.connections.allowFromAnyIpv4(aws_ec2.Port.tcp(port))
  }
}
