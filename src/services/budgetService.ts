
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface BudgetCategory {
  id: string;
  category: string;
  type?: string;
  subCategory?: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface BudgetPeriod {
  id: string;
  month: string;
  year: string;
  totalAllocated: number;
  totalSpent: number;
  categories: BudgetCategory[];
}

export const getAllBudgetPeriods = async (): Promise<BudgetPeriod[]> => {
  try {
    // Using the correct endpoint with expense integration
    const response = await axios.get(`${API_URL}/api/budgets?includeExpenses=true`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budget periods:', error);
    throw error;
  }
};

export const getBudgetPeriod = async (id: string): Promise<BudgetPeriod> => {
  try {
    // Using the correct endpoint with expense integration
    const response = await axios.get(`${API_URL}/api/budgets/${id}?includeExpenses=true`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budget period:', error);
    throw error;
  }
};

export const createBudgetPeriod = async (budgetPeriod: Omit<BudgetPeriod, 'id'>): Promise<BudgetPeriod> => {
  try {
    // Using the correct endpoint
    const response = await axios.post(`${API_URL}/api/budgets`, budgetPeriod);
    return response.data;
  } catch (error) {
    console.error('Error creating budget period:', error);
    throw error;
  }
};

export const updateBudgetPeriod = async (id: string, budgetPeriod: Partial<BudgetPeriod>): Promise<BudgetPeriod> => {
  try {
    // Using the correct endpoint
    const response = await axios.put(`${API_URL}/api/budgets/${id}`, budgetPeriod);
    return response.data;
  } catch (error) {
    console.error('Error updating budget period:', error);
    throw error;
  }
};

export const deleteBudgetPeriod = async (id: string): Promise<void> => {
  try {
    // Using the correct endpoint
    await axios.delete(`${API_URL}/api/budgets/${id}`);
  } catch (error) {
    console.error('Error deleting budget period:', error);
    throw error;
  }
};

export const addBudgetCategory = async (
  budgetPeriodId: string, 
  category: Omit<BudgetCategory, 'id' | 'spent' | 'remaining' | 'percentageUsed'>
): Promise<BudgetCategory> => {
  try {
    // Using the correct endpoint
    const response = await axios.post(`${API_URL}/api/budgets/${budgetPeriodId}/categories`, category);
    return response.data;
  } catch (error) {
    console.error('Error adding budget category:', error);
    throw error;
  }
};

export const updateBudgetCategory = async (
  budgetPeriodId: string,
  categoryId: string, 
  categoryData: Partial<BudgetCategory>
): Promise<BudgetCategory> => {
  try {
    // Using the correct endpoint
    const response = await axios.put(
      `${API_URL}/api/budgets/${budgetPeriodId}/categories/${categoryId}`, 
      categoryData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating budget category:', error);
    throw error;
  }
};

export const deleteBudgetCategory = async (budgetPeriodId: string, categoryId: string): Promise<void> => {
  try {
    // Using the correct endpoint
    await axios.delete(`${API_URL}/api/budgets/${budgetPeriodId}/categories/${categoryId}`);
  } catch (error) {
    console.error('Error deleting budget category:', error);
    throw error;
  }
};

// New function to sync expenses with budget
export const syncExpensesWithBudget = async (year: string, month: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/api/budgets/sync-expenses`, { year, month });
  } catch (error) {
    console.error('Error syncing expenses with budget:', error);
    throw error;
  }
};
