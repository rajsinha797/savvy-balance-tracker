
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  IncomeItem, 
  IncomeCategory,
  IncomeType,
  IncomeCategoryWithTypeId,
  IncomeSubCategory,
  getAllIncome, 
  getIncomeCategories,
  getAllIncomeTypes,
  getIncomeCategoriesByType,
  getIncomeSubcategoriesByCategory,
  addIncome, 
  updateIncome, 
  deleteIncome,
  IncomeFormData
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
    queryFn: () => getAllIncome(familyMemberId),
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

  // Query for fetching categories (legacy)
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

  // Query for fetching income types
  const {
    data: incomeTypes = [],
    isLoading: isIncomeTypesLoading,
    isError: isIncomeTypesError
  } = useQuery({
    queryKey: ['incomeTypes'],
    queryFn: getAllIncomeTypes,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching income types:', error);
        toast({
          title: "Error",
          description: "Failed to load income types. Using demo types instead.",
          variant: "destructive",
        });
      }
    }
  });

  // Function to fetch income categories based on type
  const getIncomeCategoriesByTypeId = async (typeId: number) => {
    try {
      return await getIncomeCategoriesByType(typeId);
    } catch (error) {
      console.error(`Error fetching income categories for type ${typeId}:`, error);
      toast({
        title: "Error",
        description: `Failed to load income categories for type ${typeId}.`,
        variant: "destructive",
      });
      return [];
    }
  };

  // Function to fetch income subcategories based on category
  const getIncomeSubCategoriesByCategoryId = async (categoryId: number) => {
    try {
      return await getIncomeSubcategoriesByCategory(categoryId);
    } catch (error) {
      console.error(`Error fetching income subcategories for category ${categoryId}:`, error);
      toast({
        title: "Error",
        description: `Failed to load income subcategories for category ${categoryId}.`,
        variant: "destructive",
      });
      return [];
    }
  };

  // Mutation for adding income
  const addIncomeMutation = useMutation({
    mutationFn: (newIncomeData: IncomeFormData) => addIncome(newIncomeData),
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
    mutationFn: (params: { id: string | number; incomeData: IncomeFormData }) => 
      updateIncome(params.id, params.incomeData),
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
    mutationFn: (id: string | number) => deleteIncome(id),
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

  const isLoading = isIncomesLoading || isCategoriesLoading || isIncomeTypesLoading;
  const isError = isIncomesError || isCategoriesError || isIncomeTypesError;
  const isApiAvailable = Array.isArray(incomes) && incomes.length > 0 || 
                         Array.isArray(categories) && categories.length > 0 ||
                         Array.isArray(incomeTypes) && incomeTypes.length > 0;

  return {
    incomes: Array.isArray(incomes) ? incomes : [],
    categories: Array.isArray(categories) ? categories : [], // Legacy
    incomeTypes: Array.isArray(incomeTypes) ? incomeTypes : [],
    getIncomeCategoriesByType,
    getIncomeSubcategoriesByCategory,
    getIncomeCategoriesByTypeId, // Alias for compatibility
    getIncomeSubCategoriesByCategoryId, // Alias for compatibility
    isLoading,
    isError,
    isApiAvailable,
    addIncome: addIncomeMutation.mutate,
    updateIncome: updateIncomeMutation.mutate,
    deleteIncome: deleteIncomeMutation.mutate,
    refreshData: refetchIncomes
  };
};
