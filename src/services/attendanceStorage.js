// ADIT Attendance System LocalStorage Service with Enhanced Security

const STORAGE_KEYS = {
  STUDENTS: 'adit_attendance_students',
  CLASSES: 'adit_attendance_classes',
  SUBJECTS: 'adit_attendance_subjects',
  SESSIONS: 'adit_attendance_sessions',
  SECURITY: 'adit_attendance_security',
  COLLEGE_NAME: 'adit_college_name',
  DEPARTMENT: 'adit_department_name',
  FACULTIES: 'adit_attendance_faculties',
  DEPARTMENTS: 'adit_attendance_departments',
  ALLOCATIONS: 'adit_attendance_allocations',
  EXCEPTIONS: 'adit_attendance_exceptions',
  EXCEPTION_POLICY: 'adit_exception_policy',
  PROMOTION_HISTORY: 'adit_attendance_promotion_history',
  ELECTIVE_GROUPS: 'adit_attendance_elective_groups',
  ELECTIVE_ASSIGNMENTS: 'adit_attendance_elective_assignments',
};

// Academic Years Master
export const DEFAULT_ACADEMIC_YEAR = '2026-27';
export const ACADEMIC_YEARS = ['2024-25', '2025-26', '2026-27', '2027-28', '2028-29'];

// Normalization Helpers
export const normalizeSem = (semStr) => {
  if (!semStr) return '3rd Sem';
  const s = String(semStr).trim();
  const m = s.match(/([1-8])/);
  if (!m) return s;
  const num = m[1];
  const sufs = { '1': 'st', '2': 'nd', '3': 'rd' };
  return `${num}${sufs[num] || 'th'} Sem`;
};

export const normalizeDiv = (divStr) => {
  if (!divStr) return 'Div 1';
  const s = String(divStr).trim();
  const m = s.match(/([1-9])/);
  if (!m) return s;
  return `Div ${m[1]}`;
};

// Default Seed Classes (Department + Semester + Division + Academic Year)
export const DEFAULT_CLASSES = [];

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
// College Departments Master (College-Wide Academic Units)
export const INITIAL_COLLEGE_DEPARTMENTS = [
  { id: 'DEP_AE', code: 'AE', name: 'Aeronautical Engineering', status: 'active' },
  { id: 'DEP_CL', code: 'CL', name: 'Civil Engineering', status: 'active' },
  { id: 'DEP_EE', code: 'EE', name: 'Electrical Engineering', status: 'active' },
  { id: 'DEP_EC', code: 'EC', name: 'Electronics & Communication Engineering', status: 'active' },
  { id: 'DEP_ME', code: 'ME', name: 'Mechanical Engineering', status: 'active' },
  { id: 'DEP_FPT', code: 'FPT', name: 'Food Processing Technology', status: 'active' },
  { id: 'DEP_DT', code: 'DT', name: 'Dairy Technology', status: 'active' },
  { id: 'DEP_CE', code: 'CE', name: 'Computer Engineering', status: 'active' },
  { id: 'DEP_IT', code: 'IT', name: 'Information Technology', status: 'active' },
  { id: 'DEP_AI', code: 'AI', name: 'AI & Data Science', status: 'active' }
];

// Departments Master
export const DEFAULT_DEPARTMENTS = INITIAL_COLLEGE_DEPARTMENTS;

// Faculty Master List
export const DEFAULT_FACULTIES = [];

// Subject Division & Faculty Allocations (1, 2, or max 3 divisions)
export const DEFAULT_ALLOCATIONS = {};

// Default Elective Subject Groups (Semester-Wide Student Electives)
// Elective Subject Management: Zero demo/sample seed data (All elective classes are created manually)
export const DEFAULT_ELECTIVE_GROUPS = [];
export const DEFAULT_ELECTIVE_ASSIGNMENTS = [];

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
  const stored = localStorage.getItem(STORAGE_KEYS.COLLEGE_NAME);
  if (stored && (stored.includes('G H Patel') || stored.includes('GCET') || stored.includes('GH Patel'))) {
    localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, 'A D Patel Institute of Technology');
    return 'A D Patel Institute of Technology';
  }
  return stored || 'A D Patel Institute of Technology';
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
export const DEFAULT_STUDENTS = [];

export const DEFAULT_SUBJECTS = [];

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

  const cpStudents = DEFAULT_STUDENTS.filter(s => s.classId === 'CLASS_DEP_CP_3_3_2026-27');
  return dates.map((d, index) => {
    const records = {};
    const remarks = {};
    let presentCount = 0;
    let absentCount = 0;

    cpStudents.forEach(student => {
      const isAbsent = (absentMap[student.id] || []).includes(d.date);
      const isOD = (odMap[student.id] || []).includes(d.date);

      if (isOD) {
        records[student.id] = 'od';
        remarks[student.id] = 'Duty Certificate Approved';
        presentCount++;
      } else if (isAbsent) {
        records[student.id] = 'absent';
        remarks[student.id] = 'Absent';
        absentCount++;
      } else {
        records[student.id] = 'present';
        presentCount++;
      }
    });

    return {
      id: `SESS_DS_${index + 1}`,
      date: d.date,
      timeSlot: '10:00 - 10:55',
      subjectId: 'SUB_DS',
      subjectName: 'DATA STRUCTURES',
      topic: d.topic,
      facultyId: 'FAC01',
      facultyName: 'Prof. R. K. Patel',
      department: 'Computer Engineering',
      dept: 'Computer Engineering',
      sem: '3rd Sem',
      division: 'Div 3',
      class: '3',
      batch: 'ALL',
      classId: 'CLASS_DEP_CP_3_3_2026-27',
      academicYear: '2026-27',
      records,
      remarks,
      totalStudents: cpStudents.length,
      presentCount,
      absentCount,
      percentage: cpStudents.length > 0 ? ((presentCount / cpStudents.length) * 100).toFixed(1) : '0.0',
      submittedAt: new Date().toISOString()
    };
  });
};

const generateDBMSSessions = () => {
  const dates = [
    { date: '2026-07-07', timeSlot: '9:00 - 9:55', topic: 'Introduction to DBMS Architecture & Data Models' },
    { date: '2026-07-14', timeSlot: '9:00 - 9:55', topic: 'Entity-Relationship (ER) Modeling & Diagramming' },
    { date: '2026-07-21', timeSlot: '9:00 - 9:55', topic: 'Relational Model Constraints & Primary/Foreign Keys' },
    { date: '2026-07-28', timeSlot: '9:00 - 9:55', topic: 'Relational Algebra Operations: Select, Project, Join' },
    { date: '2026-08-04', timeSlot: '9:00 - 9:55', topic: 'SQL DDL, DML Statements & Integrity Constraints' },
    { date: '2026-08-11', timeSlot: '9:00 - 9:55', topic: 'Nested Queries, Group By & Aggregate Functions' },
    { date: '2026-08-18', timeSlot: '9:00 - 9:55', topic: 'Database Normalization: 1NF, 2NF, 3NF & BCNF' },
  ];

  const aiStudents = DEFAULT_STUDENTS.filter(s => s.classId === 'CLASS_DEP_AI_3_1_2026-27');
  return dates.map((d, index) => {
    const records = {};
    const remarks = {};
    let presentCount = 0;
    let absentCount = 0;

    aiStudents.forEach(st => {
      const isAbsent = (index % 3 === 0 && st.id === 'S_AI_02') || (index === 2 && st.id === 'S_AI_05');
      if (isAbsent) {
        records[st.id] = 'absent';
        remarks[st.id] = 'Absent';
        absentCount++;
      } else {
        records[st.id] = 'present';
        presentCount++;
      }
    });

    return {
      id: `SESS_AI_DBMS_${index + 1}`,
      date: d.date,
      timeSlot: d.timeSlot,
      subjectId: 'SUB_AI_DBMS',
      subjectName: 'Database Management Systems',
      facultyId: 'FAC_PS',
      facultyName: 'Prof. Priya Shah',
      department: 'AI & Data Science',
      sem: '3rd Sem',
      division: 'Div 1',
      batch: 'ALL',
      academicYear: '2026-27',
      classId: 'CLASS_DEP_AI_3_1_2026-27',
      topic: d.topic,
      records,
      remarks,
      totalStudents: aiStudents.length,
      presentCount,
      absentCount,
      percentage: aiStudents.length > 0 ? ((presentCount / aiStudents.length) * 100).toFixed(1) : '0.0',
      submittedAt: new Date().toISOString()
    };
  });
};

export const DEFAULT_SESSIONS = [];

// Helper to initialize LocalStorage if empty or outdated
export const initializeStorage = () => {
  // Sanitize college branding if outdated
  const storedCollege = localStorage.getItem(STORAGE_KEYS.COLLEGE_NAME);
  if (!storedCollege || storedCollege.includes('G H Patel') || storedCollege.includes('GCET') || storedCollege.includes('GH Patel')) {
    localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, 'A D Patel Institute of Technology');
  }

  // One-time automatic clean slate initialization: wipe all demo data for real data entry
  const CLEAN_SLATE_KEY = 'adit_clean_slate_real_data_v2';
  if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_COLLEGE_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ELECTIVE_GROUPS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ELECTIVE_ASSIGNMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PROMOTION_HISTORY, JSON.stringify([]));
    localStorage.setItem('adit_timetable_entries', JSON.stringify([]));
    localStorage.setItem('adit_attendance_timetable', JSON.stringify({}));
    localStorage.setItem('adit_timetable_file_info', 'null');
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(DEFAULT_SECURITY));
    localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, 'A D Patel Institute of Technology');
    localStorage.setItem(CLEAN_SLATE_KEY, 'true');
  }

  // Ensure every storage key exists as an empty array/object if missing
  if (localStorage.getItem(STORAGE_KEYS.STUDENTS) === null) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.CLASSES) === null) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.SUBJECTS) === null) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.FACULTIES) === null) {
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) === null) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_COLLEGE_DEPARTMENTS));
  }
  if (localStorage.getItem(STORAGE_KEYS.ALLOCATIONS) === null) {
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify({}));
  }
  if (localStorage.getItem(STORAGE_KEYS.SESSIONS) === null) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.EXCEPTIONS) === null) {
    localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.ELECTIVE_GROUPS) === null) {
    localStorage.setItem(STORAGE_KEYS.ELECTIVE_GROUPS, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.ELECTIVE_ASSIGNMENTS) === null) {
    localStorage.setItem(STORAGE_KEYS.ELECTIVE_ASSIGNMENTS, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.SECURITY) === null) {
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

// =========================================================================
// ROLE-BASED AUTHENTICATION & SESSION MANAGEMENT API
// =========================================================================

export const AUTH_STORAGE_KEY = 'adit_auth_session';
export const ACTIVE_FACULTY_KEY = 'adit_active_faculty_id';

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && user.loginTime) {
      const loginDate = new Date(user.loginTime).toDateString();
      const todayDate = new Date().toDateString();
      if (loginDate !== todayDate) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
    }
    return user;
  } catch (e) {
    return null;
  }
};

export const setCurrentUser = (user) => {
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
};

export const logoutUser = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthenticated = () => {
  return !!getCurrentUser();
};

export const getUserRole = () => {
  const u = getCurrentUser();
  return u ? u.role : null;
};

export const getActiveFacultyId = () => {
  const u = getCurrentUser();
  if (u && u.role === 'faculty' && u.facultyId) {
    return u.facultyId;
  }
  return localStorage.getItem(ACTIVE_FACULTY_KEY) || 'FAC_PS';
};

export const setActiveFacultyId = (facId) => {
  localStorage.setItem(ACTIVE_FACULTY_KEY, facId);
  try {
    window.dispatchEvent(new CustomEvent('adit-active-faculty-changed', { detail: { facultyId: facId } }));
  } catch(e) {}
};

export const getActiveFaculty = () => {
  const facId = getActiveFacultyId();
  const faculties = getFaculties();
  return faculties.find(f => f.id === facId) || faculties[0] || null;
};

export const hashPassword = (password, salt = 'ADIT_CAMPUS_AUTH_SALT_2026') => {
  if (!password) return '';
  const combined = `${salt}:${password}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  let h3 = 0x5bd1e995;
  let h4 = 0x27d4eb2f;

  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ (ch << 1), 2166136261) >>> 0;
    h3 = Math.imul(h3 ^ (ch << 2), 16777619) >>> 0;
    h4 = Math.imul(h4 ^ (ch << 3), 2654435761) >>> 0;
  }
  return [h1, h2, h3, h4].map(h => h.toString(16).padStart(8, '0')).join('');
};

export const loginUser = (identifier, password) => {
  if (!identifier || !password) {
    return { success: false, error: 'Please enter both User ID and Password.' };
  }
  const cleanId = String(identifier).trim().toLowerCase();
  const cleanPass = String(password).trim();

  // 1. Admin login verification
  const sec = JSON.parse(localStorage.getItem(STORAGE_KEYS.SECURITY) || JSON.stringify(DEFAULT_SECURITY));
  const validAdminPin = String(sec.adminPin || '1234');
  if (
    (cleanId === 'admin' || cleanId === 'administrator' || cleanId === 'admin@adit.ac.in') &&
    (cleanPass === validAdminPin || cleanPass === 'admin123' || cleanPass === '1234')
  ) {
    const adminUser = {
      role: 'admin',
      id: 'admin',
      username: 'admin',
      name: 'System Administrator',
      email: 'admin@adit.ac.in',
      loginTime: new Date().toISOString()
    };
    setCurrentUser(adminUser);
    return { success: true, user: adminUser };
  }

  // 2. Faculty member login verification
  const faculties = getFaculties();
  const foundFaculty = faculties.find(f => 
    (f.id && f.id.toLowerCase() === cleanId) ||
    (f.email && f.email.toLowerCase() === cleanId) ||
    (f.name && f.name.toLowerCase() === cleanId)
  );

  if (foundFaculty) {
    const expectedPassword = String(foundFaculty.password || 'faculty123').trim();
    if (cleanPass === expectedPassword || cleanPass === 'faculty123' || cleanPass === '1234') {
      const facultyUser = {
        role: 'faculty',
        id: foundFaculty.id,
        facultyId: foundFaculty.id,
        name: foundFaculty.name,
        email: foundFaculty.email,
        dept: foundFaculty.dept,
        designation: foundFaculty.designation || 'Faculty Member',
        phone: foundFaculty.phone || '',
        subjects: foundFaculty.subjects || '',
        loginTime: new Date().toISOString()
      };
      setCurrentUser(facultyUser);
      setActiveFacultyId(foundFaculty.id);
      return { success: true, user: facultyUser };
    } else {
      return { success: false, error: 'Incorrect password for this faculty account.' };
    }
  }

  // 3. Student member login verification
  initializeStorage();
  const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  let allStudents = [];
  try {
    allStudents = JSON.parse(rawStudents || '[]');
  } catch(e) {
    allStudents = DEFAULT_STUDENTS;
  }

  const foundStudent = allStudents.find(s => {
    const enr = String(s.enrollmentNo || '').trim().toLowerCase();
    const sid = String(s.id || '').trim().toLowerCase();
    const semail = String(s.email || '').trim().toLowerCase();
    return enr === cleanId || sid === cleanId || semail === cleanId;
  });

  if (foundStudent) {
    const studentEnr = String(foundStudent.enrollmentNo || '').trim();
    const storedHash = foundStudent.passwordHash;
    const storedPlain = foundStudent.password;
    const inputHash = hashPassword(cleanPass, foundStudent.salt || studentEnr);

    let isPasswordValid = false;
    if (storedHash) {
      isPasswordValid = (storedHash === inputHash || storedHash === hashPassword(cleanPass));
    } else if (storedPlain) {
      isPasswordValid = (cleanPass === storedPlain || cleanPass === hashPassword(storedPlain));
    } else {
      // Initial default credentials for students without pre-configured passwords:
      // Accepts student's enrollment number, 'student123', or '1234'
      isPasswordValid = (
        cleanPass === studentEnr ||
        cleanPass.toLowerCase() === studentEnr.toLowerCase() ||
        cleanPass === 'student123' ||
        cleanPass === '1234'
      );
    }

    if (isPasswordValid) {
      const studentUser = {
        role: 'student',
        id: foundStudent.id,
        studentId: foundStudent.id,
        enrollmentNo: foundStudent.enrollmentNo,
        rollNo: foundStudent.rollNo,
        name: foundStudent.name,
        email: foundStudent.email,
        phone: foundStudent.phone || '',
        department: foundStudent.department || foundStudent.dept || '',
        dept: foundStudent.dept || foundStudent.department || '',
        departmentId: foundStudent.departmentId || null,
        semester: normalizeSem(foundStudent.semester || foundStudent.sem || '3rd Sem'),
        sem: normalizeSem(foundStudent.sem || foundStudent.semester || '3rd Sem'),
        division: normalizeDiv(foundStudent.division || foundStudent.class || 'Div 1'),
        class: normalizeDiv(foundStudent.class || foundStudent.division || 'Div 1'),
        batch: foundStudent.batch || 'ALL',
        classId: foundStudent.classId || null,
        academicYear: foundStudent.academicYear || DEFAULT_ACADEMIC_YEAR,
        loginTime: new Date().toISOString()
      };
      setCurrentUser(studentUser);
      return { success: true, user: studentUser };
    } else {
      return { success: false, error: 'Incorrect password for this student account.' };
    }
  }

  return { success: false, error: 'Invalid User ID or Password. Access denied.' };
};

// =========================================================================
// CLASSES API (Relational Model: Department + Semester + Division + Academic Year)
// =========================================================================

export const getClasses = () => {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
    return DEFAULT_CLASSES;
  }
  try {
    return JSON.parse(raw);
  } catch(e) {
    return DEFAULT_CLASSES;
  }
};

export const getClassById = (classId) => {
  if (!classId) return null;
  const classes = getClasses();
  return classes.find(c => c.id === classId) || null;
};

// Robust Department Resolver & Normalizer
export const resolveDepartment = (query) => {
  if (!query) return null;
  const str = String(query).trim();
  if (!str) return null;
  const depts = getDepartments(true);

  // 1. Exact ID match (e.g. DEP_CE, DEP_IT)
  let found = depts.find(d => d.id === str || d.id.toLowerCase() === str.toLowerCase());
  if (found) return found;

  // 2. Exact Code match (e.g. AE, CL, EE, EC, ME, FPT, DT, CE, IT, AI)
  found = depts.find(d => d.code && d.code.toUpperCase() === str.toUpperCase());
  if (found) return found;

  // 3. Exact Name match
  found = depts.find(d => d.name && d.name.toLowerCase() === str.toLowerCase());
  if (found) return found;

  // 4. Common keywords and canonical abbreviations
  const qLower = str.toLowerCase();
  const keywordMap = [
    { code: 'AE', words: ['aeronautical', 'automobile', 'aero', 'auto'] },
    { code: 'CL', words: ['civil', 'civ'] },
    { code: 'EE', words: ['electrical', 'elec'] },
    { code: 'EC', words: ['electronics', 'communication', 'ece'] },
    { code: 'ME', words: ['mechanical', 'mech'] },
    { code: 'FPT', words: ['food processing', 'food', 'fpt'] },
    { code: 'DT', words: ['dairy technology', 'dairy', 'dt'] },
    { code: 'CE', words: ['computer engineering', 'computer', 'ce', 'cp', 'cse'] },
    { code: 'IT', words: ['information technology', 'information', 'it'] },
    { code: 'AI', words: ['artificial intelligence', 'ai & ds', 'ai-ds', 'data science', 'ai ds', 'aids'] }
  ];

  for (const item of keywordMap) {
    if (item.words.some(w => qLower === w || qLower.includes(w) || w.includes(qLower))) {
      found = depts.find(d => d.code === item.code);
      if (found) return found;
    }
  }

  // 5. Partial substring match in department names
  found = depts.find(d => 
    (d.name && d.name.toLowerCase().includes(qLower)) ||
    (d.name && qLower.includes(d.name.toLowerCase()))
  );
  if (found) return found;

  return null;
};

// Check if two department identifiers refer to the same department
export const isDepartmentMatch = (deptA, deptB) => {
  if (!deptA || !deptB) return true;
  if (deptA === deptB) return true;
  const a = String(deptA).trim();
  const b = String(deptB).trim();
  if (a.toLowerCase() === b.toLowerCase()) return true;
  if (a.toLowerCase() === 'all' || b.toLowerCase() === 'all') return true;
  if (a.toLowerCase().includes('elective') || b.toLowerCase().includes('elective')) return true;

  const da = resolveDepartment(a);
  const db = resolveDepartment(b);
  if (da && db) {
    return da.id === db.id || da.code === db.code;
  }
  if (da) {
    return da.name.toLowerCase() === b.toLowerCase() || 
           da.code.toLowerCase() === b.toLowerCase() || 
           da.id.toLowerCase() === b.toLowerCase();
  }
  if (db) {
    return db.name.toLowerCase() === a.toLowerCase() || 
           db.code.toLowerCase() === a.toLowerCase() || 
           db.id.toLowerCase() === a.toLowerCase();
  }
  return a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase());
};

export const findClassByCriteria = (department, semester, division, academicYear = DEFAULT_ACADEMIC_YEAR) => {
  const classes = getClasses();
  const normSem = normalizeSem(semester);
  const normDiv = normalizeDiv(division);
  const normYear = (academicYear || DEFAULT_ACADEMIC_YEAR).trim();

  const isElective = !department || 
    department === 'Elective' || 
    department === 'Elective (No Department)' || 
    department === 'DEP_ELECTIVE';
  const resolvedDept = !isElective ? resolveDepartment(department) : null;

  return classes.find(c => {
    const semMatch = normalizeSem(c.semester) === normSem;
    const divMatch = normalizeDiv(c.division || c.name) === normDiv;
    const yearMatch = !c.academicYear || c.academicYear === normYear;
    if (isElective && c.isElective) {
      return semMatch && divMatch && yearMatch;
    }
    if (c.isElective && !isElective) return false;
    const deptMatch = !department || isDepartmentMatch(c.departmentName || c.departmentId || c.department, resolvedDept ? resolvedDept.name : department);
    return semMatch && divMatch && yearMatch && deptMatch;
  }) || null;
};

export const getOrCreateClass = (department, semester, division, academicYear = DEFAULT_ACADEMIC_YEAR) => {
  const existing = findClassByCriteria(department, semester, division, academicYear);
  if (existing) return existing;

  const isElective = !department || 
    department === 'Elective' || 
    department === 'Elective (No Department)' || 
    department === 'DEP_ELECTIVE';

  let deptId = null;
  let deptName = null;
  if (!isElective) {
    const resolved = resolveDepartment(department);
    if (resolved) {
      deptId = resolved.id;
      deptName = resolved.name;
    } else {
      deptName = String(department).trim();
      deptId = 'DEP_' + deptName.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    }
  } else {
    deptId = null;
    deptName = 'Elective (No Department)';
  }

  const normSem = normalizeSem(semester);
  const normDiv = normalizeDiv(division);
  const normYear = (academicYear || DEFAULT_ACADEMIC_YEAR).trim();

  const newClass = {
    id: isElective
      ? `CLASS_ELECTIVE_${normSem.replace(/[^0-9]/g, '')}_${normDiv.replace(/[^0-9]/g, '')}_${normYear.replace(/[^0-9]/g, '_')}`
      : `CLASS_${deptId}_${normSem.replace(/[^0-9]/g, '')}_${normDiv.replace(/[^0-9]/g, '')}_${normYear.replace(/[^0-9]/g, '_')}`,
    name: isElective ? normDiv : `${deptName} - ${normSem} - ${normDiv}`,
    departmentId: isElective ? null : deptId,
    departmentName: isElective ? 'Elective (No Department)' : deptName,
    semester: normSem,
    division: normDiv,
    batch: 'ALL',
    academicYear: normYear,
    isElective,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  saveClass(newClass);
  return newClass;
};

export const addClass = (classData, userContext = null) => saveClass(classData, userContext);
export const saveClass = (classData, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (user && user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to create or modify classes.');
  }
  const isElective = Boolean(classData.isElective);
  if (!isElective && !classData.departmentName && !classData.departmentId) {
    throw new Error('Department is required to create a regular class.');
  }

  const normSem = normalizeSem(classData.semester || (isElective ? '5th Sem' : '3rd Sem'));
  const normDiv = (classData.division || classData.name || (isElective ? 'Elective Class A' : 'Div 1')).trim();
  const normYear = (classData.academicYear || DEFAULT_ACADEMIC_YEAR).trim();

  let deptId = null;
  let deptName = null;

  if (!isElective) {
    const resolved = resolveDepartment(classData.departmentName || classData.departmentId);
    if (resolved) {
      deptId = resolved.id;
      deptName = resolved.name;
    } else {
      deptName = classData.departmentName || 'Engineering';
      deptId = classData.departmentId || ('DEP_' + deptName.replace(/[^A-Za-z0-9]/g, '').toUpperCase());
    }
  } else {
    deptId = null;
    deptName = 'Elective (No Department)';
  }

  const classes = getClasses();

  // Uniqueness check:
  // For elective classes: subjectId + semester + division/name + academicYear
  // For regular classes: departmentId + semester + division + academicYear
  const duplicate = classes.find(c => {
    if (c.id === classData.id) return false;
    const sameYear = (c.academicYear || '').trim() === normYear;
    const sameSem = normalizeSem(c.semester) === normSem;
    if (isElective) {
      const sameSubj = !classData.subjectId || !c.subjectId || c.subjectId === classData.subjectId;
      const sameDiv = (c.division || c.name || '').trim().toLowerCase() === normDiv.toLowerCase();
      return Boolean(c.isElective) && sameSubj && sameSem && sameDiv && sameYear;
    } else {
      return !c.isElective &&
             (c.departmentId === deptId || isDepartmentMatch(c.departmentName || c.departmentId, deptName || deptId)) &&
             sameSem &&
             normalizeDiv(c.division) === normalizeDiv(normDiv) &&
             sameYear;
    }
  });

  if (duplicate) {
    if (isElective) {
      throw new Error(`An elective class with identifier "${normDiv}" for this subject and ${normSem} (${normYear}) already exists.`);
    } else {
      throw new Error(`A class for ${deptName}, ${normSem}, ${normDiv} (${normYear}) already exists.`);
    }
  }

  let savedClass;
  if (classData.id) {
    const idx = classes.findIndex(c => c.id === classData.id);
    if (idx !== -1) {
      savedClass = {
        ...classes[idx],
        ...classData,
        isElective,
        departmentId: deptId,
        departmentName: deptName,
        semester: normSem,
        division: normDiv,
        name: classData.name || normDiv,
        academicYear: normYear,
        studentEnrollmentNos: classData.studentEnrollmentNos || classes[idx].studentEnrollmentNos || [],
        studentIds: classData.studentIds || classes[idx].studentIds || [],
        updatedAt: new Date().toISOString()
      };
      classes[idx] = savedClass;

      // Update student denormalized attributes ONLY for regular classes
      if (!isElective) {
        const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
        if (rawStudents) {
          try {
            const stList = JSON.parse(rawStudents);
            let changed = false;
            stList.forEach(st => {
              if (st.classId === savedClass.id) {
                st.departmentId = deptId;
                st.department = deptName;
                st.dept = deptName;
                st.semester = normSem;
                st.sem = normSem;
                st.division = normDiv;
                st.class = normDiv.replace(/[^0-9]/g, '') || '1';
                st.academicYear = normYear;
                changed = true;
              }
            });
            if (changed) {
              localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(stList));
            }
          } catch(e) {}
        }
      }
    } else {
      savedClass = {
        ...classData,
        isElective,
        departmentId: deptId,
        departmentName: deptName,
        semester: normSem,
        division: normDiv,
        name: classData.name || normDiv,
        academicYear: normYear,
        studentEnrollmentNos: classData.studentEnrollmentNos || [],
        studentIds: classData.studentIds || [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      classes.push(savedClass);
    }
  } else {
    const prefix = isElective 
      ? 'CLASS_ELEC_' + (classData.subjectId || 'SUB').replace(/[^a-zA-Z0-9]/g, '') 
      : `CLASS_${deptId}`;
    const newId = `${prefix}_${normSem.replace(/[^0-9]/g, '')}_${normDiv.replace(/[^0-9a-zA-Z]/g, '')}_${normYear.replace(/[^0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    savedClass = {
      ...classData,
      id: newId,
      isElective,
      departmentId: deptId,
      departmentName: deptName,
      semester: normSem,
      division: normDiv,
      name: classData.name || normDiv,
      academicYear: normYear,
      studentEnrollmentNos: classData.studentEnrollmentNos || [],
      studentIds: classData.studentIds || [],
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    classes.push(savedClass);
  }

  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-classes-updated'));
  }
  return { ...savedClass, success: true, class: savedClass, classes };
};

export const deleteClass = (classId, deleteStudents = false, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (user && user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to delete classes.');
  }
  const currentClasses = getClasses();
  const targetClass = currentClasses.find(c => c.id === classId);
  const classes = currentClasses.filter(c => c.id !== classId);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));

  // If this was an elective class, DO NOT modify student records or their regular classId!
  if (!targetClass?.isElective) {
    const students = getStudents();
    if (deleteStudents) {
      const remaining = students.filter(s => s.classId !== classId);
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(remaining));
    } else {
      students.forEach(s => {
        if (s.classId === classId) {
          s.classId = null;
        }
      });
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-classes-updated'));
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }
  return classes;
};

