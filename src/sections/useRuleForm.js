import { useState } from 'react';

export const useRuleForm = (initialData, onSubmit) => {
  const [formData, setFormData] = useState(initialData);

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return {
    formData,
    updateFormData,
    handleSubmit
  };
};
