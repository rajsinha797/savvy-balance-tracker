
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'http://localhost:3001';

export interface Income {
  id: string | number;
  amount: number;
  category: string;
  income_type_id?: number;
  income_category_id?: number;
  income_sub_category_id?: number;
  income_type_name?: string;
  income_category_name?: string;
  income_sub_category_name?: string;
  date: string;
  description: string;
  family_member?: string;
  family_member_id?: string;
}

// Update IncomeItem to match Income's id type
export interface IncomeItem extends Income {
  // No need to redefine id since it's inherited from Income
}

export interface IncomeFormData {
  id?: string | number;
  amount: number;
  category_id?: number; // For backward compatibility
  income_type_id: number;
  income_category_id: number;
  income_sub_category_id: number;
  date: string;
  description: string;
  family_member_id?: string;
}

export interface IncomeCategory {
  category_id: number;
  name: string;
}

export interface IncomeType {
  id: number;
  name: string;
}

export interface IncomeCategoryWithTypeId {
  id: number;
  income_type_id: number;
  name: string;
}

export interface IncomeSubCategory {
  id: number;
  income_category_id: number;
  name: string;
}

// Add the expected response interface
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Dummy data for when API is not available
const DUMMY_INCOME_TYPES: IncomeType[] = [
  { id: 1, name: 'Income' },
  { id: 2, name: 'Savings' },
  { id: 3, name: 'Investments' }
];

const DUMMY_INCOME_CATEGORIES: IncomeCategoryWithTypeId[] = [
  { id: 1, income_type_id: 1, name: 'Salary' },
  { id: 2, income_type_id: 1, name: 'Meal Card' },
  { id: 3, income_type_id: 2, name: 'Savings' },
  { id: 4, income_type_id: 3, name: 'Mutual Funds' },
  { id: 5, income_type_id: 3, name: 'PPF' },
  { id: 6, income_type_id: 3, name: 'NPS' }
];

const DUMMY_INCOME_SUBCATEGORIES: IncomeSubCategory[] = [
  { id: 1, income_category_id: 1, name: 'Prateek Salary' },
  { id: 2, income_category_id: 1, name: 'Sunaina Salary' },
  { id: 3, income_category_id: 3, name: 'Savings' },
  { id: 4, income_category_id: 4, name: 'SBI' },
  { id: 5, income_category_id: 5, name: 'PPF' },
  { id: 6, income_category_id: 6, name: 'NPS' }
];

const DUMMY_INCOMES: Income[] = [
  {
    id: 1,
    amount: 50000,
    category: 'Salary', 
    income_type_id: 1,
    income_category_id: 1,
    income_sub_category_id: 1,
    income_type_name: 'Income',
    income_category_name: 'Salary',
    income_sub_category_name: 'Prateek Salary',
    date: '2025-05-01',
    description: 'Monthly salary',
    family_member: 'John Doe',
    family_member_id: '1'
  },
  {
    id: 2,
    amount: 25000,
    category: 'Salary',
    income_type_id: 1,
    income_category_id: 1,
    income_sub_category_id: 2,
    income_type_name: 'Income',
    income_category_name: 'Salary',
    income_sub_category_name: 'Sunaina Salary',
    date: '2025-05-01',
    description: 'Part-time job',
    family_member: 'Jane Doe',
    family_member_id: '2'
  }
];

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

// Alias function to match what the useIncomeApi.ts expects (legacy)
export const getIncomeCategories = async (): Promise<IncomeCategory[]> => {
  return getAllIncomeCategories();
};

// Legacy function for backward compatibility
export const getAllIncomeCategories = async (): Promise<IncomeCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income categories:', error);
    // Return dummy data when API fails
    return DUMMY_INCOME_CATEGORIES.map(cat => ({
      category_id: cat.id,
      name: cat.name
    }));
  }
};

// New functions for the enhanced categorization system
export const getAllIncomeTypes = async (): Promise<IncomeType[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching income types:', error);
    // Return dummy data when API fails
    return DUMMY_INCOME_TYPES;
  }
};

export const getIncomeCategoriesByTypeId = async (typeId: number): Promise<IncomeCategoryWithTypeId[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/categories/by-type/${typeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching income categories for type ${typeId}:`, error);
    // Return dummy data filtered by type when API fails
    return DUMMY_INCOME_CATEGORIES.filter(cat => cat.income_type_id === typeId);
  }
};

export const getIncomeSubCategoriesByCategoryId = async (categoryId: number): Promise<IncomeSubCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/subcategories/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching income subcategories for category ${categoryId}:`, error);
    // Return dummy data filtered by category when API fails
    return DUMMY_INCOME_SUBCATEGORIES.filter(subcat => subcat.income_category_id === categoryId);
  }
};

