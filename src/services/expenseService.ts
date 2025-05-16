
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface ExpenseItem {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  family_member?: string;
  family_member_id?: string;
}

export const getAllExpenses = async (familyMemberId?: string): Promise<ExpenseItem[]> => {
  try {
    const url = familyMemberId 
      ? `${API_URL}/api/expenses?family_member_id=${familyMemberId}`
      : `${API_URL}/api/expenses`;
    
    const response = await axios.get(url);
    
    // Process each expense to ensure amount is a number and date is in correct format
    return response.data.map((expense: any) => ({
      ...expense,
      amount: parseFloat(expense.amount),
      date: formatDateForDisplay(expense.date)
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  try {
    // Updated endpoint to match backend convention
    const response = await axios.get(`${API_URL}/api/expenses/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    throw error;
  }
};

export const createExpense = async (expense: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> => {
  try {
    // Ensure date is in correct format for API
    const formattedExpense = {
      ...expense,
      date: formatDateForAPI(expense.date)
    };
    
    const response = await axios.post(`${API_URL}/api/expenses`, formattedExpense);
    return {
      ...response.data,
      amount: parseFloat(response.data.amount),
      date: formatDateForDisplay(response.data.date)
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const updateExpense = async (id: string, expense: Partial<ExpenseItem>): Promise<ExpenseItem> => {
  try {
    // Ensure date is in correct format for API if it exists
    const formattedExpense = {
      ...expense
    };
    
    if (formattedExpense.date) {
      formattedExpense.date = formatDateForAPI(formattedExpense.date);
    }
    
    const response = await axios.put(`${API_URL}/api/expenses/${id}`, formattedExpense);
    return {
      ...response.data,
      amount: parseFloat(response.data.amount),
      date: formatDateForDisplay(response.data.date)
    };
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/expenses/${id}`);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Helper function to format date for display (YYYY-MM-DD)
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  // If date is already in YYYY-MM-DD format, return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    // Handle DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse any other format using Date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Error parsing date:', e);
  }
  
  return dateString;
};

// Helper function to format date for API (YYYY-MM-DD)
export const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  
  // If date is already in YYYY-MM-DD format, return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    // Handle DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse any other format using Date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Error parsing date:', e);
  }
  
  return dateString;
};
