/* eslint-disable react/prop-types */
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { conditionConfig } from "@/lib/rule.config";

export const ConditionsSection = ({ conditions = [], onChange }) => {
  const addCondition = () => {
    const newCondition = {
      id: crypto.randomUUID(),
      metric: "",
      operator: "",
      value: "",
      timeframe: "",
      logicalOperator: conditions.length > 0 ? "AND" : "",
    };
    onChange([...conditions, newCondition]);
  };

  const updateCondition = (id, field, value) => {
    onChange(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const removeCondition = (id) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">Conditions</label>
        <Button type="button" variant="outline" size="sm" onClick={addCondition}>
          <Plus className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
      </div>

      {conditions.map((condition, index) => (
        <div key={condition.id} className="space-y-2 mb-4">
          {index > 0 && (
            <Select
              value={condition.logicalOperator}
              onValueChange={(value) => updateCondition(condition.id, 'logicalOperator', value)}
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
              onValueChange={(value) => updateCondition(condition.id, 'metric', value)}
            >
              <SelectTrigger className="w-1/3">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(conditionConfig.metrics).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {condition.metric && (
              <Select
                value={condition.operator}
                onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
              >
                <SelectTrigger className="w-1/3">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {conditionConfig.metrics[condition.metric]?.operators?.map(op => (
                    <SelectItem key={op} value={op}>
                      {conditionConfig.operators[op]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {condition.operator && (
              <Input
                type="number"
                value={condition.value}
                onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                placeholder="Value"
                className="w-1/4"
              />
            )}

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
};