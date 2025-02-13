/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TargetSection } from '@/sections/TargetSection';
import { useRuleForm } from '@/sections/useRuleForm';
import { ConditionsSection } from '@/sections/ConditionsSection';
import { ActionsSection } from '@/sections/ActionsSection';
import { FrequencySection } from '@/sections/FrequencySection';

export const RuleForm = ({ initialData, onSubmit, footer }) => {
  const { formData, updateFormData, handleSubmit } = useRuleForm(initialData, onSubmit);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rule Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Rule Name</label>
        <Input
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="Enter rule name"
          required
        />
      </div>

      {/* Target Selection */}
      <TargetSection 
        value={formData.targetLevel}
        selectedTargets={formData.targetId}
        onChange={(targetLevel, targetId) => {
          updateFormData('targetLevel', targetLevel);
          updateFormData('targetId', targetId);
        }}
      />

      {/* Conditions */}
      <ConditionsSection
        conditions={formData.conditions}
        onChange={(conditions) => updateFormData('conditions', conditions)}
      />

      {/* Actions */}
      <ActionsSection
        actions={formData.actions}
        onChange={(actions) => updateFormData('actions', actions)}
      />

      {/* Frequency */}
      <FrequencySection
        frequency={formData.frequency}
        frequencyValue={formData.frequencyValue}
        timeRanges={formData.timeRanges}
        onChange={(key, value) => updateFormData(key, value)}
      />

      {footer}
    </form>
  );
};
