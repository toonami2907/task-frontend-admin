/* eslint-disable react/prop-types */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RuleForm } from './RuleForm';

export const EditRuleDialog = ({ rule, onClose, onSubmit }) => {
  if (!rule) return null;

  const handleSubmit = async (updatedData) => {
    await onSubmit(rule._id, updatedData);
    onClose();
  };

  return (
    <Dialog open={!!rule} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Rule: {rule.name}</DialogTitle>
        </DialogHeader>

        <RuleForm 
          initialData={rule}
          onSubmit={handleSubmit}
          footer={
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          }
        />
      </DialogContent>
    </Dialog>
  );
};
