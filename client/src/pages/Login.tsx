import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, type Role } from '../store/authStore';
import { fetchApi } from '../lib/api';
import { SplitScreenLayout } from '../components/layouts/SplitScreenLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // The old API expects email and password
      const response = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // Store token and role
      setAuth(response.token, response.user?.role as Role);
      toast.success('Successfully logged in');
      
      // Redirect based on role
      const role = response.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'ngo') navigate('/ngo');
      else if (role === 'donor') navigate('/donor');
      else navigate('/');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitScreenLayout
      title="Welcome Back!!"
      subtitle="Sign in to continue connecting surplus food with those in need."
    >
      <div className="w-full relative">

        <div className="relative z-10">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm font-semibold text-[#0F172A]">Email <span className="text-red-500">*</span></Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full h-10 !bg-transparent !border-t-0 !border-x-0 !border-b-2 !border-b-[#CBD5E1] !px-0 text-[#0F172A] focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:!border-b-[#10B981] focus-visible:!border-b-[#10B981] transition-colors duration-300 !rounded-none !shadow-none text-base focus-visible:!outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="block text-sm font-semibold text-[#0F172A]">Password <span className="text-red-500">*</span></Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full h-10 !bg-transparent !border-t-0 !border-x-0 !border-b-2 !border-b-[#CBD5E1] !px-0 text-[#0F172A] focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:!border-b-[#10B981] focus-visible:!border-b-[#10B981] transition-colors duration-300 !rounded-none !shadow-none text-base focus-visible:!outline-none"
              />
            </div>
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#059669] hover:to-[#0D9488] text-white rounded-full h-12 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </div>
        <div className="relative z-10 flex flex-col space-y-4 pt-8">
          <div className="text-sm text-center text-[#64748B] font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#10B981] hover:text-[#059669] font-semibold transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </SplitScreenLayout>
  );
}
