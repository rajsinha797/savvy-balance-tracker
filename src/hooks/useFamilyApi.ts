
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
  setDefaultFamilyMember,
  getDefaultFamilyMember
} from '@/services/familyService';
import { useToast } from "@/hooks/use-toast";

export const useFamilyApi = (initialFamilyId: number = 1) => {
  const { toast } = useToast();
  
  const [families, setFamilies] = useState<Family[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [defaultMember, setDefaultMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null);
  const [currentFamilyId, setCurrentFamilyId] = useState<number>(initialFamilyId);

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
  const loadFamilyMembers = useCallback(async (familyId?: number) => {
    setIsLoading(true);
    try {
      const fid = familyId || currentFamilyId;
      // Convert number to string for the API call
      const membersData = await getAllFamilyMembers(String(fid));
      setFamilyMembers(membersData);
      
      // Also load default member
      const defaultMemberData = await getDefaultFamilyMember(String(fid));
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
  const updateFamilyItem = async (id: number, name: string) => {
    try {
      // Convert number to string for the API call
      await updateFamily(String(id), name);
      
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
  const deleteFamilyItem = async (id: number) => {
    try {
      // Convert number to string for the API call
      await deleteFamily(String(id));
      
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
  const addFamilyMemberItem = async (memberData: Omit<FamilyMember, 'id' | 'family_id'> & { family_id?: number }) => {
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
  const updateFamilyMemberItem = async (id: string, memberData: Omit<FamilyMember, 'id' | 'family_id'> & { family_id?: number }) => {
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
      await setDefaultFamilyMember(id);
      
      await loadFamilyMembers(); // Refresh the data
      
      toast({
        title: "Success",
        description: "Default family member updated successfully",
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
  const switchFamily = (familyId: number) => {
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
