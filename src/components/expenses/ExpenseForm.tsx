
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  ExpenseType, 
  ExpenseCategoryWithTypeId, 
  ExpenseSubCategory 
} from '@/services/expenseService';
import { FamilyMember } from '@/services/familyService';

interface ExpenseFormProps {
  isEditing: boolean;
  formData: {
    amount: number;
    category?: string; // Legacy, kept for backward compatibility
    expense_type_id: number;
    expense_category_id: number;
    expense_sub_category_id: number;
    description: string;
    date: string;
    family_member_id: string;
  };
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  expenseTypes: ExpenseType[];
  familyMembers: FamilyMember[];
  getExpenseCategoriesByType: (typeId: number) => Promise<ExpenseCategoryWithTypeId[]>;
  getExpenseSubCategoriesByCategory: (categoryId: number) => Promise<ExpenseSubCategory[]>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  expenseTypes = [],
  familyMembers,
  getExpenseCategoriesByType,
  getExpenseSubCategoriesByCategory
}) => {
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryWithTypeId[]>([]);
  const [expenseSubCategories, setExpenseSubCategories] = useState<ExpenseSubCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.date ? new Date(formData.date) : undefined
  );

  // Fetch categories when type changes
  useEffect(() => {
    if (formData.expense_type_id) {
      setIsLoadingCategories(true);
      getExpenseCategoriesByType(formData.expense_type_id)
        .then(categories => {
          setExpenseCategories(categories);
          setIsLoadingCategories(false);
        })
        .catch(() => {
          setIsLoadingCategories(false);
        });
    } else {
      setExpenseCategories([]);
    }
  }, [formData.expense_type_id, getExpenseCategoriesByType]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.expense_category_id) {
      setIsLoadingSubCategories(true);
      getExpenseSubCategoriesByCategory(formData.expense_category_id)
        .then(subCategories => {
          setExpenseSubCategories(subCategories);
          setIsLoadingSubCategories(false);
        })
        .catch(() => {
          setIsLoadingSubCategories(false);
        });
    } else {
      setExpenseSubCategories([]);
    }
  }, [formData.expense_category_id, getExpenseSubCategoriesByCategory]);

  // Update formData when date changes
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onFormChange('date', format(date, 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            onFormChange('amount', value || 0);
          }}
          className="bg-fintrack-bg-dark border-fintrack-bg-dark"
        />
      </div>
      
      {/* Expense Type Selection */}
      <div className="grid gap-2">
        <Label htmlFor="expense_type_id">Expense Type</Label>
        <Select
          value={String(formData.expense_type_id || "")}
          onValueChange={(value) => {
            const typeId = parseInt(value);
            onFormChange('expense_type_id', typeId);
            // Reset category and subcategory when type changes
            onFormChange('expense_category_id', 0);
            onFormChange('expense_sub_category_id', 0);
          }}
        >
          <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
            <SelectValue placeholder="Select expense type" />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            {expenseTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Expense Category Selection */}
      <div className="grid gap-2">
        <Label htmlFor="expense_category_id">Expense Category</Label>
        <Select
          value={String(formData.expense_category_id || "")}
          onValueChange={(value) => {
            const categoryId = parseInt(value);
            onFormChange('expense_category_id', categoryId);
            // Reset subcategory when category changes
            onFormChange('expense_sub_category_id', 0);
          }}
          disabled={!formData.expense_type_id || isLoadingCategories}
        >
          <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
            <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select expense category"} />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            {expenseCategories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Expense Sub Category Selection */}
      <div className="grid gap-2">
        <Label htmlFor="expense_sub_category_id">Expense Sub Category</Label>
        <Select
          value={String(formData.expense_sub_category_id || "")}
          onValueChange={(value) => {
            const subCategoryId = parseInt(value);
            onFormChange('expense_sub_category_id', subCategoryId);
          }}
          disabled={!formData.expense_category_id || isLoadingSubCategories}
        >
          <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
            <SelectValue placeholder={isLoadingSubCategories ? "Loading subcategories..." : "Select expense subcategory"} />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            {expenseSubCategories.map((subCategory) => (
              <SelectItem key={subCategory.id} value={String(subCategory.id)}>
                {subCategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="family_member">Family Member</Label>
        <Select
          value={String(formData.family_member_id || "")}
          onValueChange={(value) => {
            onFormChange('family_member_id', value);
          }}
        >
          <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
            <SelectValue placeholder="Select family member" />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            {familyMembers.map((member) => (
              <SelectItem key={member.id} value={String(member.id || `member-${member.name}`)}>
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
          value={formData.description}
          onChange={(e) => {
            onFormChange('description', e.target.value);
          }}
          className="bg-fintrack-bg-dark border-fintrack-bg-dark"
        />
      </div>
      
      {/* Date Picker */}
      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-fintrack-bg-dark border-fintrack-bg-dark",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-fintrack-card-dark border-fintrack-bg-dark">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Button 
        onClick={onSubmit}
        className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
        disabled={!formData.amount || !formData.expense_type_id || !formData.expense_category_id || !formData.expense_sub_category_id || !formData.date}
      >
        <Check className="h-4 w-4 mr-2" />
        {isEditing ? 'Update Expense' : 'Add Expense'}
      </Button>
    </div>
  );
};

export default ExpenseForm;
