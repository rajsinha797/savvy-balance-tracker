
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Interfaces
export interface Family {
  family_id: string;
  id: string; // Adding the id property to match what's being used in the components
  name: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation?: string;
  is_default?: boolean;
  family_id?: string;
  [key: string]: any;
}

// Response interfaces
export interface ApiResponse {
  success: boolean;
  message: string;
  id?: string | number;
}

// Dummy data for fallback
const dummyFamilies: Family[] = [
  { family_id: '1', id: '1', name: 'Default Family' }
];

const dummyFamilyMembers: FamilyMember[] = [
  { id: '1', name: 'Self', relation: 'Self', is_default: true },
  { id: '2', name: 'Spouse', relation: 'Spouse' },
  { id: '3', name: 'Child', relation: 'Child' }
];

// Helper function to check if API is available
const checkApiAvailability = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_URL}/api/docs`, { timeout: 2000 });
    return true;
  } catch (error) {
    console.warn('API server appears to be down, using dummy data');
    return false;
  }
};

// Get all families
export const getAllFamilies = async (): Promise<Family[]> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    const response = await axios.get(`${API_URL}/api/families`);
    // Map the response to ensure both family_id and id are present
    return response.data.map((family: any) => ({
      ...family,
      id: family.id || family.family_id // Ensure id is set
    }));
  } catch (error) {
    console.error('Error fetching families:', error);
    console.log('Using dummy family data');
    return dummyFamilies;
  }
};

// Get family by ID
export const getFamilyById = async (id: string): Promise<Family> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    const response = await axios.get(`${API_URL}/api/families/${id}`);
    // Ensure both family_id and id are present
    return {
      ...response.data,
      id: response.data.id || response.data.family_id
    };
  } catch (error) {
    console.error(`Error fetching family with ID ${id}:`, error);
    console.log('Using dummy family data');
    return dummyFamilies[0];
  }
};

// Create new family
export const addFamily = async (name: string): Promise<ApiResponse> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    const response = await axios.post(`${API_URL}/api/families`, { name });
    return {
      success: true,
      message: 'Family added successfully',
      id: response.data.id
    };
  } catch (error) {
    console.error('Error adding family:', error);
    return {
      success: false,
      message: 'Failed to add family'
    };
  }
};

// Update family
export const updateFamily = async (id: string, name: string): Promise<ApiResponse> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    await axios.put(`${API_URL}/api/families/${id}`, { name });
    return {
      success: true,
      message: 'Family updated successfully'
    };
  } catch (error) {
    console.error(`Error updating family with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to update family'
    };
  }
};

// Delete family
export const deleteFamily = async (id: string): Promise<ApiResponse> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    await axios.delete(`${API_URL}/api/families/${id}`);
    return {
      success: true,
      message: 'Family deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting family with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete family'
    };
  }
};

// Get all family members
export const getAllFamilyMembers = async (familyId?: string): Promise<FamilyMember[]> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    // Updated endpoint to match the route in index.js
    const url = familyId ? `${API_URL}/api/family-members?family_id=${familyId}` : `${API_URL}/api/family-members`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching family members:', error);
    console.log('Using dummy family members data');
    return dummyFamilyMembers;
  }
};

// Get family member by ID
export const getFamilyMemberById = async (id: string): Promise<FamilyMember> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    const response = await axios.get(`${API_URL}/api/family-members/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching family member with ID ${id}:`, error);
    const member = dummyFamilyMembers.find(m => m.id === id) || dummyFamilyMembers[0];
    console.log('Using dummy family member data:', member);
    return member;
  }
};

// Create new family member
export const addFamilyMember = async (familyMember: Omit<FamilyMember, 'id'>): Promise<ApiResponse> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    const response = await axios.post(`${API_URL}/api/family-members`, familyMember);
    return {
      success: true,
      message: 'Family member added successfully',
      id: response.data.id
    };
  } catch (error) {
    console.error('Error adding family member:', error);
    return {
      success: false,
      message: 'Failed to add family member'
    };
  }
};

// Update family member
export const updateFamilyMember = async (id: string, familyMember: Partial<FamilyMember>): Promise<ApiResponse> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    await axios.put(`${API_URL}/api/family-members/${id}`, familyMember);
    return {
      success: true,
      message: 'Family member updated successfully'
    };
  } catch (error) {
    console.error(`Error updating family member with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to update family member'
    };
  }
};

// Delete family member
export const deleteFamilyMember = async (id: string): Promise<ApiResponse> => {
  try {
    const apiAvailable = await checkApiAvailability();
    if (!apiAvailable) throw new Error('API unavailable');
    
    await axios.delete(`${API_URL}/api/family-members/${id}`);
    return {
      success: true,
      message: 'Family member deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting family member with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete family member'
    };
  }
};

// Get default family member
export const getDefaultFamilyMember = async (familyId?: string): Promise<FamilyMember | null> => {
  try {
    const members = await getAllFamilyMembers(familyId);
    return members.find(member => member.is_default) || null;
  } catch (error) {
    console.error('Error getting default family member:', error);
    return dummyFamilyMembers.find(m => m.is_default) || null;
  }
};
