import { CHOICE_FIELD_KINDS, RATING_FIELD_KINDS } from '@heyform-inc/shared-types-enums'
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { helper, toFixed } from '@heyform-inc/utils'

import { useFormStore } from '@/store'

import FormReportSubmissions from './Submissions'

interface FormReportItemProps {
  index: number
  response: any
  isHideFieldEnabled?: boolean
}

interface ChoicesProps {
  chooses: any[]
}

interface RatingsProps extends ChoicesProps {
  length: number
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

// Generate color palette
const generateColors = (count: number): string[] => {
  const colors: string[] = []
  const baseHue = 200 // Start with blue-ish
  const saturation = 60
  const lightness = 55

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + (i * 360) / count) % 360
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
  }

  return colors
}

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useTranslation()
  if (!active || !payload || payload.length === 0) return null

  const isDark = document.documentElement.classList.contains('dark')
  const bgColor = isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(9, 9, 11, 0.9)'
  const labelColor = isDark ? 'rgba(161, 161, 170, 1)' : 'rgba(113, 113, 122, 1)'

  const data = payload[0]
  const percent = data.payload.percent * 100

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
        {data.name}
      </p>
      <p
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
            backgroundColor: data.payload.fill
          }}
        />
        {data.value} {t('form.analytics.report.submission', { count: data.value })}
        <span style={{ fontWeight: 700, marginLeft: '8px' }}>({toFixed(percent)}%)</span>
      </p>
    </div>
  )
}

const Choices: FC<ChoicesProps> = ({ chooses }) => {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const total = useMemo(() => chooses.reduce((prev, next) => prev + next.count, 0) || 1, [chooses])

  const chartData = useMemo(() => {
    return chooses.map((row, index) => ({
      name: row.label,
      value: row.count,
      percent: row.count / total
    }))
  }, [chooses, total])

  const colors = useMemo(() => generateColors(chooses.length), [chooses.length])

  const isDark =
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  const legendColor = isDark ? 'rgba(161, 161, 170, 1)' : 'rgba(113, 113, 122, 1)'

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      {/* Donut Chart */}
      <div className="flex-shrink-0">
        <ResponsiveContainer width={240} height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              animationDuration={800}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index]}
                  stroke={isDark ? 'rgba(24, 24, 27, 1)' : 'rgba(255, 255, 255, 1)'}
                  strokeWidth={activeIndex === index ? 3 : 1}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {chooses.map((row, index) => {
          const percent = (row.count * 100) / total
          const showLabel = percent > 5 // Only show labels > 5%

          return (
            <div
              key={index}
              className="hover:bg-accent flex items-center gap-3 rounded-lg p-2 transition-colors"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{
                backgroundColor:
                  activeIndex === index
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)'
                    : 'transparent'
              }}
            >
              <div className="h-4 w-4 rounded" style={{ backgroundColor: colors[index] }} />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{row.label}</span>
                  {showLabel && <span className="text-sm font-semibold">{toFixed(percent)}%</span>}
                </div>
                <div className="text-xs" style={{ color: legendColor }}>
                  {t('form.analytics.report.submission', { count: row.count })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Ratings: FC<RatingsProps> = ({ length, chooses }) => {
  const { t } = useTranslation()
  const arrays = Array.from<number>({ length }).map((_, index) => index + 1)
  const total = chooses.filter(c => helper.isNumeric(c)).reduce((prev, next) => prev + next, 0)

  return (
    <div className="heyform-report-chart">
      {arrays.map((row, index) => {
        const count = chooses[row] || 0
        const percent = `${toFixed((count * 100) / total)}%`

        return (
          <div key={index} className="heyform-report-chart-item">
            <div
              className="heyform-report-chart-background"
              style={{
                width: percent
              }}
            />
            <div className="heyform-report-chart-content">
              <span className="heyform-report-chart-percent">
                {row} · {total > 0 ? Math.round((count * 100) / total) : 0}%
              </span>
              <span className="heyform-report-chart-count">
                {t('form.analytics.report.submission', { count })}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const FormReportItem: FC<FormReportItemProps> = ({ index, response, isHideFieldEnabled }) => {
  const { t } = useTranslation()

  const { form } = useFormStore()

  const isChoices = useMemo(() => CHOICE_FIELD_KINDS.includes(response.kind), [response.kind])
  const isRating = useMemo(() => RATING_FIELD_KINDS.includes(response.kind), [response.kind])

  const isHided = useMemo(
    () => isHideFieldEnabled && form?.customReport?.hiddenFields?.includes(response.id),
    [form?.customReport?.hiddenFields, isHideFieldEnabled, response.id]
  )

  const children = useMemo(() => {
    if (isChoices) {
      return <Choices chooses={response.chooses} />
    } else if (isRating) {
      return <Ratings length={response.properties?.total} chooses={response.chooses} />
    } else {
      return <FormReportSubmissions response={response} />
    }
  }, [isChoices, isRating, response])

  return (
    <li className="heyform-report-item">
      <div className="flex gap-4">
        <div className="heyform-report-question flex-1">
          {index}. {response.title}
        </div>
      </div>
      <div className="heyform-report-meta">
        {isRating
          ? t('form.analytics.report.submission2', {
              count: response.count,
              average: response.average
            })
          : t('form.analytics.report.submission', { count: response.count })}
      </div>

      {!isHided && <div className="heyform-report-content">{children}</div>}
    </li>
  )
}

const Skeleton = () => {
  return (
    <div>
      <div className="py-[0.3125rem]">
        <div className="skeleton h-3.5 w-72 rounded-sm"></div>
      </div>
      <div className="py-[0.3125rem]">
        <div className="skeleton h-3.5 w-24 rounded-sm"></div>
      </div>
    </div>
  )
}

export default Object.assign(FormReportItem, {
  Skeleton
})
