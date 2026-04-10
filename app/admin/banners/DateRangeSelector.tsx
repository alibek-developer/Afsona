'use client';

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateRangeSelectorProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeSelectorProps) {
  return (
    <div className="space-y-4 p-3 bg-gray-50 rounded-lg">
      <Label>Display Date Range (Optional)</Label>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date" className="text-sm">
            Start Date
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange(e.target.value || null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm">
            End Date
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value || null)}
          />
        </div>
      </div>

      <p className="text-xs text-gray-600">
        ℹ️ Leave empty for permanent display. If set, banner will only show within this date range.
      </p>
    </div>
  );
}
