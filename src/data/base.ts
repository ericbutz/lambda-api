import { DynamoDB } from "@aws-sdk/client-dynamodb"

export abstract class Item {
  abstract get pk(): string
  abstract get sk(): string
  abstract get gsi1pk(): string
  abstract get gsi1sk(): string

  public keys(): object {
    return {
      PK: this.pk,
      SK: this.sk
    }
  }

  abstract toItem(): Record<string, unknown>
  abstract namesItem(): Record<string, unknown>
}
