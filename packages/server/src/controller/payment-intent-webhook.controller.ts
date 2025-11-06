import { BadRequestException, Controller, Headers, Post, Req } from '@nestjs/common'

import { STRIPE_WEBHOOK_SECRET_KEY } from '@environments'
import { helper } from '@heyform-inc/utils'
import { FormService, PaymentService, SubmissionService } from '@service'
import { Logger } from '@utils'

@Controller()
export class PaymentIntentWebhookController {
  private readonly logger = new Logger('PaymentWebhook')

  constructor(
    private readonly paymentService: PaymentService,
    private readonly submissionService: SubmissionService,
    private readonly formService: FormService
  ) {}

  @Post('/payment/intent/webhook')
  async webhook(@Headers('stripe-signature') signature: string, @Req() req: any) {
    try {
      const event = this.paymentService.constructEvent(
        req.body,
        signature,
        STRIPE_WEBHOOK_SECRET_KEY
      )
      const object: Record<string, any> = event.data.object

      this.logger.logWithContext('Payment webhook received', {
        eventType: event.type,
        paymentIntentId: object.id,
        amount: object.amount,
        currency: object.currency
      })

      if (event.type === 'payment_intent.succeeded') {
        await this._paymentIntentSucceeded(object)
        return 'success'
      }

      this.logger.logWithContext('Payment webhook processed (non-success event)', {
        eventType: event.type,
        paymentIntentId: object.id
      })

      return 'success'
    } catch (error) {
      this.logger.errorWithContext('Payment webhook processing failed', error, {
        hasSignature: !!signature
      })
      throw error
    }
  }

  private async _paymentIntentSucceeded(object: any) {
    const { id: paymentIntentId, client_secret: clientSecret, metadata } = object

    const logContext = {
      paymentIntentId,
      submissionId: metadata?.submissionId,
      fieldId: metadata?.fieldId
    }

    if (helper.isEmpty(metadata) || helper.isEmpty(metadata.submissionId)) {
      this.logger.errorWithContext(
        'Payment webhook failed: invalid metadata',
        new Error('Invalid payment metadata'),
        logContext
      )
      throw new BadRequestException('Invalid payment metadata')
    }

    const { submissionId, fieldId } = metadata

    try {
      const submission = await this.submissionService.findById(submissionId)

      if (helper.isEmpty(submission)) {
        this.logger.errorWithContext(
          'Payment webhook failed: submission not found',
          new Error('Submission not found'),
          logContext
        )
        throw new BadRequestException('Submission not found')
      }

      const answer = submission.answers.find(a => a.id === fieldId)

      if (helper.isEmpty(answer)) {
        this.logger.errorWithContext(
          'Payment webhook failed: field not found',
          new Error('Field not found'),
          {
            ...logContext,
            formId: submission.formId
          }
        )
        throw new BadRequestException('Field not found')
      }

      if (answer.value.clientSecret !== clientSecret) {
        this.logger.errorWithContext(
          'Payment webhook failed: invalid client secret',
          new Error('Invalid client data'),
          {
            ...logContext,
            formId: submission.formId
          }
        )
        throw new BadRequestException('Invalid client data')
      }

      const charge = object.charges.data[0]

      await this.submissionService.updateAnswer(submissionId, {
        ...answer,
        value: {
          ...answer.value,
          paymentIntentId,
          billingDetails: {
            name: charge.billing_details.name
          },
          receiptUrl: charge.receipt_url
        }
      })

      // Get form to retrieve teamId
      const form = await this.formService.findById(submission.formId)
      const teamId = form?.teamId

      this.logger.logWithContext('Payment processed successfully', {
        ...logContext,
        formId: submission.formId,
        teamId,
        amount: object.amount,
        currency: object.currency,
        receiptUrl: charge.receipt_url
      })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      this.logger.errorWithContext('Payment webhook processing error', error, logContext)
      throw error
    }
  }
}
