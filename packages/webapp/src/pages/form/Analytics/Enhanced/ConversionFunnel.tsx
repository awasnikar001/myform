import { useRequest } from 'ahooks'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { FormService } from '@/services'
import { useParam } from '@/utils'

import { Skeleton } from '@/components'

interface ConversionFunnelProps {
  range: string
  viewMode: 'fixed' | 'custom'
  customStartDate?: number
  customEndDate?: number
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

// Convert RGB to HSL for gradients
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
  const rgbMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!rgbMatch) return [baseColor, baseColor]

  const r = parseInt(rgbMatch[1])
  const g = parseInt(rgbMatch[2])
  const b = parseInt(rgbMatch[3])

  const [h, s, l] = rgbToHsl(r, g, b)

  return [`hsl(${h}, ${s}%, ${Math.min(l + 20, 95)}%)`, `hsl(${h}, ${s}%, ${Math.max(l - 10, 5)}%)`]
}

export const ConversionFunnel: FC<ConversionFunnelProps> = ({
  range,
  viewMode,
  customStartDate,
  customEndDate
}) => {
  const { t } = useTranslation()
  const { formId } = useParam()

  const { loading, data } = useRequest(
    async () => {
      if (viewMode === 'custom' && customStartDate && customEndDate) {
        return FormService.analytic(formId, range, customStartDate, customEndDate)
      }
      return FormService.analytic(formId, range)
    },
    {
      refreshDeps: [formId, range, viewMode, customStartDate, customEndDate]
    }
  )

  const funnelData = useMemo(() => {
    if (!data) return null

    const views = data.totalVisits?.value || 0
    const submissions = data.submissionCount?.value || 0
    const conversionRate = views > 0 ? ((submissions / views) * 100).toFixed(1) : '0.0'

    return {
      views,
      submissions,
      conversionRate
    }
  }, [data])

  // Use blue for views and green for submissions to match the image
  const viewsGradient = ['#60a5fa', '#3b82f6'] // Blue gradient
  const submissionsGradient = ['#34d399', '#10b981'] // Green gradient

  if (loading) {
    return <Skeleton className="mt-4 h-64 w-full" />
  }

  if (!funnelData) {
    return (
      <div className="text-secondary mt-4 flex h-64 items-center justify-center rounded-lg border border-dashed">
        No data available
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-6 text-base font-semibold">Conversion Funnel</h3>

      <div className="relative flex flex-col items-center">
        {/* Views Box - Larger, Horizontal */}
        <div
          className="relative flex h-24 w-80 flex-col items-center justify-center rounded-lg px-6 text-white shadow-lg"
          style={{
            background: `linear-gradient(to bottom, ${viewsGradient[0]}, ${viewsGradient[1]})`,
            minWidth: '320px'
          }}
        >
          <span className="text-base font-semibold">{t('form.analytics.views')}</span>
          <span className="text-2xl font-bold">{funnelData.views.toLocaleString()}</span>
        </div>

        {/* Connecting Trapezoid Section */}
        <div
          className="relative flex h-16 items-center justify-center text-white shadow-md"
          style={{
            width: '320px',
            clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)',
            backgroundColor: '#1e293b'
          }}
        >
          <span className="text-sm font-medium">{funnelData.conversionRate}% conversion</span>
        </div>

        {/* Submissions Box - Smaller, Vertical */}
        <div
          className="relative flex h-24 flex-col items-center justify-center rounded-lg px-6 text-white shadow-lg"
          style={{
            background: `linear-gradient(to bottom, ${submissionsGradient[0]}, ${submissionsGradient[1]})`,
            width: `${Math.max((funnelData.submissions / Math.max(funnelData.views, 1)) * 320, 240)}px`,
            minWidth: '240px'
          }}
        >
          <span className="text-base font-semibold">{t('form.submissions.title')}</span>
          <span className="text-2xl font-bold">{funnelData.submissions.toLocaleString()}</span>
        </div>

        {/* Statistics Cards */}
        <div className="mt-10 grid w-full max-w-4xl grid-cols-3 gap-4">
          {/* Total Views Card */}
          <div
            className="rounded-lg border p-6 shadow-lg"
            style={{
              backgroundColor: 'rgba(24, 24, 27, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white opacity-80">
              TOTAL VIEWS
            </div>
            <div className="text-3xl font-bold text-white">{funnelData.views.toLocaleString()}</div>
          </div>

          {/* Total Submissions Card */}
          <div
            className="rounded-lg border p-6 shadow-lg"
            style={{
              backgroundColor: 'rgba(24, 24, 27, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white opacity-80">
              TOTAL SUBMISSIONS
            </div>
            <div className="text-3xl font-bold text-white">
              {funnelData.submissions.toLocaleString()}
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div
            className="rounded-lg border p-6 shadow-lg"
            style={{
              backgroundColor: 'rgba(24, 24, 27, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white opacity-80">
              CONVERSION RATE
            </div>
            <div className="text-3xl font-bold text-white">{funnelData.conversionRate}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
