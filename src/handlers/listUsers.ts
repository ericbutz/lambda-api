import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { listUsers } from "../data/user"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const user = await listUsers()
  const response = {
      statusCode: 200,
      body: JSON.stringify({
          user
      })
  }

  return response
}
