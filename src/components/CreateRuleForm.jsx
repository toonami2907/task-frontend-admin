import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X } from "lucide-react";
import api from "@/functions/resources/axiosConfig";
import { TimePicker } from "./TimePicker";
import { ErrorToast } from "@/hooks/customToast";
import toast from "react-hot-toast";
import { conditionConfig, daysConfig } from "@/lib/rule.config";
import { cn } from "@/lib/utils";

export const CreateRuleForm = ({ isOpen, onClose, onSubmit }) => {
  const [showTimeRange, setShowTimeRange] = useState(false);
  const [activeTargetLevel, setActiveTargetLevel] =
    useState("campaign");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    targetId: [],
    conditions: [],
    actions: [],
    frequency: "",
    frequencyValue: 1,
    targetLevel: activeTargetLevel,
    timeRanges: [],
    status: "active",
    activeDays: [],
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        targetId: [],
        conditions: [],
        actions: [],
        frequency: "",
        frequencyValue: 1,
        targetLevel: "",
        timeRanges: [],
        status: "active",
      });
      toast.success("Rule Created sucessfully");
      onClose();
    } catch (error) {
      console.error("error", error?.message);
      return ErrorToast(
        error?.message || "error while creating a rule "
      );
    }
  };
  const handleTargetSearch = async (searchTerm) => {
    setSearchTerm(searchTerm);
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const [campaigns, adSets, ads] = await Promise.all([
        api.get("/auth/db/campaigns"),
        api.get("/auth/db/ads_set"),
        api.get("/auth/db/ads"),
      ]);

      const searchValue = searchTerm.toLowerCase();

      const results = [
        ...campaigns.data.map((c) => ({
          id: c.campaignId,
          name: c.campaignName,
          level: "campaign",
        })),
        ...adSets.data.map((a) => ({
          id: a.adSetId,
          name: a.adSetName,
          level: "adSet",
        })),
        ...ads.data.map((a) => ({
          id: a.adId,
          name: a.adName,
          level: "ad",
        })),
      ].filter((item) =>
        item.name.toLowerCase().includes(searchValue)
      );

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addCondition = () => {
    const now = new Date();
    const start = new Date(now.setHours(9, 0, 0));
    const end = new Date(now.setHours(17, 0, 0));

    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: crypto.randomUUID(),
          metric: "",
          operator: "",
          value: "",
          timeframe: "",
          timeRanges: [{ start, end }], // Initialize with default time range
          logicalOperator: prev.conditions.length > 0 ? "AND" : "",
        },
      ],
    }));
  };
  const updateCondition = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition) =>
        condition.id === id
          ? { ...condition, [field]: value }
          : condition
      ),
    }));
  };

  const removeCondition = (id) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter(
        (condition) => condition.id !== id
      ),
    }));
  };

  const addAction = () => {
    setFormData((prev) => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          id: crypto.randomUUID(),
          type: "",
          value: "",
          customValue: "",
        },
      ],
    }));
  };

  const updateAction = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.map((action) =>
        action.id === id ? { ...action, [field]: value } : action
      ),
    }));
  };

  const removeAction = (id) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((action) => action.id !== id),
    }));
  };
  const addTimeRange = () => {
    const now = new Date();
    const start = new Date(now.setHours(9, 0, 0));
    const end = new Date(now.setHours(17, 0, 0));

    setFormData((prev) => ({
      ...prev,
      timeRanges: [
        ...prev.timeRanges,
        {
          id: crypto.randomUUID(),
          startTime: start,
          endTime: end,
        },
      ],
    }));
  };

  const updateTimeRange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      timeRanges: prev.timeRanges.map((range) =>
        range.id === id ? { ...range, [field]: value } : range
      ),
    }));
  };

  const removeTimeRange = (id) => {
    setFormData((prev) => ({
      ...prev,
      timeRanges: prev.timeRanges.filter((range) => range.id !== id),
    }));
  };

  const getActionOptions = (actionType) => {
    switch (actionType) {
      case "change_budget":
        return (
          <>
            <SelectItem value="increase_percent">
              Increase by %
            </SelectItem>
            <SelectItem value="decrease_percent">
              Decrease by %
            </SelectItem>
            <SelectItem value="increase_fixed">
              Increase by fixed amount
            </SelectItem>
            <SelectItem value="decrease_fixed">
              Decrease by fixed amount
            </SelectItem>
            <SelectItem value="set_fixed">
              Set to fixed amount
            </SelectItem>
          </>
        );
      case "change_status":
        return (
          <>
            <SelectItem value="active">Set Active</SelectItem>
            <SelectItem value="paused">Set Paused</SelectItem>
          </>
        );
      case "change_name":
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
  const renderConditionValue = (condition) => {
    const metric = conditionConfig.metrics[condition.metric];
    if (!metric) return null;

    switch (metric.valueType) {
      case "number":
        return (
          <Input
            type="number"
            value={condition.value}
            onChange={(e) =>
              updateCondition(condition.id, "value", e.target.value)
            }
            placeholder="Value"
            className="w-1/4"
          />
        );

      case "timeRange":
        return (
          <div className="flex gap-2 items-center">
            <TimePicker
              value={condition.timeRanges[0].start}
              onChange={(value) =>
                updateCondition(condition.id, "timeRanges", [
                  { ...condition.timeRanges[0], start: value },
                ])
              }
              label="Start"
            />
            <span>to</span>
            <TimePicker
              value={condition.timeRanges[0].end}
              onChange={(value) =>
                updateCondition(condition.id, "timeRanges", [
                  { ...condition.timeRanges[0], end: value },
                ])
              }
              label="End"
            />
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={condition.value}
            onChange={(e) =>
              updateCondition(condition.id, "value", e.target.value)
            }
            placeholder="Value"
            className="w-1/4"
          />
        );
    }
  };
  const renderConditions = () => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">
          Conditions
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCondition}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
      </div>
      {formData.conditions.map((condition, index) => (
        <div key={condition.id} className="space-y-2 mb-4">
          {index > 0 && (
            <Select
              value={condition.logicalOperator}
              onValueChange={(value) =>
                updateCondition(
                  condition.id,
                  "logicalOperator",
                  value
                )
              }
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          )}
          <div className="flex gap-2 items-center">
            <Select
              value={condition.metric}
              onValueChange={(value) =>
                updateCondition(condition.id, "metric", value)
              }
            >
              <SelectTrigger className="w-1/3">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(conditionConfig.metrics).map(
                  ([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {condition.metric && (
              <Select
                value={condition.operator}
                onValueChange={(value) =>
                  updateCondition(condition.id, "operator", value)
                }
              >
                <SelectTrigger className="w-1/3">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {conditionConfig.metrics[
                    condition.metric
                  ].operators.map((op) => (
                    <SelectItem key={op} value={op}>
                      {conditionConfig.operators[op]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {condition.metric === "spend" && (
              <Select
                value={condition.timeframe}
                onValueChange={(value) =>
                  updateCondition(condition.id, "timeframe", value)
                }
              >
                <SelectTrigger className="w-1/3">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {conditionConfig.metrics.spend.timeframes.map(
                    (timeframe) => (
                      <SelectItem key={timeframe} value={timeframe}>
                        {timeframe.replace("_", " ").toLowerCase()}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}

            {condition.operator && renderConditionValue(condition)}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeCondition(condition.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTargetSelection = () => (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search campaigns, ad sets, or ads..."
          value={searchTerm}
          onChange={(e) => handleTargetSearch(e.target.value)}
          className="pr-10"
        />
        {loading ? (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
          </div>
        ) : (
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
          <div className="flex items-center gap-2 p-2 border-b">
            <input
              type="checkbox"
              id="select-all"
              checked={
                formData.targetId.length === searchResults.length
              }
              onChange={(e) => {
                const newTargetId = e.target.checked
                  ? searchResults.map((item) => item.id)
                  : [];
                setFormData((prev) => ({
                  ...prev,
                  targetId: newTargetId,
                }));
              }}
              className="rounded border-gray-300"
            />
            <label htmlFor="select-all" className="font-medium">
              Select All Results
            </label>
          </div>

          {searchResults.map((result) => (
            <div
              key={result.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                id={result.id}
                checked={formData.targetId.includes(result.id)}
                onChange={() => {
                  setFormData((prev) => ({
                    ...prev,
                    targetId: prev.targetId.includes(result.id)
                      ? prev.targetId.filter(
                          (targetId) => targetId !== result.id
                        )
                      : [...prev.targetId, result.id],
                  }));
                }}
                className="rounded border-gray-300"
              />
              <label
                htmlFor={result.id}
                className="flex-1 cursor-pointer"
              >
                <div className="text-sm font-medium">
                  {result.name}{" "}
                  <span className="text-gray-500">
                    [{result.level}]
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {result.id}
                </div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Rule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Rule Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Enter rule name"
              required
            />
          </div>

          {renderTargetSelection()}

          {/* Your existing conditions, actions, frequency sections */}
          {renderConditions()}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Actions
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </div>
            {formData.actions.map((action) => (
              <div
                key={action.id}
                className="flex gap-2 mb-2 items-center"
              >
                <Select
                  value={action.type}
                  onValueChange={(value) =>
                    updateAction(action.id, "type", value)
                  }
                >
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="change_budget">
                      Change Budget
                    </SelectItem>
                    <SelectItem value="change_status">
                      Change Status
                    </SelectItem>
                    <SelectItem value="change_name">
                      Change Name
                    </SelectItem>
                    <SelectItem value="send_notification">
                      Send Notification
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={action.value}
                  onValueChange={(value) =>
                    updateAction(action.id, "value", value)
                  }
                >
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    {getActionOptions(action.type)}
                  </SelectContent>
                </Select>

                {/* Custom input based on action type */}
                {(action.type === "change_budget" ||
                  action.type === "change_name") && (
                  <Input
                    type={
                      action.type === "change_budget"
                        ? "number"
                        : "text"
                    }
                    value={action.customValue || ""}
                    onChange={(e) =>
                      updateAction(
                        action.id,
                        "customValue",
                        e.target.value
                      )
                    }
                    placeholder={
                      action.type === "change_budget"
                        ? "Enter amount"
                        : "Enter text"
                    }
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
          <div className="mt-4">
            <label className="block text-sm font-medium">
              Active Days
            </label>
            <div className="flex gap-2 mt-2">
              {daysConfig.days.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={
                    formData.activeDays.includes(day.value)
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      activeDays: prev.activeDays.includes(day.value)
                        ? prev.activeDays.filter(
                            (d) => d !== day.value
                          )
                        : [...prev.activeDays, day.value],
                    }));
                  }}
                >
                  {day.label.substring(0, 3)}
                </Button>
              ))}
            </div>
          </div>
          {/* FREQUENCY SECTION */}
          <div className="flex gap-2 items-center">
            <Select
              value={formData.frequency}
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  frequency: value,
                }));
                setShowTimeRange(
                  ["minutes", "hourly", "daily", "weekly"].includes(
                    value
                  )
                );
              }}
            >
              <SelectTrigger className="w-1/3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Every</span>
              <Input
                type="number"
                value={formData.frequencyValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequencyValue: parseInt(e.target.value) || 1,
                  }))
                }
                min="1"
                className="w-20"
              />
              <span className="text-sm font-medium">
                {formData.frequency
                  ? formData.frequency.replace(/ly$/, "")
                  : ""}
              </span>
            </div>
          </div>
          {showTimeRange && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Time Ranges
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTimeRange}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Range
                </Button>
              </div>
              {formData.timeRanges.map((range) => (
                <div
                  key={range.id}
                  className="flex gap-2 mb-2 items-center"
                >
                  <TimePicker
                    value={range.startTime}
                    onChange={(value) =>
                      updateTimeRange(range.id, "startTime", value)
                    }
                    label="Start Time"
                  />
                  <span>to</span>
                  <TimePicker
                    value={range.endTime}
                    onChange={(value) =>
                      updateTimeRange(range.id, "endTime", value)
                    }
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formData.targetId.length === 0}
            >
              Create Rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

CreateRuleForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CreateRuleForm;
