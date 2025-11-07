import {
  FormField,
  FormKindEnum,
  InteractiveModeEnum,
  ThemeSettings
} from '@heyform-inc/shared-types-enums'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'

@Schema({
  timestamps: true
})
export class TemplateModel extends Document {
  @Prop({ required: true, unique: true })
  name: string

  @Prop()
  slug?: string

  @Prop()
  thumbnail?: string

  @Prop({ required: true })
  category: string

  @Prop()
  description?: string

  @Prop({
    type: Number,
    required: true,
    enum: Object.values(InteractiveModeEnum),
    default: InteractiveModeEnum.GENERAL
  })
  interactiveMode: InteractiveModeEnum

  @Prop({
    type: Number,
    required: true,
    enum: Object.values(FormKindEnum),
    default: FormKindEnum.SURVEY
  })
  kind: FormKindEnum

  @Prop({ default: [], type: [MongooseSchema.Types.Mixed] })
  fields?: FormField[]

  @Prop()
  fieldsUpdatedAt?: number

  @Prop({ type: MongooseSchema.Types.Mixed })
  themeSettings?: ThemeSettings

  @Prop({ required: false, default: 0 })
  usedCount?: number

  @Prop({ required: false, default: 0 })
  timeSaving?: string

  @Prop({ required: false, default: 0 })
  timeToComplete?: string

  @Prop({ default: false })
  published?: boolean
}

export const TemplateSchema = SchemaFactory.createForClass(TemplateModel)
