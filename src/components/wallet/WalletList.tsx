
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
  onDeleteWallet,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {wallets.length === 0 ? (
          <div className="text-center p-8 text-fintrack-text-secondary">
            No wallet accounts found. Add your first wallet to get started.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-fintrack-text-secondary border-b border-fintrack-bg-dark">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Subcategory</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Owner</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr 
                    key={wallet.id} 
                    className="border-b border-fintrack-bg-dark/40 hover:bg-fintrack-bg-dark/20"
                  >
                    <td className="py-3 font-medium">{wallet.name}</td>
                    <td className="py-3">₹{formatCurrency(wallet.amount)}</td>
                    <td className="py-3">{wallet.wallet_type_name || wallet.type_name}</td>
                    <td className="py-3">{wallet.wallet_category_name}</td>
                    <td className="py-3">{wallet.wallet_sub_category_name}</td>
                    <td className="py-3">{wallet.date || '-'}</td>
                    <td className="py-3">{wallet.family_member || '-'}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditWallet(wallet)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteWallet(wallet.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletList;
