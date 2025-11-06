import {
  Answer,
  CaptchaKindEnum,
  FieldKindEnum,
  SubmissionCategoryEnum,
  SubmissionStatusEnum,
  Variable
} from '@heyform-inc/shared-types-enums'
import { BadRequestException, UseGuards } from '@nestjs/common'

import { CompleteSubmissionInput, CompleteSubmissionType } from '@graphql'
import { EndpointAnonymousIdGuard } from '@guard'
import { applyLogicToFields, fieldValuesToAnswers, flattenFields } from '@heyform-inc/answer-utils'
import { helper, timestamp } from '@heyform-inc/utils'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import {
  EndpointService,
  FormReportService,
  FormService,
  IntegrationService,
  PaymentService,
  SubmissionIpLimitService,
  SubmissionService
} from '@service'
import { ClientInfo, GqlClient, Logger } from '@utils'

@Resolver()
@UseGuards(EndpointAnonymousIdGuard)
export class CompleteSubmissionResolver {
  private readonly logger = new Logger('CompleteSubmission')

  constructor(
    private readonly endpointService: EndpointService,
    private readonly formService: FormService,
    private readonly submissionService: SubmissionService,
    private readonly submissionIpLimitService: SubmissionIpLimitService,
    private readonly formReportService: FormReportService,
    private readonly integrationService: IntegrationService,
    private readonly paymentService: PaymentService
  ) {}

  @Mutation(returns => CompleteSubmissionType)
  async completeSubmission(
    @GqlClient() client: ClientInfo,
    @Args('input') input: CompleteSubmissionInput
  ): Promise<CompleteSubmissionType> {
    const logContext = {
      formId: input.formId,
      ip: client.ip,
      userAgent: client.userAgent?.browser?.name
    }

    this.logger.logWithContext('Form submission started', logContext)

    const form = await this.formService.findById(input.formId)

    if (!form) {
      this.logger.warnWithContext('Form submission failed: form not found', logContext)
      throw new BadRequestException('The form does not exist')
    }

    if (form.suspended) {
      this.logger.warnWithContext('Form submission failed: form suspended', {
        ...logContext,
        teamId: form.teamId
      })
      throw new BadRequestException('The form is suspended')
    }

    if (form.settings.active !== true) {
      this.logger.warnWithContext('Form submission failed: form not active', {
        ...logContext,
        teamId: form.teamId
      })
      throw new BadRequestException('The form does not active')
    }

    if (helper.isEmpty(form!.fields)) {
      this.logger.warnWithContext('Form submission failed: form has no content', {
        ...logContext,
        teamId: form.teamId
      })
      throw new BadRequestException('The form does not have content')
    }

    if (
      form.settings.enableQuotaLimit &&
      helper.isValid(form.settings.quotaLimit) &&
      form.settings.quotaLimit > 0
    ) {
      const count = await this.submissionService.countInForm(input.formId)

      if (count >= form.settings.quotaLimit) {
        this.logger.warnWithContext('Form submission failed: quota limit exceeded', {
          ...logContext,
          teamId: form.teamId,
          currentCount: count,
          quotaLimit: form.settings.quotaLimit
        })
        throw new BadRequestException(
          'The submission quota exceeds, new submissions are no longer accepted'
        )
      }
    }

    if (
      form.settings.enableIpLimit &&
      helper.isValid(form.settings.ipLimitCount) &&
      form.settings.ipLimitCount > 0
    ) {
      try {
        await this.submissionIpLimitService.checkIp(form, client.ip)
      } catch (error) {
        this.logger.warnWithContext('Form submission failed: IP limit exceeded', {
          ...logContext,
          teamId: form.teamId,
          ipLimitCount: form.settings.ipLimitCount
        })
        throw error
      }
    }

    // Check password
    if (form.settings.requirePassword) {
      try {
        const { password } = this.endpointService.decryptToken(input.passwordToken)

        if (password !== form.settings.password) {
          this.logger.warnWithContext('Form submission failed: password mismatch', {
            ...logContext,
            teamId: form.teamId
          })
          throw new BadRequestException('The password does not match')
        }
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error
        }
        this.logger.errorWithContext('Form submission failed: token decryption error', error, {
          ...logContext,
          teamId: form.teamId
        })
        throw new BadRequestException('Invalid password token')
      }
    }

