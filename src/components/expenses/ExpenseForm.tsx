
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ExpenseType, ExpenseCategoryWithTypeId, ExpenseSubCategory } from '@/services/expenseService';
import { FamilyMember } from '@/services/familyService';
import { useWalletApi } from '@/hooks/useWalletApi';

interface ExpenseFormProps {
  isEditing: boolean;
  formData: {
    id?: string | number;
    amount: number;
    expense_type_id: number;
    expense_category_id: number;
    expense_sub_category_id: number;
    date: string;
    description: string;
    family_member_id?: string;
    wallet_id?: number | null;
  };
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  expenseTypes: ExpenseType[];
  getExpenseCategoriesByType: (typeId: number) => Promise<ExpenseCategoryWithTypeId[]>;
  getExpenseSubCategoriesByCategory: (categoryId: number) => Promise<ExpenseSubCategory[]>;
  familyMembers: FamilyMember[];
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  expenseTypes,
  getExpenseCategoriesByType,
  getExpenseSubCategoriesByCategory,
  familyMembers,
}) => {
  const [categories, setCategories] = useState<ExpenseCategoryWithTypeId[]>([]);
  const [subcategories, setSubcategories] = useState<ExpenseSubCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const { availableWallets, isLoadingWallets } = useWalletApi();

  // Load categories when type changes
  useEffect(() => {
    const loadCategories = async () => {
      if (!formData.expense_type_id) return;
      
      setIsLoadingCategories(true);
      try {
        const categoriesData = await getExpenseCategoriesByType(formData.expense_type_id);
        setCategories(categoriesData);
        
        // Reset category and subcategory if the type changes
        if (!isEditing) {
          onFormChange('expense_category_id', 0);
          onFormChange('expense_sub_category_id', 0);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [formData.expense_type_id, getExpenseCategoriesByType, isEditing, onFormChange]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!formData.expense_category_id) return;
      
      setIsLoadingSubcategories(true);
      try {
        const subcategoriesData = await getExpenseSubCategoriesByCategory(formData.expense_category_id);
        setSubcategories(subcategoriesData);
        
        // Reset subcategory if the category changes
        if (!isEditing) {
          onFormChange('expense_sub_category_id', 0);
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
      } finally {
        setIsLoadingSubcategories(false);
      }
    };
    
    loadSubcategories();
  }, [formData.expense_category_id, getExpenseSubCategoriesByCategory, isEditing, onFormChange]);

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          value={formData.amount || ''}
          onChange={(e) => onFormChange('amount', e.target.value ? parseFloat(e.target.value) : 0)}
          className="bg-fintrack-input"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date || ''}
          onChange={(e) => onFormChange('date', e.target.value)}
          className="bg-fintrack-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-type">Expense Type</Label>
        <Select
          value={formData.expense_type_id ? String(formData.expense_type_id) : ''}
          onValueChange={(value) => onFormChange('expense_type_id', parseInt(value))}
        >
          <SelectTrigger id="expense-type" className="bg-fintrack-input">
            <SelectValue placeholder="Select expense type" />
          </SelectTrigger>
          <SelectContent>
            {expenseTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-category">
          Expense Category
          {isLoadingCategories && <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />}
        </Label>
        <Select
          value={formData.expense_category_id ? String(formData.expense_category_id) : ''}
          onValueChange={(value) => onFormChange('expense_category_id', parseInt(value))}
          disabled={isLoadingCategories || categories.length === 0}
        >
          <SelectTrigger id="expense-category" className="bg-fintrack-input">
            <SelectValue placeholder="Select expense category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-subcategory">
          Expense Subcategory
          {isLoadingSubcategories && <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />}
        </Label>
        <Select
          value={formData.expense_sub_category_id ? String(formData.expense_sub_category_id) : ''}
          onValueChange={(value) => onFormChange('expense_sub_category_id', parseInt(value))}
          disabled={isLoadingSubcategories || subcategories.length === 0}
        >
          <SelectTrigger id="expense-subcategory" className="bg-fintrack-input">
            <SelectValue placeholder="Select expense subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                {subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add Wallet Selection */}
      <div className="space-y-2">
        <Label htmlFor="wallet">
          Payment Wallet
          {isLoadingWallets && <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />}
        </Label>
        <Select
          value={formData.wallet_id ? String(formData.wallet_id) : ''}
          onValueChange={(value) => onFormChange('wallet_id', value ? parseInt(value) : null)}
        >
          <SelectTrigger id="wallet" className="bg-fintrack-input">
            <SelectValue placeholder="Select payment wallet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {availableWallets.filter(wallet => wallet.is_expense === 1).map((wallet) => (
              <SelectItem key={wallet.id} value={String(wallet.id)}>
                {wallet.name} ({wallet.wallet_type_name || wallet.type_name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="family-member">Family Member (Optional)</Label>
        <Select
          value={formData.family_member_id || ''}
          onValueChange={(value) => onFormChange('family_member_id', value)}
        >
          <SelectTrigger id="family-member" className="bg-fintrack-input">
            <SelectValue placeholder="Select family member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {familyMembers.map((member) => (
              <SelectItem key={member.id} value={String(member.id)}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Enter description"
          value={formData.description || ''}
          onChange={(e) => onFormChange('description', e.target.value)}
          className="bg-fintrack-input"
        />
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        className="w-full bg-fintrack-purple hover:bg-fintrack-purple/90"
      >
        {isEditing ? 'Update' : 'Add'} Expense
      </Button>
    </form>
  );
};

export default ExpenseForm;
