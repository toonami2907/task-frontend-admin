import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isValid } from "date-fns";
import { Clock } from "lucide-react";
import { Button } from "./ui/button";

export const TimePicker = ({ value, onChange, label = "Pick time" }) => {
  // Function to safely format time
  const formatTime = (date) => {
    try {
      return date && isValid(date) ? format(date, "HH:mm") : "";
    } catch (error) {
      console.warn("Invalid date value:", date);
      return "";
    }
  };

  // Function to safely handle time changes
  const handleTimeChange = (e) => {
    try {
      const [hours, minutes] = e.target.value.split(':');
      const hoursInt = parseInt(hours);
      const minutesInt = parseInt(minutes);

      // Validate hours and minutes
      if (isNaN(hoursInt) || isNaN(minutesInt) || 
          hoursInt < 0 || hoursInt > 23 || 
          minutesInt < 0 || minutesInt > 59) {
        console.warn("Invalid time values:", hours, minutes);
        return;
      }

      const newDate = new Date(value || new Date());
      newDate.setHours(hoursInt, minutesInt);

      if (isValid(newDate)) {
        onChange(newDate);
      } else {
        console.warn("Invalid date created:", newDate);
      }
    } catch (error) {
      console.warn("Error processing time:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[120px] justify-start text-left font-normal"
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatTime(value) || label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-4">
          <input
            type="time"
            onChange={handleTimeChange}
            value={formatTime(value)}
            className="w-full"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;