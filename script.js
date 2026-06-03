// ============================================
// APP STATE
// ============================================
let currentUser = null;
let currentPage = 'dashboard';
let deleteTargetId = null;
let chartInstances = {};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initDataStore();
    lucide.createIcons();
    
    const savedUser = getData('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showApp();
    }
});

// ============================================
// AUTH & LOGIN
// ============================================
let selectedRole = 'admin';

function setRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('bg-blue-500/20', 'text-blue-300', 'border-blue-400/30');
        btn.classList.add('bg-white/5', 'text-gray-400', 'border-white/10');
    });
    const activeBtn = document.getElementById('role' + role.charAt(0).toUpperCase() + role.slice(1));
    activeBtn.classList.remove('bg-white/5', 'text-gray-400', 'border-white/10');
    activeBtn.classList.add('bg-blue-500/20', 'text-blue-300', 'border-blue-400/30');

    const emails = { admin: 'admin@imnovyaz.com', teacher: 'teacher@imnovyaz.com', parent: 'parent@imnovyaz.com' };
    document.getElementById('loginEmail').value = emails[role];
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
    
    const user = USERS.find(u => u.email === email && u.password === password);
    if (!user) { showToast('Invalid email or password', 'error'); return; }
    
    currentUser = { ...user };
    setData('currentUser', currentUser);
    showApp();
    showToast('Welcome back, ' + user.name + '!', 'success');
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('imnovyaz_currentUser');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
    document.getElementById('loginPassword').value = '';
    showToast('Logged out successfully', 'info');
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('flex');
    
    updateSidebar();
    updateUserHeader();
    updateSidebarUser();
    buildSidebarNav();
    
    navigateTo('dashboard');
}

