
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Income from "@/pages/Income";
import Expenses from "@/pages/Expenses";
import Reports from "@/pages/Reports";
import Budget from "@/pages/Budget";
import FamilyMembers from "@/pages/FamilyMembers";
import Wallet from "@/pages/Wallet";
import NotFoundPage from "@/pages/NotFoundPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/family" element={<FamilyMembers />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
