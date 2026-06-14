const ngoHelper = {
  donations: [],

  switchTab: (tabId) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabId === 'myClaims') {
      ngoHelper.fetchMyClaims();
    }
  },

  fetchAvailableDonations: async () => {
    try {
      const res = await fetch(`${API_URL}/ngo/available-donations`, {
        headers: authHelper.getAuthHeader()
      });
      if (!res.ok) {
        if(res.status === 403) authHelper.showAlert('Your NGO account is pending approval.', 'error');
        return;
      }
      
      const data = await res.json();
      ngoHelper.donations = data;
      ngoHelper.renderDonationsList();
      if(window.mapHelper) window.mapHelper.addMarkers(data);
    } catch (err) {
      console.error(err);
    }
  },

  renderDonationsList: () => {
    const grid = document.getElementById('availableDonationsList');
    grid.innerHTML = '';
    
    if(ngoHelper.donations.length === 0) {
      grid.innerHTML = '<p>No open donations nearby.</p>';
      return;
    }
    
    ngoHelper.donations.forEach(d => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <span class="card-title">${d.foodType}</span>
          <span class="badge badge-open">Open</span>
        </div>
        <div class="card-body">
          <p><strong>Quantity:</strong> ${d.quantity}</p>
          <p><strong>Pickup:</strong> ${d.pickupAddress}</p>
          <p><strong>Donor:</strong> ${d.donorId ? d.donorId.name : 'Unknown'}</p>
          <p><strong>Available Until:</strong> ${new Date(d.availableTill).toLocaleString()}</p>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary" onclick="ngoHelper.claimDonation('${d._id}')">Claim</button>
        </div>
      `;
      grid.appendChild(card);
    });
  },

  claimDonation: async (id) => {
    if(!confirm("Are you sure you want to claim this donation? You must pick it up promptly.")) return;
    try {
      const res = await fetch(`${API_URL}/ngo/claim/${id}`, {
        method: 'POST',
        headers: authHelper.getAuthHeader()
      });
      const result = await res.json();
      if(res.ok) {
        authHelper.showAlert('Donation claimed!', 'success');
        ngoHelper.fetchAvailableDonations(); // refresh
      } else {
        authHelper.showAlert(result.msg);
      }
    } catch(err) {
      authHelper.showAlert('Error claiming donation');
    }
  },

  fetchMyClaims: async () => {
    try {
      const res = await fetch(`${API_URL}/ngo/my-claims`, {
        headers: authHelper.getAuthHeader()
      });
      const data = await res.json();
      
      const grid = document.getElementById('myClaimsList');
      grid.innerHTML = '';
      
      if(data.length === 0) {
        grid.innerHTML = '<p>You have no active claims.</p>';
        return;
      }
      
      data.forEach(d => {
        let actions = '';
        if(d.status === 'claimed') {
          actions = `<button class="btn btn-primary" onclick="ngoHelper.collectDonation('${d._id}')">Mark Collected</button>`;
        } else if(d.status === 'collected') {
          actions = `<button class="btn btn-primary" onclick="ngoHelper.openProofModal('${d._id}')">Upload Proof</button>`;
        } else if(d.status === 'completed') {
          actions = `<button class="btn btn-outline" disabled>Completed</button>`;
        }

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
            <p><strong>Available Until:</strong> ${new Date(d.availableTill).toLocaleString()}</p>
          </div>
          <div class="card-footer">
            ${actions}
          </div>
        `;
        grid.appendChild(card);
      });
    } catch(err) {
      console.error(err);
    }
  },

  collectDonation: async (id) => {
    if(!confirm("Mark this donation as collected?")) return;
    try {
      const res = await fetch(`${API_URL}/ngo/collect/${id}`, {
        method: 'PATCH',
        headers: authHelper.getAuthHeader()
      });
      if(res.ok) {
        authHelper.showAlert('Donation collected!', 'success');
        ngoHelper.fetchMyClaims();
      }
    } catch(err) {
      authHelper.showAlert('Error collecting donation');
    }
  },

  openProofModal: (id) => {
    document.getElementById('proofDonationId').value = id;
    const modal = document.getElementById('uploadProofModal');
    modal.classList.add('active');
    document.getElementById('closeProofModal').onclick = () => modal.classList.remove('active');
  },

  submitProof: async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitProofBtn');
    btn.disabled = true;
    btn.textContent = 'Uploading...';

    const id = document.getElementById('proofDonationId').value;
    const files = document.getElementById('proofPhotos').files;

    if(files.length < 2 || files.length > 5) {
      authHelper.showAlert('Please select between 2 and 5 photos.', 'error', 'proofAlert');
      btn.disabled = false;
      btn.textContent = 'Submit Proof';
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      const res = await fetch(`${API_URL}/ngo/proof/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authHelper.getToken()}`
        },
        body: formData
      });
      const result = await res.json();
      
      if(res.ok) {
        document.getElementById('uploadProofModal').classList.remove('active');
        authHelper.showAlert('Proof uploaded successfully!', 'success');
        ngoHelper.fetchMyClaims();
      } else {
        authHelper.showAlert(result.msg, 'error', 'proofAlert');
      }
    } catch(err) {
      authHelper.showAlert('Error uploading proof', 'error', 'proofAlert');
    }
    
    btn.disabled = false;
    btn.textContent = 'Submit Proof';
  }
};
