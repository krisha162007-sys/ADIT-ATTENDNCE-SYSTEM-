import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  X, 
  ArrowRightLeft, 
  BookOpen, 
  Building2, 
  Calendar,
  Layers,
  Sparkles,
  FileText,
  UserPlus,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  SEMESTERS, 
  ACADEMIC_YEARS, 
  DEFAULT_ACADEMIC_YEAR,
  getDepartments, 
  getClasses, 
  saveClass, 
  deleteClass, 
  getClassById, 
  findClassByCriteria,
  getStudents, 
  getStudentsByClassId, 
  saveStudent, 
  deleteStudent, 
  removeStudentFromClass,
  moveStudentToClass, 
  bulkImportStudentsToClass,
  checkStudentEnrollment,
  normalizeSem,
  normalizeDiv,
  getNextSemester,
  promoteStudentsSemester,
  getGlobalPromotionPreview,
  promoteAllStudentsGlobally,
  getPromotionHistory,
  downloadStudentRegistrationTemplate,
  bulkRegisterStudents,
  getFaculties,
  getSubjects,
  parseAndValidateElectiveStudentList,
  updateElectiveClassRoster
} from '../services/attendanceStorage';

export default function ClassManagementPanel({ departments: initialDepts, showToast, onOpenClassTimetable }) {
  const departments = initialDepts || getDepartments();
  const [classes, setClasses] = useState(getClasses());
  const [students, setStudents] = useState(getStudents());

  // Navigation: null = list of all classes, or string classId = viewing class detail
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Available Faculties List
  const allFaculties = useMemo(() => {
    try {
      return getFaculties ? getFaculties() : [];
    } catch (e) {
      return [];
    }
  }, []);

  // Available Subjects List
  const allSubjects = useMemo(() => {
    try {
      return getSubjects ? getSubjects() : [];
    } catch (e) {
      return [];
    }
  }, []);

  // Elective Roster Replace Modal State (in Class Details View)
  const [showElectiveRosterModal, setShowElectiveRosterModal] = useState(false);
  const [electiveRosterFile, setElectiveRosterFile] = useState(null);
  const [electiveRosterStats, setElectiveRosterStats] = useState(null);
  const [electiveRosterError, setElectiveRosterError] = useState('');

  // Filters for classes list
  const [filterYear, setFilterYear] = useState('2026-27');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterSem, setFilterSem] = useState('ALL');
  const [filterDiv, setFilterDiv] = useState('ALL');
  const [classSearch, setClassSearch] = useState('');

  // Class detail search
  const [studentSearch, setStudentSearch] = useState('');

  // Modals state
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    isElective: false,
    departmentName: 'AI & Data Science',
    semester: '3rd Sem',
    division: 'Div 1',
    academicYear: '2026-27',
    subjectId: '',
    subjectName: '',
    facultyId: '',
    facultyName: '',
    excelFile: null,
    excelPreview: null,
    excelStats: null
  });
  const [classModalError, setClassModalError] = useState('');

  // Single Student Modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    enrollmentNo: '',
    rollNo: '',
    email: '',
    batch: 'Batch A'
  });
  const [studentModalError, setStudentModalError] = useState('');
  const [otherClassConflict, setOtherClassConflict] = useState(null);

  // Remove Student Modal
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // Move Student Modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [studentToMove, setStudentToMove] = useState(null);
  const [targetClassIdForMove, setTargetClassIdForMove] = useState('');

  // Bulk Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewRows, setUploadPreviewRows] = useState(null);
  const [uploadStats, setUploadStats] = useState({ total: 0, valid: 0, duplicates: 0, conflicts: 0, invalid: 0 });
  const [moveExistingOnImport, setMoveExistingOnImport] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // -------------------------------------------------------------------------
  // SEMESTER PROMOTION ("SEMESTER UP") STATE
  // -------------------------------------------------------------------------
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionSourceSem, setPromotionSourceSem] = useState('3rd Sem');
  const [promotionDept, setPromotionDept] = useState('ALL');
  const [selectedPromotionIds, setSelectedPromotionIds] = useState([]); // Array of student IDs to promote
  const [promotionStep, setPromotionStep] = useState('preview'); // 'preview', 'confirm', 'success'
  const [promotionResult, setPromotionResult] = useState(null);

  // GLOBAL ONE-CLICK SEMESTER PROMOTION STATE
  const [showGlobalPromotionModal, setShowGlobalPromotionModal] = useState(false);
  const [globalPromotionPreview, setGlobalPromotionPreview] = useState(null);
  const [globalPromotionFinalSem, setGlobalPromotionFinalSem] = useState(8);
  const [globalPromotionCycle, setGlobalPromotionCycle] = useState('2026-27');
  const [globalPromotionStep, setGlobalPromotionStep] = useState('confirm'); // 'confirm', 'success'
  const [globalPromotionResult, setGlobalPromotionResult] = useState(null);
  const [globalPromotionOverride, setGlobalPromotionOverride] = useState(false);
  const [isExecutingGlobalPromotion, setIsExecutingGlobalPromotion] = useState(false);
  const [globalPromotionError, setGlobalPromotionError] = useState(null);

  // -------------------------------------------------------------------------
  // GLOBAL STUDENT REGISTRATION (FRESHERS / LATERAL ENTRY) STATE
  // -------------------------------------------------------------------------
  const [showGlobalStudentModal, setShowGlobalStudentModal] = useState(false);
  const [globalStudentForm, setGlobalStudentForm] = useState({
    name: '',
    enrollmentNo: '',
    department: 'AI & Data Science',
    semester: '1st Sem',
    division: 'Div 1',
    batch: 'Batch A',
    email: '',
    rollNo: ''
  });
  const [globalStudentError, setGlobalStudentError] = useState('');

  // -------------------------------------------------------------------------
  // BULK FRESHER REGISTRATION (EXCEL IMPORT) STATE
  // -------------------------------------------------------------------------
  const [showBulkFresherModal, setShowBulkFresherModal] = useState(false);
  const [bulkFresherFile, setBulkFresherFile] = useState(null);
  const [bulkFresherPreviewRows, setBulkFresherPreviewRows] = useState(null);
  const [bulkFresherStats, setBulkFresherStats] = useState({ total: 0, valid: 0, duplicates: 0, invalid: 0 });
  const [isProcessingBulkFresher, setIsProcessingBulkFresher] = useState(false);

  // Refresh data from storage
  // Refresh data from storage
  const refreshData = () => {
    setClasses([...getClasses()]);
    setStudents([...getStudents()]);
  };

  // Promotion target & eligible students calculations
  const targetSemesterInfo = useMemo(() => {
    return getNextSemester(promotionSourceSem) || { targetSem: 'Next Sem', isGraduation: false, label: 'Next Sem' };
  }, [promotionSourceSem]);

  const eligiblePromotionStudents = useMemo(() => {
    const normSource = normalizeSem(promotionSourceSem);
    return students.filter(s => {
      const sSem = normalizeSem(s.semester || s.sem);
      if (sSem !== normSource) return false;
      if (s.status === 'Graduated' || s.isGraduated) return false;
      if (promotionDept !== 'ALL') {
        const sDept = String(s.department || s.dept || '').toLowerCase();
        const tDept = String(promotionDept).toLowerCase();
        if (!sDept.includes(tDept) && !tDept.includes(sDept)) return false;
      }
      return true;
    });
  }, [students, promotionSourceSem, promotionDept]);

  // Synchronize selected promotion IDs whenever eligiblePromotionStudents changes
  React.useEffect(() => {
    if (showPromotionModal) {
      setSelectedPromotionIds(eligiblePromotionStudents.map(s => s.id));
    }
  }, [eligiblePromotionStudents, showPromotionModal]);

  const selectedClass = useMemo(() => {
    if (!selectedClassId) return null;
    return classes.find(c => c.id === selectedClassId) || null;
  }, [selectedClassId, classes]);

  const studentsInSelectedClass = useMemo(() => {
    if (!selectedClassId) return [];
    return getStudentsByClassId(selectedClassId);
  }, [selectedClassId, students]);

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchYear = filterYear === 'ALL' || cls.academicYear === filterYear;
      
      let matchDept = true;
      if (filterDept === 'ELECTIVE') {
        matchDept = Boolean(cls.isElective);
      } else if (filterDept !== 'ALL') {
        matchDept = !cls.isElective && (cls.departmentName === filterDept || cls.departmentId === filterDept);
      }

      const matchSem = filterSem === 'ALL' || normalizeSem(cls.semester) === normalizeSem(filterSem);
      const matchDiv = filterDiv === 'ALL' || normalizeDiv(cls.division) === normalizeDiv(filterDiv) || (cls.isElective && (cls.division || cls.name || '').toLowerCase().includes(filterDiv.toLowerCase()));
      const q = classSearch.toLowerCase().trim();
      const matchSearch = !q || 
        (cls.departmentName && cls.departmentName.toLowerCase().includes(q)) || 
        (cls.semester && cls.semester.toLowerCase().includes(q)) || 
        (cls.division && cls.division.toLowerCase().includes(q)) ||
        (cls.name && cls.name.toLowerCase().includes(q)) ||
        (cls.subjectName && cls.subjectName.toLowerCase().includes(q)) ||
        (cls.facultyName && cls.facultyName.toLowerCase().includes(q));
      return matchYear && matchDept && matchSem && matchDiv && matchSearch;
    });
  }, [classes, filterYear, filterDept, filterSem, filterDiv, classSearch]);

  // Filtered students inside class details view
  const filteredClassStudents = useMemo(() => {
    if (!studentSearch.trim()) return studentsInSelectedClass;
    const q = studentSearch.toLowerCase().trim();
    return studentsInSelectedClass.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.enrollmentNo.toLowerCase().includes(q) ||
      String(s.rollNo || '').includes(q) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  }, [studentsInSelectedClass, studentSearch]);

  // -------------------------------------------------------------------------
  // CLASS HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassForm({
      isElective: filterDept === 'ELECTIVE',
      departmentName: filterDept !== 'ALL' && filterDept !== 'ELECTIVE' ? filterDept : (departments[0]?.name || 'AI & Data Science'),
      semester: filterSem !== 'ALL' ? filterSem : '5th Sem',
      division: filterDiv !== 'ALL' ? filterDiv : 'Elective Class A',
      academicYear: filterYear !== 'ALL' ? filterYear : '2026-27',
      subjectId: '',
      subjectName: '',
      facultyId: '',
      facultyName: '',
      excelFile: null,
      excelPreview: null,
      excelStats: null
    });
    setClassModalError('');
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls, e) => {
    if (e) e.stopPropagation();
    setEditingClass(cls);
    setClassForm({
      isElective: Boolean(cls.isElective),
      departmentName: cls.departmentName || '',
      semester: cls.semester,
      division: cls.division || cls.name || '',
      academicYear: cls.academicYear,
      subjectId: cls.subjectId || '',
      subjectName: cls.subjectName || '',
      facultyId: cls.facultyId || '',
      facultyName: cls.facultyName || '',
      excelFile: null,
      excelPreview: null,
      excelStats: null
    });
    setClassModalError('');
    setShowClassModal(true);
  };

  const handleClassExcelFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        const validation = parseAndValidateElectiveStudentList(rows, getStudents());
        setClassForm(prev => ({
          ...prev,
          excelFile: file,
          excelPreview: validation.preview,
          excelStats: validation
        }));
      } catch (err) {
        setClassModalError('Error parsing Excel file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveClassSubmit = (e) => {
    e.preventDefault();
    setClassModalError('');
    try {
      const isElective = Boolean(classForm.isElective);
      let subjName = classForm.subjectName;
      if (isElective && classForm.subjectId && !subjName) {
        const sub = allSubjects.find(s => s.id === classForm.subjectId || s.code === classForm.subjectId);
        if (sub) subjName = sub.name;
      }
      let facName = classForm.facultyName;
      if (isElective && classForm.facultyId && !facName) {
        const fac = allFaculties.find(f => f.id === classForm.facultyId);
        if (fac) facName = fac.name;
      }

      const res = saveClass({
        ...(editingClass ? { id: editingClass.id } : {}),
        isElective,
        departmentName: isElective ? null : classForm.departmentName,
        semester: classForm.semester,
        division: classForm.division,
        name: classForm.division,
        academicYear: classForm.academicYear,
        subjectId: isElective ? classForm.subjectId : undefined,
        subjectName: isElective ? (subjName || classForm.subjectId) : undefined,
        facultyId: isElective ? classForm.facultyId : undefined,
        facultyName: isElective ? facName : undefined,
        studentEnrollmentNos: classForm.excelStats ? classForm.excelStats.matchedEnrollmentNos : (editingClass?.studentEnrollmentNos || []),
        studentIds: classForm.excelStats ? classForm.excelStats.matchedStudentIds : (editingClass?.studentIds || [])
      });
      refreshData();
      setShowClassModal(false);
      if (showToast) showToast(editingClass ? 'Class updated successfully!' : (isElective ? 'Elective class created successfully!' : 'New class created successfully!'));
    } catch (err) {
      setClassModalError(err.message || 'Error saving class.');
    }
  };

  const handleDeleteClass = (cls, e) => {
    if (e) e.stopPropagation();
    const enrolled = getStudentsByClassId(cls.id);
    const msg = cls.isElective
      ? `Are you sure you want to delete elective class "${cls.division || cls.name}" (${cls.subjectName || 'Elective Subject'}, ${cls.semester})? It has ${enrolled.length} enrolled student(s). Student records and regular classes will remain untouched.`
      : (enrolled.length > 0 
          ? `This class has ${enrolled.length} enrolled student(s). Are you sure you want to delete "${cls.departmentName} • ${cls.semester} • ${cls.division} (${cls.academicYear})"?`
          : `Are you sure you want to delete "${cls.departmentName} • ${cls.semester} • ${cls.division} (${cls.academicYear})"?`);

    if (window.confirm(msg)) {
      deleteClass(cls.id, false);
      refreshData();
      if (selectedClassId === cls.id) {
        setSelectedClassId(null);
      }
      if (showToast) showToast(cls.isElective ? 'Elective class deleted.' : 'Class deleted.');
    }
  };

  // Elective Class Roster Replacement Handlers
  const handleElectiveRosterFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setElectiveRosterFile(file);
    setElectiveRosterError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        const validation = parseAndValidateElectiveStudentList(rows, getStudents());
        setElectiveRosterStats(validation);
      } catch (err) {
        setElectiveRosterError('Error reading Excel file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmReplaceElectiveRoster = () => {
    if (!selectedClass || !electiveRosterStats) return;
    try {
      updateElectiveClassRoster(selectedClass.id, electiveRosterStats.matchedEnrollmentNos);
      refreshData();
      setShowElectiveRosterModal(false);
      if (showToast) showToast(`Successfully updated elective roster (${electiveRosterStats.validCount} students enrolled).`);
    } catch (err) {
      setElectiveRosterError(err.message);
    }
  };

  const handleRemoveStudentFromElectiveClass = (student) => {
    if (!selectedClass || !selectedClass.isElective) return;
    if (window.confirm(`Remove ${student.name} (${student.enrollmentNo}) from elective class "${selectedClass.name || selectedClass.division}"? Regular student and class records will remain untouched.`)) {
      const remainingEnrs = (selectedClass.studentEnrollmentNos || []).filter(enr => enr !== student.enrollmentNo);
      updateElectiveClassRoster(selectedClass.id, remainingEnrs);
      refreshData();
      if (showToast) showToast(`Removed ${student.name} from elective class.`);
    }
  };

  // -------------------------------------------------------------------------
  // STUDENT HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: '',
      enrollmentNo: '',
      rollNo: String(studentsInSelectedClass.length + 1),
      email: '',
      batch: 'Batch A'
    });
    setStudentModalError('');
    setOtherClassConflict(null);
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (st) => {
    setEditingStudent(st);
    setStudentForm({
      name: st.name,
      enrollmentNo: st.enrollmentNo,
      rollNo: st.rollNo || '',
      email: st.email || '',
      batch: st.batch || 'Batch A'
    });
    setStudentModalError('');
    setOtherClassConflict(null);
    setShowStudentModal(true);
  };

  const handleStudentFormChange = (field, val) => {
    setStudentForm(prev => ({ ...prev, [field]: val }));
    setStudentModalError('');

    if (field === 'enrollmentNo' && val.trim().length >= 3) {
      const check = checkStudentEnrollment(val.trim(), selectedClassId, editingStudent?.id);
      if (check.exists) {
        if (check.inSameClass) {
          setStudentModalError('Student with this enrollment number already exists in this class.');
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
      setStudentModalError('Enrollment Number and Student Name are required.');
      return;
    }

    // Check duplicate within this class
    const check = checkStudentEnrollment(studentForm.enrollmentNo.trim(), selectedClassId, editingStudent?.id);
    if (check.exists) {
      if (check.inSameClass) {
        setStudentModalError('Student with this enrollment number already exists in this class.');
        return;
      } else if (!otherClassConflict) {
        setStudentModalError(`Student with this enrollment number is already enrolled in ${check.currentClassName}.`);
        setOtherClassConflict(check);
        return;
      }
    }

    try {
      saveStudent({
        ...(editingStudent ? { id: editingStudent.id } : {}),
        name: studentForm.name.trim(),
        enrollmentNo: studentForm.enrollmentNo.trim(),
        rollNo: studentForm.rollNo.trim(),
        email: studentForm.email.trim(),
        batch: studentForm.batch ? studentForm.batch.trim() : 'Batch A',
        classId: editingStudent ? (editingStudent.classId || selectedClassId) : selectedClassId
      });
      refreshData();
      setShowStudentModal(false);
      if (showToast) showToast(editingStudent ? 'Student details updated!' : 'Student added to class!');
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

  // Initiate Remove Confirmation Dialog
  const handleInitiateRemoveStudent = (st) => {
    setStudentToRemove(st);
    setShowRemoveModal(true);
  };

  // Confirm Remove from Class (Preserves Historical Attendance)
  const handleConfirmRemoveStudent = () => {
    if (!studentToRemove) return;
    removeStudentFromClass(studentToRemove.id, selectedClassId);
    refreshData();
    setShowRemoveModal(false);
    if (showToast) showToast(`Student "${studentToRemove.name}" removed from class.`);
    setStudentToRemove(null);
  };

  // Open Move Modal
  const handleOpenMoveModal = (st) => {
    setStudentToMove(st);
    // Default to the first different class
    const otherClasses = classes.filter(c => c.id !== selectedClassId);
    setTargetClassIdForMove(otherClasses[0]?.id || '');
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
      alert('Error moving student: ' + err.message);
    }
  };

  // -------------------------------------------------------------------------
  // EXCEL / CSV BULK UPLOAD & PREVIEW
  // -------------------------------------------------------------------------
  const handleDownloadSampleTemplate = () => {
    const wb = XLSX.utils.book_new();
    const sampleData = [
      ['Roll No', 'Enrollment No', 'Student Name', 'Batch', 'Email'],
      ['1', '24AD001', 'Aarav Patel', 'Batch A', 'aarav.patel@adit.ac.in'],
      ['2', '24AD002', 'Ananya Sharma', 'Batch A', 'ananya.sharma@adit.ac.in'],
      ['3', '24AD003', 'Devansh Verma', 'Batch B', 'devansh.verma@adit.ac.in'],
      ['4', '24AD004', 'Diyansh Joshi', 'Batch B', 'diyansh.joshi@adit.ac.in'],
      ['5', '24AD005', 'Isha Mehta', 'Batch C', 'isha.mehta@adit.ac.in']
    ];
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `Class_${selectedClass?.semester || 'Sem'}_${selectedClass?.division || 'Div'}_Template.xlsx`);
  };

  const handleExportClassStudents = () => {
    if (!selectedClass || studentsInSelectedClass.length === 0) {
      alert('No students to export.');
      return;
    }
    const wb = XLSX.utils.book_new();
    const header = [
      ['ADIT Attendance Management System - Official Class Roster'],
      [`Department: ${selectedClass.departmentName}`, `Semester: ${selectedClass.semester}`, `Division: ${selectedClass.division}`, `Academic Year: ${selectedClass.academicYear}`],
      [`Total Students: ${studentsInSelectedClass.length}`, `Export Date: ${new Date().toLocaleDateString()}`],
      [],
      ['Roll No', 'Enrollment No', 'Student Name', 'Batch', 'Email', 'Department', 'Semester', 'Division', 'Academic Year']
    ];
    const rows = studentsInSelectedClass.map(s => [
      s.rollNo || '',
      s.enrollmentNo || '',
      s.name || '',
      s.batch || 'Batch A',
      s.email || '',
      selectedClass.departmentName,
      selectedClass.semester,
      selectedClass.division,
      selectedClass.academicYear
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Enrolled Students');
    const safeName = `${selectedClass.departmentName.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedClass.semester}_${selectedClass.division}`.replace(/\s+/g, '_');
    XLSX.writeFile(wb, `${safeName}_Roster_${selectedClass.academicYear}.xlsx`);
  };

  // Parse Upload File and Generate Preview
  const handleUploadFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setIsProcessingUpload(true);
    setUploadPreviewRows(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      if (!firstSheet) throw new Error('Spreadsheet has no readable sheets.');

      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      if (!rawRows || rawRows.length < 2) {
        throw new Error('Spreadsheet is empty or lacks headers.');
      }

      // Detect header row index
      let headerIdx = 0;
      for (let i = 0; i < Math.min(5, rawRows.length); i++) {
        const rowStr = rawRows[i].join(' ').toLowerCase();
        if (rowStr.includes('enroll') || rowStr.includes('name') || rowStr.includes('roll')) {
          headerIdx = i;
          break;
        }
      }

      const headers = rawRows[headerIdx].map(h => String(h || '').trim().toLowerCase());
      
      // Column index mapping
      let rollCol = headers.findIndex(h => /^(roll|roll\s*no|rno|sr|sr\s*no|no)$/i.test(h));
      let enrCol = headers.findIndex(h => /^(enroll|enrollment|enrollment\s*no|enrolment|id|enr)$/i.test(h));
      let nameCol = headers.findIndex(h => /^(name|student\s*name|full\s*name|student)$/i.test(h));
      let batchCol = headers.findIndex(h => /^(batch|group|subgroup|section|lab\s*batch)$/i.test(h));
      let emailCol = headers.findIndex(h => /^(email|e-mail|email\s*address|mail)$/i.test(h));

      // Fallbacks if columns not strictly matched
      if (enrCol === -1) {
        enrCol = headers.findIndex(h => h.includes('enr') || h.includes('enroll'));
      }
      if (nameCol === -1) {
        nameCol = headers.findIndex(h => h.includes('name') || h.includes('student'));
      }
      if (rollCol === -1) {
        rollCol = headers.findIndex(h => h.includes('roll') || h.includes('sr'));
      }
      if (batchCol === -1) {
        batchCol = headers.findIndex(h => h.includes('batch') || h.includes('group'));
      }
      if (emailCol === -1) {
        emailCol = headers.findIndex(h => h.includes('mail'));
      }

      if (enrCol === -1 && nameCol === -1) {
        // Fallback positional: col 0 roll, col 1 enr, col 2 name
        rollCol = 0; enrCol = 1; nameCol = 2; emailCol = 3;
      }

      const fileEnrollmentSeen = new Set();
      const analyzedRows = [];
      let valid = 0, duplicates = 0, conflicts = 0, invalid = 0;

      for (let r = headerIdx + 1; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row || row.every(cell => !cell)) continue; // skip blank row

        const rollNo = rollCol !== -1 ? String(row[rollCol] || '').trim() : '';
        const enr = enrCol !== -1 ? String(row[enrCol] || '').trim() : '';
        const name = nameCol !== -1 ? String(row[nameCol] || '').trim() : '';
        const batch = batchCol !== -1 ? String(row[batchCol] || '').trim() : 'Batch A';
        const email = emailCol !== -1 ? String(row[emailCol] || '').trim() : '';

        const rowItem = {
          rowNumber: r + 1,
          rollNo: rollNo || String(r - headerIdx),
          enrollmentNo: enr,
          name,
          batch: batch || 'Batch A',
          email,
          status: 'valid',
          reason: 'Ready to import'
        };

        if (!name || !enr) {
          rowItem.status = 'invalid';
          rowItem.reason = !name ? 'Missing student name' : 'Missing enrollment number';
          invalid++;
        } else if (fileEnrollmentSeen.has(enr.toLowerCase())) {
          rowItem.status = 'duplicate';
          rowItem.reason = 'Duplicate enrollment number inside this file';
          duplicates++;
        } else {
          fileEnrollmentSeen.add(enr.toLowerCase());

          // Check against database
          const check = checkStudentEnrollment(enr, selectedClassId);
          if (check.exists) {
            if (check.inSameClass) {
              rowItem.status = 'duplicate';
              rowItem.reason = 'Already enrolled in this class (will update details)';
              duplicates++;
            } else {
              rowItem.status = 'conflict';
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
      alert('Error parsing uploaded file: ' + err.message);
      setUploadFile(null);
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleConfirmBulkImport = () => {
    if (!uploadPreviewRows || !selectedClassId) return;

    const validRowsToImport = uploadPreviewRows.filter(r => 
      r.status === 'valid' || 
      r.status === 'duplicate' || 
      (r.status === 'conflict' && moveExistingOnImport)
    );

    if (validRowsToImport.length === 0) {
      alert('No valid students to import. Please review the errors in the preview table.');
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

      const msg = `Successfully imported ${result.importedCount} new student(s)${result.updatedCount ? `, updated ${result.updatedCount}` : ''}${result.movedCount ? `, moved ${result.movedCount} from other classes` : ''}!`;
      if (showToast) showToast(msg);

      if (result.errors?.length > 0) {
        alert('Some rows were skipped during import:\n' + result.errors.slice(0, 5).join('\n'));
      }
    } catch (err) {
      alert('Failed to import students: ' + err.message);
    }
  };

  // -------------------------------------------------------------------------
  // GLOBAL ONE-CLICK SEMESTER PROMOTION ("PROMOTE ALL STUDENTS") HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenGlobalPromotionModal = () => {
    const cycle = filterYear || '2026-27';
    const preview = getGlobalPromotionPreview({
      academicCycle: cycle,
      finalSemester: globalPromotionFinalSem
    });
    setGlobalPromotionPreview(preview);
    setGlobalPromotionCycle(cycle);
    setGlobalPromotionOverride(false);
    setGlobalPromotionError(null);
    setGlobalPromotionStep('confirm');
    setGlobalPromotionResult(null);
    setShowGlobalPromotionModal(true);
  };

  const handleUpdateFinalSemConfig = (newFinalSem) => {
    const val = parseInt(newFinalSem, 10);
    setGlobalPromotionFinalSem(val);
    const preview = getGlobalPromotionPreview({
      academicCycle: globalPromotionCycle,
      finalSemester: val
    });
    setGlobalPromotionPreview(preview);
  };

  const handleExecuteGlobalPromotion = () => {
    if (isExecutingGlobalPromotion) return;
    setIsExecutingGlobalPromotion(true);
    setGlobalPromotionError(null);
    try {
      const res = promoteAllStudentsGlobally({
        academicCycle: globalPromotionCycle,
        finalSemester: globalPromotionFinalSem,
        overrideCycleCheck: globalPromotionOverride
      });
      refreshData();
      setGlobalPromotionResult(res);
      setGlobalPromotionStep('success');
      if (showToast) {
        showToast(`Global Promotion: Successfully promoted ${res.totalPromoted} students!`);
      }
    } catch (err) {
      setGlobalPromotionError(err.message);
    } finally {
      setIsExecutingGlobalPromotion(false);
    }
  };

  // -------------------------------------------------------------------------
  // SEMESTER PROMOTION ("SEMESTER UP") HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenPromotionModal = (sourceSem = '3rd Sem') => {
    setPromotionSourceSem(sourceSem);
    setPromotionDept(filterDept !== 'ALL' ? filterDept : 'ALL');
    setPromotionStep('preview');
    setPromotionResult(null);
    setShowPromotionModal(true);
  };

  const handleToggleSelectAllPromotion = () => {
    if (selectedPromotionIds.length === eligiblePromotionStudents.length) {
      setSelectedPromotionIds([]);
    } else {
      setSelectedPromotionIds(eligiblePromotionStudents.map(s => s.id));
    }
  };

  const handleTogglePromotionStudent = (id) => {
    setSelectedPromotionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirmExecutePromotion = () => {
    if (selectedPromotionIds.length === 0) {
      alert('Please select at least one student to promote.');
      return;
    }
    try {
      const res = promoteStudentsSemester({
        sourceSem: promotionSourceSem,
        department: promotionDept,
        selectedStudentIds: selectedPromotionIds,
        academicCycle: filterYear
      });
      refreshData();
      setPromotionResult(res);
      setPromotionStep('success');
      const actionText = res.isGraduation ? 'graduated' : `promoted to ${res.targetSem}`;
      if (showToast) showToast(`Successfully ${actionText} ${res.totalAffected} student(s)!`);
    } catch (err) {
      alert('Error promoting students: ' + err.message);
    }
  };

  // -------------------------------------------------------------------------
  // SINGLE STUDENT REGISTRATION (FRESHERS / ADMISSIONS) HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenGlobalStudentModal = () => {
    setGlobalStudentForm({
      name: '',
      enrollmentNo: '',
      department: filterDept !== 'ALL' ? filterDept : (departments[0]?.name || 'AI & Data Science'),
      semester: '1st Sem', // default to 1st Sem for freshers
      division: 'Div 1',
      batch: 'Batch A',
      email: '',
      rollNo: ''
    });
    setGlobalStudentError('');
    setShowGlobalStudentModal(true);
  };

  const handleGlobalStudentFormChange = (field, val) => {
    setGlobalStudentForm(prev => ({ ...prev, [field]: val }));
    setGlobalStudentError('');

    if (field === 'enrollmentNo' && val.trim().length >= 3) {
      const checkEnr = val.trim().toLowerCase();
      const existing = students.find(s => String(s.enrollmentNo).trim().toLowerCase() === checkEnr);
      if (existing) {
        setGlobalStudentError(`Enrollment Number "${val.trim()}" is already assigned to ${existing.name} (${existing.department || existing.dept} • ${existing.semester || existing.sem}).`);
      }
    }
  };

  const handleSaveGlobalStudentSubmit = (e) => {
    e.preventDefault();
    if (!globalStudentForm.name.trim() || !globalStudentForm.enrollmentNo.trim()) {
      setGlobalStudentError('Student Name and Enrollment Number are required.');
      return;
    }

    const checkEnr = globalStudentForm.enrollmentNo.trim().toLowerCase();
    const existing = students.find(s => String(s.enrollmentNo).trim().toLowerCase() === checkEnr);
    if (existing) {
      setGlobalStudentError(`Enrollment Number "${globalStudentForm.enrollmentNo.trim()}" is already registered.`);
      return;
    }

    try {
      saveStudent({
        name: globalStudentForm.name.trim(),
        enrollmentNo: globalStudentForm.enrollmentNo.trim(),
        department: globalStudentForm.department,
        dept: globalStudentForm.department,
        semester: globalStudentForm.semester,
        sem: globalStudentForm.semester,
        division: globalStudentForm.division,
        class: globalStudentForm.division.replace(/[^0-9]/g, '') || '1',
        batch: globalStudentForm.batch ? globalStudentForm.batch.trim() : 'Batch A',
        email: globalStudentForm.email.trim(),
        rollNo: globalStudentForm.rollNo.trim(),
        academicYear: filterYear
      });

      refreshData();
      setShowGlobalStudentModal(false);
      if (showToast) showToast(`Student "${globalStudentForm.name.trim()}" registered successfully!`);
    } catch (err) {
      setGlobalStudentError(err.message || 'Error saving student.');
    }
  };

  // -------------------------------------------------------------------------
  // BULK FRESHER REGISTRATION (EXCEL IMPORT) HANDLERS
  // -------------------------------------------------------------------------
  const handleBulkFresherFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFresherFile(file);
    setIsProcessingBulkFresher(true);
    setBulkFresherPreviewRows(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) throw new Error('Spreadsheet has no sheets.');

      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      if (!rawRows || rawRows.length < 2) throw new Error('Spreadsheet appears to be empty.');

      // Header row detection
      let headerIdx = 0;
      for (let i = 0; i < Math.min(5, rawRows.length); i++) {
        const rowStr = rawRows[i].join(' ').toLowerCase();
        if (rowStr.includes('enroll') || rowStr.includes('name') || rowStr.includes('student')) {
          headerIdx = i;
          break;
        }
      }

      const headers = rawRows[headerIdx].map(h => String(h || '').trim().toLowerCase());
      const enrCol = headers.findIndex(h => /enroll|enr|id/i.test(h));
      const nameCol = headers.findIndex(h => /name|student/i.test(h));
      const deptCol = headers.findIndex(h => /dept|department/i.test(h));
      const semCol = headers.findIndex(h => /sem|semester/i.test(h));
      const divCol = headers.findIndex(h => /div|division|class/i.test(h));
      const batchCol = headers.findIndex(h => /batch|group/i.test(h));
      const emailCol = headers.findIndex(h => /email|mail/i.test(h));
      const rollCol = headers.findIndex(h => /roll|sr/i.test(h));

      const existingEnrMap = new Map();
      students.forEach(s => existingEnrMap.set(String(s.enrollmentNo).trim().toLowerCase(), s));

      const fileEnrSet = new Set();
      const analyzed = [];
      let valid = 0, duplicates = 0, invalid = 0;

      for (let i = headerIdx + 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.every(c => !c)) continue;
        const rowNum = i + 1;

        const enr = enrCol !== -1 ? String(row[enrCol] || '').trim() : '';
        const name = nameCol !== -1 ? String(row[nameCol] || '').trim() : '';
        const dept = deptCol !== -1 ? String(row[deptCol] || '').trim() : 'AI & Data Science';
        const sem = semCol !== -1 ? normalizeSem(String(row[semCol] || '').trim()) : '1st Sem';
        const div = divCol !== -1 ? normalizeDiv(String(row[divCol] || '').trim()) : 'Div 1';
        const batch = batchCol !== -1 ? String(row[batchCol] || '').trim() || 'Batch A' : 'Batch A';
        const email = emailCol !== -1 ? String(row[emailCol] || '').trim() : '';
        const rollNo = rollCol !== -1 ? String(row[rollCol] || '').trim() : '';

        const item = { rowNum, enrollmentNo: enr, name, department: dept, semester: sem, division: div, batch, email, rollNo, status: 'valid', reason: '' };

        if (!enr || !name) {
          item.status = 'invalid';
          item.reason = 'Missing Enrollment Number or Student Name';
          invalid++;
        } else {
          const lowerEnr = enr.toLowerCase();
          if (fileEnrSet.has(lowerEnr)) {
            item.status = 'duplicate';
            item.reason = 'Duplicate enrollment within this spreadsheet';
            duplicates++;
          } else if (existingEnrMap.has(lowerEnr)) {
            const ext = existingEnrMap.get(lowerEnr);
            item.status = 'duplicate';
            item.reason = `Already registered (${ext.name} - ${ext.department} ${ext.semester})`;
            duplicates++;
          } else {
            fileEnrSet.add(lowerEnr);
            valid++;
          }
        }
        analyzed.push(item);
      }

      setBulkFresherPreviewRows(analyzed);
      setBulkFresherStats({ total: analyzed.length, valid, duplicates, invalid });
    } catch (err) {
      alert('Error reading spreadsheet: ' + err.message);
      setBulkFresherFile(null);
    } finally {
      setIsProcessingBulkFresher(false);
    }
  };

  const handleConfirmBulkFresherImport = () => {
    if (!bulkFresherPreviewRows || bulkFresherPreviewRows.length === 0) return;
    const validRows = bulkFresherPreviewRows.filter(r => r.status === 'valid');
    if (validRows.length === 0) {
      alert('No valid students to import. Please review the errors in the preview table.');
      return;
    }

    try {
      const res = bulkRegisterStudents(validRows, filterYear);
      refreshData();
      setShowBulkFresherModal(false);
      setBulkFresherFile(null);
      setBulkFresherPreviewRows(null);
      if (showToast) showToast(`Successfully registered ${res.importedCount} new student(s)!`);
    } catch (err) {
      alert('Failed to import students: ' + err.message);
    }
  };


  // -------------------------------------------------------------------------
  // RENDER: CLASS DETAILS VIEW (When a Class is Selected)
  // -------------------------------------------------------------------------
  if (selectedClass) {
    return (
      <div className="admin-subview">
        {/* Navigation Breadcrumb & Back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedClassId(null);
              setStudentSearch('');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Classes</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(e) => handleOpenEditClass(selectedClass, e)}
            >
              <Edit2 size={14} />
              <span>Edit Class Details</span>
            </button>
          </div>
        </div>

        {/* Class Overview Hero Banner */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedClass.isElective ? (
                  <span className="badge" style={{ backgroundColor: '#7c3aed', color: 'white', fontWeight: '800', fontSize: '12px', padding: '4px 10px' }}>
                    ⚡ Elective Class (No Department)
                  </span>
                ) : (
                  <span className="badge" style={{ backgroundColor: '#2563eb', color: 'white', fontWeight: '800', fontSize: '12px', padding: '4px 10px' }}>
                    {selectedClass.departmentName}
                  </span>
                )}
                <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#1e293b', fontWeight: '800' }}>
                  {selectedClass.academicYear}
                </span>
              </div>

              <div style={{ marginTop: '12px' }}>
                {selectedClass.isElective ? (
                  <h1 style={{ 
                    fontSize: '24px', 
                    fontWeight: '800', 
                    color: '#6d28d9', 
                    margin: 0, 
                    display: 'inline-block', 
                    backgroundColor: '#f5f3ff', 
                    padding: '6px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd6fe' 
                  }}>
                    {selectedClass.subjectName || selectedClass.name || 'Elective Class'}
                  </h1>
                ) : (
                  <h1 style={{ 
                    fontSize: '24px', 
                    fontWeight: '800', 
                    color: '#1e40af', 
                    margin: 0, 
                    display: 'inline-block', 
                    backgroundColor: '#eff6ff', 
                    padding: '6px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid #bfdbfe' 
                  }}>
                    {selectedClass.departmentName}
                  </h1>
                )}
                <div style={{ fontSize: '15px', color: '#475569', fontWeight: '500', marginTop: '6px' }}>
                  {selectedClass.semester} • {selectedClass.division || selectedClass.name}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                {selectedClass.isElective ? (
                  <>
                    <span><strong>Subject:</strong> {selectedClass.subjectName || 'Elective Subject'}</span>
                    <span>•</span>
                    <span><strong>Assigned Faculty:</strong> {selectedClass.facultyName || 'Unassigned'}</span>
                    <span>•</span>
                    <span><strong>Academic Year:</strong> {selectedClass.academicYear}</span>
                    <span>•</span>
                    <span><strong>Enrolled:</strong> <span style={{ color: '#059669', fontWeight: '800' }}>{studentsInSelectedClass.length} Students</span></span>
                  </>
                ) : (
                  <>
                    <span><strong>Department:</strong> {selectedClass.departmentName}</span>
                    <span>•</span>
                    <span><strong>Academic Year:</strong> {selectedClass.academicYear}</span>
                    <span>•</span>
                    <span><strong>Enrolled:</strong> <span style={{ color: '#059669', fontWeight: '800' }}>{studentsInSelectedClass.length} Students</span></span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {selectedClass.isElective ? (
                <>
                  <button
                    type="button"
                    id="btn-open-elective-roster-upload"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setElectiveRosterFile(null);
                      setElectiveRosterStats(null);
                      setElectiveRosterError('');
                      setShowElectiveRosterModal(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                  >
                    <UploadCloud size={16} />
                    <span>Upload / Replace Student List (.xlsx, .xls)</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleExportClassStudents}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={16} />
                    <span>Export Roster</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => handleOpenEditClass(selectedClass, e)}
                  >
                    <Edit2 size={14} />
                    <span>Edit Class</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => handleDeleteClass(selectedClass, e)}
                    style={{ color: '#e11d48' }}
                  >
                    <Trash2 size={14} />
                    <span>Delete Class</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleOpenAddStudent}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} />
                    <span>Add Student</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setUploadFile(null);
                      setUploadPreviewRows(null);
                      setShowUploadModal(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
                  >
                    <UploadCloud size={16} />
                    <span>Bulk Upload (.xlsx, .csv)</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleExportClassStudents}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={16} />
                    <span>Export Roster</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Student List Section */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a' }}>
                Students ({filteredClassStudents.length})
              </h3>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                <strong style={{
                  color: selectedClass.isElective ? '#6d28d9' : '#1e40af',
                  backgroundColor: selectedClass.isElective ? '#f5f3ff' : '#eff6ff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${selectedClass.isElective ? '#ddd6fe' : '#bfdbfe'}`,
                  fontWeight: '800',
                  marginRight: '6px'
                }}>
                  {selectedClass.isElective ? (selectedClass.subjectName || 'Elective Class') : selectedClass.departmentName}
                </strong>
                <span style={{ fontWeight: '500' }}>
                  • {selectedClass.semester} • {selectedClass.division || selectedClass.name} ({selectedClass.academicYear})
                </span>
              </span>
            </div>

            {/* Quick Actions & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="input-with-icon" style={{ minWidth: '220px' }}>
                <Search className="input-icon" size={15} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Enrollment No, Name..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{ height: '36px', fontSize: '13px' }}
                />
              </div>

              {selectedClass.isElective ? (
                <>
                  <button
                    type="button"
                    id="btn-class-detail-upload-roster"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setElectiveRosterFile(null);
                      setElectiveRosterStats(null);
                      setElectiveRosterError('');
                      setShowElectiveRosterModal(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', height: '36px', backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                  >
                    <UploadCloud size={15} />
                    <span>Upload Student List (.xlsx, .xls)</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleExportClassStudents}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', height: '36px' }}
                    title="Export Roster to Excel"
                  >
                    <Download size={14} />
                    <span>Export Roster</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleOpenAddStudent}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', height: '36px' }}
                  >
                    <Plus size={15} />
                    <span>+ Add Student</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setUploadFile(null);
                      setUploadPreviewRows(null);
                      setShowUploadModal(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', height: '36px', color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
                  >
                    <UploadCloud size={15} />
                    <span>Upload Student List</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleExportClassStudents}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', height: '36px' }}
                    title="Export Roster to Excel"
                  >
                    <Download size={14} />
                    <span>Export</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Student Table */}
          {filteredClassStudents.length > 0 ? (
            <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', width: '70px', fontWeight: '800', color: '#475569' }}>#</th>
                    <th style={{ padding: '12px 16px', width: '160px', fontWeight: '800', color: '#475569' }}>Enrollment No.</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Student Name</th>
                    {selectedClass.isElective ? (
                      <>
                        <th style={{ padding: '12px 16px', width: '180px', fontWeight: '800', color: '#475569' }}>Regular Department</th>
                        <th style={{ padding: '12px 16px', width: '140px', fontWeight: '800', color: '#475569' }}>Regular Division</th>
                      </>
                    ) : (
                      <>
                        <th style={{ padding: '12px 16px', width: '120px', fontWeight: '800', color: '#475569' }}>Batch</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Email Address</th>
                      </>
                    )}
                    <th style={{ padding: '12px 16px', width: '160px', textAlign: 'right', fontWeight: '800', color: '#475569' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassStudents.map((st, idx) => (
                    <tr 
                      key={st.id || idx}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: idx % 2 === 0 ? 'white' : '#fafbfc'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '3px 8px', 
                          backgroundColor: '#f1f5f9', 
                          borderRadius: '6px',
                          textAlign: 'center',
                          minWidth: '28px'
                        }}>
                          {st.rollNo || (idx + 1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>
                        {st.enrollmentNo}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                        {st.name}
                      </td>
                      {selectedClass.isElective ? (
                        <>
                          <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>
                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '700', fontSize: '11px' }}>
                              {st.department || st.dept || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '600' }}>
                            <span className="badge" style={{ backgroundColor: '#f8fafc', color: '#475569', fontWeight: '700', fontSize: '11px' }}>
                              {st.division || st.class || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleRemoveStudentFromElectiveClass(st)}
                              title="Remove Student from this elective class"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', fontSize: '12.5px', fontWeight: '700', color: '#e11d48', borderColor: '#fecdd3', backgroundColor: '#fff1f2' }}
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              padding: '3px 9px', 
                              backgroundColor: st.batch?.includes('B') ? '#fef3c7' : st.batch?.includes('C') ? '#f3e8ff' : '#eff6ff', 
                              color: st.batch?.includes('B') ? '#b45309' : st.batch?.includes('C') ? '#7e22ce' : '#1d4ed8', 
                              borderRadius: '6px', 
                              fontWeight: '700', 
                              fontSize: '12px', 
                              border: `1px solid ${st.batch?.includes('B') ? '#fde68a' : st.batch?.includes('C') ? '#e9d5ff' : '#bfdbfe'}` 
                            }}>
                              {st.batch || 'Batch A'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748b' }}>
                            {st.email || '—'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEditStudent(st)}
                                title="Edit Student"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', fontSize: '12.5px', fontWeight: '700' }}
                              >
                                <Edit2 size={13} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleInitiateRemoveStudent(st)}
                                title="Remove Student from this class"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', fontSize: '12.5px', fontWeight: '700', color: '#e11d48', borderColor: '#fecdd3', backgroundColor: '#fff1f2' }}
                              >
                                <Trash2 size={13} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', border: '2px dashed #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
              <Users size={36} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {studentSearch ? 'No matching students found' : (selectedClass.isElective ? 'No students enrolled in this elective class yet' : 'No students enrolled in this class yet')}
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '6px auto 18px auto' }}>
                {studentSearch 
                  ? 'Try adjusting your search criteria.' 
                  : (selectedClass.isElective ? 'Upload an Excel spreadsheet (.xlsx, .xls) to enroll students in this elective class.' : 'Add students individually or import a student roster spreadsheet (.xlsx, .csv).')}
              </p>
              {!studentSearch && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {selectedClass.isElective ? (
                    <button 
                      type="button" 
                      className="btn btn-primary btn-sm" 
                      onClick={() => {
                        setElectiveRosterFile(null);
                        setElectiveRosterStats(null);
                        setElectiveRosterError('');
                        setShowElectiveRosterModal(true);
                      }}
                      style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                    >
                      <UploadCloud size={15} /> Upload Student List (.xlsx, .xls)
                    </button>
                  ) : (
                    <>
                      <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAddStudent}>
                        <Plus size={15} /> Add First Student
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => {
                          setUploadFile(null);
                          setUploadPreviewRows(null);
                          setShowUploadModal(true);
                        }}
                      >
                        <UploadCloud size={15} /> Upload Excel / CSV
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RENDER MODALS (Shared across views) */}
        {renderModals()}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: ALL CLASSES VIEW (List / Grid of Classes)
  // -------------------------------------------------------------------------
  return (
    <div className="admin-subview">
      {/* Header & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
              Student Management & Academic Classes
            </h1>
            <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800', fontSize: '12px' }}>
              Academic Year {filterYear}
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            Manage student admissions, batch allocation, class cohorts, and semester promotions.
          </p>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* GLOBAL ONE-CLICK SEMESTER PROMOTION BUTTON */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenGlobalPromotionModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: '8px',
              padding: '9px 16px',
              fontWeight: '800',
              fontSize: '13px',
              border: 'none',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.35)'
            }}
            title="Automatically promote all eligible students across every semester simultaneously in a single operation"
          >
            <Sparkles size={16} />
            <span>Promote All Students</span>
          </button>

          {/* REGISTER SINGLE STUDENT (FRESHER / LATERAL) */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleOpenGlobalStudentModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '9px 14px',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            <UserPlus size={15} />
            <span>Register Student</span>
          </button>

          {/* BULK STUDENT IMPORT */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setBulkFresherFile(null);
              setBulkFresherPreviewRows(null);
              setBulkFresherStats({ total: 0, valid: 0, duplicates: 0, invalid: 0 });
              setShowBulkFresherModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'white',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 14px',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            <UploadCloud size={15} />
            <span>Bulk Student Upload</span>
          </button>

          {/* DOWNLOAD TEMPLATE */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              downloadStudentRegistrationTemplate();
              if (showToast) showToast('Student registration template downloaded!');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'white',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 12px',
              fontWeight: '700',
              fontSize: '13px'
            }}
            title="Download blank Excel student registration template"
          >
            <Download size={14} />
            <span>Template</span>
          </button>

          {/* CREATE CLASS */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleOpenCreateClass}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              padding: '9px 12px',
              fontSize: '13px'
            }}
          >
            <Plus size={15} />
            <span>Create Class</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Total Classes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {classes.length}
          </div>
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>Active Across Departments</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Total Students</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {students.length}
          </div>
          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>Enrolled & Tracked</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Academic Year</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {filterYear}
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Selected Session</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Filters Group */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: 1 }}>
            {/* Academic Year Filter */}
            <div style={{ minWidth: '130px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Academic Year
              </label>
              <select
                className="form-control"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                style={{ fontSize: '13px', fontWeight: '700' }}
              >
                <option value="ALL">All Years</option>
                {ACADEMIC_YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div style={{ minWidth: '180px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Department
              </label>
              <select
                className="form-control"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                style={{ fontSize: '13px', fontWeight: '700' }}
              >
                <option value="ALL">All Departments</option>
                <option value="ELECTIVE">⚡ Elective Classes (No Department)</option>
                {departments.map(d => (
                  <option key={d.id || d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div style={{ minWidth: '130px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Semester
              </label>
              <select
                className="form-control"
                value={filterSem}
                onChange={(e) => setFilterSem(e.target.value)}
                style={{ fontSize: '13px', fontWeight: '700' }}
              >
                <option value="ALL">All Semesters</option>
                {SEMESTERS.map(s => (
                  <option key={s.id} value={s.id}>{s.id}</option>
                ))}
              </select>
            </div>

            {/* Division Filter */}
            <div style={{ minWidth: '110px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Division
              </label>
              <select
                className="form-control"
                value={filterDiv}
                onChange={(e) => setFilterDiv(e.target.value)}
                style={{ fontSize: '13px', fontWeight: '700' }}
              >
                <option value="ALL">All Divs</option>
                <option value="Div 1">Div 1</option>
                <option value="Div 2">Div 2</option>
                <option value="Div 3">Div 3</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div style={{ minWidth: '220px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              Search
            </label>
            <div className="input-with-icon">
              <Search className="input-icon" size={15} />
              <input
                type="text"
                className="form-control"
                placeholder="Search classes..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
          {filteredClasses.map((cls) => {
            const studentCount = getStudentsByClassId(cls.id).length;
            const deptObj = departments.find(d => d.id === cls.departmentId || d.name === cls.departmentName);

            return (
              <div 
                key={cls.id}
                className="card"
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setStudentSearch('');
                }}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  {/* Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="badge" style={{ backgroundColor: cls.isElective ? '#f5f3ff' : '#eff6ff', color: cls.isElective ? '#7c3aed' : '#1e40af', fontWeight: '800', fontSize: '11px', padding: '4px 8px' }}>
                      {cls.isElective ? 'ELECTIVE' : (deptObj?.code || 'DEPT')}
                    </span>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '11px' }}>
                      {cls.academicYear}
                    </span>
                  </div>

                  {/* Department Name - Bold & Highlighted */}
                  <div style={{ marginBottom: '8px' }}>
                    {cls.isElective ? (
                      <h3 style={{ 
                        fontSize: '17px', 
                        fontWeight: '800', 
                        color: '#6d28d9', 
                        margin: 0, 
                        display: 'inline-block', 
                        backgroundColor: '#f5f3ff', 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd6fe' 
                      }}>
                        {cls.subjectName || 'Elective Class'}
                      </h3>
                    ) : (
                      <h3 style={{ 
                        fontSize: '17px', 
                        fontWeight: '800', 
                        color: '#1e40af', 
                        margin: 0, 
                        display: 'inline-block', 
                        backgroundColor: '#eff6ff', 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        border: '1px solid #bfdbfe' 
                      }}>
                        {cls.departmentName}
                      </h3>
                    )}
                  </div>

                  {/* Semester and Division - Regular subtext */}
                  <div style={{ fontSize: '13.5px', color: '#475569', fontWeight: '500', marginBottom: '16px' }}>
                    {cls.isElective 
                      ? `${cls.semester} • ${cls.division || cls.name}${cls.facultyName ? ` • Faculty: ${cls.facultyName}` : ''}`
                      : `${cls.semester} • ${cls.division}`}
                  </div>

                  {/* Student Count Badge */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    backgroundColor: studentCount > 0 ? '#ecfdf5' : '#f8fafc',
                    color: studentCount > 0 ? '#065f46' : '#64748b',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}>
                    <Users size={16} />
                    <span>{studentCount} Students Enrolled</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setStudentSearch('');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
                  >
                    <span>View Students</span>
                    <ChevronRight size={14} />
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleOpenEditClass(cls, e)}
                      title="Edit Class Details"
                      style={{ padding: '6px 8px' }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleDeleteClass(cls, e)}
                      title="Delete Class"
                      style={{ padding: '6px 8px', color: '#e11d48' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <GraduationCap size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            No classes match your filter
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '6px auto 18px auto' }}>
            Try clearing filters or create a new class for this academic year.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenCreateClass}>
            <Plus size={15} /> Create Class Now
          </button>
        </div>
      )}
      {/* RENDER MODALS */}
      {renderModals()}
    </div>
  );

  // -------------------------------------------------------------------------
  // HELPER: RENDER ALL MODALS
  // -------------------------------------------------------------------------
  function renderModals() {
    return (
      <>
        {/* ===================================================================
            MODAL 1: CREATE / EDIT CLASS (Supports Regular & Elective Classes)
            =================================================================== */}
        {showClassModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: classForm.isElective ? '560px' : '480px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={20} style={{ color: classForm.isElective ? '#7c3aed' : '#2563eb' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    {editingClass 
                      ? (classForm.isElective ? 'Edit Elective Class' : 'Edit Class Details') 
                      : (classForm.isElective ? 'Create New Elective Class' : 'Create New Class')}
                  </h3>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowClassModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveClassSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {classModalError && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecdd3', color: '#991b1b', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} />
                      <span>{classModalError}</span>
                    </div>
                  )}

                  {/* Class Type Selector: Regular vs Elective Class */}
                  {!editingClass && (
                    <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                      <button
                        type="button"
                        id="btn-select-regular-class-type"
                        onClick={() => setClassForm(prev => ({ ...prev, isElective: false }))}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          backgroundColor: !classForm.isElective ? '#2563eb' : 'transparent',
                          color: !classForm.isElective ? '#ffffff' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Regular Class
                      </button>
                      <button
                        type="button"
                        id="btn-select-elective-class-type"
                        onClick={() => setClassForm(prev => ({ ...prev, isElective: true }))}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          backgroundColor: classForm.isElective ? '#7c3aed' : 'transparent',
                          color: classForm.isElective ? '#ffffff' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        ⚡ Elective Class (No Department)
                      </button>
                    </div>
                  )}

                  {/* Department Field: Required for Regular, Omitted for Elective */}
                  {!classForm.isElective ? (
                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Department *</label>
                      <select
                        className="form-control"
                        value={classForm.departmentName}
                        onChange={(e) => setClassForm(prev => ({ ...prev, departmentName: e.target.value }))}
                        required
                      >
                        {departments.map(d => (
                          <option key={d.id || d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 14px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', fontSize: '12.5px', color: '#6d28d9' }}>
                      ⚡ <strong>Elective Class:</strong> No department required. Students from any department in this semester can enroll.
                    </div>
                  )}

                  {/* Elective-specific fields: Subject & Faculty */}
                  {classForm.isElective && (
                    <>
                      <div className="form-group">
                        <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Elective Subject *</label>
                        <input
                          id="input-elective-subject"
                          type="text"
                          className="form-control"
                          placeholder="e.g. Cyber Security, Cloud Computing, IoT"
                          value={classForm.subjectName || classForm.subjectId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setClassForm(prev => ({ ...prev, subjectId: val, subjectName: val }));
                          }}
                          required
                          list="elective-subject-options"
                        />
                        <datalist id="elective-subject-options">
                          {allSubjects.map(s => (
                            <option key={s.id} value={s.name}>{s.code ? `(${s.code}) ` : ''}{s.name}</option>
                          ))}
                        </datalist>
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Assigned Faculty *</label>
                        <select
                          id="select-elective-faculty"
                          className="form-control"
                          value={classForm.facultyId}
                          onChange={(e) => {
                            const fId = e.target.value;
                            const fac = allFaculties.find(f => f.id === fId);
                            setClassForm(prev => ({ 
                              ...prev, 
                              facultyId: fId, 
                              facultyName: fac ? fac.name : '' 
                            }));
                          }}
                          required
                        >
                          <option value="">-- Select Faculty Member --</option>
                          {allFaculties.map(f => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.dept || 'ADIT'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Semester and Division/Identifier */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Semester *</label>
                      <select
                        id="select-class-semester"
                        className="form-control"
                        value={classForm.semester}
                        onChange={(e) => setClassForm(prev => ({ ...prev, semester: e.target.value }))}
                        required
                      >
                        {SEMESTERS.map(s => (
                          <option key={s.id} value={s.id}>{s.id}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>
                        {classForm.isElective ? 'Class Identifier / Section *' : 'Division *'}
                      </label>
                      {classForm.isElective ? (
                        <input
                          id="input-elective-class-division"
                          type="text"
                          className="form-control"
                          placeholder="e.g. Elective Class A"
                          value={classForm.division}
                          onChange={(e) => setClassForm(prev => ({ ...prev, division: e.target.value }))}
                          required
                        />
                      ) : (
                        <select
                          className="form-control"
                          value={classForm.division}
                          onChange={(e) => setClassForm(prev => ({ ...prev, division: e.target.value }))}
                          required
                        >
                          <option value="Div 1">Division 1 (Div 1)</option>
                          <option value="Div 2">Division 2 (Div 2)</option>
                          <option value="Div 3">Division 3 (Div 3)</option>
                          <option value="Div 4">Division 4 (Div 4)</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Academic Year */}
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Academic Year *</label>
                    <select
                      className="form-control"
                      value={classForm.academicYear}
                      onChange={(e) => setClassForm(prev => ({ ...prev, academicYear: e.target.value }))}
                      required
                    >
                      {ACADEMIC_YEARS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  {/* Elective Excel Student List Upload & Preview */}
                  {classForm.isElective && (
                    <div className="form-group" style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', backgroundColor: '#f8fafc' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <FileSpreadsheet size={16} style={{ color: '#7c3aed' }} />
                        <span>Student List Excel Upload (.xlsx, .xls)</span>
                      </label>
                      <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
                        Upload an Excel file containing enrollment numbers of students enrolled in this elective class.
                      </span>

                      <input
                        id="input-elective-class-excel"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleClassExcelFileChange}
                        style={{ fontSize: '12px' }}
                      />

                      {classForm.excelStats && (
                        <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', backgroundColor: classForm.excelStats.validCount > 0 ? '#f0fdf4' : '#fff1f2', border: `1px solid ${classForm.excelStats.validCount > 0 ? '#bbf7d0' : '#fecdd3'}` }}>
                          <div style={{ fontSize: '12.5px', fontWeight: '700', color: classForm.excelStats.validCount > 0 ? '#166534' : '#991b1b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <span>Matched: {classForm.excelStats.validCount} Students</span>
                            <span>Total Rows: {classForm.excelStats.totalRows}</span>
                            {classForm.excelStats.failedCount > 0 && (
                              <span style={{ color: '#dc2626' }}>Failed: {classForm.excelStats.failedCount}</span>
                            )}
                          </div>

                          {classForm.excelStats.failedRows.length > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#dc2626', maxHeight: '80px', overflowY: 'auto' }}>
                              <strong>Validation Issues:</strong>
                              {classForm.excelStats.failedRows.slice(0, 5).map((f, i) => (
                                <div key={i}>Row {f.rowNumber}: {f.reason} ({f.enrollment || 'empty'})</div>
                              ))}
                              {classForm.excelStats.failedRows.length > 5 && (
                                <div>...and {classForm.excelStats.failedRows.length - 5} more</div>
                              )}
                            </div>
                          )}

                          {classForm.excelStats.preview.length > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#475569' }}>
                              <strong>Preview:</strong> {classForm.excelStats.preview.map(s => s.enrollmentNo).join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowClassModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    id="btn-submit-save-class"
                    className="btn btn-primary"
                    style={classForm.isElective ? { backgroundColor: '#7c3aed', borderColor: '#7c3aed' } : {}}
                  >
                    {editingClass ? 'Save Changes' : (classForm.isElective ? 'Create Elective Class' : 'Create Class')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 2: MANUAL ADD / EDIT STUDENT
            =================================================================== */}
        {showStudentModal && selectedClass && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '480px' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {editingStudent ? 'Edit Student' : 'Add Student'}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    <strong style={{ color: selectedClass.isElective ? '#6d28d9' : '#1e40af', backgroundColor: selectedClass.isElective ? '#f5f3ff' : '#eff6ff', padding: '1px 6px', borderRadius: '4px', border: `1px solid ${selectedClass.isElective ? '#ddd6fe' : '#bfdbfe'}`, fontWeight: '800' }}>
                      {selectedClass.isElective ? (selectedClass.subjectName || 'Elective') : selectedClass.departmentName}
                    </strong>
                    {' '}• {selectedClass.semester} • {selectedClass.division || selectedClass.name}
                  </span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowStudentModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveStudentSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {studentModalError && (
                    <div style={{ padding: '10px 14px', backgroundColor: otherClassConflict ? '#eff6ff' : '#fef2f2', border: `1px solid ${otherClassConflict ? '#bfdbfe' : '#fecdd3'}`, color: otherClassConflict ? '#1e40af' : '#991b1b', borderRadius: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>{studentModalError}</strong>
                          {otherClassConflict && (
                            <div style={{ marginTop: '8px' }}>
                              <span>This student already exists in {otherClassConflict.currentClassName}. Would you like to move this student to this class instead of creating a duplicate?</span>
                              <div style={{ marginTop: '8px' }}>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={handleMoveConflictStudent}
                                >
                                  Move Student to this Class
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Enrollment Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 24AD001"
                      value={studentForm.enrollmentNo}
                      onChange={(e) => handleStudentFormChange('enrollmentNo', e.target.value)}
                      required
                      style={{ fontFamily: 'monospace', fontWeight: '700' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Student Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Student Name"
                      value={studentForm.name}
                      onChange={(e) => handleStudentFormChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Roll Number (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 1"
                        value={studentForm.rollNo}
                        onChange={(e) => handleStudentFormChange('rollNo', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Assigned Batch *</label>
                      <select
                        className="form-control"
                        value={studentForm.batch || 'Batch A'}
                        onChange={(e) => handleStudentFormChange('batch', e.target.value)}
                        style={{ fontWeight: '700' }}
                      >
                        <option value="Batch A">Batch A</option>
                        <option value="Batch B">Batch B</option>
                        <option value="Batch C">Batch C</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Email Address (Optional)</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. student@adit.ac.in"
                      value={studentForm.email}
                      onChange={(e) => handleStudentFormChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={!!otherClassConflict}>
                    {editingStudent ? 'Save Changes' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 2b: REMOVE STUDENT CONFIRMATION MODAL
            =================================================================== */}
        {showRemoveModal && studentToRemove && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '440px' }}>
              <div className="modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontSize: '18px', fontWeight: '800' }}>
                  <Trash2 size={20} />
                  Remove Student?
                </h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowRemoveModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
                  Are you sure you want to remove:
                </p>

                <div style={{
                  padding: '14px 16px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fecdd3'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    {studentToRemove.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                    Enrollment No: <strong>{studentToRemove.enrollmentNo}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  The student will be removed from this class roster. Historical attendance records will remain safe.
                </p>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRemoveModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleConfirmRemoveStudent}
                  style={{ backgroundColor: '#e11d48', borderColor: '#e11d48', fontWeight: '700' }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 3: MOVE STUDENT TO ANOTHER CLASS
            =================================================================== */}
        {showMoveModal && studentToMove && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '460px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowRightLeft size={18} style={{ color: '#2563eb' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    Move Student to Another Class
                  </h3>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowMoveModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <div><strong>Student:</strong> {studentToMove.name}</div>
                  <div><strong>Enrollment:</strong> <span style={{ fontFamily: 'monospace' }}>{studentToMove.enrollmentNo}</span></div>
                  <div><strong>Current Class:</strong> <strong style={{ color: selectedClass?.isElective ? '#6d28d9' : '#1e40af', backgroundColor: selectedClass?.isElective ? '#f5f3ff' : '#eff6ff', padding: '1px 6px', borderRadius: '4px', border: `1px solid ${selectedClass?.isElective ? '#ddd6fe' : '#bfdbfe'}`, fontWeight: '800' }}>{selectedClass?.isElective ? (selectedClass?.subjectName || 'Elective') : selectedClass?.departmentName}</strong> • {selectedClass?.semester} • {selectedClass?.division || selectedClass?.name} ({selectedClass?.academicYear})</div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Select Destination Class *</label>
                  <select
                    className="form-control"
                    value={targetClassIdForMove}
                    onChange={(e) => setTargetClassIdForMove(e.target.value)}
                    required
                  >
                    {classes.filter(c => c.id !== selectedClassId).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.departmentName} • {c.semester} • {c.division} ({c.academicYear})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMoveModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmMove}>
                  Move Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 4: BULK STUDENT UPLOAD WITH PREVIEW
            =================================================================== */}
        {showUploadModal && selectedClass && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    Bulk Student Upload (Excel / CSV)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Target Class: <strong style={{ color: selectedClass.isElective ? '#6d28d9' : '#1e40af', backgroundColor: selectedClass.isElective ? '#f5f3ff' : '#eff6ff', padding: '2px 8px', borderRadius: '6px', border: `1px solid ${selectedClass.isElective ? '#ddd6fe' : '#bfdbfe'}`, fontWeight: '800' }}>
                      {selectedClass.isElective ? (selectedClass.subjectName || 'Elective') : selectedClass.departmentName}
                    </strong>
                    {' '}• {selectedClass.semester} • {selectedClass.division || selectedClass.name} ({selectedClass.academicYear})
                  </span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowUploadModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Step 1: Upload & Download Template */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    <strong>Expected Columns:</strong> <code>Roll No</code>, <code>Enrollment No</code>, <code>Student Name</code>, <code>Email</code>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleDownloadSampleTemplate}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>Download Excel Template</span>
                  </button>
                </div>

                {/* File input box */}
                <div style={{ 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  textAlign: 'center',
                  backgroundColor: uploadFile ? '#f0fdf4' : 'white'
                }}>
                  <input
                    type="file"
                    id="bulkStudentFileInput"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleUploadFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="bulkStudentFileInput" style={{ cursor: 'pointer', display: 'block' }}>
                    <UploadCloud size={36} style={{ color: uploadFile ? '#059669' : '#2563eb', margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                      {uploadFile ? uploadFile.name : 'Choose Excel (.xlsx, .xls) or CSV file'}
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB • Click to change file` : 'Drag and drop file here, or click to browse'}
                    </span>
                  </label>
                </div>

                {/* Step 2: Upload Preview Table */}
                {uploadPreviewRows && (
                  <div>
                    {/* Stats Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>TOTAL ROWS</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{uploadStats.total}</div>
                      </div>
                      <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857' }}>READY / VALID</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>{uploadStats.valid}</div>
                      </div>
                      <div style={{ backgroundColor: '#fffbeb', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309' }}>DUPLICATES</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#d97706' }}>{uploadStats.duplicates}</div>
                      </div>
                      <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#1d4ed8' }}>OTHER CLASS</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>{uploadStats.conflicts}</div>
                      </div>
                      <div style={{ backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#b91c1c' }}>INVALID</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>{uploadStats.invalid}</div>
                      </div>
                    </div>

                    {/* Conflict Handler Checkbox */}
                    {uploadStats.conflicts > 0 && (
                      <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          id="moveConflictCheckbox"
                          checked={moveExistingOnImport}
                          onChange={(e) => setMoveExistingOnImport(e.target.checked)}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <label htmlFor="moveConflictCheckbox" style={{ fontSize: '13px', color: '#1e40af', fontWeight: '700', cursor: 'pointer' }}>
                          Move {uploadStats.conflicts} student(s) currently enrolled in other classes to this class automatically
                        </label>
                      </div>
                    )}

                    {/* Preview Table */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '8px 12px', width: '50px' }}>#</th>
                            <th style={{ padding: '8px 12px', width: '80px' }}>Status</th>
                            <th style={{ padding: '8px 12px', width: '60px' }}>Roll</th>
                            <th style={{ padding: '8px 12px', width: '120px' }}>Enrollment</th>
                            <th style={{ padding: '8px 12px' }}>Name</th>
                            <th style={{ padding: '8px 12px', width: '80px' }}>Batch</th>
                            <th style={{ padding: '8px 12px' }}>Email</th>
                            <th style={{ padding: '8px 12px' }}>Validation Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadPreviewRows.map((row, idx) => {
                            const badgeColors = {
                              valid: { bg: '#ecfdf5', color: '#047857' },
                              duplicate: { bg: '#fffbeb', color: '#b45309' },
                              conflict: { bg: '#eff6ff', color: '#1d4ed8' },
                              invalid: { bg: '#fef2f2', color: '#b91c1c' }
                            };
                            const b = badgeColors[row.status] || badgeColors.valid;

                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '8px 12px', color: '#64748b' }}>{row.rowNumber}</td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    backgroundColor: b.bg, 
                                    color: b.color, 
                                    fontWeight: '800', 
                                    fontSize: '10.5px',
                                    textTransform: 'uppercase'
                                  }}>
                                    {row.status}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: '700' }}>{row.rollNo}</td>
                                <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: '700' }}>{row.enrollmentNo}</td>
                                <td style={{ padding: '8px 12px', fontWeight: '600' }}>{row.name}</td>
                                <td style={{ padding: '8px 12px', fontWeight: '700', color: '#2563eb' }}>{row.batch || 'Batch A'}</td>
                                <td style={{ padding: '8px 12px', color: '#64748b' }}>{row.email || '—'}</td>
                                <td style={{ padding: '8px 12px', color: row.status === 'invalid' ? '#b91c1c' : '#64748b' }}>
                                  {row.reason}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmBulkImport}
                  disabled={!uploadPreviewRows || (uploadStats.valid === 0 && uploadStats.duplicates === 0 && (!moveExistingOnImport || uploadStats.conflicts === 0))}
                >
                  Import Students ({uploadStats.valid + uploadStats.duplicates + (moveExistingOnImport ? uploadStats.conflicts : 0)} eligible)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 6: GLOBAL ONE-CLICK SEMESTER PROMOTION ("PROMOTE ALL STUDENTS")
            =================================================================== */}
        {showGlobalPromotionModal && globalPromotionPreview && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                      Global Semester Promotion
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Promote all eligible students to the next semester simultaneously in a single transaction.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowGlobalPromotionModal(false)}
                  disabled={isExecutingGlobalPromotion}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {globalPromotionStep === 'confirm' ? (
                  <>
                    {/* KPI Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div style={{ padding: '12px 14px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>
                          Eligible for Promotion
                        </span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#065f46', marginTop: '2px' }}>
                          {globalPromotionPreview.totalEligible}
                        </div>
                        <span style={{ fontSize: '11px', color: '#059669' }}>
                          Semesters 1 through {globalPromotionFinalSem - 1}
                        </span>
                      </div>

                      <div style={{ padding: '12px 14px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#a16207', textTransform: 'uppercase' }}>
                          Final-Semester Excluded
                        </span>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#854d0e', marginTop: '2px' }}>
                          {globalPromotionPreview.finalSemesterExcludedCount}
                        </div>
                        <span style={{ fontSize: '11px', color: '#a16207' }}>
                          Preserved for graduation
                        </span>
                      </div>

                      <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                          Academic Transition
                        </span>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                          {globalPromotionCycle}
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          Institutional Cycle
                        </span>
                      </div>
                    </div>

                    {/* Semester-by-Semester Transition Breakdown */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                          Simultaneous Semester Progression Schedule
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                          Strictly +1 Increment
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', backgroundColor: 'white' }}>
                        {globalPromotionPreview.breakdown.map((b) => (
                          <div
                            key={b.semNum}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              backgroundColor: b.count > 0 ? '#f8fafc' : '#ffffff',
                              border: '1px solid #f1f5f9',
                              borderRadius: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '12px' }}>
                                {b.sourceSem}
                              </span>
                              <ArrowRight size={14} style={{ color: '#94a3b8' }} />
                              <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#047857', fontWeight: '800', fontSize: '12px' }}>
                                {b.targetSem}
                              </span>
                            </div>
                            <div style={{ fontWeight: '800', fontSize: '12.5px', color: b.count > 0 ? '#0f172a' : '#94a3b8' }}>
                              {b.count} {b.count === 1 ? 'student' : 'students'}
                            </div>
                          </div>
                        ))}

                        {/* Final-Semester Excluded row */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: '#fefce8',
                          border: '1px solid #fef08a',
                          borderRadius: '6px',
                          marginTop: '2px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontWeight: '800', fontSize: '12px' }}>
                              Semester {globalPromotionFinalSem} (Final Semester)
                            </span>
                            <span style={{ fontSize: '11px', color: '#92400e', fontWeight: '600' }}>
                              Excluded (Kept for graduation / completion processing)
                            </span>
                          </div>
                          <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#b45309' }}>
                            {globalPromotionPreview.finalSemesterExcludedCount} excluded
                          </div>
                        </div>

                        {globalPromotionPreview.unrecognizedCount > 0 && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fca5a5',
                            borderRadius: '6px'
                          }}>
                            <span style={{ fontSize: '11.5px', color: '#991b1b', fontWeight: '700' }}>
                              Unrecognized Semester Format (Cannot be promoted)
                            </span>
                            <span style={{ fontWeight: '800', fontSize: '12.5px', color: '#991b1b' }}>
                              {globalPromotionPreview.unrecognizedCount} students
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Program Final-Semester Configuration */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                        Program Final Semester (Configurable):
                      </span>
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '4px 10px', fontSize: '12px', fontWeight: '700' }}
                        value={globalPromotionFinalSem}
                        onChange={(e) => handleUpdateFinalSemConfig(e.target.value)}
                      >
                        <option value={8}>Semester 8 (Standard 4-Year B.Tech)</option>
                        <option value={6}>Semester 6 (3-Year Diploma / B.Sc)</option>
                        <option value={4}>Semester 4 (2-Year M.Tech / MBA)</option>
                      </select>
                    </div>

                    {/* Duplicate Promotion Warning Safeguard */}
                    {globalPromotionPreview.isAlreadyPromotedForCycle && (
                      <div style={{ padding: '12px 14px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', color: '#9f1239', fontSize: '12.5px' }}>
                        <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <AlertTriangle size={16} />
                          <span>Accidental Duplicate Promotion Prevention</span>
                        </div>
                        <div>
                          A global semester promotion was already executed on {new Date(globalPromotionPreview.lastPromotionForCycle?.timestamp).toLocaleString()} for cycle <strong>{globalPromotionCycle}</strong> ({globalPromotionPreview.lastPromotionForCycle?.totalPromoted} students). Executing another promotion for the same cycle will advance students an additional semester.
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer', fontWeight: '700', color: '#be123c' }}>
                          <input
                            type="checkbox"
                            checked={globalPromotionOverride}
                            onChange={(e) => setGlobalPromotionOverride(e.target.checked)}
                          />
                          <span>Authorize recovery override to re-promote students for cycle {globalPromotionCycle}</span>
                        </label>
                      </div>
                    )}

                    {/* Warning Notice Text (Required verbatim) */}
                    <div style={{ padding: '14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '12.5px', color: '#92400e', lineHeight: '1.6' }}>
                      <div style={{ fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={16} color="#d97706" />
                        <span>Please verify the details before continuing:</span>
                      </div>
                      <p style={{ margin: 0 }}>
                        "This action will promote all eligible students to the next semester. Semester 1 students will move to Semester 2, Semester 2 students will move to Semester 3, and so on.
                        <br /><br />
                        This operation affects all eligible students and cannot be undone automatically. Please verify the details before continuing."
                      </p>
                    </div>

                    {/* Error Banner */}
                    {globalPromotionError && (
                      <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#991b1b', fontSize: '12.5px' }}>
                        <strong>Error:</strong> {globalPromotionError}
                      </div>
                    )}
                  </>
                ) : (
                  /* Success Summary Screen (Section 6) */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', textAlign: 'center' }}>
                      <CheckCircle2 size={38} style={{ color: '#059669', margin: '0 auto 10px auto' }} />
                      <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#065f46', margin: 0 }}>
                        Semester Promotion Completed Successfully
                      </h4>
                      <p style={{ fontSize: '13px', color: '#047857', marginTop: '6px', marginBottom: 0 }}>
                        Simultaneously promoted {globalPromotionResult?.totalPromoted} eligible students for Academic Cycle {globalPromotionResult?.academicCycle}.
                      </p>
                    </div>

                    {/* Breakdown List (Format requested in Section 6) */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
                      <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12.5px', fontWeight: '800', color: '#334155' }}>
                        Promotion Summary Breakdown
                      </div>
                      <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {globalPromotionResult?.breakdown.map((b, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx < globalPromotionResult.breakdown.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '13px' }}>
                            <span style={{ fontWeight: '600', color: '#334155' }}>
                              {b.sourceSem} -&gt; {b.targetSem}:
                            </span>
                            <span style={{ fontWeight: '800', color: '#0f172a' }}>
                              {b.count} {b.count === 1 ? 'student' : 'students'}
                            </span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: '4px', borderTop: '2px dashed #e2e8f0', fontSize: '13px' }}>
                          <span style={{ fontWeight: '700', color: '#b45309' }}>
                            Final-semester students excluded:
                          </span>
                          <span style={{ fontWeight: '800', color: '#b45309' }}>
                            {globalPromotionResult?.finalSemesterExcludedCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '10px 14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '12px', color: '#1e40af' }}>
                      ✓ All student IDs, enrollment numbers, batches, and historical attendance records remain completely intact and archived.
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {globalPromotionStep === 'confirm' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowGlobalPromotionModal(false)}
                      disabled={isExecutingGlobalPromotion}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleExecuteGlobalPromotion}
                      disabled={
                        isExecutingGlobalPromotion ||
                        globalPromotionPreview.totalEligible === 0 ||
                        (globalPromotionPreview.isAlreadyPromotedForCycle && !globalPromotionOverride)
                      }
                      style={{
                        backgroundColor: '#059669',
                        borderColor: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 18px',
                        fontWeight: '800'
                      }}
                    >
                      {isExecutingGlobalPromotion ? (
                        <span>Promoting All...</span>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Confirm &amp; Promote All ({globalPromotionPreview.totalEligible} Students)</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowGlobalPromotionModal(false)}
                    style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '8px 20px', fontWeight: '800' }}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 7: GLOBAL SINGLE STUDENT REGISTRATION (FRESHERS / ADMISSIONS)
            =================================================================== */}
        {showGlobalStudentModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '520px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                      Register New Student (Fresher / Admission)
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Assign new student to ADIT campus academic cohorts and class rosters.
                    </span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowGlobalStudentModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveGlobalStudentSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {globalStudentError && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecdd3', color: '#991b1b', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} />
                      <span>{globalStudentError}</span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Enrollment Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 25AD001"
                        value={globalStudentForm.enrollmentNo}
                        onChange={(e) => handleGlobalStudentFormChange('enrollmentNo', e.target.value)}
                        required
                        style={{ fontFamily: 'monospace', fontWeight: '700' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Roll Number (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 1"
                        value={globalStudentForm.rollNo}
                        onChange={(e) => handleGlobalStudentFormChange('rollNo', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Student Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Aarav Sharma"
                      value={globalStudentForm.name}
                      onChange={(e) => handleGlobalStudentFormChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Department *</label>
                    <select
                      className="form-control"
                      value={globalStudentForm.department}
                      onChange={(e) => handleGlobalStudentFormChange('department', e.target.value)}
                      required
                    >
                      {departments.map(d => (
                        <option key={d.id || d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '12px', fontWeight: '700' }}>Semester *</label>
                      <select
                        className="form-control"
                        value={globalStudentForm.semester}
                        onChange={(e) => handleGlobalStudentFormChange('semester', e.target.value)}
                        required
                      >
                        {SEMESTERS.map(s => (
                          <option key={s.id} value={s.id}>{s.id}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '10.5px', color: '#059669', marginTop: '2px', display: 'block' }}>
                        Default: 1st Sem
                      </span>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px', fontWeight: '700' }}>Division *</label>
                      <select
                        className="form-control"
                        value={globalStudentForm.division}
                        onChange={(e) => handleGlobalStudentFormChange('division', e.target.value)}
                        required
                      >
                        <option value="Div 1">Div 1</option>
                        <option value="Div 2">Div 2</option>
                        <option value="Div 3">Div 3</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px', fontWeight: '700' }}>Batch *</label>
                      <select
                        className="form-control"
                        value={globalStudentForm.batch}
                        onChange={(e) => handleGlobalStudentFormChange('batch', e.target.value)}
                        required
                      >
                        <option value="Batch A">Batch A</option>
                        <option value="Batch B">Batch B</option>
                        <option value="Batch C">Batch C</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. aarav.sharma@adit.ac.in"
                      value={globalStudentForm.email}
                      onChange={(e) => handleGlobalStudentFormChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowGlobalStudentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Register Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 8: CAMPUS BULK STUDENT REGISTRATION (EXCEL IMPORT)
            =================================================================== */}
        {showBulkFresherModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                      Bulk Student Registration (Excel / CSV)
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Import first-year freshers or transfer batches with automatic validation against duplicates.
                    </span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkFresherModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Template Download Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'block' }}>
                      Need the official ADIT student registration template?
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Contains required columns: Enrollment Number, Student Name, Department, Semester, Division, Batch, Email.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={downloadStudentRegistrationTemplate}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} /> Download Template
                  </button>
                </div>

                {/* File Upload Zone */}
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleBulkFresherFileChange}
                    style={{ display: 'none' }}
                    id="bulkFresherFileInput"
                  />
                  <label htmlFor="bulkFresherFileInput" style={{ cursor: 'pointer', display: 'block' }}>
                    <FileSpreadsheet size={36} style={{ color: '#2563eb', margin: '0 auto 8px auto' }} />
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block' }}>
                      {bulkFresherFile ? bulkFresherFile.name : 'Click to select Excel (.xlsx, .xls) or CSV file'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Supports official student admission lists with automatic cohort linking
                    </span>
                  </label>
                </div>

                {/* Validation Summary Cards */}
                {bulkFresherPreviewRows && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>TOTAL ROWS</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{bulkFresherStats.total}</div>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#047857', fontWeight: '700' }}>VALID TO IMPORT</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#047857' }}>{bulkFresherStats.valid}</div>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>DUPLICATES</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#b45309' }}>{bulkFresherStats.duplicates}</div>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '700' }}>INVALID</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#b91c1c' }}>{bulkFresherStats.invalid}</div>
                      </div>
                    </div>

                    {/* Row Preview Table */}
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white' }}>
                      <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0 }}>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Row</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Enrollment No</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Student Name</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Department</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Semester</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Batch</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Notes / Validation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkFresherPreviewRows.map(r => (
                            <tr key={r.rowNum} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '6px 10px', color: '#64748b' }}>{r.rowNum}</td>
                              <td style={{ padding: '6px 10px' }}>
                                {r.status === 'valid' ? (
                                  <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#059669', fontSize: '10px' }}>Valid</span>
                                ) : r.status === 'duplicate' ? (
                                  <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '10px' }}>Duplicate</span>
                                ) : (
                                  <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '10px' }}>Invalid</span>
                                )}
                              </td>
                              <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: '700' }}>{r.enrollmentNo || '—'}</td>
                              <td style={{ padding: '6px 10px', fontWeight: '600' }}>{r.name || '—'}</td>
                              <td style={{ padding: '6px 10px' }}>{r.department}</td>
                              <td style={{ padding: '6px 10px' }}>{r.semester} • {r.division}</td>
                              <td style={{ padding: '6px 10px', fontWeight: '700', color: '#2563eb' }}>{r.batch}</td>
                              <td style={{ padding: '6px 10px', color: r.status === 'valid' ? '#059669' : '#dc2626' }}>
                                {r.status === 'valid' ? 'Ready to import' : r.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkFresherModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmBulkFresherImport}
                  disabled={!bulkFresherPreviewRows || bulkFresherStats.valid === 0}
                >
                  Import {bulkFresherStats.valid} Valid Student(s)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            ELECTIVE CLASS ROSTER UPLOAD / REPLACE MODAL
            =================================================================== */}
        {showElectiveRosterModal && selectedClass && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '640px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UploadCloud size={20} style={{ color: '#7c3aed' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    Upload Student List: {selectedClass.subjectName || selectedClass.division || selectedClass.name}
                  </h3>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowElectiveRosterModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Upload an Excel (.xlsx, .xls) file containing student enrollment numbers for this elective class. Existing regular student records, departments, and regular classes will remain intact.
                </p>

                {electiveRosterError && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecdd3', color: '#991b1b', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{electiveRosterError}</span>
                  </div>
                )}

                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '24px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <FileSpreadsheet size={36} style={{ color: '#7c3aed', margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>
                    {electiveRosterFile ? electiveRosterFile.name : 'Select Excel spreadsheet (.xlsx, .xls)'}
                  </div>
                  <input
                    type="file"
                    id="input-elective-roster-file"
                    accept=".xlsx,.xls"
                    onChange={handleElectiveRosterFileChange}
                    style={{ marginTop: '12px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                    Column header can be "Enrollment", "Enrollment No", "Enrollment Number", or "Roll No"
                  </div>
                </div>

                {electiveRosterStats && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>TOTAL ROWS</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{electiveRosterStats.totalRows}</div>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700' }}>MATCHED STUDENTS</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a' }}>{electiveRosterStats.validCount}</div>
                      </div>
                      <div style={{ padding: '10px', backgroundColor: electiveRosterStats.failedCount > 0 ? '#fef2f2' : '#f8fafc', borderRadius: '8px', border: electiveRosterStats.failedCount > 0 ? '1px solid #fecdd3' : '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: electiveRosterStats.failedCount > 0 ? '#991b1b' : '#64748b', fontWeight: '700' }}>FAILED / UNMATCHED</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: electiveRosterStats.failedCount > 0 ? '#dc2626' : '#64748b' }}>{electiveRosterStats.failedCount}</div>
                      </div>
                    </div>

                    {electiveRosterStats.failedRows && electiveRosterStats.failedRows.length > 0 && (
                      <div style={{ maxHeight: '140px', overflowY: 'auto', padding: '10px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', fontSize: '12px', color: '#991b1b' }}>
                        <div style={{ fontWeight: '700', marginBottom: '4px' }}>Unmatched / Invalid Rows:</div>
                        {electiveRosterStats.failedRows.map((err, i) => (
                          <div key={i}>• {err.reason}</div>
                        ))}
                      </div>
                    )}

                    {electiveRosterStats.preview && electiveRosterStats.preview.length > 0 && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                          <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                              <th style={{ padding: '6px 10px' }}>Enrollment</th>
                              <th style={{ padding: '6px 10px' }}>Name</th>
                              <th style={{ padding: '6px 10px' }}>Department</th>
                              <th style={{ padding: '6px 10px' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {electiveRosterStats.preview.map((p, pIdx) => (
                              <tr key={pIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: '700' }}>{p.enrollmentNo}</td>
                                <td style={{ padding: '6px 10px' }}>{p.name || '—'}</td>
                                <td style={{ padding: '6px 10px' }}>{p.department || '—'}</td>
                                <td style={{ padding: '6px 10px', color: p.status === 'matched' ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
                                  {p.status === 'matched' ? '✓ Matched' : '✕ Not Found'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowElectiveRosterModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-replace-elective-roster"
                  className="btn btn-primary"
                  onClick={handleConfirmReplaceElectiveRoster}
                  disabled={!electiveRosterStats || electiveRosterStats.validCount === 0}
                  style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                >
                  Save / Update Student List ({electiveRosterStats?.validCount || 0} students)
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
