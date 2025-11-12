import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { useParam } from '@/utils'

import { ActivityHeatmap, ConversionFunnel, TimeSeriesCharts } from './Enhanced'
import FormAnalyticsOverview from './Overview'
import FormAnalyticsReport from './Report'

export default function FormAnalytics() {
  const { formId } = useParam()
  const [range, setRange] = useState('7d')
  const [viewMode, setViewMode] = useState<'fixed' | 'custom'>('fixed')
  const [customStartDate, setCustomStartDate] = useState<number | undefined>()
  const [customEndDate, setCustomEndDate] = useState<number | undefined>()

  // Calculate date range based on selected range or custom dates
  const { startDate, endDate } = useMemo(() => {
    if (viewMode === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate
      }
    }

    // Calculate from range string
    const now = dayjs()
    let start: dayjs.Dayjs

    switch (range) {
      case '7d':
        start = now.subtract(7, 'day')
        break
      case '1m':
        start = now.subtract(1, 'month')
        break
      case '3m':
        start = now.subtract(3, 'month')
        break
      case '6m':
        start = now.subtract(6, 'month')
        break
      case '1y':
        start = now.subtract(1, 'year')
        break
      default:
        start = now.subtract(7, 'day')
    }

    return {
      startDate: start.startOf('day').unix(),
      endDate: now.endOf('day').unix()
    }
  }, [range, viewMode, customStartDate, customEndDate])

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

      {/* Chart Components */}
      <div className="mt-10 space-y-10">
        <TimeSeriesCharts formId={formId} startDate={startDate} endDate={endDate} />
        <ConversionFunnel
          range={range}
          viewMode={viewMode}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
        <ActivityHeatmap formId={formId} startDate={startDate} endDate={endDate} />
      </div>

      <FormAnalyticsReport />
    </>
  )
}
