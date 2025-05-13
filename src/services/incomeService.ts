
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Type definitions
export interface IncomeCategory {
  category_id: number;
  name: string;
}

export interface IncomeItem {
  id: string;
  amount: number;
  category: string;
  category_id?: number;
  description: string;
  date: string;
}

export interface IncomeCreate {
  amount: number;
  category_id: number;
  description: string;
  date: string;
}

export interface IncomeUpdate {
  amount: number;
  category_id: number;
  description: string;
  date: string;
}

// Dummy data for fallback when API is not available
const dummyIncomes: IncomeItem[] = [
  { id: '1', amount: 3500, category: 'Salary', description: 'Monthly salary', date: '2025-05-01' },
  { id: '2', amount: 500, category: 'Freelance', description: 'Logo design project', date: '2025-05-03' },
  { id: '3', amount: 200, category: 'Interest', description: 'Savings account interest', date: '2025-05-05' },
];

const dummyCategories: IncomeCategory[] = [
  { category_id: 1, name: 'Salary' },
  { category_id: 2, name: 'Freelance' },
  { category_id: 3, name: 'Interest' },
  { category_id: 4, name: 'Dividend' },
  { category_id: 5, name: 'Gift' },
  { category_id: 6, name: 'Other' },
];

// Function to check if API is available
const checkApiAvailability = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_URL}/test`);
    return true;
  } catch (error) {
    console.warn('API server is not available. Using dummy data instead.');
    return false;
  }
};

// Get all income categories
export const getIncomeCategories = async (): Promise<IncomeCategory[]> => {
  try {
    if (await checkApiAvailability()) {
      const response = await axios.get(`${API_URL}/income/categories`);
      return response.data;
    }
    return dummyCategories;
  } catch (error) {
    console.error('Error fetching income categories:', error);
    return dummyCategories;
  }
};

// Get all incomes
export const getAllIncomes = async (): Promise<IncomeItem[]> => {
  try {
    if (await checkApiAvailability()) {
      const response = await axios.get(`${API_URL}/income`);
      return response.data;
    }
    return dummyIncomes;
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return dummyIncomes;
  }
};

// Get income by ID
export const getIncomeById = async (id: string): Promise<IncomeItem | null> => {
  try {
    if (await checkApiAvailability()) {
      const response = await axios.get(`${API_URL}/income/${id}`);
      return response.data;
    }
    return dummyIncomes.find(income => income.id === id) || null;
  } catch (error) {
    console.error('Error fetching income by ID:', error);
    return dummyIncomes.find(income => income.id === id) || null;
  }
};

// Add new income
export const addIncome = async (income: IncomeCreate): Promise<{ success: boolean; id?: string; message?: string }> => {
  try {
    if (await checkApiAvailability()) {
      const response = await axios.post(`${API_URL}/income`, income);
      return { 
        success: true, 
        id: response.data.id.toString(),
        message: 'Income added successfully' 
      };
    }
    // Simulate adding with dummy data
    const newId = (parseInt(dummyIncomes[dummyIncomes.length - 1].id) + 1).toString();
    const category = dummyCategories.find(c => c.category_id === income.category_id)?.name || 'Other';
    dummyIncomes.push({
      id: newId,
      amount: income.amount,
      category,
      description: income.description,
      date: income.date
    });
    return { success: true, id: newId, message: 'Income added successfully (offline mode)' };
  } catch (error) {
    console.error('Error adding income:', error);
    return { success: false, message: 'Failed to add income' };
  }
};

// Update income
export const updateIncome = async (id: string, income: IncomeUpdate): Promise<{ success: boolean; message: string }> => {
  try {
    if (await checkApiAvailability()) {
      await axios.put(`${API_URL}/income/${id}`, income);
      return { success: true, message: 'Income updated successfully' };
    }
    // Simulate updating with dummy data
    const index = dummyIncomes.findIndex(item => item.id === id);
    if (index !== -1) {
      const category = dummyCategories.find(c => c.category_id === income.category_id)?.name || 'Other';
      dummyIncomes[index] = {
        ...dummyIncomes[index],
        amount: income.amount,
        category,
        description: income.description,
        date: income.date
      };
      return { success: true, message: 'Income updated successfully (offline mode)' };
    }
    return { success: false, message: 'Income not found' };
  } catch (error) {
    console.error('Error updating income:', error);
    return { success: false, message: 'Failed to update income' };
  }
};

// Delete income
export const deleteIncome = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (await checkApiAvailability()) {
      await axios.delete(`${API_URL}/income/${id}`);
      return { success: true, message: 'Income deleted successfully' };
    }
    // Simulate deleting with dummy data
    const index = dummyIncomes.findIndex(item => item.id === id);
    if (index !== -1) {
      dummyIncomes.splice(index, 1);
      return { success: true, message: 'Income deleted successfully (offline mode)' };
    }
    return { success: false, message: 'Income not found' };
  } catch (error) {
    console.error('Error deleting income:', error);
    return { success: false, message: 'Failed to delete income' };
  }
};
