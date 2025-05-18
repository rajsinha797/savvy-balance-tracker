
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  IncomeCategory, 
  IncomeItem, 
  IncomeType,
  IncomeCategoryWithTypeId,
  IncomeSubCategory
} from '@/services/incomeService';
import { FamilyMember } from '@/services/familyService';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface IncomeFormProps {
  isEditing: boolean;
  formData: {
    amount: number;
    category_id?: number; // Kept for backward compatibility
    income_type_id: number;
    income_category_id: number;
    income_sub_category_id: number;
    description: string;
    date: string;
    family_member_id: string;
  };
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  categories: IncomeCategory[]; // Legacy categories, kept for backward compatibility
  incomeTypes: IncomeType[]; // New types
  familyMembers: FamilyMember[];
  getIncomeCategoriesByType: (typeId: number) => Promise<IncomeCategoryWithTypeId[]>;
  getIncomeSubCategoriesByCategory: (categoryId: number) => Promise<IncomeSubCategory[]>;
}

const IncomeForm: React.FC<IncomeFormProps> = ({
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  categories,
  incomeTypes = [],
  familyMembers,
  getIncomeCategoriesByType,
  getIncomeSubCategoriesByCategory
}) => {
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategoryWithTypeId[]>([]);
  const [incomeSubCategories, setIncomeSubCategories] = useState<IncomeSubCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    formData.date ? new Date(formData.date) : undefined
  );

  // Fetch categories when type changes
  useEffect(() => {
    if (formData.income_type_id) {
      setIsLoadingCategories(true);
      getIncomeCategoriesByType(formData.income_type_id)
        .then(categories => {
          setIncomeCategories(categories);
          setIsLoadingCategories(false);
        })
        .catch(() => {
          setIsLoadingCategories(false);
        });
    } else {
      setIncomeCategories([]);
    }
  }, [formData.income_type_id, getIncomeCategoriesByType]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.income_category_id) {
      setIsLoadingSubCategories(true);
      getIncomeSubCategoriesByCategory(formData.income_category_id)
        .then(subCategories => {
          setIncomeSubCategories(subCategories);
          setIsLoadingSubCategories(false);
        })
        .catch(() => {
          setIsLoadingSubCategories(false);
        });
    } else {
      setIncomeSubCategories([]);
    }
  }, [formData.income_category_id, getIncomeSubCategoriesByCategory]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onFormChange('date', format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount || ''}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            onFormChange('amount', value || 0);
          }}
          className="bg-fintrack-bg-dark border-fintrack-bg-dark"
        />
      </div>
      
      {/* Income Type Selection */}
      <div className="grid gap-2">
        <Label htmlFor="income_type_id">Income Type</Label>
        <Select
          value={String(formData.income_type_id || "")}
          onValueChange={(value) => {
            const typeId = parseInt(value);
            onFormChange('income_type_id', typeId);
            // Reset category and subcategory when type changes
            onFormChange('income_category_id', 0);
            onFormChange('income_sub_category_id', 0);
          }}
        >
          <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
            <SelectValue placeholder="Select income type" />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            {incomeTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Income Category Selection */}
      <div className="grid gap-2">
        <Label htmlFor="income_category_id">Income Category</Label>
        <Select
          value={String(formData.income_category_id || "")}
          onValueChange={(value) => {
            const categoryId = parseInt(value);
            onFormChange('income_category_id', categoryId);
            // Reset subcategory when category changes
            onFormChange('income_sub_category_id', 0);
          }}
          disabled={!formData.income_type_id || isLoadingCategories}
        >
          <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
            <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select income category"} />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            {incomeCategories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Income Sub Category Selection */}
      <div className="grid gap-2">
        <Label htmlFor="income_sub_category_id">Income Sub Category</Label>
        <Select
          value={String(formData.income_sub_category_id || "")}
          onValueChange={(value) => {
            const subCategoryId = parseInt(value);
            onFormChange('income_sub_category_id', subCategoryId);
          }}
          disabled={!formData.income_category_id || isLoadingSubCategories}
        >
          <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
            <SelectValue placeholder={isLoadingSubCategories ? "Loading subcategories..." : "Select income subcategory"} />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            {incomeSubCategories.map((subCategory) => (
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
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-fintrack-bg-dark border-fintrack-bg-dark",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-fintrack-card-dark border-fintrack-bg-dark" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Button 
        onClick={onSubmit}
        className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
        disabled={!formData.amount || !formData.income_type_id || !formData.income_category_id || !formData.income_sub_category_id || !date}
      >
        <Check className="h-4 w-4 mr-2" />
        {isEditing ? 'Update Income' : 'Add Income'}
      </Button>
    </div>
  );
};

export default IncomeForm;
