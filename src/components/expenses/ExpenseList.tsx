
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Wallet } from 'lucide-react';
import { ExpenseItem } from '@/services/expenseService';

interface ExpenseListProps {
  expenses: ExpenseItem[];
  isLoading: boolean;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: string | number) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses = [], // Provide default empty array
  isLoading,
  onEditExpense,
  onDeleteExpense
}) => {
  // Ensure expenses is an array
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Debug the expense data
  console.log("Expense data in ExpenseList:", safeExpenses);

  return (
    <Card className="card-gradient border-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Expense Entries</CardTitle>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Wallet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeExpenses.map((expense) => {
                  // Ensure amount is treated as a number
                  const amount = typeof expense.amount === 'number' ? expense.amount : 
                                (typeof expense.amount === 'string' ? parseFloat(expense.amount) : 0);
                                 
                  return (
                    <tr key={expense.id} className="border-b border-fintrack-bg-dark">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{expense.date}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-500/10 text-yellow-500">
                          {expense.expense_type_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500/10 text-red-500">
                          {expense.expense_category_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-500">
                          {expense.expense_sub_category_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {expense.family_member || "Not assigned"}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {expense.wallet_name ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500">
                            <Wallet className="h-3 w-3 mr-1" /> {expense.wallet_name}
                          </span>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{expense.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-red-500 text-right">
                        ₹{amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            onEditExpense(expense);
                          }}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDeleteExpense(String(expense.id))}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {safeExpenses.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-fintrack-text-secondary">
                      No expense entries found. Add your first expense entry.
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

export default ExpenseList;
