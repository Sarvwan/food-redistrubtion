import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { Search, ClipboardList, CheckCircle, Camera, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export function NgoDashboard() {
  const [activeTab, setActiveTab] = useState('available');
  const [proofId, setProofId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: availableDonations, error: availableError } = useQuery({
    queryKey: ['availableDonations'],
    queryFn: () => fetchApi('/ngo/available-donations'),
    retry: false
  });

  const { data: myClaims } = useQuery({
    queryKey: ['myClaims'],
    queryFn: () => fetchApi('/ngo/my-claims')
  });

  // Check if unapproved
  const isPendingApproval = availableError?.message?.includes('pending approval');

  // Mutations
  const claimMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/ngo/claim/${id}`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Donation claimed successfully!');
      queryClient.invalidateQueries({ queryKey: ['availableDonations'] });
      queryClient.invalidateQueries({ queryKey: ['myClaims'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to claim donation')
  });

  const collectMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/ngo/collect/${id}`, { method: 'PATCH' }),
    onSuccess: () => {
      toast.success('Donation marked as collected!');
      queryClient.invalidateQueries({ queryKey: ['myClaims'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to collect donation')
  });

  const proofMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: FormData }) => 
      fetchApi(`/ngo/proof/${id}`, { method: 'POST', body: data }),
    onSuccess: () => {
      toast.success('Proof photos uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['myClaims'] });
      setProofId(null);
      setFiles(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to upload proof')
  });

  const handleClaim = (id: string) => {
    if (window.confirm('Are you sure you want to claim this donation? You must pick it up promptly.')) {
      claimMutation.mutate(id);
    }
  };

  const handleCollect = (id: string) => {
    if (window.confirm('Mark this donation as collected?')) {
      collectMutation.mutate(id);
    }
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length < 2 || files.length > 5) {
      toast.error('Please select between 2 and 5 photos.');
      return;
    }
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('photos', files[i]);
    }
    if (proofId) {
      proofMutation.mutate({ id: proofId, data });
    }
  };

  // Settings state
  const [settingsForm, setSettingsForm] = useState({ name: '', phone: '', address: '', organizationName: '', registrationNumber: '', email: '', role: '', password: '', category: '' });
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false);

  useEffect(() => {
    fetchApi('/auth/me').then(data => {
      setSettingsForm({ 
        name: data.name || '', 
        phone: data.phone || '', 
        address: data.address || '',
        organizationName: data.ngoDetails?.organizationName || '',
        registrationNumber: data.ngoDetails?.registrationNumber || '',
        email: data.email || '',
        role: data.role || 'ngo',
        password: '',
        category: data.ngoDetails?.category || ''
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
    { icon: Search, label: 'Find Food', id: 'available' },
    { icon: ClipboardList, label: 'My Claims', id: 'claims' },
    { icon: Settings, label: 'Configuration', id: 'settings' }
  ];

  if (isPendingApproval) {
    return (
      <DashboardLayout title="NGO Dashboard" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-lg text-center shadow-sm">
          <h2 className="text-xl font-bold mb-2">Account Pending Approval</h2>
          <p>Your NGO account is currently under review by our admins. You will be able to claim donations once approved.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="NGO Dashboard" 
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >

      {/* Available Donations */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Nearby Open Donations</h2>
          {(!availableDonations || availableDonations.length === 0) ? (
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
              There are no open donations nearby right now. Check back later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {availableDonations.map((d: any) => (
                <Card key={d._id} className="border-slate-200 shadow-sm flex flex-col">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">{d.foodType}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Open
                    </span>
                  </div>
                  <CardContent className="p-6 flex-1 text-sm space-y-3 text-slate-600">
                    <p><strong className="text-slate-900 font-medium">Quantity:</strong> {d.quantity}</p>
                    <p><strong className="text-slate-900 font-medium">Pickup at:</strong> {d.pickupAddress}</p>
                    <p><strong className="text-slate-900 font-medium">Donor:</strong> {d.donorId?.name || 'Unknown'}</p>
                    <p><strong className="text-slate-900 font-medium">Available Until:</strong> {new Date(d.availableTill).toLocaleString()}</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 border-t border-slate-100 mt-4">
                    <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleClaim(d._id)} disabled={claimMutation.isPending}>
                      Claim Donation
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Claims</h2>
          {(!myClaims || myClaims.length === 0) ? (
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
              You haven't claimed any donations recently.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myClaims.map((d: any) => (
                <Card key={d._id} className="border-slate-200 shadow-sm flex flex-col">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">{d.foodType}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      d.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                      d.status === 'collected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <CardContent className="p-6 flex-1 text-sm space-y-3 text-slate-600">
                    <p><strong className="text-slate-900 font-medium">Quantity:</strong> {d.quantity}</p>
                    <p><strong className="text-slate-900 font-medium">Pickup at:</strong> {d.pickupAddress}</p>
                    <p><strong className="text-slate-900 font-medium">Must Collect By:</strong> {new Date(d.availableTill).toLocaleString()}</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 border-t border-slate-100 mt-4">
                    {d.status === 'claimed' && (
                      <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleCollect(d._id)}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Collected
                      </Button>
                    )}
                    {d.status === 'collected' && (
                      <Button className="w-full mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50" variant="outline" onClick={() => setProofId(d._id)}>
                        <Camera className="w-4 h-4 mr-2" /> Upload Distribution Proof
                      </Button>
                    )}
                    {d.status === 'completed' && (
                      <Button disabled className="w-full mt-4 bg-slate-100 text-slate-400">Completed</Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Proof Upload Modal (Simple Overlay) */}
      {proofId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Upload Proof of Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProofSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Photos (Select 2-5 images)</Label>
                  <Input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={(e) => setFiles(e.target.files)} 
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-slate-500">Please provide clear photos showing the food being distributed.</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setProofId(null)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={proofMutation.isPending}>
                    {proofMutation.isPending ? 'Uploading...' : 'Submit Proof'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card className="max-w-2xl mx-auto border-0 shadow-sm shadow-slate-200/50">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Update your NGO profile and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            {hasPendingUpdates && (
              <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded relative">
                <strong className="font-bold">Pending Approval! </strong>
                <span className="block sm:inline">Your recent profile updates are pending admin approval. You can still change your password immediately.</span>
              </div>
            )}
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (Read-only)</Label>
                  <Input id="email" readOnly disabled value={settingsForm.email} className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Account Role (Read-only)</Label>
                  <Input id="role" readOnly disabled value={settingsForm.role} className="bg-slate-50 uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input id="organizationName" required value={settingsForm.organizationName} onChange={e => setSettingsForm({...settingsForm, organizationName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input id="registrationNumber" required value={settingsForm.registrationNumber} onChange={e => setSettingsForm({...settingsForm, registrationNumber: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">NGO Category</Label>
                <select id="category" value={settingsForm.category} onChange={e => setSettingsForm({...settingsForm, category: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="orphanage">Orphanage</option>
                  <option value="old_age_home">Old Age Home</option>
                  <option value="school">School</option>
                  <option value="general_ngo">General NGO</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Primary Contact Name</Label>
                <Input id="name" required value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone Number</Label>
                <Input id="phone" value={settingsForm.phone} onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Registered Address</Label>
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
