//import AWS from "aws-sdk"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fromIni } from "@aws-sdk/credential-providers";
//const { FetchHttpHandler } = require("@smithy/fetch-http-handler");

let client: DynamoDBClient; // = null
let docClient: DynamoDBDocumentClient;// = null

//let credentials = new AWS.SharedIniFileCredentials({profile: 'serverless'});
//AWS.config.credentials = credentials;
//const { DynamoDB } = AWS;


export const getClient = (): DynamoDBDocumentClient => {
  if (client) return client;  // Caches client
  client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    
    //credentialDefaultProvider: fromIni({profile: "serverless"})
    //credentials: fromIni({profile: "serverless"}),
    // requestHandler: new FetchHttpHandler({
    //   requestTimeout: 1000
    // })
  })
  docClient = DynamoDBDocumentClient.from(client);
  return docClient;
}
