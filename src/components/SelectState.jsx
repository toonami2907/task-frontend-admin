/* eslint-disable react/prop-types */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SelectState = ({ state, setState, handleStateStatus, disableState }) => {
  return (
    <Select
      value={state}
      onValueChange={(value) => {
        handleStateStatus(value);
        disableState(value)
      }}
      className=""
    >
      <SelectTrigger className="w-[120px] h-[40px]">
        <SelectValue placeholder="Off/On" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="On">On</SelectItem>
        <SelectItem value="Off">Off</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SelectState;
