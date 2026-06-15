import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../lib/api';

export interface SidebarItem {
  icon: React.ElementType;
  label: string;
  id: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  sidebarItems: SidebarItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function DashboardLayout({ children, title, sidebarItems, activeTab, onTabChange }: DashboardLayoutProps) {
  const { logout, user: authUser } = useAuthStore();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string>('');

  useEffect(() => {
    // Fetch full profile to get updated name / organizationName
    fetchApi('/auth/me')
      .then(data => {
        if (data.role === 'ngo' && data.ngoDetails?.organizationName) {
          setProfileName(data.ngoDetails.organizationName);
        } else {
          setProfileName(data.name || authUser?.name || 'User');
        }
      })
      .catch(() => setProfileName('User'));
  }, [authUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        {/* Left Side: Logo & App Name */}
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Food Relief Logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">Food Relief</span>
        </div>
        
        {/* Right Side: Title, Profile, Logout */}
        <div className="flex items-center space-x-4">
          <h1 className="text-md font-semibold text-slate-600 hidden md:block">{title}</h1>
          
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          
          <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
             <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <UserIcon className="h-4 w-4" />
             </div>
             <span className="text-sm font-medium text-slate-700 pr-1">{profileName}</span>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Horizontal Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 sticky top-16 z-10 shadow-sm">
        <div className="flex space-x-6 max-w-7xl mx-auto overflow-x-auto no-scrollbar">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center ${
                activeTab === item.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <item.icon className={`h-4 w-4 mr-2 ${activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
          key={activeTab} // Force re-animation on tab change
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
