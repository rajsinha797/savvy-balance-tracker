
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { 
  getAllFamilyMembers,
  addFamilyMember,
  updateFamilyMember, 
  deleteFamilyMember,
  FamilyMember
} from '@/services/familyService';

const FamilyMembersPage = () => {
  const { toast } = useToast();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newMember, setNewMember] = useState<Omit<FamilyMember, 'id' | 'family_id'>>({ 
    name: '', 
    relationship: '',
    is_default: false
  });
  
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    setIsLoading(true);
    try {
      const members = await getAllFamilyMembers();
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error loading family members:', error);
      toast({
        title: "Error",
        description: "Failed to load family members. Using demo data instead.",
        variant: "destructive",
      });
      // Use demo data as fallback
      setFamilyMembers([
        { id: '1', family_id: 1, name: 'Self', relationship: 'Self', is_default: true },
        { id: '2', family_id: 1, name: 'Spouse', relationship: 'Spouse', is_default: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.relationship) {
      toast({
        title: "Validation Error",
        description: "Please enter both name and relationship.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await addFamilyMember({
        name: newMember.name,
        relationship: newMember.relationship,
        is_default: newMember.is_default
      });
      
      if (result.success) {
        await loadFamilyMembers();
        
        toast({
          title: "Success",
          description: result.message || "Family member added successfully",
        });
        
        setNewMember({ 
          name: '', 
          relationship: '',
          is_default: false
        });
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add family member",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEditMember = async () => {
    if (!editingMember || !editingMember.name || !editingMember.relationship) {
      toast({
        title: "Validation Error",
        description: "Please enter both name and relationship.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await updateFamilyMember(editingMember.id, {
        name: editingMember.name,
        relationship: editingMember.relationship,
        is_default: editingMember.is_default
      });
      
      if (result.success) {
        await loadFamilyMembers();
        
        toast({
          title: "Success",
          description: result.message || "Family member updated successfully",
        });
        
        setEditingMember(null);
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update family member",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating family member:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const result = await deleteFamilyMember(id);
      
      if (result.success) {
        await loadFamilyMembers();
        
        toast({
          title: "Success",
          description: result.message || "Family member deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete family member",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Family Members</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
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
      
      {/* Family Members List */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">All Family Members</CardTitle>
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
                          onClick={() => {
                            setEditingMember(member);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 text-fintrack-text-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteMember(member.id)}
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
    </div>
  );
};

export default FamilyMembersPage;
