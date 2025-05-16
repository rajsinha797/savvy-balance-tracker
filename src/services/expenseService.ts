
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
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expense-categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    throw error;
  }
};

export const createExpense = async (expense: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> => {
  try {
    const response = await axios.post(`${API_URL}/api/expenses`, expense);
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const updateExpense = async (id: string, expense: Partial<ExpenseItem>): Promise<ExpenseItem> => {
  try {
    const response = await axios.put(`${API_URL}/api/expenses/${id}`, expense);
    return response.data;
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