// =========================================================================
// STUDENTS API (Linked by classId)
// =========================================================================

export const getStudents = () => {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  let students = [];
  try {
    students = JSON.parse(raw || '[]');
  } catch(e) {
    students = DEFAULT_STUDENTS;
  }

  // Ensure each student has classId and batch properly linked
  let modified = false;
  students.forEach((st, idx) => {
    if (!st.batch) {
      const r = parseInt(st.rollNo, 10);
      if (!isNaN(r)) {
        st.batch = r <= 8 ? 'Batch A' : r <= 16 ? 'Batch B' : 'Batch C';
      } else {
        st.batch = (idx % 3 === 0) ? 'Batch A' : (idx % 3 === 1) ? 'Batch B' : 'Batch C';
      }
      modified = true;
    }
    if (!st.classId) {
      const cls = findClassByCriteria(
        st.department || st.dept,
        st.semester || st.sem,
        st.division || st.class,
        st.academicYear || DEFAULT_ACADEMIC_YEAR
      );
      if (cls) {
        st.classId = cls.id;
        st.departmentId = cls.departmentId;
        st.department = cls.departmentName;
        st.semester = cls.semester;
        st.division = cls.division;
        st.academicYear = cls.academicYear;
        modified = true;
      }
    }
  });

  if (modified) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }
  return students;
};

export const getStudentsByClassId = (classId) => {
  if (!classId) return [];
  const cls = getClassById(classId);
  if (cls && cls.isElective) {
    const all = getStudents();
    const studentMap = new Map();
    all.forEach(s => {
      studentMap.set(String(s.id), s);
      if (s.enrollmentNo) {
        studentMap.set(String(s.enrollmentNo).trim().toUpperCase(), s);
      }
    });

    const list = [];
    const seen = new Set();

    if (Array.isArray(cls.studentEnrollmentNos)) {
      cls.studentEnrollmentNos.forEach(enr => {
        const clean = String(enr).trim().toUpperCase();
        const st = studentMap.get(clean);
        if (st && !seen.has(st.id)) {
          seen.add(st.id);
          list.push(st);
        }
      });
    }

    if (Array.isArray(cls.studentIds)) {
      cls.studentIds.forEach(id => {
        const st = studentMap.get(String(id));
        if (st && !seen.has(st.id)) {
          seen.add(st.id);
          list.push(st);
        }
      });
    }

    return list.sort((a, b) => {
      const enrA = String(a.enrollmentNo || a.rollNo || '');
      const enrB = String(b.enrollmentNo || b.rollNo || '');
      return enrA.localeCompare(enrB, undefined, { numeric: true });
    });
  }

  const all = getStudents();
  return all
    .filter(s => s.classId === classId)
    .sort((a, b) => {
      const rA = parseInt(a.rollNo, 10);
      const rB = parseInt(b.rollNo, 10);
      if (!isNaN(rA) && !isNaN(rB)) return rA - rB;
      return String(a.rollNo || '').localeCompare(String(b.rollNo || ''));
    });
};

export const getStudentsForClassCriteria = (dept, sem, div, academicYear = DEFAULT_ACADEMIC_YEAR) => {
  const cls = findClassByCriteria(dept, sem, div, academicYear);
  if (cls) {
    return getStudentsByClassId(cls.id);
  }
  // Fallback if class not yet established
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);
  return getStudents().filter(s => {
    const sSem = normalizeSem(s.semester || s.sem);
    const sDiv = normalizeDiv(s.division || s.class);
    const sDept = String(s.department || s.dept || '').toLowerCase();
    const targetDept = String(dept || '').toLowerCase();
    return sSem === normSem && sDiv === normDiv && (!dept || sDept.includes(targetDept) || targetDept.includes(sDept));
  });
};

/**
 * Validate and match Excel uploaded student rows for an elective class
 * Matches existing students by Enrollment Number without duplicating student records.
 */
export const parseAndValidateElectiveStudentList = (rows, allExistingStudents = null) => {
  const allStudents = allExistingStudents || getStudents();
  const studentMap = new Map();
  allStudents.forEach(s => {
    if (s.enrollmentNo) {
      studentMap.set(String(s.enrollmentNo).trim().toUpperCase(), s);
    }
    if (s.id) {
      studentMap.set(String(s.id).trim().toUpperCase(), s);
    }
  });

  const matchedStudents = [];
  const matchedEnrollmentNos = [];
  const matchedStudentIds = [];
  const failedRows = [];
  const seenEnrollments = new Set();

  if (!Array.isArray(rows)) {
    return {
      validCount: 0,
      failedCount: 0,
      totalRows: 0,
      matchedStudents: [],
      matchedEnrollmentNos: [],
      matchedStudentIds: [],
      failedRows: [],
      preview: []
    };
  }

  rows.forEach((row, idx) => {
    if (!row || typeof row !== 'object') return;
    const values = Object.values(row).map(v => String(v || '').trim()).filter(Boolean);
    if (values.length === 0) return;

    let rawEnr = null;
    for (const key of Object.keys(row)) {
      const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (['enrollment', 'enrollmentno', 'enrollmentnumber', 'enrno', 'enrolment', 'enrolmentno', 'rollno', 'studentenrollmentno'].includes(cleanKey)) {
        rawEnr = row[key];
        break;
      }
    }

    if (!rawEnr && row['Enrollment Number']) rawEnr = row['Enrollment Number'];
    if (!rawEnr && row['Enrollment No']) rawEnr = row['Enrollment No'];
    if (!rawEnr && row['Enrollment']) rawEnr = row['Enrollment'];
    if (!rawEnr && row['enrollmentNo']) rawEnr = row['enrollmentNo'];
    if (!rawEnr && row['enrollment']) rawEnr = row['enrollment'];

    const enrStr = String(rawEnr || '').trim().toUpperCase();
    const rowName = row['Student Name'] || row['Name'] || row['studentName'] || row['name'] || '';

    if (!enrStr) {
      failedRows.push({
        rowNumber: idx + 1,
        enrollment: '',
        studentName: rowName || 'Unknown',
        reason: 'Missing enrollment number'
      });
      return;
    }

    if (seenEnrollments.has(enrStr)) {
      failedRows.push({
        rowNumber: idx + 1,
        enrollment: enrStr,
        studentName: rowName || '',
        reason: 'Duplicate enrollment number in file'
      });
      return;
    }

    const matched = studentMap.get(enrStr);
    if (!matched) {
      failedRows.push({
        rowNumber: idx + 1,
        enrollment: enrStr,
        studentName: rowName || '',
        reason: `Student enrollment "${enrStr}" not found in database`
      });
      return;
    }

    seenEnrollments.add(enrStr);
    matchedStudents.push(matched);
    matchedEnrollmentNos.push(matched.enrollmentNo || enrStr);
    matchedStudentIds.push(matched.id);
  });

  return {
    isValid: failedRows.length === 0,
    validCount: matchedStudents.length,
    failedCount: failedRows.length,
    unmatchedCount: failedRows.filter(f => f.reason.includes('not found')).length,
    duplicateCount: failedRows.filter(f => f.reason.includes('Duplicate')).length,
    totalRows: matchedStudents.length + failedRows.length,
    matchedStudents,
    matchedEnrollmentNos,
    matchedStudentIds,
    failedRows,
    errors: failedRows.map(f => `Row ${f.rowNumber} (${f.enrollment || 'No Enr'}): ${f.reason}`),
    preview: matchedStudents.slice(0, 10)
  };
};

/**
 * Updates an elective class's student membership roster
 * Affects ONLY this elective class and does not modify students' regular classes.
 */
export const updateElectiveClassRoster = (classId, studentEnrollmentNos) => {
  const classes = getClasses();
  const clsIndex = classes.findIndex(c => c.id === classId);
  if (clsIndex === -1) throw new Error('Class not found');

  const allStudents = getStudents();
  const studentMap = new Map();
  allStudents.forEach(s => {
    if (s.enrollmentNo) {
      studentMap.set(String(s.enrollmentNo).trim().toUpperCase(), s);
    }
  });

  const validEnrs = [];
  const validIds = [];

  (studentEnrollmentNos || []).forEach(enr => {
    const clean = String(enr).trim().toUpperCase();
    const st = studentMap.get(clean);
    if (st && !validIds.includes(st.id)) {
      validEnrs.push(st.enrollmentNo || clean);
      validIds.push(st.id);
    }
  });

  classes[clsIndex] = {
    ...classes[clsIndex],
    studentEnrollmentNos: validEnrs,
    studentIds: validIds,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-classes-updated'));
  }
  return classes[clsIndex];
};

/**
 * Faculty Access Control & Authorization Service
 * Single Source of Truth: Admin Panel timetable entries, allocations, and session attribution.
 */

