// ADIT Attendance System LocalStorage Service with Enhanced Security

const STORAGE_KEYS = {
  STUDENTS: 'adit_attendance_students',
  SUBJECTS: 'adit_attendance_subjects',
  SESSIONS: 'adit_attendance_sessions',
  SECURITY: 'adit_attendance_security',
  COLLEGE_NAME: 'adit_college_name',
  DEPARTMENT: 'adit_department_name',
  FACULTIES: 'adit_attendance_faculties',
  DEPARTMENTS: 'adit_attendance_departments',
  ALLOCATIONS: 'adit_attendance_allocations',
};

// Semesters Master (1st to 8th)
export const SEMESTERS = [
  { id: '1st Sem', num: 1, term: 'Odd', year: '1st Year' },
  { id: '2nd Sem', num: 2, term: 'Even', year: '1st Year' },
  { id: '3rd Sem', num: 3, term: 'Odd', year: '2nd Year' },
  { id: '4th Sem', num: 4, term: 'Even', year: '2nd Year' },
  { id: '5th Sem', num: 5, term: 'Odd', year: '3rd Year' },
  { id: '6th Sem', num: 6, term: 'Even', year: '3rd Year' },
  { id: '7th Sem', num: 7, term: 'Odd', year: '4th Year' },
  { id: '8th Sem', num: 8, term: 'Even', year: '4th Year' },
];

// Departments Master
export const DEFAULT_DEPARTMENTS = [
  { id: 'DEP_CP', code: 'CP', name: 'Computer Engineering', icon: 'Laptop' },
  { id: 'DEP_IT', code: 'IT', name: 'Information Technology', icon: 'Network' },
  { id: 'DEP_AI', code: 'AI', name: 'Artificial Intelligence & Data Science', icon: 'Brain' },
  { id: 'DEP_EC', code: 'EC', name: 'Electronics & Communication', icon: 'Cpu' },
  { id: 'DEP_ME', code: 'ME', name: 'Mechanical Engineering', icon: 'Cog' },
  { id: 'DEP_CL', code: 'CL', name: 'Civil Engineering', icon: 'Building' },
];

// Faculty Master List
export const DEFAULT_FACULTIES = [
  { id: 'FAC01', name: 'Prof. R. K. Patel', dept: 'Computer Engineering', designation: 'Associate Professor', email: 'rkpatel@adit.ac.in', phone: '9825012345' },
  { id: 'FAC02', name: 'Dr. S. M. Mehta', dept: 'Computer Engineering', designation: 'Professor & HOD', email: 'smmehta@adit.ac.in', phone: '9825023456' },
  { id: 'FAC03', name: 'Prof. A. N. Shah', dept: 'Computer Engineering', designation: 'Assistant Professor', email: 'anshah@adit.ac.in', phone: '9825034567' },
  { id: 'FAC04', name: 'Prof. P. V. Desai', dept: 'Computer Engineering', designation: 'Assistant Professor', email: 'pvdesai@adit.ac.in', phone: '9825045678' },
  { id: 'FAC05', name: 'Dr. H. K. Trivedi', dept: 'Information Technology', designation: 'Associate Professor', email: 'hktrivedi@adit.ac.in', phone: '9825056789' },
  { id: 'FAC06', name: 'Prof. M. B. Joshi', dept: 'Information Technology', designation: 'Assistant Professor', email: 'mbjoshi@adit.ac.in', phone: '9825067890' },
];

// Subject Division & Faculty Allocations (1, 2, or max 3 divisions)
export const DEFAULT_ALLOCATIONS = {
  'SUB_DS': {
    subjectId: 'SUB_DS',
    sem: '3rd Sem',
    dept: 'Computer Engineering',
    divisionCount: 3, // 1, 2, or 3 divisions
    divisions: [
      { id: '1', name: 'Div 1', facultyId: 'FAC02', facultyName: 'Dr. S. M. Mehta' },
      { id: '2', name: 'Div 2', facultyId: 'FAC03', facultyName: 'Prof. A. N. Shah' },
      { id: '3', name: 'Div 3', facultyId: 'FAC01', facultyName: 'Prof. R. K. Patel' },
    ]
  },
  'SUB01': {
    subjectId: 'SUB01',
    sem: '3rd Sem',
    dept: 'Computer Engineering',
    divisionCount: 2,
    divisions: [
      { id: '1', name: 'Div 1', facultyId: 'FAC02', facultyName: 'Dr. S. M. Mehta' },
      { id: '2', name: 'Div 2', facultyId: 'FAC04', facultyName: 'Prof. P. V. Desai' },
    ]
  }
};

