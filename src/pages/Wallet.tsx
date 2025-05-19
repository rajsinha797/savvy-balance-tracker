
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWalletApi } from '@/hooks/useWalletApi';
import { useFamilyApi } from '@/hooks/useFamilyApi';
import { WalletFormData, Wallet } from '@/services/walletService';
import WalletForm from '@/components/wallet/WalletForm';
import WalletList from '@/components/wallet/WalletList';
import WalletSummary from '@/components/wallet/WalletSummary';
import FamilyFilter from '@/components/income/FamilyFilter';

// Add the missing formatDateForDisplay function
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';

  // Handle ISO date strings
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }

  // Handle DD/MM/YYYY format
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0'); 
      return `${parts[2]}-${month}-${day}`;
    }
  }

  // Return as is if already in YYYY-MM-DD format or can't parse
  return dateString;
};

const WalletPage = () => {
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("all-members");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use our custom hooks
  const { familyMembers } = useFamilyApi();
  const { 
    wallets, 
    walletTypes, 
    getWalletCategoriesByType,
    getWalletSubCategoriesByCategory,
    isLoading, 
    createWallet,
    updateWallet,
    deleteWallet 
  } = useWalletApi(selectedFamilyMember !== 'all-members' ? selectedFamilyMember : undefined);
  
  // New wallet form data state
  const [newWallet, setNewWallet] = useState<{ 
    name: string;
    amount: number; 
    wallet_type_id: number;
    wallet_category_id: number;
    wallet_sub_category_id: number | null;
    description: string; 
    date: string;
    family_member_id: string;
  }>({ 
    name: '',
    amount: 0, 
    wallet_type_id: 0,
    wallet_category_id: 0,
    wallet_sub_category_id: null, 
    description: '', 
    date: new Date().toISOString().split('T')[0],
    family_member_id: '' 
  });
  
  // State for editing wallet
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  // Set default family member when family members data is loaded
  React.useEffect(() => {
    if (familyMembers.length > 0) {
      const defaultMember = familyMembers.find(member => member.is_default);
      if (defaultMember) {
        setNewWallet(prev => ({ ...prev, family_member_id: String(defaultMember.id) }));
      }
    }
  }, [familyMembers]);

  // Calculate totals by wallet type
  const calculateTotalsByType = () => {
    const spendingTotal = wallets
      .filter(wallet => wallet.wallet_type_id === 1)
      .reduce((sum, wallet) => sum + Number(wallet.amount), 0);
      
    const savingsTotal = wallets
      .filter(wallet => wallet.wallet_type_id === 2)
      .reduce((sum, wallet) => sum + Number(wallet.amount), 0);
      
    const debtTotal = wallets
      .filter(wallet => wallet.wallet_type_id === 3)
      .reduce((sum, wallet) => sum + Number(wallet.amount), 0);
      
    return { spendingTotal, savingsTotal, debtTotal };
  };
  
  const { spendingTotal, savingsTotal, debtTotal } = calculateTotalsByType();

  const handleFamilyMemberChange = (value: string) => {
    setSelectedFamilyMember(value);
  };
  
  // Handle form submits
  const handleAddWallet = () => {
    const formData: WalletFormData = {
      name: newWallet.name,
      amount: newWallet.amount,
      wallet_type_id: newWallet.wallet_type_id,
      wallet_category_id: newWallet.wallet_category_id,
      wallet_sub_category_id: newWallet.wallet_sub_category_id || undefined,
      date: newWallet.date,
      description: newWallet.description || '',
      family_member_id: newWallet.family_member_id || undefined
    };

    createWallet(formData);
    
    // Reset form data
    setNewWallet({
      name: '',
      amount: 0,
      wallet_type_id: 0,
      wallet_category_id: 0,
      wallet_sub_category_id: null,
      description: '',
      date: new Date().toISOString().split('T')[0],
      family_member_id: newWallet.family_member_id || ''
    });
    setIsDialogOpen(false);
  };

  const handleEditWallet = () => {
    if (!editingWallet) return;
    
    const formData: WalletFormData = {
      name: editingWallet.name || '',
      amount: typeof editingWallet.amount === 'number' ? editingWallet.amount : 0,
      wallet_type_id: editingWallet.wallet_type_id || 0,
      wallet_category_id: editingWallet.wallet_category_id || 0,
      wallet_sub_category_id: editingWallet.wallet_sub_category_id || undefined, 
      date: editingWallet.date || new Date().toISOString().split('T')[0],
      description: editingWallet.description || '',
      family_member_id: editingWallet.family_member_id || undefined
    };
    
    updateWallet({ 
      id: editingWallet.id,
      wallet: formData
    });
    
    // Reset form data
    setEditingWallet(null);
    setIsDialogOpen(false);
  };

  const handleDeleteWallet = (id: string | number) => {
    deleteWallet(id);
  };

  // Find family member name by ID
  const getFamilyMemberName = (id?: string) => {
    if (!id) return null;
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : null;
  };

  const selectedFamilyMemberName = selectedFamilyMember !== 'all-members'
    ? getFamilyMemberName(selectedFamilyMember)
    : null;
    
  // Handlers for form changes
  const handleNewWalletChange = (field: string, value: string | number) => {
    setNewWallet(prev => ({ ...prev, [field]: value }));
  };

  const handleEditingWalletChange = (field: string, value: string | number) => {
    if (editingWallet) {
      setEditingWallet(prev => {
        if (prev) {
          return { ...prev, [field]: value };
        }
        return prev;
      });
    }
  };

  const startEditWallet = (wallet: Wallet) => {
    // Format date for the form
    const formattedWallet = {
      ...wallet,
      date: wallet.date ? formatDateForDisplay(wallet.date) : new Date().toISOString().split('T')[0],
    };
    
    setEditingWallet(formattedWallet);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wallet Management</h2>
        
        <div className="flex gap-2">
          <FamilyFilter 
            selectedFamilyMember={selectedFamilyMember}
            familyMembers={familyMembers}
            onFamilyMemberChange={handleFamilyMemberChange}
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
                <Plus className="h-4 w-4 mr-2" /> Add Wallet Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
              <DialogHeader>
                <DialogTitle>{editingWallet ? 'Edit Wallet Account' : 'Add New Wallet Account'}</DialogTitle>
              </DialogHeader>
              <WalletForm
                isEditing={!!editingWallet}
                formData={editingWallet ? {
                  name: editingWallet.name || '',
                  amount: typeof editingWallet.amount === 'number' ? editingWallet.amount : 0,
                  wallet_type_id: editingWallet.wallet_type_id || 0,
                  wallet_category_id: editingWallet.wallet_category_id || 0,
                  wallet_sub_category_id: editingWallet.wallet_sub_category_id || 0,
                  date: editingWallet.date || new Date().toISOString().split('T')[0],
                  description: editingWallet.description || '',
                  family_member_id: editingWallet.family_member_id || ''
                } : newWallet}
                onFormChange={editingWallet ? handleEditingWalletChange : handleNewWalletChange}
                onSubmit={editingWallet ? handleEditWallet : handleAddWallet}
                walletTypes={walletTypes}
                getWalletCategoriesByType={getWalletCategoriesByType}
                getWalletSubCategoriesByCategory={getWalletSubCategoriesByCategory}
                familyMembers={familyMembers}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Wallet Summary - Top section */}
      <WalletSummary 
        totalSpending={spendingTotal}
        totalSavings={savingsTotal}
        totalDebt={debtTotal}
        selectedFamilyMemberName={selectedFamilyMemberName}
      />
      
      {/* Wallet List - Bottom section */}
      <WalletList 
        wallets={wallets}
        isLoading={isLoading}
        onEditWallet={startEditWallet}
        onDeleteWallet={handleDeleteWallet}
      />
    </div>
  );
};

export default WalletPage;
