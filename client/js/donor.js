const donorHelper = {
  fetchMyDonations: async () => {
    try {
      const res = await fetch(`${API_URL}/donor/my-donations`, {
        headers: authHelper.getAuthHeader()
      });
      const donations = await res.json();
      
      const grid = document.getElementById('donationsGrid');
      grid.innerHTML = '';

      if (donations.length === 0) {
        grid.innerHTML = '<p>You have not posted any donations yet.</p>';
        return;
      }

      donations.forEach(d => {
        const dateStr = new Date(d.createdAt).toLocaleDateString();
        let actions = '';
        if (d.status === 'open') {
          actions = `<button class="btn btn-danger" onclick="donorHelper.cancelDonation('${d._id}')">Cancel</button>`;
        } else if (d.status === 'completed') {
          actions = `<button class="btn btn-primary" onclick="donorHelper.viewProof('${d._id}')">View Proof</button>`;
        } else {
          actions = `<button class="btn btn-outline" disabled>Processing</button>`;
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
            <p><strong>Posted:</strong> ${dateStr}</p>
            <p><strong>Available Until:</strong> ${new Date(d.availableTill).toLocaleString()}</p>
          </div>
          <div class="card-footer">
            ${actions}
          </div>
        `;
        grid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      authHelper.showAlert('Failed to fetch donations.');
    }
  },

  cancelDonation: async (id) => {
    if(!confirm("Are you sure you want to cancel this donation?")) return;
    try {
      const res = await fetch(`${API_URL}/donor/donation/${id}/cancel`, {
        method: 'PATCH',
        headers: authHelper.getAuthHeader()
      });
      const result = await res.json();
      if(res.ok) {
        donorHelper.fetchMyDonations();
      } else {
        authHelper.showAlert(result.msg);
      }
    } catch(err) {
      authHelper.showAlert("Error cancelling donation");
    }
  },

  viewProof: async (id) => {
    try {
      const res = await fetch(`${API_URL}/donor/donation/${id}`, {
        headers: authHelper.getAuthHeader()
      });
      const data = await res.json();
      
      const proofBody = document.getElementById('proofBody');
      const modal = document.getElementById('proofModal');
      
      if (!data.proof || !data.proof.photos || data.proof.photos.length === 0) {
        proofBody.innerHTML = '<p>No proof photos found.</p>';
      } else {
        proofBody.innerHTML = `
          <p><strong>Distributed by:</strong> ${data.proof.ngoId.organizationName}</p>
          <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:15px;">
            ${data.proof.photos.map(p => `<img src="${p}" style="width:100%; max-width: 400px; border-radius:8px; margin-bottom:10px;" alt="Proof Image">`).join('')}
          </div>
        `;
      }
      
      modal.classList.add('active');
      document.getElementById('closeProofModal').onclick = () => modal.classList.remove('active');
      
    } catch (err) {
      authHelper.showAlert("Error fetching proof.");
    }
  },

  nextStep: (stepNumber) => {
    // Basic validation before going next
    if (stepNumber === 2) {
      const type = document.getElementById('foodType').value;
      const qty = document.getElementById('quantity').value;
      if (!type || !qty) {
        authHelper.showAlert('Please fill in food type and quantity.');
        return;
      }
    }

    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-dot').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`step${stepNumber}`).classList.add('active');
    for(let i=1; i<=stepNumber; i++) {
      document.getElementById(`dot${i}`).classList.add('active');
    }
  },

  submitDonation: async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    const formData = new FormData();
    formData.append('foodType', document.getElementById('foodType').value);
    formData.append('quantity', document.getElementById('quantity').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('pickupAddress', document.getElementById('pickupAddress').value);
    formData.append('longitude', document.getElementById('longitude').value);
    formData.append('latitude', document.getElementById('latitude').value);
    formData.append('availableFrom', document.getElementById('availableFrom').value);
    formData.append('availableTill', document.getElementById('availableTill').value);

    const photosInput = document.getElementById('photos');
    for (let i = 0; i < photosInput.files.length; i++) {
      formData.append('photos', photosInput.files[i]);
    }

    try {
      const res = await fetch(`${API_URL}/donor/post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authHelper.getToken()}`
        },
        body: formData
      });
      const result = await res.json();
      
      if (res.ok) {
        authHelper.showAlert('Donation posted successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard-donor.html';
        }, 1500);
      } else {
        authHelper.showAlert(result.errors ? result.errors[0].msg : result.msg);
        btn.disabled = false;
        btn.textContent = 'Submit Donation';
      }
    } catch(err) {
      authHelper.showAlert("Error posting donation.");
      btn.disabled = false;
      btn.textContent = 'Submit Donation';
    }
  }
};
