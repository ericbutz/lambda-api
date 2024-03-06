import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { User, deleteUser } from "../data/user"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const username: string = event.pathParameters!.username || ""
  const user = await deleteUser(username)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
          user
      })
  }

  return response
}
