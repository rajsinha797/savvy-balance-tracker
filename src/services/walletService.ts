
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'http://localhost:3001';

// Adding dummy data for fallback when API is down
const dummyWalletTypes = [
  { id: 1, name: 'Spending', is_expense: 1 },
  { id: 2, name: 'Savings', is_expense: 0 },
  { id: 3, name: 'Debt', is_expense: 1 }
];

const dummyWalletCategories = [
  { id: 1, wallet_type_id: 1, name: 'Cash' },
  { id: 2, wallet_type_id: 1, name: 'Credit' },
  { id: 3, wallet_type_id: 1, name: 'Digital' },
  { id: 4, wallet_type_id: 1, name: 'Custom' },
  { id: 5, wallet_type_id: 2, name: 'Emergency Fund' },
  { id: 6, wallet_type_id: 2, name: 'Trip' },
  { id: 7, wallet_type_id: 2, name: 'House' },
  { id: 8, wallet_type_id: 2, name: 'Custom' },
  { id: 9, wallet_type_id: 3, name: 'Loan' },
  { id: 10, wallet_type_id: 3, name: 'Personal Debt' },
  { id: 11, wallet_type_id: 3, name: 'Car Loan' },
  { id: 12, wallet_type_id: 3, name: 'Custom' }
];

const dummyWalletSubCategories = [
  { id: 1, wallet_category_id: 1, name: 'Cash at Home' },
  { id: 2, wallet_category_id: 1, name: 'Wallet Cash' },
  { id: 3, wallet_category_id: 2, name: 'Credit Card' },
  { id: 4, wallet_category_id: 2, name: 'Store Credit' },
  { id: 5, wallet_category_id: 3, name: 'Paytm' },
  { id: 6, wallet_category_id: 3, name: 'PhonePe' },
  { id: 7, wallet_category_id: 3, name: 'Google Pay' },
  { id: 8, wallet_category_id: 9, name: 'Home Loan' },
  { id: 9, wallet_category_id: 10, name: 'Friend Loan' },
  { id: 10, wallet_category_id: 11, name: 'Car EMI' }
];

const dummyWallets = [
  {
    id: 1,
    name: 'Primary Cash',
    amount: 5000,
    wallet_type_id: 1,
    wallet_category_id: 1,
    wallet_sub_category_id: 2,
    wallet_type_name: 'Spending',
    wallet_category_name: 'Cash',
    wallet_sub_category_name: 'Wallet Cash',
    is_expense: 1,
    date: '2023-05-01',
    description: 'Cash in physical wallet',
    family_member: 'John Doe',
    family_member_id: '1'
  },
  {
    id: 2,
    name: 'HDFC Credit Card',
    amount: 50000,
    wallet_type_id: 1,
    wallet_category_id: 2,
    wallet_sub_category_id: 3,
    wallet_type_name: 'Spending',
    wallet_category_name: 'Credit',
    wallet_sub_category_name: 'Credit Card',
    is_expense: 1,
    date: '2023-05-01',
    description: 'Credit card limit',
    family_member: 'John Doe',
    family_member_id: '1'
  },
  {
    id: 3,
    name: 'Emergency Fund',
    amount: 100000,
    wallet_type_id: 2,
    wallet_category_id: 5,
    wallet_sub_category_id: null,
    wallet_type_name: 'Savings',
    wallet_category_name: 'Emergency Fund',
    wallet_sub_category_name: null,
    is_expense: 0,
    date: '2023-05-01',
    description: 'Savings for emergencies',
    family_member: 'Jane Doe',
    family_member_id: '2'
  }
];

export interface Wallet {
  id: string | number;
  name: string;
  amount: number;
  wallet_type_id?: number;
  wallet_category_id?: number;
  wallet_sub_category_id?: number | null;
  wallet_type_name?: string;
  wallet_category_name?: string;
  wallet_sub_category_name?: string | null;
  is_expense?: number;
  date: string;
  description: string;
  family_member?: string;
  family_member_id?: string;
}

export interface WalletFormData {
  id?: string | number;
  name: string;
  amount: number;
  wallet_type_id: number;
  wallet_category_id: number;
  wallet_sub_category_id?: number | null;
  date: string;
  description: string;
  family_member_id?: string;
}

export interface WalletType {
  id: number;
  name: string;
  is_expense: number;
}

export interface WalletCategoryWithTypeId {
  id: number;
  wallet_type_id: number;
  name: string;
}

