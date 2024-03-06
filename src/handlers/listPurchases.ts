import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { listPurchases } from "../data/purchase"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const purchases = await listPurchases()
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        purchases
      })
  }

  return response
}
