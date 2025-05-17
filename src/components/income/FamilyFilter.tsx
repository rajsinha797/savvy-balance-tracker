
import React from 'react';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyMember } from '@/services/familyService';

interface FamilyFilterProps {
  selectedFamilyMember: string;
  familyMembers: FamilyMember[];
  onFamilyMemberChange: (value: string) => void;
}

const FamilyFilter: React.FC<FamilyFilterProps> = ({
  selectedFamilyMember,
  familyMembers,
  onFamilyMemberChange,
}) => {
  return (
    <Select 
      value={selectedFamilyMember || "all-members"} 
      onValueChange={onFamilyMemberChange}
    >
      <SelectTrigger className="w-[180px] bg-fintrack-bg-dark border-fintrack-bg-dark">
        <Filter className="h-4 w-4 mr-2" />
        <SelectValue placeholder="All Members" />
      </SelectTrigger>
      <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
        <SelectItem value="all-members">All Members</SelectItem>
        {familyMembers.map((member) => (
          <SelectItem key={member.id} value={member.id || `member-${member.name}`}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FamilyFilter;
