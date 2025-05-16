
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

export const getAllIncomeCategories = async (): Promise<IncomeCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income categories:', error);
    throw error;
  }
};

export const getAllIncomes = async (familyMemberId?: number): Promise<Income[]> => {
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

export const createIncome = async (income: IncomeFormData): Promise<Income> => {
  try {
    const response = await axios.post(`${API_URL}/api/income`, income);
    return {
      ...response.data,
      amount: parseFloat(response.data.amount || 0) // Ensure amount is a number
    };
  } catch (error) {
    console.error('Error creating income:', error);
    throw error;
  }
};

export const updateIncome = async (id: number, income: IncomeFormData): Promise<Income> => {
  try {
    const response = await axios.put(`${API_URL}/api/income/${id}`, income);
    return {
      ...response.data,
      amount: parseFloat(response.data.amount || 0) // Ensure amount is a number
    };
  } catch (error) {
    console.error(`Error updating income ${id}:`, error);
    throw error;
  }
};

export const deleteIncome = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/income/${id}`);
  } catch (error) {
    console.error(`Error deleting income ${id}:`, error);
    throw error;
  }
};
