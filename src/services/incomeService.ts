
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Types
export interface IncomeCategory {
  category_id: number;
  name: string;
}

export interface IncomeItem {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  family_member?: string;
  family_member_id?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  id?: string;
}

// Mock data for development/fallback
const mockCategories: IncomeCategory[] = [
  { category_id: 1, name: 'Salary' },
  { category_id: 2, name: 'Freelance' },
  { category_id: 3, name: 'Investment' },
  { category_id: 4, name: 'Gift' },
  { category_id: 5, name: 'Other' }
];

const mockIncomes: IncomeItem[] = [
  { id: '1', amount: 5000, category: 'Salary', description: 'Monthly salary', date: '2025-05-01' },
  { id: '2', amount: 1000, category: 'Freelance', description: 'Website project', date: '2025-05-03' },
  { id: '3', amount: 500, category: 'Investment', description: 'Dividend income', date: '2025-05-05' }
];

// Get all incomes
export const getAllIncomes = async (familyMemberId?: string): Promise<IncomeItem[]> => {
  try {
    const url = familyMemberId 
      ? `${API_URL}/api/income?family_member_id=${familyMemberId}`
      : `${API_URL}/api/income`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return mockIncomes; // Fallback to mock data
  }
};

// Get all income categories
export const getIncomeCategories = async (): Promise<IncomeCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income categories:', error);
    return mockCategories; // Fallback to mock data
  }
};

// Add new income
export const addIncome = async (incomeData: {
  amount: number;
  category_id: number;
  description: string;
  date: string;
  family_member_id?: string;
}): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/income`, incomeData);
    return { 
      success: true, 
      message: 'Income added successfully',
      id: response.data.id
    };
  } catch (error: any) {
    console.error('Error adding income:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to add income' 
    };
  }
};

// Update income
export const updateIncome = async (id: string, incomeData: {
  amount: number;
  category_id: number;
  description: string;
  date: string;
  family_member_id?: string;
}): Promise<ApiResponse> => {
  try {
    await axios.put(`${API_URL}/api/income/${id}`, incomeData);
    return { 
      success: true, 
      message: 'Income updated successfully' 
    };
  } catch (error: any) {
    console.error('Error updating income:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update income' 
    };
  }
};

// Delete income
export const deleteIncome = async (id: string): Promise<ApiResponse> => {
  try {
    await axios.delete(`${API_URL}/api/income/${id}`);
    return { 
      success: true, 
      message: 'Income deleted successfully' 
    };
  } catch (error: any) {
    console.error('Error deleting income:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete income' 
    };
  }
};
