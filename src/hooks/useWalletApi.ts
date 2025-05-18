
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  getAllWallets,
  getWalletById,
  createWallet,
  updateWallet,
  deleteWallet,
  Wallet,
  WalletFormData,
  WalletType,
  WalletCategoryWithTypeId,
  WalletSubCategory,
  getAllWalletTypes,
  getWalletCategoriesByTypeId,
  getWalletSubCategoriesByCategoryId,
  getAvailableWallets
} from '@/services/walletService';

export const useWalletApi = (familyMemberId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all wallets
  const { 
    data: wallets = [],
    isLoading: isLoadingWallets,
    isError: isErrorWallets,
    error: walletsError
  } = useQuery({
    queryKey: familyMemberId ? ['wallets', familyMemberId] : ['wallets'],
    queryFn: () => getAllWallets(familyMemberId),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching wallets:', error);
        toast({
          title: "Error",
          description: "Failed to load wallets. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Get wallet types
  const {
    data: walletTypes = [],
    isLoading: isLoadingWalletTypes,
    isError: isErrorWalletTypes
  } = useQuery({
    queryKey: ['walletTypes'],
    queryFn: getAllWalletTypes,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching wallet types:', error);
        toast({
          title: "Error",
          description: "Failed to load wallet types. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Get available wallets for dropdown selection
  const {
    data: availableWallets = [],
    isLoading: isLoadingAvailableWallets,
    isError: isErrorAvailableWallets
  } = useQuery({
    queryKey: ['availableWallets'],
    queryFn: getAvailableWallets,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching available wallets:', error);
        toast({
          title: "Error",
          description: "Failed to load available wallets. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Function to fetch wallet categories based on type
  const getWalletCategoriesByType = async (typeId: number) => {
    try {
      return await getWalletCategoriesByTypeId(typeId);
    } catch (error) {
      console.error(`Error fetching wallet categories for type ${typeId}:`, error);
      toast({
        title: "Error",
        description: `Failed to load wallet categories for type ${typeId}.`,
        variant: "destructive",
      });
      return [];
    }
  };

  // Function to fetch wallet subcategories based on category
  const getWalletSubCategoriesByCategory = async (categoryId: number) => {
    try {
      return await getWalletSubCategoriesByCategoryId(categoryId);
    } catch (error) {
      console.error(`Error fetching wallet subcategories for category ${categoryId}:`, error);
      toast({
        title: "Error",
        description: `Failed to load wallet subcategories for category ${categoryId}.`,
        variant: "destructive",
      });
      return [];
    }
  };

  // Create wallet mutation
  const createWalletMutation = useMutation({
    mutationFn: (data: WalletFormData) => {
      return createWallet(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['availableWallets'] });
      toast({
        title: "Success",
        description: "Wallet added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding wallet:', error);
      toast({
        title: "Error",
        description: "Failed to add wallet. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update wallet mutation
  const updateWalletMutation = useMutation({
    mutationFn: ({ id, wallet }: { id: string | number; wallet: WalletFormData }) => updateWallet(id, wallet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['availableWallets'] });
      toast({
        title: "Success",
        description: "Wallet updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating wallet:', error);
      toast({
        title: "Error",
        description: "Failed to update wallet. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete wallet mutation
  const deleteWalletMutation = useMutation({
    mutationFn: (id: string | number) => deleteWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['availableWallets'] });
      toast({
        title: "Success",
        description: "Wallet deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting wallet:', error);
      toast({
        title: "Error",
        description: "Failed to delete wallet. Please try again.",
        variant: "destructive",
      });
    }
  });

  const isLoading = isLoadingWallets || isLoadingWalletTypes || isLoadingAvailableWallets;
  const isError = isErrorWallets || isErrorWalletTypes || isErrorAvailableWallets;

  return {
    wallets,
    walletTypes,
    availableWallets,
    getWalletCategoriesByType,
    getWalletSubCategoriesByCategory,
    isLoadingWallets,
    isLoadingWalletTypes,
    isErrorWallets,
    isErrorWalletTypes,
    walletsError,
    isLoading,
    isError,
    createWallet: createWalletMutation.mutate,
    updateWallet: updateWalletMutation.mutate,
    deleteWallet: deleteWalletMutation.mutate
  };
};
