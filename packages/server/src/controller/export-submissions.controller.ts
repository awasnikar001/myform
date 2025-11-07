import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common'
import { Response } from 'express'

import { Auth, FormGuard } from '@decorator'
import { ExportSubmissionsDto } from '@dto'
import { flattenFields } from '@heyform-inc/answer-utils'
import { date } from '@heyform-inc/utils'
import { ExportSubmissionFormatEnum } from '@model'
import { ExportFileService, FormService, SubmissionService } from '@service'

@Controller()
@Auth()
export class ExportSubmissionsController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly formService: FormService,
    private readonly exportFileService: ExportFileService
  ) {}

  @Get('/api/export/submissions')
  @FormGuard()
  async exportSubmissions(
    @Query() input: ExportSubmissionsDto,
    @Res() res: Response
  ): Promise<void> {
    const form = await this.formService.findById(input.formId)
    if (!form) {
      throw new BadRequestException('The form does not exist')
    }

    const submissions = await this.submissionService.findAllByForm(input.formId)
    if (submissions.length < 1) {
      throw new BadRequestException('The submissions does not exist')
    }

    const format = input.format || ExportSubmissionFormatEnum.CSV
    const dateStr = date().format('YYYY-MM-DD')
    const formFields = flattenFields(form.fields)
    const filename = `${encodeURIComponent(form.name)}-${dateStr}.${format}`

    if (format === ExportSubmissionFormatEnum.PDF) {
      const pdfBuffer = await this.exportFileService.pdf(
        formFields,
        form.hiddenFields,
        submissions,
        form.name
      )

      res.header('Content-Type', 'application/pdf')
      res.header('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(pdfBuffer)
    } else {
      const data = await this.exportFileService.csv(formFields, form.hiddenFields, submissions)

      res.header('Content-Type', 'text/csv')
      res.header('Content-Disposition', `attachment; filename="${filename}"`)
      res.send(data)
    }
  }
}
