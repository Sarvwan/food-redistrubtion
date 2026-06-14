const adminHelper = {
  switchTab: (tabId) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
  },

  fetchStats: async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: authHelper.getAuthHeader()
      });
      const data = await res.json();
      
      document.getElementById('adminStats').innerHTML = `
        <div class="stat-card">
          <h3>${data.totalDonations}</h3>
          <p>Total Donations</p>
        </div>
        <div class="stat-card">
          <h3>${data.completedDonations}</h3>
          <p>Completed Deliveries</p>
        </div>
        <div class="stat-card">
          <h3>${data.approvedNGOs}</h3>
          <p>Approved NGOs</p>
        </div>
        <div class="stat-card">
          <h3>${data.totalFoodDistributedApprox}</h3>
          <p>Meals Distributed</p>
        </div>
      `;
    } catch (err) {
      console.error(err);
    }
  },

  fetchPendingNGOs: async () => {
    try {
      const res = await fetch(`${API_URL}/admin/pending-ngos`, {
        headers: authHelper.getAuthHeader()
      });
      const ngos = await res.json();
      
      const grid = document.getElementById('ngosList');
      grid.innerHTML = '';
      
      if(ngos.length === 0) {
        grid.innerHTML = '<p>No NGOs are pending approval.</p>';
        return;
      }
      
      ngos.forEach(ngo => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-header">
            <span class="card-title">${ngo.organizationName}</span>
          </div>
          <div class="card-body">
            <p><strong>Category:</strong> ${ngo.category}</p>
            <p><strong>Reg Number:</strong> ${ngo.registrationNumber}</p>
            <p><strong>Contact Name:</strong> ${ngo.userId.name}</p>
            <p><strong>Email:</strong> ${ngo.userId.email}</p>
            <p><strong>Phone:</strong> ${ngo.userId.phone}</p>
            <p><strong>Address:</strong> ${ngo.userId.address}</p>
            <p><strong>Registered:</strong> ${new Date(ngo.userId.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary" onclick="adminHelper.approveNGO('${ngo._id}')">Approve</button>
            <button class="btn btn-danger" onclick="adminHelper.rejectNGO('${ngo._id}')">Reject</button>
          </div>
        `;
        grid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
    }
  },

  fetchDonations: async () => {
    const status = document.getElementById('filterStatus').value;
    const city = document.getElementById('filterCity').value;
    
    let url = `${API_URL}/admin/all-donations?`;
    if(status) url += `status=${status}&`;
    if(city) url += `city=${city}&`;

    try {
      const res = await fetch(url, { headers: authHelper.getAuthHeader() });
      const donations = await res.json();
      
      const grid = document.getElementById('donationsList');
      grid.innerHTML = '';
      
      if(donations.length === 0) {
        grid.innerHTML = '<p>No donations found.</p>';
        return;
      }
      
      donations.forEach(d => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-header">
            <span class="card-title">${d.foodType}</span>
            <span class="badge badge-${d.status}">${d.status}</span>
          </div>
          <div class="card-body">
            <p><strong>Quantity:</strong> ${d.quantity}</p>
            <p><strong>Pickup:</strong> ${d.pickupAddress}</p>
            <p><strong>Donor:</strong> ${d.donorId ? d.donorId.name : 'Unknown'}</p>
            ${d.claimedBy ? `<p><strong>Claimed By:</strong> ${d.claimedBy.organizationName}</p>` : ''}
            <p><strong>Date:</strong> ${new Date(d.createdAt).toLocaleDateString()}</p>
          </div>
        `;
        grid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
    }
  },

  approveNGO: async (id) => {
    if(!confirm("Approve this NGO?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/approve-ngo/${id}`, {
        method: 'PATCH',
        headers: authHelper.getAuthHeader()
      });
      if(res.ok) {
        authHelper.showAlert('NGO Approved', 'success');
        adminHelper.fetchPendingNGOs();
        adminHelper.fetchStats();
      }
    } catch(err) {
      authHelper.showAlert('Error approving NGO');
    }
  },

  rejectNGO: async (id) => {
    const reason = prompt("Please provide a reason for rejection:");
    if(!reason) return;
    try {
      const res = await fetch(`${API_URL}/admin/reject-ngo/${id}`, {
        method: 'PATCH',
        headers: {
          ...authHelper.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if(res.ok) {
        authHelper.showAlert('NGO Rejected', 'success');
        adminHelper.fetchPendingNGOs();
      }
    } catch(err) {
      authHelper.showAlert('Error rejecting NGO');
    }
  }
};
