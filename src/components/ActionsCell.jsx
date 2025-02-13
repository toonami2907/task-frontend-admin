/* eslint-disable react/prop-types */
import React from 'react';
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Play, Pause } from "lucide-react";
import { useRules } from "@/services/RulesContext";
import toast from "react-hot-toast";

export const ActionsCell = ({ rule, onEdit, onDelete }) => {
  const { changeRuleStatus } = useRules();

  const handleStatusToggle = async () => {
    const newStatus = rule.status === "active" ? "paused" : "active";
    try {
      await changeRuleStatus(rule._id, newStatus);
      toast.success(`Rule ${newStatus === "active" ? "activated" : "paused"} successfully`);
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error(`Failed to ${newStatus === "active" ? "activate" : "pause"} rule`);
    }
  };

  return (
    <TableCell>
      <div className="flex justify-end items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleStatusToggle}>
          {rule.status === "active" ? (
            <Pause className="h-4 w-4 text-amber-500" />
          ) : (
            <Play className="h-4 w-4 text-emerald-500" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete}
          className="text-error-DEFAULT hover:bg-error-light"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  );
};