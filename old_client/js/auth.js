const API_URL = 'http://localhost:5000/api';

const authHelper = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  
  parseJwt: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch(e) {
      return null;
    }
  },

  getUser: () => {
    const token = authHelper.getToken();
    if (!token) return null;
    const decoded = authHelper.parseJwt(token);
    return decoded ? decoded.user : null;
  },

  getAuthHeader: () => {
    const token = authHelper.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  checkAuth: (requiredRoles = []) => {
    const user = authHelper.getUser();
    if (!user) {
      window.location.href = '/login.html';
      return false;
    }
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      window.location.href = '/login.html'; // Could map to a 403 page
      return false;
    }
    return user;
  },

  logout: () => {
    authHelper.removeToken();
    window.location.href = '/login.html';
  },

  setupLogoutButton: () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        authHelper.logout();
      });
    }
  },

  redirectBasedOnRole: () => {
    const user = authHelper.getUser();
    if (user) {
      if (user.role === 'admin') window.location.href = '/dashboard-admin.html';
      else if (user.role === 'ngo') window.location.href = '/dashboard-ngo.html';
      else if (user.role === 'donor') window.location.href = '/dashboard-donor.html';
    }
  },

  showAlert: (message, type = 'error', containerId = 'alertContainer') => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.textContent = message;
    container.className = `alert ${type}`;
    container.style.display = 'block';
    setTimeout(() => {
      container.style.display = 'none';
    }, 5000);
  }
};
