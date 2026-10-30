import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  BookOpen, 
  Layers, 
  Building2, 
  GraduationCap, 
  Users, 
  CheckSquare, 
  XSquare, 
  Save, 
  Search, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  ArrowRight, 
  Table2, 
  List, 
  Filter, 
  ShieldCheck, 
  FileSpreadsheet, 
  Printer, 
  RotateCcw,
  User,
  Info,
  LogOut,
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  Download
} from 'lucide-react';
import { 
  getFaculties, 
  getActiveFacultyId, 
  setActiveFacultyId, 
  getActiveFaculty, 
  getCurrentUser,
  logoutUser,
  getSubjects, 
  getDepartments, 
  getClasses, 
  findClassByCriteria, 
  getOrCreateClass, 
  getStudentsByClassId, 
  getStudentsForClassCriteria, 
  getStudents,
  getSessions, 
  saveSession, 
  deleteSession, 
  DEFAULT_ACADEMIC_YEAR, 
  ACADEMIC_YEARS, 
  normalizeSem, 
  normalizeDiv,
  calculateAnalytics,
  getCollegeName,
  getExceptions,
  saveException,
  updateExceptionStatus,
  deleteException,
  isStudentExcusedForSession,
  calculateOverlappingLectures,
  calculateStudentAttendanceWithPolicy,
  getInstitutionalExceptionPolicy,
  getStudentsForAcademicGroup,
  canFacultyTeachClassAndSubject,
  getAuthorizedFacultyClasses,
  getAuthorizedFacultySubjects,
  getElectiveGroups,
  getAuthorizedFacultyElectives,
  getStudentsForElectiveClass,
  canFacultyTeachElective,
  getElectiveAssignments,
  EXCEPTION_CATEGORIES,
  INSTITUTIONAL_POLICIES,
  SEMESTERS,
  resolveDepartment,
  isDepartmentMatch,
  normalizeBatch,
  isBatchMatch,
  canonicalizeBatch,
  getBatchesForClass
} from '../services/attendanceStorage';
import AttendanceSheetView from './AttendanceSheetView';
import { 
  getFacultyTimetable, 
  getFacultyScheduledLecturesForDate, 
  getEntriesByFaculty, 
  TIME_SLOTS, 
  TIMETABLE_DAYS, 
  getSubjectColor,
  notifyTimetableSync,
  getDateForDayName,
  normalizeTimeSlot,
  doTimeSlotsOverlap,
  parseTimeRangeMinutes,
  getSessionIdentity,
  canMergeConsecutiveSlots,
  formatOfficialTimeSlot,
  calculateFacultyTeachingMetrics,
  downloadFacultyTimetableTemplate,
  downloadFacultyTimetableCsv
} from '../services/timetableStorage';

