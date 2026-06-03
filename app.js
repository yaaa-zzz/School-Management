window.ERP = window.ERP || {};

// ============== UI UTILITIES ==============
ERP.UI = (function() {
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
  }

  function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('imnovyaz_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    lucide.createIcons();
  }

  function initTheme() {
    if (localStorage.getItem('imnovyaz_theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }

  function toast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    const div = document.createElement('div');
    div.className = `${colors[type] || colors.success} text-white px-4 py-3 rounded-lg shadow-lg animate-slideIn flex items-center gap-2 text-sm font-medium`;
    div.innerHTML = `<span>${message}</span>`;
    container.appendChild(div);
    setTimeout(() => { div.remove(); }, 3000);
  }

  function showModal(html) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    content.innerHTML = html;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    lucide.createIcons();
  }

  function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }

  function setPage(title, breadcrumb) {
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageBreadcrumb').textContent = breadcrumb;
  }

  function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatCurrency(n) {
    return '₹' + Number(n || 0).toLocaleString('en-IN');
  }

  function badge(text, type = 'default') {
    return `<span class="badge badge-${type}">${text}</span>`;
  }

  function paginationHtml(page, totalPages, onPageChange) {
    if (totalPages <= 1) return '';
    let html = '<div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">';
    html += `<span class="text-sm text-gray-500">Page ${page} of ${totalPages}</span>`;
    html += '<div class="flex gap-1">';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button onclick="${onPageChange}(${i})" class="page-btn ${i === page ? 'active' : ''}">${i}</button>`;
    }
    html += '</div></div>';
    return html;
  }

  function searchBox(id, placeholder, onInput) {
    return `<div class="relative"><i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i><input id="${id}" type="text" placeholder="${placeholder}" oninput="${onInput}" class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"></div>`;
  }

  function emptyState(icon, message) {
    return `<div class="flex flex-col items-center justify-center py-16 text-gray-400"><i data-lucide="${icon}" class="w-16 h-16 mb-4"></i><p class="text-lg">${message}</p></div>`;
  }

  // Click outside modal to close
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') closeModal();
    });
  });

  return { toggleSidebar, toggleTheme, initTheme, toast, showModal, closeModal, setPage, formatDate, formatCurrency, badge, paginationHtml, searchBox, emptyState };
})();