// Default Admin Security PIN: 1234
const DEFAULT_SECURITY = {
  adminPin: '1234',
  pinProtected: true,
};

// Input Sanitization to prevent XSS / Script Injection
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const getCollegeName = () => {
  return localStorage.getItem(STORAGE_KEYS.COLLEGE_NAME) || 'G H Patel College of Engineering & Technology';
};

export const setCollegeName = (name) => {
  localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, name);
  return name;
};

export const getFacultyName = () => {
  return localStorage.getItem('adit_faculty_name') || 'Prof. R. K. Patel';
};

export const setFacultyName = (name) => {
  localStorage.setItem('adit_faculty_name', name);
  return name;
};

// Initial Seed Data aligned with College ERP Reference Sheet
export const DEFAULT_STUDENTS = [
  { id: 'S127', rollNo: '1', name: 'Aarav Patel', enrollmentNo: '12502040501127', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S128', rollNo: '2', name: 'Ananya Sharma', enrollmentNo: '12502040501128', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S129', rollNo: '3', name: 'Devansh Verma', enrollmentNo: '12502040501129', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S130', rollNo: '4', name: 'Diyansh Joshi', enrollmentNo: '12502040501130', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S131', rollNo: '5', name: 'Isha Mehta', enrollmentNo: '12502040501131', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S132', rollNo: '6', name: 'Kabir Shah', enrollmentNo: '12502040501132', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S133', rollNo: '7', name: 'Khushi Trivedi', enrollmentNo: '12502040501133', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S134', rollNo: '8', name: 'Manav Desai', enrollmentNo: '12502040501134', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S135', rollNo: '9', name: 'Neha Bhatt', enrollmentNo: '12502040501135', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S136', rollNo: '10', name: 'Parth Solanki', enrollmentNo: '12502040501136', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S137', rollNo: '11', name: 'Riya Rathod', enrollmentNo: '12502040501137', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S138', rollNo: '12', name: 'Siddharth Dave', enrollmentNo: '12502040501138', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S139', rollNo: '13', name: 'Tanya Kothari', enrollmentNo: '12502040501139', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S140', rollNo: '14', name: 'Varun Chawla', enrollmentNo: '12502040501140', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S142', rollNo: '15', name: 'Yash Vaghela', enrollmentNo: '12502040501142', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S143', rollNo: '16', name: 'Aayush Prajapati', enrollmentNo: '12502040501143', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S144', rollNo: '17', name: 'Bhumika Parmar', enrollmentNo: '12502040501144', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S145', rollNo: '18', name: 'Chirag Panchal', enrollmentNo: '12502040501145', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S146', rollNo: '19', name: 'Diya Patel', enrollmentNo: '12502040501146', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S147', rollNo: '20', name: 'Harshil Soni', enrollmentNo: '12502040501147', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S148', rollNo: '21', name: 'Jiya Shah', enrollmentNo: '12502040501148', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S149', rollNo: '22', name: 'Karan Mistry', enrollmentNo: '12502040501149', dept: 'Computer', class: '3', sem: '3rd Sem' },
  { id: 'S150', rollNo: '23', name: 'Meet Makwana', enrollmentNo: '12502040501150', dept: 'Computer', class: '3', sem: '3rd Sem' },
];

export const DEFAULT_SUBJECTS = [
  { id: 'SUB_DS', code: '102040304', name: 'DATA STRUCTURES', faculty: 'Prof. R. K. Patel', credits: 4, sem: '3rd Sem', dept: 'Computer', class: '3', academicYear: '2026-27', term: 'Odd' },
  { id: 'SUB01', code: '102040301', name: 'Database Management Systems', faculty: 'Dr. S. M. Mehta', credits: 4, sem: '3rd Sem', dept: 'Computer', class: '3', academicYear: '2026-27', term: 'Odd' },
  { id: 'SUB02', code: '102040302', name: 'Digital Logic & Computer Design', faculty: 'Prof. A. N. Shah', credits: 4, sem: '3rd Sem', dept: 'Computer', class: '3', academicYear: '2026-27', term: 'Odd' },
  { id: 'SUB03', code: '102040303', name: 'Discrete Mathematics', faculty: 'Prof. P. V. Desai', credits: 3, sem: '3rd Sem', dept: 'Computer', class: '3', academicYear: '2026-27', term: 'Odd' },
  { id: 'SUB04', code: '102040305', name: 'Object Oriented Programming', faculty: 'Dr. H. K. Trivedi', credits: 4, sem: '3rd Sem', dept: 'Computer', class: '3', academicYear: '2026-27', term: 'Odd' }
];

// Helper to generate the exact 18 sessions matching the reference photo
const generateDSSessions = () => {
  const dates = [
    { date: '2026-07-06', topic: 'Course Overview & Introduction to Data Structures' },
    { date: '2026-07-07', topic: 'Linear vs Non-Linear Structures, Memory Layout' },
    { date: '2026-07-08', topic: 'Array Representation & Multi-dimensional Addressing' },
    { date: '2026-07-09', topic: 'Stack Abstract Data Type & Push/Pop Operations' },
    { date: '2026-07-13', topic: 'Infix to Postfix Expression Evaluation' },
    { date: '2026-07-15', topic: 'Queue ADT, Circular Queue Implementation' },
    { date: '2026-07-16', topic: 'Double-ended Queue (Deque) & Priority Queues' },
    { date: '2026-07-20', topic: 'Singly Linked List Insertion & Deletion' },
    { date: '2026-07-22', topic: 'Doubly Linked List & Circular Linked Lists' },
    { date: '2026-07-23', topic: 'Applications of Linked Lists: Polynomial Addition' },
    { date: '2026-07-27', topic: 'Tree Terminology & Binary Tree Traversals' },
    { date: '2026-07-29', topic: 'Binary Search Tree (BST) Operations & Searching' },
    { date: '2026-08-03', topic: 'AVL Trees & Balancing Rotations (LL, RR, LR, RL)' },
    { date: '2026-08-05', topic: 'B-Trees, B+ Trees & Disk Storage Optimization' },
    { date: '2026-08-06', topic: 'Graph Representation: Adjacency Matrix & Lists' },
    { date: '2026-08-10', topic: 'Breadth First Search (BFS) & Depth First Search (DFS)' },
    { date: '2026-08-13', topic: 'Minimum Spanning Trees: Kruskals & Prims' },
    { date: '2026-08-17', topic: 'Hashing Functions & Collision Resolution Techniques' },
    { date: '2026-08-19', topic: 'Sorting Algorithms Comparison & Review' },
  ];

  // Specific absences and on-duty entries matching the image
  const absentMap = {
    'S127': [],
    'S128': ['2026-07-22', '2026-08-17'],
    'S129': ['2026-07-15', '2026-07-22', '2026-07-23', '2026-08-17'],
    'S130': ['2026-07-15', '2026-07-23'],
    'S131': ['2026-07-15', '2026-07-23', '2026-08-05', '2026-08-17'],
    'S132': ['2026-07-22', '2026-08-17'],
    'S133': ['2026-07-08', '2026-07-27', '2026-08-03', '2026-08-10'],
    'S134': ['2026-07-20', '2026-08-13'],
    'S135': ['2026-07-09', '2026-08-17'],
    'S136': ['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-23', '2026-07-29', '2026-08-05'],
    'S137': ['2026-07-22', '2026-07-27', '2026-08-13'],
    'S138': ['2026-07-16', '2026-07-23', '2026-07-27', '2026-08-03', '2026-08-17'],
    'S139': ['2026-07-15'],
    'S140': ['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-22', '2026-07-27', '2026-08-06'],
    'S142': ['2026-07-16'],
    'S143': ['2026-07-08', '2026-08-17'],
    'S144': ['2026-07-20'],
    'S145': ['2026-08-13'],
    'S146': ['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-20'],
    'S147': ['2026-07-22'],
    'S148': ['2026-07-20', '2026-08-05'],
    'S149': [],
    'S150': ['2026-08-17'],
  };

  const odMap = {
    'S131': ['2026-08-10'] // O* Duty Certificate on 10-08
  };

  return dates.map((d, index) => {
    const records = {};
    const remarks = {};

    DEFAULT_STUDENTS.forEach(student => {
      const isAbsent = (absentMap[student.id] || []).includes(d.date);
      const isOD = (odMap[student.id] || []).includes(d.date);

      if (isOD) {
        records[student.id] = 'od';
        remarks[student.id] = 'Duty Certificate Approved';
      } else if (isAbsent) {
        records[student.id] = 'absent';
        remarks[student.id] = 'Absent';
      } else {
        records[student.id] = 'present';
      }
    });

    return {
      id: `SESS_DS_${index + 1}`,
      date: d.date,
      subjectId: 'SUB_DS',
      topic: d.topic,
      records,
      remarks,
      sem: '3rd Sem',
      class: '3',
      dept: 'Computer'
    };
  });
};

export const DEFAULT_SESSIONS = generateDSSessions();

// Helper to initialize LocalStorage if empty or outdated
export const initializeStorage = () => {
  const currentSubjs = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  const currentStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);

  // If uninitialized or does not have SUB_DS, re-seed with college ERP dataset
  if (!currentSubjs || !currentSubjs.includes('102040304') || !currentStudents || !currentStudents.includes('12502040501127')) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(DEFAULT_SECURITY));
    localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, 'G H Patel College of Engineering & Technology');
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(DEFAULT_FACULTIES));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(DEFAULT_ALLOCATIONS));
    return;
  }

  if (!localStorage.getItem(STORAGE_KEYS.FACULTIES)) {
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(DEFAULT_FACULTIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ALLOCATIONS)) {
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(DEFAULT_ALLOCATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SECURITY)) {
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(DEFAULT_SECURITY));
  }
};

