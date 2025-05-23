
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { IncomeItem } from '@/services/incomeService';

interface IncomeListProps {
  incomes: IncomeItem[];
  isLoading: boolean;
  onEditIncome: (income: IncomeItem) => void;
  onDeleteIncome: (id: string | number) => void;
  categoryIdMap: Record<string, number>;
}

const IncomeList: React.FC<IncomeListProps> = ({
  incomes = [], // Provide default empty array
  isLoading,
  onEditIncome,
  onDeleteIncome,
  categoryIdMap = {}, // Provide default empty object
}) => {
  // Ensure incomes is an array
  const safeIncomes = Array.isArray(incomes) ? incomes : [];

  // Debug the income data to understand what's happening
  console.log("Income data in IncomeList:", safeIncomes);

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
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Subcategory</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Family Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeIncomes.map((income) => {
                  // Ensure amount is treated as a number
                  const amount = typeof income.amount === 'number' ? income.amount : 
                                 (typeof income.amount === 'string' ? parseFloat(income.amount) : 0);
                                 
                  return (
                    <tr key={income.id} className="border-b border-fintrack-bg-dark">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{income.date}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500">
                          {income.income_type_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500">
                          {income.income_category_name || income.category || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-500">
                          {income.income_sub_category_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {income.family_member || "Not assigned"}
                      </td>
                      <td className="px-4 py-3 text-sm">{income.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-500 text-right">
                        ₹{amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            onEditIncome(income);
                          }}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDeleteIncome(String(income.id))}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {safeIncomes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-fintrack-text-secondary">
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

// Helper function to format date for the edit form (ensure YYYY-MM-DD format)
const formatDateForForm = (dateString: string): string => {
  if (!dateString) return '';
  
  // If date is already in YYYY-MM-DD format, return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    // Handle DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse any other format using Date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Error parsing date:', e);
  }
  
  return dateString;
};

export default IncomeList;
