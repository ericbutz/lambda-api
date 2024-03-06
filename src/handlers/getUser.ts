import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { getUser } from "../data/user"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { username } = event.pathParameters || {}
  const result = await getUser(username)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        result
      })
  }

  return response
}
