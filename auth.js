window.ERP = window.ERP || {};

ERP.Auth = (function() {
  let currentUser = null;
  let selectedRole = 'admin';

  function setRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(b => {
      b.classList.remove('border-primary-500', 'bg-primary-50', 'text-primary-700', 'dark:bg-primary-900/30', 'dark:text-primary-400');
      b.classList.add('border-gray-300', 'dark:border-gray-600', 'text-gray-600', 'dark:text-gray-400');
    });
    const btn = document.getElementById('role' + role.charAt(0).toUpperCase() + role.slice(1));
    if (btn) {
      btn.classList.add('border-primary-500', 'bg-primary-50', 'text-primary-700', 'dark:bg-primary-900/30', 'dark:text-primary-400');
      btn.classList.remove('border-gray-300', 'dark:border-gray-600', 'text-gray-600', 'dark:text-gray-400');
    }
  }

  function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorEl = document.getElementById('loginError');

    if (!email || !password) {
      errorEl.textContent = 'Please enter email and password';
      errorEl.classList.remove('hidden');
      return;
    }

    const users = ERP.DB.getAll('users');
    const user = users.find(u => u.email === email && u.password === password && u.role === selectedRole);

    if (!user) {
      errorEl.textContent = 'Invalid credentials or wrong role selected';
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.classList.add('hidden');
    currentUser = { ...user };
    delete currentUser.password;
    localStorage.setItem('imnovyaz_session', JSON.stringify(currentUser));

    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('flex');

    ERP.App.init(currentUser);
  }

  function logout() {
    currentUser = null;
    localStorage.removeItem('imnovyaz_session');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('flex');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
  }

  function getUser() { return currentUser; }
  function getRole() { return currentUser?.role; }
  function isAdmin() { return currentUser?.role === 'admin'; }
  function isTeacher() { return currentUser?.role === 'teacher'; }
  function isParent() { return currentUser?.role === 'parent'; }

  function checkSession() {
    const session = localStorage.getItem('imnovyaz_session');
    if (session) {
      currentUser = JSON.parse(session);
      document.getElementById('loginPage').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');
      document.getElementById('mainApp').classList.add('flex');
      ERP.App.init(currentUser);
      return true;
    }
    return false;
  }

  return { setRole, login, logout, getUser, getRole, isAdmin, isTeacher, isParent, checkSession };
})();