
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Types
export interface Family {
  family_id: number;
  name: string;
}

export interface FamilyMember {
  id: string;
  family_id: number;
  name: string;
  relationship: string;
  is_default: boolean;
  family_name?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  id?: string;
}

// Mock data for development/fallback
const mockFamilies: Family[] = [
  { family_id: 1, name: 'Default Family' }
];

const mockFamilyMembers: FamilyMember[] = [
  { id: '1', family_id: 1, name: 'Self', relationship: 'Self', is_default: true },
  { id: '2', family_id: 1, name: 'Spouse', relationship: 'Spouse', is_default: false },
  { id: '3', family_id: 1, name: 'Child', relationship: 'Child', is_default: false }
];

// Get all families
export const getAllFamilies = async (): Promise<Family[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/families`);
    return response.data;
  } catch (error) {
    console.error('Error fetching families:', error);
    return mockFamilies; // Fallback to mock data
  }
};

// Get family by ID
export const getFamilyById = async (id: number): Promise<Family | null> => {
  try {
    const response = await axios.get(`${API_URL}/api/families/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching family by ID:', error);
    return mockFamilies.find(family => family.family_id === id) || null;
  }
};

// Add new family
export const addFamily = async (name: string): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/families`, { name });
    return { 
      success: true, 
      message: 'Family added successfully',
      id: response.data.id
    };
  } catch (error: any) {
    console.error('Error adding family:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to add family' 
    };
  }
};

// Update family
export const updateFamily = async (id: number, name: string): Promise<ApiResponse> => {
  try {
    await axios.put(`${API_URL}/api/families/${id}`, { name });
    return { 
      success: true, 
      message: 'Family updated successfully' 
    };
  } catch (error: any) {
    console.error('Error updating family:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update family' 
    };
  }
};

// Delete family
export const deleteFamily = async (id: number): Promise<ApiResponse> => {
  try {
    await axios.delete(`${API_URL}/api/families/${id}`);
    return { 
      success: true, 
      message: 'Family deleted successfully' 
    };
  } catch (error: any) {
    console.error('Error deleting family:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete family' 
    };
  }
};

// Get all family members
export const getAllFamilyMembers = async (familyId?: number): Promise<FamilyMember[]> => {
  try {
    const url = familyId 
      ? `${API_URL}/api/family/members?family_id=${familyId}`
      : `${API_URL}/api/family/members`;
      
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching family members:', error);
    return mockFamilyMembers; // Fallback to mock data
  }
};

// Add new family member
export const addFamilyMember = async (memberData: Omit<FamilyMember, 'id' | 'family_id'> & { family_id?: number }): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/family/members`, memberData);
    return { 
      success: true, 
      message: 'Family member added successfully',
      id: response.data.id
    };
  } catch (error: any) {
    console.error('Error adding family member:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to add family member' 
    };
  }
};

// Update family member
export const updateFamilyMember = async (id: string, memberData: Omit<FamilyMember, 'id' | 'family_id'> & { family_id?: number }): Promise<ApiResponse> => {
  try {
    await axios.put(`${API_URL}/api/family/members/${id}`, memberData);
    return { 
      success: true, 
      message: 'Family member updated successfully' 
    };
  } catch (error: any) {
    console.error('Error updating family member:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update family member' 
    };
  }
};

// Delete family member
export const deleteFamilyMember = async (id: string): Promise<ApiResponse> => {
  try {
    await axios.delete(`${API_URL}/api/family/members/${id}`);
    return { 
      success: true, 
      message: 'Family member deleted successfully' 
    };
  } catch (error: any) {
    console.error('Error deleting family member:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete family member' 
    };
  }
};

// Get default family member
export const getDefaultFamilyMember = async (familyId?: number): Promise<FamilyMember | null> => {
  try {
    const members = await getAllFamilyMembers(familyId);
    const defaultMember = members.find(member => member.is_default);
    return defaultMember || null;
  } catch (error) {
    console.error('Error getting default family member:', error);
    const defaultMember = mockFamilyMembers.find(member => member.is_default);
    return defaultMember || null;
  }
};