// Security PIN Verification
export const verifyAdminPin = (inputPin) => {
  initializeStorage();
  const sec = JSON.parse(localStorage.getItem(STORAGE_KEYS.SECURITY) || JSON.stringify(DEFAULT_SECURITY));
  return String(inputPin) === String(sec.adminPin);
};

export const updateAdminPin = (oldPin, newPin) => {
  if (!verifyAdminPin(oldPin)) return false;
  const sec = { adminPin: String(newPin), pinProtected: true };
  localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(sec));
  return true;
};

// Students API
export const getStudents = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
};

export const saveStudent = (student) => {
  const students = getStudents();
  if (student.id) {
    const idx = students.findIndex(s => s.id === student.id);
    if (idx !== -1) students[idx] = student;
  } else {
    student.id = 'S' + String(Date.now()).slice(-4);
    students.push(student);
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return students;
};

export const deleteStudent = (studentId) => {
  const students = getStudents().filter(s => s.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return students;
};

// Subjects API
export const getSubjects = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || '[]');
};

export const saveSubject = (subject) => {
  const subjects = getSubjects();
  if (subject.id) {
    const idx = subjects.findIndex(s => s.id === subject.id);
    if (idx !== -1) subjects[idx] = subject;
  } else {
    subject.id = 'SUB' + String(Date.now()).slice(-3);
    subjects.push(subject);
  }
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  return subjects;
};

