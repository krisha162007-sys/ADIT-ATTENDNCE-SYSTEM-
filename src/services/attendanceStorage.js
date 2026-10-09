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
export const DEFAULT_CLASSES = [
  {
    id: 'CLASS_DEP_CP_3_3_2026-27',
    departmentId: 'DEP_CP',
    departmentName: 'Computer Engineering',
    semester: '3rd Sem',
    division: 'Div 3',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_CP_3_1_2026-27',
    departmentId: 'DEP_CP',
    departmentName: 'Computer Engineering',
    semester: '3rd Sem',
    division: 'Div 1',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_CP_3_2_2026-27',
    departmentId: 'DEP_CP',
    departmentName: 'Computer Engineering',
    semester: '3rd Sem',
    division: 'Div 2',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_AI_3_1_2026-27',
    departmentId: 'DEP_AI',
    departmentName: 'AI & Data Science',
    semester: '3rd Sem',
    division: 'Div 1',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_AI_3_2_2026-27',
    departmentId: 'DEP_AI',
    departmentName: 'AI & Data Science',
    semester: '3rd Sem',
    division: 'Div 2',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_AI_5_1_2026-27',
    departmentId: 'DEP_AI',
    departmentName: 'AI & Data Science',
    semester: '5th Sem',
    division: 'Div 1',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_IT_1_1_2026-27',
    departmentId: 'DEP_IT',
    departmentName: 'Information Technology',
    semester: '1st Sem',
    division: 'Div 1',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_IT_3_1_2026-27',
    departmentId: 'DEP_IT',
    departmentName: 'Information Technology',
    semester: '3rd Sem',
    division: 'Div 1',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_EC_3_1_2026-27',
    departmentId: 'DEP_EC',
    departmentName: 'Electronics & Communication',
    semester: '3rd Sem',
    division: 'Div 1',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_ME_3_1_2026-27',
    departmentId: 'DEP_ME',
    departmentName: 'Mechanical Engineering',
    semester: '3rd Sem',
    division: 'Div 1',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: 'CLASS_DEP_CL_3_1_2026-27',
    departmentId: 'DEP_CL',
    departmentName: 'Civil Engineering',
    semester: '3rd Sem',
    division: 'Div 1',
    academicYear: '2026-27',
    createdAt: '2026-07-01T00:00:00.000Z',
    status: 'active'
  }
];

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
  { 
    id: 'DEP_AI', 
    code: 'AI&DS', 
    name: 'AI & Data Science', 
    fullName: 'Department of Artificial Intelligence & Data Science',
    icon: 'Brain',
    hod: 'Prof. Priya Shah',
    hodEmail: 'priya.shah@adit.ac.in',
    hodPhone: '+91 98250 11111',
    cabin: 'Academic Block B, Room 201-A',
    established: '2021',
    totalStudents: 180,
    classrooms: ['Room 201', 'Room 202', 'Room 203', 'Room 204', 'Room 205', 'Seminar Hall 301'],
    labs: [
      { name: 'AI & Deep Learning Lab', code: 'AI-LAB', room: 'Lab 301', pcs: 35, inCharge: 'Prof. Dev Trivedi' },
      { name: 'Data Engineering & Analytics Lab', code: 'DE-LAB', room: 'Lab 302', pcs: 35, inCharge: 'Prof. R. Jain' },
      { name: 'Database & Systems Lab', code: 'DBS-LAB', room: 'Lab 201', pcs: 30, inCharge: 'Prof. Priya Shah' },
      { name: 'Network & Cloud Lab', code: 'NET-LAB', room: 'Lab 202', pcs: 30, inCharge: 'Prof. Sneha Mehta' }
    ],
    divisions: [
      { id: '1', name: 'Div 1', counselor: 'Prof. Priya Shah', cr: 'Aarav Patel', studentCount: 60 },
      { id: '2', name: 'Div 2', counselor: 'Prof. Rahul Patel', cr: 'Ananya Sharma', studentCount: 60 },
      { id: '3', name: 'Div 3', counselor: 'Prof. A. Kumar', cr: 'Devansh Verma', studentCount: 60 }
    ]
  },
  { 
    id: 'DEP_CP', 
    code: 'CP', 
    name: 'Computer Engineering', 
    fullName: 'Department of Computer Engineering',
    icon: 'Laptop',
    hod: 'Dr. S. M. Mehta',
    hodEmail: 'smmehta@adit.ac.in',
    hodPhone: '+91 98250 23456',
    cabin: 'Computer Center, Room 102',
    established: '2000',
    totalStudents: 210,
    classrooms: ['Classroom 301', 'Classroom 302', 'Classroom 303', 'Classroom 304'],
    labs: [
      { name: 'Advanced Computing Lab', code: 'ACL', room: 'CC-Lab 1', pcs: 40, inCharge: 'Prof. R. K. Patel' },
      { name: 'Database Lab', code: 'DBL', room: 'Database Lab 2', pcs: 35, inCharge: 'Dr. S. M. Mehta' },
      { name: 'Hardware & Microprocessor Lab', code: 'HML', room: 'Lab 103', pcs: 25, inCharge: 'Prof. A. N. Shah' }
    ],
    divisions: [
      { id: '1', name: 'Div 1', counselor: 'Dr. S. M. Mehta', cr: 'Harshil Soni', studentCount: 70 },
      { id: '2', name: 'Div 2', counselor: 'Prof. A. N. Shah', cr: 'Jiya Shah', studentCount: 70 },
      { id: '3', name: 'Div 3', counselor: 'Prof. R. K. Patel', cr: 'Karan Mistry', studentCount: 70 }
    ]
  },
  { 
    id: 'DEP_IT', 
    code: 'IT', 
    name: 'Information Technology', 
    fullName: 'Department of Information Technology',
    icon: 'Network',
    hod: 'Dr. H. K. Trivedi',
    hodEmail: 'hktrivedi@adit.ac.in',
    hodPhone: '+91 98250 56789',
    cabin: 'IT Complex Room 204',
    established: '2001',
    totalStudents: 140,
    classrooms: ['IT-101', 'IT-102', 'IT-103'],
    labs: [
      { name: 'Web Technology Lab', code: 'WTL', room: 'IT-Lab 1', pcs: 35, inCharge: 'Prof. M. B. Joshi' },
      { name: 'Software Engineering Lab', code: 'SEL', room: 'IT-Lab 2', pcs: 35, inCharge: 'Dr. H. K. Trivedi' }
    ],
    divisions: [
      { id: '1', name: 'Div 1', counselor: 'Dr. H. K. Trivedi', cr: 'Meet Makwana', studentCount: 70 },
      { id: '2', name: 'Div 2', counselor: 'Prof. M. B. Joshi', cr: 'Bhumika Parmar', studentCount: 70 }
    ]
  },
  { 
    id: 'DEP_EC', 
    code: 'EC', 
    name: 'Electronics & Communication', 
    fullName: 'Department of Electronics & Communication Engineering',
    icon: 'Cpu',
    hod: 'Dr. V. M. Patel',
    hodEmail: 'vmpatel@adit.ac.in',
    hodPhone: '+91 98250 78901',
    cabin: 'EC Block Room 101',
    established: '2000',
    totalStudents: 120,
    classrooms: ['EC-201', 'EC-202'],
    labs: [
      { name: 'VLSI & Embedded Lab', code: 'VLSI', room: 'EC-Lab 1', pcs: 30, inCharge: 'Dr. V. M. Patel' },
      { name: 'Communication Lab', code: 'COML', room: 'EC-Lab 2', pcs: 25, inCharge: 'Prof. T. S. Joshi' }
    ],
    divisions: [
      { id: '1', name: 'Div 1', counselor: 'Dr. V. M. Patel', cr: 'Chirag Panchal', studentCount: 60 },
      { id: '2', name: 'Div 2', counselor: 'Prof. T. S. Joshi', cr: 'Diya Patel', studentCount: 60 }
    ]
  },
  { 
    id: 'DEP_ME', 
    code: 'ME', 
    name: 'Mechanical Engineering', 
    fullName: 'Department of Mechanical Engineering',
    icon: 'Cog',
    hod: 'Dr. P. J. Shah',
    hodEmail: 'pjshah@adit.ac.in',
    hodPhone: '+91 98250 89012',
    cabin: 'Workshop Admin 101',
    established: '2000',
    totalStudents: 120,
    classrooms: ['ME-101', 'ME-102'],
    labs: [
      { name: 'CAD/CAM Lab', code: 'CAD', room: 'ME-Lab 1', pcs: 30, inCharge: 'Dr. P. J. Shah' },
      { name: 'Thermal Engineering Lab', code: 'THL', room: 'Workshop 2', pcs: 10, inCharge: 'Prof. K. R. Dave' }
    ],
    divisions: [
      { id: '1', name: 'Div 1', counselor: 'Dr. P. J. Shah', cr: 'Parth Solanki', studentCount: 60 },
      { id: '2', name: 'Div 2', counselor: 'Prof. K. R. Dave', cr: 'Varun Chawla', studentCount: 60 }
    ]
  },
  { 
    id: 'DEP_CL', 
    code: 'CL', 
    name: 'Civil Engineering', 
    fullName: 'Department of Civil Engineering',
    icon: 'Building',
    hod: 'Dr. R. B. Dave',
    hodEmail: 'rbdave@adit.ac.in',
    hodPhone: '+91 98250 90123',
    cabin: 'Civil Block Room 101',
    established: '2003',
    totalStudents: 100,
    classrooms: ['CL-101', 'CL-102'],
    labs: [
      { name: 'Structural & Concrete Lab', code: 'SCL', room: 'Civil Lab 1', pcs: 15, inCharge: 'Dr. R. B. Dave' },
      { name: 'Surveying Lab', code: 'SRV', room: 'Field Station', pcs: 10, inCharge: 'Prof. M. K. Vyas' }
    ],
    divisions: [
      { id: '1', name: 'Div 1', counselor: 'Dr. R. B. Dave', cr: 'Yash Vaghela', studentCount: 50 },
      { id: '2', name: 'Div 2', counselor: 'Prof. M. K. Vyas', cr: 'Tanya Kothari', studentCount: 50 }
    ]
  }
];

