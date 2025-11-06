import { BadRequestException, Injectable } from '@nestjs/common'
import Stripe from 'stripe'

import { STRIPE_CONNECT_CLIENT_ID, STRIPE_SECRET_KEY, STRIPE_VERSION } from '@environments'
import { Logger } from '@utils'

interface PaymentIntentOptions {
  amount: number
  currency: string
  stripeAccountId: string
  metadata?: Record<string, string>
}

@Injectable()
export class PaymentService {
  private readonly stripe!: Stripe
  private readonly logger = new Logger('PaymentService')

  constructor() {
    this.stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_VERSION as any,
      maxNetworkRetries: 2
    })
  }

  getAuthorizeUrl(state: string, email: string): string {
    return this.stripe.oauth.authorizeUrl({
      client_id: STRIPE_CONNECT_CLIENT_ID,
      response_type: 'code',
      scope: 'read_write',
      state,
      stripe_user: {
        email
      }
    })
  }

  async getConnectAccount(code: string) {
    try {
      const result = await this.stripe.oauth.token({
        grant_type: 'authorization_code',
        code
      })

      const accountId = result.stripe_user_id
      const account = await this.stripe.accounts.retrieve(accountId)

      if (!account.charges_enabled || !account.details_submitted) {
        this.logger.warnWithContext('Stripe account not fully configured', {
          accountId,
          chargesEnabled: account.charges_enabled,
          detailsSubmitted: account.details_submitted
        })
        throw new BadRequestException('Something went wrong, please try again.')
      }

      this.logger.logWithContext('Stripe account connected successfully', {
        accountId,
        email: account.email
      })

      return {
        accountId,
        email: account.email || account.settings?.dashboard?.display_name || accountId
      }
    } catch (error) {
      this.logger.errorWithContext('Stripe account connection failed', error, {
        hasCode: !!code
      })
      throw error
    }
  }

  async createPaymentIntent(options: PaymentIntentOptions): Promise<string> {
    try {
      this.logger.logWithContext('Creating payment intent', {
        amount: options.amount,
        currency: options.currency,
        stripeAccountId: options.stripeAccountId,
        submissionId: options.metadata?.submissionId
      })

      const result = await this.stripe.paymentIntents.create(
        {
          amount: options.amount,
          currency: options.currency,
          metadata: options.metadata
        },
        {
          stripeAccount: options.stripeAccountId
        }
      )

      this.logger.logWithContext('Payment intent created successfully', {
        paymentIntentId: result.id,
        amount: options.amount,
        currency: options.currency,
        submissionId: options.metadata?.submissionId
      })

      return result.client_secret
    } catch (error) {
      this.logger.errorWithContext('Payment intent creation failed', error, {
        amount: options.amount,
        currency: options.currency,
        stripeAccountId: options.stripeAccountId
      })
      throw error
    }
  }

  constructEvent(payload: Buffer, signature: string, secret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret)
  }
}
