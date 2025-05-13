
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReportsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Reports & Analytics</h2>
      
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-fintrack-text-secondary">
            Comprehensive reports and analytics features are coming soon. This section will provide detailed 
            insights into your financial patterns, spending habits, savings growth, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
