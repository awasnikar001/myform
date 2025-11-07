import { Choice, FieldKindEnum, Property } from '@heyform-inc/shared-types-enums'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'

interface Choose extends Choice {
  count: number
}

export interface FormReportResponse {
  id: string
  total: number
  count?: number
  average?: number
  properties?: Property
  chooses?: Choose[]

  kind?: FieldKindEnum
  title?: string
  description?: string
}

@Schema({
  timestamps: true
})
export class FormReportModel extends Document {
  @Prop({ required: true, unique: true })
  formId: string

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  responses?: FormReportResponse[]
}

export const FormReportSchema = SchemaFactory.createForClass(FormReportModel)
