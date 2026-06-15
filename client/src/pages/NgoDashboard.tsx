import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { Search, ClipboardList, CheckCircle, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
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

  const sidebarItems = [
    { icon: Search, label: 'Find Food', path: '/ngo' },
    { icon: ClipboardList, label: 'My Claims', path: '#claims' },
  ];

  if (isPendingApproval) {
    return (
      <DashboardLayout title="NGO Dashboard" sidebarItems={sidebarItems}>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-lg text-center shadow-sm">
          <h2 className="text-xl font-bold mb-2">Account Pending Approval</h2>
          <p>Your NGO account is currently under review by our admins. You will be able to claim donations once approved.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="NGO Dashboard" sidebarItems={sidebarItems}>
      
      <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveTab('available')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'available' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>Available Donations</button>
        <button onClick={() => setActiveTab('claims')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'claims' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>My Active Claims</button>
      </div>

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

    </DashboardLayout>
  );
}