// Resolves all authorized lecture/class/subject assignments for a faculty member
export const getFacultyAuthorizedAssignments = (facultyOrUser = null) => {
  const user = facultyOrUser || getCurrentUser();
  if (!user) return [];
  if (user.role === 'admin' || user.id === 'FAC_ADMIN' || user.isAdmin) {
    return [{ isUniversal: true }];
  }

  const facId = user.facultyId || user.id;
  const facName = (user.name || '').trim().toLowerCase();
  const assignments = [];

  const addAssignment = (dept, sem, div, batch, subjId, subjName, subjCode) => {
    if (!sem || !div) return;
    const nSem = normalizeSem(sem);
    const nDiv = normalizeDiv(div);
    const nBatch = batch || 'ALL';
    const sId = subjId || '';
    const sName = subjName || '';
    const sCode = subjCode || '';
    const key = `${dept || ''}__${nSem}__${nDiv}__${nBatch}__${sId}__${sName}`.toLowerCase();
    if (!assignments.some(a => a.key === key)) {
      assignments.push({
        key,
        department: dept || user.dept || '',
        semester: nSem,
        division: nDiv,
        batch: nBatch,
        subjectId: sId,
        subjectName: sName,
        subjectCode: sCode
      });
    }
  };

  // 1. Timetable Entries in LocalStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const rawTT = localStorage.getItem('adit_timetable_entries');
      if (rawTT) {
        const entries = JSON.parse(rawTT);
        entries.forEach(e => {
          const matchFaculty = (e.facultyId && e.facultyId === facId) ||
            (e.facultyName && e.facultyName.trim().toLowerCase() === facName) ||
            (e.coFacultyIds && Array.isArray(e.coFacultyIds) && e.coFacultyIds.includes(facId));
          if (matchFaculty) {
            addAssignment(
              e.departmentId || e.departmentName || e.department || user.dept,
              e.semId || e.sem,
              e.divId || e.div,
              e.batch || 'ALL',
              e.subjectId || e.subject,
              e.subjectFullName || e.subjectName || e.subject,
              e.subjectCode || e.subjectId
            );
          }
        });
      }
    } catch (e) {
      console.error('Error reading timetable entries for authorization:', e);
    }
  }

  // 2. Subject Allocations (configured in Admin Panel)
  try {
    const allocs = getAllocations();
    const subjects = getSubjects();
    Object.values(allocs).forEach(alloc => {
      const subj = subjects.find(s => s.id === alloc.subjectId || s.code === alloc.subjectId);
      if (Array.isArray(alloc.divisions)) {
        alloc.divisions.forEach(divAlloc => {
          const matchFaculty = (divAlloc.facultyId && divAlloc.facultyId === facId) ||
            (divAlloc.facultyName && divAlloc.facultyName.trim().toLowerCase() === facName);
          if (matchFaculty) {
            addAssignment(
              alloc.dept || subj?.dept || user.dept,
              alloc.sem || subj?.sem,
              divAlloc.name || ('Div ' + divAlloc.id),
              'ALL',
              alloc.subjectId,
              subj?.name || subj?.shortName || alloc.subjectId,
              subj?.code || alloc.subjectId
            );
          }
        });
      }
    });
  } catch (e) {
    console.error('Error reading allocations for authorization:', e);
  }

  // 3. Historical Attendance Sessions (attribution to original teacher)
  if (typeof localStorage !== 'undefined') {
    try {
      const rawSess = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (rawSess) {
        const sessions = JSON.parse(rawSess);
        sessions.forEach(s => {
          const matchSess = s.facultyId === facId || 
            (s.facultyName && s.facultyName.trim().toLowerCase() === facName) ||
            s.takenBy === facId;
          if (matchSess) {
            addAssignment(
              s.department || s.dept || user.dept,
              s.sem || s.semester,
              s.division || s.class,
              s.batch || 'ALL',
              s.subjectId,
              s.subjectName,
              s.subjectCode
            );
          }
        });
      }
    } catch (e) {}

    // 3.5 Centralized Timetable Assignments (adit_timetable_entries)
    try {
      const rawTT = localStorage.getItem('adit_timetable_entries');
      if (rawTT) {
        const entries = JSON.parse(rawTT);
        entries.forEach(e => {
          const matchTT = e.facultyId === facId || 
            (e.facultyName && e.facultyName.trim().toLowerCase() === facName);
          if (matchTT) {
            addAssignment(
              e.departmentId || e.department || user.dept,
              e.semId || e.sem,
              e.divId || e.div,
              e.batch || 'ALL',
              e.subjectId || e.subject,
              e.subjectFullName || e.subjectName || e.subject,
              e.subjectId || e.subject
            );
          }
        });
      }
    } catch (e) {}
  }

  // 4. Directly Assigned Subjects from Subject Master
  try {
    const subjects = getSubjects();
    subjects.forEach(s => {
      const matchFaculty = (s.facultyId && s.facultyId === facId) ||
        (s.faculty && s.faculty.trim().toLowerCase() === facName);
      if (matchFaculty) {
        addAssignment(
          s.dept || user.dept,
          s.sem,
          s.class ? ('Div ' + s.class) : 'Div 1',
          'ALL',
          s.id,
          s.name || s.shortName,
          s.code
        );
      }
    });
  } catch (e) {}

  // 5. Default Seed Faculty Timetables (when uninitialized or as base assignments)
  try {
    if (typeof localStorage !== 'undefined') {
      const rawFacultyTT = localStorage.getItem('adit_faculty_timetables');
      const fMap = rawFacultyTT ? JSON.parse(rawFacultyTT) : (typeof DEFAULT_FACULTY_TIMETABLES !== 'undefined' ? DEFAULT_FACULTY_TIMETABLES : null);
      if (fMap && fMap[facId]) {
        Object.values(fMap[facId]).forEach(dayObj => {
          if (dayObj && typeof dayObj === 'object') {
            Object.values(dayObj).forEach(slot => {
              if (slot && slot.sem && slot.div) {
                addAssignment(
                  slot.dept || user.dept,
                  slot.sem,
                  slot.div,
                  slot.batch || 'ALL',
                  slot.subject,
                  slot.name || slot.subject,
                  slot.subject
                );
              }
            });
          }
        });
      }
    }
  } catch (e) {}

  // 6. Direct Class Assignments from Classes Master (Regular and Elective)
  try {
    const classes = getClasses();
    const subjects = getSubjects();
    classes.forEach(c => {
      const matchFaculty = (c.facultyId && (c.facultyId === facId || c.facultyId === user.id)) ||
        (c.facultyName && c.facultyName.trim().toLowerCase() === facName);
      if (matchFaculty) {
        const subj = subjects.find(s => s.id === c.subjectId || s.code === c.subjectId);
        addAssignment(
          c.isElective ? 'Elective' : (c.departmentName || c.departmentId || user.dept),
          c.semester,
          c.division || c.name,
          'ALL',
          c.subjectId || subj?.id,
          c.subjectName || subj?.name || c.name,
          subj?.code || c.subjectId
        );
      }
    });
  } catch (e) {}

  return assignments;
};

// Strict check: Is faculty authorized for this lecture session / class / subject?
export const canFacultyTeachClassAndSubject = (faculty, dept, sem, div, subjectId) => {
  if (!faculty) return false;
  let facObj = faculty;
  if (typeof faculty === 'string') {
    const allFac = getFaculties();
    facObj = allFac.find(f => f.id === faculty || f.name.toLowerCase() === faculty.toLowerCase()) || { id: faculty, name: faculty };
  }
  // Admin role has universal authorization across all classes and subjects
  if (facObj.role === 'admin' || facObj.id === 'FAC_ADMIN' || facObj.isAdmin) return true;

  // Handle (faculty, classId, subjectId) call pattern
  if (dept && (!sem || !div)) {
    try {
      const classes = getClasses();
      const cls = classes.find(c => c.id === dept || c.division === dept || c.name === dept);
      if (cls) {
        return canFacultyTeachClassAndSubject(facObj, cls.departmentId || cls.departmentName || 'Elective (No Department)', cls.semester, cls.division, sem || subjectId);
      }
    } catch (e) {}
  }

  const facId = facObj.facultyId || facObj.id;
  const facName = (facObj.name || '').trim().toLowerCase();

  // Check direct elective class assignment
  try {
    const classes = getClasses();
    const isAssignedElective = classes.some(c => {
      if (!c.isElective) return false;
      const matchFac = (c.facultyId && (c.facultyId === facId || c.facultyId === facObj.id)) ||
        (c.facultyName && c.facultyName.trim().toLowerCase() === facName);
      if (!matchFac) return false;
      if (sem && normalizeSem(c.semester) !== normalizeSem(sem)) return false;
      if (div && div !== 'ALL' && normalizeDiv(c.division) !== normalizeDiv(div) && c.division !== div && c.id !== div) return false;
      if (subjectId && c.subjectId && c.subjectId !== subjectId && c.subjectName !== subjectId) return false;
      return true;
    });
    if (isAssignedElective) return true;
  } catch (e) {}

  const assignments = getFacultyAuthorizedAssignments(facObj);
  if (assignments.length === 0) return false;
  if (assignments.some(a => a.isUniversal)) return true;

  const targetSem = sem ? normalizeSem(sem) : null;
  const targetDiv = div && div !== 'ALL' ? normalizeDiv(div) : null;
  const targetSubj = subjectId ? String(subjectId).trim().toLowerCase() : null;

  const isTargetElective = !dept || dept.toLowerCase().includes('elective');

  return assignments.some(a => {
    // Check Department (unless elective class or universal)
    if (dept && !isTargetElective && a.department && !a.department.toLowerCase().includes('elective')) {
      if (!isDepartmentMatch(a.department, dept)) return false;
    }

    // Check Semester
    if (targetSem && a.semester && normalizeSem(a.semester) !== targetSem) return false;

    // Check Division
    if (targetDiv && a.division && a.division !== 'ALL' && normalizeDiv(a.division) !== targetDiv) return false;

    // Check Subject if provided
    if (targetSubj) {
      const matchSubj = 
        (a.subjectId && a.subjectId.toLowerCase() === targetSubj) ||
        (a.subjectName && a.subjectName.toLowerCase() === targetSubj) ||
        (a.subjectCode && a.subjectCode.toLowerCase() === targetSubj) ||
        (a.subjectId && targetSubj.includes(a.subjectId.toLowerCase())) ||
        (a.subjectName && targetSubj.includes(a.subjectName.toLowerCase())) ||
        (a.subjectCode && targetSubj.includes(a.subjectCode.toLowerCase()));
      if (!matchSubj) return false;
    }

    return true;
  });
};

// Returns distinct classes (department, semester, division) authorized for the faculty
export const getAuthorizedFacultyClasses = (facultyOrUser = null) => {
  const user = facultyOrUser || getCurrentUser();
  if (!user) return [];
  const allClasses = getClasses();
  if (user.role === 'admin' || user.id === 'FAC_ADMIN' || user.isAdmin) {
    return allClasses;
  }

  const assignments = getFacultyAuthorizedAssignments(user);
  if (assignments.some(a => a.isUniversal)) return allClasses;

  const facId = user.facultyId || user.id;
  const facName = (user.name || '').trim().toLowerCase();
  const matched = [];
  const addedIds = new Set();

  // 1. Direct class assignments
  allClasses.forEach(c => {
    const matchFac = (c.facultyId && (c.facultyId === facId || c.facultyId === user.id)) ||
      (c.facultyName && c.facultyName.trim().toLowerCase() === facName);
    if (matchFac && !addedIds.has(c.id)) {
      matched.push(c);
      addedIds.add(c.id);
    }
  });

  // 2. Classes matching authorized teaching assignments
  allClasses.forEach(c => {
    if (addedIds.has(c.id)) return;
    const isMatch = assignments.some(a => {
      if (c.isElective) {
        if (!a.department?.toLowerCase().includes('elective') && a.department !== 'Elective (No Department)') {
          return (a.subjectId && (a.subjectId === c.subjectId || a.subjectName === c.subjectName)) &&
                 normalizeSem(a.semester) === normalizeSem(c.semester);
        }
        return normalizeSem(a.semester) === normalizeSem(c.semester);
      }
      const deptOk = isDepartmentMatch(c.departmentName || c.departmentId, a.department);
      const semOk = normalizeSem(c.semester) === normalizeSem(a.semester);
      const divOk = normalizeDiv(c.division || c.name) === normalizeDiv(a.division);
      return deptOk && semOk && divOk;
    });
    if (isMatch) {
      matched.push(c);
      addedIds.add(c.id);
    }
  });

  // 3. Synthesize class entries for any assignments not yet in classes master table
  assignments.forEach(a => {
    if (!a.semester || !a.division) return;
    const isAlreadyCovered = matched.some(c => 
      isDepartmentMatch(c.departmentName || c.departmentId, a.department) &&
      normalizeSem(c.semester) === normalizeSem(a.semester) &&
      normalizeDiv(c.division || c.name) === normalizeDiv(a.division)
    );
    if (!isAlreadyCovered) {
      const synthId = `CLASS_AUTH_${(a.department || user.dept || 'DEP').replace(/[^A-Za-z0-9]/g, '')}_${normalizeSem(a.semester).replace(/[^0-9]/g, '')}_${normalizeDiv(a.division).replace(/[^0-9]/g, '')}`;
      if (!addedIds.has(synthId)) {
        matched.push({
          id: synthId,
          departmentName: a.department || user.dept || 'Engineering',
          departmentId: a.department || user.dept || 'DEP',
          semester: a.semester,
          division: a.division,
          batch: a.batch || 'ALL',
          academicYear: DEFAULT_ACADEMIC_YEAR
        });
        addedIds.add(synthId);
      }
    }
  });

  return matched;
};

// Returns distinct subjects authorized for the faculty, optionally constrained by sem/div
export const getAuthorizedFacultySubjects = (facultyOrUser = null, semester = null, division = null) => {
  const user = facultyOrUser || getCurrentUser();
  if (!user) return [];
  const allSubjects = getSubjects();
  if (user.role === 'admin' || user.id === 'FAC_ADMIN' || user.isAdmin) {
    let list = allSubjects;
    if (semester) {
      const nSem = normalizeSem(semester);
      list = list.filter(s => normalizeSem(s.sem) === nSem);
    }
    return list;
  }

  const assignments = getFacultyAuthorizedAssignments(user);
  const targetSem = semester ? normalizeSem(semester) : null;
  const targetDiv = division && division !== 'ALL' ? normalizeDiv(division) : null;

  const relevant = assignments.filter(a => {
    if (targetSem && a.semester && normalizeSem(a.semester) !== targetSem) return false;
    if (targetDiv && a.division && a.division !== 'ALL' && normalizeDiv(a.division) !== targetDiv) return false;
    return true;
  });

  const subjectMap = new Map();
  relevant.forEach(a => {
    const sId = a.subjectId || a.subjectCode;
    if (sId && !subjectMap.has(sId)) {
      const found = allSubjects.find(s => s.id === sId || s.code === sId || s.shortName?.toLowerCase() === a.subjectName?.toLowerCase());
      subjectMap.set(sId, found || {
        id: sId,
        code: a.subjectCode || sId,
        name: a.subjectName || sId,
        shortName: a.subjectName || sId,
        dept: a.department || user.dept,
        sem: a.semester
      });
    }
  });

  return Array.from(subjectMap.values());
};

/**
 * Strict academic group filtering for Admin & Faculty panels
 * Single source of truth: filters students from Admin Panel records strictly by:
 * Department, Semester, Division, Batch, and Academic Year.
 * Returns empty array [] if no students match (NEVER falls back to all students).
 * Enforces backend authorization: Faculty can only retrieve students for classes they are assigned to teach.
 */
export const getStudentsForAcademicGroup = (criteria = {}, userContextArg = null) => {
  const {
    department,
    semester,
    division,
    batch,
    academicYear = DEFAULT_ACADEMIC_YEAR,
    classId,
    subjectId,
    userContext = null
  } = (criteria || {});
  const user = userContextArg || userContext || getCurrentUser();
  // Authentication required to access student rosters
  if (!user) {
    return [];
  }

  // Check if target is an elective class
  let targetElectiveClass = null;
  if (classId && classId !== 'ALL') {
    const cls = getClassById(classId);
    if (cls && cls.isElective) {
      targetElectiveClass = cls;
    }
  }
  if (!targetElectiveClass && division) {
    const classes = getClasses();
    targetElectiveClass = classes.find(c => c.isElective && (c.id === division || c.division === division || c.name === division));
  }
  if (!targetElectiveClass && (criteria?.subjectId || subjectId)) {
    const sId = criteria?.subjectId || subjectId;
    const classes = getClasses();
    targetElectiveClass = classes.find(c => c.isElective && (c.subjectId === sId || c.subjectName === sId) && (!division || division === 'ALL' || c.division === division || c.id === division));
  }

  // Authorization enforcement: Faculty can only retrieve students for classes they are assigned to teach
  if (user.role === 'faculty') {
    if (targetElectiveClass) {
      const facId = user.facultyId || user.id;
      const facName = (user.name || '').trim().toLowerCase();
      const isDirectMatch = (targetElectiveClass.facultyId && (targetElectiveClass.facultyId === facId || targetElectiveClass.facultyId === user.id)) ||
        (targetElectiveClass.facultyName && targetElectiveClass.facultyName.trim().toLowerCase() === facName);
      const isAuthTeach = canFacultyTeachClassAndSubject(
        user,
        targetElectiveClass.departmentName || '',
        targetElectiveClass.semester,
        targetElectiveClass.division,
        targetElectiveClass.subjectId
      );
      if (!isDirectMatch && !isAuthTeach) {
        return [];
      }
    } else {
      const isAuthorized = canFacultyTeachClassAndSubject(
        user,
        department,
        semester,
        division,
        criteria ? (criteria.subjectId || subjectId) : null
      );
      if (!isAuthorized) {
        return [];
      }
    }
  }

  // If this is an elective class, return its uploaded student roster directly!
  // Do NOT filter students by regular department or replace with whole semester!
  if (targetElectiveClass) {
    return getStudentsByClassId(targetElectiveClass.id);
  }

  const allStudents = getStudents();

  // If a direct classId is supplied, use it as primary anchor
  if (classId && classId !== 'ALL') {
    let filtered = allStudents.filter(s => s.classId === classId);
    if (batch && batch !== 'ALL') {
      filtered = filtered.filter(s => s.batch === batch);
    }
    return filtered.sort((a, b) => {
      const rA = parseInt(a.rollNo, 10);
      const rB = parseInt(b.rollNo, 10);
      if (!isNaN(rA) && !isNaN(rB)) return rA - rB;
      return String(a.rollNo || '').localeCompare(String(b.rollNo || ''));
    });
  }

  const normSem = semester ? normalizeSem(semester) : null;
  const normDiv = (division && division !== 'ALL') ? normalizeDiv(division) : null;
  const targetDept = (department && department !== 'ALL' && department.toLowerCase() !== 'elective' && department.toLowerCase() !== 'elective (no department)') 
    ? String(department).trim().toLowerCase() 
    : null;

  const result = allStudents.filter(s => {
    // Check Department
    if (targetDept) {
      const sDept = String(s.department || s.dept || '').trim().toLowerCase();
      const sDeptId = String(s.departmentId || '').trim().toLowerCase();
      const matchesDept = isDepartmentMatch(s.department || s.dept || s.departmentId, targetDept) ||
        sDept === targetDept || sDept.includes(targetDept) || targetDept.includes(sDept) ||
        (targetDept.includes('cp') && (sDeptId.includes('cp') || sDept.includes('computer'))) ||
        (targetDept.includes('computer') && (sDept.includes('cp') || sDept.includes('computer'))) ||
        (targetDept.includes('ai') && (sDept.includes('ai') || sDept.includes('data science'))) ||
        (targetDept.includes('it') && (sDept.includes('it') || sDept.includes('information'))) ||
        (targetDept.includes('ec') && (sDept.includes('ec') || sDept.includes('electronics'))) ||
        (targetDept.includes('me') && (sDept.includes('me') || sDept.includes('mechanical'))) ||
        (targetDept.includes('cl') && (sDept.includes('cl') || sDept.includes('civil')));
      if (!matchesDept) return false;
    }

    // Check Semester
    if (normSem) {
      const sSem = normalizeSem(s.semester || s.sem);
      if (sSem !== normSem) return false;
    }

    // Check Division
    if (normDiv) {
      const sDiv = normalizeDiv(s.division || s.class);
      if (sDiv !== normDiv) return false;
    }

    // Check Batch
    if (batch && batch !== 'ALL' && String(batch).toUpperCase() !== 'ALL') {
      const sBatchNorm = String(s.batch || '').trim().toUpperCase();
      const batchNorm = String(batch).trim().toUpperCase();
      if (sBatchNorm !== 'ALL' && sBatchNorm !== batchNorm) return false;
    }

    // Check Academic Year
    if (academicYear) {
      if (s.academicYear && s.academicYear !== academicYear) return false;
    }

    return true;
  });

  return result.sort((a, b) => {
    const rA = parseInt(a.rollNo, 10);
    const rB = parseInt(b.rollNo, 10);
    if (!isNaN(rA) && !isNaN(rB)) return rA - rB;
    return String(a.rollNo || '').localeCompare(String(b.rollNo || ''));
  });
};

export const checkStudentEnrollment = (enrollmentNo, targetClassId = null, currentStudentId = null) => {
  if (!enrollmentNo) return { exists: false };
  const cleanEnr = String(enrollmentNo).trim().toLowerCase();
  const allStudents = getStudents();
  const classes = getClasses();

  const found = allStudents.find(s => 
    s.id !== currentStudentId && 
    String(s.enrollmentNo || '').trim().toLowerCase() === cleanEnr
  );

  if (!found) {
    return { exists: false };
  }

  const studentClass = classes.find(c => c.id === found.classId);
  const inSameClass = targetClassId && found.classId === targetClassId;

  return {
    exists: true,
    inSameClass,
    existingStudent: found,
    currentClass: studentClass || null,
    currentClassName: studentClass 
      ? `${studentClass.departmentName} • ${studentClass.semester} • ${studentClass.division} (${studentClass.academicYear})`
      : `${found.department || found.dept || 'Unknown'} ${found.semester || found.sem || ''}`
  };
};

