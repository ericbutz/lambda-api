//import { DynamoDB } from "aws-sdk"
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { ulid } from "ulid"
import { Item } from "./base"
import { getClient } from "./client"
import 'dotenv/config'


export class User extends Item {
  id: string
  username: string
  name: string
  company: string

  constructor(
    id: string = ulid(), 
    username: string, 
    name?: string, 
    company?: string
  ) {
    super()
    this.id = id
    this.username = username
    this.name = name || ""
    this.company = company || ""
  }

  static fromItem(item?: any): User {
    if (!item) throw new Error("No item!")
    return new User(item.Id, item.Username, item.Name, item.Company)
  }

  get pk(): string {
    return `USER#${this.username}`
  }

  get sk(): string {
    return `USER#${this.username}`
  }

  get gsi1pk(): string {
    return `USER`
  }

  get gsi1sk(): string {
    return `USER#${this.username}`
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      GSI1PK: this.gsi1pk,
      GSI1SK: this.gsi1sk,
      Id: this.id,
      Username: this.username,
      Name: this.name,
      Company: this.company
    }
  }

  namesItem(): Record<string, string> {
    return {
      "#N": "Name",
      "#C": "Company"
    }
  }

  valuesItem(): Record<string, unknown> {
    return {
      ":n": this.name ,
      ":c": this.company
    }
  }

  expressionItem(): string {
    return "SET #N = :n, #C = :c"
  }
}

export const createUser = async (user: User): Promise<any> => {
  const client = getClient()
  try {
    const resp = await client.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: user.toItem(),
        ConditionExpression: "attribute_not_exists(PK)"  // For any write you can include an expression. If it evalutes to false the write does not happen. So, this makes sure the user does not already exist.
      })
    )
    return resp.$metadata
  } catch (error) {
      throw error
  }
}

export const updateUser = async (user: User): Promise<User> => {
  const client = getClient()
  try {
    const resp = await client.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: user.keys(),
        ExpressionAttributeNames: user.namesItem(),
        ExpressionAttributeValues: user.valuesItem(),
        UpdateExpression: user.expressionItem(),
        ReturnValues: "ALL_NEW"
      })
    )
    return user
  } catch (error) {
    throw error
  }
}

export const deleteUser = async (username: string): Promise<User> => {
  const client = getClient() 
  const user = new User("", username)
  try {
    const resp = await client.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: user.keys()
      })
    )
    return user
  } catch (error) {
    throw error
  }
}

export const getUser = async (username: any ): Promise<User> => {
  const client = getClient()
  const user = new User("", username)
  //console.log('user: ',user)
  try {
    const resp = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: user.keys()
      })
    )
    return User.fromItem(resp.Item)
  } catch (error) {
    throw error
  }
}

/**
 * 
 * @returns User[]
 */
export const listUsers = async (): Promise<User[]> => {
  const client = getClient()
  try {
    const resp = await client.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :gsi1pk",
        ExpressionAttributeValues: {
            ":gsi1pk": "USER"
        },
        ScanIndexForward: false
      })
    )
    return resp.Items!.map((item) => User.fromItem(item))
  } catch (error) {
      throw error
  }
}

/**
 * 
 * @returns User[]
 */
export const listUsersByProduct = async (id: any): Promise<User[]> => {
  const client = getClient()
  try {
    const resp = await client.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1SK = :gsi1sk",
        ExpressionAttributeValues: {
            ":gsi1sk": `PROD#${id}`
        },
        ScanIndexForward: false
      })
    )
    return resp.Items!.map((item) => User.fromItem(item))
  } catch (error) {
      throw error
  }
}