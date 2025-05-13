
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, BarStack } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartPie, BarChart3, CalendarRange, IndianRupee, ArrowUpDown } from 'lucide-react';

// Mock data for expense by category
const expenseByCategory = [
  { name: 'Housing', value: 1500, color: '#9b87f5' },
  { name: 'Food', value: 650, color: '#6E59A5' },
  { name: 'Transportation', value: 380, color: '#1EAEDB' },
  { name: 'Utilities', value: 480, color: '#33C3F0' },
  { name: 'Entertainment', value: 320, color: '#7E69AB' },
  { name: 'Health', value: 250, color: '#E5DEFF' },
  { name: 'Other', value: 420, color: '#ea384c' },
];

// Mock data for monthly comparison
const monthlyComparisonData = [
  {
    name: 'Jan',
    income: 5000,
    expenses: 3400,
    savings: 1600,
  },
  {
    name: 'Feb',
    income: 5200,
    expenses: 3100,
    savings: 2100,
  },
  {
    name: 'Mar',
    income: 6000,
    expenses: 3800,
    savings: 2200,
  },
  {
    name: 'Apr',
    income: 5500,
    expenses: 3600,
    savings: 1900,
  },
  {
    name: 'May',
    income: 5800,
    expenses: 3400,
    savings: 2400,
  },
  {
    name: 'Jun',
    income: 5900,
    expenses: 3500,
    savings: 2400,
  },
];

// Mock data for income sources
const incomeSourcesData = [
  { name: 'Salary', value: 4800, color: '#10B981' },
  { name: 'Freelance', value: 800, color: '#34D399' },
  { name: 'Interest', value: 200, color: '#6EE7B7' },
  { name: 'Investments', value: 100, color: '#A7F3D0' },
];

// Mock data for spending trends
const spendingTrendsData = [
  {
    name: 'Week 1',
    Housing: 350,
    Food: 180,
    Transport: 90,
    Entertainment: 70,
    Utilities: 120,
    Other: 100,
  },
  {
    name: 'Week 2',
    Housing: 350,
    Food: 165,
    Transport: 85,
    Entertainment: 90,
    Utilities: 110,
    Other: 90,
  },
  {
    name: 'Week 3',
    Housing: 350,
    Food: 190,
    Transport: 100,
    Entertainment: 75,
    Utilities: 130,
    Other: 110,
  },
  {
    name: 'Week 4',
    Housing: 350,
    Food: 170,
    Transport: 95,
    Entertainment: 85,
    Utilities: 120,
    Other: 120,
  },
];

