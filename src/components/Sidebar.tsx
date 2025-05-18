
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart, 
  PieChart, 
  Wallet, 
  DollarSign, 
  Settings, 
  User,
  Users,
  LogOut,
  CreditCard
} from 'lucide-react';

type SidebarItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems: SidebarItem[] = [
    { 
      name: 'Dashboard', 
      path: '/',
      icon: <Home className="h-5 w-5" />
    },
    { 
      name: 'Family Members', 
      path: '/family',
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      name: 'Wallet', 
      path: '/wallet',
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      name: 'Budget', 
      path: '/budget',
      icon: <PieChart className="h-5 w-5" />
    },
    { 
      name: 'Income', 
      path: '/income',
      icon: <DollarSign className="h-5 w-5" /> 
    },
    { 
      name: 'Expenses', 
      path: '/expenses',
      icon: <Wallet className="h-5 w-5" /> 
    },
    { 
      name: 'Reports', 
      path: '/reports',
      icon: <BarChart className="h-5 w-5" /> 
    }
  ];

  const bottomMenuItems: SidebarItem[] = [
    { 
      name: 'Profile', 
      path: '/profile',
      icon: <User className="h-5 w-5" /> 
    },
    { 
      name: 'Settings', 
      path: '/settings',
      icon: <Settings className="h-5 w-5" /> 
    },
    { 
      name: 'Logout', 
      path: '/logout',
      icon: <LogOut className="h-5 w-5" /> 
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col justify-between h-full py-6 px-3 bg-fintrack-card-dark">
      <div>
        <div className="mb-8 px-4">
          <div className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-fintrack-purple">Fin</span>
            <span className="text-white">Track</span>
          </div>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path) 
                  ? 'bg-fintrack-purple text-white' 
                  : 'text-fintrack-text-secondary hover:bg-fintrack-bg-dark'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {bottomMenuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.path) 
                ? 'bg-fintrack-purple text-white' 
                : 'text-fintrack-text-secondary hover:bg-fintrack-bg-dark'
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
