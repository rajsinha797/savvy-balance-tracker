
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Star, User, Users } from 'lucide-react';
import { useFamilyApi } from '@/hooks/useFamilyApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FamilyMemberForm from '@/components/family/FamilyMemberForm';

const FamilyMembersPage = () => {
  const [activeTab, setActiveTab] = useState('families');
  const [isAddFamilyDialogOpen, setIsAddFamilyDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newMember, setNewMember] = useState({
    name: '',
    is_default: false,
    family_id: ''
  });

  const {
    families,
    familyMembers,
    defaultMember,
    isLoading,
    addFamily,
    updateFamily,
    deleteFamily,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    setDefaultFamilyMember
  } = useFamilyApi();

  // Handle family form submission
  const handleFamilySubmit = async () => {
    if (newFamilyName.trim() === '') return;
    
    let success;
    if (editingFamilyId) {
      success = await updateFamily(editingFamilyId, newFamilyName.trim());
    } else {
      success = await addFamily(newFamilyName.trim());
    }
    
    if (success) {
      setNewFamilyName('');
      setEditingFamilyId(null);
      setIsAddFamilyDialogOpen(false);
    }
  };

  // Handle family member form submission
  const handleMemberSubmit = async () => {
    if (newMember.name.trim() === '' || !newMember.family_id) return;
    
    let success;
    if (editingMemberId) {
      success = await updateFamilyMember(editingMemberId, newMember);
    } else {
      success = await addFamilyMember(newMember);
    }
    
    if (success) {
      setNewMember({
        name: '',
        is_default: false,
        family_id: newMember.family_id // Keep the last selected family
      });
      setEditingMemberId(null);
      setIsAddMemberDialogOpen(false);
    }
  };

  // Start editing family
  const startEditFamily = (id: string, name: string) => {
    setEditingFamilyId(id);
    setNewFamilyName(name);
    setIsAddFamilyDialogOpen(true);
  };

  // Start editing family member
  const startEditMember = (id: string, member: any) => {
    setEditingMemberId(id);
    setNewMember({
      name: member.name,
      is_default: member.is_default || false,
      family_id: member.family_id || ''
    });
    setIsAddMemberDialogOpen(true);
  };

  // Handle member form change
  const handleMemberFormChange = (field: string, value: string | boolean) => {
    setNewMember(prev => ({ ...prev, [field]: value }));
  };

  // Handle default member selection
  const handleDefaultMemberChange = async (id: string) => {
    await setDefaultFamilyMember(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Family Management</h2>
      </div>

      <Tabs defaultValue="families" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-fintrack-bg-dark">
          <TabsList className="bg-transparent">
            <TabsTrigger value="families" className="data-[state=active]:text-fintrack-purple">
              <Users className="h-4 w-4 mr-2" />
              Families
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:text-fintrack-purple">
              <User className="h-4 w-4 mr-2" />
              Family Members
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="families" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Dialog open={isAddFamilyDialogOpen} onOpenChange={setIsAddFamilyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
                  <Plus className="h-4 w-4 mr-2" /> Add Family
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
                <DialogHeader>
                  <DialogTitle>{editingFamilyId ? 'Edit Family' : 'Add New Family'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleFamilySubmit(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="family-name">Family Name</Label>
                    <Input
                      id="family-name"
                      value={newFamilyName}
                      onChange={(e) => setNewFamilyName(e.target.value)}
                      placeholder="Enter family name"
                      className="bg-fintrack-card-dark border border-fintrack-bg-dark"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-fintrack-purple hover:bg-fintrack-purple/90"
                  >
                    {editingFamilyId ? 'Update' : 'Add'} Family
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {families.length > 0 ? (
                families.map((family) => (
                  <Card key={family.id} className="overflow-hidden">
                    <CardHeader className="bg-fintrack-card-dark">
                      <CardTitle className="flex justify-between items-center">
                        <span>{family.name}</span>
                        <div className="flex space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-fintrack-text-secondary"
                            onClick={() => startEditFamily(family.id, family.name)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-fintrack-text-secondary"
                            onClick={() => deleteFamily(family.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="text-sm text-fintrack-text-secondary mb-2">
                        Family Members: {familyMembers.filter(m => m.family_id === family.family_id).length}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Alert>
                  <AlertDescription>
                    No families added yet. Add your first family.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-fintrack-purple hover:bg-fintrack-purple/90">
                  <Plus className="h-4 w-4 mr-2" /> Add Family Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-fintrack-card-dark border border-fintrack-bg-dark">
                <DialogHeader>
                  <DialogTitle>{editingMemberId ? 'Edit Family Member' : 'Add New Family Member'}</DialogTitle>
                </DialogHeader>
                <FamilyMemberForm
                  isEditing={!!editingMemberId}
                  families={families}
                  formData={newMember}
                  onFormChange={handleMemberFormChange}
                  onSubmit={handleMemberSubmit}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.length > 0 ? (
                familyMembers.map((member) => {
                  const isDefault = member.is_default;
                  const familyName = families.find(f => f.family_id === member.family_id)?.name || 'Unknown';
                  
                  return (
                    <Card key={member.id} className="overflow-hidden">
                      <CardHeader className={`${isDefault ? 'bg-fintrack-purple/20' : 'bg-fintrack-card-dark'}`}>
                        <CardTitle className="flex justify-between items-center">
                          <span className="flex items-center">
                            {member.name}
                            {isDefault && <Star className="h-4 w-4 ml-2 text-yellow-500" />}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-fintrack-text-secondary"
                              onClick={() => startEditMember(member.id, member)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                />
                              </svg>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-fintrack-text-secondary"
                              onClick={() => deleteFamilyMember(member.id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm text-fintrack-text-secondary mb-2">
                          Family: {familyName}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch
                            id={`default-${member.id}`}
                            checked={isDefault}
                            onCheckedChange={() => handleDefaultMemberChange(member.id)}
                            disabled={isDefault}
                          />
                          <Label htmlFor={`default-${member.id}`}>Set as Default</Label>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Alert>
                  <AlertDescription>
                    No family members added yet. Add your first family member.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyMembersPage;
