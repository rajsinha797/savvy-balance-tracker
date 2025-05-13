
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Types
export interface FamilyMember {
  id: string;
  family_id: number;
  name: string;
  relationship: string;
  is_default: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  id?: string;
}

// Mock data for development/fallback
const mockFamilyMembers: FamilyMember[] = [
  { id: '1', family_id: 1, name: 'Self', relationship: 'Self', is_default: true },
  { id: '2', family_id: 1, name: 'Spouse', relationship: 'Spouse', is_default: false },
  { id: '3', family_id: 1, name: 'Child', relationship: 'Child', is_default: false }
];

// Get all family members
export const getAllFamilyMembers = async (): Promise<FamilyMember[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/family/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching family members:', error);
    return mockFamilyMembers; // Fallback to mock data
  }
};

// Add new family member
export const addFamilyMember = async (memberData: Omit<FamilyMember, 'id' | 'family_id'>): Promise<ApiResponse> => {
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
export const updateFamilyMember = async (id: string, memberData: Omit<FamilyMember, 'id' | 'family_id'>): Promise<ApiResponse> => {
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
export const getDefaultFamilyMember = async (): Promise<FamilyMember | null> => {
  try {
    const members = await getAllFamilyMembers();
    const defaultMember = members.find(member => member.is_default);
    return defaultMember || null;
  } catch (error) {
    console.error('Error getting default family member:', error);
    const defaultMember = mockFamilyMembers.find(member => member.is_default);
    return defaultMember || null;
  }
};
