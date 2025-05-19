
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FamilyMember, Family } from '@/services/familyService';

interface FamilyMemberFormProps {
  isEditing: boolean;
  families: Family[];
  formData: {
    id?: string;
    name: string;
    is_default?: boolean;
    family_id?: string;
  };
  onFormChange: (field: string, value: string | boolean) => void;
  onSubmit: () => void;
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  isEditing,
  families,
  formData,
  onFormChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          placeholder="Enter family member name"
          className="bg-fintrack-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="family">Family</Label>
        <Select
          value={formData.family_id || ''}
          onValueChange={(value) => onFormChange('family_id', value)}
        >
          <SelectTrigger id="family" className="bg-fintrack-input">
            <SelectValue placeholder="Select family" />
          </SelectTrigger>
          <SelectContent>
            {families.map((family) => (
              <SelectItem key={family.id} value={family.family_id}>
                {family.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="default-member"
          checked={formData.is_default || false}
          onCheckedChange={(checked) => onFormChange('is_default', checked)}
        />
        <Label htmlFor="default-member">Default Member</Label>
      </div>

      <Button
        type="submit"
        className="w-full bg-fintrack-purple hover:bg-fintrack-purple/90"
      >
        {isEditing ? 'Update' : 'Add'} Family Member
      </Button>
    </form>
  );
};

export default FamilyMemberForm;
