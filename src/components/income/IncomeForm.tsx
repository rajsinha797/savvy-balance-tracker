
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
import { IncomeCategory } from '@/services/incomeService';
import { FamilyMember } from '@/services/familyService';
import { useWalletApi } from '@/hooks/useWalletApi';

interface IncomeFormProps {
  isEditing: boolean;
  formData: {
    id?: string | number;
    amount: number;
    income_type_id: number;
    income_category_id: number;
    income_sub_category_id: number;
    date: string;
    description: string;
    family_member_id?: string;
    wallet_id?: number | null;
  };
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  categories: IncomeCategory[];
  incomeTypes: any[]; // Type will be determined by API response
  getIncomeCategoriesByType: (typeId: number) => Promise<any[]>;
  getIncomeSubCategoriesByCategory: (categoryId: number) => Promise<any[]>;
  familyMembers: FamilyMember[];
}

const IncomeForm: React.FC<IncomeFormProps> = ({
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  categories,
  incomeTypes,
  getIncomeCategoriesByType,
  getIncomeSubCategoriesByCategory,
  familyMembers,
}) => {
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [incomeSubCategories, setIncomeSubCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const { availableWallets, isLoadingWallets } = useWalletApi();
  
  // Load categories when type changes
  useEffect(() => {
    const loadCategories = async () => {
      if (!formData.income_type_id) return;
      
      setIsLoadingCategories(true);
      try {
        const categoriesData = await getIncomeCategoriesByType(formData.income_type_id);
        setIncomeCategories(categoriesData);
        
        // Reset category and subcategory if the type changes
        if (!isEditing) {
          onFormChange('income_category_id', 0);
          onFormChange('income_sub_category_id', 0);
        }
      } catch (error) {
        console.error('Error loading income categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [formData.income_type_id, getIncomeCategoriesByType, isEditing, onFormChange]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      if (!formData.income_category_id) return;
      
      setIsLoadingSubCategories(true);
      try {
        const subCategoriesData = await getIncomeSubCategoriesByCategory(formData.income_category_id);
        setIncomeSubCategories(subCategoriesData);
        
        // Reset subcategory if the category changes
        if (!isEditing) {
          onFormChange('income_sub_category_id', 0);
        }
      } catch (error) {
        console.error('Error loading income subcategories:', error);
      } finally {
        setIsLoadingSubCategories(false);
      }
    };
    
    loadSubCategories();
  }, [formData.income_category_id, getIncomeSubCategoriesByCategory, isEditing, onFormChange]);

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
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
      
      {/* New Income Type Select */}
      <div className="space-y-2">
        <Label htmlFor="income-type">Income Type</Label>
        <Select
          value={formData.income_type_id ? String(formData.income_type_id) : ''}
          onValueChange={(value) => onFormChange('income_type_id', parseInt(value))}
        >
          <SelectTrigger id="income-type" className="bg-fintrack-input">
            <SelectValue placeholder="Select income type" />
          </SelectTrigger>
          <SelectContent>
            {incomeTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* New Income Category Select */}
      <div className="space-y-2">
        <Label htmlFor="income-category">
          Income Category
          {isLoadingCategories && <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />}
        </Label>
        <Select
          value={formData.income_category_id ? String(formData.income_category_id) : ''}
          onValueChange={(value) => onFormChange('income_category_id', parseInt(value))}
          disabled={isLoadingCategories || incomeCategories.length === 0}
        >
          <SelectTrigger id="income-category" className="bg-fintrack-input">
            <SelectValue placeholder="Select income category" />
          </SelectTrigger>
          <SelectContent>
            {incomeCategories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* New Income Sub-Category Select */}
      <div className="space-y-2">
        <Label htmlFor="income-sub-category">
          Income Sub-Category
          {isLoadingSubCategories && <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />}
        </Label>
        <Select
          value={formData.income_sub_category_id ? String(formData.income_sub_category_id) : ''}
          onValueChange={(value) => onFormChange('income_sub_category_id', parseInt(value))}
          disabled={isLoadingSubCategories || incomeSubCategories.length === 0}
        >
          <SelectTrigger id="income-sub-category" className="bg-fintrack-input">
            <SelectValue placeholder="Select income sub-category" />
          </SelectTrigger>
          <SelectContent>
            {incomeSubCategories.map((subcategory) => (
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
          Deposit Wallet
          {isLoadingWallets && <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />}
        </Label>
        <Select
          value={formData.wallet_id ? String(formData.wallet_id) : ''}
          onValueChange={(value) => onFormChange('wallet_id', value ? parseInt(value) : 0)}
        >
          <SelectTrigger id="wallet" className="bg-fintrack-input">
            <SelectValue placeholder="Select deposit wallet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">None</SelectItem>
            {availableWallets.map((wallet) => (
              <SelectItem key={wallet.id} value={String(wallet.id)}>
                {wallet.name} ({wallet.type_name})
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
        type="submit"
        className="w-full bg-fintrack-purple hover:bg-fintrack-purple/90"
      >
        {isEditing ? 'Update' : 'Add'} Income
      </Button>
    </form>
  );
};

export default IncomeForm;
