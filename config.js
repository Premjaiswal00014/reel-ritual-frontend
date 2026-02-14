// Configuration for Reel Ritual Frontend
// This file is loaded before other scripts to configure environment variables

(function() {
  // Set API Base URL based on environment
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // For development, use localhost; for production, use environment variable or same domain API
  window.API_BASE_URL = isDevelopment 
    ? 'http://localhost:5000/api'
    : (window.__API_URL__ || `${window.location.origin}/api`);
    
  console.log('API Base URL configured:', window.API_BASE_URL);
})();
