
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IncomeSummaryProps {
  totalIncome: number;
  averageIncome: number;
  entriesCount: number;
  selectedFamilyMemberName: string | null;
}

const IncomeSummary: React.FC<IncomeSummaryProps> = ({
  totalIncome,
  averageIncome,
  entriesCount,
  selectedFamilyMemberName,
}) => {
  // Ensure the values are numbers before calling toFixed
  const formattedTotal = typeof totalIncome === 'number' ? totalIncome.toFixed(2) : '0.00';
  const formattedAverage = typeof averageIncome === 'number' ? averageIncome.toFixed(2) : '0.00';

  return (
    <Card className="card-gradient border-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Income Summary {selectedFamilyMemberName && `- ${selectedFamilyMemberName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-fintrack-bg-dark p-4 rounded-xl">
            <div className="text-sm text-fintrack-text-secondary mb-1">Total Income</div>
            <div className="text-xl font-bold text-green-500">
              ₹{formattedTotal}
            </div>
          </div>
          <div className="bg-fintrack-bg-dark p-4 rounded-xl">
            <div className="text-sm text-fintrack-text-secondary mb-1">Average Income</div>
            <div className="text-xl font-bold text-fintrack-purple">
              ₹{formattedAverage}
            </div>
          </div>
          <div className="bg-fintrack-bg-dark p-4 rounded-xl">
            <div className="text-sm text-fintrack-text-secondary mb-1">Number of Entries</div>
            <div className="text-xl font-bold">{entriesCount}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeSummary;