// Faculty Master List
export const DEFAULT_FACULTIES = [
  // AI & Data Science
  { id: 'FAC_PS', name: 'Prof. Priya Shah', dept: 'AI & Data Science', designation: 'Associate Professor', email: 'priya.shah@adit.ac.in', phone: '9825011111', subjects: 'DBMS, DS' },
  { id: 'FAC_RP', name: 'Prof. Rahul Patel', dept: 'AI & Data Science', designation: 'Assistant Professor', email: 'rahul.patel@adit.ac.in', phone: '9825022222', subjects: 'Mathematics' },
  { id: 'FAC_AK', name: 'Prof. A. Kumar', dept: 'AI & Data Science', designation: 'Assistant Professor', email: 'a.kumar@adit.ac.in', phone: '9825033333', subjects: 'Operating Systems' },
  { id: 'FAC_SM', name: 'Prof. Sneha Mehta', dept: 'AI & Data Science', designation: 'Associate Professor', email: 'sneha.mehta@adit.ac.in', phone: '9825044444', subjects: 'Computer Networks' },
  { id: 'FAC_DT', name: 'Prof. Dev Trivedi', dept: 'AI & Data Science', designation: 'Assistant Professor', email: 'dev.trivedi@adit.ac.in', phone: '9825055555', subjects: 'Python Programming' },
  { id: 'FAC_NM', name: 'Prof. Neha Modi', dept: 'AI & Data Science', designation: 'Assistant Professor', email: 'neha.modi@adit.ac.in', phone: '9825066666', subjects: 'Humanities' },
  { id: 'FAC_RJ', name: 'Prof. R. Jain', dept: 'AI & Data Science', designation: 'Assistant Professor', email: 'r.jain@adit.ac.in', phone: '9825077777', subjects: 'Data Analytics' },
  { id: 'FAC_DJP', name: 'Dr. Dinesh Prajapati', dept: 'AI & Data Science', designation: 'Associate Professor', email: 'dinesh.prajapati@adit.ac.in', phone: '9825088888', subjects: 'SNA, DWDM, NLP, BDA' },
  
  // Computer Engineering
  { id: 'FAC01', name: 'Prof. R. K. Patel', dept: 'Computer Engineering', designation: 'Associate Professor', email: 'rkpatel@adit.ac.in', phone: '9825012345', subjects: 'Data Structures' },
  { id: 'FAC02', name: 'Dr. S. M. Mehta', dept: 'Computer Engineering', designation: 'Professor & HOD', email: 'smmehta@adit.ac.in', phone: '9825023456', subjects: 'DBMS' },
  { id: 'FAC03', name: 'Prof. A. N. Shah', dept: 'Computer Engineering', designation: 'Assistant Professor', email: 'anshah@adit.ac.in', phone: '9825034567', subjects: 'Digital Logic' },
  { id: 'FAC04', name: 'Prof. P. V. Desai', dept: 'Computer Engineering', designation: 'Assistant Professor', email: 'pvdesai@adit.ac.in', phone: '9825045678', subjects: 'Discrete Mathematics' },
  
  // Information Technology
  { id: 'FAC05', name: 'Dr. H. K. Trivedi', dept: 'Information Technology', designation: 'Associate Professor', email: 'hktrivedi@adit.ac.in', phone: '9825056789', subjects: 'Object Oriented Programming' },
  { id: 'FAC06', name: 'Prof. M. B. Joshi', dept: 'Information Technology', designation: 'Assistant Professor', email: 'mbjoshi@adit.ac.in', phone: '9825067890', subjects: 'Web Technologies' },
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
  // Computer Engineering • Sem 3 • Div 3 (2026-27)
  { id: 'S127', rollNo: '1', name: 'Aarav Patel', enrollmentNo: '12502040501127', email: 'aarav.patel@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S128', rollNo: '2', name: 'Ananya Sharma', enrollmentNo: '12502040501128', email: 'ananya.sharma@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S129', rollNo: '3', name: 'Devansh Verma', enrollmentNo: '12502040501129', email: 'devansh.verma@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S130', rollNo: '4', name: 'Diyansh Joshi', enrollmentNo: '12502040501130', email: 'diyansh.joshi@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S131', rollNo: '5', name: 'Isha Mehta', enrollmentNo: '12502040501131', email: 'isha.mehta@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S132', rollNo: '6', name: 'Kabir Shah', enrollmentNo: '12502040501132', email: 'kabir.shah@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S133', rollNo: '7', name: 'Khushi Trivedi', enrollmentNo: '12502040501133', email: 'khushi.trivedi@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S134', rollNo: '8', name: 'Manav Desai', enrollmentNo: '12502040501134', email: 'manav.desai@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S135', rollNo: '9', name: 'Neha Bhatt', enrollmentNo: '12502040501135', email: 'neha.bhatt@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S136', rollNo: '10', name: 'Parth Solanki', enrollmentNo: '12502040501136', email: 'parth.solanki@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S137', rollNo: '11', name: 'Riya Rathod', enrollmentNo: '12502040501137', email: 'riya.rathod@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S138', rollNo: '12', name: 'Siddharth Dave', enrollmentNo: '12502040501138', email: 'siddharth.dave@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S139', rollNo: '13', name: 'Tanya Kothari', enrollmentNo: '12502040501139', email: 'tanya.kothari@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S140', rollNo: '14', name: 'Varun Chawla', enrollmentNo: '12502040501140', email: 'varun.chawla@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S142', rollNo: '15', name: 'Yash Vaghela', enrollmentNo: '12502040501142', email: 'yash.vaghela@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S143', rollNo: '16', name: 'Aayush Prajapati', enrollmentNo: '12502040501143', email: 'aayush.p@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S144', rollNo: '17', name: 'Bhumika Parmar', enrollmentNo: '12502040501144', email: 'bhumika.p@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S145', rollNo: '18', name: 'Chirag Panchal', enrollmentNo: '12502040501145', email: 'chirag.p@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S146', rollNo: '19', name: 'Diya Patel', enrollmentNo: '12502040501146', email: 'diya.patel@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S147', rollNo: '20', name: 'Harshil Soni', enrollmentNo: '12502040501147', email: 'harshil.soni@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S148', rollNo: '21', name: 'Jiya Shah', enrollmentNo: '12502040501148', email: 'jiya.shah@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S149', rollNo: '22', name: 'Karan Mistry', enrollmentNo: '12502040501149', email: 'karan.mistry@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S150', rollNo: '23', name: 'Meet Makwana', enrollmentNo: '12502040501150', email: 'meet.makwana@adit.ac.in', classId: 'CLASS_DEP_CP_3_3_2026-27', departmentId: 'DEP_CP', department: 'Computer Engineering', dept: 'Computer', class: '3', division: 'Div 3', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },

  // AI & Data Science • Sem 3 • Div 1 (2026-27) - Matching User Prompt Specification
  { id: 'S_AI_01', rollNo: '1', name: 'Student A', enrollmentNo: '24AD001', email: 'student.a@adit.ac.in', classId: 'CLASS_DEP_AI_3_1_2026-27', departmentId: 'DEP_AI', department: 'AI & Data Science', dept: 'AI & Data Science', class: '1', division: 'Div 1', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S_AI_02', rollNo: '2', name: 'Student B', enrollmentNo: '24AD002', email: 'student.b@adit.ac.in', classId: 'CLASS_DEP_AI_3_1_2026-27', departmentId: 'DEP_AI', department: 'AI & Data Science', dept: 'AI & Data Science', class: '1', division: 'Div 1', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S_AI_03', rollNo: '3', name: 'Student C', enrollmentNo: '24AD003', email: 'student.c@adit.ac.in', classId: 'CLASS_DEP_AI_3_1_2026-27', departmentId: 'DEP_AI', department: 'AI & Data Science', dept: 'AI & Data Science', class: '1', division: 'Div 1', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S_AI_04', rollNo: '4', name: 'Dhwani Shah', enrollmentNo: '24AD004', email: 'dhwani.shah@adit.ac.in', classId: 'CLASS_DEP_AI_3_1_2026-27', departmentId: 'DEP_AI', department: 'AI & Data Science', dept: 'AI & Data Science', class: '1', division: 'Div 1', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S_AI_05', rollNo: '5', name: 'Kavya Patel', enrollmentNo: '24AD005', email: 'kavya.patel@adit.ac.in', classId: 'CLASS_DEP_AI_3_1_2026-27', departmentId: 'DEP_AI', department: 'AI & Data Science', dept: 'AI & Data Science', class: '1', division: 'Div 1', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },
  { id: 'S_AI_06', rollNo: '6', name: 'Neel Mistry', enrollmentNo: '24AD006', email: 'neel.mistry@adit.ac.in', classId: 'CLASS_DEP_AI_3_1_2026-27', departmentId: 'DEP_AI', department: 'AI & Data Science', dept: 'AI & Data Science', class: '1', division: 'Div 1', sem: '3rd Sem', semester: '3rd Sem', academicYear: '2026-27' },

  // Information Technology • Sem 1 • Div 1 (2026-27) - Matching 1IT1 Timetable
  { id: 'S_IT_01', rollNo: '1', name: 'Omkar Trivedi', enrollmentNo: '24IT001', email: 'omkar.t@adit.ac.in', classId: 'CLASS_DEP_IT_1_1_2026-27', departmentId: 'DEP_IT', department: 'Information Technology', dept: 'Information Technology', class: '1', division: 'Div 1', sem: '1st Sem', semester: '1st Sem', academicYear: '2026-27' },
  { id: 'S_IT_02', rollNo: '2', name: 'Prachi Joshi', enrollmentNo: '24IT002', email: 'prachi.j@adit.ac.in', classId: 'CLASS_DEP_IT_1_1_2026-27', departmentId: 'DEP_IT', department: 'Information Technology', dept: 'Information Technology', class: '1', division: 'Div 1', sem: '1st Sem', semester: '1st Sem', academicYear: '2026-27' },
];

