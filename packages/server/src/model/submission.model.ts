import {
  Answer,
  HiddenFieldAnswer,
  SubmissionCategoryEnum,
  SubmissionStatusEnum,
  Variable
} from '@heyform-inc/shared-types-enums'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'

import { UserAgent } from '@utils'

export enum ExportSubmissionFormatEnum {
  CSV = 'csv',
  PDF = 'pdf'
}

@Schema({
  timestamps: true
})
export class SubmissionModel extends Document {
  @Prop({ required: true, index: true })
  formId: string

  @Prop({
    type: String,
    required: true,
    enum: Object.values(SubmissionCategoryEnum),
    default: SubmissionCategoryEnum.INBOX
  })
  category: SubmissionCategoryEnum

  @Prop({ required: true })
  title: string

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  answers: Answer[]

  @Prop({ default: [], type: [MongooseSchema.Types.Mixed] })
  hiddenFields?: HiddenFieldAnswer[]

  @Prop({ default: [], type: [MongooseSchema.Types.Mixed] })
  variables?: Variable[]

  @Prop()
  startAt?: number

  @Prop()
  endAt?: number

  @Prop()
  ip: string

  @Prop({ type: MongooseSchema.Types.Mixed })
  userAgent: UserAgent

  @Prop({
    type: Number,
    required: true,
    enum: Object.values(SubmissionStatusEnum),
    default: SubmissionStatusEnum.PUBLIC
  })
  status: SubmissionStatusEnum
}

export const SubmissionSchema = SchemaFactory.createForClass(SubmissionModel)
