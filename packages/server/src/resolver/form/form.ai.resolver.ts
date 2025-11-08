import {
  CaptchaKindEnum,
  Choice,
  FieldKindEnum,
  FieldLayoutAlignEnum,
  FormField,
  FormKindEnum,
  FormStatusEnum,
  InteractiveModeEnum,
  Property,
  ThemeSettings,
  Validation
} from '@heyform-inc/shared-types-enums'
import { Logger } from '@nestjs/common'
import { OpenAI } from 'openai'

import { Auth, ProjectGuard, Team, User } from '@decorator'
import { OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_GPT_MODEL, PEXELS_API_KEY } from '@environments'
import { CreateFormWithAIInput } from '@graphql'
import { helper, nanoid, parseJson, timestamp } from '@heyform-inc/utils'
import { TeamModel, UserModel } from '@model'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { FormService } from '@service'
import { Pexels } from '@utils'

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

    // Select appropriate theme based on topic
    const themeSettings = this.selectThemeForTopic(input.topic)

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
      generatedAt: timestamp(),
      themeSettings
    })
  }

  private async generateFields(input: CreateFormWithAIInput): Promise<FormField[]> {
    const fallback = this.createFallbackFields()

    if (helper.isEmpty(OPENAI_API_KEY)) {
      this.logger.warn('OPENAI_API_KEY is not set, using fallback fields')
      return fallback
    }

    if (helper.isEmpty(OPENAI_GPT_MODEL)) {
      this.logger.error(
        'OPENAI_GPT_MODEL is not set. Please set the OPENAI_GPT_MODEL environment variable.'
      )
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
          'Generate a professional, production-ready form with appropriate field types, validations, and visual layouts. Include welcome and thank you screens.'
      }

      const systemPrompt = `You are an expert form designer creating production-ready Heyform schemas. Respond ONLY with valid JSON matching this interface: {"fields": FormField[]}

AVAILABLE FIELD TYPES (use exact values):
- welcome: Welcome/intro screen (use for first field if introducing the form)
- short_text: Single line text input
- long_text: Multi-line text input (for longer responses)
- email: Email address input with validation
- phone_number: Phone number input (NOT "number")
- number: Numeric input only (for quantities, ages, etc.)
- multiple_choice: Multiple choice with options array
- yes_no: Yes/No question
- file_upload: File upload field
- date: Date picker
- full_name: Full name fieldset (first + last name)
- address: Address fieldset
- thank_you: Thank you/completion screen (use ONLY at the end)

FIELD STRUCTURE:
{
  "kind": "field_type",
  "title": "Question text" or ["Question text"],  // Array for rich text
  "description": "Optional help text" or ["Help text"],  // Optional
  "validations": {
    "required": true/false  // Set true for important fields
  },
  "properties": {
    // Field-specific properties (see below)
  },
  "layout": {
    // Optional visual layout (see below)
  }
}

FIELD-SPECIFIC PROPERTIES:
- multiple_choice: {"choices": [{"id": "unique_id", "label": "Option 1"}, ...], "verticalAlignment": true, "allowMultiple": false}
- yes_no: {"choices": [{"id": "id1", "label": "Yes"}, {"id": "id2", "label": "No"}]}
- phone_number: {"defaultCountryCode": "US"}
- date: {"format": "MM/DD/YYYY", "allowTime": false}
- number: {"min": 0, "max": 100} // Optional min/max

LAYOUT OPTIONS (for visual appeal):
- layout.mediaType: "image" (use Pexels URLs for professional images)
- layout.mediaUrl: "https://images.pexels.com/photos/..." (high-quality, relevant image)
- layout.align: "inline" | "split_left" | "split_right" | "float_left" | "float_right" | "cover"
  - "split_right": Image on right, content on left (great for welcome screens)
  - "split_left": Image on left, content on right
  - "inline": Image above text (good for questions)
  - "cover": Full background image
- layout.brightness: 0 (default, adjust -100 to 100 if needed)

DESIGN GUIDELINES:
1. Use "welcome" field type for the first field if introducing the form topic
2. Use "thank_you" field type ONLY at the very end (one time)
3. IMPORTANT: Add relevant Pexels images to AT LEAST 3-4 key fields (not just welcome):
   - Welcome screen: Use split_right or split_left layout
   - Key questions (like "Tell us about yourself", "Upload resume", etc.): Use inline layout with relevant images
   - Important sections: Add images to make the form visually engaging
4. Use appropriate field types: phone_number (not number), full_name (not short_text for names)
5. Set required: true for critical fields (email, name, etc.)
6. Use descriptive titles and helpful descriptions
7. For job applications: include welcome, full_name, email, phone_number, long_text for cover letter, file_upload for resume, thank_you
8. For surveys: use multiple_choice, rating, opinion_scale appropriately
9. Keep form length reasonable (5-10 fields typically)
10. Make forms visually appealing by adding layouts to multiple fields, especially:
    - Welcome/intro fields (split_right or split_left)
    - Important question fields (inline layout)
    - File upload fields (inline layout with relevant image)
    - Long text fields asking for personal information (inline layout)

PEXELS IMAGE SUGGESTIONS (use high-quality, relevant images):
- Welcome/Intro: Use Pexels API to search for "teamwork collaboration"
- Job Application/Work: Use Pexels API to search for "modern workspace office"
- Contact/Communication: Use Pexels API to search for "business communication"
- Survey/Analytics: Use Pexels API to search for "data analytics charts"
- Resume/Document: Use Pexels API to search for "resume document professional"
- About Me/Personal: Use Pexels API to search for "professional portrait business"
- Skills/Experience: Use Pexels API to search for "team collaboration meeting"
- General Business: Use Pexels API to search for "business professional"

EXAMPLE OUTPUT:
{
  "fields": [
    {
      "kind": "welcome",
      "title": ["Welcome to Our Job Application"],
      "description": ["We're excited you're interested in joining our team!"],
      "layout": {
        "mediaType": "image",
        "mediaUrl": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
        "align": "split_right",
        "brightness": 0
      }
    },
    {
      "kind": "full_name",
      "title": ["What's your name?"],
      "validations": {"required": true}
    },
    {
      "kind": "email",
      "title": ["Email Address"],
      "description": ["We'll use this to contact you"],
      "validations": {"required": true}
    },
    {
      "kind": "long_text",
      "title": ["Tell us about yourself"],
      "description": ["Share your background and experience"],
      "validations": {"required": true},
      "layout": {
        "mediaType": "image",
        "mediaUrl": "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg",
        "align": "inline",
        "brightness": 0
      }
    },
    {
      "kind": "file_upload",
      "title": ["Upload your resume"],
      "description": ["Please upload your resume"],
      "validations": {"required": true},
      "layout": {
        "mediaType": "image",
        "mediaUrl": "https://images.pexels.com/photos/5905708/pexels-photo-5905708.jpeg",
        "align": "inline",
        "brightness": 0
      }
    },
    {
      "kind": "thank_you",
      "title": ["Thank you!"],
      "description": ["We've received your application and will be in touch soon."]
    }
  ]
}`

      const response = await openai.chat.completions.create({
        model: OPENAI_GPT_MODEL,
        response_format: {
          type: 'json_object'
        },
        temperature: 0.7,
        max_tokens: 3000, // Increased for comprehensive forms with layouts
        messages: [
          {
            role: 'system',
            content: systemPrompt
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
          const normalized = await this.normalizeFields(candidate as GeneratedField[], input)

          if (helper.isValidArray(normalized)) {
            return normalized
          }
        }
      }
    } catch (error: any) {
      if (
        error?.status === 404 ||
        error?.message?.includes('does not exist') ||
        error?.message?.includes('not found')
      ) {
        this.logger.error(
          `Invalid OpenAI model: "${OPENAI_GPT_MODEL}". Please check that the model name is correct and you have access to it. Error: ${error?.message || 'Unknown error'}`
        )
      } else if (error?.status === 401 || error?.status === 403) {
        this.logger.error(
          `OpenAI API authentication failed. Please check your OPENAI_API_KEY. Error: ${error?.message || 'Unknown error'}`
        )
      } else {
        this.logger.error(
          `Failed to generate form with AI: ${error?.message || 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined
        )
      }
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

  private async normalizeFields(
    fields: GeneratedField[],
    input?: CreateFormWithAIInput
  ): Promise<FormField[]> {
    const normalized: FormField[] = []
    let hasWelcome = false
    let hasThankYou = false
    let thankYouIndex = -1

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      if (!field || typeof field !== 'object') {
        continue
      }

      let kind = this.normalizeKind(field.kind)
      let title = this.toRichText(field.title) ?? ['Question']
      let description = this.toRichText(field.description)

      // Detect and convert welcome screens
      if (i === 0 && !hasWelcome && kind === FieldKindEnum.SHORT_TEXT) {
        const titleText = Array.isArray(title)
          ? title.join(' ').toLowerCase()
          : String(title).toLowerCase()
        if (
          titleText.includes('welcome') ||
          titleText.includes('introduction') ||
          titleText.includes('thank you for your interest') ||
          titleText.includes('get started')
        ) {
          kind = FieldKindEnum.WELCOME
          hasWelcome = true
        }
      }

      // Detect and handle duplicate thank you messages
      if (
        kind === FieldKindEnum.THANK_YOU ||
        (kind === FieldKindEnum.SHORT_TEXT &&
          Array.isArray(title) &&
          title.join(' ').toLowerCase().includes('thank'))
      ) {
        const titleText = Array.isArray(title)
          ? title.join(' ').toLowerCase()
          : String(title).toLowerCase()
        if (
          titleText.includes('thank') &&
          (titleText.includes('submitting') ||
            titleText.includes('completing') ||
            titleText.includes('application') ||
            titleText.includes('form'))
        ) {
          if (!hasThankYou) {
            kind = FieldKindEnum.THANK_YOU
            if (!titleText.includes('thank')) {
              title = ['Thank you!']
            }
            hasThankYou = true
            thankYouIndex = normalized.length
          } else {
            continue // Skip duplicate
          }
        }
      }

      const validations = this.isPlainObject(field.validations) ? field.validations : undefined
      let properties = this.isPlainObject(field.properties) ? field.properties : undefined
      const layout = this.isPlainObject((field as any).layout) ? (field as any).layout : undefined

      // Enhance properties based on field type
      properties = this.enhanceProperties(kind, properties, field)

      const sanitized = this.sanitizeField({
        id: nanoid(12),
        kind,
        title,
        description,
        validations,
        properties,
        layout: this.normalizeLayout(layout)
      })

      normalized.push(sanitized)

      if (kind === FieldKindEnum.WELCOME) {
        hasWelcome = true
      }
      if (kind === FieldKindEnum.THANK_YOU) {
        hasThankYou = true
        thankYouIndex = normalized.length - 1
      }
    }

    // Post-process: Add layouts to fields that don't have them but should
    // Uses Pexels API for dynamic image selection with fallback to hardcoded URLs
    for (let index = 0; index < normalized.length; index++) {
      const field = normalized[index]
      const hasValidLayout =
        field.layout && field.layout.mediaUrl && helper.isURL(field.layout.mediaUrl)
      if (!hasValidLayout && this.shouldHaveLayout(field, index, normalized.length)) {
        const generatedLayout = await this.generateLayoutForField(field, input?.topic)
        const normalizedLayout = this.normalizeLayout(generatedLayout)
        if (normalizedLayout && normalizedLayout.mediaUrl) {
          field.layout = normalizedLayout
        }
      }
    }

    // Ensure welcome screen if form is long enough
    if (!hasWelcome && normalized.length > 3) {
      const welcomeField = this.createWelcomeField(normalized[0]?.title?.[0] || 'Welcome')
      normalized.unshift(welcomeField)
      hasWelcome = true
    }

    // Ensure thank you field at the end
    if (!hasThankYou) {
      normalized.push(this.createThankYouField())
    } else if (thankYouIndex >= 0 && thankYouIndex < normalized.length - 1) {
      // Move thank you to the end if it's not already there
      const thankYouField = normalized.splice(thankYouIndex, 1)[0]
      normalized.push(thankYouField)
    }

    return normalized.length > 0 ? normalized : this.createFallbackFields()
  }

  /**
   * Determines if a field should have a layout based on its type and position
   */
  private shouldHaveLayout(field: FormField, index: number, totalFields: number): boolean {
    // Welcome fields should always have layouts
    if (field.kind === FieldKindEnum.WELCOME) {
      return true
    }

    // File upload fields should have layouts
    if (field.kind === FieldKindEnum.FILE_UPLOAD) {
      return true
    }

    // Long text fields (like "tell us about yourself") should have layouts
    if (field.kind === FieldKindEnum.LONG_TEXT) {
      const titleText = Array.isArray(field.title)
        ? field.title.join(' ')
        : String(field.title || '')
      const lowerTitle = titleText.toLowerCase()
      if (
        lowerTitle.includes('about') ||
        lowerTitle.includes('tell us') ||
        lowerTitle.includes('describe') ||
        lowerTitle.includes('experience') ||
        lowerTitle.includes('background') ||
        lowerTitle.includes('yourself')
      ) {
        return true
      }
    }

    // Add layouts to about 30-40% of fields (but not all)
    // Prioritize important/question fields
    if (index > 0 && index < totalFields - 1) {
      // Skip if it's a simple field like email, phone, or basic text
      if (
        [
          FieldKindEnum.EMAIL,
          FieldKindEnum.PHONE_NUMBER,
          FieldKindEnum.SHORT_TEXT,
          FieldKindEnum.FULL_NAME,
          FieldKindEnum.DATE
        ].includes(field.kind)
      ) {
        return false
      }

      // Add layout to every 3rd-4th field for visual variety
      if (index % 3 === 0 || index % 4 === 0) {
        return true
      }
    }

    return false
  }

  /**
   * Generates an appropriate layout for a field based on its type and topic
   * Uses Pexels API for dynamic image selection, with fallback to hardcoded URLs
   */
  private async generateLayoutForField(field: FormField, topic?: string): Promise<any> {
    const topicLower = (topic || '').toLowerCase()
    let imageUrl: string
    let align: FieldLayoutAlignEnum = FieldLayoutAlignEnum.INLINE

    // Determine search query based on field type and content
    let searchQuery: string | null = null

    if (field.kind === FieldKindEnum.FILE_UPLOAD) {
      searchQuery = 'document resume professional'
    } else if (field.kind === FieldKindEnum.LONG_TEXT) {
      const titleText = Array.isArray(field.title)
        ? field.title.join(' ')
        : String(field.title || '')
      const lowerTitle = titleText.toLowerCase()
      if (
        lowerTitle.includes('resume') ||
        lowerTitle.includes('cv') ||
        lowerTitle.includes('experience')
      ) {
        searchQuery = 'professional resume career'
      } else if (lowerTitle.includes('about') || lowerTitle.includes('yourself')) {
        searchQuery = 'professional person portrait'
      } else {
        searchQuery = 'professional business person'
      }
    } else if (
      topicLower.includes('job') ||
      topicLower.includes('application') ||
      topicLower.includes('career')
    ) {
      searchQuery = 'professional workspace office'
    } else if (topicLower.includes('contact') || topicLower.includes('reach')) {
      searchQuery = 'communication contact business'
    } else if (topicLower.includes('survey') || topicLower.includes('feedback')) {
      searchQuery = 'analytics data survey'
    } else {
      searchQuery = 'professional business teamwork'
    }

    // Try to fetch from Pexels API if available
    if (!helper.isEmpty(PEXELS_API_KEY) && searchQuery) {
      try {
        const pexels = Pexels.init({ apiKey: PEXELS_API_KEY })
        const result = await pexels.search(searchQuery, 1, 1)
        if (result.photos && result.photos.length > 0) {
          // Use large2x size for high quality (equivalent to Pexels's large2x)
          imageUrl = result.photos[0].src.large2x
        }
      } catch (error) {
        this.logger.warn(`Failed to fetch Pexels image for query "${searchQuery}": ${error}`)
      }
    }

    // Fallback to hardcoded Pexels URLs if API fails or is not available
    if (!imageUrl) {
      if (field.kind === FieldKindEnum.FILE_UPLOAD) {
        imageUrl =
          'https://images.pexels.com/photos/5905708/pexels-photo-5905708.jpeg?auto=compress&cs=tinysrgb&w=2000'
      } else if (field.kind === FieldKindEnum.LONG_TEXT) {
        const titleText = Array.isArray(field.title)
          ? field.title.join(' ')
          : String(field.title || '')
        const lowerTitle = titleText.toLowerCase()
        if (
          lowerTitle.includes('resume') ||
          lowerTitle.includes('cv') ||
          lowerTitle.includes('experience')
        ) {
          imageUrl =
            'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=2000'
        } else {
          imageUrl =
            'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=2000'
        }
      } else if (
        topicLower.includes('job') ||
        topicLower.includes('application') ||
        topicLower.includes('career')
      ) {
        imageUrl =
          'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=2000'
      } else if (topicLower.includes('contact') || topicLower.includes('reach')) {
        imageUrl =
          'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=2000'
      } else {
        imageUrl =
          'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=2000'
      }
    }

    return {
      mediaType: 'image',
      mediaUrl: imageUrl,
      align,
      brightness: 0
    }
  }

  private sanitizeField(field: FormField): FormField {
    const sanitized: FormField = {
      ...field,
      validations: this.sanitizeValidations(field.validations),
      properties: this.sanitizeProperties(field.properties)
    }

    return sanitized
  }

  private sanitizeValidations(validations?: Validation): Validation | undefined {
    if (!validations) {
      return undefined
    }

    const { required, min, max, matchExpected } = validations as Record<string, any>
    const cleaned: Validation = {}

    if (typeof required !== 'undefined') {
      cleaned.required = required
    }
    if (typeof min !== 'undefined') {
      cleaned.min = min
    }
    if (typeof max !== 'undefined') {
      cleaned.max = max
    }
    if (typeof matchExpected !== 'undefined') {
      cleaned.matchExpected = matchExpected
    }

    return Object.keys(cleaned).length > 0 ? cleaned : undefined
  }

  private sanitizeProperties(properties?: Property): Property | undefined {
    if (!properties) {
      return undefined
    }

    const cloned = { ...(properties as Record<string, any>) }
    delete cloned.placeholder

    if (Array.isArray(cloned.choices)) {
      const normalizedChoices: Choice[] = []

      for (const item of cloned.choices) {
        if (typeof item === 'string') {
          normalizedChoices.push({
            id: nanoid(12),
            label: item
          })
          continue
        }

        if (item && typeof item === 'object') {
          const id = helper.isValid((item as any).id) ? (item as any).id : nanoid(12)
          const label = helper.isValid((item as any).label)
            ? (item as any).label
            : helper.isValid((item as any).value)
              ? (item as any).value
              : ''

          normalizedChoices.push({
            id,
            label,
            image: (item as any).image,
            color: (item as any).color,
            score: (item as any).score,
            isExpected: (item as any).isExpected
          })
        }
      }

      cloned.choices = normalizedChoices
    }

    if (Array.isArray(cloned.fields)) {
      cloned.fields = cloned.fields.map(field => this.sanitizeField(field))
    }

    return cloned as Property
  }

  private enhanceProperties(kind: FieldKindEnum, properties: any, field: GeneratedField): any {
    if (!properties) {
      properties = {}
    }

    const enhanced = { ...properties }

    // Ensure verticalAlignment for choice fields
    if (
      [FieldKindEnum.MULTIPLE_CHOICE, FieldKindEnum.PICTURE_CHOICE, FieldKindEnum.YES_NO].includes(
        kind
      )
    ) {
      if (enhanced.verticalAlignment === undefined) {
        enhanced.verticalAlignment = true
      }
    }

    // Ensure phone_number has default country code
    if (kind === FieldKindEnum.PHONE_NUMBER && !enhanced.defaultCountryCode) {
      enhanced.defaultCountryCode = 'US'
    }

    // Ensure date format
    if (kind === FieldKindEnum.DATE && !enhanced.format) {
      enhanced.format = 'MM/DD/YYYY'
      enhanced.allowTime = false
    }

    // Ensure yes_no has proper choices
    if (kind === FieldKindEnum.YES_NO && (!enhanced.choices || enhanced.choices.length === 0)) {
      enhanced.choices = [
        { id: nanoid(12), label: 'Yes' },
        { id: nanoid(12), label: 'No' }
      ]
    }

    return enhanced
  }

  private normalizeLayout(layout: any): any {
    if (!layout || typeof layout !== 'object') {
      return undefined
    }

    const normalized: any = {}

    // Validate and normalize mediaType
    if (layout.mediaType === 'image' || layout.mediaType === 'video') {
      normalized.mediaType = layout.mediaType
    } else if (layout.mediaUrl) {
      normalized.mediaType = 'image' // Default to image if mediaUrl exists
    }

    // Validate mediaUrl
    if (helper.isURL(layout.mediaUrl)) {
      normalized.mediaUrl = layout.mediaUrl
    }

    // Validate align - convert string to enum if needed
    const validAligns = [
      FieldLayoutAlignEnum.INLINE,
      FieldLayoutAlignEnum.SPLIT_LEFT,
      FieldLayoutAlignEnum.SPLIT_RIGHT,
      FieldLayoutAlignEnum.FLOAT_LEFT,
      FieldLayoutAlignEnum.FLOAT_RIGHT,
      FieldLayoutAlignEnum.COVER
    ]
    const alignStringMap: Record<string, FieldLayoutAlignEnum> = {
      inline: FieldLayoutAlignEnum.INLINE,
      split_left: FieldLayoutAlignEnum.SPLIT_LEFT,
      split_right: FieldLayoutAlignEnum.SPLIT_RIGHT,
      float_left: FieldLayoutAlignEnum.FLOAT_LEFT,
      float_right: FieldLayoutAlignEnum.FLOAT_RIGHT,
      cover: FieldLayoutAlignEnum.COVER
    }

    if (layout.align) {
      if (validAligns.includes(layout.align)) {
        normalized.align = layout.align
      } else if (alignStringMap[layout.align]) {
        normalized.align = alignStringMap[layout.align]
      } else if (normalized.mediaUrl) {
        normalized.align = FieldLayoutAlignEnum.INLINE // Default align if mediaUrl exists
      }
    } else if (normalized.mediaUrl) {
      normalized.align = FieldLayoutAlignEnum.INLINE // Default align if mediaUrl exists
    }

    // Validate brightness (-100 to 100)
    if (
      typeof layout.brightness === 'number' &&
      layout.brightness >= -100 &&
      layout.brightness <= 100
    ) {
      normalized.brightness = layout.brightness
    } else if (normalized.mediaUrl) {
      normalized.brightness = 0 // Default brightness
    }

    // Only return layout if it has meaningful content
    if (normalized.mediaUrl || normalized.backgroundColor) {
      return normalized
    }

    return undefined
  }

  private normalizeKind(kind?: string): FieldKindEnum {
    if (typeof kind === 'string') {
      const lower = kind.toLowerCase().trim()

      // Direct match first
      const directMatch = Object.values(FieldKindEnum).find(value => value === lower)
      if (directMatch) {
        return directMatch
      }

      // Common aliases and variations
      const kindMap: Record<string, FieldKindEnum> = {
        phone: FieldKindEnum.PHONE_NUMBER,
        phone_number: FieldKindEnum.PHONE_NUMBER,
        tel: FieldKindEnum.PHONE_NUMBER,
        telephone: FieldKindEnum.PHONE_NUMBER,
        welcome: FieldKindEnum.WELCOME,
        intro: FieldKindEnum.WELCOME,
        introduction: FieldKindEnum.WELCOME,
        thank_you: FieldKindEnum.THANK_YOU,
        thankyou: FieldKindEnum.THANK_YOU,
        thanks: FieldKindEnum.THANK_YOU,
        completion: FieldKindEnum.THANK_YOU,
        email: FieldKindEnum.EMAIL,
        'e-mail': FieldKindEnum.EMAIL,
        mail: FieldKindEnum.EMAIL,
        short_text: FieldKindEnum.SHORT_TEXT,
        text: FieldKindEnum.SHORT_TEXT,
        single_line: FieldKindEnum.SHORT_TEXT,
        long_text: FieldKindEnum.LONG_TEXT,
        textarea: FieldKindEnum.LONG_TEXT,
        multiline: FieldKindEnum.LONG_TEXT,
        paragraph: FieldKindEnum.LONG_TEXT,
        multiple_choice: FieldKindEnum.MULTIPLE_CHOICE,
        choice: FieldKindEnum.MULTIPLE_CHOICE,
        select: FieldKindEnum.MULTIPLE_CHOICE,
        file_upload: FieldKindEnum.FILE_UPLOAD,
        file: FieldKindEnum.FILE_UPLOAD,
        upload: FieldKindEnum.FILE_UPLOAD,
        full_name: FieldKindEnum.FULL_NAME,
        name: FieldKindEnum.FULL_NAME,
        address: FieldKindEnum.ADDRESS,
        date: FieldKindEnum.DATE,
        number: FieldKindEnum.NUMBER,
        numeric: FieldKindEnum.NUMBER,
        yes_no: FieldKindEnum.YES_NO,
        boolean: FieldKindEnum.YES_NO,
        yesno: FieldKindEnum.YES_NO
      }

      if (kindMap[lower]) {
        return kindMap[lower]
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

  private createWelcomeField(topic?: string): FormField {
    // Select appropriate image based on topic
    const getImageUrl = () => {
      const topicLower = (topic || '').toLowerCase()
      if (
        topicLower.includes('job') ||
        topicLower.includes('application') ||
        topicLower.includes('career')
      ) {
        return 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=2000'
      }
      if (topicLower.includes('contact') || topicLower.includes('reach')) {
        return 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=2000'
      }
      if (topicLower.includes('survey') || topicLower.includes('feedback')) {
        return 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=2000'
      }
      // Default professional image
      return 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=2000'
    }

    return {
      id: nanoid(12),
      kind: FieldKindEnum.WELCOME,
      title: topic ? [`Welcome to ${topic}`] : ['Welcome'],
      description: ["We're excited to have you here!"],
      layout: {
        mediaType: 'image',
        mediaUrl: getImageUrl(),
        align: FieldLayoutAlignEnum.SPLIT_RIGHT,
        brightness: 0
      }
    }
  }

  private createThankYouField(): FormField {
    return {
      id: nanoid(12),
      kind: FieldKindEnum.THANK_YOU,
      title: ['Thank you!'],
      description: ['Thanks for completing this form.']
    }
  }

  /**
   * Selects an appropriate theme from available templates based on form topic
   */
  private selectThemeForTopic(topic?: string): ThemeSettings {
    if (!topic) {
      // Default professional theme (theme index 0)
      return {
        theme: {
          fontFamily: 'Public Sans',
          questionTextColor: '#000',
          answerTextColor: '#0445AF',
          buttonBackground: '#0445AF',
          buttonTextColor: '#fff',
          backgroundColor: '#fff',
          backgroundImage: undefined,
          backgroundBrightness: 0
        }
      }
    }

    const topicLower = topic.toLowerCase()

    // Job application / Career forms - Professional blue theme
    if (
      topicLower.includes('job') ||
      topicLower.includes('application') ||
      topicLower.includes('career') ||
      topicLower.includes('resume') ||
      topicLower.includes('hire') ||
      topicLower.includes('position')
    ) {
      return {
        theme: {
          fontFamily: 'Public Sans',
          questionTextColor: '#000',
          answerTextColor: '#0445AF',
          buttonBackground: '#0445AF',
          buttonTextColor: '#fff',
          backgroundColor: '#fff',
          backgroundImage: undefined,
          backgroundBrightness: 0
        }
      }
    }

    // Contact / Support forms - Teal theme
    if (
      topicLower.includes('contact') ||
      topicLower.includes('support') ||
      topicLower.includes('reach') ||
      topicLower.includes('inquiry')
    ) {
      return {
        theme: {
          fontFamily: 'Public Sans',
          questionTextColor: '#3D3D3D',
          answerTextColor: '#4FB0AE',
          buttonBackground: '#4FB0AE',
          buttonTextColor: '#fff',
          backgroundColor: '#fff',
          backgroundImage: undefined,
          backgroundBrightness: 0
        }
      }
    }

    // Survey / Feedback forms - Warm theme with background
    if (
      topicLower.includes('survey') ||
      topicLower.includes('feedback') ||
      topicLower.includes('review') ||
      topicLower.includes('rating')
    ) {
      return {
        theme: {
          fontFamily: 'Public Sans',
          questionTextColor: '#262627',
          answerTextColor: '#262627',
          buttonBackground: '#262627',
          buttonTextColor: '#E5E5E6',
          backgroundColor: '#ecddc2',
          backgroundImage: 'https://forms.b-cdn.net/themev3/theme-background-01.png',
          backgroundBrightness: 0
        }
      }
    }

    // Event / Registration forms - Vibrant theme
    if (
      topicLower.includes('event') ||
      topicLower.includes('register') ||
      topicLower.includes('signup') ||
      topicLower.includes('rsvp')
    ) {
      return {
        theme: {
          fontFamily: 'Public Sans',
          questionTextColor: '#262627',
          answerTextColor: '#262627',
          buttonBackground: '#262627',
          buttonTextColor: '#E5E5E6',
          backgroundColor: '#FBC4AD',
          backgroundImage: 'https://forms.b-cdn.net/themev3/theme-background-02.png',
          backgroundBrightness: 0
        }
      }
    }

    // Health / Wellness forms - Calming green theme
    if (
      topicLower.includes('health') ||
      topicLower.includes('wellness') ||
      topicLower.includes('medical') ||
      topicLower.includes('appointment')
    ) {
      return {
        theme: {
          fontFamily: 'Public Sans',
          questionTextColor: '#262627',
          answerTextColor: '#262627',
          buttonBackground: '#262627',
          buttonTextColor: '#E5E5E6',
          backgroundColor: '#b1cbc0',
          backgroundImage: 'https://forms.b-cdn.net/themev3/theme-background-03.png',
          backgroundBrightness: 0
        }
      }
    }

    // Education / Learning forms - Warm orange theme
    if (
      topicLower.includes('education') ||
      topicLower.includes('course') ||
      topicLower.includes('learn') ||
      topicLower.includes('student') ||
      topicLower.includes('training')
    ) {
      return {
        theme: {
          fontFamily: 'Karla',
          questionTextColor: '#9f5318',
          answerTextColor: '#cb732b',
          buttonBackground: '#cb732b',
          buttonTextColor: '#fff',
          backgroundColor: '#fff',
          backgroundImage: undefined,
          backgroundBrightness: 0
        }
      }
    }

    // Default: Professional blue theme (most versatile)
    return {
      theme: {
        fontFamily: 'Public Sans',
        questionTextColor: '#000',
        answerTextColor: '#0445AF',
        buttonBackground: '#0445AF',
        buttonTextColor: '#fff',
        backgroundColor: '#fff',
        backgroundImage: undefined,
        backgroundBrightness: 0
      }
    }
  }
}
