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

  // Calculate date range based on viewMode
  const { startDate, endDate } = useMemo(() => {
    if (viewMode === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate
      }
    }

    // Calculate from range string
    const end = dayjs().endOf('day').unix()
    let start: number

    switch (range) {
      case '7d':
        start = dayjs().subtract(7, 'days').startOf('day').unix()
        break
      case '1m':
        start = dayjs().subtract(1, 'month').startOf('day').unix()
        break
      case '3m':
        start = dayjs().subtract(3, 'months').startOf('day').unix()
        break
      case '6m':
        start = dayjs().subtract(6, 'months').startOf('day').unix()
        break
      case '1y':
        start = dayjs().subtract(1, 'year').startOf('day').unix()
        break
      default:
        start = dayjs().subtract(7, 'days').startOf('day').unix()
    }

    return { startDate: start, endDate: end }
  }, [range, viewMode, customStartDate, customEndDate])

  return (
    <div className="space-y-8">
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

      {/* Enhanced Charts */}
      <TimeSeriesCharts formId={formId} startDate={startDate} endDate={endDate} />
      <ConversionFunnel
        range={range}
        viewMode={viewMode}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
      />
      <ActivityHeatmap formId={formId} startDate={startDate} endDate={endDate} />

      <FormAnalyticsReport />
    </div>
  )
}
