import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Interfaces
export interface Family {
  family_id: string;
  name: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation?: string;
  is_default?: boolean;
  [key: string]: any;
}

// Dummy data for fallback
const dummyFamilies: Family[] = [
  { family_id: '1', name: 'Default Family' }
];

const dummyFamilyMembers: FamilyMember[] = [
  { id: '1', name: 'Self', relation: 'Self', is_default: true },
  { id: '2', name: 'Spouse', relation: 'Spouse' },
  { id: '3', name: 'Child', relation: 'Child' }
];

// Get all families
export const getAllFamilies = async (): Promise<Family[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/families`);
    return response.data;
  } catch (error) {
    console.error('Error fetching families:', error);
    console.log('Using dummy family data');
    return dummyFamilies;
  }
};

// Get family by ID
export const getFamilyById = async (id: string): Promise<Family> => {
  try {
    const response = await axios.get(`${API_URL}/api/families/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching family with ID ${id}:`, error);
    console.log('Using dummy family data');
    return dummyFamilies[0];
  }
};

// Create new family
export const createFamily = async (name: string): Promise<Family> => {
  try {
    const response = await axios.post(`${API_URL}/api/families`, { name });
    return response.data;
  } catch (error) {
    console.error('Error creating family:', error);
    throw error;
  }
};

// Update family
export const updateFamily = async (id: string, name: string): Promise<Family> => {
  try {
    const response = await axios.put(`${API_URL}/api/families/${id}`, { name });
    return response.data;
  } catch (error) {
    console.error(`Error updating family with ID ${id}:`, error);
    throw error;
  }
};

// Delete family
export const deleteFamily = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/families/${id}`);
  } catch (error) {
    console.error(`Error deleting family with ID ${id}:`, error);
    throw error;
  }
};

// Get all family members
export const getAllFamilyMembers = async (familyId?: string): Promise<FamilyMember[]> => {
  try {
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
export const createFamilyMember = async (familyMember: Omit<FamilyMember, 'id'>): Promise<FamilyMember> => {
  try {
    const response = await axios.post(`${API_URL}/api/family-members`, familyMember);
    return response.data;
  } catch (error) {
    console.error('Error creating family member:', error);
    throw error;
  }
};

// Update family member
export const updateFamilyMember = async (id: string, familyMember: Partial<FamilyMember>): Promise<FamilyMember> => {
  try {
    const response = await axios.put(`${API_URL}/api/family-members/${id}`, familyMember);
    return response.data;
  } catch (error) {
    console.error(`Error updating family member with ID ${id}:`, error);
    throw error;
  }
};

// Delete family member
export const deleteFamilyMember = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/family-members/${id}`);
  } catch (error) {
    console.error(`Error deleting family member with ID ${id}:`, error);
    throw error;
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
