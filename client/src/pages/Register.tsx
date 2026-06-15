import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, type Role } from '../store/authStore';
import { fetchApi } from '../lib/api';
import { SplitScreenLayout } from '../components/layouts/SplitScreenLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor' as 'donor' | 'ngo',
    // NGO specific
    organizationName: '',
    registrationNumber: '',
    // Donor specific
    category: 'individual',
    address: '',
    lng: '',
    lat: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Ensure category is valid for NGO if state is somehow stuck on donor default
      const submitData: any = { ...formData };
      if (submitData.role === 'ngo' && ['individual', 'restaurant', 'supermarket', 'event'].includes(submitData.category)) {
        submitData.category = 'general_ngo';
      }
      
      // Map coords to keys expected by backend
      submitData.longitude = submitData.lng || '0';
      submitData.latitude = submitData.lat || '0';

      const response = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(submitData),
      });
      
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
      
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full h-10 !bg-transparent !border-t-0 !border-x-0 !border-b-2 !border-b-[#CBD5E1] !px-0 text-[#0F172A] focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:!border-b-[#10B981] focus-visible:!border-b-[#10B981] transition-colors duration-300 !rounded-none !shadow-none text-base focus-visible:!outline-none";

  return (
    <SplitScreenLayout
      title="Join the Mission"
      subtitle="Create an account to start sharing surplus food or claim donations for your community."
    >
      <div className="w-full relative max-h-[85vh] overflow-y-auto custom-scrollbar pr-2">

        <div className="relative z-10">
          <form onSubmit={handleRegister} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="block text-sm font-semibold text-[#0F172A]">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="block text-sm font-semibold text-[#0F172A]">Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="block text-sm font-semibold text-[#0F172A]">Phone <span className="text-red-500">*</span></Label>
                <Input id="phone" value={formData.phone} onChange={handleChange} required className={inputClasses} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="block text-sm font-semibold text-[#0F172A]">Password <span className="text-red-500">*</span></Label>
                <Input id="password" type="password" minLength={8} value={formData.password} onChange={handleChange} required className={inputClasses} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="block text-sm font-semibold text-[#0F172A]">Location Address <span className="text-red-500">*</span></Label>
                <Input id="address" value={formData.address} onChange={handleChange} required className={inputClasses} />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Label htmlFor="role" className="block text-sm font-semibold text-[#0F172A]">Account Type <span className="text-red-500">*</span></Label>
              <Select value={formData.role} onValueChange={(value: 'donor' | 'ngo') => setFormData({ ...formData, role: value, category: value === 'donor' ? 'individual' : 'general_ngo' })}>
                <SelectTrigger className={inputClasses}>
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 bg-white shadow-xl">
                  <SelectItem value="donor" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">I want to Donate Food</SelectItem>
                  <SelectItem value="ngo" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">I am an NGO / Distributor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'ngo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 animate-in fade-in zoom-in duration-300 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="block text-sm font-semibold text-[#0F172A]">Organization Name <span className="text-red-500">*</span></Label>
                  <Input id="organizationName" value={formData.organizationName} onChange={handleChange} required className={inputClasses} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber" className="block text-sm font-semibold text-[#0F172A]">Registration ID <span className="text-red-500">*</span></Label>
                  <Input id="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required className={inputClasses} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ngoCategory" className="block text-sm font-semibold text-[#0F172A]">NGO Category <span className="text-red-500">*</span></Label>
                  <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className={inputClasses}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 bg-white shadow-xl">
                      <SelectItem value="orphanage" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">Orphanage</SelectItem>
                      <SelectItem value="old_age_home" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">Old Age Home</SelectItem>
                      <SelectItem value="school" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">School</SelectItem>
                      <SelectItem value="general_ngo" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">General NGO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.role === 'donor' && (
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 animate-in fade-in zoom-in duration-300 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="category" className="block text-sm font-semibold text-[#0F172A]">Donor Category <span className="text-red-500">*</span></Label>
                  <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className={inputClasses}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 bg-white shadow-xl">
                      <SelectItem value="individual" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">Individual</SelectItem>
                      <SelectItem value="restaurant" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">Restaurant</SelectItem>
                      <SelectItem value="supermarket" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">Supermarket</SelectItem>
                      <SelectItem value="event" className="rounded-xl focus:bg-[#10B981]/10 focus:text-[#0F172A] cursor-pointer">Event Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#059669] hover:to-[#0D9488] text-white rounded-full h-12 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 text-base font-semibold" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </div>
        <div className="relative z-10 flex flex-col pt-8 pb-2">
          <div className="text-sm text-center text-[#64748B] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#10B981] hover:text-[#059669] font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </SplitScreenLayout>
  );
}
