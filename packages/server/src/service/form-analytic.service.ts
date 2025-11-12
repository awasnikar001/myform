import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { SubmissionService } from './submission.service'
import { date, helper } from '@heyform-inc/utils'
import { FormAnalyticModel } from '@model'

interface FormAnalyticOptions {
  formId: string
  startAt: Date
  endAt: Date
  isNext?: boolean
}

interface FormAnalyticResult {
  avgTotalVisits: number
  avgSubmissionCount: number
  avgAverageTime: number
}

@Injectable()
export class FormAnalyticService {
  constructor(
    @InjectModel(FormAnalyticModel.name)
    private readonly formAnalyticModel: Model<FormAnalyticModel>,
    private readonly submissionService: SubmissionService
  ) {}

  public async summary({ formId, startAt, endAt, isNext }: FormAnalyticOptions) {
    const [avgTotalVisits, result] = await Promise.all([
      this.getAverageTotalVisits(formId, startAt, endAt),
      this.submissionService.analytic(
        formId,
        Math.floor(startAt.getTime() / 1000),
        Math.floor(endAt.getTime() / 1000)
      )
    ])

    const analytic = {
      avgTotalVisits: 0,
      avgSubmissionCount: 0,
      avgAverageTime: 0
    }

    if (avgTotalVisits > 0) {
      analytic.avgTotalVisits = avgTotalVisits

      if (helper.isValidArray(result)) {
        analytic.avgSubmissionCount = result[0].avgSubmissionCount
        analytic.avgAverageTime = result[0].avgAverageTime
      }

      return analytic
    } else if (isNext) {
      return analytic
    } else {
      return {} as FormAnalyticResult
    }
  }

