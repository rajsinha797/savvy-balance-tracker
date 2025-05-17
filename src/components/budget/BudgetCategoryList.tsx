
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";
import { BudgetCategory } from "@/services/budgetService";

interface BudgetCategoryListProps {
  categories: BudgetCategory[];
  isLoading: boolean;
  onDeleteCategory: (id: string) => void;
}

const BudgetCategoryList: React.FC<BudgetCategoryListProps> = ({ categories, isLoading, onDeleteCategory }) => {
  // Sort categories by spent percentage (highest to lowest)
  const sortedCategories = [...categories].sort((a, b) => b.percentageUsed - a.percentageUsed);
  
  return (
    <Card className="card-gradient border-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Budget Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedCategories.length === 0 ? (
              <p className="text-center text-fintrack-text-secondary py-6">
                No budget categories found. Add a category to get started.
              </p>
            ) : (
              sortedCategories.map(category => (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{category.category}</h3>
                      <p className="text-sm text-fintrack-text-secondary">
                        ₹{category.spent.toFixed(2)} of ₹{category.allocated.toFixed(2)} 
                        ({category.percentageUsed.toFixed(0)}%)
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDeleteCategory(category.id)}
                      className="text-fintrack-text-secondary hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Progress 
                    value={Math.min(category.percentageUsed, 100)} 
                    className="h-2"
                    // Change color based on percentage used
                    indicatorClassName={
                      category.percentageUsed >= 90 ? "bg-red-500" :
                      category.percentageUsed >= 75 ? "bg-amber-500" :
                      "bg-green-500"
                    }
                  />
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetCategoryList;
