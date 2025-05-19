
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  ExpenseItem,
  ExpenseFormData,
  ExpenseType,
  ExpenseCategoryWithTypeId,
  ExpenseSubCategory,
  getAllExpenseTypes,
  getExpenseCategoriesByType,
  getExpenseSubcategoriesByCategory
} from '@/services/expenseService';
import { 
  getAllExpenseCategories,
  ExpenseCategory
} from '@/services/expenseCategoryService';

export const useExpenseApi = (familyMemberId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all expenses
  const { 
    data: expenses = [],
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
    error: expensesError
  } = useQuery({
    queryKey: familyMemberId ? ['expenses', familyMemberId] : ['expenses'],
    queryFn: () => getAllExpenses(familyMemberId),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching expenses:', error);
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Get expense categories (legacy)
  const {
    data: expenseCategories = [],
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: getAllExpenseCategories,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching expense categories:', error);
        toast({
          title: "Error",
          description: "Failed to load expense categories. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Get expense types (new)
  const {
    data: expenseTypes = [],
    isLoading: isLoadingExpenseTypes,
    isError: isErrorExpenseTypes
  } = useQuery({
    queryKey: ['expenseTypes'],
    queryFn: getAllExpenseTypes,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching expense types:', error);
        toast({
          title: "Error",
          description: "Failed to load expense types. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Function to fetch expense categories based on type
  const getExpenseCategoriesByTypeId = async (typeId: number) => {
    try {
      return await getExpenseCategoriesByType(typeId);
    } catch (error) {
      console.error(`Error fetching expense categories for type ${typeId}:`, error);
      toast({
        title: "Error",
        description: `Failed to load expense categories for type ${typeId}.`,
        variant: "destructive",
      });
      return [];
    }
  };

  // Function to fetch expense subcategories based on category
  const getExpenseSubCategoriesByCategoryId = async (categoryId: number) => {
    try {
      return await getExpenseSubcategoriesByCategory(categoryId);
    } catch (error) {
      console.error(`Error fetching expense subcategories for category ${categoryId}:`, error);
      toast({
        title: "Error",
        description: `Failed to load expense subcategories for category ${categoryId}.`,
        variant: "destructive",
      });
      return [];
    }
  };

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => {
      // Invalidate budget queries as well when creating an expense
      return createExpense(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // Also invalidate budget queries to refresh the budget data
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: (params: { id: string | number; expense: ExpenseFormData }) => updateExpense(params.id, params.expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // Also invalidate budget queries to refresh the budget data
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string | number) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // Also invalidate budget queries to refresh the budget data
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    }
  });

  const isLoading = isLoadingExpenses || isLoadingCategories || isLoadingExpenseTypes;
  const isError = isErrorExpenses || isErrorCategories || isErrorExpenseTypes;

  return {
    expenses,
    expenseCategories, // legacy
    expenseTypes, // new
    getExpenseCategoriesByType: getExpenseCategoriesByTypeId,
    getExpenseSubcategoriesByCategory: getExpenseSubCategoriesByCategoryId,
    getExpenseCategoriesByTypeId, // Alias for compatibility
    getExpenseSubCategoriesByCategoryId, // Alias for compatibility
    isLoadingExpenses,
    isLoadingCategories,
    isLoadingExpenseTypes,
    isErrorExpenses,
    isErrorCategories,
    isErrorExpenseTypes,
    expensesError,
    categoriesError,
    isLoading,
    isError,
    createExpense: createExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate
  };
};
