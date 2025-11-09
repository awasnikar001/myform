import dayjs from 'dayjs'
import { useState } from 'react'

import { useParam } from '@/utils'

import { ActivityHeatmap } from './Enhanced/ActivityHeatmap'
import { ConversionFunnel } from './Enhanced/ConversionFunnel'
import { TimeSeriesCharts } from './Enhanced/TimeSeriesCharts'
import FormAnalyticsOverview from './Overview'
import FormAnalyticsReport from './Report'

export default function FormAnalytics() {
  const { formId } = useParam()
  // Set to true for now - easy to gate later with team?.plan === 'pro'
  const isEnhanced = true

  // Shared date range state
  const [range, setRange] = useState('7d')
  const [viewMode, setViewMode] = useState<'fixed' | 'custom'>('fixed')
  const [customStartDate, setCustomStartDate] = useState<number | undefined>()
  const [customEndDate, setCustomEndDate] = useState<number | undefined>()

  // Calculate actual start/end dates based on selection
  // Note: Backend uses UTC timezone for date grouping, so we need to ensure consistency
  const getDateRange = () => {
    if (viewMode === 'custom' && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate }
    }

    // Convert fixed range to dates - match backend calculation exactly
    // Backend uses date().endOf('day') which operates in UTC
    // We use UTC here to ensure consistency
    const now = dayjs().utc().endOf('day')
    let startDate: dayjs.Dayjs

    switch (range) {
      case '7d':
        startDate = now.subtract(7, 'days').startOf('day') // Match backend: 7 days ago to today
        break
      case '1m':
        startDate = now.subtract(1, 'months').startOf('day')
        break
      case '3m':
        startDate = now.subtract(3, 'months').startOf('day')
        break
      case '6m':
        startDate = now.subtract(6, 'months').startOf('day')
        break
      case '1y':
        startDate = now.subtract(1, 'years').startOf('day')
        break
      default:
        startDate = now.subtract(7, 'days').startOf('day')
    }

    return {
      startDate: startDate.unix(),
      endDate: now.unix()
    }
  }

  const { startDate, endDate } = getDateRange()

  return (
    <>
      <FormAnalyticsOverview
        range={range}
        setRange={setRange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
      />
      {isEnhanced && (
        <div className="mt-10">
          <TimeSeriesCharts formId={formId} startDate={startDate} endDate={endDate} />
          <ConversionFunnel formId={formId} startDate={startDate} endDate={endDate} />
          <ActivityHeatmap formId={formId} startDate={startDate} endDate={endDate} />
        </div>
      )}
      <FormAnalyticsReport />
    </>
  )
}
