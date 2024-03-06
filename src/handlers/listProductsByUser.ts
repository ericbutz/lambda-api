import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { listProductsByUser } from "../data/product"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { username } = event.pathParameters || {}
  const result = await listProductsByUser(username)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        result
      })
  }

  return response
}
