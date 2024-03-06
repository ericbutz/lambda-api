import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda"
import { User, updateUser } from "../data/user"

export const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const username: string = event.pathParameters!.username || ""
  const { name, company } = JSON.parse(event.body || '{}')
  const user = new User(undefined, username, name, company)
  await updateUser(user)
  const response = {
      statusCode: 200,
      body: JSON.stringify({
          user
      })
  }

  return response
}
