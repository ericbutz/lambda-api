import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { listUsersByProduct } from "../data/user"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters || {}
  const user = await listUsersByProduct(`PROD${id}`)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
          user
      })
  }

  return response
}