// ============================================
// SIDEBAR NAVIGATION
// ============================================
function getNavItems() {
    const items = [
        { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', roles: ['admin','teacher','parent'] },
        { id: 'students', label: 'Students', icon: 'users', roles: ['admin','teacher'] },
        { id: 'teachers', label: 'Teachers', icon: 'user', roles: ['admin'] },
        { id: 'attendance', label: 'Attendance', icon: 'clipboard-check', roles: ['admin','teacher','parent'] },
        { id: 'fees', label: 'Fees', icon: 'credit-card', roles: ['admin','parent'] },
        { id: 'exams', label: 'Exams', icon: 'book-open', roles: ['admin','teacher','parent'] },
        { id: 'announcements', label: 'Announcements', icon: 'megaphone', roles: ['admin','teacher','parent'] },
        { id: 'settings', label: 'Settings', icon: 'settings', roles: ['admin'] }
    ];
    if (!currentUser) return items;
    return items.filter(item => item.roles.includes(currentUser.role));
}

function buildSidebarNav() {
    const nav = document.getElementById('sidebarNav');
    const items = getNavItems();
    nav.innerHTML = items.map(item => `
        <button onclick="navigateTo('${item.id}')" class="sidebar-item w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 ${currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
            <i data-lucide="${item.icon}" class="sidebar-icon w-[18px] h-[18px]"></i>
            <span class="sidebar-text text-sm font-medium">${item.label}</span>
        </button>
    `).join('');
    lucide.createIcons();
}

function updateSidebar() {
    const overlay = document.getElementById('sidebarOverlay');
    overlay.classList.add('hidden');
}

function updateUserHeader() {
    if (!currentUser) return;
    document.getElementById('headerAvatar').textContent = currentUser.avatar;
}

function updateSidebarUser() {
    if (!currentUser) return;
    document.getElementById('sidebarAvatar').textContent = currentUser.avatar;
    document.getElementById('sidebarUserName').textContent = currentUser.name;
    document.getElementById('sidebarUserRole').textContent = currentUser.role;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('hidden');
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(page) {
    currentPage = page;
    buildSidebarNav();
    
    const titles = {
        dashboard: ['Dashboard', 'Overview of school operations'],
        students: ['Student Management', 'Manage student records and profiles'],
        teachers: ['Teacher Management', 'Manage teacher information'],
        attendance: ['Attendance', 'Track student attendance records'],
        fees: ['Fee Management', 'Manage fee collection and payments'],
        exams: ['Examinations', 'Exam schedules and results'],
        announcements: ['Announcements', 'School announcements and notices'],
        settings: ['Settings', 'System configuration']
    };
    
    const [title, subtitle] = titles[page] || ['', ''];
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageSubtitle').textContent = subtitle;
    
    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
    document.getElementById('sidebarOverlay').classList.add('hidden');
    
    renderPage(page);
}

function renderPage(page) {
    const content = document.getElementById('mainContent');
    
    // Destroy existing charts
    Object.values(chartInstances).forEach(c => c.destroy());
    chartInstances = {};
    
    switch(page) {
        case 'dashboard': content.innerHTML = renderDashboard(); break;
        case 'students': content.innerHTML = renderStudents(); break;
        case 'teachers': content.innerHTML = renderTeachers(); break;
        case 'attendance': content.innerHTML = renderAttendance(); break;
        case 'fees': content.innerHTML = renderFees(); break;
        case 'exams': content.innerHTML = renderExams(); break;
        case 'announcements': content.innerHTML = renderAnnouncements(); break;
        case 'settings': content.innerHTML = renderSettings(); break;
        default: content.innerHTML = renderDashboard();
    }
    
    lucide.createIcons();
    
    // Initialize charts if dashboard
    if (page === 'dashboard') initDashboardCharts();
}

// ============================================
// DASHBOARD
// ============================================
function renderDashboard() {
    const students = getStudents();
    const teachers = getTeachers();
    const fees = getFees();
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const avgAttendance = students.length > 0 ? Math.round(students.reduce((a,s) => a + s.attendance, 0) / students.length) : 0;
    const totalFeesCollected = fees.filter(f => f.status === 'Paid').reduce((a,f) => a + f.paid, 0);
    const totalFeesDue = fees.filter(f => f.status !== 'Paid').reduce((a,f) => a + f.due, 0);
    const uniqueClasses = [...new Set(students.map(s => s.class))].length;
    const announcements = getAnnouncements();
    const exams = getExams().filter(e => e.status === 'Upcoming');

    const isParent = currentUser?.role === 'parent';
    
    return `
    <div class="fade-in space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div class="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div class="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2"></div>
            <div class="relative z-10">
                <h2 class="text-2xl font-bold mb-2">Welcome back, ${currentUser?.name?.split(' ')[0] || 'User'}! 👋</h2>
                <p class="text-blue-100 text-sm">Here's what's happening at Imnovyaz School today.</p>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            ${statCard('Total Students', activeStudents, 'users', 'from-blue-500 to-blue-600', '+12 this month')}
            ${statCard('Total Teachers', teachers.filter(t=>t.status==='Active').length, 'user', 'from-emerald-500 to-emerald-600', `${uniqueClasses} classes assigned`)}
            ${statCard('Avg Attendance', avgAttendance + '%', 'clipboard-check', 'from-amber-500 to-orange-600', 'This semester')}
            ${statCard('Fee Collected', '₹' + (totalFeesCollected/1000).toFixed(0) + 'K', 'credit-card', 'from-violet-500 to-purple-600', `₹${(totalFeesDue/1000).toFixed(0)}K pending`)}
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-2">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-800">Attendance Analytics</h3>
                    <span class="text-xs text-gray-400">Last 7 days</span>
                </div>
                <div class="chart-container"><canvas id="attendanceChart"></canvas></div>
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 p-5">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-800">Fee Status</h3>
                    <span class="text-xs text-gray-400">This quarter</span>
                </div>
                <div class="chart-container"><canvas id="feeChart"></canvas></div>
            </div>
        </div>

        <!-- Performance + Fee Collection -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="bg-white rounded-2xl border border-gray-100 p-5">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-800">Student Performance</h3>
                    <span class="text-xs text-gray-400">By subject</span>
                </div>
                <div class="chart-container"><canvas id="performanceChart"></canvas></div>
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-2">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-800">Fee Collection Analytics</h3>
                    <span class="text-xs text-gray-400">Monthly</span>
                </div>
                <div class="chart-container"><canvas id="feeCollectionChart"></canvas></div>
            </div>
        </div>

        <!-- Bottom Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Upcoming Exams -->
            <div class="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i data-lucide="calendar" class="w-4 h-4 text-blue-500"></i> Upcoming Exams
                </h3>
                <div class="space-y-3">
                    ${exams.length > 0 ? exams.slice(0,4).map(e => `
                        <div class="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl">
                            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i data-lucide="book-open" class="w-4 h-4 text-white"></i>
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-800 truncate">${e.name}</p>
                                <p class="text-xs text-gray-500">${formatDate(e.startDate)} - ${formatDate(e.endDate)}</p>
                            </div>
                        </div>
                    `).join('') : '<p class="text-gray-400 text-sm text-center py-4">No upcoming exams</p>'}
                </div>
            </div>

            <!-- Recent Activities -->
            <div class="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i data-lucide="activity" class="w-4 h-4 text-emerald-500"></i> Recent Activities
                </h3>
                <div class="space-y-3">
                    ${RECENT_ACTIVITIES.slice(0, 5).map(a => `
                        <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-lg ${activityColor(a.type)} flex items-center justify-center flex-shrink-0 mt-0.5">
                                <i data-lucide="${a.icon}" class="w-3.5 h-3.5 text-white"></i>
                            </div>
                            <div class="min-w-0">
                                <p class="text-xs text-gray-700 leading-relaxed">${a.message}</p>
                                <p class="text-[10px] text-gray-400 mt-0.5">${a.time}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Announcements -->
            <div class="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <i data-lucide="megaphone" class="w-4 h-4 text-amber-500"></i> Announcements
                </h3>
                <div class="space-y-3">
                    ${announcements.slice(0, 4).map(a => `
                        <div class="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="badge ${priorityBadge(a.priority)}">${a.priority}</span>
                                <span class="text-[10px] text-gray-400">${formatDate(a.date)}</span>
                            </div>
                            <p class="text-sm font-medium text-gray-800">${a.title}</p>
                            <p class="text-xs text-gray-500 mt-1 line-clamp-2">${a.content}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>`;
}

function statCard(label, value, icon, gradient, subtitle) {
    return `
    <div class="stat-card bg-white rounded-2xl border border-gray-100 p-5">
        <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center">
                <i data-lucide="${icon}" class="w-5 h-5 text-white"></i>
            </div>
        </div>
        <p class="text-2xl font-bold text-gray-800">${value}</p>
        <p class="text-xs text-gray-500 mt-1">${label}</p>
        <p class="text-[10px] text-gray-400 mt-0.5">${subtitle}</p>
    </div>`;
}

function activityColor(type) {
    const colors = { admission: 'bg-blue-500', fee: 'bg-emerald-500', attendance: 'bg-amber-500', exam: 'bg-violet-500', announcement: 'bg-rose-500' };
    return colors[type] || 'bg-gray-500';
}

function priorityBadge(p) {
    const m = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' };
    return m[p] || 'bg-gray-100 text-gray-700';
}

function initDashboardCharts() {
    // Attendance Chart
    const attCtx = document.getElementById('attendanceChart')?.getContext('2d');
    if (attCtx) {
        chartInstances.attendance = new Chart(attCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Attendance %',
                    data: [92, 88, 95, 91, 87, 75, 0],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.08)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#3b82f6',
                    borderWidth: 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
        });
    }

    // Fee Pie Chart
    const feeCtx = document.getElementById('feeChart')?.getContext('2d');
    if (feeCtx) {
        const fees = getFees();
        const paid = fees.filter(f => f.status === 'Paid').length;
        const pending = fees.filter(f => f.status === 'Pending').length;
        const overdue = fees.filter(f => f.status === 'Overdue').length;
        chartInstances.fee = new Chart(feeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Paid', 'Pending', 'Overdue'],
                datasets: [{ data: [paid, pending, overdue], backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0, cutout: '70%' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } } }
        });
    }

    // Performance Radar
    const perfCtx = document.getElementById('performanceChart')?.getContext('2d');
    if (perfCtx) {
        chartInstances.performance = new Chart(perfCtx, {
            type: 'radar',
            data: {
                labels: ['Math', 'Science', 'English', 'Hindi', 'Social Sci', 'Computer'],
                datasets: [{
                    label: 'Average Score',
                    data: [82, 78, 85, 90, 75, 88],
                    backgroundColor: 'rgba(139,92,246,0.15)',
                    borderColor: '#8b5cf6',
                    pointBackgroundColor: '#8b5cf6',
                    borderWidth: 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, font: { size: 9 } }, grid: { color: '#e2e8f0' }, angleLines: { color: '#e2e8f0' }, pointLabels: { font: { size: 10 } } } } }
        });
    }

    // Fee Collection Bar
    const feeCollCtx = document.getElementById('feeCollectionChart')?.getContext('2d');
    if (feeCollCtx) {
        chartInstances.feeCollection = new Chart(feeCollCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    { label: 'Collected', data: [135000, 142000, 128000, 155000, 148000, 152000], backgroundColor: '#3b82f6', borderRadius: 8, barPercentage: 0.5 },
                    { label: 'Pending', data: [15000, 8000, 22000, 5000, 12000, 8000], backgroundColor: '#f59e0b', borderRadius: 8, barPercentage: 0.5 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { callback: v => '₹' + (v/1000) + 'K' } }, x: { grid: { display: false } } } }
        });
    }
}

