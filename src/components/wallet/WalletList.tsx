
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Wallet } from '@/services/walletService';

interface WalletListProps {
  wallets: Wallet[];
  isLoading: boolean;
  onEditWallet: (wallet: Wallet) => void;
  onDeleteWallet: (id: string | number) => void;
}

const WalletList: React.FC<WalletListProps> = ({
  wallets,
  isLoading,
  onEditWallet,
  onDeleteWallet
}) => {
  // Ensure wallets is an array
  const safeWallets = Array.isArray(wallets) ? wallets : [];

  return (
    <Card className="card-gradient border-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Wallet Accounts</CardTitle>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Subcategory</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Family Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeWallets.map((wallet) => (
                  <tr key={wallet.id} className="border-b border-fintrack-bg-dark">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{wallet.name}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        wallet.is_expense ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {wallet.wallet_type_name || wallet.type_name || 'Unknown Type'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500">
                        {wallet.category_name || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-500">
                        {wallet.subcategory_name || 'None'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {wallet.family_member_name || 'Not assigned'}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{wallet.date || 'Not specified'}</td>
                    <td className="px-4 py-3 text-sm">{wallet.description || 'No description'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">
                      <span className={wallet.is_expense ? 'text-red-500' : 'text-green-500'}>
                        {formatCurrency(wallet.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEditWallet(wallet)}
                        className="h-8 w-8 text-fintrack-text-secondary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteWallet(wallet.id)}
                        className="h-8 w-8 text-fintrack-text-secondary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {safeWallets.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-fintrack-text-secondary">
                      No wallet accounts found. Add your first wallet account.
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

export default WalletList;
