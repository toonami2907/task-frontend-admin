import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useGlobalContext } from '@/context/StateProvider';

const COMPANY_NATURES = [
  "Tech",
  "Retail",
  "Healthcare",
  "Finance",
  "Education",
  "Hospitality",
  "Logistics",
  "Construction",
  "Government",
  "Non-profit",
  "Other"
];

// Define Zod schema for validation
const companySchema = z.object({
  name: z.string().min(1, "Company name is required").max(100, "Company name must be 100 characters or less"),
  nature: z.string().min(1, "Company nature is required").max(100, "Company nature must be 100 characters or less"),
  natureOther: z.string().optional()
}).refine((data) => {
  if (data.nature === "Other") {
    return !!data.natureOther && data.natureOther.trim().length > 0;
  }
  return true;
}, {
  message: "Please specify company nature",
  path: ["natureOther"]
});

const AddCompanyDialog = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    nature: '',
    natureOther: ''
  });
  const [errors, setErrors] = useState({ name: '', nature: '', natureOther: '' });
  const { addCompany } = useGlobalContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the field being edited
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = async () => {
    // Validate form data using Zod
    const validationResult = companySchema.safeParse(formData);
    
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name ? fieldErrors.name[0] : '',
        nature: fieldErrors.nature ? fieldErrors.nature[0] : '',
        natureOther: fieldErrors.natureOther ? fieldErrors.natureOther[0] : '',
      });
      return;
    }

    try {
      // Show loading toast
      const toastId = toast.loading("Saving company...");

      // Add new company with a unique ID (using Date.now() as a simple ID)
      const newCompany = { id: Date.now(), ...formData };
      addCompany(newCompany);

      // Update success toast and reset form
      toast.success("Company created successfully!", { id: toastId });
      setFormData({ name: '', nature: '', natureOther: '' });
      setErrors({ name: '', nature: '', natureOther: '' });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save company. Please try again.", { id: toast.loading("Saving company...") });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg text-black font-medium">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Company</DialogTitle>
          <DialogDescription className="text-sm font-semibold">
            Each new company has its own teams
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base text-black font-semibold">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Company Name"
              value={formData.name}
              onChange={handleChange}
              className={clsx(
                "w-full focus-visible:border-black h-10 focus-visible:ring-0 focus-visible:border shadow-none placeholder:text-md placeholder:font-medium",
                errors.name && "border-red-500"
              )}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nature" className="text-base text-black font-semibold">Nature</Label>
            <select
              id="nature"
              name="nature"
              value={formData.nature}
              onChange={handleChange}
              className={clsx(
                "w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black",
                errors.nature && "border-red-500"
              )}
            >
              <option value="">Select company nature</option>
              {COMPANY_NATURES.map((nature) => (
                <option key={nature} value={nature}>{nature}</option>
              ))}
            </select>
            {errors.nature && <p className="text-red-500 text-sm mt-1">{errors.nature}</p>}
          </div>
          {formData.nature === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="natureOther" className="text-base text-black font-semibold">Specify Nature</Label>
              <Input
                id="natureOther"
                name="natureOther"
                placeholder="Type company nature"
                value={formData.natureOther}
                onChange={handleChange}
                className={clsx(
                  "w-full focus-visible:border-black font-medium h-10 focus-visible:ring-0 focus-visible:border shadow-none placeholder:text-md placeholder:font-medium",
                  errors.natureOther && "border-red-500"
                )}
              />
              {errors.natureOther && <p className="text-red-500 text-sm mt-1">{errors.natureOther}</p>}
            </div>
          )}
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-black text-white hover:bg-gray-800"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompanyDialog;
