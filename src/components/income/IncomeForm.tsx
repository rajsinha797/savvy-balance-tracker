
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IncomeCategory, IncomeItem } from '@/services/incomeService';
import { FamilyMember } from '@/services/familyService';

interface IncomeFormProps {
  isEditing: boolean;
  formData: {
    amount: number;
    category_id: number;
    description: string;
    date: string;
    family_member_id: string;
  };
  onFormChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  categories: IncomeCategory[];
  familyMembers: FamilyMember[];
}

const IncomeForm: React.FC<IncomeFormProps> = ({
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  categories,
  familyMembers,
}) => {
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
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={String(formData.category_id)}
          onValueChange={(value) => {
            const categoryId = parseInt(value);
            onFormChange('category_id', categoryId);
          }}
        >
          <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            {categories.map((category) => (
              <SelectItem key={category.category_id} value={String(category.category_id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="family_member">Family Member</Label>
        <Select
          value={String(formData.family_member_id)}
          onValueChange={(value) => {
            onFormChange('family_member_id', value);
          }}
        >
          <SelectTrigger className="bg-fintrack-bg-dark border-fintrack-bg-dark">
            <SelectValue placeholder="Select family member" />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            {familyMembers.map((member) => (
              <SelectItem key={member.id} value={String(member.id)}>
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
      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => {
            onFormChange('date', e.target.value);
          }}
          className="bg-fintrack-bg-dark border-fintrack-bg-dark"
        />
      </div>
      <Button 
        onClick={onSubmit}
        className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
      >
        <Check className="h-4 w-4 mr-2" />
        {isEditing ? 'Update Income' : 'Add Income'}
      </Button>
    </div>
  );
};

export default IncomeForm;
