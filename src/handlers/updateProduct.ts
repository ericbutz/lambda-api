import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { Product, updateProduct } from "../data/product"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters || {}
  const { author, title, validators, downloads, rating, reference, tags, type, category, indicators } = JSON.parse(event.body || '{}')
  const product = new Product(id, undefined, author, title, validators, downloads, rating, reference, tags, type, category, JSON.stringify(indicators))
  await updateProduct(product)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        product
      })
  }

  return response
}
