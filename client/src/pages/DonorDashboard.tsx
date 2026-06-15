import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { PlusCircle, List, Image as ImageIcon, MapPin, Settings, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export function DonorDashboard() {
  const [activeTab, setActiveTab] = useState('list');
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    description: '',
    pickupAddress: '',
    availableFrom: '',
    availableTill: ''
  });
  const [files, setFiles] = useState<FileList | null>(null);

  // Queries
  const { data: donations } = useQuery({
    queryKey: ['myDonations'],
    queryFn: () => fetchApi('/donor/my-donations')
  });

  // Mutations
  const cancelMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/donor/donation/${id}/cancel`, { method: 'PATCH' }),
    onSuccess: () => {
      toast.success('Donation cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['myDonations'] });
    },
    onError: () => toast.error('Failed to cancel donation')
  });

  const postMutation = useMutation({
    mutationFn: (data: FormData) => fetchApi('/donor/post', { method: 'POST', body: data }),
    onSuccess: () => {
      toast.success('Donation posted successfully!');
      queryClient.invalidateQueries({ queryKey: ['myDonations'] });
      setActiveTab('list');
      setFormData({
        foodType: '', quantity: '', description: '', pickupAddress: '', availableFrom: '', availableTill: ''
      });
      setFiles(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err: any) => toast.error(err.message || 'Failed to post donation')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    
    // Add dummy coordinates since old code expected them but we aren't loading map here yet
    data.append('longitude', '0');
    data.append('latitude', '0');

    if (files) {
      for (let i = 0; i < files.length; i++) {
        data.append('photos', files[i]);
      }
    }
    
    postMutation.mutate(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this donation?')) {
      cancelMutation.mutate(id);
    }
  };

  const handleViewProof = async (id: string) => {
    try {
      const data = await fetchApi(`/donor/donation/${id}`);
      if (!data.proof || !data.proof.photos || data.proof.photos.length === 0) {
        toast.info("No proof photos found yet.");
        return;
      }
      // Simple preview logic since we don't have a full modal component
      const newWindow = window.open();
      if(newWindow) {
        newWindow.document.write(`
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Distributed by: ${data.proof.ngoId?.organizationName || 'Unknown NGO'}</h2>
            <div style="display:flex; flex-wrap:wrap; gap:10px;">
              ${data.proof.photos.map((p: string) => `<img src="${p}" style="max-width: 400px; border-radius: 8px;" />`).join('')}
            </div>
          </div>
        `);
      }
    } catch (err) {
      toast.error('Error fetching proof');
    }
  };

  // Settings state
  const [settingsForm, setSettingsForm] = useState({ name: '', phone: '', address: '', email: '', role: '', password: '' });
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false);

  useEffect(() => {
    fetchApi('/auth/me').then(data => {
      setSettingsForm({ 
        name: data.name || '', 
        phone: data.phone || '', 
        address: data.address || '',
        email: data.email || '',
        role: data.role || 'donor',
        password: ''
      });
      if (data.pendingProfileUpdates) {
        setHasPendingUpdates(true);
      }
    });
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (data) => {
      toast.success(data.message || 'Profile updated successfully');
      if (data.pendingUpdates) {
        setHasPendingUpdates(true);
      }
      setSettingsForm(prev => ({ ...prev, password: '' }));
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update profile')
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(settingsForm);
  };

  const sidebarItems = [
    { icon: List, label: 'My Donations', id: 'list' },
    { icon: PlusCircle, label: 'Post New', id: 'post' },
    { icon: MapPin, label: 'Map View', id: 'map' },
    { icon: Settings, label: 'Configuration', id: 'settings' }
  ];

  return (
    <DashboardLayout 
      title="Donor Dashboard" 
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >

      {activeTab === 'list' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Posted Donations</h2>
          {(!donations || donations.length === 0) ? (
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
              You haven't posted any donations yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {donations.map((d: any) => (
                <Card key={d._id} className="border-slate-200 shadow-sm flex flex-col">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">{d.foodType}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      d.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                      d.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <CardContent className="p-6 flex-1">
                    <div className="space-y-3 text-sm">
                      <p><span className="text-slate-500">Quantity:</span> <span className="font-medium text-slate-900">{d.quantity}</span></p>
                      <p><span className="text-slate-500">Posted:</span> {new Date(d.createdAt).toLocaleDateString()}</p>
                      <p><span className="text-slate-500">Available Until:</span> {new Date(d.availableTill).toLocaleString()}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 border-t border-slate-100 mt-4">
                    {d.status === 'open' && (
                      <Button variant="destructive" className="w-full mt-4" onClick={() => handleCancel(d._id)}>Cancel Donation</Button>
                    )}
                    {d.status === 'completed' && (
                      <Button variant="outline" className="w-full mt-4 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" onClick={() => handleViewProof(d._id)}>
                        <ImageIcon className="h-4 w-4 mr-2" /> View Proof
                      </Button>
                    )}
                    {d.status === 'pending' && (
                      <Button disabled variant="outline" className="w-full mt-4">Processing</Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'post' && (
        <Card className="max-w-4xl mx-auto border-0 shadow-xl shadow-slate-200/50 rounded-2xl p-4 sm:p-8">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-slate-100 mb-6">
            <CardTitle className="text-2xl font-bold text-slate-900">Post a New Donation</CardTitle>
            <CardDescription className="text-base text-slate-500">Share your surplus food with the community.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <div className="space-y-2">
                  <Label htmlFor="foodType" className="block text-sm font-semibold text-[#0F172A]">Food Type <span className="text-red-500">*</span></Label>
                  <Input id="foodType" required value={formData.foodType} onChange={handleChange} placeholder="e.g. 50 boxes of cooked rice" className="w-full h-10 !bg-transparent !border-t-0 !border-x-0 !border-b-2 !border-b-[#CBD5E1] !px-0 text-[#0F172A] focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:!border-b-[#10B981] focus-visible:!border-b-[#10B981] transition-colors duration-300 !rounded-none !shadow-none text-base focus-visible:!outline-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="block text-sm font-semibold text-[#0F172A]">Quantity <span className="text-red-500">*</span></Label>
                  <Input id="quantity" required value={formData.quantity} onChange={handleChange} placeholder="e.g. Serves 50" className="w-full h-10 !bg-transparent !border-t-0 !border-x-0 !border-b-2 !border-b-[#CBD5E1] !px-0 text-[#0F172A] focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:!border-b-[#10B981] focus-visible:!border-b-[#10B981] transition-colors duration-300 !rounded-none !shadow-none text-base focus-visible:!outline-none" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pickupAddress" className="block text-sm font-semibold text-[#0F172A]">Pickup Address <span className="text-red-500">*</span></Label>
                  <Input id="pickupAddress" required value={formData.pickupAddress} onChange={handleChange} placeholder="123 Main St..." className="w-full h-10 !bg-transparent !border-t-0 !border-x-0 !border-b-2 !border-b-[#CBD5E1] !px-0 text-[#0F172A] focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:!border-b-[#10B981] focus-visible:!border-b-[#10B981] transition-colors duration-300 !rounded-none !shadow-none text-base focus-visible:!outline-none" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableFrom" className="block text-sm font-semibold text-[#0F172A]">Available From <span className="text-red-500">*</span></Label>
                  <Input id="availableFrom" type="datetime-local" required value={formData.availableFrom} onChange={handleChange} className="w-full h-10 !bg-transparent !border-t-0 !border-x-0 !border-b-2 !border-b-[#CBD5E1] !px-0 text-[#0F172A] focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:!border-b-[#10B981] focus-visible:!border-b-[#10B981] transition-colors duration-300 !rounded-none !shadow-none text-base focus-visible:!outline-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableTill" className="block text-sm font-semibold text-[#0F172A]">Available Till <span className="text-red-500">*</span></Label>
                  <Input id="availableTill" type="datetime-local" required value={formData.availableTill} onChange={handleChange} className="w-full h-10 !bg-transparent !border-t-0 !border-x-0 !border-b-2 !border-b-[#CBD5E1] !px-0 text-[#0F172A] focus:!outline-none focus:!ring-0 focus-visible:!ring-0 focus:!border-b-[#10B981] focus-visible:!border-b-[#10B981] transition-colors duration-300 !rounded-none !shadow-none text-base focus-visible:!outline-none" />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Label htmlFor="photos" className="block text-sm font-semibold text-[#0F172A]">Upload Photos (Optional)</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                  <Input id="photos" type="file" multiple accept="image/jpeg,image/png" ref={fileInputRef} onChange={(e) => setFiles(e.target.files)} className="hidden" />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ImageIcon className="h-10 w-10 text-slate-400" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-2 text-[#10B981] border-[#10B981] hover:bg-[#10B981]/10">
                      Choose Files
                    </Button>
                    <p className="text-sm text-slate-500 mt-2">
                      {files && files.length > 0 ? `${files.length} file(s) selected` : 'JPEG, PNG only. Max 10MB per file. Up to 5 photos.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full bg-gradient-to-r from-[#10B981] to-[#14B8A6] hover:from-[#059669] hover:to-[#0D9488] text-white rounded-full h-14 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 text-lg font-semibold" disabled={postMutation.isPending}>
                  {postMutation.isPending ? 'Submitting...' : 'Post Donation'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'map' && (
        <Card className="border-0 shadow-sm shadow-slate-200/50 overflow-hidden">
          <CardHeader>
            <CardTitle>Donation Radar Map</CardTitle>
            <CardDescription>View your active donations on the geospatial grid.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 relative h-[500px] bg-slate-100 flex flex-col items-center justify-center">
            <Map className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-500">Map Integration Offline</h3>
            <p className="text-sm text-slate-400 max-w-md text-center mt-2">
              Geospatial radar is currently operating in headless mode. Map tiles require a valid Maps API Key configuration.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card className="max-w-2xl mx-auto border-0 shadow-sm shadow-slate-200/50">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Update your donor profile details.</CardDescription>
          </CardHeader>
          <CardContent>
            {hasPendingUpdates && (
              <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative">
                <strong className="font-bold">Pending Approval! </strong>
                <span className="block sm:inline">Your recent profile updates are pending admin approval. You can still change your password immediately.</span>
              </div>
            )}
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Read-only)</Label>
                <Input id="email" readOnly disabled value={settingsForm.email} className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Account Role (Read-only)</Label>
                <Input id="role" readOnly disabled value={settingsForm.role} className="bg-slate-50 uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Organization / Full Name</Label>
                <Input id="name" required value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={settingsForm.phone} onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Default Pickup Address</Label>
                <Input id="address" value={settingsForm.address} onChange={e => setSettingsForm({...settingsForm, address: e.target.value})} />
              </div>

              <div className="pt-4 pb-2 border-t border-slate-100 mt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Security</h3>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" placeholder="Leave blank to keep current password" value={settingsForm.password} onChange={e => setSettingsForm({...settingsForm, password: e.target.value})} />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

    </DashboardLayout>
  );
}
