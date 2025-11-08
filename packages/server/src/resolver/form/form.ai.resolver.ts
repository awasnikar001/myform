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

      // Build comprehensive prompt that intelligently combines topic and reference
      const comprehensivePrompt = this.buildComprehensivePrompt(input.topic, input.reference)

      const systemPrompt = `You are an expert form designer creating production-ready Heyform schemas. You excel at interpreting natural language prompts and extracting ALL relevant details to create SPECIFIC, CONTEXTUAL, and COMPREHENSIVE forms - NOT generic templates or minimal forms.

CRITICAL REQUIREMENTS:
1. NEVER generate generic questions. Every question must be SPECIFIC to the prompt provided.
2. Extract and USE ALL details from the prompt: company names, positions, requirements, constraints, hours, locations, etc.
3. Make questions CONTEXTUAL - reference the specific role, company, or requirements mentioned.
4. If constraints are mentioned (e.g., "20 hours weekly"), reflect them in field descriptions, properties, or titles.
5. Personalize welcome screens and thank you messages with extracted details (company name, position, etc.).
6. **MOST IMPORTANT: Generate COMPREHENSIVE forms with ALL relevant fields** - Think about what information would typically be needed for this form type, not just what's explicitly mentioned.

COMPREHENSIVE FIELD INFERENCE - Your Core Responsibility:
When analyzing a prompt, you MUST:
1. **Identify the form type** from the prompt (job application, survey, event registration, contact form, feedback form, etc.)
2. **Think comprehensively** about what information would typically be needed for this form type
3. **Infer and include ALL relevant fields** that would make this form complete and useful
4. **Don't create minimal forms** - create forms that capture all necessary information

HOW TO INFER COMPREHENSIVE FIELDS:

Step 1: Identify Form Type
- Look for keywords: "job application", "survey", "event registration", "contact", "feedback", "application", "form", etc.
- Understand the purpose and context

Step 2: Think About What Information Is Needed
For ANY form type, ask yourself:
- What basic contact information is needed? (name, email, phone, location)
- What specific information relates to the form's purpose?
- What additional context would be helpful? (experience, preferences, constraints, etc.)
- What follow-up information might be needed? (availability, schedule, preferences, etc.)

Step 3: Generate Comprehensive Field Sets
Examples of comprehensive thinking:

**Job Application Forms:**
- Basic: name, email, phone, location
- Professional: years of experience, education level, skills/technologies
- Role-specific: availability, schedule preferences, portfolio/GitHub
- Motivation: "Why this position/company?" question
- Documents: resume, cover letter
- Contextualize EVERYTHING with company name and position

**Survey Forms:**
- Basic: name (optional), email (optional)
- Ratings: product quality, service quality, delivery time
- Satisfaction levels: multiple choice with scales
- Likelihood to recommend: number scale
- Open feedback: comments, suggestions
- Demographics: if relevant (age range, location, etc.)

**Event Registration Forms:**
- Basic: name, email, phone
- Event-specific: dietary restrictions, emergency contact
- Preferences: session preferences, accommodation needs
- Additional: special requests, accessibility needs

**Contact Forms:**
- Basic: name, email, phone
- Context: subject, company/organization
- Message: detailed message field
- Optional: preferred contact method, urgency

Step 4: Make Everything Specific and Contextual
- Extract company names, positions, requirements from the prompt
- Reference them in question titles and descriptions
- Make descriptions helpful and specific

YOUR TASK:
- Analyze the user's prompt CAREFULLY and extract EVERY piece of information:
  * Company/Organization names → Use in welcome screens, thank you messages, and question context
  * Position titles/Roles → Reference in questions and descriptions
  * Specific requirements (hours, location, skills, etc.) → Create fields or incorporate into existing fields
  * Constraints (e.g., "20 hours weekly") → Reflect in field descriptions, min/max values, or field titles
  * Options mentioned (e.g., "Remote, Hybrid, On-site") → Use EXACTLY as multiple choice options

- **INFER THE FORM TYPE** and think comprehensively about what fields are needed
- **Generate COMPLETE forms** with all relevant fields, not minimal ones
- Generate SPECIFIC, CONTEXTUAL questions - NOT generic templates
- Make every question relevant to the specific prompt provided
- Use extracted details to personalize field titles, descriptions, and properties

COMPREHENSIVENESS EXAMPLES:

Example 1: Job Application
Prompt: "Create a job application form for MYFORM company for the position of full stack developer intern with 20 hours of work weekly."

Comprehensive thinking:
- It's a job application → Need: name, email, phone, location, experience, education, skills, availability, schedule, portfolio, motivation, cover letter, resume
- Company: MYFORM → Use in welcome, thank you, and questions
- Position: Full Stack Developer Intern → Reference in questions
- Hours: 20 hours/week → Create availability confirmation field, reflect in descriptions
- Technical role → Include programming languages/skills field

Result: 12-15 comprehensive fields, all contextualized

Example 2: Survey
Prompt: "Customer satisfaction survey to evaluate product quality and customer service."

Comprehensive thinking:
- It's a survey → Need: ratings for product quality, service quality, delivery time, overall satisfaction, likelihood to recommend, open feedback
- Optional: name, email for follow-up
- Include rating scales and multiple choice options

Result: 6-8 comprehensive fields covering all aspects

Example 3: Event Registration
Prompt: "Give me an event registration form to collect attendee information."

Comprehensive thinking:
- It's an event registration → Need: name, email, phone, dietary restrictions, emergency contact, special accommodations, session preferences
- Include multiple choice for dietary restrictions
- Include emergency contact fields

Result: 8-10 comprehensive fields

EXAMPLES OF GOOD vs BAD:

BAD (Generic):
- "What's your name?" 
- "Email Address"
- "How many hours per week are you available?"

GOOD (Specific & Contextual):
- "What's your name?" (OK - this is standard)
- "What email should MYFORM use to contact you about the Full Stack Developer Intern position?"
- "This Full Stack Developer Intern position requires 20 hours per week. How many hours per week are you available to work?"
- "Tell us about your experience with full stack development and why you're interested in joining MYFORM as an intern."

Respond ONLY with valid JSON matching this interface: {"fields": FormField[]}

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
3. IMPORTANT: Add relevant Pexels images to AT LEAST 3-4 key fields (not just welcome)
4. Use appropriate field types: phone_number (not number), full_name (not short_text for names)
5. Set required: true for critical fields (email, name, etc.)
6. CRITICAL: Make questions SPECIFIC and CONTEXTUAL:
   - Reference company names, positions, and requirements in question titles and descriptions
   - If "20 hours weekly" is mentioned, include it in the field description or title
   - If a specific position is mentioned, reference it in relevant questions
   - Make descriptions helpful and specific to the context
7. Extract and use ALL specific details from the prompt:
   - Company names → Use in welcome screens, thank you messages, and question context
   - Position titles → Reference in questions (e.g., "Tell us why you're interested in the Full Stack Developer Intern position at MYFORM")
   - Hours/constraints → Reflect in field descriptions (e.g., "This position requires 20 hours per week")
   - Specific options → Use exactly as provided in multiple choice fields
8. **CRITICAL: Generate COMPREHENSIVE forms** - Include all fields that would typically be needed for the form type, not just the minimum
9. Form length: Generate 8-15 fields for comprehensive forms (more is better than less if relevant)
10. Make forms visually appealing by adding layouts to multiple fields

PEXELS IMAGE SUGGESTIONS (use high-quality, relevant images):
- Welcome/Intro: Use Pexels API to search for "teamwork collaboration"
- Job Application/Work: Use Pexels API to search for "modern workspace office"
- Contact/Communication: Use Pexels API to search for "business communication"
- Survey/Analytics: Use Pexels API to search for "data analytics charts"
- Resume/Document: Use Pexels API to search for "resume document professional"
- About Me/Personal: Use Pexels API to search for "professional portrait business"
- Skills/Experience: Use Pexels API to search for "team collaboration meeting"
- General Business: Use Pexels API to search for "business professional"

EXAMPLE PROMPT ANALYSIS:
User prompt: "Create a job application form for MYFORM company for the position of full stack developer intern with 20 hours of work weekly."

You MUST extract and use:
- Company: MYFORM (use in welcome, thank you, and question context)
- Position: Full Stack Developer Intern (reference in questions)
- Work hours: 20 hours/week (reflect in field description/title)

CRITICAL: Make questions SPECIFIC, not generic:
- Instead of "Email Address" → "What email should MYFORM use to contact you about the Full Stack Developer Intern position?"
- Instead of "How many hours per week are you available?" → "This Full Stack Developer Intern position requires 20 hours per week. How many hours per week are you available to work?"
- Instead of "Tell us about yourself" → "Tell us about your experience with full stack development and why you're interested in joining MYFORM as a Full Stack Developer Intern."

REMEMBER: Your goal is to create COMPREHENSIVE, COMPLETE forms that capture all necessary information for the given form type, making every question specific and contextual to the prompt provided.

EXAMPLE OUTPUT:
{
  "fields": [
    {
      "kind": "welcome",
      "title": ["Welcome to MYFORM"],
      "description": ["We're excited you're interested in the Full Stack Developer Intern position!"],
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
      "title": ["What email should MYFORM use to contact you?"],
      "description": ["We'll use this to reach out about the Full Stack Developer Intern position"],
      "validations": {"required": true}
    },
    {
      "kind": "phone_number",
      "title": ["Phone Number"],
      "description": ["Best number to reach you regarding the Full Stack Developer Intern position"],
      "validations": {"required": true}
    },
    {
      "kind": "number",
      "title": ["How many hours per week are you available?"],
      "description": ["This Full Stack Developer Intern position requires 20 hours per week"],
      "validations": {"required": true},
      "properties": {"min": 0, "max": 40}
    },
    {
      "kind": "long_text",
      "title": ["Tell us about your full stack development experience"],
      "description": ["Share your background in full stack development and why you're interested in joining MYFORM as a Full Stack Developer Intern"],
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
      "description": ["Please upload your resume for the Full Stack Developer Intern position (PDF, DOC, or DOCX)"],
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
      "description": ["We've received your application for the Full Stack Developer Intern position at MYFORM and will be in touch soon."]
    }
  ]
}`

      const response = await openai.chat.completions.create({
        model: OPENAI_GPT_MODEL,
        response_format: {
          type: 'json_object'
        },
        temperature: 0.3, // Lower temperature for more consistent, specific outputs
        max_tokens: 4000, // Increased for comprehensive forms with detailed prompts
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: comprehensivePrompt
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

  /**
   * Builds a comprehensive prompt by intelligently combining topic and reference
   * If reference is provided, it's treated as additional context/specifications
   * If only topic is provided, it should contain all the information needed
   */
  private buildComprehensivePrompt(topic: string, reference?: string | null): string {
    if (helper.isValid(reference)) {
      // If reference is provided, combine it intelligently
      // The topic provides the main goal, reference provides specific details
      return `Create a form with the following requirements. CRITICAL: Extract and use ALL details from both the main topic and additional specifications. Make questions SPECIFIC and CONTEXTUAL - NOT generic.

Main Topic: ${topic}

Additional Specifications and Requirements:
${reference}

IMPORTANT INSTRUCTIONS:
- Extract company names, positions, requirements, constraints, and ALL specific details
- Create SPECIFIC, CONTEXTUAL questions that reference the extracted details
- Use company names and positions in question titles and descriptions where relevant
- Reflect constraints (like hours, locations) in field descriptions or properties
- Make every question relevant to the specific context provided
- Do NOT generate generic questions - personalize everything based on the details provided

Please analyze both the main topic and the additional specifications to create a comprehensive form that addresses all requirements. Extract specific questions, field types, options, and constraints from both parts.`
    } else {
      // If only topic is provided, treat it as a comprehensive prompt
      return `Create a comprehensive, complete, and professional form based on this detailed description. 

CRITICAL INSTRUCTIONS:
1. **Identify the form type** from this prompt (job application, survey, event registration, contact form, etc.)
2. **Think comprehensively** about what information would typically be needed for this form type
3. **Generate ALL relevant fields** that would make this form complete - don't create a minimal form
4. **Extract and use ALL details** from the prompt:
   * Company/Organization names → Use in welcome screens, thank you messages, and question context
   * Position titles/Roles → Reference in questions and descriptions  
   * Specific requirements (hours, location, skills, etc.) → Create fields or incorporate into existing fields
   * Constraints (e.g., "20 hours weekly") → Reflect in field descriptions, min/max values, or field titles
   * Options mentioned (e.g., "Remote, Hybrid, On-site") → Use EXACTLY as multiple choice options

5. **Make every question SPECIFIC and CONTEXTUAL** - Reference extracted details in question titles and descriptions
6. **Generate a COMPLETE form** with 8-15 fields that covers all aspects typically needed for this form type

${topic}

Generate a comprehensive, professional form that:
- Includes all fields typically needed for this form type
- Makes every question specific and contextual to the details provided
- Captures all necessary information to make the form useful and complete
- Personalizes field descriptions and titles based on extracted details`
    }
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
