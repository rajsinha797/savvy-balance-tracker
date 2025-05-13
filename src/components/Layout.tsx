
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-fintrack-bg-dark">
      <div className="md:hidden">
        <Navbar />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-fintrack-purple text-white shadow-lg h-12 w-12 flex items-center justify-center"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          >
            <div 
              className="fixed inset-y-0 left-0 z-50 w-64 bg-fintrack-card-dark"
              onClick={e => e.stopPropagation()}
            >
              <Sidebar />
            </div>
          </div>
        )}
      </div>
      
      <div className="hidden md:grid md:grid-cols-[240px_1fr]">
        <aside className="h-screen sticky top-0">
          <Sidebar />
        </aside>
        
        <div className="flex flex-col">
          <Navbar />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Mobile content */}
      <div className="md:hidden">
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
