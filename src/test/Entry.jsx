import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Loader2,
} from "lucide-react";
import { MetricsCard } from "@/components/MetricCard";
import { RulesList } from "@/components/MetricsCard";
import CreateRuleForm from "@/components/CreateRuleForm";
import { useRules } from "@/services/RulesContext";


export default function RulesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { state, createRule, updateRule, deleteRule } = useRules();
  const { rules, metrics, loading } = state;
  const UserId = localStorage.getItem("UserId");

  

  const handleCreateRule = async (ruleData) => {
    await createRule(ruleData);
    setIsCreateModalOpen(false);
  };

  const handleEditRule = async (ruleId, updatedData) => {
    try {
      await updateRule(ruleId, updatedData);
    } catch (error) {
      console.error("Error updating rule:", error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
      await deleteRule(ruleId);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg font-medium">
            Loading rules...
          </span>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50/40">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Automation Rules
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your campaign automation rules and monitor their
              performance
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-sm"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            value={metrics.activeRules}
            label="Active Rules"
          />
          <MetricsCard
            value={metrics.triggeredLast24h}
            label="Triggered (24h)"
          />
          <MetricsCard
            value={metrics.budgetChangesWeek}
            label="Budget Changes (Week)"
          />
          <MetricsCard
            value={metrics.campaignsTurnedOff}
            label="Campaigns Turned Off"
          />
        </div>

        {/* Rules List */}
        <div className="bg-white rounded-lg shadow-sm">
          <RulesList
            rules={rules}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
          />
        </div>

        {/* Create Rule Form */}
        <CreateRuleForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateRule}
        />
      </div>
    </div>
  );
}
