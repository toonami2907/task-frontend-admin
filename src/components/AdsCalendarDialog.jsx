import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar1 } from "lucide-react";

const AdsCalendarDialog = () => {
  const today = new Date();
  const [date, setDate] = React.useState({
    from: new Date(),
    to: new Date(),
  });
  const [selectedRange, setSelectedRange] = React.useState("today");
  const [isOpen, setIsOpen] = React.useState(false);
  const [compare, setCompare] = React.useState(false);
  const [customRange, setCustomRange] = React.useState("custom");
  const [dateRange, setDateRange] = React.useState({
    startDate: new Date(),
    endDate: new Date()
  });
  
  // Add this effect to update dates automatically
  React.useEffect(() => {
    const updateDates = () => {
      const newDates = calculateDateRange(selectedRange);
      setDate(newDates);
      setDateRange({
        startDate: newDates.from,
        endDate: newDates.to
      });
    };
  
    // Update immediately
    updateDates();
  
    // Set up interval for daily updates
    const interval = setInterval(updateDates, 86400000); // 24 hours
  
    return () => clearInterval(interval);
  }, [selectedRange]);

  const timeRanges = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 days", value: "last7" },
    { label: "Last 14 days", value: "last14" },
    { label: "Last 30 days", value: "last30" },
    { label: "This week", value: "thisWeek" },
    { label: "Last week", value: "lastWeek" },
    { label: "This month", value: "thisMonth" },
    { label: "Last month", value: "lastMonth" },
    { label: "Maximum", value: "maximum" },
    { label: "Custom", value: "custom" },
  ];

  const calculateDateRange = (range) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
    const ranges = {
      today: { from: new Date(), to: new Date() },
      yesterday: {
        from: new Date(new Date().setDate(today.getDate() - 1)),
        to: new Date(new Date().setDate(today.getDate() - 1)),
      },
      last7: {
        from: new Date(new Date().setDate(today.getDate() - 7)),
        to: new Date(),
      },
      last14: {
        from: new Date(new Date().setDate(today.getDate() - 14)),
        to: new Date(),
      },
      last30: {
        from: new Date(new Date().setDate(today.getDate() - 30)),
        to: new Date(),
      },
      thisWeek: { from: startOfWeek, to: new Date() },
      lastWeek: {
        from: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() - 7)),
        to: new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() - 1)),
      },
      thisMonth: {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(),
      },
      lastMonth: {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      },
      maximum: {
        from: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
        to: new Date(),
      },
    };

    return ranges[range] || date;
  };

  const handleRangeChange = (value) => {
    setSelectedRange(value);
    if (value !== "custom") {
      const newDates = calculateDateRange(value);
      setDate(newDates);
    }
  };

  const handleDateSelect = (selected) => {
    if (selected?.from) {
      setDate({
        from: selected.from,
        to: selected.to || selected.from,
      });
      setSelectedRange("custom");
    }
  };

  const handleUpdate = () => {
    console.log("Selected date range:", {
      range: selectedRange,
      dates: date,
      compare: compare,
      customRange: customRange,
    });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const options = { month: "long", day: "numeric", year: "numeric" };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar1 />{" "}
          {date.from.toLocaleDateString("en-US", options)} -{" "}
          {date.to.toLocaleDateString("en-US", options)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <div className="grid grid-cols-[200px_1fr] gap-4">
          <div className="space-y-2">
            <RadioGroup value={selectedRange} onValueChange={handleRangeChange}>
              {timeRanges.map((range) => (
                <div key={range.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={range.value} id={range.value} />
                  <Label htmlFor={range.value}>{range.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-4">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              className="rounded-md border flex justify-center items-center"
            />
            {selectedRange === "custom" && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compare"
                    checked={compare}
                    onCheckedChange={(checked) => setCompare(checked)}
                  />
                  <Label htmlFor="compare">Compare</Label>
                </div>
                <div className="flex gap-2">
                  <Select value={customRange} onValueChange={setCustomRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Custom" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleUpdate}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdsCalendarDialog;
