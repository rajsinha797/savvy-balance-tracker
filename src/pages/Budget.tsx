
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BudgetPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Budget Planning</h2>
      
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-fintrack-text-secondary">
            Budget planning and tracking features are coming soon. This section will help you set monthly budgets, 
            track your spending against those budgets, and receive notifications when you're approaching your limits.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetPage;
