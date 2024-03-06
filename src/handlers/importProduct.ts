import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { Product, createProduct } from "../data/product"
import Ajv, {JSONSchemaType} from "ajv"

// Create a new APIGatewayProxyHandler called main that takes in a single json object from body
export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const productJson = JSON.parse(event.body || '{}')
  const product = validateProduct(productJson);
  //const { author, title, downloads, rating, reference, tags, type, category, indicators } = JSON.parse(event.body || '{}')
  //const product = new Product(undefined, undefined, author, title, downloads, rating, reference, tags, type, category, JSON.stringify(indicators))
  //await createProduct(product)
  return {
    statusCode: 200,
    body: JSON.stringify({
      product
    })
  }
}

// create a type interface for Product object
interface ProductSchema {
  id: string
  timestamp: number
  author: string
  title: string
  validators?: string[]
  downloads?: number
  rating?: number
  reference?: string
  tags?: string[]
  type?: string
  category?: string
  indicators?: string
}

// create a jsonschematype for ProductSchema
const schema: JSONSchemaType<ProductSchema> = {
  type: "object",
  properties: {
    id: { type: "string" },
    timestamp: { type: "number" },
    author: { type: "string" },
    title: { type: "string" },
    validators: { type: "array", items: { type: "string" }, nullable: true },
    downloads: { type: "number", nullable: true },
    rating: { type: "number", nullable: true },
    reference: { type: "string", nullable: true },
    tags: { type: "array", items: { type: "string" }, nullable: true },
    type: { type: "string", nullable: true },
    category: { type: "string", nullable: true },
    indicators: { type: "string", nullable: true }
  },
  required: ["id", "timestamp", "author", "title"],
  additionalProperties: false
}

// create a function that takes a json object as input and validates it against a json schema
export const validateProduct = (product: Product) => {
  const ajv = new Ajv()
  const validate = ajv.compile(schema)
  const valid = validate(product)
  if (!valid) {
    throw new Error(ajv.errorsText(validate.errors))
  }

}
