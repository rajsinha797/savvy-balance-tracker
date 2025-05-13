import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Check, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

import { 
  getAllFamilyMembers,
  FamilyMember 
} from '@/services/familyService';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  family_member?: string;
  family_member_id?: string;
}

const API_URL = 'http://localhost:3001';

const ExpensesPage = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({ 
    amount: 0, 
    category: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0],
    family_member_id: ''
  });
  
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedFamilyMember]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load family members
      const familyData = await getAllFamilyMembers();
      setFamilyMembers(familyData);
      
      // Set default family member if available
      const defaultMember = familyData.find(member => member.is_default);
      if (defaultMember && !newExpense.family_member_id) {
        setNewExpense(prev => ({ ...prev, family_member_id: defaultMember.id }));
      }
      
      // Load expenses data
      const url = selectedFamilyMember 
        ? `${API_URL}/api/expenses?family_member_id=${selectedFamilyMember}`
        : `${API_URL}/api/expenses`;
      
      const response = await axios.get(url);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses data. Using demo data instead.",
        variant: "destructive",
      });
      // Use demo data as fallback
      setExpenses([
        { id: '1', amount: 1200, category: 'Housing', description: 'Monthly rent', date: '2025-05-01' },
        { id: '2', amount: 85, category: 'Utilities', description: 'Electricity bill', date: '2025-05-03' },
        { id: '3', amount: 150, category: 'Groceries', description: 'Weekly grocery shopping', date: '2025-05-05' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (newExpense.amount <= 0 || !newExpense.category) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount and select a category.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/expenses`, newExpense);
      
      if (response.data.status === 'success') {
        await loadData();
        
        toast({
          title: "Success",
          description: "Expense added successfully",
        });
        
        // Reset form but keep family member
        setNewExpense({ 
          amount: 0, 
          category: '', 
          description: '', 
          date: new Date().toISOString().split('T')[0],
          family_member_id: newExpense.family_member_id
        });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding expense",
        variant: "destructive",
      });
    }
  };

  const handleEditExpense = async () => {
    if (!editingExpense || editingExpense.amount <= 0 || !editingExpense.category) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount and select a category.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await axios.put(`${API_URL}/api/expenses/${editingExpense.id}`, editingExpense);
      
      await loadData();
      
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      
      setEditingExpense(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating expense",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/expenses/${id}`);
      
      await loadData();
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting expense",
        variant: "destructive",
      });
    }
  };

  const handleFamilyMemberChange = (value: string) => {
    setSelectedFamilyMember(value);
  };

  // Find family member name by ID
  const getFamilyMemberName = (id?: string) => {
    if (!id) return "All Members";
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : "Unknown";
  };

  // Calculate total and average expense
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const averageExpense = expenses.length > 0 
    ? totalExpense / expenses.length
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expense Management</h2>
        
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
              <SelectItem value="">All Members</SelectItem>
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
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={editingExpense ? editingExpense.amount : newExpense.amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (editingExpense) {
                        setEditingExpense({ ...editingExpense, amount: value || 0 });
                      } else {
                        setNewExpense({ ...newExpense, amount: value || 0 });
                      }
                    }}
                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editingExpense ? editingExpense.category : newExpense.category}
                    onValueChange={(value) => {
                      if (editingExpense) {
                        setEditingExpense({ ...editingExpense, category: value });
                      } else {
                        setNewExpense({ ...newExpense, category: value });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
                      <SelectItem value="Housing">Housing</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Groceries">Groceries</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="family_member">Family Member</Label>
                  <Select
                    value={String(editingExpense ? editingExpense.family_member_id : newExpense.family_member_id)}
                    onValueChange={(value) => {
                      if (editingExpense) {
                        setEditingExpense({ ...editingExpense, family_member_id: value });
                      } else {
                        setNewExpense({ ...newExpense, family_member_id: value });
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
                    value={editingExpense ? editingExpense.description : newExpense.description}
                    onChange={(e) => {
                      if (editingExpense) {
                        setEditingExpense({ ...editingExpense, description: e.target.value });
                      } else {
                        setNewExpense({ ...newExpense, description: e.target.value });
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
                    value={editingExpense ? editingExpense.date : newExpense.date}
                    onChange={(e) => {
                      if (editingExpense) {
                        setEditingExpense({ ...editingExpense, date: e.target.value });
                      } else {
                        setNewExpense({ ...newExpense, date: e.target.value });
                      }
                    }}
                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                  />
                </div>
                <Button 
                  onClick={editingExpense ? handleEditExpense : handleAddExpense}
                  className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Expense Summary - Top section */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Expense Summary {selectedFamilyMember && `- ${getFamilyMemberName(selectedFamilyMember)}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Total Expenses</div>
              <div className="text-xl font-bold text-red-500">
                ₹{totalExpense.toFixed(2)}
              </div>
            </div>
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Average Expense</div>
              <div className="text-xl font-bold text-fintrack-purple">
                ₹{averageExpense.toFixed(2)}
              </div>
            </div>
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Number of Entries</div>
              <div className="text-xl font-bold">{expenses.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Expense Entries - Bottom section */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Expense Entries</CardTitle>
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
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-fintrack-bg-dark">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{expense.date}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500/10 text-red-500">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {expense.family_member || "Not assigned"}
                      </td>
                      <td className="px-4 py-3 text-sm">{expense.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-red-500 text-right">
                        ₹{expense.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingExpense(expense);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-fintrack-text-secondary">
                        No expense entries found. Add your first expense entry.
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

export default ExpensesPage;
