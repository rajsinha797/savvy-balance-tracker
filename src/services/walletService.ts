
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Interfaces
export interface Wallet {
  id: number;
  name: string;
  amount: number;
  date?: string;
  description?: string;
  wallet_type_id?: number;
  wallet_category_id?: number;
  wallet_sub_category_id?: number;
  family_member_id?: string;
  wallet_type_name?: string;
  type_name?: string; // Adding this for backwards compatibility
  is_expense?: number;
}

export interface WalletType {
  id: number;
  name: string;
  is_expense: number;
}

export interface WalletCategoryWithTypeId {
  id: number;
  name: string;
  wallet_type_id: number;
}

export interface WalletSubCategory {
  id: number;
  name: string;
  wallet_category_id: number;
}

export interface WalletFormData {
  name: string;
  amount: number;
  wallet_type_id: number;
  wallet_category_id: number;
  wallet_sub_category_id: number;
  date?: string;
  description?: string;
  family_member_id?: string;
}

// Dummy data for fallback
const dummyWallets: Wallet[] = [
  { 
    id: 1, 
    name: 'Cash', 
    amount: 10000,
    wallet_type_id: 1,
    wallet_category_id: 1,
    wallet_sub_category_id: 1,
    date: new Date().toISOString().split('T')[0],
    type_name: 'Cash',
    wallet_type_name: 'Cash',
    is_expense: 1
  },
  { 
    id: 2, 
    name: 'Bank Account', 
    amount: 50000,
    wallet_type_id: 2,
    wallet_category_id: 2,
    wallet_sub_category_id: 2,
    date: new Date().toISOString().split('T')[0],
    type_name: 'Bank Account',
    wallet_type_name: 'Bank Account',
    is_expense: 0
  },
  { 
    id: 3, 
    name: 'Credit Card', 
    amount: 20000,
    wallet_type_id: 3,
    wallet_category_id: 3,
    wallet_sub_category_id: 3,
    date: new Date().toISOString().split('T')[0],
    type_name: 'Credit Card',
    wallet_type_name: 'Credit Card',
    is_expense: 1
  }
];

// Dummy wallet types for fallback
const dummyWalletTypes: WalletType[] = [
  { id: 1, name: 'Cash', is_expense: 1 },
  { id: 2, name: 'Bank Account', is_expense: 0 },
  { id: 3, name: 'Credit Card', is_expense: 1 },
  { id: 4, name: 'Digital Wallet', is_expense: 0 },
  { id: 5, name: 'Investment', is_expense: 0 }
];

// Dummy wallet categories for fallback
const dummyWalletCategories: WalletCategoryWithTypeId[] = [
  { id: 1, name: 'Physical Cash', wallet_type_id: 1 },
  { id: 2, name: 'Savings Account', wallet_type_id: 2 },
  { id: 3, name: 'Checking Account', wallet_type_id: 2 },
  { id: 4, name: 'Credit Card', wallet_type_id: 3 },
  { id: 5, name: 'Prepaid Card', wallet_type_id: 3 }
];

// Dummy wallet subcategories for fallback
const dummyWalletSubCategories: WalletSubCategory[] = [
  { id: 1, name: 'Wallet', wallet_category_id: 1 },
  { id: 2, name: 'Personal Savings', wallet_category_id: 2 },
  { id: 3, name: 'Joint Account', wallet_category_id: 2 },
  { id: 4, name: 'Primary Checking', wallet_category_id: 3 },
  { id: 5, name: 'Visa', wallet_category_id: 4 },
  { id: 6, name: 'Mastercard', wallet_category_id: 4 }
];

// Get all wallets
export const getAllWallets = async (familyMemberId?: string): Promise<Wallet[]> => {
  try {
    const url = familyMemberId 
      ? `${API_URL}/api/wallet?family_member_id=${familyMemberId}`
      : `${API_URL}/api/wallet`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallets:', error);
    console.log('Using dummy wallet data');
    return dummyWallets;
  }
};

// Get wallet by ID
export const getWalletById = async (id: number | string): Promise<Wallet> => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching wallet with ID ${id}:`, error);
    console.log('Using dummy wallet data');
    return dummyWallets[0];
  }
};

// Create wallet
export const createWallet = async (wallet: WalletFormData): Promise<{ success: boolean, message: string, id?: number }> => {
  try {
    const response = await axios.post(`${API_URL}/api/wallet`, wallet);
    return { 
      success: true, 
      message: 'Wallet created successfully',
      id: response.data.id
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    return {
      success: false,
      message: 'Failed to create wallet'
    };
  }
};

// Update wallet
export const updateWallet = async (id: number | string, wallet: WalletFormData): Promise<{ success: boolean, message: string }> => {
  try {
    await axios.put(`${API_URL}/api/wallet/${id}`, wallet);
    return {
      success: true,
      message: 'Wallet updated successfully'
    };
  } catch (error) {
    console.error(`Error updating wallet with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to update wallet'
    };
  }
};

// Delete wallet
export const deleteWallet = async (id: number | string): Promise<{ success: boolean, message: string }> => {
  try {
    await axios.delete(`${API_URL}/api/wallet/${id}`);
    return {
      success: true,
      message: 'Wallet deleted successfully'
    };
  } catch (error) {
    console.error(`Error deleting wallet with ID ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete wallet'
    };
  }
};

// Get all wallet types
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

// Get wallet categories by type ID
export const getWalletCategoriesByTypeId = async (typeId: number): Promise<WalletCategoryWithTypeId[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/categories/by-type/${typeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching wallet categories for type ID ${typeId}:`, error);
    // Filter dummy categories by type ID for fallback
    return dummyWalletCategories.filter(category => category.wallet_type_id === typeId);
  }
};

// Get wallet subcategories by category ID
export const getWalletSubCategoriesByCategoryId = async (categoryId: number): Promise<WalletSubCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/subcategories/by-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching wallet subcategories for category ID ${categoryId}:`, error);
    // Filter dummy subcategories by category ID for fallback
    return dummyWalletSubCategories.filter(subcategory => subcategory.wallet_category_id === categoryId);
  }
};

// Get available wallets for selections in forms
export const getAvailableWallets = async (): Promise<Wallet[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/available`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available wallets:', error);
    console.log('Using dummy wallet data');
    return dummyWallets;
  }
};