// ============================================
// STUDENTS PAGE
// ============================================
function renderStudents() {
    const students = getStudents();
    return `
    <div class="fade-in space-y-4">
        <!-- Header Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
                <div class="relative flex-1 sm:flex-none">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                    <input type="text" id="studentSearch" placeholder="Search students..." class="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300 w-full sm:w-64" onkeyup="filterStudents()">
                </div>
                <select id="classFilter" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300" onchange="filterStudents()">
                    <option value="">All Classes</option>
                    ${DEFAULT_CLASSES.map(c => `<option>${c}</option>`).join('')}
                </select>
            </div>
            <button onclick="openAddStudent()" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/25">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Add Student
            </button>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p class="text-2xl font-bold text-gray-800">${students.length}</p>
                <p class="text-xs text-gray-500">Total</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p class="text-2xl font-bold text-emerald-600">${students.filter(s=>s.status==='Active').length}</p>
                <p class="text-xs text-gray-500">Active</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p class="text-2xl font-bold text-amber-600">${students.filter(s=>s.feeStatus==='Pending').length}</p>
                <p class="text-xs text-gray-500">Fee Pending</p>
            </div>
            <div class="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p class="text-2xl font-bold text-red-600">${students.filter(s=>s.feeStatus==='Overdue').length}</p>
                <p class="text-xs text-gray-500">Fee Overdue</p>
            </div>
        </div>

        <!-- Students Table -->
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="bg-gray-50/80">
                            <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Adm. No</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Class</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                            <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="studentsTableBody" class="divide-y divide-gray-50">
                        ${renderStudentRows(students)}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function renderStudentRows(students) {
    if (students.length === 0) return '<tr><td colspan="6" class="text-center py-10 text-gray-400 text-sm">No students found</td></tr>';
    
    return students.map(s => `
        <tr class="table-row-hover">
            <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                    <img src="${s.photo || 'http://static.photos/people/200x200/1'}" alt="${s.fullName}" class="w-9 h-9 rounded-full object-cover border border-gray-200" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s.fullName)}&background=3b82f6&color=fff&size=36'">
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-800 truncate">${s.fullName}</p>
                        <p class="text-[11px] text-gray-400 sm:hidden">${s.admissionNo}</p>
                    </div>
                </div>
            </td>
            <td class="px-5 py-3 text-sm text-gray-600 hidden sm:table-cell">${s.admissionNo}</td>
            <td class="px-5 py-3 text-sm text-gray-600 hidden md:table-cell">${s.class} - ${s.section}</td>
            <td class="px-5 py-3 text-sm text-gray-600 hidden lg:table-cell">${s.contactNumber}</td>
            <td class="px-5 py-3">
                <span class="badge ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}">${s.status}</span>
            </td>
            <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-1">
                    <button onclick="viewStudent(${s.id})" class="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="View">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                    ${currentUser?.role !== 'parent' ? `
                    <button onclick="editStudent(${s.id})" class="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-500 transition-colors" title="Edit">
                        <i data-lucide="pencil" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteStudent(${s.id})" class="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function filterStudents() {
    const search = (document.getElementById('studentSearch')?.value || '').toLowerCase();
    const classFilter = document.getElementById('classFilter')?.value || '';
    let students = getStudents();
    
    if (search) students = students.filter(s => 
        s.fullName.toLowerCase().includes(search) || 
        s.admissionNo.toLowerCase().includes(search) ||
        s.fatherName.toLowerCase().includes(search)
    );
    if (classFilter) students = students.filter(s => s.class === classFilter);
    
    document.getElementById('studentsTableBody').innerHTML = renderStudentRows(students);
    lucide.createIcons();
}

