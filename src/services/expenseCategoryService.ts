
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface ExpenseCategory {
  id: number;
  name: string;
}

export const getAllExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expense-categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    throw error;
  }
};
