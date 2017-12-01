# Porchlights

Porchlights is a set of tools that I wrote to use my phone to control a
[Digital Loggers Web Power Switch](https://dlidirect.com/products/web-power-switch-7) 
that powers various lights on my back porch. It should also work
with their other switch products.

I previously had a much simpler solution, but I wanted to drop my
DSL connection and move to faster and cheaper cable internet without
static IP addresses. I also took the opportunity to and play with
a few new technologies.

There are three main components:

1.  In AWS: API Gateway proxying to a Lambda function that updates a file
    in an S3 bucket with the desired outlet state.

2.  A web page with some JavaScript that uses this API to read and
    write the desired state.

3.  A Perl script that periodically syncs the switch state to the desired state.

## Outline of AWS Setup

1.  Setup an S3 bucket

2.  Setup an IAM role that will be used to allow the Lambda function
    to access the bucket.

        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ],
                    "Resource": "arn:aws:logs:*:*:*"
                },
                {
                    "Effect": "Allow",
                    "Action": "s3:*",
                    "Resource": [
                        "arn:aws:s3:::<bucketname>/*"
                    ]
                }
            ]
        }

3.  The Lambda function, with environment variables:

    | Variable     | Value           |
    |--------------|-----------------|
    | OUTLET_COUNT | 8               |
    | BUCKET       | the bucket name |
    | KEY          | file name       |

    and the role from step 1.

4.  API Gateway: create and deploy a new API with:

    * CORS enabled everywhere
    * Resource `/outlet/{outlet}`
    * Method ANY, 
       integration type Lambda Function, 
       Use Lambda Proxy Integration enabled, 
       and the appropriate region and function name.

    This should automatically setup the appropriate permissions.
    If there are issues, you can use the AWS CLI to do something like:

        aws lambda add-permission \
          --function-name wgPorchLights \
          --statement-id tom-test \
          --action lambda:InvokeFunction \
          --principal apigateway.amazonaws.com \
          --source-arn "arn:aws:execute-api:us-west-2:123456789012:abcedfgh12/*/*/outlets/*"

## Web Page

This is pretty self explanatory. There's a web page and JavaScript.

You'll want to put your API URL in the HTML file and you'll probably
want to make it prettier.

## Perl Script

There's a script that does the real work and a wrapper runs it 
periodically and handles timeouts. Usage is something like:

    house_agent/sync_outlets.pl \
        -l http://user:pass@172.17.1.101 \
        -r http://s3-us-west-2.amazonaws.com/my_example_bucket/outlets.txt \
        [on|off|status|sync]

This works great as a Docker container.

## Author

[Thomas Insel](http://tinsel.org/) <tinsel@tinsel.org>

## License

Copyright 2017 Thomas Insel

Licensed under the Apache License, Version 2.0 (the "License"); you
may not use this file except in compliance with the License. You
may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing
permissions and limitations under the License.
