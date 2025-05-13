
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center w-full h-16 px-4 md:px-6 bg-fintrack-card-dark border-b border-fintrack-bg-dark">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center">
          <span className="text-fintrack-purple text-2xl font-bold">Fin</span>
          <span className="text-white text-2xl font-bold">Track</span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center bg-fintrack-bg-dark rounded-full px-4 py-2 w-80">
        <Search className="h-4 w-4 text-fintrack-text-secondary mr-2" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none outline-none w-full text-sm text-fintrack-text-secondary"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5 text-fintrack-text-secondary" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="h-8 w-8 rounded-full bg-fintrack-purple flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
