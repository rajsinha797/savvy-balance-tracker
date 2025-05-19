
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface IncomeCategory {
  category_id: number;
  name: string;
}

export interface IncomeItem {
  id: number | string;
  amount: number;
  date: string;
  description?: string;
  category?: string;
  income_type_name?: string;
  income_category_name?: string;
  income_sub_category_name?: string;
  family_member?: string;
  income_type_id?: number;
  income_category_id?: number;
  income_sub_category_id?: number;
  family_member_id?: string;
  wallet_id?: number | null;
  wallet_name?: string;
}

// Dummy data for fallback
const dummyIncomeCategories: IncomeCategory[] = [
  { category_id: 1, name: 'Salary' },
  { category_id: 2, name: 'Business' },
  { category_id: 3, name: 'Investments' },
  { category_id: 4, name: 'Rent' },
  { category_id: 5, name: 'Interest' },
  { category_id: 6, name: 'Dividend' },
  { category_id: 7, name: 'Gift' },
  { category_id: 8, name: 'Other' }
];

// New dummy income types for hierarchical categorization
const dummyIncomeTypes = [
  { id: 1, name: 'Employment' },
  { id: 2, name: 'Business' },
  { id: 3, name: 'Investment' },
  { id: 4, name: 'Passive' },
  { id: 5, name: 'Other' }
];

// Dummy income data
const dummyIncomeData: IncomeItem[] = [
  {
    id: 1,
    amount: 50000,
    date: '2023-07-05',
    description: 'Monthly salary',
    category: 'Salary',
    income_type_name: 'Employment',
    income_category_name: 'Regular Job',
    income_sub_category_name: 'Monthly Salary',
    family_member: 'Self',
    income_type_id: 1,
    income_category_id: 1,
    income_sub_category_id: 1,
    family_member_id: '1',
    wallet_id: 1,
    wallet_name: 'Bank Account'
  },
  {
    id: 2,
    amount: 5000,
    date: '2023-07-10',
    description: 'Freelance project',
    category: 'Business',
    income_type_name: 'Business',
    income_category_name: 'Freelancing',
    income_sub_category_name: 'Project Payment',
    family_member: 'Self',
    income_type_id: 2,
    income_category_id: 4,
    income_sub_category_id: 10,
    family_member_id: '1',
    wallet_id: 2,
    wallet_name: 'Digital Wallet'
  }
];

// Get income categories
export const getIncomeCategories = async (): Promise<IncomeCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income categories:', error);
    console.log('Using dummy income categories');
    return dummyIncomeCategories;
  }
};

// Get all income data
export const getAllIncome = async (familyMemberId?: string): Promise<IncomeItem[]> => {
  try {
    let url = `${API_URL}/api/income`;
    if (familyMemberId) {
      url += `?family_member_id=${familyMemberId}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching income data:', error);
    console.log('Using dummy income data');
    return dummyIncomeData;
  }
};

// Add new income
export interface IncomeFormData {
  amount: number;
  income_type_id: number;
  income_category_id: number;
  income_sub_category_id: number;
  description: string;
  date: string;
  family_member_id?: string;
  wallet_id?: number | null;
}

export const addIncome = async (incomeData: IncomeFormData): Promise<{ success: boolean; message: string; id?: number | string }> => {
  try {
    const response = await axios.post(`${API_URL}/api/income`, incomeData);
    return {
      success: true,
      message: 'Income added successfully',
      id: response.data.id
    };
  } catch (error) {
    console.error('Error adding income:', error);
    return {
      success: false,
      message: 'Failed to add income'
    };
  }
};

// Update income
export const updateIncome = async ({ id, incomeData }: { id: number | string; incomeData: IncomeFormData }): Promise<{ success: boolean; message: string }> => {
  try {
    await axios.put(`${API_URL}/api/income/${id}`, incomeData);
    return {
      success: true,
      message: 'Income updated successfully'
    };
  } catch (error) {
    console.error(`Error updating income with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to update income'
    };
  }
};

// Delete income
export const deleteIncome = async (id: number | string): Promise<{ success: boolean; message: string }> => {
  try {
    await axios.delete(`${API_URL}/api/income/${id}`);
    return {
      success: true,
      message: 'Income deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting income with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete income'
    };
  }
};

// New hierarchical categorization endpoints

// Get income types
export const getAllIncomeTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/income/types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income types:', error);
    console.log('Using dummy income types');
    return dummyIncomeTypes;
  }
};

// Get categories by type
export const getIncomeCategoriesByType = async (typeId: number) => {
  try {
    const response = await axios.get(`${API_URL}/api/income/categories/by-type/${typeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching income categories for type ${typeId}:`, error);
    console.log('Using dummy income categories by type');
    return [
      { id: 1, name: 'Regular Job', income_type_id: 1 },
      { id: 2, name: 'Contract Work', income_type_id: 1 },
      { id: 3, name: 'Bonus', income_type_id: 1 },
      { id: 4, name: 'Freelancing', income_type_id: 2 },
      { id: 5, name: 'Online Business', income_type_id: 2 },
      { id: 6, name: 'Stocks', income_type_id: 3 },
      { id: 7, name: 'Mutual Funds', income_type_id: 3 },
      { id: 8, name: 'Rental Income', income_type_id: 4 },
      { id: 9, name: 'Royalties', income_type_id: 4 },
      { id: 10, name: 'Gifts', income_type_id: 5 },
      { id: 11, name: 'Miscellaneous', income_type_id: 5 }
    ].filter(cat => cat.income_type_id === typeId);
  }
};

// Get subcategories by category
export const getIncomeSubcategoriesByCategory = async (categoryId: number) => {
  try {
    const response = await axios.get(`${API_URL}/api/income/subcategories/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching income subcategories for category ${categoryId}:`, error);
    console.log('Using dummy income subcategories by category');
    
    // This is just sample data for demonstration
    const subcategories = [
      { id: 1, name: 'Monthly Salary', income_category_id: 1 },
      { id: 2, name: 'Weekly Wages', income_category_id: 1 },
      { id: 3, name: 'Part-time Job', income_category_id: 1 },
      { id: 4, name: 'Fixed Contract', income_category_id: 2 },
      { id: 5, name: 'Hourly Contract', income_category_id: 2 },
      { id: 6, name: 'Performance Bonus', income_category_id: 3 },
      { id: 7, name: 'Annual Bonus', income_category_id: 3 },
      { id: 8, name: 'Web Development', income_category_id: 4 },
      { id: 9, name: 'Graphic Design', income_category_id: 4 },
      { id: 10, name: 'Project Payment', income_category_id: 4 },
      // Add more as needed...
    ];
    
    return subcategories.filter(sub => sub.income_category_id === categoryId);
  }
};
