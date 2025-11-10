import dayjs, { type Dayjs } from 'dayjs'
import { FC, useCallback, useEffect } from 'react'

import { DatePicker } from '@/components'

interface CustomDateRangeProps {
  startDate?: number
  endDate?: number
  onChange: (startDate: number, endDate: number) => void
}

export const CustomDateRange: FC<CustomDateRangeProps> = ({ startDate, endDate, onChange }) => {
  // Initialize dates if not provided (only on mount)
  useEffect(() => {
    if (!startDate || !endDate) {
      const defaultStart = dayjs().subtract(7, 'days').startOf('day').unix()
      const defaultEnd = dayjs().endOf('day').unix()
      onChange(defaultStart, defaultEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handleStartDateChange = useCallback(
    (date: Dayjs) => {
      const start = date.startOf('day').unix()
      const end = endDate || dayjs().endOf('day').unix()
      onChange(start, end)
    },
    [endDate, onChange]
  )

  const handleEndDateChange = useCallback(
    (date: Dayjs) => {
      const start = startDate || dayjs().subtract(7, 'days').startOf('day').unix()
      const end = date.endOf('day').unix()
      onChange(start, end)
    },
    [startDate, onChange]
  )

  const startDateValue = startDate ? dayjs.unix(startDate) : dayjs().subtract(7, 'days')
  const endDateValue = endDate ? dayjs.unix(endDate) : dayjs()

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <label className="text-secondary mb-1 text-sm font-medium">Start Date</label>
        <DatePicker
          value={startDateValue}
          onChange={handleStartDateChange}
          maxDate={endDateValue}
          placeholder="Select start date"
        />
      </div>
      <div className="text-secondary mt-6">to</div>
      <div className="flex flex-col">
        <label className="text-secondary mb-1 text-sm font-medium">End Date</label>
        <DatePicker
          value={endDateValue}
          onChange={handleEndDateChange}
          minDate={startDateValue}
          maxDate={dayjs()}
          placeholder="Select end date"
        />
      </div>
    </div>
  )
}
