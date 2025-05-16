
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface BudgetCategory {
  id: string;
  category: string;
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
    const response = await axios.get(`${API_URL}/api/budget-periods`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budget periods:', error);
    throw error;
  }
};

export const getBudgetPeriod = async (id: string): Promise<BudgetPeriod> => {
  try {
    const response = await axios.get(`${API_URL}/api/budget-periods/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budget period:', error);
    throw error;
  }
};

export const createBudgetPeriod = async (budgetPeriod: Omit<BudgetPeriod, 'id'>): Promise<BudgetPeriod> => {
  try {
    const response = await axios.post(`${API_URL}/api/budget-periods`, budgetPeriod);
    return response.data;
  } catch (error) {
    console.error('Error creating budget period:', error);
    throw error;
  }
};

export const updateBudgetPeriod = async (id: string, budgetPeriod: Partial<BudgetPeriod>): Promise<BudgetPeriod> => {
  try {
    const response = await axios.put(`${API_URL}/api/budget-periods/${id}`, budgetPeriod);
    return response.data;
  } catch (error) {
    console.error('Error updating budget period:', error);
    throw error;
  }
};

export const deleteBudgetPeriod = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/budget-periods/${id}`);
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
    const response = await axios.post(`${API_URL}/api/budget-periods/${budgetPeriodId}/categories`, category);
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
    const response = await axios.put(
      `${API_URL}/api/budget-periods/${budgetPeriodId}/categories/${categoryId}`, 
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
    await axios.delete(`${API_URL}/api/budget-periods/${budgetPeriodId}/categories/${categoryId}`);
  } catch (error) {
    console.error('Error deleting budget category:', error);
    throw error;
  }
};