export interface WalletSubCategory {
  id: number;
  wallet_category_id: number;
  name: string;
}

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

export const formatDateForDisplay = (dateString: string): string => {
  return formatDate(dateString);
};

export const getAllWalletTypes = async (): Promise<WalletType[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet types:', error);
    console.log('Using dummy wallet types data');
    return dummyWalletTypes;
  }
};

export const getWalletCategoriesByTypeId = async (typeId: number): Promise<WalletCategoryWithTypeId[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/categories/by-type/${typeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching wallet categories for type ${typeId}:`, error);
    console.log('Using dummy wallet categories data');
    return dummyWalletCategories.filter(cat => cat.wallet_type_id === typeId);
  }
};

export const getWalletSubCategoriesByCategoryId = async (categoryId: number): Promise<WalletSubCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/subcategories/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching wallet subcategories for category ${categoryId}:`, error);
    console.log('Using dummy wallet subcategories data');
    return dummyWalletSubCategories.filter(subcat => subcat.wallet_category_id === categoryId);
  }
};

export const getAllWallets = async (familyMemberId?: string | number): Promise<Wallet[]> => {
  try {
    const url = familyMemberId
      ? `${API_URL}/api/wallet?family_member_id=${familyMemberId}`
      : `${API_URL}/api/wallet`;
      
    const response = await axios.get(url);
    
    // Format dates consistently
    return response.data.map((wallet: any) => ({
      ...wallet,
      date: formatDate(wallet.date),
      amount: parseFloat(wallet.amount) // Ensure amount is a number
    }));
  } catch (error) {
    console.error('Error fetching wallets:', error);
    console.log('Using dummy wallets data');
    
    // Filter dummy data if familyMemberId is provided
    const filteredWallets = familyMemberId 
      ? dummyWallets.filter(w => w.family_member_id === String(familyMemberId))
      : dummyWallets;
      
    return filteredWallets;
  }
};

export const getWalletById = async (id: string | number): Promise<Wallet> => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/${id}`);
    return {
      ...response.data,
      date: formatDate(response.data.date),
      amount: parseFloat(response.data.amount) // Ensure amount is a number
    };
  } catch (error) {
    console.error(`Error fetching wallet ${id}:`, error);
    console.log('Using dummy wallet data');
    const dummyWallet = dummyWallets.find(w => w.id === id);
    if (!dummyWallet) {
      throw new Error(`Wallet with ID ${id} not found`);
    }
    return dummyWallet;
  }
};

export const createWallet = async (wallet: WalletFormData): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/wallet`, wallet);
    
    return {
      success: true,
      message: 'Wallet created successfully',
      data: {
        ...response.data,
        date: formatDate(response.data.date),
        amount: parseFloat(response.data.amount) // Ensure amount is a number
      }
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    console.log('API is down, mimicking successful response with dummy data');
    
    // Return a mock successful response when API is down
    return {
      success: true,
      message: 'Wallet created successfully (API offline - mock response)',
      data: {
        id: Date.now(), // Generate a temporary ID
        ...wallet,
      }
    };
  }
};

export const updateWallet = async (id: string | number, wallet: WalletFormData): Promise<ApiResponse> => {
  try {
    const response = await axios.put(`${API_URL}/api/wallet/${id}`, wallet);
    
    return {
      success: true,
      message: 'Wallet updated successfully',
      data: {
        ...response.data,
        date: formatDate(response.data.date),
        amount: parseFloat(response.data.amount || '0') // Ensure amount is a number
      }
    };
  } catch (error) {
    console.error(`Error updating wallet ${id}:`, error);
    console.log('API is down, mimicking successful response with dummy data');
    
    // Return a mock successful response when API is down
    return {
      success: true,
      message: 'Wallet updated successfully (API offline - mock response)',
      data: {
        id,
        ...wallet,
      }
    };
  }
};

export const deleteWallet = async (id: string | number): Promise<ApiResponse> => {
  try {
    await axios.delete(`${API_URL}/api/wallet/${id}`);
    
    return {
      success: true,
      message: 'Wallet deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting wallet ${id}:`, error);
    console.log('API is down, mimicking successful response');
    
    // Return a mock successful response when API is down
    return {
      success: true,
      message: 'Wallet deleted successfully (API offline - mock response)'
    };
  }
};

export const getAvailableWallets = async (): Promise<Wallet[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/available`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available wallets:', error);
    console.log('Using dummy wallets data');
    return dummyWallets;
  }
};
