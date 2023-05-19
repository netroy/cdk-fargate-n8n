#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { N8NStack } from '../lib/n8n-stack'

const app = new cdk.App()
new N8NStack(app, 'N8N', {
  region: 'eu-central-1',
  domainName: 'aws.8n8.io',
  hostedZoneId: 'Z05587371TMN4WCE9OEXN',
})
