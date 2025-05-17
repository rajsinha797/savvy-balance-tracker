
import axios from 'axios';
import { format, parse } from 'date-fns';

const API_URL = 'http://localhost:3001';

export interface Expense {
  id: string | number;
  amount: number;
  category: string;
  expense_type_id?: number;
  expense_category_id?: number;
  expense_sub_category_id?: number;
  expense_type_name?: string;
  expense_category_name?: string;
  expense_sub_category_name?: string;
  date: string;
  description: string;
  family_member?: string;
  family_member_id?: string;
}

// Update ExpenseItem to match Expense's id type
export interface ExpenseItem extends Expense {
  // No need to redefine id since it's inherited
}

export interface ExpenseFormData {
  id?: string | number;
  amount: number;
  category?: string; // For backward compatibility
  expense_type_id?: number;
  expense_category_id?: number;
  expense_sub_category_id?: number;
  date: string;
  description: string;
  family_member_id?: string;
}

export interface ExpenseType {
  id: number;
  name: string;
}

export interface ExpenseCategoryWithTypeId {
  id: number;
  expense_type_id: number;
  name: string;
}

export interface ExpenseSubCategory {
  id: number;
  expense_category_id: number;
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

// Add the formatDateForDisplay function that was missing
export const formatDateForDisplay = (dateString: string): string => {
  return formatDate(dateString);
};

// New functions for the enhanced categorization system
export const getAllExpenseTypes = async (): Promise<ExpenseType[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expense types:', error);
    throw error;
  }
};

export const getExpenseCategoriesByTypeId = async (typeId: number): Promise<ExpenseCategoryWithTypeId[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/categories/by-type/${typeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense categories for type ${typeId}:`, error);
    throw error;
  }
};

export const getExpenseSubCategoriesByCategoryId = async (categoryId: number): Promise<ExpenseSubCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/subcategories/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense subcategories for category ${categoryId}:`, error);
    throw error;
  }
};

export const getAllExpenses = async (familyMemberId?: string | number): Promise<Expense[]> => {
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

export const getExpense = async (id: string | number): Promise<Expense> => {
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
    // When creating an expense, also update the budget
    const response = await axios.post(`${API_URL}/api/expenses`, {
      ...expense,
      updateBudget: true // Add flag to update budget automatically
    });
    
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

export const updateExpense = async (id: string | number, expense: ExpenseFormData): Promise<ApiResponse> => {
  try {
    // When updating an expense, also update the budget
    const response = await axios.put(`${API_URL}/api/expenses/${id}`, {
      ...expense,
      updateBudget: true // Add flag to update budget automatically
    });
    
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

export const deleteExpense = async (id: string | number): Promise<ApiResponse> => {
  try {
    // When deleting an expense, also update the budget
    await axios.delete(`${API_URL}/api/expenses/${id}?updateBudget=true`);
    
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

// New function to get expenses by budget period
export const getExpensesByBudgetPeriod = async (year: string, month: string): Promise<Expense[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/budget?year=${year}&month=${month}`);
    
    return response.data.map((expense: any) => ({
      ...expense,
      date: formatDate(expense.date),
      amount: parseFloat(expense.amount)
    }));
  } catch (error) {
    console.error('Error fetching expenses by budget period:', error);
    throw error;
  }
};
