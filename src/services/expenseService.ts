
import axios from 'axios';
import { ExpenseCategory } from './expenseCategoryService';

const API_URL = 'http://localhost:3001';

// Interface for expense items
export interface ExpenseItem {
  id: number;
  amount: number;
  date: string;
  description: string;
  expense_type_name?: string;
  expense_category_name?: string;
  expense_sub_category_name?: string;
  family_member?: string;
  expense_type_id: number;
  expense_category_id: number;
  expense_sub_category_id: number;
  family_member_id?: string;
  wallet_id?: number | null;
  wallet_name?: string;
}

// Interface for expense types
export interface ExpenseType {
  id: number;
  name: string;
}

// Interface for expense categories with type ID
export interface ExpenseCategoryWithTypeId {
  id: number;
  name: string;
  expense_type_id: number;
}

// Interface for expense subcategories
export interface ExpenseSubCategory {
  id: number;
  name: string;
  expense_category_id: number;
}

// Adding dummy data for fallback
const dummyExpenseTypes: ExpenseType[] = [
  { id: 1, name: 'Essential' },
  { id: 2, name: 'Non-Essential' },
  { id: 3, name: 'Investment' },
  { id: 4, name: 'Debt Payment' }
];

// Dummy expense categories organized by type
const dummyExpenseCategories: ExpenseCategoryWithTypeId[] = [
  // Essential expenses
  { id: 1, name: 'Housing', expense_type_id: 1 },
  { id: 2, name: 'Utilities', expense_type_id: 1 },
  { id: 3, name: 'Groceries', expense_type_id: 1 },
  { id: 4, name: 'Healthcare', expense_type_id: 1 },
  { id: 5, name: 'Transportation', expense_type_id: 1 },
  
  // Non-Essential expenses
  { id: 6, name: 'Entertainment', expense_type_id: 2 },
  { id: 7, name: 'Dining Out', expense_type_id: 2 },
  { id: 8, name: 'Shopping', expense_type_id: 2 },
  { id: 9, name: 'Travel', expense_type_id: 2 },
  
  // Investment expenses
  { id: 10, name: 'Stocks', expense_type_id: 3 },
  { id: 11, name: 'Mutual Funds', expense_type_id: 3 },
  { id: 12, name: 'Real Estate', expense_type_id: 3 },
  
  // Debt Payment expenses
  { id: 13, name: 'Credit Card', expense_type_id: 4 },
  { id: 14, name: 'Loan', expense_type_id: 4 },
  { id: 15, name: 'Mortgage', expense_type_id: 4 }
];

// Dummy expense subcategories
const dummyExpenseSubcategories: ExpenseSubCategory[] = [
  // Housing subcategories
  { id: 1, name: 'Rent', expense_category_id: 1 },
  { id: 2, name: 'Mortgage', expense_category_id: 1 },
  { id: 3, name: 'Property Tax', expense_category_id: 1 },
  
  // Utilities subcategories
  { id: 4, name: 'Electricity', expense_category_id: 2 },
  { id: 5, name: 'Water', expense_category_id: 2 },
  { id: 6, name: 'Internet', expense_category_id: 2 },
  
  // Add more subcategories for other categories...
];

// Adding dummy data for expenses fallback
const dummyExpenses: ExpenseItem[] = [
  {
    id: 1,
    amount: 1500,
    date: '2023-07-01',
    description: 'Monthly rent',
    expense_type_name: 'Essential',
    expense_category_name: 'Housing',
    expense_sub_category_name: 'Rent',
    expense_type_id: 1,
    expense_category_id: 1,
    expense_sub_category_id: 1,
    family_member: 'Self',
    family_member_id: '1',
    wallet_id: 1,
    wallet_name: 'Cash'
  },
  {
    id: 2,
    amount: 75,
    date: '2023-07-02',
    description: 'Electricity bill',
    expense_type_name: 'Essential',
    expense_category_name: 'Utilities',
    expense_sub_category_name: 'Electricity',
    expense_type_id: 1,
    expense_category_id: 2,
    expense_sub_category_id: 4,
    family_member: 'Self',
    family_member_id: '1',
    wallet_id: 1,
    wallet_name: 'Cash'
  },
  {
    id: 3,
    amount: 200,
    date: '2023-07-03',
    description: 'Grocery shopping',
    expense_type_name: 'Essential',
    expense_category_name: 'Groceries',
    expense_sub_category_name: 'Food',
    expense_type_id: 1,
    expense_category_id: 3,
    expense_sub_category_id: 7,
    family_member: 'Spouse',
    family_member_id: '2',
    wallet_id: 2,
    wallet_name: 'Bank Account'
  }
];

