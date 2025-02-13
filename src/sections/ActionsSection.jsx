/* eslint-disable react/prop-types */
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

export const ActionsSection = ({ actions = [], onChange }) => {
  const addAction = () => {
    const newAction = {
      id: crypto.randomUUID(),
      type: "",
      value: "",
      customValue: "",
    };
    onChange([...actions, newAction]);
  };

  const updateAction = (id, field, value) => {
    onChange(actions.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const removeAction = (id) => {
    onChange(actions.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">Actions</label>
        <Button type="button" variant="outline" size="sm" onClick={addAction}>
          <Plus className="h-4 w-4 mr-2" />
          Add Action
        </Button>
      </div>

      {actions.map((action) => (
        <div key={action.id} className="flex gap-2 mb-2 items-center">
          <Select
            value={action.type}
            onValueChange={(value) => updateAction(action.id, 'type', value)}
          >
            <SelectTrigger className="w-1/3">
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="change_budget">Change Budget</SelectItem>
              <SelectItem value="change_status">Change Status</SelectItem>
              <SelectItem value="change_name">Change Name</SelectItem>
              <SelectItem value="send_notification">Send Notification</SelectItem>
            </SelectContent>
          </Select>

          {action.type && (
            <Select
              value={action.value}
              onValueChange={(value) => updateAction(action.id, 'value', value)}
            >
              <SelectTrigger className="w-1/3">
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                {getActionValueOptions(action.type)}
              </SelectContent>
            </Select>
          )}

          {shouldShowCustomValue(action.type) && (
            <Input
              type={action.type === 'change_budget' ? 'number' : 'text'}
              value={action.customValue}
              onChange={(e) => updateAction(action.id, 'customValue', e.target.value)}
              placeholder={getCustomValuePlaceholder(action.type)}
              className="w-1/4"
            />
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeAction(action.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

const getActionValueOptions = (type) => {
  switch (type) {
    case 'change_budget':
      return (
        <>
          <SelectItem value="increase_percent">Increase by %</SelectItem>
          <SelectItem value="decrease_percent">Decrease by %</SelectItem>
          <SelectItem value="increase_fixed">Increase by fixed amount</SelectItem>
          <SelectItem value="decrease_fixed">Decrease by fixed amount</SelectItem>
          <SelectItem value="set_fixed">Set to fixed amount</SelectItem>
        </>
      );
    case 'change_status':
      return (
        <>
          <SelectItem value="active">Set Active</SelectItem>
          <SelectItem value="paused">Set Paused</SelectItem>
        </>
      );
    case 'change_name':
      return (
        <>
          <SelectItem value="prefix">Add prefix</SelectItem>
          <SelectItem value="suffix">Add suffix</SelectItem>
        </>
      );
    default:
      return null;
  }
};

const shouldShowCustomValue = (type) => {
  return ['change_budget', 'change_name'].includes(type);
};

const getCustomValuePlaceholder = (type) => {
  return type === 'change_budget' ? 'Enter amount' : 'Enter text';
};
