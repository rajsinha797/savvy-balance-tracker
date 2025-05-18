
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Wallet as WalletIcon, PiggyBank, CreditCard } from 'lucide-react';

interface WalletSummaryProps {
  totalSpending: number;
  totalSavings: number;
  totalDebt: number;
  selectedFamilyMemberName: string | null;
}

const WalletSummary = ({ 
  totalSpending, 
  totalSavings, 
  totalDebt,
  selectedFamilyMemberName 
}: WalletSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <WalletIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium">Spending Wallets</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalSpending)}</h3>
            <p className="text-xs mt-1 text-blue-100">
              {selectedFamilyMemberName 
                ? `${selectedFamilyMemberName}'s spending accounts` 
                : 'All spending accounts'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none text-white">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium">Savings Wallets</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalSavings)}</h3>
            <p className="text-xs mt-1 text-green-100">
              {selectedFamilyMemberName 
                ? `${selectedFamilyMemberName}'s savings accounts` 
                : 'All savings accounts'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500 to-red-600 border-none text-white">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium">Debt Wallets</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalDebt)}</h3>
            <p className="text-xs mt-1 text-red-100">
              {selectedFamilyMemberName 
                ? `${selectedFamilyMemberName}'s debt accounts` 
                : 'All debt accounts'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletSummary;
