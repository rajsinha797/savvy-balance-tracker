
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title = 'Recent Transactions'
}) => {
  return (
    <Card className="card-gradient border-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-fintrack-bg-dark">
                <th className="px-6 py-3 text-left text-xs font-medium text-fintrack-text-secondary tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-fintrack-text-secondary tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-fintrack-text-secondary tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-fintrack-text-secondary tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className="border-b border-fintrack-bg-dark hover:bg-fintrack-bg-dark/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.description}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-fintrack-text-secondary">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
