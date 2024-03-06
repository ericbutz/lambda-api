import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { Product, createProduct } from "../data/product"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { author, title, validators, downloads, rating, reference, tags, type, category, indicators } = JSON.parse(event.body || '{}')
  const product = new Product(undefined, undefined, author, title, validators, downloads, rating, reference, tags, type, category, JSON.stringify(indicators))
  await createProduct(product)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
          product
      })
  }

  return response
}

