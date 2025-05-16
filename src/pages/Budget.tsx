
import React, { useState, useEffect } from 'react';
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
import { useBudgetApi } from '@/hooks/useBudgetApi';

// Available categories for budgeting
const categories = [
  'Housing', 'Utilities', 'Groceries', 'Transportation', 
  'Entertainment', 'Health', 'Personal Care', 'Education', 'Debt Payments',
  'Insurance', 'Savings', 'Investments', 'Charity', 'Other'
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BudgetPage = () => {
  const [activeBudget, setActiveBudget] = useState<string>("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [newCategory, setNewCategory] = useState({
    category: '',
    allocated: 0
  });
  const [newBudget, setNewBudget] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    category: string;
    allocated: number;
    spent: number;
  } | null>(null);

  // Use the budget API hook
  const {
    budgetPeriods,
    activeBudget: currentBudget,
    isLoadingPeriods,
    isLoadingActiveBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    addCategory,
    updateCategory,
    deleteCategory
  } = useBudgetApi(activeBudget);

  // Set the active budget when budgets are loaded
  useEffect(() => {
    if (budgetPeriods && budgetPeriods.length > 0 && !activeBudget) {
      setActiveBudget(budgetPeriods[0].id);
    }
  }, [budgetPeriods, activeBudget]);

  const handleAddCategory = () => {
    if (!activeBudget || !newCategory.category || newCategory.allocated <= 0) return;
    
    addCategory({
      budgetId: activeBudget,
      category: {
        category: newCategory.category,
        allocated: newCategory.allocated
      }
    });
    
    setNewCategory({ category: '', allocated: 0 });
    setIsAddingCategory(false);
  };

  const handleAddBudget = () => {
    if (!newBudget.month || !newBudget.year) return;
    
    createBudget({
      month: String(newBudget.month),
      year: String(newBudget.year),
      totalAllocated: 0,
      totalSpent: 0,
      categories: []
    });
    
    setNewBudget({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setIsAddingBudget(false);
  };
  
  const handleUpdateCategory = () => {
    if (!editingCategory || !activeBudget) return;
    
    updateCategory({
      budgetId: activeBudget,
      categoryId: editingCategory.id,
      data: {
        allocated: editingCategory.allocated,
        spent: editingCategory.spent
      }
    });
    
    setEditingCategory(null);
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    if (!activeBudget) return;
    
    deleteCategory({
      budgetId: activeBudget,
      categoryId: categoryId
    });
  };
  
  const getStatusColor = (percentageUsed: number) => {
    if (percentageUsed >= 100) return 'bg-red-500';
    if (percentageUsed >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Loading state
  if (isLoadingPeriods) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fintrack-purple"></div>
      </div>
    );
  }

  // No budgets state
  if (budgetPeriods.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Budget Planning</h2>
          <Dialog open={isAddingBudget} onOpenChange={setIsAddingBudget}>
            <DialogTrigger asChild>
              <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
                <Plus className="h-4 w-4 mr-2" /> Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="month">Month</Label>
                  <Select 
                    value={String(newBudget.month)}
                    onValueChange={(value) => setNewBudget({...newBudget, month: parseInt(value)})}
                  >
                    <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
                      {monthNames.map((month, index) => (
                        <SelectItem key={index} value={String(index + 1)}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newBudget.year}
                    onChange={(e) => setNewBudget({...newBudget, year: parseInt(e.target.value) || new Date().getFullYear()})}
                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                    min="2020"
                    max="2030"
                  />
                </div>
                <Button 
                  onClick={handleAddBudget}
                  className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
                >
                  <Check className="h-4 w-4 mr-2" /> Create Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="card-gradient border-none">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="text-xl font-semibold mb-4">No Budget Periods Found</div>
            <p className="text-fintrack-text-secondary mb-6">Start by creating your first budget period to track your spending goals.</p>
            <Button 
              onClick={() => setIsAddingBudget(true)}
              className="bg-fintrack-purple hover:bg-fintrack-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Budget
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {budgetPeriods.map((budget) => (
                <SelectItem key={budget.id} value={budget.id}>
                  {monthNames[parseInt(budget.month) - 1]} {budget.year}
                </SelectItem>
              ))}
              <SelectItem value="new">
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" /> Create New Budget
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {activeBudget === "new" ? (
        <Dialog open={true} onOpenChange={() => setActiveBudget(budgetPeriods[0]?.id || "")}>
          <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="month">Month</Label>
                <Select 
                  value={String(newBudget.month)}
                  onValueChange={(value) => setNewBudget({...newBudget, month: parseInt(value)})}
                >
                  <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
                    {monthNames.map((month, index) => (
                      <SelectItem key={index} value={String(index + 1)}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={newBudget.year}
                  onChange={(e) => setNewBudget({...newBudget, year: parseInt(e.target.value) || new Date().getFullYear()})}
                  className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                  min="2020"
                  max="2030"
                />
              </div>
              <Button 
                onClick={handleAddBudget}
                className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
              >
                <Check className="h-4 w-4 mr-2" /> Create Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : isLoadingActiveBudget ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fintrack-purple"></div>
        </div>
      ) : currentBudget ? (
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
                    {Math.round((currentBudget.totalSpent / currentBudget.totalAllocated) * 100) || 0}% of budget used
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
                    {Math.round(((currentBudget.totalAllocated - currentBudget.totalSpent) / currentBudget.totalAllocated) * 100) || 0}% of budget remaining
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

                  {currentBudget.categories.length === 0 && (
                    <div className="text-center py-4 text-fintrack-text-secondary">
                      No budget categories defined. Add categories to start tracking your budget.
                    </div>
                  )}
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
                                  onClick={() => setEditingCategory({
                                    id: category.id,
                                    category: category.category,
                                    allocated: category.allocated,
                                    spent: category.spent
                                  })}
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
                      const variancePercentage = category.allocated > 0
                        ? Math.round((variance / category.allocated) * 100)
                        : 0;
                      
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

                    {currentBudget.categories.length === 0 && (
                      <div className="text-center py-4 text-fintrack-text-secondary">
                        No budget categories to analyze. Add categories to see analysis.
                      </div>
                    )}
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
                        {currentBudget.totalAllocated > 0
                          ? Math.round(((currentBudget.totalAllocated - currentBudget.totalSpent) / currentBudget.totalAllocated) * 100)
                          : 0}%
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
                        Budget should last {currentBudget.totalSpent > 0 
                          ? Math.round(((currentBudget.totalAllocated - currentBudget.totalSpent) / (currentBudget.totalSpent / 15)))
                          : "∞"} days at current spending
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
                  {currentBudget.categories.some(c => c.category === 'Entertainment' && c.percentageUsed > 50) && (
                    <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                      <div className="font-medium mb-1">Reduce Entertainment Spending</div>
                      <div className="text-sm text-fintrack-text-secondary">
                        Your Entertainment category is {currentBudget.categories.find(c => c.category === 'Entertainment')?.percentageUsed}% spent with half the month remaining. Consider reducing spending in this category.
                      </div>
                    </div>
                  )}
                  
                  {currentBudget.categories.some(c => c.category === 'Housing' && c.percentageUsed >= 100) && (
                    <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                      <div className="font-medium mb-1">Increase Housing Budget</div>
                      <div className="text-sm text-fintrack-text-secondary">
                        Your Housing category is consistently at 100% of budget. Consider increasing this allocation by 10% next month.
                      </div>
                    </div>
                  )}
                  
                  {currentBudget.categories.some(c => c.category === 'Health' && c.percentageUsed < 30) && (
                    <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                      <div className="font-medium mb-1">Reallocate Health Budget</div>
                      <div className="text-sm text-fintrack-text-secondary">
                        You've only used {currentBudget.categories.find(c => c.category === 'Health')?.percentageUsed}% of your Health budget. Consider reallocating some funds to categories that need additional funding.
                      </div>
                    </div>
                  )}

                  {(!currentBudget.categories.some(c => c.category === 'Entertainment' && c.percentageUsed > 50) &&
                    !currentBudget.categories.some(c => c.category === 'Housing' && c.percentageUsed >= 100) &&
                    !currentBudget.categories.some(c => c.category === 'Health' && c.percentageUsed < 30)) && (
                    <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                      <div className="font-medium mb-1">Your Budget is Well-Balanced</div>
                      <div className="text-sm text-fintrack-text-secondary">
                        No specific recommendations at this time. Continue monitoring your spending patterns.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-fintrack-text-secondary">No budget data available</div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