export const DEFAULT_SUBJECTS = [
  // AI & Data Science
  { id: 'SUB_AI_DBMS', code: '3130703', name: 'Database Management Systems', shortName: 'DBMS', faculty: 'Prof. Priya Shah', credits: 4, sem: '3rd Sem', dept: 'AI & Data Science', class: '1' },
  { id: 'SUB_AI_DS', code: '3130702', name: 'Data Structures', shortName: 'DS', faculty: 'Prof. Priya Shah', credits: 4, sem: '3rd Sem', dept: 'AI & Data Science', class: '1' },
  { id: 'SUB_AI_PY', code: '3130704', name: 'Python Programming', shortName: 'Python', faculty: 'Prof. Dev Trivedi', credits: 3, sem: '3rd Sem', dept: 'AI & Data Science', class: '1' },
  { id: 'SUB_AI_MATH', code: '3130006', name: 'Mathematics - III', shortName: 'Mathematics', faculty: 'Prof. Rahul Patel', credits: 4, sem: '3rd Sem', dept: 'AI & Data Science', class: '1' },
  { id: 'SUB_AI_OS', code: '3130705', name: 'Operating Systems', shortName: 'Operating Systems', faculty: 'Prof. A. Kumar', credits: 4, sem: '3rd Sem', dept: 'AI & Data Science', class: '1' },
  { id: 'SUB_AI_CN', code: '3130706', name: 'Computer Networks', shortName: 'Computer Networks', faculty: 'Prof. Sneha Mehta', credits: 4, sem: '3rd Sem', dept: 'AI & Data Science', class: '1' },
  { id: 'SUB_AI_SEM', code: '3130709', name: 'Technical Seminar', shortName: 'Seminar', faculty: 'Prof. Priya Shah', credits: 2, sem: '3rd Sem', dept: 'AI & Data Science', class: '1' },
  { id: 'SUB_AI_DA', code: '3130708', name: 'Data Analytics', shortName: 'Data Analytics', faculty: 'Prof. R. Jain', credits: 3, sem: '3rd Sem', dept: 'AI & Data Science', class: '1' },
  { id: 'SUB_AI_HUM', code: '3130008', name: 'Humanities & Social Sciences', shortName: 'Humanities', faculty: 'Prof. Neha Modi', credits: 2, sem: '3rd Sem', dept: 'AI & Data Science', class: '1' },

  // Computer Engineering
  { id: 'SUB_DS', code: '102040304', name: 'DATA STRUCTURES', shortName: 'DS', faculty: 'Prof. R. K. Patel', credits: 4, sem: '3rd Sem', dept: 'Computer Engineering', class: '3', academicYear: '2026-27', term: 'Odd' },
  { id: 'SUB01', code: '102040301', name: 'Database Management Systems', shortName: 'DBMS', faculty: 'Dr. S. M. Mehta', credits: 4, sem: '3rd Sem', dept: 'Computer Engineering', class: '3', academicYear: '2026-27', term: 'Odd' },
  { id: 'SUB02', code: '102040302', name: 'Digital Logic & Computer Design', shortName: 'Digital Logic', faculty: 'Prof. A. N. Shah', credits: 4, sem: '3rd Sem', dept: 'Computer Engineering', class: '3', academicYear: '2026-27', term: 'Odd' },
  { id: 'SUB03', code: '102040303', name: 'Discrete Mathematics', shortName: 'Discrete Math', faculty: 'Prof. P. V. Desai', credits: 3, sem: '3rd Sem', dept: 'Computer Engineering', class: '3', academicYear: '2026-27', term: 'Odd' },
  { id: 'SUB04', code: '102040305', name: 'Object Oriented Programming', shortName: 'OOP', faculty: 'Dr. H. K. Trivedi', credits: 4, sem: '3rd Sem', dept: 'Computer Engineering', class: '3', academicYear: '2026-27', term: 'Odd' }
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
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
    return;
  }

  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
  }

  const existingFaculties = localStorage.getItem(STORAGE_KEYS.FACULTIES);
  if (!existingFaculties || !existingFaculties.includes('FAC_PS')) {
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(DEFAULT_FACULTIES));
  } else if (!existingFaculties.includes('FAC_DJP')) {
    try {
      const facs = JSON.parse(existingFaculties);
      if (!facs.some(f => f.id === 'FAC_DJP' || (f.name && f.name.includes('Dinesh')))) {
        facs.push({
          id: 'FAC_DJP',
          name: 'Dr. Dinesh Prajapati',
          dept: 'AI & Data Science',
          designation: 'Associate Professor',
          email: 'dinesh.prajapati@adit.ac.in',
          phone: '9825088888',
          subjects: 'SNA, DWDM, NLP, BDA'
        });
        localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(facs));
      }
    } catch (e) {}
  }

  const existingDepts = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
  if (!existingDepts || !existingDepts.includes('cabin') || !existingDepts.includes('AI & Data Science')) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
  }
  const existingSubjs = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  if (!existingSubjs || !existingSubjs.includes('SUB_AI_DBMS')) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
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

