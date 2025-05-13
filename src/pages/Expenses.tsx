
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const initialExpenses: Expense[] = [
  { id: '1', amount: 1200, category: 'Housing', description: 'Monthly rent', date: '2025-05-01' },
  { id: '2', amount: 85, category: 'Utilities', description: 'Electricity bill', date: '2025-05-03' },
  { id: '3', amount: 150, category: 'Groceries', description: 'Weekly grocery shopping', date: '2025-05-05' },
];

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({ 
    amount: 0, 
    category: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddExpense = () => {
    if (newExpense.amount <= 0 || !newExpense.category) return;
    
    const expense: Expense = {
      ...newExpense,
      id: Date.now().toString(),
    };
    
    setExpenses([expense, ...expenses]);
    setNewExpense({ 
      amount: 0, 
      category: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0] 
    });
    setIsDialogOpen(false);
  };

  const handleEditExpense = () => {
    if (!editingExpense || editingExpense.amount <= 0 || !editingExpense.category) return;
    
    setExpenses(expenses.map(expense => 
      expense.id === editingExpense.id ? editingExpense : expense
    ));
    
    setEditingExpense(null);
    setIsDialogOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expense Management</h2>
        
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
      
      {/* Expense Summary - Moved to the top */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Expense Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Total Expenses</div>
              <div className="text-xl font-bold text-red-500">
                ₹{expenses.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Average Expense</div>
              <div className="text-xl font-bold text-fintrack-purple">
                ₹{expenses.length > 0 
                  ? (expenses.reduce((sum, item) => sum + item.amount, 0) / expenses.length).toFixed(2) 
                  : '0.00'}
              </div>
            </div>
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Number of Entries</div>
              <div className="text-xl font-bold">{expenses.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Expense Entries - Moved below the summary */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Expense Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-fintrack-bg-dark">
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Category</th>
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
                    <td colSpan={5} className="px-4 py-6 text-center text-fintrack-text-secondary">
                      No expense entries found. Add your first expense entry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesPage;
