"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropTypes from "prop-types";

export function DateTimePicker({
  date,
  setDate,
  placeholder = "Pick a date",
}) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Create a new date with the selected time values
  const handleTimeChange = (hours, minutes, seconds, period) => {
    if (!date) {
      const newDate = new Date();
      setDate(newDate);
      return;
    }

    const newDate = new Date(date);
    const adjustedHours =
      period === "PM" && hours < 12
        ? hours + 12
        : period === "AM" && hours === 12
        ? 0
        : hours;

    newDate.setHours(adjustedHours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(seconds);
    setDate(newDate);
  };

  // This prevents the popover from closing when interacting with the time selectors
  const handleOpenChange = (open) => {
    // Only allow closing via the trigger button or selecting a date
    // Don't close when interacting with time selectors
    if (!open && isCalendarOpen) {
      // Check if the click was inside a select component
      const activeElement = document.activeElement;
      const isSelectInteraction =
        activeElement?.closest('[role="combobox"]') ||
        activeElement?.closest('[role="listbox"]') ||
        activeElement?.closest("[data-radix-popper-content-wrapper]");

      if (isSelectInteraction) {
        return; // Don't close the popover
      }
    }
    setIsCalendarOpen(open);
  };

  return (
    <Popover open={isCalendarOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onInteractOutside={(e) => {
          // Prevent closing when interacting with select dropdowns
          const target = e.target;
          if (
            target.closest('[role="combobox"]') ||
            target.closest('[role="listbox"]') ||
            target.closest("[data-radix-popper-content-wrapper]")
          ) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Still allow closing with Escape key
          setIsCalendarOpen(false);
        }}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(newDate) => {
              if (newDate) {
                // Keep the time from the previous date if it exists
                if (date) {
                  newDate.setHours(
                    date.getHours(),
                    date.getMinutes(),
                    date.getSeconds()
                  );
                }
                setDate(newDate);
              } else {
                setDate(null);
              }
              // Don't close the popover after selecting a date
              // setIsCalendarOpen(false)
            }}
            disabled={(date) => {
              // Disable dates before today
              return date < new Date(new Date().setHours(0, 0, 0, 0));
            }}
            initialFocus
          />

          <div className="border-t p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <label className="text-xs font-medium">Hours</label>
                <Select
                  value={
                    date
                      ? (date.getHours() % 12 || 12).toString()
                      : "12"
                  }
                  onValueChange={(value) => {
                    const hours = Number.parseInt(value);
                    const minutes = date?.getMinutes() || 0;
                    const seconds = date?.getSeconds() || 0;
                    const period =
                      date?.getHours() >= 12 ? "PM" : "AM";
                    handleTimeChange(hours, minutes, seconds, period);
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    onCloseAutoFocus={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (hour) => (
                        <SelectItem
                          key={hour}
                          value={hour.toString()}
                        >
                          {hour}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium">Minutes</label>
                <Select
                  value={
                    date
                      ? date.getMinutes().toString().padStart(2, "0")
                      : "00"
                  }
                  onValueChange={(value) => {
                    const hours = date?.getHours() || 0;
                    const minutes = Number.parseInt(value);
                    const seconds = date?.getSeconds() || 0;
                    const period = hours >= 12 ? "PM" : "AM";
                    handleTimeChange(
                      hours % 12 || 12,
                      minutes,
                      seconds,
                      period
                    );
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    onCloseAutoFocus={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map(
                      (minute) => (
                        <SelectItem
                          key={minute}
                          value={minute.toString().padStart(2, "0")}
                        >
                          {minute.toString().padStart(2, "0")}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium">Seconds</label>
                <Select
                  value={
                    date
                      ? date.getSeconds().toString().padStart(2, "0")
                      : "00"
                  }
                  onValueChange={(value) => {
                    const hours = date?.getHours() || 0;
                    const minutes = date?.getMinutes() || 0;
                    const seconds = Number.parseInt(value);
                    const period = hours >= 12 ? "PM" : "AM";
                    handleTimeChange(
                      hours % 12 || 12,
                      minutes,
                      seconds,
                      period
                    );
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    onCloseAutoFocus={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map(
                      (second) => (
                        <SelectItem
                          key={second}
                          value={second.toString().padStart(2, "0")}
                        >
                          {second.toString().padStart(2, "0")}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium">Period</label>
                <Select
                  value={
                    date
                      ? date.getHours() >= 12
                        ? "PM"
                        : "AM"
                      : "PM"
                  }
                  onValueChange={(value) => {
                    const hours = date?.getHours() % 12 || 0;
                    const minutes = date?.getMinutes() || 0;
                    const seconds = date?.getSeconds() || 0;
                    handleTimeChange(
                      hours || 12,
                      minutes,
                      seconds,
                      value
                    );
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    onCloseAutoFocus={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
DateTimePicker.propTypes = {
  date: PropTypes.instanceOf(Date),
  setDate: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
