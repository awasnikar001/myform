import dayjs from 'dayjs'
import { FC, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { Skeleton } from '@/components'

import { useTimeSeriesData } from './hooks'

interface TimeSeriesChartsProps {
  formId: string
  startDate: number
  endDate: number
}

// Helper to get CSS variable color
const getThemeColor = (varName: string, opacity = 1): string => {
  if (typeof window === 'undefined') return `rgba(var(${varName}), ${opacity})`
  const computed = getComputedStyle(document.documentElement).getPropertyValue(varName)
  if (computed) {
    const rgb = computed
      .trim()
      .split(',')
      .map(v => v.trim())
    if (rgb.length >= 3) {
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`
    }
  }
  return `rgba(var(${varName}), ${opacity})`
}

// Convert RGB to HSL for better gradients
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return [h * 360, s * 100, l * 100]
}

const getGradientColors = (baseColor: string): string[] => {
  // Parse RGB from CSS variable
  const rgbMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!rgbMatch) return [baseColor, baseColor, baseColor]

  const r = parseInt(rgbMatch[1])
  const g = parseInt(rgbMatch[2])
  const b = parseInt(rgbMatch[3])

  const [h, s, l] = rgbToHsl(r, g, b)

  // Create 3-stop gradient: lighter -> base -> darker
  return [
    `hsl(${h}, ${s}%, ${Math.min(l + 15, 95)}%)`, // Lighter
    `hsl(${h}, ${s}%, ${l}%)`, // Base
    `hsl(${h}, ${s}%, ${Math.max(l - 15, 5)}%)` // Darker
  ]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null

  const isDark = document.documentElement.classList.contains('dark')
  const bgColor = isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(9, 9, 11, 0.9)'
  const labelColor = isDark ? 'rgba(161, 161, 170, 1)' : 'rgba(113, 113, 122, 1)'

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <p style={{ margin: '0 0 8px 0', color: labelColor, fontSize: '12px', fontWeight: 500 }}>
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <p
          key={index}
          style={{
            margin: '4px 0',
            color: textColor,
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: entry.color
            }}
          />
          {entry.name}: <span style={{ fontWeight: 700 }}>{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export const TimeSeriesCharts: FC<TimeSeriesChartsProps> = ({ formId, startDate, endDate }) => {
  const { loading, data } = useTimeSeriesData(formId, startDate, endDate)

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map(item => {
      const date =
        item.date.includes('-') && item.date.length === 10
          ? dayjs(item.date, 'YYYY-MM-DD')
          : dayjs(item.date)
      return {
        date: date.format('MMM DD'),
        fullDate: date.format('YYYY-MM-DD'),
        submissions: item.submissions || 0,
        views: item.views || 0
      }
    })
  }, [data])

  // Use blue for views and green for submissions to match the image
  const viewsColor = '#3b82f6' // Blue
  const submissionsColor = '#10b981' // Green
  const gridColor = getThemeColor('--hf-accent', 0.3)
  const axisColor = getThemeColor('--hf-secondary', 0.7)

  const viewsGradient = ['#60a5fa', '#3b82f6', '#2563eb'] // Blue gradient
  const submissionsGradient = ['#34d399', '#10b981', '#059669'] // Green gradient

  if (loading) {
    return <Skeleton className="mt-4 h-80 w-full" />
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-secondary mt-4 flex h-80 items-center justify-center rounded-lg border border-dashed">
        No data available for the selected date range
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-6 text-base font-semibold">Views & Submissions Over Time</h3>
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.05)'
        }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={viewsGradient[0]} stopOpacity={0.4} />
                <stop offset="50%" stopColor={viewsGradient[1]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={viewsGradient[2]} stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="submissionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={submissionsGradient[0]} stopOpacity={0.4} />
                <stop offset="50%" stopColor={submissionsGradient[1]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={submissionsGradient[2]} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={axisColor}
              style={{ fontSize: '12px' }}
              tick={{ fill: axisColor }}
            />
            <YAxis stroke={axisColor} style={{ fontSize: '12px' }} tick={{ fill: axisColor }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="views"
              name="Views"
              stroke={viewsColor}
              strokeWidth={2.5}
              fill="url(#viewsGradient)"
              animationDuration={750}
              animationBegin={0}
            />
            <Area
              type="monotone"
              dataKey="submissions"
              name="Submissions"
              stroke={submissionsColor}
              strokeWidth={2.5}
              fill="url(#submissionsGradient)"
              animationDuration={750}
              animationBegin={100}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
