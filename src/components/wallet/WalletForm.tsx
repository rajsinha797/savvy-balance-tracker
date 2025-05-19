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
import { WalletType, WalletCategoryWithTypeId, WalletSubCategory } from '@/services/walletService';
import { FamilyMember } from '@/services/familyService';

interface WalletFormProps {
  isEditing: boolean;
  formData: {
    id?: string | number;
    name: string;
    amount: number;
    wallet_type_id: number;
    wallet_category_id: number;
    wallet_sub_category_id?: number | null;
    date: string;
    description: string;
    family_member_id?: string;
  };
  onFormChange: (field: string, value: string | number | null) => void;
  onSubmit: () => void;
  walletTypes: WalletType[];
  getWalletCategoriesByType: (typeId: number) => Promise<WalletCategoryWithTypeId[]>;
  getWalletSubCategoriesByCategory: (categoryId: number) => Promise<WalletSubCategory[]>;
  familyMembers: FamilyMember[];
}

const WalletForm: React.FC<WalletFormProps> = ({
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  walletTypes,
  getWalletCategoriesByType,
  getWalletSubCategoriesByCategory,
  familyMembers,
}) => {
  const [categories, setCategories] = useState<WalletCategoryWithTypeId[]>([]);
  const [subcategories, setSubcategories] = useState<WalletSubCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  // Load categories when type changes
  useEffect(() => {
    const loadCategories = async () => {
      if (!formData.wallet_type_id) return;
      
      setIsLoadingCategories(true);
      try {
        const categoriesData = await getWalletCategoriesByType(formData.wallet_type_id);
        setCategories(categoriesData);
        
        // Reset category and subcategory if the type changes
        if (!isEditing) {
          onFormChange('wallet_category_id', 0);
          onFormChange('wallet_sub_category_id', null);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [formData.wallet_type_id, getWalletCategoriesByType, isEditing, onFormChange]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!formData.wallet_category_id) return;
      
      setIsLoadingSubcategories(true);
      try {
        const subcategoriesData = await getWalletSubCategoriesByCategory(formData.wallet_category_id);
        setSubcategories(subcategoriesData);
        
        // Reset subcategory if the category changes
        if (!isEditing) {
          onFormChange('wallet_sub_category_id', null);
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
      } finally {
        setIsLoadingSubcategories(false);
      }
    };
    
    loadSubcategories();
  }, [formData.wallet_category_id, getWalletSubCategoriesByCategory, isEditing, onFormChange]);

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Wallet Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter wallet name"
          value={formData.name || ''}
          onChange={(e) => onFormChange('name', e.target.value)}
          className="bg-fintrack-card-dark border border-fintrack-bg-dark"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={formData.amount || ''}
            onChange={(e) => onFormChange('amount', e.target.value ? parseFloat(e.target.value) : 0)}
            className="bg-fintrack-card-dark border border-fintrack-bg-dark"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || ''}
            onChange={(e) => onFormChange('date', e.target.value)}
            className="bg-fintrack-card-dark border border-fintrack-bg-dark"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="wallet-type">Wallet Type</Label>
        <Select
          value={formData.wallet_type_id ? String(formData.wallet_type_id) : ''}
          onValueChange={(value) => onFormChange('wallet_type_id', parseInt(value))}
        >
          <SelectTrigger id="wallet-type" className="bg-fintrack-card-dark border border-fintrack-bg-dark">
            <SelectValue placeholder="Select wallet type" />
          </SelectTrigger>
          <SelectContent>
            {walletTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="wallet-category">
          Wallet Category
          {isLoadingCategories && <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />}
        </Label>
        <Select
          value={formData.wallet_category_id ? String(formData.wallet_category_id) : ''}
          onValueChange={(value) => onFormChange('wallet_category_id', parseInt(value))}
          disabled={isLoadingCategories || categories.length === 0}
        >
          <SelectTrigger id="wallet-category" className="bg-fintrack-card-dark border border-fintrack-bg-dark">
            <SelectValue placeholder="Select wallet category" />
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
        <Label htmlFor="wallet-subcategory">
          Wallet Subcategory (Optional)
          {isLoadingSubcategories && <Loader2 className="h-4 w-4 inline ml-2 animate-spin" />}
        </Label>
        <Select
          value={formData.wallet_sub_category_id ? String(formData.wallet_sub_category_id) : 'none'}
          onValueChange={(value) => onFormChange('wallet_sub_category_id', value === 'none' ? null : parseInt(value))}
          disabled={isLoadingSubcategories || subcategories.length === 0}
        >
          <SelectTrigger id="wallet-subcategory" className="bg-fintrack-card-dark border border-fintrack-bg-dark">
            <SelectValue placeholder="Select wallet subcategory (optional)" />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                {subcategory.name}
              </SelectItem>
            ))}
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="family-member">Family Member (Optional)</Label>
        <Select
          value={formData.family_member_id || 'none'}
          onValueChange={(value) => onFormChange('family_member_id', value === 'none' ? '' : value)}
        >
          <SelectTrigger id="family-member" className="bg-fintrack-card-dark border border-fintrack-bg-dark">
            <SelectValue placeholder="Select family member (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
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
          className="bg-fintrack-card-dark border border-fintrack-bg-dark"
        />
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        className="w-full bg-fintrack-purple hover:bg-fintrack-purple/90"
      >
        {isEditing ? 'Update' : 'Add'} Wallet
      </Button>
    </form>
  );
};

export default WalletForm;
