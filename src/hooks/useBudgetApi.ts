
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  getAllBudgetPeriods,
  getBudgetPeriod,
  createBudgetPeriod,
  updateBudgetPeriod,
  deleteBudgetPeriod,
  addBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  BudgetPeriod,
  BudgetCategory
} from '@/services/budgetService';

export const useBudgetApi = (activeBudgetId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for all budget periods
  const { 
    data: budgetPeriods = [],
    isLoading: isLoadingPeriods
  } = useQuery({
    queryKey: ['budgetPeriods'],
    queryFn: getAllBudgetPeriods,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching budget periods:', error);
        toast({
          title: "Error",
          description: "Failed to load budget periods. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Query for specific budget period if ID is provided
  const {
    data: activeBudget,
    isLoading: isLoadingActiveBudget
  } = useQuery({
    queryKey: ['budget', activeBudgetId],
    queryFn: () => getBudgetPeriod(activeBudgetId!),
    enabled: !!activeBudgetId,
    meta: {
      onError: (error: Error) => {
        console.error(`Error fetching budget period ${activeBudgetId}:`, error);
        toast({
          title: "Error",
          description: "Failed to load budget details. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Create new budget period
  const createBudgetMutation = useMutation({
    mutationFn: createBudgetPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods'] });
      toast({
        title: "Success",
        description: "Budget period created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating budget period:', error);
      toast({
        title: "Error",
        description: "Failed to create budget period. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update existing budget period
  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetPeriod> }) => 
      updateBudgetPeriod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods'] });
      queryClient.invalidateQueries({ queryKey: ['budget', activeBudgetId] });
      toast({
        title: "Success",
        description: "Budget period updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating budget period:', error);
      toast({
        title: "Error",
        description: "Failed to update budget period. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete budget period
  const deleteBudgetMutation = useMutation({
    mutationFn: deleteBudgetPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods'] });
      toast({
        title: "Success",
        description: "Budget period deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting budget period:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget period. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add category to budget
  const addCategoryMutation = useMutation({
    mutationFn: ({ budgetId, category }: { 
      budgetId: string; 
      category: Omit<BudgetCategory, 'id' | 'spent' | 'remaining' | 'percentageUsed'> 
    }) => addBudgetCategory(budgetId, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', activeBudgetId] });
      toast({
        title: "Success",
        description: "Budget category added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding budget category:', error);
      toast({
        title: "Error",
        description: "Failed to add budget category. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update category in budget
  const updateCategoryMutation = useMutation({
    mutationFn: ({ 
      budgetId, 
      categoryId, 
      data 
    }: { 
      budgetId: string; 
      categoryId: string; 
      data: Partial<BudgetCategory> 
    }) => updateBudgetCategory(budgetId, categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', activeBudgetId] });
      toast({
        title: "Success",
        description: "Budget category updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating budget category:', error);
      toast({
        title: "Error",
        description: "Failed to update budget category. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete category from budget
  const deleteCategoryMutation = useMutation({
    mutationFn: ({ budgetId, categoryId }: { budgetId: string; categoryId: string }) => 
      deleteBudgetCategory(budgetId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', activeBudgetId] });
      toast({
        title: "Success",
        description: "Budget category deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting budget category:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget category. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    budgetPeriods,
    activeBudget,
    isLoadingPeriods,
    isLoadingActiveBudget,
    createBudget: createBudgetMutation.mutate,
    updateBudget: updateBudgetMutation.mutate,
    deleteBudget: deleteBudgetMutation.mutate,
    addCategory: addCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate
  };
};
