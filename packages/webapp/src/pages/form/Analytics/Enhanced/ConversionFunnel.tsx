import { FC, useMemo } from 'react'

import { toFixed } from '@heyform-inc/utils'

import { Skeleton } from '@/components'

import { useTimeSeriesData } from './hooks'

interface ConversionFunnelProps {
  formId: string
  startDate: number
  endDate: number
}

export const ConversionFunnel: FC<ConversionFunnelProps> = ({ formId, startDate, endDate }) => {
  const { loading, data } = useTimeSeriesData(formId, startDate, endDate)

  const funnelData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalViews: 0,
        totalSubmissions: 0,
        conversionRate: 0
      }
    }

    const totalViews = data.reduce((sum, item) => sum + (item.views || 0), 0)
    const totalSubmissions = data.reduce((sum, item) => sum + (item.submissions || 0), 0)
    const conversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0

    return {
      totalViews,
      totalSubmissions,
      conversionRate
    }
  }, [data])

  if (loading) {
    return <Skeleton className="mt-4 h-64 w-full" />
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-secondary mt-4 flex h-64 items-center justify-center rounded-lg border border-dashed">
        No data available for the selected date range
      </div>
    )
  }

  const { totalViews, totalSubmissions, conversionRate } = funnelData

  // Calculate funnel dimensions
  const maxWidth = 400 // Maximum width for the funnel
  const stageHeight = 80 // Height of each stage
  const gap = 20 // Gap between stages
  const totalHeight = stageHeight * 2 + gap

  // Calculate widths based on proportions (Views = 100%, Submissions = relative to Views)
  const viewsWidth = maxWidth
  const submissionsWidth = totalViews > 0 ? (totalSubmissions / totalViews) * maxWidth : 0
  const minWidth = 60 // Minimum width to ensure visibility

  // Center the funnel
  const containerPadding = 40
  const viewsX = containerPadding
  const submissionsX = containerPadding + (maxWidth - submissionsWidth) / 2

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-base font-semibold">Conversion Funnel</h3>
      <div className="flex flex-col items-center justify-center" style={{ height: 300 }}>
        <svg
          width="100%"
          height={totalHeight}
          viewBox={`0 0 ${maxWidth + containerPadding * 2} ${totalHeight}`}
        >
          {/* Views Stage */}
          <g>
            {/* Views bar */}
            <rect
              x={viewsX}
              y={0}
              width={viewsWidth}
              height={stageHeight}
              fill="#3b82f6"
              rx={4}
              opacity={0.9}
            />
            {/* Views label */}
            <text
              x={viewsX + viewsWidth / 2}
              y={stageHeight / 2 - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize="16"
              fontWeight="600"
            >
              Views
            </text>
            <text
              x={viewsX + viewsWidth / 2}
              y={stageHeight / 2 + 12}
              textAnchor="middle"
              fill="#fff"
              fontSize="14"
              fontWeight="500"
            >
              {totalViews.toLocaleString()}
            </text>
          </g>

          {/* Funnel connector */}
          <path
            d={`M ${viewsX} ${stageHeight} L ${submissionsX} ${stageHeight + gap} L ${submissionsX + submissionsWidth} ${stageHeight + gap} L ${viewsX + viewsWidth} ${stageHeight} Z`}
            fill="#3b82f6"
            opacity={0.3}
          />

          {/* Conversion rate label */}
          <text
            x={maxWidth / 2 + containerPadding}
            y={stageHeight + gap / 2}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="12"
            fontWeight="500"
          >
            {toFixed(conversionRate)}% conversion
          </text>

          {/* Submissions Stage */}
          <g>
            {/* Submissions bar */}
            <rect
              x={submissionsX}
              y={stageHeight + gap}
              width={Math.max(submissionsWidth, minWidth)}
              height={stageHeight}
              fill="#10b981"
              rx={4}
              opacity={0.9}
            />
            {/* Submissions label */}
            <text
              x={submissionsX + Math.max(submissionsWidth, minWidth) / 2}
              y={stageHeight + gap + stageHeight / 2 - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize="16"
              fontWeight="600"
            >
              Submissions
            </text>
            <text
              x={submissionsX + Math.max(submissionsWidth, minWidth) / 2}
              y={stageHeight + gap + stageHeight / 2 + 12}
              textAnchor="middle"
              fill="#fff"
              fontSize="14"
              fontWeight="500"
            >
              {totalSubmissions.toLocaleString()}
            </text>
          </g>
        </svg>

        {/* Stats summary */}
        <div className="mt-6 flex gap-8 text-center">
          <div>
            <div className="text-secondary text-sm">Total Views</div>
            <div className="mt-1 text-xl font-semibold">{totalViews.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-secondary text-sm">Total Submissions</div>
            <div className="mt-1 text-xl font-semibold">{totalSubmissions.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-secondary text-sm">Conversion Rate</div>
            <div className="mt-1 text-xl font-semibold">{toFixed(conversionRate)}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
