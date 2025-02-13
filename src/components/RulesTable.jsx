
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TABLE_STYLES } from '@/constants/styles';
import PropTypes from 'prop-types';
import { ActionsCell } from './ActionsCell';
import { StatusCell } from './StatusBadge';

export const RulesTable = ({ rules, onEdit, onDelete, onShowError }) => {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className={TABLE_STYLES.header}>
          <TableRow>
            <TableHead className={`${TABLE_STYLES.headerCell} hidden md:table-cell`}>
              Rule Name
            </TableHead>
            <TableHead className="hidden lg:table-cell">Target Level</TableHead>
            <TableHead className="hidden xl:table-cell">Conditions</TableHead>
            <TableHead className="hidden xl:table-cell">Actions</TableHead>
            <TableHead className="hidden lg:table-cell">Frequency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule._id} className={TABLE_STYLES.row}>
              <TableCell className={`${TABLE_STYLES.cell} font-medium`}>
                {rule.name}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {rule.targetLevel}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {rule.conditions?.length || 0} conditions
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {rule.actions?.length || 0} actions
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {rule.frequency}
              </TableCell>
              <StatusCell 
                status={rule.status} 
                onShowError={() => onShowError(rule)} 
              />
              <ActionsCell 
                rule={rule}
                onEdit={() => onEdit(rule)}
                onDelete={() => onDelete(rule)}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

RulesTable.propTypes = {
  rules: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      targetLevel: PropTypes.string.isRequired,
      frequency: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      conditions: PropTypes.array,
      actions: PropTypes.array
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onShowError: PropTypes.func.isRequired
};