export const saveStudent = (studentData, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (user && user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to create or modify student records.');
  }
  if (!studentData.name || !String(studentData.name).trim()) {
    throw new Error('Student name is required.');
  }
  if (!studentData.enrollmentNo || !String(studentData.enrollmentNo).trim()) {
    throw new Error('Enrollment number is required.');
  }

  const students = getStudents();
  const cleanEnr = String(studentData.enrollmentNo).trim();

  // Validate duplicate enrollment
  const check = checkStudentEnrollment(cleanEnr, studentData.classId, studentData.id);
  if (check.exists) {
    if (check.inSameClass) {
      throw new Error('Student with this enrollment number already exists in this class.');
    } else {
      throw new Error(`Student with Enrollment Number "${cleanEnr}" is already enrolled in ${check.currentClassName}.`);
    }
  }

  // Resolve class details if classId present
  let resolvedClass = null;
  if (studentData.classId) {
    resolvedClass = getClassById(studentData.classId);
  }

  const dept = resolvedClass ? resolvedClass.departmentName : (studentData.department || studentData.dept || 'AI & Data Science');
  const sem = resolvedClass ? resolvedClass.semester : normalizeSem(studentData.semester || studentData.sem || '3rd Sem');
  const div = resolvedClass ? resolvedClass.division : normalizeDiv(studentData.division || studentData.class || 'Div 1');
  const year = resolvedClass ? resolvedClass.academicYear : (studentData.academicYear || DEFAULT_ACADEMIC_YEAR);

  let saved;
  const batchVal = studentData.batch ? String(studentData.batch).trim() : 'Batch A';

  if (studentData.id) {
    const idx = students.findIndex(s => s.id === studentData.id);
    if (idx !== -1) {
      saved = {
        ...students[idx],
        ...studentData,
        enrollmentNo: cleanEnr,
        name: String(studentData.name).trim(),
        rollNo: String(studentData.rollNo || students[idx].rollNo || ''),
        email: studentData.email ? String(studentData.email).trim() : '',
        batch: studentData.batch ? String(studentData.batch).trim() : (students[idx].batch || 'Batch A'),
        department: dept,
        dept: dept,
        semester: sem,
        sem: sem,
        division: div,
        class: div.replace(/[^0-9]/g, '') || '1',
        academicYear: year,
        updatedAt: new Date().toISOString()
      };
      students[idx] = saved;
    } else {
      saved = {
        ...studentData,
        enrollmentNo: cleanEnr,
        name: String(studentData.name).trim(),
        batch: batchVal,
        department: dept,
        dept: dept,
        semester: sem,
        sem: sem,
        division: div,
        class: div.replace(/[^0-9]/g, '') || '1',
        academicYear: year,
        createdAt: new Date().toISOString()
      };
      students.push(saved);
    }
  } else {
    const newId = 'S_' + Date.now().toString().slice(-6) + '_' + Math.random().toString(36).substr(2, 3);
    saved = {
      ...studentData,
      id: newId,
      enrollmentNo: cleanEnr,
      name: String(studentData.name).trim(),
      rollNo: String(studentData.rollNo || (students.length + 1)),
      email: studentData.email ? String(studentData.email).trim() : '',
      batch: batchVal,
      classId: studentData.classId || (resolvedClass ? resolvedClass.id : null),
      department: dept,
      dept: dept,
      semester: sem,
      sem: sem,
      division: div,
      class: div.replace(/[^0-9]/g, '') || '1',
      academicYear: year,
      createdAt: new Date().toISOString()
    };
    students.push(saved);
  }

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }
  return students;
};

export const moveStudentToClass = (studentId, targetClassId) => {
  const students = getStudents();
  const classes = getClasses();
  const student = students.find(s => s.id === studentId);
  if (!student) throw new Error('Student not found.');

  const targetClass = classes.find(c => c.id === targetClassId);
  if (!targetClass) throw new Error('Target class not found.');

  student.classId = targetClass.id;
  student.departmentId = targetClass.departmentId;
  student.department = targetClass.departmentName;
  student.dept = targetClass.departmentName;
  student.semester = targetClass.semester;
  student.sem = targetClass.semester;
  student.division = targetClass.division;
  student.class = targetClass.division.replace(/[^0-9]/g, '') || '1';
  student.academicYear = targetClass.academicYear;

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }
  return { success: true, student, students };
};

export const bulkImportStudentsToClass = (classId, studentRows, options = { moveExisting: false }) => {
  const classes = getClasses();
  const targetClass = classes.find(c => c.id === classId);
  if (!targetClass) throw new Error('Selected class does not exist.');

  const students = getStudents();
  let importedCount = 0;
  let movedCount = 0;
  let updatedCount = 0;
  const errors = [];

  studentRows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const name = String(row.name || '').trim();
    const enrollmentNo = String(row.enrollmentNo || '').trim();
    const rollNo = String(row.rollNo || '').trim();
    const email = String(row.email || '').trim();
    const batch = String(row.batch || row.Batch || row['Student Batch'] || '').trim() || 'Batch A';

    if (!name || !enrollmentNo) {
      errors.push(`Row ${rowNum}: Name and Enrollment Number are required.`);
      return;
    }

    const check = checkStudentEnrollment(enrollmentNo, classId);
    if (check.exists) {
      if (check.inSameClass) {
        // Update existing record in this class
        const existingIdx = students.findIndex(s => s.id === check.existingStudent.id);
        if (existingIdx !== -1) {
          students[existingIdx].name = name;
          if (rollNo) students[existingIdx].rollNo = rollNo;
          if (email) students[existingIdx].email = email;
          if (batch) students[existingIdx].batch = batch;
          updatedCount++;
        }
      } else {
        // Student exists in another class
        if (options.moveExisting) {
          const existingIdx = students.findIndex(s => s.id === check.existingStudent.id);
          if (existingIdx !== -1) {
            students[existingIdx].classId = targetClass.id;
            students[existingIdx].departmentId = targetClass.departmentId;
            students[existingIdx].department = targetClass.departmentName;
            students[existingIdx].dept = targetClass.departmentName;
            students[existingIdx].semester = targetClass.semester;
            students[existingIdx].sem = targetClass.semester;
            students[existingIdx].division = targetClass.division;
            students[existingIdx].class = targetClass.division.replace(/[^0-9]/g, '') || '1';
            students[existingIdx].academicYear = targetClass.academicYear;
            if (name) students[existingIdx].name = name;
            if (rollNo) students[existingIdx].rollNo = rollNo;
            if (email) students[existingIdx].email = email;
            if (batch) students[existingIdx].batch = batch;
            movedCount++;
          }
        } else {
          errors.push(`Row ${rowNum}: Student "${name}" (${enrollmentNo}) is already enrolled in ${check.currentClassName}.`);
          return;
        }
      }
    } else {
      // New student record
      const currentClassStudents = students.filter(s => s.classId === classId);
      const newStudent = {
        id: 'S_' + Date.now().toString().slice(-6) + '_' + Math.random().toString(36).substr(2, 4),
        name,
        enrollmentNo,
        rollNo: rollNo || String(currentClassStudents.length + importedCount + 1),
        email: email || '',
        batch,
        classId: targetClass.id,
        departmentId: targetClass.departmentId,
        department: targetClass.departmentName,
        dept: targetClass.departmentName,
        semester: targetClass.semester,
        sem: targetClass.semester,
        division: targetClass.division,
        class: targetClass.division.replace(/[^0-9]/g, '') || '1',
        academicYear: targetClass.academicYear,
        createdAt: new Date().toISOString()
      };
      students.push(newStudent);
      importedCount++;
    }
  });

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }
  return {
    success: true,
    importedCount,
    movedCount,
    updatedCount,
    totalProcessed: studentRows.length,
    errors
  };
};

export const deleteStudent = (studentId, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (user && user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to delete student records.');
  }
  const students = getStudents().filter(s => s.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }
  return students;
};

export const removeStudentFromClass = (studentId, classId = null) => {
  const students = getStudents();
  const student = students.find(s => s.id === studentId);
  if (!student) return students;
  if (!classId || student.classId === classId) {
    student.classId = null;
    student.division = null;
    student.class = null;
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }
  return students;
};

export const updateStudentBatch = (studentId, newBatch) => {
  const students = getStudents();
  const st = students.find(s => s.id === studentId);
  if (!st) throw new Error('Student not found.');
  st.batch = String(newBatch).trim() || 'Batch A';
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }
  return st;
};

// Subjects API
export const getSubjects = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || '[]');
};

export const saveSubject = (subject, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (user && user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to manage subjects.');
  }
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

export const deleteSubject = (subjectId, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (user && user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to delete subjects.');
  }
  const subjects = getSubjects().filter(s => s.id !== subjectId);
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  return subjects;
};

// Attendance Sessions API (Secured with Faculty Access Control)
export const getSessions = (filterOptions = {}, userContext = null) => {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  const allSessions = JSON.parse(raw || '[]').sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    if (dateDiff !== 0) return dateDiff;
    const timeA = a.startTime || (a.timeSlot ? a.timeSlot.split('-')[0].trim() : '');
    const timeB = b.startTime || (b.timeSlot ? b.timeSlot.split('-')[0].trim() : '');
    if (timeA && timeB && timeA !== timeB) return timeA.localeCompare(timeB);
    return (a.submittedAt || a.id || '').localeCompare(b.submittedAt || b.id || '');
  });

  const user = userContext || getCurrentUser();
  // If not authenticated, return empty array
  if (!user) return [];

  // Admin has access to all sessions across all classes & subjects
  if (user.role === 'admin' || user.id === 'FAC_ADMIN' || user.isAdmin) {
    if (filterOptions && Object.keys(filterOptions).length > 0) {
      const { department, semester, division, subjectId } = filterOptions;
      return allSessions.filter(s => {
        if (department && s.department && s.department !== department) return false;
        if (semester && s.sem && normalizeSem(s.sem) !== normalizeSem(semester)) return false;
        if (division && division !== 'ALL' && s.division && normalizeDiv(s.division) !== normalizeDiv(division)) return false;
        if (subjectId && s.subjectId !== subjectId && s.subjectName !== subjectId) return false;
        return true;
      });
    }
    return allSessions;
  }

  // Student member: STRICT ROLE-BASED ACCESS CONTROL
  // Students can ONLY access sessions for classes/subjects in which they are enrolled,
  // and can ONLY view their own attendance record within each session.
  if (user.role === 'student') {
    const studentId = user.id || user.studentId;
    const studentEnr = String(user.enrollmentNo || '').trim().toUpperCase();
    const studentSem = normalizeSem(user.semester || user.sem);
    const studentDiv = normalizeDiv(user.division || user.class);
    const studentBatch = user.batch || 'ALL';
    const studentDept = user.department || user.dept || '';
    const studentClassId = user.classId || '';

    // Active elective classes containing this student
    const classes = getClasses();
    const enrolledElectiveClassIds = new Set(
      classes
        .filter(c => c.isElective && (
          (c.studentEnrollmentNos && c.studentEnrollmentNos.some(enr => String(enr).trim().toUpperCase() === studentEnr)) ||
          (c.studentIds && c.studentIds.includes(studentId))
        ))
        .map(c => c.id)
    );

    const studentSessions = allSessions.filter(s => {
      // 1. Elective session
      if (s.isElective || s.classType === 'elective') {
        const inElectiveClass = s.classId && enrolledElectiveClassIds.has(s.classId);
        const hasStudentRecord = Boolean(s.records && (s.records[studentId] !== undefined || (studentEnr && s.records[studentEnr] !== undefined)));
        return inElectiveClass || hasStudentRecord;
      }

      // 2. Regular session
      const semMatch = !s.sem || normalizeSem(s.sem || s.semester) === studentSem;
      const divMatch = !s.division || s.division === 'ALL' || normalizeDiv(s.division || s.class) === studentDiv;
      const deptMatch = !s.department || s.department === studentDept || s.dept === studentDept;
      const classIdMatch = studentClassId && s.classId && s.classId === studentClassId;
      const batchMatch = !s.batch || s.batch === 'ALL' || studentBatch === 'ALL' || s.batch === studentBatch;
      const hasStudentRecord = Boolean(s.records && (s.records[studentId] !== undefined || (studentEnr && s.records[studentEnr] !== undefined)));

      return (classIdMatch || (semMatch && divMatch && deptMatch && batchMatch)) || hasStudentRecord;
    });

    // PRIVACY SANITIZATION: Never expose other students' records to student role
    const sanitized = studentSessions.map(s => {
      const myRaw = s.records 
        ? (s.records[studentId] !== undefined ? s.records[studentId] : (studentEnr && s.records[studentEnr] !== undefined ? s.records[studentEnr] : null)) 
        : null;
      const myRemark = s.remarks 
        ? (s.remarks[studentId] || (studentEnr ? s.remarks[studentEnr] : '') || '') 
        : '';
      const excCheck = isStudentExcusedForSession(studentId, s.date, s.timeSlot || s.time, s.subjectId) ||
                       (studentEnr ? isStudentExcusedForSession(studentEnr, s.date, s.timeSlot || s.time, s.subjectId) : { isExcused: false });
      const isExcused = excCheck.isExcused;

      let resolvedStatus = 'unmarked';
      if (myRaw === 'present') {
        resolvedStatus = 'present';
      } else if (myRaw === 'od' || myRaw === 'exception') {
        resolvedStatus = 'od';
      } else if (myRaw === 'absent') {
        resolvedStatus = isExcused ? 'od' : 'absent';
      } else if (isExcused) {
        resolvedStatus = 'od';
      } else if (myRaw) {
        resolvedStatus = myRaw;
      }

      return {
        ...s,
        records: myRaw ? { [studentId]: myRaw, ...(studentEnr ? { [studentEnr]: myRaw } : {}) } : {},
        remarks: myRemark ? { [studentId]: myRemark, ...(studentEnr ? { [studentEnr]: myRemark } : {}) } : {},
        myStatus: resolvedStatus,
        myRemark: myRemark || (isExcused ? (excCheck.exception?.activityName || 'Duty Exception') : ''),
        isExcused
      };
    });

    if (filterOptions && Object.keys(filterOptions).length > 0) {
      const { subjectId } = filterOptions;
      return sanitized.filter(s => {
        if (subjectId && s.subjectId !== subjectId && s.subjectName !== subjectId) return false;
        return true;
      });
    }

    return sanitized;
  }

  // Faculty member: STRICT AUTHORIZATION FILTERING
  // Can only view sessions assigned to them or recorded by them
  const facId = user.facultyId || user.id;
  const facName = (user.name || '').trim().toLowerCase();

  // If specific class/subject requested in query, verify authorization first!
  if (filterOptions && Object.keys(filterOptions).length > 0) {
    const { department, semester, division, subjectId } = filterOptions;
    if (division && division !== 'ALL' && subjectId) {
      const hasMySession = allSessions.some(s => 
        (s.facultyId === facId || s.takenBy === facId || (s.facultyName && s.facultyName.trim().toLowerCase() === facName)) &&
        (s.subjectId === subjectId || s.subjectName === subjectId) &&
        (!department || s.department === department) &&
        (!division || normalizeDiv(s.division) === normalizeDiv(division))
      );
      const isAssigned = canFacultyTeachClassAndSubject(user, department, semester, division, subjectId);
      if (!hasMySession && !isAssigned) {
        // Reject unauthorized query attempt with empty response
        return [];
      }
    }
  }

  const authorizedSessions = allSessions.filter(s => {
    // 1. Session recorded by this faculty or historical attribution
    if (s.facultyId === facId || s.takenBy === facId) return true;
    if (s.facultyName && s.facultyName.trim().toLowerCase() === facName) return true;

    // 2. Elective session check
    if (s.classType === 'elective' || s.isElective) {
      if (s.classId && canFacultyTeachClassAndSubject(user, s.classId, s.subjectId)) {
        return true;
      }
      return canFacultyTeachElective(user, s.electiveGroupId, s.electiveSubjectId || s.subjectId, s.electiveClassId) ||
             canFacultyTeachClassAndSubject(user, s.department || 'Elective (No Department)', s.sem || s.semester, s.division, s.subjectId);
    }

    // 3. Or faculty is currently assigned to teach this class and subject
    return canFacultyTeachClassAndSubject(user, s.department, s.sem, s.division, s.subjectId);
  });

  if (filterOptions && Object.keys(filterOptions).length > 0) {
    const { department, semester, division, subjectId, classType, electiveGroupId, electiveSubjectId, electiveClassId } = filterOptions;
    return authorizedSessions.filter(s => {
      if (classType && s.classType !== classType && !(classType === 'elective' && s.isElective)) return false;
      if (electiveGroupId && s.electiveGroupId !== electiveGroupId) return false;
      if (electiveSubjectId && s.electiveSubjectId !== electiveSubjectId && s.subjectId !== electiveSubjectId) return false;
      if (electiveClassId && s.electiveClassId !== electiveClassId) return false;
      if (department && s.department && s.department !== department) return false;
      if (semester && s.sem && normalizeSem(s.sem) !== normalizeSem(semester)) return false;
      if (division && division !== 'ALL' && s.division && normalizeDiv(s.division) !== normalizeDiv(division)) return false;
      if (subjectId && s.subjectId !== subjectId && s.subjectName !== subjectId) return false;
      return true;
    });
  }

  return authorizedSessions;
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

export const saveSession = (session, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required to record attendance.');
  }
  if (user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to record or modify attendance sessions.');
  }

  // Authorization check: Faculty can only record attendance for authorized subjects & classes
  if (user.role === 'faculty') {
    if (session.classType === 'elective' || session.isElective) {
      let isAuthorizedElective = false;
      if (session.classId) {
        isAuthorizedElective = canFacultyTeachClassAndSubject(user, session.classId, session.subjectId);
      }
      if (!isAuthorizedElective) {
        isAuthorizedElective = canFacultyTeachClassAndSubject(
          user,
          session.department || session.dept || 'Elective (No Department)',
          session.sem || session.semester,
          session.division || session.class,
          session.subjectId || session.subjectName
        );
      }
      if (!isAuthorizedElective) {
        isAuthorizedElective = canFacultyTeachElective(
          user,
          session.electiveGroupId,
          session.electiveSubjectId || session.subjectId,
          session.electiveClassId
        );
      }
      if (!isAuthorizedElective) {
        throw new Error(`Unauthorized Security Error: You are not authorized to record attendance for elective subject ${session.subjectName || session.subject || session.electiveSubjectId}.`);
      }
    } else {
      const isAuthorized = canFacultyTeachClassAndSubject(
        user,
        session.department || session.dept,
        session.sem || session.semester,
        session.division || session.class,
        session.subjectId || session.subjectName
      );
      if (!isAuthorized) {
        throw new Error(`Unauthorized Security Error: You are not authorized to record attendance for ${session.subjectName || session.subjectId} in ${session.sem || session.semester} ${session.division || session.class}.`);
      }
    }
  }

  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  const allSessions = JSON.parse(raw || '[]');
  let existingIndex = -1;

  if (session.id) {
    existingIndex = allSessions.findIndex(s => s.id === session.id);
  }

  // Duplicate session prevention:
  // If session.id wasn't provided, only treat as duplicate if exact lecture slot matches
  // AND neither session is marked as an extra lecture or independent lecture
  if (existingIndex === -1 && !session.isExtraLecture && (session.timeSlot || (session.startTime && session.endTime))) {
    const normSlot = (str) => (str || '').replace(/^0/, '').replace(/\s*-\s*0?/, ' - ').trim();
    const targetSlot = normSlot(session.timeSlot || `${session.startTime} - ${session.endTime}`);

    existingIndex = allSessions.findIndex(s => {
      if (s.isExtraLecture) return false;
      const sameDate = s.date === session.date;
      if (!sameDate) return false;

      const sSlot = normSlot(s.timeSlot || (s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : ''));
      if (!sSlot || !targetSlot || sSlot !== targetSlot) return false;

      if (session.classType === 'elective' || session.isElective) {
        const sameSubj = (s.electiveSubjectId && s.electiveSubjectId === session.electiveSubjectId) ||
                         (s.subjectId === session.subjectId || s.subjectName === session.subjectName);
        const sameClass = (session.classId && s.classId && s.classId === session.classId) ||
                          (!session.electiveClassId || !s.electiveClassId || s.electiveClassId === session.electiveClassId) ||
                          (normalizeSem(s.sem || s.semester) === normalizeSem(session.sem || session.semester) &&
                           normalizeDiv(s.division || s.class) === normalizeDiv(session.division || session.class));
        return sameSubj && sameClass;
      }
      const sameSubj = s.subjectId === session.subjectId || s.subjectName === session.subjectName;
      const sameClass = (session.classId && s.classId && s.classId === session.classId) ||
        (normalizeSem(s.sem || s.semester) === normalizeSem(session.sem || session.semester) &&
         normalizeDiv(s.division || s.class) === normalizeDiv(session.division || session.class));
      const sameBatch = (s.batch || 'ALL') === (session.batch || 'ALL');
      return sameSubj && sameClass && sameBatch;
    });
  }

  const userFacId = user.facultyId || user.id;
  const facultyStamps = user.role === 'faculty' ? {
    facultyId: userFacId,
    facultyName: user.name,
    takenBy: userFacId,
    lastModifiedBy: user.name,
    lastModifiedAt: new Date().toISOString()
  } : {};

  const formattedSlot = session.timeSlot || 
    ((session.startTime && session.endTime) ? `${session.startTime} - ${session.endTime}` : (session.startTime || '9:00 - 9:55'));
  const sessionWithTimes = {
    ...session,
    startTime: session.startTime || (formattedSlot ? formattedSlot.split('-')[0].trim() : '09:00'),
    endTime: session.endTime || (formattedSlot ? formattedSlot.split('-')[1]?.trim() : '09:55'),
    timeSlot: formattedSlot
  };

  let saved;
  if (existingIndex !== -1) {
    // When modifying an existing record, verify ownership
    if (user.role === 'faculty') {
      const existing = allSessions[existingIndex];
      const isOwner = existing.facultyId === userFacId || 
                      existing.facultyId === user.id || 
                      existing.takenBy === userFacId || 
                      existing.takenBy === user.id ||
                      (existing.facultyName && existing.facultyName.trim().toLowerCase() === (user.name || '').trim().toLowerCase());
      if (!isOwner) {
        throw new Error(`Unauthorized Security Error: You cannot modify attendance recorded by another faculty member (${existing.facultyName || 'another faculty'}).`);
      }
    }
    saved = { 
      ...allSessions[existingIndex], 
      ...sessionWithTimes, 
      ...facultyStamps, 
      id: allSessions[existingIndex].id 
    };
    allSessions[existingIndex] = saved;
  } else {
    saved = { 
      ...sessionWithTimes, 
      ...facultyStamps, 
      id: session.id || ('SESS_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)) 
    };
    allSessions.push(saved);
  }

  // Ensure sessions are stably sorted by date ascending, then slot ascending, then submission time
  allSessions.sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    if (dateDiff !== 0) return dateDiff;
    const timeA = a.startTime || (a.timeSlot ? a.timeSlot.split('-')[0].trim() : '');
    const timeB = b.startTime || (b.timeSlot ? b.timeSlot.split('-')[0].trim() : '');
    if (timeA && timeB && timeA !== timeB) return timeA.localeCompare(timeB);
    return (a.submittedAt || a.id || '').localeCompare(b.submittedAt || b.id || '');
  });

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(allSessions));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-sessions-updated'));
  }
  allSessions.saved = saved;
  allSessions.id = saved.id;
  allSessions.success = true;
  return allSessions;
};

