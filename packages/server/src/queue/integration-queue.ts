import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import { AppService, FormService, IntegrationService, SubmissionService } from '@service'
import { mapToObject } from '@utils'

import { BaseQueue } from './base.queue'

export interface IntegrationQueueJob {
  appId: string
  integrationId: string
  formId: string
  submissionId: string
}

@Processor('IntegrationQueue')
export class IntegrationQueue extends BaseQueue {
  constructor(
    private readonly appService: AppService,
    private readonly integrationService: IntegrationService,
    private readonly submissionService: SubmissionService,
    private readonly formService: FormService
  ) {
    super()
  }

  @Process()
  async process(job: Job<IntegrationQueueJob>) {
    const { appId, integrationId, formId, submissionId } = job.data
    const app = this.appService.findById(appId)

    if (app) {
      const [integration, submission, form] = await Promise.all([
        this.integrationService.findById(integrationId),
        this.submissionService.findById(submissionId),
        this.formService.findById(formId)
      ])

      if (integration && submission && form) {
        const config = mapToObject(integration.config)

        try {
          await app.run({
            submission,
            form,
            config
          })

          this.logger.logWithContext(`Integration ${appId} executed successfully`, {
            integrationId,
            formId,
            submissionId,
            appId
          })
        } catch (error) {
          this.logger.errorWithContext(`Integration ${appId} failed`, error, {
            integrationId,
            formId,
            submissionId,
            appId,
            endpointUrl: config?.endpointUrl
          })
          throw error // Re-throw to trigger Bull retry
        }
      }
    }
  }
}
