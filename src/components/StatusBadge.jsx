import React from 'react';
import { TableCell } from "@/components/ui/table";
import { CheckCircle2, PauseCircle, AlertCircle, AlertTriangle } from "lucide-react";
import PropTypes from 'prop-types';
import { BADGE_STYLES } from '@/constants/styles';

export const StatusCell = ({ status, onShowError }) => {
  const getStatusIcon = (status) => {
    const iconClass = "h-4 w-4 shrink-0";
    
    switch (status) {
      case "active":
        return <CheckCircle2 className={`${iconClass} text-emerald-500`} />;
      case "paused":
        return <PauseCircle className={`${iconClass} text-amber-500`} />;
      case "error":
        return (
          <button
            onClick={onShowError}
            className="inline-flex items-center gap-1 text-red-500 hover:text-red-600"
          >
            <AlertCircle className={iconClass} />
            <AlertTriangle className={`${iconClass} ml-1 cursor-pointer`} />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <TableCell>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[status]}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </span>
    </TableCell>
  );
};

StatusCell.propTypes = {
  status: PropTypes.oneOf(['active', 'paused', 'error']).isRequired,
  onShowError: PropTypes.func.isRequired
};