const spendingColors = {
  Housing: '#9b87f5',
  Food: '#6E59A5',
  Transport: '#1EAEDB',
  Entertainment: '#33C3F0',
  Utilities: '#7E69AB',
  Other: '#D6BCFA',
};

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-fintrack-text-secondary">Time Range:</span>
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] bg-fintrack-bg-dark border-fintrack-bg-dark">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-fintrack-bg-dark mb-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-fintrack-purple/20">
            <ChartPie className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="income" className="data-[state=active]:bg-fintrack-purple/20">
            <IndianRupee className="h-4 w-4 mr-2" /> Income
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-fintrack-purple/20">
            <ArrowUpDown className="h-4 w-4 mr-2" /> Expenses
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-fintrack-purple/20">
            <BarChart3 className="h-4 w-4 mr-2" /> Trends
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyComparisonData}>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1F2C',
                          borderColor: '#2a2e39',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`₹${value}`, '']}
                      />
                      <Legend />
                      <BarStack 
                        keys={['income', 'expenses', 'savings']}
                        colors={['#10B981', '#EF4444', '#9b87f5']}
                        labels={['Income', 'Expenses', 'Savings']}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1F2C',
                          borderColor: '#2a2e39',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`₹${value}`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Financial Health Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="text-sm text-fintrack-text-secondary mb-1">Savings Rate</div>
                  <div className="text-xl font-bold text-fintrack-purple">41.5%</div>
                  <div className="text-xs text-green-500 flex items-center mt-1">
                    <span>↑ 4.2% vs last month</span>
                  </div>
                </div>
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="text-sm text-fintrack-text-secondary mb-1">Income Growth</div>
                  <div className="text-xl font-bold text-green-500">8.3%</div>
                  <div className="text-xs text-green-500 flex items-center mt-1">
                    <span>↑ 1.5% vs last month</span>
                  </div>
                </div>
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="text-sm text-fintrack-text-secondary mb-1">Budget Adherence</div>
                  <div className="text-xl font-bold text-green-500">92%</div>
                  <div className="text-xs text-green-500 flex items-center mt-1">
                    <span>↑ 3% vs last month</span>
                  </div>
                </div>
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="text-sm text-fintrack-text-secondary mb-1">Debt-to-Income</div>
                  <div className="text-xl font-bold text-fintrack-purple">18.2%</div>
                  <div className="text-xs text-green-500 flex items-center mt-1">
                    <span>↓ 2.1% vs last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Income Tab */}
        <TabsContent value="income" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Income Sources</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeSourcesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {incomeSourcesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1F2C',
                          borderColor: '#2a2e39',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`₹${value}`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Income Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-fintrack-text-secondary mb-1">Monthly Average</div>
                        <div className="text-xl font-bold text-green-500">₹5,567</div>
                      </div>
                      <div className="text-xs text-green-500">↑ 8.3% vs last month</div>
                    </div>
                  </div>
                  
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-fintrack-text-secondary mb-1">Highest Income Month</div>
                        <div className="text-xl font-bold text-green-500">₹6,000 (March)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-fintrack-text-secondary mb-1">Lowest Income Month</div>
                        <div className="text-xl font-bold text-fintrack-text-secondary">₹5,000 (January)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-fintrack-text-secondary mb-1">Year-to-Date Income</div>
                        <div className="text-xl font-bold text-green-500">₹33,400</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseByCategory.slice(0, 5).map((category, index) => (
                    <div key={index} className="bg-fintrack-bg-dark p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-red-500 font-medium">₹{category.value}</div>
                      </div>
                      <div className="w-full h-2 bg-fintrack-bg-dark/50 rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full" 
                          style={{ 
                            width: `${(category.value / expenseByCategory.reduce((sum, cat) => sum + cat.value, 0)) * 100}%`,
                            backgroundColor: category.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Expense Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-fintrack-text-secondary mb-1">Monthly Average</div>
                        <div className="text-xl font-bold text-red-500">₹3,466</div>
                      </div>
                      <div className="text-xs text-green-500">↓ 2.1% vs last month</div>
                    </div>
                  </div>
                  
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-fintrack-text-secondary mb-1">Highest Expense Month</div>
                        <div className="text-xl font-bold text-red-500">₹3,800 (March)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-fintrack-text-secondary mb-1">Fixed vs Variable Expenses</div>
                        <div className="text-xl font-bold text-fintrack-text-secondary">65% / 35%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-fintrack-text-secondary mb-1">Year-to-Date Expenses</div>
                        <div className="text-xl font-bold text-red-500">₹20,800</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Weekly Spending Patterns</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingTrendsData}>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A1F2C',
                        borderColor: '#2a2e39',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`₹${value}`, '']}
                    />
                    <Legend />
                    <BarStack 
                      keys={Object.keys(spendingTrendsData[0]).filter(key => key !== 'name')}
                      colors={Object.values(spendingColors)}
                      labels={Object.keys(spendingTrendsData[0]).filter(key => key !== 'name')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Savings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyComparisonData.map((month, index) => {
                    const savingsRate = ((month.savings / month.income) * 100).toFixed(1);
                    return (
                      <div key={index} className="flex justify-between items-center">
                        <div className="font-medium">{month.name}</div>
                        <div className="text-sm">
                          <span className="text-fintrack-purple font-medium">₹{month.savings}</span>
                          <span className="text-fintrack-text-secondary ml-2">({savingsRate}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gradient border-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Financial Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="font-medium mb-1">You're saving more than last month</div>
                    <div className="text-sm text-fintrack-text-secondary">Your savings increased by 26% compared to last month. Keep it up!</div>
                  </div>
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="font-medium mb-1">Entertainment expenses are rising</div>
                    <div className="text-sm text-fintrack-text-secondary">Your entertainment expenses increased by 15% this month. Consider reviewing this category.</div>
                  </div>
                  <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                    <div className="font-medium mb-1">Food budget well managed</div>
                    <div className="text-sm text-fintrack-text-secondary">You're consistently staying under your food budget. Good job!</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
