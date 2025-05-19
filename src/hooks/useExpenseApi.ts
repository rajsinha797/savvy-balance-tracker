
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ExpenseItem, 
  ExpenseCategory,
  ExpenseType,
  ExpenseSubCategory,
  getAllExpenses, 
  getExpenseCategories,
  getAllExpenseTypes,
  getExpenseCategoriesByType,
  getExpenseSubcategoriesByCategory,
  addExpense, 
  updateExpense, 
  deleteExpense,
  ExpenseFormData
} from '@/services/expenseService';
import { useToast } from "@/hooks/use-toast";

export const useExpenseApi = (familyMemberId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for fetching expenses
  const { 
    data: expenses = [], 
    isLoading: isExpensesLoading,
    isError: isExpensesError,
    refetch: refetchExpenses
  } = useQuery({
    queryKey: ['expenses', familyMemberId],
    queryFn: () => getAllExpenses(familyMemberId),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching expenses:', error);
        toast({
          title: "Error",
          description: "Failed to load expense data. Using demo data instead.",
          variant: "destructive",
        });
      }
    }
  });

  // Query for fetching expense categories
  const {
    data: expenseCategories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError
  } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: getExpenseCategories,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching expense categories:', error);
        toast({
          title: "Error",
          description: "Failed to load expense categories. Using demo categories instead.",
          variant: "destructive",
        });
      }
    }
  });

  // Query for fetching expense types
  const {
    data: expenseTypes = [],
    isLoading: isExpenseTypesLoading,
    isError: isExpenseTypesError
  } = useQuery({
    queryKey: ['expenseTypes'],
    queryFn: getAllExpenseTypes,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching expense types:', error);
        toast({
          title: "Error",
          description: "Failed to load expense types. Using demo types instead.",
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

  // Mutation for adding expense
  const addExpenseMutation = useMutation({
    mutationFn: (newExpenseData: ExpenseFormData) => addExpense(newExpenseData),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        
        toast({
          title: "Success",
          description: result.message || "Expense added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add expense",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding expense",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating expense
  const updateExpenseMutation = useMutation({
    mutationFn: (params: { id: string | number; expense: ExpenseFormData }) => 
      updateExpense(params.id, params.expense),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating expense",
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting expense
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string | number) => deleteExpense(id),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting expense",
        variant: "destructive",
      });
    }
  });

  const isLoading = isExpensesLoading || isCategoriesLoading || isExpenseTypesLoading;
  const isError = isExpensesError || isCategoriesError || isExpenseTypesError;
  const isApiAvailable = Array.isArray(expenses) && expenses.length > 0 || 
                         Array.isArray(expenseCategories) && expenseCategories.length > 0 ||
                         Array.isArray(expenseTypes) && expenseTypes.length > 0;

  return {
    expenses: Array.isArray(expenses) ? expenses : [],
    expenseCategories: Array.isArray(expenseCategories) ? expenseCategories : [],
    expenseTypes: Array.isArray(expenseTypes) ? expenseTypes : [],
    getExpenseCategoriesByType: getExpenseCategoriesByTypeId,
    getExpenseSubCategoriesByCategory: getExpenseSubCategoriesByCategoryId,
    getExpenseSubCategoriesByCategoryId, // Added for backwards compatibility
    isLoading,
    isError,
    isApiAvailable,
    createExpense: addExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    refreshData: refetchExpenses
  };
};