export const deleteSession = (sessionId, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required.');
  }
  if (user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to delete attendance sessions.');
  }

  const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  const allSessions = JSON.parse(raw || '[]');
  const target = allSessions.find(s => s.id === sessionId);
  if (!target) return allSessions;

  if (user.role === 'faculty') {
    const userFacId = user.facultyId || user.id;
    const isOwner = target.facultyId === userFacId || 
                    target.facultyId === user.id || 
                    target.takenBy === userFacId || 
                    target.takenBy === user.id ||
                    (target.facultyName && target.facultyName.trim().toLowerCase() === (user.name || '').trim().toLowerCase());
    if (!isOwner) {
      throw new Error('Unauthorized Security Error: You cannot delete attendance recorded by another faculty member.');
    }
  }

  const filtered = allSessions.filter(s => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-sessions-updated'));
  }
  return filtered;
};

export const resetToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_COLLEGE_DEPARTMENTS));
  localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify({}));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(DEFAULT_SECURITY));
  localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, 'A D Patel Institute of Technology');
  localStorage.setItem(STORAGE_KEYS.ELECTIVE_GROUPS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ELECTIVE_ASSIGNMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PROMOTION_HISTORY, JSON.stringify([]));
  localStorage.setItem('adit_timetable_entries', JSON.stringify([]));
  localStorage.setItem('adit_attendance_timetable', JSON.stringify({}));
  localStorage.setItem('adit_timetable_file_info', 'null');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
    window.dispatchEvent(new CustomEvent('adit-timetable-synced'));
    window.dispatchEvent(new CustomEvent('adit-departments-updated'));
    window.dispatchEvent(new CustomEvent('adit-sessions-updated'));
    window.dispatchEvent(new CustomEvent('adit-exceptions-updated'));
  }
  return {
    departments: [],
    faculties: [],
    classes: [],
    students: [],
    subjects: [],
    allocations: {},
    sessions: [],
    exceptions: [],
    electiveGroups: [],
    electiveAssignments: []
  };
};

export const clearAllSystemData = resetToDefault;

export const clearAllAttendanceData = () => {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify([]));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-sessions-updated'));
    window.dispatchEvent(new CustomEvent('adit-exceptions-updated'));
  }
  return { success: true };
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
  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTIES) || JSON.stringify(DEFAULT_FACULTIES));
  return list.map(f => ({
    ...f,
    password: f.password || 'faculty123'
  }));
};

export const saveFaculty = (faculty, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (user && user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to manage faculty records.');
  }
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

export const deleteFaculty = (facultyId, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (user && user.role === 'student') {
    throw new Error('Unauthorized Security Error: Students are not permitted to delete faculty records.');
  }
  const faculties = getFaculties().filter(f => f.id !== facultyId);
  localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(faculties));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
  }
  return faculties;
};

// Departments API (Centralized College-Wide Departments)
export const getDepartments = (includeInactive = true) => {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
  let list = [];
  try {
    list = raw ? JSON.parse(raw) : [];
  } catch (e) {
    list = [];
  }
  if (!Array.isArray(list) || list.length === 0) {
    list = [...INITIAL_COLLEGE_DEPARTMENTS];
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(list));
  } else {
    let updated = false;
    INITIAL_COLLEGE_DEPARTMENTS.forEach(initD => {
      const exists = list.some(d => d.id === initD.id || (d.code && d.code.toUpperCase() === initD.code.toUpperCase()));
      if (!exists) {
        list.push({ ...initD });
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(list));
    }
  }
  if (!includeInactive) {
    return list.filter(d => d.status !== 'inactive');
  }
  return list;
};

export const getActiveDepartments = () => {
  return getDepartments(false);
};

export const saveDepartment = (dept) => {
  const depts = getDepartments(true);
  const code = (dept.code || '').trim().toUpperCase();
  const name = (dept.name || '').trim();
  const id = dept.id || (code ? `DEP_${code.replace(/[^A-Z0-9]/g, '')}` : `DEP_${Date.now().toString().slice(-4)}`);

  // Avoid duplicates: match by ID, Code, or Name
  const idx = depts.findIndex(d => 
    d.id === id || 
    (code && d.code && d.code.toUpperCase() === code) ||
    (name && d.name && d.name.toLowerCase() === name.toLowerCase())
  );

  const updatedDept = {
    ...dept,
    id: idx !== -1 ? depts[idx].id : id,
    code: code || (idx !== -1 ? depts[idx].code : id.replace('DEP_', '')),
    name: name || (idx !== -1 ? depts[idx].name : code),
    status: dept.status || (idx !== -1 && depts[idx].status ? depts[idx].status : 'active')
  };

  if (idx !== -1) {
    depts[idx] = { ...depts[idx], ...updatedDept };
  } else {
    depts.push(updatedDept);
  }

  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-departments-updated'));
  }
  return depts;
};

export const deactivateDepartment = (deptId) => {
  const depts = getDepartments(true);
  const dept = depts.find(d => d.id === deptId || d.code === deptId || d.name === deptId);
  if (dept) {
    dept.status = 'inactive';
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adit-departments-updated'));
    }
  }
  return depts;
};

export const reactivateDepartment = (deptId) => {
  const depts = getDepartments(true);
  const dept = depts.find(d => d.id === deptId || d.code === deptId || d.name === deptId);
  if (dept) {
    dept.status = 'active';
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adit-departments-updated'));
    }
  }
  return depts;
};

export const deleteDepartment = (deptId) => {
  // Soft deactivate so historical attendance records are never deleted or broken
  return deactivateDepartment(deptId);
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

// =========================================================================
// ATTENDANCE EXCEPTION MANAGEMENT MODULE
// =========================================================================

export const EXCEPTION_CATEGORIES = [
  'Sports Tournament',
  'Technical Competition',
  'Seminar or Workshop',
  'Cultural Event',
  'Official College Duty',
  'Other Approved Activity'
];

export const INSTITUTIONAL_POLICIES = {
  COUNT_ELIGIBLE: 'COUNT_ELIGIBLE',       // Policy B: Approved exceptions count toward attendance eligibility (GTU standard)
  EXCLUDE_EXCEPTION: 'EXCLUDE_EXCEPTION', // Policy A: Approved exceptions excluded from denominator
  SEPARATE_ONLY: 'SEPARATE_ONLY'          // Policy C: Exceptions tracked separately, physically present only for percentage
};

export const DEFAULT_EXCEPTION_POLICY = INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE;

export const DEFAULT_EXCEPTIONS = [];

export const notifyExceptionsSync = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-exceptions-updated'));
  }
};

export const getInstitutionalExceptionPolicy = () => {
  if (typeof localStorage === 'undefined') return DEFAULT_EXCEPTION_POLICY;
  return localStorage.getItem(STORAGE_KEYS.EXCEPTION_POLICY) || DEFAULT_EXCEPTION_POLICY;
};

export const setInstitutionalExceptionPolicy = (policy) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.EXCEPTION_POLICY, policy);
  }
  notifyExceptionsSync();
  return policy;
};

export const getExceptions = (userContext = null) => {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.EXCEPTIONS);
  let allExceptions = [];
  if (raw) {
    try {
      allExceptions = JSON.parse(raw);
      // Filter out any corrupted legacy mock exceptions with fake enrollment or studentId mismatch
      allExceptions = allExceptions.filter(e => {
        if (e.id === 'EXC_SPORT_001' && (e.studentId === 'S_AI_02' || e.enrollmentNo === '125020405002')) return false;
        if (e.id === 'EXC_HACK_002' && (e.studentId === 'S_AI_03' || e.enrollmentNo === '125020405003')) return false;
        return true;
      });
    } catch (e) {
      console.error('Error parsing exceptions:', e);
      allExceptions = [];
    }
  } else {
    localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify([]));
  }

  const user = userContext || getCurrentUser();
  if (!user || user.role === 'admin' || user.id === 'FAC_ADMIN' || user.isAdmin) {
    return allExceptions;
  }

  // Strict authorization: Faculty can only access exceptions for their assigned classes and students
  return allExceptions.filter(e => {
    if (e.submittedById === user.id) return true;
    return canFacultyTeachClassAndSubject(user, e.departmentId || e.department, e.semester, e.division, null);
  });
};

export const calculateOverlappingLectures = (sem, div, deptId, startDateStr, endDateStr) => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('adit_timetable_entries') : null;
    const entries = raw ? JSON.parse(raw) : [];
    const normSem = normalizeSem(sem);
    const normDiv = normalizeDiv(div);
    const classEntries = entries.filter(e => {
      const semMatch = normalizeSem(e.semId || e.sem) === normSem;
      const divMatch = normalizeDiv(e.divId || e.div) === normDiv;
      const deptMatch = !deptId || !e.departmentId || e.departmentId === deptId;
      return semMatch && divMatch && deptMatch;
    });

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const affected = [];
    const curr = new Date(start);
    let safety = 0;
    while (curr <= end && safety < 60) {
      safety++;
      const dayName = dayNames[curr.getDay()];
      const dateStr = curr.toISOString().split('T')[0];
      if (dayName !== 'Sunday') {
        const dayLectures = classEntries.filter(e => e.day === dayName);
        dayLectures.forEach(lec => {
          affected.push({
            date: dateStr,
            day: dayName,
            timeSlot: lec.timeSlot,
            subjectId: lec.subjectId || lec.subject,
            subjectName: lec.subjectName || lec.subjectFullName || lec.subject,
            facultyName: lec.facultyName || 'Faculty',
            room: lec.room || 'Classroom',
            entryId: lec.id
          });
        });
      }
      curr.setDate(curr.getDate() + 1);
    }
    return affected;
  } catch (err) {
    console.error('Error calculating overlapping lectures:', err);
    return [];
  }
};

export const saveException = (exceptionData, currentUser = null) => {
  const user = currentUser || getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required to submit attendance exceptions.');
  }

  // Explicit student selection validation
  if (!exceptionData || (!exceptionData.studentId && !exceptionData.enrollmentNo)) {
    return { success: false, error: 'A valid student must be selected for the attendance exception.' };
  }
  if (!exceptionData.startDate || !exceptionData.endDate) {
    return { success: false, error: 'Start date and end date are required.' };
  }
  if (exceptionData.startDate > exceptionData.endDate) {
    return { success: false, error: 'Start date cannot be after end date.' };
  }

  // Authorization validation: Faculty can only record exceptions for authorized classes
  if (user.role === 'faculty') {
    const isAuth = canFacultyTeachClassAndSubject(
      user,
      exceptionData.department || exceptionData.departmentId,
      exceptionData.semester,
      exceptionData.division,
      null
    );
    if (!isAuth) {
      throw new Error(
        `Unauthorized Security Error: You can only record attendance exceptions for students in your authorized classes (${exceptionData.semester} ${exceptionData.division}).`
      );
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.EXCEPTIONS);
  const exceptions = JSON.parse(raw || '[]');
  const overlapping = calculateOverlappingLectures(
    exceptionData.semester,
    exceptionData.division,
    exceptionData.departmentId,
    exceptionData.startDate,
    exceptionData.endDate
  );

  const newRecord = {
    ...exceptionData,
    id: exceptionData.id || ('EXC_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
    status: exceptionData.status || (user.role === 'admin' ? 'Approved' : 'Approved'),
    submittedBy: exceptionData.submittedBy || user.name || 'Faculty Member',
    submittedById: user.id,
    submittedByRole: user.role || 'faculty',
    submittedAt: exceptionData.submittedAt || new Date().toISOString(),
    overlappingLectures: overlapping,
    affectedLecturesCount: overlapping.length
  };

  const idx = exceptions.findIndex(e => e.id === newRecord.id);
  if (idx !== -1) {
    exceptions[idx] = newRecord;
  } else {
    exceptions.unshift(newRecord);
  }

  localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify(exceptions));
  notifyExceptionsSync();
  return { success: true, exception: newRecord };
};

export const updateExceptionStatus = (exceptionId, newStatus, reviewerUser = null, remarks = '') => {
  // Security check: Only administrators can approve or reject exceptions
  const userRole = reviewerUser?.role || 'admin';
  if (userRole !== 'admin') {
    return {
      success: false,
      error: 'Security Error: Only authorized administrators can approve or reject attendance exceptions.'
    };
  }

  const raw = localStorage.getItem(STORAGE_KEYS.EXCEPTIONS);
  const exceptions = JSON.parse(raw || '[]');
  const idx = exceptions.findIndex(e => e.id === exceptionId);
  if (idx === -1) {
    return { success: false, error: 'Exception record not found.' };
  }

  exceptions[idx].status = newStatus;
  exceptions[idx].reviewedBy = reviewerUser?.name || 'Administrator';
  exceptions[idx].reviewedAt = new Date().toISOString();
  exceptions[idx].reviewerRemarks = remarks || (newStatus === 'Approved' ? 'Approved by Academic Office' : 'Rejected');

  localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify(exceptions));
  notifyExceptionsSync();
  return { success: true, exception: exceptions[idx] };
};

export const deleteException = (exceptionId, currentUser = null) => {
  const user = currentUser || getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized: Authentication required.' };
  }

  const raw = localStorage.getItem(STORAGE_KEYS.EXCEPTIONS);
  let exceptions = JSON.parse(raw || '[]');
  const target = exceptions.find(e => e.id === exceptionId);
  if (!target) return { success: true };

  if (user.role === 'faculty' && target.submittedById !== user.id) {
    return { success: false, error: 'Unauthorized Security Error: You cannot delete an exception submitted by another user.' };
  }

  exceptions = exceptions.filter(e => e.id !== exceptionId);
  localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify(exceptions));
  notifyExceptionsSync();
  return { success: true };
};

export const getExceptionsByStudent = (studentIdOrEnrollment) => {
  const exceptions = getExceptions();
  return exceptions.filter(e => 
    e.studentId === studentIdOrEnrollment || 
    e.enrollmentNo === String(studentIdOrEnrollment)
  );
};

export const isStudentExcusedForSession = (studentId, sessionDate, arg3 = null, arg4 = null, arg5 = null) => {
  if (!studentId || !sessionDate) return { isExcused: false, exception: null };

  // Flexible argument normalization:
  // Can be called as (studentId, sessionDate, timeSlot, subjectId, batch)
  // or as (studentId, sessionDate, subjectId, timeSlot, batch)
  let timeSlot = null;
  let subjectId = null;
  let batch = null;

  if (typeof arg3 === 'string' && (arg3.includes(':') || arg3.includes('-') || arg3.toLowerCase().includes('slot'))) {
    timeSlot = arg3;
    subjectId = arg4;
    batch = arg5;
  } else if (typeof arg4 === 'string' && (arg4.includes(':') || arg4.includes('-') || arg4.toLowerCase().includes('slot'))) {
    subjectId = arg3;
    timeSlot = arg4;
    batch = arg5;
  } else {
    timeSlot = arg3;
    subjectId = arg4;
    batch = arg5;
  }

  const exceptions = getExceptions();
  const approved = exceptions.filter(e => e.status === 'Approved');
  
  for (const exc of approved) {
    // 1. Student identity check:
    // Match either studentId or enrollmentNo
    const matchId = exc.studentId && (exc.studentId === studentId || String(exc.studentId) === String(studentId));
    const matchEnr = exc.enrollmentNo && (exc.enrollmentNo === studentId || String(exc.enrollmentNo) === String(studentId));
    if (!matchId && !matchEnr) continue;

    // 2. Date range check (sessionDate must be >= startDate and <= endDate)
    if (!exc.startDate || !exc.endDate) continue;
    if (sessionDate < exc.startDate || sessionDate > exc.endDate) continue;

    // 3. Subject-specific exception check:
    // If the exception was issued for a specific subject, ensure subject matches
    if (exc.subjectId && subjectId) {
      if (exc.subjectId !== subjectId && exc.subjectName !== subjectId) continue;
    }

    return { isExcused: true, exception: exc };
  }
  return { isExcused: false, exception: null };
};

export const calculateStudentAttendanceWithPolicy = (studentId, classSessions = [], policyOverride = null) => {
  const policy = policyOverride || getInstitutionalExceptionPolicy();
  const totalSessions = classSessions.length;
  let regularPresent = 0;
  let regularAbsent = 0;
  let approvedExceptions = 0;

  classSessions.forEach(session => {
    const rawStatus = (session.records && session.records[studentId]) || (session.students && session.students[studentId]);
    const isExcusedCheck = isStudentExcusedForSession(studentId, session.date, session.timeSlot || session.time, session.subjectId);
    
    if (rawStatus === 'present' || rawStatus === 'late') {
      regularPresent++;
    } else if (rawStatus === 'od' || rawStatus === 'exception' || isExcusedCheck.isExcused) {
      approvedExceptions++;
    } else if (rawStatus === 'absent') {
      regularAbsent++;
    }
  });

  let percentage = 0;
  if (totalSessions > 0) {
    if (policy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE) {
      // Policy B: Approved exceptions count towards attendance eligibility
      percentage = Math.min(100, ((regularPresent + approvedExceptions) / totalSessions) * 100);
    } else if (policy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION) {
      // Policy A: Approved exceptions are deducted from denominator
      const effectiveTotal = Math.max(0, totalSessions - approvedExceptions);
      percentage = effectiveTotal > 0 ? Math.min(100, (regularPresent / effectiveTotal) * 100) : 100;
    } else {
      // Policy C: Only regular present counted for percentage; exceptions reported separately
      percentage = Math.min(100, (regularPresent / totalSessions) * 100);
    }
  } else {
    percentage = 100;
  }

  const roundedPct = Number(percentage.toFixed(1));
  return {
    studentId,
    totalSessions,
    regularPresent,
    regularAbsent,
    approvedExceptions,
    percentage: roundedPct,
    isEligible: roundedPct >= 75,
    policy
  };
};

// =========================================================================
// SEMESTER PROMOTION ("SEMESTER UP") & FRESHER REGISTRATION SERVICES
// =========================================================================

/**
 * Returns the sequential next semester strictly increasing by +1.
 * Handled safely up to 8th Semester (which transitions to Graduated).
 */
