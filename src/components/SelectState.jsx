/* eslint-disable react/prop-types */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SelectState = ({ state, setState, handleStateStatus, campaign, ads, adset, disableState }) => {
  const isDisabled = !campaign?.length && !ads?.length && !adset?.length;

  return (
    <Select
      value={state}
      onValueChange={(value) => {
        setState(value);
        handleStateStatus(value);
        disableState(value);
      }}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-28 text-xs border border-black disabled:border-gray-400">
        <SelectValue placeholder=" Turn Off/On" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ON">On</SelectItem>
        <SelectItem value="OFF">Off</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SelectState;