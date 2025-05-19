
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
import { IncomeCategory } from '@/services/incomeService';
import { FamilyMember } from '@/services/familyService';
import { Wallet } from '@/services/walletService';
import { useWalletApi } from '@/hooks/useWalletApi';

interface IncomeFormProps {
  isEditing: boolean;
  formData: {
    amount: number;
    income_type_id: number;
    income_category_id: number;
    income_sub_category_id: number;
    description: string;
    date: string;
    family_member_id: string;
    wallet_id: number | null;
  };
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  incomeTypes: any[];
  getIncomeCategoriesByType: (typeId: number) => Promise<any[]>;
  getIncomeSubCategoriesByCategory: (categoryId: number) => Promise<any[]>;
  familyMembers: FamilyMember[];
  availableWallets: Wallet[];
  categories?: IncomeCategory[];
}

const IncomeForm: React.FC<IncomeFormProps> = ({
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  incomeTypes,
  getIncomeCategoriesByType,
  getIncomeSubCategoriesByCategory,
  familyMembers,
  availableWallets = [],
  categories = []
}) => {
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [incomeSubCategories, setIncomeSubCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  
  // Load categories when type changes
  useEffect(() => {
    if (formData.income_type_id) {
      setIsLoadingCategories(true);
      getIncomeCategoriesByType(formData.income_type_id)
        .then(categories => {
          setIncomeCategories(categories);
          setIsLoadingCategories(false);
        })
        .catch(() => {
          setIncomeCategories([]);
          setIsLoadingCategories(false);
        });
    } else {
      setIncomeCategories([]);
    }
  }, [formData.income_type_id, getIncomeCategoriesByType]);

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.income_category_id) {
      setIsLoadingSubCategories(true);
      getIncomeSubCategoriesByCategory(formData.income_category_id)
        .then(subcategories => {
          setIncomeSubCategories(subcategories);
          setIsLoadingSubCategories(false);
        })
        .catch(() => {
          setIncomeSubCategories([]);
          setIsLoadingSubCategories(false);
        });
    } else {
      setIncomeSubCategories([]);
    }
  }, [formData.income_category_id, getIncomeSubCategoriesByCategory]);

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

        {/* Income Type */}
        <div className="space-y-2">
          <Label htmlFor="income-type">Type</Label>
          <Select
            value={formData.income_type_id ? formData.income_type_id.toString() : ""}
            onValueChange={(value) => onFormChange('income_type_id', parseInt(value) || 0)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an income type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {incomeTypes && incomeTypes.length > 0 ? (
                  incomeTypes.map((type) => (
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

        {/* Income Category */}
        <div className="space-y-2">
          <Label htmlFor="income-category">Category</Label>
          <Select
            value={formData.income_category_id ? formData.income_category_id.toString() : ""}
            onValueChange={(value) => onFormChange('income_category_id', parseInt(value) || 0)}
            disabled={isLoadingCategories || !formData.income_type_id}
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
                {incomeCategories && incomeCategories.length > 0 ? (
                  incomeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="placeholder" disabled>
                    {formData.income_type_id ? "No categories available" : "Select a type first"}
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Income Subcategory */}
        <div className="space-y-2">
          <Label htmlFor="income-subcategory">Subcategory</Label>
          <Select
            value={formData.income_sub_category_id ? formData.income_sub_category_id.toString() : ""}
            onValueChange={(value) => onFormChange('income_sub_category_id', parseInt(value) || 0)}
            disabled={isLoadingSubCategories || !formData.income_category_id}
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
                {incomeSubCategories && incomeSubCategories.length > 0 ? (
                  incomeSubCategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="placeholder" disabled>
                    {formData.income_category_id ? "No subcategories available" : "Select a category first"}
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

        {/* Wallet */}
        <div className="space-y-2">
          <Label htmlFor="wallet">Deposit to Wallet (Optional)</Label>
          <Select
            value={formData.wallet_id ? formData.wallet_id.toString() : ""}
            onValueChange={(value) => onFormChange('wallet_id', value ? parseInt(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a wallet (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">None (Don't deposit)</SelectItem>
                {availableWallets && availableWallets.length > 0 ? (
                  availableWallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id.toString()}>
                      {wallet.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-wallets" disabled>No wallets available</SelectItem>
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
          {isEditing ? 'Update Income' : 'Add Income'}
        </Button>
      </div>
    </form>
  );
};

export default IncomeForm;