export const findClassByCriteria = (department, semester, division, academicYear = DEFAULT_ACADEMIC_YEAR) => {
  const classes = getClasses();
  const normSem = normalizeSem(semester);
  const normDiv = normalizeDiv(division);
  const normYear = (academicYear || DEFAULT_ACADEMIC_YEAR).trim();

  let targetDeptId = null;
  let targetDeptName = null;
  if (department) {
    const dStr = String(department).trim().toLowerCase();
    const depts = getDepartments();
    const found = depts.find(d => 
      d.id.toLowerCase() === dStr ||
      d.name.toLowerCase() === dStr ||
      d.code.toLowerCase() === dStr ||
      d.name.toLowerCase().includes(dStr) ||
      dStr.includes(d.name.toLowerCase())
    );
    if (found) {
      targetDeptId = found.id;
      targetDeptName = found.name;
    } else {
      targetDeptName = department;
    }
  }

  return classes.find(c => {
    const semMatch = normalizeSem(c.semester) === normSem;
    const divMatch = normalizeDiv(c.division) === normDiv;
    const yearMatch = !c.academicYear || c.academicYear === normYear;
    const deptMatch = !department || 
      (targetDeptId && c.departmentId === targetDeptId) || 
      (targetDeptName && c.departmentName.toLowerCase().includes(targetDeptName.toLowerCase())) ||
      (c.departmentName.toLowerCase().includes(String(department).toLowerCase()));
    return semMatch && divMatch && yearMatch && deptMatch;
  }) || null;
};

