
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  className,
}) => {
  return (
    <Card className={`card-gradient border-none overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-fintrack-text-secondary">{title}</CardTitle>
        {icon && <div className="h-8 w-8 p-1 rounded-full bg-fintrack-purple/20 flex items-center justify-center">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                  trend === 'up' ? 'text-green-500 bg-green-500/10' : 
                  trend === 'down' ? 'text-red-500 bg-red-500/10' : 
                  'text-fintrack-text-secondary bg-fintrack-text-secondary/10'
                }`}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
              </span>
            )}
            {description && <p className="text-sm text-fintrack-text-secondary">{description}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