// ============== MAIN APP ==============
ERP.App = (function() {
  let user = null;
  let currentRoute = '';

  function init(u) {
    user = u;
    document.getElementById('headerUserName').textContent = u.name;
    document.getElementById('headerUserRole').textContent = u.role.charAt(0).toUpperCase() + u.role.slice(1);
    document.getElementById('sidebarRole').textContent = u.role.charAt(0).toUpperCase() + u.role.slice(1) + ' Portal';
    buildNav();
    const defaultRoute = u.role === 'admin' ? 'admin-dashboard' : u.role === 'teacher' ? 'teacher-dashboard' : 'parent-dashboard';
    navigate(defaultRoute);
    lucide.createIcons();
  }

  function buildNav() {
    const nav = document.getElementById('sidebarNav');
    let items = [];

    if (user.role === 'admin') {
      items = [
        { id: 'admin-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
        { id: 'admin-students', icon: 'users', label: 'Students' },
        { id: 'admin-teachers', icon: 'user-check', label: 'Teachers' },
        { id: 'admin-teacher-attendance', icon: 'calendar-check', label: 'Teacher Attendance' },
        { id: 'admin-exams', icon: 'file-text', label: 'Exams' },
        { id: 'admin-fees', icon: 'indian-rupee', label: 'Fees' },
        { id: 'admin-announcements', icon: 'megaphone', label: 'Announcements' },
      ];
    } else if (user.role === 'teacher') {
      items = [
        { id: 'teacher-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
        { id: 'teacher-students', icon: 'users', label: 'Students' },
        { id: 'teacher-attendance', icon: 'calendar-check', label: 'Attendance' },
        { id: 'teacher-marks', icon: 'bar-chart-3', label: 'Marks & Reports' },
        { id: 'teacher-homework', icon: 'book-open', label: 'Homework' },
      ];
    } else if (user.role === 'parent') {
      items = [
        { id: 'parent-dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
        { id: 'parent-attendance', icon: 'calendar-days', label: 'Attendance' },
        { id: 'parent-reports', icon: 'bar-chart-3', label: 'Report Card' },
        { id: 'parent-fees', icon: 'indian-rupee', label: 'Fees' },
        { id: 'parent-announcements', icon: 'megaphone', label: 'Announcements' },
      ];
    }

    nav.innerHTML = items.map(i => `
      <button onclick="ERP.App.navigate('${i.id}')" id="nav-${i.id}" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
        <i data-lucide="${i.icon}" class="w-4 h-4"></i> ${i.label}
      </button>
    `).join('');
    lucide.createIcons();
  }

  function navigate(route) {
    currentRoute = route;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + route);
    if (navBtn) navBtn.classList.add('active');

    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 1024) {
      sidebar.classList.add('-translate-x-full');
      document.getElementById('sidebarOverlay').classList.add('hidden');
    }

    const content = document.getElementById('mainContent');
    content.innerHTML = '<div class="flex items-center justify-center py-20"><div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>';

    setTimeout(() => {
      const handler = Routes[route];
      if (handler) handler(content);
      else content.innerHTML = ERP.UI.emptyState('alert-circle', 'Page not found');
      lucide.createIcons();
    }, 50);
  }

  const Routes = {};

  function registerRoute(id, fn) { Routes[id] = fn; }

  return { init, navigate, registerRoute, getUser: () => user };
})();

// ============== ADMIN MODULE ==============
(function() {
  // ADMIN DASHBOARD
  ERP.App.registerRoute('admin-dashboard', (el) => {
    const students = ERP.DB.getAll('students');
    const teachers = ERP.DB.getAll('teachers');
    const classes = ERP.DB.getAll('classes');
    const exams = ERP.DB.getAll('exams');
    const payments = ERP.DB.getAll('payments');
    const pendingFees = payments.filter(p => p.status === 'Pending').reduce((a, p) => a + p.amount, 0);
    const totalCollected = payments.filter(p => p.status === 'Paid').reduce((a, p) => a + p.amount, 0);
    const announcements = ERP.DB.getAll('announcements');

    ERP.UI.setPage('Dashboard', 'Home > Dashboard');

    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          ${statCard('users', 'Students', students.length, 'primary')}
          ${statCard('user-check', 'Teachers', teachers.length, 'accent')}
          ${statCard('layout-grid', 'Classes', classes.length, 'purple')}
          ${statCard('file-text', 'Exams', exams.length, 'orange')}
          ${statCard('indian-rupee', 'Collected', ERP.UI.formatCurrency(totalCollected), 'green')}
          ${statCard('alert-circle', 'Pending', ERP.UI.formatCurrency(pendingFees), 'red')}
        </div>
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 class="font-semibold mb-4 flex items-center gap-2"><i data-lucide="megaphone" class="w-4 h-4 text-primary-500"></i> Announcements</h3>
            ${announcements.slice(0,5).map(a => `
              <div class="py-3 ${announcements.indexOf(a) < announcements.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-medium text-sm">${a.title}</span>
                  ${ERP.UI.badge(a.priority, a.priority === 'High' ? 'danger' : a.priority === 'Medium' ? 'warning' : 'info')}
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">${a.message.substring(0, 80)}...</p>
              </div>
            `).join('') || '<p class="text-gray-400 text-sm">No announcements</p>'}
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 class="font-semibold mb-4 flex items-center gap-2"><i data-lucide="activity" class="w-4 h-4 text-primary-500"></i> Recent Students</h3>
            <div class="space-y-3">
              ${students.slice(0,6).map(s => `
                <div class="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50">
                  <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">${s.name.charAt(0)}</div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">${s.name}</p>
                    <p class="text-xs text-gray-500">${s.className} - ${s.section}</p>
                  </div>
                  <span class="badge badge-${s.status === 'Active' ? 'success' : 'warning'}">${s.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 class="font-semibold mb-4 flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4 text-primary-500"></i> Upcoming Exams</h3>
          <div class="grid sm:grid-cols-3 gap-4">
            ${exams.map(e => `
              <div class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition">
                <p class="font-medium text-sm">${e.name}</p>
                <p class="text-xs text-gray-500 mt-1">${ERP.UI.formatDate(e.startDate)} - ${ERP.UI.formatDate(e.endDate)}</p>
                ${ERP.UI.badge(e.status, e.status === 'Completed' ? 'success' : e.status === 'Upcoming' ? 'warning' : 'info')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;
  });

  function statCard(icon, label, value, color) {
    const colors = {
      primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
      accent: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    return `<div class="stat-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center ${colors[color] || colors.primary}">
          <i data-lucide="${icon}" class="w-5 h-5"></i>
        </div>
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">${label}</p>
          <p class="text-lg font-bold">${value}</p>
        </div>
      </div>
    </div>`;
  }

  // ============== STUDENT MANAGEMENT ==============
  let studentPage = 1;
  let studentSearch = '';

  ERP.App.registerRoute('admin-students', (el) => {
    ERP.UI.setPage('Student Management', 'Admin > Students');
    const classes = ERP.DB.getAll('classes');
    let students = ERP.DB.getAll('students');

    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      students = students.filter(s => s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q) || s.className.toLowerCase().includes(q));
    }

    const result = ERP.DB.paginate(students, studentPage, 10);

    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="flex flex-col sm:flex-row gap-3 justify-between mb-4">
          ${ERP.UI.searchBox('studentSearchInput', 'Search by name, admission no...', "ERP.Admin.studentSearch(this.value)")}
          <button onclick="ERP.Admin.showStudentForm()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Student
          </button>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="data-table w-full text-sm">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-700/50">
                  <th class="text-left px-4 py-3 font-semibold">Student</th>
                  <th class="text-left px-4 py-3 font-semibold hidden sm:table-cell">Adm No</th>
                  <th class="text-left px-4 py-3 font-semibold hidden md:table-cell">Class</th>
                  <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Gender</th>
                  <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Phone</th>
                  <th class="text-left px-4 py-3 font-semibold">Status</th>
                  <th class="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                ${result.data.map(s => `
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">${s.name.charAt(0)}</div>
                        <div>
                          <p class="font-medium">${s.name}</p>
                          <p class="text-xs text-gray-500 sm:hidden">${s.admissionNo}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 hidden sm:table-cell text-gray-600 dark:text-gray-400">${s.admissionNo}</td>
                    <td class="px-4 py-3 hidden md:table-cell">${s.className} - ${s.section}</td>
                    <td class="px-4 py-3 hidden lg:table-cell">${s.gender}</td>
                    <td class="px-4 py-3 hidden lg:table-cell text-gray-600 dark:text-gray-400">${s.phone}</td>
                    <td class="px-4 py-3">${ERP.UI.badge(s.status, s.status === 'Active' ? 'success' : 'warning')}</td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <button onclick="ERP.Admin.viewStudent('${s.id}')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="View"><i data-lucide="eye" class="w-4 h-4"></i></button>
                        <button onclick="ERP.Admin.showStudentForm('${s.id}')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Edit"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                        <button onclick="ERP.Admin.deleteStudent('${s.id}')" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ${result.data.length === 0 ? ERP.UI.emptyState('users', 'No students found') : ''}
          ${ERP.UI.paginationHtml(result.page, result.totalPages, 'ERP.Admin.studentPage')}
        </div>
      </div>`;
  });

  // ============== TEACHER MANAGEMENT ==============
  let teacherPage = 1;
  let teacherSearch = '';

  ERP.App.registerRoute('admin-teachers', (el) => {
    ERP.UI.setPage('Teacher Management', 'Admin > Teachers');
    let teachers = ERP.DB.getAll('teachers');

    if (teacherSearch) {
      const q = teacherSearch.toLowerCase();
      teachers = teachers.filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
    }

    const result = ERP.DB.paginate(teachers, teacherPage, 10);
    const subjects = ERP.DB.getAll('subjects');
    const classes = ERP.DB.getAll('classes');

    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="flex flex-col sm:flex-row gap-3 justify-between mb-4">
          ${ERP.UI.searchBox('teacherSearchInput', 'Search teachers...', "ERP.Admin.teacherSearch(this.value)")}
          <button onclick="ERP.Admin.showTeacherForm()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Teacher
          </button>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="data-table w-full text-sm">
              <thead><tr class="bg-gray-50 dark:bg-gray-700/50">
                <th class="text-left px-4 py-3 font-semibold">Teacher</th>
                <th class="text-left px-4 py-3 font-semibold hidden sm:table-cell">Qualification</th>
                <th class="text-left px-4 py-3 font-semibold hidden md:table-cell">Subject</th>
                <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Phone</th>
                <th class="text-left px-4 py-3 font-semibold">Status</th>
                <th class="text-right px-4 py-3 font-semibold">Actions</th>
              </tr></thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                ${result.data.map(t => {
                  const tSubjects = (t.subjects || []).map(sid => subjects.find(s => s.id === sid)?.name || '').join(', ');
                  return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td class="px-4 py-3"><div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-xs font-bold text-green-600">${t.name.charAt(0)}</div>
                      <div><p class="font-medium">${t.name}</p><p class="text-xs text-gray-500">${t.email}</p></div>
                    </div></td>
                    <td class="px-4 py-3 hidden sm:table-cell">${t.qualification || '-'}</td>
                    <td class="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-gray-400">${tSubjects || '-'}</td>
                    <td class="px-4 py-3 hidden lg:table-cell">${t.phone}</td>
                    <td class="px-4 py-3">${ERP.UI.badge(t.status || 'Active', 'success')}</td>
                    <td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-1">
                      <button onclick="ERP.Admin.viewTeacher('${t.id}')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"><i data-lucide="eye" class="w-4 h-4"></i></button>
                      <button onclick="ERP.Admin.showTeacherForm('${t.id}')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                      <button onclick="ERP.Admin.deleteTeacher('${t.id}')" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          ${ERP.UI.paginationHtml(result.page, result.totalPages, 'ERP.Admin.teacherPage')}
        </div>
      </div>`;
  });

  // ============== TEACHER ATTENDANCE ==============
  ERP.App.registerRoute('admin-teacher-attendance', (el) => {
    ERP.UI.setPage('Teacher Attendance', 'Admin > Teacher Attendance');
    const teachers = ERP.DB.getAll('teachers');
    const tAtt = ERP.DB.getAll('teacher_attendance');
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
          <h3 class="font-semibold mb-4">Mark Attendance - ${month}</h3>
          <div class="space-y-2">
            ${teachers.map(t => {
              const att = tAtt.find(a => a.teacherId === t.id && a.date === today);
              return `<div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">${t.name.charAt(0)}</div>
                  <span class="text-sm font-medium">${t.name}</span>
                </div>
                <div class="flex gap-2">
                  <button onclick="ERP.Admin.markTeacherAtt('${t.id}','Present','${today}')" class="px-3 py-1 text-xs rounded-lg ${att?.status === 'Present' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'} hover:bg-green-500 hover:text-white transition">Present</button>
                  <button onclick="ERP.Admin.markTeacherAtt('${t.id}','Absent','${today}')" class="px-3 py-1 text-xs rounded-lg ${att?.status === 'Absent' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'} hover:bg-red-500 hover:text-white transition">Absent</button>
                  <button onclick="ERP.Admin.markTeacherAtt('${t.id}','Leave','${today}')" class="px-3 py-1 text-xs rounded-lg ${att?.status === 'Leave' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'} hover:bg-yellow-500 hover:text-white transition">Leave</button>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 class="font-semibold mb-4">Monthly Report</h3>
          <table class="w-full text-sm"><thead><tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="text-left py-2">Teacher</th><th class="text-center py-2">Present</th><th class="text-center py-2">Absent</th><th class="text-center py-2">Leave</th><th class="text-center py-2">%</th>
          </tr></thead><tbody>
            ${teachers.map(t => {
              const myAtt = tAtt.filter(a => a.teacherId === t.id);
              const present = myAtt.filter(a => a.status === 'Present').length;
              const absent = myAtt.filter(a => a.status === 'Absent').length;
              const leave = myAtt.filter(a => a.status === 'Leave').length;
              const total = myAtt.length || 1;
              const pct = Math.round((present / total) * 100);
              return `<tr class="border-b border-gray-50 dark:border-gray-700/50">
                <td class="py-2 font-medium">${t.name}</td>
                <td class="text-center py-2 text-green-600 font-medium">${present}</td>
                <td class="text-center py-2 text-red-500">${absent}</td>
                <td class="text-center py-2 text-yellow-500">${leave}</td>
                <td class="text-center py-2 font-medium">${pct}%</td>
              </tr>`;
            }).join('')}
          </tbody></table>
        </div>
      </div>`;
  });

  // ============== EXAMS ==============
  let examPage = 1;

  ERP.App.registerRoute('admin-exams', (el) => {
    ERP.UI.setPage('Exams', 'Admin > Exams');
    const exams = ERP.DB.getAll('exams');
    const result = ERP.DB.paginate(exams, examPage, 10);

    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="flex justify-end mb-4">
          <button onclick="ERP.Admin.showExamForm()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <i data-lucide="plus" class="w-4 h-4"></i> Create Exam
          </button>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="data-table w-full text-sm">
              <thead><tr class="bg-gray-50 dark:bg-gray-700/50">
                <th class="text-left px-4 py-3 font-semibold">Exam Name</th>
                <th class="text-left px-4 py-3 font-semibold hidden sm:table-cell">Type</th>
                <th class="text-left px-4 py-3 font-semibold hidden md:table-cell">Start Date</th>
                <th class="text-left px-4 py-3 font-semibold hidden md:table-cell">Total Marks</th>
                <th class="text-left px-4 py-3 font-semibold">Status</th>
                <th class="text-right px-4 py-3 font-semibold">Actions</th>
              </tr></thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                ${result.data.map(e => `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td class="px-4 py-3 font-medium">${e.name}</td>
                  <td class="px-4 py-3 hidden sm:table-cell">${e.type || '-'}</td>
                  <td class="px-4 py-3 hidden md:table-cell">${ERP.UI.formatDate(e.startDate)}</td>
                  <td class="px-4 py-3 hidden md:table-cell">${e.totalMarks}</td>
                  <td class="px-4 py-3">${ERP.UI.badge(e.status, e.status === 'Completed' ? 'success' : e.status === 'Upcoming' ? 'warning' : 'info')}</td>
                  <td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-1">
                    <button onclick="ERP.Admin.showExamForm('${e.id}')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                    <button onclick="ERP.Admin.deleteExam('${e.id}')" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                  </div></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          ${ERP.UI.paginationHtml(result.page, result.totalPages, 'ERP.Admin.examPage')}
        </div>
      </div>`;
  });

  // ============== FEES ==============
  let feeTab = 'structure';
  ERP.App.registerRoute('admin-fees', (el) => {
    ERP.UI.setPage('Fees Management', 'Admin > Fees');
    const fees = ERP.DB.getAll('fees');
    const payments = ERP.DB.getAll('payments');
    const paidPayments = payments.filter(p => p.status === 'Paid');
    const pendingPayments = payments.filter(p => p.status === 'Pending');

    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-px">
          <button onclick="ERP.Admin.feeTab='structure';ERP.App.navigate('admin-fees')" class="px-4 py-2 text-sm font-medium border-b-2 ${feeTab === 'structure' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}">Fee Structure</button>
          <button onclick="ERP.Admin.feeTab='payments';ERP.App.navigate('admin-fees')" class="px-4 py-2 text-sm font-medium border-b-2 ${feeTab === 'payments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}">Payments</button>
          <button onclick="ERP.Admin.feeTab='pending';ERP.App.navigate('admin-fees')" class="px-4 py-2 text-sm font-medium border-b-2 ${feeTab === 'pending' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}">Pending (${pendingPayments.length})</button>
        </div>
        ${feeTab === 'structure' ? `
          <div class="flex justify-end mb-4"><button onclick="ERP.Admin.showFeeForm()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"><i data-lucide="plus" class="w-4 h-4"></i> Add Fee Structure</button></div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${fees.map(f => `<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <h4 class="font-semibold">${f.className}</h4>
              <p class="text-xs text-gray-500 mb-3">${f.academicYear}</p>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span>Tuition</span><span>${ERP.UI.formatCurrency(f.tuitionFee)}</span></div>
                <div class="flex justify-between"><span>Exam</span><span>${ERP.UI.formatCurrency(f.examFee)}</span></div>
                <div class="flex justify-between"><span>Library</span><span>${ERP.UI.formatCurrency(f.libraryFee)}</span></div>
                <div class="flex justify-between"><span>Transport</span><span>${ERP.UI.formatCurrency(f.transportFee)}</span></div>
                <div class="flex justify-between font-bold border-t pt-2 mt-2 border-gray-200 dark:border-gray-700"><span>Total</span><span class="text-primary-600">${ERP.UI.formatCurrency(f.totalFee)}</span></div>
              </div>
              <div class="flex gap-2 mt-4">
                <button onclick="ERP.Admin.showFeeForm('${f.id}')" class="flex-1 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Edit</button>
                <button onclick="ERP.Admin.deleteFee('${f.id}')" class="py-1.5 px-3 text-xs bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition">Delete</button>
              </div>
            </div>`).join('')}
          </div>
        ` : feeTab === 'payments' ? `
          <div class="flex justify-end mb-4"><button onclick="ERP.Admin.showPaymentForm()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"><i data-lucide="plus" class="w-4 h-4"></i> Record Payment</button></div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table class="data-table w-full text-sm"><thead><tr class="bg-gray-50 dark:bg-gray-700/50">
              <th class="text-left px-4 py-3 font-semibold">Student</th>
              <th class="text-left px-4 py-3 font-semibold hidden sm:table-cell">Receipt</th>
              <th class="text-left px-4 py-3 font-semibold hidden md:table-cell">Amount</th>
              <th class="text-left px-4 py-3 font-semibold hidden md:table-cell">Date</th>
              <th class="text-left px-4 py-3 font-semibold">Status</th>
              <th class="text-right px-4 py-3 font-semibold">Action</th>
            </tr></thead><tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              ${paidPayments.map(p => `<tr>
                <td class="px-4 py-3 font-medium">${p.studentName}</td>
                <td class="px-4 py-3 hidden sm:table-cell text-gray-500">${p.receiptNo}</td>
                <td class="px-4 py-3 hidden md:table-cell font-medium">${ERP.UI.formatCurrency(p.amount)}</td>
                <td class="px-4 py-3 hidden md:table-cell">${ERP.UI.formatDate(p.paymentDate)}</td>
                <td class="px-4 py-3">${ERP.UI.badge('Paid', 'success')}</td>
                <td class="px-4 py-3 text-right"><button onclick="ERP.Admin.viewReceipt('${p.id}')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-primary-600" title="View Receipt"><i data-lucide="file-text" class="w-4 h-4"></i></button></td>
              </tr>`).join('')}
            </tbody></table>
          </div>
        ` : `
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden">
            <table class="data-table w-full text-sm"><thead><tr class="bg-red-50 dark:bg-red-900/20">
              <th class="text-left px-4 py-3 font-semibold text-red-700 dark:text-red-400">Student</th>
              <th class="text-left px-4 py-3 font-semibold hidden sm:table-cell">Month</th>
              <th class="text-left px-4 py-3 font-semibold hidden md:table-cell">Amount</th>
              <th class="text-left px-4 py-3 font-semibold">Status</th>
              <th class="text-right px-4 py-3 font-semibold">Action</th>
            </tr></thead><tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              ${pendingPayments.map(p => `<tr>
                <td class="px-4 py-3 font-medium">${p.studentName}</td>
                <td class="px-4 py-3 hidden sm:table-cell">${p.month}</td>
                <td class="px-4 py-3 hidden md:table-cell font-medium text-red-600">${ERP.UI.formatCurrency(p.amount)}</td>
                <td class="px-4 py-3">${ERP.UI.badge('Pending', 'danger')}</td>
                <td class="px-4 py-3 text-right"><button onclick="ERP.Admin.markPaid('${p.id}')" class="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition">Mark Paid</button></td>
              </tr>`).join('')}
              ${pendingPayments.length === 0 ? '<tr><td colspan="5" class="text-center py-8 text-gray-400">No pending fees</td></tr>' : ''}
            </tbody></table>
          </div>
        `}
      </div>`;
  });

  // ============== ANNOUNCEMENTS ==============
  ERP.App.registerRoute('admin-announcements', (el) => {
    ERP.UI.setPage('Announcements', 'Admin > Announcements');
    const announcements = ERP.DB.getAll('announcements');

    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="flex justify-end mb-4">
          <button onclick="ERP.Admin.showAnnouncementForm()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"><i data-lucide="plus" class="w-4 h-4"></i> Add Announcement</button>
        </div>
        <div class="space-y-4">
          ${announcements.map(a => `
            <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold">${a.title}</h3>
                    ${ERP.UI.badge(a.priority, a.priority === 'High' ? 'danger' : a.priority === 'Medium' ? 'warning' : 'info')}
                    ${ERP.UI.badge(a.audience, 'default')}
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${a.message}</p>
                  <p class="text-xs text-gray-400 mt-2">${ERP.UI.formatDate(a.date)} · By ${a.author}</p>
                </div>
                <div class="flex gap-1 shrink-0">
                  <button onclick="ERP.Admin.showAnnouncementForm('${a.id}')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                  <button onclick="ERP.Admin.deleteAnnouncement('${a.id}')" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
              </div>
            </div>
          `).join('')}
          ${announcements.length === 0 ? ERP.UI.emptyState('megaphone', 'No announcements yet') : ''}
        </div>
      </div>`;
  });

  // ============== ADMIN ACTIONS ==============
  ERP.Admin = {};

  // Student CRUD
  ERP.Admin.studentSearch = function(val) { studentSearch = val; studentPage = 1; ERP.App.navigate('admin-students'); };
  ERP.Admin.studentPage = function(p) { studentPage = p; ERP.App.navigate('admin-students'); };

  ERP.Admin.showStudentForm = function(id) {
    const student = id ? ERP.DB.getById('students', id) : null;
    const classes = ERP.DB.getAll('classes');
    const title = student ? 'Edit Student' : 'Add New Student';

    ERP.UI.showModal(`
      <div class="p-6"><h2 class="text-xl font-semibold mb-4">${title}</h2>
      <form onsubmit="event.preventDefault();ERP.Admin.saveStudent('${id || ''}')">
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Full Name *</label><input id="sName" value="${student?.name || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Admission No</label><input id="sAdmNo" value="${student?.admissionNo || 'Auto'}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm bg-gray-50 dark:bg-gray-600" readonly></div>
          <div><label class="block text-sm font-medium mb-1">Date of Birth *</label><input id="sDob" type="date" value="${student?.dob || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Gender *</label><select id="sGender" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            <option value="Male" ${student?.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${student?.gender === 'Female' ? 'selected' : ''}>Female</option>
          </select></div>
          <div><label class="block text-sm font-medium mb-1">Blood Group</label><select id="sBlood" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            ${['A+','B+','O+','AB+','A-','B-','O-','AB-'].map(b => `<option ${student?.bloodGroup === b ? 'selected' : ''}>${b}</option>`).join('')}
          </select></div>
          <div><label class="block text-sm font-medium mb-1">Phone *</label><input id="sPhone" value="${student?.phone || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Class *</label><select id="sClass" required onchange="ERP.Admin.updateSections()" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            ${classes.map(c => `<option value="${c.id}" ${student?.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select></div>
          <div><label class="block text-sm font-medium mb-1">Section *</label><select id="sSection" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
          </select></div>
        </div>
        <div class="mt-4"><label class="block text-sm font-medium mb-1">Address</label><textarea id="sAddr" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">${student?.address || ''}</textarea></div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
          <button type="submit" class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition">Save Student</button>
        </div>
      </form></div>
    `);
    ERP.Admin.updateSections();
  };

  ERP.Admin.updateSections = function() {
    const classId = document.getElementById('sClass')?.value;
    const cls = ERP.DB.getById('classes', classId);
    const sectionEl = document.getElementById('sSection');
    if (cls && sectionEl) {
      sectionEl.innerHTML = cls.sections.map(s => `<option value="${s}">${s}</option>`).join('');
    }
  };

  ERP.Admin.saveStudent = function(id) {
    const classId = document.getElementById('sClass').value;
    const cls = ERP.DB.getById('classes', classId);
    const data = {
      name: document.getElementById('sName').value,
      dob: document.getElementById('sDob').value,
      gender: document.getElementById('sGender').value,
      bloodGroup: document.getElementById('sBlood').value,
      phone: document.getElementById('sPhone').value,
      classId: classId,
      className: cls?.name || '',
      section: document.getElementById('sSection').value,
      address: document.getElementById('sAddr').value,
      status: 'Active'
    };

    if (id) {
      ERP.DB.update('students', id, data);
      ERP.UI.toast('Student updated successfully');
    } else {
      data.admissionNo = 'ADM' + new Date().getFullYear() + (ERP.DB.getAll('students').length + 1).toString().padStart(4, '0');
      data.parentId = '';
      data.photo = '';
      ERP.DB.insert('students', data);
      ERP.UI.toast('Student added successfully');
    }
    ERP.UI.closeModal();
    ERP.App.navigate('admin-students');
  };

  ERP.Admin.viewStudent = function(id) {
    const s = ERP.DB.getById('students', id);
    if (!s) return;
    const attendance = ERP.DB.query('attendance', a => a.studentId === id);
    const present = attendance.filter(a => a.status === 'Present').length;
    const totalAtt = attendance.length || 1;
    const pct = Math.round((present / totalAtt) * 100);
    const parent = ERP.DB.query('parents', p => p.studentId === id)[0];

    ERP.UI.showModal(`
      <div class="p-6"><h2 class="text-xl font-semibold mb-4">Student Details</h2>
      <div class="grid sm:grid-cols-2 gap-4 text-sm">
        <div><p class="text-gray-500">Admission No</p><p class="font-medium">${s.admissionNo}</p></div>
        <div><p class="text-gray-500">Full Name</p><p class="font-medium">${s.name}</p></div>
        <div><p class="text-gray-500">Date of Birth</p><p class="font-medium">${ERP.UI.formatDate(s.dob)}</p></div>
        <div><p class="text-gray-500">Gender</p><p class="font-medium">${s.gender}</p></div>
        <div><p class="text-gray-500">Blood Group</p><p class="font-medium">${s.bloodGroup}</p></div>
        <div><p class="text-gray-500">Class & Section</p><p class="font-medium">${s.className} - ${s.section}</p></div>
        <div><p class="text-gray-500">Phone</p><p class="font-medium">${s.phone}</p></div>
        <div><p class="text-gray-500">Status</p><p class="font-medium">${ERP.UI.badge(s.status, 'success')}</p></div>
        <div class="sm:col-span-2"><p class="text-gray-500">Address</p><p class="font-medium">${s.address}</p></div>
        <div><p class="text-gray-500">Attendance</p><p class="font-medium">${present}/${totalAtt} (${pct}%)</p></div>
        ${parent ? `<div><p class="text-gray-500">Parent Name</p><p class="font-medium">${parent.name}</p></div>
        <div><p class="text-gray-500">Parent Occupation</p><p class="font-medium">${parent.occupation}</p></div>` : ''}
      </div>
      <div class="flex justify-end mt-6"><button onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Close</button></div>
      </div>`);
  };

  ERP.Admin.deleteStudent = function(id) {
    if (confirm('Are you sure you want to delete this student?')) {
      ERP.DB.remove('students', id);
      ERP.UI.toast('Student deleted', 'warning');
      ERP.App.navigate('admin-students');
    }
  };

  // Teacher CRUD
  ERP.Admin.teacherSearch = function(val) { teacherSearch = val; teacherPage = 1; ERP.App.navigate('admin-teachers'); };
  ERP.Admin.teacherPage = function(p) { teacherPage = p; ERP.App.navigate('admin-teachers'); };

  ERP.Admin.showTeacherForm = function(id) {
    const teacher = id ? ERP.DB.getById('teachers', id) : null;
    const subjects = ERP.DB.getAll('subjects');
    const classes = ERP.DB.getAll('classes');
    const title = teacher ? 'Edit Teacher' : 'Add New Teacher';

    ERP.UI.showModal(`
      <div class="p-6"><h2 class="text-xl font-semibold mb-4">${title}</h2>
      <form onsubmit="event.preventDefault();ERP.Admin.saveTeacher('${id || ''}')">
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Full Name *</label><input id="tName" value="${teacher?.name || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Email *</label><input id="tEmail" type="email" value="${teacher?.email || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Phone *</label><input id="tPhone" value="${teacher?.phone || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Gender</label><select id="tGender" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            <option ${teacher?.gender === 'Male' ? 'selected' : ''}>Male</option><option ${teacher?.gender === 'Female' ? 'selected' : ''}>Female</option>
          </select></div>
          <div><label class="block text-sm font-medium mb-1">Qualification</label><input id="tQual" value="${teacher?.qualification || ''}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Salary</label><input id="tSalary" type="number" value="${teacher?.salary || ''}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Joining Date</label><input id="tJoin" type="date" value="${teacher?.joiningDate || ''}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">${!teacher ? 'Password' : ''}</label>${!teacher ? `<input id="tPass" value="teacher123" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">` : ''}</div>
        </div>
        <div class="mt-4"><label class="block text-sm font-medium mb-1">Address</label><textarea id="tAddr" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">${teacher?.address || ''}</textarea></div>
        <div class="mt-4"><label class="block text-sm font-medium mb-2">Assign Subjects</label><div class="flex flex-wrap gap-2">${subjects.map(s => `<label class="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${(teacher?.subjects || []).includes(s.id) ? 'bg-primary-50 border-primary-300 dark:bg-primary-900/20 dark:border-primary-700' : 'border-gray-300 dark:border-gray-600'}">
          <input type="checkbox" class="tSubject accent-primary-600" value="${s.id}" ${(teacher?.subjects || []).includes(s.id) ? 'checked' : ''}> ${s.name}
        </label>`).join('')}</div></div>
        <div class="mt-4"><label class="block text-sm font-medium mb-2">Assign Classes</label><div class="flex flex-wrap gap-2">${classes.map(c => `<label class="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${(teacher?.classes || []).includes(c.id) ? 'bg-primary-50 border-primary-300 dark:bg-primary-900/20 dark:border-primary-700' : 'border-gray-300 dark:border-gray-600'}">
          <input type="checkbox" class="tClass accent-primary-600" value="${c.id}" ${(teacher?.classes || []).includes(c.id) ? 'checked' : ''}> ${c.name}
        </label>`).join('')}</div></div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
          <button type="submit" class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition">Save Teacher</button>
        </div>
      </form></div>`);
  };

  ERP.Admin.saveTeacher = function(id) {
    const subjects = [...document.querySelectorAll('.tSubject:checked')].map(c => c.value);
    const classes = [...document.querySelectorAll('.tClass:checked')].map(c => c.value);
    const data = {
      name: document.getElementById('tName').value,
      email: document.getElementById('tEmail').value,
      phone: document.getElementById('tPhone').value,
      gender: document.getElementById('tGender').value,
      qualification: document.getElementById('tQual').value,
      salary: Number(document.getElementById('tSalary').value) || 0,
      joiningDate: document.getElementById('tJoin').value,
      address: document.getElementById('tAddr').value,
      subjects, classes, status: 'Active', photo: ''
    };

    if (id) {
      ERP.DB.update('teachers', id, data);
      ERP.UI.toast('Teacher updated successfully');
    } else {
      data.password = document.getElementById('tPass')?.value || 'teacher123';
      ERP.DB.insert('teachers', data);
      // Also create user
      ERP.DB.insert('users', { email: data.email, password: data.password, role: 'teacher', name: data.name, linkedId: '' });
      ERP.UI.toast('Teacher added successfully');
    }
    ERP.UI.closeModal();
    ERP.App.navigate('admin-teachers');
  };

  ERP.Admin.viewTeacher = function(id) {
    const t = ERP.DB.getById('teachers', id);
    if (!t) return;
    const subjects = ERP.DB.getAll('subjects');
    const classes = ERP.DB.getAll('classes');
    const subNames = (t.subjects || []).map(sid => subjects.find(s => s.id === sid)?.name).join(', ');
    const clsNames = (t.classes || []).map(cid => classes.find(c => c.id === cid)?.name).join(', ');

    ERP.UI.showModal(`
      <div class="p-6"><h2 class="text-xl font-semibold mb-4">Teacher Details</h2>
      <div class="grid sm:grid-cols-2 gap-4 text-sm">
        <div><p class="text-gray-500">Name</p><p class="font-medium">${t.name}</p></div>
        <div><p class="text-gray-500">Email</p><p class="font-medium">${t.email}</p></div>
        <div><p class="text-gray-500">Phone</p><p class="font-medium">${t.phone}</p></div>
        <div><p class="text-gray-500">Gender</p><p class="font-medium">${t.gender}</p></div>
        <div><p class="text-gray-500">Qualification</p><p class="font-medium">${t.qualification}</p></div>
        <div><p class="text-gray-500">Salary</p><p class="font-medium">${ERP.UI.formatCurrency(t.salary)}</p></div>
        <div><p class="text-gray-500">Subjects</p><p class="font-medium">${subNames || '-'}</p></div>
        <div><p class="text-gray-500">Classes</p><p class="font-medium">${clsNames || '-'}</p></div>
        <div class="sm:col-span-2"><p class="text-gray-500">Address</p><p class="font-medium">${t.address}</p></div>
      </div>
      <div class="flex justify-end mt-6"><button onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg transition">Close</button></div>
      </div>`);
  };

  ERP.Admin.deleteTeacher = function(id) {
    if (confirm('Delete this teacher?')) {
      ERP.DB.remove('teachers', id);
      ERP.UI.toast('Teacher deleted', 'warning');
      ERP.App.navigate('admin-teachers');
    }
  };

  // Teacher Attendance
  ERP.Admin.markTeacherAtt = function(teacherId, status, date) {
    const existing = ERP.DB.query('teacher_attendance', a => a.teacherId === teacherId && a.date === date);
    if (existing.length > 0) {
      ERP.DB.update('teacher_attendance', existing[0].id, { status });
    } else {
      ERP.DB.insert('teacher_attendance', { teacherId, date, status });
    }
    ERP.UI.toast(`${status} marked`);
    ERP.App.navigate('admin-teacher-attendance');
  };

  // Exam CRUD
  ERP.Admin.examPage = function(p) { examPage = p; ERP.App.navigate('admin-exams'); };

  ERP.Admin.showExamForm = function(id) {
    const exam = id ? ERP.DB.getById('exams', id) : null;
    const classes = ERP.DB.getAll('classes');
    const subjects = ERP.DB.getAll('subjects');

    ERP.UI.showModal(`
      <div class="p-6"><h2 class="text-xl font-semibold mb-4">${exam ? 'Edit' : 'Create'} Exam</h2>
      <form onsubmit="event.preventDefault();ERP.Admin.saveExam('${id || ''}')">
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Exam Name *</label><input id="eName" value="${exam?.name || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Type</label><select id="eType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            <option ${exam?.type === 'Unit Test' ? 'selected' : ''}>Unit Test</option>
            <option ${exam?.type === 'Term Exam' ? 'selected' : ''}>Term Exam</option>
            <option ${exam?.type === 'Final Exam' ? 'selected' : ''}>Final Exam</option>
          </select></div>
          <div><label class="block text-sm font-medium mb-1">Start Date *</label><input id="eStart" type="date" value="${exam?.startDate || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">End Date *</label><input id="eEnd" type="date" value="${exam?.endDate || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Total Marks</label><input id="eMarks" type="number" value="${exam?.totalMarks || 100}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Status</label><select id="eStatus" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            <option ${exam?.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
            <option ${exam?.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
            <option ${exam?.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
            <option ${exam?.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select></div>
        </div>
        <div class="mt-4"><label class="block text-sm font-medium mb-1">Class</label><select id="eClass" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
          ${classes.map(c => `<option value="${c.id}" ${exam?.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select></div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
          <button type="submit" class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition">${exam ? 'Update' : 'Create'} Exam</button>
        </div>
      </form></div>`);
  };

  ERP.Admin.saveExam = function(id) {
    const data = {
      name: document.getElementById('eName').value,
      type: document.getElementById('eType').value,
      startDate: document.getElementById('eStart').value,
      endDate: document.getElementById('eEnd').value,
      totalMarks: Number(document.getElementById('eMarks').value),
      status: document.getElementById('eStatus').value,
      classId: document.getElementById('eClass').value,
      subjectIds: ERP.DB.getAll('subjects').slice(0, 4).map(s => s.id)
    };
    if (id) { ERP.DB.update('exams', id, data); ERP.UI.toast('Exam updated'); }
    else { ERP.DB.insert('exams', data); ERP.UI.toast('Exam created'); }
    ERP.UI.closeModal();
    ERP.App.navigate('admin-exams');
  };

  ERP.Admin.deleteExam = function(id) {
    if (confirm('Delete this exam?')) { ERP.DB.remove('exams', id); ERP.UI.toast('Exam deleted', 'warning'); ERP.App.navigate('admin-exams'); }
  };

  // Fee forms
  ERP.Admin.showFeeForm = function(id) {
    const fee = id ? ERP.DB.getById('fees', id) : null;
    const classes = ERP.DB.getAll('classes');

    ERP.UI.showModal(`
      <div class="p-6"><h2 class="text-xl font-semibold mb-4">${fee ? 'Edit' : 'Add'} Fee Structure</h2>
      <form onsubmit="event.preventDefault();ERP.Admin.saveFee('${id || ''}')">
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Class *</label><select id="fClass" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            ${classes.map(c => `<option value="${c.id}" ${fee?.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select></div>
          <div><label class="block text-sm font-medium mb-1">Academic Year</label><input id="fYear" value="${fee?.academicYear || '2024-25'}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Tuition Fee</label><input id="fTuition" type="number" value="${fee?.tuitionFee || 0}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Exam Fee</label><input id="fExam" type="number" value="${fee?.examFee || 0}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Library Fee</label><input id="fLib" type="number" value="${fee?.libraryFee || 0}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Transport Fee</label><input id="fTrans" type="number" value="${fee?.transportFee || 0}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
          <button type="submit" class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Save</button>
        </div>
      </form></div>`);
  };

  ERP.Admin.saveFee = function(id) {
    const classId = document.getElementById('fClass').value;
    const cls = ERP.DB.getById('classes', classId);
    const tuition = Number(document.getElementById('fTuition').value);
    const exam = Number(document.getElementById('fExam').value);
    const lib = Number(document.getElementById('fLib').value);
    const trans = Number(document.getElementById('fTrans').value);
    const data = { classId, className: cls?.name || '', academicYear: document.getElementById('fYear').value, tuitionFee: tuition, examFee: exam, libraryFee: lib, transportFee: trans, totalFee: tuition + exam + lib + trans };
    if (id) { ERP.DB.update('fees', id, data); ERP.UI.toast('Fee updated'); }
    else { ERP.DB.insert('fees', data); ERP.UI.toast('Fee structure added'); }
    ERP.UI.closeModal(); ERP.App.navigate('admin-fees');
  };

  ERP.Admin.deleteFee = function(id) {
    if (confirm('Delete fee structure?')) { ERP.DB.remove('fees', id); ERP.UI.toast('Deleted', 'warning'); ERP.App.navigate('admin-fees'); }
  };

  ERP.Admin.showPaymentForm = function() {
    const students = ERP.DB.getAll('students');
    ERP.UI.showModal(`
      <div class="p-6"><h2 class="text-xl font-semibold mb-4">Record Payment</h2>
      <form onsubmit="event.preventDefault();ERP.Admin.savePayment()">
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Student *</label><select id="pStudent" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            ${students.map(s => `<option value="${s.id}" data-name="${s.name}" data-class="${s.classId}">${s.name} (${s.className})</option>`).join('')}
          </select></div>
          <div><label class="block text-sm font-medium mb-1">Amount *</label><input id="pAmount" type="number" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Month</label><select id="pMonth" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            ${['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => `<option>${m}</option>`).join('')}
          </select></div>
          <div><label class="block text-sm font-medium mb-1">Payment Method</label><select id="pMethod" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            <option>Cash</option><option>Online</option><option>Cheque</option>
          </select></div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
          <button type="submit" class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Record Payment</button>
        </div>
      </form></div>`);
  };

  ERP.Admin.savePayment = function() {
    const sel = document.getElementById('pStudent');
    const opt = sel.options[sel.selectedIndex];
    const payments = ERP.DB.getAll('payments');
    const data = {
      studentId: sel.value, studentName: opt.dataset.name, classId: opt.dataset.class,
      amount: Number(document.getElementById('pAmount').value),
      month: document.getElementById('pMonth').value,
      paymentMethod: document.getElementById('pMethod').value,
      paymentDate: new Date().toISOString().split('T')[0],
      receiptNo: 'RCP' + (1000 + payments.length + 1),
      status: 'Paid', academicYear: '2024-25'
    };
    ERP.DB.insert('payments', data);
    ERP.UI.toast('Payment recorded');
    ERP.UI.closeModal(); ERP.App.navigate('admin-fees');
  };

  ERP.Admin.markPaid = function(id) {
    ERP.DB.update('payments', id, { status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] });
    ERP.UI.toast('Marked as paid');
    ERP.App.navigate('admin-fees');
  };

  ERP.Admin.viewReceipt = function(id) {
    const p = ERP.DB.getById('payments', id);
    if (!p) return;
    ERP.UI.showModal(`
      <div class="p-6" id="printArea"><div class="text-center mb-6 pb-4 border-b"><h2 class="text-xl font-bold">Imnovyaz School</h2><p class="text-sm text-gray-500">Fee Receipt</p></div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between"><span class="text-gray-500">Receipt No:</span><span class="font-medium">${p.receiptNo}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Student:</span><span class="font-medium">${p.studentName}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Amount:</span><span class="font-medium text-green-600">${ERP.UI.formatCurrency(p.amount)}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Month:</span><span class="font-medium">${p.month}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Method:</span><span class="font-medium">${p.paymentMethod}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">Date:</span><span class="font-medium">${ERP.UI.formatDate(p.paymentDate)}</span></div>
      </div>
      <div class="flex justify-end gap-3 mt-6"><button onclick="window.print()" class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg flex items-center gap-2"><i data-lucide="printer" class="w-4 h-4"></i> Print</button><button onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg">Close</button></div>
      </div>`);
  };

  // Announcement CRUD
  ERP.Admin.showAnnouncementForm = function(id) {
    const ann = id ? ERP.DB.getById('announcements', id) : null;
    ERP.UI.showModal(`
      <div class="p-6"><h2 class="text-xl font-semibold mb-4">${ann ? 'Edit' : 'Add'} Announcement</h2>
      <form onsubmit="event.preventDefault();ERP.Admin.saveAnnouncement('${id || ''}')">
        <div class="space-y-4">
          <div><label class="block text-sm font-medium mb-1">Title *</label><input id="aTitle" value="${ann?.title || ''}" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Message *</label><textarea id="aMsg" rows="4" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">${ann?.message || ''}</textarea></div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium mb-1">Priority</label><select id="aPriority" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
              <option ${ann?.priority === 'Low' ? 'selected' : ''}>Low</option><option ${ann?.priority === 'Medium' ? 'selected' : ''}>Medium</option><option ${ann?.priority === 'High' ? 'selected' : ''}>High</option>
            </select></div>
            <div><label class="block text-sm font-medium mb-1">Audience</label><select id="aAudience" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
              <option ${ann?.audience === 'All' ? 'selected' : ''}>All</option><option ${ann?.audience === 'Parents' ? 'selected' : ''}>Parents</option><option ${ann?.audience === 'Teachers' ? 'selected' : ''}>Teachers</option>
            </select></div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
          <button type="submit" class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Save</button>
        </div>
      </form></div>`);
  };

  ERP.Admin.saveAnnouncement = function(id) {
    const data = { title: document.getElementById('aTitle').value, message: document.getElementById('aMsg').value, priority: document.getElementById('aPriority').value, audience: document.getElementById('aAudience').value, date: new Date().toISOString().split('T')[0], author: 'Admin' };
    if (id) { ERP.DB.update('announcements', id, data); ERP.UI.toast('Updated'); }
    else { ERP.DB.insert('announcements', data); ERP.UI.toast('Announcement added'); }
    ERP.UI.closeModal(); ERP.App.navigate('admin-announcements');
  };

  ERP.Admin.deleteAnnouncement = function(id) {
    if (confirm('Delete announcement?')) { ERP.DB.remove('announcements', id); ERP.UI.toast('Deleted', 'warning'); ERP.App.navigate('admin-announcements'); }
  };
})();

// ============== TEACHER MODULE ==============
(function() {
  let attDate = new Date().toISOString().split('T')[0];
  let attClass = '';

  ERP.App.registerRoute('teacher-dashboard', (el) => {
    const user = ERP.App.getUser();
    const teacher = ERP.DB.getAll('teachers').find(t => t.email === user.email);
    const subjects = ERP.DB.getAll('subjects');
    const classes = ERP.DB.getAll('classes');
    const students = ERP.DB.getAll('students');
    const tClasses = (teacher?.classes || []).map(cid => classes.find(c => c.id === cid)).filter(Boolean);
    const tSubjects = (teacher?.subjects || []).map(sid => subjects.find(s => s.id === sid)).filter(Boolean);
    const myStudents = students.filter(s => (teacher?.classes || []).includes(s.classId));
    const homework = ERP.DB.getAll('homework').filter(h => h.teacherId === teacher?.id);
    const exams = ERP.DB.getAll('exams').filter(e => e.status === 'Upcoming' || e.status === 'Scheduled');

    ERP.UI.setPage('Teacher Dashboard', 'Home > Dashboard');
    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          ${statCard('layout-grid', 'Classes', tClasses.length, 'primary')}
          ${statCard('users', 'Students', myStudents.length, 'accent')}
          ${statCard('book-open', 'Subjects', tSubjects.length, 'purple')}
          ${statCard('clipboard-list', 'Homework', homework.length, 'orange')}
        </div>
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 class="font-semibold mb-4">My Classes</h3>
            <div class="space-y-2">${tClasses.map(c => {
              const count = students.filter(s => s.classId === c.id).length;
              return `<div class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50">
                <span class="text-sm font-medium">${c.name} (${c.sections.join(', ')})</span>
                <span class="badge badge-info">${count} students</span></div>`;
            }).join('')}</div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 class="font-semibold mb-4">My Subjects</h3>
            <div class="flex flex-wrap gap-2">${tSubjects.map(s => `<span class="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium">${s.name}</span>`).join('')}</div>
            <h3 class="font-semibold mt-6 mb-3">Upcoming Exams</h3>
            ${exams.length > 0 ? exams.map(e => `<div class="py-2 border-b border-gray-50 dark:border-gray-700/50 flex justify-between"><span class="text-sm">${e.name}</span>${ERP.UI.badge(e.status, 'warning')}</div>`).join('') : '<p class="text-gray-400 text-sm">No upcoming exams</p>'}
          </div>
        </div>
      </div>`;
  });

  function statCard(icon, label, value, color) {
    const cls = { primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400', accent: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400', purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' };
    return `<div class="stat-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center ${cls[color]}"><i data-lucide="${icon}" class="w-5 h-5"></i></div>
      <div><p class="text-xs text-gray-500">${label}</p><p class="text-lg font-bold">${value}</p></div></div></div>`;
  }

  // Teacher - Students View
  ERP.App.registerRoute('teacher-students', (el) => {
    const user = ERP.App.getUser();
    const teacher = ERP.DB.getAll('teachers').find(t => t.email === user.email);
    const subjects = ERP.DB.getAll('subjects');
    let students = ERP.DB.getAll('students').filter(s => (teacher?.classes || []).includes(s.classId));

    ERP.UI.setPage('My Students', 'Teacher > Students');
    el.innerHTML = `
      <div class="animate-fadeIn">
        ${ERP.UI.searchBox('tStudSearch', 'Search students...', "ERP.Teacher.searchStudents(this.value)")}
        <div class="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table class="data-table w-full text-sm"><thead><tr class="bg-gray-50 dark:bg-gray-700/50">
            <th class="text-left px-4 py-3 font-semibold">Name</th>
            <th class="text-left px-4 py-3 font-semibold hidden sm:table-cell">Class</th>
            <th class="text-left px-4 py-3 font-semibold hidden md:table-cell">Phone</th>
            <th class="text-right px-4 py-3 font-semibold">Actions</th>
          </tr></thead><tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            ${students.map(s => `<tr>
              <td class="px-4 py-3"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">${s.name.charAt(0)}</div><span class="font-medium">${s.name}</span></div></td>
              <td class="px-4 py-3 hidden sm:table-cell">${s.className} - ${s.section}</td>
              <td class="px-4 py-3 hidden md:table-cell text-gray-500">${s.phone}</td>
              <td class="px-4 py-3 text-right"><button onclick="ERP.Teacher.editStudent('${s.id}')" class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><i data-lucide="pencil" class="w-4 h-4"></i></button></td>
            </tr>`).join('')}
          </tbody></table>
        </div>
      </div>`;
  });

  ERP.Teacher = {};

  ERP.Teacher.editStudent = function(id) {
    const s = ERP.DB.getById('students', id);
    if (!s) return;
    const classes = ERP.DB.getAll('classes');
    ERP.UI.showModal(`
      <div class="p-6"><h2 class="text-xl font-semibold mb-4">Edit Student - ${s.name}</h2>
      <form onsubmit="event.preventDefault();ERP.Teacher.saveStudent('${id}')">
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Name</label><input id="tsName" value="${s.name}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Phone</label><input id="tsPhone" value="${s.phone}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
          <div><label class="block text-sm font-medium mb-1">Blood Group</label><select id="tsBlood" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            ${['A+','B+','O+','AB+','A-','B-','O-','AB-'].map(b => `<option ${s.bloodGroup === b ? 'selected' : ''}>${b}</option>`).join('')}
          </select></div>
          <div><label class="block text-sm font-medium mb-1">Address</label><input id="tsAddr" value="${s.address}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"></div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" onclick="ERP.UI.closeModal()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg">Cancel</button>
          <button type="submit" class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg">Save</button>
        </div>
      </form></div>`);
  };

  ERP.Teacher.saveStudent = function(id) {
    ERP.DB.update('students', id, {
      name: document.getElementById('tsName').value,
      phone: document.getElementById('tsPhone').value,
      bloodGroup: document.getElementById('tsBlood').value,
      address: document.getElementById('tsAddr').value
    });
    ERP.UI.toast('Student updated'); ERP.UI.closeModal(); ERP.App.navigate('teacher-students');
  };

  // Teacher - Attendance
  ERP.App.registerRoute('teacher-attendance', (el) => {
    const user = ERP.App.getUser();
    const teacher = ERP.DB.getAll('teachers').find(t => t.email === user.email);
    const classes = ERP.DB.getAll('classes');
    const tClassIds = teacher?.classes || [];
    const tClasses = tClassIds.map(cid => classes.find(c => c.id === cid)).filter(Boolean);

    if (!attClass && tClasses.length > 0) attClass = tClasses[0].id;

    const students = ERP.DB.getAll('students').filter(s => s.classId === attClass);
    const attendance = ERP.DB.getAll('attendance');

    ERP.UI.setPage('Student Attendance', 'Teacher > Attendance');
    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="flex flex-col sm:flex-row gap-3 mb-4">
          <select id="attClassSelect" onchange="ERP.Teacher.setAttClass(this.value)" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
            ${tClasses.map(c => `<option value="${c.id}" ${attClass === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
          <input type="date" id="attDateSelect" value="${attDate}" onchange="ERP.Teacher.setAttDate(this.value)" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm">
          <button onclick="ERP.Teacher.saveAttendance()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"><i data-lucide="save" class="w-4 h-4"></i> Save Attendance</button>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table class="data-table w-full text-sm"><thead><tr class="bg-gray-50 dark:bg-gray-700/50">
            <th class="text-left px-4 py-3 font-semibold">Student</th>
            <th class="text-center px-4 py-3 font-semibold">Present</th>
            <th class="text-center px-4 py-3 font-semibold">Absent</th>
            <th class="text-center px-4 py-3 font-semibold">Late</th>
          </tr></thead><tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            ${students.map(s => {
              const todayAtt = attendance.find(a => a.studentId === s.id && a.date === attDate);
              const status = todayAtt?.status || '';
              return `<tr>
                <td class="px-4 py-3 font-medium">${s.name}</td>
                <td class="text-center px-4 py-3"><input type="radio" name="att_${s.id}" value="Present" ${status === 'Present' ? 'checked' : ''} class="accent-green-600"></td>
                <td class="text-center px-4 py-3"><input type="radio" name="att_${s.id}" value="Absent" ${status === 'Absent' ? 'checked' : ''} class="accent-red-600"></td>
                <td class="text-center px-4 py-3"><input type="radio" name="att_${s.id}" value="Late" ${status === 'Late' ? 'checked' : ''} class="accent-yellow-600"></td>
              </tr>`;
            }).join('')}
          </tbody></table>
          ${students.length === 0 ? ERP.UI.emptyState('users', 'No students in this class') : ''}
        </div>
      </div>`;
  });

  ERP.Teacher.setAttClass = function(v) { attClass = v; ERP.App.navigate('teacher-attendance'); };
  ERP.Teacher.setAttDate = function(v) { attDate = v; ERP.App.navigate('teacher-attendance'); };

  ERP.Teacher.saveAttendance = function() {
    const students = ERP.DB.getAll('students').filter(s => s.classId === attClass);
    const attendance = ERP.DB.getAll('attendance');
    let saved = 0;

    students.forEach(s => {
      const radios = document.querySelectorAll(`input[name="att_${s.id}"]`);
      let status = '';
      radios.forEach(r => { if (r.checked) status = r.value; });
      if (!status) return;

      const existing = attendance.find(a => a.studentId === s.id && a.date === attDate);
      if (existing) {
        ERP.DB.update('attendance', existing.id, { status });
      } else {
        ERP.DB.insert('attendance', { studentId: s.id, classId: attClass, date: attDate, status });
      }
      saved++;
    });

    if (saved > 0) {
      ERP.UI.toast(`Attendance saved for ${saved} students`);
    } else {
      ERP.UI.toast('Please mark attendance for at least one student', 'warning');
    }
  };

  // Teacher - Marks & Reports
  ERP.App.registerRoute('teacher-marks', (el) => {
    const user = ERP.App.getUser();
    const teacher = ERP.DB.getAll('teachers').find(t => t.email === user.email);
    const subjects = ERP.DB.getAll('subjects');
    const allMarks = ERP.DB.getAll('marks');
    const classes = ERP.DB.getAll('classes');
    const students = ERP.DB.getAll('students');
    const reportCards = ERP.DB.getAll('report_cards');

    ERP.UI.setPage('Marks & Reports', 'Teacher > Marks');
    el.innerHTML = `
      <div class="animate-fadeIn">
        <div class="flex flex-col sm:flex-row gap-3 mb-4">
          <button onclick="ERP.Teacher.showMarksForm()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"><i data-lucide="plus" class="w-4 h-4"></i> Add Marks</button>
        </div>
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 class="font-semibold mb-4">Recent Marks Entries</h3>
            <div class="space-y-2">
              ${allMarks.slice(0, 15).map(m => {
                const student = students.find(s => s.id === m.studentId);
                const subject = subjects.find(s => s.id === m.subjectId);
                const pct = Math.round((m.marksObtained / m.totalMarks) * 100);
                return `<div class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50">
                  <div><p class="text-sm font-medium">${student?.name || 'Unknown'}</p><p class="text-xs text-gray-500">${subject?.name || 'Unknown'}</p></div>
                  <div class="text-right"><p class="font-medium">${m.marksObtained}/${m.totalMarks}</p>
                  <span class="badge ${pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger'}">${pct}%</span></div>
                </div>`;
              }).join('')}
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 class="font-semibold mb-4">Report Cards</h3>
            <div class="space-y-2">
              ${reportCards.slice(0, 10).map(rc => {
                const student = students.find(s => s.id === rc.studentId);
                return `<div class="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50">
                  <div><p class="text-sm font-medium">${student?.name || 'Unknown'}</p><p