var SUBJECT_COLOR_THEMES = {
  purple:  { bg: '#fbf7ff', border: '#ddd6fe', text: '#5b21b6', badgeBg: '#ede9fe', badgeText: '#6d28d9' },
  green:   { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', badgeBg: '#dcfce7', badgeText: '#15803d' },
  emerald: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', badgeBg: '#d1fae5', badgeText: '#047857' },
  coral:   { bg: '#fff1f2', border: '#fecdd3', text: '#9f1239', badgeBg: '#ffe4e6', badgeText: '#be123c' },
  amber:   { bg: '#fffbeb', border: '#fde68a', text: '#92400e', badgeBg: '#fef3c7', badgeText: '#b45309' },
  indigo:  { bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3', badgeBg: '#e0e7ff', badgeText: '#4338ca' },
  cyan:    { bg: '#ecfeff', border: '#a5f3fc', text: '#155e75', badgeBg: '#cffafe', badgeText: '#0e7490' },
  slate:   { bg: '#f8fafc', border: '#cbd5e1', text: '#334155', badgeBg: '#f1f5f9', badgeText: '#475569' },
  blue:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', badgeBg: '#dbeafe', badgeText: '#1d4ed8' }
};
if (typeof window !== 'undefined') {
  window.SUBJECT_COLOR_THEMES = SUBJECT_COLOR_THEMES;
}

export function getCardStyleForSubject(subjectNameOrCode) {
  const colorName = (typeof getSubjectColor === 'function' ? getSubjectColor(subjectNameOrCode) : 'blue') || 'blue';
  const themes = (typeof SUBJECT_COLOR_THEMES !== 'undefined' ? SUBJECT_COLOR_THEMES : (typeof window !== 'undefined' ? window.SUBJECT_COLOR_THEMES : null)) || {};
  return themes[colorName] || themes.blue || { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', badgeBg: '#dbeafe', badgeText: '#1d4ed8' };
};

export default function FacultyPanel({ currentUser, currentFaculty: propFaculty, showToast, onExit, initialTab = 'dashboard' }) {
  // -------------------------------------------------------------
  // 1. ACTIVE FACULTY IDENTITY
  // -------------------------------------------------------------
  const [facultiesList, setFacultiesList] = useState(getFaculties());
  
  // Resolve current logged-in faculty
  const currentFaculty = useMemo(() => {
    if (propFaculty) return propFaculty;
    const activeId = currentUser?.facultyId || getActiveFacultyId();
    return facultiesList.find(f => f.id === activeId) || 
           facultiesList[0] || {
             id: 'FAC_PS',
             name: 'Prof. Priya Shah',
             dept: 'AI & Data Science',
             designation: 'Associate Professor',
             email: 'priya.shah@adit.ac.in',
             phone: '9825011111',
             subjects: 'DBMS, DS'
           };
  }, [facultiesList, currentUser, propFaculty]);

  // Main active tab in Faculty Panel: 'dashboard', 'timetable', 'take', 'register', 'exceptions', 'history', 'profile'
  const [facultyTab, setFacultyTab] = useState(initialTab || 'dashboard');

  // Timetable & master synchronization ticks for real-time live sync from Admin Panel
  const [timetableSyncTick, setTimetableSyncTick] = useState(0);
  const [studentsTick, setStudentsTick] = useState(0);
  const [classesTick, setClassesTick] = useState(0);
  const [exceptionsTick, setExceptionsTick] = useState(0);
  const [electivesTick, setElectivesTick] = useState(0);

  // Listen for admin timetable, faculty, student, class, session, exception, and elective updates
  useEffect(() => {
    const handleSync = () => setTimetableSyncTick(t => t + 1);
    const handleFacultyUpdate = () => setFacultiesList(getFaculties());
    const handleStudentsUpdate = () => setStudentsTick(t => t + 1);
    const handleClassesUpdate = () => setClassesTick(t => t + 1);
    const handleSessionsUpdate = () => setAllSessions(getSessions());
    const handleExceptionsUpdate = () => setExceptionsTick(t => t + 1);
    const handleElectivesUpdate = () => setElectivesTick(t => t + 1);

    window.addEventListener('adit-timetable-synced', handleSync);
    window.addEventListener('adit-faculty-updated', handleFacultyUpdate);
    window.addEventListener('adit-students-updated', handleStudentsUpdate);
    window.addEventListener('adit-classes-updated', handleClassesUpdate);
    window.addEventListener('adit-sessions-updated', handleSessionsUpdate);
    window.addEventListener('adit-exceptions-updated', handleExceptionsUpdate);
    window.addEventListener('adit-elective-groups-updated', handleElectivesUpdate);
    window.addEventListener('adit-elective-assignments-updated', handleElectivesUpdate);
    return () => {
      window.removeEventListener('adit-timetable-synced', handleSync);
      window.removeEventListener('adit-faculty-updated', handleFacultyUpdate);
      window.removeEventListener('adit-students-updated', handleStudentsUpdate);
      window.removeEventListener('adit-classes-updated', handleClassesUpdate);
      window.removeEventListener('adit-sessions-updated', handleSessionsUpdate);
      window.removeEventListener('adit-exceptions-updated', handleExceptionsUpdate);
      window.removeEventListener('adit-elective-groups-updated', handleElectivesUpdate);
      window.removeEventListener('adit-elective-assignments-updated', handleElectivesUpdate);
    };
  }, []);

  // -------------------------------------------------------------
  // 2. TIMETABLE DATA (Live Synchronized with Admin Panel)
  // -------------------------------------------------------------
  const facultyTimetableGrid = useMemo(() => {
    return getFacultyTimetable(currentFaculty?.id || 'FAC_PS');
  }, [currentFaculty?.id, timetableSyncTick]);

  // Official ADIT Faculty Template Teaching Load Metrics
  const teachingMetrics = useMemo(() => {
    return calculateFacultyTeachingMetrics(facultyTimetableGrid);
  }, [facultyTimetableGrid]);

  // Timetable day switcher for My Timetable tab
  const todayDayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dName = days[new Date().getDay()];
    return TIMETABLE_DAYS.includes(dName) ? dName : 'Monday';
  }, []);
  const [selectedTimetableDay, setSelectedTimetableDay] = useState(todayDayName);
  const [isWeeklyGridView, setIsWeeklyGridView] = useState(true);

  // Interactive Lecture Detail Modal state
  const [selectedLectureDetail, setSelectedLectureDetail] = useState(null);

  // -------------------------------------------------------------
  // 2.5 ATTENDANCE EXCEPTIONS MODULE STATE
  // -------------------------------------------------------------
  const exceptionsList = useMemo(() => getExceptions(), [exceptionsTick]);
  const activePolicy = useMemo(() => getInstitutionalExceptionPolicy(), [exceptionsTick]);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [selectedExceptionView, setSelectedExceptionView] = useState(null);
  const [excFilterStatus, setExcFilterStatus] = useState('All');
  const [excFilterCategory, setExcFilterCategory] = useState('All');
  const [excSearchQuery, setExcSearchQuery] = useState('');

  // Request Form State
  const [excStudentSearch, setExcStudentSearch] = useState('');
  const [excSelectedStudent, setExcSelectedStudent] = useState(null);
  const [excActivityName, setExcActivityName] = useState('');
  const [excCategory, setExcCategory] = useState('Sports Tournament');
  const [excStartDate, setExcStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [excEndDate, setExcEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [excReason, setExcReason] = useState('');
  const [excDocName, setExcDocName] = useState('');
  const [excDocSize, setExcDocSize] = useState('');
  const [excDocError, setExcDocError] = useState('');

  // -------------------------------------------------------------
  // 3. ATTENDANCE SESSIONS & STATS
  // -------------------------------------------------------------
  const [allSessions, setAllSessions] = useState(() => getSessions({}, currentFaculty));
  const reloadSessions = () => setAllSessions(getSessions({}, currentFaculty));

  useEffect(() => {
    reloadSessions();
  }, [currentFaculty]);

  // Filter sessions recorded by THIS faculty
  const facultySessions = useMemo(() => {
    return allSessions.filter(s => 
      s.facultyId === currentFaculty.id || 
      (s.facultyName && s.facultyName.toLowerCase() === currentFaculty.name.toLowerCase())
    );
  }, [allSessions, currentFaculty]);

  // Today's Date String
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's scheduled lectures for this faculty
  const { dayName: currentDayName, lectures: todayScheduledLectures } = useMemo(() => {
    return getFacultyScheduledLecturesForDate(currentFaculty.id, todayDateStr);
  }, [currentFaculty.id, todayDateStr, timetableSyncTick]);

  // Check which of today's lectures already have attendance recorded
  const todayLecturesWithStatus = useMemo(() => {
    return todayScheduledLectures.map(lec => {
      const matchSession = facultySessions.find(s => 
        s.date === todayDateStr &&
        s.timeSlot === lec.time &&
        (s.subjectId === lec.subjectId || s.subjectId === lec.subjectName)
      );
      return {
        ...lec,
        isCompleted: !!matchSession,
        session: matchSession || null
      };
    });
  }, [todayScheduledLectures, facultySessions, todayDateStr]);

  const completedTodayCount = todayLecturesWithStatus.filter(l => l.isCompleted).length;
  const pendingTodayCount = todayLecturesWithStatus.filter(l => !l.isCompleted).length;

  // -------------------------------------------------------------
  // 4. TAKE ATTENDANCE MODULE (Completely Independent of Faculty Timetable)
  // -------------------------------------------------------------
  const [attendanceStep, setAttendanceStep] = useState('setup'); // 'setup' | 'marking'
  const [loadedStudents, setLoadedStudents] = useState([]);

  const [attDate, setAttDate] = useState(todayDateStr);
  const [attStartTime, setAttStartTime] = useState('09:00');
  const [attEndTime, setAttEndTime] = useState('09:55');
  const [attTimeSlot, setAttTimeSlot] = useState('09:00 - 09:55');

  const [attDept, setAttDept] = useState(() => currentFaculty?.dept || 'Computer Engineering');
  const [attSem, setAttSem] = useState('3rd Sem');
  const [attDiv, setAttDiv] = useState('Div 1');
  const [attBatch, setAttBatch] = useState('ALL');
  const [attYear, setAttYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [attSubjectId, setAttSubjectId] = useState('SUB_DS');
  const [attSubjectName, setAttSubjectName] = useState('DATA STRUCTURES');
  const [attRoom, setAttRoom] = useState('Room 201');

  // Multi-lecture & Register Navigation Synchronization
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [regNavDept, setRegNavDept] = useState(() => currentFaculty?.dept || 'Computer Engineering');
  const [regNavSem, setRegNavSem] = useState('3rd Sem');
  const [regNavDiv, setRegNavDiv] = useState('Div 1');
  const [regNavBatch, setRegNavBatch] = useState('ALL');
  const [regNavSubId, setRegNavSubId] = useState('SUB_DS');

  // Dropdown data sources restricted strictly to authorized faculty scope
  const authorizedClasses = useMemo(() => {
    return getAuthorizedFacultyClasses(currentFaculty);
  }, [currentFaculty, classesTick]);

  const authorizedSubjects = useMemo(() => {
    return getAuthorizedFacultySubjects(currentFaculty);
  }, [currentFaculty, timetableSyncTick]);

  const takeAvailableSubjects = useMemo(() => {
    let list = (authorizedSubjects && authorizedSubjects.length > 0) ? [...authorizedSubjects] : getSubjects();
    const electiveClasses = getClasses().filter(c => c.isElective);
    electiveClasses.forEach(c => {
      const matchFac = (currentFaculty.role === 'admin' || currentFaculty.id === 'FAC_ADMIN') ||
        (c.facultyId && (c.facultyId === currentFaculty.id || c.facultyId === currentFaculty.facultyId)) ||
        (c.facultyName && c.facultyName.trim().toLowerCase() === (currentFaculty.name || '').trim().toLowerCase());
      if (matchFac && c.subjectId && !list.some(s => s.id === c.subjectId || s.name === c.subjectName)) {
        list.push({
          id: c.subjectId,
          code: c.subjectId,
          name: c.subjectName || c.subjectId,
          shortName: c.subjectName || c.subjectId,
          isElective: true,
          sem: c.semester,
          dept: 'Elective (No Department)'
        });
      }
    });
    if (attSubjectId && !list.some(s => s.id === attSubjectId)) {
      const allSub = getSubjects();
      const s = allSub.find(sub => sub.id === attSubjectId || sub.code === attSubjectId);
      if (s) list.push(s);
      else list.push({ id: attSubjectId, name: attSubjectName || attSubjectId, shortName: attSubjectName || attSubjectId });
    }
    return list;
  }, [authorizedSubjects, attSubjectId, attSubjectName]);

  const takeAvailableDepts = useMemo(() => {
    const allDepts = getDepartments();
    const hasElective = authorizedClasses.some(c => c.isElective) || 
      (currentFaculty.role === 'admin' || currentFaculty.id === 'FAC_ADMIN') ||
      getClasses().some(c => c.isElective && (c.facultyId === currentFaculty.id || c.facultyName?.toLowerCase() === (currentFaculty.name || '').toLowerCase()));

    if (currentFaculty.role === 'admin' || currentFaculty.id === 'FAC_ADMIN') {
      const res = [...allDepts];
      if (!res.some(d => d.name === 'Elective (No Department)')) {
        res.push({ id: 'DEP_ELECTIVE', name: 'Elective (No Department)' });
      }
      return res;
    }
    const deptSet = new Set();
    if (currentFaculty.dept) deptSet.add(currentFaculty.dept);
    authorizedClasses.forEach(c => {
      if (c.departmentName) deptSet.add(c.departmentName);
      if (c.dept) deptSet.add(c.dept);
    });
    authorizedSubjects.forEach(s => {
      if (s.dept) deptSet.add(s.dept);
    });
    if (attDept) deptSet.add(attDept);
    const depts = getDepartments().filter(d => deptSet.has(d.name) || deptSet.has(d.id));
    if ((deptSet.has('Elective (No Department)') || hasElective) && !depts.some(d => d.name === 'Elective (No Department)')) {
      depts.push({ id: 'DEP_ELECTIVE', name: 'Elective (No Department)' });
    }
    if (depts.length > 0) return depts;
    return [{ id: 'DEP_ACTIVE', name: attDept || currentFaculty.dept || 'Computer Engineering' }];
  }, [authorizedClasses, authorizedSubjects, currentFaculty, attDept]);

  const takeAvailableSemesters = useMemo(() => {
    if (currentFaculty.role === 'admin' || currentFaculty.id === 'FAC_ADMIN') {
      return (SEMESTERS && SEMESTERS.length > 0) ? SEMESTERS.map(s => s.id) : ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];
    }
    const semSet = new Set();
    authorizedClasses.forEach(c => {
      if (c.semester || c.sem) semSet.add(normalizeSem(c.semester || c.sem));
    });
    authorizedSubjects.forEach(s => {
      if (s.sem) semSet.add(normalizeSem(s.sem));
    });
    if (attSem) semSet.add(normalizeSem(attSem));
    if (semSet.size === 0) return ['3rd Sem'];
    return Array.from(semSet).sort();
  }, [authorizedClasses, authorizedSubjects, currentFaculty, attSem]);

  const takeAvailableDivisions = useMemo(() => {
    if (currentFaculty.role === 'admin' || currentFaculty.id === 'FAC_ADMIN') {
      const classes = getClasses();
      const divSet = new Set(classes.map(c => normalizeDiv(c.division)).filter(Boolean));
      ['Div 1', 'Div 2', 'Div 3'].forEach(d => divSet.add(d));
      return Array.from(divSet).sort();
    }
    const divSet = new Set();
    authorizedClasses.forEach(c => {
      if (c.division || c.div) divSet.add(normalizeDiv(c.division || c.div));
    });
    if (attDiv) divSet.add(normalizeDiv(attDiv));
    if (divSet.size === 0) divSet.add('Div 1');
    return Array.from(divSet).sort();
  }, [authorizedClasses, currentFaculty, attDiv]);

  // Resolve Class entity for current Take Attendance selection
  const activeClass = useMemo(() => {
    const classes = getClasses();
    const electiveCls = classes.find(c => c.isElective && 
      (c.subjectId === attSubjectId || c.subjectName === attSubjectName || c.division === attDiv || c.name === attDiv) &&
      (!attSem || normalizeSem(c.semester) === normalizeSem(attSem))
    );
    if (electiveCls) return electiveCls;

    return findClassByCriteria(attDept, attSem, attDiv, attYear) || 
           getOrCreateClass(attDept, attSem, attDiv, attYear);
  }, [attDept, attSem, attDiv, attYear, attSubjectId, attSubjectName]);

  const takeAvailableBatches = useMemo(() => {
    return getBatchesForClass({
      department: attDept,
      semester: attSem,
      division: attDiv,
      academicYear: attYear,
      classId: activeClass?.id
    });
  }, [attDept, attSem, attDiv, attYear, activeClass?.id, studentsTick]);

  // Synchronize attBatch strictly against available batches for the selected class
  useEffect(() => {
    if (takeAvailableBatches.length > 0) {
      const validValues = takeAvailableBatches.map(b => b.value);
      const isCurrentValid = validValues.includes(attBatch) || 
        validValues.some(v => isBatchMatch(attBatch, v) && normalizeBatch(attBatch) === normalizeBatch(v));
      if (!isCurrentValid) {
        setAttBatch('ALL');
      } else {
        const matching = takeAvailableBatches.find(b => isBatchMatch(attBatch, b.value) && normalizeBatch(attBatch) === normalizeBatch(b.value));
        if (matching && matching.value !== attBatch) {
          setAttBatch(matching.value);
        }
      }
    }
  }, [takeAvailableBatches, attBatch]);

  const [attTopic, setAttTopic] = useState('');
  const [attRecords, setAttRecords] = useState({});
  const [attRemarks, setAttRemarks] = useState({});
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'present', 'absent', 'unmarked', 'exceptions'
  const [isExtraLecture, setIsExtraLecture] = useState(false);
  const [hasLoadedStudents, setHasLoadedStudents] = useState(false);
  const [unmarkedAlert, setUnmarkedAlert] = useState(null);



  // Sync defaults when faculty changes
  useEffect(() => {
    if (takeAvailableSubjects.length > 0 && !takeAvailableSubjects.some(s => s.id === attSubjectId)) {
      setAttSubjectId(takeAvailableSubjects[0].id);
      setAttSubjectName(takeAvailableSubjects[0].shortName || takeAvailableSubjects[0].name);
    }
    if (takeAvailableDepts.length > 0 && !takeAvailableDepts.some(d => d.name === attDept)) {
      setAttDept(takeAvailableDepts[0].name);
    }
    if (takeAvailableSemesters.length > 0 && !takeAvailableSemesters.includes(attSem)) {
      setAttSem(takeAvailableSemesters[0]);
    }
    if (takeAvailableDivisions.length > 0 && !takeAvailableDivisions.includes(attDiv)) {
      setAttDiv(takeAvailableDivisions[0]);
    }
  }, [currentFaculty, takeAvailableSubjects, takeAvailableDepts, takeAvailableSemesters, takeAvailableDivisions]);

  // Pre-fill lecture handler with automatic student loading (from Dashboard or Timetable click)
  const selectLectureForAttendance = (lec, targetDate = null) => {
    // 1. Resolve Date
    let dateToUse = lec.rescheduledDate || targetDate;
    if (!dateToUse) {
      if (lec.date) dateToUse = lec.date;
      else if (lec.day) dateToUse = getDateForDayName(lec.day);
      else dateToUse = todayDateStr;
    }
    setAttDate(dateToUse);

    // 2. Resolve Timings
    const timeSlotStr = lec.time || lec.timeSlot || '09:00 - 09:55';
    const times = timeSlotStr.split(/[-–—]/);
    let sTime = times[0]?.trim() || '09:00';
    let eTime = times[1]?.trim() || '09:55';
    if (sTime.length === 4 && sTime[1] === ':') sTime = '0' + sTime;
    if (eTime.length === 4 && eTime[1] === ':') eTime = '0' + eTime;
    setAttStartTime(sTime);
    setAttEndTime(eTime);
    setAttTimeSlot(`${sTime} - ${eTime}`);

    // 3. Resolve Subject
    const allSubjects = getSubjects();
    const rawSubId = lec.subjectId || lec.subject || '';
    const foundSub = allSubjects.find(s => 
      s.id === rawSubId || 
      s.code === rawSubId || 
      (s.name && s.name.toLowerCase() === rawSubId.toLowerCase()) || 
      (s.shortName && s.shortName.toLowerCase() === rawSubId.toLowerCase())
    );
    const resolvedSubjectId = foundSub ? foundSub.id : rawSubId;
    const resolvedSubjectName = foundSub ? (foundSub.shortName || foundSub.name) : (lec.subjectName || lec.name || rawSubId);
    setAttSubjectId(resolvedSubjectId);
    setAttSubjectName(resolvedSubjectName);

    // 4. Resolve Department
    const isLecElective = Boolean(lec.isElective || foundSub?.isElective || lec.dept === 'Elective' || lec.dept === 'Elective (No Department)' || lec.departmentId === 'Elective' || lec.departmentId === 'ELECTIVE');
    const depts = getDepartments();
    let resolvedDept = '';
    if (isLecElective) {
      resolvedDept = 'Elective (No Department)';
    } else {
      if (lec.departmentId) {
        const f = depts.find(d => d.id === lec.departmentId || d.name.toLowerCase() === lec.departmentId.toLowerCase() || d.code?.toLowerCase() === lec.departmentId.toLowerCase());
        if (f) resolvedDept = f.name;
      }
      if (!resolvedDept && lec.department) {
        const f = depts.find(d => d.id === lec.department || d.name.toLowerCase() === lec.department.toLowerCase() || d.code?.toLowerCase() === lec.department.toLowerCase());
        if (f) resolvedDept = f.name;
        else resolvedDept = lec.department;
      }
      if (!resolvedDept && lec.dept) {
        const f = depts.find(d => d.id === lec.dept || d.name.toLowerCase() === lec.dept.toLowerCase() || d.code?.toLowerCase() === lec.dept.toLowerCase());
        if (f) resolvedDept = f.name;
        else resolvedDept = lec.dept;
      }
      if (!resolvedDept) {
        resolvedDept = currentFaculty?.dept || (depts.length > 0 ? depts[0].name : 'AI & Data Science');
      }
    }
    setAttDept(resolvedDept);

    // 5. Resolve Semester, Division, Batch
    const resolvedSem = normalizeSem(lec.sem || '3rd Sem');
    const resolvedDiv = normalizeDiv(lec.div || 'Div 1');
    const resolvedBatch = canonicalizeBatch(lec.batch || 'ALL');
    setAttSem(resolvedSem);
    setAttDiv(resolvedDiv);
    setAttBatch(resolvedBatch);
    if (lec.room) {
      setAttRoom(lec.room);
    }

    setAttTopic('');
    setIsExtraLecture(false);

    // 6. AUTOMATICALLY RETRIEVE AND DISPLAY THE CORRECT STUDENTS FOR THIS LECTURE
    let students = [];
    try {
      students = getStudentsForAcademicGroup({
        department: resolvedDept,
        semester: resolvedSem,
        division: resolvedDiv,
        batch: resolvedBatch,
        academicYear: attYear,
        subjectId: resolvedSubjectId
      }, currentFaculty);
    } catch (err) {
      console.warn('Could not load students with full criteria:', err);
    }

    if (!students || students.length === 0) {
      try {
        students = getStudentsForAcademicGroup({
          semester: resolvedSem,
          division: resolvedDiv,
          batch: resolvedBatch,
          academicYear: attYear,
          subjectId: resolvedSubjectId
        }, currentFaculty);
      } catch (err) {}
    }

    setHasLoadedStudents(true);

    if (students && students.length > 0) {
      setLoadedStudents(students);
      const initialRecords = {};
      const initialRemarks = {};
      students.forEach(st => {
        initialRecords[st.id] = null; // All students initially unmarked!
        initialRemarks[st.id] = '';
      });
      setAttRecords(initialRecords);
      setAttRemarks(initialRemarks);
      setAttendanceStep('marking');
      setUnmarkedAlert(null);
    } else {
      setLoadedStudents([]);
      setAttRecords({});
      setAttRemarks({});
      setAttendanceStep('marking');
    }

    // 7. Direct Navigation to Take Attendance View
    setFacultyTab('take');

    if (showToast) {
      showToast(`Selected: ${resolvedSubjectName} (${sTime} - ${eTime}). ${students.length} student(s) loaded.`);
    }
  };




  // Handle Loading Students for Step 2
  const handleLoadStudents = (e) => {
    if (e) e.preventDefault();

    if (!attSubjectId) {
      if (showToast) showToast('Please select a subject.', 'error');
      setUnmarkedAlert('Please select a subject.');
      return;
    }
    if (!attDate) {
      if (showToast) showToast('Please enter a session date.', 'error');
      setUnmarkedAlert('Please enter a session date.');
      return;
    }
    if (!attStartTime || !attEndTime) {
      if (showToast) showToast('Please enter session start and end times.', 'error');
      setUnmarkedAlert('Please enter session start and end times.');
      return;
    }
    if (attStartTime >= attEndTime) {
      if (showToast) showToast('Session start time must be earlier than session end time.', 'error');
      setUnmarkedAlert('Session start time must be earlier than session end time.');
      return;
    }

    const isElective = Boolean(activeClass?.isElective || attDept === 'Elective (No Department)' || attDept === 'Elective');

    if (!isElective && !attDept) {
      if (showToast) showToast('Please select a department.', 'error');
      setUnmarkedAlert('Please select a department.');
      return;
    }
    if (!attSem) {
      if (showToast) showToast('Please select a semester.', 'error');
      setUnmarkedAlert('Please select a semester.');
      return;
    }
    if (!attDiv) {
      if (showToast) showToast('Please select a division.', 'error');
      setUnmarkedAlert('Please select a division.');
      return;
    }

    // Backend & Frontend Authorization check
    const isAuthorized = canFacultyTeachClassAndSubject(currentFaculty, attDept, attSem, attDiv, attSubjectId);
    if (!isAuthorized) {
      const msg = `Access Denied: You are not authorized to take attendance for ${attSubjectName || attSubjectId} in ${attSem} ${attDiv}${attDept ? ` of ${attDept}` : ''}.`;
      if (showToast) showToast(msg, 'error');
      setUnmarkedAlert(msg);
      return;
    }

    const slotStr = `${attStartTime} - ${attEndTime}`;
    setAttTimeSlot(slotStr);

    const sub = takeAvailableSubjects.find(s => s.id === attSubjectId || s.code === attSubjectId);
    if (sub) {
      setAttSubjectName(sub.shortName || sub.name);
    }

    // Retrieve students: for elective classes, getStudentsForAcademicGroup returns the uploaded roster directly!
    const students = getStudentsForAcademicGroup({
      department: isElective ? 'Elective (No Department)' : attDept,
      semester: attSem,
      division: attDiv,
      batch: attBatch,
      academicYear: attYear,
      subjectId: attSubjectId,
      classId: activeClass?.id
    }, currentFaculty);

    setHasLoadedStudents(true);

    if (!students || students.length === 0) {
      setLoadedStudents([]);
      setAttRecords({});
      setAttRemarks({});
      setAttendanceStep('setup');
      return;
    }

    setLoadedStudents(students);

    // Requirement 4: When students are loaded, all checkboxes start UNCHECKED and completely UNMARKED.
    // Do NOT automatically mark any student as Present or Absent!
    const initialRecords = {};
    const initialRemarks = {};
    students.forEach(st => {
      initialRecords[st.id] = null; // Unmarked! Checkbox is unchecked
      initialRemarks[st.id] = '';
    });

    setAttRecords(initialRecords);
    setAttRemarks(initialRemarks);
    setAttendanceStep('marking');
    setUnmarkedAlert(null);

    if (showToast) {
      showToast(`Loaded ${students.length} students. Checkboxes start unmarked.`);
    }
  };

  // Sync loaded students with student updates if currently in marking view
  useEffect(() => {
    if (attendanceStep === 'marking' && hasLoadedStudents) {
      const refreshed = getStudentsForAcademicGroup({
        department: attDept,
        semester: attSem,
        division: attDiv,
        batch: attBatch,
        academicYear: attYear,
        subjectId: attSubjectId
      }, currentFaculty);
      if (refreshed && refreshed.length > 0) {
        setLoadedStudents(refreshed);
      }
    }
  }, [studentsTick, electivesTick, attDept, attSem, attDiv, attBatch, attYear, attSubjectId]);

  const classStudents = loadedStudents;

  // Attendance counts
  const presentCount = useMemo(() => {
    return classStudents.filter(s => attRecords[s.id] === 'present').length;
  }, [classStudents, attRecords]);

  const absentCount = useMemo(() => {
    return classStudents.filter(s => attRecords[s.id] === 'absent').length;
  }, [classStudents, attRecords]);

  const unmarkedCount = useMemo(() => {
    return classStudents.filter(s => {
      const st = attRecords[s.id];
      return !st || (st !== 'present' && st !== 'absent' && st !== 'od');
    }).length;
  }, [classStudents, attRecords]);

  const exceptionCount = useMemo(() => {
    return classStudents.filter(s => {
      const stStatus = attRecords[s.id];
      const excCheck = isStudentExcusedForSession(s.id, attDate, attTimeSlot, attSubjectId);
      return stStatus === 'od' || stStatus === 'exception' || excCheck.isExcused;
    }).length;
  }, [classStudents, attRecords, attDate, attTimeSlot, attSubjectId, exceptionsTick]);

  const attendancePct = useMemo(() => {
    if (classStudents.length === 0) return '0.0';
    if (activePolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE) {
      return (((presentCount + exceptionCount) / classStudents.length) * 100).toFixed(1);
    } else if (activePolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION) {
      const eff = Math.max(0, classStudents.length - exceptionCount);
      return eff > 0 ? ((presentCount / eff) * 100).toFixed(1) : '100.0';
    }
    return ((presentCount / classStudents.length) * 100).toFixed(1);
  }, [classStudents.length, presentCount, exceptionCount, activePolicy]);

  // Bulk status controls
  const handleMarkAllStatus = (status) => {
    const updated = {};
    classStudents.forEach(s => {
      const excCheck = isStudentExcusedForSession(s.id, attDate, attTimeSlot, attSubjectId);
      if (excCheck && excCheck.isExcused && status === 'absent') {
        updated[s.id] = 'od';
      } else {
        updated[s.id] = status;
      }
    });
    setAttRecords(updated);
    setUnmarkedAlert(null);
    if (showToast) showToast(`All ${classStudents.length} students marked as ${status.toUpperCase()}`);
  };

  const handleMarkRemainingAbsent = () => {
    setAttRecords(prev => {
      const updated = { ...prev };
      classStudents.forEach(s => {
        if (updated[s.id] !== 'present' && updated[s.id] !== 'od') {
          updated[s.id] = 'absent';
        }
      });
      return updated;
    });
    setUnmarkedAlert(null);
    if (showToast) showToast('Remaining unmarked students marked as Absent');
  };

  const handleResetAllUnmarked = () => {
    const reset = {};
    classStudents.forEach(s => { reset[s.id] = null; });
    setAttRecords(reset);
    setUnmarkedAlert(null);
    if (showToast) showToast('Attendance reset: all students unmarked');
  };

  const handleStudentStatusToggle = (studentId, newStatus) => {
    setAttRecords(prev => ({
      ...prev,
      [studentId]: newStatus
    }));
    setUnmarkedAlert(null);
  };

  // Detect previously recorded session for current lecture parameters
  const existingSessionForSlot = useMemo(() => {
    const slotStr = `${attStartTime} - ${attEndTime}`;
    const normCurSlot = normalizeTimeSlot(slotStr);
    return facultySessions.find(s => 
      s.date === attDate &&
      normalizeTimeSlot(s.timeSlot || `${s.startTime} - ${s.endTime}`) === normCurSlot &&
      (s.subjectId === attSubjectId || s.subjectName === attSubjectName) &&
      (s.classId === activeClass?.id || (normalizeSem(s.sem) === normalizeSem(attSem) && normalizeDiv(s.division) === normalizeDiv(attDiv))) &&
      (s.batch || 'ALL') === (attBatch || 'ALL')
    ) || null;
  }, [facultySessions, attDate, attStartTime, attEndTime, attSubjectId, attSubjectName, activeClass, attSem, attDiv, attBatch]);

  // Submit attendance to database (Completely independent of timetable)
  const executeSaveAttendance = (recordsToSave) => {
    if (isSavingAttendance) return;
    setIsSavingAttendance(true);

    const slotStr = `${attStartTime} - ${attEndTime}`;
    const normCurSlot = normalizeTimeSlot(slotStr);
    const isElective = Boolean(activeClass?.isElective || attDept === 'Elective (No Department)' || attDept === 'Elective');

    // Check for duplicate attendance record for this exact lecture slot
    const duplicate = facultySessions.find(s => 
      s.date === attDate &&
      normalizeTimeSlot(s.timeSlot || `${s.startTime} - ${s.endTime}`) === normCurSlot &&
      (s.subjectId === attSubjectId || s.subjectName === attSubjectName) &&
      (s.classId === activeClass?.id || (normalizeSem(s.sem) === normalizeSem(attSem) && normalizeDiv(s.division) === normalizeDiv(attDiv))) &&
      (s.batch || 'ALL') === (attBatch || 'ALL')
    );

    // Finalize records: preserve explicit present, mark approved exception only if excused, and enrich with enrollmentNo
    const finalRecords = { ...recordsToSave };
    classStudents.forEach(st => {
      const cur = finalRecords[st.id];
      const excCheck = isStudentExcusedForSession(st.id, attDate, slotStr, attSubjectId);
      if (cur === 'absent' && excCheck && excCheck.isExcused) {
        finalRecords[st.id] = 'od';
      }
      if (st.enrollmentNo && finalRecords[st.id] !== undefined) {
        finalRecords[st.enrollmentNo] = finalRecords[st.id];
      }
    });

    const curPresent = classStudents.filter(s => finalRecords[s.id] === 'present').length;
    const curAbsent = classStudents.filter(s => finalRecords[s.id] === 'absent').length;
    const curException = classStudents.filter(s => {
      const st = finalRecords[s.id];
      const excCheck = isStudentExcusedForSession(s.id, attDate, slotStr, attSubjectId);
      return st === 'od' || st === 'exception' || excCheck.isExcused;
    }).length;
    const curPct = classStudents.length > 0 ? ((curPresent / classStudents.length) * 100).toFixed(1) : '0.0';

    const sessionPayload = {
      id: (!isExtraLecture && duplicate) ? duplicate.id : undefined,
      date: attDate,
      startTime: attStartTime,
      endTime: attEndTime,
      timeSlot: slotStr,
      isExtraLecture: !!isExtraLecture,
      subjectId: attSubjectId,
      subjectName: attSubjectName,
      facultyId: currentFaculty.id,
      facultyName: currentFaculty.name,
      department: isElective ? 'Elective (No Department)' : attDept,
      sem: attSem,
      division: attDiv,
      batch: isElective ? 'ALL' : attBatch,
      academicYear: attYear,
      room: attRoom || 'Room 201',
      classId: activeClass ? activeClass.id : null,
      classType: isElective ? 'elective' : 'regular',
      isElective: isElective,
      topic: attTopic.trim() || 'General Lecture',
      records: finalRecords,
      remarks: attRemarks,
      totalStudents: classStudents.length,
      presentCount: curPresent,
      absentCount: curAbsent,
      exceptionCount: curException,
      percentage: curPct,
      submittedAt: new Date().toISOString()
    };

    try {
      const saveRes = saveSession(sessionPayload, currentFaculty);
      if (saveRes && saveRes.success === false) {
        throw new Error(saveRes.error || 'Failed to save attendance record.');
      }
      reloadSessions();
      if (showToast) {
        showToast(`Attendance saved successfully! (${curPresent} Present, ${curAbsent} Absent${curException > 0 ? `, ${curException} Excused` : ''})`);
      }

      // Synchronize register navigation state
      setRegNavDept(attDept);
      setRegNavSem(attSem);
      setRegNavDiv(attDiv);
      setRegNavBatch(attBatch);
      setRegNavSubId(attSubjectId);

      // Automatically transition to Attendance Register
      if (activeClass?.id) setRegClassId(activeClass.id);
      if (attSubjectId) setRegSubjectId(attSubjectId);
      setAttendanceStep('setup');
      setHasLoadedStudents(false);
      setFacultyTab('register');
    } catch (err) {
      if (showToast) showToast(`Failed to save attendance: ${err.message}`, 'error');
      setUnmarkedAlert(`Failed to save attendance: ${err.message}`);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleSubmitAttendance = (e) => {
    if (e) e.preventDefault();

    if (classStudents.length === 0) {
      const msg = 'Cannot save attendance: No students loaded for this class. Please click "Load Students" first.';
      if (showToast) showToast(msg, 'error');
      setUnmarkedAlert(msg);
      return;
    }

    if (!attTopic || !attTopic.trim()) {
      const msg = 'Topic / Syllabus Covered is required. Please specify what was taught in this session before saving.';
      if (showToast) showToast(msg, 'error');
      setUnmarkedAlert(msg);
      const topicInput = document.getElementById('att-topic-input');
      if (topicInput) {
        topicInput.focus();
        topicInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const unmarkList = classStudents.filter(s => {
      const st = attRecords[s.id];
      return !st || (st !== 'present' && st !== 'absent' && st !== 'od');
    });

    if (unmarkList.length > 0) {
      const msg = `Attendance submission blocked: ${unmarkList.length} of ${classStudents.length} student(s) remain unmarked. Every student must be explicitly marked. Click "Mark Remaining as Absent" to resolve.`;
      setUnmarkedAlert(msg);
      if (showToast) {
        showToast(`Cannot submit: ${unmarkList.length} student(s) remain unmarked. Please mark all students before saving.`, 'error');
      }
      return;
    }

    executeSaveAttendance(attRecords);
  };

  // -------------------------------------------------------------
  // 4B. ATTENDANCE REGISTER (ERP MATRIX VIEW & EXPORTS)
  // -------------------------------------------------------------
  const allClasses = useMemo(() => getClasses(), [classesTick]);
  const allSubjects = useMemo(() => getSubjects(), []);

  // Faculty timetable entries to find classes and subjects assigned to this faculty
  const facultyEntries = useMemo(() => {
    return getEntriesByFaculty(currentFaculty.id);
  }, [currentFaculty.id, timetableSyncTick]);

  // Distinct classes relevant for this faculty (Strictly assignment-based, no department leakage)
  const facultyClasses = useMemo(() => {
    if (currentFaculty.role === 'admin' || currentFaculty.id === 'FAC_ADMIN') {
      return allClasses;
    }
    return (authorizedClasses && authorizedClasses.length > 0) ? authorizedClasses : [];
  }, [allClasses, authorizedClasses, currentFaculty]);

  // Selected Class in Register
  const [regClassId, setRegClassId] = useState('CLASS_DEP_AI_3_1_2026-27');
  
  const selectedRegClass = useMemo(() => {
    return allClasses.find(c => c.id === regClassId) || 
           facultyClasses.find(c => c.id === regClassId) || 
           facultyClasses[0] || 
           allClasses[0] || null;
  }, [allClasses, facultyClasses, regClassId]);

  // Relevant subjects for this faculty (Strictly assignment-based)
  const facultySubjects = useMemo(() => {
    if (currentFaculty.role === 'admin' || currentFaculty.id === 'FAC_ADMIN') {
      return allSubjects;
    }
    const list = allSubjects.filter(s => {
      const isAssigned = (s.facultyId && s.facultyId === currentFaculty.id) ||
                         (s.faculty && s.faculty.trim().toLowerCase() === (currentFaculty.name || '').trim().toLowerCase());
      const inTimetable = facultyEntries.some(e => 
        e.subjectId === s.id || 
        e.subjectId === s.shortName || 
        e.subjectName === s.shortName || 
        e.subjectFullName === s.name
      );
      const inAuthorized = authorizedSubjects.some(as => as.id === s.id || as.code === s.code);
      return isAssigned || inTimetable || inAuthorized;
    });
    return list.length > 0 ? list : authorizedSubjects;
  }, [allSubjects, currentFaculty, facultyEntries, authorizedSubjects]);

  // Selected Subject in Register
  const [regSubjectId, setRegSubjectId] = useState('SUB_AI_DBMS');

  const selectedRegSubject = useMemo(() => {
    return allSubjects.find(s => s.id === regSubjectId) || 
           facultySubjects.find(s => s.id === regSubjectId) || 
           facultySubjects[0] || 
           allSubjects[0] || null;
  }, [allSubjects, facultySubjects, regSubjectId]);

  // Academic Year & Term
  const [regAcademicYear, setRegAcademicYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [regTerm, setRegTerm] = useState('Odd');

  // Search & Filter state
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('ALL'); // 'ALL', 'SHORTAGE', 'ELIGIBLE'
  const [regDateFrom, setRegDateFrom] = useState('');
  const [regDateTo, setRegDateTo] = useState('');

  // 1. AUTOMATIC STUDENT EXTRACTION FROM ADMIN CLASSES
  const registerStudents = useMemo(() => {
    if (selectedRegClass && selectedRegClass.id) {
      const enrolled = getStudentsByClassId(selectedRegClass.id);
      if (enrolled && enrolled.length > 0) return enrolled;
    }
    if (selectedRegClass) {
      const criteria = getStudentsForClassCriteria(
        selectedRegClass.departmentName || currentFaculty.dept,
        selectedRegClass.semester,
        selectedRegClass.division,
        selectedRegClass.academicYear || regAcademicYear
      );
      if (criteria && criteria.length > 0) return criteria;
    }
    return [];
  }, [selectedRegClass, currentFaculty.dept, regAcademicYear, studentsTick]);

  // 2. SESSIONS RETRIEVAL & FILTERING FOR SELECTED CLASS & SUBJECT
  const registerSessions = useMemo(() => {
    return allSessions
      .filter(sess => {
        // Subject match
        const matchSubj = sess.subjectId === regSubjectId || 
          sess.subjectId === selectedRegSubject?.shortName ||
          sess.subjectName === selectedRegSubject?.name ||
          (sess.subjectName && selectedRegSubject?.name && sess.subjectName.toLowerCase() === selectedRegSubject.name.toLowerCase());
        if (!matchSubj) return false;

        // Class match
        if (selectedRegClass) {
          const matchClassId = sess.classId && sess.classId === selectedRegClass.id;
          const matchSemDiv = normalizeSem(sess.sem) === normalizeSem(selectedRegClass.semester) &&
                              normalizeDiv(sess.division) === normalizeDiv(selectedRegClass.division);
          if (!matchClassId && !matchSemDiv) return false;
        }

        // Date range filters
        if (regDateFrom && sess.date < regDateFrom) return false;
        if (regDateTo && sess.date > regDateTo) return false;

        return true;
      })
      .sort((a, b) => {
        const timeA = a.timeSlot ? a.timeSlot.split('-')[0].trim() : '00:00';
        const timeB = b.timeSlot ? b.timeSlot.split('-')[0].trim() : '00:00';
        return new Date(`${a.date}T${timeA.length === 4 ? '0' + timeA : timeA}`) - 
               new Date(`${b.date}T${timeB.length === 4 ? '0' + timeB : timeB}`);
      });
  }, [allSessions, regSubjectId, selectedRegSubject, selectedRegClass, regDateFrom, regDateTo]);

  // 3. FILTERED STUDENTS FOR REGISTER (SEARCH + STATUS FILTER)
  const registerStudentsFiltered = useMemo(() => {
    return registerStudents.filter(st => {
      const q = regSearchQuery.trim().toLowerCase();
      const matchQ = !q || 
        (st.name && st.name.toLowerCase().includes(q)) ||
        (st.enrollmentNo && st.enrollmentNo.toLowerCase().includes(q)) ||
        (st.rollNo && String(st.rollNo).includes(q));
      if (!matchQ) return false;

      let presentCount = 0;
      registerSessions.forEach(sess => {
        const stStatus = sess.records && sess.records[st.id];
        if (stStatus === 'present' || stStatus === 'late' || stStatus === 'od') {
          presentCount++;
        }
      });
      const pct = registerSessions.length > 0 ? (presentCount / registerSessions.length) * 100 : 0;

      if (regStatusFilter === 'SHORTAGE') return pct < 75;
      if (regStatusFilter === 'ELIGIBLE') return pct >= 75;
      return true;
    });
  }, [registerStudents, regSearchQuery, regStatusFilter, registerSessions]);

  // 4. STATS & ANALYTICS
  const { classAveragePct, eligibleStudentsCount, shortageStudentsCount } = useMemo(() => {
    if (registerStudents.length === 0 || registerSessions.length === 0) {
      return { classAveragePct: '0.00', eligibleStudentsCount: 0, shortageStudentsCount: 0 };
    }
    let totalPctSum = 0;
    let elig = 0;
    let short = 0;

    registerStudents.forEach(st => {
      let p = 0;
      registerSessions.forEach(sess => {
        const s = sess.records && sess.records[st.id];
        if (s === 'present' || s === 'late' || s === 'od') p++;
      });
      const pct = (p / registerSessions.length) * 100;
      totalPctSum += pct;
      if (pct >= 75) elig++;
      else short++;
    });

    return {
      classAveragePct: (totalPctSum / registerStudents.length).toFixed(2),
      eligibleStudentsCount: elig,
      shortageStudentsCount: short
    };
  }, [registerStudents, registerSessions]);

  // Format Date & Session column header
  const formatSessionHeader = (sess, allSess) => {
    if (!sess || !sess.date) return { main: 'Lecture', sub: null };
    const parts = sess.date.split('-');
    let dateFormatted = sess.date;
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      const mName = (mIdx >= 0 && mIdx < 12) ? monthNames[mIdx] : parts[1];
      dateFormatted = `${parts[2]} ${mName}`;
    }

    const sameDateSessions = allSess.filter(s => s.date === sess.date);
    if (sameDateSessions.length > 1) {
      const timePart = sess.timeSlot ? sess.timeSlot.split('-')[0].trim() : '';
      return {
        main: dateFormatted,
        sub: timePart || sess.timeSlot || ''
      };
    }
    return {
      main: dateFormatted,
      sub: null
    };
  };

  // Interactive inline cell click handler
  const handleRegisterCellClick = (session, studentId) => {
    // Validate permission
    if (session.facultyId && session.facultyId !== currentFaculty.id && 
        session.facultyName && session.facultyName.toLowerCase() !== currentFaculty.name.toLowerCase()) {
      alert(`Permission Denied: This session was recorded by ${session.facultyName || 'another faculty member'}. You can only edit your own sessions.`);
      return;
    }

    const currentStatus = (session.records && session.records[studentId]) || 'absent';
    let nextStatus = 'present';
    if (currentStatus === 'present') nextStatus = 'absent';
    else if (currentStatus === 'absent') nextStatus = 'od';
    else if (currentStatus === 'od') nextStatus = 'present';

    const updatedRecords = { ...(session.records || {}), [studentId]: nextStatus };
    
    let pCount = 0;
    let aCount = 0;
    Object.values(updatedRecords).forEach(val => {
      if (val === 'present' || val === 'late' || val === 'od') pCount++;
      else if (val === 'absent') aCount++;
    });

    const updatedSession = {
      ...session,
      records: updatedRecords,
      presentCount: pCount,
      absentCount: aCount,
      percentage: (pCount + aCount) > 0 ? ((pCount / (pCount + aCount)) * 100).toFixed(1) : session.percentage
    };

    saveSession(updatedSession);
    reloadSessions();
    if (showToast) {
      showToast(`Updated Roll #${studentId}: marked as ${nextStatus.toUpperCase()}`);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const xlsxLib = typeof window !== 'undefined' && window.XLSX ? window.XLSX : null;
    if (!xlsxLib) {
      alert('Spreadsheet engine (XLSX) is not ready yet.');
      return;
    }

    const headerRow1 = [getCollegeName()];
    const headerRow2 = [`Academic Year: ${regAcademicYear}`, `Term: ${regTerm}`];
    const headerRow3 = [`Subject: ${selectedRegSubject?.code || ''} ${selectedRegSubject?.name || selectedRegSubject?.shortName || 'Course'}`];
    const headerRow4 = [
      `Department: ${selectedRegClass?.departmentName || currentFaculty.dept}`, 
      `Class: ${selectedRegClass?.semester || ''} ${selectedRegClass?.division || ''}`,
      `Faculty: ${currentFaculty.name}`
    ];
    const emptyRow = [];

    const dateHeaders = registerSessions.map(s => {
      const h = formatSessionHeader(s, registerSessions);
      return h.sub ? `${h.main} (${h.sub})` : h.main;
    });

    const tableHeader = [
      'Sr No',
      'Enrollment No',
      'Student Name',
      ...dateHeaders,
      'Total Present',
      'Total Lectures',
      'Percentage (%)'
    ];

    const dataRows = registerStudentsFiltered.map((st, idx) => {
      let present = 0;
      const total = registerSessions.length;

      const dateStatuses = registerSessions.map(sess => {
        const status = (sess.records && sess.records[st.id]) || '';
        if (status === 'present' || status === 'late') {
          present++;
          return 'P';
        } else if (status === 'od') {
          present++;
          return 'O*';
        } else if (status === 'absent') {
          return 'A';
        }
        return '-';
      });

      const pct = total > 0 ? ((present / total) * 100).toFixed(2) : '0.00';

      return [
        idx + 1,
        st.enrollmentNo,
        st.name,
        ...dateStatuses,
        present,
        total,
        Number(pct)
      ];
    });

    const summaryRow = ['Total Present', '', ''];
    registerSessions.forEach(sess => {
      let count = 0;
      registerStudentsFiltered.forEach(st => {
        const s = (sess.records && sess.records[st.id]);
        if (s === 'present' || s === 'late' || s === 'od') count++;
      });
      summaryRow.push(count);
    });
    summaryRow.push('', '', '');

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

    const wb = xlsxLib.utils.book_new();
    const ws = xlsxLib.utils.aoa_to_sheet(sheetData);

    ws['!cols'] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 24 },
      ...registerSessions.map(() => ({ wch: 12 })),
      { wch: 14 },
      { wch: 14 },
      { wch: 16 }
    ];

    xlsxLib.utils.book_append_sheet(wb, ws, "Attendance Register");
    const fileName = `${(selectedRegSubject?.shortName || 'Course').replace(/\s+/g, '_')}_Attendance_Register_${regAcademicYear}.xlsx`;
    xlsxLib.writeFile(wb, fileName);

    if (showToast) showToast('Attendance register exported to Excel successfully!');
  };

  const handlePrint = () => {
    window.print();
  };



  // Filtered student list for Take Attendance view
  const filteredStudents = useMemo(() => {
    return classStudents.filter(st => {
      const matchSearch = !studentSearch || 
        (st.name && st.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (st.enrollmentNo && st.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (st.rollNo && String(st.rollNo).includes(studentSearch));
      
      const rawStatus = attRecords[st.id];
      const isUnmarked = !rawStatus || (rawStatus !== 'present' && rawStatus !== 'absent' && rawStatus !== 'od' && rawStatus !== 'exception');
      const isPres = rawStatus === 'present';
      const isAbs = rawStatus === 'absent';
      const currentActiveSubjectId = attSubjectId;
      const excCheck = isStudentExcusedForSession(st.id, attDate, attTimeSlot, currentActiveSubjectId);
      const isExc = excCheck.isExcused || rawStatus === 'od' || rawStatus === 'exception';

      let matchFilter = true;
      if (statusFilter === 'all') {
        matchFilter = true;
      } else if (statusFilter === 'present') {
        matchFilter = isPres;
      } else if (statusFilter === 'absent') {
        matchFilter = isAbs;
      } else if (statusFilter === 'unmarked') {
        matchFilter = isUnmarked;
      } else if (statusFilter === 'exceptions') {
        matchFilter = isExc;
      }

      return matchSearch && matchFilter;
    });
  }, [classStudents, studentSearch, statusFilter, attRecords, attDate, attTimeSlot, attSubjectId, exceptionsTick]);

  // Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'My Timetable', icon: Calendar },
    { id: 'take', label: 'Take Attendance', icon: UserCheck },
    { id: 'register', label: 'Attendance Register', icon: FileSpreadsheet },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* ===================================================================
          FACULTY DEDICATED DARK-NAVY SIDEBAR
          =================================================================== */}
      <aside 
        className="no-print"
        style={{
          width: '260px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid #1e293b'
        }}
      >
        {/* Sidebar Header & College Tag */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#60a5fa',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <GraduationCap size={13} />
            <span>Faculty Portal</span>
          </div>

          <h2 style={{
            fontSize: '19px',
            fontWeight: '800',
            color: '#ffffff',
            margin: '0 0 4px',
            fontFamily: "'Outfit', sans-serif"
          }}>
            ADIT Attendance
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
            {currentFaculty.dept || 'Engineering College'}
          </p>
        </div>

        {/* Faculty Mini Profile Badge */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1e293b',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#2563eb',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '16px',
            boxShadow: '0 4px 8px rgba(37, 99, 235, 0.3)',
            flexShrink: 0
          }}>
            {currentFaculty.name?.charAt(0) || 'P'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{
              fontSize: '13.5px',
              fontWeight: '700',
              color: '#ffffff',
              margin: 0,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>
              {currentFaculty.name}
            </h4>
            <span style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: '600' }}>
              {currentFaculty.id}
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = facultyTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setFacultyTab(item.id);
                      if (item.id === 'take') setAttendanceStep('setup');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: isActive ? '#2563eb' : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontWeight: isActive ? '700' : '600',
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                    }}
                  >
                    <Icon size={18} color={isActive ? '#ffffff' : '#64748b'} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer: Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b' }}>
          <button
            type="button"
            onClick={() => {
              logoutUser();
              if (onExit) onExit();
              else window.location.reload();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: 'transparent',
              color: '#f87171',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ===================================================================
          MAIN CONTENT VIEWPORT
          =================================================================== */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '28px 36px 48px' }}>
        
        {/* =================================================================
            VIEW 1: FACULTY DASHBOARD
            ================================================================= */}
        {facultyTab === 'dashboard' && (
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Welcome Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              borderRadius: '16px',
              padding: '28px 32px',
              color: 'white',
              marginBottom: '28px',
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '10px'
                }}>
                  <Sparkles size={14} />
                  <span>Faculty Academic Workspace</span>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'white', margin: '0 0 6px', fontFamily: "'Outfit', sans-serif" }}>
                  Welcome back, {currentFaculty.name}!
                </h1>
                <p style={{ fontSize: '13.5px', color: '#dbeafe', margin: 0 }}>
                  {currentFaculty.designation || 'Faculty Member'} • Department of {currentFaculty.dept} • ID: {currentFaculty.id}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => { setAttendanceStep('setup'); setFacultyTab('take'); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#ffffff',
                    color: '#1e3a8a',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <UserCheck size={16} />
                  <span>Take Attendance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFacultyTab('register')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <FileSpreadsheet size={16} />
                  <span>Attendance Register</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFacultyTab('timetable')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  <Calendar size={16} />
                  <span>My Timetable</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 320px))',
              gap: '20px',
              marginBottom: '28px'
            }}>
              <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Today's Scheduled Lectures</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
                  {todayScheduledLectures.length}
                </div>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                  {currentDayName || 'Today'} schedule
                </span>
              </div>
            </div>

            {/* Today's Lectures Schedule Section */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                    Today's Lecture Schedule ({currentDayName}, {todayDateStr})
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Automatically synchronized from Admin Master Timetable. Click to record or review attendance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFacultyTab('timetable')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  <span>View Full Week</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              {todayLecturesWithStatus.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1'
                }}>
                  <Calendar size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', margin: '0 0 6px' }}>
                    No Scheduled Lectures for {currentDayName}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 16px' }}>
                    You have no lectures scheduled for today in the master timetable. You can view your full weekly schedule or take custom attendance.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setFacultyTab('timetable')}
                  >
                    Open Weekly Timetable
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {todayLecturesWithStatus.map((lec, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '18px',
                        borderRadius: '12px',
                        border: lec.isCompleted ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                        backgroundColor: lec.isCompleted ? '#f0fdf4' : '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Time & Status Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            color: '#1e3a8a',
                            backgroundColor: '#eff6ff',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}>
                            <Clock size={13} />
                            {lec.time}
                          </span>

                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            color: lec.isCompleted ? '#059669' : '#d97706',
                            backgroundColor: lec.isCompleted ? '#ecfdf5' : '#fffbeb',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            border: `1px solid ${lec.isCompleted ? '#a7f3d0' : '#fde68a'}`
                          }}>
                            {lec.isCompleted ? <Check size={12} /> : <Clock size={12} />}
                            {lec.isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </div>

                        {/* Subject Title */}
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                          {lec.subjectName || lec.subjectId}
                        </h4>

                        {/* Class Info */}
                        <div style={{ fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '12px' }}>
                          {lec.sem} • {lec.div} {lec.room ? `• Room ${lec.room}` : ''}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => selectLectureForAttendance(lec)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: lec.isCompleted ? '#059669' : '#2563eb',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                        }}
                      >
                        {lec.isCompleted ? <Eye size={15} /> : <UserCheck size={15} />}
                        <span>{lec.isCompleted ? 'Re-open Attendance' : 'Take Attendance'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Access Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div 
                className="card" 
                style={{ padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                onClick={() => setFacultyTab('register')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Attendance Register</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>Class P/A matrix, defaulters &amp; export</p>
                  </div>
                </div>
              </div>

              <div 
                className="card" 
                style={{ padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                onClick={() => setFacultyTab('timetable')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>My Weekly Timetable</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>View entire weekly lecture grid &amp; slots</p>
                  </div>
                </div>
              </div>



              <div 
                className="card" 
                style={{ padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                onClick={() => setFacultyTab('profile')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Faculty Profile</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>Department info, workload &amp; contact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            VIEW 2: FACULTY TIMETABLE (SYNCHRONIZED WITH ADMIN PANEL)
            ================================================================= */}
        {facultyTab === 'timetable' && (
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {/* Header Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', fontFamily: "'Outfit', sans-serif" }}>
                  My Academic Timetable
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Showing schedule for {currentFaculty.name} ({currentFaculty.id}) • Live synchronized from Admin Panel
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsWeeklyGridView(!isWeeklyGridView)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                    backgroundColor: isWeeklyGridView ? '#eff6ff' : '#ffffff',
                    color: '#2563eb',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <Table2 size={16} />
                  <span>{isWeeklyGridView ? 'Switch to Day View' : 'Full Weekly Grid'}</span>
                </button>

                {/* Download Official Template (Excel .xlsx) */}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm no-print"
                  onClick={() => {
                    downloadFacultyTimetableTemplate(currentFaculty.name, currentFaculty.dept, 'ODD/EVEN', currentFaculty.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  title="Download Official ADIT CVM University Excel Template"
                >
                  <FileSpreadsheet size={15} color="#16a34a" />
                  <span>Download Excel</span>
                </button>

                {/* Download Template (CSV) */}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm no-print"
                  onClick={() => {
                    downloadFacultyTimetableCsv(currentFaculty.name, currentFaculty.dept, 'ODD/EVEN', currentFaculty.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  title="Download Official Faculty Template in CSV format"
                >
                  <Download size={15} color="#2563eb" />
                  <span>Download CSV</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}
                >
                  <Printer size={15} />
                  <span>Print Timetable</span>
                </button>
              </div>
            </div>

            {/* OFFICIAL ADIT & CVM UNIVERSITY INSTITUTIONAL HEADER */}
            <div className="official-timetable-header-card" style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '21px', fontWeight: '900', color: '#1e3a8a', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                A D Patel Institute of Technology
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#334155', marginTop: '3px' }}>
                The Charutar Vidya Mandal (CVM) University
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginTop: '6px' }}>
                Timetable for the ODD / EVEN Semester of Academic Year 2025 - 2026
              </div>

              {/* Cream-coloured institutional details matching official template */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginTop: '16px',
                padding: '12px 18px',
                backgroundColor: '#fffdf0',
                border: '1px solid #fef08a',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '12.5px'
              }}>
                <div>
                  <span style={{ color: '#713f12', fontWeight: '700' }}>Name of Faculty: </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{currentFaculty.name}</span>
                </div>
                <div>
                  <span style={{ color: '#713f12', fontWeight: '700' }}>Department: </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{currentFaculty.dept || 'AI & Data Science'}</span>
                </div>
                <div>
                  <span style={{ color: '#713f12', fontWeight: '700' }}>Faculty Code: </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{currentFaculty.id || 'FAC_PS'}</span>
                </div>
                <div>
                  <span style={{ color: '#713f12', fontWeight: '700' }}>Program Code: </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>B.Tech (ADIT)</span>
                </div>
                <div>
                  <span style={{ color: '#713f12', fontWeight: '700' }}>Effective from: </span>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>01/07/2026</span>
                </div>
              </div>
            </div>

            {/* Day Selector Tabs (when not in full weekly grid view) */}
            {!isWeeklyGridView && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                overflowX: 'auto',
                paddingBottom: '4px'
              }}>
                {TIMETABLE_DAYS.map((day) => {
                  const isCurrent = selectedTimetableDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedTimetableDay(day)}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '10px',
                        border: isCurrent ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isCurrent ? '#2563eb' : '#ffffff',
                        color: isCurrent ? '#ffffff' : '#475569',
                        fontWeight: isCurrent ? '700' : '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                        boxShadow: isCurrent ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none'
                      }}
                    >
                      {day}
                      {day === todayDayName && (
                        <span style={{
                          marginLeft: '6px',
                          fontSize: '10.5px',
                          backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.25)' : '#eff6ff',
                          color: isCurrent ? '#ffffff' : '#2563eb',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontWeight: '800'
                        }}>
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* DAY VIEW OF TIMETABLE */}
            {!isWeeklyGridView && (
              <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
                  Schedule for {selectedTimetableDay}
                </h3>

                {(() => {
                  const daySlots = facultyTimetableGrid[selectedTimetableDay] || {};
                  const isLunchTime = (t) => t.toUpperCase().includes('LUNCH') || t.startsWith('12:40') || normalizeTimeSlot(t) === '12:40 - 1:25';

                  // Sort active slots chronologically
                  const rawActiveKeys = Object.keys(daySlots).filter(t => daySlots[t] && daySlots[t].subject);
                  rawActiveKeys.sort((a, b) => {
                    const ma = parseTimeRangeMinutes(a)?.startMin ?? 0;
                    const mb = parseTimeRangeMinutes(b)?.startMin ?? 0;
                    return ma - mb;
                  });

                  // Group consecutive slots belonging to the same scheduled session
                  const groupedDaySlots = [];
                  for (let i = 0; i < rawActiveKeys.length; i++) {
                    const t = rawActiveKeys[i];
                    const slot = daySlots[t];
                    if (slot.isContinuation) continue;
                    const mergedList = [slot];
                    
                    const slotParts = (slot.timeSlot || t).split(/[-–—]/);
                    const firstStart = slotParts[0]?.trim() || '09:00';
                    let lastEnd = slotParts[1]?.trim() || '09:55';

                    let j = i + 1;
                    while (j < rawActiveKeys.length) {
                      const nextT = rawActiveKeys[j];
                      if (isLunchTime(nextT)) break;
                      const nextSlot = daySlots[nextT];
                      if (nextSlot && canMergeConsecutiveSlots(slot, nextSlot)) {
                        mergedList.push(nextSlot);
                        const nextParts = (nextSlot.timeSlot || nextT).split(/[-–—]/);
                        lastEnd = nextParts[1]?.trim() || lastEnd;
                        j++;
                      } else {
                        break;
                      }
                    }

                    const span = mergedList.length;
                    const timeRange = span > 1 ? `${firstStart}–${lastEnd}` : (slot.timeSlot || t);
                    const mergedDaySlot = {
                      ...slot,
                      time: timeRange,
                      timeSlot: timeRange,
                      span,
                      isMultiSlot: span > 1,
                      allMergedSlots: mergedList
                    };

                    groupedDaySlots.push({ timeRange, slot: mergedDaySlot, span, isMulti: span > 1 });
                    i = j - 1;
                  }

                  if (groupedDaySlots.length === 0) {
                    return (
                      <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px dashed #cbd5e1'
                      }}>
                        <Calendar size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#334155', margin: '0 0 4px' }}>
                          No Lectures Scheduled for {selectedTimetableDay}
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                          You have no timetable assignments for this day.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                      {groupedDaySlots.map(({ timeRange, slot, span, isMulti }) => {
                        return (
                          <div
                            key={timeRange + slot.id}
                            className="timetable-day-card"
                            onClick={() => selectLectureForAttendance({
                              ...slot,
                              time: timeRange,
                              timeSlot: timeRange,
                              day: selectedTimetableDay,
                              subjectId: slot.subjectId || slot.subject,
                              subjectName: slot.name || slot.subject,
                              sem: slot.sem,
                              div: slot.div,
                              batch: slot.batch || 'ALL',
                              room: slot.room,
                              isMultiSlot: isMulti,
                              span: span,
                              allMergedSlots: slot.allMergedSlots
                            }, slot.rescheduledDate || getDateForDayName(selectedTimetableDay))}
                            style={{
                              padding: '18px',
                              borderRadius: '12px',
                              border: `1px solid ${slot.isRescheduled ? '#f59e0b' : '#e2e8f0'}`,
                              backgroundColor: slot.isRescheduled ? '#fffbeb' : '#ffffff',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              cursor: 'pointer'
                            }}
                            title={isMulti ? `Click to take attendance for this ${span}-period session (${timeRange})` : "Click to take attendance"}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  color: isMulti ? '#1e40af' : '#1e3a8a',
                                  backgroundColor: isMulti ? '#dbeafe' : '#eff6ff',
                                  padding: '3px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {timeRange}
                                </span>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  {slot.isRescheduled && (
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: '800',
                                      backgroundColor: '#fef3c7',
                                      color: '#b45309',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid #fde68a'
                                    }}>
                                      Rescheduled
                                    </span>
                                  )}
                                  {isMulti && (
                                    <span style={{
                                      fontSize: '10.5px',
                                      fontWeight: '800',
                                      backgroundColor: '#e0e7ff',
                                      color: '#4338ca',
                                      padding: '2px 8px',
                                      borderRadius: '4px'
                                    }}>
                                      🔬 {span} Periods / Lab
                                    </span>
                                  )}
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    {slot.type || (isMulti ? 'Practical Lab' : 'Lecture')}
                                  </span>
                                </div>
                              </div>

                              <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                                {slot.name || slot.subject}
                              </h4>
                              {(() => {
                                const resolvedDeptObj = resolveDepartment(slot.departmentId || slot.department || slot.departmentName);
                                const deptDisplay = resolvedDeptObj ? resolvedDeptObj.name : (slot.department || slot.departmentName || '');
                                return (
                                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px', fontWeight: '600' }}>
                                    {slot.sem}{deptDisplay ? ` • ${deptDisplay}` : ''} • {slot.div} {slot.batch && slot.batch !== 'ALL' ? `(${slot.batch})` : ''} {slot.room ? `• ${slot.room}` : ''}
                                  </p>
                                );
                              })()}
                            </div>

                            <div style={{ marginTop: '8px' }} onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="btn-take-attendance"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectLectureForAttendance({
                                    ...slot,
                                    time: timeRange,
                                    timeSlot: timeRange,
                                    day: selectedTimetableDay,
                                    subjectId: slot.subjectId || slot.subject,
                                    subjectName: slot.name || slot.subject,
                                    sem: slot.sem,
                                    div: slot.div,
                                    batch: slot.batch || 'ALL',
                                    room: slot.room,
                                    isMultiSlot: isMulti,
                                    span: span,
                                    allMergedSlots: slot.allMergedSlots
                                  }, slot.rescheduledDate || getDateForDayName(selectedTimetableDay));
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  backgroundColor: '#2563eb',
                                  color: '#ffffff',
                                  fontWeight: '700',
                                  fontSize: '12.5px',
                                  cursor: 'pointer'
                                }}
                              >
                                <UserCheck size={14} />
                                <span>Take Attendance</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* FULL VISUAL WEEKLY GRID VIEW (TIME ROWS, DAY COLUMNS) */}
            {isWeeklyGridView && (
              <div className="card" style={{ padding: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
                
                {/* Visual Legend & Sync Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                    <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a' }}>
                      Admin Live-Sync Active
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      • Changes made in Admin Panel update automatically
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}></span>
                      Click card to take attendance immediately
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}></span>
                      Rescheduled slot
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#f8fafc' }}></span>
                      – No lecture
                    </span>
                  </div>
                </div>

                <div className="table-responsive" style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflowX: 'auto', backgroundColor: '#ffffff' }}>
                  <table className="data-table" style={{ fontSize: '12.5px', width: '100%', minWidth: '980px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ width: '130px', padding: '14px 10px', fontWeight: '800', color: '#0f172a', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                          TIME / DAY
                        </th>
                        {TIMETABLE_DAYS.map(day => {
                          const isToday = day === todayDayName;
                          return (
                            <th key={day} style={{ textAlign: 'center', padding: '14px 10px', fontWeight: '800', color: isToday ? '#2563eb' : '#0f172a', borderRight: '1px solid #e2e8f0', minWidth: '135px' }}>
                              <div>{day}</div>
                              {isToday && (
                                <span style={{ display: 'inline-block', fontSize: '10px', backgroundColor: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: '800', marginTop: '2px' }}>
                                  Today
                                </span>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const isLunchTime = (t) => t.toUpperCase().includes('LUNCH') || t.startsWith('12:40') || normalizeTimeSlot(t) === '12:40 - 1:25';

                        const allSlotsToRender = [];
                        TIME_SLOTS.forEach(s => allSlotsToRender.push(s));
                        TIMETABLE_DAYS.forEach(day => {
                          const dayObj = facultyTimetableGrid[day] || {};
                          Object.keys(dayObj).forEach(s => {
                            if (!allSlotsToRender.some(ex => normalizeTimeSlot(ex) === normalizeTimeSlot(s))) {
                              // If slot covers multiple existing TIME_SLOTS (e.g. 10:00 - 11:45), don't insert a redundant row
                              const sRng = parseTimeRangeMinutes(s);
                              const isSpanningExisting = sRng && allSlotsToRender.filter(ex => {
                                const exRng = parseTimeRangeMinutes(ex);
                                return exRng && exRng.startMin >= sRng.startMin && exRng.endMin <= sRng.endMin;
                              }).length >= 2;
                              if (!isSpanningExisting) {
                                allSlotsToRender.push(s);
                              }
                            }
                          });
                        });

                        allSlotsToRender.sort((a, b) => {
                          const ma = parseTimeRangeMinutes(a)?.startMin ?? 0;
                          const mb = parseTimeRangeMinutes(b)?.startMin ?? 0;
                          return ma - mb;
                        });

                        // Helper to find slot in facultyTimetableGrid for a given day and row time
                        const getSlotForRow = (dayName, timeStr) => {
                          const dayObj = facultyTimetableGrid[dayName] || {};
                          const normT = normalizeTimeSlot(timeStr);
                          let slot = dayObj[timeStr];
                          if (!slot) {
                            for (const k of Object.keys(dayObj)) {
                              if (normalizeTimeSlot(k) === normT) {
                                slot = dayObj[k];
                                break;
                              }
                            }
                          }
                          if (!slot) {
                            const rowRng = parseTimeRangeMinutes(timeStr);
                            if (rowRng) {
                              for (const k of Object.keys(dayObj)) {
                                const entry = dayObj[k];
                                if (entry && entry.subject) {
                                  const entryRng = parseTimeRangeMinutes(entry.timeSlot || k);
                                  if (entryRng && Math.abs(entryRng.startMin - rowRng.startMin) <= 5) {
                                    slot = entry;
                                    break;
                                  }
                                }
                              }
                            }
                          }
                          return slot;
                        };

                        // Pre-calculate merged cells map for each day
                        const dayCellMap = {};
                        TIMETABLE_DAYS.forEach(dayName => {
                          dayCellMap[dayName] = new Array(allSlotsToRender.length);
                        });

                        TIMETABLE_DAYS.forEach(dayName => {
                          for (let rIdx = 0; rIdx < allSlotsToRender.length; rIdx++) {
                            if (dayCellMap[dayName][rIdx]) continue; // already marked

                            const time = allSlotsToRender[rIdx];
                            if (isLunchTime(time)) {
                              dayCellMap[dayName][rIdx] = { type: 'lunch' };
                              continue;
                            }

                            const slot = getSlotForRow(dayName, time);
                            if (!slot || !slot.subject) {
                              dayCellMap[dayName][rIdx] = { type: 'empty' };
                              continue;
                            }

                            // 1. If slot is a continuation slot, mark as skip and continue immediately!
                            if (slot.isContinuation) {
                              dayCellMap[dayName][rIdx] = { type: 'skip' };
                              continue;
                            }

                            // 2. Determine span across covered rows
                            let span = 1;
                            const mergedSlotsList = [slot];
                            const fullTimeStr = slot.combinedTimeSlot || slot.timeSlot || time;
                            const slotRng = parseTimeRangeMinutes(fullTimeStr);
                            const explicitSpan = slot.span && slot.span > 1 ? slot.span : 1;

                            let checkIdx = rIdx + 1;
                            while (checkIdx < allSlotsToRender.length) {
                              const nextTime = allSlotsToRender[checkIdx];
                              if (isLunchTime(nextTime)) break; // Never merge across lunch break

                              const nextSlot = getSlotForRow(dayName, nextTime);

                              // A. If slot has explicit span covering this index
                              if (span < explicitSpan) {
                                span++;
                                if (nextSlot) mergedSlotsList.push(nextSlot);
                                dayCellMap[dayName][checkIdx] = { type: 'skip' };
                                checkIdx++;
                                continue;
                              }

                              // B. If slot has a combined time range extending over nextTime
                              if (slotRng) {
                                const nextRng = parseTimeRangeMinutes(nextTime);
                                if (nextRng && nextRng.startMin < slotRng.endMin) {
                                  span++;
                                  if (nextSlot) mergedSlotsList.push(nextSlot);
                                  dayCellMap[dayName][checkIdx] = { type: 'skip' };
                                  checkIdx++;
                                  continue;
                                }
                              }

                              // C. Check if next slot is consecutive and belongs to same session
                              if (nextSlot && canMergeConsecutiveSlots(slot, nextSlot)) {
                                span++;
                                mergedSlotsList.push(nextSlot);
                                dayCellMap[dayName][checkIdx] = { type: 'skip' };
                                checkIdx++;
                                continue;
                              }

                              break;
                            }

                            // Formulate combined time range string
                            let timeRange = slot.combinedTimeSlot;
                            if (!timeRange) {
                              if (span > 1) {
                                const firstStart = (slot.timeSlot || time).split(/[-–—]/)[0]?.trim() || '';
                                const lastSlot = mergedSlotsList[mergedSlotsList.length - 1];
                                let lastEnd = '';
                                if (lastSlot && lastSlot.timeSlot) {
                                  const p = lastSlot.timeSlot.split(/[-–—]/);
                                  lastEnd = (p[1] || p[0]).trim();
                                } else if (slotRng && slot.timeSlot && slot.timeSlot.includes('-')) {
                                  lastEnd = slot.timeSlot.split(/[-–—]/)[1]?.trim() || '';
                                } else {
                                  const lastRowTime = allSlotsToRender[rIdx + span - 1];
                                  const p = lastRowTime.split(/[-–—]/);
                                  lastEnd = (p[1] || p[0]).trim();
                                }
                                timeRange = `${firstStart}–${lastEnd}`;
                              } else {
                                timeRange = slot.timeSlot || time;
                              }
                            }

                            const mergedSlot = {
                              ...slot,
                              timeSlot: timeRange,
                              time: timeRange,
                              span,
                              isMultiSlot: span > 1,
                              allMergedSlots: mergedSlotsList
                            };

                            dayCellMap[dayName][rIdx] = {
                              type: 'card',
                              slot: mergedSlot,
                              span,
                              timeRange
                            };
                          }
                        });

                        return allSlotsToRender.map((time, rIdx) => {
                          const isLunch = isLunchTime(time);
                          if (isLunch) {
                            return (
                              <tr key={time} style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ textAlign: 'center', fontWeight: '700', color: '#475569', padding: '12px 8px', borderRight: '1px solid #e2e8f0', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                  {formatOfficialTimeSlot(time)}
                                </td>
                                <td colSpan={TIMETABLE_DAYS.length} style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: '800', letterSpacing: '0.08em', fontSize: '12px' }}>
                                  🍱 12:40 to 1:25pm (Break) / LUNCH RECESS
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={time} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ textAlign: 'center', fontWeight: '700', color: '#1e3a8a', padding: '12px 8px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                {formatOfficialTimeSlot(time)}
                              </td>
                              {TIMETABLE_DAYS.map(dayName => {
                                const cellInfo = dayCellMap[dayName]?.[rIdx];

                                // If covered by an earlier rowSpan, omit the td completely to preserve table column layout!
                                if (!cellInfo || cellInfo.type === 'skip') {
                                  return null;
                                }

                                if (cellInfo.type === 'empty') {
                                  return (
                                    <td key={dayName} style={{ textAlign: 'center', color: '#cbd5e1', padding: '14px 8px', borderRight: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                                      <span style={{ fontSize: '16px', color: '#94a3b8' }}>–</span>
                                    </td>
                                  );
                                }

                                const { slot, span, timeRange } = cellInfo;
                                const isMulti = span > 1;
                                const theme = getCardStyleForSubject(slot.subject);

                                return (
                                  <td 
                                    key={dayName}
                                    rowSpan={span > 1 ? span : undefined}
                                    style={{
                                      padding: '8px',
                                      borderRight: '1px solid #e2e8f0',
                                      verticalAlign: 'top',
                                      backgroundColor: '#ffffff',
                                      height: isMulti ? '100%' : undefined
                                    }}
                                  >
                                    <div
                                      className="timetable-lecture-card"
                                      data-entry-id={slot.id}
                                      data-subject={slot.subject}
                                      data-time={timeRange}
                                      data-day={dayName}
                                      data-is-multislot={isMulti ? 'true' : undefined}
                                      data-span={span}
                                      onClick={() => {
                                        selectLectureForAttendance({
                                          ...slot,
                                          day: dayName,
                                          time: timeRange,
                                          timeSlot: timeRange,
                                          subjectId: slot.subjectId || slot.subject,
                                          subjectName: slot.name || slot.subjectFullName || slot.subject,
                                          sem: slot.semId || slot.sem,
                                          div: slot.divId || slot.div,
                                          batch: slot.batch || 'ALL',
                                          room: slot.room,
                                          departmentId: slot.departmentId,
                                          id: slot.id,
                                          rescheduledDate: slot.rescheduledDate,
                                          isMultiSlot: isMulti,
                                          span: span,
                                          allMergedSlots: slot.allMergedSlots
                                        }, slot.rescheduledDate || getDateForDayName(dayName));
                                      }}
                                      style={{
                                        padding: isMulti ? '12px 14px' : '10px 12px',
                                        borderRadius: '10px',
                                        border: `1px solid ${slot.isRescheduled ? '#f59e0b' : theme.border}`,
                                        backgroundColor: slot.isRescheduled ? '#fffbeb' : theme.bg,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: isMulti ? '0 3px 8px rgba(0,0,0,0.04)' : '0 2px 4px rgba(0,0,0,0.02)',
                                        position: 'relative',
                                        minHeight: isMulti ? `${span * 78}px` : undefined,
                                        height: isMulti ? 'calc(100% - 6px)' : undefined,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxSizing: 'border-box'
                                      }}
                                      title={isMulti ? `Click to mark attendance for this ${span}-period session (${timeRange})` : "Click to mark attendance for this lecture"}
                                    >
                                      <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '6px' }}>
                                          <span style={{ fontWeight: '800', color: theme.text, fontSize: '13px' }}>
                                            {slot.subject}
                                          </span>
                                          <span style={{
                                            fontSize: isMulti ? '10.5px' : '10px',
                                            fontWeight: '800',
                                            color: isMulti ? '#1e40af' : theme.badgeText,
                                            backgroundColor: isMulti ? '#dbeafe' : theme.badgeBg,
                                            padding: '2px 7px',
                                            borderRadius: '4px',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {isMulti ? timeRange : time.split(' - ')[0]}
                                          </span>
                                        </div>

                                        {slot.isRescheduled && (
                                          <div style={{ marginBottom: '4px' }}>
                                            <span style={{
                                              fontSize: '9.5px',
                                              fontWeight: '800',
                                              backgroundColor: '#fef3c7',
                                              color: '#b45309',
                                              padding: '1px 6px',
                                              borderRadius: '4px',
                                              border: '1px solid #fde68a',
                                              display: 'inline-block'
                                            }}>
                                              ⏱ Rescheduled ({slot.rescheduledDate || slot.day})
                                            </span>
                                          </div>
                                        )}

                                        {(() => {
                                          const resolvedDeptObj = resolveDepartment(slot.departmentId || slot.department || slot.departmentName);
                                          const deptDisplay = resolvedDeptObj ? resolvedDeptObj.name : (slot.department || slot.departmentName || (slot.departmentId && !slot.departmentId.startsWith('DEP_') ? slot.departmentId : ''));
                                          return (
                                            <div style={{ fontSize: '11px', color: '#475569', fontWeight: '700', marginBottom: '3px' }}>
                                              {slot.sem}{deptDisplay ? ` • ${deptDisplay}` : ''} • {slot.div} {slot.batch && slot.batch !== 'ALL' ? `• ${slot.batch}` : ''}
                                            </div>
                                          );
                                        })()}
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                                          📍 {slot.room || 'Classroom'}
                                        </div>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', marginBottom: isMulti ? '6px' : '4px' }}>
                                          ⏰ {timeRange}
                                        </div>

                                        {isMulti && (
                                          <div style={{
                                            fontSize: '10px',
                                            fontWeight: '800',
                                            color: '#4338ca',
                                            backgroundColor: '#e0e7ff',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            marginBottom: '6px'
                                          }}>
                                            🔬 Multi-Slot Lab / Practical ({timeRange})
                                          </div>
                                        )}
                                      </div>

                                      {/* Card Actions: Detail Modal */}
                                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          className="btn-lecture-details"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLectureDetail({ slot, day: dayName, time: timeRange });
                                          }}
                                          style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: '#f8fafc',
                                            color: '#475569',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}
                                          title="View lecture details & roster"
                                        >
                                          <span>Details</span>
                                          <span>ℹ</span>
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* =========================================================================
                    OFFICIAL ADIT FACULTY TEMPLATE: TEACHING LOAD, SUBJECTS, & SIGNATURES
                    ========================================================================= */}

                {/* 1. Working Hours & Total Teaching Load Table */}
                <div style={{ marginTop: '24px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#2563eb" />
                      Teaching Load Summary (Working Hours)
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Calculated automatically (Load = L + P/T)
                    </span>
                  </div>

                  <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                    <table className="teaching-load-table" style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', borderRight: '1px solid #e2e8f0' }}>Working Hours</th>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', textAlign: 'center', borderRight: '1px solid #e2e8f0', width: '90px' }}>L (Lectures)</th>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', textAlign: 'center', borderRight: '1px solid #e2e8f0', width: '90px' }}>P/T (Labs/Tut)</th>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', textAlign: 'center', width: '110px' }}>Total Load</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '9px 12px', fontWeight: '600', color: '#334155', borderRight: '1px solid #e2e8f0' }}>UG Working Hours</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#0f172a', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>{teachingMetrics.ugL}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#0f172a', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>{teachingMetrics.ugPT}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#2563eb', fontWeight: '800', backgroundColor: '#eff6ff' }}>{teachingMetrics.ugTotal}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '9px 12px', fontWeight: '600', color: '#334155', borderRight: '1px solid #e2e8f0' }}>PG Working Hours</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{teachingMetrics.pgL}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{teachingMetrics.pgPT}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b' }}>{teachingMetrics.pgTotal}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '9px 12px', fontWeight: '600', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Diploma Working Hours</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>0</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>0</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b' }}>0</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '9px 12px', fontWeight: '600', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Internship/Project/Seminar (Guidance) Working Hours</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{teachingMetrics.guidanceL}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>{teachingMetrics.guidancePT}</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b' }}>{teachingMetrics.guidanceTotal}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '9px 12px', fontWeight: '600', color: '#334155', borderRight: '1px solid #e2e8f0' }}>Other Institution Working Hours</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>0</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0' }}>0</td>
                          <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b' }}>0</td>
                        </tr>
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: '800' }}>
                          <td style={{ padding: '10px 12px', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>TOTAL TEACHING LOAD</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{teachingMetrics.totalTeachingLoadL}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{teachingMetrics.totalTeachingLoadPT}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1e40af', backgroundColor: '#dbeafe', fontSize: '13.5px' }}>{teachingMetrics.totalTeachingLoad}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Subject Code, Name of Subject, L, T, P, C Table */}
                <div style={{ marginTop: '20px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} color="#2563eb" />
                    Assigned Subjects & Credit Distribution
                  </h4>
                  <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                    <table className="subject-load-table" style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', borderRight: '1px solid #e2e8f0', width: '180px' }}>Subject Code</th>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', borderRight: '1px solid #e2e8f0' }}>Name of Subject</th>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', textAlign: 'center', borderRight: '1px solid #e2e8f0', width: '60px' }}>L</th>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', textAlign: 'center', borderRight: '1px solid #e2e8f0', width: '60px' }}>T</th>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', textAlign: 'center', borderRight: '1px solid #e2e8f0', width: '60px' }}>P</th>
                          <th style={{ padding: '9px 12px', fontWeight: '800', color: '#1e293b', textAlign: 'center', width: '60px' }}>C</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachingMetrics.subjectDetailsList.map((s, idx) => (
                          <tr key={s.code || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px 12px', fontWeight: '700', color: '#2563eb', borderRight: '1px solid #e2e8f0' }}>{s.code}</td>
                            <td style={{ padding: '8px 12px', fontWeight: '600', color: '#1e293b', borderRight: '1px solid #e2e8f0' }}>{s.name}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>{s.L}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>{s.T}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>{s.P}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '800', color: '#0f172a', backgroundColor: '#f8fafc' }}>{s.C}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Official Signatures Footer */}
                <div style={{
                  marginTop: '28px',
                  paddingTop: '20px',
                  borderTop: '1px solid #cbd5e1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px',
                  fontSize: '12px',
                  color: '#475569',
                  fontWeight: '700'
                }}>
                  <div>
                    <span>Prepared by: </span>
                    <span style={{ display: 'inline-block', width: '160px', borderBottom: '1px dotted #94a3b8' }}></span>
                  </div>
                  <div>
                    <span>Verified by Head: </span>
                    <span style={{ display: 'inline-block', width: '160px', borderBottom: '1px dotted #94a3b8' }}></span>
                  </div>
                  <div>
                    <span>Principal/Director: </span>
                    <span style={{ display: 'inline-block', width: '160px', borderBottom: '1px dotted #94a3b8' }}></span>
                  </div>
                </div>

                {/* 4. Instructions / How to use */}
                <div style={{
                  marginTop: '20px',
                  padding: '14px 18px',
                  backgroundColor: '#fefce8',
                  border: '1px solid #fef08a',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#713f12'
                }} className="no-print">
                  <div style={{ fontWeight: '800', marginBottom: '4px' }}>💡 How to use (Official Faculty Timetable):</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Fill only the cream-coloured cells (faculty details, timetable grid, L and P/T hours, subjects).</li>
                    <li>In each grid cell type: Class/Batch, Subject and Room, e.g. <code>5IT1 / DBMS / IT-5</code> (use Alt+Enter for a new line).</li>
                    <li>Total Load per row and the TOTAL TEACHING LOAD row are calculated automatically (Load = L + P/T).</li>
                    <li>Click on any lecture card in the timetable to immediately start taking attendance.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* LECTURE DETAIL & STUDENT ROSTER MODAL */}
            {selectedLectureDetail && (() => {
              const { slot, day, time } = selectedLectureDetail;
              const slotDept = slot.department || slot.departmentName || slot.dept || currentFaculty.dept;
              const roster = getStudentsForClassCriteria(slot.sem, slot.div, slotDept);
              const todayStr = new Date().toISOString().split('T')[0];
              const recordedSession = allSessions.find(s => 
                s.date === todayStr &&
                s.subjectId === slot.subject &&
                normalizeSem(s.sem) === normalizeSem(slot.sem) &&
                normalizeDiv(s.div) === normalizeDiv(slot.div)
              );
              let presentCount = 0;
              if (recordedSession?.students) {
                presentCount = Object.values(recordedSession.students).filter(st => st === 'present').length;
              }

              return (
                <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
                  <div className="modal-content" style={{ maxWidth: '640px', width: '92%', borderRadius: '16px', padding: '24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                    {/* Modal Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1e3a8a', padding: '2px 8px', borderRadius: '6px' }}>
                            {slot.subject}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                            {day} • {time}
                          </span>
                          {slot.isMultiSlot && (
                            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '6px' }}>
                              🔬 Multi-Slot Session ({slot.span} Periods)
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          {slot.name || slot.subject}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLectureDetail(null)}
                        style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>CLASS / DIV</div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{slot.sem} • {slot.div}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>CLASSROOM</div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>📍 {slot.room || 'Classroom'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>DEPARTMENT</div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{slot.dept || currentFaculty.dept}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>FACULTY</div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#2563eb' }}>{currentFaculty.name}</div>
                      </div>
                    </div>

                    {/* Attendance Status Alert */}
                    <div style={{ marginBottom: '16px' }}>
                      {recordedSession ? (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: '700' }}>
                            ✓ Attendance Recorded for Today: {presentCount} / {roster.length} Present ({roster.length > 0 ? Math.round((presentCount / roster.length) * 100) : 0}%)
                          </span>
                          <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '800' }}>Completed</span>
                        </div>
                      ) : (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12.5px', color: '#1e40af', fontWeight: '700' }}>
                            ℹ Attendance Pending for Today ({todayStr})
                          </span>
                          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '800' }}>Pending</span>
                        </div>
                      )}
                    </div>

                    {/* Associated Class Roster List */}
                    <div style={{ flex: 1, minHeight: '180px', maxHeight: '280px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '18px' }}>
                      <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '800', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Associated Class Roster</span>
                        <span style={{ color: '#2563eb' }}>{roster.length} Enrolled Students</span>
                      </div>
                      {roster.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                          No students found enrolled in {slot.sem} {slot.div}. (Add students via Admin Panel)
                        </div>
                      ) : (
                        <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#ffffff' }}>
                              <th style={{ width: '50px' }}>Roll</th>
                              <th>Name</th>
                              <th>Enrollment No</th>
                            </tr>
                          </thead>
                          <tbody>
                            {roster.map(st => (
                              <tr key={st.id}>
                                <td style={{ fontWeight: '700' }}>{st.rollNo}</td>
                                <td style={{ fontWeight: '600', color: '#0f172a' }}>{st.name}</td>
                                <td style={{ color: '#64748b' }}>{st.enrollmentNo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Modal Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setSelectedLectureDetail(null)}
                      >
                        Close
                      </button>

                      {recordedSession && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the recorded attendance for ${slot.subject} (${slot.sem} ${slot.div}${slot.batch ? ' ' + slot.batch : ''}) on ${todayStr}? This action cannot be undone.`)) {
                              try {
                                deleteSession(recordedSession.id, currentFaculty);
                                setSelectedLectureDetail(null);
                                reloadSessions();
                                if (showToast) showToast('Attendance record deleted successfully!');
                              } catch (err) {
                                alert(err.message || 'Error deleting session');
                              }
                            }
                          }}
                        >
                          <Trash2 size={15} />
                          <span>Delete Attendance Record</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          const slotDept = slot.department || slot.departmentName || slot.dept || currentFaculty.dept;
                          const targetClass = findClassByCriteria(slotDept, slot.sem, slot.div);
                          if (targetClass?.id) setRegClassId(targetClass.id);
                          if (slot.subject) setRegSubjectId(slot.subject);
                          if (slotDept) setRegNavDept(slotDept);
                          if (slot.sem) setRegNavSem(slot.sem);
                          if (slot.div) setRegNavDiv(slot.div);
                          if (slot.batch) setRegNavBatch(slot.batch);
                          if (slot.subject) setRegNavSubId(slot.subject);
                          setSelectedLectureDetail(null);
                          setFacultyTab('register');
                        }}
                      >
                        <FileSpreadsheet size={15} />
                        <span>View Attendance Register</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          selectLectureForAttendance({
                            ...slot,
                            time: slot.timeSlot || time,
                            day,
                            subjectId: slot.subjectId || slot.subject,
                            subjectName: slot.name || slot.subject,
                            sem: slot.sem,
                            div: slot.div,
                            batch: slot.batch || 'ALL',
                            room: slot.room,
                            departmentId: slot.departmentId,
                            id: slot.id,
                            rescheduledDate: slot.rescheduledDate
                          }, slot.rescheduledDate || getDateForDayName(day));
                          setSelectedLectureDetail(null);
                        }}
                      >
                        <UserCheck size={15} />
                        <span>Take Attendance</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* =================================================================
            VIEW 3: TAKE ATTENDANCE (CORE ATTENDANCE MODULE - ZERO TIMETABLE DEPENDENCY)
            ================================================================= */}
        {facultyTab === 'take' && (
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            
            {/* -------------------------------------------------------------
               1. MANUAL LECTURE DETAILS FORM (Zero Timetable Dependency)
               ------------------------------------------------------------- */}
            <div className="card" style={{ padding: '28px 32px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              {/* Header */}
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '22px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', fontFamily: "'Outfit', sans-serif" }}>
                  Record Lecture Attendance
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Enter or modify lecture details below, then click <strong>"Load Students"</strong> to refresh the student attendance list. This session is recorded independently of your timetable.
                </p>
              </div>

              <form onSubmit={handleLoadStudents}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    marginBottom: '24px'
                  }}>
                    {/* 1. Subject */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                        1. Subject <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <select
                        className="form-control"
                        value={attSubjectId}
                        onChange={(e) => {
                          const sId = e.target.value;
                          setAttSubjectId(sId);
                          const sub = takeAvailableSubjects.find(s => s.id === sId || s.code === sId);
                          if (sub) setAttSubjectName(sub.shortName || sub.name);
                        }}
                        required
                        style={{ height: '42px', fontSize: '14px', fontWeight: '600' }}
                      >
                        <option value="">-- Select Subject --</option>
                        {takeAvailableSubjects.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.code ? `${s.code} - ` : ''}{s.name} {s.shortName ? `(${s.shortName})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Session Date */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                        2. Session Date <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={attDate}
                        onChange={(e) => setAttDate(e.target.value)}
                        required
                        style={{ height: '42px', fontSize: '14px', fontWeight: '600' }}
                      />
                    </div>

                    {/* 3 & 4. Session Start Time & End Time */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                        3 &amp; 4. Lecture Timings (Start - End) <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="time"
                          className="form-control"
                          value={attStartTime}
                          onChange={(e) => setAttStartTime(e.target.value)}
                          required
                          style={{ height: '42px', fontSize: '14px', fontWeight: '600', flex: 1 }}
                          title="Session Start Time"
                        />
                        <span style={{ color: '#64748b', fontWeight: '700' }}>to</span>
                        <input
                          type="time"
                          className="form-control"
                          value={attEndTime}
                          onChange={(e) => setAttEndTime(e.target.value)}
                          required
                          style={{ height: '42px', fontSize: '14px', fontWeight: '600', flex: 1 }}
                          title="Session End Time"
                        />
                      </div>
                      <div style={{ marginTop: '6px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {[
                          { s: '09:00', e: '09:55' },
                          { s: '09:55', e: '10:50' },
                          { s: '11:00', e: '11:55' },
                          { s: '11:55', e: '12:50' },
                          { s: '13:30', e: '14:25' },
                          { s: '14:25', e: '15:20' }
                        ].map(p => (
                          <button
                            key={`${p.s}-${p.e}`}
                            type="button"
                            onClick={() => { setAttStartTime(p.s); setAttEndTime(p.e); }}
                            style={{
                              fontSize: '10.5px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: (attStartTime === p.s && attEndTime === p.e) ? '#e0f2fe' : '#f8fafc',
                              color: (attStartTime === p.s && attEndTime === p.e) ? '#0369a1' : '#64748b',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            {p.s}-{p.e}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 5. Department */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                        5. Department <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <select
                        className="form-control"
                        value={attDept}
                        onChange={(e) => setAttDept(e.target.value)}
                        required
                        style={{ height: '42px', fontSize: '14px', fontWeight: '600' }}
                      >
                        {takeAvailableDepts.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* 6. Semester */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                        6. Semester <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <select
                        className="form-control"
                        value={attSem}
                        onChange={(e) => setAttSem(e.target.value)}
                        required
                        style={{ height: '42px', fontSize: '14px', fontWeight: '600' }}
                      >
                        {takeAvailableSemesters.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* 7. Division */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                        7. Division <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <select
                        className="form-control"
                        value={attDiv}
                        onChange={(e) => setAttDiv(e.target.value)}
                        required
                        style={{ height: '42px', fontSize: '14px', fontWeight: '600' }}
                      >
                        {takeAvailableDivisions.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* 8. Batch */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                        8. Batch (Where Applicable)
                      </label>
                      <select
                        className="form-control"
                        value={attBatch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttBatch(val);
                          if (hasLoadedStudents) {
                            const refreshed = getStudentsForAcademicGroup({
                              department: activeClass?.isElective ? 'Elective (No Department)' : attDept,
                              semester: attSem,
                              division: attDiv,
                              batch: val,
                              academicYear: attYear,
                              subjectId: attSubjectId,
                              classId: activeClass?.id
                            }, currentFaculty);
                            setLoadedStudents(refreshed || []);
                            const newRecs = {};
                            const newRems = {};
                            (refreshed || []).forEach(st => {
                              newRecs[st.id] = null;
                              newRems[st.id] = '';
                            });
                            setAttRecords(newRecs);
                            setAttRemarks(newRems);
                          }
                        }}
                        style={{ height: '42px', fontSize: '14px', fontWeight: '600' }}
                      >
                        {takeAvailableBatches.map(b => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* 9. Classroom */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                        9. Classroom / Lab
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={attRoom}
                        onChange={(e) => setAttRoom(e.target.value)}
                        placeholder="e.g. Room 201 or Lab 1"
                        style={{ height: '42px', fontSize: '14px', fontWeight: '600' }}
                      />
                    </div>

                    {/* Extra Lecture Option */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                        Extra Lecture
                      </label>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        height: '42px',
                        padding: '0 14px',
                        borderRadius: '8px',
                        border: `1px solid ${isExtraLecture ? '#93c5fd' : '#cbd5e1'}`,
                        backgroundColor: isExtraLecture ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        color: isExtraLecture ? '#1e40af' : '#475569',
                        userSelect: 'none'
                      }}>
                        <input
                          type="checkbox"
                          checked={isExtraLecture}
                          onChange={(e) => setIsExtraLecture(e.target.checked)}
                          style={{ width: '17px', height: '17px', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <span>Extra / Compensatory Lecture</span>
                      </label>
                    </div>

                    {/* Topic Covered */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="att-topic-input" style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                        Topic / Syllabus Covered <span style={{ color: '#ef4444' }}>*</span> <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700' }}>(Required)</span>
                      </label>
                      <input
                        id="att-topic-input"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Unit 3: Relational Algebra & SQL Query Optimization (Compulsory)"
                        value={attTopic}
                        onChange={(e) => {
                          setAttTopic(e.target.value);
                          if (unmarkedAlert && unmarkedAlert.includes('Topic')) setUnmarkedAlert(null);
                        }}
                        style={{
                          height: '42px',
                          fontSize: '13.5px',
                          border: !attTopic.trim() ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                          backgroundColor: !attTopic.trim() ? '#fffafa' : '#ffffff'
                        }}
                      />
                      {!attTopic.trim() && (
                        <span style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                          * Topic / Syllabus Covered is compulsory. Please enter what was taught before submitting attendance.
                        </span>
                      )}
                    </div>
                  </div>
                
                {/* Form Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setFacultyTab('dashboard')}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '11px 26px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <Users size={16} />
                    <span>Load Students</span>
                  </button>
                </div>
              </form>
            </div>

            {/* -------------------------------------------------------------
               2. STUDENT ATTENDANCE LIST (Multi-Column Checkbox Grid)
               ------------------------------------------------------------- */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
              
              {/* Header Controls & Live Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleMarkAllStatus('present')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid #a7f3d0',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      fontWeight: '700',
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    <CheckSquare size={14} />
                    <span>Mark All Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkAllStatus('absent')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid #fecdd3',
                      backgroundColor: '#fff1f2',
                      color: '#e11d48',
                      fontWeight: '700',
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    <XSquare size={14} />
                    <span>Mark All Absent</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkRemainingAbsent}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                      backgroundColor: '#fffbeb',
                      color: '#b45309',
                      fontWeight: '700',
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                    title="Mark all students who have not been marked yet as Absent"
                  >
                    <AlertCircle size={14} />
                    <span>Mark Remaining as Absent</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAllUnmarked}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    title="Reset all checkboxes to unmarked"
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Live Attendance Counter Badges */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    border: '1px solid #a7f3d0'
                  }}>
                    Present: {presentCount}
                  </span>

                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    border: '1px solid #fecdd3'
                  }}>
                    Absent: {absentCount}
                  </span>

                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: unmarkedCount > 0 ? '#fffbeb' : '#f8fafc',
                    color: unmarkedCount > 0 ? '#b45309' : '#64748b',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    border: `1px solid ${unmarkedCount > 0 ? '#fde68a' : '#cbd5e1'}`
                  }}>
                    Unmarked: {unmarkedCount}
                  </span>

                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    border: '1px solid #bfdbfe'
                  }}>
                    Exceptions (EX): {exceptionCount}
                  </span>

                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    border: '1px solid #cbd5e1'
                  }}>
                    Total: {classStudents.length} ({attendancePct}%)
                  </span>
                </div>
              </div>

              {/* Validation Warning Alert Banner */}
              {unmarkedAlert && (
                <div style={{
                  padding: '12px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#d97706" />
                    <span>{unmarkedAlert}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkRemainingAbsent}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#d97706',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Mark Remaining as Absent
                  </button>
                </div>
              )}

              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search enrolled students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    style={{ height: '36px', paddingLeft: '32px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'present', label: 'Present' },
                    { id: 'absent', label: 'Absent' },
                    { id: 'unmarked', label: 'Unmarked' },
                    { id: 'exceptions', label: 'Exceptions (EX)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStatusFilter(f.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: statusFilter === f.id ? '#0f172a' : '#ffffff',
                        color: statusFilter === f.id ? '#ffffff' : '#475569',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Multi-Column Checkbox Student List */}
              {!hasLoadedStudents ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #cbd5e1', color: '#64748b' }}>
                  <Users size={38} color="#94a3b8" style={{ marginBottom: '10px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px' }}>
                    Student List Not Loaded
                  </h4>
                  <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
                    Please enter or select lecture details above, then click <strong>"Load Students"</strong> to display the student attendance checklist.
                  </p>
                </div>
              ) : classStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fff1f2', borderRadius: '12px', border: '1.5px dashed #fecdd3', color: '#9f1239' }}>
                  <AlertCircle size={38} color="#e11d48" style={{ marginBottom: '10px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#9f1239', margin: '0 0 6px' }}>
                    No Students Enrolled
                  </h4>
                  <p style={{ fontSize: '13.5px', color: '#be123c', maxWidth: '520px', margin: '0 auto' }}>
                    {activeClass?.isElective || attDept === 'Elective (No Department)'
                      ? `No students are currently allocated to this elective class (${activeClass?.name || attSubjectName || 'Elective'}). Please upload an Excel student roster via Admin Panel -> Class Management.`
                      : `No students were found for ${attDept} (${attSem} ${attDiv}${attBatch !== 'ALL' ? `, ${attBatch}` : ''}). Please verify the academic selection or ensure students are registered in Admin Panel.`
                    }
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>No students match your search or filter.</p>
                  <button
                    type="button"
                    onClick={() => { setStudentSearch(''); setStatusFilter('all'); }}
                    style={{ marginTop: '8px', padding: '4px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="student-multi-col-list student-checklist-container">
                  {filteredStudents.map((st) => {
                    const rawStatus = attRecords[st.id];
                    const isPresent = rawStatus === 'present';
                    const isExplicitOD = rawStatus === 'od' || rawStatus === 'exception';
                    const isAbsent = rawStatus === 'absent';
                    const isUnmarked = !rawStatus || (!isPresent && !isAbsent && !isExplicitOD);
                    const excCheck = isStudentExcusedForSession(st.id, attDate, attTimeSlot, attSubjectId);
                    const isExcused = excCheck.isExcused;
                    // Bug 2 Fix: EX only applies if explicitly marked OD or if an absent student has an approved official exception. Never assign EX to unmarked students.
                    const isOD = !isPresent && (isExplicitOD || (isAbsent && isExcused));
                    const serialNum = classStudents.findIndex(s => s.id === st.id) + 1;

                    return (
                      <div
                        key={st.id}
                        className={`student-checkbox-card student-checklist-entry ${isOD ? 'is-excused' : isPresent ? 'is-present' : isAbsent ? 'is-absent' : 'is-unmarked'}`}
                        style={{
                          breakInside: 'avoid',
                          WebkitColumnBreakInside: 'avoid',
                          pageBreakInside: 'avoid',
                          padding: '7px 8px 9px 8px',
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: isOD ? '#eff6ff' : isPresent ? '#f0fdf4' : isAbsent ? '#fff1f2' : 'transparent',
                          borderRadius: '6px',
                          marginBottom: '6px',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        {/* Top Line: Serial Number + Enrollment Number + Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontWeight: 800, fontSize: '13px', color: '#1e293b' }}>
                              {serialNum}.
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', letterSpacing: '0.02em' }}>
                              {st.enrollmentNo || st.rollNo}
                            </span>
                            {(activeClass?.isElective || attDept === 'Elective (No Department)') && (st.department || st.dept) && (
                              <span style={{
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                fontWeight: 700
                              }}>
                                {(st.department || st.dept).includes('AI') ? 'AI&DS' : (st.department || st.dept).includes('Comp') ? 'CP' : (st.department || st.dept).includes('Info') ? 'IT' : (st.department || st.dept)}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isUnmarked && (
                              <button
                                type="button"
                                onClick={() => handleStudentStatusToggle(st.id, 'absent')}
                                title="Mark Absent"
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #fecdd3',
                                  backgroundColor: '#fff1f2',
                                  color: '#e11d48',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Mark A
                              </button>
                            )}
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '10px',
                              backgroundColor: isOD ? '#dbeafe' : isPresent ? '#dcfce7' : isAbsent ? '#fee2e2' : '#f1f5f9',
                              color: isOD ? '#1d4ed8' : isPresent ? '#15803d' : isAbsent ? '#b91c1c' : '#64748b',
                              border: `1px solid ${isOD ? '#bfdbfe' : isPresent ? '#bbf7d0' : isAbsent ? '#fecdd3' : '#cbd5e1'}`
                            }}>
                              {isOD ? 'EX' : isPresent ? 'P' : isAbsent ? 'A' : 'Unmarked'}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Line: Checkbox + Student Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={isPresent}
                            onChange={(e) => {
                              handleStudentStatusToggle(st.id, e.target.checked ? 'present' : 'absent');
                            }}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#16a34a',
                              flexShrink: 0
                            }}
                            aria-label={`Attendance for ${st.name}`}
                          />
                          <span
                            title={st.name}
                            onClick={() => handleStudentStatusToggle(st.id, isPresent ? 'absent' : 'present')}
                            style={{
                              fontWeight: 600,
                              fontSize: '13.5px',
                              color: '#0f172a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                              minWidth: 0,
                              cursor: 'pointer'
                            }}
                          >
                            {st.name}
                          </span>
                        </div>

                        {/* Approved Exception details if applicable */}
                        {isOD && (
                          <div style={{ marginTop: '4px', paddingTop: '3px', borderTop: '1px dashed #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10px', color: '#1e40af', fontWeight: 700 }}>
                              ★ Approved: {excCheck.exception?.category || 'Duty'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExcSelectedStudent(st);
                                setShowExceptionModal(true);
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#2563eb',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              View
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Submit Action Bar */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                {!attTopic.trim() && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} color="#dc2626" />
                    <span><strong>Topic / Syllabus Covered is required:</strong> Please scroll up to enter the topic taught before saving attendance.</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (activeClass?.id) setRegClassId(activeClass.id);
                    if (attSubjectId) setRegSubjectId(attSubjectId);
                    setRegNavDept(attDept);
                    setRegNavSem(attSem);
                    setRegNavDiv(attDiv);
                    setRegNavBatch(attBatch);
                    setRegNavSubId(attSubjectId);
                    setFacultyTab('register');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px' }}
                >
                  <FileSpreadsheet size={15} color="#059669" />
                  <span>View Class Register</span>
                </button>

                {existingSessionForSlot && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete this recorded attendance session for ${attSubjectName || attSubjectId} (${attSem} ${attDiv}${attBatch !== 'ALL' ? ' ' + attBatch : ''}) on ${attDate}? This will remove the recorded attendance and reset the slot to unrecorded.`)) {
                        try {
                          deleteSession(existingSessionForSlot.id, currentFaculty);
                          reloadSessions();
                          setAttRecords({});
                          if (showToast) showToast('Attendance record deleted successfully!');
                        } catch (err) {
                          alert(err.message || 'Error deleting session');
                        }
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '11px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Delete This Attendance Record</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmitAttendance}
                  disabled={isSavingAttendance}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 26px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isSavingAttendance ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: isSavingAttendance ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <Save size={16} />
                  <span>{isSavingAttendance ? 'Saving Attendance...' : 'Submit & Save Attendance'}</span>
                </button>
              </div>
              </div>
            </div>

          </div>
        )}

        {/* =================================================================
            VIEW 3.5: OFFICIAL COLLEGE ATTENDANCE REGISTER (ERP MATRIX VIEW)
            ================================================================= */}
        {facultyTab === 'register' && (
          <AttendanceSheetView
            currentUser={currentUser}
            facultyRole={true}
            showToast={showToast}
            initialDepartment={regNavDept || attDept || currentFaculty.dept}
            initialSemester={regNavSem || attSem}
            initialDivision={regNavDiv || attDiv}
            initialBatch={regNavBatch || attBatch}
            initialSubjectId={regNavSubId || attSubjectId}
            onNavigateToTake={({ department, semester, division, batch, subjectId }) => {
              if (department) setAttDept(department);
              if (semester) setAttSem(semester);
              if (division && division !== 'ALL') setAttDiv(division);
              if (batch && batch !== 'ALL') setAttBatch(batch);
              if (subjectId) {
                setAttSubjectId(subjectId);
                const sub = getSubjects().find(s => s.id === subjectId || s.code === subjectId);
                if (sub) setAttSubjectName(sub.shortName || sub.name);
              }
              setFacultyTab('take');
            }}
          />
        )}

        {/* Integrated Attendance Exception Modals (Rendered globally for Take Attendance) */}

            {/* Modal: Request New Attendance Exception */}
            {showExceptionModal && (() => {
              const allStudents = getStudents();
              const filteredStudentOptions = allStudents.filter(st => {
                const q = excStudentSearch.toLowerCase();
                return !q || 
                  (st.name && st.name.toLowerCase().includes(q)) ||
                  (st.enrollmentNo && st.enrollmentNo.includes(q)) ||
                  (st.rollNo && String(st.rollNo).includes(q));
              });

              // Live calculation of overlapping scheduled lectures during selected date range
              const liveOverlapping = excSelectedStudent ? calculateOverlappingLectures(
                excSelectedStudent.sem || '3rd Sem',
                excSelectedStudent.class || 'Div 1',
                excSelectedStudent.dept,
                excStartDate,
                excEndDate
              ) : [];

              return (
                <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
                  <div className="modal-content" style={{ maxWidth: '680px', width: '92%', borderRadius: '16px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          Request Official Attendance Exception
                        </h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                          Record authorized absence for university tournaments, hackathons, seminars or college duty.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExceptionModal(false)}
                        style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!excSelectedStudent) {
                        alert('Please search and select an enrolled student.');
                        return;
                      }
                      if (!excActivityName.trim()) {
                        alert('Please enter the activity or event name.');
                        return;
                      }
                      if (excStartDate > excEndDate) {
                        alert('Start date cannot be after end date.');
                        return;
                      }

                      const res = saveException({
                        studentId: excSelectedStudent.id,
                        studentName: excSelectedStudent.name,
                        enrollmentNo: excSelectedStudent.enrollmentNo,
                        departmentId: excSelectedStudent.dept,
                        departmentName: excSelectedStudent.dept || currentFaculty.dept,
                        semester: excSelectedStudent.sem || '3rd Sem',
                        division: excSelectedStudent.class ? `Div ${excSelectedStudent.class}` : 'Div 1',
                        activityName: excActivityName.trim(),
                        category: excCategory,
                        startDate: excStartDate,
                        endDate: excEndDate,
                        reason: excReason.trim(),
                        documentName: excDocName || 'authorization_certificate.pdf',
                        documentSize: excDocSize || '1.1 MB',
                        submittedBy: currentFaculty.name,
                        submittedByRole: 'faculty'
                      }, currentUser || currentFaculty);

                      if (res.success) {
                        if (showToast) showToast(`Exception recorded and approved for ${excSelectedStudent.name}.`);
                        // Only mark active session as od if current attendance date falls within the exception date range
                        if (attDate >= excStartDate && attDate <= excEndDate) {
                          setAttRecords(prev => ({
                            ...prev,
                            [excSelectedStudent.id]: 'od'
                          }));
                          setAttRemarks(prev => ({
                            ...prev,
                            [excSelectedStudent.id]: `Approved Exception: ${excCategory}`
                          }));
                        }
                        // Clean up form state
                        setExcSelectedStudent(null);
                        setExcStudentSearch('');
                        setExcActivityName('');
                        setExcReason('');
                        setShowExceptionModal(false);
                      }
                    }}>

                      {/* 1. Student Selection */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                          Select Student (Search by Name or Enrollment) *
                        </label>
                        {!excSelectedStudent ? (
                          <div>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Type student name or enrollment number..."
                              value={excStudentSearch}
                              onChange={(e) => setExcStudentSearch(e.target.value)}
                              style={{ height: '38px', fontSize: '13px' }}
                            />
                            {excStudentSearch && (
                              <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                {filteredStudentOptions.slice(0, 10).map(st => (
                                  <div
                                    key={st.id}
                                    onClick={() => {
                                      setExcSelectedStudent(st);
                                      setExcStudentSearch('');
                                    }}
                                    style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '12.5px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                  >
                                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{st.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                      {st.enrollmentNo} • {st.dept} • {st.sem} {st.class ? `Div ${st.class}` : ''}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <div>
                              <div style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '14px' }}>
                                {excSelectedStudent.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                                Enrollment: <b>{excSelectedStudent.enrollmentNo}</b> • {excSelectedStudent.dept} • {excSelectedStudent.sem} {excSelectedStudent.class ? `Div ${excSelectedStudent.class}` : 'Div 1'}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExcSelectedStudent(null)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px' }}
                            >
                              Change Student
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 2. Activity Name & Category */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                            Activity / Event Name *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. GTU University Basketball Tournament"
                            value={excActivityName}
                            onChange={(e) => setExcActivityName(e.target.value)}
                            required
                            style={{ height: '38px', fontSize: '13px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                            Activity Category *
                          </label>
                          <select
                            className="form-control"
                            value={excCategory}
                            onChange={(e) => setExcCategory(e.target.value)}
                            required
                            style={{ height: '38px', fontSize: '13px', fontWeight: '600' }}
                          >
                            {EXCEPTION_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 3. Event Date Range */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                            Event Start Date *
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={excStartDate}
                            onChange={(e) => setExcStartDate(e.target.value)}
                            required
                            style={{ height: '38px', fontSize: '13px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                            Event End Date *
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={excEndDate}
                            onChange={(e) => setExcEndDate(e.target.value)}
                            required
                            style={{ height: '38px', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      {/* 4. Live Overlapping Lectures Preview */}
                      {excSelectedStudent && (
                        <div style={{ marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e3a8a', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Scheduled Lectures Affected ({liveOverlapping.length})</span>
                            <span style={{ color: '#64748b', fontWeight: '600' }}>Checked against Class Timetable</span>
                          </div>
                          {liveOverlapping.length === 0 ? (
                            <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                              No timetable lectures scheduled for {excSelectedStudent.sem} during {excStartDate} to {excEndDate}.
                            </div>
                          ) : (
                            <div style={{ maxHeight: '110px', overflowY: 'auto' }}>
                              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                <tbody>
                                  {liveOverlapping.map((ov, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                      <td style={{ padding: '3px 0', fontWeight: '700', color: '#0f172a' }}>{ov.date} ({ov.day})</td>
                                      <td style={{ padding: '3px 0', color: '#2563eb', fontWeight: '700' }}>{ov.timeSlot}</td>
                                      <td style={{ padding: '3px 0', fontWeight: '600' }}>{ov.subjectName}</td>
                                      <td style={{ padding: '3px 0', color: '#64748b' }}>📍 {ov.room}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 5. Reason Text */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                          Reason for Exception *
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Provide details about the official activity, competition, or team selection..."
                          value={excReason}
                          onChange={(e) => setExcReason(e.target.value)}
                          required
                        />
                      </div>

                      {/* 6. Supporting Document Upload */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                          Supporting Document / Permission Certificate (PDF, PNG, JPG)
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                setExcDocError('File size exceeds 5MB limit.');
                                return;
                              }
                              setExcDocError('');
                              setExcDocName(file.name);
                              setExcDocSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                            }
                          }}
                          className="form-control"
                          style={{ height: '38px', fontSize: '12.5px' }}
                        />
                        {excDocError && (
                          <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{excDocError}</div>
                        )}
                        {excDocName && (
                          <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: '700' }}>
                            ✓ Selected: {excDocName} ({excDocSize})
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowExceptionModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ fontWeight: '700' }}
                        >
                          Submit Exception Request
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              );
            })()}

            {/* Modal: View Overlapping Scheduled Lectures for an Exception */}
            {selectedExceptionView && (
              <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
                <div className="modal-content" style={{ maxWidth: '640px', width: '92%', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Affected Timetable Lectures
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                        {selectedExceptionView.studentName} ({selectedExceptionView.semester} {selectedExceptionView.division}) • {selectedExceptionView.startDate} to {selectedExceptionView.endDate}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedExceptionView(null)}
                      style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '20px' }}>
                    {selectedExceptionView.overlappingLectures && selectedExceptionView.overlappingLectures.length > 0 ? (
                      <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Time Slot</th>
                            <th>Subject</th>
                            <th>Faculty</th>
                            <th>Room</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExceptionView.overlappingLectures.map((lec, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: '700', color: '#0f172a' }}>{lec.date}</td>
                              <td>{lec.day}</td>
                              <td><span style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{lec.timeSlot}</span></td>
                              <td style={{ fontWeight: '700' }}>{lec.subjectName}</td>
                              <td>{lec.facultyName}</td>
                              <td>{lec.room}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        No class timetable conflicts found during this date range.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSelectedExceptionView(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}


        {/* =================================================================
            VIEW 5: FACULTY PROFILE
            ================================================================= */}
        {facultyTab === 'profile' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '32px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: '800',
                  boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
                }}>
                  {currentFaculty.name?.charAt(0) || 'F'}
                </div>

                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                    {currentFaculty.name}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                    {currentFaculty.designation || 'Faculty Member'} • Department of {currentFaculty.dept}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '28px' }}>
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Faculty ID</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
                    {currentFaculty.id}
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
                    {currentFaculty.email || 'N/A'}
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Phone Number</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
                    {currentFaculty.phone || 'N/A'}
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Specialization / Subjects</span>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
                    {currentFaculty.subjects || 'All Core Subjects'}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Logged in as Faculty • Access restricted to authorized lectures
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    logoutUser();
                    if (onExit) onExit();
                    else window.location.reload();
                  }}
                  style={{ color: '#e11d48' }}
                >
                  <LogOut size={15} />
                  <span>Log Out of Portal</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