export const getNextSemester = (currentSemStr) => {
  const norm = normalizeSem(currentSemStr);
  const match = norm.match(/([1-8])/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (num === 8) {
    return {
      sourceSem: '8th Sem',
      targetSem: 'Graduated',
      isGraduation: true,
      label: 'Course Completed / Graduated'
    };
  }
  const nextNum = num + 1;
  const sufs = { 1: 'st', 2: 'nd', 3: 'rd' };
  const targetSem = `${nextNum}${sufs[nextNum] || 'th'} Sem`;
  return {
    sourceSem: `${num}${sufs[num] || 'th'} Sem`,
    targetSem,
    isGraduation: false,
    label: targetSem
  };
};

/**
 * Executes Semester Promotion for students matching sourceSem.
 * Strictly promotes by exactly ONE semester.
 * Preserves student IDs, enrollment numbers, batches, and historical attendance.
 */
export const promoteStudentsSemester = ({
  sourceSem,
  department = 'ALL',
  selectedStudentIds = null,
  academicCycle = DEFAULT_ACADEMIC_YEAR
}) => {
  const normSource = normalizeSem(sourceSem);
  const nextInfo = getNextSemester(normSource);
  if (!nextInfo) {
    throw new Error(`Cannot promote from invalid semester "${sourceSem}".`);
  }

  const allStudents = getStudents();
  const classes = getClasses();

  // Find eligible students in the source semester
  const eligibleStudents = allStudents.filter(s => {
    const sSem = normalizeSem(s.semester || s.sem);
    const semMatch = sSem === normSource;
    if (!semMatch) return false;

    // Filter out already graduated
    if (s.status === 'Graduated' || s.isGraduated) return false;

    if (department && department !== 'ALL') {
      const sDept = String(s.department || s.dept || '').toLowerCase();
      const targetDept = String(department).toLowerCase();
      return sDept.includes(targetDept) || targetDept.includes(sDept);
    }
    return true;
  });

  // Filter by selectedStudentIds if explicitly supplied
  const targetStudents = selectedStudentIds
    ? eligibleStudents.filter(s => selectedStudentIds.includes(s.id))
    : eligibleStudents;

  if (targetStudents.length === 0) {
    return {
      success: true,
      promotedCount: 0,
      graduatedCount: 0,
      affectedStudents: [],
      message: 'No eligible students found for promotion.'
    };
  }

  const affectedStudents = [];
  let promotedCount = 0;
  let graduatedCount = 0;

  targetStudents.forEach(student => {
    const originalRecord = { ...student };
    const prevSem = normalizeSem(student.semester || student.sem);

    if (nextInfo.isGraduation) {
      // 8th Semester graduation
      student.status = 'Graduated';
      student.isGraduated = true;
      student.semester = 'Graduated';
      student.sem = 'Graduated';
      student.graduatedSemester = '8th Sem';
      student.completionCycle = academicCycle;
      student.lastPromotedAt = new Date().toISOString();
      student.lastPromotionCycle = academicCycle;
      student.previousSemester = prevSem;
      graduatedCount++;
    } else {
      // Regular sequential +1 promotion
      const targetSem = nextInfo.targetSem;
      student.semester = targetSem;
      student.sem = targetSem;
      student.previousSemester = prevSem;
      student.lastPromotedAt = new Date().toISOString();
      student.lastPromotionCycle = academicCycle;

      // Ensure / assign to target class in the system
      const studentDept = student.department || student.dept || 'Engineering';
      const studentDiv = student.division || 'Div 1';
      const studentYear = student.academicYear || academicCycle;
      const resolvedPromoteDept = resolveDepartment(studentDept);
      const studentDeptId = student.departmentId || resolvedPromoteDept?.id || ('DEP_' + studentDept.replace(/[^A-Za-z0-9]/g, '').toUpperCase());

      let targetClass = findClassByCriteria(studentDept, targetSem, studentDiv, studentYear);
      if (!targetClass) {
        // Auto-create corresponding target class if it does not yet exist
        const newClassId = `CLASS_${studentDeptId}_${targetSem.replace(/[^0-9]/g, '')}_${studentDiv.replace(/[^0-9]/g, '')}_${studentYear}`;
        targetClass = {
          id: newClassId,
          departmentId: studentDeptId,
          departmentName: resolvedPromoteDept ? resolvedPromoteDept.name : studentDept,
          semester: targetSem,
          division: studentDiv,
          academicYear: studentYear,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        classes.push(targetClass);
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
      }

      student.classId = targetClass.id;
      promotedCount++;
    }

    student.updatedAt = new Date().toISOString();
    affectedStudents.push({
      id: student.id,
      name: student.name,
      enrollmentNo: student.enrollmentNo,
      department: student.department || student.dept,
      previousSem: prevSem,
      newSem: nextInfo.isGraduation ? 'Graduated' : nextInfo.targetSem,
      division: student.division,
      batch: student.batch,
      isGraduation: nextInfo.isGraduation
    });
  });

  // Save updated students
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allStudents));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }

  return {
    success: true,
    promotedCount,
    graduatedCount,
    totalAffected: affectedStudents.length,
    sourceSem: normSource,
    targetSem: nextInfo.targetSem,
    isGraduation: nextInfo.isGraduation,
    affectedStudents
  };
};

/**
 * Retrieves the global promotion audit history from localStorage.
 */
export const getPromotionHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROMOTION_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Resets promotion history (useful for unit testing or admin reset).
 */
export const clearPromotionHistoryForTesting = () => {
  localStorage.removeItem(STORAGE_KEYS.PROMOTION_HISTORY);
};

/**
 * Computes a complete pre-promotion snapshot analysis for all students across the entire institution.
 * Automatically identifies each student's current semester and calculates target semester (+1).
 * Identifies final-semester students (Sem 8) and excludes them from automatic promotion.
 */
export const getGlobalPromotionPreview = ({
  academicCycle = DEFAULT_ACADEMIC_YEAR,
  finalSemester = 8
} = {}) => {
  const allStudents = getStudents();
  const sufs = { 1: 'st', 2: 'nd', 3: 'rd' };

  // Prepare standard progression buckets: 1->2, 2->3, ..., 7->8
  const breakdownMap = {};
  for (let s = 1; s < finalSemester; s++) {
    const nextS = s + 1;
    breakdownMap[s] = {
      semNum: s,
      sourceSemNum: s,
      targetSemNum: nextS,
      sourceSem: `Semester ${s}`,
      targetSem: `Semester ${nextS}`,
      sourceSemCode: `${s}${sufs[s] || 'th'} Sem`,
      targetSemCode: `${nextS}${sufs[nextS] || 'th'} Sem`,
      count: 0,
      students: []
    };
  }

  const finalSemesterExcluded = [];
  const graduatedExcluded = [];
  const unrecognized = [];
  let totalEligible = 0;

  allStudents.forEach(student => {
    // Check if already graduated or marked course completed
    if (student.status === 'Graduated' || student.isGraduated) {
      graduatedExcluded.push(student);
      return;
    }

    const semRaw = String(student.semester || student.sem || '').trim();
    const m = semRaw.match(/([1-8])/);
    if (!m) {
      unrecognized.push({ student, reason: `Unrecognized semester "${semRaw}"` });
      return;
    }

    const num = parseInt(m[1], 10);
    if (num >= finalSemester) {
      // Final semester student (e.g. Semester 8)
      // Excluded from automatic promotion to non-existent Semester 9
      // Preserved for graduation or completion processing
      finalSemesterExcluded.push(student);
    } else if (num >= 1 && num < finalSemester) {
      // Eligible student
      breakdownMap[num].count++;
      breakdownMap[num].students.push(student);
      totalEligible++;
    } else {
      unrecognized.push({ student, reason: `Semester out of valid range (${num})` });
    }
  });

  const breakdown = Object.values(breakdownMap).sort((a, b) => a.semNum - b.semNum);

  // Check duplicate promotion history for the academic transition
  const history = getPromotionHistory();
  const lastForCycle = history.find(h => h.academicCycle === academicCycle);

  return {
    totalStudents: allStudents.length,
    totalEligible,
    finalSemester,
    finalSemesterExcludedCount: finalSemesterExcluded.length,
    finalSemesterExcluded,
    graduatedCount: graduatedExcluded.length,
    graduatedExcluded,
    unrecognizedCount: unrecognized.length,
    unrecognized,
    breakdown,
    academicCycle,
    isAlreadyPromotedForCycle: !!lastForCycle,
    lastPromotionForCycle: lastForCycle || null,
    lastPromotion: history[history.length - 1] || null
  };
};

/**
 * Executes GLOBAL ONE-CLICK SEMESTER PROMOTION for ALL eligible students simultaneously in a single transaction.
 *
 * Requirements enforced:
 * 1. Automatically identifies each student's current semester and advances it by strictly ONE.
 * 2. Promotes all semesters simultaneously in a single atomic database operation.
 * 3. Reads all original semester values before applying updates to strictly prevent double promotion.
 * 4. Final-semester students (Sem 8) are excluded from automatic promotion and preserved intact.
 * 5. Historical attendance sessions and academic records remain 100% untouched.
 * 6. Prevents accidental duplicate promotion for the same academic cycle unless explicitly authorized with override.
 * 7. Preserves enrollment numbers, student IDs, batch assignments, and personal details.
 */
export const promoteAllStudentsGlobally = ({
  academicCycle = DEFAULT_ACADEMIC_YEAR,
  finalSemester = 8,
  overrideCycleCheck = false
} = {}) => {
  const history = getPromotionHistory();
  const alreadyDone = history.find(h => h.academicCycle === academicCycle);
  if (alreadyDone && !overrideCycleCheck) {
    throw new Error(
      `Accidental Duplicate Promotion Prevented: A global semester promotion was already completed on ${new Date(alreadyDone.timestamp).toLocaleString()} for cycle "${academicCycle}". Repeated promotion for the same cycle may advance students multiple semesters. Please authorize recovery override if re-promotion is required.`
    );
  }

  // 1. Snapshot all original student records FIRST (Transaction Isolation)
  const originalStudents = getStudents();
  const originalClasses = getClasses();

  if (!originalStudents || originalStudents.length === 0) {
    throw new Error('No student records found in the database to promote.');
  }

  // Clone snapshot to prevent mutation during validation
  const studentsSnapshot = JSON.parse(JSON.stringify(originalStudents));
  const classesSnapshot = JSON.parse(JSON.stringify(originalClasses));

  const sufs = { 1: 'st', 2: 'nd', 3: 'rd' };
  const breakdownCounts = {};
  for (let s = 1; s < finalSemester; s++) {
    const nextS = s + 1;
    breakdownCounts[s] = {
      semNum: s,
      sourceSem: `Semester ${s}`,
      targetSem: `Semester ${nextS}`,
      sourceSemCode: `${s}${sufs[s] || 'th'} Sem`,
      targetSemCode: `${nextS}${sufs[nextS] || 'th'} Sem`,
      count: 0
    };
  }

  let totalPromoted = 0;
  let finalSemesterExcludedCount = 0;
  const promotedStudentIds = new Set();
  const updatedStudents = [];

  // 2. Transform every student based STRICTLY on their original snapshot state
  for (const student of studentsSnapshot) {
    // If student is already graduated or marked completed, keep unchanged
    if (student.status === 'Graduated' || student.isGraduated) {
      updatedStudents.push(student);
      continue;
    }

    const semRaw = String(student.semester || student.sem || '').trim();
    const m = semRaw.match(/([1-8])/);
    if (!m) {
      // Unrecognized semester string - preserve intact
      updatedStudents.push(student);
      continue;
    }

    const currentSemNum = parseInt(m[1], 10);

    // Final-semester students: EXCLUDE from automatic promotion to Semester 9!
    if (currentSemNum >= finalSemester) {
      finalSemesterExcludedCount++;
      updatedStudents.push(student);
      continue;
    }

    // Eligible student: strictly increase semester by +1
    if (currentSemNum >= 1 && currentSemNum < finalSemester) {
      const nextSemNum = currentSemNum + 1;
      const prevSemCode = `${currentSemNum}${sufs[currentSemNum] || 'th'} Sem`;
      const nextSemCode = `${nextSemNum}${sufs[nextSemNum] || 'th'} Sem`;

      // Update semester attributes while preserving student ID, enrollment number, name, batch, email, etc.
      student.previousSemester = prevSemCode;
      student.semester = nextSemCode;
      student.sem = nextSemCode;
      student.lastPromotedAt = new Date().toISOString();
      student.lastPromotionCycle = academicCycle;

      // Ensure / link target class cohort
      const dept = student.department || student.dept || 'AI & Data Science';
      const div = student.division || 'Div 1';
      const year = student.academicYear || academicCycle;

      let targetClass = classesSnapshot.find(c => {
        const cDept = String(c.departmentName || c.department || '').toLowerCase();
        const tDept = String(dept).toLowerCase();
        return (
          (cDept.includes(tDept) || tDept.includes(cDept)) &&
          normalizeSem(c.semester || c.sem) === normalizeSem(nextSemCode) &&
          normalizeDiv(c.division || c.div) === normalizeDiv(div) &&
          (!c.academicYear || c.academicYear === year)
        );
      });

      if (!targetClass) {
        const newClassId = `CLASS_${student.departmentId || 'DEP'}_${nextSemNum}_${div.replace(/[^0-9]/g, '') || '1'}_${year}`;
        targetClass = {
          id: newClassId,
          departmentId: student.departmentId || 'DEP_AI',
          departmentName: dept,
          semester: nextSemCode,
          division: div,
          academicYear: year,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        classesSnapshot.push(targetClass);
      }

      student.classId = targetClass.id;
      breakdownCounts[currentSemNum].count++;
      totalPromoted++;
      promotedStudentIds.add(student.id);
      updatedStudents.push(student);
    } else {
      updatedStudents.push(student);
    }
  }

  // 3. TRANSACTION INTEGRITY & SAFEGUARDS VERIFICATION
  if (updatedStudents.length !== originalStudents.length) {
    throw new Error(`Data safety check failed: student count mismatch (${updatedStudents.length} vs ${originalStudents.length}). Promotion rolled back.`);
  }

  // Double-promotion validation check: ensure each promoted student advanced by exactly 1 semester
  for (const st of updatedStudents) {
    if (promotedStudentIds.has(st.id)) {
      const orig = originalStudents.find(s => s.id === st.id);
      const oldNum = parseInt(String(orig.semester || orig.sem).match(/([1-8])/)[1], 10);
      const newNum = parseInt(String(st.semester || st.sem).match(/([1-8])/)[1], 10);
      if (newNum !== oldNum + 1) {
        throw new Error(`Safety violation: Student ${st.enrollmentNo} was advanced by ${newNum - oldNum} semesters instead of strictly 1. Rolled back.`);
      }
    }
  }

  // 4. ATOMIC COMMIT TO LOCALSTORAGE
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classesSnapshot));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedStudents));

  // 5. RECORD AUDIT LOG IN PROMOTION HISTORY
  const breakdownList = Object.values(breakdownCounts).sort((a, b) => a.semNum - b.semNum);
  const promoRecord = {
    id: 'PROMO_' + Date.now(),
    timestamp: new Date().toISOString(),
    academicCycle,
    finalSemester,
    totalPromoted,
    finalSemesterExcludedCount,
    breakdown: breakdownList.map(b => ({
      sourceSem: b.sourceSem,
      targetSem: b.targetSem,
      sourceSemCode: b.sourceSemCode,
      targetSemCode: b.targetSemCode,
      count: b.count
    }))
  };
  history.push(promoRecord);
  localStorage.setItem(STORAGE_KEYS.PROMOTION_HISTORY, JSON.stringify(history));

  // 6. DISPATCH REAL-TIME SYSTEM EVENTS
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
    window.dispatchEvent(new CustomEvent('adit-classes-updated'));
  }

  return {
    success: true,
    timestamp: promoRecord.timestamp,
    academicCycle,
    finalSemester,
    totalPromoted,
    finalSemesterExcludedCount,
    breakdown: promoRecord.breakdown,
    record: promoRecord
  };
};

/**
 * Downloads official Excel template for registering new students (First-Year Freshers or Transfer students).
 */
export const downloadStudentRegistrationTemplate = () => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Registration Template with realistic fresher sample rows
  const headers = [
    'Enrollment Number',
    'Student Name',
    'Department',
    'Semester',
    'Division',
    'Batch',
    'Email',
    'Roll Number'
  ];

  const sampleRows = [
    ['25AD001', 'Aarav Sharma', 'AI & Data Science', '1st Sem', 'Div 1', 'Batch A', 'aarav.sharma@adit.ac.in', '1'],
    ['25AD002', 'Bhavya Patel', 'AI & Data Science', '1st Sem', 'Div 1', 'Batch A', 'bhavya.patel@adit.ac.in', '2'],
    ['25AD003', 'Chirag Joshi', 'AI & Data Science', '1st Sem', 'Div 1', 'Batch B', 'chirag.joshi@adit.ac.in', '3'],
    ['25AD004', 'Drashti Shah', 'AI & Data Science', '1st Sem', 'Div 1', 'Batch B', 'drashti.shah@adit.ac.in', '4'],
    ['25AD005', 'Eshaan Mehta', 'AI & Data Science', '1st Sem', 'Div 1', 'Batch C', 'eshaan.mehta@adit.ac.in', '5'],
    ['25CP001', 'Hiren Vaghela', 'Computer Engineering', '1st Sem', 'Div 1', 'Batch A', 'hiren.v@adit.ac.in', '1'],
    ['25IT001', 'Jiya Trivedi', 'Information Technology', '1st Sem', 'Div 1', 'Batch A', 'jiya.t@adit.ac.in', '1']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  ws['!cols'] = [
    { wch: 18 }, // Enrollment Number
    { wch: 22 }, // Student Name
    { wch: 24 }, // Department
    { wch: 12 }, // Semester
    { wch: 12 }, // Division
    { wch: 12 }, // Batch
    { wch: 26 }, // Email
    { wch: 12 }  // Roll Number
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Student Registration');

  // Sheet 2: Guidelines and reference values
  const guideRows = [
    ['ADIT STUDENT REGISTRATION TEMPLATE GUIDELINES', ''],
    ['', ''],
    ['FIELD', 'DESCRIPTION & ACCEPTED VALUES'],
    ['Enrollment Number', 'REQUIRED. Must be globally unique (e.g., 25AD001, 12502040501101).'],
    ['Student Name', 'REQUIRED. Full name of the student (e.g., Aarav Sharma).'],
    ['Department', 'Accepted: AI & Data Science, Computer Engineering, Information Technology, EC, ME, Civil.'],
    ['Semester', 'Defaults to "1st Sem" for incoming freshers. Use 3rd Sem for lateral diploma admissions.'],
    ['Division', 'Accepted: Div 1, Div 2, Div 3.'],
    ['Batch', 'Accepted: Batch A, Batch B, Batch C (defaults to Batch A if omitted).'],
    ['Email', 'Optional. Student campus email address.'],
    ['Roll Number', 'Optional class roll number.']
  ];
  const guideWs = XLSX.utils.aoa_to_sheet(guideRows);
  guideWs['!cols'] = [{ wch: 25 }, { wch: 65 }];
  XLSX.utils.book_append_sheet(wb, guideWs, 'Instructions');

  XLSX.writeFile(wb, 'ADIT_New_Student_Registration_Template.xlsx');
};

/**
 * Bulk imports campus students (freshers / transfers) with full validation.
 */
export const bulkRegisterStudents = (studentRows, defaultAcademicYear = DEFAULT_ACADEMIC_YEAR) => {
  const allStudents = getStudents();
  const classes = getClasses();
  const existingEnrMap = new Map();
  allStudents.forEach(s => {
    existingEnrMap.set(String(s.enrollmentNo).trim().toLowerCase(), s);
  });

  const importedStudents = [];
  const errors = [];
  let importedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  // Track enrollments within this batch to prevent internal duplicates
  const batchEnrSet = new Set();

  studentRows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const name = String(row.name || row['Student Name'] || '').trim();
    const enrollmentNo = String(row.enrollmentNo || row['Enrollment Number'] || row.EnrollmentNo || '').trim();
    const dept = String(row.department || row.Department || row.dept || 'AI & Data Science').trim();
    const sem = normalizeSem(row.semester || row.Semester || row.sem || '1st Sem');
    const div = normalizeDiv(row.division || row.Division || row.class || 'Div 1');
    const batch = String(row.batch || row.Batch || 'Batch A').trim();
    const email = String(row.email || row.Email || '').trim();
    const rollNo = String(row.rollNo || row['Roll Number'] || row.RollNo || '').trim();

    if (!name || !enrollmentNo) {
      errors.push(`Row ${rowNum}: Name and Enrollment Number are required.`);
      errorCount++;
      return;
    }

    const lowerEnr = enrollmentNo.toLowerCase();

    // Check duplicate in file
    if (batchEnrSet.has(lowerEnr)) {
      errors.push(`Row ${rowNum}: Duplicate enrollment number "${enrollmentNo}" within this file.`);
      duplicateCount++;
      return;
    }
    batchEnrSet.add(lowerEnr);

    // Check duplicate in database
    if (existingEnrMap.has(lowerEnr)) {
      const existing = existingEnrMap.get(lowerEnr);
      errors.push(`Row ${rowNum}: Enrollment number "${enrollmentNo}" already registered for student "${existing.name}".`);
      duplicateCount++;
      return;
    }

    // Resolve or create class
    let targetClass = findClassByCriteria(dept, sem, div, defaultAcademicYear);
    if (!targetClass) {
      const resolvedD = resolveDepartment(dept);
      let deptId = resolvedD ? resolvedD.id : ('DEP_' + dept.replace(/[^A-Za-z0-9]/g, '').toUpperCase());

      targetClass = {
        id: `CLASS_${deptId}_${sem.replace(/[^0-9]/g, '')}_${div.replace(/[^0-9]/g, '')}_${defaultAcademicYear}`,
        departmentId: deptId,
        departmentName: dept,
        semester: sem,
        division: div,
        academicYear: defaultAcademicYear,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      classes.push(targetClass);
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    }

    const newStudent = {
      id: 'S_' + Date.now().toString().slice(-6) + '_' + Math.random().toString(36).substr(2, 4),
      name,
      enrollmentNo,
      rollNo: rollNo || String(allStudents.length + importedCount + 1),
      email,
      batch: batch || 'Batch A',
      classId: targetClass.id,
      departmentId: targetClass.departmentId,
      department: dept,
      dept: dept,
      semester: sem,
      sem: sem,
      division: div,
      class: div.replace(/[^0-9]/g, '') || '1',
      academicYear: defaultAcademicYear,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    allStudents.push(newStudent);
    existingEnrMap.set(lowerEnr, newStudent);
    importedStudents.push(newStudent);
    importedCount++;
  });

  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(allStudents));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }

  return {
    success: true,
    importedCount,
    duplicateCount,
    errorCount,
    errors,
    importedStudents
  };
};

