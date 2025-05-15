import AddCompanyDialog from './addcomapny';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CompanyDialogDemo({ setHasSubmit }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Button className="text-lg h-11" onClick={() => setOpen(true)}>
        Add New
      </Button>
      <AddCompanyDialog 
        open={open} 
        onOpenChange={setOpen}
        setHasSubmit={setHasSubmit}
      />
    </div>
  );
}