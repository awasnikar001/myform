import {
  Answer,
  FieldKindEnum,
  FormField,
  HiddenField,
  STATEMENT_FIELD_KINDS
} from '@heyform-inc/shared-types-enums'
import { Injectable } from '@nestjs/common'
import { parseAsync } from 'json2csv'

import { htmlUtils, parsePlainAnswer } from '@heyform-inc/answer-utils'
import { helper, unixDate } from '@heyform-inc/utils'
import { SubmissionModel } from '@model'

const FIELD_ID_KEY = '#'
const START_DATE_KEY = 'Start Date (UTC)'
const SUBMIT_DATE_KEY = 'Submit Date (UTC)'

@Injectable()
export class ExportFileService {
  async csv(
    formFields: FormField[],
    selectedHiddenFields: HiddenField[],
    submissions: SubmissionModel[]
  ): Promise<string> {
    const records: Record<string, any>[] = []
    const selectedFormFields = formFields
      .filter(field => !STATEMENT_FIELD_KINDS.includes(field.kind))
      .map(field => ({
        ...field,
        title: helper.isArray(field.title) ? htmlUtils.serialize(field.title) : field.title
      }))

    const fields: string[] = [
      FIELD_ID_KEY,
      ...selectedFormFields.map(field => field.title),
      ...selectedHiddenFields.map(hiddenField => hiddenField.name),
      START_DATE_KEY,
      SUBMIT_DATE_KEY
    ]

    for (const submission of submissions) {
      const record: Record<string, any> = {
        [FIELD_ID_KEY]: submission.id
      }

      for (const field of selectedFormFields) {
        let answer: any = submission.answers.find(answer => answer.id === field.id)

        if (helper.isEmpty(answer)) {
          answer = ''
        } else {
          answer = this.parseAnswer(answer)
        }

        record[field.title] = answer
      }

      for (const selectedHiddenField of selectedHiddenFields) {
        const hiddenFieldValue = submission.hiddenFields.find(
          hiddenField => hiddenField.id === selectedHiddenField.id
        )?.value

        record[selectedHiddenField.name] = hiddenFieldValue
      }

      record[START_DATE_KEY] = submission.startAt ? unixDate(submission.startAt!).toISOString() : ''
      record[SUBMIT_DATE_KEY] = submission.startAt ? unixDate(submission.endAt!).toISOString() : ''

      records.push(record)
    }

    return parseAsync(records, {
      fields
    })
  }

