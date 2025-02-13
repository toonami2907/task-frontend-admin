import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from "@/components/ui/card";
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { RulesErrorBoundary } from './ErrorBoundary';
import { RulesTable } from './RulesTable';
import { ErrorDetailsDialog } from './ErrorDetailsDialog';
import { NoRulesAlert } from './NoRulesAlert';
import { EditRuleDialog } from './RuleEditDialog';

export const RulesList = ({ rules = [], onEdit, onDelete }) => {
  const [editingRule, setEditingRule] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [errorDialog, setErrorDialog] = useState(null);

  const isValidRule = (rule) => {
    return (
      rule &&
      rule._id &&
      rule.name &&
      rule.targetLevel &&
      Array.isArray(rule.conditions) &&
      Array.isArray(rule.actions) &&
      rule.frequency &&
      rule.status
    );
  };

  const validRules = rules.filter(isValidRule);

  return (
    <RulesErrorBoundary>
      <Card className="shadow-sm bg-white rounded-lg border border-gray-200">
        <CardContent className="p-6">
          {!validRules?.length ? (
            <NoRulesAlert />
          ) : (
            <RulesTable 
              rules={validRules}
              onEdit={setEditingRule}
              onDelete={setDeleteConfirm}
              onShowError={setErrorDialog}
            />
          )}
  
          <EditRuleDialog 
            rule={editingRule}
            onClose={() => setEditingRule(null)}
            onSubmit={onEdit}
          />
  
          <DeleteConfirmDialog
            rule={deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={onDelete}
          />
  
          <ErrorDetailsDialog
            error={errorDialog}
            onClose={() => setErrorDialog(null)}
          />
        </CardContent>
      </Card>
    </RulesErrorBoundary>
    );
};

RulesList.propTypes = {
  rules: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      targetLevel: PropTypes.string.isRequired,
      conditions: PropTypes.array.isRequired,
      actions: PropTypes.array.isRequired,
      frequency: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};