    // Start submit time
    let startAt: number
    try {
      const decrypted = this.endpointService.decryptToken(input.openToken)
      startAt = decrypted.timestamp
    } catch (error) {
      this.logger.errorWithContext('Form submission failed: open token decryption error', error, {
        ...logContext,
        teamId: form.teamId
      })
      throw new BadRequestException('Invalid open token')
    }

    // Bot prevention check
    if (form.settings?.captchaKind !== CaptchaKindEnum.NONE) {
      try {
        await this.endpointService.antiBotCheck(form.settings?.captchaKind, input)
      } catch (error) {
        this.logger.warnWithContext('Form submission failed: bot check failed', {
          ...logContext,
          teamId: form.teamId,
          captchaKind: form.settings?.captchaKind
        })
        throw error
      }
    }

    // Verify user submit content
    let answers: Answer[] = []
    let variables: Variable[] = []

    try {
      const { fields, variables: variableValues } = applyLogicToFields(
        flattenFields(form.fields, true),
        form.logics,
        form.variables,
        input.answers
      )

      answers = fieldValuesToAnswers(fields, input.answers, input.partialSubmission)
      variables = form.variables?.map(variable => ({
        ...variable,
        value: variableValues[variable.id]
      }))
    } catch (err: any) {
      // Handle ValidateError (has response property) or regular Error
      const errorMessage = err?.response || err?.message || 'Validation failed'
      this.logger.errorWithContext('Form submission failed: validation error', err, {
        ...logContext,
        teamId: form.teamId,
        fieldId: err?.response?.id,
        fieldKind: err?.response?.kind
      })
      throw new BadRequestException(errorMessage)
    }

    let category = SubmissionCategoryEnum.INBOX
    let status = SubmissionStatusEnum.PUBLIC

    // Spam check
    if (form.settings?.filterSpam) {
      try {
        const isSpam = await this.endpointService.verifySpam({
          answers,
          ip: client.ip
        })

        if (isSpam) {
          category = SubmissionCategoryEnum.SPAM
          this.logger.logWithContext('Submission marked as spam', {
            ...logContext,
            teamId: form.teamId
          })
        }
      } catch (error) {
        this.logger.errorWithContext('Spam check failed', error, {
          ...logContext,
          teamId: form.teamId
        })
        // Continue with submission even if spam check fails
      }
    }

    // Notification and Webhook still need the submission data
    // even archive settings have been disabled
    if (!form.settings?.allowArchive) {
      status = SubmissionStatusEnum.PRIVATE
    }

    const endAt = timestamp()

    let submissionId: string
    try {
      submissionId = await this.submissionService.create({
        teamId: form.teamId,
        formId: form.id,
        category,
        title: form.name,
        answers,
        hiddenFields: input.hiddenFields,
        variables,
        startAt,
        endAt,
        ip: client.ip,
        userAgent: client.userAgent,
        status
      })

      this.logger.logWithContext('Submission created successfully', {
        ...logContext,
        submissionId,
        teamId: form.teamId,
        category,
        answerCount: answers.length,
        duration: endAt - startAt
      })
    } catch (error) {
      this.logger.errorWithContext('Form submission failed: database error', error, {
        ...logContext,
        teamId: form.teamId
      })
      throw error
    }

    // Payment
    const answer = answers.find(a => a.kind === FieldKindEnum.PAYMENT)
    const result: CompleteSubmissionType = {}

    if (helper.isValid(answer) && helper.isValid(form.stripeAccount)) {
      try {
        this.logger.logWithContext('Creating payment intent', {
          ...logContext,
          submissionId,
          amount: answer.value.amount,
          currency: answer.value.currency
        })

        result.clientSecret = await this.paymentService.createPaymentIntent({
          amount: answer.value.amount,
          currency: answer.value.currency,
          stripeAccountId: form.stripeAccount.accountId,
          metadata: {
            submissionId,
            fieldId: answer.id
          }
        })

        await this.submissionService.updateAnswer(submissionId, {
          ...answer,
          value: {
            ...answer.value,
            clientSecret: result.clientSecret
          }
        })

        this.logger.logWithContext('Payment intent created successfully', {
          ...logContext,
          submissionId,
          amount: answer.value.amount,
          currency: answer.value.currency
        })
      } catch (error) {
        this.logger.errorWithContext('Payment intent creation failed', error, {
          ...logContext,
          submissionId,
          amount: answer.value.amount,
          currency: answer.value.currency
        })
        // Don't throw - submission is already created
      }
    }

    // Form report Queue
    this.formReportService.addQueue(form.id)

    // Integration Queue
    this.integrationService.addQueue(form, submissionId)

    return result
  }
}
