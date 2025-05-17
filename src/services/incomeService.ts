
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'http://localhost:3001';

export interface Income {
  id: string | number;
  amount: number;
  category: string;
  income_type_id?: number;
  income_category_id?: number;
  income_sub_category_id?: number;
  income_type_name?: string;
  income_category_name?: string;
  income_sub_category_name?: string;
  date: string;
  description: string;
  family_member?: string;
  family_member_id?: string;
}

// Update IncomeItem to match Income's id type
export interface IncomeItem extends Income {
  // No need to redefine id since it's inherited from Income
}

export interface IncomeFormData {
  id?: string | number;
  amount: number;
  category_id?: number; // For backward compatibility
  income_type_id: number;
  income_category_id: number;
  income_sub_category_id: number;
  date: string;
  description: string;
  family_member_id?: string;
}

export interface IncomeCategory {
  category_id: number;
  name: string;
}

export interface IncomeType {
  id: number;
  name: string;
}

export interface IncomeCategoryWithTypeId {
  id: number;
  income_type_id: number;
  name: string;
}

export interface IncomeSubCategory {
  id: number;
  income_category_id: number;
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

// Alias function to match what the useIncomeApi.ts expects (legacy)
export const getIncomeCategories = async (): Promise<IncomeCategory[]> => {
  return getAllIncomeCategories();
};

// Legacy function for backward compatibility
export const getAllIncomeCategories = async (): Promise<IncomeCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income categories:', error);
    throw error;
  }
};

// New functions for the enhanced categorization system
export const getAllIncomeTypes = async (): Promise<IncomeType[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income types:', error);
    throw error;
  }
};

export const getIncomeCategoriesByTypeId = async (typeId: number): Promise<IncomeCategoryWithTypeId[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/categories/by-type/${typeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching income categories for type ${typeId}:`, error);
    throw error;
  }
};

export const getIncomeSubCategoriesByCategoryId = async (categoryId: number): Promise<IncomeSubCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/subcategories/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching income subcategories for category ${categoryId}:`, error);
    throw error;
  }
};

export const getAllIncomes = async (familyMemberId?: string | number): Promise<Income[]> => {
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

export const getIncome = async (id: string | number): Promise<Income> => {
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

// Primary function for adding income - this is what useIncomeApi.ts directly references
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
export const updateIncome = async (id: string | number, income: IncomeFormData): Promise<ApiResponse> => {
  try {
    const response = await axios.put(`${API_URL}/api/income/${id}`, income);
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
export const deleteIncome = async (id: string | number): Promise<ApiResponse> => {
  try {
    await axios.delete(`${API_URL}/api/income/${id}`);
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
