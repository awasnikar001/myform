import { useRequest } from 'ahooks'

import { FormService } from '@/services'

export function useTimeSeriesData(formId: string, startDate: number, endDate: number) {
  return useRequest(
    async () => {
      try {
        console.log('[Frontend] Fetching time series data:', { formId, startDate, endDate })
        const result = await FormService.analyticTimeSeries(formId, startDate, endDate)
        console.log('[Frontend] Time series result:', result)
        console.log('[Frontend] Time series result.data:', result?.data)
        console.log('[Frontend] Full result structure:', JSON.stringify(result, null, 2))

        // Check for GraphQL errors
        if (result?.errors && result.errors.length > 0) {
          console.error('GraphQL errors:', result.errors)
          return []
        }

        // Handle Apollo query response structure
        if (!result?.data) {
          console.warn('[Frontend] No data in response')
          return []
        }

        // Apollo might return data in different structures
        // Try to extract time series data from various possible structures
        let timeSeriesData = null

        // Structure 1: result.data.formAnalyticTimeSeries.data (expected)
        if (result.data?.formAnalyticTimeSeries?.data) {
          timeSeriesData = result.data.formAnalyticTimeSeries.data
        }
        // Structure 2: result.data is directly the array (unexpected but possible)
        else if (Array.isArray(result.data)) {
          console.warn('[Frontend] result.data is directly an array, using it')
          timeSeriesData = result.data
        }
        // Structure 3: result.data.data (nested data)
        else if (result.data?.data && Array.isArray(result.data.data)) {
          timeSeriesData = result.data.data
        }
        // Structure 4: Check if formAnalyticTimeSeries exists but data is nested differently
        else if (result.data?.formAnalyticTimeSeries) {
          const ts = result.data.formAnalyticTimeSeries
          if (Array.isArray(ts)) {
            timeSeriesData = ts
          } else if (ts.data && Array.isArray(ts.data)) {
            timeSeriesData = ts.data
          }
        }

        if (!timeSeriesData || !Array.isArray(timeSeriesData)) {
          console.warn('[Frontend] No time series data array found in response')
          console.warn('[Frontend] Available keys in result.data:', Object.keys(result.data || {}))
          return []
        }

        console.log('[Frontend] Returning time series data:', timeSeriesData.length, 'items')
        console.log('[Frontend] Sample data:', timeSeriesData.slice(0, 3))
        return timeSeriesData
      } catch (error) {
        console.error('Error fetching time series data:', error)
        return []
      }
    },
    {
      refreshDeps: [formId, startDate, endDate],
      ready:
        !!formId &&
        typeof startDate === 'number' &&
        typeof endDate === 'number' &&
        startDate > 0 &&
        endDate > 0
    }
  )
}

export function useActivityHeatmapData(formId: string, startDate: number, endDate: number) {
  return useRequest(
    async () => {
      try {
        // Use the time series data and process it for heatmap
        // Note: Since we only have daily aggregates, we'll distribute submissions across the day
        const result = await FormService.analyticTimeSeries(formId, startDate, endDate)

        // Use the same parsing logic as useTimeSeriesData
        let timeSeriesData = null

        if (result?.errors && result.errors.length > 0) {
          return {}
        }

        if (!result?.data) {
          return {}
        }

        // Try different response structures
        if (result.data?.formAnalyticTimeSeries?.data) {
          timeSeriesData = result.data.formAnalyticTimeSeries.data
        } else if (Array.isArray(result.data)) {
          timeSeriesData = result.data
        } else if (result.data?.data && Array.isArray(result.data.data)) {
          timeSeriesData = result.data.data
        } else if (result.data?.formAnalyticTimeSeries) {
          const ts = result.data.formAnalyticTimeSeries
          if (Array.isArray(ts)) {
            timeSeriesData = ts
          } else if (ts.data && Array.isArray(ts.data)) {
            timeSeriesData = ts.data
          }
        }

        if (!timeSeriesData || !Array.isArray(timeSeriesData)) {
          return {}
        }

        // Process data for heatmap: group by day of week
        // Since we only have daily aggregates, we'll distribute submissions evenly across hours
        // This is a limitation - for accurate hourly data, we'd need submission timestamps
        const heatmapData: Record<number, Record<number, number>> = {}

        timeSeriesData.forEach(item => {
          if (!item.date || item.submissions === 0) return

          // Parse date string (format: "YYYY-MM-DD")
          const dateParts = item.date.split('-')
          if (dateParts.length !== 3) return

          const year = parseInt(dateParts[0])
          const month = parseInt(dateParts[1]) - 1 // Month is 0-indexed
          const day = parseInt(dateParts[2])
          const date = new Date(year, month, day)
          const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday

          if (!heatmapData[dayOfWeek]) {
            heatmapData[dayOfWeek] = {}
          }

          // Distribute submissions evenly across hours (12pm-1pm as default)
          // This is a simplification - ideally we'd have actual submission times
          const defaultHour = 12
          if (!heatmapData[dayOfWeek][defaultHour]) {
            heatmapData[dayOfWeek][defaultHour] = 0
          }
          heatmapData[dayOfWeek][defaultHour] += item.submissions
        })

        return heatmapData
      } catch (error) {
        console.error('Error fetching heatmap data:', error)
        return {}
      }
    },
    {
      refreshDeps: [formId, startDate, endDate],
      ready:
        !!formId &&
        typeof startDate === 'number' &&
        typeof endDate === 'number' &&
        startDate > 0 &&
        endDate > 0
    }
  )
}
