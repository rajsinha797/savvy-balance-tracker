
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  Expense,
  ExpenseFormData
} from '@/services/expenseService';
import { 
  getAllExpenseCategories,
  ExpenseCategory
} from '@/services/expenseCategoryService';

export const useExpenseApi = (familyMemberId?: number) => {
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

  // Get expense categories
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

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
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
    mutationFn: ({ id, data }: { id: number; data: ExpenseFormData }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
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
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
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

  return {
    expenses,
    expenseCategories,
    isLoadingExpenses,
    isLoadingCategories,
    isErrorExpenses,
    isErrorCategories,
    expensesError,
    categoriesError,
    createExpense: createExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate
  };
};
