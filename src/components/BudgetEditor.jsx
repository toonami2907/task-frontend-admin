/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Loader } from 'lucide-react';
import axios from 'axios';
import { API_URL, useGlobalContext } from '@/functions/features/StateProvider';
import {ErrorToast} from '@/hooks/customToast'
import toast from 'react-hot-toast';

const BudgetEditor = ({ initialBudget, campaignId, onClose, onSuccess }) => {
  const [budget, setBudget] = useState('');
  const {fetchAds} = useGlobalContext()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Convert initial budget to string with 2 decimal places
    if (initialBudget) {
      setBudget(Number(initialBudget).toFixed(2));
    }
  }, [initialBudget]);

  const validateBudget = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    if (numValue <= 0) {
      return 'Budget must be greater than 0';
    }
    if (numValue > 1000000) { // Adjust this limit as needed
      return 'Budget exceeds maximum limit';
    }
    return '';
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    setBudget(value);
    setError(validateBudget(value));
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!campaignId) {
      toast.error('Campaign ID is missing');
      return;
    }

    const validationError = validateBudget(budget);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Updating budget...');

    try {
      const response = await axios.post(`${API_URL}/auth/update/camapaign/budget`, {
        campaignId,
        newDailyBudget: Number(budget)
      });

      if (response.data.success) {
        toast.success('Budget updated successfully', { id: toastId });
        onSuccess(Number(budget));
        onClose();
        fetchAds()
      } else {
        throw new Error(response.data.message || 'Failed to update budget');
      }
    } catch (error) {
      toast.dismiss()
      const errorMessage = 'Budget updates for Advantage+ Shopping Campaigns must be made at the ad set level. Please navigate to your ad set settings to modify the budget.';
      if(error.response.data.message === "(#100) Invalid campaign param(daily_budget) to create an ASC ad."){
        // setError(errorMessage);
        
        ErrorToast(errorMessage)
        return
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-64 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Edit Daily Budget</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
            <Input
              type="number"
              value={budget}
              onChange={handleBudgetChange}
              className={`pl-7 ${error ? 'border-red-500' : ''}`}
              placeholder="Enter daily budget"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-1/2"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="w-1/2"
              onClick={handleSubmit}
              disabled={isSubmitting || !budget || !!error}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetEditor;