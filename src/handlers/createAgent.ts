
/**
 * If things are failing
 *   You may need to re-add your IP to EC2 > Security Groups (mine changed for some reason)
 * You can run via the tests right now. That is working.
 * Need to test from Lambda. Forget how to do that...
 * Add log info somehow? Or maybe start by just doing a login. Or start by doing maybe almost nothing excep
 *   return an env var? 
 *
 * 
 * Failing right now:
 *   Are .env getting uploaded?
 */
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { SplunkAgent } from "../data/agent"
import dotenv from 'dotenv'

// async createAlert(alertName: string, indicators: {}, alertOptions?: {}) { 

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  dotenv.config()
  const { productName, id, indicators, alertOptions } = JSON.parse(event.body || '{}')
  const options = {
    serviceParams: {
      username: process.env.SPLUNK_USERNAME,
      password: process.env.SPLUNK_PASSWORD,
      scheme: process.env.SCHEME,
      host: process.env.HOST,
      port: process.env.PORT,
      version: process.env.VERSION
    }
  }

  let response: any

  try {
    const agent = new SplunkAgent(options)
    const login = await agent.login()
    const createAlert = await agent.createAlert(productName, id, indicators, alertOptions)
    response = {
      statusCode: 200,
      body: JSON.stringify({
        status: "Success",
        login,
        createAlert
      })
    }
  } catch (err) {
    const error = err.data
    const statusCode = err.status
    response = {
      statusCode: statusCode,
      body: JSON.stringify({
        statusCode,
        error
      })
    }
  }
  
  return response
}
