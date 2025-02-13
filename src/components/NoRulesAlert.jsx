import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export const NoRulesAlert = () => (
  <Alert className="bg-gray-50 border-gray-200">
    <AlertDescription className="text-base leading-relaxed">
      No rules found. Create a rule to get started.
    </AlertDescription>
  </Alert>
);
