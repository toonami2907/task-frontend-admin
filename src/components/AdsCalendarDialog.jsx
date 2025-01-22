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
        <Button variant="outline" className="flex items-center gap-2 text-xs sm:text-sm">
          <Calendar1 className="h-4 w-4" />
          <span className="hidden sm:inline">
            {date.from.toLocaleDateString("en-US", options)} -{" "}
            {date.to.toLocaleDateString("en-US", options)}
          </span>
          <span className="sm:hidden">
            {date.from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
            {date.to.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl p-4 sm:p-6">
        <div className="flex flex-col sm:grid sm:grid-cols-[200px_1fr] gap-4">
          {/* Time range selector */}
          <div className="order-2 sm:order-1 space-y-2 border-t sm:border-t-0 pt-4 sm:pt-0">
            <RadioGroup 
              value={selectedRange} 
              onValueChange={handleRangeChange}
              className="grid grid-cols-2 sm:grid-cols-1 gap-2"
            >
              {timeRanges.map((range) => (
                <div key={range.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={range.value} id={range.value} />
                  <Label htmlFor={range.value} className="text-sm">
                    {range.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Calendar section */}
          <div className="order-1 sm:order-2 space-y-4">
            <div className="overflow-x-auto">
              <Calendar
                mode="range"
                selected={date}
                showPrevNextMonthButtons={true}
                onSelect={handleDateSelect}
                defaultMonth={new Date(new Date().setMonth(new Date().getMonth() - 1))}
                numberOfMonths={window.innerWidth < 640 ? 1 : 2}
                className="rounded-md border flex justify-center items-center min-w-[300px]"
              />
            </div>

            {selectedRange === "custom" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compare"
                    checked={compare}
                    onCheckedChange={(checked) => setCompare(checked)}
                  />
                  <Label htmlFor="compare" className="text-sm">Compare</Label>
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
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:mt-6 gap-2">
          <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
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
