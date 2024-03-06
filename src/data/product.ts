//import { DynamoDB } from "aws-sdk"
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ulid } from "ulid"
import { KeyObject, createHmac } from "node:crypto";
const {
  Client,
  TopicMessageSubmitTransaction
} = require("@hashgraph/sdk");

import { Item } from "./base"
import { getClient } from "./client"

interface ChainTxn {
  sequence_number: number,
  topic_id: string,
  transaction_id: string
}


export class Product extends Item {
  id: string
  timestamp: number
  author: string
  title: string
  validators: string[]
  downloads: number
  rating: number
  reference: string
  tags: string[]
  type: string
  category: string
  indicators: string
  indicatorsHash: string
  chainTxn: ChainTxn

  constructor(
    id: string = ulid(), 
    timestamp: number = Date.now(), 
    author: string, 
    title: string, 
    validators?: string[],
    downloads?: number,
    rating?: number,
    reference?: string,
    tags?: string[],
    type?: string,
    category?: string,
    indicators?: string,
    indicatorsHash?: string,
    chainTxn?: ChainTxn
  ) {
    super()
    this.id = id
    this.timestamp = timestamp
    this.author = author
    this.title = title
    this.validators = validators || []
    this.downloads = downloads || -1
    this.rating = rating || -1
    this.reference = reference || ''
    this.tags = tags || []
    this.type = type || ''
    this.category = category || ''
    this.indicators = indicators || ''
    this.indicatorsHash = indicatorsHash || ''
    this.chainTxn = chainTxn!
  }

  static fromItem(item?: any): Product {
    if (!item) throw new Error("No item!")
    return new Product(
      item.Id,
      Number(item.Timestamp),
      item.Author,
      item.Title,
      item.Validators,
      item.Downloads,
      item.Rating,
      item.Reference,
      item.Tags,
      item.Type,
      item.Category,
      item.Indicators,
      item.IndicatorsHash,
      item.ChainTxn
    )
  }

  get pk(): string {
    return `PROD#${this.id}`
  }

  get sk(): string {
    return `PROD#${this.id}`
  }

  get gsi1pk(): string {
    return `PROD`
  }

  get gsi1sk(): string {
    return `PROD#${this.id}`
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      GSI1PK: this.gsi1pk,
      GSI1SK: this.gsi1sk,
      Id: this.id,
      Timestamp: this.timestamp,
      Author: this.author,
      Title: this.title,
      Validators: this.validators,
      Downloads: this.downloads,
      Rating: this.rating,
      Reference: this.reference,
      Tags: this.tags,
      Type: this.type,
      Category: this.category,
      Indicators: this.indicators,
      IndicatorsHash: this.indicatorsHash,
      ChainTxn: this.chainTxn
    }
  }

  namesItem(): Record<string, string> {
    return {
      "#AU": "Author",
      "#TI": "Title",
      "#VA": "Validators",
      "#DO": "Downloads",
      "#RA": "Rating",
      "#RE": "Reference",
      "#TA": "Tags",
      "#PR": "Type",
      "#CA": "Category",
      "#IN": "Indicators",
      "#IH": "IndicatorsHash"
    }
  }

  valuesItem(): Record<string, unknown> {
    return {
      ":au": this.author,
      ":ti": this.title,
      ":va": this.validators,
      ":do": this.downloads,
      ":ra": this.rating,
      ":re": this.reference,
      ":ta": this.tags,
      ":pr": this.type,
      ":ca": this.category,
      ":in": this.indicators,
      ":ih": this.indicatorsHash
    }
  }

  expressionItem(): string {
    return "SET #AU = :au, #TI = :ti, #VA = :va, #DO = :do, #RA = :ra, #RE = :re, #TA = :ta, #PR = :pr, #CA = :ca, #IN = :in, #IH = :ih"
  }
}

export const createProduct = async (product: Product): Promise<any> => {
    const client = getClient()
    const productHash = createHmac('sha256', product.indicators).digest('hex')
    product.indicatorsHash = productHash
    product.indicators = JSON.parse(product.indicators)
    // const { transactionId, topicSequenceNumber } = await createMessage(productHash);
    // const topicId = process.env.TOPIC_ID || ''
    // product.chainTxn = {
    //   sequence_number: topicSequenceNumber,
    //   topic_id: topicId,
    //   transaction_id: transactionId
    // }
    try {
      const resp = await client.send(
        new PutCommand({
          TableName: process.env.TABLE_NAME,
          Item: product.toItem(),
          ConditionExpression: "attribute_not_exists(PK)"
        })
      )
      return resp.$metadata
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const updateProduct = async (product: Product): Promise<Product> => {
  const client = getClient()
  product.indicatorsHash = createHmac('sha256', product.indicators).digest('hex')
  product.indicators = JSON.parse(product.indicators)
  try {
    const resp = await client.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: product.keys(),
        ExpressionAttributeNames: product.namesItem(),
        ExpressionAttributeValues: product.valuesItem(),
        UpdateExpression: product.expressionItem(),
        ReturnValues: "ALL_NEW"
      })
    )
    return product
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const deleteProduct = async (id: string): Promise<Product> => {
  const client = getClient()
  const product = new Product(id, 0, '', '')
  try {
    const resp = await client.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: product.keys()
      })
    )
    return product
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getProduct = async (id: any): Promise<Product> => {
    const client = getClient()
    const product = new Product(id, 0, '', '')
    try {
      const resp = await client.send(
        new GetCommand({
          TableName: process.env.TABLE_NAME,
          Key: product.keys()
        })
      )
      return Product.fromItem(resp.Item)
    } catch (error) {
        throw error
    }
}

/**
 * 
 * @returns Product[]
 */
export const listProducts = async (): Promise<Product[]> => {
    const client = getClient()
    try {
      const resp = await client.send(
        new QueryCommand({
          TableName: process.env.TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :gsi1pk",
          ExpressionAttributeValues: {
              ":gsi1pk": "PROD"
          },
          ScanIndexForward: false
        })
      )
      return resp.Items!.map((item) => Product.fromItem(item))
    } catch (error) {
      console.log(error)
      throw error
    }
}

/**
 * 
 * @param gsi1pk - The Global secondary index to search on. Defaults to "PROD"
 * @returns Product[]
 */
export const listProductsByUser = async (username: any): Promise<Product[]> => {
  const client = getClient()
  try {
    const resp = await client.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :gsi1pk",
        ExpressionAttributeValues: {
            ":gsi1pk": `USER#${username}`
        },
        ScanIndexForward: false
      })
    )
    return resp.Items!.map((item) => Product.fromItem(item))
  } catch (error) {
    console.log(error)
    throw error
  }
}

const createMessage = async (productHash: string): Promise<any> => {
  const accountId = process.env.TRUSS_ACCOUNT_ID;
  const privateKey = process.env.TRUSS_PRIVATE_KEY;
  const topicId = process.env.TOPIC_ID;

  // If we weren't able to grab it, we should throw a new error
  if (!accountId || !privateKey) {
    throw new Error(
      "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
    );
  }
  
  //Create Hedera Testnet client
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);

  // Send message to the topic
  let sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: productHash,
  }).execute(client);

  // Get transaction ID for the message
  const record = await sendResponse.getRecord(client);

  client.close();

  return {transactionId: record.transactionId.toString(), topicSequenceNumber: record.receipt.topicSequenceNumber.toString() }
};