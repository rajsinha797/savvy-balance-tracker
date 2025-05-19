
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ExpenseType, 
  ExpenseCategoryWithTypeId,
  ExpenseSubCategory,
  getAllExpenseTypes,
  getExpenseCategoriesByType,
  getExpenseSubcategoriesByCategory
} from "@/services/expenseService";

interface BudgetCategoryFormProps {
  onSubmit: (category: string, allocated: number) => void;
}

const BudgetCategoryForm: React.FC<BudgetCategoryFormProps> = ({ onSubmit }) => {
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryWithTypeId[]>([]);
  const [expenseSubCategories, setExpenseSubCategories] = useState<ExpenseSubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [allocated, setAllocated] = useState<number>(0);
  const [categoryName, setCategoryName] = useState<string>('');

  // Load expense types on component mount
  useEffect(() => {
    const loadExpenseTypes = async () => {
      try {
        setLoading(true);
        const types = await getAllExpenseTypes();
        setExpenseTypes(types);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load expense types:", error);
        setLoading(false);
      }
    };
    
    loadExpenseTypes();
  }, []);

  // Load categories when type changes
  useEffect(() => {
    const loadExpenseCategories = async () => {
      if (selectedTypeId) {
        try {
          setLoading(true);
          const categories = await getExpenseCategoriesByType(selectedTypeId);
          setExpenseCategories(categories);
          setLoading(false);
        } catch (error) {
          console.error(`Failed to load expense categories for type ${selectedTypeId}:`, error);
          setLoading(false);
        }
      } else {
        setExpenseCategories([]);
      }
      // Reset subcategory selection when type changes
      setSelectedCategoryId(null);
      setSelectedSubCategoryId(null);
      setExpenseSubCategories([]);
    };
    
    loadExpenseCategories();
  }, [selectedTypeId]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadExpenseSubCategories = async () => {
      if (selectedCategoryId) {
        try {
          setLoading(true);
          const subcategories = await getExpenseSubcategoriesByCategory(selectedCategoryId);
          setExpenseSubCategories(subcategories);
          setLoading(false);
        } catch (error) {
          console.error(`Failed to load expense subcategories for category ${selectedCategoryId}:`, error);
          setLoading(false);
        }
      } else {
        setExpenseSubCategories([]);
      }
      // Reset subcategory selection when category changes
      setSelectedSubCategoryId(null);
    };
    
    loadExpenseSubCategories();
  }, [selectedCategoryId]);

  // Set category name when selections change
  useEffect(() => {
    let name = '';
    
    if (selectedTypeId && selectedCategoryId && selectedSubCategoryId) {
      const type = expenseTypes.find(t => t.id === selectedTypeId);
      const category = expenseCategories.find(c => c.id === selectedCategoryId);
      const subcategory = expenseSubCategories.find(s => s.id === selectedSubCategoryId);
      
      if (type && category && subcategory) {
        // Use the subcategory name for the budget category
        name = subcategory.name;
      }
    } else if (selectedTypeId && selectedCategoryId) {
      const type = expenseTypes.find(t => t.id === selectedTypeId);
      const category = expenseCategories.find(c => c.id === selectedCategoryId);
      
      if (type && category) {
        // Use the category name if no subcategory is selected
        name = category.name;
      }
    } else if (selectedTypeId) {
      const type = expenseTypes.find(t => t.id === selectedTypeId);
      
      if (type) {
        // Use the type name if no category is selected
        name = type.name;
      }
    }
    
    setCategoryName(name);
  }, [selectedTypeId, selectedCategoryId, selectedSubCategoryId, expenseTypes, expenseCategories, expenseSubCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (categoryName && allocated > 0) {
      onSubmit(categoryName, allocated);
      
      // Reset form
      setSelectedTypeId(null);
      setSelectedCategoryId(null);
      setSelectedSubCategoryId(null);
      setAllocated(0);
      setCategoryName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="expense-type">Expense Type</Label>
        <Select 
          value={selectedTypeId?.toString() || ''} 
          onValueChange={(value) => setSelectedTypeId(parseInt(value))}
        >
          <SelectTrigger id="expense-type">
            <SelectValue placeholder="Select expense type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Expense Types</SelectLabel>
              {expenseTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-category">Expense Category</Label>
        <Select 
          value={selectedCategoryId?.toString() || ''} 
          onValueChange={(value) => setSelectedCategoryId(parseInt(value))}
          disabled={!selectedTypeId || expenseCategories.length === 0}
        >
          <SelectTrigger id="expense-category">
            <SelectValue placeholder="Select expense category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Expense Categories</SelectLabel>
              {expenseCategories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-subcategory">Expense Subcategory</Label>
        <Select 
          value={selectedSubCategoryId?.toString() || ''} 
          onValueChange={(value) => setSelectedSubCategoryId(parseInt(value))}
          disabled={!selectedCategoryId || expenseSubCategories.length === 0}
        >
          <SelectTrigger id="expense-subcategory">
            <SelectValue placeholder="Select expense subcategory" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Expense Subcategories</SelectLabel>
              {expenseSubCategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-name">Category Name</Label>
        <Input 
          id="category-name" 
          value={categoryName} 
          onChange={(e) => setCategoryName(e.target.value)} 
          placeholder="Category name will be auto-filled based on selections"
          readOnly
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allocated">Allocated Amount (₹)</Label>
        <Input 
          id="allocated" 
          type="number" 
          min="0" 
          step="0.01" 
          value={allocated || ''} 
          onChange={(e) => setAllocated(parseFloat(e.target.value) || 0)} 
          required 
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-fintrack-purple hover:bg-fintrack-purple/90"
        disabled={!categoryName || allocated <= 0}
      >
        Add Budget Category
      </Button>
    </form>
  );
};

export default BudgetCategoryForm;
