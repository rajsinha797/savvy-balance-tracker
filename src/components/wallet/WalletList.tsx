
import React from 'react';
import { Wallet } from '@/services/walletService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WalletListProps {
  wallets: Wallet[];
  isLoading: boolean;
  onEditWallet: (wallet: Wallet) => void;
  onDeleteWallet: (id: string | number) => void;
}

const WalletList = ({ wallets, isLoading, onEditWallet, onDeleteWallet }: WalletListProps) => {
  if (isLoading) {
    return (
      <Card className="bg-fintrack-card-dark border-fintrack-bg-dark">
        <CardHeader>
          <CardTitle>Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-16 bg-fintrack-bg-dark/50" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-fintrack-card-dark border-fintrack-bg-dark">
      <CardHeader>
        <CardTitle>Your Wallets</CardTitle>
      </CardHeader>
      <CardContent>
        {wallets.length === 0 ? (
          <div className="text-center py-4 text-fintrack-text-secondary">
            No wallets found. Add a wallet to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Family Member</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow key={wallet.id} className="border-fintrack-bg-dark">
                    <TableCell className="font-medium">{wallet.name}</TableCell>
                    <TableCell>{wallet.wallet_type_name}</TableCell>
                    <TableCell>{wallet.wallet_category_name}</TableCell>
                    <TableCell className={`font-medium ${Number(wallet.is_expense) === 1 ? 'text-red-500' : 'text-green-500'}`}>
                      {formatCurrency(Number(wallet.amount))}
                    </TableCell>
                    <TableCell>{wallet.family_member || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditWallet(wallet)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => onDeleteWallet(wallet.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletList;
