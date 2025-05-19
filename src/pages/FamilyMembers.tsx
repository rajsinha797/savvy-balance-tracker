
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useFamilyApi } from '@/hooks/useFamilyApi';
import { Family, FamilyMember } from '@/services/familyService';

const FamilyMembersPage = () => {
  // States for dialog visibility
  const [isAddFamilyDialogOpen, setIsAddFamilyDialogOpen] = useState(false);
  const [isEditFamilyDialogOpen, setIsEditFamilyDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  
  // States for form data
  const [newFamilyName, setNewFamilyName] = useState('');
  const [editFamilyName, setEditFamilyName] = useState('');
  const [editFamilyId, setEditFamilyId] = useState<number>(0);
  
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelationship, setNewMemberRelationship] = useState('');
  const [editMemberId, setEditMemberId] = useState<string>('');
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRelationship, setEditMemberRelationship] = useState('');
  
  // Get family data using custom hook
  const { 
    families, 
    familyMembers, 
    currentFamilyId, 
    switchFamily, 
    addFamily, 
    updateFamily, 
    deleteFamily,
    addFamilyMember, 
    updateFamilyMember, 
    deleteFamilyMember,
    setDefaultFamilyMember,
    refreshData
  } = useFamilyApi();
  
  // Handle family form submits
  const handleAddFamily = async () => {
    if (newFamilyName.trim() !== '') {
      await addFamily(newFamilyName);
      setNewFamilyName('');
      setIsAddFamilyDialogOpen(false);
    }
  };
  
  const handleEditFamily = async () => {
    if (editFamilyName.trim() !== '' && editFamilyId) {
      await updateFamily(editFamilyId, editFamilyName);
      setIsEditFamilyDialogOpen(false);
    }
  };
  
  const handleDeleteFamily = async (id: number) => {
    if (confirm('Are you sure you want to delete this family? This action cannot be undone.')) {
      await deleteFamily(id);
    }
  };
  
  // Handle member form submits
  const handleAddFamilyMember = async () => {
    if (newMemberName.trim() !== '' && newMemberRelationship.trim() !== '') {
      await addFamilyMember({
        name: newMemberName,
        relationship: newMemberRelationship,
        family_id: currentFamilyId
      });
      setNewMemberName('');
      setNewMemberRelationship('');
      setIsAddMemberDialogOpen(false);
    }
  };
  
  const handleEditFamilyMember = async () => {
    if (editMemberName.trim() !== '' && editMemberRelationship.trim() !== '' && editMemberId) {
      await updateFamilyMember(editMemberId, {
        name: editMemberName,
        relationship: editMemberRelationship
      });
      setIsEditMemberDialogOpen(false);
    }
  };
  
  const handleDeleteFamilyMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this family member? This action cannot be undone.')) {
      await deleteFamilyMember(id);
    }
  };
  
  const handleSetDefault = async (id: string) => {
    await setDefaultFamilyMember(id);
  };
  
  const openEditFamilyDialog = (family: Family) => {
    setEditFamilyId(family.family_id);
    setEditFamilyName(family.name);
    setIsEditFamilyDialogOpen(true);
  };
  
  const openEditMemberDialog = (member: FamilyMember) => {
    setEditMemberId(member.id);
    setEditMemberName(member.name);
    setEditMemberRelationship(member.relationship);
    setIsEditMemberDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Family Management</h2>
        
        <Dialog open={isAddFamilyDialogOpen} onOpenChange={setIsAddFamilyDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
              <Plus className="h-4 w-4 mr-2" /> Add Family
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
            <DialogHeader>
              <DialogTitle>Add New Family</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="name">
                  Name
                </Label>
                <Input
                  id="family-name"
                  className="col-span-3"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddFamily}>Add Family</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Families list */}
      <Card>
        <CardHeader>
          <CardTitle>Families</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {families.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No families found. Add a family to get started.</p>
            ) : (
              families.map((family) => (
                <div 
                  key={family.family_id}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    currentFamilyId === family.family_id ? 'bg-fintrack-bg-dark' : 'hover:bg-fintrack-bg-dark/50'
                  }`}
                  onClick={() => switchFamily(family.family_id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{family.name}</div>
                    {currentFamilyId === family.family_id && (
                      <span className="bg-fintrack-purple/20 text-fintrack-purple text-xs py-0.5 px-2 rounded">Current</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditFamilyDialog(family);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFamily(family.family_id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Edit family dialog */}
      <Dialog open={isEditFamilyDialogOpen} onOpenChange={setIsEditFamilyDialogOpen}>
        <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
          <DialogHeader>
            <DialogTitle>Edit Family</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="edit-family-name">
                Name
              </Label>
              <Input
                id="edit-family-name"
                className="col-span-3"
                value={editFamilyName}
                onChange={(e) => setEditFamilyName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleEditFamily}>Update Family</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Family Members section */}
      <div className="flex justify-between items-center mt-8">
        <h3 className="text-xl font-medium">Family Members</h3>
        
        <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
            <DialogHeader>
              <DialogTitle>Add New Family Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="name">
                  Name
                </Label>
                <Input
                  id="member-name"
                  className="col-span-3"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right" htmlFor="relationship">
                  Relationship
                </Label>
                <Input
                  id="member-relationship"
                  className="col-span-3"
                  value={newMemberRelationship}
                  onChange={(e) => setNewMemberRelationship(e.target.value)}
                  placeholder="e.g. Self, Spouse, Child"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddFamilyMember}>Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {familyMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No family members found. Add a family member to get started.</p>
            ) : (
              familyMembers.map((member) => (
                <div 
                  key={member.id}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    member.is_default ? 'bg-fintrack-bg-dark' : 'hover:bg-fintrack-bg-dark/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.relationship}</div>
                    </div>
                    {member.is_default && (
                      <span className="bg-green-500/20 text-green-500 text-xs py-0.5 px-2 rounded">Default</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    {!member.is_default && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(member.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditMemberDialog(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteFamilyMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Edit family member dialog */}
      <Dialog open={isEditMemberDialogOpen} onOpenChange={setIsEditMemberDialogOpen}>
        <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
          <DialogHeader>
            <DialogTitle>Edit Family Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="edit-member-name">
                Name
              </Label>
              <Input
                id="edit-member-name"
                className="col-span-3"
                value={editMemberName}
                onChange={(e) => setEditMemberName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="edit-member-relationship">
                Relationship
              </Label>
              <Input
                id="edit-member-relationship"
                className="col-span-3"
                value={editMemberRelationship}
                onChange={(e) => setEditMemberRelationship(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleEditFamilyMember}>Update Member</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamilyMembersPage;
