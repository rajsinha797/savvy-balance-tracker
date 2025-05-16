
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseSummaryProps {
  totalExpense: number;
  averageExpense: number;
  entriesCount: number;
  selectedFamilyMemberName: string | null;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  totalExpense,
  averageExpense,
  entriesCount,
  selectedFamilyMemberName,
}) => {
  console.log("Expense summary values:", { totalExpense, averageExpense, entriesCount });
  
  // Ensure the values are numbers and parse them properly
  const formattedTotal = typeof totalExpense === 'number' ? parseFloat(String(totalExpense)).toFixed(2) : '0.00';
  const formattedAverage = typeof averageExpense === 'number' ? parseFloat(String(averageExpense)).toFixed(2) : '0.00';

  return (
    <Card className="card-gradient border-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Expense Summary {selectedFamilyMemberName && `- ${selectedFamilyMemberName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-fintrack-bg-dark p-4 rounded-xl">
            <div className="text-sm text-fintrack-text-secondary mb-1">Total Expenses</div>
            <div className="text-xl font-bold text-red-500">
              ₹{formattedTotal}
            </div>
          </div>
          <div className="bg-fintrack-bg-dark p-4 rounded-xl">
            <div className="text-sm text-fintrack-text-secondary mb-1">Average Expense</div>
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

export default ExpenseSummary;
