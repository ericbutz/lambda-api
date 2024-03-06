import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { Product, deleteProduct } from "../data/product"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const id: string = event.pathParameters!.id || ""
  const product = await deleteProduct(id)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        product
      })
  }

  return response
}