// Format date function
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';

  // Handle ISO date strings
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }

  // Handle DD/MM/YYYY format
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0'); 
      return `${parts[2]}-${month}-${day}`;
    }
  }

  // Return as is if already in YYYY-MM-DD format or can't parse
  return dateString;
}

// Get expenses
export const getAllExpenses = async (familyMemberId?: string): Promise<ExpenseItem[]> => {
  try {
    const url = familyMemberId 
      ? `${API_URL}/api/expenses?family_member_id=${familyMemberId}`
      : `${API_URL}/api/expenses`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    console.log('Using dummy expense data');
    return dummyExpenses;
  }
};

// Get expense by ID
export const getExpenseById = async (id: string): Promise<ExpenseItem | null> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense with ID ${id}:`, error);
    console.log('Using dummy expense data');
    return dummyExpenses.find(expense => expense.id.toString() === id) || null;
  }
};

// Create expense
export interface ExpenseFormData {
  amount: number;
  expense_type_id: number;
  expense_category_id: number;
  expense_sub_category_id: number;
  date: string;
  description: string;
  family_member_id?: string;
  wallet_id?: number | null;
}

export const createExpense = async (expense: ExpenseFormData): Promise<{ success: boolean; message: string; id?: number }> => {
  try {
    const response = await axios.post(`${API_URL}/api/expenses`, expense);
    return {
      success: true,
      message: 'Expense added successfully',
      id: response.data.id
    };
  } catch (error) {
    console.error('Error adding expense:', error);
    return {
      success: false,
      message: 'Failed to add expense'
    };
  }
};

// Update expense
export const updateExpense = async (id: number | string, expense: ExpenseFormData): Promise<{ success: boolean; message: string }> => {
  try {
    await axios.put(`${API_URL}/api/expenses/${id}`, expense);
    return {
      success: true,
      message: 'Expense updated successfully'
    };
  } catch (error) {
    console.error(`Error updating expense with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to update expense'
    };
  }
};

// Delete expense
export const deleteExpense = async (id: number | string): Promise<{ success: boolean; message: string }> => {
  try {
    await axios.delete(`${API_URL}/api/expenses/${id}`);
    return {
      success: true,
      message: 'Expense deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting expense with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete expense'
    };
  }
};

// Get expense categories
export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    console.log('Using dummy expense categories');
    return dummyExpenseCategories.map(c => ({ id: c.id, name: c.name }));
  }
};

// Get all expense types
export const getAllExpenseTypes = async (): Promise<ExpenseType[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense types:', error);
    console.log('Using dummy expense types');
    return dummyExpenseTypes;
  }
};

// Get expense categories by type ID
export const getExpenseCategoriesByType = async (typeId: number): Promise<ExpenseCategoryWithTypeId[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/categories/by-type/${typeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense categories for type ${typeId}:`, error);
    console.log('Using dummy expense categories filtered by type');
    return dummyExpenseCategories.filter(category => category.expense_type_id === typeId);
  }
};

// Get expense subcategories by category ID
export const getExpenseSubcategoriesByCategory = async (categoryId: number): Promise<ExpenseSubCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/subcategories/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense subcategories for category ${categoryId}:`, error);
    console.log('Using dummy expense subcategories filtered by category');
    return dummyExpenseSubcategories.filter(subcategory => subcategory.expense_category_id === categoryId);
  }
};
