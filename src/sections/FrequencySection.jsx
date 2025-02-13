/* eslint-disable react/prop-types */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import TimePicker from '@/components/TimePicker';


export const FrequencySection = ({ frequency, frequencyValue, timeRanges = [], onChange }) => {
  const addTimeRange = () => {
    const now = new Date();
    const start = new Date(now.setHours(9, 0, 0));
    const end = new Date(now.setHours(17, 0, 0));

    const newTimeRanges = [
      ...timeRanges,
      {
        id: crypto.randomUUID(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
    ];
    onChange('timeRanges', newTimeRanges);
  };

  const updateTimeRange = (id, field, value) => {
    const newTimeRanges = timeRanges.map(range =>
      range.id === id ? { ...range, [field]: value } : range
    );
    onChange('timeRanges', newTimeRanges);
  };

  const removeTimeRange = (id) => {
    const newTimeRanges = timeRanges.filter(range => range.id !== id);
    onChange('timeRanges', newTimeRanges);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Frequency</label>
        <div className="flex gap-4">
          <Select
            value={frequency}
            onValueChange={(value) => onChange('frequency', value)}
          >
            <SelectTrigger className="w-1/2">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            value={frequencyValue}
            onChange={(e) => onChange('frequencyValue', parseInt(e.target.value) || 1)}
            min="1"
            className="w-1/4"
          />
        </div>
      </div>

      {['hourly', 'daily', 'weekly'].includes(frequency) && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Time Ranges</label>
            <Button type="button" variant="outline" size="sm" onClick={addTimeRange}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Range
            </Button>
          </div>

          {timeRanges.map((range) => (
            <div key={range.id} className="flex gap-2 mb-2 items-center">
              <TimePicker
                value={range.startTime}
                onChange={(value) => updateTimeRange(range.id, 'startTime', value)}
                label="Start Time"
              />
              <span>to</span>
              <TimePicker
                value={range.endTime}
                onChange={(value) => updateTimeRange(range.id, 'endTime', value)}
                label="End Time"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTimeRange(range.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