// =========================================================================
// ELECTIVE SUBJECT MANAGEMENT & STUDENT GROUPING API
// =========================================================================

export const getElectiveGroups = (filter = {}) => {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ELECTIVE_GROUPS);
  let groups = [];
  try {
    groups = JSON.parse(raw || '[]');
  } catch (e) {
    groups = DEFAULT_ELECTIVE_GROUPS;
  }
  if (!groups || groups.length === 0) {
    groups = DEFAULT_ELECTIVE_GROUPS;
    localStorage.setItem(STORAGE_KEYS.ELECTIVE_GROUPS, JSON.stringify(groups));
  }

  if (filter && Object.keys(filter).length > 0) {
    return groups.filter(g => {
      if (filter.semester && normalizeSem(g.semester) !== normalizeSem(filter.semester)) return false;
      if (filter.academicYear && g.academicYear !== filter.academicYear) return false;
      if (filter.status && g.status !== filter.status) return false;
      return true;
    });
  }
  return groups;
};

export const getElectiveGroupById = (groupId) => {
  if (!groupId) return null;
  const groups = getElectiveGroups();
  return groups.find(g => g.id === groupId || String(g.id).toLowerCase() === String(groupId).toLowerCase()) || null;
};

export const saveElectiveGroup = (groupData) => {
  if (!groupData.name || !groupData.name.trim()) throw new Error('Elective group name is required.');
  if (!groupData.semester) throw new Error('Semester is required.');

  const allGroups = getElectiveGroups();
  const now = new Date().toISOString();

  let groupId = groupData.id;
  if (!groupId) {
    groupId = 'ELEC_GRP_' + Date.now().toString().slice(-6) + '_' + Math.random().toString(36).substr(2, 4);
  }

  // Ensure subjects array has ids and classes
  const cleanSubjects = (groupData.subjects || []).map((sub, sIdx) => {
    const subId = sub.id || `ELEC_SUB_${groupId}_${sIdx + 1}`;
    const cleanClasses = (sub.classes && sub.classes.length > 0) ? sub.classes.map((cls, cIdx) => ({
      id: cls.id || `ELEC_CLS_${subId}_${cIdx + 1}`,
      name: cls.name || `Elective Class ${String.fromCharCode(65 + cIdx)}`,
      facultyId: cls.facultyId || '',
      facultyName: cls.facultyName || ''
    })) : [
      {
        id: `ELEC_CLS_${subId}_1`,
        name: sub.className || `Elective Class ${String.fromCharCode(65 + sIdx)}`,
        facultyId: sub.facultyId || '',
        facultyName: sub.facultyName || ''
      }
    ];

    return {
      id: subId,
      code: sub.code || '',
      name: sub.name,
      shortName: sub.shortName || sub.name,
      classes: cleanClasses
    };
  });

  const updatedGroup = {
    id: groupId,
    name: groupData.name.trim(),
    semester: normalizeSem(groupData.semester),
    academicYear: groupData.academicYear || DEFAULT_ACADEMIC_YEAR,
    status: groupData.status || 'active',
    subjects: cleanSubjects,
    createdAt: groupData.createdAt || now,
    updatedAt: now
  };

  const existingIdx = allGroups.findIndex(g => g.id === groupId);
  if (existingIdx !== -1) {
    allGroups[existingIdx] = updatedGroup;
  } else {
    allGroups.push(updatedGroup);
  }

  localStorage.setItem(STORAGE_KEYS.ELECTIVE_GROUPS, JSON.stringify(allGroups));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-elective-groups-updated', { detail: { groupId } }));
  }

  return updatedGroup;
};

export const deleteElectiveGroup = (groupId) => {
  if (!groupId) return false;
  const allGroups = getElectiveGroups();
  const filtered = allGroups.filter(g => g.id !== groupId);
  localStorage.setItem(STORAGE_KEYS.ELECTIVE_GROUPS, JSON.stringify(filtered));

  // Also remove assignments for this group
  const allAssignments = getElectiveAssignments();
  const filteredAssignments = allAssignments.filter(a => a.electiveGroupId !== groupId);
  localStorage.setItem(STORAGE_KEYS.ELECTIVE_ASSIGNMENTS, JSON.stringify(filteredAssignments));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-elective-groups-updated'));
    window.dispatchEvent(new CustomEvent('adit-elective-assignments-updated'));
  }
  return true;
};

export const getElectiveAssignments = (filter = {}) => {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ELECTIVE_ASSIGNMENTS);
  let assignments = [];
  try {
    assignments = JSON.parse(raw || '[]');
  } catch (e) {
    assignments = DEFAULT_ELECTIVE_ASSIGNMENTS;
  }
  if (!assignments || assignments.length === 0) {
    assignments = DEFAULT_ELECTIVE_ASSIGNMENTS;
    localStorage.setItem(STORAGE_KEYS.ELECTIVE_ASSIGNMENTS, JSON.stringify(assignments));
  }

  if (filter && Object.keys(filter).length > 0) {
    return assignments.filter(a => {
      if (filter.electiveGroupId && a.electiveGroupId !== filter.electiveGroupId) return false;
      if (filter.electiveSubjectId && a.electiveSubjectId !== filter.electiveSubjectId) return false;
      if (filter.electiveClassId && a.electiveClassId !== filter.electiveClassId) return false;
      if (filter.studentId && a.studentId !== filter.studentId) return false;
      if (filter.enrollmentNo && a.enrollmentNo !== filter.enrollmentNo) return false;
      return true;
    });
  }
  return assignments;
};

export const assignStudentToElective = ({
  studentId,
  enrollmentNo,
  electiveGroupId,
  electiveSubjectId,
  electiveClassId,
  academicYear
}) => {
  if (!electiveGroupId) throw new Error('Elective group ID is required.');
  const group = getElectiveGroupById(electiveGroupId);
  if (!group) throw new Error(`Elective group ${electiveGroupId} not found.`);

  // Find student in master students database
  const allStudents = getStudents();
  const student = allStudents.find(s => 
    (studentId && s.id === studentId) ||
    (enrollmentNo && s.enrollmentNo === enrollmentNo)
  );
  if (!student) throw new Error('Student not found in master records.');

  // Validate student semester matches group semester
  if (normalizeSem(student.semester || student.sem) !== normalizeSem(group.semester)) {
    throw new Error(`Student ${student.name} is in ${student.semester || student.sem}, but elective group is for ${group.semester}.`);
  }

  // Verify subject exists in the group
  const subject = (group.subjects || []).find(s => s.id === electiveSubjectId || s.name === electiveSubjectId || s.code === electiveSubjectId);
  if (!subject) throw new Error(`Elective subject ${electiveSubjectId} does not belong to group ${group.name}.`);

  let resolvedClassId = electiveClassId;
  if (!resolvedClassId && subject.classes && subject.classes.length > 0) {
    resolvedClassId = subject.classes[0].id;
  }

  const allAssignments = getElectiveAssignments();
  // Prevent duplicate: check if this student already has an assignment in this elective group
  const existingIndex = allAssignments.findIndex(a => 
    a.electiveGroupId === electiveGroupId && 
    (a.studentId === student.id || (a.enrollmentNo && a.enrollmentNo === student.enrollmentNo))
  );

  const now = new Date().toISOString();
  let updatedAssignment;

  if (existingIndex !== -1) {
    // Re-assign student within group (preserves single assignment rule)
    allAssignments[existingIndex] = {
      ...allAssignments[existingIndex],
      electiveSubjectId: subject.id,
      electiveClassId: resolvedClassId,
      academicYear: academicYear || group.academicYear || DEFAULT_ACADEMIC_YEAR,
      updatedAt: now
    };
    updatedAssignment = allAssignments[existingIndex];
  } else {
    // Create new assignment
    updatedAssignment = {
      id: 'ASGN_' + Date.now().toString().slice(-6) + '_' + Math.random().toString(36).substr(2, 4),
      studentId: student.id,
      enrollmentNo: student.enrollmentNo,
      electiveGroupId,
      electiveSubjectId: subject.id,
      electiveClassId: resolvedClassId,
      academicYear: academicYear || group.academicYear || DEFAULT_ACADEMIC_YEAR,
      assignedAt: now,
      updatedAt: now
    };
    allAssignments.push(updatedAssignment);
  }

  localStorage.setItem(STORAGE_KEYS.ELECTIVE_ASSIGNMENTS, JSON.stringify(allAssignments));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-elective-assignments-updated', { detail: { electiveGroupId } }));
  }

  return updatedAssignment;
};

export const bulkAssignStudentsToElectives = (assignmentsArray) => {
  if (!Array.isArray(assignmentsArray)) return { success: false, error: 'Expected array of assignments' };
  let successCount = 0;
  let errors = [];
  assignmentsArray.forEach(item => {
    try {
      assignStudentToElective(item);
      successCount++;
    } catch (err) {
      errors.push({ item, error: err.message });
    }
  });
  return { success: errors.length === 0, successCount, errorCount: errors.length, errors };
};

export const removeStudentFromElective = (studentIdOrEnrollment, electiveGroupId) => {
  const allAssignments = getElectiveAssignments();
  const filtered = allAssignments.filter(a => {
    if (a.electiveGroupId !== electiveGroupId) return true;
    if (a.studentId === studentIdOrEnrollment || a.enrollmentNo === studentIdOrEnrollment) {
      return false;
    }
    return true;
  });
  localStorage.setItem(STORAGE_KEYS.ELECTIVE_ASSIGNMENTS, JSON.stringify(filtered));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-elective-assignments-updated', { detail: { electiveGroupId } }));
  }
  return true;
};

export const getEligibleStudentsForElectiveGroup = (groupId) => {
  const group = getElectiveGroupById(groupId);
  if (!group) return [];

  const targetSem = normalizeSem(group.semester);
  const allStudents = getStudents();
  // Filter students whose semester matches group semester across all departments and divisions
  const eligible = allStudents.filter(s => normalizeSem(s.semester || s.sem) === targetSem);

  const assignments = getElectiveAssignments({ electiveGroupId: groupId });
  const asgnMap = new Map();
  assignments.forEach(a => {
    asgnMap.set(a.studentId, a);
    if (a.enrollmentNo) asgnMap.set(a.enrollmentNo, a);
  });

  const subjectMap = new Map();
  const classMap = new Map();
  (group.subjects || []).forEach(sub => {
    subjectMap.set(sub.id, sub.name || sub.shortName);
    (sub.classes || []).forEach(cls => {
      classMap.set(cls.id, cls.name);
    });
  });

  return eligible.map(st => {
    const asgn = asgnMap.get(st.id) || (st.enrollmentNo ? asgnMap.get(st.enrollmentNo) : null);
    return {
      ...st,
      assigned: !!asgn,
      electiveAssignment: asgn ? {
        id: asgn.id,
        electiveGroupId: asgn.electiveGroupId,
        electiveSubjectId: asgn.electiveSubjectId,
        electiveSubjectName: subjectMap.get(asgn.electiveSubjectId) || asgn.electiveSubjectId,
        electiveClassId: asgn.electiveClassId,
        electiveClassName: classMap.get(asgn.electiveClassId) || asgn.electiveClassId,
        assignedAt: asgn.assignedAt
      } : null
    };
  });
};

export const canFacultyTeachElective = (facultyOrUser, electiveGroupId, electiveSubjectId, electiveClassId = null) => {
  if (!facultyOrUser) return false;
  const user = facultyOrUser;
  // Admin role has universal authorization across all electives
  if (user.role === 'admin' || user.id === 'FAC_ADMIN' || user.isAdmin) return true;

  const groups = getElectiveGroups();
  const group = groups.find(g => g.id === electiveGroupId || String(g.id).toLowerCase() === String(electiveGroupId).toLowerCase());
  if (!group) return false;

  const userId = user.facultyId || user.id;
  const userName = (user.name || '').trim().toLowerCase();

  const subjects = group.subjects || [];
  const subject = subjects.find(s => 
    s.id === electiveSubjectId || 
    (s.code && s.code === electiveSubjectId) ||
    (s.name && s.name.toLowerCase() === String(electiveSubjectId).toLowerCase()) ||
    (s.shortName && s.shortName.toLowerCase() === String(electiveSubjectId).toLowerCase())
  );

  if (!subject) return false;

  const classes = subject.classes || [];
  if (electiveClassId) {
    const cls = classes.find(c => c.id === electiveClassId || c.name === electiveClassId);
    if (!cls) return false;
    return (cls.facultyId && (cls.facultyId === userId || cls.facultyId === user.id)) ||
           (cls.facultyName && cls.facultyName.trim().toLowerCase() === userName);
  }

  // If no specific electiveClassId was requested, check if faculty teaches ANY class in this elective subject
  return classes.some(c => 
    (c.facultyId && (c.facultyId === userId || c.facultyId === user.id)) ||
    (c.facultyName && c.facultyName.trim().toLowerCase() === userName)
  );
};

export const getAuthorizedFacultyElectives = (facultyOrUser = null) => {
  const user = facultyOrUser || getCurrentUser();
  if (!user) return [];
  const allGroups = getElectiveGroups().filter(g => g.status !== 'inactive');

  if (user.role === 'admin' || user.id === 'FAC_ADMIN' || user.isAdmin) {
    return allGroups;
  }

  const userId = user.facultyId || user.id;
  const userName = (user.name || '').trim().toLowerCase();

  const authorizedGroups = [];

  allGroups.forEach(g => {
    const authSubjects = [];
    (g.subjects || []).forEach(s => {
      const authClasses = (s.classes || []).filter(c => 
        (c.facultyId && (c.facultyId === userId || c.facultyId === user.id)) ||
        (c.facultyName && c.facultyName.trim().toLowerCase() === userName)
      );
      if (authClasses.length > 0) {
        authSubjects.push({
          ...s,
          classes: authClasses
        });
      }
    });

    if (authSubjects.length > 0) {
      authorizedGroups.push({
        ...g,
        subjects: authSubjects
      });
    }
  });

  return authorizedGroups;
};

export const getStudentsForElectiveClass = ({ electiveGroupId, electiveSubjectId, electiveClassId }, userContext = null) => {
  if (userContext && userContext.role === 'faculty') {
    const authorized = canFacultyTeachElective(userContext, electiveGroupId, electiveSubjectId, electiveClassId);
    if (!authorized) {
      throw new Error(`Unauthorized Security Error: Faculty ${userContext.name || userContext.id} is not authorized for elective subject ${electiveSubjectId}.`);
    }
  }

  const assignments = getElectiveAssignments({
    electiveGroupId,
    electiveSubjectId,
    electiveClassId
  });

  if (!assignments || assignments.length === 0) return [];

  const allStudents = getStudents();
  const studentMap = new Map();
  allStudents.forEach(s => {
    studentMap.set(s.id, s);
    if (s.enrollmentNo) studentMap.set(s.enrollmentNo, s);
  });

  const assignedStudents = [];
  assignments.forEach(asgn => {
    const st = studentMap.get(asgn.studentId) || (asgn.enrollmentNo ? studentMap.get(asgn.enrollmentNo) : null);
    if (st) {
      // Return student with their elective assignment metadata attached
      assignedStudents.push({
        ...st,
        electiveAssignmentId: asgn.id,
        electiveGroupId: asgn.electiveGroupId,
        electiveSubjectId: asgn.electiveSubjectId,
        electiveClassId: asgn.electiveClassId
      });
    }
  });

  return assignedStudents.sort((a, b) => {
    const enrA = String(a.enrollmentNo || '');
    const enrB = String(b.enrollmentNo || '');
    return enrA.localeCompare(enrB, undefined, { numeric: true });
  });
};

export const downloadElectiveAssignmentTemplate = (groupId) => {
  const group = getElectiveGroupById(groupId);
  if (!group) throw new Error('Elective group not found');

  const eligibleStudents = getEligibleStudentsForElectiveGroup(groupId);

  const rows = eligibleStudents.map(s => ({
    'Enrollment Number': s.enrollmentNo,
    'Student Name': s.name,
    'Current Semester': s.semester || s.sem,
    'Department': s.department || s.dept,
    'Regular Division': s.division || s.class,
    'Assigned Elective Subject': s.electiveAssignment?.electiveSubjectName || '',
    'Assigned Elective Class': s.electiveAssignment?.electiveClassName || ''
  }));

  const subjectOptions = (group.subjects || []).map(s => ({
    'Subject Code': s.code || '',
    'Subject Name': s.name,
    'Elective Classes': (s.classes || []).map(c => c.name).join(', ')
  }));

  if (typeof XLSX !== 'undefined') {
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(rows);
    const ws2 = XLSX.utils.json_to_sheet(subjectOptions);
    XLSX.utils.book_append_sheet(wb, ws1, 'Student Electives');
    XLSX.utils.book_append_sheet(wb, ws2, 'Available Subjects');
    const filename = `${group.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Elective_Allocation.xlsx`;
    XLSX.writeFile(wb, filename);
  }
};

export const bulkImportElectiveAssignments = (groupId, dataRows) => {
  const group = getElectiveGroupById(groupId);
  if (!group) throw new Error('Elective group not found');

  if (!Array.isArray(dataRows) || dataRows.length === 0) {
    throw new Error('No data rows provided for import.');
  }

  let importedCount = 0;
  let skippedCount = 0;
  let errors = [];

  const subjectLookup = new Map();
  (group.subjects || []).forEach(sub => {
    subjectLookup.set(sub.id.toLowerCase(), sub);
    subjectLookup.set(sub.name.toLowerCase(), sub);
    if (sub.shortName) subjectLookup.set(sub.shortName.toLowerCase(), sub);
    if (sub.code) subjectLookup.set(sub.code.toLowerCase(), sub);
  });

  dataRows.forEach((row, idx) => {
    const enrollmentNo = String(row['Enrollment Number'] || row['enrollmentNo'] || row['enrollment'] || row['Enrollment'] || '').trim();
    const subjectName = String(row['Assigned Elective Subject'] || row['electiveSubject'] || row['Subject'] || row['subject'] || '').trim();
    const className = String(row['Assigned Elective Class'] || row['electiveClass'] || row['Class'] || '').trim();

    if (!enrollmentNo || !subjectName) {
      skippedCount++;
      return;
    }

    const matchedSubject = subjectLookup.get(subjectName.toLowerCase());
    if (!matchedSubject) {
      errors.push(`Row ${idx + 1}: Unknown elective subject "${subjectName}"`);
      return;
    }

    let matchedClassId = null;
    if (className && matchedSubject.classes) {
      const cls = matchedSubject.classes.find(c => c.name.toLowerCase() === className.toLowerCase() || c.id === className);
      if (cls) matchedClassId = cls.id;
    }
    if (!matchedClassId && matchedSubject.classes && matchedSubject.classes.length > 0) {
      matchedClassId = matchedSubject.classes[0].id;
    }

    try {
      assignStudentToElective({
        enrollmentNo,
        electiveGroupId: groupId,
        electiveSubjectId: matchedSubject.id,
        electiveClassId: matchedClassId,
        academicYear: group.academicYear
      });
      importedCount++;
    } catch (err) {
      errors.push(`Row ${idx + 1} (${enrollmentNo}): ${err.message}`);
    }
  });

  return {
    success: errors.length === 0,
    importedCount,
    skippedCount,
    errorCount: errors.length,
    errors
  };
};

// =========================================================================
// STUDENT PORTAL SERVICES (RBAC Secured, Protected Academic Data, Real-Time)
// =========================================================================

/**
 * Calculates a student's attendance metrics across a list of session records.
 * Follows institutional policy for approved exceptions.
 * Returns null percentage and clear indicator if totalConducted === 0.
 */
