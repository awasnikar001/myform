import { Promise } from 'mongoose'

import { Auth, FormGuard } from '@decorator'
import {
  FormAnalyticInput,
  FormAnalyticResult,
  FormAnalyticTimeSeriesInput,
  FormAnalyticTimeSeriesType,
  FormAnalyticType,
  TimeSeriesDataType
} from '@graphql'
import { date, helper, parseJson } from '@heyform-inc/utils'
import { FormAnalyticRangeEnum } from '@model'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { FormAnalyticService, RedisService } from '@service'

function getChanges(prev: number, next: number, isInteger = true) {
  const result: FormAnalyticResult = {
    value: isInteger ? Math.ceil(next) : next
  }

  if (helper.isValid(prev)) {
    const p = prev || 1
    result.change = Math.round(((next - p) * 100) / p)
  }

  return result
}

function getRate(totalVisits: number, submissionCount: number) {
  if (helper.isNil(totalVisits) || helper.isNil(submissionCount)) {
    return
  }

  if (totalVisits > 0 && submissionCount > 0) {
    return Math.min(100, 100 * (submissionCount / totalVisits))
  } else if (totalVisits < 1 && submissionCount > 1) {
    return 100
  } else {
    return 0
  }
}

@Resolver()
@Auth()
export class FormAnalyticResolver {
  constructor(
    private readonly formAnalyticService: FormAnalyticService,
    private readonly redisService: RedisService
  ) {}

  @Query(returns => FormAnalyticType)
  @FormGuard()
  async formAnalytic(@Args('input') input: FormAnalyticInput): Promise<FormAnalyticType> {
    const now = date().endOf('day')
    let startAt: Date
    let prevStartAt: Date

    // Check if custom dates are provided
    if (input.startDate && input.endDate) {
      startAt = new Date(input.startDate * 1000)
      const endAt = new Date(input.endDate * 1000)
      const rangeDuration = endAt.getTime() - startAt.getTime()
      prevStartAt = new Date(startAt.getTime() - rangeDuration)

      const key = `form:${input.formId}:analytic:custom:${input.startDate}:${input.endDate}`
      const cache = await this.redisService.get(key)

      if (helper.isValid(cache)) {
        return parseJson(cache)
      }

      const [prev, next] = await Promise.all([
        this.formAnalyticService.summary({
          formId: input.formId,
          startAt: prevStartAt,
          endAt: startAt
        }),
        this.formAnalyticService.summary({
          formId: input.formId,
          startAt,
          endAt,
          isNext: true
        })
      ])

      const prevRate = getRate(prev.avgTotalVisits, prev.avgSubmissionCount)
      const nextRate = getRate(next.avgTotalVisits, next.avgSubmissionCount)

      const result = {
        totalVisits: getChanges(prev.avgTotalVisits, next.avgTotalVisits),
        submissionCount: getChanges(prev.avgSubmissionCount, next.avgSubmissionCount),
        completeRate: {
          value: nextRate,
          change: prevRate ? nextRate - prevRate : undefined
        },
        averageTime: getChanges(prev.avgAverageTime, next.avgAverageTime, false)
      }

      await this.redisService.set({
        key,
        value: JSON.stringify(result),
        duration: '10m'
      })

      return result
    }

    // Use fixed range (backward compatibility)
    if (!input.range) {
      input.range = FormAnalyticRangeEnum.WEEK
    }

    const key = `form:${input.formId}:analytic:${input.range}`
    const cache = await this.redisService.get(key)

    if (helper.isValid(cache)) {
      return parseJson(cache)
    }

    switch (input.range) {
      case FormAnalyticRangeEnum.WEEK:
        startAt = now.subtract(7, 'days').startOf('day').toDate()
        prevStartAt = now.subtract(14, 'days').startOf('day').toDate()
        break

      case FormAnalyticRangeEnum.MONTH:
        startAt = now.subtract(1, 'months').startOf('day').toDate()
        prevStartAt = now.subtract(2, 'months').startOf('day').toDate()
        break

      case FormAnalyticRangeEnum.THREE_MONTH:
        startAt = now.subtract(3, 'months').startOf('day').toDate()
        prevStartAt = now.subtract(6, 'months').startOf('day').toDate()
        break

      case FormAnalyticRangeEnum.SIX_MONTH:
        startAt = now.subtract(6, 'months').startOf('day').toDate()
        prevStartAt = now.subtract(12, 'months').startOf('day').toDate()
        break

      case FormAnalyticRangeEnum.YEAR:
        startAt = now.subtract(1, 'years').startOf('day').toDate()
        prevStartAt = now.subtract(2, 'years').startOf('day').toDate()
        break
    }

    const [prev, next] = await Promise.all([
      this.formAnalyticService.summary({
        formId: input.formId,
        startAt: prevStartAt,
        endAt: startAt
      }),
      this.formAnalyticService.summary({
        formId: input.formId,
        startAt,
        endAt: now.toDate(),
        isNext: true
      })
    ])

    const prevRate = getRate(prev.avgTotalVisits, prev.avgSubmissionCount)
    const nextRate = getRate(next.avgTotalVisits, next.avgSubmissionCount)

    const result = {
      totalVisits: getChanges(prev.avgTotalVisits, next.avgTotalVisits),
      submissionCount: getChanges(prev.avgSubmissionCount, next.avgSubmissionCount),
      completeRate: {
        value: nextRate,
        change: prevRate ? nextRate - prevRate : undefined
      },
      averageTime: getChanges(prev.avgAverageTime, next.avgAverageTime, false)
    }

    await this.redisService.set({
      key,
      value: JSON.stringify(result),
      duration: '10m'
    })

    return result
  }

  @Query(returns => FormAnalyticTimeSeriesType)
  @FormGuard()
  async formAnalyticTimeSeries(
    @Args('input') input: FormAnalyticTimeSeriesInput
  ): Promise<FormAnalyticTimeSeriesType> {
    const cacheKey = `form:${input.formId}:timeseries:${input.startDate}:${input.endDate}`
    const cache = await this.redisService.get(cacheKey)

    console.log(
      `[TimeSeries Resolver] Query for formId ${input.formId}, startDate: ${input.startDate}, endDate: ${input.endDate}`
    )
    console.log(`[TimeSeries Resolver] Cache hit:`, helper.isValid(cache))

    if (helper.isValid(cache)) {
      const cachedResult = parseJson(cache) as FormAnalyticTimeSeriesType
      console.log(
        `[TimeSeries Resolver] Returning cached result with ${cachedResult?.data?.length || 0} dates`
      )
      return cachedResult
    }

    const startDate = new Date(input.startDate * 1000)
    const endDate = new Date(input.endDate * 1000)

    console.log(`[TimeSeries Resolver] Calling getTimeSeriesData with dates:`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    const timeSeriesData = await this.formAnalyticService.getTimeSeriesData(
      input.formId,
      startDate,
      endDate
    )

    const result: FormAnalyticTimeSeriesType = {
      data: timeSeriesData.map(item => ({
        date: item.date,
        views: item.views,
        submissions: item.submissions
      })) as TimeSeriesDataType[]
    }

    console.log(`[TimeSeries Resolver] Result has ${result.data.length} dates, caching for 10m`)

    await this.redisService.set({
      key: cacheKey,
      value: JSON.stringify(result),
      duration: '10m'
    })

    return result
  }
}