  public async getAverageTotalVisits(formId: string, startAt: Date, endAt: Date): Promise<number> {
    const result = await this.formAnalyticModel.aggregate([
      {
        $match: {
          formId,
          createdAt: {
            $gte: startAt,
            $lte: endAt
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTotalVisits: { $avg: '$totalVisits' }
        }
      }
    ])

    return result[0]?.avgTotalVisits || 0
  }

  public async updateTotalVisits(formId: string): Promise<void> {
    const formAnalytic = await this.findFormAnalyticInToday(formId)

    if (formAnalytic) {
      await this.formAnalyticModel.updateOne(
        {
          _id: formAnalytic.id
        },
        {
          $inc: {
            totalVisits: 1
          }
        }
      )
    } else {
      await this.formAnalyticModel.create({
        formId,
        totalVisits: 1
      } as any)
    }
  }

  private async findFormAnalyticInToday(formId: string): Promise<FormAnalyticModel> {
    const today = date()

    return this.formAnalyticModel.findOne({
      formId,
      createdAt: {
        $gte: today.startOf('day'),
        $lte: today.endOf('day')
      }
    })
  }

  public async getTimeSeriesData(
    formId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: string; views: number; submissions: number }>> {
    const startTimestamp = Math.floor(startDate.getTime() / 1000)
    const endTimestamp = Math.floor(endDate.getTime() / 1000)

    // Normalize dates to start/end of day
    // Convert Unix timestamp to Date, then normalize to UTC start/end of day
    // This matches how MongoDB stores dates (UTC) and how aggregation groups by UTC date
    const startDateUTC = new Date(startDate)
    const endDateUTC = new Date(endDate)

    // Normalize to UTC start of day (00:00:00 UTC)
    const startOfDay = new Date(
      Date.UTC(
        startDateUTC.getUTCFullYear(),
        startDateUTC.getUTCMonth(),
        startDateUTC.getUTCDate(),
        0,
        0,
        0,
        0
      )
    )

    // Normalize to UTC end of day (23:59:59.999 UTC)
    const endOfDay = new Date(
      Date.UTC(
        endDateUTC.getUTCFullYear(),
        endDateUTC.getUTCMonth(),
        endDateUTC.getUTCDate(),
        23,
        59,
        59,
        999
      )
    )

    // Debug: Log date range being queried
    console.log(`[TimeSeries] Querying date range for formId ${formId}:`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
      startTimestamp,
      endTimestamp
    })

    // Debug: Query ALL records for this formId to see actual dates
    const allRecords = await this.formAnalyticModel
      .find({ formId })
      .sort({ createdAt: 1 })
      .limit(50)
    console.log(
      `[TimeSeries] Found ${allRecords.length} total formAnalytic records for formId ${formId}`
    )
    if (allRecords.length > 0) {
      const allRecordsWithDates = allRecords.map(r => {
        const record = r.toObject() as any
        const createdAtDate = record.createdAt ? new Date(record.createdAt) : null
        return {
          id: r.id,
          totalVisits: r.totalVisits,
          createdAtISO: createdAtDate ? createdAtDate.toISOString() : null,
          createdAtDateStr: createdAtDate ? createdAtDate.toISOString().split('T')[0] : null,
          createdAtUTC: createdAtDate
            ? {
                year: createdAtDate.getUTCFullYear(),
                month: createdAtDate.getUTCMonth(),
                date: createdAtDate.getUTCDate()
              }
            : null
        }
      })
      console.log(
        `[TimeSeries] All records with dates:`,
        JSON.stringify(allRecordsWithDates, null, 2)
      )

      // Check if records fall within the queried date range
      const startDateStr = startOfDay.toISOString().split('T')[0]
      const endDateStr = endOfDay.toISOString().split('T')[0]
      const recordsInRange = allRecordsWithDates.filter(
        r =>
          r.createdAtDateStr &&
          r.createdAtDateStr >= startDateStr &&
          r.createdAtDateStr <= endDateStr
      )
      console.log(
        `[TimeSeries] Records in date range [${startDateStr} to ${endDateStr}]:`,
        recordsInRange.length
      )
      console.log(`[TimeSeries] Records in range details:`, JSON.stringify(recordsInRange, null, 2))
    }

    // Get views grouped by date
    // Match the approach used in getAverageTotalVisits - filter by createdAt Date objects directly
    // Then group by date string in UTC for consistent date grouping
    const viewsData = await this.formAnalyticModel.aggregate([
      {
        $match: {
          formId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'UTC'
            }
          },
          views: { $sum: '$totalVisits' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    console.log(`[TimeSeries] Views aggregation result:`, JSON.stringify(viewsData, null, 2))

    // Get submissions grouped by date
    const submissionsData = await this.submissionService.getSubmissionsByDate(
      formId,
      startTimestamp,
      endTimestamp
    )

    console.log(
      `[TimeSeries] Submissions aggregation result:`,
      JSON.stringify(submissionsData, null, 2)
    )

    // Create a map of dates to combine the data
    const dateMap = new Map<string, { views: number; submissions: number }>()

    // Initialize all dates in range with 0
    // Iterate through dates in UTC to match aggregation timezone
    const currentDate = new Date(startOfDay)
    const endDateForLoop = new Date(endOfDay)
    while (currentDate <= endDateForLoop) {
      // Format date as YYYY-MM-DD in UTC (matching aggregation output)
      const year = currentDate.getUTCFullYear()
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getUTCDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      dateMap.set(dateStr, { views: 0, submissions: 0 })
      // Add 1 day in UTC
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    // Fill in views data
    viewsData.forEach(item => {
      const dateStr = item._id
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.views = item.views
      }
    })

    // Fill in submissions data
    submissionsData.forEach(item => {
      const dateStr = item.date
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.submissions = item.count
      }
    })

    // Convert map to array
    const result = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        views: data.views,
        submissions: data.submissions
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    console.log(
      `[TimeSeries] Final result:`,
      JSON.stringify(result.slice(0, 5), null, 2),
      `... (${result.length} total dates)`
    )
    console.log(
      `[TimeSeries] Dates with data:`,
      result
        .filter(r => r.views > 0 || r.submissions > 0)
        .map(r => `${r.date}: ${r.views} views, ${r.submissions} submissions`)
    )

    return result
  }

  public async delete(formId: string | string[]): Promise<boolean> {
    let result: any

    if (helper.isValidArray(formId)) {
      result = await this.formAnalyticModel.deleteMany({
        formId: {
          $in: formId as string[]
        }
      })
    } else {
      result = await this.formAnalyticModel.deleteOne({
        formId: formId as string
      })
    }

    return (result?.deletedCount ?? 0) > 0
  }
}
