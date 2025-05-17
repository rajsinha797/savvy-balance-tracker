
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Income,
  IncomeItem, 
  IncomeCategory,
  getAllIncomes, 
  getIncomeCategories, 
  addIncome, 
  updateIncome, 
  deleteIncome 
} from '@/services/incomeService';
import { useToast } from "@/components/ui/use-toast";

export const useIncomeApi = (familyMemberId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for fetching incomes
  const { 
    data: incomes = [], 
    isLoading: isIncomesLoading,
    isError: isIncomesError,
    refetch: refetchIncomes
  } = useQuery({
    queryKey: ['incomes', familyMemberId],
    queryFn: () => getAllIncomes(familyMemberId),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching incomes:', error);
        toast({
          title: "Error",
          description: "Failed to load income data. Using demo data instead.",
          variant: "destructive",
        });
      }
    }
  });

  // Query for fetching categories
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError
  } = useQuery({
    queryKey: ['incomeCategories'],
    queryFn: getIncomeCategories,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching income categories:', error);
        toast({
          title: "Error",
          description: "Failed to load income categories. Using demo categories instead.",
          variant: "destructive",
        });
      }
    }
  });

  // Mutation for adding income
  const addIncomeMutation = useMutation({
    mutationFn: (newIncomeData: {
      amount: number;
      category_id: number;
      description: string;
      date: string;
      family_member_id?: string;
    }) => addIncome(newIncomeData),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['incomes'] });
        
        toast({
          title: "Success",
          description: result.message || "Income added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add income",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error adding income:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding income",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating income
  const updateIncomeMutation = useMutation({
    mutationFn: ({id, incomeData}: {
      id: string; 
      incomeData: {
        amount: number;
        category_id: number;
        description: string;
        date: string;
        family_member_id?: string;
      }
    }) => updateIncome(id, incomeData),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['incomes'] });
        
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
      console.error('Error updating income:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating income",
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting income
  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => deleteIncome(id),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['incomes'] });
        
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
      console.error('Error deleting income:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting income",
        variant: "destructive",
      });
    }
  });

  const isLoading = isIncomesLoading || isCategoriesLoading;
  const isError = isIncomesError || isCategoriesError;
  const isApiAvailable = Array.isArray(incomes) && incomes.length > 0 || Array.isArray(categories) && categories.length > 0;

  return {
    incomes: Array.isArray(incomes) ? incomes : [],
    categories: Array.isArray(categories) ? categories : [],
    isLoading,
    isError,
    isApiAvailable,
    addIncome: addIncomeMutation.mutate,
    updateIncome: updateIncomeMutation.mutate,
    deleteIncome: deleteIncomeMutation.mutate,
    refreshData: refetchIncomes
  };
};
