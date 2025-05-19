
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIncomeApi } from '@/hooks/useIncomeApi';
import { useFamilyApi } from '@/hooks/useFamilyApi';
import { IncomeItem, IncomeFormData } from '@/services/incomeService';
import { formatCurrency } from '@/lib/utils';

// Import components
import IncomeSummary from '@/components/income/IncomeSummary';
import IncomeForm from '@/components/income/IncomeForm';
import IncomeList from '@/components/income/IncomeList';
import FamilyFilter from '@/components/income/FamilyFilter';
import { useWalletApi } from '@/hooks/useWalletApi';

const IncomePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>('all-members');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);

  // Get family members data
  const { familyMembers } = useFamilyApi();

  // Get income data
  const {
    incomes,
    incomeTypes,
    isLoading,
    getIncomeCategoriesByType,
    getIncomeSubCategoriesByCategoryId,
    addIncome: addIncomeItem,
    updateIncome: updateIncomeItem,
    deleteIncome: deleteIncomeItem
  } = useIncomeApi(selectedFamilyMember !== 'all-members' ? selectedFamilyMember : undefined);

  // Get wallet data for selection in form
  const { availableWallets } = useWalletApi();

  // New income form data state - updated to match IncomeFormData interface
  const [newIncome, setNewIncome] = useState<IncomeFormData>({
    amount: 0,
    income_type_id: 0,
    income_category_id: 0,
    income_sub_category_id: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    family_member_id: '', 
    wallet_id: null  // This now matches the IncomeFormData interface
  });

  // Set default family member when family members data is loaded
  useEffect(() => {
    if (familyMembers.length > 0) {
      const defaultMember = familyMembers.find(member => member.is_default);
      if (defaultMember) {
        setNewIncome(prev => ({ ...prev, family_member_id: String(defaultMember.id) }));
      }
    }
  }, [familyMembers]);

  // Filter incomes by time period
  const filteredIncomes = incomes.filter(income => {
    if (!income.date) return true;
    const incomeDate = new Date(income.date);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastQuarter = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    switch (activeTab) {
      case 'month':
        return incomeDate >= firstDayOfMonth;
      case '3months':
        return incomeDate >= lastQuarter;
      case 'year':
        return incomeDate >= lastYear;
      case 'all':
      default:
        return true;
    }
  });

  // Calculate total income for the selected period
  const totalIncome = filteredIncomes.reduce((total, income) => {
    return total + (typeof income.amount === 'number' ? income.amount : 0);
  }, 0);

  // Calculate average income per transaction
  const averageIncome = filteredIncomes.length > 0
    ? totalIncome / filteredIncomes.length
    : 0;

  const handleFamilyMemberChange = (value: string) => {
    setSelectedFamilyMember(value);
  };

  // Handle form changes
  const handleNewIncomeChange = (field: string, value: string | number) => {
    setNewIncome(prev => ({ ...prev, [field]: value }));
  };

  const handleEditingIncomeChange = (field: string, value: string | number) => {
    if (editingIncome) {
      setEditingIncome(prev => {
        if (prev) {
          return { ...prev, [field]: value };
        }
        return prev;
      });
    }
  };

  // Handle form submits
  const handleAddIncome = () => {
    addIncomeItem(newIncome);
    
    // Reset form
    setNewIncome({
      amount: 0,
      income_type_id: 0,
      income_category_id: 0,
      income_sub_category_id: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      family_member_id: newIncome.family_member_id,
      wallet_id: null
    });
    setIsAddDialogOpen(false);
  };

  const handleEditIncome = () => {
    if (!editingIncome) return;
    
    // Make sure all required fields are present in the form data
    const formData: IncomeFormData = {
      amount: typeof editingIncome.amount === 'number' ? editingIncome.amount : 0,
      income_type_id: editingIncome.income_type_id || 0,
      income_category_id: editingIncome.income_category_id || 0,
      income_sub_category_id: editingIncome.income_sub_category_id || 0,
      description: editingIncome.description || '',
      date: editingIncome.date || new Date().toISOString().split('T')[0],
      family_member_id: editingIncome.family_member_id || '', 
      wallet_id: editingIncome.wallet_id || null
    };
    
    updateIncomeItem({
      id: editingIncome.id,
      incomeData: formData
    });
    
    // Reset form
    setEditingIncome(null);
    setIsAddDialogOpen(false);
  };

  const handleDeleteIncome = (id: number | string) => {
    deleteIncomeItem(id);
  };

  const startEditIncome = (income: IncomeItem) => {
    setEditingIncome({
      ...income,
      // Ensure these properties exist
      income_type_id: income.income_type_id || 0,
      income_category_id: income.income_category_id || 0,
      income_sub_category_id: income.income_sub_category_id || 0,
      description: income.description || '',
      family_member_id: income.family_member_id || ''
    });
    setIsAddDialogOpen(true);
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

  // Create an empty category map for IncomeList
  const categoryIdMap = {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income</h2>
        
        <div className="flex gap-2">
          <FamilyFilter
            selectedFamilyMember={selectedFamilyMember}
            familyMembers={familyMembers}
            onFamilyMemberChange={handleFamilyMemberChange}
          />
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
                <Plus className="h-4 w-4 mr-2" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
              <DialogHeader>
                <DialogTitle>{editingIncome ? 'Edit Income' : 'Add New Income'}</DialogTitle>
              </DialogHeader>
              <IncomeForm
                isEditing={!!editingIncome}
                formData={editingIncome ? {
                  amount: typeof editingIncome.amount === 'number' ? editingIncome.amount : 0,
                  income_type_id: editingIncome.income_type_id || 0,
                  income_category_id: editingIncome.income_category_id || 0,
                  income_sub_category_id: editingIncome.income_sub_category_id || 0,
                  description: editingIncome.description || '',
                  date: editingIncome.date || new Date().toISOString().split('T')[0],
                  family_member_id: editingIncome.family_member_id || '',
                  wallet_id: editingIncome.wallet_id || null
                } : newIncome}
                onFormChange={editingIncome ? handleEditingIncomeChange : handleNewIncomeChange}
                onSubmit={editingIncome ? handleEditIncome : handleAddIncome}
                incomeTypes={incomeTypes}
                getIncomeCategoriesByType={getIncomeCategoriesByType}
                getIncomeSubCategoriesByCategory={getIncomeSubCategoriesByCategoryId}
                familyMembers={familyMembers}
                availableWallets={availableWallets}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Income Overview */}
      <IncomeSummary 
        totalIncome={totalIncome} 
        averageIncome={averageIncome} 
        entriesCount={filteredIncomes.length}
        selectedFamilyMemberName={selectedFamilyMemberName}
      />
      
      {/* Income List with Time Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 border-b border-fintrack-bg-dark">
              <TabsList className="bg-transparent border-b-0">
                <TabsTrigger value="all" className="data-[state=active]:text-fintrack-purple">All Time</TabsTrigger>
                <TabsTrigger value="year" className="data-[state=active]:text-fintrack-purple">Year</TabsTrigger>
                <TabsTrigger value="3months" className="data-[state=active]:text-fintrack-purple">Quarter</TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:text-fintrack-purple">Month</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={activeTab} className="m-0">
              <IncomeList
                incomes={filteredIncomes}
                isLoading={isLoading}
                onEditIncome={startEditIncome}
                onDeleteIncome={handleDeleteIncome}
                categoryIdMap={categoryIdMap}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomePage;
