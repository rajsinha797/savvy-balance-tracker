
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { IncomeItem } from '@/services/incomeService';

interface IncomeListProps {
  incomes: IncomeItem[];
  isLoading: boolean;
  onEditIncome: (income: IncomeItem, categoryId: number) => void;
  onDeleteIncome: (id: string) => void;
  categoryIdMap: Record<string, number>;
}

const IncomeList: React.FC<IncomeListProps> = ({
  incomes,
  isLoading,
  onEditIncome,
  onDeleteIncome,
  categoryIdMap,
}) => {
  return (
    <Card className="card-gradient border-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Income Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-fintrack-bg-dark">
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Family Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id} className="border-b border-fintrack-bg-dark">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{income.date}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500">
                        {income.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {income.family_member || "Not assigned"}
                    </td>
                    <td className="px-4 py-3 text-sm">{income.description}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-500 text-right">
                      ₹{income.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const categoryId = categoryIdMap[income.category] || 0;
                          onEditIncome(income, categoryId);
                        }}
                        className="h-8 w-8 text-fintrack-text-secondary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteIncome(income.id)}
                        className="h-8 w-8 text-fintrack-text-secondary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {incomes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-fintrack-text-secondary">
                      No income entries found. Add your first income entry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeList;
