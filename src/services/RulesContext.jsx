import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { apiService } from './api';

const initialState = {
  rules: [],
  metrics: {
    activeRules: 0,
    triggeredLast24h: 0,
    budgetChangesWeek: 0,
    campaignsTurnedOff: 0,
  },
  loading: false,
  error: null,
};

const RulesContext = createContext();

function rulesReducer(state, action) {
  switch (action.type) {
    case 'SET_RULES':
      return { ...state, rules: action.payload };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'ADD_RULE':
      return { ...state, rules: [...state.rules, action.payload] };
    case 'UPDATE_RULE':
      return {
        ...state,
        rules: state.rules.map((rule) =>
          rule._id === action.payload._id ? action.payload : rule
        ),
      };
    case 'DELETE_RULE':
      return {
        ...state,
        rules: state.rules.filter((rule) => rule._id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function RulesProvider({ children }) {
  const [state, dispatch] = useReducer(rulesReducer, initialState);
  const [allRules, setAllRules] = useState([]);

  const refreshRules = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const [rules, metrics] = await Promise.all([
        apiService.getRules(),
        apiService.getMetrics(),
      ]);
      setAllRules(rules);
      dispatch({ type: 'SET_RULES', payload: rules });
      dispatch({ type: 'SET_METRICS', payload: metrics });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const changeRuleStatus = async (ruleId, status) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const NewStatus = await apiService.ruleStatus(ruleId,status);
      dispatch({ type: 'UPDATE_RULE', payload: NewStatus });
      await refreshRules(); // Refresh data after update
      await refreshRules();
      return NewStatus;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error; // Propagate error to component for handling
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  const createRule = async (rule) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const newRule = await apiService.createRule(rule);
      dispatch({ type: 'ADD_RULE', payload: newRule });
      await refreshRules(); // Refresh data after creation
      return newRule;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error; // Propagate error to component for handling
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateRule = async (id, rule) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const updatedRule = await apiService.updateRule(id, rule);
      dispatch({ type: 'UPDATE_RULE', payload: updatedRule });
      await refreshRules(); // Refresh data after update
      return updatedRule;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteRule = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      await apiService.deleteRule(id);
      dispatch({ type: 'DELETE_RULE', payload: id });
      await refreshRules(); // Refresh data after deletion
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshRules();
  }, []);

  const value = {
    state,
    dispatch,
    refreshRules,
    allRules,
    createRule,
    updateRule,
    deleteRule,
    changeRuleStatus,
    loading: state.loading,
    error: state.error,
  };

  return (
    <RulesContext.Provider value={value}>
      {children}
    </RulesContext.Provider>
  );
}

RulesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useRules = () => {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
};