import { Field, InputType, ObjectType } from '@nestjs/graphql'

@InputType()
export class PexelsSearchInput {
  @Field({ nullable: true })
  keyword?: string

  @Field({ nullable: true })
  page?: number
}

@ObjectType()
export class PexelsImageType {
  @Field()
  id: string

  @Field()
  url: string

  @Field()
  thumbUrl: string

  @Field({ nullable: true })
  downloadUrl?: string

  @Field()
  author: string

  @Field()
  authorUrl: string
}
