import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";

import { 
  getAllIncomes, 
  getIncomeCategories, 
  addIncome, 
  updateIncome, 
  deleteIncome,
  IncomeItem,
  IncomeCategory 
} from '@/services/incomeService';

import { 
  getAllFamilyMembers,
  FamilyMember 
} from '@/services/familyService';

// Import our new components
import IncomeSummary from '@/components/income/IncomeSummary';
import IncomeList from '@/components/income/IncomeList';
import IncomeForm from '@/components/income/IncomeForm';
import FamilyFilter from '@/components/income/FamilyFilter';

const IncomePage = () => {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("all-members");
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // State for editing income - ensure family_member_id is always defined 
  const [editingIncome, setEditingIncome] = useState<(IncomeItem & { category_id: number, family_member_id: string }) | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load income categories
        const categoriesData = await getIncomeCategories();
        setCategories(categoriesData);
        
        // Load family members
        const familyData = await getAllFamilyMembers();
        setFamilyMembers(familyData);
        
        // Set default family member if available
        const defaultMember = familyData.find(member => member.is_default);
        if (defaultMember) {
          setNewIncome(prev => ({ ...prev, family_member_id: defaultMember.id }));
        }
        
        // Load income data
        const incomesData = await getAllIncomes(selectedFamilyMember);
        setIncomes(incomesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load income data. Using demo data instead.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast, selectedFamilyMember]);

  // Create a map of category names to IDs for easier lookup
  const categoryIdMap: Record<string, number> = {};
  categories.forEach(category => {
    categoryIdMap[category.name] = category.category_id;
  });

  const handleAddIncome = async () => {
    if (newIncome.amount <= 0 || !newIncome.category_id) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount and select a category.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await addIncome(newIncome);
      
      if (result.success) {
        // Refresh the incomes list
        const updatedIncomes = await getAllIncomes(selectedFamilyMember);
        setIncomes(updatedIncomes);
        
        toast({
          title: "Success",
          description: result.message || "Income added successfully",
        });
        
        // Reset form
        setNewIncome({ 
          amount: 0, 
          category_id: 0, 
          description: '', 
          date: new Date().toISOString().split('T')[0],
          family_member_id: newIncome.family_member_id // Keep the currently selected family member
        });
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add income",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding income",
        variant: "destructive",
      });
    }
  };

  const handleEditIncome = async () => {
    if (!editingIncome || editingIncome.amount <= 0 || !editingIncome.category_id) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount and select a category.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { id, amount, category_id, description, date, family_member_id } = editingIncome;
      const result = await updateIncome(id, { amount, category_id, description, date, family_member_id });
      
      if (result.success) {
        // Refresh the incomes list
        const updatedIncomes = await getAllIncomes(selectedFamilyMember);
        setIncomes(updatedIncomes);
        
        toast({
          title: "Success",
          description: result.message,
        });
        
        setEditingIncome(null);
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating income:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating income",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      const result = await deleteIncome(id);
      
      if (result.success) {
        // Update the incomes list
        const updatedIncomes = await getAllIncomes(selectedFamilyMember);
        setIncomes(updatedIncomes);
        
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting income",
        variant: "destructive",
      });
    }
  };

  // Calculate total and average income
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const averageIncome = incomes.length > 0 
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
    setEditingIncome({
      ...income,
      category_id: categoryId,
      // Ensure family_member_id is always defined, default to empty string if not available
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
