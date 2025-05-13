import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Check, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const IncomePage = () => {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  const [editingIncome, setEditingIncome] = useState<(IncomeItem & { category_id: number, family_member_id?: string }) | null>(null);
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
    if (!id) return "All Members";
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : "Unknown";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income Management</h2>
        
        <div className="flex gap-2">
          <Select 
            value={selectedFamilyMember} 
            onValueChange={handleFamilyMemberChange}
          >
            <SelectTrigger className="w-[180px] bg-fintrack-bg-dark border-fintrack-bg-dark">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
              <SelectItem value="all-members">All Members</SelectItem>
              {familyMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={editingIncome ? editingIncome.amount : newIncome.amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (editingIncome) {
                        setEditingIncome({ ...editingIncome, amount: value || 0 });
                      } else {
                        setNewIncome({ ...newIncome, amount: value || 0 });
                      }
                    }}
                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={String(editingIncome ? editingIncome.category_id : newIncome.category_id)}
                    onValueChange={(value) => {
                      const categoryId = parseInt(value);
                      if (editingIncome) {
                        setEditingIncome({ ...editingIncome, category_id: categoryId });
                      } else {
                        setNewIncome({ ...newIncome, category_id: categoryId });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
                      {categories.map((category) => (
                        <SelectItem key={category.category_id} value={String(category.category_id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="family_member">Family Member</Label>
                  <Select
                    value={String(editingIncome ? editingIncome.family_member_id : newIncome.family_member_id)}
                    onValueChange={(value) => {
                      if (editingIncome) {
                        setEditingIncome({ ...editingIncome, family_member_id: value });
                      } else {
                        setNewIncome({ ...newIncome, family_member_id: value });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
                      <SelectValue placeholder="Select family member" />
                    </SelectTrigger>
                    <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
                      {familyMembers.map((member) => (
                        <SelectItem key={member.id} value={String(member.id)}>
                          {member.name} ({member.relationship})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editingIncome ? editingIncome.description : newIncome.description}
                    onChange={(e) => {
                      if (editingIncome) {
                        setEditingIncome({ ...editingIncome, description: e.target.value });
                      } else {
                        setNewIncome({ ...newIncome, description: e.target.value });
                      }
                    }}
                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editingIncome ? editingIncome.date : newIncome.date}
                    onChange={(e) => {
                      if (editingIncome) {
                        setEditingIncome({ ...editingIncome, date: e.target.value });
                      } else {
                        setNewIncome({ ...newIncome, date: e.target.value });
                      }
                    }}
                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                  />
                </div>
                <Button 
                  onClick={editingIncome ? handleEditIncome : handleAddIncome}
                  className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {editingIncome ? 'Update Income' : 'Add Income'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Income Summary - Top section */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Income Summary {selectedFamilyMember && `- ${getFamilyMemberName(selectedFamilyMember)}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Total Income</div>
              <div className="text-xl font-bold text-green-500">
                ₹{totalIncome.toFixed(2)}
              </div>
            </div>
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Average Income</div>
              <div className="text-xl font-bold text-fintrack-purple">
                ₹{averageIncome.toFixed(2)}
              </div>
            </div>
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Number of Entries</div>
              <div className="text-xl font-bold">{incomes.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Income Entries - Bottom section */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Income Entries</CardTitle>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Family Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((income) => (
                    <tr key={income.id} className="border-b border-fintrack-bg-dark">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{income.date}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500">
                          {income.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {income.family_member || "Not assigned"}
                      </td>
                      <td className="px-4 py-3 text-sm">{income.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-500 text-right">
                        ₹{income.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            // Find category_id based on category name
                            const categoryObj = categories.find(c => c.name === income.category);
                            const category_id = categoryObj ? categoryObj.category_id : 0;
                            
                            setEditingIncome({
                              ...income,
                              category_id,
                              family_member_id: income.family_member_id
                            });
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteIncome(income.id)}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {incomes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-fintrack-text-secondary">
                        No income entries found. Add your first income entry.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomePage;
