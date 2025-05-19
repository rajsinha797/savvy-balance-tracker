
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExpenseItem, formatDateForDisplay } from '@/services/expenseService';
import { FamilyMember } from '@/services/familyService';

// Import components
import ExpenseSummary from '@/components/expenses/ExpenseSummary';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';
import FamilyFilter from '@/components/income/FamilyFilter';

// Import custom hooks
import { useExpenseApi } from '@/hooks/useExpenseApi';
import { useFamilyApi } from '@/hooks/useFamilyApi';

const ExpensesPage = () => {
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("all-members");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use our custom hooks
  const { familyMembers } = useFamilyApi();
  const { 
    expenses, 
    expenseTypes, 
    getExpenseCategoriesByType,
    getExpenseSubCategoriesByCategoryId: getExpenseSubCategoriesByCategory, // Aliased to match expected property name
    isLoading,
    createExpense: addExpense,
    updateExpense: updateExpenseItem,
    deleteExpense: deleteExpenseItem
  } = useExpenseApi(selectedFamilyMember !== 'all-members' ? selectedFamilyMember : undefined);
  
  // New expense form data state with the enhanced categorization structure and wallet
  const [newExpense, setNewExpense] = useState<{ 
    amount: number; 
    expense_type_id: number;
    expense_category_id: number;
    expense_sub_category_id: number;
    description: string; 
    date: string;
    family_member_id: string;
    wallet_id: number | null;
  }>({ 
    amount: 0, 
    expense_type_id: 0,
    expense_category_id: 0,
    expense_sub_category_id: 0, 
    description: '', 
    date: new Date().toISOString().split('T')[0],
    family_member_id: '',
    wallet_id: null
  });
  
  // State for editing expense with wallet
  const [editingExpense, setEditingExpense] = useState<(ExpenseItem & { 
    expense_type_id: number,
    expense_category_id: number,
    expense_sub_category_id: number, 
    family_member_id: string,
    wallet_id: number | null
  }) | null>(null);

  // Set default family member when family members data is loaded
  React.useEffect(() => {
    if (familyMembers.length > 0) {
      const defaultMember = familyMembers.find(member => member.is_default);
      if (defaultMember) {
        setNewExpense(prev => ({ ...prev, family_member_id: String(defaultMember.id) }));
      }
    }
  }, [familyMembers]);

  // Calculate totals
  const totalExpense = expenses && expenses.length > 0
    ? expenses.reduce((sum, item) => {
        const amount = typeof item.amount === 'number' ? item.amount :
                      (typeof item.amount === 'string' ? parseFloat(item.amount) : 0);
        return sum + amount;
      }, 0)
    : 0;
    
  const averageExpense = expenses && expenses.length > 0
    ? totalExpense / expenses.length
    : 0;

  const handleFamilyMemberChange = (value: string) => {
    setSelectedFamilyMember(value === "all-members" ? "" : value);
  };
  
  // Handle form submits
  const handleAddExpense = () => {
    if (newExpense.amount <= 0 || !newExpense.expense_type_id || !newExpense.expense_category_id || !newExpense.expense_sub_category_id) {
      return;
    }
    addExpense(newExpense);
    setNewExpense({ 
      amount: 0, 
      expense_type_id: 0,
      expense_category_id: 0,
      expense_sub_category_id: 0,
      description: '', 
      date: new Date().toISOString().split('T')[0],
      family_member_id: newExpense.family_member_id,
      wallet_id: null
    });
    setIsDialogOpen(false);
  };

  const handleEditExpense = () => {
    if (!editingExpense || editingExpense.amount <= 0 || !editingExpense.expense_type_id || !editingExpense.expense_category_id || !editingExpense.expense_sub_category_id) {
      return;
    }
    
    const { 
      id, 
      amount, 
      expense_type_id, 
      expense_category_id, 
      expense_sub_category_id, 
      description, 
      date, 
      family_member_id,
      wallet_id
    } = editingExpense;
    
    updateExpenseItem({
      id,
      expense: {
        amount,
        expense_type_id,
        expense_category_id,
        expense_sub_category_id,
        description,
        date,
        family_member_id,
        wallet_id
      }
    });
    
    setEditingExpense(null);
    setIsDialogOpen(false);
  };

  const handleDeleteExpense = (id: string | number) => {
    deleteExpenseItem(id);
  };

  // Find family member name by ID
  const getFamilyMemberName = (id?: string) => {
    if (!id) return null;
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : null;
  };

  const selectedFamilyMemberName = selectedFamilyMember
    ? getFamilyMemberName(selectedFamilyMember)
    : null;
    
  // Handlers for form changes
  const handleNewExpenseChange = (field: string, value: string | number) => {
    setNewExpense(prev => ({ ...prev, [field]: value }));
  };

  const handleEditingExpenseChange = (field: string, value: string | number) => {
    if (editingExpense) {
      setEditingExpense(prev => {
        if (prev) {
          return { ...prev, [field]: value };
        }
        return prev;
      });
    }
  };

  const startEditExpense = (expense: ExpenseItem) => {
    // Format date for the form
    const formattedExpense = {
      ...expense,
      date: formatDateForDisplay(expense.date),
      expense_type_id: expense.expense_type_id || 0,
      expense_category_id: expense.expense_category_id || 0,
      expense_sub_category_id: expense.expense_sub_category_id || 0,
      family_member_id: expense.family_member_id || '',
      wallet_id: expense.wallet_id || null
    };
    
    setEditingExpense(formattedExpense);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expense Management</h2>
        
        <div className="flex gap-2">
          <FamilyFilter 
            selectedFamilyMember={selectedFamilyMember}
            familyMembers={familyMembers}
            onFamilyMemberChange={handleFamilyMemberChange}
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
              </DialogHeader>
              <ExpenseForm 
                isEditing={!!editingExpense}
                formData={editingExpense || newExpense}
                onFormChange={editingExpense ? handleEditingExpenseChange : handleNewExpenseChange}
                onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
                expenseTypes={expenseTypes}
                getExpenseCategoriesByType={getExpenseCategoriesByType}
                getExpenseSubCategoriesByCategory={getExpenseSubCategoriesByCategory}
                familyMembers={familyMembers}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Expense Summary - Top section */}
      <ExpenseSummary 
        totalExpense={totalExpense}
        averageExpense={averageExpense}
        entriesCount={expenses.length}
        selectedFamilyMemberName={selectedFamilyMemberName}
      />
      
      {/* Expense Entries - Bottom section */}
      <ExpenseList 
        expenses={expenses}
        isLoading={isLoading}
        onEditExpense={startEditExpense}
        onDeleteExpense={handleDeleteExpense}
      />
    </div>
  );
};

export default ExpensesPage;
