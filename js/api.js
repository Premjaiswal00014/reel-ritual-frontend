// API CONFIGURATION - Support both environment and localhost
// For production, set window.API_BASE_URL before loading this script
// or use environment variables
const API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL) 
  ? window.API_BASE_URL 
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// DEBUG: Log API URL on page load
console.log('✅ API Base URL configured:', API_BASE_URL);

// GET TOKEN FROM LOCALSTORAGE
function getToken() {
  return localStorage.getItem('token');
}

// GET CURRENT USER
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// CHECK IF USER IS LOGGED IN
function isLoggedIn() {
  return !!getToken();
}

// CHECK IF USER IS OWNER
function isOwner() {
  const user = getCurrentUser();
  return user && user.role === 'owner';
}

// API CALL HELPER
async function apiCall(endpoint, method = 'GET', data = null, includeToken = true) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (includeToken && getToken()) {
    options.headers['Authorization'] = `Bearer ${getToken()}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`🔄 API Call: ${method} ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, options);
    let result = null;
    // Try to parse JSON safely
    try {
      result = await response.json();
    } catch (parseErr) {
      // Non-JSON response or empty body
      result = null;
    }

    console.log(`📧 Response Status: ${response.status}`, result);

    if (!response.ok) {
      const msg = (result && result.message) ? result.message : (response.statusText || 'API Error');
      const err = new Error(msg + ` (status: ${response.status})`);
      err.status = response.status;
      err.response = result;
      throw err;
    }

    return result;
  } catch (error) {
    // Network or other errors (including CORS/network failures)
    console.error('❌ API Error:', error.message, error);
    // Normalize fetch/network errors to a clear message
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const detailedMsg = `Failed to fetch: Could not reach API at ${fullUrl}. Make sure: 1) Backend is running on http://localhost:5000 2) CORS is enabled 3) Network is accessible`;
      console.error(detailedMsg);
      throw new Error(detailedMsg);
    }
    throw error;
  }
}

// API CALL WITH FILE UPLOAD
async function apiCallWithFile(endpoint, method = 'POST', formData) {
  const options = {
    method,
    headers: {}
  };

  if (getToken()) {
    options.headers['Authorization'] = `Bearer ${getToken()}`;
  }

  options.body = formData;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API Error');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== AUTH API ====================

async function registerUser(name, email, password, role = 'client') {
  return apiCall('/auth/register', 'POST', { name, email, password, confirmPassword: password, role });
}

async function loginUser(email, password) {
  return apiCall('/auth/login', 'POST', { email, password });
}

async function getCurrentUserData() {
  return apiCall('/auth/me', 'GET', null, true);
}

// ==================== REELS API ====================

async function getAllReels(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(`/reels${queryString ? '?' + queryString : ''}`, 'GET', null, false);
}

async function getReelById(id) {
  return apiCall(`/reels/${id}`, 'GET', null, false);
}

async function uploadReel(formData) {
  return apiCallWithFile('/reels', 'POST', formData);
}

async function updateReel(id, formData) {
  return apiCallWithFile(`/reels/${id}`, 'PUT', formData);
}

async function deleteReel(id) {
  return apiCall(`/reels/${id}`, 'DELETE', null, true);
}

// ==================== ORDERS API ====================

async function getOrders() {
  return apiCall('/orders', 'GET', null, true);
}

async function getOrderById(id) {
  return apiCall(`/orders/${id}`, 'GET', null, true);
}

async function createOrder(data, referenceFile = null, photoFiles = null, videoFiles = null) {
  const formData = new FormData();
  formData.append('packageType', data.packageType);
  formData.append('description', data.description);
  formData.append('budget', data.budget || 0);
  formData.append('deliveryDate', data.deliveryDate || '');

  if (referenceFile) {
    formData.append('reference', referenceFile);
  }

  if (photoFiles) {
    for (let i = 0; i < photoFiles.length; i++) {
      formData.append('photos', photoFiles[i]);
    }
  }

  if (videoFiles) {
    for (let i = 0; i < videoFiles.length; i++) {
      formData.append('videos', videoFiles[i]);
    }
  }

  return apiCallWithFile('/orders', 'POST', formData);
}

async function updateOrder(id, data) {
  return apiCall(`/orders/${id}`, 'PUT', data, true);
}

async function deleteOrder(id) {
  return apiCall(`/orders/${id}`, 'DELETE', null, true);
}

// ==================== TESTIMONIALS API ====================

async function getTestimonials() {
  return apiCall('/testimonials', 'GET', null, false);
}

async function getAllTestimonials() {
  return apiCall('/testimonials/admin/all', 'GET', null, true);
}

async function createTestimonial(data) {
  return apiCall('/testimonials', 'POST', data, true);
}

async function updateTestimonial(id, data) {
  return apiCall(`/testimonials/${id}`, 'PUT', data, true);
}

async function deleteTestimonial(id) {
  return apiCall(`/testimonials/${id}`, 'DELETE', null, true);
}

// ==================== FEEDBACK API ====================

async function getFeedback() {
  return apiCall('/feedback', 'GET', null, true);
}

async function createFeedback(data) {
  return apiCall('/feedback', 'POST', data, true);
}

async function updateFeedback(id, data) {
  return apiCall(`/feedback/${id}`, 'PUT', data, true);
}

async function deleteFeedback(id) {
  return apiCall(`/feedback/${id}`, 'DELETE', null, true);
}

// ==================== UTILITY FUNCTIONS ====================

function showAlert(containerId, message, type = 'success') {
  const alertDiv = document.getElementById(containerId);
  if (!alertDiv) return;

  alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  // Keep error messages visible until user dismisses (or until next action)
  if (type !== 'error') {
    setTimeout(() => {
      alertDiv.innerHTML = '';
    }, 5000);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// UPDATE AUTH BUTTONS IN HEADER
function updateAuthButtons() {
  const authButtonsDiv = document.getElementById('authButtons');
  if (!authButtonsDiv) return;

  if (isLoggedIn()) {
    const user = getCurrentUser();
    const dashboardUrl = isOwner() ? 'admin-dashboard.html' : 'client-dashboard.html';
    authButtonsDiv.innerHTML = `
      <span style="color: var(--gold);">${user.name}</span>
      <a href="${dashboardUrl}" class="btn btn-secondary">Dashboard</a>
      <button class="btn btn-logout" onclick="logout()">Logout</button>
    `;
  } else {
    authButtonsDiv.innerHTML = `<a href="login.html" class="btn btn-secondary">Login</a>`;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// CALL UPDATE AUTH BUTTONS ON PAGE LOAD
updateAuthButtons();
