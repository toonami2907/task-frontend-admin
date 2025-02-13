import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const DeleteConfirmDialog = ({ rule, onClose, onConfirm }) => {
  if (!rule) return null;

  const handleConfirm = () => {
    onConfirm(rule._id);
    onClose();
  };

  return (
    <Dialog open={!!rule} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete Rule</DialogTitle>
        </DialogHeader>
        
        <p className="text-gray-600">
          Are you sure you want to delete the rule "{rule.name}"? 
          This action cannot be undone.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm}>Delete Rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};