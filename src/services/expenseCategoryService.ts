
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface ExpenseCategory {
  id: number;
  name: string;
}

// Adding dummy data for fallback
const dummyExpenseCategories: ExpenseCategory[] = [
  { id: 1, name: 'Food & Dining' },
  { id: 2, name: 'Transportation' },
  { id: 3, name: 'Housing & Utilities' },
  { id: 4, name: 'Health & Wellness' },
  { id: 5, name: 'Entertainment' },
  { id: 6, name: 'Shopping' },
  { id: 7, name: 'Personal Care' },
  { id: 8, name: 'Education' },
  { id: 9, name: 'Travel' },
  { id: 10, name: 'Miscellaneous' }
];

export const getAllExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/expense-categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    console.log('Using dummy expense categories data');
    return dummyExpenseCategories; // Return dummy data if API fails
  }
};