  async pdf(
    formFields: FormField[],
    selectedHiddenFields: HiddenField[],
    submissions: SubmissionModel[],
    formName: string
  ): Promise<Buffer> {
    // Dynamic require for PDFKit to handle CommonJS module correctly
    const PDFDocument = require('pdfkit')

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        info: {
          Title: formName,
          Author: 'HeyForm',
          Subject: 'Form Submissions Export'
        }
      })
      const buffers: Buffer[] = []

      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // Colors
      const primaryColor = '#4F46E5' // Indigo
      const textColor = '#1F2937' // Dark gray
      const lightGray = '#F3F4F6'
      const borderColor = '#E5E7EB'

      const selectedFormFields = formFields
        .filter(field => !STATEMENT_FIELD_KINDS.includes(field.kind))
        .map(field => ({
          ...field,
          title: helper.isArray(field.title) ? htmlUtils.serialize(field.title) : field.title
        }))

      // Helper function to format dates
      const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp * 1000) // Convert Unix timestamp to milliseconds
        const months = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ]
        const month = months[date.getMonth()]
        const day = date.getDate()
        const year = date.getFullYear()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        const displayMinutes = minutes.toString().padStart(2, '0')
        return `${month} ${day}, ${year} at ${displayHours}:${displayMinutes} ${ampm}`
      }

      // Generate PDF for each submission
      submissions.forEach((submission, index) => {
        if (index > 0) {
          doc.addPage()
        }

        // Header with colored background
        doc.rect(0, 0, doc.page.width, 80).fill(primaryColor)

        doc
          .fillColor('#FFFFFF')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text(formName, 50, 25, {
            width: doc.page.width - 100,
            align: 'center'
          })

        doc
          .fontSize(12)
          .font('Helvetica')
          .text(`Submission #${index + 1} of ${submissions.length}`, 50, 55, {
            width: doc.page.width - 100,
            align: 'center'
          })

        doc.fillColor(textColor)
        let yPosition = 100

        // Form fields with better formatting
        selectedFormFields.forEach(field => {
          const answer = submission.answers.find(a => a.id === field.id)
          const answerText = answer ? this.parseAnswer(answer) : 'N/A'
          const isUrl = answerText.startsWith('http://') || answerText.startsWith('https://')

          // Check if we need a new page
          if (yPosition > doc.page.height - 100) {
            doc.addPage()
            yPosition = 50
          }

          // Field container background
          doc
            .rect(50, yPosition - 5, doc.page.width - 100, 40)
            .fill(lightGray)
            .stroke(borderColor)

          // Field label
          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('#6B7280')
            .text(field.title, 60, yPosition, {
              width: doc.page.width - 120
            })

          // Field value
          doc.fontSize(12).font('Helvetica').fillColor(textColor)

          if (isUrl) {
            // Make URLs clickable and blue
            doc.fillColor(primaryColor).text(answerText, 60, yPosition + 15, {
              width: doc.page.width - 120,
              link: answerText,
              underline: true
            })
            doc.fillColor(textColor)
          } else {
            doc.text(answerText, 60, yPosition + 15, {
              width: doc.page.width - 120
            })
          }

          yPosition += 50
        })

        // Hidden fields section
        if (selectedHiddenFields.length > 0) {
          if (yPosition > doc.page.height - 100) {
            doc.addPage()
            yPosition = 50
          }

          doc.moveDown()
          yPosition += 20

          doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .fillColor(textColor)
            .text('Additional Information', 50, yPosition)

          yPosition += 25

          selectedHiddenFields.forEach(hiddenField => {
            const value =
              submission.hiddenFields?.find(hf => hf.id === hiddenField.id)?.value || 'N/A'

            if (yPosition > doc.page.height - 100) {
              doc.addPage()
              yPosition = 50
            }

            doc
              .rect(50, yPosition - 5, doc.page.width - 100, 40)
              .fill(lightGray)
              .stroke(borderColor)

            doc
              .fontSize(11)
              .font('Helvetica-Bold')
              .fillColor('#6B7280')
              .text(hiddenField.name, 60, yPosition, {
                width: doc.page.width - 120
              })

            doc
              .fontSize(12)
              .font('Helvetica')
              .fillColor(textColor)
              .text(String(value), 60, yPosition + 15, {
                width: doc.page.width - 120
              })

            yPosition += 50
          })
        }

        // Footer with submission metadata
        if (yPosition > doc.page.height - 80) {
          doc.addPage()
          yPosition = 50
        }

        doc.moveDown()
        yPosition += 20

        doc.fontSize(10).font('Helvetica').fillColor('#9CA3AF')

        if (submission.startAt) {
          doc.text(`Started: ${formatDate(submission.startAt)}`, 50, yPosition)
          yPosition += 15
        }

        if (submission.endAt) {
          doc.text(`Submitted: ${formatDate(submission.endAt)}`, 50, yPosition)
          yPosition += 15
        }

        // Submission ID
        doc.text(`Submission ID: ${submission.id}`, 50, yPosition)
      })

      // Add page numbers to footer
      const pageCount = doc.bufferedPageRange().count
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i)
        doc
          .fontSize(9)
          .fillColor('#9CA3AF')
          .text(`Page ${i + 1} of ${pageCount}`, doc.page.width - 100, doc.page.height - 30, {
            align: 'right'
          })
      }

      doc.end()
    })
  }

  private parseAnswer(answer: Answer): string {
    const value = answer.value
    let result = ''

    if (helper.isEmpty(value)) {
      return result
    }

    switch (answer?.kind) {
      case FieldKindEnum.FILE_UPLOAD:
        result = helper.isObject(value) ? value.url : helper.isString(value) ? value : ''
        break

      default:
        result = parsePlainAnswer(answer)
        break
    }

    return result
  }
}
