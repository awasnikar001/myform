import dayjs from 'dayjs'
import { FC, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { Skeleton } from '@/components'

import { useTimeSeriesData } from './hooks'

interface DailyWeeklyBreakdownProps {
  formId: string
  startDate: number
  endDate: number
}

export const DailyWeeklyBreakdown: FC<DailyWeeklyBreakdownProps> = ({
  formId,
  startDate,
  endDate
}) => {
  const { loading, data } = useTimeSeriesData(formId, startDate, endDate)
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily')

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const daysDiff = dayjs.unix(endDate).diff(dayjs.unix(startDate), 'day')

    // Use weekly view if more than 30 days
    const shouldUseWeekly = daysDiff > 30 || viewMode === 'weekly'

    if (shouldUseWeekly) {
      // Group by week
      const weeklyData: Record<string, { week: string; submissions: number; views: number }> = {}

      data.forEach(item => {
        // Parse date string (format: "YYYY-MM-DD")
        const date =
          item.date.includes('-') && item.date.length === 10
            ? dayjs(item.date, 'YYYY-MM-DD')
            : dayjs(item.date)
        const weekStart = date.startOf('week')
        const weekKey = weekStart.format('MMM DD')

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            week: weekKey,
            submissions: 0,
            views: 0
          }
        }

        weeklyData[weekKey].submissions += item.submissions
        weeklyData[weekKey].views += item.views
      })

      return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week))
    } else {
      // Daily view
      return data.map(item => {
        // Parse date string (format: "YYYY-MM-DD")
        const date =
          item.date.includes('-') && item.date.length === 10
            ? dayjs(item.date, 'YYYY-MM-DD')
            : dayjs(item.date)
        return {
          date: date.format('MMM DD'),
          submissions: item.submissions,
          views: item.views
        }
      })
    }
  }, [data, startDate, endDate, viewMode])

  if (loading) {
    return <Skeleton className="mt-4 h-64 w-full" />
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-secondary mt-4 flex h-64 items-center justify-center rounded-lg border border-dashed">
        No data available for the selected date range
      </div>
    )
  }

  const daysDiff = dayjs.unix(endDate).diff(dayjs.unix(startDate), 'day')
  const showToggle = daysDiff > 30

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Submissions Breakdown</h3>
        {showToggle && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('daily')}
              className={`rounded px-3 py-1 text-sm ${
                viewMode === 'daily'
                  ? 'bg-primary text-foreground'
                  : 'bg-background text-secondary hover:bg-accent'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`rounded px-3 py-1 text-sm ${
                viewMode === 'weekly'
                  ? 'bg-primary text-foreground'
                  : 'bg-background text-secondary hover:bg-accent'
              }`}
            >
              Weekly
            </button>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={viewMode === 'weekly' ? 'week' : 'date'}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tick={{ fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Legend />
          <Bar dataKey="submissions" fill="#10b981" name="Submissions" radius={[4, 4, 0, 0]} />
          <Bar dataKey="views" fill="#3b82f6" name="Views" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