export const getAllIncomes = async (familyMemberId?: string | number): Promise<Income[]> => {
  try {
    const url = familyMemberId 
      ? `${API_URL}/api/income?family_member_id=${familyMemberId}` 
      : `${API_URL}/api/income`;
      
    const response = await axios.get(url);
    
    // Format dates consistently and ensure amount is a number
    return response.data.map((income: any) => ({
      ...income,
      date: formatDate(income.date),
      amount: parseFloat(income.amount) // Ensure amount is a number
    }));
  } catch (error) {
    console.error('Error fetching incomes:', error);
    // Return dummy data filtered by family member when API fails
    const filteredIncomes = familyMemberId 
      ? DUMMY_INCOMES.filter(income => income.family_member_id === String(familyMemberId))
      : DUMMY_INCOMES;
      
    return filteredIncomes.map(income => ({
      ...income,
      date: formatDate(income.date),
      amount: typeof income.amount === 'number' ? income.amount : parseFloat(String(income.amount))
    }));
  }
};

export const getIncome = async (id: string | number): Promise<Income> => {
  try {
    const response = await axios.get(`${API_URL}/api/income/${id}`);
    return {
      ...response.data,
      date: formatDate(response.data.date),
      amount: parseFloat(response.data.amount) // Ensure amount is a number
    };
  } catch (error) {
    console.error(`Error fetching income ${id}:`, error);
    // Return dummy income with matching id when API fails
    const dummyIncome = DUMMY_INCOMES.find(income => String(income.id) === String(id));
    if (dummyIncome) {
      return {
        ...dummyIncome,
        date: formatDate(dummyIncome.date),
        amount: typeof dummyIncome.amount === 'number' ? dummyIncome.amount : parseFloat(String(dummyIncome.amount))
      };
    }
    throw error; // Re-throw the error if no matching dummy data found
  }
};

// Primary function for adding income - this is what useIncomeApi.ts directly references
export const addIncome = async (income: IncomeFormData): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/income`, income);
    return {
      success: true,
      message: 'Income added successfully',
      data: {
        ...response.data,
        amount: parseFloat(response.data.amount || 0) // Ensure amount is a number
      }
    };
  } catch (error) {
    console.error('Error creating income:', error);
    // Return simulated success with dummy data when API fails
    const newId = Math.max(...DUMMY_INCOMES.map(item => Number(item.id))) + 1;
    DUMMY_INCOMES.push({
      id: newId,
      amount: income.amount,
      category: 'Unknown', // Default category name
      income_type_id: income.income_type_id,
      income_category_id: income.income_category_id,
      income_sub_category_id: income.income_sub_category_id,
      date: income.date,
      description: income.description,
      family_member_id: income.family_member_id
    });
    
    return {
      success: true,
      message: 'Income added successfully (offline mode)',
      data: { id: newId }
    };
  }
};

// Updated to return ApiResponse to match what useIncomeApi.ts expects
export const updateIncome = async (id: string | number, income: IncomeFormData): Promise<ApiResponse> => {
  try {
    const response = await axios.put(`${API_URL}/api/income/${id}`, income);
    return {
      success: true,
      message: 'Income updated successfully',
      data: {
        ...response.data,
        amount: parseFloat(response.data.amount || 0) // Ensure amount is a number
      }
    };
  } catch (error) {
    console.error(`Error updating income ${id}:`, error);
    // Update dummy data and return success when API fails
    const index = DUMMY_INCOMES.findIndex(item => String(item.id) === String(id));
    if (index !== -1) {
      DUMMY_INCOMES[index] = {
        ...DUMMY_INCOMES[index],
        amount: income.amount,
        income_type_id: income.income_type_id,
        income_category_id: income.income_category_id,
        income_sub_category_id: income.income_sub_category_id,
        date: income.date,
        description: income.description,
        family_member_id: income.family_member_id
      };
    }
    
    return {
      success: true,
      message: 'Income updated successfully (offline mode)'
    };
  }
};

// Updated to return ApiResponse to match what useIncomeApi.ts expects
export const deleteIncome = async (id: string | number): Promise<ApiResponse> => {
  try {
    await axios.delete(`${API_URL}/api/income/${id}`);
    return {
      success: true,
      message: 'Income deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting income ${id}:`, error);
    // Delete from dummy data and return success when API fails
    const index = DUMMY_INCOMES.findIndex(item => String(item.id) === String(id));
    if (index !== -1) {
      DUMMY_INCOMES.splice(index, 1);
    }
    
    return {
      success: true,
      message: 'Income deleted successfully (offline mode)'
    };
  }
};

// Helper function for formatting date for display
export const formatDateForDisplay = (dateString: string): string => {
  return formatDate(dateString);
};
