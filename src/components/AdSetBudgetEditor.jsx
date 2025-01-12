import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/functions/features/StateProvider';

const AdSetBudgetEditor = ({ initialBudget, adSetId, onClose, onSuccess }) => {
  const [budget, setBudget] = useState(initialBudget);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/auth/update/adset/budget`, {
        adSetId,
        budget: parseFloat(budget)
      });

      if (response.status === 200) {
        onSuccess(budget);
        onClose();
      }
    } catch (error) {
      console.error('Failed to update ad set budget:', error);
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
              step="0.01"
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