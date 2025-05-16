
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

export interface ExpenseFormData {
  id?: number;
  amount: number;
  category: string;
  date: string;
  description: string;
  family_member_id?: number;
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

export const getAllExpenses = async (familyMemberId?: number): Promise<Expense[]> => {
  try {
    const url = familyMemberId
      ? `${API_URL}/api/expenses?family_member_id=${familyMemberId}`
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

export const createExpense = async (expense: ExpenseFormData): Promise<Expense> => {
  try {
    const response = await axios.post(`${API_URL}/api/expenses`, expense);
    return {
      ...response.data,
      date: formatDate(response.data.date),
      amount: parseFloat(response.data.amount) // Ensure amount is a number
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const updateExpense = async (id: number, expense: ExpenseFormData): Promise<Expense> => {
  try {
    const response = await axios.put(`${API_URL}/api/expenses/${id}`, expense);
    return {
      ...response.data,
      date: formatDate(response.data.date),
      amount: parseFloat(response.data.amount) // Ensure amount is a number
    };
  } catch (error) {
    console.error(`Error updating expense ${id}:`, error);
    throw error;
  }
};

export const deleteExpense = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/expenses/${id}`);
  } catch (error) {
    console.error(`Error deleting expense ${id}:`, error);
    throw error;
  }
};
