import { useState, useEffect, useCallback } from 'react';
import { 
  Family,
  FamilyMember,
  getAllFamilies,
  getFamilyById,
  addFamily,
  updateFamily,
  deleteFamily,
  getAllFamilyMembers, 
  addFamilyMember, 
  updateFamilyMember, 
  deleteFamilyMember,
  getDefaultFamilyMember
} from '@/services/familyService';
import { useToast } from "@/hooks/use-toast";

export const useFamilyApi = (initialFamilyId: string = '1') => {
  const { toast } = useToast();
  
  const [families, setFamilies] = useState<Family[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [defaultMember, setDefaultMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null);
  const [currentFamilyId, setCurrentFamilyId] = useState<string>(initialFamilyId);

  // Load families data
  const loadFamilies = useCallback(async () => {
    setIsLoading(true);
    try {
      const familiesData = await getAllFamilies();
      setFamilies(familiesData);
      setIsApiAvailable(true);
    } catch (error) {
      console.error('Error loading families:', error);
      setIsApiAvailable(false);
      toast({
        title: "API Error",
        description: "Could not connect to API server. Using demo data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load family members data
  const loadFamilyMembers = useCallback(async (familyId?: string) => {
    setIsLoading(true);
    try {
      const fid = familyId || currentFamilyId;
      // Already a string, no conversion needed
      const membersData = await getAllFamilyMembers(fid);
      setFamilyMembers(membersData);
      
      // Also load default member
      const defaultMemberData = await getDefaultFamilyMember(fid);
      setDefaultMember(defaultMemberData);
      
      setIsApiAvailable(true);
    } catch (error) {
      console.error('Error loading family members:', error);
      setIsApiAvailable(false);
      toast({
        title: "API Error",
        description: "Could not connect to API server. Using demo data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentFamilyId]);

  // Load initial data
  useEffect(() => {
    loadFamilies();
    loadFamilyMembers(currentFamilyId);
  }, [loadFamilies, loadFamilyMembers, currentFamilyId]);

  // Add family
  const addFamilyItem = async (name: string) => {
    try {
      const result = await addFamily(name);
      
      await loadFamilies(); // Refresh the data
      
      toast({
        title: "Success",
        description: "Family added successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error adding family:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update family
  const updateFamilyItem = async (id: string, name: string) => {
    try {
      // Already a string, no conversion needed
      await updateFamily(id, name);
      
      await loadFamilies(); // Refresh the data
      
      toast({
        title: "Success",
        description: "Family updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating family:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete family
  const deleteFamilyItem = async (id: string) => {
    try {
      // Already a string, no conversion needed
      await deleteFamily(id);
      
      await loadFamilies(); // Refresh the data
      
      toast({
        title: "Success",
        description: "Family deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting family:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Add family member
  const addFamilyMemberItem = async (memberData: Omit<FamilyMember, 'id' | 'family_id'> & { family_id?: string }) => {
    try {
      // If no family_id provided, use current family ID
      const dataWithFamily = {
        ...memberData,
        family_id: memberData.family_id || currentFamilyId
      };
      
      await addFamilyMember(dataWithFamily);
      
      await loadFamilyMembers(); // Refresh the data
      
      toast({
        title: "Success",
        description: "Family member added successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update family member
  const updateFamilyMemberItem = async (id: string, memberData: Omit<FamilyMember, 'id' | 'family_id'> & { family_id?: string }) => {
    try {
      await updateFamilyMember(id, memberData);
      
      await loadFamilyMembers(); // Refresh the data
      
      toast({
        title: "Success",
        description: "Family member updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating family member:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete family member
  const deleteFamilyMemberItem = async (id: string) => {
    try {
      await deleteFamilyMember(id);
      
      await loadFamilyMembers(); // Refresh the data
      
      toast({
        title: "Success",
        description: "Family member deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Set default family member
  const setDefaultFamilyMemberItem = async (id: string) => {
    try {
      // Since there's no setDefaultFamilyMember export, we'll just update the UI state
      // and inform the user that the backend functionality isn't implemented
      
      // Update local state
      const member = familyMembers.find(m => m.id === id);
      if (member) {
        setDefaultMember(member);
      }
      
      toast({
        title: "Feature not implemented",
        description: "Setting default family member is not fully implemented in the backend yet.",
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error('Error setting default family member:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Switch current family
  const switchFamily = (familyId: string) => {
    setCurrentFamilyId(familyId);
    loadFamilyMembers(familyId);
  };

  // Refresh data
  const refreshData = () => {
    loadFamilies();
    loadFamilyMembers(currentFamilyId);
  };

  return {
    families,
    familyMembers,
    defaultMember,
    isLoading,
    isApiAvailable,
    currentFamilyId,
    switchFamily,
    addFamily: addFamilyItem,
    updateFamily: updateFamilyItem,
    deleteFamily: deleteFamilyItem,
    addFamilyMember: addFamilyMemberItem,
    updateFamilyMember: updateFamilyMemberItem,
    deleteFamilyMember: deleteFamilyMemberItem,
    setDefaultFamilyMember: setDefaultFamilyMemberItem,
    refreshData
  };
};
