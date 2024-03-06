import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { listProducts } from "../data/product"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const result = await listProducts()
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        result
      })
  }

  return response
}
