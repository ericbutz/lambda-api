//import { DynamoDB } from "aws-sdk"
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { ulid } from "ulid"
import { Item } from "./base"
import { getClient } from "./client"
import 'dotenv/config'


export class Purchase extends Item {
  id: string
  username: string
  productId: string

  constructor(
    id: string = ulid(), 
    username: string,
    productId: string
  ) {
    super()
    this.id = id
    this.username = username
    this.productId = productId
  }

  static fromItem(item?: any): Purchase {
    if (!item) throw new Error("No item!")
    return new Purchase(item.Id, item.Username, item.Product)
  }

  get pk(): string {
    return `PURCHASE#${this.id}`
  }

  get sk(): string {
    return `PURCHASE#${this.id}`
  }

  get gsi1pk(): string {
    return `USER#${this.username}`
  }

  get gsi1sk(): string {
    return `PROD#${this.productId}`
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      GSI1PK: this.gsi1pk,
      GSI1SK: this.gsi1sk,
      Id: this.id,
      Username: this.username,
      ProductId: this.productId
    }
  }

  namesItem(): Record<string, string> {
    return {
      "#Id": "Id",
      "#Us": "Username",
      "#Pr": "ProductId"
    }
  }
}

export const buyProduct = async (purchase: Purchase): Promise<any> => {
  const client = getClient()
  try {
    const resp = await client.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: purchase.toItem(),
        ConditionExpression: "attribute_not_exists(PK)"  // For any write you can include an expression. If it evalutes to false the write does not happen. So, this makes sure the user does not already exist.
      })
    )
    return resp.$metadata
  } catch (error) {
      throw error
  }
}

export const getPurchase = async (id: any ): Promise<Purchase> => {
  const client = getClient()
  const purchase = new Purchase(id, '', '')
  //console.log('purchase: ',purchase)
  try {
    const resp = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: purchase.keys()
      })
    )
    return Purchase.fromItem(resp.Item)
  } catch (error) {
    throw error
  }
}

export const listPurchases = async (): Promise<Purchase[]> => {
  const client = getClient()
  try {
    const resp = await client.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        IndexName: "PK",
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
            ":pk": "PURCHASE#"
        },
        ScanIndexForward: false
      })
    )
    return resp.Items!.map((item) => Purchase.fromItem(item))
  } catch (error) {
      throw error
  }
}
