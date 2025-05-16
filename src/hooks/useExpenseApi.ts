
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getAllExpenses, 
  getExpenseCategories,
  createExpense, 
  updateExpense, 
  deleteExpense,
  ExpenseItem,
  ExpenseCategory
} from '@/services/expenseService';

export const useExpenseApi = (familyMemberId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: expenses = [],
    isLoading: isLoadingExpenses,
    error: expenseError
  } = useQuery({
    queryKey: ['expenses', familyMemberId],
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

  const { 
    data: categories = [],
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: getExpenseCategories,
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

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
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

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, expense }: { id: string; expense: Partial<ExpenseItem> }) => 
      updateExpense(id, expense),
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

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
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

  // Create a map of category IDs to make category lookup easier
  const categoryMap = categories.reduce<Record<string, ExpenseCategory>>((acc, category) => {
    acc[category.id.toString()] = category;
    return acc;
  }, {});

  return {
    expenses,
    categories,
    categoryMap,
    isLoadingExpenses,
    isLoadingCategories,
    expenseError,
    createExpense: createExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
  };
};
