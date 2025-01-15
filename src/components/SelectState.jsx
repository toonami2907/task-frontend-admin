import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SelectState = ({ state, setState, handleStateStatus }) => {
  return (
    <Select
      value={state}
      onValueChange={(value) => {
        handleStateStatus(value);
        setState('')
      }}
      className=""
    >
      <SelectTrigger className="w-[180px] h-[40px]">
        <SelectValue placeholder="Edit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="On">On</SelectItem>
        <SelectItem value="Off">Off</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SelectState;
