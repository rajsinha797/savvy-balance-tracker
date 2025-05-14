
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Check, Users, UserPlus, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFamilyApi } from '@/hooks/useFamilyApi';
import { FamilyMember, Family } from '@/services/familyService';

const FamilyMembersPage = () => {
  // Use our custom hook for family API
  const {
    families,
    familyMembers,
    isLoading,
    currentFamilyId,
    switchFamily,
    addFamilyItem,
    updateFamilyItem,
    deleteFamilyItem,
    addFamilyMemberItem,
    updateFamilyMemberItem,
    deleteFamilyMemberItem,
    refreshData
  } = useFamilyApi();
  
  // State for family dialog
  const [isAddFamilyDialogOpen, setIsAddFamilyDialogOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [familyName, setFamilyName] = useState('');
  
  // State for member dialog
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState<Omit<FamilyMember, 'id' | 'family_id'>>({ 
    name: '', 
    relationship: '',
    is_default: false
  });
  
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Handle family operations
  const handleAddFamily = async () => {
    if (!familyName.trim()) {
      return;
    }
    
    const success = await addFamilyItem(familyName);
    if (success) {
      setFamilyName('');
      setIsAddFamilyDialogOpen(false);
    }
  };
  
  const handleUpdateFamily = async () => {
    if (!editingFamily || !familyName.trim()) {
      return;
    }
    
    const success = await updateFamilyItem(editingFamily.family_id, familyName);
    if (success) {
      setFamilyName('');
      setEditingFamily(null);
      setIsAddFamilyDialogOpen(false);
    }
  };
  
  const openEditFamily = (family: Family) => {
    setEditingFamily(family);
    setFamilyName(family.name);
    setIsAddFamilyDialogOpen(true);
  };

  // Handle member operations
  const handleAddMember = async () => {
    if (!newMember.name || !newMember.relationship) {
      return;
    }
    
    const success = await addFamilyMemberItem({
      ...newMember,
      family_id: currentFamilyId
    });
    
    if (success) {
      setNewMember({ 
        name: '', 
        relationship: '',
        is_default: false
      });
      setIsMemberDialogOpen(false);
    }
  };

  const handleEditMember = async () => {
    if (!editingMember || !editingMember.name || !editingMember.relationship) {
      return;
    }
    
    const success = await updateFamilyMemberItem(editingMember.id, {
      name: editingMember.name,
      relationship: editingMember.relationship,
      is_default: editingMember.is_default,
      family_id: editingMember.family_id
    });
    
    if (success) {
      setEditingMember(null);
      setIsMemberDialogOpen(false);
    }
  };
  
  const openEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setIsMemberDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
        <h2 className="text-2xl font-bold">Family Members</h2>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Select 
            value={currentFamilyId.toString()} 
            onValueChange={(value) => switchFamily(parseInt(value))}
          >
            <SelectTrigger className="w-[200px] bg-fintrack-bg-dark border-fintrack-bg-dark">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select Family" />
            </SelectTrigger>
            <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
              {families.map((family) => (
                <SelectItem key={family.family_id} value={family.family_id.toString()}>
                  {family.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={refreshData} className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Dialog open={isAddFamilyDialogOpen} onOpenChange={setIsAddFamilyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-fintrack-bg-dark border-fintrack-bg-dark">
                <Users className="h-4 w-4 mr-2" /> {editingFamily ? 'Edit' : 'Add'} Family
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
              <DialogHeader>
                <DialogTitle>{editingFamily ? 'Edit Family' : 'Add New Family'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="familyName">Family Name</Label>
                  <Input
                    id="familyName"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                  />
                </div>
                <Button 
                  onClick={editingFamily ? handleUpdateFamily : handleAddFamily}
                  className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {editingFamily ? 'Update Family' : 'Add Family'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
                <UserPlus className="h-4 w-4 mr-2" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
              <DialogHeader>
                <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingMember ? editingMember.name : newMember.name}
                    onChange={(e) => {
                      if (editingMember) {
                        setEditingMember({ ...editingMember, name: e.target.value });
                      } else {
                        setNewMember({ ...newMember, name: e.target.value });
                      }
                    }}
                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={editingMember ? editingMember.relationship : newMember.relationship}
                    onChange={(e) => {
                      if (editingMember) {
                        setEditingMember({ ...editingMember, relationship: e.target.value });
                      } else {
                        setNewMember({ ...newMember, relationship: e.target.value });
                      }
                    }}
                    className="bg-fintrack-bg-dark border-fintrack-bg-dark"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={editingMember ? editingMember.is_default : newMember.is_default}
                    onChange={(e) => {
                      if (editingMember) {
                        setEditingMember({ ...editingMember, is_default: e.target.checked });
                      } else {
                        setNewMember({ ...newMember, is_default: e.target.checked });
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isDefault">Set as default</Label>
                </div>
                <Button 
                  onClick={editingMember ? handleEditMember : handleAddMember}
                  className="mt-2 bg-fintrack-purple hover:bg-fintrack-purple/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {editingMember ? 'Update Member' : 'Add Member'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Family Info Card */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {families.find(f => f.family_id === currentFamilyId)?.name || 'Family'} - Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-fintrack-bg-dark">
                    <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Relationship</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {familyMembers.map((member) => (
                    <tr key={member.id} className="border-b border-fintrack-bg-dark">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{member.name}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{member.relationship}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {member.is_default ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500">
                            Default
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-fintrack-bg-dark text-fintrack-text-secondary">
                            Member
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditMember(member)}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteFamilyMemberItem(member.id)}
                          className="h-8 w-8 text-fintrack-text-secondary"
                          disabled={member.is_default}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {familyMembers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-fintrack-text-secondary">
                        No family members found. Add your first family member.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Family Management */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Family Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-fintrack-bg-dark">
                  <th className="px-4 py-3 text-left text-xs font-medium text-fintrack-text-secondary">Family Name</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-fintrack-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {families.map((family) => (
                  <tr key={family.family_id} className="border-b border-fintrack-bg-dark">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{family.name}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => switchFamily(family.family_id)}
                        className="text-fintrack-text-secondary mr-2"
                        disabled={family.family_id === currentFamilyId}
                      >
                        Select
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditFamily(family)}
                        className="h-8 w-8 text-fintrack-text-secondary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteFamilyItem(family.family_id)}
                        className="h-8 w-8 text-fintrack-text-secondary"
                        disabled={family.family_id === 1} // Don't allow deleting default family
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {families.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-fintrack-text-secondary">
                      No families found. Add your first family.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyMembersPage;
