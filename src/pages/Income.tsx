
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Income {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const initialIncomes: Income[] = [
  { id: '1', amount: 3500, category: 'Salary', description: 'Monthly salary', date: '2025-05-01' },
  { id: '2', amount: 500, category: 'Freelance', description: 'Logo design project', date: '2025-05-03' },
  { id: '3', amount: 200, category: 'Interest', description: 'Savings account interest', date: '2025-05-05' },
];

const IncomePage = () => {
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [newIncome, setNewIncome] = useState<Omit<Income, 'id'>>({ 
    amount: 0, 
    category: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddIncome = () => {
    if (newIncome.amount <= 0 || !newIncome.category) return;
    
    const income: Income = {
      ...newIncome,
      id: Date.now().toString(),
    };
    
    setIncomes([income, ...incomes]);
    setNewIncome({ 
      amount: 0, 
      category: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0] 
    });
    setIsDialogOpen(false);
  };

  const handleEditIncome = () => {
    if (!editingIncome || editingIncome.amount <= 0 || !editingIncome.category) return;
    
    setIncomes(incomes.map(income => 
      income.id === editingIncome.id ? editingIncome : income
    ));
    
    setEditingIncome(null);
    setIsDialogOpen(false);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income Management</h2>
        
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
                  value={editingIncome ? editingIncome.category : newIncome.category}
                  onValueChange={(value) => {
                    if (editingIncome) {
                      setEditingIncome({ ...editingIncome, category: value });
                    } else {
                      setNewIncome({ ...newIncome, category: value });
                    }
                  }}
                >
                  <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Interest">Interest</SelectItem>
                    <SelectItem value="Dividend">Dividend</SelectItem>
                    <SelectItem value="Gift">Gift</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
      
      {/* Income Summary - Moved to the top */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Income Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Total Income</div>
              <div className="text-xl font-bold text-green-500">
                ₹{incomes.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Average Income</div>
              <div className="text-xl font-bold text-fintrack-purple">
                ₹{incomes.length > 0 
                  ? (incomes.reduce((sum, item) => sum + item.amount, 0) / incomes.length).toFixed(2) 
                  : '0.00'}
              </div>
            </div>
            <div className="bg-fintrack-bg-dark p-4 rounded-xl">
              <div className="text-sm text-fintrack-text-secondary mb-1">Number of Entries</div>
              <div className="text-xl font-bold">{incomes.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Income Entries - Moved below the summary */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Income Entries</CardTitle>
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
                {incomes.map((income) => (
                  <tr key={income.id} className="border-b border-fintrack-bg-dark">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{income.date}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500">
                        {income.category}
                      </span>
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
                          setEditingIncome(income);
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
                    <td colSpan={5} className="px-4 py-6 text-center text-fintrack-text-secondary">
                      No income entries found. Add your first income entry.
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

export default IncomePage;