// ============================================
// STUDENT CRUD
// ============================================
function openAddStudent() {
    document.getElementById('modalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('admissionNo').value = generateAdmissionNo();
    document.getElementById('photoPreview').innerHTML = '<i data-lucide="camera" class="w-6 h-6 text-gray-400"></i>';
    document.getElementById('studentModal').classList.remove('hidden');
    lucide.createIcons();
}

function editStudent(id) {
    const s = getStudents().find(st => st.id === id);
    if (!s) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Student';
    document.getElementById('studentId').value = s.id;
    document.getElementById('fullName').value = s.fullName;
    document.getElementById('dob').value = s.dob;
    document.getElementById('gender').value = s.gender;
    document.getElementById('bloodGroup').value = s.bloodGroup || '';
    document.getElementById('admissionNo').value = s.admissionNo;
    document.getElementById('class').value = s.class;
    document.getElementById('section').value = s.section || '';
    document.getElementById('address').value = s.address || '';
    document.getElementById('fatherName').value = s.fatherName;
    document.getElementById('motherName').value = s.motherName || '';
    document.getElementById('contactNumber').value = s.contactNumber;
    document.getElementById('altContact').value = s.altContact || '';
    document.getElementById('parentEmail').value = s.parentEmail || '';
    
    if (s.photo) {
        document.getElementById('photoPreview').innerHTML = `<img src="${s.photo}" class="w-full h-full object-cover rounded-2xl">`;
    } else {
        document.getElementById('photoPreview').innerHTML = '<i data-lucide="camera" class="w-6 h-6 text-gray-400"></i>';
    }
    
    document.getElementById('studentModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.add('hidden');
}

function handleStudentSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('studentId').value;
    const photoInput = document.getElementById('studentPhoto');
    const photoPreview = document.getElementById('photoPreview').querySelector('img');
    
    const studentData = {
        fullName: document.getElementById('fullName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        admissionNo: document.getElementById('admissionNo').value,
        class: document.getElementById('class').value,
        section: document.getElementById('section').value,
        address: document.getElementById('address').value,
        fatherName: document.getElementById('fatherName').value,
        motherName: document.getElementById('motherName').value,
        contactNumber: document.getElementById('contactNumber').value,
        altContact: document.getElementById('altContact').value,
        parentEmail: document.getElementById('parentEmail').value,
        photo: photoPreview ? photoPreview.src : `https://ui-avatars.com/api/?name=${encodeURIComponent(document.getElementById('fullName').value)}&background=3b82f6&color=fff&size=200`,
    };
    
    let students = getStudents();
    
    if (id) {
        // Edit
        const idx = students.findIndex(s => s.id === parseInt(id));
        if (idx !== -1) {
            students[idx] = { ...students[idx], ...studentData };
            showToast('Student updated successfully', 'success');
        }
    } else {
        // Add
        studentData.id = generateId(students);
        studentData.status = 'Active';
        studentData.feeStatus = 'Pending';
        studentData.attendance = 100;
        students.push(studentData);
        showToast('Student added successfully', 'success');
    }
    
    setStudents(students);
    closeStudentModal();
    navigateTo('students');
}

function previewPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover rounded-2xl">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function viewStudent(id) {
    const s = getStudents().find(st => st.id === id);
    if (!s) return;
    
    const content = document.getElementById('studentProfileContent');
    content.innerHTML = `
    <div class="space-y-6">
        <!-- Profile Header -->
        <div class="flex flex-col sm:flex-row items-center gap-4">
            <img src="${s.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.fullName) + '&background=3b82f6&color=fff&size=200'}" class="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s.fullName)}&background=3b82f6&color=fff&size=200'">
            <div class="text-center sm:text-left">
                <h3 class="text-xl font-bold text-gray-800">${s.fullName}</h3>
                <p class="text-sm text-gray-500">${s.admissionNo} · ${s.class} - ${s.section}</p>
                <div class="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                    <span class="badge ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}">${s.status}</span>
                    <span class="badge ${s.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : s.feeStatus === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}">Fee: ${s.feeStatus}</span>
                </div>
            </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-xl p-4">
                <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h4>
                <div class="space-y-2.5">
                    ${infoRow('Date of Birth', formatDate(s.dob))}
                    ${infoRow('Gender', s.gender)}
                    ${infoRow('Blood Group', s.bloodGroup || '-')}
                    ${infoRow('Attendance', s.attendance + '%')}
                    ${infoRow('Address', s.address || '-')}
                </div>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
                <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Parent Information</h4>
                <div class="space-y-2.5">
                    ${infoRow("Father's Name", s.fatherName)}
                    ${infoRow("Mother's Name", s.motherName || '-')}
                    ${infoRow('Contact', s.contactNumber)}
                    ${infoRow('Alt. Contact', s.altContact || '-')}
                    ${infoRow('Email', s.parentEmail || '-')}
                </div>
            </div>
        </div>

        <!-- Academic Stats -->
        <div class="grid grid-cols-3 gap-3">
            <div class="bg-blue-50 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-blue-600">${s.attendance}%</p>
                <p class="text-xs text-blue-500 mt-1">Attendance</p>
            </div>
            <div class="bg-emerald-50 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-emerald-600">${s.feeStatus === 'Paid' ? '✓' : '!'}</p>
                <p class="text-xs text-emerald-600 mt-1">Fee Status</p>
            </div>
            <div class="bg-violet-50 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-violet-600">${s.class.replace('Class ', '')}</p>
                <p class="text-xs text-violet-600 mt-1">Class</p>
            </div>
        </div>
    </div>`;
    
    document.getElementById('viewStudentModal').classList.remove('hidden');
    lucide.createIcons();
}

function infoRow(label, value) {
    return `<div class="flex justify-between"><span class="text-xs text-gray-500">${label}</span><span class="text-sm font-medium text-gray-800">${value}</span></div>`;
}

function closeViewModal() {
    document.getElementById('viewStudentModal').classList.add('hidden');
}

function deleteStudent(id) {
    deleteTargetId = id;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    deleteTargetId = null;
}

function confirmDelete() {
    if (deleteTargetId === null) return;
    let students = getStudents().filter(s => s.id !== deleteTargetId);
    setStudents(students);
    closeDeleteModal();
    showToast('Student deleted successfully', 'success');
    navigateTo('students');
}

// ============================================
// TEACHERS PAGE
// ============================================
function renderTeachers() {
    const teachers = getTeachers();
    return `
    <div class="fade-in space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${teachers.map(t => `
            <div class="bg-white rounded-2xl border border-gray-100 p-5 stat-card">
                <div class="flex items-center gap-3 mb-4">
                    <img src="${t.photo}" alt="${t.name}" class="w-12 h-12 rounded-xl object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=22c55e&color=fff&size=48'">
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-gray-800 truncate">${t.name}</p>
                        <span class="badge ${t.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${t.status}</span>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between text-xs"><span class="text-gray-400">Subject</span><span class="font-medium text-gray-700">${t.subject}</span></div>
                    <div class="flex justify-between text-xs"><span class="text-gray-400">Class</span><span class="font-medium text-gray-700">${t.class}</span></div>
                    <div class="flex justify-between text-xs"><span class="text-gray-400">Experience</span><span class="font-medium text-gray-700">${t.experience}</span></div>
                    <div class="flex justify-between text-xs"><span class="text-gray-400">Qualification</span><span class="font-medium text-gray-700">${t.qualification}</span></div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <a href="mailto:${t.email}" class="flex-1 text-center py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Email</a>
                    <a href="tel:${t.phone}" class="flex-1 text-center py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Call</a>
                </div>
            </div>
            `).join('')}
        </div>
    </div>`;
}

// ============================================
// ATTENDANCE PAGE
// ============================================
function renderAttendance() {
    const students = getStudents();
    const classes = [...new Set(students.map(s => s.class))].sort();
    
    if (currentUser?.role === 'parent') {
        return `
        <div class="fade-in space-y-4">
            <div class="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 class="font-semibold text-gray-800 mb-4">My Child's Attendance</h3>
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <span class="text-2xl font-bold text-blue-600">${students[0]?.attendance || 92}%</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${students[0]?.fullName || 'Student Name'}</p>
                        <p class="text-sm text-gray-500">${students[0]?.class || 'Class'} - ${students[0]?.section || 'Section'}</p>
                    </div>
                </div>
                <div class="chart-container"><canvas id="parentAttChart"></canvas></div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-emerald-50 rounded-xl p-4 text-center"><p class="text-lg font-bold text-emerald-600">18</p><p class="text-xs text-emerald-600">Days Present</p></div>
                <div class="bg-red-50 rounded-xl p-4 text-center"><p class="text-lg font-bold text-red-600">2</p><p class="text-xs text-red-600">Days Absent</p></div>
                <div class="bg-amber-50 rounded-xl p-4 text-center"><p class="text-lg font-bold text-amber-600">1</p><p class="text-xs text-amber-600">Late Arrivals</p></div>
                <div class="bg-blue-50 rounded-xl p-4 text-center"><p class="text-lg font-bold text-blue-600">2</p><p class="text-xs text-blue-600">Days Left</p></div>
            </div>
        </div>`;
    }
    
    return `
    <div class="fade-in space-y-4">
        <div class="bg-white rounded-2xl border border-gray-100 p-5">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
                <select id="attClass" class="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-300" onchange="renderAttendanceTable()">
                    <option value="">Select Class</option>
                    ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <input type="date" id="attDate" value="${new Date().toISOString().split('T')[0]}" class="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300">
                <button onclick="markAllPresent()" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors">Mark All Present</button>
            </div>
            <div id="attendanceTableContainer">
                <p class="text-gray-400 text-sm text-center py-10">Select a class to mark attendance</p>
            </div>
        </div>
    </div>`;
}

function renderAttendanceTable() {
    const selectedClass = document.getElementById('attClass').value;
    if (!selectedClass) {
        document.getElementById('attendanceTableContainer').innerHTML = '<p class="text-gray-400 text-sm text-center py-10">Select a class to mark attendance</p>';
        return;
    }
    const students = getStudents().filter(s => s.class === selectedClass);
    document.getElementById('attendanceTableContainer').innerHTML = `
        <div class="space-y-2">
            ${students.map(s => `
            <div class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-3">
                    <img src="${s.photo}" class="w-9 h-9 rounded-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s.fullName)}&background=3b82f6&color=fff&size=36'">
                    <div>
                        <p class="text-sm font-medium text-gray-800">${s.fullName}</p>
                        <p class="text-xs text-gray-400">${s.admissionNo}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="att_${s.id}" value="present" class="accent-emerald-500 w-4 h-4" checked> 
                        <span class="text-xs font-medium text-emerald-600">P</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="att_${s.id}" value="absent" class="accent-red-500 w-4 h-4"> 
                        <span class="text-xs font-medium text-red-600">A</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="att_${s.id}" value="late" class="accent-amber-500 w-4 h-4"> 
                        <span class="text-xs font-medium text-amber-600">L</span>
                    </label>
                </div>
            </div>
            `).join('')}
        </div>
        <div class="mt-4 flex justify-end">
            <button onclick="saveAttendance()" class="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/25">Save Attendance</button>
        </div>
    `;
}

function markAllPresent() {
    document.querySelectorAll('input[type="radio"][value="present"]').forEach(r => r.checked = true);
}

function saveAttendance() {
    showToast('Attendance saved successfully!', 'success');
}

// ============================================
// FEES PAGE
// ============================================
function renderFees() {
    const fees = getFees();
    const students = getStudents();
    const totalCollected = fees.filter(f => f.status === 'Paid').reduce((a,f) => a + f.paid, 0);
    const totalPending = fees.filter(f => f.status === 'Pending').reduce((a,f) => a + f.due, 0);
    const totalOverdue = fees.filter(f => f.status === 'Overdue').reduce((a,f) => a + f.due, 0);
    
    if (currentUser?.role === 'parent') {
        const myFee = fees.filter(f => f.studentId === students[0]?.id);
        return `
        <div class="fade-in space-y-4">
            <div class="grid grid-cols-3 gap-3">
                <div class="bg-emerald-50 rounded-xl p-5 text-center">
                    <p class="text-2xl font-bold text-emerald-600">₹${(totalCollected/1000).toFixed(0)}K</p>
                    <p class="text-xs text-emerald-600 mt-1">Paid</p>
                </div>
                <div class="bg-amber-50 rounded-xl p-5 text-center">
                    <p class="text-2xl font-bold text-amber-600">₹${(totalPending/1000).toFixed(0)}K</p>
                    <p class="text-xs text-amber-600 mt-1">Pending</p>
                </div>
                <div class="bg-violet-50 rounded-xl p-5 text-center">
                    <p class="text-2xl font-bold text-violet-600">₹${((totalCollected+totalPending+totalOverdue)/1000).toFixed(0)}K</p>
                    <p class="text-xs text-violet-600 mt-1">Total Fee</p>
                </div>
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table class="w-full">
                    <thead><tr class="bg-gray-50"><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th></tr></thead>
                    <tbody class="divide-y divide-gray-50">
                        ${myFee.map(f => `<tr><td class="px-5 py-3 text-sm text-gray-800">${f.type}</td><td class="px-5 py-3 text-sm text-gray-600">₹${f.amount.toLocaleString()}</td><td class="px-5 py-3"><span class="badge ${f.status==='Paid'?'bg-emerald-100 text-emerald-700':f.status==='Overdue'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}">${f.status}</span></td><td class="px-5 py-3 text-sm text-gray-500">${formatDate(f.date)}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    }
    
    return `
    <div class="fade-in space-y-4">
        <div class="grid grid-cols-3 gap-3">
            <div class="bg-emerald-50 rounded-xl p-5 text-center stat-card">
                <p class="text-2xl font-bold text-emerald-600">₹${(totalCollected/1000).toFixed(0)}K</p>
                <p class="text-xs text-emerald-600 mt-1">Collected</p>
            </div>
            <div class="bg-amber-50 rounded-xl p-5 text-center stat-card">
                <p class="text-2xl font-bold text-amber-600">₹${(totalPending/1000).toFixed(0)}K</p>
                <p class="text-xs text-amber-600 mt-1">Pending</p>
            </div>
            <div class="bg-red-50 rounded-xl p-5 text-center stat-card">
                <p class="text-2xl font-bold text-red-600">₹${(totalOverdue/1000).toFixed(0)}K</p>
                <p class="text-xs text-red-600 mt-1">Overdue</p>
            </div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead><tr class="bg-gray-50"><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Paid</th><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Due</th><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th><th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th></tr></thead>
                    <tbody class="divide-y divide-gray-50">
                        ${fees.map(f => {
                            const s = students.find(st => st.id === f.studentId);
                            return `<tr class="table-row-hover"><td class="px-5 py-3 text-sm font-medium text-gray-800">${s?.fullName || 'Unknown'}</td><td class="px-5 py-3 text-sm text-gray-600">${f.type}</td><td class="px-5 py-3 text-sm text-gray-600">₹${f.amount.toLocaleString()}</td><td class="px-5 py-3 text-sm text-emerald-600 font-medium">₹${f.paid.toLocaleString()}</td><td class="px-5 py-3 text-sm ${f.due > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}">₹${f.due.toLocaleString()}</td><td class="px-5 py-3"><span class="badge ${f.status==='Paid'?'bg-emerald-100 text-emerald-700':f.status==='Overdue'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}">${f.status}</span></td><td class="px-5 py-3 text-sm text-gray-500">${formatDate(f.date)}</td></tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

// ============================================
// EXAMS PAGE
// ============================================
function renderExams() {
    const exams = getExams();
    return `
    <div class="fade-in space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${exams.map(e => `
            <div class="bg-white rounded-2xl border border-gray-100 p-5 stat-card">
                <div class="flex items-start justify-between mb-3">
                    <div class="w-12 h-12 rounded-xl ${e.status === 'Upcoming' ? 'bg-blue-100' : 'bg-violet-100'} flex items-center justify-center">
                        <i data-lucide="book-open" class="w-6 h-6 ${e.status === 'Upcoming' ? 'text-blue-600' : 'text-violet-600'}"></i>
                    </div>
                    <span class="badge ${e.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}">${e.status}</span>
                </div>
                <h3 class="font-semibold text-gray-800 mb-2">${e.name}</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2 text-gray-600">
                        <i data-lucide="calendar" class="w-4 h-4 text-gray-400"></i>
                        ${formatDate(e.startDate)} - ${formatDate(e.endDate)}
                    </div>
                    <div class="flex items-center gap-2 text-gray-600">
                        <i data-lucide="users" class="w-4 h-4 text-gray-400"></i>
                        ${e.classes.length} Classes
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </div>`;
}

// ============================================
// ANNOUNCEMENTS PAGE
// ============================================
function renderAnnouncements() {
    const announcements = getAnnouncements();
    return `
    <div class="fade-in space-y-4">
        ${currentUser?.role === 'admin' ? `
        <button onclick="showToast('Add announcement feature coming soon!','info')" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/25">
            <i data-lucide="plus" class="w-4 h-4"></i> New Announcement
        </button>` : ''}
        <div class="space-y-3">
            ${announcements.map(a => `
            <div class="bg-white rounded-2xl border border-gray-100 p-5 stat-card">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-xl ${a.priority === 'high' ? 'bg-red-100' : a.priority === 'medium' ? 'bg-amber-100' : 'bg-emerald-100'} flex items-center justify-center flex-shrink-0">
                        <i data-lucide="megaphone" class="w-5 h-5 ${a.priority === 'high' ? 'text-red-600' : a.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'}"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-semibold text-gray-800">${a.title}</h3>
                            <span class="badge ${priorityBadge(a.priority)}">${a.priority}</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-2">${a.content}</p>
                        <div class="flex items-center gap-3 text-xs text-gray-400">
                            <span class="flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i> ${a.author}</span>
                            <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> ${formatDate(a.date)}</span>
                        </div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </div>`;
}

// ============================================
// SETTINGS PAGE
// ============================================
function renderSettings() {
    return `
    <div class="fade-in space-y-4">
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-800 mb-4">System Settings</h3>
            <div class="space-y-4">
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                    <div><p class="text-sm font-medium text-gray-700">School Name</p><p class="text-xs text-gray-400">Displayed across the system</p></div>
                    <input type="text" value="Imnovyaz School" class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300 w-48">
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                    <div><p class="text-sm font-medium text-gray-700">Academic Year</p><p class="text-xs text-gray-400">Current academic session</p></div>
                    <select class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-300 w-48">
                        <option>2023-2024</option><option>2024-2025</option>
                    </select>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                    <div><p class="text-sm font-medium text-gray-700">Language</p><p class="text-xs text-gray-400">System display language</p></div>
                    <select class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-300 w-48">
                        <option>English</option><option>Hindi</option>
                    </select>
                </div>
                <div class="flex items-center justify-between py-3">
                    <div><p class="text-sm font-medium text-gray-700">Reset All Data</p><p class="text-xs text-gray-400">Clear all stored data and reset to defaults</p></div>
                    <button onclick="resetData()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">Reset</button>
                </div>
            </div>
        </div>
    </div>`;
}

function resetData() {
    localStorage.clear();
    initDataStore();
    showToast('Data has been reset to defaults', 'success');
    navigateTo(currentPage);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function handleGlobalSearch(query) {
    if (!query.trim()) return;
    if (currentPage === 'students') {
        document.getElementById('studentSearch').value = query;
        filterStudents();
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-amber-500' };
    const icons = { success: 'check-circle', error: 'x-circle', info: 'info', warning: 'alert-triangle' };
    
    const toast = document.createElement('div');
    toast.className = `toast flex items-center gap-3 px-5 py-3 ${colors[type]} text-white rounded-xl shadow-lg text-sm font-medium`;
    toast.innerHTML = `<i data-lucide="${icons[type]}" class="w-4 h-4"></i> ${message}`;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
