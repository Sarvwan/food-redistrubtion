import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { PlusCircle, List, Image as ImageIcon, MapPin } from 'lucide-react';
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

  const sidebarItems = [
    { icon: List, label: 'My Donations', path: '/donor' },
    { icon: PlusCircle, label: 'Post New', path: '#post' },
    { icon: MapPin, label: 'Map View', path: '/donor/map' },
  ];

  return (
    <DashboardLayout title="Donor Dashboard" sidebarItems={sidebarItems}>
      
      <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-2">
        <button onClick={() => setActiveTab('list')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'list' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>My Donations</button>
        <button onClick={() => setActiveTab('post')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'post' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}>Post Donation</button>
      </div>

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
        <Card className="max-w-2xl mx-auto border-0 shadow-xl shadow-slate-200/50 rounded-2xl">
          <CardHeader>
            <CardTitle>Post a New Donation</CardTitle>
            <CardDescription>Share your surplus food with the community.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foodType">Food Type</Label>
                  <Input id="foodType" required value={formData.foodType} onChange={handleChange} placeholder="e.g. 50 boxes of cooked rice" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" required value={formData.quantity} onChange={handleChange} placeholder="e.g. Serves 50" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address</Label>
                <Input id="pickupAddress" required value={formData.pickupAddress} onChange={handleChange} placeholder="123 Main St..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input id="availableFrom" type="datetime-local" required value={formData.availableFrom} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableTill">Available Till</Label>
                  <Input id="availableTill" type="datetime-local" required value={formData.availableTill} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos">Upload Photos (Optional)</Label>
                <Input id="photos" type="file" multiple accept="image/*" ref={fileInputRef} onChange={(e) => setFiles(e.target.files)} className="bg-slate-50 cursor-pointer" />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={postMutation.isPending}>
                {postMutation.isPending ? 'Submitting...' : 'Post Donation'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

    </DashboardLayout>
  );
}
