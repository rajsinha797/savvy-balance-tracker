
import React from 'react';
import { BarChart, PieChart, DollarSign, Wallet } from 'lucide-react';
import OverviewCard from '@/components/dashboard/OverviewCard';
import TransactionList from '@/components/dashboard/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data
const chartData = [
  { name: 'Jan', income: 5000, expenses: 3400 },
  { name: 'Feb', income: 4500, expenses: 3200 },
  { name: 'Mar', income: 6000, expenses: 4000 },
  { name: 'Apr', income: 5500, expenses: 3800 },
  { name: 'May', income: 5200, expenses: 3600 },
  { name: 'Jun', income: 4800, expenses: 3300 },
];

const recentTransactions = [
  { id: '1', type: 'income', amount: 2500, category: 'Salary', description: 'Monthly salary', date: '2025-05-01' },
  { id: '2', type: 'expense', amount: 80, category: 'Groceries', description: 'Weekly groceries', date: '2025-05-02' },
  { id: '3', type: 'expense', amount: 120, category: 'Utilities', description: 'Electricity bill', date: '2025-05-04' },
  { id: '4', type: 'income', amount: 300, category: 'Freelance', description: 'Website design', date: '2025-05-06' },
  { id: '5', type: 'expense', amount: 25, category: 'Subscription', description: 'Netflix', date: '2025-05-07' },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewCard 
            title="Total Balance"
            value="$8,250.00"
            trend="up"
            trendValue="12%"
            description="vs last month"
            icon={<DollarSign className="h-5 w-5 text-fintrack-purple" />}
          />
          
          <OverviewCard 
            title="Total Income"
            value="$12,450.00"
            trend="up"
            trendValue="8%"
            description="vs last month"
            icon={<DollarSign className="h-5 w-5 text-green-500" />}
          />
          
          <OverviewCard 
            title="Total Expenses"
            value="$4,200.00"
            trend="down"
            trendValue="5%"
            description="vs last month"
            icon={<Wallet className="h-5 w-5 text-red-500" />}
          />
          
          <OverviewCard 
            title="Savings Rate"
            value="33.7%"
            trend="up"
            trendValue="2.5%"
            description="vs last month"
            icon={<PieChart className="h-5 w-5 text-fintrack-purple" />}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-gradient border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
                  <XAxis dataKey="name" stroke="#8c9aae" />
                  <YAxis stroke="#8c9aae" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1F2C',
                      borderColor: '#2a2e39',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="text-sm text-fintrack-text-secondary mb-1">Income</div>
                  <div className="text-xl font-bold text-green-500">$12,450.00</div>
                </div>
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="text-sm text-fintrack-text-secondary mb-1">Expenses</div>
                  <div className="text-xl font-bold text-red-500">$4,200.00</div>
                </div>
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="text-sm text-fintrack-text-secondary mb-1">Savings</div>
                  <div className="text-xl font-bold text-fintrack-purple">$8,250.00</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-fintrack-text-secondary mb-2">Monthly Goal Progress</div>
                <div className="w-full h-2 bg-fintrack-bg-dark rounded-full overflow-hidden">
                  <div className="h-full bg-fintrack-purple" style={{ width: '67%' }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-fintrack-text-secondary">67% of Goal</span>
                  <span className="text-fintrack-text-secondary">Target: $12,500.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Rent</div>
                    <div className="text-xs text-fintrack-text-secondary">Due in 5 days</div>
                  </div>
                  <div className="text-red-500 font-medium">$1,200.00</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Internet</div>
                    <div className="text-xs text-fintrack-text-secondary">Due in 12 days</div>
                  </div>
                  <div className="text-red-500 font-medium">$89.99</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-xs text-fintrack-text-secondary">Due in 15 days</div>
                  </div>
                  <div className="text-red-500 font-medium">$45.00</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <TransactionList transactions={recentTransactions} />
    </div>
  );
};

export default Dashboard;
