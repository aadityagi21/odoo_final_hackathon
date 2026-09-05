/* ==========================================================================
   Urban Furniture: Accounting System - Client Authentication Logic
   ========================================================================== */

const API_BASE = '/api/auth';

// State
let currentUserToken = localStorage.getItem('uf_auth_token');
let currentActiveTab = 'signin';

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
  if (currentUserToken) {
    verifySession();
  }
});

// Tab Switcher
function switchTab(tab) {
  currentActiveTab = tab;
  hideAlert();

  const tabNav = document.getElementById('tabNav');
  const signInBtn = document.getElementById('tabSignInBtn');
  const signUpBtn = document.getElementById('tabSignUpBtn');

  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const forgotForm = document.getElementById('forgotForm');
  const dashboardView = document.getElementById('dashboardView');
  const appContainer = document.getElementById('appContainer');

  dashboardView.style.display = 'none';
  tabNav.style.display = 'flex';
  appContainer.classList.remove('wide');

  signInForm.style.display = 'none';
  signUpForm.style.display = 'none';
  forgotForm.style.display = 'none';

  signInBtn.classList.remove('active');
  signUpBtn.classList.remove('active');

  if (tab === 'signin') {
    signInForm.style.display = 'block';
    signInBtn.classList.add('active');
  } else if (tab === 'signup') {
    signUpForm.style.display = 'block';
    signUpBtn.classList.add('active');
  } else if (tab === 'forgot') {
    forgotForm.style.display = 'block';
  }
}

// Role Radio Selection Card Handler
function selectRoleCard(role) {
  const cards = {
    'User': document.getElementById('roleUserCard'),
    'Accountant': document.getElementById('roleAccountantCard'),
    'Administrator': document.getElementById('roleAdminCard')
  };

  Object.keys(cards).forEach(key => {
    if (cards[key]) {
      cards[key].classList.remove('active');
    }
  });

  if (cards[role]) {
    cards[role].classList.add('active');
    const radio = cards[role].querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, btnElement) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btnElement.textContent = '🙈';
  } else {
    input.type = 'password';
    btnElement.textContent = '👁️';
  }
}

// Live Password Requirements Evaluator
function evaluatePasswordRequirements(password) {
  const ruleLength = document.getElementById('ruleLength');
  const ruleUpper = document.getElementById('ruleUpper');
  const ruleLower = document.getElementById('ruleLower');
  const ruleSpecial = document.getElementById('ruleSpecial');

  const isLength = password.length > 8;
  const isUpper = /[A-Z]/.test(password);
  const isLower = /[a-z]/.test(password);
  const isSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

  updateCheckItem(ruleLength, isLength, '> 8 characters');
  updateCheckItem(ruleUpper, isUpper, '1 Uppercase (A-Z)');
  updateCheckItem(ruleLower, isLower, '1 Lowercase (a-z)');
  updateCheckItem(ruleSpecial, isSpecial, '1 Special (!@#$)');

  checkPasswordMatch();
}

function updateCheckItem(element, passed, label) {
  if (!element) return;
  if (passed) {
    element.classList.add('passed');
    element.innerHTML = `<span class="check-icon">✓</span> ${label}`;
  } else {
    element.classList.remove('passed');
    element.innerHTML = `<span class="check-icon">✕</span> ${label}`;
  }
}

// Validate Login ID (6-12 chars)
function validateLoginIdInput(input) {
  const val = input.value.trim();
  if (val.length > 0 && (val.length < 6 || val.length > 12)) {
    input.classList.add('invalid');
    input.classList.remove('valid');
  } else if (val.length >= 6 && val.length <= 12) {
    input.classList.remove('invalid');
    input.classList.add('valid');
  } else {
    input.classList.remove('invalid', 'valid');
  }
}

// Check Password Match
function checkPasswordMatch() {
  const pwd = document.getElementById('signupPassword').value;
  const rePwd = document.getElementById('signupRePassword');
  const hint = document.getElementById('matchHint');

  if (!rePwd || !rePwd.value) {
    hint.style.display = 'none';
    rePwd.classList.remove('invalid', 'valid');
    return;
  }

  hint.style.display = 'block';
  if (pwd === rePwd.value) {
    rePwd.classList.remove('invalid');
    rePwd.classList.add('valid');
    hint.textContent = '✓ Passwords match';
    hint.style.color = 'var(--success)';
  } else {
    rePwd.classList.remove('valid');
    rePwd.classList.add('invalid');
    hint.textContent = '✕ Passwords do not match';
    hint.style.color = 'var(--error)';
  }
}

