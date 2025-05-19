
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Plus, Edit, Trash, Star, Edit3, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useFamilyApi } from '@/hooks/useFamilyApi';
import { FamilyMember } from '@/services/familyService';

const FamilyMembers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSetDefaultDialogOpen, setIsSetDefaultDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [defaultMemberId, setDefaultMemberId] = useState<string | null>(null);

  const {
    familyMembers,
    isLoading,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    setDefaultFamilyMember
  } = useFamilyApi();

  useEffect(() => {
    // Check if there is a default member when family members load
    if (familyMembers.length > 0) {
      const defaultMember = familyMembers.find(member => member.is_default);
      if (defaultMember) {
        setDefaultMemberId(defaultMember.id);
      }
    }
  }, [familyMembers]);

  const handleAddMember = () => {
    if (!newMemberName) return;

    addFamilyMember({
      name: newMemberName,
      relation: newRelation || 'Other',
      is_default: familyMembers.length === 0 // Make first member default if none exists
    });

    // Reset form
    setNewMemberName('');
    setNewRelation('');
    setIsAddDialogOpen(false);
  };

  const handleEditMember = () => {
    if (!editingMember || !editingMember.name) return;

    updateFamilyMember(editingMember.id.toString(), {
      name: editingMember.name,
      relation: editingMember.relation || 'Other'
    });

    // Reset form
    setEditingMember(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteMember = () => {
    if (!deletingMemberId) return;

    deleteFamilyMember(deletingMemberId);
    setDeletingMemberId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleSetDefaultMember = () => {
    if (!defaultMemberId) return;

    setDefaultFamilyMember(defaultMemberId);
    setIsSetDefaultDialogOpen(false);
  };

  const openEditDialog = (member: FamilyMember) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (memberId: string) => {
    setDeletingMemberId(memberId);
    setIsDeleteDialogOpen(true);
  };

  const openSetDefaultDialog = (memberId: string) => {
    setDefaultMemberId(memberId);
    setIsSetDefaultDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Family Members</h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
              <Plus className="mr-2 h-4 w-4" /> Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Family Member</DialogTitle>
              <DialogDescription>Create a new family member profile.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relation">Relation</Label>
                <Input
                  id="relation"
                  placeholder="E.g., Spouse, Child, Parent"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-fintrack-purple hover:bg-fintrack-purple/90"
                onClick={handleAddMember}
              >
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Family Member</DialogTitle>
            <DialogDescription>Update the details of this family member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter name"
                value={editingMember?.name || ''}
                onChange={(e) => setEditingMember(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-relation">Relation</Label>
              <Input
                id="edit-relation"
                placeholder="E.g., Spouse, Child, Parent"
                value={editingMember?.relation || ''}
                onChange={(e) => setEditingMember(prev => prev ? { ...prev, relation: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-fintrack-purple hover:bg-fintrack-purple/90"
              onClick={handleEditMember}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Family Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this family member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting this family member will remove all associated financial data.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMember}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Default Confirmation Dialog */}
      <Dialog open={isSetDefaultDialogOpen} onOpenChange={setIsSetDefaultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set as Default</DialogTitle>
            <DialogDescription>
              Set this family member as the default for new transactions?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSetDefaultDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-fintrack-purple hover:bg-fintrack-purple/90"
              onClick={handleSetDefaultMember}
            >
              Set as Default
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Family members list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
          </div>
        ) : (
          <>
            {familyMembers.map((member) => (
              <Card key={member.id} className="card-gradient border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-6">
                  <CardTitle className="text-xl font-medium flex items-center gap-2">
                    {member.name}
                    {member.is_default && (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    )}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openEditDialog(member)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {!member.is_default && (
                        <DropdownMenuItem onClick={() => openSetDefaultDialog(member.id.toString())}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Set as Default
                        </DropdownMenuItem>
                      )}
                      {String(member.id) !== String(defaultMemberId) && (
                        <DropdownMenuItem onClick={() => openDeleteDialog(member.id.toString())}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-fintrack-text-secondary">
                    <p><span className="font-medium">Relation:</span> {member.relation || 'Not specified'}</p>
                    <p className="mt-1">
                      {member.is_default ? (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                          Default Member
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-400">
                          Not Default
                        </span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {familyMembers.length === 0 && (
              <Card className="col-span-full bg-fintrack-card-dark border border-fintrack-bg-dark">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-center text-fintrack-text-secondary mb-4">
                    No family members found. Add your first family member to get started.
                  </p>
                  <Button
                    className="bg-fintrack-purple hover:bg-fintrack-purple/90"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Family Member
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FamilyMembers;
