
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Edit, Trash2, Check, ListChecks, CalendarRange, PieChart, IndianRupee, ArrowUpDown 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface BudgetCategory {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

interface BudgetPeriod {
  id: string;
  month: string;
  year: string;
  totalAllocated: number;
  totalSpent: number;
  categories: BudgetCategory[];
}

// Sample data
const categories = [
  'Housing', 'Utilities', 'Groceries', 'Transportation', 
  'Entertainment', 'Health', 'Personal Care', 'Education', 'Debt Payments',
  'Insurance', 'Savings', 'Investments', 'Charity', 'Other'
];

const initialBudgets: BudgetPeriod[] = [
  {
    id: '1',
    month: '5',
    year: '2025',
    totalAllocated: 3500,
    totalSpent: 2500,
    categories: [
      { id: '1', category: 'Housing', allocated: 1200, spent: 1200, remaining: 0, percentageUsed: 100 },
      { id: '2', category: 'Utilities', allocated: 300, spent: 250, remaining: 50, percentageUsed: 83 },
      { id: '3', category: 'Groceries', allocated: 600, spent: 450, remaining: 150, percentageUsed: 75 },
      { id: '4', category: 'Transportation', allocated: 200, spent: 180, remaining: 20, percentageUsed: 90 },
      { id: '5', category: 'Entertainment', allocated: 300, spent: 200, remaining: 100, percentageUsed: 67 },
      { id: '6', category: 'Health', allocated: 200, spent: 50, remaining: 150, percentageUsed: 25 },
      { id: '7', category: 'Other', allocated: 700, spent: 170, remaining: 530, percentageUsed: 24 },
    ]
  }
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BudgetPage = () => {
  const [budgets, setBudgets] = useState<BudgetPeriod[]>(initialBudgets);
  const [activeBudget, setActiveBudget] = useState<string>(initialBudgets[0].id);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    category: '',
    allocated: 0
  });
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);

  const currentBudget = budgets.find(b => b.id === activeBudget) || budgets[0];
  
  const handleAddCategory = () => {
    if (!newCategory.category || newCategory.allocated <= 0) return;
    
    const updatedBudgets = budgets.map(budget => {
      if (budget.id === activeBudget) {
        const newCategoryItem: BudgetCategory = {
          id: Date.now().toString(),
          category: newCategory.category,
          allocated: newCategory.allocated,
          spent: 0,
          remaining: newCategory.allocated,
          percentageUsed: 0
        };
        
        return {
          ...budget,
          totalAllocated: budget.totalAllocated + newCategory.allocated,
          categories: [...budget.categories, newCategoryItem]
        };
      }
      return budget;
    });
    
    setBudgets(updatedBudgets);
    setNewCategory({ category: '', allocated: 0 });
    setIsAddingCategory(false);
  };
  
  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    
    const updatedBudgets = budgets.map(budget => {
      if (budget.id === activeBudget) {
        // Calculate the difference in allocation for updating the total
        const oldCategory = budget.categories.find(c => c.id === editingCategory.id);
        const allocationDifference = editingCategory.allocated - (oldCategory?.allocated || 0);
        
        const updatedCategories = budget.categories.map(category => {
          if (category.id === editingCategory.id) {
            return {
              ...editingCategory,
              remaining: editingCategory.allocated - editingCategory.spent,
              percentageUsed: editingCategory.spent > 0 
                ? Math.round((editingCategory.spent / editingCategory.allocated) * 100) 
                : 0
            };
          }
          return category;
        });
        
        return {
          ...budget,
          totalAllocated: budget.totalAllocated + allocationDifference,
          categories: updatedCategories
        };
      }
      return budget;
    });
    
    setBudgets(updatedBudgets);
    setEditingCategory(null);
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    const updatedBudgets = budgets.map(budget => {
      if (budget.id === activeBudget) {
        const categoryToDelete = budget.categories.find(c => c.id === categoryId);
        
        return {
          ...budget,
          totalAllocated: budget.totalAllocated - (categoryToDelete?.allocated || 0),
          totalSpent: budget.totalSpent - (categoryToDelete?.spent || 0),
          categories: budget.categories.filter(c => c.id !== categoryId)
        };
      }
      return budget;
    });
    
    setBudgets(updatedBudgets);
  };
  
  const getStatusColor = (percentageUsed: number) => {
    if (percentageUsed >= 100) return 'bg-red-500';
    if (percentageUsed >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budget Planning</h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-fintrack-text-secondary">Budget Period:</span>
          <Select 
            value={activeBudget}
            onValueChange={(value) => setActiveBudget(value)}
          >
            <SelectTrigger className="w-[180px] bg-fintrack-bg-dark border-fintrack-bg-dark">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
              {budgets.map((budget) => (
                <SelectItem key={budget.id} value={budget.id}>
                  {monthNames[parseInt(budget.month) - 1]} {budget.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 bg-fintrack-bg-dark mb-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-fintrack-purple/20">
            <PieChart className="h-4 w-4 mr-2" /> Budget Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-fintrack-purple/20">
            <ListChecks className="h-4 w-4 mr-2" /> Budget Categories
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-fintrack-purple/20">
            <ArrowUpDown className="h-4 w-4 mr-2" /> Budget Analysis
          </TabsTrigger>
        </TabsList>
        
        {/* Budget Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="card-gradient border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{currentBudget.totalAllocated.toLocaleString()}</div>
                <div className="text-sm text-fintrack-text-secondary mt-1">
                  For {monthNames[parseInt(currentBudget.month) - 1]} {currentBudget.year}
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gradient border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">₹{currentBudget.totalSpent.toLocaleString()}</div>
                <div className="text-sm text-fintrack-text-secondary mt-1">
                  {Math.round((currentBudget.totalSpent / currentBudget.totalAllocated) * 100)}% of budget used
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gradient border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  ₹{(currentBudget.totalAllocated - currentBudget.totalSpent).toLocaleString()}
                </div>
                <div className="text-sm text-fintrack-text-secondary mt-1">
                  {Math.round(((currentBudget.totalAllocated - currentBudget.totalSpent) / currentBudget.totalAllocated) * 100)}% of budget remaining
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Budget Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentBudget.categories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-sm">
                        <span className={category.percentageUsed >= 100 ? 'text-red-500' : ''}>
                          ₹{category.spent.toLocaleString()}
                        </span>
                        <span className="text-fintrack-text-secondary"> / ₹{category.allocated.toLocaleString()}</span>
                      </div>
                    </div>
                    <Progress 
                      value={category.percentageUsed} 
                      className="h-2"
                      indicatorClassName={getStatusColor(category.percentageUsed)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Budget Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
              <DialogTrigger asChild>
                <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
                  <Plus className="h-4 w-4 mr-2" /> Add Budget Category
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
                <DialogHeader>
                  <DialogTitle>Add Budget Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newCategory.category}
                      onValueChange={(value) => setNewCategory({...newCategory, category: value})}
                    >
                      <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark max-h-[200px]">
                        {categories
                          .filter(cat => !currentBudget.categories.some(c => c.category === cat))
                          .map((category, index) => (
                            <SelectItem key={index} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="allocated">Allocated Amount (₹)</Label>
                    <Input
                      id="allocated"
                      type="number"
                      value={newCategory.allocated}
                      onChange={(e) => setNewCategory({
                        ...newCategory, 
                        allocated: parseFloat(e.target.value) || 0
                      })}
                      className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                    />
                  </div>
                  <Button 
                    onClick={handleAddCategory}
                    className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
                  >
                    <Check className="h-4 w-4 mr-2" /> Add Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Budget Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-fintrack-bg-dark">
                      <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Allocated</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Spent</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Remaining</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Progress</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBudget.categories.map((category) => (
                      <tr key={category.id} className="border-b border-fintrack-bg-dark">
                        <td className="px-4 py-3 text-sm whitespace-nowrap font-medium">{category.category}</td>
                        <td className="px-4 py-3 text-sm text-right">₹{category.allocated.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-red-500">₹{category.spent.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-500">₹{category.remaining.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end">
                            <div className="w-24 h-2 bg-fintrack-bg-dark rounded-full overflow-hidden mr-2">
                              <div 
                                className={`h-full ${getStatusColor(category.percentageUsed)}`} 
                                style={{ width: `${Math.min(100, category.percentageUsed)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{category.percentageUsed}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Dialog 
                            open={editingCategory?.id === category.id} 
                            onOpenChange={(open) => {
                              if (!open) setEditingCategory(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingCategory(category)}
                                className="h-8 w-8 text-fintrack-text-secondary"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
                              <DialogHeader>
                                <DialogTitle>Edit Budget Category</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-category">Category</Label>
                                  <Input
                                    id="edit-category"
                                    value={editingCategory?.category}
                                    disabled
                                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-allocated">Allocated Amount (₹)</Label>
                                  <Input
                                    id="edit-allocated"
                                    type="number"
                                    value={editingCategory?.allocated}
                                    onChange={(e) => setEditingCategory(prev => {
                                      if (!prev) return prev;
                                      return {
                                        ...prev,
                                        allocated: parseFloat(e.target.value) || 0
                                      }
                                    })}
                                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-spent">Spent Amount (₹)</Label>
                                  <Input
                                    id="edit-spent"
                                    type="number"
                                    value={editingCategory?.spent}
                                    onChange={(e) => setEditingCategory(prev => {
                                      if (!prev) return prev;
                                      return {
                                        ...prev,
                                        spent: parseFloat(e.target.value) || 0
                                      }
                                    })}
                                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                                  />
                                </div>
                                <Button 
                                  onClick={handleUpdateCategory}
                                  className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
                                >
                                  <Check className="h-4 w-4 mr-2" /> Update Category
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="h-8 w-8 text-fintrack-text-secondary"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {currentBudget.categories.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-fintrack-text-secondary">
                          No budget categories found. Add your first budget category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Budget Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Budget vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  {currentBudget.categories.map((category) => {
                    const variance = category.allocated - category.spent;
                    const variancePercentage = Math.round((variance / category.allocated) * 100);
                    
                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{category.category}</div>
                          <div className="text-xs text-fintrack-text-secondary">
                            ₹{category.spent.toLocaleString()} of ₹{category.allocated.toLocaleString()}
                          </div>
                        </div>
                        <div className={`text-sm ${variance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {variance >= 0 ? '+' : ''}₹{variance.toLocaleString()} ({variance >= 0 ? '+' : ''}{variancePercentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Budget Health Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="text-sm text-fintrack-text-secondary mb-1">Budget Adherence</div>
                    <div className="text-xl font-bold">
                      {Math.round(((currentBudget.totalAllocated - currentBudget.totalSpent) / currentBudget.totalAllocated) * 100)}%
                    </div>
                    <div className="text-xs text-green-500 mt-1">
                      {currentBudget.totalSpent <= currentBudget.totalAllocated ? 'On Track' : 'Over Budget'}
                    </div>
                  </div>
                  
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="text-sm text-fintrack-text-secondary mb-1">Categories Over Budget</div>
                    <div className="text-xl font-bold">
                      {currentBudget.categories.filter(c => c.percentageUsed > 100).length} of {currentBudget.categories.length}
                    </div>
                  </div>
                  
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="text-sm text-fintrack-text-secondary mb-1">Days Remaining in Period</div>
                    <div className="text-xl font-bold">15</div>
                    <div className="text-xs text-fintrack-text-secondary mt-1">
                      Budget should last {Math.round(((currentBudget.totalAllocated - currentBudget.totalSpent) / (currentBudget.totalSpent / 15)))} days at current spending
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Budget Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="font-medium mb-1">Reduce Entertainment Spending</div>
                  <div className="text-sm text-fintrack-text-secondary">
                    Your Entertainment category is 67% spent with half the month remaining. Consider reducing spending in this category by ₹50 to stay on track.
                  </div>
                </div>
                
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="font-medium mb-1">Increase Housing Budget</div>
                  <div className="text-sm text-fintrack-text-secondary">
                    Your Housing category is consistently at 100% of budget. Consider increasing this allocation by 10% next month.
                  </div>
                </div>
                
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="font-medium mb-1">Reallocate Health Budget</div>
                  <div className="text-sm text-fintrack-text-secondary">
                    You've only used 25% of your Health budget. Consider reallocating ₹100 to categories that need additional funding.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetPage;
