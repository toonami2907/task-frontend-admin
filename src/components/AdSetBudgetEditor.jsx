/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {ErrorToast} from '@/hooks/customToast'
import axios from 'axios';
import { API_URL, useGlobalContext } from '@/functions/features/StateProvider';

const AdSetBudgetEditor = ({ initialBudget, adSetId, onClose, onSuccess }) => {
  const [budget, setBudget] = useState(initialBudget);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {fetchAds} = useGlobalContext()

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/auth/update/ads_set/budget`, {
        adSetId,
        budget: Number(budget * 100)
      });

      if (response.status === 200) {
        onSuccess(budget);
        onClose();
        fetchAds()
      }
    } catch (error) {
      if(error.response.data.message === "Can't Set Ad Set and Campaign Budget"){
       ErrorToast("Budget cannot be updated for this ad set because it uses Campaign Budget Optimization (CBO). Please update the budget at the campaign level instead.")
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
          <h3 className="text-sm font-medium">Edit Ad Set Daily Budget</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
              onChange={(e) => setBudget(e.target.value)}
              className="pl-7"
              placeholder="Enter daily budget"
              min="0"
              
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-1/2"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="w-1/2"
              onClick={handleSubmit}
              disabled={isSubmitting || !budget}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdSetBudgetEditor;