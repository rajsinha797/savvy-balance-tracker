
import { useState, useEffect, useCallback } from 'react';
import { 
  IncomeItem, 
  IncomeCategory,
  getAllIncomes, 
  getIncomeCategories, 
  addIncome, 
  updateIncome, 
  deleteIncome 
} from '@/services/incomeService';
import { useToast } from "@/hooks/use-toast";

export const useIncomeApi = () => {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load income categories
      const categoriesData = await getIncomeCategories();
      setCategories(categoriesData);
      
      // Load income data
      const incomesData = await getAllIncomes();
      setIncomes(incomesData);
      
      // If we got here without error, API is available
      setIsApiAvailable(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsApiAvailable(false);
      toast({
        title: "API Error",
        description: "Could not connect to API server. Using demo data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add income
  const addIncomeItem = async (newIncomeData: {
    amount: number;
    category_id: number;
    description: string;
    date: string;
  }) => {
    try {
      const result = await addIncome(newIncomeData);
      
      if (result.success) {
        await loadData(); // Refresh the data
        
        toast({
          title: "Success",
          description: result.message || "Income added successfully",
        });
        
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add income",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update income
  const updateIncomeItem = async (id: string, incomeData: {
    amount: number;
    category_id: number;
    description: string;
    date: string;
  }) => {
    try {
      const result = await updateIncome(id, incomeData);
      
      if (result.success) {
        await loadData(); // Refresh the data
        
        toast({
          title: "Success",
          description: result.message,
        });
        
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating income:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete income
  const deleteIncomeItem = async (id: string) => {
    try {
      const result = await deleteIncome(id);
      
      if (result.success) {
        await loadData(); // Refresh the data
        
        toast({
          title: "Success",
          description: result.message,
        });
        
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get API status
  const refreshData = () => {
    return loadData();
  };

  return {
    incomes,
    categories,
    isLoading,
    isApiAvailable,
    addIncomeItem,
    updateIncomeItem,
    deleteIncomeItem,
    refreshData
  };
};
