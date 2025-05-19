
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { ExpenseSubCategory, ExpenseType } from '@/services/expenseService';
import { ExpenseCategory } from '@/services/expenseCategoryService';
import { FamilyMember } from '@/services/familyService';
import { Wallet } from '@/services/walletService';

interface ExpenseFormProps {
  isEditing: boolean;
  formData: {
    amount: number;
    expense_type_id: number;
    expense_category_id: number;
    expense_sub_category_id: number;
    description: string;
    date: string;
    family_member_id: string;
    wallet_id: number | null;
  };
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  expenseTypes: ExpenseType[];
  getExpenseCategoriesByType: (typeId: number) => Promise<any[]>;
  getExpenseSubCategoriesByCategory: (categoryId: number) => Promise<any[]>;
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
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [expenseSubCategories, setExpenseSubCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);

  // Load categories when type changes
  useEffect(() => {
    if (formData.expense_type_id) {
      setIsLoadingCategories(true);
      getExpenseCategoriesByType(formData.expense_type_id)
        .then(categories => {
          setExpenseCategories(categories);
          setIsLoadingCategories(false);
        })
        .catch(() => {
          setExpenseCategories([]);
          setIsLoadingCategories(false);
        });
    } else {
      setExpenseCategories([]);
    }
  }, [formData.expense_type_id, getExpenseCategoriesByType]);

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.expense_category_id) {
      setIsLoadingSubCategories(true);
      getExpenseSubCategoriesByCategory(formData.expense_category_id)
        .then(subcategories => {
          setExpenseSubCategories(subcategories);
          setIsLoadingSubCategories(false);
        })
        .catch(() => {
          setExpenseSubCategories([]);
          setIsLoadingSubCategories(false);
        });
    } else {
      setExpenseSubCategories([]);
    }
  }, [formData.expense_category_id, getExpenseSubCategoriesByCategory]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => onFormChange('amount', parseFloat(e.target.value) || 0)}
            placeholder="Enter amount"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => onFormChange('date', e.target.value)}
          />
        </div>

        {/* Expense Type */}
        <div className="space-y-2">
          <Label htmlFor="expense-type">Type</Label>
          <Select
            value={formData.expense_type_id ? formData.expense_type_id.toString() : ""}
            onValueChange={(value) => onFormChange('expense_type_id', parseInt(value) || 0)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an expense type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {expenseTypes && expenseTypes.length > 0 ? (
                  expenseTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="placeholder" disabled>No types available</SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Expense Category */}
        <div className="space-y-2">
          <Label htmlFor="expense-category">Category</Label>
          <Select
            value={formData.expense_category_id ? formData.expense_category_id.toString() : ""}
            onValueChange={(value) => onFormChange('expense_category_id', parseInt(value) || 0)}
            disabled={isLoadingCategories || !formData.expense_type_id}
          >
            <SelectTrigger>
              {isLoadingCategories ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select a category" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {expenseCategories && expenseCategories.length > 0 ? (
                  expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="placeholder" disabled>
                    {formData.expense_type_id ? "No categories available" : "Select a type first"}
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Expense Subcategory */}
        <div className="space-y-2">
          <Label htmlFor="expense-subcategory">Subcategory</Label>
          <Select
            value={formData.expense_sub_category_id ? formData.expense_sub_category_id.toString() : ""}
            onValueChange={(value) => onFormChange('expense_sub_category_id', parseInt(value) || 0)}
            disabled={isLoadingSubCategories || !formData.expense_category_id}
          >
            <SelectTrigger>
              {isLoadingSubCategories ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select a subcategory" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {expenseSubCategories && expenseSubCategories.length > 0 ? (
                  expenseSubCategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="placeholder" disabled>
                    {formData.expense_category_id ? "No subcategories available" : "Select a category first"}
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Family Member */}
        <div className="space-y-2">
          <Label htmlFor="family-member">Family Member</Label>
          <Select
            value={formData.family_member_id || ""}
            onValueChange={(value) => onFormChange('family_member_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a family member" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {familyMembers && familyMembers.length > 0 ? (
                  familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="placeholder" disabled>No family members available</SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            placeholder="Enter a description"
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full mt-4">
          {isEditing ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
