# ⚠️ This repo is currently not maintained ⚠️
I curently do not have the time or resources to maintain this.  
If you are looking for hosting solutions on AWS, please checkout [n8n on eks clusters](https://github.com/n8n-io/n8n-eks-cluster) instead.

---

# Serverless n8n on AWS Fargate

[![Deploy n8n on AWS fargate](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home?#/stacks/new?stackName=N8N&templateURL=https%3A%2F%2Fdeploy-n8n.s3.eu-central-1.amazonaws.com%2Fn8n.yaml)

This project builds a Cloudformation Stack using [AWS CDK](https://aws.amazon.com/cdk/) to run an instance of [n8n](https://n8n.io/).

The database is provisioned on [RDS](https://aws.amazon.com/rds/), and the service containers run on [Fargate](https://aws.amazon.com/fargate/)

To deploy this stack, make you sure you have `node` and `yarn` installed, and then then run

- `yarn` to install all the dependencies
- `yarn cdk deploy` to create the stack

Once the deployment is done, you can either go to the public ip assigned to the launched container, or look in the logs for the tunnel URL.

To tear down the stack, simply run `yarn cdk destroy`
