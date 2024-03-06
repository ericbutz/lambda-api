import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { getPurchase } from "../data/purchase"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters || {}
  const result = await getPurchase(id)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        result
      })
  }

  return response
}
