// AUTHENTICATION PAGE SCRIPT

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('signupForm').addEventListener('submit', handleSignup);
});

function switchTab(tab) {
  // Hide both forms
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';

  // Update button styles
  document.getElementById('loginTabBtn').style.background = '';
  document.getElementById('signupTabBtn').style.background = '';
  document.getElementById('loginTabBtn').style.color = '';
  document.getElementById('signupTabBtn').style.color = '';

  if (tab === 'login') {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginTabBtn').style.background = 'var(--gradient)';
    document.getElementById('loginTabBtn').style.color = 'var(--primary-black)';
    document.getElementById('signupTabBtn').style.borderColor = 'var(--gold)';
    document.getElementById('signupTabBtn').style.color = 'var(--gold)';
  } else {
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('signupTabBtn').style.background = 'var(--gradient)';
    document.getElementById('signupTabBtn').style.color = 'var(--primary-black)';
    document.getElementById('loginTabBtn').style.borderColor = 'var(--gold)';
    document.getElementById('loginTabBtn').style.color = 'var(--gold)';
  }
}

async function handleLogin(e) {
  e.preventDefault();

  try {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const result = await loginUser(email, password);

    // Store token and user data
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    // Redirect to appropriate dashboard
    const redirectUrl = result.user.role === 'owner' ? 'admin-dashboard.html' : 'client-dashboard.html';
    window.location.href = redirectUrl;
  } catch (error) {
    showAlert('loginAlert', error.message, 'error');
  }
}

async function handleSignup(e) {
  e.preventDefault();

  try {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const role = document.getElementById('signupRole').value;

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const result = await registerUser(name, email, password, role);

    // Store token and user data
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    showAlert('signupAlert', 'Account created successfully! Redirecting to dashboard...', 'success');

    // Redirect to appropriate dashboard
    setTimeout(() => {
      const redirectUrl = result.user.role === 'owner' ? 'admin-dashboard.html' : 'client-dashboard.html';
      window.location.href = redirectUrl;
    }, 1500);
  } catch (error) {
    showAlert('signupAlert', error.message, 'error');
  }
}
