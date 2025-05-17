
import axios from 'axios';
import { format, parse } from 'date-fns';

const API_URL = 'http://localhost:3001';

export interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
  description: string;
  family_member?: string;
  family_member_id?: number;
}

// Add ExpenseItem interface needed by the Expenses page
export interface ExpenseItem extends Expense {
  id: string | number;
}

export interface ExpenseFormData {
  id?: number;
  amount: number;
  category: string;
  date: string;
  description: string;
  family_member_id?: number;
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

// Add the formatDateForDisplay function that was missing
export const formatDateForDisplay = (dateString: string): string => {
  return formatDate(dateString);
};

export const getAllExpenses = async (familyMemberId?: number | string): Promise<Expense[]> => {
  try {
    // Convert string to number if it's a string
    const numericId = typeof familyMemberId === 'string' ? parseInt(familyMemberId) : familyMemberId;
    
    const url = numericId
      ? `${API_URL}/api/expenses?family_member_id=${numericId}`
      : `${API_URL}/api/expenses`;
      
    const response = await axios.get(url);
    
    // Format dates consistently
    return response.data.map((expense: any) => ({
      ...expense,
      date: formatDate(expense.date),
      amount: parseFloat(expense.amount) // Ensure amount is a number
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const getExpense = async (id: number): Promise<Expense> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/${id}`);
    return {
      ...response.data,
      date: formatDate(response.data.date),
      amount: parseFloat(response.data.amount) // Ensure amount is a number
    };
  } catch (error) {
    console.error(`Error fetching expense ${id}:`, error);
    throw error;
  }
};

export const createExpense = async (expense: ExpenseFormData): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/expenses`, expense);
    return {
      success: true,
      message: 'Expense created successfully',
      data: {
        ...response.data,
        date: formatDate(response.data.date),
        amount: parseFloat(response.data.amount) // Ensure amount is a number
      }
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    return {
      success: false,
      message: 'Failed to create expense'
    };
  }
};

export const updateExpense = async (id: number | string, expense: ExpenseFormData): Promise<ApiResponse> => {
  try {
    // Convert string to number if it's a string
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    
    const response = await axios.put(`${API_URL}/api/expenses/${numericId}`, expense);
    return {
      success: true,
      message: 'Expense updated successfully',
      data: {
        ...response.data,
        date: formatDate(response.data.date),
        amount: parseFloat(response.data.amount) // Ensure amount is a number
      }
    };
  } catch (error) {
    console.error(`Error updating expense ${id}:`, error);
    return {
      success: false,
      message: 'Failed to update expense'
    };
  }
};

export const deleteExpense = async (id: number | string): Promise<ApiResponse> => {
  try {
    // Convert string to number if it's a string
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    
    await axios.delete(`${API_URL}/api/expenses/${numericId}`);
    return {
      success: true,
      message: 'Expense deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting expense ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete expense'
    };
  }
};