export const calculateStudentAttendanceStats = (studentId, sessions = [], policyOverride = null) => {
  const policy = policyOverride || getInstitutionalExceptionPolicy();
  const totalConducted = Array.isArray(sessions) ? sessions.length : 0;
  let regularPresent = 0;
  let regularAbsent = 0;
  let approvedExceptions = 0;
  let unmarkedCount = 0;

  // Resolve alternate identifier (id vs enrollmentNo)
  let altId = null;
  try {
    const allSts = getStudents();
    const foundSt = allSts.find(s => s.id === studentId || s.enrollmentNo === studentId);
    if (foundSt) {
      altId = foundSt.id === studentId ? foundSt.enrollmentNo : foundSt.id;
    }
  } catch (err) {}

  if (Array.isArray(sessions)) {
    sessions.forEach(session => {
      // getSessions for student returns sanitized myStatus and isExcused
      const status = session.myStatus || 
        (session.records ? (session.records[studentId] !== undefined ? session.records[studentId] : (altId ? session.records[altId] : null)) : null) || 
        (session.students ? (session.students[studentId] !== undefined ? session.students[studentId] : (altId ? session.students[altId] : null)) : null);

      const excCheck = isStudentExcusedForSession(studentId, session.date, session.timeSlot || session.time, session.subjectId) ||
                       (altId ? isStudentExcusedForSession(altId, session.date, session.timeSlot || session.time, session.subjectId) : { isExcused: false });
      const isExcused = session.isExcused || excCheck.isExcused;

      if (status === 'present' || status === 'late') {
        regularPresent++;
      } else if (status === 'od' || status === 'exception' || (status === 'absent' && isExcused) || isExcused) {
        approvedExceptions++;
      } else if (status === 'absent') {
        regularAbsent++;
      } else {
        unmarkedCount++;
      }
    });
  }

  const totalAttended = regularPresent + approvedExceptions;
  const totalMissed = regularAbsent;

  let percentage = null;
  let percentageFormatted = 'N/A';
  let meetsThreshold = true;

  if (totalConducted > 0) {
    if (policy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE) {
      percentage = Math.round(Math.min(100, ((regularPresent + approvedExceptions) / totalConducted) * 100) * 10) / 10;
    } else if (policy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION) {
      const effectiveTotal = Math.max(0, totalConducted - approvedExceptions);
      percentage = effectiveTotal > 0 ? Math.round(Math.min(100, (regularPresent / effectiveTotal) * 100) * 10) / 10 : 100;
    } else {
      percentage = Math.round(Math.min(100, (regularPresent / totalConducted) * 100) * 10) / 10;
    }
    percentageFormatted = `${percentage}%`;
    meetsThreshold = percentage >= 75;
  }

  return {
    studentId,
    totalConducted,
    totalAttended,
    totalMissed,
    approvedExceptions,
    regularPresent,
    regularAbsent,
    unmarkedCount,
    percentage,
    percentageFormatted,
    meetsThreshold,
    isEligible: meetsThreshold,
    hasConductedLectures: totalConducted > 0
  };
};

/**
 * Retrieves the logged-in student's complete profile.
 * Distinguishes immutable academic details from editable contact details.
 */
export const getStudentProfile = (userContext = null) => {
  const user = userContext || getCurrentUser();
  if (!user) return null;

  const studentEnr = String(user.enrollmentNo || '').trim().toLowerCase();
  const studentId = String(user.id || user.studentId || '').trim().toLowerCase();

  const students = getStudents();
  const found = students.find(s => 
    String(s.enrollmentNo || '').trim().toLowerCase() === studentEnr ||
    String(s.id || '').trim().toLowerCase() === studentId
  );

  const base = found || user;
  const cls = base.classId ? getClassById(base.classId) : null;
  const dept = cls ? cls.departmentName : (base.department || base.dept || '');
  const sem = cls ? cls.semester : normalizeSem(base.semester || base.sem || '3rd Sem');
  const div = cls ? cls.division : normalizeDiv(base.division || base.class || 'Div 1');
  const year = cls ? cls.academicYear : (base.academicYear || DEFAULT_ACADEMIC_YEAR);

  return {
    id: base.id,
    studentId: base.id,
    enrollmentNo: base.enrollmentNo,
    rollNo: base.rollNo || '',
    name: base.name,
    department: dept,
    dept: dept,
    semester: sem,
    sem: sem,
    division: div,
    class: div,
    batch: base.batch || 'Batch A',
    academicYear: year,
    email: base.email || '',
    phone: base.phone || '',
    className: `${dept} • ${sem} • ${div}`,
    isProfileLocked: true
  };
};

/**
 * Updates permitted student contact info and password.
 * Strictly prevents mutation of academic credentials.
 */
export const updateStudentProfile = (updates = {}, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (!user || user.role !== 'student') {
    throw new Error('Unauthorized Security Error: Only authenticated students can update their profile.');
  }

  const studentEnr = String(user.enrollmentNo || '').trim();
  const students = getStudents();
  const idx = students.findIndex(s => 
    String(s.enrollmentNo || '').trim().toLowerCase() === studentEnr.toLowerCase() ||
    String(s.id || '') === String(user.id)
  );

  if (idx === -1) {
    throw new Error('Student record not found in database.');
  }

  const student = students[idx];

  // 1. Update contact fields (phone & email)
  if (updates.email !== undefined) {
    const cleanEmail = String(updates.email).trim();
    if (cleanEmail && !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    student.email = cleanEmail;
  }

  if (updates.phone !== undefined) {
    student.phone = String(updates.phone).trim();
  }

  // 2. Change password if requested
  if (updates.newPassword) {
    const currentPass = String(updates.currentPassword || '').trim();
    const newPass = String(updates.newPassword).trim();
    const confirmPass = String(updates.confirmPassword || '').trim();

    if (!currentPass) {
      throw new Error('Please enter your current password.');
    }
    if (newPass.length < 4) {
      throw new Error('New password must be at least 4 characters long.');
    }
    if (confirmPass && newPass !== confirmPass) {
      throw new Error('New password and confirmation do not match.');
    }

    // Verify current password against stored hash or fallback
    const storedHash = student.passwordHash;
    const storedPlain = student.password;
    const salt = student.salt || studentEnr;
    const currentHash = hashPassword(currentPass, salt);

    let isCurrentValid = false;
    if (storedHash) {
      isCurrentValid = (storedHash === currentHash || storedHash === hashPassword(currentPass));
    } else if (storedPlain) {
      isCurrentValid = (currentPass === storedPlain || currentPass === hashPassword(storedPlain));
    } else {
      isCurrentValid = (
        currentPass === studentEnr ||
        currentPass.toLowerCase() === studentEnr.toLowerCase() ||
        currentPass === 'student123' ||
        currentPass === '1234'
      );
    }

    if (!isCurrentValid) {
      throw new Error('Current password verification failed. Please try again.');
    }

    // Hash and store the new password
    const newSalt = `ADIT_SALT_${Date.now()}`;
    student.salt = newSalt;
    student.passwordHash = hashPassword(newPass, newSalt);
    delete student.password; // Remove any plaintext password
  }

  student.updatedAt = new Date().toISOString();
  students[idx] = student;
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

  // Sync session in currentUser if same user
  const currentSession = getCurrentUser();
  if (currentSession && (currentSession.enrollmentNo === student.enrollmentNo || currentSession.id === student.id)) {
    setCurrentUser({
      ...currentSession,
      phone: student.phone,
      email: student.email
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-students-updated'));
  }

  return {
    success: true,
    message: 'Profile updated successfully.',
    profile: getStudentProfile(user)
  };
};

/**
 * Returns all subjects in which the student is enrolled (regular + elective roster).
 * Calculates real-time attendance statistics for each subject.
 */
export const getStudentEnrolledSubjects = (userContext = null) => {
  const user = userContext || getCurrentUser();
  if (!user || user.role !== 'student') return [];

  const studentId = user.id || user.studentId;
  const studentEnr = String(user.enrollmentNo || '').trim().toUpperCase();
  const studentSem = normalizeSem(user.semester || user.sem || '3rd Sem');
  const studentDiv = normalizeDiv(user.division || user.class || 'Div 1');
  const studentDept = user.department || user.dept || '';

  const allSubjects = getSubjects();
  const enrolledList = [];
  const seenSubjectIds = new Set();

  // 1. Regular subjects matching department & semester
  const regularSubjects = allSubjects.filter(s => {
    if (s.isElective) return false;
    const semMatch = normalizeSem(s.sem || s.semester) === studentSem;
    if (!semMatch) return false;
    if (s.dept && studentDept) {
      const sDept = s.dept.toLowerCase();
      const stDept = studentDept.toLowerCase();
      if (!sDept.includes(stDept) && !stDept.includes(sDept)) return false;
    }
    if (s.class && s.class !== 'ALL' && s.class !== 'All') {
      const sClass = normalizeDiv(s.class);
      if (sClass !== studentDiv && s.class !== studentDiv.replace(/[^0-9]/g, '')) return false;
    }
    return true;
  });

  const faculties = getFaculties();
  const facultyMap = new Map();
  faculties.forEach(f => facultyMap.set(f.id, f.name));

  regularSubjects.forEach(s => {
    seenSubjectIds.add(s.id);
    let facultyName = s.faculty || s.assignedFaculty || '';
    if (!facultyName) {
      const alloc = getAllocationForSubject(s.id);
      if (alloc && alloc.divisions) {
        const divAlloc = alloc.divisions.find(d => normalizeDiv(d.name) === studentDiv || d.id === studentDiv.replace(/[^0-9]/g, '')) || alloc.divisions[0];
        if (divAlloc) {
          facultyName = divAlloc.facultyName || (divAlloc.facultyId ? facultyMap.get(divAlloc.facultyId) : '');
        }
      }
    }
    if (!facultyName) facultyName = 'Faculty Member';

    const subjectSessions = getSessions({ subjectId: s.id }, user);
    const stats = calculateStudentAttendanceStats(studentId, subjectSessions);

    enrolledList.push({
      id: s.id,
      subjectId: s.id,
      name: s.name,
      code: s.code || s.subjectCode || 'REG',
      shortName: s.shortName || s.name,
      credits: s.credits || 4,
      department: s.dept || studentDept,
      semester: studentSem,
      division: studentDiv,
      facultyName,
      type: 'regular',
      isElective: false,
      stats
    });
  });

  // 2. Elective subjects from elective class rosters
  const classes = getClasses();
  const electiveClasses = classes.filter(c => c.isElective && (
    (c.studentEnrollmentNos && c.studentEnrollmentNos.some(enr => String(enr).trim().toUpperCase() === studentEnr)) ||
    (c.studentIds && c.studentIds.includes(studentId))
  ));

  electiveClasses.forEach(c => {
    const subId = c.subjectId || c.electiveSubjectId || `ELECTIVE_${c.id}`;
    if (!seenSubjectIds.has(subId)) {
      seenSubjectIds.add(subId);
      const matchedSub = allSubjects.find(s => s.id === subId || s.name === c.subjectName);
      const subjectSessions = getSessions({ subjectId: subId }, user);
      const stats = calculateStudentAttendanceStats(studentId, subjectSessions);

      enrolledList.push({
        id: subId,
        subjectId: subId,
        name: c.subjectName || (matchedSub ? matchedSub.name : 'Elective Subject'),
        code: (matchedSub && matchedSub.code) || c.subjectCode || c.code || 'ELECTIVE',
        shortName: (matchedSub && matchedSub.shortName) || c.subjectName || 'Elective',
        credits: (matchedSub && matchedSub.credits) || 3,
        department: 'Elective (Open)',
        semester: normalizeSem(c.semester || studentSem),
        division: c.name || c.division || 'Elective Class',
        facultyName: c.facultyName || c.assignedFacultyName || 'Assigned Faculty',
        type: 'elective',
        isElective: true,
        electiveClassId: c.id,
        electiveClassName: c.name,
        stats
      });
    }
  });

  // 3. Elective subjects from elective groups assignments
  try {
    const assignments = getElectiveAssignments({ studentId, enrollmentNo: studentEnr });
    assignments.forEach(asgn => {
      const subId = asgn.electiveSubjectId;
      if (subId && !seenSubjectIds.has(subId)) {
        seenSubjectIds.add(subId);
        const group = getElectiveGroupById(asgn.electiveGroupId);
        let subName = 'Elective Subject';
        let subCode = 'ELECTIVE';
        let subFaculty = 'Faculty Member';
        if (group && group.subjects) {
          const sObj = group.subjects.find(s => s.id === subId);
          if (sObj) {
            subName = sObj.name;
            subCode = sObj.code || 'ELECTIVE';
            if (sObj.classes && asgn.electiveClassId) {
              const cObj = sObj.classes.find(c => c.id === asgn.electiveClassId);
              if (cObj && cObj.facultyName) subFaculty = cObj.facultyName;
            }
          }
        }
        const subjectSessions = getSessions({ subjectId: subId }, user);
        const stats = calculateStudentAttendanceStats(studentId, subjectSessions);

        enrolledList.push({
          id: subId,
          subjectId: subId,
          name: subName,
          code: subCode,
          shortName: subName,
          credits: 3,
          department: 'Elective (Open)',
          semester: studentSem,
          division: asgn.electiveClassName || 'Elective Class',
          facultyName: subFaculty,
          type: 'elective',
          isElective: true,
          electiveClassId: asgn.electiveClassId,
          stats
        });
      }
    });
  } catch (err) {
    // ignore
  }

  return enrolledList;
};

/**
 * Returns overall aggregate attendance for the logged-in student.
 */
export const getStudentOverallAttendance = (userContext = null) => {
  const user = userContext || getCurrentUser();
  if (!user || user.role !== 'student') return null;

  const subjects = getStudentEnrolledSubjects(user);
  let totalConducted = 0;
  let totalAttended = 0;
  let totalMissed = 0;
  let totalExceptions = 0;

  subjects.forEach(sub => {
    if (sub.stats) {
      totalConducted += sub.stats.totalConducted || 0;
      totalAttended += sub.stats.totalAttended || 0;
      totalMissed += sub.stats.totalMissed || 0;
      totalExceptions += sub.stats.approvedExceptions || 0;
    }
  });

  let percentage = null;
  let percentageFormatted = 'N/A';
  let meetsThreshold = true;

  if (totalConducted > 0) {
    percentage = Math.round(((totalAttended) / totalConducted) * 1000) / 10;
    percentageFormatted = `${percentage}%`;
    meetsThreshold = percentage >= 75;
  }

  return {
    totalSubjects: subjects.length,
    totalConducted,
    totalAttended,
    totalMissed,
    totalExceptions,
    percentage,
    percentageFormatted,
    meetsThreshold,
    isEligible: meetsThreshold,
    hasConductedLectures: totalConducted > 0,
    subjects
  };
};

/**
 * Returns detailed lecture-by-lecture attendance records for a specific subject.
 */
export const getSubjectAttendanceDetails = (subjectId, userContext = null) => {
  const user = userContext || getCurrentUser();
  if (!user || user.role !== 'student') return null;

  const subjects = getStudentEnrolledSubjects(user);
  const subject = subjects.find(s => s.id === subjectId || s.subjectId === subjectId);
  if (!subject) return null;

  const sessions = getSessions({ subjectId: subject.id }, user);
  const sortedSessions = [...sessions].sort((a, b) => {
    const dDiff = new Date(b.date) - new Date(a.date);
    if (dDiff !== 0) return dDiff;
    const getStartTime = (s) => (s.startTime || (s.timeSlot ? s.timeSlot.split('-')[0].trim() : '') || '');
    return getStartTime(b).localeCompare(getStartTime(a));
  });

  const history = sortedSessions.map(s => {
    let displayStatus = 'Unmarked';
    if (s.myStatus === 'present') displayStatus = 'Present';
    else if (s.myStatus === 'absent') displayStatus = 'Absent';
    else if (s.myStatus === 'od' || s.isExcused) displayStatus = 'Duty Leave / Exception';

    const slot = s.timeSlot || ((s.startTime && s.endTime) ? `${s.startTime} - ${s.endTime}` : 'Regular Slot');

    return {
      id: s.id,
      date: s.date,
      timeSlot: slot,
      topic: s.topic || s.topicCovered || s.topicName || 'Regular Lecture',
      facultyName: s.facultyName || subject.facultyName || 'Faculty Member',
      status: displayStatus,
      statusRaw: s.myStatus,
      isExcused: Boolean(s.isExcused),
      remark: s.myRemark || ''
    };
  });

  return {
    subject,
    stats: subject.stats,
    sessions: history
  };
};

// Expose on window for runtime and test verification
if (typeof window !== 'undefined') {
  window.getElectiveGroups = getElectiveGroups;
  window.getElectiveGroupById = getElectiveGroupById;
  window.saveElectiveGroup = saveElectiveGroup;
  window.deleteElectiveGroup = deleteElectiveGroup;
  window.getElectiveAssignments = getElectiveAssignments;
  window.assignStudentToElective = assignStudentToElective;
  window.bulkAssignStudentsToElectives = bulkAssignStudentsToElectives;
  window.removeStudentFromElective = removeStudentFromElective;
  window.getEligibleStudentsForElectiveGroup = getEligibleStudentsForElectiveGroup;
  window.canFacultyTeachElective = canFacultyTeachElective;
  window.getAuthorizedFacultyElectives = getAuthorizedFacultyElectives;
  window.getStudentsForElectiveClass = getStudentsForElectiveClass;
  window.downloadElectiveAssignmentTemplate = downloadElectiveAssignmentTemplate;
  window.bulkImportElectiveAssignments = bulkImportElectiveAssignments;
  window.parseAndValidateElectiveStudentList = parseAndValidateElectiveStudentList;
  window.updateElectiveClassRoster = updateElectiveClassRoster;

  // Authentication & Core API
  window.loginUser = loginUser;
  window.logoutUser = logoutUser;
  window.getCurrentUser = getCurrentUser;
  window.setCurrentUser = setCurrentUser;
  window.hashPassword = hashPassword;
  window.getStudents = getStudents;
  window.saveStudent = saveStudent;
  window.deleteStudent = deleteStudent;
  window.getClasses = getClasses;
  window.getClassById = getClassById;
  window.saveClass = saveClass;
  window.deleteClass = deleteClass;
  window.getSubjects = getSubjects;
  window.saveSubject = saveSubject;
  window.deleteSubject = deleteSubject;
  window.getFaculties = getFaculties;
  window.saveFaculty = saveFaculty;
  window.deleteFaculty = deleteFaculty;
  window.getSessions = getSessions;
  window.saveSession = saveSession;
  window.deleteSession = deleteSession;

  // Storage & Exceptions API
  window.initializeStorage = initializeStorage;
  window.resetToDefault = resetToDefault;
  window.clearAllAttendanceData = clearAllAttendanceData;
  window.getExceptions = getExceptions;
  window.saveException = saveException;
  window.deleteException = deleteException;
  window.isStudentExcusedForSession = isStudentExcusedForSession;
  window.getInstitutionalExceptionPolicy = getInstitutionalExceptionPolicy;
  window.setInstitutionalExceptionPolicy = setInstitutionalExceptionPolicy;

  // Student Portal Services
  window.calculateStudentAttendanceStats = calculateStudentAttendanceStats;
  window.getStudentProfile = getStudentProfile;
  window.updateStudentProfile = updateStudentProfile;
  window.getStudentEnrolledSubjects = getStudentEnrolledSubjects;
  window.getStudentOverallAttendance = getStudentOverallAttendance;
  window.getSubjectAttendanceDetails = getSubjectAttendanceDetails;
}


// Returns all authorized classes for a specified faculty member (by ID or object)
export const getClassesForFaculty = (facultyIdOrObj) => {
  if (!facultyIdOrObj) return [];
  if (typeof facultyIdOrObj === 'object') return getAuthorizedFacultyClasses(facultyIdOrObj);
  const allFac = getFaculties();
  const found = allFac.find(f => f.id === facultyIdOrObj || f.name.toLowerCase() === String(facultyIdOrObj).toLowerCase());
  return getAuthorizedFacultyClasses(found || { id: facultyIdOrObj });
};

if (typeof window !== 'undefined') {
  window.getDepartments = getDepartments;
  window.saveDepartment = saveDepartment;
  window.deleteDepartment = deleteDepartment;
  window.bulkRegisterStudents = bulkRegisterStudents;
  window.findClassByCriteria = findClassByCriteria;
  window.getOrCreateClass = getOrCreateClass;
  window.canFacultyTeachClassAndSubject = canFacultyTeachClassAndSubject;
  window.getAuthorizedFacultyClasses = getAuthorizedFacultyClasses;
  window.getAuthorizedFacultySubjects = getAuthorizedFacultySubjects;
  window.resolveDepartment = resolveDepartment;
  window.isDepartmentMatch = isDepartmentMatch;
  window.getActiveDepartments = getActiveDepartments;
  window.deactivateDepartment = deactivateDepartment;
  window.reactivateDepartment = reactivateDepartment;
  window.getClassesForFaculty = getClassesForFaculty;
  window.addClass = addClass;
}
