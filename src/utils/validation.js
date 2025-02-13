// src/utils/validation.js

export const isValidRule = (rule) => {
    return (
      rule &&
      rule._id &&
      rule.name &&
      rule.targetLevel &&
      Array.isArray(rule.conditions) &&
      Array.isArray(rule.actions) &&
      rule.frequency &&
      rule.status
    );
  };
  
  export const validateTimeRange = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }
    
    return start < end;
  };