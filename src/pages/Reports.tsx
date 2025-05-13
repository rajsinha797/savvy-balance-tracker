
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getAllFamilyMembers, FamilyMember } from '@/services/familyService';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Convert day of week number to name (MySQL returns 1=Sunday, 2=Monday, etc.)
const getDayName = (dayNumber: number) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[(dayNumber - 1) % 7];
};

const formatCurrency = (value: number) => {
  return `₹${Number(value).toFixed(2)}`;
};

const formatMonth = (month: number, year: number) => {
  const date = new Date(year, month - 1);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

const Reports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  const [weeklySpending, setWeeklySpending] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedFamilyMember]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load family members
      const familyData = await getAllFamilyMembers();
      setFamilyMembers(familyData);

      // If on overview tab, load monthly summary data
      if (activeTab === 'overview') {
        const url = selectedFamilyMember 
          ? `${API_URL}/api/reports/monthly?family_member_id=${selectedFamilyMember}`
          : `${API_URL}/api/reports/monthly`;
        
        const response = await axios.get(url);
        const data = response.data;
        
        // Process the monthly summary data
        const processedData = processMonthlyData(data);
        setMonthlySummary(processedData);
      }
      
      // If on trends tab, load weekly spending data
      else if (activeTab === 'trends') {
        const url = selectedFamilyMember 
          ? `${API_URL}/api/reports/weekly?family_member_id=${selectedFamilyMember}`
          : `${API_URL}/api/reports/weekly`;
        
        const response = await axios.get(url);
        const data = response.data;
        
        // Process the weekly spending data
        const processedData = processWeeklyData(data);
        setWeeklySpending(processedData);
        
        // For category breakdown, we'll load expense data
        const expenseUrl = selectedFamilyMember 
          ? `${API_URL}/api/expenses?family_member_id=${selectedFamilyMember}`
          : `${API_URL}/api/expenses`;
        
        const expenseResponse = await axios.get(expenseUrl);
        const expenseData = expenseResponse.data;
        
        // Process the expense data by category
        const categoryData = processCategoryData(expenseData);
        setCategoryBreakdown(categoryData);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data. Using mock data instead.",
        variant: "destructive",
      });
      
      // Use mock data as fallback
      if (activeTab === 'overview') {
        setMonthlySummary([
          { name: 'Jan', income: 5000, expenses: 3500, savings: 1500 },
          { name: 'Feb', income: 5500, expenses: 4000, savings: 1500 },
          { name: 'Mar', income: 4800, expenses: 3600, savings: 1200 },
          { name: 'Apr', income: 6000, expenses: 4200, savings: 1800 },
          { name: 'May', income: 5800, expenses: 3900, savings: 1900 },
          { name: 'Jun', income: 6200, expenses: 4500, savings: 1700 }
        ]);
      } else {
        setWeeklySpending([
          { name: 'Mon', amount: 120 },
          { name: 'Tue', amount: 200 },
          { name: 'Wed', amount: 150 },
          { name: 'Thu', amount: 80 },
          { name: 'Fri', amount: 300 },
          { name: 'Sat', amount: 450 },
          { name: 'Sun', amount: 180 }
        ]);
        
        setCategoryBreakdown([
          { name: 'Housing', value: 1200 },
          { name: 'Food', value: 800 },
          { name: 'Transportation', value: 400 },
          { name: 'Entertainment', value: 300 },
          { name: 'Utilities', value: 250 }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const processMonthlyData = (data: any) => {
    const { income = [], expenses = [] } = data;
    const monthsMap = new Map<string, { name: string; income: number; expenses: number; savings: number }>();
    
    // Process income data
    income.forEach((item: any) => {
      const key = `${item.year}-${item.month}`;
      const monthName = formatMonth(item.month, item.year);
      
      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          name: monthName,
          income: 0,
          expenses: 0,
          savings: 0
        });
      }
      
      const current = monthsMap.get(key)!;
      current.income = Number(item.total);
      current.savings = current.income - current.expenses;
      monthsMap.set(key, current);
    });
    
    // Process expense data
    expenses.forEach((item: any) => {
      const key = `${item.year}-${item.month}`;
      const monthName = formatMonth(item.month, item.year);
      
      if (!monthsMap.has(key)) {
        monthsMap.set(key, {
          name: monthName,
          income: 0,
          expenses: 0,
          savings: 0
        });
      }
      
      const current = monthsMap.get(key)!;
      current.expenses = Number(item.total);
      current.savings = current.income - current.expenses;
      monthsMap.set(key, current);
    });
    
    // Convert to array and sort by date
    const months = Array.from(monthsMap.values());
    
    // Sort months chronologically
    months.sort((a, b) => {
      const yearA = parseInt(a.name.split(' ')[1]);
      const yearB = parseInt(b.name.split(' ')[1]);
      
      if (yearA !== yearB) return yearA - yearB;
      
      const monthOrder = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
      };
      
      const monthA = monthOrder[a.name.split(' ')[0] as keyof typeof monthOrder];
      const monthB = monthOrder[b.name.split(' ')[0] as keyof typeof monthOrder];
      
      return monthA - monthB;
    });
    
    return months;
  };

  const processWeeklyData = (data: any) => {
    // Create an array for all days of the week
    const days = [
      { day_of_week: 1, name: 'Sun', amount: 0 },
      { day_of_week: 2, name: 'Mon', amount: 0 },
      { day_of_week: 3, name: 'Tue', amount: 0 },
      { day_of_week: 4, name: 'Wed', amount: 0 },
      { day_of_week: 5, name: 'Thu', amount: 0 },
      { day_of_week: 6, name: 'Fri', amount: 0 },
      { day_of_week: 7, name: 'Sat', amount: 0 }
    ];
    
    // Fill in actual data
    data.forEach((item: any) => {
      const dayIndex = days.findIndex(d => d.day_of_week === item.day_of_week);
      if (dayIndex !== -1) {
        days[dayIndex].amount = Number(item.total);
      }
    });
    
    // Sort by day of week (starting with Monday)
    const sortedDays = [...days.slice(1), days[0]];
    
    return sortedDays;
  };

  const processCategoryData = (data: any[]) => {
    const categories: Record<string, number> = {};
    
    data.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      categories[item.category] += Number(item.amount);
    });
    
    const result = Object.entries(categories).map(([name, value]) => ({ name, value }));
    
    // Sort by value (highest first)
    result.sort((a, b) => b.value - a.value);
    
    return result;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleFamilyMemberChange = (value: string) => {
    setSelectedFamilyMember(value);
  };

  // Find family member name by ID
  const getFamilyMemberName = (id?: string) => {
    if (!id) return "All Members";
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : "Unknown";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        
        <Select 
          value={selectedFamilyMember} 
          onValueChange={handleFamilyMemberChange}
        >
          <SelectTrigger className="w-[180px] bg-fintrack-bg-dark border-fintrack-bg-dark">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Members" />
          </SelectTrigger>
          <SelectContent className="bg-fintrack-card-dark border-fintrack-bg-dark">
            <SelectItem value="">All Members</SelectItem>
            {familyMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Monthly Summary Chart */}
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Monthly Summary {selectedFamilyMember && `- ${getFamilyMemberName(selectedFamilyMember)}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySummary}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
                      <XAxis dataKey="name" stroke="#8c9aae" />
                      <YAxis stroke="#8c9aae" />
                      <Tooltip 
                        formatter={(value: number) => [`₹${value.toFixed(2)}`, '']}
                        contentStyle={{
                          backgroundColor: '#1A1F2C',
                          borderColor: '#2a2e39',
                          color: '#fff',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="savings" name="Savings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Income vs Expenses Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monthlySummary.length > 0 && (
              <>
                <Card className="card-gradient border-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">
                      ₹{monthlySummary.reduce((sum, item) => sum + (item.income || 0), 0).toFixed(2)}
                    </div>
                    <p className="text-sm text-fintrack-text-secondary">Last 6 months</p>
                  </CardContent>
                </Card>
                
                <Card className="card-gradient border-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      ₹{monthlySummary.reduce((sum, item) => sum + (item.expenses || 0), 0).toFixed(2)}
                    </div>
                    <p className="text-sm text-fintrack-text-secondary">Last 6 months</p>
                  </CardContent>
                </Card>
                
                <Card className="card-gradient border-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-fintrack-purple">
                      ₹{monthlySummary.reduce((sum, item) => sum + (item.savings || 0), 0).toFixed(2)}
                    </div>
                    <p className="text-sm text-fintrack-text-secondary">Last 6 months</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          {/* Weekly Spending Pattern */}
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Weekly Spending Pattern {selectedFamilyMember && `- ${getFamilyMemberName(selectedFamilyMember)}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
                </div>
              ) : (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklySpending}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
                      <XAxis dataKey="name" stroke="#8c9aae" />
                      <YAxis stroke="#8c9aae" />
                      <Tooltip
                        formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: '#1A1F2C',
                          borderColor: '#2a2e39',
                          color: '#fff',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="amount" name="Spending" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Expense by Category */}
          <Card className="card-gradient border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Expenses by Category {selectedFamilyMember && `- ${getFamilyMemberName(selectedFamilyMember)}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                          contentStyle={{
                            backgroundColor: '#1A1F2C',
                            borderColor: '#2a2e39',
                            color: '#fff',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="self-center">
                    <div className="space-y-3">
                      {categoryBreakdown.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span>{item.name}</span>
                          </div>
                          <div className="font-medium">₹{item.value.toFixed(2)}</div>
                        </div>
                      ))}
                      
                      {categoryBreakdown.length > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t border-fintrack-bg-dark">
                          <div className="font-medium">Total</div>
                          <div className="font-medium">
                            ₹{categoryBreakdown.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
