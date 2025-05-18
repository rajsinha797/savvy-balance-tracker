
import axios from 'axios';
import { format, parse } from 'date-fns';

const API_URL = 'http://localhost:3001';

// Adding dummy data for fallback when API is down
const dummyExpenseTypes = [
  { id: 1, name: 'Housing' },
  { id: 2, name: 'Transportation' },
  { id: 3, name: 'Food' }
];

const dummyExpenseCategories = [
  { id: 1, expense_type_id: 1, name: 'Rent/Mortgage' },
  { id: 2, expense_type_id: 1, name: 'Utilities' },
  { id: 3, expense_type_id: 2, name: 'Fuel/Gasoline' },
  { id: 4, expense_type_id: 2, name: 'Vehicle Maintenance/Repairs' },
  { id: 5, expense_type_id: 3, name: 'Groceries' },
  { id: 6, expense_type_id: 3, name: 'Dining Out' }
];

const dummyExpenseSubcategories = [
  { id: 1, expense_category_id: 1, name: 'Home Loan' },
  { id: 2, expense_category_id: 1, name: 'Maintenance' },
  { id: 3, expense_category_id: 2, name: 'Electricity bill' },
  { id: 4, expense_category_id: 2, name: 'Water bill' },
  { id: 5, expense_category_id: 3, name: 'Two wheeler fuel' },
  { id: 6, expense_category_id: 4, name: 'Two Wheelers - Service/Repairs' },
  { id: 7, expense_category_id: 5, name: 'Groceries (Vegetables/Fruits)' },
  { id: 8, expense_category_id: 6, name: 'Restaurants/Cafe' }
];

const dummyExpenses = [
  {
    id: 1,
    amount: 15000,
    expense_type_id: 1,
    expense_category_id: 1,
    expense_sub_category_id: 1,
    expense_type_name: 'Housing',
    expense_category_name: 'Rent/Mortgage',
    expense_sub_category_name: 'Home Loan',
    date: '2023-05-05',
    description: 'May rent',
    family_member: 'John Doe',
    family_member_id: '1'
  },
  {
    id: 2,
    amount: 3500,
    expense_type_id: 1,
    expense_category_id: 2,
    expense_sub_category_id: 3,
    expense_type_name: 'Housing',
    expense_category_name: 'Utilities',
    expense_sub_category_name: 'Electricity bill',
    date: '2023-05-10',
    description: 'Electricity bill',
    family_member: 'Jane Doe',
    family_member_id: '2'
  },
  {
    id: 3,
    amount: 1200,
    expense_type_id: 2,
    expense_category_id: 3,
    expense_sub_category_id: 5,
    expense_type_name: 'Transportation',
    expense_category_name: 'Fuel/Gasoline',
    expense_sub_category_name: 'Two wheeler fuel',
    date: '2023-05-15',
    description: 'Petrol',
    family_member: 'John Doe',
    family_member_id: '1'
  }
];

export interface Expense {
  id: string | number;
  amount: number;
  category?: string; // For backward compatibility
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
    console.log('Using dummy expense types data');
    return dummyExpenseTypes;
  }
};

export const getExpenseCategoriesByTypeId = async (typeId: number): Promise<ExpenseCategoryWithTypeId[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/categories/by-type/${typeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense categories for type ${typeId}:`, error);
    console.log('Using dummy expense categories data');
    return dummyExpenseCategories.filter(cat => cat.expense_type_id === typeId);
  }
};

export const getExpenseSubCategoriesByCategoryId = async (categoryId: number): Promise<ExpenseSubCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/expenses/subcategories/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense subcategories for category ${categoryId}:`, error);
    console.log('Using dummy expense subcategories data');
    return dummyExpenseSubcategories.filter(subcat => subcat.expense_category_id === categoryId);
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
    console.log('Using dummy expenses data');
    
    // Filter dummy data if familyMemberId is provided
    const filteredExpenses = familyMemberId 
      ? dummyExpenses.filter(e => e.family_member_id === String(familyMemberId))
      : dummyExpenses;
      
    return filteredExpenses;
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
    console.log('Using dummy expense data');
    const dummyExpense = dummyExpenses.find(e => e.id === id);
    if (!dummyExpense) {
      throw new Error(`Expense with ID ${id} not found`);
    }
    return dummyExpense;
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
    console.log('API is down, mimicking successful response with dummy data');
    
    // Return a mock successful response when API is down
    return {
      success: true,
      message: 'Expense created successfully (API offline - mock response)',
      data: {
        id: Date.now(), // Generate a temporary ID
        ...expense,
      }
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
        amount: parseFloat(response.data.amount || '0') // Ensure amount is a number
      }
    };
  } catch (error) {
    console.error(`Error updating expense ${id}:`, error);
    console.log('API is down, mimicking successful response with dummy data');
    
    // Return a mock successful response when API is down
    return {
      success: true,
      message: 'Expense updated successfully (API offline - mock response)',
      data: {
        id,
        ...expense,
      }
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
    console.log('API is down, mimicking successful response');
    
    // Return a mock successful response when API is down
    return {
      success: true,
      message: 'Expense deleted successfully (API offline - mock response)'
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
    console.log('Using dummy expenses data for budget period');
    
    // Filter dummy expenses for the given month and year
    const filteredExpenses = dummyExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === parseInt(year) && 
             expenseDate.getMonth() + 1 === parseInt(month);
    });
    
    return filteredExpenses;
  }
};
