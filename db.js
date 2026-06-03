window.ERP = window.ERP || {};

ERP.DB = (function() {
  const PREFIX = 'imnovyaz_erp_';

  function getStore(name) {
    const data = localStorage.getItem(PREFIX + name);
    return data ? JSON.parse(data) : null;
  }

  function setStore(name, data) {
    localStorage.setItem(PREFIX + name, JSON.stringify(data));
  }

  function genId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function genAdmNo() {
    const students = getAll('students');
    const num = (students.length + 1).toString().padStart(4, '0');
    return 'ADM' + new Date().getFullYear() + num;
  }

  // Initialize with seed data
  function seed() {
    if (getStore('seeded')) return;

    const classes = [
      { id: genId(), name: 'Class 1', sections: ['A','B'] },
      { id: genId(), name: 'Class 2', sections: ['A','B'] },
      { id: genId(), name: 'Class 3', sections: ['A'] },
      { id: genId(), name: 'Class 4', sections: ['A','B'] },
      { id: genId(), name: 'Class 5', sections: ['A'] },
      { id: genId(), name: 'Class 6', sections: ['A','B'] },
      { id: genId(), name: 'Class 7', sections: ['A'] },
      { id: genId(), name: 'Class 8', sections: ['A','B'] },
      { id: genId(), name: 'Class 9', sections: ['A'] },
      { id: genId(), name: 'Class 10', sections: ['A','B'] },
    ];
    setStore('classes', classes);

    const subjects = [
      { id: genId(), name: 'Mathematics', code: 'MATH' },
      { id: genId(), name: 'Science', code: 'SCI' },
      { id: genId(), name: 'English', code: 'ENG' },
      { id: genId(), name: 'Hindi', code: 'HIN' },
      { id: genId(), name: 'Social Studies', code: 'SST' },
      { id: genId(), name: 'Computer Science', code: 'CS' },
    ];
    setStore('subjects', subjects);

    const teachers = [
      { id: 't1', name: 'Rajesh Kumar', email: 'teacher@imnovyaz.com', password: 'teacher123', phone: '9876543210', gender: 'Male', qualification: 'M.Sc Mathematics', address: '45 Teacher Colony, City', subjects: [subjects[0].id, subjects[1].id], classes: [classes[0].id, classes[1].id], joiningDate: '2020-06-15', salary: 35000, status: 'Active', photo: '' },
      { id: 't2', name: 'Priya Sharma', email: 'priya@imnovyaz.com', password: 'teacher123', phone: '9876543211', gender: 'Female', qualification: 'M.A English', address: '12 Green Park, City', subjects: [subjects[2].id, subjects[3].id], classes: [classes[2].id, classes[3].id], joiningDate: '2021-01-10', salary: 32000, status: 'Active', photo: '' },
      { id: 't3', name: 'Amit Verma', email: 'amit@imnovyaz.com', password: 'teacher123', phone: '9876543212', gender: 'Male', qualification: 'M.Sc Physics', address: '78 Lake View, City', subjects: [subjects[1].id, subjects[4].id], classes: [classes[4].id, classes[5].id], joiningDate: '2019-08-20', salary: 38000, status: 'Active', photo: '' },
    ];
    setStore('teachers', teachers);

    const students = [];
    const firstNames = ['Aarav','Vihaan','Aditya','Arjun','Sai','Reyansh','Ayaan','Krishna','Ishaan','Shaurya','Ananya','Diya','Myra','Sara','Aadhya','Priya','Riya','Kavya','Nisha','Pooja'];
    const lastNames = ['Patel','Sharma','Singh','Verma','Joshi','Gupta','Kumar','Reddy','Rao','Iyer'];
    const bloodGroups = ['A+','B+','O+','AB+','A-','B-','O-','AB-'];
    const genders = ['Male','Female'];

    for (let i = 0; i < 40; i++) {
      const cls = classes[Math.floor(Math.random() * classes.length)];
      const section = cls.sections[Math.floor(Math.random() * cls.sections.length)];
      const gender = genders[Math.floor(Math.random() * 2)];
      const firstName = gender === 'Male' ? firstNames[Math.floor(Math.random() * 10)] : firstNames[10 + Math.floor(Math.random() * 10)];
      students.push({
        id: genId(),
        admissionNo: genAdmNo(),
        name: firstName + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)],
        dob: `200${5 + Math.floor(Math.random()*5)}-0${1+Math.floor(Math.random()*9)}-${10+Math.floor(Math.random()*18)}`,
        gender: gender,
        bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
        address: `${Math.floor(Math.random()*200)+1}, Sector ${Math.floor(Math.random()*50)+1}, City`,
        classId: cls.id,
        className: cls.name,
        section: section,
        parentId: '',
        phone: '9' + Math.floor(Math.random()*9) + '0000000' + Math.floor(Math.random()*99),
        status: 'Active',
        photo: ''
      });
    }
    setStore('students', students);

    // Create parents for students
    const parents = [];
    students.forEach((s, idx) => {
      const p = {
        id: 'p' + (idx + 1),
        name: 'Mr. ' + s.name.split(' ')[s.name.split('.').length > 1 ? 2 : 1],
        email: idx === 0 ? 'parent@imnovyaz.com' : `parent${idx+1}@imnovyaz.com`,
        password: 'parent123',
        phone: s.phone,
        studentId: s.id,
        occupation: ['Business','Government','Private Job','Teacher','Doctor'][Math.floor(Math.random()*5)],
        address: s.address,
        relation: ['Father','Mother','Guardian'][Math.floor(Math.random()*3)]
      };
      parents.push(p);
      s.parentId = p.id;
    });
    setStore('parents', parents);
    setStore('students', students);

    // Link first parent to first student
    parents[0].email = 'parent@imnovyaz.com';
    setStore('parents', parents);

    // Attendance (last 30 days for some students)
    const attendance = [];
    const today = new Date();
    students.slice(0, 20).forEach(s => {
      for (let d = 0; d < 30; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - d);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        const rand = Math.random();
        let status = 'Present';
        if (rand > 0.85) status = 'Absent';
        else if (rand > 0.78) status = 'Late';
        attendance.push({
          id: genId(),
          studentId: s.id,
          classId: s.classId,
          date: date.toISOString().split('T')[0],
          status: status
        });
      }
    });
    setStore('attendance', attendance);

    // Teacher attendance
    const teacherAttendance = [];
    teachers.forEach(t => {
      for (let d = 0; d < 30; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - d);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        teacherAttendance.push({
          id: genId(),
          teacherId: t.id,
          date: date.toISOString().split('T')[0],
          status: Math.random() > 0.1 ? 'Present' : 'Absent'
        });
      }
    });
    setStore('teacher_attendance', teacherAttendance);

    // Exams
    const exams = [
      { id: genId(), name: 'Unit Test 1', classId: classes[0].id, subjectIds: subjects.slice(0,4).map(s=>s.id), startDate: '2025-02-10', endDate: '2025-02-15', totalMarks: 50, status: 'Completed', type: 'Unit Test' },
      { id: genId(), name: 'Mid-Term Exam', classId: classes[2].id, subjectIds: subjects.map(s=>s.id), startDate: '2025-03-10', endDate: '2025-03-20', totalMarks: 100, status: 'Upcoming', type: 'Term Exam' },
      { id: genId(), name: 'Final Exam', classId: classes[4].id, subjectIds: subjects.map(s=>s.id), startDate: '2025-05-01', endDate: '2025-05-12', totalMarks: 100, status: 'Scheduled', type: 'Final Exam' },
    ];
    setStore('exams', exams);

    // Marks
    const marks = [];
    students.slice(0, 10).forEach(s => {
      subjects.slice(0, 4).forEach(sub => {
        marks.push({
          id: genId(),
          studentId: s.id,
          subjectId: sub.id,
          examId: exams[0].id,
          classId: s.classId,
          marksObtained: Math.floor(Math.random() * 35) + 15,
          totalMarks: 50,
          grade: '',
          remarks: ''
        });
      });
    });
    setStore('marks', marks);

    // Fees structure
    const fees = [
      { id: genId(), classId: classes[0].id, className: 'Class 1', tuitionFee: 5000, examFee: 1000, libraryFee: 500, transportFee: 2000, totalFee: 8500, academicYear: '2024-25' },
      { id: genId(), classId: classes[2].id, className: 'Class 3', tuitionFee: 6000, examFee: 1200, libraryFee: 600, transportFee: 2000, totalFee: 9800, academicYear: '2024-25' },
      { id: genId(), classId: classes[4].id, className: 'Class 5', tuitionFee: 7000, examFee: 1500, libraryFee: 700, transportFee: 2500, totalFee: 11700, academicYear: '2024-25' },
      { id: genId(), classId: classes[6].id, className: 'Class 7', tuitionFee: 8000, examFee: 1800, libraryFee: 800, transportFee: 2500, totalFee: 13100, academicYear: '2024-25' },
      { id: genId(), classId: classes[8].id, className: 'Class 9', tuitionFee: 10000, examFee: 2000, libraryFee: 1000, transportFee: 3000, totalFee: 16000, academicYear: '2024-25' },
    ];
    setStore('fees', fees);

    // Payments
    const payments = [];
    students.slice(0, 15).forEach(s => {
      payments.push({
        id: genId(),
        studentId: s.id,
        studentName: s.name,
        classId: s.classId,
        amount: Math.floor(Math.random() * 5000) + 5000,
        paymentDate: `2025-0${Math.floor(Math.random()*3)+1}-${10+Math.floor(Math.random()*18)}`,
        paymentMethod: ['Cash','Online','Cheque'][Math.floor(Math.random()*3)],
        receiptNo: 'RCP' + (1000 + payments.length),
        status: Math.random() > 0.3 ? 'Paid' : 'Pending',
        month: ['January','February','March'][Math.floor(Math.random()*3)],
        academicYear: '2024-25'
      });
    });
    setStore('payments', payments);

    // Announcements
    const announcements = [
      { id: genId(), title: 'Annual Day Celebration', message: 'The school annual day will be celebrated on March 25th. All parents are invited to attend.', date: '2025-02-15', priority: 'High', audience: 'All', author: 'Admin' },
      { id: genId(), title: 'Mid-Term Exam Schedule', message: 'Mid-term examinations will commence from March 10th. Students are advised to prepare well.', date: '2025-02-20', priority: 'Medium', audience: 'Parents', author: 'Admin' },
      { id: genId(), title: 'Sports Day', message: 'Annual sports day will be held on April 5th. Registration open for all classes.', date: '2025-03-01', priority: 'Low', audience: 'All', author: 'Admin' },
      { id: genId(), title: 'Parent-Teacher Meeting', message: 'PTM scheduled for February 28th. Please confirm your attendance.', date: '2025-02-22', priority: 'High', audience: 'Parents', author: 'Admin' },
    ];
    setStore('announcements', announcements);

    // Homework
    const homework = [
      { id: genId(), title: 'Mathematics Worksheet 5', description: 'Complete worksheet 5 from the textbook. Solve all problems from Chapter 3.', subjectId: subjects[0].id, classId: classes[0].id, teacherId: 't1', dueDate: '2025-03-05', status: 'Active', createdDate: '2025-02-25' },
      { id: genId(), title: 'English Essay', description: 'Write an essay on "My Favorite Season". Minimum 300 words.', subjectId: subjects[2].id, classId: classes[2].id, teacherId: 't2', dueDate: '2025-03-08', status: 'Active', createdDate: '2025-02-26' },
      { id: genId(), title: 'Science Lab Report', description: 'Prepare a lab report on the experiment conducted in class.', subjectId: subjects[1].id, classId: classes[4].id, teacherId: 't1', dueDate: '2025-03-10', status: 'Active', createdDate: '2025-02-27' },
    ];
    setStore('homework', homework);

    // Report cards
    const reportCards = [];
    students.slice(0,10).forEach(s => {
      const studentMarks = marks.filter(m => m.studentId === s.id);
      const totalObtained = studentMarks.reduce((a,b) => a + b.marksObtained, 0);
      const totalMax = studentMarks.reduce((a,b) => a + b.totalMarks, 0);
      const percentage = totalMax > 0 ? Math.round((totalObtained/totalMax)*100) : 0;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';

      reportCards.push({
        id: genId(),
        studentId: s.id,
        classId: s.classId,
        examId: exams[0].id,
        totalMarks: totalMax,
        obtainedMarks: totalObtained,
        percentage: percentage,
        grade: grade,
        status: 'Published',
        remarks: grade.startsWith('A') ? 'Excellent Performance' : grade.startsWith('B') ? 'Good Performance' : grade === 'C' ? 'Average Performance' : 'Needs Improvement',
        generatedDate: '2025-02-20'
      });
    });
    setStore('report_cards', reportCards);

    // Users for auth
    const users = [
      { id: 'u1', email: 'admin@imnovyaz.com', password: 'admin123', role: 'admin', name: 'Admin User', linkedId: '' },
      { id: 'u2', email: 'teacher@imnovyaz.com', password: 'teacher123', role: 'teacher', name: 'Rajesh Kumar', linkedId: 't1' },
      { id: 'u3', email: 'parent@imnovyaz.com', password: 'parent123', role: 'parent', name: 'Mr. ' + (students[0]?.name.split(' ')[1] || 'Parent'), linkedId: students[0]?.id || '' },
    ];
    setStore('users', users);
    setStore('seeded', true);
  }

  function getAll(name) {
    return getStore(name) || [];
  }

  function getById(name, id) {
    const items = getAll(name);
    return items.find(i => i.id === id);
  }

  function insert(name, item) {
    const items = getAll(name);
    item.id = item.id || genId();
    items.push(item);
    setStore(name, items);
    return item;
  }

  function update(name, id, data) {
    const items = getAll(name);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data, id: id };
    setStore(name, items);
    return items[idx];
  }

  function remove(name, id) {
    const items = getAll(name);
    const filtered = items.filter(i => i.id !== id);
    setStore(name, filtered);
    return true;
  }

  function query(name, filterFn) {
    return getAll(name).filter(filterFn);
  }

  function count(name, filterFn) {
    if (filterFn) return query(name, filterFn).length;
    return getAll(name).length;
  }

  function paginate(arr, page, perPage = 10) {
    const total = arr.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    return {
      data: arr.slice(start, start + perPage),
      page,
      perPage,
      total,
      totalPages
    };
  }

  // Initialize
  seed();

  return {
    genId, getAll, getById, insert, update, remove, query, count, paginate
  };
})();