export const getOrCreateClass = (department, semester, division, academicYear = DEFAULT_ACADEMIC_YEAR) => {
  const existing = findClassByCriteria(department, semester, division, academicYear);
  if (existing) return existing;

  const depts = getDepartments();
  let deptId = 'DEP_AI';
  let deptName = 'AI & Data Science';
  if (department) {
    const dStr = String(department).toLowerCase();
    const found = depts.find(d => d.id.toLowerCase() === dStr || d.name.toLowerCase() === dStr || d.name.toLowerCase().includes(dStr));
    if (found) {
      deptId = found.id;
      deptName = found.name;
    } else {
      deptName = department;
    }
  }

  const normSem = normalizeSem(semester);
  const normDiv = normalizeDiv(division);
  const normYear = academicYear || DEFAULT_ACADEMIC_YEAR;

  const newClass = {
    id: `CLASS_${deptId}_${normSem.replace(/[^0-9]/g, '')}_${normDiv.replace(/[^0-9]/g, '')}_${normYear.replace(/[^0-9]/g, '_')}`,
    departmentId: deptId,
    departmentName: deptName,
    semester: normSem,
    division: normDiv,
    academicYear: normYear,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  saveClass(newClass);
  return newClass;
};

export const saveClass = (classData) => {
  if (!classData.departmentName && !classData.departmentId) {
    throw new Error('Department is required to create a class.');
  }
  const normSem = normalizeSem(classData.semester || '3rd Sem');
  const normDiv = normalizeDiv(classData.division || 'Div 1');
  const normYear = (classData.academicYear || DEFAULT_ACADEMIC_YEAR).trim();

  const depts = getDepartments();
  let deptId = classData.departmentId;
  let deptName = classData.departmentName;
  if (deptId && !deptName) {
    const f = depts.find(d => d.id === deptId);
    if (f) deptName = f.name;
  } else if (!deptId && deptName) {
    const f = depts.find(d => d.name.toLowerCase() === deptName.toLowerCase() || d.id === deptName);
    if (f) {
      deptId = f.id;
      deptName = f.name;
    }
  }
  if (!deptId) deptId = 'DEP_AI';
  if (!deptName) deptName = 'AI & Data Science';

  const classes = getClasses();

  // Uniqueness rule: Department + Semester + Division + Academic Year
  const duplicate = classes.find(c => 
    c.id !== classData.id &&
    c.departmentId === deptId &&
    normalizeSem(c.semester) === normSem &&
    normalizeDiv(c.division) === normDiv &&
    c.academicYear === normYear
  );

  if (duplicate) {
    throw new Error(`A class for ${deptName}, ${normSem}, ${normDiv} (${normYear}) already exists.`);
  }

  let savedClass;
  if (classData.id) {
    const idx = classes.findIndex(c => c.id === classData.id);
    if (idx !== -1) {
      savedClass = {
        ...classes[idx],
        ...classData,
        departmentId: deptId,
        departmentName: deptName,
        semester: normSem,
        division: normDiv,
        academicYear: normYear,
        updatedAt: new Date().toISOString()
      };
      classes[idx] = savedClass;

      // Update student denormalized attributes
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
    } else {
      savedClass = {
        ...classData,
        departmentId: deptId,
        departmentName: deptName,
        semester: normSem,
        division: normDiv,
        academicYear: normYear,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      classes.push(savedClass);
    }
  } else {
    const newId = `CLASS_${deptId}_${normSem.replace(/[^0-9]/g, '')}_${normDiv.replace(/[^0-9]/g, '')}_${normYear.replace(/[^0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    savedClass = {
      ...classData,
      id: newId,
      departmentId: deptId,
      departmentName: deptName,
      semester: normSem,
      division: normDiv,
      academicYear: normYear,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    classes.push(savedClass);
  }

  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  return { success: true, class: savedClass, classes };
};

export const deleteClass = (classId, deleteStudents = false) => {
  const classes = getClasses().filter(c => c.id !== classId);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));

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

  // Ensure each student has classId properly linked
  let modified = false;
  students.forEach(st => {
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

export const saveStudent = (studentData) => {
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
  return {
    success: true,
    importedCount,
    movedCount,
    updatedCount,
    totalProcessed: studentRows.length,
    errors
  };
};

export const deleteStudent = (studentId) => {
  const students = getStudents().filter(s => s.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
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
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
  localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(DEFAULT_SECURITY));
  localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, 'G H Patel College of Engineering & Technology');
  return {
    classes: DEFAULT_CLASSES,
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
