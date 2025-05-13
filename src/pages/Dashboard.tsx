
import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, DollarSign, Wallet, IndianRupee, Filter } from 'lucide-react';
import OverviewCard from '@/components/dashboard/OverviewCard';
import TransactionList, { Transaction } from '@/components/dashboard/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { getAllFamilyMembers, FamilyMember } from '@/services/familyService';

const API_URL = 'http://localhost:3001';

const Dashboard = () => {
  const { toast } = useToast();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);

  // Mock for upcoming bills since we don't have a backend for this yet
  const mockBills = [
    { name: 'Rent', dueInDays: 5, amount: 1200 },
    { name: 'Internet', dueInDays: 12, amount: 89.99 },
    { name: 'Phone', dueInDays: 15, amount: 45 },
  ];

  // Mock for budget data since we don't have a backend for this yet
  const mockBudgetData = [
    { category: 'Housing', allocated: 1500, spent: 1200 },
    { category: 'Food', allocated: 800, spent: 650 },
    { category: 'Transportation', allocated: 400, spent: 380 },
    { category: 'Entertainment', allocated: 300, spent: 200 },
    { category: 'Utilities', allocated: 500, spent: 480 },
  ];

  useEffect(() => {
    loadData();
  }, [selectedFamilyMember]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load family members
      const familyData = await getAllFamilyMembers();
      setFamilyMembers(familyData);

      // Load income data
      const incomeUrl = selectedFamilyMember 
        ? `${API_URL}/api/income?family_member_id=${selectedFamilyMember}`
        : `${API_URL}/api/income`;
      
      const incomeResponse = await axios.get(incomeUrl);
      const incomeData = incomeResponse.data;
      
      // Load expense data
      const expenseUrl = selectedFamilyMember 
        ? `${API_URL}/api/expenses?family_member_id=${selectedFamilyMember}`
        : `${API_URL}/api/expenses`;
      
      const expenseResponse = await axios.get(expenseUrl);
      const expenseData = expenseResponse.data;
      
      // Calculate summary
      const totalIncome = incomeData.reduce((sum: number, item: any) => sum + item.amount, 0);
      const totalExpenses = expenseData.reduce((sum: number, item: any) => sum + item.amount, 0);
      const totalBalance = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
      setSummaryData({
        totalBalance,
        totalIncome,
        totalExpenses,
        savingsRate,
      });
      
      // Get monthly data for chart
      const monthlyDataUrl = selectedFamilyMember 
        ? `${API_URL}/api/reports/monthly?family_member_id=${selectedFamilyMember}`
        : `${API_URL}/api/reports/monthly`;
      
      const monthlyResponse = await axios.get(monthlyDataUrl);
      const monthlyData = monthlyResponse.data;
      
      // Process monthly data for chart
      const processedChartData = processMonthlyData(monthlyData);
      setChartData(processedChartData);
      
      // Combine income and expenses for transactions list
      const combinedTransactions: Transaction[] = [
        ...incomeData.map((item: any) => ({
          id: item.id,
          type: 'income',
          amount: item.amount,
          category: item.category,
          description: item.description,
          date: item.date,
          family_member: item.family_member,
        })),
        ...expenseData.map((item: any) => ({
          id: item.id,
          type: 'expense',
          amount: item.amount,
          category: item.category,
          description: item.description,
          date: item.date,
          family_member: item.family_member,
        }))
      ];
      
      // Sort by date (most recent first) and take top 5
      combinedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(combinedTransactions.slice(0, 5));
      
      // Set budget data (using mock for now)
      setBudgetData(mockBudgetData);
      
      // Set upcoming bills (using mock for now)
      setUpcomingBills(mockBills);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load some dashboard data. Using mock data.",
        variant: "destructive",
      });
      
      // Use fallback data
      setChartData([
        { name: 'Jan', income: 5000, expenses: 3400 },
        { name: 'Feb', income: 4500, expenses: 3200 },
        { name: 'Mar', income: 6000, expenses: 4000 },
        { name: 'Apr', income: 5500, expenses: 3800 },
        { name: 'May', income: 5200, expenses: 3600 },
        { name: 'Jun', income: 4800, expenses: 3300 },
      ]);
      
      setBudgetData(mockBudgetData);
      setUpcomingBills(mockBills);
    } finally {
      setIsLoading(false);
    }
  };

  const processMonthlyData = (data: any) => {
    const { income = [], expenses = [] } = data;
    const months: Record<string, { name: string; income: number; expenses: number }> = {};
    
    // Process income data
    income.forEach((item: any) => {
      const monthYear = `${item.year}-${item.month}`;
      const monthName = getMonthName(item.month);
      
      if (!months[monthYear]) {
        months[monthYear] = {
          name: monthName,
          income: 0,
          expenses: 0
        };
      }
      
      months[monthYear].income = Number(item.total);
    });
    
    // Process expense data
    expenses.forEach((item: any) => {
      const monthYear = `${item.year}-${item.month}`;
      const monthName = getMonthName(item.month);
      
      if (!months[monthYear]) {
        months[monthYear] = {
          name: monthName,
          income: 0,
          expenses: 0
        };
      }
      
      months[monthYear].expenses = Number(item.total);
    });
    
    // Convert to array and sort by date
    return Object.values(months)
      .sort((a, b) => {
        const monthA = getMonthNumber(a.name);
        const monthB = getMonthNumber(b.name);
        return monthA - monthB;
      })
      .slice(0, 6); // Only take the last 6 months
  };

  const getMonthName = (monthNumber: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || 'Unknown';
  };

  const getMonthNumber = (monthName: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthName) + 1;
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
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          
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
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard 
              title="Total Balance"
              value={`₹${summaryData.totalBalance.toFixed(2)}`}
              trend="up"
              trendValue="12%"
              description="vs last month"
              icon={<IndianRupee className="h-5 w-5 text-fintrack-purple" />}
            />
            
            <OverviewCard 
              title="Total Income"
              value={`₹${summaryData.totalIncome.toFixed(2)}`}
              trend="up"
              trendValue="8%"
              description="vs last month"
              icon={<IndianRupee className="h-5 w-5 text-green-500" />}
            />
            
            <OverviewCard 
              title="Total Expenses"
              value={`₹${summaryData.totalExpenses.toFixed(2)}`}
              trend="down"
              trendValue="5%"
              description="vs last month"
              icon={<Wallet className="h-5 w-5 text-red-500" />}
            />
            
            <OverviewCard 
              title="Savings Rate"
              value={`${summaryData.savingsRate.toFixed(1)}%`}
              trend="up"
              trendValue="2.5%"
              description="vs last month"
              icon={<PieChart className="h-5 w-5 text-fintrack-purple" />}
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-gradient border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Income vs Expenses {selectedFamilyMember && `- ${getFamilyMemberName(selectedFamilyMember)}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fintrack-purple"></div>
                </div>
              ) : (
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
              )}
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
                  <div className="text-xl font-bold text-green-500">₹{summaryData.totalIncome.toFixed(2)}</div>
                </div>
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="text-sm text-fintrack-text-secondary mb-1">Expenses</div>
                  <div className="text-xl font-bold text-red-500">₹{summaryData.totalExpenses.toFixed(2)}</div>
                </div>
                <div className="bg-fintrack-bg-dark p-4 rounded-xl">
                  <div className="text-sm text-fintrack-text-secondary mb-1">Savings</div>
                  <div className="text-xl font-bold text-fintrack-purple">₹{summaryData.totalBalance.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-fintrack-text-secondary mb-2">Monthly Goal Progress</div>
                <div className="w-full h-2 bg-fintrack-bg-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-fintrack-purple" 
                    style={{ width: `${Math.min(summaryData.savingsRate * 2, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-fintrack-text-secondary">{Math.min(summaryData.savingsRate * 2, 100).toFixed(0)}% of Goal</span>
                  <span className="text-fintrack-text-secondary">Target: ₹{(summaryData.totalIncome * 0.5).toFixed(2)}</span>
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
                {upcomingBills.map((bill, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{bill.name}</div>
                      <div className="text-xs text-fintrack-text-secondary">Due in {bill.dueInDays} days</div>
                    </div>
                    <div className="text-red-500 font-medium">₹{bill.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Budget section */}
      <Card className="card-gradient border-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Monthly Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetData.map((item, index) => {
              const percentage = Math.round((item.spent / item.allocated) * 100);
              const barColor = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500';
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{item.category}</div>
                    <div className="text-fintrack-text-secondary text-sm">
                      ₹{item.spent.toLocaleString()} / ₹{item.allocated.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-full h-2 bg-fintrack-bg-dark rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-fintrack-text-secondary">{percentage}%</span>
                    <span className="text-fintrack-text-secondary">{item.allocated - item.spent > 0 ? `₹${(item.allocated - item.spent).toLocaleString()} remaining` : 'Over budget'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <TransactionList 
        transactions={recentTransactions}
        title={selectedFamilyMember ? `Recent Transactions - ${getFamilyMemberName(selectedFamilyMember)}` : "Recent Transactions"} 
      />
    </div>
  );
};

export default Dashboard;
