const STORAGE_KEYS = {
  STUDENTS: "adit_attendance_students",
  CLASSES: "adit_attendance_classes",
  SUBJECTS: "adit_attendance_subjects",
  SESSIONS: "adit_attendance_sessions",
  SECURITY: "adit_attendance_security",
  COLLEGE_NAME: "adit_college_name",
  DEPARTMENT: "adit_department_name",
  FACULTIES: "adit_attendance_faculties",
  DEPARTMENTS: "adit_attendance_departments",
  ALLOCATIONS: "adit_attendance_allocations"
};
const DEFAULT_ACADEMIC_YEAR = "2026-27";
const ACADEMIC_YEARS = ["2024-25", "2025-26", "2026-27", "2027-28", "2028-29"];
const normalizeSem = (semStr) => {
  if (!semStr) return "3rd Sem";
  const s = String(semStr).trim();
  const m = s.match(/([1-8])/);
  if (!m) return s;
  const num = m[1];
  const sufs = { "1": "st", "2": "nd", "3": "rd" };
  return `${num}${sufs[num] || "th"} Sem`;
};
const normalizeDiv = (divStr) => {
  if (!divStr) return "Div 1";
  const s = String(divStr).trim();
  const m = s.match(/([1-9])/);
  if (!m) return s;
  return `Div ${m[1]}`;
};
const DEFAULT_CLASSES = [
  {
    id: "CLASS_DEP_CP_3_3_2026-27",
    departmentId: "DEP_CP",
    departmentName: "Computer Engineering",
    semester: "3rd Sem",
    division: "Div 3",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_CP_3_1_2026-27",
    departmentId: "DEP_CP",
    departmentName: "Computer Engineering",
    semester: "3rd Sem",
    division: "Div 1",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_CP_3_2_2026-27",
    departmentId: "DEP_CP",
    departmentName: "Computer Engineering",
    semester: "3rd Sem",
    division: "Div 2",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_AI_3_1_2026-27",
    departmentId: "DEP_AI",
    departmentName: "AI & Data Science",
    semester: "3rd Sem",
    division: "Div 1",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_AI_3_2_2026-27",
    departmentId: "DEP_AI",
    departmentName: "AI & Data Science",
    semester: "3rd Sem",
    division: "Div 2",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_AI_5_1_2026-27",
    departmentId: "DEP_AI",
    departmentName: "AI & Data Science",
    semester: "5th Sem",
    division: "Div 1",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_IT_1_1_2026-27",
    departmentId: "DEP_IT",
    departmentName: "Information Technology",
    semester: "1st Sem",
    division: "Div 1",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_IT_3_1_2026-27",
    departmentId: "DEP_IT",
    departmentName: "Information Technology",
    semester: "3rd Sem",
    division: "Div 1",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_EC_3_1_2026-27",
    departmentId: "DEP_EC",
    departmentName: "Electronics & Communication",
    semester: "3rd Sem",
    division: "Div 1",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_ME_3_1_2026-27",
    departmentId: "DEP_ME",
    departmentName: "Mechanical Engineering",
    semester: "3rd Sem",
    division: "Div 1",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "CLASS_DEP_CL_3_1_2026-27",
    departmentId: "DEP_CL",
    departmentName: "Civil Engineering",
    semester: "3rd Sem",
    division: "Div 1",
    academicYear: "2026-27",
    createdAt: "2026-07-01T00:00:00.000Z",
    status: "active"
  }
];
const SEMESTERS = [
  { id: "1st Sem", num: 1, term: "Odd", year: "1st Year" },
  { id: "2nd Sem", num: 2, term: "Even", year: "1st Year" },
  { id: "3rd Sem", num: 3, term: "Odd", year: "2nd Year" },
  { id: "4th Sem", num: 4, term: "Even", year: "2nd Year" },
  { id: "5th Sem", num: 5, term: "Odd", year: "3rd Year" },
  { id: "6th Sem", num: 6, term: "Even", year: "3rd Year" },
  { id: "7th Sem", num: 7, term: "Odd", year: "4th Year" },
  { id: "8th Sem", num: 8, term: "Even", year: "4th Year" }
];
const DEFAULT_DEPARTMENTS = [
  {
    id: "DEP_AI",
    code: "AI&DS",
    name: "AI & Data Science",
    fullName: "Department of Artificial Intelligence & Data Science",
    icon: "Brain",
    hod: "Prof. Priya Shah",
    hodEmail: "priya.shah@adit.ac.in",
    hodPhone: "+91 98250 11111",
    cabin: "Academic Block B, Room 201-A",
    established: "2021",
    totalStudents: 180,
    classrooms: ["Room 201", "Room 202", "Room 203", "Room 204", "Room 205", "Seminar Hall 301"],
    labs: [
      { name: "AI & Deep Learning Lab", code: "AI-LAB", room: "Lab 301", pcs: 35, inCharge: "Prof. Dev Trivedi" },
      { name: "Data Engineering & Analytics Lab", code: "DE-LAB", room: "Lab 302", pcs: 35, inCharge: "Prof. R. Jain" },
      { name: "Database & Systems Lab", code: "DBS-LAB", room: "Lab 201", pcs: 30, inCharge: "Prof. Priya Shah" },
      { name: "Network & Cloud Lab", code: "NET-LAB", room: "Lab 202", pcs: 30, inCharge: "Prof. Sneha Mehta" }
    ],
    divisions: [
      { id: "1", name: "Div 1", counselor: "Prof. Priya Shah", cr: "Aarav Patel", studentCount: 60 },
      { id: "2", name: "Div 2", counselor: "Prof. Rahul Patel", cr: "Ananya Sharma", studentCount: 60 },
      { id: "3", name: "Div 3", counselor: "Prof. A. Kumar", cr: "Devansh Verma", studentCount: 60 }
    ]
  },
  {
    id: "DEP_CP",
    code: "CP",
    name: "Computer Engineering",
    fullName: "Department of Computer Engineering",
    icon: "Laptop",
    hod: "Dr. S. M. Mehta",
    hodEmail: "smmehta@adit.ac.in",
    hodPhone: "+91 98250 23456",
    cabin: "Computer Center, Room 102",
    established: "2000",
    totalStudents: 210,
    classrooms: ["Classroom 301", "Classroom 302", "Classroom 303", "Classroom 304"],
    labs: [
      { name: "Advanced Computing Lab", code: "ACL", room: "CC-Lab 1", pcs: 40, inCharge: "Prof. R. K. Patel" },
      { name: "Database Lab", code: "DBL", room: "Database Lab 2", pcs: 35, inCharge: "Dr. S. M. Mehta" },
      { name: "Hardware & Microprocessor Lab", code: "HML", room: "Lab 103", pcs: 25, inCharge: "Prof. A. N. Shah" }
    ],
    divisions: [
      { id: "1", name: "Div 1", counselor: "Dr. S. M. Mehta", cr: "Harshil Soni", studentCount: 70 },
      { id: "2", name: "Div 2", counselor: "Prof. A. N. Shah", cr: "Jiya Shah", studentCount: 70 },
      { id: "3", name: "Div 3", counselor: "Prof. R. K. Patel", cr: "Karan Mistry", studentCount: 70 }
    ]
  },
  {
    id: "DEP_IT",
    code: "IT",
    name: "Information Technology",
    fullName: "Department of Information Technology",
    icon: "Network",
    hod: "Dr. H. K. Trivedi",
    hodEmail: "hktrivedi@adit.ac.in",
    hodPhone: "+91 98250 56789",
    cabin: "IT Complex Room 204",
    established: "2001",
    totalStudents: 140,
    classrooms: ["IT-101", "IT-102", "IT-103"],
    labs: [
      { name: "Web Technology Lab", code: "WTL", room: "IT-Lab 1", pcs: 35, inCharge: "Prof. M. B. Joshi" },
      { name: "Software Engineering Lab", code: "SEL", room: "IT-Lab 2", pcs: 35, inCharge: "Dr. H. K. Trivedi" }
    ],
    divisions: [
      { id: "1", name: "Div 1", counselor: "Dr. H. K. Trivedi", cr: "Meet Makwana", studentCount: 70 },
      { id: "2", name: "Div 2", counselor: "Prof. M. B. Joshi", cr: "Bhumika Parmar", studentCount: 70 }
    ]
  },
  {
    id: "DEP_EC",
    code: "EC",
    name: "Electronics & Communication",
    fullName: "Department of Electronics & Communication Engineering",
    icon: "Cpu",
    hod: "Dr. V. M. Patel",
    hodEmail: "vmpatel@adit.ac.in",
    hodPhone: "+91 98250 78901",
    cabin: "EC Block Room 101",
    established: "2000",
    totalStudents: 120,
    classrooms: ["EC-201", "EC-202"],
    labs: [
      { name: "VLSI & Embedded Lab", code: "VLSI", room: "EC-Lab 1", pcs: 30, inCharge: "Dr. V. M. Patel" },
      { name: "Communication Lab", code: "COML", room: "EC-Lab 2", pcs: 25, inCharge: "Prof. T. S. Joshi" }
    ],
    divisions: [
      { id: "1", name: "Div 1", counselor: "Dr. V. M. Patel", cr: "Chirag Panchal", studentCount: 60 },
      { id: "2", name: "Div 2", counselor: "Prof. T. S. Joshi", cr: "Diya Patel", studentCount: 60 }
    ]
  },
  {
    id: "DEP_ME",
    code: "ME",
    name: "Mechanical Engineering",
    fullName: "Department of Mechanical Engineering",
    icon: "Cog",
    hod: "Dr. P. J. Shah",
    hodEmail: "pjshah@adit.ac.in",
    hodPhone: "+91 98250 89012",
    cabin: "Workshop Admin 101",
    established: "2000",
    totalStudents: 120,
    classrooms: ["ME-101", "ME-102"],
    labs: [
      { name: "CAD/CAM Lab", code: "CAD", room: "ME-Lab 1", pcs: 30, inCharge: "Dr. P. J. Shah" },
      { name: "Thermal Engineering Lab", code: "THL", room: "Workshop 2", pcs: 10, inCharge: "Prof. K. R. Dave" }
    ],
    divisions: [
      { id: "1", name: "Div 1", counselor: "Dr. P. J. Shah", cr: "Parth Solanki", studentCount: 60 },
      { id: "2", name: "Div 2", counselor: "Prof. K. R. Dave", cr: "Varun Chawla", studentCount: 60 }
    ]
  },
  {
    id: "DEP_CL",
    code: "CL",
    name: "Civil Engineering",
    fullName: "Department of Civil Engineering",
    icon: "Building",
    hod: "Dr. R. B. Dave",
    hodEmail: "rbdave@adit.ac.in",
    hodPhone: "+91 98250 90123",
    cabin: "Civil Block Room 101",
    established: "2003",
    totalStudents: 100,
    classrooms: ["CL-101", "CL-102"],
    labs: [
      { name: "Structural & Concrete Lab", code: "SCL", room: "Civil Lab 1", pcs: 15, inCharge: "Dr. R. B. Dave" },
      { name: "Surveying Lab", code: "SRV", room: "Field Station", pcs: 10, inCharge: "Prof. M. K. Vyas" }
    ],
    divisions: [
      { id: "1", name: "Div 1", counselor: "Dr. R. B. Dave", cr: "Yash Vaghela", studentCount: 50 },
      { id: "2", name: "Div 2", counselor: "Prof. M. K. Vyas", cr: "Tanya Kothari", studentCount: 50 }
    ]
  }
];
const DEFAULT_FACULTIES = [
  // AI & Data Science
  { id: "FAC_PS", name: "Prof. Priya Shah", dept: "AI & Data Science", designation: "Associate Professor", email: "priya.shah@adit.ac.in", phone: "9825011111", subjects: "DBMS, DS" },
  { id: "FAC_RP", name: "Prof. Rahul Patel", dept: "AI & Data Science", designation: "Assistant Professor", email: "rahul.patel@adit.ac.in", phone: "9825022222", subjects: "Mathematics" },
  { id: "FAC_AK", name: "Prof. A. Kumar", dept: "AI & Data Science", designation: "Assistant Professor", email: "a.kumar@adit.ac.in", phone: "9825033333", subjects: "Operating Systems" },
  { id: "FAC_SM", name: "Prof. Sneha Mehta", dept: "AI & Data Science", designation: "Associate Professor", email: "sneha.mehta@adit.ac.in", phone: "9825044444", subjects: "Computer Networks" },
  { id: "FAC_DT", name: "Prof. Dev Trivedi", dept: "AI & Data Science", designation: "Assistant Professor", email: "dev.trivedi@adit.ac.in", phone: "9825055555", subjects: "Python Programming" },
  { id: "FAC_NM", name: "Prof. Neha Modi", dept: "AI & Data Science", designation: "Assistant Professor", email: "neha.modi@adit.ac.in", phone: "9825066666", subjects: "Humanities" },
  { id: "FAC_RJ", name: "Prof. R. Jain", dept: "AI & Data Science", designation: "Assistant Professor", email: "r.jain@adit.ac.in", phone: "9825077777", subjects: "Data Analytics" },
  { id: "FAC_DJP", name: "Dr. Dinesh Prajapati", dept: "AI & Data Science", designation: "Associate Professor", email: "dinesh.prajapati@adit.ac.in", phone: "9825088888", subjects: "SNA, DWDM, NLP, BDA" },
  // Computer Engineering
  { id: "FAC01", name: "Prof. R. K. Patel", dept: "Computer Engineering", designation: "Associate Professor", email: "rkpatel@adit.ac.in", phone: "9825012345", subjects: "Data Structures" },
  { id: "FAC02", name: "Dr. S. M. Mehta", dept: "Computer Engineering", designation: "Professor & HOD", email: "smmehta@adit.ac.in", phone: "9825023456", subjects: "DBMS" },
  { id: "FAC03", name: "Prof. A. N. Shah", dept: "Computer Engineering", designation: "Assistant Professor", email: "anshah@adit.ac.in", phone: "9825034567", subjects: "Digital Logic" },
  { id: "FAC04", name: "Prof. P. V. Desai", dept: "Computer Engineering", designation: "Assistant Professor", email: "pvdesai@adit.ac.in", phone: "9825045678", subjects: "Discrete Mathematics" },
  // Information Technology
  { id: "FAC05", name: "Dr. H. K. Trivedi", dept: "Information Technology", designation: "Associate Professor", email: "hktrivedi@adit.ac.in", phone: "9825056789", subjects: "Object Oriented Programming" },
  { id: "FAC06", name: "Prof. M. B. Joshi", dept: "Information Technology", designation: "Assistant Professor", email: "mbjoshi@adit.ac.in", phone: "9825067890", subjects: "Web Technologies" }
];
const DEFAULT_ALLOCATIONS = {
  "SUB_DS": {
    subjectId: "SUB_DS",
    sem: "3rd Sem",
    dept: "Computer Engineering",
    divisionCount: 3,
    // 1, 2, or 3 divisions
    divisions: [
      { id: "1", name: "Div 1", facultyId: "FAC02", facultyName: "Dr. S. M. Mehta" },
      { id: "2", name: "Div 2", facultyId: "FAC03", facultyName: "Prof. A. N. Shah" },
      { id: "3", name: "Div 3", facultyId: "FAC01", facultyName: "Prof. R. K. Patel" }
    ]
  },
  "SUB01": {
    subjectId: "SUB01",
    sem: "3rd Sem",
    dept: "Computer Engineering",
    divisionCount: 2,
    divisions: [
      { id: "1", name: "Div 1", facultyId: "FAC02", facultyName: "Dr. S. M. Mehta" },
      { id: "2", name: "Div 2", facultyId: "FAC04", facultyName: "Prof. P. V. Desai" }
    ]
  }
};
const DEFAULT_SECURITY = {
  adminPin: "1234",
  pinProtected: true
};
const sanitizeInput = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
};
const getCollegeName = () => {
  return localStorage.getItem(STORAGE_KEYS.COLLEGE_NAME) || "G H Patel College of Engineering & Technology";
};
const setCollegeName = (name) => {
  localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, name);
  return name;
};
const getFacultyName = () => {
  return localStorage.getItem("adit_faculty_name") || "Prof. R. K. Patel";
};
const setFacultyName = (name) => {
  localStorage.setItem("adit_faculty_name", name);
  return name;
};
const DEFAULT_STUDENTS = [
  // Computer Engineering • Sem 3 • Div 3 (2026-27)
  { id: "S127", rollNo: "1", name: "Aarav Patel", enrollmentNo: "12502040501127", email: "aarav.patel@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S128", rollNo: "2", name: "Ananya Sharma", enrollmentNo: "12502040501128", email: "ananya.sharma@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S129", rollNo: "3", name: "Devansh Verma", enrollmentNo: "12502040501129", email: "devansh.verma@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S130", rollNo: "4", name: "Diyansh Joshi", enrollmentNo: "12502040501130", email: "diyansh.joshi@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S131", rollNo: "5", name: "Isha Mehta", enrollmentNo: "12502040501131", email: "isha.mehta@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S132", rollNo: "6", name: "Kabir Shah", enrollmentNo: "12502040501132", email: "kabir.shah@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S133", rollNo: "7", name: "Khushi Trivedi", enrollmentNo: "12502040501133", email: "khushi.trivedi@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S134", rollNo: "8", name: "Manav Desai", enrollmentNo: "12502040501134", email: "manav.desai@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S135", rollNo: "9", name: "Neha Bhatt", enrollmentNo: "12502040501135", email: "neha.bhatt@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S136", rollNo: "10", name: "Parth Solanki", enrollmentNo: "12502040501136", email: "parth.solanki@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S137", rollNo: "11", name: "Riya Rathod", enrollmentNo: "12502040501137", email: "riya.rathod@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S138", rollNo: "12", name: "Siddharth Dave", enrollmentNo: "12502040501138", email: "siddharth.dave@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S139", rollNo: "13", name: "Tanya Kothari", enrollmentNo: "12502040501139", email: "tanya.kothari@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S140", rollNo: "14", name: "Varun Chawla", enrollmentNo: "12502040501140", email: "varun.chawla@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S142", rollNo: "15", name: "Yash Vaghela", enrollmentNo: "12502040501142", email: "yash.vaghela@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S143", rollNo: "16", name: "Aayush Prajapati", enrollmentNo: "12502040501143", email: "aayush.p@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S144", rollNo: "17", name: "Bhumika Parmar", enrollmentNo: "12502040501144", email: "bhumika.p@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S145", rollNo: "18", name: "Chirag Panchal", enrollmentNo: "12502040501145", email: "chirag.p@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S146", rollNo: "19", name: "Diya Patel", enrollmentNo: "12502040501146", email: "diya.patel@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S147", rollNo: "20", name: "Harshil Soni", enrollmentNo: "12502040501147", email: "harshil.soni@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S148", rollNo: "21", name: "Jiya Shah", enrollmentNo: "12502040501148", email: "jiya.shah@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S149", rollNo: "22", name: "Karan Mistry", enrollmentNo: "12502040501149", email: "karan.mistry@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S150", rollNo: "23", name: "Meet Makwana", enrollmentNo: "12502040501150", email: "meet.makwana@adit.ac.in", classId: "CLASS_DEP_CP_3_3_2026-27", departmentId: "DEP_CP", department: "Computer Engineering", dept: "Computer", class: "3", division: "Div 3", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  // AI & Data Science • Sem 3 • Div 1 (2026-27) - Matching User Prompt Specification
  { id: "S_AI_01", rollNo: "1", name: "Student A", enrollmentNo: "24AD001", email: "student.a@adit.ac.in", classId: "CLASS_DEP_AI_3_1_2026-27", departmentId: "DEP_AI", department: "AI & Data Science", dept: "AI & Data Science", class: "1", division: "Div 1", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S_AI_02", rollNo: "2", name: "Student B", enrollmentNo: "24AD002", email: "student.b@adit.ac.in", classId: "CLASS_DEP_AI_3_1_2026-27", departmentId: "DEP_AI", department: "AI & Data Science", dept: "AI & Data Science", class: "1", division: "Div 1", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S_AI_03", rollNo: "3", name: "Student C", enrollmentNo: "24AD003", email: "student.c@adit.ac.in", classId: "CLASS_DEP_AI_3_1_2026-27", departmentId: "DEP_AI", department: "AI & Data Science", dept: "AI & Data Science", class: "1", division: "Div 1", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S_AI_04", rollNo: "4", name: "Dhwani Shah", enrollmentNo: "24AD004", email: "dhwani.shah@adit.ac.in", classId: "CLASS_DEP_AI_3_1_2026-27", departmentId: "DEP_AI", department: "AI & Data Science", dept: "AI & Data Science", class: "1", division: "Div 1", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S_AI_05", rollNo: "5", name: "Kavya Patel", enrollmentNo: "24AD005", email: "kavya.patel@adit.ac.in", classId: "CLASS_DEP_AI_3_1_2026-27", departmentId: "DEP_AI", department: "AI & Data Science", dept: "AI & Data Science", class: "1", division: "Div 1", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  { id: "S_AI_06", rollNo: "6", name: "Neel Mistry", enrollmentNo: "24AD006", email: "neel.mistry@adit.ac.in", classId: "CLASS_DEP_AI_3_1_2026-27", departmentId: "DEP_AI", department: "AI & Data Science", dept: "AI & Data Science", class: "1", division: "Div 1", sem: "3rd Sem", semester: "3rd Sem", academicYear: "2026-27" },
  // Information Technology • Sem 1 • Div 1 (2026-27) - Matching 1IT1 Timetable
  { id: "S_IT_01", rollNo: "1", name: "Omkar Trivedi", enrollmentNo: "24IT001", email: "omkar.t@adit.ac.in", classId: "CLASS_DEP_IT_1_1_2026-27", departmentId: "DEP_IT", department: "Information Technology", dept: "Information Technology", class: "1", division: "Div 1", sem: "1st Sem", semester: "1st Sem", academicYear: "2026-27" },
  { id: "S_IT_02", rollNo: "2", name: "Prachi Joshi", enrollmentNo: "24IT002", email: "prachi.j@adit.ac.in", classId: "CLASS_DEP_IT_1_1_2026-27", departmentId: "DEP_IT", department: "Information Technology", dept: "Information Technology", class: "1", division: "Div 1", sem: "1st Sem", semester: "1st Sem", academicYear: "2026-27" }
];
const DEFAULT_SUBJECTS = [
  // AI & Data Science
  { id: "SUB_AI_DBMS", code: "3130703", name: "Database Management Systems", shortName: "DBMS", faculty: "Prof. Priya Shah", credits: 4, sem: "3rd Sem", dept: "AI & Data Science", class: "1" },
  { id: "SUB_AI_DS", code: "3130702", name: "Data Structures", shortName: "DS", faculty: "Prof. Priya Shah", credits: 4, sem: "3rd Sem", dept: "AI & Data Science", class: "1" },
  { id: "SUB_AI_PY", code: "3130704", name: "Python Programming", shortName: "Python", faculty: "Prof. Dev Trivedi", credits: 3, sem: "3rd Sem", dept: "AI & Data Science", class: "1" },
  { id: "SUB_AI_MATH", code: "3130006", name: "Mathematics - III", shortName: "Mathematics", faculty: "Prof. Rahul Patel", credits: 4, sem: "3rd Sem", dept: "AI & Data Science", class: "1" },
  { id: "SUB_AI_OS", code: "3130705", name: "Operating Systems", shortName: "Operating Systems", faculty: "Prof. A. Kumar", credits: 4, sem: "3rd Sem", dept: "AI & Data Science", class: "1" },
  { id: "SUB_AI_CN", code: "3130706", name: "Computer Networks", shortName: "Computer Networks", faculty: "Prof. Sneha Mehta", credits: 4, sem: "3rd Sem", dept: "AI & Data Science", class: "1" },
  { id: "SUB_AI_SEM", code: "3130709", name: "Technical Seminar", shortName: "Seminar", faculty: "Prof. Priya Shah", credits: 2, sem: "3rd Sem", dept: "AI & Data Science", class: "1" },
  { id: "SUB_AI_DA", code: "3130708", name: "Data Analytics", shortName: "Data Analytics", faculty: "Prof. R. Jain", credits: 3, sem: "3rd Sem", dept: "AI & Data Science", class: "1" },
  { id: "SUB_AI_HUM", code: "3130008", name: "Humanities & Social Sciences", shortName: "Humanities", faculty: "Prof. Neha Modi", credits: 2, sem: "3rd Sem", dept: "AI & Data Science", class: "1" },
  // Computer Engineering
  { id: "SUB_DS", code: "102040304", name: "DATA STRUCTURES", shortName: "DS", faculty: "Prof. R. K. Patel", credits: 4, sem: "3rd Sem", dept: "Computer Engineering", class: "3", academicYear: "2026-27", term: "Odd" },
  { id: "SUB01", code: "102040301", name: "Database Management Systems", shortName: "DBMS", faculty: "Dr. S. M. Mehta", credits: 4, sem: "3rd Sem", dept: "Computer Engineering", class: "3", academicYear: "2026-27", term: "Odd" },
  { id: "SUB02", code: "102040302", name: "Digital Logic & Computer Design", shortName: "Digital Logic", faculty: "Prof. A. N. Shah", credits: 4, sem: "3rd Sem", dept: "Computer Engineering", class: "3", academicYear: "2026-27", term: "Odd" },
  { id: "SUB03", code: "102040303", name: "Discrete Mathematics", shortName: "Discrete Math", faculty: "Prof. P. V. Desai", credits: 3, sem: "3rd Sem", dept: "Computer Engineering", class: "3", academicYear: "2026-27", term: "Odd" },
  { id: "SUB04", code: "102040305", name: "Object Oriented Programming", shortName: "OOP", faculty: "Dr. H. K. Trivedi", credits: 4, sem: "3rd Sem", dept: "Computer Engineering", class: "3", academicYear: "2026-27", term: "Odd" }
];
const generateDSSessions = () => {
  const dates = [
    { date: "2026-07-06", topic: "Course Overview & Introduction to Data Structures" },
    { date: "2026-07-07", topic: "Linear vs Non-Linear Structures, Memory Layout" },
    { date: "2026-07-08", topic: "Array Representation & Multi-dimensional Addressing" },
    { date: "2026-07-09", topic: "Stack Abstract Data Type & Push/Pop Operations" },
    { date: "2026-07-13", topic: "Infix to Postfix Expression Evaluation" },
    { date: "2026-07-15", topic: "Queue ADT, Circular Queue Implementation" },
    { date: "2026-07-16", topic: "Double-ended Queue (Deque) & Priority Queues" },
    { date: "2026-07-20", topic: "Singly Linked List Insertion & Deletion" },
    { date: "2026-07-22", topic: "Doubly Linked List & Circular Linked Lists" },
    { date: "2026-07-23", topic: "Applications of Linked Lists: Polynomial Addition" },
    { date: "2026-07-27", topic: "Tree Terminology & Binary Tree Traversals" },
    { date: "2026-07-29", topic: "Binary Search Tree (BST) Operations & Searching" },
    { date: "2026-08-03", topic: "AVL Trees & Balancing Rotations (LL, RR, LR, RL)" },
    { date: "2026-08-05", topic: "B-Trees, B+ Trees & Disk Storage Optimization" },
    { date: "2026-08-06", topic: "Graph Representation: Adjacency Matrix & Lists" },
    { date: "2026-08-10", topic: "Breadth First Search (BFS) & Depth First Search (DFS)" },
    { date: "2026-08-13", topic: "Minimum Spanning Trees: Kruskals & Prims" },
    { date: "2026-08-17", topic: "Hashing Functions & Collision Resolution Techniques" },
    { date: "2026-08-19", topic: "Sorting Algorithms Comparison & Review" }
  ];
  const absentMap = {
    "S127": [],
    "S128": ["2026-07-22", "2026-08-17"],
    "S129": ["2026-07-15", "2026-07-22", "2026-07-23", "2026-08-17"],
    "S130": ["2026-07-15", "2026-07-23"],
    "S131": ["2026-07-15", "2026-07-23", "2026-08-05", "2026-08-17"],
    "S132": ["2026-07-22", "2026-08-17"],
    "S133": ["2026-07-08", "2026-07-27", "2026-08-03", "2026-08-10"],
    "S134": ["2026-07-20", "2026-08-13"],
    "S135": ["2026-07-09", "2026-08-17"],
    "S136": ["2026-07-06", "2026-07-07", "2026-07-08", "2026-07-23", "2026-07-29", "2026-08-05"],
    "S137": ["2026-07-22", "2026-07-27", "2026-08-13"],
    "S138": ["2026-07-16", "2026-07-23", "2026-07-27", "2026-08-03", "2026-08-17"],
    "S139": ["2026-07-15"],
    "S140": ["2026-07-06", "2026-07-07", "2026-07-08", "2026-07-22", "2026-07-27", "2026-08-06"],
    "S142": ["2026-07-16"],
    "S143": ["2026-07-08", "2026-08-17"],
    "S144": ["2026-07-20"],
    "S145": ["2026-08-13"],
    "S146": ["2026-07-06", "2026-07-07", "2026-07-08", "2026-07-20"],
    "S147": ["2026-07-22"],
    "S148": ["2026-07-20", "2026-08-05"],
    "S149": [],
    "S150": ["2026-08-17"]
  };
  const odMap = {
    "S131": ["2026-08-10"]
    // O* Duty Certificate on 10-08
  };
  return dates.map((d, index) => {
    const records = {};
    const remarks = {};
    DEFAULT_STUDENTS.forEach((student) => {
      const isAbsent = (absentMap[student.id] || []).includes(d.date);
      const isOD = (odMap[student.id] || []).includes(d.date);
      if (isOD) {
        records[student.id] = "od";
        remarks[student.id] = "Duty Certificate Approved";
      } else if (isAbsent) {
        records[student.id] = "absent";
        remarks[student.id] = "Absent";
      } else {
        records[student.id] = "present";
      }
    });
    return {
      id: `SESS_DS_${index + 1}`,
      date: d.date,
      subjectId: "SUB_DS",
      topic: d.topic,
      records,
      remarks,
      sem: "3rd Sem",
      class: "3",
      dept: "Computer"
    };
  });
};
const DEFAULT_SESSIONS = generateDSSessions();
const initializeStorage = () => {
  const currentSubjs = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  const currentStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!currentSubjs || !currentSubjs.includes("102040304") || !currentStudents || !currentStudents.includes("12502040501127")) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(DEFAULT_SECURITY));
    localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, "G H Patel College of Engineering & Technology");
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
  if (!existingFaculties || !existingFaculties.includes("FAC_PS")) {
    localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(DEFAULT_FACULTIES));
  } else if (!existingFaculties.includes("FAC_DJP")) {
    try {
      const facs = JSON.parse(existingFaculties);
      if (!facs.some((f) => f.id === "FAC_DJP" || f.name && f.name.includes("Dinesh"))) {
        facs.push({
          id: "FAC_DJP",
          name: "Dr. Dinesh Prajapati",
          dept: "AI & Data Science",
          designation: "Associate Professor",
          email: "dinesh.prajapati@adit.ac.in",
          phone: "9825088888",
          subjects: "SNA, DWDM, NLP, BDA"
        });
        localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(facs));
      }
    } catch (e) {
    }
  }
  const existingDepts = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
  if (!existingDepts || !existingDepts.includes("cabin") || !existingDepts.includes("AI & Data Science")) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
  }
  const existingSubjs = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  if (!existingSubjs || !existingSubjs.includes("SUB_AI_DBMS")) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ALLOCATIONS)) {
    localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(DEFAULT_ALLOCATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SECURITY)) {
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(DEFAULT_SECURITY));
  }
};
const verifyAdminPin = (inputPin) => {
  initializeStorage();
  const sec = JSON.parse(localStorage.getItem(STORAGE_KEYS.SECURITY) || JSON.stringify(DEFAULT_SECURITY));
  return String(inputPin) === String(sec.adminPin);
};
const updateAdminPin = (oldPin, newPin) => {
  if (!verifyAdminPin(oldPin)) return false;
  const sec = { adminPin: String(newPin), pinProtected: true };
  localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(sec));
  return true;
};
const AUTH_STORAGE_KEY = "adit_auth_session";
const ACTIVE_FACULTY_KEY = "adit_active_faculty_id";
const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};
const setCurrentUser = (user) => {
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
};
const logoutUser = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
const isAuthenticated = () => {
  return !!getCurrentUser();
};
const getUserRole = () => {
  const u = getCurrentUser();
  return u ? u.role : null;
};
const getActiveFacultyId = () => {
  const u = getCurrentUser();
  if (u && u.role === "faculty" && u.facultyId) {
    return u.facultyId;
  }
  return localStorage.getItem(ACTIVE_FACULTY_KEY) || "FAC_PS";
};
const setActiveFacultyId = (facId) => {
  localStorage.setItem(ACTIVE_FACULTY_KEY, facId);
  try {
    window.dispatchEvent(new CustomEvent("adit-active-faculty-changed", { detail: { facultyId: facId } }));
  } catch (e) {
  }
};
const getActiveFaculty = () => {
  const facId = getActiveFacultyId();
  const faculties = getFaculties();
  return faculties.find((f) => f.id === facId) || faculties[0] || null;
};
const loginUser = (identifier, password) => {
  if (!identifier || !password) {
    return { success: false, error: "Please enter both User ID / Email and Password." };
  }
  const cleanId = String(identifier).trim().toLowerCase();
  const cleanPass = String(password).trim();
  const sec = JSON.parse(localStorage.getItem(STORAGE_KEYS.SECURITY) || JSON.stringify(DEFAULT_SECURITY));
  const validAdminPin = String(sec.adminPin || "1234");
  if ((cleanId === "admin" || cleanId === "administrator" || cleanId === "admin@adit.ac.in") && (cleanPass === validAdminPin || cleanPass === "admin123" || cleanPass === "1234")) {
    const adminUser = {
      role: "admin",
      id: "admin",
      username: "admin",
      name: "System Administrator",
      email: "admin@adit.ac.in",
      loginTime: (/* @__PURE__ */ new Date()).toISOString()
    };
    setCurrentUser(adminUser);
    return { success: true, user: adminUser };
  }
  const faculties = getFaculties();
  const foundFaculty = faculties.find(
    (f) => f.id && f.id.toLowerCase() === cleanId || f.email && f.email.toLowerCase() === cleanId || f.name && f.name.toLowerCase() === cleanId
  );
  if (foundFaculty) {
    const expectedPassword = String(foundFaculty.password || "faculty123").trim();
    if (cleanPass === expectedPassword || cleanPass === "faculty123" || cleanPass === "1234") {
      const facultyUser = {
        role: "faculty",
        id: foundFaculty.id,
        facultyId: foundFaculty.id,
        name: foundFaculty.name,
        email: foundFaculty.email,
        dept: foundFaculty.dept,
        designation: foundFaculty.designation || "Faculty Member",
        phone: foundFaculty.phone || "",
        subjects: foundFaculty.subjects || "",
        loginTime: (/* @__PURE__ */ new Date()).toISOString()
      };
      setCurrentUser(facultyUser);
      setActiveFacultyId(foundFaculty.id);
      return { success: true, user: facultyUser };
    } else {
      return { success: false, error: "Incorrect password for this faculty account." };
    }
  }
  return { success: false, error: "Invalid User ID/Email or Password. Please check your credentials." };
};
const getClasses = () => {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
    return DEFAULT_CLASSES;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_CLASSES;
  }
};
const getClassById = (classId) => {
  if (!classId) return null;
  const classes = getClasses();
  return classes.find((c) => c.id === classId) || null;
};
const findClassByCriteria = (department, semester, division, academicYear = DEFAULT_ACADEMIC_YEAR) => {
  const classes = getClasses();
  const normSem = normalizeSem(semester);
  const normDiv = normalizeDiv(division);
  const normYear = (academicYear || DEFAULT_ACADEMIC_YEAR).trim();
  let targetDeptId = null;
  let targetDeptName = null;
  if (department) {
    const dStr = String(department).trim().toLowerCase();
    const depts = getDepartments();
    const found = depts.find(
      (d) => d.id.toLowerCase() === dStr || d.name.toLowerCase() === dStr || d.code.toLowerCase() === dStr || d.name.toLowerCase().includes(dStr) || dStr.includes(d.name.toLowerCase())
    );
    if (found) {
      targetDeptId = found.id;
      targetDeptName = found.name;
    } else {
      targetDeptName = department;
    }
  }
  return classes.find((c) => {
    const semMatch = normalizeSem(c.semester) === normSem;
    const divMatch = normalizeDiv(c.division) === normDiv;
    const yearMatch = !c.academicYear || c.academicYear === normYear;
    const deptMatch = !department || targetDeptId && c.departmentId === targetDeptId || targetDeptName && c.departmentName.toLowerCase().includes(targetDeptName.toLowerCase()) || c.departmentName.toLowerCase().includes(String(department).toLowerCase());
    return semMatch && divMatch && yearMatch && deptMatch;
  }) || null;
};
const getOrCreateClass = (department, semester, division, academicYear = DEFAULT_ACADEMIC_YEAR) => {
  const existing = findClassByCriteria(department, semester, division, academicYear);
  if (existing) return existing;
  const depts = getDepartments();
  let deptId = "DEP_AI";
  let deptName = "AI & Data Science";
  if (department) {
    const dStr = String(department).toLowerCase();
    const found = depts.find((d) => d.id.toLowerCase() === dStr || d.name.toLowerCase() === dStr || d.name.toLowerCase().includes(dStr));
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
    id: `CLASS_${deptId}_${normSem.replace(/[^0-9]/g, "")}_${normDiv.replace(/[^0-9]/g, "")}_${normYear.replace(/[^0-9]/g, "_")}`,
    departmentId: deptId,
    departmentName: deptName,
    semester: normSem,
    division: normDiv,
    academicYear: normYear,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "active"
  };
  saveClass(newClass);
  return newClass;
};
const saveClass = (classData) => {
  if (!classData.departmentName && !classData.departmentId) {
    throw new Error("Department is required to create a class.");
  }
  const normSem = normalizeSem(classData.semester || "3rd Sem");
  const normDiv = normalizeDiv(classData.division || "Div 1");
  const normYear = (classData.academicYear || DEFAULT_ACADEMIC_YEAR).trim();
  const depts = getDepartments();
  let deptId = classData.departmentId;
  let deptName = classData.departmentName;
  if (deptId && !deptName) {
    const f = depts.find((d) => d.id === deptId);
    if (f) deptName = f.name;
  } else if (!deptId && deptName) {
    const f = depts.find((d) => d.name.toLowerCase() === deptName.toLowerCase() || d.id === deptName);
    if (f) {
      deptId = f.id;
      deptName = f.name;
    }
  }
  if (!deptId) deptId = "DEP_AI";
  if (!deptName) deptName = "AI & Data Science";
  const classes = getClasses();
  const duplicate = classes.find(
    (c) => c.id !== classData.id && c.departmentId === deptId && normalizeSem(c.semester) === normSem && normalizeDiv(c.division) === normDiv && c.academicYear === normYear
  );
  if (duplicate) {
    throw new Error(`A class for ${deptName}, ${normSem}, ${normDiv} (${normYear}) already exists.`);
  }
  let savedClass;
  if (classData.id) {
    const idx = classes.findIndex((c) => c.id === classData.id);
    if (idx !== -1) {
      savedClass = {
        ...classes[idx],
        ...classData,
        departmentId: deptId,
        departmentName: deptName,
        semester: normSem,
        division: normDiv,
        academicYear: normYear,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      classes[idx] = savedClass;
      const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (rawStudents) {
        try {
          const stList = JSON.parse(rawStudents);
          let changed = false;
          stList.forEach((st) => {
            if (st.classId === savedClass.id) {
              st.departmentId = deptId;
              st.department = deptName;
              st.dept = deptName;
              st.semester = normSem;
              st.sem = normSem;
              st.division = normDiv;
              st.class = normDiv.replace(/[^0-9]/g, "") || "1";
              st.academicYear = normYear;
              changed = true;
            }
          });
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(stList));
          }
        } catch (e) {
        }
      }
    } else {
      savedClass = {
        ...classData,
        departmentId: deptId,
        departmentName: deptName,
        semester: normSem,
        division: normDiv,
        academicYear: normYear,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "active"
      };
      classes.push(savedClass);
    }
  } else {
    const newId = `CLASS_${deptId}_${normSem.replace(/[^0-9]/g, "")}_${normDiv.replace(/[^0-9]/g, "")}_${normYear.replace(/[^0-9]/g, "_")}_${Date.now().toString().slice(-4)}`;
    savedClass = {
      ...classData,
      id: newId,
      departmentId: deptId,
      departmentName: deptName,
      semester: normSem,
      division: normDiv,
      academicYear: normYear,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "active"
    };
    classes.push(savedClass);
  }
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  return { success: true, class: savedClass, classes };
};
const deleteClass = (classId, deleteStudents = false) => {
  const classes = getClasses().filter((c) => c.id !== classId);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  const students = getStudents();
  if (deleteStudents) {
    const remaining = students.filter((s) => s.classId !== classId);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(remaining));
  } else {
    students.forEach((s) => {
      if (s.classId === classId) {
        s.classId = null;
      }
    });
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }
  return classes;
};
const getStudents = () => {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  let students = [];
  try {
    students = JSON.parse(raw || "[]");
  } catch (e) {
    students = DEFAULT_STUDENTS;
  }
  let modified = false;
  students.forEach((st) => {
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
const getStudentsByClassId = (classId) => {
  if (!classId) return [];
  const all = getStudents();
  return all.filter((s) => s.classId === classId).sort((a, b) => {
    const rA = parseInt(a.rollNo, 10);
    const rB = parseInt(b.rollNo, 10);
    if (!isNaN(rA) && !isNaN(rB)) return rA - rB;
    return String(a.rollNo || "").localeCompare(String(b.rollNo || ""));
  });
};
const getStudentsForClassCriteria = (dept, sem, div, academicYear = DEFAULT_ACADEMIC_YEAR) => {
  const cls = findClassByCriteria(dept, sem, div, academicYear);
  if (cls) {
    return getStudentsByClassId(cls.id);
  }
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);
  return getStudents().filter((s) => {
    const sSem = normalizeSem(s.semester || s.sem);
    const sDiv = normalizeDiv(s.division || s.class);
    const sDept = String(s.department || s.dept || "").toLowerCase();
    const targetDept = String(dept || "").toLowerCase();
    return sSem === normSem && sDiv === normDiv && (!dept || sDept.includes(targetDept) || targetDept.includes(sDept));
  });
};
const checkStudentEnrollment = (enrollmentNo, targetClassId = null, currentStudentId = null) => {
  if (!enrollmentNo) return { exists: false };
  const cleanEnr = String(enrollmentNo).trim().toLowerCase();
  const allStudents = getStudents();
  const classes = getClasses();
  const found = allStudents.find(
    (s) => s.id !== currentStudentId && String(s.enrollmentNo || "").trim().toLowerCase() === cleanEnr
  );
  if (!found) {
    return { exists: false };
  }
  const studentClass = classes.find((c) => c.id === found.classId);
  const inSameClass = targetClassId && found.classId === targetClassId;
  return {
    exists: true,
    inSameClass,
    existingStudent: found,
    currentClass: studentClass || null,
    currentClassName: studentClass ? `${studentClass.departmentName} \u2022 ${studentClass.semester} \u2022 ${studentClass.division} (${studentClass.academicYear})` : `${found.department || found.dept || "Unknown"} ${found.semester || found.sem || ""}`
  };
};
const saveStudent = (studentData) => {
  if (!studentData.name || !String(studentData.name).trim()) {
    throw new Error("Student name is required.");
  }
  if (!studentData.enrollmentNo || !String(studentData.enrollmentNo).trim()) {
    throw new Error("Enrollment number is required.");
  }
  const students = getStudents();
  const cleanEnr = String(studentData.enrollmentNo).trim();
  const check = checkStudentEnrollment(cleanEnr, studentData.classId, studentData.id);
  if (check.exists) {
    if (check.inSameClass) {
      throw new Error("Student with this enrollment number already exists in this class.");
    } else {
      throw new Error(`Student with Enrollment Number "${cleanEnr}" is already enrolled in ${check.currentClassName}.`);
    }
  }
  let resolvedClass = null;
  if (studentData.classId) {
    resolvedClass = getClassById(studentData.classId);
  }
  const dept = resolvedClass ? resolvedClass.departmentName : studentData.department || studentData.dept || "AI & Data Science";
  const sem = resolvedClass ? resolvedClass.semester : normalizeSem(studentData.semester || studentData.sem || "3rd Sem");
  const div = resolvedClass ? resolvedClass.division : normalizeDiv(studentData.division || studentData.class || "Div 1");
  const year = resolvedClass ? resolvedClass.academicYear : studentData.academicYear || DEFAULT_ACADEMIC_YEAR;
  let saved;
  if (studentData.id) {
    const idx = students.findIndex((s) => s.id === studentData.id);
    if (idx !== -1) {
      saved = {
        ...students[idx],
        ...studentData,
        enrollmentNo: cleanEnr,
        name: String(studentData.name).trim(),
        rollNo: String(studentData.rollNo || students[idx].rollNo || ""),
        email: studentData.email ? String(studentData.email).trim() : "",
        department: dept,
        dept,
        semester: sem,
        sem,
        division: div,
        class: div.replace(/[^0-9]/g, "") || "1",
        academicYear: year,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      students[idx] = saved;
    } else {
      saved = {
        ...studentData,
        enrollmentNo: cleanEnr,
        name: String(studentData.name).trim(),
        department: dept,
        dept,
        semester: sem,
        sem,
        division: div,
        class: div.replace(/[^0-9]/g, "") || "1",
        academicYear: year,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      students.push(saved);
    }
  } else {
    const newId = "S_" + Date.now().toString().slice(-6) + "_" + Math.random().toString(36).substr(2, 3);
    saved = {
      ...studentData,
      id: newId,
      enrollmentNo: cleanEnr,
      name: String(studentData.name).trim(),
      rollNo: String(studentData.rollNo || students.length + 1),
      email: studentData.email ? String(studentData.email).trim() : "",
      classId: studentData.classId || (resolvedClass ? resolvedClass.id : null),
      department: dept,
      dept,
      semester: sem,
      sem,
      division: div,
      class: div.replace(/[^0-9]/g, "") || "1",
      academicYear: year,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    students.push(saved);
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return students;
};
const moveStudentToClass = (studentId, targetClassId) => {
  const students = getStudents();
  const classes = getClasses();
  const student = students.find((s) => s.id === studentId);
  if (!student) throw new Error("Student not found.");
  const targetClass = classes.find((c) => c.id === targetClassId);
  if (!targetClass) throw new Error("Target class not found.");
  student.classId = targetClass.id;
  student.departmentId = targetClass.departmentId;
  student.department = targetClass.departmentName;
  student.dept = targetClass.departmentName;
  student.semester = targetClass.semester;
  student.sem = targetClass.semester;
  student.division = targetClass.division;
  student.class = targetClass.division.replace(/[^0-9]/g, "") || "1";
  student.academicYear = targetClass.academicYear;
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return { success: true, student, students };
};
const bulkImportStudentsToClass = (classId, studentRows, options = { moveExisting: false }) => {
  const classes = getClasses();
  const targetClass = classes.find((c) => c.id === classId);
  if (!targetClass) throw new Error("Selected class does not exist.");
  const students = getStudents();
  let importedCount = 0;
  let movedCount = 0;
  let updatedCount = 0;
  const errors = [];
  studentRows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const name = String(row.name || "").trim();
    const enrollmentNo = String(row.enrollmentNo || "").trim();
    const rollNo = String(row.rollNo || "").trim();
    const email = String(row.email || "").trim();
    if (!name || !enrollmentNo) {
      errors.push(`Row ${rowNum}: Name and Enrollment Number are required.`);
      return;
    }
    const check = checkStudentEnrollment(enrollmentNo, classId);
    if (check.exists) {
      if (check.inSameClass) {
        const existingIdx = students.findIndex((s) => s.id === check.existingStudent.id);
        if (existingIdx !== -1) {
          students[existingIdx].name = name;
          if (rollNo) students[existingIdx].rollNo = rollNo;
          if (email) students[existingIdx].email = email;
          updatedCount++;
        }
      } else {
        if (options.moveExisting) {
          const existingIdx = students.findIndex((s) => s.id === check.existingStudent.id);
          if (existingIdx !== -1) {
            students[existingIdx].classId = targetClass.id;
            students[existingIdx].departmentId = targetClass.departmentId;
            students[existingIdx].department = targetClass.departmentName;
            students[existingIdx].dept = targetClass.departmentName;
            students[existingIdx].semester = targetClass.semester;
            students[existingIdx].sem = targetClass.semester;
            students[existingIdx].division = targetClass.division;
            students[existingIdx].class = targetClass.division.replace(/[^0-9]/g, "") || "1";
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
      const currentClassStudents = students.filter((s) => s.classId === classId);
      const newStudent = {
        id: "S_" + Date.now().toString().slice(-6) + "_" + Math.random().toString(36).substr(2, 4),
        name,
        enrollmentNo,
        rollNo: rollNo || String(currentClassStudents.length + importedCount + 1),
        email: email || "",
        classId: targetClass.id,
        departmentId: targetClass.departmentId,
        department: targetClass.departmentName,
        dept: targetClass.departmentName,
        semester: targetClass.semester,
        sem: targetClass.semester,
        division: targetClass.division,
        class: targetClass.division.replace(/[^0-9]/g, "") || "1",
        academicYear: targetClass.academicYear,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
const deleteStudent = (studentId) => {
  const students = getStudents().filter((s) => s.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return students;
};
const removeStudentFromClass = (studentId, classId = null) => {
  const students = getStudents();
  const student = students.find((s) => s.id === studentId);
  if (!student) return students;
  if (!classId || student.classId === classId) {
    student.classId = null;
    student.division = null;
    student.class = null;
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return students;
};
const getSubjects = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || "[]");
};
const saveSubject = (subject) => {
  const subjects = getSubjects();
  if (subject.id) {
    const idx = subjects.findIndex((s) => s.id === subject.id);
    if (idx !== -1) subjects[idx] = subject;
  } else {
    subject.id = "SUB" + String(Date.now()).slice(-3);
    subjects.push(subject);
  }
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  return subjects;
};
const deleteSubject = (subjectId) => {
  const subjects = getSubjects().filter((s) => s.id !== subjectId);
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  return subjects;
};
const getSessions = () => {
  initializeStorage();
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || "[]");
  return sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
};
const getLastSubjectDates = (subjectId) => {
  const sessions = getSessions().filter((s) => s.subjectId === subjectId);
  return sessions.slice(-4).map((s) => {
    const parts = s.date.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}`;
    }
    return s.date;
  });
};
const saveSession = (session) => {
  const sessions = getSessions();
  if (session.id) {
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx !== -1) {
      sessions[idx] = { ...sessions[idx], ...session };
    } else {
      sessions.push(session);
    }
  } else {
    session.id = "SESS_" + Date.now();
    sessions.push(session);
  }
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  return sessions;
};
const deleteSession = (sessionId) => {
  const sessions = getSessions().filter((s) => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  return sessions;
};
const resetToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
  localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(DEFAULT_SECURITY));
  localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, "G H Patel College of Engineering & Technology");
  return {
    classes: DEFAULT_CLASSES,
    students: DEFAULT_STUDENTS,
    subjects: DEFAULT_SUBJECTS,
    sessions: DEFAULT_SESSIONS
  };
};
const calculateAnalytics = (targetSubjectId = null) => {
  const students = getStudents();
  const subjects = getSubjects();
  let sessions = getSessions();
  if (targetSubjectId && targetSubjectId !== "ALL") {
    sessions = sessions.filter((s) => s.subjectId === targetSubjectId);
  }
  const totalSessions = sessions.length;
  if (totalSessions === 0) {
    return {
      overallPercentage: 0,
      totalSessions: 0,
      totalStudents: students.length,
      studentStats: [],
      subjectStats: [],
      lowAttendanceCount: 0
    };
  }
  const studentStats = students.map((student) => {
    let attended = 0;
    let totalAssigned = 0;
    let odCount = 0;
    sessions.forEach((sess) => {
      if (sess.records && sess.records[student.id] !== void 0) {
        totalAssigned++;
        const status = sess.records[student.id];
        if (status === "present") attended += 1;
        else if (status === "late") attended += 0.8;
        else if (status === "od") odCount += 1;
      }
    });
    const percentage = totalAssigned > 0 ? (attended / totalAssigned * 100).toFixed(2) : "0.00";
    const percentageDC = totalAssigned > 0 ? (odCount / totalAssigned * 100).toFixed(2) : "0.00";
    return {
      ...student,
      attended,
      odCount,
      totalAssigned,
      percentage: parseFloat(percentage),
      percentageDC: parseFloat(percentageDC),
      status: parseFloat(percentage) >= 75 ? "good" : "warning"
    };
  });
  const sumPct = studentStats.reduce((acc, curr) => acc + curr.percentage, 0);
  const overallPercentage = studentStats.length > 0 ? (sumPct / studentStats.length).toFixed(2) : "0.00";
  const subjectStats = subjects.map((subj) => {
    const subjSessions = sessions.filter((s) => s.subjectId === subj.id);
    let totalPresent = 0;
    let totalPossible = 0;
    subjSessions.forEach((sess) => {
      Object.values(sess.records || {}).forEach((status) => {
        totalPossible++;
        if (status === "present") totalPresent += 1;
        else if (status === "late") totalPresent += 0.8;
      });
    });
    const pct = totalPossible > 0 ? (totalPresent / totalPossible * 100).toFixed(2) : "0.00";
    return {
      ...subj,
      sessionCount: subjSessions.length,
      percentage: parseFloat(pct)
    };
  });
  const lowAttendanceCount = studentStats.filter((s) => s.percentage < 75).length;
  return {
    overallPercentage: parseFloat(overallPercentage),
    totalSessions,
    totalStudents: students.length,
    studentStats,
    subjectStats,
    lowAttendanceCount
  };
};
const getFaculties = () => {
  initializeStorage();
  const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTIES) || JSON.stringify(DEFAULT_FACULTIES));
  return list.map((f) => ({
    ...f,
    password: f.password || "faculty123"
  }));
};
const saveFaculty = (faculty) => {
  const faculties = getFaculties();
  if (faculty.id) {
    const idx = faculties.findIndex((f) => f.id === faculty.id);
    if (idx !== -1) faculties[idx] = faculty;
    else faculties.push(faculty);
  } else {
    faculty.id = "FAC_" + Date.now().toString().slice(-4);
    faculties.push(faculty);
  }
  localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(faculties));
  return faculties;
};
const deleteFaculty = (facultyId) => {
  const faculties = getFaculties().filter((f) => f.id !== facultyId);
  localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(faculties));
  return faculties;
};
const getDepartments = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || JSON.stringify(DEFAULT_DEPARTMENTS));
};
const saveDepartment = (dept) => {
  const depts = getDepartments();
  if (dept.id) {
    const idx = depts.findIndex((d) => d.id === dept.id);
    if (idx !== -1) depts[idx] = dept;
    else depts.push(dept);
  } else {
    dept.id = "DEP_" + Date.now().toString().slice(-4);
    depts.push(dept);
  }
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  return depts;
};
const deleteDepartment = (deptId) => {
  const depts = getDepartments().filter((d) => d.id !== deptId);
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  return depts;
};
const getAllocations = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALLOCATIONS) || JSON.stringify(DEFAULT_ALLOCATIONS));
};
const getAllocationForSubject = (subjectId) => {
  const all = getAllocations();
  if (all[subjectId]) return all[subjectId];
  return {
    subjectId,
    divisionCount: 1,
    divisions: [
      { id: "1", name: "Div 1", facultyId: "FAC01", facultyName: "Prof. R. K. Patel" }
    ]
  };
};
const saveSubjectAllocation = (subjectId, allocData) => {
  const all = getAllocations();
  all[subjectId] = {
    ...all[subjectId],
    ...allocData,
    subjectId
  };
  localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(all));
  return all[subjectId];
};
const assignStudentDivision = (studentId, newDivision) => {
  const students = getStudents();
  const idx = students.findIndex((s) => s.id === studentId);
  if (idx !== -1) {
    students[idx].class = String(newDivision);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }
  return students;
};
const bulkImportStudents = (newStudentsList, sem, dept, division) => {
  const students = getStudents();
  newStudentsList.forEach((st, i) => {
    const newId = "S_" + Date.now() + "_" + i;
    students.push({
      id: newId,
      rollNo: String(st.rollNo || students.length + 1),
      name: String(st.name || "Student"),
      enrollmentNo: String(st.enrollmentNo || `1250204050${Date.now().toString().slice(-4)}`),
      dept: dept || "Computer",
      sem: sem || "3rd Sem",
      class: String(division || "1")
    });
  });
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return students;
};
const TT_STORAGE_KEYS = {
  TIMETABLE: "adit_attendance_timetable",
  TIMETABLE_ENTRIES: "adit_timetable_entries",
  UPLOADED_FILE_INFO: "adit_timetable_file_info"
};
const TIME_SLOTS = [
  "9:00 - 9:55",
  "10:00 - 10:50",
  "10:55 - 11:45",
  "11:50 - 12:40",
  "12:40 - 1:25",
  // LUNCH BREAK
  "1:25 - 2:15",
  "2:20 - 3:10",
  "3:15 - 4:05",
  "4:10 - 5:00"
];
const TIMETABLE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const getSubjectColor = (subjectNameOrCode) => {
  if (!subjectNameOrCode) return "blue";
  const s = String(subjectNameOrCode).toLowerCase();
  if (s.includes("dbms") || s.includes("database")) return "purple";
  if (s.includes("ds") || s.includes("data structure")) return "green";
  if (s.includes("python") || s.includes("py")) return "coral";
  if (s.includes("math")) return "amber";
  if (s.includes("os") || s.includes("operating")) return "indigo";
  if (s.includes("network") || s.includes("cn")) return "cyan";
  if (s.includes("sna")) return "cyan";
  if (s.includes("bda")) return "purple";
  if (s.includes("nlp")) return "emerald";
  if (s.includes("dwdm")) return "coral";
  if (s.includes("ase")) return "indigo";
  if (s.includes("seminar")) return "blue";
  if (s.includes("analytic") || s.includes("ml")) return "emerald";
  if (s.includes("humanities") || s.includes("ethics")) return "slate";
  return "blue";
};
const getClassKey = (sem, div) => {
  return `${normalizeSem(sem)}_${normalizeDiv(div)}`;
};
const generateId = () => "tte_" + Math.random().toString(36).substring(2, 11);
const getTimetableEntries = () => {
  if (typeof localStorage === "undefined") return [];
  const data = localStorage.getItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  const seed = getSeedEntries();
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(seed));
  return seed;
};
const saveTimetableEntry = (entry) => {
  const entries = getTimetableEntries();
  if (!entry.id) entry.id = generateId();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx !== -1) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
  return entry;
};
const deleteTimetableEntry = (id) => {
  let entries = getTimetableEntries();
  entries = entries.filter((e) => e.id !== id);
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
};
const clearAllEntries = () => {
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify([]));
  notifyTimetableSync();
};
const getEntriesByFaculty = (facultyId) => {
  return getTimetableEntries().filter((e) => e.facultyId === facultyId);
};
const getEntriesByClass = (deptId, semId, divId) => {
  return getTimetableEntries().filter((e) => {
    const semMatch = normalizeSem(e.semId || e.sem) === normalizeSem(semId);
    const divMatch = normalizeDiv(e.divId || e.div) === normalizeDiv(divId);
    const deptMatch = !deptId || !e.departmentId || e.departmentId === deptId;
    return semMatch && divMatch && deptMatch;
  });
};
const getEntriesByDept = (deptId) => {
  return getTimetableEntries().filter((e) => e.departmentId === deptId);
};
const replaceFacultyInEntries = (oldFacultyId, newFacultyId, newFacultyName) => {
  let entries = getTimetableEntries();
  let changed = false;
  entries.forEach((e) => {
    if (e.facultyId === oldFacultyId) {
      e.facultyId = newFacultyId;
      e.facultyName = newFacultyName;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
  }
};
const updateFacultyNameInEntries = (facultyId, newName) => {
  let entries = getTimetableEntries();
  let changed = false;
  entries.forEach((e) => {
    if (e.facultyId === facultyId) {
      e.facultyName = newName;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
  }
};
const updateSubjectInEntries = (subjectId, updates) => {
  let entries = getTimetableEntries();
  let changed = false;
  entries.forEach((e) => {
    if (e.subjectId === subjectId) {
      if (updates.name) e.subjectFullName = updates.name;
      if (updates.shortName) e.subjectName = updates.shortName;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
  }
};
const deleteEntriesForFaculty = (facultyId) => {
  let entries = getTimetableEntries();
  const filtered = entries.filter((e) => e.facultyId !== facultyId);
  if (filtered.length !== entries.length) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  }
};
const deleteEntriesForSubject = (subjectId) => {
  let entries = getTimetableEntries();
  const filtered = entries.filter((e) => e.subjectId !== subjectId);
  if (filtered.length !== entries.length) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  }
};
const checkConflicts = (entry, excludeId = null) => {
  const entries = getTimetableEntries();
  const conflicts = [];
  entries.forEach((e) => {
    if (excludeId && e.id === excludeId) return;
    if (e.day !== entry.day || e.timeSlot !== entry.timeSlot) return;
    if (e.facultyId && entry.facultyId && e.facultyId === entry.facultyId) {
      conflicts.push(`Faculty ${e.facultyName} is already teaching ${e.subjectName} in ${e.room} at this time.`);
    }
    if (e.sem && e.div && entry.sem && entry.div && normalizeSem(e.sem) === normalizeSem(entry.sem) && normalizeDiv(e.div) === normalizeDiv(entry.div)) {
      conflicts.push(`Class ${normalizeSem(entry.sem)} ${normalizeDiv(entry.div)} already has ${e.subjectName} at this time.`);
    }
    if (e.room === entry.room && entry.room && entry.room !== "TBD") {
      conflicts.push(`Room ${e.room} is already booked for ${e.subjectName} by ${e.facultyName}.`);
    }
  });
  return conflicts;
};
const notifyTimetableSync = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("adit-timetable-synced"));
  }
};
const convertEntriesToGrid = (entries) => {
  const grid = {};
  TIMETABLE_DAYS.forEach((day) => {
    grid[day] = {};
  });
  entries.forEach((e) => {
    if (!grid[e.day]) grid[e.day] = {};
    grid[e.day][e.timeSlot] = {
      ...e,
      // Compatibility aliases: UI uses 'subject'/'name', entries store 'subjectName'/'subjectFullName'
      subject: e.subject || e.subjectName || e.subjectId || "",
      name: e.name || e.subjectFullName || e.subjectName || "",
      sem: e.semId || e.sem,
      div: e.divId || e.div
    };
  });
  return grid;
};
const calculateTimetableSummary = (timetableGrid) => {
  if (!timetableGrid) return { subjectCount: 0, totalLectures: 0, activeDays: 0, uniqueSubjects: [], facultyCount: 0 };
  const subjectsSet = /* @__PURE__ */ new Set();
  const facultySet = /* @__PURE__ */ new Set();
  let totalLectures = 0;
  let activeDaysCount = 0;
  TIMETABLE_DAYS.forEach((day) => {
    const daySlots = timetableGrid[day] || {};
    const slotsCount = Object.keys(daySlots).length;
    if (slotsCount > 0) activeDaysCount++;
    Object.values(daySlots).forEach((slot) => {
      if (slot && slot.subjectName) {
        totalLectures++;
        subjectsSet.add(slot.subjectName);
        if (slot.facultyId || slot.facultyName) {
          facultySet.add(slot.facultyId || slot.facultyName);
        }
      } else if (slot && slot.subject) {
        totalLectures++;
        subjectsSet.add(slot.subject);
        if (slot.facultyId || slot.facultyName) {
          facultySet.add(slot.facultyId || slot.facultyName);
        }
      }
    });
  });
  return {
    subjectCount: subjectsSet.size,
    totalLectures,
    activeDays: activeDaysCount,
    uniqueSubjects: Array.from(subjectsSet),
    facultyCount: facultySet.size
  };
};
const resetFacultyTimetablesToDefault = () => {
  const seed = getSeedEntries();
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(seed));
  notifyTimetableSync();
};
const resetAllTimetablesToDefault = resetFacultyTimetablesToDefault;
const DEFAULT_FACULTY_TIMETABLES = {
  "FAC_PS": {
    Monday: {
      "9:00 - 9:55": { subject: "DBMS", name: "Database Management Systems", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "purple", type: "Lecture" },
      "10:55 - 11:45": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 2", room: "Room 204", color: "green", type: "Lecture" }
    },
    Tuesday: {
      "9:00 - 9:55": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 1", room: "Room 202", color: "green", type: "Lecture" },
      "11:50 - 12:40": { subject: "DBMS", name: "Database Management Systems", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "purple", type: "Lecture" },
      "2:20 - 3:10": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 2", room: "Room 203", color: "coral", type: "Lab" }
    },
    Wednesday: {
      "10:00 - 10:50": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 1", room: "Room 203", color: "coral", type: "Lecture" },
      "1:25 - 2:15": { subject: "Seminar", name: "Technical Seminar", sem: "3rd Sem", div: "Div 1", room: "Room 301", color: "blue", type: "Seminar" }
    },
    Thursday: {
      "9:00 - 9:55": { subject: "DBMS", name: "Database Management Systems", sem: "3rd Sem", div: "Div 2", room: "Room 205", color: "purple", type: "Lecture" },
      "10:55 - 11:45": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 1", room: "Room 202", color: "green", type: "Lecture" },
      "3:15 - 4:05": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 1", room: "Room 203", color: "coral", type: "Lab" }
    },
    Friday: {
      "10:00 - 10:50": { subject: "DBMS", name: "Database Management Systems", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "purple", type: "Lecture" }
    },
    Saturday: {}
  },
  "FAC_RP": {
    Monday: {
      "10:00 - 10:50": { subject: "Maths-III", name: "Mathematics - III", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "amber", type: "Lecture" },
      "11:50 - 12:40": { subject: "Maths-III", name: "Mathematics - III", sem: "3rd Sem", div: "Div 2", room: "Room 202", color: "amber", type: "Lecture" }
    },
    Tuesday: {
      "10:00 - 10:50": { subject: "Maths-III", name: "Mathematics - III", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "amber", type: "Lecture" }
    },
    Wednesday: {
      "9:00 - 9:55": { subject: "Maths-III", name: "Mathematics - III", sem: "3rd Sem", div: "Div 2", room: "Room 202", color: "amber", type: "Lecture" },
      "11:50 - 12:40": { subject: "Maths-III", name: "Mathematics - III", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "amber", type: "Lecture" }
    },
    Thursday: {
      "1:25 - 2:15": { subject: "Tutorial", name: "Maths Tutorial", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "amber", type: "Tutorial" }
    },
    Friday: {
      "9:00 - 9:55": { subject: "Maths-III", name: "Mathematics - III", sem: "3rd Sem", div: "Div 2", room: "Room 202", color: "amber", type: "Lecture" }
    },
    Saturday: {}
  },
  "FAC_AK": {
    Monday: {
      "1:25 - 2:15": { subject: "OS", name: "Operating Systems", sem: "3rd Sem", div: "Div 1", room: "Room 202", color: "indigo", type: "Lecture" }
    },
    Tuesday: {
      "10:55 - 11:45": { subject: "OS", name: "Operating Systems", sem: "3rd Sem", div: "Div 1", room: "Room 202", color: "indigo", type: "Lecture" },
      "2:20 - 3:10": { subject: "OS Lab", name: "OS Lab", sem: "3rd Sem", div: "Div 1", room: "OS Lab 1", color: "indigo", type: "Lab" }
    },
    Wednesday: {
      "2:20 - 3:10": { subject: "OS", name: "Operating Systems", sem: "3rd Sem", div: "Div 2", room: "Room 204", color: "indigo", type: "Lecture" }
    },
    Thursday: {
      "11:50 - 12:40": { subject: "OS", name: "Operating Systems", sem: "3rd Sem", div: "Div 1", room: "Room 202", color: "indigo", type: "Lecture" }
    },
    Friday: {
      "10:55 - 11:45": { subject: "OS", name: "Operating Systems", sem: "3rd Sem", div: "Div 2", room: "Room 204", color: "indigo", type: "Lecture" }
    },
    Saturday: {}
  },
  "FAC_SM": {
    Monday: {
      "11:50 - 12:40": { subject: "CN", name: "Computer Networks", sem: "3rd Sem", div: "Div 1", room: "Room 204", color: "cyan", type: "Lecture" }
    },
    Tuesday: {
      "1:25 - 2:15": { subject: "CN", name: "Computer Networks", sem: "3rd Sem", div: "Div 1", room: "Room 204", color: "cyan", type: "Lecture" }
    },
    Wednesday: {
      "10:55 - 11:45": { subject: "CN", name: "Computer Networks", sem: "3rd Sem", div: "Div 2", room: "Room 205", color: "cyan", type: "Lecture" },
      "3:15 - 4:05": { subject: "CN Lab", name: "CN Lab", sem: "3rd Sem", div: "Div 1", room: "Network Lab", color: "cyan", type: "Lab" }
    },
    Thursday: {
      "2:20 - 3:10": { subject: "CN", name: "Computer Networks", sem: "3rd Sem", div: "Div 1", room: "Room 204", color: "cyan", type: "Lecture" }
    },
    Friday: {
      "11:50 - 12:40": { subject: "CN", name: "Computer Networks", sem: "3rd Sem", div: "Div 2", room: "Room 205", color: "cyan", type: "Lecture" }
    },
    Saturday: {}
  },
  "FAC_DT": {
    Monday: {
      "2:20 - 3:10": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 1", room: "Room 203", color: "coral", type: "Lecture" },
      "3:15 - 4:05": { subject: "Python Lab", name: "Python Lab", sem: "3rd Sem", div: "Div 1", room: "Comp Lab 2", color: "coral", type: "Lab" }
    },
    Tuesday: {
      "3:15 - 4:05": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 2", room: "Room 203", color: "coral", type: "Lecture" }
    },
    Wednesday: {
      "9:00 - 9:55": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 1", room: "Room 203", color: "coral", type: "Lecture" }
    },
    Thursday: {
      "1:25 - 2:15": { subject: "Python Lab", name: "Python Lab", sem: "3rd Sem", div: "Div 2", room: "Comp Lab 2", color: "coral", type: "Lab" }
    },
    Friday: {
      "1:25 - 2:15": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 1", room: "Room 203", color: "coral", type: "Lecture" }
    },
    Saturday: {}
  },
  "FAC01": {
    Monday: {
      "9:00 - 9:55": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 3", room: "Room 301", color: "green", type: "Lecture" },
      "10:55 - 11:45": { subject: "DS Lab", name: "DS Lab", sem: "3rd Sem", div: "Div 3", room: "DS Lab 1", color: "green", type: "Lab" }
    },
    Tuesday: {
      "9:00 - 9:55": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 3", room: "Room 301", color: "green", type: "Lecture" }
    },
    Wednesday: {
      "10:00 - 10:50": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 3", room: "Room 301", color: "green", type: "Lecture" }
    },
    Thursday: {
      "9:00 - 9:55": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 3", room: "Room 301", color: "green", type: "Lecture" },
      "1:25 - 2:15": { subject: "DS Lab", name: "DS Lab", sem: "3rd Sem", div: "Div 3", room: "DS Lab 1", color: "green", type: "Lab" }
    },
    Friday: {
      "10:00 - 10:50": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 3", room: "Room 301", color: "green", type: "Lecture" }
    },
    Saturday: {}
  },
  "FAC02": {
    Monday: {
      "9:00 - 9:55": { subject: "DBMS", name: "Database Management Systems", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "purple", type: "Lecture" },
      "10:55 - 11:45": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 2", room: "Room 204", color: "green", type: "Lecture" }
    },
    Tuesday: {
      "9:00 - 9:55": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 1", room: "Room 202", color: "green", type: "Lecture" },
      "11:50 - 12:40": { subject: "DBMS", name: "Database Management Systems", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "purple", type: "Lecture" },
      "2:20 - 3:10": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 2", room: "Room 203", color: "coral", type: "Lab" }
    },
    Wednesday: {
      "10:00 - 10:50": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 1", room: "Room 203", color: "coral", type: "Lecture" },
      "1:25 - 2:15": { subject: "Seminar", name: "Technical Seminar", sem: "3rd Sem", div: "Div 1", room: "Room 301", color: "blue", type: "Seminar" }
    },
    Thursday: {
      "9:00 - 9:55": { subject: "DBMS", name: "Database Management Systems", sem: "3rd Sem", div: "Div 2", room: "Room 205", color: "purple", type: "Lecture" },
      "10:55 - 11:45": { subject: "DS", name: "Data Structures", sem: "3rd Sem", div: "Div 1", room: "Room 202", color: "green", type: "Lecture" },
      "3:15 - 4:05": { subject: "Python", name: "Python Programming", sem: "3rd Sem", div: "Div 1", room: "Room 203", color: "coral", type: "Lab" }
    },
    Friday: {
      "10:00 - 10:50": { subject: "DBMS", name: "Database Management Systems", sem: "3rd Sem", div: "Div 1", room: "Room 201", color: "purple", type: "Lecture" }
    },
    Saturday: {}
  }
};
const FACULTY_NAMES = {
  "FAC_PS": "Prof. Priya Shah",
  "FAC_RP": "Prof. Rahul Patel",
  "FAC_AK": "Prof. A. Kumar",
  "FAC_SM": "Prof. Sneha Mehta",
  "FAC_DT": "Prof. Dev Trivedi",
  "FAC01": "Prof. R. K. Patel",
  "FAC02": "Dr. S. M. Mehta",
  "FAC_DJP": "Dr. Dinesh Prajapati"
};
const getSeedEntries = () => {
  const entries = [];
  Object.entries(DEFAULT_FACULTY_TIMETABLES).forEach(([facId, days]) => {
    Object.entries(days).forEach(([day, slots]) => {
      Object.entries(slots).forEach(([timeSlot, slot]) => {
        entries.push({
          id: generateId(),
          facultyId: facId,
          facultyName: FACULTY_NAMES[facId] || "Faculty",
          subjectId: slot.subject,
          // using short name as id for seed
          subjectName: slot.subject,
          subjectFullName: slot.name,
          semId: slot.sem,
          divId: slot.div,
          sem: slot.sem,
          div: slot.div,
          room: slot.room,
          color: slot.color,
          type: slot.type,
          day,
          timeSlot
        });
      });
    });
  });
  return entries;
};
const downloadClassTimetableTemplate = (deptName = "Department", semName = "3rd Semester", divName = "Div 1") => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const headerRow = ["time", ...days];
  const aoa = [headerRow];
  TIME_SLOTS.forEach((slot) => {
    const row = [slot];
    days.forEach(() => {
      row.push(slot === "12:40 - 1:25" ? "LUNCH" : "");
    });
    aoa.push(row);
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 16 }, ...days.map(() => ({ wch: 22 }))];
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:G10");
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };
      ws[addr].s = ws[addr].s || {};
      ws[addr].s.alignment = { wrapText: true, vertical: "top" };
    }
  }
  XLSX.utils.book_append_sheet(wb, ws, "Class Timetable");
  const iws = XLSX.utils.aoa_to_sheet([
    ["Department", deptName],
    ["Semester", semName],
    ["Division", divName],
    ["", ""],
    ["HOW TO FILL:", "In each cell (Mon-Sat column), type the subject short name."],
    ["Multi-line:", "Line 1: Subject code (e.g. DBMS)"],
    ["", "Line 2: Faculty Name (e.g. Prof. Priya Shah) \u2014 optional"],
    ["", "Line 3: Room / Lab (e.g. Room 201 or Lab 2) \u2014 optional"],
    ["Example cell:", "DBMS\nProf. Priya Shah\nRoom 201"],
    ["", ""],
    ["Leave blank", "for free periods"],
    ["For Lab:", 'Add "Lab" anywhere in cell, e.g. DBMS Lab\nProf. Priya Shah\nLab 2'],
    ["Time slots", TIME_SLOTS.join(", ")]
  ]);
  XLSX.utils.book_append_sheet(wb, iws, "Instructions");
  try {
    XLSX.writeFile(wb, "class_timetable_template_" + (deptName + "_" + semName + "_" + divName).replace(/[\s.]/g, "_") + ".xlsx");
  } catch (e) {
    throw new Error("Failed to download template: " + e.message);
  }
};
const getAllFacultyTimetables = () => {
  const entries = getTimetableEntries();
  const result = {};
  entries.forEach((e) => {
    if (!result[e.facultyId]) {
      result[e.facultyId] = {};
      TIMETABLE_DAYS.forEach((day) => result[e.facultyId][day] = {});
    }
    if (!result[e.facultyId][e.day]) result[e.facultyId][e.day] = {};
    result[e.facultyId][e.day][e.timeSlot] = {
      ...e,
      // Compatibility aliases: UI uses 'subject'/'name', entries store 'subjectName'/'subjectFullName'
      subject: e.subject || e.subjectName || e.subjectId || "",
      name: e.name || e.subjectFullName || e.subjectName || ""
    };
  });
  return result;
};
const getFacultyTimetable = (facultyId) => {
  const all = getAllFacultyTimetables();
  if (all[facultyId]) return JSON.parse(JSON.stringify(all[facultyId]));
  const empty = {};
  TIMETABLE_DAYS.forEach((day) => empty[day] = {});
  return empty;
};
const getClassTimetable = (sem, div, deptId = null) => {
  const entries = getEntriesByClass(deptId, sem, div);
  return convertEntriesToGrid(entries);
};
const updateFacultySlot = (facultyId, day, timeSlot, slotData, deptId = null) => {
  const entries = getTimetableEntries();
  const filtered = entries.filter((e) => !(e.facultyId === facultyId && e.day === day && e.timeSlot === timeSlot));
  const newEntry = {
    id: generateId(),
    facultyId,
    facultyName: slotData.facultyName || "Faculty",
    subjectId: slotData.subject,
    subjectName: slotData.subject,
    subjectFullName: slotData.name,
    semId: normalizeSem(slotData.sem || "3rd Sem"),
    divId: normalizeDiv(slotData.div || "Div 1"),
    sem: normalizeSem(slotData.sem || "3rd Sem"),
    div: normalizeDiv(slotData.div || "Div 1"),
    departmentId: deptId,
    room: slotData.room || "Room 201",
    color: slotData.color,
    type: slotData.type || "Lecture",
    day,
    timeSlot
  };
  filtered.push(newEntry);
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return getFacultyTimetable(facultyId);
};
const clearFacultySlot = (facultyId, day, timeSlot) => {
  const entries = getTimetableEntries();
  const filtered = entries.filter((e) => !(e.facultyId === facultyId && e.day === day && e.timeSlot === timeSlot));
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return getFacultyTimetable(facultyId);
};
const updateClassSlot = (sem, div, day, timeSlot, slotData, deptId = null) => {
  const entries = getTimetableEntries();
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);
  const filtered = entries.filter((e) => !(normalizeSem(e.semId || e.sem) === normSem && normalizeDiv(e.divId || e.div) === normDiv && e.day === day && e.timeSlot === timeSlot));
  const newEntry = {
    id: generateId(),
    facultyId: slotData.facultyId,
    facultyName: slotData.facultyName || "Faculty",
    subjectId: slotData.subject,
    subjectName: slotData.subject,
    subjectFullName: slotData.name,
    semId: normSem,
    divId: normDiv,
    sem: normSem,
    div: normDiv,
    departmentId: deptId,
    room: slotData.room || "Room 201",
    color: slotData.color,
    type: slotData.type || "Lecture",
    day,
    timeSlot
  };
  filtered.push(newEntry);
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return convertEntriesToGrid(getEntriesByClass(deptId, sem, div));
};
const clearClassSlot = (sem, div, day, timeSlot, deptId = null) => {
  const entries = getTimetableEntries();
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);
  const filtered = entries.filter((e) => {
    const semMatch = normalizeSem(e.semId || e.sem) === normSem;
    const divMatch = normalizeDiv(e.divId || e.div) === normDiv;
    const deptMatch = !deptId || !e.departmentId || e.departmentId === deptId;
    return !(semMatch && divMatch && deptMatch && e.day === day && e.timeSlot === timeSlot);
  });
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return convertEntriesToGrid(getEntriesByClass(deptId, sem, div));
};
const copyFacultyTimetable = (fromId, toId) => {
  const entries = getTimetableEntries();
  const fromEntries = entries.filter((e) => e.facultyId === fromId);
  const withoutTo = entries.filter((e) => e.facultyId !== toId);
  fromEntries.forEach((e) => {
    withoutTo.push({
      ...e,
      id: generateId(),
      facultyId: toId,
      facultyName: FACULTY_NAMES[toId] || toId
    });
  });
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(withoutTo));
  notifyTimetableSync();
};
const applyUploadedFacultyTimetable = (facultyId, newTimetable) => {
  const entries = getTimetableEntries();
  const filtered = entries.filter((e) => e.facultyId !== facultyId);
  let faculty = null;
  try {
    const facs = getFaculties();
    faculty = facs.find((f) => f.id === facultyId);
  } catch (e) {
  }
  const facultyName = faculty?.name || FACULTY_NAMES[facultyId] || "Faculty";
  let facultyDeptId = "DEP_AI";
  if (faculty?.dept) {
    if (faculty.dept.includes("IT") || faculty.dept.includes("Information")) facultyDeptId = "DEP_IT";
    else if (faculty.dept.includes("Computer")) facultyDeptId = "DEP_CP";
    else if (faculty.dept.includes("AI") || faculty.dept.includes("Data")) facultyDeptId = "DEP_AI";
  }
  TIMETABLE_DAYS.forEach((day) => {
    const daySlots = newTimetable[day] || {};
    Object.entries(daySlots).forEach(([timeSlot, slot]) => {
      if (!slot || !slot.subject) return;
      const sem = normalizeSem(slot.sem || "3rd Sem");
      const div = normalizeDiv(slot.div || "Div 1");
      const deptId = slot.departmentId || facultyDeptId;
      filtered.push({
        id: generateId(),
        facultyId,
        facultyName,
        departmentId: deptId,
        subjectId: slot.subjectId || slot.subject,
        subjectName: slot.subject,
        subjectFullName: slot.name || slot.subject,
        semId: sem,
        divId: div,
        sem,
        div,
        room: slot.room || "Room 201",
        color: slot.color || getSubjectColor(slot.subject),
        type: slot.type || "Lecture",
        day,
        timeSlot
      });
    });
  });
  console.log("[STORAGE] applyUploadedFacultyTimetable: saving", filtered.length, "total entries (", filtered.filter((e) => e.facultyId === facultyId).length, "for this faculty )");
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  console.log("[STORAGE] Saved. Notifying sync...");
  notifyTimetableSync();
};
const applyUploadedClassTimetable = (sem, div, newTimetable, deptNameOrId = null) => {
  const entries = getTimetableEntries();
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);
  let targetDeptId = null;
  if (deptNameOrId) {
    if (deptNameOrId.startsWith("DEP_")) targetDeptId = deptNameOrId;
    else if (deptNameOrId.includes("IT") || deptNameOrId.includes("Information")) targetDeptId = "DEP_IT";
    else if (deptNameOrId.includes("Computer")) targetDeptId = "DEP_CP";
    else if (deptNameOrId.includes("Mechanical")) targetDeptId = "DEP_ME";
    else if (deptNameOrId.includes("Civil")) targetDeptId = "DEP_CL";
    else if (deptNameOrId.includes("Electronics")) targetDeptId = "DEP_EC";
    else targetDeptId = "DEP_AI";
  }
  const filtered = entries.filter((e) => {
    const semMatch = normalizeSem(e.semId || e.sem) === normSem;
    const divMatch = normalizeDiv(e.divId || e.div) === normDiv;
    const deptMatch = !targetDeptId || !e.departmentId || e.departmentId === targetDeptId;
    return !(semMatch && divMatch && deptMatch);
  });
  let allFaculties = [];
  try {
    allFaculties = getFaculties();
  } catch (e) {
  }
  TIMETABLE_DAYS.forEach((day) => {
    const daySlots = newTimetable[day] || {};
    Object.entries(daySlots).forEach(([timeSlot, slot]) => {
      if (!slot || !slot.subject) return;
      let resolvedFacId = slot.facultyId;
      let resolvedFacName = slot.facultyName || "Faculty Assigned";
      if (!resolvedFacId && slot.facultyName) {
        const found = allFaculties.find(
          (f) => f.name.toLowerCase() === slot.facultyName.toLowerCase() || f.name.toLowerCase().includes(slot.facultyName.toLowerCase()) || f.id && slot.facultyName.toUpperCase().includes(f.id.replace("FAC_", ""))
        );
        if (found) {
          resolvedFacId = found.id;
          resolvedFacName = found.name;
        }
      }
      filtered.push({
        id: generateId(),
        facultyId: resolvedFacId,
        facultyName: resolvedFacName,
        departmentId: slot.departmentId || targetDeptId || "DEP_AI",
        subjectId: slot.subject,
        subjectName: slot.subject,
        subjectFullName: slot.name || slot.subject,
        semId: normSem,
        divId: normDiv,
        sem: normSem,
        div: normDiv,
        room: slot.room || "Room 201",
        color: slot.color || getSubjectColor(slot.subject),
        type: slot.type || "Lecture",
        day,
        timeSlot
      });
    });
  });
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
};
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const getTimetable = () => {
  const data = localStorage.getItem(TT_STORAGE_KEYS.TIMETABLE);
  if (!data) {
    const defaultLegacy = {
      Monday: [
        { time: "09:00 AM - 10:00 AM", subjectId: "SUB_DS", room: "Classroom 301", type: "Theory" },
        { time: "10:00 AM - 11:00 AM", subjectId: "SUB01", room: "Classroom 301", type: "Theory" },
        { time: "11:15 AM - 01:15 PM", subjectId: "SUB03", room: "Database Lab 2", type: "Lab" }
      ],
      Tuesday: [
        { time: "09:00 AM - 10:00 AM", subjectId: "SUB03", room: "Classroom 301", type: "Theory" },
        { time: "10:00 AM - 11:00 AM", subjectId: "SUB04", room: "Classroom 301", type: "Theory" }
      ],
      Wednesday: [
        { time: "09:00 AM - 10:00 AM", subjectId: "SUB01", room: "Classroom 301", type: "Theory" },
        { time: "10:00 AM - 11:00 AM", subjectId: "SUB_DS", room: "Classroom 301", type: "Theory" }
      ],
      Thursday: [
        { time: "09:00 AM - 10:00 AM", subjectId: "SUB_DS", room: "Classroom 301", type: "Theory" },
        { time: "10:00 AM - 11:00 AM", subjectId: "SUB02", room: "Classroom 301", type: "Theory" }
      ],
      Friday: [
        { time: "09:00 AM - 10:00 AM", subjectId: "SUB04", room: "Classroom 301", type: "Theory" },
        { time: "10:00 AM - 11:00 AM", subjectId: "SUB03", room: "Classroom 301", type: "Theory" }
      ],
      Saturday: [
        { time: "09:00 AM - 10:00 AM", subjectId: "SUB01", room: "Classroom 301", type: "Theory" }
      ],
      Sunday: []
    };
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE, JSON.stringify(defaultLegacy));
    return defaultLegacy;
  }
  return JSON.parse(data);
};
const saveTimetable = (timetableData, fileInfo = null) => {
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE, JSON.stringify(timetableData));
  if (fileInfo) {
    localStorage.setItem(TT_STORAGE_KEYS.UPLOADED_FILE_INFO, JSON.stringify(fileInfo));
  }
  return timetableData;
};
const getScheduledLecturesForDate = (dateStr) => {
  if (!dateStr) return { dayName: "", lectures: [] };
  const d = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
  const dayName = DAYS[d.getDay()];
  const entries = getTimetableEntries();
  const dayEntries = entries.filter((e) => e.day === dayName);
  if (dayEntries.length > 0) {
    const lectures2 = dayEntries.map((e) => ({
      time: e.timeSlot,
      subjectId: e.subjectId,
      subjectName: e.subjectName || e.subjectFullName || e.subjectId,
      facultyId: e.facultyId,
      facultyName: e.facultyName,
      sem: e.semId || e.sem,
      div: e.divId || e.div,
      departmentId: e.departmentId,
      room: e.room,
      type: e.type || "Lecture"
    }));
    return { dayName, lectures: lectures2 };
  }
  const timetable = getTimetable();
  const lectures = timetable[dayName] || [];
  return { dayName, lectures };
};
const getFacultyScheduledLecturesForDate = (facultyId, dateStr) => {
  if (!dateStr || !facultyId) return { dayName: "", lectures: [] };
  const d = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
  const dayName = DAYS[d.getDay()];
  const entries = getTimetableEntries();
  const dayEntries = entries.filter((e) => e.day === dayName && e.facultyId === facultyId);
  if (dayEntries.length > 0) {
    const lectures2 = dayEntries.map((e) => ({
      id: e.id,
      time: e.timeSlot,
      subjectId: e.subjectId,
      subjectName: e.subjectName || e.subjectFullName || e.subjectId,
      facultyId: e.facultyId,
      facultyName: e.facultyName,
      sem: e.semId || e.sem,
      div: e.divId || e.div,
      departmentId: e.departmentId,
      room: e.room,
      type: e.type || "Lecture"
    }));
    return { dayName, lectures: lectures2 };
  }
  const grid = getFacultyTimetable(facultyId);
  const daySlots = grid[dayName] || {};
  const lectures = [];
  Object.keys(daySlots).forEach((time) => {
    const s = daySlots[time];
    if (s && s.subject) {
      lectures.push({
        time,
        subjectId: s.subject,
        subjectName: s.name || s.subject,
        facultyId,
        sem: s.sem,
        div: s.div,
        room: s.room,
        type: s.type || "Lecture",
        color: s.color
      });
    }
  });
  return { dayName, lectures };
};
const _fuzzyTimeSlot = (cellTime) => {
  if (!cellTime) return null;
  const s = String(cellTime).replace(/[\u2010-\u2015\u2212\uFF0D]/g, "-").replace(/\s+/g, "").toLowerCase();
  if (s.includes("lunch") || s.includes("break")) return "12:40 - 1:25";
  const exact = TIME_SLOTS.find((ts) => ts.replace(/\s/g, "") === s);
  if (exact) return exact;
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h >= 1 && h <= 5) h += 12;
  const totalMins = h * 60 + min;
  const slotStarts = [
    { start: 9 * 60, slot: "9:00 - 9:55" },
    { start: 10 * 60, slot: "10:00 - 10:50" },
    { start: 10 * 60 + 55, slot: "10:55 - 11:45" },
    { start: 11 * 60 + 50, slot: "11:50 - 12:40" },
    { start: 12 * 60 + 40, slot: "12:40 - 1:25" },
    { start: 13 * 60 + 25, slot: "1:25 - 2:15" },
    { start: 14 * 60 + 20, slot: "2:20 - 3:10" },
    { start: 15 * 60 + 15, slot: "3:15 - 4:05" },
    { start: 16 * 60 + 10, slot: "4:10 - 5:00" }
  ];
  let bestMatch = null;
  let minDiff = 25;
  for (const sDef of slotStarts) {
    const diff = Math.abs(totalMins - sDef.start);
    if (diff < minDiff) {
      minDiff = diff;
      bestMatch = sDef.slot;
    }
  }
  return bestMatch;
};
const _parseCellContent = (cellText, defaultSem, defaultDiv, defaultDeptId) => {
  const raw = String(cellText || "").trim();
  if (!raw) return null;
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  if (lines.some((l) => /^(lunch|break|lb|-+)$/i.test(l))) return null;
  let subject = "";
  let room = "Room 201";
  let sem = null;
  let div = null;
  let deptId = null;
  const deptCodeMap = {
    "AI": "DEP_AI",
    "IT": "DEP_IT",
    "CP": "DEP_CP",
    "CE": "DEP_CP",
    "EC": "DEP_EC",
    "ME": "DEP_ME",
    "CL": "DEP_CL"
  };
  for (const line of lines) {
    const pMatch = line.match(/\((\d{2,4})\)/);
    if (pMatch) {
      room = pMatch[1];
      break;
    }
    const sMatch = line.match(/^(IT-?\d+|\d{2,4}[A-Z]?|[A-Z]{1,2}-?\d+|10S)$/i);
    if (sMatch) {
      room = sMatch[1];
      break;
    }
  }
  for (const line of lines) {
    const tokenMatch = line.match(/\b([1-8])\s*(AI|IT|CP|CE|ME|EC|CL|PG)(\d?)\b/i);
    if (tokenMatch) {
      const sNum = tokenMatch[1];
      const dCode = tokenMatch[2].toUpperCase();
      const divNum = tokenMatch[3];
      const suffixes = { "1": "st", "2": "nd", "3": "rd" };
      sem = `${sNum}${suffixes[sNum] || "th"} Sem`;
      if (divNum) {
        div = `Div ${divNum}`;
      }
      if (deptCodeMap[dCode]) {
        deptId = deptCodeMap[dCode];
      }
      break;
    }
  }
  const facultyInitials = ["DJP", "PS", "RP", "AK", "SM", "DT", "NM", "RJ", "PB", "RKU", "KJP", "CB", "VJC", "KAS", "KKP", "SRS", "HM"];
  const weekdayNames = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN", "TIME", "DAY", "DAYS", "SLOT", "HOURS"];
  const ignoredCodes = ["AI", "IT", "CP", "CE", "ME", "EC", "CL", "PG", "UG", "LAB", "ROOM", "DIV", "SEM", ...facultyInitials, ...weekdayNames];
  for (const line of lines) {
    const cleaned = line.replace(/^\d[A-Z0-9?!]+\s*/gi, "").replace(/\([^)]*\)/g, "").trim();
    const words = cleaned.split(/\s+/);
    for (const w of words) {
      const cleanWord = w.replace(/[^A-Z]/gi, "").toUpperCase();
      if (cleanWord.length >= 2 && !ignoredCodes.includes(cleanWord)) {
        subject = cleanWord;
        break;
      }
    }
    if (subject) break;
  }
  if (!subject) return null;
  const isLab = /lab/i.test(raw);
  return {
    subject,
    name: subject,
    sem: sem || normalizeSem(defaultSem),
    div: div || normalizeDiv(defaultDiv),
    deptId: deptId || defaultDeptId,
    room,
    type: isLab ? "Lab" : "Lecture"
  };
};
const _isGridFormat = (rows) => {
  if (!rows || rows.length < 2) return false;
  const header = rows[0];
  if (!header || header.length < 3) return false;
  const dayHits = TIMETABLE_DAYS.filter(
    (d) => header.some((cell) => String(cell || "").toLowerCase().includes(d.toLowerCase()))
  );
  return dayHits.length >= 3;
};
const _parseSheetRows = (rows, defaultSem, defaultDiv, scopeIsClass, defaultDeptId = "DEP_AI") => {
  const timetable = {};
  TIMETABLE_DAYS.forEach((d) => {
    timetable[d] = {};
  });
  const previewLectures = [];
  if (_isGridFormat(rows)) {
    const header = rows[0];
    const colToDay = {};
    header.forEach((cell, colIdx) => {
      if (colIdx === 0) return;
      const day = TIMETABLE_DAYS.find((d) => String(cell || "").toLowerCase().includes(d.toLowerCase()));
      if (day) colToDay[colIdx] = day;
    });
    for (let ri = 1; ri < rows.length; ri++) {
      const row = rows[ri];
      if (!row || row.every((c) => !c)) continue;
      const timeSlot = _fuzzyTimeSlot(row[0]);
      if (!timeSlot) continue;
      if (timeSlot === "12:40 - 1:25") continue;
      Object.entries(colToDay).forEach(([colIdxStr, day]) => {
        const colIdx = parseInt(colIdxStr);
        const cellText = row[colIdx];
        if (!cellText) return;
        const parsed = _parseCellContent(cellText, defaultSem, defaultDiv, defaultDeptId);
        if (!parsed) return;
        const sem = parsed.sem || normalizeSem(defaultSem);
        const div = parsed.div || normalizeDiv(defaultDiv);
        const deptId = parsed.deptId || defaultDeptId || "DEP_AI";
        const room = parsed.room || "Room 201";
        const type = parsed.type || "Lecture";
        timetable[day][timeSlot] = {
          subject: parsed.subject,
          name: parsed.subject,
          sem,
          div,
          departmentId: deptId,
          room,
          type,
          color: getSubjectColor(parsed.subject)
        };
        previewLectures.push({
          day,
          time: timeSlot,
          subject: parsed.subject,
          room,
          sem,
          div,
          departmentId: deptId
        });
      });
    }
    return { timetable, previewLectures };
  }
  let currentDay = "";
  let dataStart = 0;
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const rowText = rows[i].join(" ").toLowerCase();
    if (rowText.includes("day") || rowText.includes("time") || rowText.includes("slot")) {
      dataStart = i + 1;
      break;
    }
  }
  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c)) continue;
    const c0 = String(row[0] || "").trim();
    const c1 = String(row[1] || "").trim();
    const c2 = String(row[2] || "").trim();
    const c3 = String(row[3] || "").trim();
    const c4 = String(row[4] || "").trim();
    const c5 = String(row[5] || "").trim();
    const c6 = String(row[6] || "").trim();
    const c7 = String(row[7] || "").trim();
    const dayHit = TIMETABLE_DAYS.find((d) => c0.toLowerCase().includes(d.toLowerCase()));
    if (dayHit) currentDay = dayHit;
    if (!currentDay) continue;
    const timeSlot = TIME_SLOTS.find(
      (ts) => ts.replace(/\s/g, "") === c1.replace(/\s/g, "") || ts.replace(/\s/g, "").startsWith(c1.replace(/\s/g, "").slice(0, 5))
    ) || _fuzzyTimeSlot(c1) || c1;
    if (!TIME_SLOTS.includes(timeSlot)) continue;
    if (!c2 || /lunch|break/i.test(c2)) continue;
    if (scopeIsClass) {
      const room = c4 || "Room 201";
      const type = c5 || "Lecture";
      const facultyName = c6 || "";
      timetable[currentDay][timeSlot] = { subject: c2, name: c3 || c2, sem: normalizeSem(defaultSem), div: normalizeDiv(defaultDiv), departmentId: defaultDeptId, room, type, color: getSubjectColor(c2), facultyName };
      previewLectures.push({ day: currentDay, time: timeSlot, subject: c2, room, facultyName, sem: normalizeSem(defaultSem), div: normalizeDiv(defaultDiv), departmentId: defaultDeptId });
    } else {
      const sem = normalizeSem(c4 || defaultSem);
      const div = normalizeDiv(c5 || defaultDiv);
      const room = c6 || "Room 201";
      const type = c7 || "Lecture";
      timetable[currentDay][timeSlot] = { subject: c2, name: c3 || c2, sem, div, departmentId: defaultDeptId, room, type, color: getSubjectColor(c2) };
      previewLectures.push({ day: currentDay, time: timeSlot, subject: c2, room, sem, div, departmentId: defaultDeptId });
    }
  }
  return { timetable, previewLectures };
};
const _readAsUint8Array = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = (e) => resolve(new Uint8Array(e.target.result));
  r.onerror = () => reject(new Error("Cannot read file. It may be locked or corrupted."));
  r.readAsArrayBuffer(file);
});
const parseExcelTimetableForFaculty = async (file, facultyId, semFilter, divFilter, deptNameOrId) => {
  if (!file) throw new Error("No file provided.");
  const bytes = await _readAsUint8Array(file);
  let wb;
  try {
    wb = XLSX.read(bytes, { type: "array" });
  } catch (e) {
    throw new Error("Could not parse spreadsheet. Ensure the file is a valid .xlsx or .csv.");
  }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("Spreadsheet has no sheets.");
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!rows || rows.length < 2) throw new Error("Spreadsheet appears to be empty.");
  let defaultDeptId = "DEP_AI";
  if (deptNameOrId) {
    if (deptNameOrId.startsWith("DEP_")) defaultDeptId = deptNameOrId;
    else if (deptNameOrId.includes("IT") || deptNameOrId.includes("Information")) defaultDeptId = "DEP_IT";
    else if (deptNameOrId.includes("Computer")) defaultDeptId = "DEP_CP";
  } else if (facultyId) {
    try {
      const facs = getFaculties();
      const f = facs.find((fac) => fac.id === facultyId);
      if (f && f.dept) {
        if (f.dept.includes("IT") || f.dept.includes("Information")) defaultDeptId = "DEP_IT";
        else if (f.dept.includes("Computer")) defaultDeptId = "DEP_CP";
      }
    } catch (e) {
    }
  }
  const { timetable, previewLectures } = _parseSheetRows(rows, semFilter || "3rd Sem", divFilter || "Div 1", false, defaultDeptId);
  const summary = calculateTimetableSummary(timetable);
  const fileInfo = { name: file.name, size: (file.size / 1024).toFixed(1) + " KB", type: file.name.endsWith(".csv") ? "csv" : "excel" };
  return { timetable, fileInfo, summary, previewLectures };
};
const parseExcelTimetableForClass = async (file, semFilter, divFilter, deptName) => {
  if (!file) throw new Error("No file provided.");
  const bytes = await _readAsUint8Array(file);
  let wb;
  try {
    wb = XLSX.read(bytes, { type: "array" });
  } catch (e) {
    throw new Error("Could not parse spreadsheet. Ensure the file is a valid .xlsx or .csv.");
  }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("Spreadsheet has no sheets.");
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!rows || rows.length < 2) throw new Error("Spreadsheet appears to be empty.");
  const { timetable, previewLectures } = _parseSheetRows(rows, semFilter || "3rd Sem", divFilter || "Div 1", true);
  const summary = calculateTimetableSummary(timetable);
  const fileInfo = { name: file.name, size: (file.size / 1024).toFixed(1) + " KB", type: "excel" };
  return { timetable, fileInfo, summary, previewLectures };
};
const normalizeTimetable = (rawTimetable, defaultSem = "3rd Sem", defaultDiv = "Div 1", defaultDeptId = "DEP_AI", facultyName = "") => {
  const timetable = {};
  TIMETABLE_DAYS.forEach((day) => {
    timetable[day] = {};
  });
  const previewLectures = [];
  const subjectsSet = /* @__PURE__ */ new Set();
  if (rawTimetable && typeof rawTimetable === "object") {
    TIMETABLE_DAYS.forEach((day) => {
      const daySlots = rawTimetable[day] || {};
      Object.entries(daySlots).forEach(([timeSlot, slot]) => {
        if (!slot || !slot.subject) return;
        const subjShort = String(slot.subject).trim();
        if (!subjShort || /^(lunch|break|lb|-+)$/i.test(subjShort)) return;
        const sem = normalizeSem(slot.sem || defaultSem);
        const div = normalizeDiv(slot.div || defaultDiv);
        const deptId = slot.departmentId || defaultDeptId;
        const room = slot.room || "Room 201";
        const type = slot.type || "Lecture";
        const name = slot.name || slot.subjectFullName || subjShort;
        const color = slot.color || getSubjectColor(subjShort);
        const facName = slot.facultyName || facultyName || "";
        const normalizedSlot = {
          subject: subjShort,
          name,
          sem,
          div,
          departmentId: deptId,
          room,
          type,
          color,
          facultyName: facName
        };
        timetable[day][timeSlot] = normalizedSlot;
        subjectsSet.add(subjShort);
        previewLectures.push({
          day,
          time: timeSlot,
          subject: subjShort,
          name,
          room,
          sem,
          div,
          departmentId: deptId,
          facultyName: facName
        });
      });
    });
  }
  const activeDays = new Set(previewLectures.map((l) => l.day)).size;
  const summary = {
    totalLectures: previewLectures.length,
    activeDays,
    uniqueSubjects: Array.from(subjectsSet),
    subjectCount: subjectsSet.size
  };
  return { timetable, summary, previewLectures };
};
const validateTimetable = (normalizedResult) => {
  if (!normalizedResult || !normalizedResult.timetable) {
    return { valid: false, error: "Timetable data is incomplete or invalid.", totalLectures: 0 };
  }
  const total = normalizedResult.summary?.totalLectures || normalizedResult.previewLectures?.length || 0;
  if (total === 0) {
    return { valid: false, error: "File was read, but no timetable entries could be detected.", totalLectures: 0 };
  }
  return { valid: true, error: null, totalLectures: total };
};
const commitUploadedTimetable = (targetScope, targetId, timetableData, options = {}) => {
  if (!timetableData || !timetableData.timetable) {
    throw new Error("No timetable data provided to save.");
  }
  if (targetScope === "faculty") {
    applyUploadedFacultyTimetable(targetId, timetableData.timetable);
    return true;
  } else {
    const sem = options.sem || "3rd Sem";
    const div = options.div || "Div 1";
    const dept = options.departmentName || null;
    applyUploadedClassTimetable(sem, div, timetableData.timetable, dept);
    return true;
  }
};
const _runTesseractOCR = async (imageSource) => {
  if (!window.Tesseract) {
    throw new Error("OCR library (Tesseract.js) is not loaded.");
  }
  console.log("[OCR] Initializing Tesseract worker...");
  let worker = null;
  try {
    worker = await window.Tesseract.createWorker({
      workerPath: "/libs/tesseract-worker.min.js",
      corePath: "/libs/tesseract-core.wasm.js",
      langPath: "/libs/"
    });
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data } = await worker.recognize(imageSource);
    await worker.terminate();
    console.log("[OCR] Image OCR text:", data?.text?.slice(0, 300));
    console.log("[OCR] Image OCR positioned data count:", data?.words?.length || 0);
    const items = [];
    if (data && data.words) {
      data.words.forEach((w) => {
        if (w.text && w.text.trim()) {
          items.push({
            text: w.text.trim(),
            x: w.bbox.x0,
            y: w.bbox.y0,
            w: w.bbox.x1 - w.bbox.x0,
            h: w.bbox.y1 - w.bbox.y0
          });
        }
      });
    }
    const lines = data && data.lines ? data.lines.map((l) => l.text.trim()).filter(Boolean) : (data?.text || "").split("\n").filter(Boolean);
    return { text: data?.text || "", items, lines };
  } catch (err) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
      }
    }
    console.error("[OCR] Tesseract error:", err);
    throw new Error("Could not recognize timetable from this image: " + err.message);
  }
};
const _facultyInitialsMap = {
  "PB": "Dr. Priyang Bhatt",
  "DJP": "Dr. Dinesh Prajapati",
  "PS": "Prof. Priya Shah",
  "AK": "Prof. A. Kumar",
  "SM": "Prof. S. Modi",
  "DT": "Prof. D. Trivedi",
  "NM": "Prof. N. Modi",
  "RJ": "Prof. R. Joshi",
  "RKU": "Dr. R. K. Upadhyay",
  "KJP": "Prof. K. J. Patel",
  "CB": "Prof. C. Bhatt",
  "VJC": "Prof. V. J. Chauhan",
  "KAS": "Prof. K. A. Shah",
  "KKP": "Prof. K. K. Patel",
  "SRS": "Prof. S. R. Sharma",
  "HM": "Prof. H. Modi"
};
const _deptCodeMap = {
  "AI": "DEP_AI",
  "IT": "DEP_IT",
  "CP": "DEP_CP",
  "CE": "DEP_CP",
  "EC": "DEP_EC",
  "ME": "DEP_ME",
  "CL": "DEP_CL"
};
const _WEEKDAYS_STRUCTURAL = /* @__PURE__ */ new Set([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
  "TIME",
  "DAY",
  "DAYS",
  "SLOT",
  "HOURS",
  "HOUR"
]);
const _parseCellLines = (lines, defaultSem, defaultDiv, defaultDeptId, facultyName, subjectMap, prevSlotData) => {
  if (!lines || !lines.length) return null;
  const cleanLines = lines.map((l) => String(l || "").trim()).filter((l) => {
    if (!l) return false;
    if (/^(lunch|break|lb|-+)$/i.test(l)) return false;
    const upper = l.toUpperCase();
    if (_WEEKDAYS_STRUCTURAL.has(upper)) return false;
    return true;
  });
  if (!cleanLines.length) return null;
  const raw = cleanLines.join("\n");
  let subject = "";
  let fullSubjectName = "";
  let room = "Room 201";
  let sem = null;
  let div = null;
  let deptId = null;
  let detectedFaculty = facultyName || "";
  const commonSubjects = [
    "CPC",
    "PAIML",
    "DWDM",
    "SNA",
    "NLP",
    "BDA",
    "ASE",
    "MATHS-I",
    "MATHS",
    "BEE",
    "EG",
    "ES",
    "FOP",
    "DBMS",
    "SE",
    "OS",
    "CN",
    "DSA",
    "OOP",
    "DELD",
    "COA",
    "WT",
    "MAD",
    "IS"
  ];
  for (const line of cleanLines) {
    for (const cs of commonSubjects) {
      const csRegex = new RegExp(`\\b${cs.replace("-", "[\\-\\s]?")}\\b`, "i");
      if (csRegex.test(line)) {
        subject = cs;
        fullSubjectName = cs;
        break;
      }
    }
    if (subject) break;
  }
  if (!subject) {
    for (const line of cleanLines) {
      for (const [code, fullName] of Object.entries(subjectMap || {})) {
        if (line.includes(code)) {
          fullSubjectName = fullName;
          const words = fullName.match(/[A-Z][a-z]+/g);
          if (words && words.length >= 2) {
            subject = words.map((w) => w[0]).join("").toUpperCase();
          } else {
            subject = fullName.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase();
          }
          break;
        }
      }
      if (subject) break;
    }
  }
  for (const line of cleanLines) {
    const pMatch = line.match(/\((\d{2,4})\)/);
    if (pMatch) {
      room = pMatch[1];
      break;
    }
    const sMatch = line.match(/\b(IT-?\d+|\d{2,4}[A-Z]?|[A-Z]{1,2}-?\d+|10S|108|331-?[AB]?|Room\s*\d+)\b/i);
    if (sMatch) {
      room = sMatch[1];
      break;
    }
  }
  for (const line of cleanLines) {
    const tokenMatch = line.match(/\b([1-8])\s*(AI|IT|CP|CE|ME|EC|CL|PG)(\d?)\b/i);
    if (tokenMatch) {
      const sNum = tokenMatch[1];
      const dCode = tokenMatch[2].toUpperCase();
      const divNum = tokenMatch[3];
      const suffixes = { "1": "st", "2": "nd", "3": "rd" };
      sem = `${sNum}${suffixes[sNum] || "th"} Sem`;
      if (divNum) {
        div = `Div ${divNum}`;
      }
      if (_deptCodeMap[dCode]) {
        deptId = _deptCodeMap[dCode];
      }
      break;
    }
  }
  for (const line of cleanLines) {
    const words = line.match(/\b[A-Z]{2,4}\b/g) || [];
    for (const w of words) {
      if (_facultyInitialsMap[w]) {
        detectedFaculty = _facultyInitialsMap[w];
        break;
      }
    }
  }
  if (!subject) {
    const ignored = /* @__PURE__ */ new Set([
      "AI",
      "IT",
      "CP",
      "CE",
      "ME",
      "EC",
      "CL",
      "PG",
      "UG",
      "LAB",
      "ROOM",
      "DIV",
      "SEM",
      "TUT",
      "LEC",
      "LECTURE",
      "CLASS",
      ..._WEEKDAYS_STRUCTURAL,
      ...Object.keys(_facultyInitialsMap)
    ]);
    for (const line of cleanLines) {
      const cleaned = line.replace(/^\d[A-Z0-9?!]+\s*/gi, "").replace(/\([^)]*\)/g, "").trim();
      const words = cleaned.match(/[A-Za-z0-9\-]+/g) || [];
      for (const w of words) {
        const cleanWord = w.replace(/[^A-Za-z]/g, "").toUpperCase();
        if (cleanWord.length >= 2 && !ignored.has(cleanWord) && !_WEEKDAYS_STRUCTURAL.has(cleanWord)) {
          subject = cleanWord;
          fullSubjectName = cleanWord;
          break;
        }
      }
      if (subject) break;
    }
  }
  if (subject && _WEEKDAYS_STRUCTURAL.has(subject.toUpperCase())) {
    subject = "";
  }
  if (detectedFaculty && _WEEKDAYS_STRUCTURAL.has(detectedFaculty.toUpperCase())) {
    detectedFaculty = facultyName || "";
  }
  if (room && _WEEKDAYS_STRUCTURAL.has(room.toUpperCase())) {
    room = "Room 201";
  }
  if (!subject && prevSlotData && prevSlotData.subject) {
    subject = prevSlotData.subject;
    fullSubjectName = prevSlotData.name || subject;
    if (!sem) sem = prevSlotData.sem;
    if (!div) div = prevSlotData.div;
    if (!deptId) deptId = prevSlotData.departmentId || prevSlotData.deptId;
    if (!detectedFaculty) detectedFaculty = prevSlotData.facultyName;
    if (!room || room === "Room 201") room = prevSlotData.room;
  }
  if (!subject) return null;
  const isLab = /lab/i.test(raw) || /p\//i.test(raw) || prevSlotData && prevSlotData.type === "Lab" && !/lec/i.test(raw);
  return {
    subject,
    name: fullSubjectName || subject,
    sem: sem || normalizeSem(defaultSem),
    div: div || normalizeDiv(defaultDiv),
    departmentId: deptId || defaultDeptId,
    room,
    facultyName: detectedFaculty || facultyName || "",
    type: isLab ? "Lab" : "Lecture",
    color: getSubjectColor(subject)
  };
};
const _reconstructGridFromItems = (items, defaultSem, defaultDiv, defaultDeptId, facultyName, passedSubjectMap = null) => {
  if (!items || items.length < 5) return null;
  const subjectMap = passedSubjectMap ? { ...passedSubjectMap } : {};
  const itemsByY = items.slice().sort((a, b) => b.y - a.y || a.x - b.x);
  itemsByY.forEach((it) => {
    const m = String(it.text || "").match(/^(20\d{6,8})$/);
    if (m) {
      const code = m[1];
      const sameLine = itemsByY.filter((o) => Math.abs(o.y - it.y) <= 6 && o.x > it.x);
      for (const sl of sameLine) {
        const txt = String(sl.text || "").trim();
        if (txt.length > 5 && !/^\d+$/.test(txt) && !/^(prepared|verified|principal|director|dr\.|prof\.)/i.test(txt) && sl.x < 350) {
          subjectMap[code] = txt;
          break;
        }
      }
    }
  });
  const dayPatterns = [
    { day: "Monday", regex: /\b(MON|MONDAY)\b/i },
    { day: "Tuesday", regex: /\b(TUE|TUESDAY|TUES)\b/i },
    { day: "Wednesday", regex: /\b(WED|WEDNESDAY)\b/i },
    { day: "Thursday", regex: /\b(THU|THURSDAY|THURS)\b/i },
    { day: "Friday", regex: /\b(FRI|FRIDAY)\b/i },
    { day: "Saturday", regex: /\b(SAT|SATURDAY)\b/i }
  ];
  const dayCols = [];
  const headerYs = [];
  const headerItems = /* @__PURE__ */ new Set();
  dayPatterns.forEach(({ day, regex }) => {
    for (const it of items) {
      const txt = String(it.text || "").trim();
      if (regex.test(txt)) {
        dayCols.push({ day, x: it.x, y: it.y });
        headerYs.push(it.y);
        headerItems.add(it);
        break;
      }
    }
  });
  dayCols.sort((a, b) => a.x - b.x);
  if (dayCols.length < 3) return null;
  items.forEach((it) => {
    const txt = String(it.text || "").trim().toUpperCase();
    if (_WEEKDAYS_STRUCTURAL.has(txt)) {
      headerItems.add(it);
    }
  });
  const minHeaderY = headerYs.length ? Math.min(...headerYs) : null;
  const headerRowBottom = minHeaderY !== null ? minHeaderY - 2 : null;
  for (let i = 0; i < dayCols.length; i++) {
    const left = i > 0 ? (dayCols[i - 1].x + dayCols[i].x) / 2 : dayCols[i].x - 50;
    const right = i < dayCols.length - 1 ? (dayCols[i].x + dayCols[i + 1].x) / 2 : dayCols[i].x + 60;
    dayCols[i].left = left;
    dayCols[i].right = right;
  }
  const seenSlots = /* @__PURE__ */ new Set();
  const timeRows = [];
  const candidateItems = items.filter((it) => {
    const clean = String(it.text || "").replace(/[\u2010-\u2015\u2212\uFF0D]/g, "-").trim();
    return /\d{1,2}:\d{2}/.test(clean) && it.x < (dayCols.length > 1 ? dayCols[1].left : dayCols[0].x);
  }).sort((a, b) => b.y - a.y);
  candidateItems.forEach((it) => {
    const clean = String(it.text || "").replace(/[\u2010-\u2015\u2212\uFF0D]/g, "-").trim();
    const slot = _fuzzyTimeSlot(clean);
    if (slot && !seenSlots.has(slot)) {
      seenSlots.add(slot);
      timeRows.push({ rawTime: clean, slot, y: it.y });
    }
  });
  timeRows.sort((a, b) => b.y - a.y);
  if (timeRows.length < 2) return null;
  for (let i = 0; i < timeRows.length; i++) {
    const rowHeight = i < timeRows.length - 1 ? timeRows[i].y - timeRows[i + 1].y : i > 0 ? timeRows[i - 1].y - timeRows[i].y : 20;
    const top = i > 0 ? (timeRows[i - 1].y + timeRows[i].y) / 2 : headerRowBottom !== null ? Math.min(headerRowBottom, timeRows[i].y + rowHeight * 0.45) : timeRows[i].y + 12;
    const bottom = i < timeRows.length - 1 ? (timeRows[i].y + timeRows[i + 1].y) / 2 : timeRows[i].y - rowHeight * 0.45;
    timeRows[i].top = top;
    timeRows[i].bottom = bottom;
  }
  const cellContentItems = items.filter((it) => {
    if (headerItems.has(it)) return false;
    const txt = String(it.text || "").trim().toUpperCase();
    if (_WEEKDAYS_STRUCTURAL.has(txt)) return false;
    if (headerRowBottom !== null && it.y >= headerRowBottom) return false;
    return true;
  });
  const gridCells = {};
  timeRows.forEach((r) => {
    gridCells[r.slot] = {};
    dayCols.forEach((c) => {
      gridCells[r.slot][c.day] = [];
    });
  });
  cellContentItems.forEach((it) => {
    for (const r of timeRows) {
      if (it.y >= r.bottom && it.y <= r.top) {
        for (const c of dayCols) {
          if (it.x >= c.left && it.x <= c.right) {
            gridCells[r.slot][c.day].push(it);
            break;
          }
        }
        break;
      }
    }
  });
  const rawTimetable = {};
  TIMETABLE_DAYS.forEach((d) => {
    rawTimetable[d] = {};
  });
  dayCols.forEach((c) => {
    const day = c.day;
    let prevSlotData = null;
    timeRows.forEach((r) => {
      const slot = r.slot;
      if (slot === "12:40 - 1:25") return;
      const cellItems = gridCells[slot][day] || [];
      if (!cellItems.length) {
        prevSlotData = null;
        return;
      }
      cellItems.sort((a, b) => b.y - a.y || a.x - b.x);
      const lines = cellItems.map((it) => String(it.text || "").trim()).filter(Boolean);
      if (!lines.length || lines.some((l) => /^(lunch|break|lb|-+)$/i.test(l))) {
        prevSlotData = null;
        return;
      }
      const parsed = _parseCellLines(lines, defaultSem, defaultDiv, defaultDeptId, facultyName, subjectMap, prevSlotData);
      if (parsed && parsed.subject && !_WEEKDAYS_STRUCTURAL.has(parsed.subject.toUpperCase())) {
        rawTimetable[day][slot] = parsed;
        prevSlotData = parsed;
      } else {
        prevSlotData = null;
      }
    });
  });
  return { rawTimetable, gridCells, subjectMap };
};
const parsePdfTimetable = async (file, targetScope = "faculty", targetId = null, semFilter = "3rd Sem", divFilter = "Div 1", deptNameOrId = null) => {
  if (!file) throw new Error("No file provided.");
  if (!window.pdfjsLib) {
    throw new Error("Unable to open PDF: PDF.js library is not loaded. Please ensure libs/pdf.min.js is present.");
  }
  console.log("PDF file received:", file);
  let pdfDoc;
  try {
    const arrayBuffer = await file.arrayBuffer();
    pdfDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  } catch (err) {
    throw new Error("Unable to open PDF: " + err.message);
  }
  console.log("PDF loaded:", pdfDoc);
  console.log("Number of pages:", pdfDoc.numPages);
  let targetPageIndex = 1;
  let targetFacultyName = "";
  let defaultDeptId = "DEP_AI";
  if (deptNameOrId) {
    if (deptNameOrId.startsWith("DEP_")) defaultDeptId = deptNameOrId;
    else if (deptNameOrId.includes("IT") || deptNameOrId.includes("Information")) defaultDeptId = "DEP_IT";
    else if (deptNameOrId.includes("Computer")) defaultDeptId = "DEP_CP";
  }
  if (targetId) {
    try {
      const facs = getFaculties();
      const f = facs.find((fac) => fac.id === targetId);
      if (f) {
        targetFacultyName = f.name || "";
        if (f.dept?.includes("IT") || f.dept?.includes("Information")) defaultDeptId = "DEP_IT";
        else if (f.dept?.includes("Computer")) defaultDeptId = "DEP_CP";
      }
    } catch (e) {
    }
  }
  if (pdfDoc.numPages > 1) {
    let matched = 0;
    if (targetScope === "faculty" && targetFacultyName) {
      const searchTarget = targetFacultyName.toLowerCase().replace(/[^a-z]/g, "");
      for (let pi = 1; pi <= pdfDoc.numPages; pi++) {
        const p = await pdfDoc.getPage(pi);
        const tc = await p.getTextContent();
        const pageStr = tc.items.map((it) => it.str).join(" ").toLowerCase().replace(/[^a-z]/g, "");
        if (pageStr.includes(searchTarget) || targetId && pageStr.includes(targetId.toLowerCase())) {
          matched = pi;
          console.log(`[PDF] Matched faculty "${targetFacultyName}" to Page ${pi}`);
          break;
        }
      }
    } else if (targetScope === "class") {
      const semNorm = (semFilter || "").replace(/[^0-9]/g, "");
      const divNorm = (divFilter || "").replace(/[^0-9]/g, "");
      const deptShort = defaultDeptId === "DEP_IT" ? "it" : defaultDeptId === "DEP_CP" ? "cp" : "ai";
      const classTarget = `${semNorm}${deptShort}${divNorm}`;
      for (let pi = 1; pi <= pdfDoc.numPages; pi++) {
        const p = await pdfDoc.getPage(pi);
        const tc = await p.getTextContent();
        const pageStr = tc.items.map((it) => it.str).join(" ").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (pageStr.includes(classTarget) || pageStr.includes(`sem${semNorm}`) && pageStr.includes(`div${divNorm}`)) {
          matched = pi;
          console.log(`[PDF] Matched class "${classTarget}" to Page ${pi}`);
          break;
        }
      }
    }
    targetPageIndex = matched || 1;
  }
  let rawTimetable = null;
  let cells = null;
  let positionedItems = [];
  let extractedText = "";
  let ocrUsed = false;
  const page = await pdfDoc.getPage(targetPageIndex);
  const textContent = await page.getTextContent();
  console.log("PAGE:", targetPageIndex);
  console.log("RAW PDF TEXT ITEMS:", textContent.items);
  if (textContent.items.length >= 10) {
    positionedItems = textContent.items.map((it) => ({
      text: String(it.str || "").trim(),
      x: it.transform[4],
      y: it.transform[5],
      w: it.width,
      h: it.height
    })).filter((it) => it.text.length > 0);
    extractedText = positionedItems.map((it) => it.text).join(" ");
    console.log("EXTRACTED PDF TEXT:", extractedText);
    console.log("POSITIONED ITEMS:", positionedItems);
    const recon = _reconstructGridFromItems(positionedItems, semFilter, divFilter, defaultDeptId, targetFacultyName);
    if (recon) {
      rawTimetable = recon.rawTimetable;
      cells = recon.gridCells;
    }
  }
  const digitalEntriesCount = rawTimetable ? Object.values(rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) : 0;
  if (digitalEntriesCount === 0 && pdfDoc.numPages > 1) {
    console.log("[PDF] Page yielded 0 entries. Scanning other pages for timetable...");
    for (let pi = 1; pi <= pdfDoc.numPages; pi++) {
      if (pi === targetPageIndex) continue;
      const altPage = await pdfDoc.getPage(pi);
      const altTc = await altPage.getTextContent();
      if (altTc.items.length >= 10) {
        const altItems = altTc.items.map((it) => ({
          text: String(it.str || "").trim(),
          x: it.transform[4],
          y: it.transform[5],
          w: it.width,
          h: it.height
        })).filter((it) => it.text.length > 0);
        const altRecon = _reconstructGridFromItems(altItems, semFilter, divFilter, defaultDeptId, targetFacultyName);
        const altCount = altRecon?.rawTimetable ? Object.values(altRecon.rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) : 0;
        if (altCount > 0) {
          targetPageIndex = pi;
          positionedItems = altItems;
          extractedText = altItems.map((it) => it.text).join(" ");
          rawTimetable = altRecon.rawTimetable;
          cells = altRecon.gridCells;
          console.log(`[PDF] Recovered ${altCount} entries from Page ${pi}`);
          break;
        }
      }
    }
  }
  const finalDigitalCount = rawTimetable ? Object.values(rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) : 0;
  if (finalDigitalCount === 0) {
    console.log("No selectable text found. Attempting OCR on rendered PDF page...");
    ocrUsed = true;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL("image/png");
      const ocrResult = await _runTesseractOCR(dataUrl);
      if (ocrResult && ocrResult.items && ocrResult.items.length >= 5) {
        positionedItems = ocrResult.items;
        extractedText = ocrResult.text;
        const ocrRecon = _reconstructGridFromItems(ocrResult.items, semFilter, divFilter, defaultDeptId, targetFacultyName);
        if (ocrRecon) {
          rawTimetable = ocrRecon.rawTimetable;
          cells = ocrRecon.gridCells;
        }
      }
      if (!rawTimetable || Object.values(rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) === 0) {
        if (ocrResult && ocrResult.lines) {
          rawTimetable = _parseSheetRows(ocrResult.lines.map((l) => [l]), semFilter, divFilter, targetScope === "class", defaultDeptId).timetable;
        }
      }
    } catch (ocrErr) {
      console.warn("Scanned PDF OCR failure:", ocrErr);
      throw new Error("Could not read timetable from scanned PDF: " + ocrErr.message);
    }
  }
  console.log("DETECTED TABLE CELLS:", cells || {});
  console.log("PARSED ENTRIES:", rawTimetable || {});
  const normalized = normalizeTimetable(rawTimetable, semFilter, divFilter, defaultDeptId, targetFacultyName);
  console.log("NORMALIZED ENTRIES:", normalized.previewLectures);
  const validation = validateTimetable(normalized);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  const fileInfo = {
    name: file.name,
    size: (file.size / 1024).toFixed(1) + " KB",
    type: "pdf"
  };
  return {
    ...normalized,
    fileInfo,
    note: ocrUsed ? `Extracted ${normalized.summary.totalLectures} entries via OCR from scanned PDF.` : `Extracted ${normalized.summary.totalLectures} entries from digital PDF (Page ${targetPageIndex}).`
  };
};
const parseImageTimetable = async (file, targetScope = "faculty", targetId = null, semFilter = "3rd Sem", divFilter = "Div 1", deptNameOrId = null) => {
  if (!file) throw new Error("No file provided.");
  console.log("[IMAGE] Loading image:", file.name, file.size, "bytes");
  let defaultDeptId = "DEP_AI";
  let targetFacultyName = "";
  if (deptNameOrId) {
    if (deptNameOrId.startsWith("DEP_")) defaultDeptId = deptNameOrId;
    else if (deptNameOrId.includes("IT") || deptNameOrId.includes("Information")) defaultDeptId = "DEP_IT";
    else if (deptNameOrId.includes("Computer")) defaultDeptId = "DEP_CP";
  } else if (targetId) {
    try {
      const facs = getFaculties();
      const f = facs.find((fac) => fac.id === targetId);
      if (f) {
        targetFacultyName = f.name || "";
        if (f.dept?.includes("IT") || f.dept?.includes("Information")) defaultDeptId = "DEP_IT";
        else if (f.dept?.includes("Computer")) defaultDeptId = "DEP_CP";
      }
    } catch (e) {
    }
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
  const ocrResult = await _runTesseractOCR(dataUrl);
  let rawTimetable = null;
  if (ocrResult && ocrResult.items && ocrResult.items.length >= 5) {
    const ocrRecon = _reconstructGridFromItems(ocrResult.items, semFilter, divFilter, defaultDeptId, targetFacultyName);
    if (ocrRecon) {
      rawTimetable = ocrRecon.rawTimetable;
    }
  }
  if (!rawTimetable || Object.values(rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) === 0) {
    if (ocrResult && ocrResult.lines && ocrResult.lines.length > 0) {
      const rows = ocrResult.lines.map((l) => [l]);
      rawTimetable = _parseSheetRows(rows, semFilter, divFilter, targetScope === "class", defaultDeptId).timetable;
    }
  }
  console.log("Image parsed entries:", rawTimetable);
  const normalized = normalizeTimetable(rawTimetable, semFilter, divFilter, defaultDeptId, targetFacultyName);
  console.log("Normalized entries:", normalized.previewLectures);
  const validation = validateTimetable(normalized);
  if (!validation.valid) {
    throw new Error("Could not recognize timetable from this image. Please ensure the image is clear and contains a readable timetable grid.");
  }
  const fileInfo = {
    name: file.name,
    size: (file.size / 1024).toFixed(1) + " KB",
    type: "image"
  };
  return {
    ...normalized,
    dataUrl,
    fileInfo,
    note: `Recognized ${normalized.summary.totalLectures} lectures from image via OCR.`
  };
};
const parseImageOrPdfFile = async (file, targetScope = "faculty", targetId = null, semFilter = "3rd Sem", divFilter = "Div 1", deptNameOrId = null) => {
  if (!file) throw new Error("No file provided.");
  const fn = file.name.toLowerCase();
  const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|gif|bmp|webp)$/.test(fn);
  const isPdf = file.type === "application/pdf" || fn.endsWith(".pdf");
  if (isPdf) {
    return parsePdfTimetable(file, targetScope, targetId, semFilter, divFilter, deptNameOrId);
  } else if (isImage) {
    return parseImageTimetable(file, targetScope, targetId, semFilter, divFilter, deptNameOrId);
  } else {
    throw new Error("Unsupported file format. Please upload Excel (.xlsx, .csv), PDF, or an image (.png, .jpg).");
  }
};
const downloadFacultyTimetableTemplate = (facultyName = "Faculty", deptName = "Department", semName = "3rd Semester") => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const headerRow = ["time", ...days];
  const aoa = [headerRow];
  TIME_SLOTS.forEach((slot) => {
    const row = [slot];
    days.forEach(() => {
      row.push(slot === "12:40 - 1:25" ? "LUNCH" : "");
    });
    aoa.push(row);
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 16 }, ...days.map(() => ({ wch: 20 }))];
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:G10");
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };
      ws[addr].s = ws[addr].s || {};
      ws[addr].s.alignment = { wrapText: true, vertical: "top" };
    }
  }
  XLSX.utils.book_append_sheet(wb, ws, "Timetable");
  const iws = XLSX.utils.aoa_to_sheet([
    ["Faculty", facultyName],
    ["Department", deptName],
    ["Semester", semName],
    ["", ""],
    ["HOW TO FILL:", "In each cell (Mon-Sat column), type the subject short name."],
    ["Multi-line:", "Line 1: Subject code (e.g. DBMS)"],
    ["", "Line 2: Class/Division (e.g. 3AI) \u2014 optional"],
    ["", "Line 3: Room number (e.g. 201 or IT-6) \u2014 optional"],
    ["Example cell:", "DBMS\n3AI (201)"],
    ["", ""],
    ["Leave blank", "for free periods"],
    ["For Lab:", 'Add "Lab" anywhere in cell, e.g. DBMS Lab\n201'],
    ["Time slots", TIME_SLOTS.join(", ")]
  ]);
  XLSX.utils.book_append_sheet(wb, iws, "Instructions");
  try {
    XLSX.writeFile(wb, "timetable_template_" + (facultyName || "faculty").replace(/[\s.]/g, "_") + ".xlsx");
  } catch (e) {
    throw new Error("Failed to download template: " + e.message);
  }
};
function Header({ searchQuery, setSearchQuery, activeTab, isUnlocked, onLockToggle }) {
  const facultyName = getFacultyName();
  const todayFormatted = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard & Overview";
      case "enter":
        return "Enter Attendance Session";
      case "list":
        return "View, Edit & Delete Attendance";
      case "dateView":
        return "Date-wise Attendance Log";
      case "topicView":
        return "Syllabus & Topic Log";
      case "analytics":
        return "Attendance Analytics & Averages";
      case "print":
        return "Print & Export Attendance Reports";
      case "manage":
        return "Manage Students & Master Subjects";
      default:
        return "Attendance Management System";
    }
  };
  return /* @__PURE__ */ React.createElement("header", { className: "app-header no-print" }, /* @__PURE__ */ React.createElement("div", { className: "header-brand" }, /* @__PURE__ */ React.createElement("div", { className: "brand-icon-box" }, /* @__PURE__ */ React.createElement(UserCheck, { size: 26 })), /* @__PURE__ */ React.createElement("div", { className: "brand-text" }, /* @__PURE__ */ React.createElement("h1", null, "ADIT Attendance"), /* @__PURE__ */ React.createElement("span", null, "ADIT College of Engineering"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "24px" } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "18px", color: "var(--navy-dark)", fontWeight: "700" } }, getTabTitle())), /* @__PURE__ */ React.createElement("div", { className: "header-right" }, ["list", "topicView", "analytics"].includes(activeTab) && /* @__PURE__ */ React.createElement("div", { className: "input-with-icon" }, /* @__PURE__ */ React.createElement(Search, { className: "input-icon", size: 16 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Search records...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      style: { width: "220px", height: "38px" }
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-secondary btn-sm",
      onClick: onLockToggle,
      style: {
        borderColor: isUnlocked ? "var(--status-present-border)" : "var(--border-color)",
        backgroundColor: isUnlocked ? "var(--status-present-bg)" : "white",
        color: isUnlocked ? "var(--status-present)" : "var(--text-muted)"
      },
      title: isUnlocked ? "Admin Unlocked - Click to Lock" : "Click to Enter Admin Security PIN"
    },
    isUnlocked ? /* @__PURE__ */ React.createElement(ShieldCheck, { size: 16 }) : /* @__PURE__ */ React.createElement(Lock, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, isUnlocked ? "Admin Unlocked" : "Protected Mode")
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "linear-gradient(135deg, var(--navy-primary) 0%, var(--blue-primary) 100%)",
        color: "white",
        padding: "8px 16px",
        borderRadius: "var(--radius-full)",
        fontSize: "13px",
        fontWeight: "700",
        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)"
      }
    },
    /* @__PURE__ */ React.createElement(User, { size: 15 }),
    /* @__PURE__ */ React.createElement("span", null, facultyName)
  ), /* @__PURE__ */ React.createElement("div", { className: "date-badge" }, /* @__PURE__ */ React.createElement(Calendar, { size: 15 }), /* @__PURE__ */ React.createElement("span", null, todayFormatted))));
}
function Sidebar({ activeTab, setActiveTab, onResetData }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "enter", label: "Enter Attendance", icon: UserCheck },
    { id: "list", label: "View & Edit Attendance", icon: FileText },
    { id: "dateView", label: "Date-wise View", icon: Calendar },
    { id: "topicView", label: "View Topic", icon: BookOpen },
    { id: "analytics", label: "Average & Stats", icon: BarChart3 },
    { id: "print", label: "Print Attendance", icon: Printer },
    { id: "manage", label: "Admin Panel", icon: ShieldCheck }
  ];
  return /* @__PURE__ */ React.createElement("aside", { className: "app-sidebar no-print" }, /* @__PURE__ */ React.createElement("div", { className: "sidebar-header" }, /* @__PURE__ */ React.createElement("span", { className: "college-tag" }, "Dept. of Computer Engg."), /* @__PURE__ */ React.createElement("h2", null, "ADIT Portal")), /* @__PURE__ */ React.createElement("nav", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("ul", { className: "nav-list" }, menuItems.map((item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return /* @__PURE__ */ React.createElement("li", { key: item.id }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `nav-item-btn ${isActive ? "active" : ""}`,
        onClick: () => setActiveTab(item.id)
      },
      /* @__PURE__ */ React.createElement(Icon, { size: 18 }),
      /* @__PURE__ */ React.createElement("span", null, item.label)
    ));
  }))), /* @__PURE__ */ React.createElement("div", { className: "sidebar-footer" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "reset-btn",
      onClick: () => {
        if (window.confirm("Reset all attendance data back to default sample data?")) {
          onResetData();
        }
      },
      title: "Reset database to default sample records"
    },
    /* @__PURE__ */ React.createElement(RotateCcw, { size: 14 }),
    /* @__PURE__ */ React.createElement("span", null, "Reset Sample Data")
  )));
}
function Dashboard({ setActiveTab, onSelectSessionForEdit }) {
  const analytics = calculateAnalytics();
  const recentSessions = getSessions().slice(0, 5);
  const subjects = getSubjects();
  const getSubjectName = (subjId) => {
    const s = subjects.find((item) => item.id === subjId);
    return s ? `${s.code} - ${s.name}` : subjId;
  };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "28px" } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      style: {
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
        border: "none",
        boxShadow: "var(--shadow-lg)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.9 } }, "ADIT Academic Attendance Portal"), /* @__PURE__ */ React.createElement("h2", { style: { color: "white", fontSize: "26px", marginTop: "6px", fontWeight: "800" } }, "Welcome to ADIT Attendance System"), /* @__PURE__ */ React.createElement("p", { style: { marginTop: "6px", opacity: 0.9, maxWidth: "600px", fontSize: "14px" } }, "Track daily student attendance, log covered topics, monitor class averages, handle date-wise logs, and generate printable reports.")), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn",
        style: {
          backgroundColor: "white",
          color: "var(--navy-primary)",
          fontWeight: "700",
          padding: "12px 24px",
          fontSize: "15px"
        },
        onClick: () => setActiveTab("enter")
      },
      /* @__PURE__ */ React.createElement(PlusCircle, { size: 18 }),
      "Enter Attendance Session"
    ))
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" } }, /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header-flex" }, /* @__PURE__ */ React.createElement("h3", { className: "card-title" }, /* @__PURE__ */ React.createElement(Clock, { size: 20, style: { color: "var(--blue-primary)" } }), "Recent Attendance Sessions"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setActiveTab("list") }, "View All ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Date"), /* @__PURE__ */ React.createElement("th", null, "Semester"), /* @__PURE__ */ React.createElement("th", null, "Subject"), /* @__PURE__ */ React.createElement("th", null, "Topic Covered"), /* @__PURE__ */ React.createElement("th", null, "Action"))), /* @__PURE__ */ React.createElement("tbody", null, recentSessions.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "5", style: { textAlign: "center", padding: "24px", color: "var(--text-muted)" } }, "No attendance sessions recorded yet.")) : recentSessions.map((sess) => {
    const subj = subjects.find((s) => s.id === sess.subjectId);
    const semLabel = sess.sem || subj && subj.sem || "5th Sem";
    return /* @__PURE__ */ React.createElement("tr", { key: sess.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700", whiteSpace: "nowrap" } }, sess.date), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#f1f5f9", color: "var(--navy-dark)", border: "1px solid var(--border-color)", fontWeight: "700" } }, semLabel)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "var(--blue-light)", color: "var(--blue-primary)", border: "1px solid var(--blue-sky)" } }, subj ? subj.code : sess.subjectId)), /* @__PURE__ */ React.createElement("td", { style: { maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, sess.topic || "No topic entered"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-secondary btn-sm",
        onClick: () => {
          if (onSelectSessionForEdit) onSelectSessionForEdit(sess);
          setActiveTab("list");
        }
      },
      "Details"
    )));
  }))))), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header-flex" }, /* @__PURE__ */ React.createElement("h3", { className: "card-title" }, /* @__PURE__ */ React.createElement(CheckCircle2, { size: 20, style: { color: "var(--blue-primary)" } }), "Subject Attendance Rates"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setActiveTab("analytics") }, "Full Analytics ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 14 }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } }, analytics.subjectStats.map((subj) => /* @__PURE__ */ React.createElement("div", { key: subj.id, style: { display: "flex", flexDirection: "column", gap: "6px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700" } }, /* @__PURE__ */ React.createElement("span", null, subj.code, " - ", subj.name), /* @__PURE__ */ React.createElement("span", { style: { color: subj.percentage >= 75 ? "var(--status-present)" : "var(--status-absent)" } }, subj.percentage, "% (", subj.sessionCount, " sessions)")), /* @__PURE__ */ React.createElement("div", { className: "progress-bar-container" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `progress-bar-fill ${subj.percentage >= 75 ? "good" : "warning"}`,
      style: { width: `${subj.percentage}%` }
    }
  ))))))));
}
function EnterAttendance({ onSaved, showToast }) {
  const departments = getDepartments();
  const subjects = getSubjects();
  const [date, setDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [selectedDept, setSelectedDept] = useState(departments[0]?.name || "AI & Data Science");
  const [sem, setSem] = useState("3rd Sem");
  const [division, setDivision] = useState("Div 1");
  const [academicYear, setAcademicYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [subjectId, setSubjectId] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [topic, setTopic] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const { dayName, lectures: scheduledLectures } = getScheduledLecturesForDate(date);
  useEffect(() => {
    const deptSubjs = subjects.filter(
      (s) => !s.dept || s.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4))
    );
    if (deptSubjs.length > 0) {
      if (!subjectId || !deptSubjs.some((s) => s.id === subjectId)) {
        setSubjectId(deptSubjs[0].id);
      }
    } else if (subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
  }, [selectedDept, subjects]);
  useEffect(() => {
    if (scheduledLectures && scheduledLectures.length > 0) {
      const firstSess = scheduledLectures[0];
      setSubjectId(firstSess.subjectId);
      setSelectedTimeSlot(firstSess.time);
      if (firstSess.sem) setSem(normalizeSem(firstSess.sem));
      if (firstSess.div) setDivision(normalizeDiv(firstSess.div));
      if (firstSess.departmentId) {
        const foundDept = departments.find(
          (d) => d.id === firstSess.departmentId || d.name.toLowerCase().includes(firstSess.departmentId.toLowerCase())
        );
        if (foundDept) setSelectedDept(foundDept.name);
      }
    }
  }, [date]);
  const handleSelectScheduledLecture = (lec) => {
    setSubjectId(lec.subjectId);
    setSelectedTimeSlot(lec.time);
    if (lec.sem) setSem(normalizeSem(lec.sem));
    if (lec.div) setDivision(normalizeDiv(lec.div));
    if (lec.departmentId) {
      const foundDept = departments.find(
        (d) => d.id === lec.departmentId || d.name.toLowerCase().includes(lec.departmentId.toLowerCase())
      );
      if (foundDept) setSelectedDept(foundDept.name);
    }
  };
  const activeClass = useMemo(() => {
    return findClassByCriteria(selectedDept, sem, division, academicYear) || getOrCreateClass(selectedDept, sem, division, academicYear);
  }, [selectedDept, sem, division, academicYear]);
  const classStudents = useMemo(() => {
    if (activeClass && activeClass.id) {
      const enrolled = getStudentsByClassId(activeClass.id);
      if (enrolled && enrolled.length > 0) return enrolled;
    }
    const criteriaEnrolled = getStudentsForClassCriteria(selectedDept, sem, division, academicYear);
    if (criteriaEnrolled && criteriaEnrolled.length > 0) return criteriaEnrolled;
    return getStudents();
  }, [activeClass, selectedDept, sem, division, academicYear]);
  const [records, setRecords] = useState({});
  const [remarks, setRemarks] = useState({});
  useEffect(() => {
    setRecords((prev) => {
      const nextRecords = { ...prev };
      classStudents.forEach((s) => {
        if (!nextRecords[s.id]) {
          nextRecords[s.id] = "present";
        }
      });
      return nextRecords;
    });
  }, [classStudents]);
  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };
  const handleRemarkChange = (studentId, text) => {
    setRemarks((prev) => ({
      ...prev,
      [studentId]: text
    }));
  };
  const markAllStatus = (status) => {
    const updated = {};
    classStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subjectId) {
      alert("Please select a subject!");
      return;
    }
    if (!topic.trim()) {
      if (!window.confirm("Topic field is empty. Do you want to submit attendance without entering a topic?")) {
        return;
      }
    }
    const newSession = {
      date,
      subjectId,
      department: selectedDept,
      sem,
      division,
      academicYear,
      classId: activeClass ? activeClass.id : null,
      timeSlot: selectedTimeSlot,
      topic: topic.trim(),
      records,
      remarks
    };
    saveSession(newSession);
    if (showToast) showToast(`Attendance recorded for ${selectedDept} \u2022 ${sem} \u2022 ${division}!`);
    if (onSaved) onSaved();
    setTopic("");
  };
  const filteredStudents = classStudents.filter(
    (s) => s.name && s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.rollNo && String(s.rollNo).includes(studentSearch) || s.enrollmentNo && String(s.enrollmentNo).toLowerCase().includes(studentSearch.toLowerCase())
  );
  const presentCount = classStudents.filter((s) => (records[s.id] || "present") === "present").length;
  const absentCount = classStudents.filter((s) => records[s.id] === "absent").length;
  const getSubjectObj = (id) => subjects.find((s) => s.id === id) || { code: id, name: id };
  return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header-flex", style: { borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", flexWrap: "wrap", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "card-title", style: { fontSize: "22px" } }, /* @__PURE__ */ React.createElement(Calendar, { size: 24, style: { color: "var(--blue-primary)" } }), "Enter Lecture Attendance"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" } }, "Select class & session details, enter topic covered, and mark enrolled student attendance.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary",
      onClick: () => setShowTimetableModal(true),
      style: { borderColor: "var(--blue-accent)", color: "var(--blue-primary)", fontWeight: "700" }
    },
    /* @__PURE__ */ React.createElement(UploadCloud, { size: 16 }),
    "Upload Timetable (PNG, JPG, PDF, Excel)"
  )), scheduledLectures && scheduledLectures.length > 0 && /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        backgroundColor: "var(--blue-light)",
        border: "1px solid var(--blue-sky)",
        borderRadius: "var(--radius-md)",
        padding: "14px 18px",
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(Sparkles, { size: 20, style: { color: "var(--blue-primary)" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "var(--navy-primary)", letterSpacing: "0.05em" } }, "Timetable Auto-Schedule (", dayName, ")"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", fontWeight: "700", color: "var(--navy-dark)" } }, scheduledLectures.length, " Lecture(s) Scheduled on ", dayName))),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } }, scheduledLectures.map((lec, idx) => {
      const isSelected = subjectId === lec.subjectId && selectedTimeSlot === lec.time;
      const subj = getSubjectObj(lec.subjectId);
      const lectureSem = lec.sem || subj.sem || "3rd Sem";
      const lectureDiv = lec.div || "Div 1";
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: idx,
          type: "button",
          onClick: () => handleSelectScheduledLecture(lec),
          className: "btn btn-sm",
          style: {
            backgroundColor: isSelected ? "var(--navy-primary)" : "white",
            color: isSelected ? "white" : "var(--navy-dark)",
            border: isSelected ? "1px solid var(--navy-primary)" : "1px solid var(--blue-sky)",
            fontWeight: "700",
            padding: "8px 14px",
            borderRadius: "var(--radius-md)",
            boxShadow: isSelected ? "0 2px 6px rgba(30, 58, 138, 0.25)" : "none",
            cursor: "pointer"
          }
        },
        /* @__PURE__ */ React.createElement(Clock, { size: 13, style: { color: isSelected ? "white" : "var(--blue-primary)" } }),
        /* @__PURE__ */ React.createElement("span", null, "Lecture #", idx + 1, ": ", lec.time),
        /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.8, fontSize: "11px", marginLeft: "4px" } }, "(", subj.code, " \u2022 ", lectureSem, " \u2022 ", lectureDiv, ")")
      );
    }))
  ), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, style: { marginTop: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "20px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(Calendar, { size: 14, style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("span", null, "Attendance Date")), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      className: "form-control",
      value: date,
      onChange: (e) => setDate(e.target.value),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(Clock, { size: 14, style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("span", null, "Lecture Time Slot")), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. 10:00 - 10:50",
      value: selectedTimeSlot,
      onChange: (e) => setSelectedTimeSlot(e.target.value),
      style: { fontWeight: "700" }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(Building2, { size: 14, style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("span", null, "Department")), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedDept,
      onChange: (e) => setSelectedDept(e.target.value),
      style: { fontWeight: "700" }
    },
    departments.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id || d.code, value: d.name }, d.name))
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(GraduationCap, { size: 14, style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("span", null, "Academic Semester")), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: sem,
      onChange: (e) => setSem(e.target.value),
      style: { fontWeight: "700" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "1st Sem" }, "1st Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "2nd Sem" }, "2nd Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "3rd Sem" }, "3rd Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "4th Sem" }, "4th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "5th Sem" }, "5th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "6th Sem" }, "6th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "7th Sem" }, "7th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "8th Sem" }, "8th Semester")
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(Layers, { size: 14, style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("span", null, "Division")), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: division,
      onChange: (e) => setDivision(e.target.value),
      style: { fontWeight: "700" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "Div 1" }, "Division 1 (Div 1)"),
    /* @__PURE__ */ React.createElement("option", { value: "Div 2" }, "Division 2 (Div 2)"),
    /* @__PURE__ */ React.createElement("option", { value: "Div 3" }, "Division 3 (Div 3)")
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(BookOpen, { size: 14, style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("span", null, "Subject / Course")), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: subjectId,
      onChange: (e) => setSubjectId(e.target.value),
      required: true
    },
    subjects.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.code, " - ", s.name, " (", s.faculty || "Faculty", ")"))
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group", style: { gridColumn: "span 2" } }, /* @__PURE__ */ React.createElement("label", null, "Lecture Topic Covered *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. React Hooks, Database Normalization BCNF, Graph Algorithms...",
      value: topic,
      onChange: (e) => setTopic(e.target.value),
      required: true
    }
  ))), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        backgroundColor: "#f8fafc",
        padding: "14px 18px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        marginBottom: "18px"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "38px",
      height: "38px",
      borderRadius: "8px",
      backgroundColor: "#e0f2fe",
      color: "#0284c7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "800"
    } }, /* @__PURE__ */ React.createElement(GraduationCap, { size: 20 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "14px", fontWeight: "800", color: "#0f172a" } }, selectedDept, " \u2022 ", sem, " \u2022 ", division), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: "700" } }, academicYear), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#ecfdf5", color: "#059669", fontWeight: "700" } }, classStudents.length, " Enrolled Students")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, "Students dynamically loaded from Class Roster"))),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "input-with-icon", style: { minWidth: "180px", maxWidth: "240px" } }, /* @__PURE__ */ React.createElement(Search, { className: "input-icon", size: 15 }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "form-control",
        placeholder: "Search roll, name...",
        value: studentSearch,
        onChange: (e) => setStudentSearch(e.target.value),
        style: { height: "34px", fontSize: "12.5px" }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "6px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: () => markAllStatus("present"),
        title: "Mark all as Present"
      },
      /* @__PURE__ */ React.createElement(CheckSquare, { size: 13, style: { color: "var(--status-present)" } }),
      /* @__PURE__ */ React.createElement("span", null, "All Present")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: () => markAllStatus("absent"),
        title: "Mark all as Absent"
      },
      /* @__PURE__ */ React.createElement(XSquare, { size: 13, style: { color: "var(--status-absent)" } }),
      /* @__PURE__ */ React.createElement("span", null, "All Absent")
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", fontSize: "12px", fontWeight: "700" } }, /* @__PURE__ */ React.createElement("span", { className: "badge badge-present" }, "Present: ", presentCount), /* @__PURE__ */ React.createElement("span", { className: "badge badge-absent" }, "Absent: ", absentCount)))
  ), /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { border: "1px solid #e2e8f0", borderRadius: "10px" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "80px" } }, "Roll No"), /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", null, "Enrollment No"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center", width: "200px" } }, "Attendance Status"), /* @__PURE__ */ React.createElement("th", null, "Remarks / Reason"))), /* @__PURE__ */ React.createElement("tbody", null, filteredStudents.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "5", style: { textAlign: "center", padding: "30px", color: "var(--text-muted)" } }, "No enrolled students found for ", /* @__PURE__ */ React.createElement("strong", null, selectedDept, " \u2022 ", sem, " \u2022 ", division, " (", academicYear, ")"), ".", /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12px", color: "#64748b", marginTop: "6px" } }, "Tip: Go to ", /* @__PURE__ */ React.createElement("strong", null, "Admin Panel \u2192 Classes"), " to add or bulk upload students to this class."))) : filteredStudents.map((student) => {
    const currentStatus = records[student.id] || "present";
    return /* @__PURE__ */ React.createElement("tr", { key: student.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800", color: "var(--navy-primary)" } }, student.rollNo), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "600" } }, /* @__PURE__ */ React.createElement("div", null, student.name), student.email && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", color: "#64748b" } }, student.email)), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "12px", color: "var(--text-muted)" } }, student.enrollmentNo), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { className: "attendance-toggle-group" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: `toggle-option ${currentStatus === "present" ? "active-present" : ""}`,
        onClick: () => handleStatusChange(student.id, "present")
      },
      "Present"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: `toggle-option ${currentStatus === "absent" ? "active-absent" : ""}`,
        onClick: () => handleStatusChange(student.id, "absent")
      },
      "Absent"
    ))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "form-control",
        placeholder: "Optional remarks...",
        value: remarks[student.id] || "",
        onChange: (e) => handleRemarkChange(student.id, e.target.value),
        style: { height: "34px", fontSize: "13px" }
      }
    )));
  })))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "16px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "btn btn-primary",
      style: { padding: "12px 32px", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }
    },
    /* @__PURE__ */ React.createElement(Save, { size: 18 }),
    /* @__PURE__ */ React.createElement("span", null, "Save Attendance Session")
  ))), showTimetableModal && /* @__PURE__ */ React.createElement(
    TimetableModal,
    {
      onClose: () => setShowTimetableModal(false),
      onApplied: () => {
        if (showToast) showToast("Timetable schedule updated & synced!");
      },
      showToast
    }
  ));
}
function AttendanceSheetView({ showToast }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState("SUB_DS");
  const [selectedClass, setSelectedClass] = useState("3");
  const [selectedTerm, setSelectedTerm] = useState("Odd");
  const [academicYear, setAcademicYear] = useState("2026-27");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [collegeTitle, setCollegeTitle] = useState(getCollegeName());
  const [showCollegePicker, setShowCollegePicker] = useState(false);
  const [hoveredSession, setHoveredSession] = useState(null);
  const students = getStudents();
  const subjects = getSubjects();
  const allSessions = getSessions();
  const activeAllocation = useMemo(() => {
    return getAllocationForSubject(selectedSubjectId);
  }, [selectedSubjectId]);
  const activeDivisions = activeAllocation.divisions || [
    { id: "1", name: "Div 1", facultyName: "Prof. R. K. Patel" },
    { id: "2", name: "Div 2", facultyName: "Dr. S. M. Mehta" },
    { id: "3", name: "Div 3", facultyName: "Prof. A. N. Shah" }
  ];
  const activeSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || {
      code: "102040304",
      name: "DATA STRUCTURES",
      dept: "Computer",
      class: "3"
    };
  }, [subjects, selectedSubjectId]);
  const subjectSessions = useMemo(() => {
    return allSessions.filter((s) => s.subjectId === selectedSubjectId).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allSessions, selectedSubjectId]);
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchClass = selectedClass === "ALL" || String(student.class) === String(selectedClass);
      if (!matchClass) return false;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery = !query || student.enrollmentNo.toLowerCase().includes(query) || student.name && student.name.toLowerCase().includes(query) || student.rollNo && student.rollNo.toString().includes(query);
      if (!matchQuery) return false;
      let presentCount = 0;
      let totalConducted2 = subjectSessions.length;
      subjectSessions.forEach((sess) => {
        const st = sess.records && sess.records[student.id] || "";
        if (st === "present" || st === "late") presentCount++;
      });
      const pct = totalConducted2 > 0 ? presentCount / totalConducted2 * 100 : 0;
      if (statusFilter === "SHORTAGE") return pct < 75;
      if (statusFilter === "ELIGIBLE") return pct >= 75;
      return true;
    });
  }, [students, searchQuery, statusFilter, subjectSessions]);
  const formatDateHeader = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}`;
    }
    return dateStr;
  };
  const handleCellClick = (session, studentId) => {
    const currentStatus = session.records && session.records[studentId] || "absent";
    let nextStatus = "present";
    if (currentStatus === "present") nextStatus = "absent";
    else if (currentStatus === "absent") nextStatus = "od";
    else if (currentStatus === "od") nextStatus = "present";
    const updatedRecords = { ...session.records || {}, [studentId]: nextStatus };
    const updatedSession = { ...session, records: updatedRecords };
    saveSession(updatedSession);
    if (showToast) {
      showToast(`Updated Roll #${studentId}: marked as ${nextStatus.toUpperCase()}`);
    }
  };
  const handleExportExcel = () => {
    const headerRow1 = [collegeTitle];
    const headerRow2 = [`Academic Year : ${academicYear}`, `Term: ${selectedTerm}`];
    const headerRow3 = [`Course Code : ${activeSubject.code} ${activeSubject.name}`];
    const headerRow4 = [`Department : ${activeSubject.dept || "Computer"}`, `Class : ${selectedClass}`];
    const emptyRow = [];
    const dateHeaders = subjectSessions.map((s) => formatDateHeader(s.date));
    const tableHeader = [
      "Sr No",
      "Enrollment No",
      ...dateHeaders,
      "Enrollment No",
      "Present",
      "Out of",
      "Percentage",
      "Percentage(DC)"
    ];
    const dataRows = filteredStudents.map((st, idx) => {
      let present = 0;
      let od = 0;
      const total = subjectSessions.length;
      const dateStatuses = subjectSessions.map((sess) => {
        const status = sess.records && sess.records[st.id] || "";
        if (status === "present") {
          present++;
          return "P";
        } else if (status === "od") {
          od++;
          return "O*";
        } else if (status === "late") {
          present++;
          return "P";
        } else if (status === "absent") {
          return "A";
        }
        return "-";
      });
      const pct = total > 0 ? (present / total * 100).toFixed(2) : "0.00";
      const pctDC = total > 0 ? (od / total * 100).toFixed(2) : "0.00";
      return [
        idx + 1,
        st.enrollmentNo,
        ...dateStatuses,
        st.enrollmentNo,
        present,
        total,
        Number(pct),
        Number(pctDC)
      ];
    });
    const summaryRow = ["Total Present", ""];
    subjectSessions.forEach((sess) => {
      let count = 0;
      filteredStudents.forEach((st) => {
        const s = sess.records && sess.records[st.id];
        if (s === "present" || s === "late") count++;
      });
      summaryRow.push(count);
    });
    summaryRow.push("", "", "", "", "");
    const sheetData = [
      headerRow1,
      headerRow2,
      headerRow3,
      headerRow4,
      emptyRow,
      tableHeader,
      ...dataRows,
      summaryRow
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 8 },
      // Sr No
      { wch: 18 },
      // Enrollment No
      ...subjectSessions.map(() => ({ wch: 7 })),
      // Dates
      { wch: 18 },
      // Enrollment No repeated
      { wch: 9 },
      // Present
      { wch: 8 },
      // Out of
      { wch: 12 },
      // Percentage
      { wch: 15 }
      // Percentage(DC)
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet");
    const fileName = `${activeSubject.code}_Class_${selectedClass}_Attendance_${academicYear}.xlsx`;
    XLSX.writeFile(wb, fileName);
    if (showToast) showToast("Excel sheet downloaded successfully!");
  };
  const handlePrint = () => {
    window.print();
  };
  const changeCollege = (name) => {
    setCollegeTitle(name);
    setCollegeName(name);
    setShowCollegePicker(false);
    if (showToast) showToast(`College set to: ${name}`);
  };
  const totalConducted = subjectSessions.length;
  let totalPresentSum = 0;
  let eligibleCount = 0;
  let shortageCount = 0;
  filteredStudents.forEach((st) => {
    let p = 0;
    subjectSessions.forEach((sess) => {
      const s = sess.records && sess.records[st.id];
      if (s === "present" || s === "late") p++;
    });
    const pct = totalConducted > 0 ? p / totalConducted * 100 : 0;
    totalPresentSum += pct;
    if (pct >= 75) eligibleCount++;
    else shortageCount++;
  });
  const classAverage = filteredStudents.length > 0 ? (totalPresentSum / filteredStudents.length).toFixed(2) : "0.00";
  return /* @__PURE__ */ React.createElement("div", { className: "erp-attendance-view" }, /* @__PURE__ */ React.createElement("div", { className: "card no-print", style: { marginBottom: "20px", padding: "16px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" } }, "Select Course / Subject"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedSubjectId,
      onChange: (e) => setSelectedSubjectId(e.target.value),
      style: { height: "36px", minWidth: "260px", fontWeight: "600" }
    },
    subjects.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.code, " - ", s.name))
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" } }, "Class / Div"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedClass,
      onChange: (e) => setSelectedClass(e.target.value),
      style: { height: "36px", minWidth: "130px", fontWeight: "600" }
    },
    activeDivisions.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id, value: d.id }, d.name, " (", d.facultyName ? d.facultyName.split(" ").slice(-1)[0] : "Faculty", ")")),
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Divisions")
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" } }, "Term & Year"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "6px" } }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedTerm,
      onChange: (e) => setSelectedTerm(e.target.value),
      style: { height: "36px", width: "85px", fontWeight: "600" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "Odd" }, "Odd"),
    /* @__PURE__ */ React.createElement("option", { value: "Even" }, "Even")
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: academicYear,
      onChange: (e) => setAcademicYear(e.target.value),
      style: { height: "36px", width: "100px", fontWeight: "600" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "2026-27" }, "2026-27"),
    /* @__PURE__ */ React.createElement("option", { value: "2025-26" }, "2025-26")
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" } }, "Attendance Status"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: statusFilter,
      onChange: (e) => setStatusFilter(e.target.value),
      style: { height: "36px", minWidth: "150px" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Students (", students.length, ")"),
    /* @__PURE__ */ React.createElement("option", { value: "SHORTAGE" }, "Shortage < 75% (", shortageCount, ")"),
    /* @__PURE__ */ React.createElement("option", { value: "ELIGIBLE" }, "Eligible \u2265 75% (", eligibleCount, ")")
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" } }, "Search Student"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(Search, { size: 15, style: { position: "absolute", left: "10px", top: "10px", color: "var(--text-muted)" } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Enrollment / Name...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      style: { height: "36px", paddingLeft: "32px", width: "170px" }
    }
  )))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: "10px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-secondary",
      onClick: handleExportExcel,
      style: { height: "38px", padding: "0 14px", display: "flex", alignItems: "center", gap: "6px" },
      title: "Download formatted Excel (.xlsx) file"
    },
    /* @__PURE__ */ React.createElement(FileSpreadsheet, { size: 16, style: { color: "#059669" } }),
    /* @__PURE__ */ React.createElement("span", null, "Export Excel")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary",
      onClick: handlePrint,
      style: { height: "38px", padding: "0 14px", display: "flex", alignItems: "center", gap: "6px" },
      title: "Print official academic sheet"
    },
    /* @__PURE__ */ React.createElement(Printer, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, "Print Sheet")
  )))), /* @__PURE__ */ React.createElement("div", { className: "no-print", style: { marginBottom: "8px", display: "flex", justifyContent: "flex-end", gap: "8px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowCollegePicker(!showCollegePicker),
      style: {
        background: "none",
        border: "none",
        color: "var(--blue-primary)",
        fontSize: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        textDecoration: "underline"
      }
    },
    /* @__PURE__ */ React.createElement(Building2, { size: 13 }),
    /* @__PURE__ */ React.createElement("span", null, "Switch College Header (", collegeTitle.includes("GH") ? "GCET" : "ADIT", ")"),
    /* @__PURE__ */ React.createElement(ChevronDown, { size: 12 })
  ), showCollegePicker && /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    zIndex: 50,
    background: "white",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    boxShadow: "var(--shadow-lg)",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-sm btn-secondary",
      style: { textAlign: "left", fontSize: "12px" },
      onClick: () => changeCollege("G H Patel College of Engineering & Technology")
    },
    "G H Patel College of Engineering & Technology (GCET)"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-sm btn-secondary",
      style: { textAlign: "left", fontSize: "12px" },
      onClick: () => changeCollege("A D Patel Institute of Technology (ADIT)")
    },
    "A D Patel Institute of Technology (ADIT)"
  ))), /* @__PURE__ */ React.createElement("div", { className: "erp-sheet-card" }, /* @__PURE__ */ React.createElement("div", { className: "erp-sheet-header" }, /* @__PURE__ */ React.createElement("h2", { className: "erp-college-title" }, collegeTitle), /* @__PURE__ */ React.createElement("div", { className: "erp-header-row" }, /* @__PURE__ */ React.createElement("span", null, "Academic Year : ", academicYear), /* @__PURE__ */ React.createElement("span", null, "Term: ", selectedTerm)), /* @__PURE__ */ React.createElement("div", { className: "erp-header-row erp-course-title" }, /* @__PURE__ */ React.createElement("span", null, "Course Code : ", activeSubject.code, " ", activeSubject.name)), /* @__PURE__ */ React.createElement("div", { className: "erp-header-row" }, /* @__PURE__ */ React.createElement("span", null, "Department : ", activeSubject.dept || "Computer"), /* @__PURE__ */ React.createElement("span", null, "Class : ", selectedClass))), /* @__PURE__ */ React.createElement("div", { className: "erp-table-scroll-container" }, /* @__PURE__ */ React.createElement("table", { className: "erp-attendance-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "erp-th-sticky-sr" }, "Sr No"), /* @__PURE__ */ React.createElement("th", { className: "erp-th-sticky-enroll" }, "Enrollment No"), subjectSessions.map((sess) => {
    const label = formatDateHeader(sess.date);
    return /* @__PURE__ */ React.createElement(
      "th",
      {
        key: sess.id,
        className: "erp-th-date",
        title: sess.topic ? `Date: ${sess.date}
Topic: ${sess.topic}` : `Date: ${sess.date}`
      },
      label
    );
  }), /* @__PURE__ */ React.createElement("th", { className: "erp-th-enroll-repeat" }, "Enrollment No"), /* @__PURE__ */ React.createElement("th", { className: "erp-th-stat" }, "Present"), /* @__PURE__ */ React.createElement("th", { className: "erp-th-stat" }, "Out of"), /* @__PURE__ */ React.createElement("th", { className: "erp-th-stat" }, "Percentage"), /* @__PURE__ */ React.createElement("th", { className: "erp-th-stat" }, "Percentage(DC)"))), /* @__PURE__ */ React.createElement("tbody", null, filteredStudents.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: subjectSessions.length + 6, style: { textAlign: "center", padding: "30px", color: "#666" } }, "No students found matching current filter or search criteria.")) : filteredStudents.map((student, idx) => {
    let presentCount = 0;
    let odCount = 0;
    const total = subjectSessions.length;
    return /* @__PURE__ */ React.createElement("tr", { key: student.id }, /* @__PURE__ */ React.createElement("td", { className: "erp-td-sticky-sr" }, idx + 1), /* @__PURE__ */ React.createElement(
      "td",
      {
        className: "erp-td-sticky-enroll",
        title: `Roll #${student.rollNo}: ${student.name}`
      },
      student.enrollmentNo
    ), subjectSessions.map((sess) => {
      const status = sess.records && sess.records[student.id] || "";
      let cellClass = "erp-cell-empty";
      let displayText = "-";
      if (status === "present") {
        presentCount++;
        cellClass = "erp-cell-p";
        displayText = "P";
      } else if (status === "late") {
        presentCount++;
        cellClass = "erp-cell-p";
        displayText = "P";
      } else if (status === "absent") {
        cellClass = "erp-cell-a";
        displayText = "A";
      } else if (status === "od") {
        odCount++;
        cellClass = "erp-cell-od";
        displayText = "O*";
      }
      return /* @__PURE__ */ React.createElement(
        "td",
        {
          key: sess.id,
          className: `erp-attendance-cell ${cellClass}`,
          onClick: () => handleCellClick(sess, student.id),
          title: `Click to toggle status for ${student.name} on ${sess.date} (Current: ${status.toUpperCase()})`
        },
        displayText
      );
    }), /* @__PURE__ */ React.createElement("td", { className: "erp-td-enroll-repeat" }, student.enrollmentNo), /* @__PURE__ */ React.createElement("td", { className: "erp-td-stat", style: { fontWeight: "700" } }, presentCount), /* @__PURE__ */ React.createElement("td", { className: "erp-td-stat" }, total), /* @__PURE__ */ React.createElement("td", { className: "erp-td-stat", style: { fontWeight: "700", color: total > 0 && presentCount / total * 100 < 75 ? "#b91c1c" : "#15803d" } }, total > 0 ? (presentCount / total * 100).toFixed(presentCount / total === 1 ? 0 : 2) : 0), /* @__PURE__ */ React.createElement("td", { className: "erp-td-stat" }, total > 0 && odCount > 0 ? (odCount / total * 100).toFixed(2) : 0));
  })), filteredStudents.length > 0 && subjectSessions.length > 0 && /* @__PURE__ */ React.createElement("tfoot", null, /* @__PURE__ */ React.createElement("tr", { className: "erp-footer-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: 2, style: { textAlign: "right", fontWeight: "700", paddingRight: "12px" } }, "Total Present:"), subjectSessions.map((sess) => {
    let count = 0;
    filteredStudents.forEach((st) => {
      const s = sess.records && sess.records[st.id];
      if (s === "present" || s === "late") count++;
    });
    return /* @__PURE__ */ React.createElement("td", { key: sess.id, className: "erp-td-stat", style: { fontWeight: "700" } }, count);
  }), /* @__PURE__ */ React.createElement("td", { className: "erp-td-enroll-repeat" }, "-"), /* @__PURE__ */ React.createElement("td", { className: "erp-td-stat" }, "-"), /* @__PURE__ */ React.createElement("td", { className: "erp-td-stat" }, "-"), /* @__PURE__ */ React.createElement("td", { className: "erp-td-stat", style: { fontWeight: "800" } }, classAverage, "%"), /* @__PURE__ */ React.createElement("td", { className: "erp-td-stat" }, "-"))))), /* @__PURE__ */ React.createElement("div", { className: "erp-sheet-footer-info" }, /* @__PURE__ */ React.createElement("div", { className: "erp-legend-box" }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "700", color: "#475569", marginRight: "6px" } }, "Legend:"), /* @__PURE__ */ React.createElement("span", { className: "erp-legend-item" }, /* @__PURE__ */ React.createElement("span", { className: "erp-legend-swatch erp-cell-p" }, "P"), " Present"), /* @__PURE__ */ React.createElement("span", { className: "erp-legend-item" }, /* @__PURE__ */ React.createElement("span", { className: "erp-legend-swatch erp-cell-a" }, "A"), " Absent"), /* @__PURE__ */ React.createElement("span", { className: "erp-legend-item" }, /* @__PURE__ */ React.createElement("span", { className: "erp-legend-swatch erp-cell-od" }, "O*"), " Duty Certificate (OD)"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", color: "#94a3b8", marginLeft: "12px" } }, "(Tip: Click any cell to toggle P \u2194 A \u2194 O*)")), /* @__PURE__ */ React.createElement("div", { className: "erp-stats-strip" }, /* @__PURE__ */ React.createElement("span", null, "Total Students: ", /* @__PURE__ */ React.createElement("strong", null, filteredStudents.length)), /* @__PURE__ */ React.createElement("span", null, "Total Lectures: ", /* @__PURE__ */ React.createElement("strong", null, totalConducted)), /* @__PURE__ */ React.createElement("span", null, "Class Average: ", /* @__PURE__ */ React.createElement("strong", null, classAverage, "%")), /* @__PURE__ */ React.createElement("span", null, "Shortage (<75%): ", /* @__PURE__ */ React.createElement("strong", { style: { color: "#b91c1c" } }, shortageCount))))));
}
function AttendanceList({ searchQuery, showToast }) {
  const sessions = getSessions();
  const subjects = getSubjects();
  const students = getStudents();
  const [subView, setSubView] = useState("sheet");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [editingSession, setEditingSession] = useState(null);
  const [viewingSession, setViewingSession] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editRecords, setEditRecords] = useState({});
  const [editRemarks, setEditRemarks] = useState({});
  const getSubjectObj = (subjId) => subjects.find((s) => s.id === subjId) || { code: subjId, name: subjId };
  const filteredSessions = sessions.filter((sess) => {
    const subjMatch = selectedSubject === "ALL" || sess.subjectId === selectedSubject;
    const query = searchQuery.toLowerCase();
    const topicMatch = (sess.topic || "").toLowerCase().includes(query);
    const dateMatch = (sess.date || "").toLowerCase().includes(query);
    const subjObj = getSubjectObj(sess.subjectId);
    const subjNameMatch = (subjObj.name || "").toLowerCase().includes(query) || (subjObj.code || "").toLowerCase().includes(query);
    return subjMatch && (topicMatch || dateMatch || subjNameMatch || !query);
  });
  const startEdit = (sess) => {
    setEditingSession(sess);
    setEditDate(sess.date);
    setEditTopic(sess.topic || "");
    setEditRecords({ ...sess.records });
    setEditRemarks({ ...sess.remarks || {} });
  };
  const saveEdit = () => {
    if (!editingSession) return;
    const updated = {
      ...editingSession,
      date: editDate,
      topic: editTopic.trim(),
      records: editRecords,
      remarks: editRemarks
    };
    saveSession(updated);
    setEditingSession(null);
    if (showToast) showToast("Attendance session successfully updated!");
  };
  const confirmDelete = () => {
    if (deletingSessionId) {
      deleteSession(deletingSessionId);
      setDeletingSessionId(null);
      if (showToast) showToast("Attendance session deleted!");
    }
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "no-print", style: { display: "flex", gap: "10px", marginBottom: "16px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `btn ${subView === "sheet" ? "btn-primary" : "btn-secondary"}`,
      onClick: () => setSubView("sheet"),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 18px",
        fontWeight: "700",
        boxShadow: subView === "sheet" ? "var(--shadow-md)" : "none"
      }
    },
    /* @__PURE__ */ React.createElement(Table2, { size: 17 }),
    /* @__PURE__ */ React.createElement("span", null, "College Attendance Sheet (ERP Grid)")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `btn ${subView === "logs" ? "btn-primary" : "btn-secondary"}`,
      onClick: () => setSubView("logs"),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "9px 18px",
        fontWeight: "700",
        boxShadow: subView === "logs" ? "var(--shadow-md)" : "none"
      }
    },
    /* @__PURE__ */ React.createElement(List, { size: 17 }),
    /* @__PURE__ */ React.createElement("span", null, "Session Records Log & Edit")
  )), subView === "sheet" ? /* @__PURE__ */ React.createElement(AttendanceSheetView, { showToast }) : /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header-flex", style: { borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", flexWrap: "wrap", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "card-title", style: { fontSize: "22px" } }, /* @__PURE__ */ React.createElement(FileText, { size: 24, style: { color: "var(--blue-primary)" } }), "Attendance Records Log"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" } }, "View, edit topics/statuses, or delete attendance session records.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement(Filter, { size: 16, style: { color: "var(--text-muted)" } }), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedSubject,
      onChange: (e) => setSelectedSubject(e.target.value),
      style: { width: "220px", height: "38px" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Subjects"),
    subjects.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.code, " - ", s.name))
  ))), /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { marginTop: "20px" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Date"), /* @__PURE__ */ React.createElement("th", null, "Semester"), /* @__PURE__ */ React.createElement("th", null, "Subject"), /* @__PURE__ */ React.createElement("th", null, "Topic Covered"), /* @__PURE__ */ React.createElement("th", null, "Present / Total"), /* @__PURE__ */ React.createElement("th", null, "Session Attendance %"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, filteredSessions.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "7", style: { textAlign: "center", padding: "32px", color: "var(--text-muted)" } }, "No attendance records found.")) : filteredSessions.map((sess) => {
    const subj = getSubjectObj(sess.subjectId);
    const semLabel = sess.sem || subj && subj.sem || "5th Sem";
    const recs = Object.values(sess.records || {});
    const total = recs.length;
    const present = recs.filter((st) => st === "present").length;
    const late = recs.filter((st) => st === "late").length;
    const effectivePresent = present + late * 0.8;
    const pct = total > 0 ? (effectivePresent / total * 100).toFixed(1) : 0;
    return /* @__PURE__ */ React.createElement("tr", { key: sess.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700", whiteSpace: "nowrap" } }, sess.date), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#f1f5f9", color: "var(--navy-dark)", border: "1px solid var(--border-color)", fontWeight: "700" } }, semLabel)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "var(--blue-light)", color: "var(--navy-primary)", border: "1px solid var(--blue-sky)" } }, subj.code)), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "600", maxWidth: "280px" } }, sess.topic || /* @__PURE__ */ React.createElement("em", { style: { color: "var(--text-light)" } }, "No topic specified")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "700" } }, present), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-muted)", fontSize: "12px" } }, " / ", total), late > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", color: "var(--status-late)", marginLeft: "4px" } }, "(", late, " late)")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge ${pct >= 75 ? "badge-present" : "badge-absent"}` }, pct, "%")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-secondary btn-sm",
        onClick: () => setViewingSession(sess),
        title: "View Details"
      },
      /* @__PURE__ */ React.createElement(Eye, { size: 14 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-secondary btn-sm",
        onClick: () => startEdit(sess),
        title: "Edit Session & Attendance",
        style: { color: "var(--blue-primary)" }
      },
      /* @__PURE__ */ React.createElement(Edit3, { size: 14 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-danger btn-sm",
        onClick: () => setDeletingSessionId(sess.id),
        title: "Delete Session"
      },
      /* @__PURE__ */ React.createElement(Trash2, { size: 14 })
    ))));
  })))), editingSession && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card" }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(Edit3, { size: 20, style: { color: "var(--blue-primary)" } }), "Edit Attendance Record"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setEditingSession(null) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Date"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      className: "form-control",
      value: editDate,
      onChange: (e) => setEditDate(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Topic Covered"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: editTopic,
      onChange: (e) => setEditTopic(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "14px", marginBottom: "12px", color: "var(--navy-dark)" } }, "Student Attendance & Remarks"), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: "340px", overflowY: "auto" }, className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Roll No"), /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Status"), /* @__PURE__ */ React.createElement("th", null, "Remark"))), /* @__PURE__ */ React.createElement("tbody", null, students.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, s.rollNo), /* @__PURE__ */ React.createElement("td", null, s.name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: editRecords[s.id] || "present",
      onChange: (e) => setEditRecords({ ...editRecords, [s.id]: e.target.value }),
      style: { height: "32px", fontSize: "12px", padding: "4px 8px" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "present" }, "Present"),
    /* @__PURE__ */ React.createElement("option", { value: "absent" }, "Absent"),
    /* @__PURE__ */ React.createElement("option", { value: "late" }, "Late")
  )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: editRemarks[s.id] || "",
      onChange: (e) => setEditRemarks({ ...editRemarks, [s.id]: e.target.value }),
      style: { height: "32px", fontSize: "12px" }
    }
  )))))))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: () => setEditingSession(null) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: saveEdit }, /* @__PURE__ */ React.createElement(Save, { size: 16 }), " Save Changes")))), viewingSession && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card" }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", null, "Session Details: ", viewingSession.date), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setViewingSession(null) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "16px", padding: "12px", backgroundColor: "var(--blue-light)", borderRadius: "var(--radius-md)" } }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Subject:"), " ", getSubjectObj(viewingSession.subjectId).name, " (", getSubjectObj(viewingSession.subjectId).code, ")"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Topic Covered:"), " ", viewingSession.topic || "N/A")), /* @__PURE__ */ React.createElement("div", { style: { maxHeight: "350px", overflowY: "auto" }, className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Roll No"), /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", null, "Remark"))), /* @__PURE__ */ React.createElement("tbody", null, students.map((s) => {
    const st = viewingSession.records ? viewingSession.records[s.id] : "absent";
    const rem = viewingSession.remarks ? viewingSession.remarks[s.id] : "";
    return /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", null, s.rollNo), /* @__PURE__ */ React.createElement("td", null, s.name), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge badge-${st}` }, st)), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "13px", color: "var(--text-muted)" } }, rem || "-"));
  }))))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: () => setViewingSession(null) }, "Close")))), deletingSessionId && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "420px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { color: "#e11d48", display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(AlertCircle, { size: 20 }), " Delete Attendance Session")), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("p", null, "Are you sure you want to delete this attendance record? This action cannot be undone.")), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: () => setDeletingSessionId(null) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-danger", onClick: confirmDelete }, /* @__PURE__ */ React.createElement(Trash2, { size: 16 }), " Delete Record"))))));
}
function DateView() {
  const [selectedDate, setSelectedDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const sessions = getSessions();
  const subjects = getSubjects();
  const students = getStudents();
  const daySessions = sessions.filter((s) => s.date === selectedDate);
  const getSubjectObj = (subjId) => subjects.find((s) => s.id === subjId) || { code: subjId, name: subjId };
  return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header-flex", style: { borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "card-title", style: { fontSize: "22px" } }, /* @__PURE__ */ React.createElement(CalendarIcon, { size: 24, style: { color: "var(--blue-primary)" } }), "Date-wise Attendance Inspector"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" } }, "Select any date to inspect all lectures, topics covered, and attendance records on that date.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "14px" } }, "Select Date:"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      className: "form-control",
      value: selectedDate,
      onChange: (e) => setSelectedDate(e.target.value),
      style: { width: "180px" }
    }
  ))), daySessions.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { padding: "48px", textAlign: "center", color: "var(--text-muted)" } }, /* @__PURE__ */ React.createElement(Clock, { size: 48, style: { opacity: 0.3, marginBottom: "12px" } }), /* @__PURE__ */ React.createElement("h3", null, "No Lectures Recorded on ", selectedDate), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "14px", marginTop: "6px" } }, "Select another date or enter attendance for this date.")) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: "24px", display: "flex", flexDirection: "column", gap: "28px" } }, daySessions.map((sess, idx) => {
    const subj = getSubjectObj(sess.subjectId);
    const recs = sess.records || {};
    const presentStudents = students.filter((s) => recs[s.id] === "present");
    const absentStudents = students.filter((s) => recs[s.id] === "absent");
    const lateStudents = students.filter((s) => recs[s.id] === "late");
    const total = students.length;
    const pct = total > 0 ? ((presentStudents.length + lateStudents.length * 0.8) / total * 100).toFixed(1) : 0;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: sess.id || idx,
        style: {
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          backgroundColor: "var(--bg-card)",
          boxShadow: "var(--shadow-sm)"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", flexWrap: "wrap", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "var(--blue-light)", color: "var(--navy-primary)", marginBottom: "8px" } }, "Lecture #", idx + 1, " - ", subj.code), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", color: "var(--navy-dark)", marginTop: "4px" } }, subj.name), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)" } }, "Faculty: ", subj.faculty || "Faculty")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "var(--text-muted)", display: "block" } }, "Lecture Attendance %"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "24px", fontWeight: "800", color: pct >= 75 ? "var(--status-present)" : "var(--status-absent)" } }, pct, "%")))),
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            backgroundColor: "var(--blue-light)",
            padding: "14px 18px",
            borderRadius: "var(--radius-md)",
            marginTop: "16px",
            border: "1px solid var(--blue-sky)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }
        },
        /* @__PURE__ */ React.createElement(BookOpen, { size: 20, style: { color: "var(--blue-primary)" } }),
        /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", textTransform: "uppercase", color: "var(--blue-accent)", fontWeight: "700", letterSpacing: "0.05em" } }, "Topic Covered in Lecture"), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "15px", color: "var(--navy-primary)", fontWeight: "700" } }, sess.topic || "No topic entered"))
      ),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px", borderRadius: "var(--radius-md)", backgroundColor: "var(--status-present-bg)", border: "1px solid var(--status-present-border)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "var(--status-present)", fontWeight: "700" } }, "Present Students"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: "800", color: "var(--status-present)" } }, presentStudents.length)), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px", borderRadius: "var(--radius-md)", backgroundColor: "var(--status-absent-bg)", border: "1px solid var(--status-absent-border)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "var(--status-absent)", fontWeight: "700" } }, "Absent Students"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: "800", color: "var(--status-absent)" } }, absentStudents.length)), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px", borderRadius: "var(--radius-md)", backgroundColor: "var(--status-late-bg)", border: "1px solid var(--status-late-border)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "var(--status-late)", fontWeight: "700" } }, "Late Arrivals"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: "800", color: "var(--status-late)" } }, lateStudents.length))),
      absentStudents.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "16px" } }, /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "13px", color: "var(--status-absent)", fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(UserX, { size: 15 }), " Absent Students List:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px" } }, absentStudents.map((s) => /* @__PURE__ */ React.createElement("span", { key: s.id, className: "badge badge-absent" }, "Roll #", s.rollNo, ": ", s.name, " ", sess.remarks && sess.remarks[s.id] ? `(${sess.remarks[s.id]})` : ""))))
    );
  })));
}
function TopicView({ searchQuery }) {
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [localSearch, setLocalSearch] = useState("");
  const sessions = getSessions();
  const subjects = getSubjects();
  const query = (searchQuery || localSearch).toLowerCase();
  const getSubjectObj = (subjId) => subjects.find((s) => s.id === subjId) || { code: subjId, name: subjId };
  const topicList = sessions.filter((sess) => sess.topic && sess.topic.trim() !== "").filter((sess) => selectedSubject === "ALL" || sess.subjectId === selectedSubject).filter((sess) => {
    const topicText = sess.topic.toLowerCase();
    const dateText = sess.date.toLowerCase();
    const subj = getSubjectObj(sess.subjectId);
    const subjText = (subj.name + " " + subj.code).toLowerCase();
    return !query || topicText.includes(query) || dateText.includes(query) || subjText.includes(query);
  });
  const subjectTopicCounts = subjects.map((subj) => {
    const count = sessions.filter((s) => s.subjectId === subj.id && s.topic).length;
    return { ...subj, topicCount: count };
  });
  return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header-flex", style: { borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", flexWrap: "wrap", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "card-title", style: { fontSize: "22px" } }, /* @__PURE__ */ React.createElement(BookOpen, { size: 24, style: { color: "var(--blue-primary)" } }), "Curriculum Topic Log"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" } }, "Track all syllabus topics taught per lecture date across subjects.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "input-with-icon", style: { width: "220px" } }, /* @__PURE__ */ React.createElement(Search, { className: "input-icon", size: 15 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Search topic...",
      value: localSearch,
      onChange: (e) => setLocalSearch(e.target.value),
      style: { height: "38px" }
    }
  )), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedSubject,
      onChange: (e) => setSelectedSubject(e.target.value),
      style: { width: "200px", height: "38px" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Subjects"),
    subjects.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.code, " - ", s.name))
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "20px", marginBottom: "24px" } }, subjectTopicCounts.map((subj) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: subj.id,
      style: {
        flex: "1 1 200px",
        backgroundColor: "var(--blue-light)",
        border: "1px solid var(--blue-sky)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justify: "space-between"
      }
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "800", color: "var(--navy-primary)", display: "block" } }, subj.code), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", color: "var(--text-main)", fontWeight: "600" } }, subj.name)),
    /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "var(--navy-primary)", color: "white", fontWeight: "800" } }, subj.topicCount, " Topics")
  ))), /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Date"), /* @__PURE__ */ React.createElement("th", null, "Subject"), /* @__PURE__ */ React.createElement("th", null, "Topic Taught"), /* @__PURE__ */ React.createElement("th", null, "Faculty"))), /* @__PURE__ */ React.createElement("tbody", null, topicList.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "4", style: { textAlign: "center", padding: "32px", color: "var(--text-muted)" } }, "No topic records found matching your search.")) : topicList.map((sess) => {
    const subj = getSubjectObj(sess.subjectId);
    return /* @__PURE__ */ React.createElement("tr", { key: sess.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700", whiteSpace: "nowrap", width: "130px" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(Calendar, { size: 14, style: { color: "var(--blue-primary)" } }), sess.date)), /* @__PURE__ */ React.createElement("td", { style: { width: "220px" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "var(--blue-sky)", color: "var(--navy-primary)" } }, subj.code), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", marginLeft: "6px", fontWeight: "600" } }, subj.name)), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700", color: "var(--navy-dark)", fontSize: "15px" } }, sess.topic), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "13px", color: "var(--text-muted)" } }, subj.faculty || "N/A"));
  })))));
}
function AnalyticsView({ searchQuery }) {
  const [localSearch, setLocalSearch] = useState("");
  const analytics = calculateAnalytics();
  const query = (searchQuery || localSearch).toLowerCase();
  const filteredStudentStats = analytics.studentStats.filter(
    (s) => s.name.toLowerCase().includes(query) || s.rollNo.includes(query) || s.enrollmentNo.includes(query)
  );
  const lowAttendanceStudents = analytics.studentStats.filter((s) => s.percentage < 75);
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "28px" } }, /* @__PURE__ */ React.createElement("div", { className: "stats-grid" }, /* @__PURE__ */ React.createElement("div", { className: "stat-card success" }, /* @__PURE__ */ React.createElement("div", { className: "stat-icon" }, /* @__PURE__ */ React.createElement(Percent, { size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "stat-info" }, /* @__PURE__ */ React.createElement("span", { className: "stat-label" }, "Overall Class Average"), /* @__PURE__ */ React.createElement("div", { className: "stat-value" }, analytics.overallPercentage, "%"))), /* @__PURE__ */ React.createElement("div", { className: "stat-card" }, /* @__PURE__ */ React.createElement("div", { className: "stat-icon" }, /* @__PURE__ */ React.createElement(BarChart3, { size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "stat-info" }, /* @__PURE__ */ React.createElement("span", { className: "stat-label" }, "Total Conducted Sessions"), /* @__PURE__ */ React.createElement("div", { className: "stat-value" }, analytics.totalSessions))), /* @__PURE__ */ React.createElement("div", { className: `stat-card ${lowAttendanceStudents.length > 0 ? "warning" : "success"}` }, /* @__PURE__ */ React.createElement("div", { className: "stat-icon" }, /* @__PURE__ */ React.createElement(AlertTriangle, { size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "stat-info" }, /* @__PURE__ */ React.createElement("span", { className: "stat-label" }, "Low Attendance (<75%)"), /* @__PURE__ */ React.createElement("div", { className: "stat-value" }, lowAttendanceStudents.length, " Students")))), lowAttendanceStudents.length > 0 && /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        backgroundColor: "#fff1f2",
        border: "1px solid #fecdd3",
        borderRadius: "var(--radius-lg)",
        padding: "20px 24px",
        boxShadow: "var(--shadow-sm)"
      }
    },
    /* @__PURE__ */ React.createElement("h3", { style: { color: "#e11d48", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" } }, /* @__PURE__ */ React.createElement(AlertTriangle, { size: 20 }), "Short Attendance Alert (<75% Attendance)"),
    /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#9f1239", marginBottom: "16px" } }, "The following ", lowAttendanceStudents.length, " students have fallen below the mandatory 75% attendance threshold:"),
    /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" } }, lowAttendanceStudents.map((s) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: s.id,
        style: {
          backgroundColor: "white",
          border: "1px solid #fda4af",
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          display: "flex",
          justify: "space-between",
          alignItems: "center"
        }
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "800", fontSize: "13px", color: "#9f1239", display: "block" } }, "Roll #", s.rollNo, " - ", s.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#be123c" } }, s.attended, " / ", s.totalAssigned, " Sessions")),
      /* @__PURE__ */ React.createElement("span", { className: "badge badge-absent", style: { fontSize: "13px", fontWeight: "800" } }, s.percentage, "%")
    )))
  ), /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header-flex", style: { borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "card-title", style: { fontSize: "22px" } }, /* @__PURE__ */ React.createElement(Award, { size: 24, style: { color: "var(--blue-primary)" } }), "Student Attendance Performance"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" } }, "Detailed attendance breakdown and percentages per student.")), /* @__PURE__ */ React.createElement("div", { className: "input-with-icon", style: { width: "240px" } }, /* @__PURE__ */ React.createElement(Search, { className: "input-icon", size: 15 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Search student...",
      value: localSearch,
      onChange: (e) => setLocalSearch(e.target.value),
      style: { height: "38px" }
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { marginTop: "20px" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Roll No"), /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", null, "Enrollment No"), /* @__PURE__ */ React.createElement("th", null, "Attended / Total"), /* @__PURE__ */ React.createElement("th", { style: { width: "220px" } }, "Attendance Progress"), /* @__PURE__ */ React.createElement("th", null, "Percentage"), /* @__PURE__ */ React.createElement("th", null, "Status"))), /* @__PURE__ */ React.createElement("tbody", null, filteredStudentStats.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "7", style: { textAlign: "center", padding: "32px", color: "var(--text-muted)" } }, "No student records found.")) : filteredStudentStats.map((student) => {
    const isGood = student.percentage >= 75;
    return /* @__PURE__ */ React.createElement("tr", { key: student.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800", color: "var(--navy-primary)" } }, student.rollNo), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, student.name), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "12px", color: "var(--text-muted)" } }, student.enrollmentNo), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "600" } }, student.attended, " / ", student.totalAssigned), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "progress-bar-container" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `progress-bar-fill ${isGood ? "good" : "warning"}`,
        style: { width: `${Math.min(student.percentage, 100)}%` }
      }
    ))), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800", color: isGood ? "var(--status-present)" : "var(--status-absent)" } }, student.percentage, "%"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge ${isGood ? "badge-present" : "badge-absent"}` }, isGood ? "Good Standing" : "Shortage Alert")));
  }))))));
}
function PrintView({ showToast }) {
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const analytics = calculateAnalytics();
  const subjects = getSubjects();
  const handlePrint = () => {
    window.print();
  };
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Roll No,Student Name,Enrollment No,Attended Sessions,Total Sessions,Attendance Percentage,Status\n";
    analytics.studentStats.forEach((s) => {
      const row = `"${s.rollNo}","${s.name}","${s.enrollmentNo}",${s.attended},${s.totalAssigned},${s.percentage}%,${s.percentage >= 75 ? "Eligible" : "Shortage"}`;
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ADIT_Attendance_Report_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast("Attendance report exported to CSV!");
  };
  const reportDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card no-print", style: { marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", { className: "card-header-flex" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "card-title", style: { fontSize: "22px" } }, /* @__PURE__ */ React.createElement(Printer, { size: 24, style: { color: "var(--blue-primary)" } }), "Print & Export Attendance Report"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" } }, "Generate official paper attendance sheets or download CSV data.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary", onClick: handleExportCSV }, /* @__PURE__ */ React.createElement(FileSpreadsheet, { size: 18, style: { color: "#059669" } }), "Export CSV File"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: handlePrint }, /* @__PURE__ */ React.createElement(Printer, { size: 18 }), "Print Attendance Sheet")))), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card print-only-container",
      style: {
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--border-color)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "2px solid var(--navy-primary)", paddingBottom: "20px", marginBottom: "24px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "26px", color: "var(--navy-primary)", fontWeight: "800", textTransform: "uppercase" } }, "ADIT College of Engineering & Technology"), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "15px", color: "var(--text-main)", fontWeight: "600", marginTop: "4px" } }, "Department of Computer Engineering & Information Technology"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" } }, "Official Academic Attendance Summary & Eligibility Report"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "12px", display: "flex", justifyContent: "center", gap: "24px", fontSize: "12px", fontWeight: "700" } }, /* @__PURE__ */ React.createElement("span", null, "Report Date: ", reportDate), /* @__PURE__ */ React.createElement("span", null, "Academic Semester: 5th Sem"), /* @__PURE__ */ React.createElement("span", null, "Total Sessions: ", analytics.totalSessions), /* @__PURE__ */ React.createElement("span", null, "Overall Average: ", analytics.overallPercentage, "%"))),
    /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table", style: { width: "100%", fontSize: "13px" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { backgroundColor: "var(--blue-light)" } }, /* @__PURE__ */ React.createElement("th", null, "Roll No"), /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", null, "Enrollment No"), /* @__PURE__ */ React.createElement("th", null, "Attended / Total"), /* @__PURE__ */ React.createElement("th", null, "Percentage %"), /* @__PURE__ */ React.createElement("th", null, "Exam Status"))), /* @__PURE__ */ React.createElement("tbody", null, analytics.studentStats.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800" } }, s.rollNo), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, s.name), /* @__PURE__ */ React.createElement("td", null, s.enrollmentNo), /* @__PURE__ */ React.createElement("td", null, s.attended, " / ", s.totalAssigned), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800", color: s.percentage >= 75 ? "var(--status-present)" : "var(--status-absent)" } }, s.percentage, "%"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge ${s.percentage >= 75 ? "badge-present" : "badge-absent"}` }, s.percentage >= 75 ? "Eligible" : "Shortage"))))))),
    /* @__PURE__ */ React.createElement("div", { style: { marginTop: "60px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "40px" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "180px", borderBottom: "1px dashed var(--text-dark)", marginBottom: "8px" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", fontWeight: "700", color: "var(--navy-dark)" } }, "Class Coordinator")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "180px", borderBottom: "1px dashed var(--text-dark)", marginBottom: "8px" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", fontWeight: "700", color: "var(--navy-dark)" } }, "Head of Department (HOD)")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "180px", borderBottom: "1px dashed var(--text-dark)", marginBottom: "8px" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", fontWeight: "700", color: "var(--navy-dark)" } }, "Principal / Director")))
  ));
}
function ManageMaster({ showToast }) {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState(getStudents());
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ id: "", rollNo: "", name: "", enrollmentNo: "", dept: "Computer Engg", sem: "5th" });
  const [subjects, setSubjects] = useState(getSubjects());
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: "", code: "", name: "", faculty: "", credits: 4 });
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentForm.rollNo || !studentForm.name || !studentForm.enrollmentNo) {
      alert("Please fill out all required student fields!");
      return;
    }
    const updated = saveStudent(studentForm);
    setStudents(updated);
    setShowStudentModal(false);
    setStudentForm({ id: "", rollNo: "", name: "", enrollmentNo: "", dept: "Computer Engg", sem: "5th" });
    if (showToast) showToast("Student master record saved!");
  };
  const handleEditStudent = (s) => {
    setStudentForm(s);
    setShowStudentModal(true);
  };
  const handleDeleteStudent = (id) => {
    if (window.confirm("Are you sure you want to remove this student from master records?")) {
      const updated = deleteStudent(id);
      setStudents(updated);
      if (showToast) showToast("Student removed from database.");
    }
  };
  const handleSubjectSubmit = (e) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) {
      alert("Please fill out subject code and name!");
      return;
    }
    const updated = saveSubject(subjectForm);
    setSubjects(updated);
    setShowSubjectModal(false);
    setSubjectForm({ id: "", code: "", name: "", faculty: "", credits: 4 });
    if (showToast) showToast("Subject record saved!");
  };
  const handleDeleteSubject = (id) => {
    if (window.confirm("Are you sure you want to remove this subject?")) {
      const updated = deleteSubject(id);
      setSubjects(updated);
      if (showToast) showToast("Subject deleted.");
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "card" }, /* @__PURE__ */ React.createElement("div", { className: "card-header-flex", style: { borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "card-title", style: { fontSize: "22px" } }, /* @__PURE__ */ React.createElement(Users, { size: 24, style: { color: "var(--blue-primary)" } }), "Master Database Management"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" } }, "Add, update, or remove enrolled students and master subjects.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `btn ${activeTab === "students" ? "btn-primary" : "btn-secondary"}`,
      onClick: () => setActiveTab("students")
    },
    /* @__PURE__ */ React.createElement(Users, { size: 16 }),
    " Students (",
    students.length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `btn ${activeTab === "subjects" ? "btn-primary" : "btn-secondary"}`,
      onClick: () => setActiveTab("subjects")
    },
    /* @__PURE__ */ React.createElement(BookOpen, { size: 16 }),
    " Subjects (",
    subjects.length,
    ")"
  ))), activeTab === "students" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: "16px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary",
      onClick: () => {
        setStudentForm({ id: "", rollNo: "", name: "", enrollmentNo: "", dept: "Computer Engg", sem: "5th" });
        setShowStudentModal(true);
      }
    },
    /* @__PURE__ */ React.createElement(UserPlus, { size: 16 }),
    " Add New Student"
  )), /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Roll No"), /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", null, "Enrollment No"), /* @__PURE__ */ React.createElement("th", null, "Department"), /* @__PURE__ */ React.createElement("th", null, "Semester"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, students.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800", color: "var(--navy-primary)" } }, s.rollNo), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, s.name), /* @__PURE__ */ React.createElement("td", { style: { fontSize: "13px", color: "var(--text-muted)" } }, s.enrollmentNo), /* @__PURE__ */ React.createElement("td", null, s.dept), /* @__PURE__ */ React.createElement("td", null, s.sem), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => handleEditStudent(s) }, /* @__PURE__ */ React.createElement(Edit2, { size: 14 })), /* @__PURE__ */ React.createElement("button", { className: "btn btn-danger btn-sm", onClick: () => handleDeleteStudent(s.id) }, /* @__PURE__ */ React.createElement(Trash2, { size: 14 })))))))))), activeTab === "subjects" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: "16px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary",
      onClick: () => {
        setSubjectForm({ id: "", code: "", name: "", faculty: "", credits: 4 });
        setShowSubjectModal(true);
      }
    },
    /* @__PURE__ */ React.createElement(BookPlus, { size: 16 }),
    " Add New Subject"
  )), /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Subject Code"), /* @__PURE__ */ React.createElement("th", null, "Subject Name"), /* @__PURE__ */ React.createElement("th", null, "Faculty Instructor"), /* @__PURE__ */ React.createElement("th", null, "Credits"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, subjects.map((sub) => /* @__PURE__ */ React.createElement("tr", { key: sub.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "var(--blue-light)", color: "var(--navy-primary)" } }, sub.code)), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, sub.name), /* @__PURE__ */ React.createElement("td", null, sub.faculty), /* @__PURE__ */ React.createElement("td", null, sub.credits, " Credits"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-danger btn-sm", onClick: () => handleDeleteSubject(sub.id) }, /* @__PURE__ */ React.createElement(Trash2, { size: 14 }))))))))), showStudentModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card" }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", null, studentForm.id ? "Edit Student Details" : "Add New Student"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowStudentModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleStudentSubmit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Roll No *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: studentForm.rollNo,
      onChange: (e) => setStudentForm({ ...studentForm, rollNo: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Student Full Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: studentForm.name,
      onChange: (e) => setStudentForm({ ...studentForm, name: e.target.value }),
      required: true
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Enrollment Number *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: studentForm.enrollmentNo,
      onChange: (e) => setStudentForm({ ...studentForm, enrollmentNo: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Department"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: studentForm.dept,
      onChange: (e) => setStudentForm({ ...studentForm, dept: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Semester"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: studentForm.sem,
      onChange: (e) => setStudentForm({ ...studentForm, sem: e.target.value })
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowStudentModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Save, { size: 16 }), " Save Student"))))), showSubjectModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card" }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", null, "Add New Subject"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowSubjectModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubjectSubmit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Subject Code *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. CE506",
      value: subjectForm.code,
      onChange: (e) => setSubjectForm({ ...subjectForm, code: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Subject Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Artificial Intelligence",
      value: subjectForm.name,
      onChange: (e) => setSubjectForm({ ...subjectForm, name: e.target.value }),
      required: true
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Faculty Instructor"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Prof. Name",
      value: subjectForm.faculty,
      onChange: (e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Credits"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "form-control",
      value: subjectForm.credits,
      onChange: (e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 3 })
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowSubjectModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Save, { size: 16 }), " Save Subject"))))));
}
function FacultyEditModal({ faculty, departments, onClose, onSave, showToast }) {
  const [formData, setFormData] = useState({
    id: faculty?.id || "",
    name: faculty?.name || "",
    dept: faculty?.dept || (departments[0]?.name || "AI & Data Science"),
    designation: faculty?.designation || "Associate Professor",
    email: faculty?.email || "",
    phone: faculty?.phone || "",
    subjects: faculty?.subjects || ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Faculty name is required.");
      return;
    }
    onSave(formData);
    if (showToast) showToast(`Faculty details updated for ${formData.name}`);
    onClose();
  };
  return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "520px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px", color: "var(--navy-primary)" } }, /* @__PURE__ */ React.createElement(UserCheck, { size: 20 }), faculty?.id ? "Edit Faculty Details" : "Add Faculty Member"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: onClose }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(UserCheck, { size: 14, style: { color: "var(--blue-primary)" } }), "Faculty Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Prof. Priya Shah",
      value: formData.name,
      onChange: (e) => setFormData({ ...formData, name: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(Building2, { size: 14, style: { color: "var(--blue-primary)" } }), "Department"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: formData.dept,
      onChange: (e) => setFormData({ ...formData, dept: e.target.value })
    },
    departments.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id || d.name, value: d.name }, d.name))
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(Briefcase, { size: 14, style: { color: "var(--blue-primary)" } }), "Designation"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: formData.designation,
      onChange: (e) => setFormData({ ...formData, designation: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "Professor & HOD" }, "Professor & HOD"),
    /* @__PURE__ */ React.createElement("option", { value: "Professor" }, "Professor"),
    /* @__PURE__ */ React.createElement("option", { value: "Associate Professor" }, "Associate Professor"),
    /* @__PURE__ */ React.createElement("option", { value: "Assistant Professor" }, "Assistant Professor"),
    /* @__PURE__ */ React.createElement("option", { value: "Adjunct Faculty" }, "Adjunct Faculty")
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(Mail, { size: 14, style: { color: "var(--blue-primary)" } }), "Official Email"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      className: "form-control",
      placeholder: "e.g. priya.shah@adit.ac.in",
      value: formData.email,
      onChange: (e) => setFormData({ ...formData, email: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(Phone, { size: 14, style: { color: "var(--blue-primary)" } }), "Contact Phone"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. 9825011111",
      value: formData.phone,
      onChange: (e) => setFormData({ ...formData, phone: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(BookOpen, { size: 14, style: { color: "var(--blue-primary)" } }), "Subjects Handled (comma-separated)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. DBMS, Data Structures, Python",
      value: formData.subjects,
      onChange: (e) => setFormData({ ...formData, subjects: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer", style: { marginTop: "16px" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Check, { size: 16 }), " ", formData.id ? "Save Changes" : "Save Faculty")))));
}
function SlotEditModal({
  day: initialDay,
  timeSlot: initialTimeSlot,
  existingSlot,
  availableSubjects,
  availableFaculties = [],
  departmentName,
  semesterName,
  divisionName,
  onClose,
  onSave,
  onClear,
  showToast
}) {
  const [day, setDay] = useState(initialDay || "Monday");
  const [timeSlot, setTimeSlot] = useState(initialTimeSlot || "9:00 - 9:55");
  const _existingSubject = existingSlot?.subject || existingSlot?.subjectName || existingSlot?.subjectId || "";
  const _existingName = existingSlot?.name || existingSlot?.subjectFullName || existingSlot?.subjectName || "";
  const [subject, setSubject] = useState(_existingSubject || (availableSubjects[0]?.shortName || availableSubjects[0]?.name || ""));
  const [fullName, setFullName] = useState(_existingName || (availableSubjects[0]?.name || ""));
  const [sem, setSem] = useState(existingSlot?.sem || existingSlot?.semId || semesterName || "3rd Sem");
  const [div, setDiv] = useState(existingSlot?.div || existingSlot?.divId || divisionName || "Div 1");
  const [room, setRoom] = useState(existingSlot?.room || "Room 201");
  const [type, setType] = useState(existingSlot?.type || "Lecture");
  const [color, setColor] = useState(existingSlot?.color || getSubjectColor(_existingSubject || "DBMS"));
  const [selectedFacultyId, setSelectedFacultyId] = useState(existingSlot?.facultyId || "");
  const [conflicts, setConflicts] = useState([]);
  const handleSubjectSelect = (e) => {
    const selectedSubjId = e.target.value;
    const subjObj = availableSubjects.find((s) => s.id === selectedSubjId || s.shortName === selectedSubjId || s.name === selectedSubjId);
    if (subjObj) {
      const short = subjObj.shortName || subjObj.code || subjObj.name.slice(0, 10);
      setSubject(short);
      setFullName(subjObj.name);
      setColor(getSubjectColor(short));
    } else {
      setSubject(selectedSubjId);
      setFullName(selectedSubjId);
      setColor(getSubjectColor(selectedSubjId));
    }
  };
  const handleSave = (e, ignoreConflicts = false) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert("Please specify a subject");
      return;
    }
    const facObj = availableFaculties.find((f) => f.id === selectedFacultyId);
    const facultyName = facObj?.name || selectedFacultyId || "Faculty Assigned";
    const slotData = {
      subject: subject.trim(),
      name: fullName || subject.trim(),
      sem,
      div,
      room: room.trim() || "Room 201",
      type,
      color: color || getSubjectColor(subject),
      facultyId: selectedFacultyId || existingSlot?.facultyId,
      facultyName
    };
    if (!ignoreConflicts) {
      const entryData = {
        ...slotData,
        semId: sem,
        divId: div,
        day,
        timeSlot
      };
      const foundConflicts = checkConflicts(entryData, existingSlot?.id);
      if (foundConflicts.length > 0) {
        setConflicts(foundConflicts);
        return;
      }
    }
    onSave(day, timeSlot, slotData);
  };
  const handleClear = () => {
    if (window.confirm(`Clear this lecture slot on ${day} (${timeSlot})?`)) {
      onClear(day, timeSlot);
      if (showToast) showToast(`Cleared slot on ${day} ${timeSlot}`);
      onClose();
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "480px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px", color: "var(--navy-primary)" } }, /* @__PURE__ */ React.createElement(Clock, { size: 20 }), existingSlot ? "Edit Timetable Slot" : "Add Timetable Lecture"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "var(--text-muted)" } }, "Department: ", departmentName, " \u2022 ", semesterName)), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: onClose }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSave }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(Calendar, { size: 14, style: { color: "var(--blue-primary)" } }), "Day"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: day,
      onChange: (e) => setDay(e.target.value)
    },
    TIMETABLE_DAYS.map((d) => /* @__PURE__ */ React.createElement("option", { key: d, value: d }, d))
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(Clock, { size: 14, style: { color: "var(--blue-primary)" } }), "Time Slot"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: timeSlot,
      onChange: (e) => setTimeSlot(e.target.value)
    },
    TIME_SLOTS.filter((s) => s !== "12:40 - 1:25").map((slot) => /* @__PURE__ */ React.createElement("option", { key: slot, value: slot }, slot))
  ))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(BookOpen, { size: 14, style: { color: "var(--blue-primary)" } }), "Subject"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      onChange: handleSubjectSelect,
      defaultValue: ""
    },
    /* @__PURE__ */ React.createElement("option", { value: "", disabled: true }, "-- Select from Department Subjects --"),
    availableSubjects.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.code ? `${s.code} - ` : "", s.name, " (", s.shortName || s.name, ")"))
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "12px" } }, "Badge Label"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. DBMS",
      value: subject,
      onChange: (e) => {
        setSubject(e.target.value);
        setColor(getSubjectColor(e.target.value));
      },
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "12px" } }, "Subject Full Name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Database Management Systems",
      value: fullName,
      onChange: (e) => setFullName(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "13px" } }, "Semester"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: sem,
      onChange: (e) => setSem(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "1st Sem" }, "1st Sem"),
    /* @__PURE__ */ React.createElement("option", { value: "2nd Sem" }, "2nd Sem"),
    /* @__PURE__ */ React.createElement("option", { value: "3rd Sem" }, "3rd Sem"),
    /* @__PURE__ */ React.createElement("option", { value: "4th Sem" }, "4th Sem"),
    /* @__PURE__ */ React.createElement("option", { value: "5th Sem" }, "5th Sem"),
    /* @__PURE__ */ React.createElement("option", { value: "6th Sem" }, "6th Sem"),
    /* @__PURE__ */ React.createElement("option", { value: "7th Sem" }, "7th Sem"),
    /* @__PURE__ */ React.createElement("option", { value: "8th Sem" }, "8th Sem")
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(Layers, { size: 14, style: { color: "var(--blue-primary)" } }), "Division"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: div,
      onChange: (e) => setDiv(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "Div 1" }, "Div 1"),
    /* @__PURE__ */ React.createElement("option", { value: "Div 2" }, "Div 2"),
    /* @__PURE__ */ React.createElement("option", { value: "Div 3" }, "Div 3"),
    /* @__PURE__ */ React.createElement("option", { value: "All Div" }, "All Divisions")
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "13px" } }, "Assign Faculty"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedFacultyId,
      onChange: (e) => setSelectedFacultyId(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Faculty (Optional) --"),
    availableFaculties.map((f) => /* @__PURE__ */ React.createElement("option", { key: f.id, value: f.id }, f.name))
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "13px" } }, /* @__PURE__ */ React.createElement(MapPin, { size: 14, style: { color: "var(--blue-primary)" } }), "Classroom / Lab"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Room 201",
      value: room,
      onChange: (e) => setRoom(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "13px" } }, "Slot Type"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: type,
      onChange: (e) => setType(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "Lecture" }, "Lecture"),
    /* @__PURE__ */ React.createElement("option", { value: "Lab" }, "Laboratory"),
    /* @__PURE__ */ React.createElement("option", { value: "Seminar" }, "Seminar"),
    /* @__PURE__ */ React.createElement("option", { value: "Tutorial" }, "Tutorial")
  ))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "12px", display: "block", marginBottom: "6px" } }, "Badge Theme"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", alignItems: "center" } }, [
    { id: "purple", label: "Purple (DBMS)", bg: "#f3e8ff", border: "#d8b4fe", text: "#6b21a8" },
    { id: "green", label: "Green (DS)", bg: "#dcfce7", border: "#86efac", text: "#15803d" },
    { id: "coral", label: "Coral (Python)", bg: "#ffe4e6", border: "#fecdd3", text: "#be123c" },
    { id: "blue", label: "Blue (Seminar)", bg: "#e0f2fe", border: "#7dd3fc", text: "#0369a1" },
    { id: "amber", label: "Amber (Maths)", bg: "#fef3c7", border: "#fde68a", text: "#b45309" },
    { id: "cyan", label: "Cyan (Networks)", bg: "#cffafe", border: "#a5f3fc", text: "#0e7490" },
    { id: "indigo", label: "Indigo (OS)", bg: "#e0e7ff", border: "#c7d2fe", text: "#4338ca" }
  ].map((c) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: c.id,
      type: "button",
      onClick: () => setColor(c.id),
      title: c.label,
      style: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        backgroundColor: c.bg,
        border: color === c.id ? `2px solid ${c.text}` : `1px solid ${c.border}`,
        cursor: "pointer",
        transform: color === c.id ? "scale(1.15)" : "scale(1)",
        boxShadow: color === c.id ? "0 0 0 2px white, 0 0 0 4px " + c.text : "none",
        transition: "all 0.15s ease"
      }
    }
  )))), conflicts.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { backgroundColor: "#fef9c3", padding: "12px", borderRadius: "8px", border: "1px solid #fde047", marginTop: "8px" } }, /* @__PURE__ */ React.createElement("h4", { style: { margin: "0 0 8px 0", color: "#a16207", fontSize: "13px", fontWeight: "bold" } }, "Conflicts Detected"), /* @__PURE__ */ React.createElement("ul", { style: { margin: "0", paddingLeft: "20px", color: "#854d0e", fontSize: "12px" } }, conflicts.map((c, i) => /* @__PURE__ */ React.createElement("li", { key: i }, c))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "8px", textAlign: "right" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-sm", style: { backgroundColor: "#ca8a04", color: "white" }, onClick: (e) => handleSave(e, true) }, "Save Anyway")))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" } }, existingSlot ? /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-danger btn-sm",
      onClick: handleClear,
      style: { display: "flex", alignItems: "center", gap: "6px" }
    },
    /* @__PURE__ */ React.createElement(Trash2, { size: 15 }),
    " Clear Slot"
  ) : /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Check, { size: 16 }), " Save Slot"))))));
}
function TimetableUploadModal({
  selectedFaculty: initialFaculty,
  departmentName = "AI & Data Science",
  semesterName = "3rd Semester",
  divisionName = "Div 1",
  initialScope = "faculty",
  onClose,
  onTimetableUpdated,
  showToast
}) {
  const [targetScope, setTargetScope] = useState(initialScope);
  const [selectedFaculty, setSelectedFaculty] = useState(initialFaculty || { id: "FAC_PS", name: "Prof. Priya Shah" });
  const [selectedSem, setSelectedSem] = useState(semesterName);
  const [selectedDiv, setSelectedDiv] = useState(divisionName);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);
  const allFaculties = getFaculties();
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setErrorMessage("");
    setIsProcessing(true);
    setPreviewData(null);
    setPreviewImage(null);
    setDebugInfo(null);
    const fileName = file.name.toLowerCase();
    const debug = {
      stage: "started",
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + " KB",
      fileType: file.type || "unknown",
      textExtracted: false,
      textLength: 0,
      entriesDetected: 0,
      validEntries: 0,
      timetableBuilt: false,
      error: null,
      note: ""
    };
    console.log("[UPLOAD] File selected:", file.name, file.type, file.size, "bytes");
    try {
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")) {
        debug.stage = "parsing-excel";
        console.log("[UPLOAD] Parsing Excel/CSV...");
        let res;
        if (targetScope === "faculty") {
          res = await parseExcelTimetableForFaculty(file, selectedFaculty?.id || "FAC_PS", selectedSem, selectedDiv, departmentName);
        } else {
          res = await parseExcelTimetableForClass(file, selectedSem, selectedDiv, departmentName);
        }
        console.log("Excel parsed:", res.previewLectures);
        console.log("Normalized entries:", res.previewLectures);
        debug.stage = "excel-done";
        debug.entriesDetected = res.previewLectures?.length || 0;
        debug.validEntries = res.previewLectures?.length || 0;
        debug.timetableBuilt = !!res.timetable;
        setDebugInfo(debug);
        setPreviewData(res);
        if (showToast) showToast(`Spreadsheet parsed: ${res.summary?.totalLectures || 0} lectures detected!`);
      } else if (file.type.startsWith("image/") || /\.(png|jpe?g|gif|bmp|webp)$/i.test(fileName)) {
        debug.stage = "parsing-image";
        console.log("[UPLOAD] Reading image file with OCR...");
        const res = await parseImageTimetable(file, targetScope, selectedFaculty?.id || "FAC_PS", selectedSem, selectedDiv, departmentName);
        console.log("Image OCR text:", res.note);
        console.log("Image parsed entries:", res.previewLectures);
        console.log("Normalized entries:", res.previewLectures);
        debug.stage = "image-done";
        debug.note = res.note || "";
        debug.timetableBuilt = !!res.timetable;
        debug.entriesDetected = res.previewLectures?.length || 0;
        debug.validEntries = res.previewLectures?.length || 0;
        setDebugInfo(debug);
        setPreviewImage(res.dataUrl);
        setPreviewData(res);
        if (showToast) showToast(`Image parsed: ${res.summary?.totalLectures || 0} lectures recognized via OCR!`);
      } else if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
        debug.stage = "parsing-pdf";
        console.log("[UPLOAD] Reading PDF file via PDF.js...");
        const res = await parsePdfTimetable(file, targetScope, selectedFaculty?.id || "FAC_PS", selectedSem, selectedDiv, departmentName);
        console.log("PDF parsed entries:", res.previewLectures);
        console.log("Normalized entries:", res.previewLectures);
        debug.stage = "pdf-done";
        debug.textExtracted = (res.previewLectures?.length || 0) > 0;
        debug.textLength = (res.previewLectures?.length || 0) > 0 ? "yes" : "none";
        debug.entriesDetected = res.previewLectures?.length || 0;
        debug.validEntries = res.previewLectures?.length || 0;
        debug.timetableBuilt = !!res.timetable;
        debug.note = res.note || "";
        setDebugInfo(debug);
        setPreviewData(res);
        if (res.previewLectures?.length > 0) {
          if (showToast) showToast(`PDF parsed: ${res.summary?.totalLectures || res.previewLectures.length} timetable entries detected!`);
        } else {
          if (showToast) showToast(`PDF loaded - review details below`);
        }
      } else {
        setErrorMessage("Unsupported file format. Please upload Excel (.xlsx, .csv), Image (.png, .jpg), or PDF.");
      }
    } catch (err) {
      console.error("[UPLOAD] Error:", err);
      debug.error = err.message;
      debug.stage = "error";
      setDebugInfo(debug);
      setErrorMessage(err.message || "Error reading timetable file.");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDownloadTemplate = () => {
    if (targetScope === "faculty") {
      downloadFacultyTimetableTemplate(selectedFaculty?.name || "Faculty Member", departmentName, selectedSem);
      if (showToast) showToast("Faculty timetable template downloaded!");
    } else {
      downloadClassTimetableTemplate(departmentName, selectedSem, selectedDiv);
      if (showToast) showToast("Class timetable template downloaded!");
    }
  };
  const handleApply = () => {
    if (!previewData || !previewData.timetable) {
      alert("Please upload a timetable file with recognizable entries first.");
      return;
    }
    const validation = validateTimetable(previewData);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Timetable data is incomplete or invalid.");
      return;
    }
    console.log("Entries being saved:", previewData.timetable);
    try {
      if (targetScope === "faculty") {
        commitUploadedTimetable("faculty", selectedFaculty.id, previewData);
        if (onTimetableUpdated) onTimetableUpdated(previewData.timetable, selectedFaculty.id);
        if (showToast) showToast(`Timetable updated & synced for ${selectedFaculty?.name || "Faculty"}!`);
      } else {
        commitUploadedTimetable("class", null, previewData, { sem: selectedSem, div: selectedDiv, departmentName });
        if (onTimetableUpdated) onTimetableUpdated(previewData.timetable, null, selectedSem, selectedDiv);
        if (showToast) showToast(`Class timetable updated & synced for ${selectedSem} ${selectedDiv}!`);
      }
      onClose();
    } catch (err) {
      console.error("Error applying timetable:", err);
      setErrorMessage("Failed to apply timetable: " + err.message);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb"
  } }, /* @__PURE__ */ React.createElement(UploadCloud, { size: 22 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "17px", color: "#0f172a", fontWeight: "800" } }, "Upload Academic Timetable"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, departmentName, " \u2022 Bi-directional sync across all related faculty & class schedules"))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: onClose }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", padding: "4px", backgroundColor: "#f1f5f9", borderRadius: "8px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setTargetScope("faculty");
        setPreviewData(null);
      },
      style: {
        flex: 1,
        padding: "8px 12px",
        borderRadius: "6px",
        border: "none",
        background: targetScope === "faculty" ? "white" : "transparent",
        color: targetScope === "faculty" ? "#2563eb" : "#64748b",
        fontWeight: "700",
        fontSize: "12.5px",
        cursor: "pointer",
        boxShadow: targetScope === "faculty" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
      }
    },
    "Faculty Member Timetable"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setTargetScope("class");
        setPreviewData(null);
      },
      style: {
        flex: 1,
        padding: "8px 12px",
        borderRadius: "6px",
        border: "none",
        background: targetScope === "class" ? "white" : "transparent",
        color: targetScope === "class" ? "#2563eb" : "#64748b",
        fontWeight: "700",
        fontSize: "12.5px",
        cursor: "pointer",
        boxShadow: targetScope === "class" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
      }
    },
    "Class / Division Timetable"
  )), targetScope === "faculty" ? /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(Users, { size: 14, style: { color: "#2563eb" } }), "Target Faculty Member"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedFaculty?.id,
      onChange: (e) => {
        const fac = allFaculties.find((f) => f.id === e.target.value);
        if (fac) setSelectedFaculty(fac);
      }
    },
    allFaculties.map((f) => /* @__PURE__ */ React.createElement("option", { key: f.id, value: f.id }, f.name, " (", f.dept || departmentName, ")"))
  )) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "12.5px" } }, "Semester"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedSem,
      onChange: (e) => setSelectedSem(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "1st Semester" }, "1st Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "2nd Semester" }, "2nd Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "3rd Semester" }, "3rd Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "4th Semester" }, "4th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "5th Semester" }, "5th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "6th Semester" }, "6th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "7th Semester" }, "7th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "8th Semester" }, "8th Semester")
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "12.5px" } }, "Division"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: selectedDiv,
      onChange: (e) => setSelectedDiv(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "Div 1" }, "Div 1"),
    /* @__PURE__ */ React.createElement("option", { value: "Div 2" }, "Div 2"),
    /* @__PURE__ */ React.createElement("option", { value: "Div 3" }, "Div 3")
  ))), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        border: "2px dashed #93c5fd",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        padding: "24px 20px",
        textAlign: "center",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }
    },
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "file",
        accept: ".xlsx, .xls, .csv, .png, .jpg, .jpeg, .pdf",
        onChange: handleFileChange,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer"
        }
      }
    ),
    isProcessing ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(Loader2, { size: 36, className: "animate-spin", style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", fontWeight: "700", color: "#1e3a8a" } }, "Processing and mapping timetable lectures...")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(UploadCloud, { size: 40, style: { color: "#2563eb", margin: "0 auto 8px" } }), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "14.5px", color: "#0f172a", fontWeight: "700" } }, "Click to select file or drag & drop here"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#64748b", marginTop: "4px" } }, "Formats: Excel (.xlsx, .csv), Scanned Images (.png, .jpg), PDF documents"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "10px" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" } }, /* @__PURE__ */ React.createElement(FileSpreadsheet, { size: 12 }), " Excel Sheet"), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe" } }, /* @__PURE__ */ React.createElement(ImageIcon, { size: 12 }), " Scanned Photo"), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3" } }, /* @__PURE__ */ React.createElement(FileText, { size: 12 }), " PDF Document")))
  ), errorMessage && /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: "#fff1f2",
    color: "#e11d48",
    borderRadius: "8px",
    fontSize: "12.5px"
  } }, /* @__PURE__ */ React.createElement(AlertCircle, { size: 16 }), /* @__PURE__ */ React.createElement("span", null, errorMessage)), debugInfo && !errorMessage && /* @__PURE__ */ React.createElement("div", { style: {
    padding: "12px 14px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "11.5px",
    fontFamily: "monospace"
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "700", fontSize: "12px", color: "#334155", marginBottom: "8px" } }, "\u{1F4CA} Upload Pipeline Trace"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b" } }, "File:"), /* @__PURE__ */ React.createElement("span", { style: { color: "#0f172a", fontWeight: "600" } }, debugInfo.fileName, " (", debugInfo.fileSize, ")"), /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b" } }, "Type:"), /* @__PURE__ */ React.createElement("span", { style: { color: "#0f172a" } }, debugInfo.fileType), /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b" } }, "Stage:"), /* @__PURE__ */ React.createElement("span", { style: { color: debugInfo.stage === "error" ? "#dc2626" : "#059669", fontWeight: "600" } }, debugInfo.stage), /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b" } }, "Entries detected:"), /* @__PURE__ */ React.createElement("span", { style: {
    color: debugInfo.entriesDetected > 0 ? "#059669" : "#dc2626",
    fontWeight: "700"
  } }, debugInfo.entriesDetected, debugInfo.entriesDetected === 0 && debugInfo.fileType === "application/pdf" ? " \u2190 no text layer found" : ""), /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b" } }, "Timetable built:"), /* @__PURE__ */ React.createElement("span", { style: { color: debugInfo.timetableBuilt ? "#059669" : "#dc2626", fontWeight: "700" } }, debugInfo.timetableBuilt ? "YES \u2713" : "NO \u2717")), debugInfo.note && /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: "8px",
    padding: "8px",
    backgroundColor: debugInfo.entriesDetected > 0 ? "#ecfdf5" : "#fef9c3",
    borderRadius: "6px",
    color: debugInfo.entriesDetected > 0 ? "#065f46" : "#92400e",
    fontSize: "11px"
  } }, "\u2139\uFE0F ", debugInfo.note), debugInfo.fileType === "application/pdf" && debugInfo.entriesDetected === 0 && /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: "8px",
    padding: "10px",
    backgroundColor: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "6px",
    fontSize: "11.5px",
    color: "#7c2d12"
  } }, /* @__PURE__ */ React.createElement("strong", null, "\u26A0\uFE0F Scanned/Image PDF detected"), /* @__PURE__ */ React.createElement("br", null), "This PDF has no selectable text layer (it's a scanned image). In-browser OCR requires Tesseract.js which is not installed. ", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("strong", null, "Options:"), ' (1) Use the Excel template instead \u2014 click "Download Template" above. (2) Re-create the PDF from Excel using "Save as PDF". (3) Add slots manually via the timetable grid.')), previewData && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: "8px"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(CheckCircle2, { size: 20, style: { color: "#059669" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13.5px", fontWeight: "800", color: "#065f46", display: "block" } }, previewData.fileInfo?.name || uploadedFile?.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#047857" } }, previewData.fileInfo?.size, " \u2022 ", previewData.summary?.totalLectures || previewData.previewLectures?.length || 0, " lectures mapped across ", previewData.summary?.activeDays || 0, " days"))), previewImage && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: previewImage,
      target: "_blank",
      rel: "noreferrer",
      className: "btn btn-secondary btn-sm",
      style: { fontSize: "11px", padding: "4px 8px" }
    },
    /* @__PURE__ */ React.createElement(Eye, { size: 12 }),
    " View Scan"
  )), previewData.previewLectures && previewData.previewLectures.length > 0 && /* @__PURE__ */ React.createElement("div", { style: {
    maxHeight: "180px",
    overflowY: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "white"
  } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", fontSize: "11.5px", borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0 } }, /* @__PURE__ */ React.createElement("th", { style: { padding: "6px 10px", textAlign: "left" } }, "Day"), /* @__PURE__ */ React.createElement("th", { style: { padding: "6px 10px", textAlign: "left" } }, "Time"), /* @__PURE__ */ React.createElement("th", { style: { padding: "6px 10px", textAlign: "left" } }, "Subject"), /* @__PURE__ */ React.createElement("th", { style: { padding: "6px 10px", textAlign: "left" } }, "Room"), /* @__PURE__ */ React.createElement("th", { style: { padding: "6px 10px", textAlign: "left" } }, targetScope === "faculty" ? "Class" : "Faculty"))), /* @__PURE__ */ React.createElement("tbody", null, previewData.previewLectures.map((lec, i) => /* @__PURE__ */ React.createElement("tr", { key: i, style: { borderBottom: "1px solid #f1f5f9" } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 10px", fontWeight: "700" } }, lec.day), /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 10px", color: "#64748b" } }, lec.time), /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 10px" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: "700" } }, lec.subject)), /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 10px", color: "#64748b" } }, lec.room), /* @__PURE__ */ React.createElement("td", { style: { padding: "6px 10px", color: "#334155", fontWeight: "600" } }, targetScope === "faculty" ? `${lec.sem} ${lec.div}` : lec.facultyName || "Assigned"))))))), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#0f172a", display: "block" } }, "Download standard spreadsheet template"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#64748b" } }, "Pre-formatted for ADIT ", targetScope === "faculty" ? "Faculty" : "Class", " with 9 standard time slots.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary btn-sm",
      onClick: handleDownloadTemplate,
      style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }
    },
    /* @__PURE__ */ React.createElement(Download, { size: 13 }),
    " Download Template"
  ))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer", style: { display: "flex", justifyContent: "flex-end", gap: "10px" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-primary",
      onClick: handleApply,
      disabled: !previewData,
      style: { display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#2563eb", color: "white", fontWeight: "700" }
    },
    /* @__PURE__ */ React.createElement(Check, { size: 16 }),
    " Apply & Sync Timetable"
  ))));
}
function FacultyTimetablePanel({
  departments,
  faculties,
  subjects,
  onSaveFaculty,
  onSwitchToClassTimetable,
  showToast
}) {
  const [selectedDept, setSelectedDept] = useState("AI & Data Science");
  const [selectedSem, setSelectedSem] = useState("3rd Semester");
  const [selectedWeek, setSelectedWeek] = useState("Current Week");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("FAC_PS");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditFacultyModal, setShowEditFacultyModal] = useState(false);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [activeSlotData, setActiveSlotData] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargetFacultyId, setCopyTargetFacultyId] = useState("");
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const deptFaculties = useMemo(() => {
    return faculties.filter((f) => {
      const matchDept = !f.dept || f.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4));
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || f.name.toLowerCase().includes(q) || f.subjects && f.subjects.toLowerCase().includes(q) || f.email && f.email.toLowerCase().includes(q);
      return matchDept && matchQuery;
    });
  }, [faculties, selectedDept, searchQuery]);
  const currentFaculty = useMemo(() => {
    return deptFaculties.find((f) => f.id === selectedFacultyId) || faculties.find((f) => f.id === selectedFacultyId) || deptFaculties[0] || faculties[0] || {
      id: "FAC_PS",
      name: "Prof. Priya Shah",
      dept: "AI & Data Science",
      email: "priya.shah@adit.ac.in",
      subjects: "DBMS, Data Structures"
    };
  }, [deptFaculties, faculties, selectedFacultyId]);
  const [timetable, setTimetable] = useState(() => getFacultyTimetable(currentFaculty?.id || "FAC_PS"));
  React.useEffect(() => {
    if (currentFaculty?.id) {
      setTimetable(getFacultyTimetable(currentFaculty.id));
    }
  }, [currentFaculty?.id]);
  React.useEffect(() => {
    const handleSync = () => {
      if (currentFaculty?.id) {
        setTimetable(getFacultyTimetable(currentFaculty.id));
      }
    };
    window.addEventListener("adit-timetable-synced", handleSync);
    return () => {
      window.removeEventListener("adit-timetable-synced", handleSync);
    };
  }, [currentFaculty?.id]);
  const summary = useMemo(() => {
    return calculateTimetableSummary(timetable);
  }, [timetable]);
  const departmentSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchDept = !s.dept || s.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4));
      return matchDept;
    });
  }, [subjects, selectedDept]);
  const getInitials = (name) => {
    if (!name) return "FC";
    const parts = name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/i, "").trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };
  const handleCellClick = (day, timeSlot) => {
    const existing = timetable[day]?.[timeSlot] || null;
    setActiveSlotData({ day, timeSlot, existingSlot: existing });
    setShowSlotModal(true);
  };
  const handleSaveSlot = (day, timeSlot, slotData) => {
    const updated = updateFacultySlot(currentFaculty.id, day, timeSlot, slotData);
    setTimetable({ ...updated });
    if (showToast) showToast(`Saved ${slotData.subject} for ${day} ${timeSlot}`);
    setShowSlotModal(false);
  };
  const handleClearSlot = (day, timeSlot) => {
    const updated = clearFacultySlot(currentFaculty.id, day, timeSlot);
    setTimetable({ ...updated });
  };
  const handleExecuteCopy = () => {
    if (!copyTargetFacultyId) {
      alert("Please select a target faculty to copy this timetable to.");
      return;
    }
    copyFacultyTimetable(currentFaculty.id, copyTargetFacultyId);
    const targetFac = faculties.find((f) => f.id === copyTargetFacultyId);
    if (showToast) showToast(`Timetable copied to ${targetFac?.name || "faculty"}!`);
    setShowCopyModal(false);
  };
  const handlePrint = () => {
    window.print();
  };
  const renderSlotCard = (slot) => {
    if (!slot || !slot.subject) return "-";
    const color = slot.color || getSubjectColor(slot.subject);
    const colorStyles = {
      purple: { bg: "#f3e8ff", border: "#e9d5ff", text: "#581c87", subText: "#6b21a8" },
      // DBMS
      green: { bg: "#dcfce7", border: "#bbf7d0", text: "#14532d", subText: "#15803d" },
      // DS
      coral: { bg: "#ffe4e6", border: "#fecdd3", text: "#881337", subText: "#9f1239" },
      // Python
      blue: { bg: "#e0f2fe", border: "#bae6fd", text: "#075985", subText: "#0369a1" },
      // Seminar
      amber: { bg: "#fef3c7", border: "#fde68a", text: "#78350f", subText: "#b45309" },
      // Math
      cyan: { bg: "#cffafe", border: "#a5f3fc", text: "#164e63", subText: "#0e7490" },
      indigo: { bg: "#e0e7ff", border: "#c7d2fe", text: "#312e81", subText: "#4338ca" }
    };
    const style = colorStyles[color] || colorStyles.blue;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: "8px",
          padding: "6px 8px",
          textAlign: "center",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        },
        className: "timetable-cell-badge"
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "800", fontSize: "13px", color: style.text, lineHeight: 1.2 } }, slot.subject),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: style.subText, fontWeight: "600", marginTop: "2px" } }, slot.sem || "3rd Sem", " \u2022 ", slot.div || "Div 1"),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: "10.5px", color: style.subText, opacity: 0.85, marginTop: "1px" } }, slot.room || "Room 201")
    );
  };
  return /* @__PURE__ */ React.createElement("div", { className: "faculty-timetables-view" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        paddingBottom: "20px",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: "24px"
      },
      className: "no-print"
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: "9999px",
      border: "1px solid #cbd5e1",
      padding: "6px 16px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", color: "#64748b", fontWeight: "600", marginRight: "6px" } }, "Department:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: selectedDept,
        onChange: (e) => {
          setSelectedDept(e.target.value);
          const facInDept = faculties.filter((f) => f.dept?.toLowerCase().includes(e.target.value.toLowerCase().slice(0, 4)));
          if (facInDept.length > 0) setSelectedFacultyId(facInDept[0].id);
        },
        style: {
          border: "none",
          background: "transparent",
          fontWeight: "700",
          fontSize: "13.5px",
          color: "#0f172a",
          cursor: "pointer",
          outline: "none"
        }
      },
      departments.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id || d.name, value: d.name }, d.name))
    )), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: "9999px",
      border: "1px solid #cbd5e1",
      padding: "6px 16px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", color: "#64748b", fontWeight: "600", marginRight: "6px" } }, "Semester:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: selectedSem,
        onChange: (e) => setSelectedSem(e.target.value),
        style: {
          border: "none",
          background: "transparent",
          fontWeight: "700",
          fontSize: "13.5px",
          color: "#0f172a",
          cursor: "pointer",
          outline: "none"
        }
      },
      /* @__PURE__ */ React.createElement("option", { value: "1st Semester" }, "1st Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "2nd Semester" }, "2nd Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "3rd Semester" }, "3rd Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "4th Semester" }, "4th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "5th Semester" }, "5th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "6th Semester" }, "6th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "7th Semester" }, "7th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "8th Semester" }, "8th Semester")
    ))),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, onSwitchToClassTimetable && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onSwitchToClassTimetable,
        style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "7px 15px",
          borderRadius: "8px",
          border: "1px solid #bfdbfe",
          backgroundColor: "#eff6ff",
          color: "#2563eb",
          fontWeight: "700",
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.15s ease"
        }
      },
      /* @__PURE__ */ React.createElement(Calendar, { size: 14 }),
      /* @__PURE__ */ React.createElement("span", null, "Switch to Class Timetable"),
      /* @__PURE__ */ React.createElement(ArrowRight, { size: 14 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        style: {
          position: "relative",
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#475569"
        },
        title: "Notifications"
      },
      /* @__PURE__ */ React.createElement(Bell, { size: 18 }),
      /* @__PURE__ */ React.createElement(
        "span",
        {
          style: {
            position: "absolute",
            top: "7px",
            right: "7px",
            width: "8px",
            height: "8px",
            backgroundColor: "#ef4444",
            borderRadius: "50%",
            border: "2px solid white"
          }
        }
      )
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "9999px",
          padding: "4px 14px 4px 6px",
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#93c5fd",
            color: "#1e3a8a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "14px"
          }
        },
        "A"
      ),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13.5px", fontWeight: "700", color: "#1e293b" } }, "Admin"),
      /* @__PURE__ */ React.createElement(ChevronDown, { size: 14, style: { color: "#64748b" } })
    ))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "24px"
      },
      className: "no-print"
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" } }, "Faculty Timetables"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13.5px", color: "#64748b", marginTop: "4px" } }, "View, edit and manage individual faculty timetables.")),
    /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-primary",
        onClick: () => setShowUploadModal(true),
        style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: "8px",
          padding: "10px 18px",
          fontWeight: "700",
          fontSize: "13.5px",
          border: "none",
          boxShadow: "0 2px 6px rgba(37, 99, 235, 0.35)"
        }
      },
      /* @__PURE__ */ React.createElement(UploadCloud, { size: 16 }),
      /* @__PURE__ */ React.createElement("span", null, "Upload Timetable"),
      /* @__PURE__ */ React.createElement(ChevronDown, { size: 14, style: { marginLeft: "4px" } })
    ))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "310px minmax(0, 1fr)",
        gap: "24px",
        alignItems: "start"
      },
      className: "faculty-grid-layout"
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          backgroundColor: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "20px 16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
        },
        className: "no-print"
      },
      /* @__PURE__ */ React.createElement("div", { style: { position: "relative", marginBottom: "16px" } }, /* @__PURE__ */ React.createElement(
        Search,
        {
          size: 16,
          style: {
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8"
          }
        }
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "text",
          placeholder: "Search faculty...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          style: {
            width: "100%",
            padding: "9px 12px 9px 36px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
            outline: "none",
            backgroundColor: "#f8fafc",
            transition: "all 0.2s ease"
          }
        }
      )),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px", maxHeight: "680px", overflowY: "auto" } }, deptFaculties.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "36px 14px", color: "#64748b", fontSize: "13px" } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        backgroundColor: "#f1f5f9",
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 12px auto"
      } }, /* @__PURE__ */ React.createElement(Users, { size: 22 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "14px", fontWeight: "700", color: "#334155", marginBottom: "4px" } }, "No faculty member found"), searchQuery ? /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#94a3b8", marginBottom: "14px" } }, 'No results matching "', searchQuery, '"') : /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#94a3b8", marginBottom: "14px" } }, "No faculty found in ", selectedDept), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "btn btn-primary btn-sm",
          onClick: () => setShowAddFacultyModal(true),
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            margin: "4px auto 0 auto",
            fontWeight: "700",
            padding: "8px 16px",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
          }
        },
        /* @__PURE__ */ React.createElement(Plus, { size: 15 }),
        /* @__PURE__ */ React.createElement("span", null, "Add Faculty")
      )) : deptFaculties.map((fac) => {
        const isSelected = fac.id === currentFaculty.id;
        const initials = getInitials(fac.name);
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: fac.id,
            onClick: () => setSelectedFacultyId(fac.id),
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: "10px",
              border: isSelected ? "1.5px solid #2563eb" : "1px solid #f1f5f9",
              backgroundColor: isSelected ? "#eff6ff" : "white",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: isSelected ? "0 2px 6px rgba(37, 99, 235, 0.08)" : "none"
            },
            className: "faculty-list-item"
          },
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", minWidth: 0 } }, /* @__PURE__ */ React.createElement(
            "div",
            {
              style: {
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: isSelected ? "#dbeafe" : "#e2e8f0",
                color: isSelected ? "#1d4ed8" : "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "13.5px",
                flexShrink: 0
              }
            },
            initials
          ), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: {
            fontSize: "13.5px",
            fontWeight: "700",
            color: "#0f172a",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          } }, fac.name), /* @__PURE__ */ React.createElement("div", { style: {
            fontSize: "11.5px",
            color: "#64748b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: "2px"
          } }, fac.subjects || fac.designation || "Faculty"))),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              style: {
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                border: isSelected ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                backgroundColor: isSelected ? "white" : "#f8fafc",
                color: isSelected ? "#2563eb" : "#475569",
                cursor: "pointer"
              }
            },
            "View"
          )
        );
      }))
    ),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          backgroundColor: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "16px" } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#dbeafe",
            color: "#1e40af",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "20px"
          }
        },
        getInitials(currentFaculty.name)
      ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "20px", fontWeight: "800", color: "#0f172a" } }, currentFaculty.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", color: "#64748b" } }, currentFaculty.designation || "Faculty Member"))), /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn btn-secondary btn-sm no-print",
          onClick: () => setShowEditFacultyModal(true),
          style: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            borderRadius: "8px",
            padding: "7px 14px",
            fontSize: "12.5px",
            fontWeight: "700",
            color: "#1e293b"
          }
        },
        /* @__PURE__ */ React.createElement(Edit3, { size: 14 }),
        " Edit Details"
      )),
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid #f1f5f9"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(Building2, { size: 18, style: { color: "#64748b" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" } }, "Department"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", fontWeight: "700", color: "#1e293b" } }, currentFaculty.dept || selectedDept))),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(BookOpen, { size: 18, style: { color: "#64748b" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" } }, "Subjects"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", fontWeight: "700", color: "#1e293b" } }, currentFaculty.subjects || "DBMS, Data Structures"))),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(Mail, { size: 18, style: { color: "#64748b" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" } }, "Email"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", fontWeight: "700", color: "#1e293b" } }, currentFaculty.email || `${currentFaculty.name.toLowerCase().replace(/[^a-z]/g, "")}@adit.ac.in`)))
      )
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          backgroundColor: "white",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
        }
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "18px"
          }
        },
        /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, "Timetable"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, "Click on a cell to edit.")),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, className: "no-print" }, /* @__PURE__ */ React.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "3px"
        } }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "btn-icon",
            style: { background: "none", border: "none", padding: "4px 8px", cursor: "pointer", color: "#64748b" }
          },
          /* @__PURE__ */ React.createElement(ChevronLeft, { size: 16 })
        ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", padding: "0 8px", color: "#1e293b" } }, selectedWeek), /* @__PURE__ */ React.createElement(ChevronDown, { size: 13, style: { color: "#94a3b8", marginRight: "4px" } }), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "btn-icon",
            style: { background: "none", border: "none", padding: "4px 8px", cursor: "pointer", color: "#64748b" }
          },
          /* @__PURE__ */ React.createElement(ChevronRight, { size: 16 })
        )), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: handlePrint,
            className: "btn btn-secondary btn-sm",
            style: {
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "12.5px",
              fontWeight: "700"
            }
          },
          /* @__PURE__ */ React.createElement(Printer, { size: 14 }),
          " Print"
        ))
      ),
      /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "12.5px" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("th", { style: { padding: "12px 14px", width: "110px", textAlign: "left", fontWeight: "700", color: "#475569" } }, "Time"), TIMETABLE_DAYS.map((day) => /* @__PURE__ */ React.createElement("th", { key: day, style: { padding: "12px 8px", fontWeight: "700", color: "#475569" } }, day)))), /* @__PURE__ */ React.createElement("tbody", null, TIME_SLOTS.map((slotTime) => {
        const isLunch = slotTime === "12:40 - 1:25";
        if (isLunch) {
          return /* @__PURE__ */ React.createElement("tr", { key: slotTime, style: { backgroundColor: "#f1f5f9", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 14px", textAlign: "left", fontWeight: "700", color: "#64748b", whiteSpace: "nowrap" } }, slotTime), /* @__PURE__ */ React.createElement(
            "td",
            {
              colSpan: 6,
              style: {
                padding: "8px",
                letterSpacing: "0.1em",
                fontWeight: "800",
                color: "#64748b",
                textTransform: "uppercase",
                fontSize: "11.5px",
                backgroundColor: "#e2e8f0"
              }
            },
            "LUNCH BREAK"
          ));
        }
        return /* @__PURE__ */ React.createElement("tr", { key: slotTime, style: { borderBottom: "1px solid #f1f5f9" } }, /* @__PURE__ */ React.createElement("td", { style: {
          padding: "10px 14px",
          textAlign: "left",
          fontWeight: "700",
          color: "#475569",
          whiteSpace: "nowrap",
          backgroundColor: "#fcfdfe",
          borderRight: "1px solid #f1f5f9"
        } }, slotTime), TIMETABLE_DAYS.map((day) => {
          const slot = timetable[day]?.[slotTime];
          return /* @__PURE__ */ React.createElement(
            "td",
            {
              key: day,
              onClick: () => handleCellClick(day, slotTime),
              style: {
                padding: "6px",
                borderRight: "1px solid #f1f5f9",
                height: "62px",
                verticalAlign: "middle",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                width: "14.6%"
              },
              className: "timetable-cell-interactive",
              title: `Click to edit ${day} at ${slotTime}`
            },
            slot ? renderSlotCard(slot) : /* @__PURE__ */ React.createElement("span", { style: { color: "#94a3b8", fontWeight: "500" } }, "-")
          );
        }));
      }))))
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "20px",
          alignItems: "stretch"
        },
        className: "no-print timetable-bottom-widgets"
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            backgroundColor: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
          }
        },
        /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "14px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" } }, "Quick Actions"),
        /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" } }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => {
              setActiveSlotData({ day: "Monday", timeSlot: "9:00 - 9:55", existingSlot: null });
              setShowSlotModal(true);
            },
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "12px 6px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.15s ease"
            },
            className: "quick-action-btn"
          },
          /* @__PURE__ */ React.createElement("div", { style: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          } }, /* @__PURE__ */ React.createElement(Plus, { size: 16 })),
          /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "700", color: "#334155" } }, "Add Lecture")
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => setShowCopyModal(true),
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "12px 6px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.15s ease"
            },
            className: "quick-action-btn"
          },
          /* @__PURE__ */ React.createElement("div", { style: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          } }, /* @__PURE__ */ React.createElement(Copy, { size: 15 })),
          /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "700", color: "#334155" } }, "Copy Timetable")
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => {
              const daysWithSlots = TIMETABLE_DAYS.filter((d) => Object.keys(timetable[d] || {}).length > 0);
              if (daysWithSlots.length === 0) {
                alert("Timetable is already empty.");
                return;
              }
              if (window.confirm(`Clear all scheduled slots for ${currentFaculty.name}?`)) {
                saveFacultyTimetable(currentFaculty.id, {});
                setTimetable({});
                if (showToast) showToast("All slots cleared for " + currentFaculty.name);
              }
            },
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "12px 6px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.15s ease"
            },
            className: "quick-action-btn"
          },
          /* @__PURE__ */ React.createElement("div", { style: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#fff1f2",
            color: "#e11d48",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          } }, /* @__PURE__ */ React.createElement(Trash2, { size: 15 })),
          /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "700", color: "#334155" } }, "Clear Slot")
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: handlePrint,
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "12px 6px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "all 0.15s ease"
            },
            className: "quick-action-btn"
          },
          /* @__PURE__ */ React.createElement("div", { style: {
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          } }, /* @__PURE__ */ React.createElement(Download, { size: 15 })),
          /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "700", color: "#334155" } }, "Download PDF")
        ))
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            backgroundColor: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
          }
        },
        /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "14px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" } }, "Summary"),
        /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: {
          padding: "12px 8px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          backgroundColor: "#f8fafc"
        } }, /* @__PURE__ */ React.createElement(BookOpen, { size: 18, style: { color: "#2563eb", margin: "0 auto 4px" } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, summary.subjectCount), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#64748b", fontWeight: "600" } }, "Subjects")), /* @__PURE__ */ React.createElement("div", { style: {
          padding: "12px 8px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          backgroundColor: "#f8fafc"
        } }, /* @__PURE__ */ React.createElement(Layers, { size: 18, style: { color: "#2563eb", margin: "0 auto 4px" } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, summary.totalLectures), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#64748b", fontWeight: "600" } }, "Total Lectures")), /* @__PURE__ */ React.createElement("div", { style: {
          padding: "12px 8px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          backgroundColor: "#f8fafc"
        } }, /* @__PURE__ */ React.createElement(Calendar, { size: 18, style: { color: "#2563eb", margin: "0 auto 4px" } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, summary.activeDays), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#64748b", fontWeight: "600" } }, "Active Days")))
      )
    ))
  ), showUploadModal && /* @__PURE__ */ React.createElement(
    TimetableUploadModal,
    {
      selectedFaculty: currentFaculty,
      departmentName: selectedDept,
      semesterName: selectedSem,
      onClose: () => setShowUploadModal(false),
      onTimetableUpdated: (newTt, uploadedFacultyId) => {
        const targetId = uploadedFacultyId || currentFaculty.id;
        const refreshed = getFacultyTimetable(targetId);
        setTimetable({ ...refreshed });
        if (uploadedFacultyId && uploadedFacultyId !== selectedFacultyId) {
          setSelectedFacultyId(uploadedFacultyId);
        }
      },
      showToast
    }
  ), showEditFacultyModal && /* @__PURE__ */ React.createElement(
    FacultyEditModal,
    {
      faculty: currentFaculty,
      departments,
      onClose: () => setShowEditFacultyModal(false),
      onSave: (updatedData) => {
        onSaveFaculty(updatedData);
      },
      showToast
    }
  ), showAddFacultyModal && /* @__PURE__ */ React.createElement(
    FacultyEditModal,
    {
      faculty: {
        name: searchQuery.trim(),
        dept: selectedDept,
        designation: "Assistant Professor",
        email: "",
        phone: "",
        subjects: ""
      },
      departments,
      onClose: () => setShowAddFacultyModal(false),
      onSave: (formData) => {
        const updatedFacs = saveFaculty(formData);
        const newlyCreated = updatedFacs.find((f) => f.name.toLowerCase() === formData.name.toLowerCase()) || updatedFacs[updatedFacs.length - 1];
        if (onSaveFaculty) {
          onSaveFaculty(newlyCreated || formData);
        }
        if (newlyCreated?.id) {
          setSelectedFacultyId(newlyCreated.id);
        }
        setSearchQuery(formData.name);
        setShowAddFacultyModal(false);
        if (showToast) showToast(`Faculty "${formData.name}" added successfully!`);
      },
      showToast
    }
  ), showSlotModal && activeSlotData && /* @__PURE__ */ React.createElement(
    SlotEditModal,
    {
      day: activeSlotData.day,
      timeSlot: activeSlotData.timeSlot,
      existingSlot: activeSlotData.existingSlot,
      availableSubjects: departmentSubjects,
      availableFaculties: deptFaculties,
      departmentName: selectedDept,
      semesterName: selectedSem,
      onClose: () => setShowSlotModal(false),
      onSave: handleSaveSlot,
      onClear: handleClearSlot,
      showToast
    }
  ), showCopyModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "440px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px", color: "var(--navy-primary)" } }, /* @__PURE__ */ React.createElement(Copy, { size: 18 }), "Copy Timetable"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowCopyModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b" } }, "Copy the complete weekly schedule of ", /* @__PURE__ */ React.createElement("strong", null, currentFaculty.name), " (", summary.totalLectures, " lectures) to another faculty:"), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: "700", fontSize: "13px" } }, "Target Faculty Member"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: copyTargetFacultyId,
      onChange: (e) => setCopyTargetFacultyId(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Choose Target Faculty --"),
    faculties.filter((f) => f.id !== currentFaculty.id).map((f) => /* @__PURE__ */ React.createElement("option", { key: f.id, value: f.id }, f.name, " (", f.dept, ")"))
  ))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowCopyModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-primary",
      onClick: handleExecuteCopy,
      disabled: !copyTargetFacultyId
    },
    /* @__PURE__ */ React.createElement(Check, { size: 16 }),
    " Copy Timetable"
  )))));
}
function ClassTimetablePanel({
  departments = [],
  faculties = [],
  subjects = [],
  onSwitchToFacultyTimetable,
  showToast
}) {
  const [selectedDept, setSelectedDept] = useState("AI & Data Science");
  const [selectedSem, setSelectedSem] = useState("3rd Semester");
  const [selectedDiv, setSelectedDiv] = useState("Div 1");
  const [timetable, setTimetable] = useState(() => {
    const activeDeptId = departments.find((d) => d.name === selectedDept)?.id || selectedDept;
    return getClassTimetable(selectedSem, selectedDiv, activeDeptId);
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [activeSlotData, setActiveSlotData] = useState(null);
  useEffect(() => {
    const activeDeptId = departments.find((d) => d.name === selectedDept)?.id || selectedDept;
    setTimetable(getClassTimetable(selectedSem, selectedDiv, activeDeptId));
  }, [selectedSem, selectedDiv, selectedDept, departments]);
  useEffect(() => {
    const handleSync = () => {
      const activeDeptId = departments.find((d) => d.name === selectedDept)?.id || selectedDept;
      setTimetable(getClassTimetable(selectedSem, selectedDiv, activeDeptId));
    };
    window.addEventListener("adit-timetable-synced", handleSync);
    return () => {
      window.removeEventListener("adit-timetable-synced", handleSync);
    };
  }, [selectedSem, selectedDiv, selectedDept, departments]);
  const deptFaculties = useMemo(() => {
    return faculties.filter((f) => !f.dept || f.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4)));
  }, [faculties, selectedDept]);
  const deptSubjects = useMemo(() => {
    return subjects.filter((s) => !s.dept || s.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4)));
  }, [subjects, selectedDept]);
  const summary = useMemo(() => {
    return calculateTimetableSummary(timetable);
  }, [timetable]);
  const handleCellClick = (day, timeSlot) => {
    const existing = timetable[day]?.[timeSlot] || null;
    setActiveSlotData({ day, timeSlot, existingSlot: existing });
    setShowSlotModal(true);
  };
  const handleSaveSlot = (day, timeSlot, slotData) => {
    const activeDeptId = departments.find((d) => d.name === selectedDept)?.id || selectedDept;
    const updated = updateClassSlot(selectedSem, selectedDiv, day, timeSlot, slotData, activeDeptId);
    setTimetable({ ...updated });
    if (showToast) showToast(`Saved & synced ${slotData.subject} for ${day} ${timeSlot}!`);
    setShowSlotModal(false);
  };
  const handleClearSlot = (day, timeSlot) => {
    const activeDeptId = departments.find((d) => d.name === selectedDept)?.id || selectedDept;
    const updated = clearClassSlot(selectedSem, selectedDiv, day, timeSlot, activeDeptId);
    setTimetable({ ...updated });
    if (showToast) showToast(`Cleared slot on ${day} ${timeSlot}`);
    setShowSlotModal(false);
  };
  const renderSlotCard = (slot) => {
    if (!slot || !slot.subject) return null;
    const color = slot.color || getSubjectColor(slot.subject);
    const colorStyles = {
      purple: { bg: "#f3e8ff", border: "#e9d5ff", text: "#581c87", subText: "#6b21a8" },
      green: { bg: "#dcfce7", border: "#bbf7d0", text: "#14532d", subText: "#15803d" },
      coral: { bg: "#ffe4e6", border: "#fecdd3", text: "#881337", subText: "#9f1239" },
      blue: { bg: "#e0f2fe", border: "#bae6fd", text: "#075985", subText: "#0369a1" },
      amber: { bg: "#fef3c7", border: "#fde68a", text: "#78350f", subText: "#b45309" },
      cyan: { bg: "#cffafe", border: "#a5f3fc", text: "#164e63", subText: "#0e7490" },
      indigo: { bg: "#e0e7ff", border: "#c7d2fe", text: "#312e81", subText: "#4338ca" }
    };
    const style = colorStyles[color] || colorStyles.blue;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: "8px",
          padding: "8px 10px",
          textAlign: "left",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          position: "relative"
        },
        className: "timetable-cell-badge"
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: "800", fontSize: "13.5px", color: style.text, lineHeight: 1.2 } }, slot.subject), /* @__PURE__ */ React.createElement(
        "span",
        {
          style: {
            fontSize: "10px",
            fontWeight: "700",
            padding: "2px 5px",
            borderRadius: "4px",
            backgroundColor: "rgba(255,255,255,0.8)",
            color: style.text
          }
        },
        slot.type || "Lecture"
      )),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11.5px", color: style.subText, fontWeight: "700", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" } }, /* @__PURE__ */ React.createElement(UserCheck, { size: 12 }), /* @__PURE__ */ React.createElement("span", null, slot.facultyName || "Faculty Assigned")),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: style.subText, opacity: 0.85, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" } }, /* @__PURE__ */ React.createElement(MapPin, { size: 11 }), /* @__PURE__ */ React.createElement("span", null, slot.room || "Room 201"))
    );
  };
  return /* @__PURE__ */ React.createElement("div", { className: "class-timetables-view" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        paddingBottom: "20px",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: "24px"
      },
      className: "no-print"
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: "9999px",
      border: "1px solid #cbd5e1",
      padding: "6px 16px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", color: "#64748b", fontWeight: "600", marginRight: "6px" } }, "Department:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: selectedDept,
        onChange: (e) => setSelectedDept(e.target.value),
        style: {
          border: "none",
          background: "transparent",
          fontWeight: "700",
          fontSize: "13.5px",
          color: "#0f172a",
          cursor: "pointer",
          outline: "none"
        }
      },
      departments.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id || d.name, value: d.name }, d.name))
    )), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: "9999px",
      border: "1px solid #cbd5e1",
      padding: "6px 16px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", color: "#64748b", fontWeight: "600", marginRight: "6px" } }, "Semester:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: selectedSem,
        onChange: (e) => setSelectedSem(e.target.value),
        style: {
          border: "none",
          background: "transparent",
          fontWeight: "700",
          fontSize: "13.5px",
          color: "#0f172a",
          cursor: "pointer",
          outline: "none"
        }
      },
      /* @__PURE__ */ React.createElement("option", { value: "1st Semester" }, "1st Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "2nd Semester" }, "2nd Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "3rd Semester" }, "3rd Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "4th Semester" }, "4th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "5th Semester" }, "5th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "6th Semester" }, "6th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "7th Semester" }, "7th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "8th Semester" }, "8th Semester")
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "3px" } }, ["Div 1", "Div 2", "Div 3"].map((divOption) => {
      const isActive = selectedDiv === divOption;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: divOption,
          type: "button",
          onClick: () => setSelectedDiv(divOption),
          style: {
            border: "none",
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            backgroundColor: isActive ? "white" : "transparent",
            color: isActive ? "#2563eb" : "#64748b",
            boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.15s ease"
          }
        },
        divOption
      );
    }))),
    onSwitchToFacultyTimetable && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onSwitchToFacultyTimetable,
        style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid #bfdbfe",
          backgroundColor: "#eff6ff",
          color: "#2563eb",
          fontWeight: "700",
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.15s ease"
        }
      },
      /* @__PURE__ */ React.createElement(Users, { size: 15 }),
      /* @__PURE__ */ React.createElement("span", null, "Switch to Faculty Timetables"),
      /* @__PURE__ */ React.createElement(ArrowRight, { size: 14 })
    )
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "20px"
      },
      className: "no-print"
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: "800" } }, selectedDept), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#f1f5f9", color: "#334155", fontWeight: "800" } }, selectedSem, " \u2022 ", selectedDiv)), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "24px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em", marginTop: "6px" } }, "Class Timetable & Schedule Matrix"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", marginTop: "2px" } }, "Click any cell to edit or assign subject, faculty and room. Slots remain in 100% sync with individual faculty schedules.")),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-secondary btn-sm",
        onClick: () => downloadClassTimetableTemplate(selectedDept, selectedSem, selectedDiv),
        style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }
      },
      /* @__PURE__ */ React.createElement(Download, { size: 14 }),
      " Download Template"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-secondary btn-sm",
        onClick: () => window.print(),
        style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }
      },
      /* @__PURE__ */ React.createElement(Printer, { size: 14 }),
      " Print Timetable"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-primary btn-sm",
        onClick: () => setShowUploadModal(true),
        style: {
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: "#2563eb",
          color: "white",
          fontWeight: "700",
          fontSize: "12.5px"
        }
      },
      /* @__PURE__ */ React.createElement(UploadCloud, { size: 15 }),
      /* @__PURE__ */ React.createElement("span", null, "Upload Class Timetable")
    ))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "14px",
        marginBottom: "20px"
      },
      className: "no-print"
    },
    /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "38px", height: "38px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(BookOpen, { size: 18 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: "800", color: "#0f172a" } }, summary.totalLectures), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11.5px", color: "#64748b", fontWeight: "600" } }, "Weekly Lectures"))),
    /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "38px", height: "38px", borderRadius: "8px", backgroundColor: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Users, { size: 18 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: "800", color: "#0f172a" } }, summary.facultyCount || 0), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11.5px", color: "#64748b", fontWeight: "600" } }, "Faculty Members"))),
    /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "38px", height: "38px", borderRadius: "8px", backgroundColor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Layers, { size: 18 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: "800", color: "#0f172a" } }, summary.subjectCount), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11.5px", color: "#64748b", fontWeight: "600" } }, "Distinct Subjects"))),
    /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "38px", height: "38px", borderRadius: "8px", backgroundColor: "#f3e8ff", color: "#7e22ce", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Calendar, { size: 18 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "20px", fontWeight: "800", color: "#0f172a" } }, summary.activeDays, " Days"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11.5px", color: "#64748b", fontWeight: "600" } }, "Active Working Days")))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      style: {
        padding: "0",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        overflow: "hidden",
        backgroundColor: "white"
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement(
      "table",
      {
        style: {
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
          minWidth: "780px"
        }
      },
      /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement(
        "th",
        {
          style: {
            padding: "14px 16px",
            fontSize: "12.5px",
            fontWeight: "800",
            color: "#64748b",
            textAlign: "left",
            width: "130px",
            borderRight: "1px solid #e2e8f0"
          }
        },
        "TIME / DAY"
      ), TIMETABLE_DAYS.map((day) => /* @__PURE__ */ React.createElement(
        "th",
        {
          key: day,
          style: {
            padding: "14px 10px",
            fontSize: "13px",
            fontWeight: "800",
            color: "#1e293b",
            borderRight: "1px solid #e2e8f0"
          }
        },
        day
      )))),
      /* @__PURE__ */ React.createElement("tbody", null, TIME_SLOTS.map((timeSlot) => {
        if (timeSlot === "12:40 - 1:25") {
          return /* @__PURE__ */ React.createElement(
            "tr",
            {
              key: timeSlot,
              style: {
                backgroundColor: "#f1f5f9",
                borderTop: "1px solid #e2e8f0",
                borderBottom: "1px solid #e2e8f0"
              }
            },
            /* @__PURE__ */ React.createElement(
              "td",
              {
                style: {
                  padding: "8px 16px",
                  fontSize: "11.5px",
                  fontWeight: "800",
                  color: "#64748b",
                  textAlign: "left",
                  borderRight: "1px solid #e2e8f0"
                }
              },
              timeSlot
            ),
            /* @__PURE__ */ React.createElement(
              "td",
              {
                colSpan: TIMETABLE_DAYS.length,
                style: {
                  padding: "8px",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#64748b",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase"
                }
              },
              "LUNCH BREAK (45 MINS)"
            )
          );
        }
        return /* @__PURE__ */ React.createElement("tr", { key: timeSlot, style: { borderBottom: "1px solid #f1f5f9" } }, /* @__PURE__ */ React.createElement(
          "td",
          {
            style: {
              padding: "12px 16px",
              fontSize: "12px",
              fontWeight: "700",
              color: "#475569",
              textAlign: "left",
              backgroundColor: "#fafbfc",
              borderRight: "1px solid #e2e8f0",
              whiteSpace: "nowrap"
            }
          },
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "6px" } }, /* @__PURE__ */ React.createElement(Clock, { size: 13, style: { color: "#94a3b8" } }), /* @__PURE__ */ React.createElement("span", null, timeSlot))
        ), TIMETABLE_DAYS.map((day) => {
          const slot = timetable[day]?.[timeSlot];
          return /* @__PURE__ */ React.createElement(
            "td",
            {
              key: day,
              onClick: () => handleCellClick(day, timeSlot),
              style: {
                padding: "6px 8px",
                borderRight: "1px solid #f1f5f9",
                verticalAlign: "top",
                height: "76px",
                cursor: "pointer",
                position: "relative"
              },
              className: "timetable-grid-slot-cell"
            },
            slot ? renderSlotCard(slot) : /* @__PURE__ */ React.createElement(
              "div",
              {
                style: {
                  height: "100%",
                  minHeight: "64px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  border: "1px dashed transparent",
                  transition: "all 0.15s ease"
                },
                className: "empty-slot-hover"
              },
              /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#cbd5e1", fontWeight: "600" } }, "-")
            )
          );
        }));
      }))
    ))
  ), showUploadModal && /* @__PURE__ */ React.createElement(
    TimetableUploadModal,
    {
      initialScope: "class",
      departmentName: selectedDept,
      semesterName: selectedSem,
      divisionName: selectedDiv,
      onClose: () => setShowUploadModal(false),
      onTimetableUpdated: (newTt) => {
        const refreshed = newTt || getClassTimetable(selectedSem, selectedDiv);
        setTimetable({ ...refreshed });
        if (showToast) showToast("Class timetable uploaded and synced with faculties!");
      },
      showToast
    }
  ), showSlotModal && activeSlotData && /* @__PURE__ */ React.createElement(
    SlotEditModal,
    {
      day: activeSlotData.day,
      timeSlot: activeSlotData.timeSlot,
      existingSlot: activeSlotData.existingSlot,
      availableSubjects: deptSubjects,
      availableFaculties: deptFaculties,
      departmentName: selectedDept,
      semesterName: selectedSem,
      divisionName: selectedDiv,
      onClose: () => setShowSlotModal(false),
      onSave: handleSaveSlot,
      onClear: handleClearSlot,
      showToast
    }
  ));
}
function ClassManagementPanel({ departments: initialDepts, showToast, onOpenClassTimetable }) {
  const departments = initialDepts || getDepartments();
  const [classes, setClasses] = useState(getClasses());
  const [students, setStudents] = useState(getStudents());
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [filterYear, setFilterYear] = useState("2026-27");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterSem, setFilterSem] = useState("ALL");
  const [filterDiv, setFilterDiv] = useState("ALL");
  const [classSearch, setClassSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    departmentName: "AI & Data Science",
    semester: "3rd Sem",
    division: "Div 1",
    academicYear: "2026-27"
  });
  const [classModalError, setClassModalError] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: "",
    enrollmentNo: "",
    rollNo: "",
    email: ""
  });
  const [studentModalError, setStudentModalError] = useState("");
  const [otherClassConflict, setOtherClassConflict] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [studentToMove, setStudentToMove] = useState(null);
  const [targetClassIdForMove, setTargetClassIdForMove] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewRows, setUploadPreviewRows] = useState(null);
  const [uploadStats, setUploadStats] = useState({ total: 0, valid: 0, duplicates: 0, conflicts: 0, invalid: 0 });
  const [moveExistingOnImport, setMoveExistingOnImport] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const refreshData = () => {
    setClasses([...getClasses()]);
    setStudents([...getStudents()]);
  };
  const selectedClass = useMemo(() => {
    if (!selectedClassId) return null;
    return classes.find((c) => c.id === selectedClassId) || null;
  }, [selectedClassId, classes]);
  const studentsInSelectedClass = useMemo(() => {
    if (!selectedClassId) return [];
    return getStudentsByClassId(selectedClassId);
  }, [selectedClassId, students]);
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchYear = filterYear === "ALL" || cls.academicYear === filterYear;
      const matchDept = filterDept === "ALL" || cls.departmentName === filterDept || cls.departmentId === filterDept;
      const matchSem = filterSem === "ALL" || normalizeSem(cls.semester) === normalizeSem(filterSem);
      const matchDiv = filterDiv === "ALL" || normalizeDiv(cls.division) === normalizeDiv(filterDiv);
      const q = classSearch.toLowerCase().trim();
      const matchSearch = !q || cls.departmentName.toLowerCase().includes(q) || cls.semester.toLowerCase().includes(q) || cls.division.toLowerCase().includes(q);
      return matchYear && matchDept && matchSem && matchDiv && matchSearch;
    });
  }, [classes, filterYear, filterDept, filterSem, filterDiv, classSearch]);
  const filteredClassStudents = useMemo(() => {
    if (!studentSearch.trim()) return studentsInSelectedClass;
    const q = studentSearch.toLowerCase().trim();
    return studentsInSelectedClass.filter(
      (s) => s.name.toLowerCase().includes(q) || s.enrollmentNo.toLowerCase().includes(q) || String(s.rollNo || "").includes(q) || s.email && s.email.toLowerCase().includes(q)
    );
  }, [studentsInSelectedClass, studentSearch]);
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassForm({
      departmentName: filterDept !== "ALL" ? filterDept : departments[0]?.name || "AI & Data Science",
      semester: filterSem !== "ALL" ? filterSem : "3rd Sem",
      division: filterDiv !== "ALL" ? filterDiv : "Div 1",
      academicYear: filterYear !== "ALL" ? filterYear : "2026-27"
    });
    setClassModalError("");
    setShowClassModal(true);
  };
  const handleOpenEditClass = (cls, e) => {
    if (e) e.stopPropagation();
    setEditingClass(cls);
    setClassForm({
      departmentName: cls.departmentName,
      semester: cls.semester,
      division: cls.division,
      academicYear: cls.academicYear
    });
    setClassModalError("");
    setShowClassModal(true);
  };
  const handleSaveClassSubmit = (e) => {
    e.preventDefault();
    setClassModalError("");
    try {
      const res = saveClass({
        ...editingClass ? { id: editingClass.id } : {},
        departmentName: classForm.departmentName,
        semester: classForm.semester,
        division: classForm.division,
        academicYear: classForm.academicYear
      });
      refreshData();
      setShowClassModal(false);
      if (showToast) showToast(editingClass ? "Class updated successfully!" : "New class created successfully!");
    } catch (err) {
      setClassModalError(err.message || "Error saving class.");
    }
  };
  const handleDeleteClass = (cls, e) => {
    if (e) e.stopPropagation();
    const enrolled = getStudentsByClassId(cls.id);
    const msg = enrolled.length > 0 ? `This class has ${enrolled.length} enrolled student(s). Are you sure you want to delete "${cls.departmentName} \u2022 ${cls.semester} \u2022 ${cls.division} (${cls.academicYear})"?` : `Are you sure you want to delete "${cls.departmentName} \u2022 ${cls.semester} \u2022 ${cls.division} (${cls.academicYear})"?`;
    if (window.confirm(msg)) {
      deleteClass(cls.id, false);
      refreshData();
      if (selectedClassId === cls.id) {
        setSelectedClassId(null);
      }
      if (showToast) showToast("Class deleted.");
    }
  };
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: "",
      enrollmentNo: "",
      rollNo: String(studentsInSelectedClass.length + 1),
      email: ""
    });
    setStudentModalError("");
    setOtherClassConflict(null);
    setShowStudentModal(true);
  };
  const handleOpenEditStudent = (st) => {
    setEditingStudent(st);
    setStudentForm({
      name: st.name,
      enrollmentNo: st.enrollmentNo,
      rollNo: st.rollNo || "",
      email: st.email || ""
    });
    setStudentModalError("");
    setOtherClassConflict(null);
    setShowStudentModal(true);
  };
  const handleStudentFormChange = (field, val) => {
    setStudentForm((prev) => ({ ...prev, [field]: val }));
    setStudentModalError("");
    if (field === "enrollmentNo" && val.trim().length >= 3) {
      const check = checkStudentEnrollment(val.trim(), selectedClassId, editingStudent?.id);
      if (check.exists) {
        if (check.inSameClass) {
          setStudentModalError("Student with this enrollment number already exists in this class.");
          setOtherClassConflict(null);
        } else {
          setStudentModalError(`Student is already enrolled in ${check.currentClassName}.`);
          setOtherClassConflict(check);
        }
      } else {
        setOtherClassConflict(null);
      }
    }
  };
  const handleSaveStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.enrollmentNo.trim()) {
      setStudentModalError("Enrollment Number and Student Name are required.");
      return;
    }
    const check = checkStudentEnrollment(studentForm.enrollmentNo.trim(), selectedClassId, editingStudent?.id);
    if (check.exists) {
      if (check.inSameClass) {
        setStudentModalError("Student with this enrollment number already exists in this class.");
        return;
      } else if (!otherClassConflict) {
        setStudentModalError(`Student with this enrollment number is already enrolled in ${check.currentClassName}.`);
        setOtherClassConflict(check);
        return;
      }
    }
    try {
      saveStudent({
        ...editingStudent ? { id: editingStudent.id } : {},
        name: studentForm.name.trim(),
        enrollmentNo: studentForm.enrollmentNo.trim(),
        rollNo: studentForm.rollNo.trim(),
        email: studentForm.email.trim(),
        classId: editingStudent ? editingStudent.classId || selectedClassId : selectedClassId
      });
      refreshData();
      setShowStudentModal(false);
      if (showToast) showToast(editingStudent ? "Student details updated!" : "Student added to class!");
    } catch (err) {
      setStudentModalError(err.message);
    }
  };
  const handleMoveConflictStudent = () => {
    if (!otherClassConflict?.existingStudent?.id) return;
    try {
      moveStudentToClass(otherClassConflict.existingStudent.id, selectedClassId);
      refreshData();
      setShowStudentModal(false);
      if (showToast) showToast(`Student moved to this class successfully!`);
    } catch (err) {
      setStudentModalError(err.message);
    }
  };
  const handleInitiateRemoveStudent = (st) => {
    setStudentToRemove(st);
    setShowRemoveModal(true);
  };
  const handleConfirmRemoveStudent = () => {
    if (!studentToRemove) return;
    removeStudentFromClass(studentToRemove.id, selectedClassId);
    refreshData();
    setShowRemoveModal(false);
    if (showToast) showToast(`Student "${studentToRemove.name}" removed from class.`);
    setStudentToRemove(null);
  };
  const handleOpenMoveModal = (st) => {
    setStudentToMove(st);
    const otherClasses = classes.filter((c) => c.id !== selectedClassId);
    setTargetClassIdForMove(otherClasses[0]?.id || "");
    setShowMoveModal(true);
  };
  const handleConfirmMove = () => {
    if (!studentToMove || !targetClassIdForMove) return;
    try {
      moveStudentToClass(studentToMove.id, targetClassIdForMove);
      refreshData();
      setShowMoveModal(false);
      if (showToast) showToast(`Student "${studentToMove.name}" moved to new class!`);
    } catch (err) {
      alert("Error moving student: " + err.message);
    }
  };
  const handleDownloadSampleTemplate = () => {
    const wb = XLSX.utils.book_new();
    const sampleData = [
      ["Roll No", "Enrollment No", "Student Name", "Email"],
      ["1", "24AD001", "Aarav Patel", "aarav.patel@adit.ac.in"],
      ["2", "24AD002", "Ananya Sharma", "ananya.sharma@adit.ac.in"],
      ["3", "24AD003", "Devansh Verma", "devansh.verma@adit.ac.in"],
      ["4", "24AD004", "Diyansh Joshi", "diyansh.joshi@adit.ac.in"],
      ["5", "24AD005", "Isha Mehta", "isha.mehta@adit.ac.in"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, `Class_${selectedClass?.semester || "Sem"}_${selectedClass?.division || "Div"}_Template.xlsx`);
  };
  const handleExportClassStudents = () => {
    if (!selectedClass || studentsInSelectedClass.length === 0) {
      alert("No students to export.");
      return;
    }
    const wb = XLSX.utils.book_new();
    const header = [
      ["ADIT Attendance Management System - Official Class Roster"],
      [`Department: ${selectedClass.departmentName}`, `Semester: ${selectedClass.semester}`, `Division: ${selectedClass.division}`, `Academic Year: ${selectedClass.academicYear}`],
      [`Total Students: ${studentsInSelectedClass.length}`, `Export Date: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`],
      [],
      ["Roll No", "Enrollment No", "Student Name", "Email", "Department", "Semester", "Division", "Academic Year"]
    ];
    const rows = studentsInSelectedClass.map((s) => [
      s.rollNo || "",
      s.enrollmentNo || "",
      s.name || "",
      s.email || "",
      selectedClass.departmentName,
      selectedClass.semester,
      selectedClass.division,
      selectedClass.academicYear
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Enrolled Students");
    const safeName = `${selectedClass.departmentName.replace(/[^a-zA-Z0-9]/g, "_")}_${selectedClass.semester}_${selectedClass.division}`.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `${safeName}_Roster_${selectedClass.academicYear}.xlsx`);
  };
  const handleUploadFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setIsProcessingUpload(true);
    setUploadPreviewRows(null);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      if (!firstSheet) throw new Error("Spreadsheet has no readable sheets.");
      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
      if (!rawRows || rawRows.length < 2) {
        throw new Error("Spreadsheet is empty or lacks headers.");
      }
      let headerIdx = 0;
      for (let i = 0; i < Math.min(5, rawRows.length); i++) {
        const rowStr = rawRows[i].join(" ").toLowerCase();
        if (rowStr.includes("enroll") || rowStr.includes("name") || rowStr.includes("roll")) {
          headerIdx = i;
          break;
        }
      }
      const headers = rawRows[headerIdx].map((h) => String(h || "").trim().toLowerCase());
      let rollCol = headers.findIndex((h) => /^(roll|roll\s*no|rno|sr|sr\s*no|no)$/i.test(h));
      let enrCol = headers.findIndex((h) => /^(enroll|enrollment|enrollment\s*no|enrolment|id|enr)$/i.test(h));
      let nameCol = headers.findIndex((h) => /^(name|student\s*name|full\s*name|student)$/i.test(h));
      let emailCol = headers.findIndex((h) => /^(email|e-mail|email\s*address|mail)$/i.test(h));
      if (enrCol === -1) {
        enrCol = headers.findIndex((h) => h.includes("enr") || h.includes("enroll"));
      }
      if (nameCol === -1) {
        nameCol = headers.findIndex((h) => h.includes("name") || h.includes("student"));
      }
      if (rollCol === -1) {
        rollCol = headers.findIndex((h) => h.includes("roll") || h.includes("sr"));
      }
      if (emailCol === -1) {
        emailCol = headers.findIndex((h) => h.includes("mail"));
      }
      if (enrCol === -1 && nameCol === -1) {
        rollCol = 0;
        enrCol = 1;
        nameCol = 2;
        emailCol = 3;
      }
      const fileEnrollmentSeen = /* @__PURE__ */ new Set();
      const analyzedRows = [];
      let valid = 0, duplicates = 0, conflicts = 0, invalid = 0;
      for (let r = headerIdx + 1; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row || row.every((cell) => !cell)) continue;
        const rollNo = rollCol !== -1 ? String(row[rollCol] || "").trim() : "";
        const enr = enrCol !== -1 ? String(row[enrCol] || "").trim() : "";
        const name = nameCol !== -1 ? String(row[nameCol] || "").trim() : "";
        const email = emailCol !== -1 ? String(row[emailCol] || "").trim() : "";
        const rowItem = {
          rowNumber: r + 1,
          rollNo: rollNo || String(r - headerIdx),
          enrollmentNo: enr,
          name,
          email,
          status: "valid",
          reason: "Ready to import"
        };
        if (!name || !enr) {
          rowItem.status = "invalid";
          rowItem.reason = !name ? "Missing student name" : "Missing enrollment number";
          invalid++;
        } else if (fileEnrollmentSeen.has(enr.toLowerCase())) {
          rowItem.status = "duplicate";
          rowItem.reason = "Duplicate enrollment number inside this file";
          duplicates++;
        } else {
          fileEnrollmentSeen.add(enr.toLowerCase());
          const check = checkStudentEnrollment(enr, selectedClassId);
          if (check.exists) {
            if (check.inSameClass) {
              rowItem.status = "duplicate";
              rowItem.reason = "Already enrolled in this class (will update details)";
              duplicates++;
            } else {
              rowItem.status = "conflict";
              rowItem.reason = `Enrolled in ${check.currentClassName}`;
              rowItem.otherClass = check.currentClass;
              conflicts++;
            }
          } else {
            valid++;
          }
        }
        analyzedRows.push(rowItem);
      }
      setUploadPreviewRows(analyzedRows);
      setUploadStats({
        total: analyzedRows.length,
        valid,
        duplicates,
        conflicts,
        invalid
      });
    } catch (err) {
      alert("Error parsing uploaded file: " + err.message);
      setUploadFile(null);
    } finally {
      setIsProcessingUpload(false);
    }
  };
  const handleConfirmBulkImport = () => {
    if (!uploadPreviewRows || !selectedClassId) return;
    const validRowsToImport = uploadPreviewRows.filter(
      (r) => r.status === "valid" || r.status === "duplicate" || r.status === "conflict" && moveExistingOnImport
    );
    if (validRowsToImport.length === 0) {
      alert("No valid students to import. Please review the errors in the preview table.");
      return;
    }
    try {
      const result = bulkImportStudentsToClass(selectedClassId, validRowsToImport, {
        moveExisting: moveExistingOnImport
      });
      refreshData();
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreviewRows(null);
      const msg = `Successfully imported ${result.importedCount} new student(s)${result.updatedCount ? `, updated ${result.updatedCount}` : ""}${result.movedCount ? `, moved ${result.movedCount} from other classes` : ""}!`;
      if (showToast) showToast(msg);
      if (result.errors?.length > 0) {
        alert("Some rows were skipped during import:\n" + result.errors.slice(0, 5).join("\n"));
      }
    } catch (err) {
      alert("Failed to import students: " + err.message);
    }
  };
  if (selectedClass) {
    return /* @__PURE__ */ React.createElement("div", { className: "admin-subview" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: () => {
          setSelectedClassId(null);
          setStudentSearch("");
        },
        style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }
      },
      /* @__PURE__ */ React.createElement(ArrowLeft, { size: 16 }),
      /* @__PURE__ */ React.createElement("span", null, "Back to All Classes")
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px" } }, onOpenClassTimetable && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: () => onOpenClassTimetable(selectedClass.departmentName, selectedClass.semester, selectedClass.division),
        style: { color: "#2563eb", borderColor: "#bfdbfe" }
      },
      /* @__PURE__ */ React.createElement(Layers, { size: 14 }),
      /* @__PURE__ */ React.createElement("span", null, "View Class Timetable")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: (e) => handleOpenEditClass(selectedClass, e)
      },
      /* @__PURE__ */ React.createElement(Edit2, { size: 14 }),
      /* @__PURE__ */ React.createElement("span", null, "Edit Class Details")
    ))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px", marginBottom: "24px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#2563eb", color: "white", fontWeight: "800", fontSize: "12px", padding: "4px 10px" } }, selectedClass.departmentName), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#e2e8f0", color: "#1e293b", fontWeight: "800" } }, selectedClass.academicYear)), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "12px" } }, selectedClass.semester, " \u2022 ", selectedClass.division), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", fontSize: "13px", color: "#64748b", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Department:"), " ", selectedClass.departmentName), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Academic Year:"), " ", selectedClass.academicYear), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Enrolled:"), " ", /* @__PURE__ */ React.createElement("span", { style: { color: "#059669", fontWeight: "800" } }, studentsInSelectedClass.length, " Students")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-primary btn-sm",
        onClick: handleOpenAddStudent,
        style: { display: "flex", alignItems: "center", gap: "6px" }
      },
      /* @__PURE__ */ React.createElement(Plus, { size: 16 }),
      /* @__PURE__ */ React.createElement("span", null, "Add Student")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: () => {
          setUploadFile(null);
          setUploadPreviewRows(null);
          setShowUploadModal(true);
        },
        style: { display: "flex", alignItems: "center", gap: "6px", color: "#2563eb", borderColor: "#bfdbfe", backgroundColor: "#eff6ff" }
      },
      /* @__PURE__ */ React.createElement(UploadCloud, { size: 16 }),
      /* @__PURE__ */ React.createElement("span", null, "Bulk Upload (.xlsx, .csv)")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: handleExportClassStudents,
        style: { display: "flex", alignItems: "center", gap: "6px" }
      },
      /* @__PURE__ */ React.createElement(Download, { size: 16 }),
      /* @__PURE__ */ React.createElement("span", null, "Export Roster")
    )))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "19px", fontWeight: "800", color: "#0f172a" } }, "Students (", filteredClassStudents.length, ")"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", color: "#64748b" } }, selectedClass.departmentName, " \u2022 ", selectedClass.semester, " \u2022 ", selectedClass.division, " (", selectedClass.academicYear, ")")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { className: "input-with-icon", style: { minWidth: "220px" } }, /* @__PURE__ */ React.createElement(Search, { className: "input-icon", size: 15 }), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "form-control",
        placeholder: "Search Enrollment No, Name...",
        value: studentSearch,
        onChange: (e) => setStudentSearch(e.target.value),
        style: { height: "36px", fontSize: "13px" }
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-primary btn-sm",
        onClick: handleOpenAddStudent,
        style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", height: "36px" }
      },
      /* @__PURE__ */ React.createElement(Plus, { size: 15 }),
      /* @__PURE__ */ React.createElement("span", null, "+ Add Student")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: () => {
          setUploadFile(null);
          setUploadPreviewRows(null);
          setShowUploadModal(true);
        },
        style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", height: "36px", color: "#2563eb", borderColor: "#bfdbfe", backgroundColor: "#eff6ff" }
      },
      /* @__PURE__ */ React.createElement(UploadCloud, { size: 15 }),
      /* @__PURE__ */ React.createElement("span", null, "Upload Student List")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: handleExportClassStudents,
        style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", height: "36px" },
        title: "Export Roster to Excel"
      },
      /* @__PURE__ */ React.createElement(Download, { size: 14 }),
      /* @__PURE__ */ React.createElement("span", null, "Export")
    ))), filteredClassStudents.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { border: "1px solid #e2e8f0", borderRadius: "10px" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "13px" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" } }, /* @__PURE__ */ React.createElement("th", { style: { padding: "12px 16px", width: "70px", fontWeight: "800", color: "#475569" } }, "Roll No"), /* @__PURE__ */ React.createElement("th", { style: { padding: "12px 16px", width: "170px", fontWeight: "800", color: "#475569" } }, "Enrollment No."), /* @__PURE__ */ React.createElement("th", { style: { padding: "12px 16px", fontWeight: "800", color: "#475569" } }, "Student Name"), /* @__PURE__ */ React.createElement("th", { style: { padding: "12px 16px", fontWeight: "800", color: "#475569" } }, "Email Address"), /* @__PURE__ */ React.createElement("th", { style: { padding: "12px 16px", width: "190px", textAlign: "right", fontWeight: "800", color: "#475569" } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, filteredClassStudents.map((st, idx) => /* @__PURE__ */ React.createElement(
      "tr",
      {
        key: st.id || idx,
        style: {
          borderBottom: "1px solid #f1f5f9",
          backgroundColor: idx % 2 === 0 ? "white" : "#fafbfc"
        }
      },
      /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", fontWeight: "800", color: "#0f172a" } }, /* @__PURE__ */ React.createElement("span", { style: {
        display: "inline-block",
        padding: "3px 8px",
        backgroundColor: "#f1f5f9",
        borderRadius: "6px",
        textAlign: "center",
        minWidth: "28px"
      } }, st.rollNo || idx + 1)),
      /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", fontFamily: "monospace", fontWeight: "700", color: "#2563eb" } }, st.enrollmentNo),
      /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", fontWeight: "700", color: "#0f172a" } }, st.name),
      /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", color: "#64748b" } }, st.email || "\u2014"),
      /* @__PURE__ */ React.createElement("td", { style: { padding: "12px 16px", textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "btn btn-secondary btn-sm",
          onClick: () => handleOpenEditStudent(st),
          title: "Edit Student",
          style: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", fontSize: "12.5px", fontWeight: "700" }
        },
        /* @__PURE__ */ React.createElement(Edit2, { size: 13 }),
        /* @__PURE__ */ React.createElement("span", null, "Edit")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "btn btn-secondary btn-sm",
          onClick: () => handleInitiateRemoveStudent(st),
          title: "Remove Student from this class",
          style: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", fontSize: "12.5px", fontWeight: "700", color: "#e11d48", borderColor: "#fecdd3", backgroundColor: "#fff1f2" }
        },
        /* @__PURE__ */ React.createElement(Trash2, { size: 13 }),
        /* @__PURE__ */ React.createElement("span", null, "Remove")
      )))
    ))))) : /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "48px 20px", border: "2px dashed #e2e8f0", borderRadius: "12px", backgroundColor: "#f8fafc" } }, /* @__PURE__ */ React.createElement(Users, { size: 36, style: { color: "#94a3b8", margin: "0 auto 12px auto" } }), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "16px", fontWeight: "800", color: "#0f172a" } }, studentSearch ? "No matching students found" : "No students enrolled in this class yet"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", maxWidth: "420px", margin: "6px auto 18px auto" } }, studentSearch ? "Try adjusting your search criteria." : "Add students individually or import a student roster spreadsheet (.xlsx, .csv)."), !studentSearch && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-primary btn-sm", onClick: handleOpenAddStudent }, /* @__PURE__ */ React.createElement(Plus, { size: 15 }), " Add First Student"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: () => {
          setUploadFile(null);
          setUploadPreviewRows(null);
          setShowUploadModal(true);
        }
      },
      /* @__PURE__ */ React.createElement(UploadCloud, { size: 15 }),
      " Upload Excel / CSV"
    )))), renderModals());
  }
  return /* @__PURE__ */ React.createElement("div", { className: "admin-subview" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a" } }, "Academic Classes"), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: "800", fontSize: "12px" } }, "Academic Year ", filterYear)), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13.5px", color: "#64748b", marginTop: "4px" } }, "Organize students into distinct classes based on Department + Semester + Division + Academic Year.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-primary btn-sm",
      onClick: handleOpenCreateClass,
      style: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px" }
    },
    /* @__PURE__ */ React.createElement(Plus, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, "Create Class")
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Total Classes"), /* @__PURE__ */ React.createElement("div", { style: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(GraduationCap, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "8px" } }, classes.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#059669", fontWeight: "600" } }, "Active Across Departments")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Total Students"), /* @__PURE__ */ React.createElement("div", { style: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Users, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "8px" } }, students.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#2563eb", fontWeight: "600" } }, "Enrolled & Tracked")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Academic Year"), /* @__PURE__ */ React.createElement("div", { style: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Calendar, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "8px" } }, filterYear), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, "Selected Session"))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "16px 20px", marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: "130px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px", display: "block" } }, "Academic Year"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: filterYear,
      onChange: (e) => setFilterYear(e.target.value),
      style: { fontSize: "13px", fontWeight: "700" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Years"),
    ACADEMIC_YEARS.map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y }, y))
  )), /* @__PURE__ */ React.createElement("div", { style: { minWidth: "180px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px", display: "block" } }, "Department"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: filterDept,
      onChange: (e) => setFilterDept(e.target.value),
      style: { fontSize: "13px", fontWeight: "700" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Departments"),
    departments.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id || d.name, value: d.name }, d.name))
  )), /* @__PURE__ */ React.createElement("div", { style: { minWidth: "130px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px", display: "block" } }, "Semester"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: filterSem,
      onChange: (e) => setFilterSem(e.target.value),
      style: { fontSize: "13px", fontWeight: "700" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Semesters"),
    SEMESTERS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.id))
  )), /* @__PURE__ */ React.createElement("div", { style: { minWidth: "110px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px", display: "block" } }, "Division"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: filterDiv,
      onChange: (e) => setFilterDiv(e.target.value),
      style: { fontSize: "13px", fontWeight: "700" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "All Divs"),
    /* @__PURE__ */ React.createElement("option", { value: "Div 1" }, "Div 1"),
    /* @__PURE__ */ React.createElement("option", { value: "Div 2" }, "Div 2"),
    /* @__PURE__ */ React.createElement("option", { value: "Div 3" }, "Div 3")
  ))), /* @__PURE__ */ React.createElement("div", { style: { minWidth: "220px" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "4px", display: "block" } }, "Search"), /* @__PURE__ */ React.createElement("div", { className: "input-with-icon" }, /* @__PURE__ */ React.createElement(Search, { className: "input-icon", size: 15 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Search classes...",
      value: classSearch,
      onChange: (e) => setClassSearch(e.target.value),
      style: { fontSize: "13px" }
    }
  ))))), filteredClasses.length > 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "18px" } }, filteredClasses.map((cls) => {
    const studentCount = getStudentsByClassId(cls.id).length;
    const deptObj = departments.find((d) => d.id === cls.departmentId || d.name === cls.departmentName);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: cls.id,
        className: "card",
        onClick: () => {
          setSelectedClassId(cls.id);
          setStudentSearch("");
        },
        style: {
          padding: "20px",
          cursor: "pointer",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          backgroundColor: "white"
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(15, 23, 42, 0.08)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "none";
        }
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#1e40af", fontWeight: "800", fontSize: "11px", padding: "4px 8px" } }, deptObj?.code || "DEPT"), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#f1f5f9", color: "#475569", fontWeight: "700", fontSize: "11px" } }, cls.academicYear)), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" } }, cls.semester, " \u2022 ", cls.division), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "16px" } }, cls.departmentName), /* @__PURE__ */ React.createElement("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: studentCount > 0 ? "#ecfdf5" : "#f8fafc",
        color: studentCount > 0 ? "#065f46" : "#64748b",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "700"
      } }, /* @__PURE__ */ React.createElement(Users, { size: 16 }), /* @__PURE__ */ React.createElement("span", null, studentCount, " Students Enrolled"))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "btn btn-primary btn-sm",
          onClick: () => {
            setSelectedClassId(cls.id);
            setStudentSearch("");
          },
          style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }
        },
        /* @__PURE__ */ React.createElement("span", null, "View Students"),
        /* @__PURE__ */ React.createElement(ChevronRight, { size: 14 })
      ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "6px" } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "btn btn-secondary btn-sm",
          onClick: (e) => handleOpenEditClass(cls, e),
          title: "Edit Class Details",
          style: { padding: "6px 8px" }
        },
        /* @__PURE__ */ React.createElement(Edit2, { size: 13 })
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "btn btn-secondary btn-sm",
          onClick: (e) => handleDeleteClass(cls, e),
          title: "Delete Class",
          style: { padding: "6px 8px", color: "#e11d48" }
        },
        /* @__PURE__ */ React.createElement(Trash2, { size: 13 })
      )))
    );
  })) : /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "48px 20px", textAlign: "center" } }, /* @__PURE__ */ React.createElement(GraduationCap, { size: 40, style: { color: "#94a3b8", margin: "0 auto 12px auto" } }), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, "No classes match your filter"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", maxWidth: "420px", margin: "6px auto 18px auto" } }, "Try clearing filters or create a new class for this academic year."), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-primary btn-sm", onClick: handleOpenCreateClass }, /* @__PURE__ */ React.createElement(Plus, { size: 15 }), " Create Class Now")), renderModals());
  function renderModals() {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, showClassModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "480px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(GraduationCap, { size: 20, style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "17px", fontWeight: "800", color: "#0f172a" } }, editingClass ? "Edit Class Details" : "Create New Class")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowClassModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveClassSubmit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "16px" } }, classModalError && /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecdd3", color: "#991b1b", borderRadius: "8px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(AlertCircle, { size: 16 }), /* @__PURE__ */ React.createElement("span", null, classModalError)), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Department *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "form-control",
        value: classForm.departmentName,
        onChange: (e) => setClassForm((prev) => ({ ...prev, departmentName: e.target.value })),
        required: true
      },
      departments.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id || d.name, value: d.name }, d.name))
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Semester *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "form-control",
        value: classForm.semester,
        onChange: (e) => setClassForm((prev) => ({ ...prev, semester: e.target.value })),
        required: true
      },
      SEMESTERS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.id))
    )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Division *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "form-control",
        value: classForm.division,
        onChange: (e) => setClassForm((prev) => ({ ...prev, division: e.target.value })),
        required: true
      },
      /* @__PURE__ */ React.createElement("option", { value: "Div 1" }, "Division 1 (Div 1)"),
      /* @__PURE__ */ React.createElement("option", { value: "Div 2" }, "Division 2 (Div 2)"),
      /* @__PURE__ */ React.createElement("option", { value: "Div 3" }, "Division 3 (Div 3)"),
      /* @__PURE__ */ React.createElement("option", { value: "Div 4" }, "Division 4 (Div 4)")
    ))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Academic Year *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "form-control",
        value: classForm.academicYear,
        onChange: (e) => setClassForm((prev) => ({ ...prev, academicYear: e.target.value })),
        required: true
      },
      ACADEMIC_YEARS.map((y) => /* @__PURE__ */ React.createElement("option", { key: y, value: y }, y))
    ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" } }, "Classes are strictly separated across academic years to preserve cohort rosters."))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer", style: { display: "flex", justifyContent: "flex-end", gap: "10px" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowClassModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, editingClass ? "Save Changes" : "Create Class"))))), showStudentModal && selectedClass && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "480px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, editingStudent ? "Edit Student" : "Add Student"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, selectedClass.departmentName, " \u2022 ", selectedClass.semester, " \u2022 ", selectedClass.division)), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowStudentModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveStudentSubmit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, studentModalError && /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 14px", backgroundColor: otherClassConflict ? "#eff6ff" : "#fef2f2", border: `1px solid ${otherClassConflict ? "#bfdbfe" : "#fecdd3"}`, color: otherClassConflict ? "#1e40af" : "#991b1b", borderRadius: "8px", fontSize: "13px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: "8px" } }, /* @__PURE__ */ React.createElement(AlertCircle, { size: 16, style: { flexShrink: 0, marginTop: "2px" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, studentModalError), otherClassConflict && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "8px" } }, /* @__PURE__ */ React.createElement("span", null, "This student already exists in ", otherClassConflict.currentClassName, ". Would you like to move this student to this class instead of creating a duplicate?"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "8px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-primary btn-sm",
        onClick: handleMoveConflictStudent
      },
      "Move Student to this Class"
    )))))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Enrollment Number *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "form-control",
        placeholder: "e.g. 24AD001",
        value: studentForm.enrollmentNo,
        onChange: (e) => handleStudentFormChange("enrollmentNo", e.target.value),
        required: true,
        style: { fontFamily: "monospace", fontWeight: "700" }
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Student Name *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "form-control",
        placeholder: "e.g. Student Name",
        value: studentForm.name,
        onChange: (e) => handleStudentFormChange("name", e.target.value),
        required: true
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Roll Number (Optional)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "form-control",
        placeholder: "e.g. 1",
        value: studentForm.rollNo,
        onChange: (e) => handleStudentFormChange("rollNo", e.target.value)
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Email Address (Optional)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "email",
        className: "form-control",
        placeholder: "e.g. student@adit.ac.in",
        value: studentForm.email,
        onChange: (e) => handleStudentFormChange("email", e.target.value)
      }
    )))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer", style: { display: "flex", justifyContent: "flex-end", gap: "10px" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowStudentModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary", disabled: !!otherClassConflict }, editingStudent ? "Save Changes" : "Add Student"))))), showRemoveModal && studentToRemove && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "440px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#e11d48", fontSize: "18px", fontWeight: "800" } }, /* @__PURE__ */ React.createElement(Trash2, { size: 20 }), "Remove Student?"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowRemoveModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "14px", color: "#475569", margin: 0 } }, "Are you sure you want to remove:"), /* @__PURE__ */ React.createElement("div", { style: {
      padding: "14px 16px",
      backgroundColor: "#fef2f2",
      borderRadius: "8px",
      border: "1px solid #fecdd3"
    } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "16px", fontWeight: "800", color: "#0f172a" } }, studentToRemove.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", color: "#64748b", marginTop: "4px", fontFamily: "monospace" } }, "Enrollment No: ", /* @__PURE__ */ React.createElement("strong", null, studentToRemove.enrollmentNo))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#64748b", margin: 0 } }, "The student will be removed from this class roster. Historical attendance records will remain safe.")), /* @__PURE__ */ React.createElement("div", { className: "modal-footer", style: { display: "flex", justifyContent: "flex-end", gap: "10px" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowRemoveModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-primary",
        onClick: handleConfirmRemoveStudent,
        style: { backgroundColor: "#e11d48", borderColor: "#e11d48", fontWeight: "700" }
      },
      "Remove"
    )))), showMoveModal && studentToMove && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "460px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(ArrowRightLeft, { size: 18, style: { color: "#2563eb" } }), /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "17px", fontWeight: "800", color: "#0f172a" } }, "Move Student to Another Class")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowMoveModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Student:"), " ", studentToMove.name), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Enrollment:"), " ", /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "monospace" } }, studentToMove.enrollmentNo)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Current Class:"), " ", selectedClass?.departmentName, " \u2022 ", selectedClass?.semester, " \u2022 ", selectedClass?.division, " (", selectedClass?.academicYear, ")")), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Select Destination Class *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "form-control",
        value: targetClassIdForMove,
        onChange: (e) => setTargetClassIdForMove(e.target.value),
        required: true
      },
      classes.filter((c) => c.id !== selectedClassId).map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, c.departmentName, " \u2022 ", c.semester, " \u2022 ", c.division, " (", c.academicYear, ")"))
    ))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer", style: { display: "flex", justifyContent: "flex-end", gap: "10px" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowMoveModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-primary", onClick: handleConfirmMove }, "Move Student")))), showUploadModal && selectedClass && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, "Bulk Student Upload (Excel / CSV)"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, "Target Class: ", /* @__PURE__ */ React.createElement("strong", null, selectedClass.departmentName, " \u2022 ", selectedClass.semester, " \u2022 ", selectedClass.division, " (", selectedClass.academicYear, ")"))), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowUploadModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "14px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", flexWrap: "wrap", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", color: "#475569" } }, /* @__PURE__ */ React.createElement("strong", null, "Expected Columns:"), " ", /* @__PURE__ */ React.createElement("code", null, "Roll No"), ", ", /* @__PURE__ */ React.createElement("code", null, "Enrollment No"), ", ", /* @__PURE__ */ React.createElement("code", null, "Student Name"), ", ", /* @__PURE__ */ React.createElement("code", null, "Email")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: handleDownloadSampleTemplate,
        style: { display: "flex", alignItems: "center", gap: "6px" }
      },
      /* @__PURE__ */ React.createElement(Download, { size: 14 }),
      /* @__PURE__ */ React.createElement("span", null, "Download Excel Template")
    )), /* @__PURE__ */ React.createElement("div", { style: {
      border: "2px dashed #cbd5e1",
      borderRadius: "12px",
      padding: "24px",
      textAlign: "center",
      backgroundColor: uploadFile ? "#f0fdf4" : "white"
    } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "file",
        id: "bulkStudentFileInput",
        accept: ".xlsx, .xls, .csv",
        onChange: handleUploadFileChange,
        style: { display: "none" }
      }
    ), /* @__PURE__ */ React.createElement("label", { htmlFor: "bulkStudentFileInput", style: { cursor: "pointer", display: "block" } }, /* @__PURE__ */ React.createElement(UploadCloud, { size: 36, style: { color: uploadFile ? "#059669" : "#2563eb", margin: "0 auto 8px auto" } }), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "800", fontSize: "15px", color: "#0f172a" } }, uploadFile ? uploadFile.name : "Choose Excel (.xlsx, .xls) or CSV file"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB \u2022 Click to change file` : "Drag and drop file here, or click to browse"))), uploadPreviewRows && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { backgroundColor: "#f1f5f9", padding: "10px", borderRadius: "8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "800", color: "#64748b" } }, "TOTAL ROWS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, uploadStats.total)), /* @__PURE__ */ React.createElement("div", { style: { backgroundColor: "#ecfdf5", padding: "10px", borderRadius: "8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "800", color: "#047857" } }, "READY / VALID"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "18px", fontWeight: "800", color: "#059669" } }, uploadStats.valid)), /* @__PURE__ */ React.createElement("div", { style: { backgroundColor: "#fffbeb", padding: "10px", borderRadius: "8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "800", color: "#b45309" } }, "DUPLICATES"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "18px", fontWeight: "800", color: "#d97706" } }, uploadStats.duplicates)), /* @__PURE__ */ React.createElement("div", { style: { backgroundColor: "#eff6ff", padding: "10px", borderRadius: "8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "800", color: "#1d4ed8" } }, "OTHER CLASS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "18px", fontWeight: "800", color: "#2563eb" } }, uploadStats.conflicts)), /* @__PURE__ */ React.createElement("div", { style: { backgroundColor: "#fef2f2", padding: "10px", borderRadius: "8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", fontWeight: "800", color: "#b91c1c" } }, "INVALID"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "18px", fontWeight: "800", color: "#dc2626" } }, uploadStats.invalid))), uploadStats.conflicts > 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        id: "moveConflictCheckbox",
        checked: moveExistingOnImport,
        onChange: (e) => setMoveExistingOnImport(e.target.checked),
        style: { width: "16px", height: "16px" }
      }
    ), /* @__PURE__ */ React.createElement("label", { htmlFor: "moveConflictCheckbox", style: { fontSize: "13px", color: "#1e40af", fontWeight: "700", cursor: "pointer" } }, "Move ", uploadStats.conflicts, " student(s) currently enrolled in other classes to this class automatically")), /* @__PURE__ */ React.createElement("div", { style: { border: "1px solid #e2e8f0", borderRadius: "8px", maxHeight: "260px", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "12px" } }, /* @__PURE__ */ React.createElement("thead", { style: { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 1 } }, /* @__PURE__ */ React.createElement("tr", { style: { borderBottom: "1px solid #e2e8f0", textAlign: "left" } }, /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 12px", width: "50px" } }, "#"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 12px", width: "80px" } }, "Status"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 12px", width: "60px" } }, "Roll"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 12px", width: "120px" } }, "Enrollment"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 12px" } }, "Name"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 12px" } }, "Email"), /* @__PURE__ */ React.createElement("th", { style: { padding: "8px 12px" } }, "Validation Note"))), /* @__PURE__ */ React.createElement("tbody", null, uploadPreviewRows.map((row, idx) => {
      const badgeColors = {
        valid: { bg: "#ecfdf5", color: "#047857" },
        duplicate: { bg: "#fffbeb", color: "#b45309" },
        conflict: { bg: "#eff6ff", color: "#1d4ed8" },
        invalid: { bg: "#fef2f2", color: "#b91c1c" }
      };
      const b = badgeColors[row.status] || badgeColors.valid;
      return /* @__PURE__ */ React.createElement("tr", { key: idx, style: { borderBottom: "1px solid #f1f5f9" } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 12px", color: "#64748b" } }, row.rowNumber), /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 12px" } }, /* @__PURE__ */ React.createElement("span", { style: {
        padding: "2px 6px",
        borderRadius: "4px",
        backgroundColor: b.bg,
        color: b.color,
        fontWeight: "800",
        fontSize: "10.5px",
        textTransform: "uppercase"
      } }, row.status)), /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 12px", fontWeight: "700" } }, row.rollNo), /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 12px", fontFamily: "monospace", fontWeight: "700" } }, row.enrollmentNo), /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 12px", fontWeight: "600" } }, row.name), /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 12px", color: "#64748b" } }, row.email || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 12px", color: row.status === "invalid" ? "#b91c1c" : "#64748b" } }, row.reason));
    })))))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer", style: { display: "flex", justifyContent: "flex-end", gap: "10px" } }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowUploadModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-primary",
        onClick: handleConfirmBulkImport,
        disabled: !uploadPreviewRows || uploadStats.valid === 0 && uploadStats.duplicates === 0 && (!moveExistingOnImport || uploadStats.conflicts === 0)
      },
      "Import Students (",
      uploadStats.valid + uploadStats.duplicates + (moveExistingOnImport ? uploadStats.conflicts : 0),
      " eligible)"
    )))));
  }
}
function DepartmentAdminPanel({
  onOpenFacultyTimetable,
  showToast
}) {
  const [departments, setDepartments] = useState(getDepartments());
  const [faculties, setFaculties] = useState(getFaculties());
  const [subjects, setSubjects] = useState(getSubjects());
  const [selectedDeptName, setSelectedDeptName] = useState("AI & Data Science");
  const [selectedSem, setSelectedSem] = useState("3rd Semester");
  const [deptSubTab, setDeptSubTab] = useState("faculty");
  const [facultySearch, setFacultySearch] = useState("");
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [deptEditForm, setDeptEditForm] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
    name: "",
    designation: "Assistant Professor",
    email: "",
    phone: "",
    subjects: ""
  });
  const [subjectForm, setSubjectForm] = useState({
    code: "",
    name: "",
    shortName: "",
    credits: 4,
    theoryHours: 3,
    labHours: 2,
    faculty: ""
  });
  const [labForm, setLabForm] = useState({
    name: "",
    code: "",
    room: "",
    pcs: 30,
    inCharge: ""
  });
  const currentDept = useMemo(() => {
    return departments.find((d) => d.name === selectedDeptName) || departments[0] || {
      name: "AI & Data Science",
      code: "AI&DS",
      fullName: "Department of Artificial Intelligence & Data Science",
      hod: "Prof. Priya Shah",
      hodEmail: "priya.shah@adit.ac.in",
      hodPhone: "+91 98250 11111",
      cabin: "Academic Block B, Room 201-A",
      established: "2021",
      totalStudents: 180,
      classrooms: ["Room 201", "Room 202", "Room 203", "Room 204", "Room 205", "Seminar Hall 301"],
      labs: [
        { name: "AI & Deep Learning Lab", code: "AI-LAB", room: "Lab 301", pcs: 35, inCharge: "Prof. Dev Trivedi" },
        { name: "Data Engineering & Analytics Lab", code: "DE-LAB", room: "Lab 302", pcs: 35, inCharge: "Prof. R. Jain" },
        { name: "Database & Systems Lab", code: "DBS-LAB", room: "Lab 201", pcs: 30, inCharge: "Prof. Priya Shah" },
        { name: "Network & Cloud Lab", code: "NET-LAB", room: "Lab 202", pcs: 30, inCharge: "Prof. Sneha Mehta" }
      ],
      divisions: [
        { id: "1", name: "Div 1", counselor: "Prof. Priya Shah", cr: "Aarav Patel", studentCount: 60 },
        { id: "2", name: "Div 2", counselor: "Prof. Rahul Patel", cr: "Ananya Sharma", studentCount: 60 },
        { id: "3", name: "Div 3", counselor: "Prof. A. Kumar", cr: "Devansh Verma", studentCount: 60 }
      ]
    };
  }, [departments, selectedDeptName]);
  const deptFaculties = useMemo(() => {
    return faculties.filter((f) => {
      const matchDept = !f.dept || f.dept.toLowerCase().includes(currentDept.name.toLowerCase().slice(0, 4));
      const q = facultySearch.toLowerCase().trim();
      const matchQuery = !q || f.name.toLowerCase().includes(q) || f.subjects && f.subjects.toLowerCase().includes(q) || f.designation && f.designation.toLowerCase().includes(q);
      return matchDept && matchQuery;
    });
  }, [faculties, currentDept, facultySearch]);
  const deptSubjects = useMemo(() => {
    return subjects.filter((s) => {
      return !s.dept || s.dept.toLowerCase().includes(currentDept.name.toLowerCase().slice(0, 4));
    });
  }, [subjects, currentDept]);
  const allTimetables = useMemo(() => {
    return getAllFacultyTimetables();
  }, [faculties]);
  const facultyWorkloads = useMemo(() => {
    const map = {};
    deptFaculties.forEach((f) => {
      const tt = allTimetables[f.id];
      const sum = calculateTimetableSummary(tt);
      map[f.id] = {
        totalLectures: sum.totalLectures,
        subjectCount: sum.subjectCount,
        activeDays: sum.activeDays
      };
    });
    return map;
  }, [deptFaculties, allTimetables]);
  const totalWeeklyHours = useMemo(() => {
    return Object.values(facultyWorkloads).reduce((acc, curr) => acc + curr.totalLectures, 0);
  }, [facultyWorkloads]);
  const renderDeptIcon = (iconName) => {
    switch (iconName) {
      case "Brain":
        return /* @__PURE__ */ React.createElement(Brain, { size: 26 });
      case "Laptop":
        return /* @__PURE__ */ React.createElement(Laptop, { size: 26 });
      case "Network":
        return /* @__PURE__ */ React.createElement(Network, { size: 26 });
      case "Cpu":
        return /* @__PURE__ */ React.createElement(Cpu, { size: 26 });
      case "Cog":
        return /* @__PURE__ */ React.createElement(Cog, { size: 26 });
      default:
        return /* @__PURE__ */ React.createElement(Building2, { size: 26 });
    }
  };
  const getInitials = (name) => {
    if (!name) return "FC";
    const parts = name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/i, "").trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };
  const handleOpenEditDept = () => {
    setDeptEditForm({
      id: currentDept.id,
      code: currentDept.code || "AI&DS",
      name: currentDept.name || "AI & Data Science",
      fullName: currentDept.fullName || `Department of ${currentDept.name}`,
      hod: currentDept.hod || "Prof. Priya Shah",
      hodEmail: currentDept.hodEmail || "hod@adit.ac.in",
      hodPhone: currentDept.hodPhone || "+91 98250 11111",
      cabin: currentDept.cabin || "Academic Block B, Room 201",
      established: currentDept.established || "2021",
      totalStudents: currentDept.totalStudents || 180,
      classrooms: currentDept.classrooms || ["Room 201", "Room 202", "Room 203"],
      labs: currentDept.labs || [],
      divisions: currentDept.divisions || []
    });
    setShowEditDeptModal(true);
  };
  const handleSaveDeptEdit = (e) => {
    e.preventDefault();
    const updated = saveDepartment(deptEditForm);
    setDepartments([...updated]);
    setSelectedDeptName(deptEditForm.name);
    setShowEditDeptModal(false);
    if (showToast) showToast(`Department profile updated for ${deptEditForm.name}!`);
  };
  const handleAddFaculty = (e) => {
    e.preventDefault();
    if (!facultyForm.name.trim()) {
      alert("Faculty name is required");
      return;
    }
    const newFac = {
      ...facultyForm,
      dept: currentDept.name
    };
    const updated = saveFaculty(newFac);
    notifyTimetableSync();
    setFaculties([...updated]);
    setShowAddFacultyModal(false);
    setFacultyForm({ name: "", designation: "Assistant Professor", email: "", phone: "", subjects: "" });
    if (showToast) showToast(`${facultyForm.name} added to ${currentDept.name}!`);
    window.dispatchEvent(new CustomEvent("adit-faculty-updated"));
  };
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) {
      alert("Subject code and name are required");
      return;
    }
    const newSubj = {
      ...subjectForm,
      dept: currentDept.name,
      sem: selectedSem
    };
    const updated = saveSubject(newSubj);
    updateSubjectInEntries(newSubj.id || subjectForm.id, { name: subjectForm.name, shortName: subjectForm.shortName || subjectForm.name.slice(0, 8) });
    notifyTimetableSync();
    setSubjects([...updated]);
    setShowAddSubjectModal(false);
    setSubjectForm({ code: "", name: "", shortName: "", credits: 4, theoryHours: 3, labHours: 2, faculty: "" });
    if (showToast) showToast(`Subject ${subjectForm.name} added to ${currentDept.name}!`);
  };
  const handleAddLab = (e) => {
    e.preventDefault();
    if (!labForm.name) {
      alert("Lab name is required");
      return;
    }
    const updatedDept = {
      ...currentDept,
      labs: [...currentDept.labs || [], labForm]
    };
    const updated = saveDepartment(updatedDept);
    setDepartments([...updated]);
    setShowAddLabModal(false);
    setLabForm({ name: "", code: "", room: "", pcs: 30, inCharge: "" });
    if (showToast) showToast(`Lab "${labForm.name}" added to ${currentDept.name}!`);
  };
  const handleExportDossier = () => {
    const headerInfo = [
      [`ADIT - Department Administration Dossier: ${currentDept.fullName || currentDept.name}`],
      [`Head of Department: ${currentDept.hod} | Cabin: ${currentDept.cabin} | Email: ${currentDept.hodEmail}`],
      [`Total Faculty: ${deptFaculties.length} | Total Enrolled Students: ${currentDept.totalStudents || 180} | Weekly Lecture Load: ${totalWeeklyHours} Hours`],
      []
    ];
    const facultyHeaders = ["Faculty Name", "Designation", "Official Email", "Contact Phone", "Subjects Handled", "Weekly Scheduled Lectures"];
    const facultyRows = deptFaculties.map((f) => [
      f.name,
      f.designation || "Faculty",
      f.email || "",
      f.phone || "",
      f.subjects || "",
      facultyWorkloads[f.id]?.totalLectures || 0
    ]);
    const subjectHeaders = ["Subject Code", "Subject Name", "Short Label", "Credits", "Faculty In-Charge", "Semester"];
    const subjectRows = deptSubjects.map((s) => [
      s.code,
      s.name,
      s.shortName || s.name,
      s.credits || 4,
      s.faculty || "Unassigned",
      s.sem || selectedSem
    ]);
    const wb = XLSX.utils.book_new();
    const wsFaculty = XLSX.utils.aoa_to_sheet([...headerInfo, ["FACULTY DIRECTORY & WORKLOAD"], facultyHeaders, ...facultyRows]);
    XLSX.utils.book_append_sheet(wb, wsFaculty, "Faculty_Roster");
    const wsSubjects = XLSX.utils.aoa_to_sheet([...headerInfo, ["CURRICULUM & SUBJECTS"], subjectHeaders, ...subjectRows]);
    XLSX.utils.book_append_sheet(wb, wsSubjects, "Subjects_Curriculum");
    XLSX.writeFile(wb, `${currentDept.code || "Dept"}_Administration_Dossier.xlsx`);
    if (showToast) showToast("Department Dossier successfully exported to Excel!");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "department-admin-panel" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        paddingBottom: "20px",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: "24px"
      },
      className: "no-print"
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: "9999px",
      border: "1px solid #cbd5e1",
      padding: "6px 18px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", color: "#64748b", fontWeight: "600", marginRight: "8px" } }, "Department Admin:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: selectedDeptName,
        onChange: (e) => setSelectedDeptName(e.target.value),
        style: {
          border: "none",
          background: "transparent",
          fontWeight: "800",
          fontSize: "14px",
          color: "#0f172a",
          cursor: "pointer",
          outline: "none"
        }
      },
      departments.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id || d.name, value: d.name }, d.name, " (", d.code, ")"))
    )), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: "9999px",
      border: "1px solid #cbd5e1",
      padding: "6px 16px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
    } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", color: "#64748b", fontWeight: "600", marginRight: "6px" } }, "Semester:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: selectedSem,
        onChange: (e) => setSelectedSem(e.target.value),
        style: {
          border: "none",
          background: "transparent",
          fontWeight: "700",
          fontSize: "13.5px",
          color: "#0f172a",
          cursor: "pointer",
          outline: "none"
        }
      },
      /* @__PURE__ */ React.createElement("option", { value: "1st Semester" }, "1st Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "2nd Semester" }, "2nd Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "3rd Semester" }, "3rd Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "4th Semester" }, "4th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "5th Semester" }, "5th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "6th Semester" }, "6th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "7th Semester" }, "7th Semester"),
      /* @__PURE__ */ React.createElement("option", { value: "8th Semester" }, "8th Semester")
    ))),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: handleExportDossier,
        style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }
      },
      /* @__PURE__ */ React.createElement(Download, { size: 14 }),
      " Export Dossier"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-primary btn-sm",
        onClick: () => {
          if (onOpenFacultyTimetable) onOpenFacultyTimetable();
        },
        style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }
      },
      /* @__PURE__ */ React.createElement(Calendar, { size: 14 }),
      " Open Faculty Timetables"
    ))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        backgroundColor: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "24px 28px",
        marginBottom: "24px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: "18px" } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          width: "64px",
          height: "64px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
          flexShrink: 0
        }
      },
      renderDeptIcon(currentDept.icon)
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: "800", fontSize: "12px" } }, currentDept.code), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b", fontWeight: "600" } }, "Est. ", currentDept.established || "2020", " \u2022 ADIT Campus")), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "24px", fontWeight: "800", color: "#0f172a", marginTop: "6px", lineHeight: 1.2 } }, currentDept.fullName || `Department of ${currentDept.name}`), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", marginTop: "4px" } }, "Autonomous Department Administration Panel \u2022 Curriculum, Faculty Workload & Division Matrix"))), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm no-print",
        onClick: handleOpenEditDept,
        style: { display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", borderRadius: "8px" }
      },
      /* @__PURE__ */ React.createElement(Edit3, { size: 14 }),
      " Edit Department Profile"
    )),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginTop: "22px",
          paddingTop: "20px",
          borderTop: "1px solid #f1f5f9"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: {
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        backgroundColor: "#dbeafe",
        color: "#1e40af",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        fontSize: "15px"
      } }, getInitials(currentDept.hod)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" } }, "Head of Department (HOD)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "14px", fontWeight: "800", color: "#0f172a" } }, currentDept.hod || "Prof. Priya Shah"))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(MapPin, { size: 20, style: { color: "#64748b" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" } }, "HOD Cabin / Office"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", fontWeight: "700", color: "#1e293b" } }, currentDept.cabin || "Academic Block B, Room 201-A"))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(Mail, { size: 20, style: { color: "#64748b" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" } }, "Departmental Email"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", fontWeight: "700", color: "#1e293b" } }, currentDept.hodEmail || "priya.shah@adit.ac.in"))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement(Phone, { size: 20, style: { color: "#64748b" } }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" } }, "Office Contact"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", fontWeight: "700", color: "#1e293b" } }, currentDept.hodPhone || "+91 98250 11111")))
    )
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      },
      className: "no-print"
    },
    /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "18px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Faculty Strength"), /* @__PURE__ */ React.createElement(Users, { size: 18, style: { color: "#2563eb" } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "8px" } }, deptFaculties.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#059669", fontWeight: "600" } }, "Full-time Teaching Faculty")),
    /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "18px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Active Divisions"), /* @__PURE__ */ React.createElement(Layers, { size: 18, style: { color: "#7c3aed" } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "8px" } }, (currentDept.divisions || []).length || 3), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#7c3aed", fontWeight: "600" } }, "Div 1, Div 2, Div 3")),
    /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "18px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Department Subjects"), /* @__PURE__ */ React.createElement(BookOpen, { size: 18, style: { color: "#d97706" } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "8px" } }, deptSubjects.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#64748b", fontWeight: "600" } }, "Active Course Catalog")),
    /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "18px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Labs & Classrooms"), /* @__PURE__ */ React.createElement(Laptop, { size: 18, style: { color: "#0284c7" } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "8px" } }, (currentDept.labs || []).length + (currentDept.classrooms || []).length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#0284c7", fontWeight: "600" } }, (currentDept.labs || []).length, " Labs \u2022 ", (currentDept.classrooms || []).length, " Classrooms")),
    /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "18px 20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Weekly Lecture Load"), /* @__PURE__ */ React.createElement(Clock, { size: 18, style: { color: "#059669" } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a", marginTop: "8px" } }, totalWeeklyHours, " Hrs"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#059669", fontWeight: "600" } }, "Across 6 Working Days"))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        display: "flex",
        gap: "8px",
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: "2px",
        marginBottom: "20px",
        overflowX: "auto"
      },
      className: "no-print"
    },
    [
      { id: "faculty", label: "Faculty Roster & Workload", icon: Users, count: deptFaculties.length },
      { id: "divisions", label: "Divisions & Batches", icon: Layers, count: (currentDept.divisions || []).length || 3 },
      { id: "labs", label: "Classrooms & Laboratories", icon: Laptop, count: (currentDept.labs || []).length },
      { id: "subjects", label: "Curriculum & Subjects", icon: BookOpen, count: deptSubjects.length },
      { id: "master-timetable", label: "Department Master Timetable", icon: Calendar }
    ].map((tab) => {
      const Icon = tab.icon;
      const isActive = deptSubTab === tab.id;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: tab.id,
          type: "button",
          onClick: () => setDeptSubTab(tab.id),
          style: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px 8px 0 0",
            border: "none",
            backgroundColor: isActive ? "white" : "transparent",
            color: isActive ? "#2563eb" : "#64748b",
            fontWeight: "700",
            fontSize: "13.5px",
            cursor: "pointer",
            borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap"
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { size: 16 }),
        /* @__PURE__ */ React.createElement("span", null, tab.label),
        tab.count !== void 0 && /* @__PURE__ */ React.createElement(
          "span",
          {
            style: {
              backgroundColor: isActive ? "#dbeafe" : "#f1f5f9",
              color: isActive ? "#1d4ed8" : "#64748b",
              padding: "1px 7px",
              borderRadius: "9999px",
              fontSize: "11.5px",
              fontWeight: "800"
            }
          },
          tab.count
        )
      );
    })
  ), deptSubTab === "faculty" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "16px" }, className: "no-print" }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "320px" } }, /* @__PURE__ */ React.createElement(Search, { size: 15, style: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search faculty in this department...",
      value: facultySearch,
      onChange: (e) => setFacultySearch(e.target.value),
      style: {
        width: "100%",
        padding: "9px 12px 9px 34px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        fontSize: "13px",
        backgroundColor: "white",
        outline: "none"
      }
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-primary btn-sm",
      onClick: () => setShowAddFacultyModal(true),
      style: { display: "flex", alignItems: "center", gap: "6px" }
    },
    /* @__PURE__ */ React.createElement(UserPlus, { size: 15 }),
    " Add Faculty Member"
  )), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Faculty Member"), /* @__PURE__ */ React.createElement("th", null, "Designation"), /* @__PURE__ */ React.createElement("th", null, "Official Email & Contact"), /* @__PURE__ */ React.createElement("th", null, "Subjects Taught"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Weekly Load"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Active Days"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, deptFaculties.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: "36px", color: "#94a3b8" } }, 'No faculty found for this search or department. Click "Add Faculty Member" to register faculty.')) : deptFaculties.map((fac) => {
    const load = facultyWorkloads[fac.id] || { totalLectures: 0, activeDays: 0 };
    const isHOD = fac.name === currentDept.hod;
    return /* @__PURE__ */ React.createElement("tr", { key: fac.id }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "38px",
      height: "38px",
      borderRadius: "50%",
      backgroundColor: isHOD ? "#fef3c7" : "#eff6ff",
      color: isHOD ? "#b45309" : "#1d4ed8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "800",
      fontSize: "13px"
    } }, getInitials(fac.name)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "800", color: "#0f172a", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "6px" } }, fac.name, isHOD && /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#fef3c7", color: "#b45309", fontSize: "10px", padding: "1px 5px" } }, "HOD")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11.5px", color: "#64748b" } }, fac.id)))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", fontWeight: "600", color: "#334155" } }, fac.designation || "Assistant Professor")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12.5px", color: "#1e293b" } }, fac.email || "\u2014"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11.5px", color: "#64748b" } }, fac.phone || "\u2014")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#f1f5f9", color: "#0f172a", fontWeight: "700" } }, fac.subjects || "General Curriculum")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "badge",
        style: {
          backgroundColor: load.totalLectures > 0 ? "#ecfdf5" : "#f8fafc",
          color: load.totalLectures > 0 ? "#059669" : "#94a3b8",
          fontWeight: "800",
          fontSize: "12.5px"
        }
      },
      load.totalLectures,
      " Lectures/wk"
    )), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center", fontWeight: "700", color: "#475569" } }, load.activeDays, " Days"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: () => {
          if (onOpenFacultyTimetable) onOpenFacultyTimetable(fac.id);
        },
        style: { padding: "4px 10px", fontSize: "12px", fontWeight: "700", color: "#2563eb" }
      },
      /* @__PURE__ */ React.createElement(Calendar, { size: 13, style: { marginRight: "4px" } }),
      " Timetable"
    )));
  })))))), deptSubTab === "divisions" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" } }, (currentDept.divisions || [
    { id: "1", name: "Div 1", counselor: "Prof. Priya Shah", cr: "Aarav Patel", studentCount: 60 },
    { id: "2", name: "Div 2", counselor: "Prof. Rahul Patel", cr: "Ananya Sharma", studentCount: 60 },
    { id: "3", name: "Div 3", counselor: "Prof. A. Kumar", cr: "Devansh Verma", studentCount: 60 }
  ]).map((div) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: div.id,
      className: "card",
      style: {
        padding: "24px",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        position: "relative"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "38px",
      height: "38px",
      borderRadius: "10px",
      backgroundColor: "#eff6ff",
      color: "#2563eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "800"
    } }, div.id), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "17px", fontWeight: "800", color: "#0f172a" } }, "Division ", div.id, " (", div.name, ")"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, selectedSem, " \u2022 ", currentDept.code))), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#ecfdf5", color: "#059669", fontWeight: "800" } }, div.studentCount || 60, " Students")),
    /* @__PURE__ */ React.createElement("div", { style: { marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "13px" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: "600" } }, "Class Counselor:"), /* @__PURE__ */ React.createElement("strong", { style: { color: "#0f172a" } }, div.counselor || "Assigned Faculty")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "13px" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: "600" } }, "Class Representative (CR):"), /* @__PURE__ */ React.createElement("strong", { style: { color: "#0f172a" } }, div.cr || "Student CR")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "13px" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontWeight: "600" } }, "Designated Classroom:"), /* @__PURE__ */ React.createElement("strong", { style: { color: "#2563eb" } }, "Room 20", div.id))),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-secondary btn-sm",
        onClick: () => {
          if (onOpenFacultyTimetable) onOpenFacultyTimetable();
        },
        style: {
          width: "100%",
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontWeight: "700"
        }
      },
      /* @__PURE__ */ React.createElement(Calendar, { size: 14 }),
      " View Division Schedule"
    )
  )))), deptSubTab === "labs" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "24px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "17px", fontWeight: "800", color: "#0f172a" } }, "Specialized Department Laboratories"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, "Hardware & software testing facilities assigned to ", currentDept.name, ".")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-primary btn-sm no-print",
      onClick: () => setShowAddLabModal(true),
      style: { display: "flex", alignItems: "center", gap: "6px" }
    },
    /* @__PURE__ */ React.createElement(Plus, { size: 14 }),
    " Add Laboratory"
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" } }, (currentDept.labs || []).map((lab, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "card", style: { padding: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  } }, /* @__PURE__ */ React.createElement(Laptop, { size: 18 })), /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#f1f5f9", color: "#334155", fontWeight: "800" } }, lab.pcs || 30, " Workstations")), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "12px" } }, lab.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12.5px", color: "#2563eb", fontWeight: "700", marginTop: "2px" } }, lab.room, " \u2022 Code: ", lab.code || "LAB"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", fontSize: "12.5px", color: "#64748b" } }, "Lab In-Charge: ", /* @__PURE__ */ React.createElement("strong", null, lab.inCharge || "Faculty In-Charge")))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "17px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" } }, "Allocated Lecture Classrooms"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" } }, (currentDept.classrooms || ["Room 201", "Room 202", "Room 203", "Room 204", "Room 205", "Seminar Hall 301"]).map((room, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      style: {
        backgroundColor: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }
    },
    /* @__PURE__ */ React.createElement(Building2, { size: 18, style: { color: "#64748b" } }),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: "14px", color: "#0f172a", display: "block" } }, room), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11px", color: "#059669", fontWeight: "600" } }, "Ready / Active"))
  ))))), deptSubTab === "subjects" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }, className: "no-print" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "17px", fontWeight: "800", color: "#0f172a" } }, "Course Subjects Catalog - ", currentDept.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, "Semester: ", selectedSem, " \u2022 Credits & syllabus definitions")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-primary btn-sm",
      onClick: () => setShowAddSubjectModal(true),
      style: { display: "flex", alignItems: "center", gap: "6px" }
    },
    /* @__PURE__ */ React.createElement(Plus, { size: 14 }),
    " Add Department Subject"
  )), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 0, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Subject Code"), /* @__PURE__ */ React.createElement("th", null, "Subject Name"), /* @__PURE__ */ React.createElement("th", null, "Short Code"), /* @__PURE__ */ React.createElement("th", null, "Credits"), /* @__PURE__ */ React.createElement("th", null, "Faculty In-Charge"), /* @__PURE__ */ React.createElement("th", null, "Semester"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, deptSubjects.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: "36px", color: "#94a3b8" } }, "No subjects configured for ", currentDept.name, '. Click "Add Department Subject" to define course syllabus.')) : deptSubjects.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800", color: "#1e3a8a" } }, s.code), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, s.name), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#2563eb" } }, s.shortName || s.name.slice(0, 8))), /* @__PURE__ */ React.createElement("td", null, s.credits || 4, " Credits"), /* @__PURE__ */ React.createElement("td", null, s.faculty || "Assigned per Division"), /* @__PURE__ */ React.createElement("td", null, s.sem || selectedSem), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary btn-sm",
      onClick: () => {
        if (window.confirm(`Delete subject ${s.name}?`)) {
          const updated = deleteSubject(s.id);
          setSubjects([...updated]);
          if (showToast) showToast("Subject removed.");
        }
      },
      style: { color: "#e11d48", padding: "4px 8px" }
    },
    /* @__PURE__ */ React.createElement(Trash2, { size: 13 })
  ))))))))), deptSubTab === "master-timetable" && /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, "Department Master Timetable Matrix - ", currentDept.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, "Consolidated weekly view across all classrooms & laboratories.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary btn-sm",
      onClick: () => window.print(),
      style: { display: "flex", alignItems: "center", gap: "6px" }
    },
    /* @__PURE__ */ React.createElement(Printer, { size: 14 }),
    " Print Master Matrix"
  )), /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { border: "1px solid #e2e8f0", borderRadius: "10px" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "12px" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("th", { style: { padding: "10px 14px", width: "110px", textAlign: "left", fontWeight: "700" } }, "Time Slot"), TIMETABLE_DAYS.map((day) => /* @__PURE__ */ React.createElement("th", { key: day, style: { padding: "10px 8px", fontWeight: "700" } }, day)))), /* @__PURE__ */ React.createElement("tbody", null, TIME_SLOTS.map((slotTime) => {
    if (slotTime === "12:40 - 1:25") {
      return /* @__PURE__ */ React.createElement("tr", { key: slotTime, style: { backgroundColor: "#f1f5f9", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 14px", textAlign: "left", fontWeight: "700", color: "#64748b" } }, slotTime), /* @__PURE__ */ React.createElement("td", { colSpan: 6, style: { padding: "8px", letterSpacing: "0.1em", fontWeight: "800", color: "#64748b", textTransform: "uppercase", backgroundColor: "#e2e8f0" } }, "LUNCH BREAK"));
    }
    return /* @__PURE__ */ React.createElement("tr", { key: slotTime, style: { borderBottom: "1px solid #f1f5f9" } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 14px", textAlign: "left", fontWeight: "700", color: "#475569", backgroundColor: "#fafbfc", whiteSpace: "nowrap" } }, slotTime), TIMETABLE_DAYS.map((day) => /* @__PURE__ */ React.createElement("td", { key: day, style: { padding: "6px", borderRight: "1px solid #f1f5f9" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#2563eb", fontSize: "11px", display: "inline-block" } }, currentDept.code, " \u2022 Scheduled"))));
  }))))), showEditDeptModal && deptEditForm && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "580px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" } }, /* @__PURE__ */ React.createElement(Building2, { size: 20 }), "Edit Department Profile"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowEditDeptModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveDeptEdit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "120px 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Code *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: deptEditForm.code,
      onChange: (e) => setDeptEditForm({ ...deptEditForm, code: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Short Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: deptEditForm.name,
      onChange: (e) => setDeptEditForm({ ...deptEditForm, name: e.target.value }),
      required: true
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Department Full Formal Name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: deptEditForm.fullName,
      onChange: (e) => setDeptEditForm({ ...deptEditForm, fullName: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Head of Department (HOD) *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: deptEditForm.hod,
      onChange: (e) => setDeptEditForm({ ...deptEditForm, hod: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "HOD Cabin / Room"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: deptEditForm.cabin,
      onChange: (e) => setDeptEditForm({ ...deptEditForm, cabin: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Department Email"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      className: "form-control",
      value: deptEditForm.hodEmail,
      onChange: (e) => setDeptEditForm({ ...deptEditForm, hodEmail: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Contact Phone"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: deptEditForm.hodPhone,
      onChange: (e) => setDeptEditForm({ ...deptEditForm, hodPhone: e.target.value })
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowEditDeptModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Check, { size: 16 }), " Save Department Changes"))))), showAddFacultyModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "480px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" } }, /* @__PURE__ */ React.createElement(UserPlus, { size: 18 }), "Add Faculty to ", currentDept.name), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowAddFacultyModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAddFaculty }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Faculty Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Prof. Priya Shah",
      value: facultyForm.name,
      onChange: (e) => setFacultyForm({ ...facultyForm, name: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Designation"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: facultyForm.designation,
      onChange: (e) => setFacultyForm({ ...facultyForm, designation: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "Professor & HOD" }, "Professor & HOD"),
    /* @__PURE__ */ React.createElement("option", { value: "Professor" }, "Professor"),
    /* @__PURE__ */ React.createElement("option", { value: "Associate Professor" }, "Associate Professor"),
    /* @__PURE__ */ React.createElement("option", { value: "Assistant Professor" }, "Assistant Professor"),
    /* @__PURE__ */ React.createElement("option", { value: "Visiting Faculty" }, "Visiting Faculty")
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Official Email"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      className: "form-control",
      placeholder: "e.g. faculty@adit.ac.in",
      value: facultyForm.email,
      onChange: (e) => setFacultyForm({ ...facultyForm, email: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Contact Phone"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. 9825012345",
      value: facultyForm.phone,
      onChange: (e) => setFacultyForm({ ...facultyForm, phone: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Subjects Handled"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. DBMS, Data Structures, Python",
      value: facultyForm.subjects,
      onChange: (e) => setFacultyForm({ ...facultyForm, subjects: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowAddFacultyModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Check, { size: 16 }), " Register Faculty"))))), showAddSubjectModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "480px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" } }, /* @__PURE__ */ React.createElement(BookOpen, { size: 18 }), "Add Subject to ", currentDept.name), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowAddSubjectModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAddSubject }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "140px 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Subject Code *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. 3130703",
      value: subjectForm.code,
      onChange: (e) => setSubjectForm({ ...subjectForm, code: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Short Label"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. DBMS",
      value: subjectForm.shortName,
      onChange: (e) => setSubjectForm({ ...subjectForm, shortName: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Subject Full Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Database Management Systems",
      value: subjectForm.name,
      onChange: (e) => setSubjectForm({ ...subjectForm, name: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Credits"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "form-control",
      value: subjectForm.credits,
      onChange: (e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 4 })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Faculty In-Charge"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: subjectForm.faculty,
      onChange: (e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Choose Faculty --"),
    deptFaculties.map((f) => /* @__PURE__ */ React.createElement("option", { key: f.id, value: f.name }, f.name))
  )))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowAddSubjectModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Check, { size: 16 }), " Save Subject"))))), showAddLabModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "480px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" } }, /* @__PURE__ */ React.createElement(Laptop, { size: 18 }), "Add Laboratory to ", currentDept.name), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowAddLabModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAddLab }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Laboratory Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. AI & Robotics Lab",
      value: labForm.name,
      onChange: (e) => setLabForm({ ...labForm, name: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Room / Location *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Lab 304",
      value: labForm.room,
      onChange: (e) => setLabForm({ ...labForm, room: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Workstation / PC Count"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "form-control",
      value: labForm.pcs,
      onChange: (e) => setLabForm({ ...labForm, pcs: parseInt(e.target.value) || 30 })
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Lab In-Charge Faculty"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: labForm.inCharge,
      onChange: (e) => setLabForm({ ...labForm, inCharge: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- Choose Faculty --"),
    deptFaculties.map((f) => /* @__PURE__ */ React.createElement("option", { key: f.id, value: f.name }, f.name))
  ))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowAddLabModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Check, { size: 16 }), " Save Laboratory"))))));
}
function AdminPanel({ showToast, onExit }) {
  const [adminTab, setAdminTab] = useState("faculty");
  const [departments, setDepartments] = useState(getDepartments());
  const [subjects, setSubjects] = useState(getSubjects());
  const [faculties, setFaculties] = useState(getFaculties());
  const [students, setStudents] = useState(getStudents());
  const [allocations, setAllocations] = useState(getAllocations());
  const [activeDept, setActiveDept] = useState("AI & Data Science");
  const [activeSem, setActiveSem] = useState("3rd Semester");
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ id: "", code: "", name: "" });
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: "", code: "", name: "", shortName: "", credits: 4, sem: "3rd Semester", dept: "AI & Data Science" });
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ id: "", name: "", dept: "AI & Data Science", designation: "Assistant Professor", email: "", phone: "", subjects: "" });
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinChangeMsg, setPinChangeMsg] = useState("");
  const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "faculty", label: "Faculty Timetables", icon: Users },
    { id: "class-timetables", label: "Class Timetables", icon: Layers },
    { id: "classes", label: "Classes", icon: GraduationCap },
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "departments", label: "Departments", icon: Building2 },
    { id: "settings", label: "Settings", icon: SettingsIcon }
  ];
  const refreshState = () => {
    setDepartments(getDepartments());
    setSubjects(getSubjects());
    setFaculties(getFaculties());
    setStudents(getStudents());
    setAllocations(getAllocations());
  };
  React.useEffect(() => {
    const handleFacultyUpdated = () => {
      setFaculties([...getFaculties()]);
    };
    window.addEventListener("adit-faculty-updated", handleFacultyUpdated);
    return () => {
      window.removeEventListener("adit-faculty-updated", handleFacultyUpdated);
    };
  }, []);
  const handleSaveFaculty = (facultyData) => {
    const updated = saveFaculty(facultyData);
    updateFacultyNameInEntries(facultyData.id, facultyData.name);
    notifyTimetableSync();
    setFaculties([...updated]);
    if (showToast) showToast("Faculty details updated successfully!");
  };
  const handleSaveDepartment = (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) {
      alert("Department Code and Name are required.");
      return;
    }
    const updated = saveDepartment(deptForm);
    setDepartments([...updated]);
    setShowDeptModal(false);
    setDeptForm({ id: "", code: "", name: "" });
    if (showToast) showToast(`Department ${deptForm.name} saved!`);
  };
  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) {
      alert("Subject Code and Name are required.");
      return;
    }
    const newSubj = {
      ...subjectForm,
      dept: activeDept,
      sem: activeSem
    };
    const updated = saveSubject(newSubj);
    updateSubjectInEntries(newSubj.id || subjectForm.id, { name: subjectForm.name, shortName: subjectForm.shortName || subjectForm.name.slice(0, 8) });
    notifyTimetableSync();
    setSubjects([...updated]);
    setShowSubjectModal(false);
    setSubjectForm({ id: "", code: "", name: "", shortName: "", credits: 4, sem: activeSem, dept: activeDept });
    if (showToast) showToast(`Subject ${subjectForm.name} saved to ${activeDept}!`);
  };
  const handlePinUpdate = (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinChangeMsg("PIN must be at least 4 digits.");
      return;
    }
    if (updateAdminPin(oldPin, newPin)) {
      setPinChangeMsg("Security PIN updated successfully!");
      setOldPin("");
      setNewPin("");
      if (showToast) showToast("Security PIN updated!");
    } else {
      setPinChangeMsg("Incorrect current PIN.");
    }
  };
  const handleResetDefaults = () => {
    if (window.confirm("Reset all academic departments, faculty, subjects and timetables back to default sample records?")) {
      resetToDefault();
      resetFacultyTimetablesToDefault();
      refreshState();
      if (showToast) showToast("Academic data and timetables reset to defaults!");
    }
  };
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchDept = !s.dept || s.dept.toLowerCase().includes(activeDept.toLowerCase().slice(0, 4));
      return matchDept;
    });
  }, [subjects, activeDept]);
  const subjectEntryCounts = useMemo(() => {
    const entries = getTimetableEntries();
    const counts = {};
    entries.forEach((e) => {
      counts[e.subjectId] = (counts[e.subjectId] || 0) + 1;
    });
    return counts;
  }, [subjects]);
  return /* @__PURE__ */ React.createElement("div", { className: "admin-root-container" }, /* @__PURE__ */ React.createElement("aside", { className: "admin-dark-sidebar no-print" }, /* @__PURE__ */ React.createElement("div", { className: "admin-sidebar-header" }, /* @__PURE__ */ React.createElement("div", { className: "admin-brand-icon" }, /* @__PURE__ */ React.createElement(GraduationCap, { size: 24, style: { color: "#38bdf8" } })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "admin-brand-title" }, "ADIT Attendance"), /* @__PURE__ */ React.createElement("span", { className: "admin-brand-subtitle" }, "Admin Panel"))), /* @__PURE__ */ React.createElement("nav", { className: "admin-sidebar-nav" }, /* @__PURE__ */ React.createElement("ul", null, adminMenuItems.map((item) => {
    const Icon = item.icon;
    const isActive = adminTab === item.id;
    return /* @__PURE__ */ React.createElement("li", { key: item.id }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `admin-nav-btn ${isActive ? "active" : ""}`,
        onClick: () => setAdminTab(item.id)
      },
      /* @__PURE__ */ React.createElement(Icon, { size: 18 }),
      /* @__PURE__ */ React.createElement("span", null, item.label)
    ));
  }))), /* @__PURE__ */ React.createElement("div", { className: "admin-sidebar-footer" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "admin-logout-btn",
      onClick: () => {
        if (onExit) onExit();
        else window.location.reload();
      },
      title: "Return to Attendance Portal"
    },
    /* @__PURE__ */ React.createElement(LogOut, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, "Logout")
  ))), /* @__PURE__ */ React.createElement("div", { className: "admin-main-viewport" }, adminTab === "faculty" && /* @__PURE__ */ React.createElement(
    FacultyTimetablePanel,
    {
      departments,
      faculties,
      subjects,
      onSaveFaculty: handleSaveFaculty,
      onSwitchToClassTimetable: () => setAdminTab("class-timetables"),
      showToast
    }
  ), adminTab === "class-timetables" && /* @__PURE__ */ React.createElement(
    ClassTimetablePanel,
    {
      departments,
      faculties,
      subjects,
      onSwitchToFacultyTimetable: () => setAdminTab("faculty"),
      showToast
    }
  ), adminTab === "classes" && /* @__PURE__ */ React.createElement(
    ClassManagementPanel,
    {
      departments,
      showToast,
      onOpenClassTimetable: (dept, sem, div) => setAdminTab("class-timetables")
    }
  ), adminTab === "dashboard" && /* @__PURE__ */ React.createElement("div", { className: "admin-subview" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a" } }, "Administration Dashboard"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13.5px", color: "#64748b", marginTop: "4px" } }, "High-level academic structure, faculty distribution, and timetable coverage.")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", fontWeight: "700", color: "#64748b" } }, "Total Departments"), /* @__PURE__ */ React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Building2, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "10px" } }, departments.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#059669", fontWeight: "600" } }, "Active Engineering Programs")), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      style: { padding: "20px", cursor: "pointer" },
      onClick: () => setAdminTab("classes")
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", fontWeight: "700", color: "#64748b" } }, "Active Classes"), /* @__PURE__ */ React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(GraduationCap, { size: 18 }))),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "10px" } }, getClasses().length),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#0284c7", fontWeight: "600" } }, "Dept \u2022 Sem \u2022 Div Rosters")
  ), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", fontWeight: "700", color: "#64748b" } }, "Faculty Members"), /* @__PURE__ */ React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Users, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "10px" } }, faculties.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#2563eb", fontWeight: "600" } }, "Configured Across Depts")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", fontWeight: "700", color: "#64748b" } }, "Active Subjects"), /* @__PURE__ */ React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(BookOpen, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "10px" } }, subjects.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, "Odd & Even Semesters")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "20px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", fontWeight: "700", color: "#64748b" } }, "Timetables Active"), /* @__PURE__ */ React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#f3e8ff", color: "#7e22ce", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Calendar, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "28px", fontWeight: "800", color: "#0f172a", marginTop: "10px" } }, faculties.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#7e22ce", fontWeight: "600" } }, "Individual Faculty Schedules"))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a" } }, "Departments Overview"), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary btn-sm",
      onClick: () => setAdminTab("faculty"),
      style: { display: "flex", alignItems: "center", gap: "6px" }
    },
    /* @__PURE__ */ React.createElement("span", null, "Open Faculty Timetables"),
    /* @__PURE__ */ React.createElement(ArrowRight, { size: 14 })
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" } }, departments.map((d) => {
    const facCount = faculties.filter((f) => f.dept?.toLowerCase().includes(d.name.toLowerCase().slice(0, 4))).length;
    const subjCount = subjects.filter((s) => s.dept?.toLowerCase().includes(d.name.toLowerCase().slice(0, 4))).length;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: d.id || d.code,
        style: {
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "18px",
          backgroundColor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#e2e8f0", color: "#1e293b", fontWeight: "800" } }, d.code), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#64748b" } }, facCount, " Faculty")), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "10px" } }, d.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12.5px", color: "#64748b", marginTop: "4px" } }, subjCount, " Configured Subjects")),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => {
            setActiveDept(d.name);
            setAdminTab("faculty");
          },
          style: {
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #bfdbfe",
            backgroundColor: "white",
            color: "#2563eb",
            fontWeight: "700",
            fontSize: "12.5px",
            cursor: "pointer"
          }
        },
        /* @__PURE__ */ React.createElement("span", null, "View Timetables"),
        /* @__PURE__ */ React.createElement(ChevronRight, { size: 14 })
      )
    );
  })))), adminTab === "timetables" && /* @__PURE__ */ React.createElement("div", { className: "admin-subview" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a" } }, "Department Master Timetables"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13.5px", color: "#64748b", marginTop: "4px" } }, "Comprehensive schedule matrix for ", activeDept, " (", activeSem, ").")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-secondary btn-sm",
      onClick: () => setAdminTab("faculty")
    },
    /* @__PURE__ */ React.createElement(Users, { size: 14 }),
    " Individual Faculty Timetables"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary btn-sm",
      onClick: () => window.print()
    },
    /* @__PURE__ */ React.createElement(Download, { size: 14 }),
    " Export Schedule"
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "18px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: activeDept,
      onChange: (e) => setActiveDept(e.target.value),
      style: { maxWidth: "280px", fontWeight: "700" }
    },
    departments.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id || d.name, value: d.name }, d.name))
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: activeSem,
      onChange: (e) => setActiveSem(e.target.value),
      style: { maxWidth: "180px", fontWeight: "700" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "1st Semester" }, "1st Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "2nd Semester" }, "2nd Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "3rd Semester" }, "3rd Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "4th Semester" }, "4th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "5th Semester" }, "5th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "6th Semester" }, "6th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "7th Semester" }, "7th Semester"),
    /* @__PURE__ */ React.createElement("option", { value: "8th Semester" }, "8th Semester")
  )), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "17px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" } }, "Weekly Department Matrix - ", activeDept), /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { border: "1px solid #e2e8f0", borderRadius: "10px" } }, /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "12.5px" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { style: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("th", { style: { padding: "10px 14px", width: "120px" } }, "Time Slot"), TIMETABLE_DAYS.map((day) => /* @__PURE__ */ React.createElement("th", { key: day, style: { padding: "10px", textAlign: "center" } }, day)))), /* @__PURE__ */ React.createElement("tbody", null, TIME_SLOTS.map((slotTime) => {
    if (slotTime === "12:40 - 1:25") {
      return /* @__PURE__ */ React.createElement("tr", { key: slotTime, style: { backgroundColor: "#f1f5f9", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "8px 14px", fontWeight: "700", color: "#64748b" } }, slotTime), /* @__PURE__ */ React.createElement("td", { colSpan: 6, style: { textAlign: "center", fontWeight: "800", color: "#64748b", letterSpacing: "0.1em", fontSize: "11px", textTransform: "uppercase" } }, "LUNCH BREAK"));
    }
    return /* @__PURE__ */ React.createElement("tr", { key: slotTime, style: { borderBottom: "1px solid #f1f5f9" } }, /* @__PURE__ */ React.createElement("td", { style: { padding: "10px 14px", fontWeight: "700", color: "#475569", backgroundColor: "#fafbfc" } }, slotTime), TIMETABLE_DAYS.map((day) => /* @__PURE__ */ React.createElement("td", { key: day, style: { padding: "8px", borderRight: "1px solid #f1f5f9", textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", fontSize: "12px" } }, "Scheduled Lectures"))));
  })))))), adminTab === "upload" && /* @__PURE__ */ React.createElement("div", { className: "admin-subview" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a" } }, "Timetable Upload Hub"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13.5px", color: "#64748b", marginTop: "4px" } }, "Upload official class or faculty timetable files in Excel (.xlsx, .csv), Image, or PDF format.")), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "720px" } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "30px" } }, /* @__PURE__ */ React.createElement(
    TimetableUploadModal,
    {
      selectedFaculty: faculties[0],
      departmentName: activeDept,
      semesterName: activeSem,
      onClose: () => setAdminTab("faculty"),
      onTimetableUpdated: () => {
        if (showToast) showToast("Timetable successfully loaded!");
        setAdminTab("faculty");
      },
      showToast
    }
  )))), adminTab === "subjects" && /* @__PURE__ */ React.createElement("div", { className: "admin-subview" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a" } }, "Subjects Management"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13.5px", color: "#64748b", marginTop: "4px" } }, "Manage course subjects, credits, and syllabus codes for ", activeDept, ".")), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary btn-sm",
      onClick: () => {
        setSubjectForm({ id: "", code: "", name: "", shortName: "", credits: 4, sem: activeSem, dept: activeDept });
        setShowSubjectModal(true);
      }
    },
    /* @__PURE__ */ React.createElement(Plus, { size: 15 }),
    " Add Subject"
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "12px", marginBottom: "18px" } }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: activeDept,
      onChange: (e) => setActiveDept(e.target.value),
      style: { maxWidth: "280px", fontWeight: "700" }
    },
    departments.map((d) => /* @__PURE__ */ React.createElement("option", { key: d.id || d.name, value: d.name }, d.name))
  )), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "0", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "data-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Subject Code"), /* @__PURE__ */ React.createElement("th", null, "Subject Name"), /* @__PURE__ */ React.createElement("th", null, "Short Name"), /* @__PURE__ */ React.createElement("th", null, "Department"), /* @__PURE__ */ React.createElement("th", null, "Credits"), /* @__PURE__ */ React.createElement("th", null, "Faculty In-Charge"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, filteredSubjects.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 7, style: { textAlign: "center", padding: "30px", color: "#94a3b8" } }, "No subjects configured for ", activeDept, '. Click "Add Subject" to create one.')) : filteredSubjects.map((s) => /* @__PURE__ */ React.createElement("tr", { key: s.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800", color: "#1e3a8a" } }, s.code), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, s.name, subjectEntryCounts[s.id] > 0 && /* @__PURE__ */ React.createElement("span", { className: "badge", style: { marginLeft: "8px", backgroundColor: "#ecfdf5", color: "#059669", fontSize: "10px" } }, subjectEntryCounts[s.id], " slots")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "badge", style: { backgroundColor: "#eff6ff", color: "#2563eb" } }, s.shortName || s.name.slice(0, 8))), /* @__PURE__ */ React.createElement("td", null, s.dept), /* @__PURE__ */ React.createElement("td", null, s.credits || 4), /* @__PURE__ */ React.createElement("td", null, s.faculty || "Unassigned"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-secondary btn-sm",
      onClick: () => {
        if (window.confirm(`Delete subject ${s.name}?`)) {
          const updated = deleteSubject(s.id);
          setSubjects([...updated]);
          if (showToast) showToast("Subject deleted.");
        }
      },
      style: { color: "#e11d48", padding: "4px 8px" }
    },
    /* @__PURE__ */ React.createElement(Trash2, { size: 14 })
  ))))))))), adminTab === "departments" && /* @__PURE__ */ React.createElement(
    DepartmentAdminPanel,
    {
      onOpenFacultyTimetable: () => setAdminTab("faculty"),
      showToast
    }
  ), adminTab === "settings" && /* @__PURE__ */ React.createElement("div", { className: "admin-subview", style: { maxWidth: "640px" } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "26px", fontWeight: "800", color: "#0f172a" } }, "Admin & Security Settings"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13.5px", color: "#64748b", marginTop: "4px" } }, "Manage master administrator PIN code, data synchronization, and college branding.")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px", marginBottom: "20px" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "16px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(KeyRound, { size: 18, style: { color: "#2563eb" } }), "Change Admin Security PIN"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12.5px", color: "#64748b", marginTop: "4px" } }, "Default PIN code is ", /* @__PURE__ */ React.createElement("strong", null, "1234"), "."), /* @__PURE__ */ React.createElement("form", { onSubmit: handlePinUpdate, style: { marginTop: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Current PIN"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "password",
      className: "form-control",
      placeholder: "Current 4-digit PIN",
      value: oldPin,
      onChange: (e) => setOldPin(e.target.value),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "New PIN"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "password",
      className: "form-control",
      placeholder: "New PIN",
      value: newPin,
      onChange: (e) => setNewPin(e.target.value),
      required: true
    }
  ))), pinChangeMsg && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12.5px", marginTop: "10px", fontWeight: "700", color: pinChangeMsg.includes("success") ? "#059669" : "#e11d48" } }, pinChangeMsg), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "16px", textAlign: "right" } }, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary btn-sm" }, /* @__PURE__ */ React.createElement(ShieldCheck, { size: 14 }), " Update PIN Code")))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "16px", fontWeight: "800", color: "#e11d48", display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(RotateCcw, { size: 18 }), "Reset System Database"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12.5px", color: "#64748b", marginTop: "4px" } }, "Restore all faculties, timetables, subjects, and departments to default sample data."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "16px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-danger btn-sm",
      onClick: handleResetDefaults,
      style: { display: "flex", alignItems: "center", gap: "6px" }
    },
    /* @__PURE__ */ React.createElement(RotateCcw, { size: 14 }),
    " Reset Academic Database to Defaults"
  ))))), showDeptModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "440px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "16px", fontWeight: "800", color: "#0f172a" } }, "Add Academic Department"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowDeptModal(false) }, "\xD7")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveDepartment }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Department Code *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. AI&DS, CP, IT, EC",
      value: deptForm.code,
      onChange: (e) => setDeptForm({ ...deptForm, code: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Department Full Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Artificial Intelligence & Data Science",
      value: deptForm.name,
      onChange: (e) => setDeptForm({ ...deptForm, name: e.target.value }),
      required: true
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowDeptModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Save Department"))))), showSubjectModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "480px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "16px", fontWeight: "800", color: "#0f172a" } }, "Add Subject to ", activeDept), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowSubjectModal(false) }, "\xD7")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveSubject }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Subject Code *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. 3130703",
      value: subjectForm.code,
      onChange: (e) => setSubjectForm({ ...subjectForm, code: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Subject Full Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Database Management Systems",
      value: subjectForm.name,
      onChange: (e) => setSubjectForm({ ...subjectForm, name: e.target.value }),
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Short Label"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. DBMS",
      value: subjectForm.shortName,
      onChange: (e) => setSubjectForm({ ...subjectForm, shortName: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: "12.5px", fontWeight: "700" } }, "Credits"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "form-control",
      value: subjectForm.credits,
      onChange: (e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 4 })
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowSubjectModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Save Subject"))))));
}
function FacultyPanel({ currentUser, showToast, onExit }) {
  const [facultiesList, setFacultiesList] = useState(getFaculties());
  const currentFaculty = useMemo(() => {
    const activeId = currentUser?.facultyId || getActiveFacultyId();
    return facultiesList.find((f) => f.id === activeId) || facultiesList[0] || {
      id: "FAC_PS",
      name: "Prof. Priya Shah",
      dept: "AI & Data Science",
      designation: "Associate Professor",
      email: "priya.shah@adit.ac.in",
      phone: "9825011111",
      subjects: "DBMS, DS"
    };
  }, [facultiesList, currentUser]);
  const [facultyTab, setFacultyTab] = useState("dashboard");
  const [timetableSyncTick, setTimetableSyncTick] = useState(0);
  useEffect(() => {
    const handleSync = () => setTimetableSyncTick((t) => t + 1);
    const handleFacultyUpdate = () => setFacultiesList(getFaculties());
    window.addEventListener("adit-timetable-synced", handleSync);
    window.addEventListener("adit-faculty-updated", handleFacultyUpdate);
    return () => {
      window.removeEventListener("adit-timetable-synced", handleSync);
      window.removeEventListener("adit-faculty-updated", handleFacultyUpdate);
    };
  }, []);
  const facultyTimetableGrid = useMemo(() => {
    return getFacultyTimetable(currentFaculty?.id || "FAC_PS");
  }, [currentFaculty?.id, timetableSyncTick]);
  const todayDayName = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dName = days[(/* @__PURE__ */ new Date()).getDay()];
    return TIMETABLE_DAYS.includes(dName) ? dName : "Monday";
  }, []);
  const [selectedTimetableDay, setSelectedTimetableDay] = useState(todayDayName);
  const [isWeeklyGridView, setIsWeeklyGridView] = useState(false);
  const [allSessions, setAllSessions] = useState(getSessions());
  const reloadSessions = () => setAllSessions(getSessions());
  const facultySessions = useMemo(() => {
    return allSessions.filter(
      (s) => s.facultyId === currentFaculty.id || s.facultyName && s.facultyName.toLowerCase() === currentFaculty.name.toLowerCase()
    );
  }, [allSessions, currentFaculty]);
  const todayDateStr = useMemo(() => (/* @__PURE__ */ new Date()).toISOString().split("T")[0], []);
  const { dayName: currentDayName, lectures: todayScheduledLectures } = useMemo(() => {
    return getFacultyScheduledLecturesForDate(currentFaculty.id, todayDateStr);
  }, [currentFaculty.id, todayDateStr, timetableSyncTick]);
  const todayLecturesWithStatus = useMemo(() => {
    return todayScheduledLectures.map((lec) => {
      const matchSession = facultySessions.find(
        (s) => s.date === todayDateStr && s.timeSlot === lec.time && (s.subjectId === lec.subjectId || s.subjectId === lec.subjectName)
      );
      return {
        ...lec,
        isCompleted: !!matchSession,
        session: matchSession || null
      };
    });
  }, [todayScheduledLectures, facultySessions, todayDateStr]);
  const completedTodayCount = todayLecturesWithStatus.filter((l) => l.isCompleted).length;
  const pendingTodayCount = todayLecturesWithStatus.filter((l) => !l.isCompleted).length;
  const [attDate, setAttDate] = useState(todayDateStr);
  const [attTimeSlot, setAttTimeSlot] = useState(todayScheduledLectures[0]?.time || "9:00 - 9:55");
  const [attDept, setAttDept] = useState(currentFaculty.dept || "AI & Data Science");
  const [attSem, setAttSem] = useState("3rd Sem");
  const [attDiv, setAttDiv] = useState("Div 1");
  const [attYear, setAttYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [attSubjectId, setAttSubjectId] = useState(todayScheduledLectures[0]?.subjectId || "DBMS");
  const [attSubjectName, setAttSubjectName] = useState(todayScheduledLectures[0]?.subjectName || "Database Management Systems");
  const [attTopic, setAttTopic] = useState("");
  const [attRecords, setAttRecords] = useState({});
  const [attRemarks, setAttRemarks] = useState({});
  const [studentSearch, setStudentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const selectLectureForAttendance = (lec, targetDate = todayDateStr) => {
    setAttDate(targetDate);
    setAttTimeSlot(lec.time || "9:00 - 9:55");
    setAttSubjectId(lec.subjectId || "DBMS");
    setAttSubjectName(lec.subjectName || lec.name || lec.subjectId || "Subject");
    if (lec.sem) setAttSem(normalizeSem(lec.sem));
    if (lec.div) setAttDiv(normalizeDiv(lec.div));
    if (lec.departmentId) {
      const depts = getDepartments();
      const f = depts.find((d) => d.id === lec.departmentId || d.name.toLowerCase().includes(lec.departmentId.toLowerCase()));
      if (f) setAttDept(f.name);
    }
    setAttTopic("");
    setFacultyTab("take");
    if (showToast) {
      showToast(`Selected: ${lec.subjectName || lec.subjectId} (${lec.time})`);
    }
  };
  const activeClass = useMemo(() => {
    return findClassByCriteria(attDept, attSem, attDiv, attYear) || getOrCreateClass(attDept, attSem, attDiv, attYear);
  }, [attDept, attSem, attDiv, attYear]);
  const classStudents = useMemo(() => {
    if (activeClass && activeClass.id) {
      const enrolled = getStudentsByClassId(activeClass.id);
      if (enrolled && enrolled.length > 0) return enrolled;
    }
    const criteriaEnrolled = getStudentsForClassCriteria(attDept, attSem, attDiv, attYear);
    if (criteriaEnrolled && criteriaEnrolled.length > 0) return criteriaEnrolled;
    return getStudents();
  }, [activeClass, attDept, attSem, attDiv, attYear]);
  useEffect(() => {
    const initialRecords = {};
    const initialRemarks = {};
    classStudents.forEach((st) => {
      initialRecords[st.id] = "present";
      initialRemarks[st.id] = "";
    });
    setAttRecords(initialRecords);
    setAttRemarks(initialRemarks);
  }, [classStudents]);
  const presentCount = useMemo(() => {
    return classStudents.filter((s) => (attRecords[s.id] || "present") === "present").length;
  }, [classStudents, attRecords]);
  const absentCount = useMemo(() => {
    return classStudents.filter((s) => attRecords[s.id] === "absent").length;
  }, [classStudents, attRecords]);
  const attendancePct = classStudents.length > 0 ? (presentCount / classStudents.length * 100).toFixed(1) : "0.0";
  const handleMarkAllStatus = (status) => {
    const updated = {};
    classStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setAttRecords(updated);
    if (showToast) showToast(`All ${classStudents.length} students marked as ${status.toUpperCase()}`);
  };
  const handleStudentStatusToggle = (studentId, newStatus) => {
    setAttRecords((prev) => ({
      ...prev,
      [studentId]: newStatus
    }));
  };
  const handleSubmitAttendance = (e) => {
    if (e) e.preventDefault();
    if (classStudents.length === 0) {
      alert("Cannot save attendance: No students enrolled in this class.");
      return;
    }
    const duplicate = facultySessions.find(
      (s) => s.date === attDate && s.timeSlot === attTimeSlot && s.subjectId === attSubjectId && s.classId === activeClass?.id
    );
    if (duplicate) {
      const confirmOverwrite = window.confirm(
        `Attendance for this lecture session (${attSubjectName} at ${attTimeSlot} on ${attDate}) was already recorded.

Do you want to update/overwrite the existing record?`
      );
      if (!confirmOverwrite) return;
    }
    const sessionPayload = {
      id: duplicate ? duplicate.id : void 0,
      date: attDate,
      timeSlot: attTimeSlot,
      subjectId: attSubjectId,
      subjectName: attSubjectName,
      facultyId: currentFaculty.id,
      facultyName: currentFaculty.name,
      department: attDept,
      sem: attSem,
      division: attDiv,
      academicYear: attYear,
      classId: activeClass ? activeClass.id : null,
      topic: attTopic.trim() || "General Lecture",
      records: attRecords,
      remarks: attRemarks,
      totalStudents: classStudents.length,
      presentCount,
      absentCount,
      percentage: attendancePct,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveSession(sessionPayload);
    reloadSessions();
    if (showToast) {
      showToast(`Attendance successfully saved! (${presentCount} Present, ${absentCount} Absent)`);
    }
    setFacultyTab("history");
  };
  const [viewingSession, setViewingSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [editRecords, setEditRecords] = useState({});
  const [editTopic, setEditTopic] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const filteredHistorySessions = useMemo(() => {
    return facultySessions.filter((sess) => {
      if (!historySearch) return true;
      const q = historySearch.toLowerCase();
      return sess.subjectName && sess.subjectName.toLowerCase().includes(q) || sess.subjectId && sess.subjectId.toLowerCase().includes(q) || sess.date && sess.date.includes(q) || sess.topic && sess.topic.toLowerCase().includes(q) || sess.division && sess.division.toLowerCase().includes(q);
    }).sort((a, b) => /* @__PURE__ */ new Date(b.date + "T" + (b.timeSlot || "00:00")) - /* @__PURE__ */ new Date(a.date + "T" + (a.timeSlot || "00:00")));
  }, [facultySessions, historySearch]);
  const handleOpenEditSession = (sess) => {
    setEditingSession(sess);
    setEditRecords({ ...sess.records || {} });
    setEditTopic(sess.topic || "");
  };
  const handleSaveEditedSession = (e) => {
    e.preventDefault();
    if (!editingSession) return;
    let pCount = 0;
    let aCount = 0;
    Object.values(editRecords).forEach((st) => {
      if (st === "present") pCount++;
      else aCount++;
    });
    const total = Object.keys(editRecords).length;
    const pct = total > 0 ? (pCount / total * 100).toFixed(1) : "0.0";
    const updated = {
      ...editingSession,
      topic: editTopic,
      records: editRecords,
      presentCount: pCount,
      absentCount: aCount,
      percentage: pct,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveSession(updated);
    reloadSessions();
    setEditingSession(null);
    if (showToast) showToast("Attendance records updated successfully.");
  };
  const handleDeleteSession = (sessionId) => {
    if (window.confirm("Are you sure you want to delete this attendance session record?")) {
      deleteSession(sessionId);
      reloadSessions();
      if (showToast) showToast("Attendance session deleted.");
    }
  };
  const filteredStudents = useMemo(() => {
    return classStudents.filter((st) => {
      const matchSearch = !studentSearch || st.name && st.name.toLowerCase().includes(studentSearch.toLowerCase()) || st.enrollmentNo && st.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase()) || st.rollNo && String(st.rollNo).includes(studentSearch);
      const stStatus = attRecords[st.id] || "present";
      const matchFilter = statusFilter === "all" || stStatus === statusFilter;
      return matchSearch && matchFilter;
    });
  }, [classStudents, studentSearch, statusFilter, attRecords]);
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "timetable", label: "My Timetable", icon: Calendar },
    { id: "take", label: "Take Attendance", icon: UserCheck },
    { id: "history", label: "Attendance History", icon: FileText },
    { id: "profile", label: "My Profile", icon: User }
  ];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" } }, /* @__PURE__ */ React.createElement(
    "aside",
    {
      className: "no-print",
      style: {
        width: "260px",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "1px solid #1e293b"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { padding: "24px 20px 20px", borderBottom: "1px solid #1e293b" } }, /* @__PURE__ */ React.createElement("div", { style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      backgroundColor: "rgba(37, 99, 235, 0.2)",
      border: "1px solid rgba(59, 130, 246, 0.4)",
      color: "#60a5fa",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "700",
      marginBottom: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.04em"
    } }, /* @__PURE__ */ React.createElement(GraduationCap, { size: 13 }), /* @__PURE__ */ React.createElement("span", null, "Faculty Portal")), /* @__PURE__ */ React.createElement("h2", { style: {
      fontSize: "19px",
      fontWeight: "800",
      color: "#ffffff",
      margin: "0 0 4px",
      fontFamily: "'Outfit', sans-serif"
    } }, "ADIT Attendance"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12px", color: "#94a3b8", margin: 0 } }, currentFaculty.dept || "Engineering College")),
    /* @__PURE__ */ React.createElement("div", { style: {
      padding: "16px 20px",
      borderBottom: "1px solid #1e293b",
      backgroundColor: "rgba(30, 41, 59, 0.5)",
      display: "flex",
      alignItems: "center",
      gap: "12px"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "42px",
      height: "42px",
      borderRadius: "12px",
      backgroundColor: "#2563eb",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "800",
      fontSize: "16px",
      boxShadow: "0 4px 8px rgba(37, 99, 235, 0.3)",
      flexShrink: 0
    } }, currentFaculty.name?.charAt(0) || "P"), /* @__PURE__ */ React.createElement("div", { style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("h4", { style: {
      fontSize: "13.5px",
      fontWeight: "700",
      color: "#ffffff",
      margin: 0,
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden"
    } }, currentFaculty.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#38bdf8", fontWeight: "600" } }, currentFaculty.id))),
    /* @__PURE__ */ React.createElement("nav", { style: { flex: 1, padding: "16px 12px", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "4px" } }, menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = facultyTab === item.id;
      return /* @__PURE__ */ React.createElement("li", { key: item.id }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setFacultyTab(item.id),
          style: {
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "11px 14px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: isActive ? "#2563eb" : "transparent",
            color: isActive ? "#ffffff" : "#94a3b8",
            fontWeight: isActive ? "700" : "600",
            fontSize: "13.5px",
            cursor: "pointer",
            transition: "all 0.15s ease",
            textAlign: "left",
            boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none"
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { size: 18, color: isActive ? "#ffffff" : "#64748b" }),
        /* @__PURE__ */ React.createElement("span", null, item.label)
      ));
    }))),
    /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 12px", borderTop: "1px solid #1e293b" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          logoutUser();
          if (onExit) onExit();
          else window.location.reload();
        },
        style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #334155",
          backgroundColor: "transparent",
          color: "#f87171",
          fontSize: "13.5px",
          fontWeight: "700",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }
      },
      /* @__PURE__ */ React.createElement(LogOut, { size: 16 }),
      /* @__PURE__ */ React.createElement("span", null, "Log Out")
    ))
  ), /* @__PURE__ */ React.createElement("main", { style: { flex: 1, minWidth: 0, overflowY: "auto", padding: "28px 36px 48px" } }, facultyTab === "dashboard" && /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "1280px", margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { style: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    borderRadius: "16px",
    padding: "28px 32px",
    color: "white",
    marginBottom: "28px",
    boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.25)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "10px"
  } }, /* @__PURE__ */ React.createElement(Sparkles, { size: 14 }), /* @__PURE__ */ React.createElement("span", null, "Faculty Academic Workspace")), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: "26px", fontWeight: "800", color: "white", margin: "0 0 6px", fontFamily: "'Outfit', sans-serif" } }, "Welcome back, ", currentFaculty.name, "!"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13.5px", color: "#dbeafe", margin: 0 } }, currentFaculty.designation || "Faculty Member", " \u2022 Department of ", currentFaculty.dept, " \u2022 ID: ", currentFaculty.id)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setFacultyTab("take"),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: "#ffffff",
        color: "#1e3a8a",
        fontWeight: "700",
        fontSize: "13.5px",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }
    },
    /* @__PURE__ */ React.createElement(UserCheck, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, "Take Attendance")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setFacultyTab("timetable"),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        color: "#ffffff",
        fontWeight: "700",
        fontSize: "13.5px",
        cursor: "pointer"
      }
    },
    /* @__PURE__ */ React.createElement(Calendar, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, "My Timetable")
  ))), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "28px"
  } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "20px", borderRadius: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Today's Scheduled Lectures"), /* @__PURE__ */ React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Calendar, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "28px", fontWeight: "800", color: "#0f172a" } }, todayScheduledLectures.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#2563eb", fontWeight: "600" } }, currentDayName || "Today", " schedule")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "20px", borderRadius: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Attendance Completed"), /* @__PURE__ */ React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(CheckSquare, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "28px", fontWeight: "800", color: "#059669" } }, completedTodayCount), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#059669", fontWeight: "600" } }, "Recorded today")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "20px", borderRadius: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Attendance Pending"), /* @__PURE__ */ React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Clock, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "28px", fontWeight: "800", color: pendingTodayCount > 0 ? "#d97706" : "#64748b" } }, pendingTodayCount), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: pendingTodayCount > 0 ? "#d97706" : "#64748b", fontWeight: "600" } }, pendingTodayCount > 0 ? "Action required" : "All up to date")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "20px", borderRadius: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12.5px", fontWeight: "700", color: "#64748b" } }, "Total Sessions Saved"), /* @__PURE__ */ React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(FileText, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "28px", fontWeight: "800", color: "#0f172a" } }, facultySessions.length), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "12px", color: "#9333ea", fontWeight: "600" } }, "Historical logs"))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px", borderRadius: "16px", marginBottom: "28px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" } }, "Today's Lecture Schedule (", currentDayName, ", ", todayDateStr, ")"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", margin: 0 } }, "Automatically synchronized from Admin Master Timetable. Click to record or review attendance.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setFacultyTab("timetable"),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid #bfdbfe",
        backgroundColor: "#eff6ff",
        color: "#2563eb",
        fontWeight: "700",
        fontSize: "12.5px",
        cursor: "pointer"
      }
    },
    /* @__PURE__ */ React.createElement("span", null, "View Full Week"),
    /* @__PURE__ */ React.createElement(ChevronRight, { size: 15 })
  )), todayLecturesWithStatus.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: {
    padding: "40px 20px",
    textAlign: "center",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px dashed #cbd5e1"
  } }, /* @__PURE__ */ React.createElement(Calendar, { size: 36, color: "#94a3b8", style: { marginBottom: "12px" } }), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "16px", fontWeight: "700", color: "#334155", margin: "0 0 6px" } }, "No Scheduled Lectures for ", currentDayName), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", maxWidth: "420px", margin: "0 auto 16px" } }, "You have no lectures scheduled for today in the master timetable. You can view your full weekly schedule or take custom attendance."), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-primary btn-sm",
      onClick: () => setFacultyTab("timetable")
    },
    "Open Weekly Timetable"
  )) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" } }, todayLecturesWithStatus.map((lec, idx) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: idx,
      style: {
        padding: "18px",
        borderRadius: "12px",
        border: lec.isCompleted ? "1px solid #a7f3d0" : "1px solid #bfdbfe",
        backgroundColor: lec.isCompleted ? "#f0fdf4" : "#ffffff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }
    },
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" } }, /* @__PURE__ */ React.createElement("span", { style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "12.5px",
      fontWeight: "700",
      color: "#1e3a8a",
      backgroundColor: "#eff6ff",
      padding: "4px 8px",
      borderRadius: "6px"
    } }, /* @__PURE__ */ React.createElement(Clock, { size: 13 }), lec.time), /* @__PURE__ */ React.createElement("span", { style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "11.5px",
      fontWeight: "700",
      color: lec.isCompleted ? "#059669" : "#d97706",
      backgroundColor: lec.isCompleted ? "#ecfdf5" : "#fffbeb",
      padding: "3px 8px",
      borderRadius: "20px",
      border: `1px solid ${lec.isCompleted ? "#a7f3d0" : "#fde68a"}`
    } }, lec.isCompleted ? /* @__PURE__ */ React.createElement(Check, { size: 12 }) : /* @__PURE__ */ React.createElement(Clock, { size: 12 }), lec.isCompleted ? "Completed" : "Pending")), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" } }, lec.subjectName || lec.subjectId), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "13px", color: "#475569", fontWeight: "600", marginBottom: "12px" } }, lec.sem, " \u2022 ", lec.div, " ", lec.room ? `\u2022 Room ${lec.room}` : "")),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => selectLectureForAttendance(lec),
        style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "9px 14px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: lec.isCompleted ? "#059669" : "#2563eb",
          color: "#ffffff",
          fontWeight: "700",
          fontSize: "13px",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0,0,0,0.06)"
        }
      },
      lec.isCompleted ? /* @__PURE__ */ React.createElement(Eye, { size: 15 }) : /* @__PURE__ */ React.createElement(UserCheck, { size: 15 }),
      /* @__PURE__ */ React.createElement("span", null, lec.isCompleted ? "Re-open Attendance" : "Take Attendance")
    )
  )))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      style: { padding: "20px", borderRadius: "12px", cursor: "pointer", border: "1px solid #e2e8f0" },
      onClick: () => setFacultyTab("timetable")
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Calendar, { size: 22 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: 0 } }, "My Weekly Timetable"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" } }, "View entire weekly lecture grid & slots")))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      style: { padding: "20px", borderRadius: "12px", cursor: "pointer", border: "1px solid #e2e8f0" },
      onClick: () => setFacultyTab("history")
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#f0fdf4", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(FileText, { size: 22 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: 0 } }, "Attendance History"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" } }, "Review past sessions, view & edit logs")))
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      style: { padding: "20px", borderRadius: "12px", cursor: "pointer", border: "1px solid #e2e8f0" },
      onClick: () => setFacultyTab("profile")
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "14px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(User, { size: 22 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "15px", fontWeight: "800", color: "#0f172a", margin: 0 } }, "Faculty Profile"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" } }, "Department info, workload & contact")))
  ))), facultyTab === "timetable" && /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "1280px", margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px", fontFamily: "'Outfit', sans-serif" } }, "My Academic Timetable"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", margin: 0 } }, "Showing schedule for ", currentFaculty.name, " (", currentFaculty.id, ") \u2022 Live synchronized from Admin Panel")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setIsWeeklyGridView(!isWeeklyGridView),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid #bfdbfe",
        backgroundColor: isWeeklyGridView ? "#eff6ff" : "#ffffff",
        color: "#2563eb",
        fontWeight: "700",
        fontSize: "13px",
        cursor: "pointer"
      }
    },
    /* @__PURE__ */ React.createElement(Table2, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, isWeeklyGridView ? "Switch to Day View" : "Full Weekly Grid")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary btn-sm",
      onClick: () => window.print()
    },
    /* @__PURE__ */ React.createElement(Printer, { size: 15 }),
    /* @__PURE__ */ React.createElement("span", null, "Print Timetable")
  ))), !isWeeklyGridView && /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    overflowX: "auto",
    paddingBottom: "4px"
  } }, TIMETABLE_DAYS.map((day) => {
    const isCurrent = selectedTimetableDay === day;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: day,
        type: "button",
        onClick: () => setSelectedTimetableDay(day),
        style: {
          padding: "9px 18px",
          borderRadius: "10px",
          border: isCurrent ? "1px solid #2563eb" : "1px solid #e2e8f0",
          backgroundColor: isCurrent ? "#2563eb" : "#ffffff",
          color: isCurrent ? "#ffffff" : "#475569",
          fontWeight: isCurrent ? "700" : "600",
          fontSize: "13px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
          boxShadow: isCurrent ? "0 2px 6px rgba(37, 99, 235, 0.25)" : "none"
        }
      },
      day,
      day === todayDayName && /* @__PURE__ */ React.createElement("span", { style: {
        marginLeft: "6px",
        fontSize: "10.5px",
        backgroundColor: isCurrent ? "rgba(255, 255, 255, 0.25)" : "#eff6ff",
        color: isCurrent ? "#ffffff" : "#2563eb",
        padding: "2px 6px",
        borderRadius: "8px",
        fontWeight: "800"
      } }, "Today")
    );
  })), !isWeeklyGridView && /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px", borderRadius: "16px" } }, /* @__PURE__ */ React.createElement("h3", { style: { fontSize: "17px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" } }, "Schedule for ", selectedTimetableDay), (() => {
    const daySlots = facultyTimetableGrid[selectedTimetableDay] || {};
    const activeSlots = Object.keys(daySlots).filter((t) => daySlots[t] && daySlots[t].subject);
    if (activeSlots.length === 0) {
      return /* @__PURE__ */ React.createElement("div", { style: {
        padding: "40px 20px",
        textAlign: "center",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        border: "1px dashed #cbd5e1"
      } }, /* @__PURE__ */ React.createElement(Calendar, { size: 32, color: "#94a3b8", style: { marginBottom: "8px" } }), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "15px", fontWeight: "700", color: "#334155", margin: "0 0 4px" } }, "No Lectures Scheduled for ", selectedTimetableDay), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "12.5px", color: "#64748b", margin: 0 } }, "You have no timetable assignments for this day."));
    }
    return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" } }, activeSlots.map((time) => {
      const slot = daySlots[time];
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: time,
          style: {
            padding: "18px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }
        },
        /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React.createElement("span", { style: {
          fontSize: "12px",
          fontWeight: "700",
          color: "#1e3a8a",
          backgroundColor: "#eff6ff",
          padding: "3px 8px",
          borderRadius: "6px"
        } }, time), /* @__PURE__ */ React.createElement("span", { style: {
          fontSize: "11px",
          fontWeight: "700",
          backgroundColor: "#f1f5f9",
          color: "#475569",
          padding: "2px 8px",
          borderRadius: "4px"
        } }, slot.type || "Lecture")), /* @__PURE__ */ React.createElement("h4", { style: { fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" } }, slot.name || slot.subject), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", margin: "0 0 12px", fontWeight: "600" } }, slot.sem, " \u2022 ", slot.div, " ", slot.room ? `\u2022 ${slot.room}` : "")),
        /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => selectLectureForAttendance({
              time,
              subjectId: slot.subject,
              subjectName: slot.name || slot.subject,
              sem: slot.sem,
              div: slot.div,
              room: slot.room
            }),
            style: {
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "12.5px",
              cursor: "pointer"
            }
          },
          /* @__PURE__ */ React.createElement(UserCheck, { size: 14 }),
          /* @__PURE__ */ React.createElement("span", null, "Take Attendance")
        )
      );
    }));
  })()), isWeeklyGridView && /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px", borderRadius: "16px" } }, /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { border: "1px solid #e2e8f0", borderRadius: "10px" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table", style: { fontSize: "12.5px", width: "100%" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "110px" } }, "Day"), TIME_SLOTS.map((t) => /* @__PURE__ */ React.createElement("th", { key: t, style: { textAlign: "center", fontSize: "11.5px", padding: "10px 4px" } }, t)))), /* @__PURE__ */ React.createElement("tbody", null, TIMETABLE_DAYS.map((dayName) => /* @__PURE__ */ React.createElement("tr", { key: dayName }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "800", color: "#0f172a", backgroundColor: "#f8fafc" } }, dayName), TIME_SLOTS.map((time) => {
    if (time.includes("12:40") || time.includes("LUNCH")) {
      return /* @__PURE__ */ React.createElement("td", { key: time, style: { textAlign: "center", backgroundColor: "#f1f5f9", color: "#94a3b8", fontSize: "11px", fontWeight: "700" } }, "LUNCH");
    }
    const slot = facultyTimetableGrid[dayName]?.[time];
    if (!slot || !slot.subject) {
      return /* @__PURE__ */ React.createElement("td", { key: time, style: { textAlign: "center", color: "#cbd5e1" } }, "-");
    }
    return /* @__PURE__ */ React.createElement(
      "td",
      {
        key: time,
        style: {
          padding: "6px",
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          cursor: "pointer",
          borderRadius: "6px"
        },
        onClick: () => selectLectureForAttendance({
          time,
          subjectId: slot.subject,
          subjectName: slot.name || slot.subject,
          sem: slot.sem,
          div: slot.div,
          room: slot.room
        }),
        title: "Click to Take Attendance"
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "800", color: "#1e3a8a", fontSize: "12px" } }, slot.subject),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: "11px", color: "#475569" } }, slot.sem, " \u2022 ", slot.div),
      slot.room && /* @__PURE__ */ React.createElement("div", { style: { fontSize: "10px", color: "#64748b" } }, slot.room)
    );
  })))))))), facultyTab === "take" && /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "1280px", margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px", borderRadius: "16px", marginBottom: "24px" } }, /* @__PURE__ */ React.createElement("div", { style: { borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" } }, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px", fontFamily: "'Outfit', sans-serif" } }, "Record Lecture Attendance"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", margin: 0 } }, "Take official attendance for your scheduled lecture. System verifies class roster and prevents duplicates.")), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
    backgroundColor: "#f8fafc",
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "20px"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "5px" } }, "Lecture Date"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "date",
      className: "form-control",
      value: attDate,
      onChange: (e) => setAttDate(e.target.value),
      style: { height: "38px", fontSize: "13px", fontWeight: "600" }
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "5px" } }, "Time Slot"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: attTimeSlot,
      onChange: (e) => setAttTimeSlot(e.target.value),
      style: { height: "38px", fontSize: "13px", fontWeight: "600" }
    },
    TIME_SLOTS.filter((t) => !t.includes("12:40")).map((t) => /* @__PURE__ */ React.createElement("option", { key: t, value: t }, t))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "5px" } }, "Subject"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: attSubjectName,
      onChange: (e) => {
        setAttSubjectName(e.target.value);
        setAttSubjectId(e.target.value);
      },
      style: { height: "38px", fontSize: "13px", fontWeight: "600" }
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "5px" } }, "Semester & Division"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "6px" } }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: attSem,
      onChange: (e) => setAttSem(e.target.value),
      style: { height: "38px", fontSize: "13px", fontWeight: "600", flex: 1 }
    },
    ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"].map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s))
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-control",
      value: attDiv,
      onChange: (e) => setAttDiv(e.target.value),
      style: { height: "38px", fontSize: "13px", fontWeight: "600", width: "90px" }
    },
    ["Div 1", "Div 2", "Div 3"].map((d) => /* @__PURE__ */ React.createElement("option", { key: d, value: d }, d))
  ))), /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "5px" } }, "Topic Covered in Lecture"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "e.g. Unit 3: Relational Algebra & SQL Query Optimization",
      value: attTopic,
      onChange: (e) => setAttTopic(e.target.value),
      style: { height: "38px", fontSize: "13px" }
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "16px"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleMarkAllStatus("present"),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 14px",
        borderRadius: "8px",
        border: "1px solid #a7f3d0",
        backgroundColor: "#ecfdf5",
        color: "#059669",
        fontWeight: "700",
        fontSize: "12.5px",
        cursor: "pointer"
      }
    },
    /* @__PURE__ */ React.createElement(CheckSquare, { size: 14 }),
    /* @__PURE__ */ React.createElement("span", null, "Mark All Present")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleMarkAllStatus("absent"),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 14px",
        borderRadius: "8px",
        border: "1px solid #fecdd3",
        backgroundColor: "#fff1f2",
        color: "#e11d48",
        fontWeight: "700",
        fontSize: "12.5px",
        cursor: "pointer"
      }
    },
    /* @__PURE__ */ React.createElement(XSquare, { size: 14 }),
    /* @__PURE__ */ React.createElement("span", null, "Mark All Absent")
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "8px", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: {
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "#ecfdf5",
    color: "#059669",
    fontSize: "12.5px",
    fontWeight: "800",
    border: "1px solid #a7f3d0"
  } }, "Present: ", presentCount), /* @__PURE__ */ React.createElement("span", { style: {
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "#fff1f2",
    color: "#e11d48",
    fontSize: "12.5px",
    fontWeight: "800",
    border: "1px solid #fecdd3"
  } }, "Absent: ", absentCount), /* @__PURE__ */ React.createElement("span", { style: {
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "12.5px",
    fontWeight: "800",
    border: "1px solid #bfdbfe"
  } }, "Total: ", classStudents.length, " (", attendancePct, "%)"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1, minWidth: "220px" } }, /* @__PURE__ */ React.createElement(Search, { size: 15, style: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Search enrolled students...",
      value: studentSearch,
      onChange: (e) => setStudentSearch(e.target.value),
      style: { height: "36px", paddingLeft: "32px", fontSize: "13px" }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "4px" } }, ["all", "present", "absent"].map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f,
      type: "button",
      onClick: () => setStatusFilter(f),
      style: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid #cbd5e1",
        backgroundColor: statusFilter === f ? "#0f172a" : "#ffffff",
        color: statusFilter === f ? "#ffffff" : "#475569",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer",
        textTransform: "capitalize"
      }
    },
    f
  )))), /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { border: "1px solid #e2e8f0", borderRadius: "10px", maxHeight: "480px", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table", style: { fontSize: "13px" } }, /* @__PURE__ */ React.createElement("thead", { style: { position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 1 } }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { width: "80px" } }, "Roll No"), /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", null, "Enrollment No"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center", width: "220px" } }, "Attendance Status"))), /* @__PURE__ */ React.createElement("tbody", null, filteredStudents.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "4", style: { textAlign: "center", padding: "30px", color: "#64748b" } }, "No students found matching your criteria.")) : filteredStudents.map((st) => {
    const isPresent = (attRecords[st.id] || "present") === "present";
    return /* @__PURE__ */ React.createElement("tr", { key: st.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, st.rollNo), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "600", color: "#0f172a" } }, st.name), /* @__PURE__ */ React.createElement("td", { style: { color: "#64748b", fontSize: "12px" } }, st.enrollmentNo), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", gap: "4px", backgroundColor: "#f1f5f9", padding: "3px", borderRadius: "8px" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => handleStudentStatusToggle(st.id, "present"),
        style: {
          padding: "5px 14px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: isPresent ? "#059669" : "transparent",
          color: isPresent ? "#ffffff" : "#64748b",
          fontWeight: "700",
          fontSize: "12px",
          cursor: "pointer",
          boxShadow: isPresent ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
        }
      },
      "Present"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => handleStudentStatusToggle(st.id, "absent"),
        style: {
          padding: "5px 14px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: !isPresent ? "#e11d48" : "transparent",
          color: !isPresent ? "#ffffff" : "#64748b",
          fontWeight: "700",
          fontSize: "12px",
          cursor: "pointer",
          boxShadow: !isPresent ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
        }
      },
      "Absent"
    ))));
  })))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "12px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary",
      onClick: () => setFacultyTab("dashboard")
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleSubmitAttendance,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "11px 24px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontWeight: "700",
        fontSize: "14px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
      }
    },
    /* @__PURE__ */ React.createElement(Save, { size: 16 }),
    /* @__PURE__ */ React.createElement("span", null, "Submit & Save Attendance")
  )))), facultyTab === "history" && /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "1280px", margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "24px", borderRadius: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px", fontFamily: "'Outfit', sans-serif" } }, "Attendance History & Records"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "#64748b", margin: 0 } }, "Log of past attendance sessions recorded by ", currentFaculty.name, ".")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "10px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-primary btn-sm",
      onClick: () => setFacultyTab("take")
    },
    /* @__PURE__ */ React.createElement(UserCheck, { size: 15 }),
    /* @__PURE__ */ React.createElement("span", null, "Record New Attendance")
  ))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "16px", maxWidth: "320px" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(Search, { size: 15, style: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Search history by subject, date, topic...",
      value: historySearch,
      onChange: (e) => setHistorySearch(e.target.value),
      style: { height: "36px", paddingLeft: "32px", fontSize: "13px" }
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { border: "1px solid #e2e8f0", borderRadius: "10px" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table", style: { fontSize: "13px" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Date"), /* @__PURE__ */ React.createElement("th", null, "Time Slot"), /* @__PURE__ */ React.createElement("th", null, "Subject"), /* @__PURE__ */ React.createElement("th", null, "Class / Div"), /* @__PURE__ */ React.createElement("th", null, "Topic Covered"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Attendance"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right" } }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, filteredHistorySessions.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "7", style: { textAlign: "center", padding: "36px", color: "#64748b" } }, "No attendance records found. Start taking attendance from your schedule!")) : filteredHistorySessions.map((sess) => /* @__PURE__ */ React.createElement("tr", { key: sess.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700", color: "#0f172a" } }, sess.date), /* @__PURE__ */ React.createElement("td", { style: { color: "#475569", fontSize: "12px" } }, sess.timeSlot || "-"), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "600" } }, sess.subjectName || sess.subjectId), /* @__PURE__ */ React.createElement("td", null, sess.sem, " \u2022 ", sess.division), /* @__PURE__ */ React.createElement("td", { style: { color: "#64748b", fontSize: "12.5px" } }, sess.topic || "-"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "20px",
    backgroundColor: "#ecfdf5",
    color: "#059669",
    fontSize: "11.5px",
    fontWeight: "700"
  } }, sess.presentCount || 0, " / ", (sess.presentCount || 0) + (sess.absentCount || 0), " (", sess.percentage || "0", "%)")), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", gap: "6px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary btn-sm",
      onClick: () => setViewingSession(sess),
      title: "View Student Records",
      style: { padding: "4px 8px" }
    },
    /* @__PURE__ */ React.createElement(Eye, { size: 13 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary btn-sm",
      onClick: () => handleOpenEditSession(sess),
      title: "Edit Attendance",
      style: { padding: "4px 8px" }
    },
    /* @__PURE__ */ React.createElement(Edit3, { size: 13 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary btn-sm",
      onClick: () => handleDeleteSession(sess.id),
      title: "Delete Record",
      style: { padding: "4px 8px", color: "#e11d48" }
    },
    /* @__PURE__ */ React.createElement(Trash2, { size: 13 })
  )))))))))), facultyTab === "profile" && /* @__PURE__ */ React.createElement("div", { style: { maxWidth: "800px", margin: "0 auto" } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "32px", borderRadius: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "800",
    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.25)"
  } }, currentFaculty.name?.charAt(0) || "F"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { style: { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" } }, currentFaculty.name), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "14px", color: "#64748b", margin: 0 } }, currentFaculty.designation || "Faculty Member", " \u2022 Department of ", currentFaculty.dept))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px", marginBottom: "28px" } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" } }, "Faculty ID"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "15px", fontWeight: "700", color: "#0f172a", marginTop: "4px" } }, currentFaculty.id)), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" } }, "Email Address"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "15px", fontWeight: "700", color: "#0f172a", marginTop: "4px" } }, currentFaculty.email || "N/A")), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" } }, "Phone Number"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "15px", fontWeight: "700", color: "#0f172a", marginTop: "4px" } }, currentFaculty.phone || "N/A")), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" } }, "Specialization / Subjects"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "15px", fontWeight: "700", color: "#0f172a", marginTop: "4px" } }, currentFaculty.subjects || "All Core Subjects"))), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid #e2e8f0", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "13px", color: "#64748b" } }, "Logged in as Faculty \u2022 Access restricted to authorized lectures"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary",
      onClick: () => {
        logoutUser();
        if (onExit) onExit();
        else window.location.reload();
      },
      style: { color: "#e11d48" }
    },
    /* @__PURE__ */ React.createElement(LogOut, { size: 15 }),
    /* @__PURE__ */ React.createElement("span", null, "Log Out of Portal")
  ))))), viewingSession && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "640px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(CalendarCheck, { size: 20, color: "#2563eb" }), /* @__PURE__ */ React.createElement("span", null, "Attendance Session Details")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setViewingSession(null) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { style: { backgroundColor: "#eff6ff", padding: "14px", borderRadius: "10px", marginBottom: "16px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "800", color: "#1e3a8a", fontSize: "15px" } }, viewingSession.subjectName || viewingSession.subjectId), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12.5px", color: "#475569", marginTop: "3px" } }, viewingSession.date, " \u2022 ", viewingSession.timeSlot || "Time N/A", " \u2022 ", viewingSession.sem, " \u2022 ", viewingSession.division), /* @__PURE__ */ React.createElement("div", { style: { fontSize: "12.5px", color: "#2563eb", fontWeight: "600", marginTop: "4px" } }, "Topic: ", viewingSession.topic || "N/A")), /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { maxHeight: "360px", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table", style: { fontSize: "12.5px" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Roll No"), /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Status"))), /* @__PURE__ */ React.createElement("tbody", null, classStudents.map((st) => {
    const stStatus = viewingSession.records ? viewingSession.records[st.id] : "absent";
    const isPresent = stStatus === "present";
    return /* @__PURE__ */ React.createElement("tr", { key: st.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, st.rollNo), /* @__PURE__ */ React.createElement("td", null, st.name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: {
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "12px",
      backgroundColor: isPresent ? "#ecfdf5" : "#fff1f2",
      color: isPresent ? "#059669" : "#e11d48",
      fontWeight: "700",
      fontSize: "11px"
    } }, isPresent ? "Present" : "Absent")));
  }))))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setViewingSession(null) }, "Close")))), editingSession && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "640px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React.createElement(Edit3, { size: 20, color: "#2563eb" }), /* @__PURE__ */ React.createElement("span", null, "Edit Attendance Record")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setEditingSession(null) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveEditedSession }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "14px" } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" } }, "Topic Covered"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: editTopic,
      onChange: (e) => setEditTopic(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "table-responsive", style: { maxHeight: "340px", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("table", { className: "data-table", style: { fontSize: "12.5px" } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Roll No"), /* @__PURE__ */ React.createElement("th", null, "Student Name"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "Status"))), /* @__PURE__ */ React.createElement("tbody", null, classStudents.map((st) => {
    const stStatus = editRecords[st.id] || "present";
    const isPresent = stStatus === "present";
    return /* @__PURE__ */ React.createElement("tr", { key: st.id }, /* @__PURE__ */ React.createElement("td", { style: { fontWeight: "700" } }, st.rollNo), /* @__PURE__ */ React.createElement("td", null, st.name), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "form-control",
        value: stStatus,
        onChange: (e) => setEditRecords({ ...editRecords, [st.id]: e.target.value }),
        style: { height: "32px", fontSize: "12px", padding: "2px 8px" }
      },
      /* @__PURE__ */ React.createElement("option", { value: "present" }, "Present"),
      /* @__PURE__ */ React.createElement("option", { value: "absent" }, "Absent")
    )));
  }))))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setEditingSession(null) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Save Changes"))))));
}
function LoginView({ onLoginSuccess, showToast }) {
  const [roleTab, setRoleTab] = useState("faculty");
  const [identifier, setIdentifier] = useState("FAC_PS");
  const [password, setPassword] = useState("faculty123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const faculties = getFaculties();
  const collegeName = getCollegeName();
  const handleRoleTabChange = (newRole) => {
    setRoleTab(newRole);
    setErrorMsg("");
    if (newRole === "admin") {
      setIdentifier("admin");
      setPassword("1234");
    } else {
      setIdentifier("FAC_PS");
      setPassword("faculty123");
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const result = loginUser(identifier, password);
      setLoading(false);
      if (result.success) {
        if (showToast) {
          showToast(`Welcome back, ${result.user.name}!`);
        }
        if (onLoginSuccess) {
          onLoginSuccess(result.user.role, result.user);
        }
      } else {
        setErrorMsg(result.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("An unexpected error occurred during login. Please try again.");
    }
  };
  const handleQuickFacultySelect = (facId) => {
    setRoleTab("faculty");
    setIdentifier(facId);
    setPassword("faculty123");
    setErrorMsg("");
  };
  return /* @__PURE__ */ React.createElement("div", { style: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)",
    padding: "36px 32px 30px",
    color: "white",
    textAlign: "center",
    position: "relative"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(8px)",
    marginBottom: "16px",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)"
  } }, /* @__PURE__ */ React.createElement(GraduationCap, { size: 32, color: "#ffffff" })), /* @__PURE__ */ React.createElement("h1", { style: {
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    margin: "0 0 6px",
    color: "#ffffff",
    fontFamily: "'Outfit', sans-serif"
  } }, "ADIT Attendance Portal"), /* @__PURE__ */ React.createElement("p", { style: {
    fontSize: "13px",
    color: "#bfdbfe",
    margin: 0,
    fontWeight: "500"
  } }, collegeName)), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    backgroundColor: "#f1f5f9",
    padding: "6px",
    margin: "24px 28px 0",
    borderRadius: "12px",
    border: "1px solid #e2e8f0"
  } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleRoleTabChange("faculty"),
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: roleTab === "faculty" ? "#ffffff" : "transparent",
        color: roleTab === "faculty" ? "#1e3a8a" : "#64748b",
        fontWeight: roleTab === "faculty" ? "700" : "600",
        fontSize: "13.5px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: roleTab === "faculty" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
      }
    },
    /* @__PURE__ */ React.createElement(UserCheck, { size: 16, color: roleTab === "faculty" ? "#2563eb" : "#94a3b8" }),
    /* @__PURE__ */ React.createElement("span", null, "Faculty Login")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleRoleTabChange("admin"),
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: roleTab === "admin" ? "#ffffff" : "transparent",
        color: roleTab === "admin" ? "#0f172a" : "#64748b",
        fontWeight: roleTab === "admin" ? "700" : "600",
        fontSize: "13.5px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: roleTab === "admin" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
      }
    },
    /* @__PURE__ */ React.createElement(ShieldCheck, { size: 16, color: roleTab === "admin" ? "#0f172a" : "#94a3b8" }),
    /* @__PURE__ */ React.createElement("span", null, "Admin Login")
  )), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, style: { padding: "24px 28px 28px" } }, errorMsg && /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#e11d48",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "20px"
  } }, /* @__PURE__ */ React.createElement(AlertCircle, { size: 18, style: { flexShrink: 0 } }), /* @__PURE__ */ React.createElement("span", null, errorMsg)), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "18px" } }, /* @__PURE__ */ React.createElement("label", { style: {
    display: "block",
    fontSize: "12.5px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "7px"
  } }, roleTab === "admin" ? "Administrator Username / Email" : "Faculty ID / Email"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center"
  } }, roleTab === "admin" ? /* @__PURE__ */ React.createElement(ShieldCheck, { size: 18 }) : /* @__PURE__ */ React.createElement(User, { size: 18 })), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: identifier,
      onChange: (e) => setIdentifier(e.target.value),
      placeholder: roleTab === "admin" ? "Enter admin or email" : "e.g. FAC_PS or email",
      style: {
        width: "100%",
        height: "44px",
        paddingLeft: "40px",
        paddingRight: "14px",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        backgroundColor: "#f8fafc",
        fontSize: "14px",
        fontWeight: "600",
        color: "#0f172a",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
      },
      onFocus: (e) => {
        e.target.style.borderColor = "#2563eb";
        e.target.style.backgroundColor = "#ffffff";
        e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.15)";
      },
      onBlur: (e) => {
        e.target.style.borderColor = "#cbd5e1";
        e.target.style.backgroundColor = "#f8fafc";
        e.target.style.boxShadow = "none";
      }
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "22px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" } }, /* @__PURE__ */ React.createElement("label", { style: {
    fontSize: "12.5px",
    fontWeight: "700",
    color: "#334155"
  } }, roleTab === "admin" ? "Admin Password / Security PIN" : "Password"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "11.5px", color: "#64748b" } }, roleTab === "admin" ? "Default: 1234" : "Default: faculty123")), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center"
  } }, /* @__PURE__ */ React.createElement(Lock, { size: 18 })), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: showPassword ? "text" : "password",
      required: true,
      value: password,
      onChange: (e) => setPassword(e.target.value),
      placeholder: "Enter your password",
      style: {
        width: "100%",
        height: "44px",
        paddingLeft: "40px",
        paddingRight: "40px",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        backgroundColor: "#f8fafc",
        fontSize: "14px",
        fontWeight: "600",
        color: "#0f172a",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
      },
      onFocus: (e) => {
        e.target.style.borderColor = "#2563eb";
        e.target.style.backgroundColor = "#ffffff";
        e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.15)";
      },
      onBlur: (e) => {
        e.target.style.borderColor = "#cbd5e1";
        e.target.style.backgroundColor = "#f8fafc";
        e.target.style.boxShadow = "none";
      }
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowPassword(!showPassword),
      style: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: 0
      }
    },
    showPassword ? /* @__PURE__ */ React.createElement(EyeOff, { size: 18 }) : /* @__PURE__ */ React.createElement(Eye, { size: 18 })
  ))), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: loading,
      style: {
        width: "100%",
        height: "46px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: roleTab === "admin" ? "#0f172a" : "#2563eb",
        color: "#ffffff",
        fontSize: "14.5px",
        fontWeight: "700",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        boxShadow: roleTab === "admin" ? "0 4px 12px rgba(15, 23, 42, 0.25)" : "0 4px 12px rgba(37, 99, 235, 0.3)",
        transition: "all 0.2s ease"
      }
    },
    /* @__PURE__ */ React.createElement("span", null, loading ? "Authenticating..." : `Log in to ${roleTab === "admin" ? "Admin Panel" : "Faculty Panel"}`),
    /* @__PURE__ */ React.createElement(ArrowRight, { size: 17 })
  ), /* @__PURE__ */ React.createElement("div", { style: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11.5px",
    fontWeight: "700",
    color: "#64748b",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.04em"
  } }, /* @__PURE__ */ React.createElement(Sparkles, { size: 13, color: "#2563eb" }), /* @__PURE__ */ React.createElement("span", null, "Quick Login (Click to Auto-fill)")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "6px" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleQuickFacultySelect("FAC_PS"),
      style: {
        fontSize: "11.5px",
        fontWeight: "600",
        padding: "5px 10px",
        borderRadius: "6px",
        border: "1px solid #bfdbfe",
        backgroundColor: identifier === "FAC_PS" ? "#eff6ff" : "#f8fafc",
        color: "#1d4ed8",
        cursor: "pointer"
      }
    },
    "Prof. Priya Shah (FAC_PS)"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleQuickFacultySelect("FAC_DJP"),
      style: {
        fontSize: "11.5px",
        fontWeight: "600",
        padding: "5px 10px",
        borderRadius: "6px",
        border: "1px solid #bfdbfe",
        backgroundColor: identifier === "FAC_DJP" ? "#eff6ff" : "#f8fafc",
        color: "#1d4ed8",
        cursor: "pointer"
      }
    },
    "Dr. Dinesh Prajapati (FAC_DJP)"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleQuickFacultySelect("FAC_RP"),
      style: {
        fontSize: "11.5px",
        fontWeight: "600",
        padding: "5px 10px",
        borderRadius: "6px",
        border: "1px solid #bfdbfe",
        backgroundColor: identifier === "FAC_RP" ? "#eff6ff" : "#f8fafc",
        color: "#1d4ed8",
        cursor: "pointer"
      }
    },
    "Prof. Rahul Patel (FAC_RP)"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleRoleTabChange("admin"),
      style: {
        fontSize: "11.5px",
        fontWeight: "600",
        padding: "5px 10px",
        borderRadius: "6px",
        border: "1px solid #cbd5e1",
        backgroundColor: roleTab === "admin" ? "#f1f5f9" : "#f8fafc",
        color: "#0f172a",
        cursor: "pointer"
      }
    },
    "Admin (admin / 1234)"
  ))))));
}
function App() {
  const [currentUser, setCurrentUserSession] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState("manage");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  useEffect(() => {
    initializeStorage();
  }, []);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };
  const handleLoginSuccess = (role, user) => {
    setCurrentUserSession(user);
    if (role === "admin") {
      setActiveTab("manage");
      setIsAdminUnlocked(true);
    }
  };
  const handleLogout = () => {
    logoutUser();
    setCurrentUserSession(null);
    setIsAdminUnlocked(false);
    showToast("Logged out of session.");
  };
  const requestAdminAccess = (onSuccessAction) => {
    if (isAdminUnlocked) {
      onSuccessAction();
    } else {
      setPendingAction(() => onSuccessAction);
      setShowPinModal(true);
      setPinError("");
      setPinInput("");
    }
  };
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setIsAdminUnlocked(true);
      setShowPinModal(false);
      showToast("Admin Security Authorized!");
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      setPinError("Incorrect Admin Security PIN! Default PIN is 1234");
    }
  };
  const handleResetData = () => {
    requestAdminAccess(() => {
      resetToDefault();
      showToast("Database reset to default sample records.");
      setActiveTab("dashboard");
    });
  };
  const handleTabChange = (tabId) => {
    if (tabId === "manage") {
      requestAdminAccess(() => setActiveTab(tabId));
    } else {
      setActiveTab(tabId);
    }
  };
  if (!currentUser) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LoginView, { onLoginSuccess: handleLoginSuccess, showToast }), toastMessage && /* @__PURE__ */ React.createElement("div", { className: "toast-notification" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 18, style: { color: "#34d399" } }), /* @__PURE__ */ React.createElement("span", null, toastMessage)));
  }
  if (currentUser.role === "faculty") {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      FacultyPanel,
      {
        currentUser,
        showToast,
        onExit: handleLogout
      }
    ), toastMessage && /* @__PURE__ */ React.createElement("div", { className: "toast-notification" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 18, style: { color: "#34d399" } }), /* @__PURE__ */ React.createElement("span", null, toastMessage)));
  }
  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return /* @__PURE__ */ React.createElement(Dashboard, { setActiveTab: handleTabChange });
      case "enter":
        return /* @__PURE__ */ React.createElement(EnterAttendance, { onSaved: () => setActiveTab("list"), showToast });
      case "list":
        return /* @__PURE__ */ React.createElement(AttendanceList, { searchQuery, showToast, requestAdminAccess });
      case "dateView":
        return /* @__PURE__ */ React.createElement(DateView, null);
      case "topicView":
        return /* @__PURE__ */ React.createElement(TopicView, { searchQuery });
      case "analytics":
        return /* @__PURE__ */ React.createElement(AnalyticsView, { searchQuery });
      case "print":
        return /* @__PURE__ */ React.createElement(PrintView, { showToast });
      case "manage":
        return /* @__PURE__ */ React.createElement(AdminPanel, { showToast, onExit: handleLogout });
      default:
        return /* @__PURE__ */ React.createElement(AdminPanel, { showToast, onExit: handleLogout });
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: `app-container ${activeTab === "manage" ? "in-admin-mode" : ""}` }, activeTab !== "manage" && /* @__PURE__ */ React.createElement(
    Sidebar,
    {
      activeTab,
      setActiveTab: handleTabChange,
      onResetData: handleResetData
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "main-wrapper", style: activeTab === "manage" ? { width: "100%", maxWidth: "100%" } : {} }, activeTab !== "manage" && /* @__PURE__ */ React.createElement(
    Header,
    {
      searchQuery,
      setSearchQuery,
      activeTab,
      isUnlocked: isAdminUnlocked,
      onLockToggle: () => {
        if (isAdminUnlocked) {
          setIsAdminUnlocked(false);
          showToast("Admin mode locked.");
        } else {
          requestAdminAccess(() => {
          });
        }
      }
    }
  ), /* @__PURE__ */ React.createElement("main", { className: activeTab === "manage" ? "content-area-admin" : "content-area" }, renderActiveView())), showPinModal && /* @__PURE__ */ React.createElement("div", { className: "modal-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "modal-card", style: { maxWidth: "400px" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h3", { style: { display: "flex", alignItems: "center", gap: "8px", color: "var(--navy-primary)" } }, /* @__PURE__ */ React.createElement(KeyRound, { size: 20 }), "Admin Security PIN Required"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => setShowPinModal(false) }, /* @__PURE__ */ React.createElement(X, { size: 16 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handlePinSubmit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" } }, "Please enter the Admin Security PIN to access sensitive management features."), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "Security PIN Code (Default: 1234)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "password",
      className: "form-control",
      placeholder: "Enter 4-digit PIN...",
      value: pinInput,
      onChange: (e) => setPinInput(e.target.value),
      autoFocus: true,
      required: true
    }
  )), pinError && /* @__PURE__ */ React.createElement("div", { style: { color: "#e11d48", fontSize: "12px", marginTop: "8px", fontWeight: "700" } }, pinError)), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowPinModal(false) }, "Cancel"), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(ShieldCheck, { size: 16 }), " Unlock Access"))))), toastMessage && /* @__PURE__ */ React.createElement("div", { className: "toast-notification" }, /* @__PURE__ */ React.createElement(CheckCircle, { size: 18, style: { color: "#34d399" } }), /* @__PURE__ */ React.createElement("span", null, toastMessage)));
}
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(React.createElement(App));
