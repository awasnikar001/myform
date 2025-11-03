import {
  CaptchaKindEnum,
  FieldKindEnum,
  FormField,
  FormKindEnum,
  FormStatusEnum,
  InteractiveModeEnum
} from '@heyform-inc/shared-types-enums'
import { Logger } from '@nestjs/common'
import { OpenAI } from 'openai'

import { Auth, ProjectGuard, Team, User } from '@decorator'
import { OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_GPT_MODEL } from '@environments'
import { CreateFormWithAIInput } from '@graphql'
import { helper, nanoid, parseJson, timestamp } from '@heyform-inc/utils'
import { TeamModel, UserModel } from '@model'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { FormService } from '@service'

type GeneratedField = Partial<FormField> & {
  title?: string | string[]
  description?: string | string[]
  kind?: string
}

@Resolver()
@Auth()
export class FormAIResolver {
  private readonly logger = new Logger(FormAIResolver.name)

  constructor(private readonly formService: FormService) {}

  @Mutation(() => String)
  @ProjectGuard()
  async createFormWithAI(
    @Team() team: TeamModel,
    @User() user: UserModel,
    @Args('input') input: CreateFormWithAIInput
  ): Promise<string> {
    const fields = await this.generateFields(input)

    const formName = helper.isValid(input.topic) ? input.topic : 'Untitled form'

    return await this.formService.create({
      teamId: team.id,
      memberId: user.id,
      projectId: input.projectId,
      name: formName,
      interactiveMode: InteractiveModeEnum.GENERAL,
      kind: FormKindEnum.SURVEY,
      settings: {
        active: false,
        captchaKind: CaptchaKindEnum.NONE,
        filterSpam: false,
        allowArchive: true,
        requirePassword: false,
        locale: 'en',
        enableQuestionList: true,
        enableNavigationArrows: true,
        enableEmailNotification: true
      },
      fields: [],
      hiddenFields: [],
      logics: [],
      variables: [],
      _drafts: JSON.stringify(fields),
      fieldsUpdatedAt: 0,
      version: 0,
      status: FormStatusEnum.NORMAL,
      topic: input.topic,
      reference: input.reference,
      generatedAt: timestamp()
    })
  }

  private async generateFields(input: CreateFormWithAIInput): Promise<FormField[]> {
    const fallback = this.createFallbackFields()

    if (helper.isEmpty(OPENAI_API_KEY)) {
      return fallback
    }

    try {
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        baseURL: OPENAI_BASE_URL
      })

      const prompt = {
        topic: input.topic,
        reference: input.reference ?? null,
        instructions:
          'Generate concise conversational questions. Include welcome or thank you screens when appropriate.'
      }

      const response = await openai.chat.completions.create({
        model: OPENAI_GPT_MODEL,
        response_format: {
          type: 'json_object'
        },
        temperature: 0.7,
        max_tokens: 1200,
        messages: [
          {
            role: 'system',
            content:
              'You design Heyform schemas. Respond ONLY with JSON matching this interface: {"fields": FormField[]} where FormField objects contain kind, title, description, validations, and properties compatible with Heyform.'
          },
          {
            role: 'user',
            content: JSON.stringify(prompt)
          }
        ]
      })

      const content = response.choices?.[0]?.message?.content

      if (helper.isValid(content)) {
        const parsed: any = parseJson(content)
        const candidate = Array.isArray(parsed?.fields)
          ? parsed.fields
          : this.tryParseArray(content)

        if (helper.isValidArray(candidate)) {
          const normalized = this.normalizeFields(candidate as GeneratedField[])

          if (helper.isValidArray(normalized)) {
            return normalized
          }
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to generate form with AI',
        error instanceof Error ? error.stack : undefined
      )
    }

    return fallback
  }

  private tryParseArray(payload: string): GeneratedField[] | null {
    const start = payload.indexOf('[')
    const end = payload.lastIndexOf(']')

    if (start === -1 || end === -1 || end <= start) {
      return null
    }

    try {
      const sliced = payload.slice(start, end + 1)
      const result = parseJson(sliced)
      return Array.isArray(result) ? (result as GeneratedField[]) : null
    } catch (error) {
      return null
    }
  }

  private normalizeFields(fields: GeneratedField[]): FormField[] {
    const normalized: FormField[] = []

    for (const field of fields) {
      if (!field || typeof field !== 'object') {
        continue
      }

      const kind = this.normalizeKind(field.kind)
      const title = this.toRichText(field.title) ?? ['Question']
      const description = this.toRichText(field.description)
      const validations = this.isPlainObject(field.validations) ? field.validations : undefined
      const properties = this.isPlainObject(field.properties) ? field.properties : undefined
      const layout = this.isPlainObject((field as any).layout) ? (field as any).layout : undefined

      normalized.push({
        id: nanoid(12),
        kind,
        title,
        description,
        validations,
        properties,
        layout
      })
    }

    if (!normalized.some(field => field.kind === FieldKindEnum.THANK_YOU)) {
      normalized.push(this.createThankYouField())
    }

    return normalized.length > 0 ? normalized : this.createFallbackFields()
  }

  private normalizeKind(kind?: string): FieldKindEnum {
    if (typeof kind === 'string') {
      const lower = kind.toLowerCase()
      const match = Object.values(FieldKindEnum).find(value => value === lower)

      if (match) {
        return match
      }
    }

    return FieldKindEnum.SHORT_TEXT
  }

  private toRichText(value?: string | string[]): string[] | undefined {
    if (helper.isEmpty(value)) {
      return undefined
    }

    if (Array.isArray(value)) {
      return value.map(item => String(item))
    }

    return [String(value)]
  }

  private isPlainObject(value: any): value is Record<string, any> {
    return !!value && typeof value === 'object' && !Array.isArray(value)
  }

  private createFallbackFields(): FormField[] {
    return [
      {
        id: nanoid(12),
        kind: FieldKindEnum.SHORT_TEXT,
        title: ['What is your name?'],
        validations: { required: true }
      },
      {
        id: nanoid(12),
        kind: FieldKindEnum.EMAIL,
        title: ['What is your email address?'],
        validations: { required: true }
      },
      this.createThankYouField()
    ]
  }

  private createThankYouField(): FormField {
    return {
      id: nanoid(12),
      kind: FieldKindEnum.THANK_YOU,
      title: ['Thank you!'],
      description: ['Thanks for completing this form.']
    }
  }
}
