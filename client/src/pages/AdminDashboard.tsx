import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { LayoutDashboard, Users, Package, Check, X, Settings, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => fetchApi('/admin/stats')
  });

  const { data: pendingNgos } = useQuery({
    queryKey: ['pendingNgos'],
    queryFn: () => fetchApi('/admin/pending-ngos')
  });

  const { data: allDonations } = useQuery({
    queryKey: ['allDonations'],
    queryFn: () => fetchApi('/admin/all-donations')
  });

  const { data: profileUpdates } = useQuery({
    queryKey: ['profileUpdates'],
    queryFn: () => fetchApi('/admin/pending-updates')
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/admin/approve-ngo/${id}`, { method: 'PATCH' }),
    onSuccess: () => {
      toast.success('NGO Approved successfully');
      queryClient.invalidateQueries({ queryKey: ['pendingNgos'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: () => toast.error('Failed to approve NGO')
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => 
      fetchApi(`/admin/reject-ngo/${id}`, { 
        method: 'PATCH', 
        body: JSON.stringify({ reason }) 
      }),
    onSuccess: () => {
      toast.success('NGO Rejected');
      queryClient.invalidateQueries({ queryKey: ['pendingNgos'] });
    },
    onError: () => toast.error('Failed to reject NGO')
  });

  const approveProfileMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/admin/pending-updates/${id}/approve`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Profile update approved');
      queryClient.invalidateQueries({ queryKey: ['profileUpdates'] });
    },
    onError: () => toast.error('Failed to approve profile update')
  });

  const rejectProfileMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/admin/pending-updates/${id}/reject`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Profile update rejected');
      queryClient.invalidateQueries({ queryKey: ['profileUpdates'] });
    },
    onError: () => toast.error('Failed to reject profile update')
  });

  const handleApprove = (id: string) => {
    if (window.confirm('Approve this NGO?')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectMutation.mutate({ id, reason });
    }
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
    { icon: Package, label: 'All Donations', id: 'donations' },
    { icon: UserCheck, label: 'Profile Approvals', id: 'approvals' },
    { icon: Settings, label: 'Configuration', id: 'settings' }
  ];

  // Settings state
  const [settingsForm, setSettingsForm] = useState({ password: '' });
  useEffect(() => {
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update profile')
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(settingsForm);
  };

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      sidebarItems={sidebarItems} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Donations", value: stats?.totalDonations || 0, color: "text-emerald-600" },
          { title: "Completed Deliveries", value: stats?.completedDonations || 0, color: "text-emerald-600" },
          { title: "Approved NGOs", value: stats?.approvedNGOs || 0, color: "text-indigo-600" },
          { title: "Meals Distributed", value: stats?.totalFoodDistributedApprox || 0, color: "text-amber-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm shadow-slate-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">NGOs Awaiting Approval</h2>
          {(!pendingNgos || pendingNgos.length === 0) ? (
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
              No NGOs are pending approval at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingNgos.map((ngo: any) => (
                <Card key={ngo._id} className="border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">{ngo.organizationName}</h3>
                    <p className="text-xs text-slate-500 mt-1">Reg: {ngo.registrationNumber}</p>
                  </div>
                  <CardContent className="p-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm mb-6">
                      <div>
                        <dt className="text-slate-500 font-medium">Contact Name</dt>
                        <dd className="text-slate-900 mt-1">{ngo.userId?.name}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 font-medium">Contact Email</dt>
                        <dd className="text-slate-900 mt-1">{ngo.userId?.email}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-slate-500 font-medium">Address</dt>
                        <dd className="text-slate-900 mt-1">{ngo.userId?.address}</dd>
                      </div>
                    </dl>
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <Button onClick={() => handleApprove(ngo._id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Check className="h-4 w-4 mr-2" /> Approve
                      </Button>
                      <Button onClick={() => handleReject(ngo._id)} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                        <X className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">All Donations</h2>
          {(!allDonations || allDonations.length === 0) ? (
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
              No donations found.
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Food Type</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Quantity</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Donor</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-900">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {allDonations.map((d: any) => (
                    <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{d.foodType}</td>
                      <td className="px-6 py-4 text-slate-600">{d.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          d.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                          d.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{d.donorId?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(d.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Profile Updates Pending Approval</h2>
          {(!profileUpdates || profileUpdates.length === 0) ? (
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
              No profile updates are pending approval.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {profileUpdates.map((user: any) => (
                <Card key={user._id} className="border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-slate-900">{user.name} ({user.email})</h3>
                      <p className="text-xs text-slate-500 mt-1 uppercase">Role: {user.role}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Requested Changes:</h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm mb-6">
                      {Object.entries(user.pendingProfileUpdates || {}).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-slate-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                          <dd className="text-slate-900 mt-1 font-semibold text-emerald-600">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <Button onClick={() => approveProfileMutation.mutate(user._id)} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={approveProfileMutation.isPending}>
                        <Check className="h-4 w-4 mr-2" /> Approve Changes
                      </Button>
                      <Button onClick={() => rejectProfileMutation.mutate(user._id)} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" disabled={rejectProfileMutation.isPending}>
                        <X className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <Card className="max-w-2xl mx-auto border-0 shadow-sm shadow-slate-200/50">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Update your administrator password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" required placeholder="Enter new password" value={settingsForm.password} onChange={e => setSettingsForm({ password: e.target.value })} />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Saving...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

    </DashboardLayout>
  );
}
