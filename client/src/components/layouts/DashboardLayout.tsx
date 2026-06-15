import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  sidebarItems: SidebarItem[];
}

export function DashboardLayout({ children, title, sidebarItems }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden md:flex flex-col bg-white border-r border-slate-200 z-20 shrink-0 shadow-sm"
          >
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
              <span className="text-xl font-bold text-slate-900 tracking-tight">Food Relief</span>
            </div>
            
            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-emerald-50 text-emerald-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${location.pathname === item.path ? 'text-emerald-700' : 'text-slate-400'}`} />
                  {item.label}
                  {location.pathname === item.path && (
                    <ChevronRight className="h-4 w-4 ml-auto text-emerald-700" />
                  )}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-slate-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3 text-slate-400 group-hover:text-red-700" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-md hidden md:block"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                U
             </div>
          </div>
        </header>

        {/* Scrollable Main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
