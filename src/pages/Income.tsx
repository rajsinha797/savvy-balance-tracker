
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IncomeCategory, IncomeItem } from '@/services/incomeService';
import { getAllFamilyMembers, FamilyMember } from '@/services/familyService';

// Import components
import IncomeSummary from '@/components/income/IncomeSummary';
import IncomeList from '@/components/income/IncomeList';
import IncomeForm from '@/components/income/IncomeForm';
import FamilyFilter from '@/components/income/FamilyFilter';

// Import custom hooks
import { useIncomeApi } from '@/hooks/useIncomeApi';
import { useFamilyApi } from '@/hooks/useFamilyApi';

const IncomePage = () => {
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("all-members");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use our custom hooks
  const { familyMembers } = useFamilyApi();
  const { 
    incomes, 
    categories, 
    isLoading, 
    addIncome: addIncomeItem,
    updateIncome: updateIncomeItem, 
    deleteIncome: deleteIncomeItem 
  } = useIncomeApi(selectedFamilyMember !== 'all-members' ? selectedFamilyMember : undefined);
  
  // New income form data state
  const [newIncome, setNewIncome] = useState<{ 
    amount: number; 
    category_id: number; 
    description: string; 
    date: string;
    family_member_id: string;
  }>({ 
    amount: 0, 
    category_id: 0, 
    description: '', 
    date: new Date().toISOString().split('T')[0],
    family_member_id: '' 
  });
  
  // State for editing income
  const [editingIncome, setEditingIncome] = useState<(IncomeItem & { category_id: number, family_member_id: string }) | null>(null);

  // Set default family member when family members data is loaded
  React.useEffect(() => {
    if (familyMembers.length > 0) {
      const defaultMember = familyMembers.find(member => member.is_default);
      if (defaultMember) {
        setNewIncome(prev => ({ ...prev, family_member_id: defaultMember.id }));
      }
    }
  }, [familyMembers]);

  // Create a map of category names to IDs for easier lookup
  const categoryIdMap: Record<string, number> = {};
  categories.forEach(category => {
    categoryIdMap[category.name] = category.category_id;
  });

  const handleAddIncome = async () => {
    if (newIncome.amount <= 0 || !newIncome.category_id) {
      // We can use toast here directly as it's already handled in the hook
      return;
    }
    
    addIncomeItem(newIncome);
    
    // Reset form
    setNewIncome({ 
      amount: 0, 
      category_id: 0, 
      description: '', 
      date: new Date().toISOString().split('T')[0],
      family_member_id: newIncome.family_member_id // Keep the currently selected family member
    });
    setIsDialogOpen(false);
  };

  const handleEditIncome = async () => {
    if (!editingIncome || editingIncome.amount <= 0 || !editingIncome.category_id) {
      return;
    }
    
    const { id, amount, category_id, description, date, family_member_id } = editingIncome;
    updateIncomeItem({ 
      id, 
      incomeData: { amount, category_id, description, date, family_member_id } 
    });
    
    setEditingIncome(null);
    setIsDialogOpen(false);
  };

  const handleDeleteIncome = async (id: string) => {
    deleteIncomeItem(id);
  };

  // Calculate total and average income with proper parsing
  // Ensure we handle the case when incomes might be undefined or contain non-numeric values
  const totalIncome = incomes && incomes.length > 0 
    ? incomes.reduce((sum, item) => {
        const amount = typeof item.amount === 'number' ? item.amount : 
                      (typeof item.amount === 'string' ? parseFloat(item.amount) : 0);
        return sum + amount;
      }, 0)
    : 0;
  
  const averageIncome = incomes && incomes.length > 0 
    ? totalIncome / incomes.length
    : 0;

  const handleFamilyMemberChange = (value: string) => {
    setSelectedFamilyMember(value);
  };

  // Find family member name by ID
  const getFamilyMemberName = (id?: string) => {
    if (!id) return null;
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : null;
  };

  // Handlers for form changes
  const handleNewIncomeChange = (field: string, value: string | number) => {
    setNewIncome(prev => ({ ...prev, [field]: value }));
  };

  const handleEditingIncomeChange = (field: string, value: string | number) => {
    if (editingIncome) {
      setEditingIncome({ ...editingIncome, [field]: value });
    }
  };

  const startEditIncome = (income: IncomeItem, categoryId: number) => {
    // Format the date properly for the edit form (ISO format for the date input)
    let formattedDate = income.date;
    
    // Check if date is in format DD/MM/YYYY or other non-ISO format and convert it
    if (income.date && income.date.includes('/')) {
      const parts = income.date.split('/');
      if (parts.length === 3) {
        // If it's in format DD/MM/YYYY, convert to YYYY-MM-DD
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        formattedDate = `${year}-${month}-${day}`;
      }
    } else if (income.date && !income.date.includes('-')) {
      // Try to parse any other format to ISO
      try {
        const dateObj = new Date(income.date);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    }

    console.log("Original date:", income.date, "Formatted date:", formattedDate);
    
    setEditingIncome({
      ...income,
      date: formattedDate,
      category_id: categoryId,
      family_member_id: income.family_member_id || ''
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income Management</h2>
        
        <div className="flex gap-2">
          <FamilyFilter 
            selectedFamilyMember={selectedFamilyMember}
            familyMembers={familyMembers}
            onFamilyMemberChange={handleFamilyMemberChange}
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                formData={editingIncome || newIncome}
                onFormChange={editingIncome ? handleEditingIncomeChange : handleNewIncomeChange}
                onSubmit={editingIncome ? handleEditIncome : handleAddIncome}
                categories={categories}
                familyMembers={familyMembers}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Income Summary */}
      <IncomeSummary 
        totalIncome={totalIncome}
        averageIncome={averageIncome}
        entriesCount={incomes.length}
        selectedFamilyMemberName={selectedFamilyMember !== 'all-members' ? getFamilyMemberName(selectedFamilyMember) : null}
      />
      
      {/* Income Entries */}
      <IncomeList 
        incomes={incomes}
        isLoading={isLoading}
        onEditIncome={startEditIncome}
        onDeleteIncome={handleDeleteIncome}
        categoryIdMap={categoryIdMap}
      />
    </div>
  );
};

export default IncomePage;
