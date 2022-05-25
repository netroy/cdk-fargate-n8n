# Serverless n8n on AWS Fargate

This project builds a Cloudformation Stack using [AWS CDK](https://aws.amazon.com/cdk/) to run an instance of [n8n](https://n8n.io/).

The database is provisioned on [RDS](https://aws.amazon.com/rds/), and the service containers run on [Fargate](https://aws.amazon.com/fargate/)

To deploy this stack, make you sure you have `node` and `yarn` installed, and then then run

- `yarn` to install all the dependencies
- `yarn cdk deploy` to create the stack

Once the deployment is done, you can either go to the public ip assigned to the launched container, or look in the logs for the tunnel URL.

To tear down the stack, simply run `yarn cdk destroy`
