import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { Purchase, buyProduct } from "../data/purchase"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { productId, username } = JSON.parse(event.body || '{}')
  const purchase = new Purchase(undefined, username, productId)
  await buyProduct(purchase)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        purchase
      })
  }
  return response
}