export const deleteSubject = (subjectId) => {
  const subjects = getSubjects().filter(s => s.id !== subjectId);
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  return subjects;
};

// Attendance Sessions API
export const getSessions = () => {
  initializeStorage();
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  return sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const getLastSubjectDates = (subjectId) => {
  const sessions = getSessions().filter(s => s.subjectId === subjectId);
  return sessions.slice(-4).map(s => {
    const parts = s.date.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}`; // DD-MM format
    }
    return s.date;
  });
};

export const saveSession = (session) => {
  const sessions = getSessions();
  if (session.id) {
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx !== -1) {
      sessions[idx] = { ...sessions[idx], ...session };
    } else {
      sessions.push(session);
    }
  } else {
    session.id = 'SESS_' + Date.now();
    sessions.push(session);
  }
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  return sessions;
};

export const deleteSession = (sessionId) => {
  const sessions = getSessions().filter(s => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  return sessions;
};

export const resetToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
  localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(DEFAULT_SECURITY));
  localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, 'G H Patel College of Engineering & Technology');
  return {
    students: DEFAULT_STUDENTS,
    subjects: DEFAULT_SUBJECTS,
    sessions: DEFAULT_SESSIONS
  };
};

// Computed Analytics & Stats Helper Functions
export const calculateAnalytics = (targetSubjectId = null) => {
  const students = getStudents();
  const subjects = getSubjects();
  let sessions = getSessions();

  if (targetSubjectId && targetSubjectId !== 'ALL') {
    sessions = sessions.filter(s => s.subjectId === targetSubjectId);
  }

  const totalSessions = sessions.length;
  if (totalSessions === 0) {
    return {
      overallPercentage: 0,
      totalSessions: 0,
      totalStudents: students.length,
      studentStats: [],
      subjectStats: [],
      lowAttendanceCount: 0,
    };
  }

  const studentStats = students.map(student => {
    let attended = 0;
    let totalAssigned = 0;
    let odCount = 0;

    sessions.forEach(sess => {
      if (sess.records && sess.records[student.id] !== undefined) {
        totalAssigned++;
        const status = sess.records[student.id];
        if (status === 'present') attended += 1;
        else if (status === 'late') attended += 0.8;
        else if (status === 'od') odCount += 1;
      }
    });

    const percentage = totalAssigned > 0 ? ((attended / totalAssigned) * 100).toFixed(2) : '0.00';
    const percentageDC = totalAssigned > 0 ? ((odCount / totalAssigned) * 100).toFixed(2) : '0.00';

    return {
      ...student,
      attended,
      odCount,
      totalAssigned,
      percentage: parseFloat(percentage),
      percentageDC: parseFloat(percentageDC),
      status: parseFloat(percentage) >= 75 ? 'good' : 'warning'
    };
  });

  const sumPct = studentStats.reduce((acc, curr) => acc + curr.percentage, 0);
  const overallPercentage = studentStats.length > 0 ? (sumPct / studentStats.length).toFixed(2) : '0.00';

  const subjectStats = subjects.map(subj => {
    const subjSessions = sessions.filter(s => s.subjectId === subj.id);
    let totalPresent = 0;
    let totalPossible = 0;

    subjSessions.forEach(sess => {
      Object.values(sess.records || {}).forEach(status => {
        totalPossible++;
        if (status === 'present') totalPresent += 1;
        else if (status === 'late') totalPresent += 0.8;
      });
    });

    const pct = totalPossible > 0 ? ((totalPresent / totalPossible) * 100).toFixed(2) : '0.00';
    return {
      ...subj,
      sessionCount: subjSessions.length,
      percentage: parseFloat(pct)
    };
  });

  const lowAttendanceCount = studentStats.filter(s => s.percentage < 75).length;

  return {
    overallPercentage: parseFloat(overallPercentage),
    totalSessions,
    totalStudents: students.length,
    studentStats,
    subjectStats,
    lowAttendanceCount
  };
};

// =========================================================================
// ACADEMIC HIERARCHY API: Faculties, Departments, Allocations, & Divisions
// =========================================================================

// Faculties API
export const getFaculties = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTIES) || JSON.stringify(DEFAULT_FACULTIES));
};

export const saveFaculty = (faculty) => {
  const faculties = getFaculties();
  if (faculty.id) {
    const idx = faculties.findIndex(f => f.id === faculty.id);
    if (idx !== -1) faculties[idx] = faculty;
    else faculties.push(faculty);
  } else {
    faculty.id = 'FAC_' + Date.now().toString().slice(-4);
    faculties.push(faculty);
  }
  localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(faculties));
  return faculties;
};

export const deleteFaculty = (facultyId) => {
  const faculties = getFaculties().filter(f => f.id !== facultyId);
  localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(faculties));
  return faculties;
};

// Departments API
export const getDepartments = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || JSON.stringify(DEFAULT_DEPARTMENTS));
};

export const saveDepartment = (dept) => {
  const depts = getDepartments();
  if (dept.id) {
    const idx = depts.findIndex(d => d.id === dept.id);
    if (idx !== -1) depts[idx] = dept;
    else depts.push(dept);
  } else {
    dept.id = 'DEP_' + Date.now().toString().slice(-4);
    depts.push(dept);
  }
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  return depts;
};

export const deleteDepartment = (deptId) => {
  const depts = getDepartments().filter(d => d.id !== deptId);
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  return depts;
};

// Subject Allocations API (Division count 1, 2, or 3 & Faculty per Division)
export const getAllocations = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATIONS) || JSON.stringify(DEFAULT_ALLOCATIONS));
};

export const getAllocationForSubject = (subjectId) => {
  const all = getAllocations();
  if (all[subjectId]) return all[subjectId];
  // Default allocation: 1 division if not yet configured
  return {
    subjectId,
    divisionCount: 1,
    divisions: [
      { id: '1', name: 'Div 1', facultyId: 'FAC01', facultyName: 'Prof. R. K. Patel' }
    ]
  };
};

export const saveSubjectAllocation = (subjectId, allocData) => {
  const all = getAllocations();
  all[subjectId] = {
    ...all[subjectId],
    ...allocData,
    subjectId
  };
  localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(all));
  return all[subjectId];
};

// Assign / Move Student to Division
export const assignStudentDivision = (studentId, newDivision) => {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === studentId);
  if (idx !== -1) {
    students[idx].class = String(newDivision);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }
  return students;
};

// Bulk Import Students into a Division
export const bulkImportStudents = (newStudentsList, sem, dept, division) => {
  const students = getStudents();
  newStudentsList.forEach((st, i) => {
    const newId = 'S_' + Date.now() + '_' + i;
    students.push({
      id: newId,
      rollNo: String(st.rollNo || (students.length + 1)),
      name: String(st.name || 'Student'),
      enrollmentNo: String(st.enrollmentNo || `1250204050${Date.now().toString().slice(-4)}`),
      dept: dept || 'Computer',
      sem: sem || '3rd Sem',
      class: String(division || '1')
    });
  });
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return students;
};
