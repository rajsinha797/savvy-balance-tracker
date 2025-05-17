
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'http://localhost:3001';

export interface Income {
  id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
  family_member?: string;
  family_member_id?: number;
}

// This interface is used by other components but was missing
export interface IncomeItem extends Income {
  id: string | number;
}

export interface IncomeFormData {
  id?: number;
  amount: number;
  category_id: number;
  date: string;
  description: string;
  family_member_id?: number;
}

export interface IncomeCategory {
  category_id: number;
  name: string;
}

// Add the expected response interface
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Helper function to format dates consistently
const formatDate = (dateString: string): string => {
  try {
    // Parse the date from MySQL format (YYYY-MM-DD) and return in expected format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return as is if invalid
    }
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return as is if there's an error
  }
};

// Alias function to match what the useIncomeApi.ts expects
export const getIncomeCategories = async (): Promise<IncomeCategory[]> => {
  return getAllIncomeCategories();
};

export const getAllIncomeCategories = async (): Promise<IncomeCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income categories:', error);
    throw error;
  }
};

export const getAllIncomes = async (familyMemberId?: number | string): Promise<Income[]> => {
  try {
    const url = familyMemberId 
      ? `${API_URL}/api/income?family_member_id=${familyMemberId}` 
      : `${API_URL}/api/income`;
      
    const response = await axios.get(url);
    
    // Format dates consistently and ensure amount is a number
    return response.data.map((income: any) => ({
      ...income,
      date: formatDate(income.date),
      amount: parseFloat(income.amount) // Ensure amount is a number
    }));
  } catch (error) {
    console.error('Error fetching incomes:', error);
    throw error;
  }
};

export const getIncome = async (id: number): Promise<Income> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/${id}`);
    return {
      ...response.data,
      date: formatDate(response.data.date),
      amount: parseFloat(response.data.amount) // Ensure amount is a number
    };
  } catch (error) {
    console.error(`Error fetching income ${id}:`, error);
    throw error;
  }
};

// Renamed function to match what useIncomeApi.ts is expecting
export const addIncome = async (income: IncomeFormData): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/income`, income);
    return {
      success: true,
      message: 'Income added successfully',
      data: {
        ...response.data,
        amount: parseFloat(response.data.amount || 0) // Ensure amount is a number
      }
    };
  } catch (error) {
    console.error('Error creating income:', error);
    return {
      success: false,
      message: 'Failed to add income'
    };
  }
};

// Updated to return ApiResponse to match what useIncomeApi.ts expects
export const updateIncome = async (id: number | string, income: IncomeFormData): Promise<ApiResponse> => {
  try {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const response = await axios.put(`${API_URL}/api/income/${numericId}`, income);
    return {
      success: true,
      message: 'Income updated successfully',
      data: {
        ...response.data,
        amount: parseFloat(response.data.amount || 0) // Ensure amount is a number
      }
    };
  } catch (error) {
    console.error(`Error updating income ${id}:`, error);
    return {
      success: false,
      message: 'Failed to update income'
    };
  }
};

// Updated to return ApiResponse to match what useIncomeApi.ts expects
export const deleteIncome = async (id: number | string): Promise<ApiResponse> => {
  try {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    await axios.delete(`${API_URL}/api/income/${numericId}`);
    return {
      success: true,
      message: 'Income deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting income ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete income'
    };
  }
};

// Helper function for formatting date for display
export const formatDateForDisplay = (dateString: string): string => {
  return formatDate(dateString);
};
