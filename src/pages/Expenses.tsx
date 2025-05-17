import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Check, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import ExpenseSummary from '@/components/expenses/ExpenseSummary';
import { useExpenseApi } from '@/hooks/useExpenseApi';
import { useQuery } from '@tanstack/react-query';
import { getAllFamilyMembers, FamilyMember } from '@/services/familyService';
import { ExpenseItem, formatDateForDisplay } from '@/services/expenseService';

const ExpensesPage = () => {
  // Changed to string to fix type errors
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  
  const [newExpense, setNewExpense] = useState<Omit<ExpenseItem, 'id'>>({ 
    amount: 0, 
    category: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0],
    family_member_id: ''
  });
  
  // Fix the useQuery implementation to correctly handle the getAllFamilyMembers function
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => getAllFamilyMembers() // Use an arrow function that doesn't pass any parameters
  });
  
  // Get expenses with the API hook
  const { 
    expenses, 
    expenseCategories, // changed from categories to expenseCategories to match the API hook response
    isLoadingExpenses,
    createExpense: addExpense,
    updateExpense: updateExpenseItem,
    deleteExpense: deleteExpenseItem
  } = useExpenseApi(selectedFamilyMember === "all-members" ? undefined : selectedFamilyMember);

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

  // Find family member name by ID
  const getFamilyMemberName = (id?: string) => {
    if (!id) return null;
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : null;
  };

  const selectedFamilyMemberName = selectedFamilyMember
    ? getFamilyMemberName(selectedFamilyMember)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expense Management</h2>
        
        <div className="flex gap-2">
          <Select 
            value={selectedFamilyMember || "all-members"} 
            onValueChange={handleFamilyMemberChange}
          >
            <SelectTrigger className="w-[180px] bg-fintrack-bg-dark border-fintrack-bg-dark">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
              <SelectItem value="all-members">All Members</SelectItem>
              {familyMembers.map((member) => (
                <SelectItem key={member.id} value={member.id || `member-${member.name}`}>
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
      <ExpenseSummary 
        totalExpense={totalExpense}
        averageExpense={averageExpense}
        entriesCount={expenses.length}
        selectedFamilyMemberName={selectedFamilyMemberName}
      />
      
      {/* Expense Entries - Bottom section */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Expense Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingExpenses ? (
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
                        {expense.family_member || getFamilyMemberName(expense.family_member_id) || "Not assigned"}
                      </td>
                      <td className="px-4 py-3 text-sm">{expense.description}</td>
                      <td className="px-4 py-3 text-sm font-medium text-red-500 text-right">
                        ₹{parseFloat(expense.amount.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            // Format date for the form
                            const formattedExpense = {
                              ...expense,
                              // Make sure date is in YYYY-MM-DD format for the input
                              date: formatDateForDisplay(expense.date)
                            };
                            
                            setEditingExpense(formattedExpense);
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