// Alert Message Helper
function showAlert(message, type = 'error') {
  const box = document.getElementById('alertBox');
  box.className = `alert-box ${type}`;
  box.innerHTML = `<span>${type === 'error' ? '⚠️' : '✓'}</span> <span>${message}</span>`;
  box.style.display = 'flex';
}

function hideAlert() {
  const box = document.getElementById('alertBox');
  box.style.display = 'none';
}

// Handle Login
async function handleLogin(event) {
  event.preventDefault();
  hideAlert();

  const loginId = document.getElementById('loginId').value.trim();
  const password = document.getElementById('password').value;

  const btn = document.getElementById('btnSignIn');
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> Authenticating...`;

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showAlert(data.message || 'Invalid Login Id or Password', 'error');
      btn.disabled = false;
      btn.innerHTML = `<span>SIGN IN</span>`;
      return;
    }

    // Login successful
    localStorage.setItem('uf_auth_token', data.token);
    currentUserToken = data.token;
    showAlert('Login successful! Redirecting to workspace...', 'success');

    setTimeout(() => {
      renderDashboard(data.user);
    }, 600);

  } catch (err) {
    console.error('Login error:', err);
    showAlert('Unable to reach auth server. Please check connection.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>SIGN IN</span>`;
  }
}

// Handle Sign Up
async function handleSignUp(event) {
  event.preventDefault();
  hideAlert();

  const name = document.getElementById('signupName').value.trim();
  const loginId = document.getElementById('signupLoginId').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const rePassword = document.getElementById('signupRePassword').value;

  const selectedRoleElem = document.querySelector('input[name="signupRole"]:checked');
  const role = selectedRoleElem ? selectedRoleElem.value : 'Accountant';

  // Front-end pre-validations
  if (loginId.length < 6 || loginId.length > 12) {
    showAlert('Login Id must be between 6 and 12 characters', 'error');
    return;
  }

  if (password.length <= 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    showAlert('Password must contain at least 1 uppercase, 1 lowercase, 1 special character and be more than 8 characters', 'error');
    return;
  }

  if (password !== rePassword) {
    showAlert('Password and Re-Enter Password do not match', 'error');
    return;
  }

  const btn = document.getElementById('btnSignUp');
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> Creating User...`;

  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, loginId, email, role, password, rePassword })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      showAlert(data.message || 'Registration failed', 'error');
      return;
    }

    // Registration successful!
    showAlert('User created successfully! You can now log in.', 'success');
    document.getElementById('signUpForm').reset();
    evaluatePasswordRequirements('');

    setTimeout(() => {
      switchTab('signin');
      document.getElementById('loginId').value = loginId;
    }, 1200);

  } catch (err) {
    console.error('Sign Up Error:', err);
    showAlert('Failed to process registration', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `Create`;
  }
}

// Handle Forgot Password Request
async function handleForgotPassword(event) {
  event.preventDefault();
  hideAlert();

  const loginId = document.getElementById('forgotLoginId').value.trim();
  if (!loginId) {
    showAlert('Please enter Login Id or Email', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      showAlert(data.message || 'Failed to locate user', 'error');
      return;
    }

    showAlert('Security reset token generated below! Enter new password to complete reset.', 'success');
    document.getElementById('resetTokenBox').style.display = 'block';
    document.getElementById('resetTokenInput').value = data.resetToken;

  } catch (err) {
    showAlert('Server connection error', 'error');
  }
}

// Handle Reset Password Submit
async function handleResetPasswordSubmit() {
  hideAlert();
  const resetToken = document.getElementById('resetTokenInput').value;
  const newPassword = document.getElementById('newPassword').value;
  const reNewPassword = document.getElementById('reNewPassword').value;

  if (!newPassword || newPassword.length <= 8) {
    showAlert('New password must be more than 8 characters', 'error');
    return;
  }

  if (newPassword !== reNewPassword) {
    showAlert('New passwords do not match', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword, reNewPassword })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      showAlert(data.message || 'Password update failed', 'error');
      return;
    }

    showAlert('Password updated successfully! Please sign in with your new credentials.', 'success');
    setTimeout(() => {
      document.getElementById('forgotForm').reset();
      document.getElementById('resetTokenBox').style.display = 'none';
      switchTab('signin');
    }, 1500);

  } catch (err) {
    showAlert('Server connection error', 'error');
  }
}

// Verify Session Token
async function verifySession() {
  if (!currentUserToken) return;

  try {
    const response = await fetch(`${API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${currentUserToken}` }
    });

    const data = await response.json();
    if (response.ok && data.success) {
      renderDashboard(data.user);
    } else {
      localStorage.removeItem('uf_auth_token');
      currentUserToken = null;
    }
  } catch (err) {
    console.warn('Session check failed:', err);
  }
}

// Render Role-based Welcome Dashboard
function renderDashboard(user) {
  const tabNav = document.getElementById('tabNav');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const forgotForm = document.getElementById('forgotForm');
  const dashboardView = document.getElementById('dashboardView');
  const appContainer = document.getElementById('appContainer');

  tabNav.style.display = 'none';
  signInForm.style.display = 'none';
  signUpForm.style.display = 'none';
  forgotForm.style.display = 'none';

  appContainer.classList.add('wide');
  dashboardView.style.display = 'block';

  document.getElementById('dashUserName').textContent = `Welcome, ${user.name}`;
  
  const roleBadge = document.getElementById('dashUserRole');
  roleBadge.textContent = user.role;
  roleBadge.className = `user-role-badge ${user.role}`;

  document.getElementById('dashLoginId').textContent = user.loginId;
  document.getElementById('dashEmail').textContent = user.email;

  const descElem = document.getElementById('dashRoleDesc');
  const gridElem = document.getElementById('dashModulesGrid');
  gridElem.innerHTML = '';

  if (user.role === 'Administrator') {
    descElem.textContent = 'Admin Permissions: Complete access to Master Data, Transactions, Ledger Entries, and Financial Reporting.';
    
    gridElem.innerHTML = `
      <div class="dash-card">
        <div class="dash-card-icon">📁</div>
        <h4>Master Data Modules</h4>
        <p>Manage Contacts (Customers/Vendors), Product Master, Chart of Accounts, and Journals.</p>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon">🔄</div>
        <h4>Transaction Flows</h4>
        <p>Create & manage Purchase Orders, Sales Orders, Vendor Bills, and Customer Invoices.</p>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon">📊</div>
        <h4>Financial Reports</h4>
        <p>Real-time Balance Sheet, Profit & Loss (P&L) Statements, and Budget Reports.</p>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon">⚙️</div>
        <h4>System Governance</h4>
        <p>Full user management, security logs, tax ledger computation, and system settings.</p>
      </div>
    `;
  } else if (user.role === 'Accountant') {
    descElem.textContent = 'Accountant Permissions: Create master data, record sales & purchase transactions, register payments, and view reports.';
    
    gridElem.innerHTML = `
      <div class="dash-card">
        <div class="dash-card-icon">📑</div>
        <h4>Invoices & Bills</h4>
        <p>Generate customer invoices from Sales Orders and record vendor bills from Purchase Orders.</p>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon">📓</div>
        <h4>Journal Entries</h4>
        <p>Record double-entry transactions across Cash, Bank, Sales, and Purchase Journals.</p>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon">💳</div>
        <h4>Payment Registry</h4>
        <p>Register incoming/outgoing payments against bills via Bank or Cash accounts.</p>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon">📈</div>
        <h4>Financial Overview</h4>
        <p>View profit & loss reports and budget tracking metrics.</p>
      </div>
    `;
  } else {
    // User / Contact
    descElem.textContent = 'User (Contact) Permissions: View your company invoices/bills, track payment status, and register payments.';
    
    gridElem.innerHTML = `
      <div class="dash-card">
        <div class="dash-card-icon">📄</div>
        <h4>My Invoices & Bills</h4>
        <p>Access your personal customer invoices and vendor bills (Paid / Unpaid status).</p>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon">💸</div>
        <h4>Pay Dues</h4>
        <p>Directly register payments and clear outstanding balances through bank/cash options.</p>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon">👤</div>
        <h4>Contact Profile</h4>
        <p>View your billing details, company contact information, and payment history.</p>
      </div>
    `;
  }
}

// Sign Out
function handleSignOut() {
  localStorage.removeItem('uf_auth_token');
  currentUserToken = null;
  switchTab('signin');
  showAlert('Signed out successfully', 'success');
}
