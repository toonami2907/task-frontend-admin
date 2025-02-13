import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ErrorDetailsDialog = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <Dialog open={!!error} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Rule Error Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <h4 className="font-medium mb-2">Rule: {error.name}</h4>
            <p className="text-red-600">
              {error.errorMessage || "An error occurred while executing this rule."}
            </p>
          </div>

          <div className="text-sm text-gray-500">
            <p>
              Last error occurred:{" "}
              {error.lastErrorTime 
                ? new Date(error.lastErrorTime).toLocaleString() 
                : "Unknown"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};