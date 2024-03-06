import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { getProduct } from "../data/product"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters || {}
  const result = await getProduct(id)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        result
      })
  }

  return response
}
