import PropTypes from 'prop-types';
import { Card, CardContent } from "@/components/ui/card";

export const MetricsCard = ({ value, label }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="text-3xl font-bold tracking-tight">
              {value.toLocaleString()}
            </div>
            <p className="text-sm font-medium text-gray-500">
              {label}
            </p>
          </div>
          
        </div>
       
      </CardContent>
    </Card>
  );
  

MetricsCard.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};