import { FC, useMemo, useState } from 'react'

import { Skeleton } from '@/components'

import { useActivityHeatmapData } from './hooks'

interface ActivityHeatmapProps {
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

// Get intensity color based on count
const getIntensityColor = (count: number, maxCount: number, isDark: boolean): string => {
  if (maxCount === 0) {
    return isDark ? 'rgba(24, 24, 27, 0.3)' : 'rgba(244, 244, 245, 0.5)'
  }

  const intensity = count / maxCount

  if (isDark) {
    // Dark mode colors - green scale
    if (intensity === 0) return 'rgba(24, 24, 27, 0.3)'
    if (intensity <= 0.25) return 'rgba(34, 197, 94, 0.2)'
    if (intensity <= 0.5) return 'rgba(34, 197, 94, 0.4)'
    if (intensity <= 0.75) return 'rgba(34, 197, 94, 0.6)'
    return 'rgba(34, 197, 94, 0.8)'
  } else {
    // Light mode colors - blue scale
    if (intensity === 0) return 'rgba(244, 244, 245, 0.5)'
    if (intensity <= 0.25) return 'rgba(59, 130, 246, 0.3)'
    if (intensity <= 0.5) return 'rgba(59, 130, 246, 0.5)'
    if (intensity <= 0.75) return 'rgba(59, 130, 246, 0.7)'
    return 'rgba(59, 130, 246, 0.9)'
  }
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12
  const period = i < 12 ? 'AM' : 'PM'
  return `${hour}${period}`
})

export const ActivityHeatmap: FC<ActivityHeatmapProps> = ({ formId, startDate, endDate }) => {
  const { loading, data } = useActivityHeatmapData(formId, startDate, endDate)
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null)

  const isDark =
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

  const { heatmapData, maxCount } = useMemo(() => {
    const heatmap: Record<number, Record<number, number>> = {}
    let max = 0

    // Initialize all cells
    for (let day = 0; day < 7; day++) {
      heatmap[day] = {}
      for (let hour = 0; hour < 24; hour++) {
        heatmap[day][hour] = 0
      }
    }

    // Fill with actual data
    if (data) {
      Object.keys(data).forEach(dayStr => {
        const day = parseInt(dayStr)
        if (data[day]) {
          Object.keys(data[day]).forEach(hourStr => {
            const hour = parseInt(hourStr)
            const count = data[day][hour] || 0
            heatmap[day][hour] = count
            max = Math.max(max, count)
          })
        }
      })
    }

    return { heatmapData: heatmap, maxCount: max }
  }, [data])

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
  const labelColor = isDark ? 'rgba(161, 161, 170, 1)' : 'rgba(113, 113, 122, 1)'
  const bgColor = isDark ? 'rgba(24, 24, 27, 0.6)' : 'rgba(255, 255, 255, 0.6)'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  if (loading) {
    return <Skeleton className="mt-4 h-96 w-full" />
  }

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-base font-semibold">Submission Activity Heatmap</h3>

      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex gap-4">
          {/* Day labels */}
          <div className="flex flex-col gap-2 pt-8">
            {DAY_LABELS.map((label, dayIndex) => (
              <div
                key={dayIndex}
                className="flex h-8 items-center justify-end pr-3 text-xs font-medium"
                style={{ color: labelColor }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex-1">
            {/* Hour labels */}
            <div className="mb-2 flex gap-1">
              {HOUR_LABELS.map((label, hourIndex) => (
                <div
                  key={hourIndex}
                  className="flex-1 text-center text-xs"
                  style={{ color: labelColor }}
                >
                  {hourIndex % 4 === 0 ? label : ''}
                </div>
              ))}
            </div>

            {/* Heatmap cells */}
            <div className="flex gap-1">
              {Array.from({ length: 24 }).map((_, hourIndex) => (
                <div key={hourIndex} className="flex flex-1 flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const count = heatmapData[dayIndex]?.[hourIndex] || 0
                    const isHovered =
                      hoveredCell?.day === dayIndex && hoveredCell?.hour === hourIndex
                    const intensityColor = getIntensityColor(count, maxCount, isDark)

                    return (
                      <div
                        key={`${dayIndex}-${hourIndex}`}
                        className="group relative aspect-square rounded transition-all duration-200"
                        style={{
                          backgroundColor: intensityColor,
                          border: `1px solid ${gridColor}`,
                          transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                          zIndex: isHovered ? 10 : 1,
                          boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={() => setHoveredCell({ day: dayIndex, hour: hourIndex })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {isHovered && count > 0 && (
                          <div
                            className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs font-semibold"
                            style={{
                              backgroundColor: isDark
                                ? 'rgba(24, 24, 27, 0.95)'
                                : 'rgba(255, 255, 255, 0.95)',
                              color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(9, 9, 11, 0.9)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              backdropFilter: 'blur(8px)',
                              WebkitBackdropFilter: 'blur(8px)'
                            }}
                          >
                            {count} {count === 1 ? 'submission' : 'submissions'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <span className="text-xs" style={{ color: labelColor }}>
            Less
          </span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => {
              const mockCount = Math.round(intensity * maxCount)
              const color = getIntensityColor(mockCount, maxCount, isDark)
              return (
                <div
                  key={index}
                  className="h-4 w-4 rounded"
                  style={{
                    backgroundColor: color,
                    border: `1px solid ${gridColor}`
                  }}
                />
              )
            })}
          </div>
          <span className="text-xs font-semibold" style={{ color: labelColor }}>
            More
          </span>
        </div>
      </div>
    </div>
  )
}
