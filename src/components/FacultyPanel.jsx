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
  Award
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
  getCollegeName
} from '../services/attendanceStorage';
import { 
  getFacultyTimetable, 
  getFacultyScheduledLecturesForDate, 
  getEntriesByFaculty, 
  TIME_SLOTS, 
  TIMETABLE_DAYS, 
  getSubjectColor,
  notifyTimetableSync
} from '../services/timetableStorage';

export default function FacultyPanel({ currentUser, showToast, onExit }) {
  // -------------------------------------------------------------
  // 1. ACTIVE FACULTY IDENTITY
  // -------------------------------------------------------------
  const [facultiesList, setFacultiesList] = useState(getFaculties());
  
  // Resolve current logged-in faculty
  const currentFaculty = useMemo(() => {
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
  }, [facultiesList, currentUser]);

  // Main active tab in Faculty Panel: 'dashboard', 'timetable', 'take', 'history', 'profile'
  const [facultyTab, setFacultyTab] = useState('dashboard');

  // Timetable & master synchronization ticks for real-time live sync from Admin Panel
  const [timetableSyncTick, setTimetableSyncTick] = useState(0);
  const [studentsTick, setStudentsTick] = useState(0);
  const [classesTick, setClassesTick] = useState(0);

  // Listen for admin timetable, faculty, student, class, and session updates
  useEffect(() => {
    const handleSync = () => setTimetableSyncTick(t => t + 1);
    const handleFacultyUpdate = () => setFacultiesList(getFaculties());
    const handleStudentsUpdate = () => setStudentsTick(t => t + 1);
    const handleClassesUpdate = () => setClassesTick(t => t + 1);
    const handleSessionsUpdate = () => setAllSessions(getSessions());

    window.addEventListener('adit-timetable-synced', handleSync);
    window.addEventListener('adit-faculty-updated', handleFacultyUpdate);
    window.addEventListener('adit-students-updated', handleStudentsUpdate);
    window.addEventListener('adit-classes-updated', handleClassesUpdate);
    window.addEventListener('adit-sessions-updated', handleSessionsUpdate);
    return () => {
      window.removeEventListener('adit-timetable-synced', handleSync);
      window.removeEventListener('adit-faculty-updated', handleFacultyUpdate);
      window.removeEventListener('adit-students-updated', handleStudentsUpdate);
      window.removeEventListener('adit-classes-updated', handleClassesUpdate);
      window.removeEventListener('adit-sessions-updated', handleSessionsUpdate);
    };
  }, []);

  // -------------------------------------------------------------
  // 2. TIMETABLE DATA (Live Synchronized with Admin Panel)
  // -------------------------------------------------------------
  const facultyTimetableGrid = useMemo(() => {
    return getFacultyTimetable(currentFaculty?.id || 'FAC_PS');
  }, [currentFaculty?.id, timetableSyncTick]);

  // Timetable day switcher for My Timetable tab
  const todayDayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dName = days[new Date().getDay()];
    return TIMETABLE_DAYS.includes(dName) ? dName : 'Monday';
  }, []);
  const [selectedTimetableDay, setSelectedTimetableDay] = useState(todayDayName);
  const [isWeeklyGridView, setIsWeeklyGridView] = useState(false);

  // -------------------------------------------------------------
  // 3. ATTENDANCE SESSIONS & STATS
  // -------------------------------------------------------------
  const [allSessions, setAllSessions] = useState(getSessions());
  const reloadSessions = () => setAllSessions(getSessions());

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
  // 4. TAKE ATTENDANCE FORM STATE
  // -------------------------------------------------------------
  const [attDate, setAttDate] = useState(todayDateStr);
  const [attTimeSlot, setAttTimeSlot] = useState(todayScheduledLectures[0]?.time || '9:00 - 9:55');
  const [attDept, setAttDept] = useState(currentFaculty.dept || 'AI & Data Science');
  const [attSem, setAttSem] = useState('3rd Sem');
  const [attDiv, setAttDiv] = useState('Div 1');
  const [attYear, setAttYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [attSubjectId, setAttSubjectId] = useState(todayScheduledLectures[0]?.subjectId || 'DBMS');
  const [attSubjectName, setAttSubjectName] = useState(todayScheduledLectures[0]?.subjectName || 'Database Management Systems');
  const [attTopic, setAttTopic] = useState('');
  const [attRecords, setAttRecords] = useState({});
  const [attRemarks, setAttRemarks] = useState({});
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'present', 'absent'

  // Pre-fill lecture handler (e.g. from Dashboard or Timetable click)
  const selectLectureForAttendance = (lec, targetDate = todayDateStr) => {
    setAttDate(targetDate);
    setAttTimeSlot(lec.time || '9:00 - 9:55');
    setAttSubjectId(lec.subjectId || 'DBMS');
    setAttSubjectName(lec.subjectName || lec.name || lec.subjectId || 'Subject');
    if (lec.sem) setAttSem(normalizeSem(lec.sem));
    if (lec.div) setAttDiv(normalizeDiv(lec.div));
    if (lec.departmentId) {
      const depts = getDepartments();
      const f = depts.find(d => d.id === lec.departmentId || d.name.toLowerCase().includes(lec.departmentId.toLowerCase()));
      if (f) setAttDept(f.name);
    }
    setAttTopic('');
    setFacultyTab('take');
    if (showToast) {
      showToast(`Selected: ${lec.subjectName || lec.subjectId} (${lec.time})`);
    }
  };

  // Resolve Class entity for current Take Attendance selection
  const activeClass = useMemo(() => {
    return findClassByCriteria(attDept, attSem, attDiv, attYear) || 
           getOrCreateClass(attDept, attSem, attDiv, attYear);
  }, [attDept, attSem, attDiv, attYear]);

  // Retrieve enrolled students for this Class strictly from database
  const classStudents = useMemo(() => {
    if (activeClass && activeClass.id) {
      const enrolled = getStudentsByClassId(activeClass.id);
      if (enrolled && enrolled.length > 0) return enrolled;
    }
    const criteriaEnrolled = getStudentsForClassCriteria(attDept, attSem, attDiv, attYear);
    if (criteriaEnrolled && criteriaEnrolled.length > 0) return criteriaEnrolled;
    return [];
  }, [activeClass, attDept, attSem, attDiv, attYear, studentsTick]);

  // Initialize records to 'present' when student list changes
  useEffect(() => {
    const initialRecords = {};
    const initialRemarks = {};
    classStudents.forEach(st => {
      initialRecords[st.id] = 'present';
      initialRemarks[st.id] = '';
    });
    setAttRecords(initialRecords);
    setAttRemarks(initialRemarks);
  }, [classStudents]);

  // Attendance counts
  const presentCount = useMemo(() => {
    return classStudents.filter(s => (attRecords[s.id] || 'present') === 'present').length;
  }, [classStudents, attRecords]);

  const absentCount = useMemo(() => {
    return classStudents.filter(s => attRecords[s.id] === 'absent').length;
  }, [classStudents, attRecords]);

  const attendancePct = classStudents.length > 0 
    ? ((presentCount / classStudents.length) * 100).toFixed(1) 
    : '0.0';

  // Bulk status controls
  const handleMarkAllStatus = (status) => {
    const updated = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setAttRecords(updated);
    if (showToast) showToast(`All ${classStudents.length} students marked as ${status.toUpperCase()}`);
  };

  const handleStudentStatusToggle = (studentId, newStatus) => {
    setAttRecords(prev => ({
      ...prev,
      [studentId]: newStatus
    }));
  };

  // Submit attendance to database
  const handleSubmitAttendance = (e) => {
    if (e) e.preventDefault();

    if (classStudents.length === 0) {
      alert('Cannot save attendance: No students enrolled in this class.');
      return;
    }

    // Check for duplicate attendance record for this exact lecture slot
    const duplicate = facultySessions.find(s => 
      s.date === attDate &&
      s.timeSlot === attTimeSlot &&
      (s.subjectId === attSubjectId || s.subjectName === attSubjectName) &&
      (s.classId === activeClass?.id || (s.sem === attSem && s.division === attDiv))
    );

    if (duplicate) {
      const confirmOverwrite = window.confirm(
        `Attendance for this lecture session (${attSubjectName} at ${attTimeSlot} on ${attDate}) was already recorded.\n\nDo you want to update/overwrite the existing record?`
      );
      if (!confirmOverwrite) return;
    }

    const sessionPayload = {
      id: duplicate ? duplicate.id : undefined,
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
      topic: attTopic.trim() || 'General Lecture',
      records: attRecords,
      remarks: attRemarks,
      totalStudents: classStudents.length,
      presentCount: presentCount,
      absentCount: absentCount,
      percentage: attendancePct,
      submittedAt: new Date().toISOString()
    };

    saveSession(sessionPayload);
    reloadSessions();
    if (showToast) {
      showToast(`Attendance saved! (${presentCount} Present, ${absentCount} Absent)`);
    }

    // Automatically transition to Attendance Register with this class and subject selected
    if (activeClass?.id) setRegClassId(activeClass.id);
    if (attSubjectId) setRegSubjectId(attSubjectId);
    setFacultyTab('register');
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

  // Distinct classes relevant for this faculty
  const facultyClasses = useMemo(() => {
    const taughtMap = new Set();
    facultyEntries.forEach(e => {
      taughtMap.add(`${normalizeSem(e.semId || e.sem)}_${normalizeDiv(e.divId || e.div)}`);
    });

    const list = allClasses.filter(c => {
      const isDept = c.departmentName?.toLowerCase() === currentFaculty.dept?.toLowerCase() ||
                     c.departmentId === currentFaculty.deptId;
      const key = `${normalizeSem(c.semester)}_${normalizeDiv(c.division)}`;
      return taughtMap.has(key) || isDept;
    });

    return list.length > 0 ? list : allClasses;
  }, [allClasses, facultyEntries, currentFaculty]);

  // Selected Class in Register
  const [regClassId, setRegClassId] = useState('CLASS_DEP_AI_3_1_2026-27');
  
  const selectedRegClass = useMemo(() => {
    return allClasses.find(c => c.id === regClassId) || 
           facultyClasses.find(c => c.id === regClassId) || 
           facultyClasses[0] || 
           allClasses[0] || null;
  }, [allClasses, facultyClasses, regClassId]);

  // Relevant subjects for this faculty
  const facultySubjects = useMemo(() => {
    const list = allSubjects.filter(s => {
      const isAssigned = s.faculty && s.faculty.toLowerCase() === currentFaculty.name.toLowerCase();
      const inTimetable = facultyEntries.some(e => 
        e.subjectId === s.id || 
        e.subjectId === s.shortName || 
        e.subjectName === s.shortName || 
        e.subjectFullName === s.name
      );
      const isDept = s.dept && currentFaculty.dept && 
        (s.dept.toLowerCase().includes(currentFaculty.dept.toLowerCase()) || 
         currentFaculty.dept.toLowerCase().includes(s.dept.toLowerCase()));
      return isAssigned || inTimetable || isDept;
    });
    return list.length > 0 ? list : allSubjects;
  }, [allSubjects, currentFaculty, facultyEntries]);

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

  // -------------------------------------------------------------
  // 5. ATTENDANCE HISTORY VIEW & EDIT MODALS
  // -------------------------------------------------------------
  const [viewingSession, setViewingSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [editRecords, setEditRecords] = useState({});
  const [editTopic, setEditTopic] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  const filteredHistorySessions = useMemo(() => {
    return facultySessions
      .filter(sess => {
        if (!historySearch) return true;
        const q = historySearch.toLowerCase();
        return (
          (sess.subjectName && sess.subjectName.toLowerCase().includes(q)) ||
          (sess.subjectId && sess.subjectId.toLowerCase().includes(q)) ||
          (sess.date && sess.date.includes(q)) ||
          (sess.topic && sess.topic.toLowerCase().includes(q)) ||
          (sess.division && sess.division.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.date + 'T' + (b.timeSlot || '00:00')) - new Date(a.date + 'T' + (a.timeSlot || '00:00')));
  }, [facultySessions, historySearch]);

  const handleOpenEditSession = (sess) => {
    setEditingSession(sess);
    setEditRecords({ ...(sess.records || {}) });
    setEditTopic(sess.topic || '');
  };

  const handleSaveEditedSession = (e) => {
    e.preventDefault();
    if (!editingSession) return;

    let pCount = 0;
    let aCount = 0;
    Object.values(editRecords).forEach(st => {
      if (st === 'present') pCount++;
      else aCount++;
    });
    const total = Object.keys(editRecords).length;
    const pct = total > 0 ? ((pCount / total) * 100).toFixed(1) : '0.0';

    const updated = {
      ...editingSession,
      topic: editTopic,
      records: editRecords,
      presentCount: pCount,
      absentCount: aCount,
      percentage: pct,
      updatedAt: new Date().toISOString()
    };

    saveSession(updated);
    reloadSessions();
    setEditingSession(null);
    if (showToast) showToast('Attendance records updated successfully.');
  };

  const handleDeleteSession = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this attendance session record?')) {
      deleteSession(sessionId);
      reloadSessions();
      if (showToast) showToast('Attendance session deleted.');
    }
  };

  // Filtered student list for Take Attendance view
  const filteredStudents = useMemo(() => {
    return classStudents.filter(st => {
      const matchSearch = !studentSearch || 
        (st.name && st.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (st.enrollmentNo && st.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (st.rollNo && String(st.rollNo).includes(studentSearch));
      
      const stStatus = attRecords[st.id] || 'present';
      const matchFilter = statusFilter === 'all' || stStatus === statusFilter;
      return matchSearch && matchFilter;
    });
  }, [classStudents, studentSearch, statusFilter, attRecords]);

  // Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'My Timetable', icon: Calendar },
    { id: 'take', label: 'Take Attendance', icon: UserCheck },
    { id: 'register', label: 'Attendance Register', icon: FileSpreadsheet },
    { id: 'history', label: 'Attendance History', icon: FileText },
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
                    onClick={() => setFacultyTab(item.id)}
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
                  onClick={() => setFacultyTab('take')}
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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

              <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Attendance Completed</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckSquare size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>
                  {completedTodayCount}
                </div>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
                  Recorded today
                </span>
              </div>

              <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Attendance Pending</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: pendingTodayCount > 0 ? '#d97706' : '#64748b' }}>
                  {pendingTodayCount}
                </div>
                <span style={{ fontSize: '12px', color: pendingTodayCount > 0 ? '#d97706' : '#64748b', fontWeight: '600' }}>
                  {pendingTodayCount > 0 ? 'Action required' : 'All up to date'}
                </span>
              </div>

              <div className="card" style={{ padding: '20px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Total Sessions Saved</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
                  {facultySessions.length}
                </div>
                <span style={{ fontSize: '12px', color: '#9333ea', fontWeight: '600' }}>
                  Historical logs
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
                onClick={() => setFacultyTab('history')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Attendance History</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>Review past sessions, view &amp; edit logs</p>
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

              <div style={{ display: 'flex', gap: '10px' }}>
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

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  <span>Print Timetable</span>
                </button>
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
                  const activeSlots = Object.keys(daySlots).filter(t => daySlots[t] && daySlots[t].subject);

                  if (activeSlots.length === 0) {
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
                      {activeSlots.map(time => {
                        const slot = daySlots[time];
                        return (
                          <div
                            key={time}
                            style={{
                              padding: '18px',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  color: '#1e3a8a',
                                  backgroundColor: '#eff6ff',
                                  padding: '3px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {time}
                                </span>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  padding: '2px 8px',
                                  borderRadius: '4px'
                                }}>
                                  {slot.type || 'Lecture'}
                                </span>
                              </div>

                              <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                                {slot.name || slot.subject}
                              </h4>
                              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px', fontWeight: '600' }}>
                                {slot.sem} • {slot.div} {slot.room ? `• ${slot.room}` : ''}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => selectLectureForAttendance({
                                time,
                                subjectId: slot.subject,
                                subjectName: slot.name || slot.subject,
                                sem: slot.sem,
                                div: slot.div,
                                room: slot.room
                              })}
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
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* FULL WEEKLY MATRIX GRID VIEW */}
            {isWeeklyGridView && (
              <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
                <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table className="data-table" style={{ fontSize: '12.5px', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '110px' }}>Day</th>
                        {TIME_SLOTS.map(t => (
                          <th key={t} style={{ textAlign: 'center', fontSize: '11.5px', padding: '10px 4px' }}>
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIMETABLE_DAYS.map(dayName => (
                        <tr key={dayName}>
                          <td style={{ fontWeight: '800', color: '#0f172a', backgroundColor: '#f8fafc' }}>
                            {dayName}
                          </td>
                          {TIME_SLOTS.map(time => {
                            if (time.includes('12:40') || time.includes('LUNCH')) {
                              return (
                                <td key={time} style={{ textAlign: 'center', backgroundColor: '#f1f5f9', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>
                                  LUNCH
                                </td>
                              );
                            }
                            const slot = facultyTimetableGrid[dayName]?.[time];
                            if (!slot || !slot.subject) {
                              return (
                                <td key={time} style={{ textAlign: 'center', color: '#cbd5e1' }}>
                                  -
                                </td>
                              );
                            }

                            return (
                              <td 
                                key={time} 
                                style={{
                                  padding: '6px',
                                  backgroundColor: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  cursor: 'pointer',
                                  borderRadius: '6px'
                                }}
                                onClick={() => selectLectureForAttendance({
                                  time,
                                  subjectId: slot.subject,
                                  subjectName: slot.name || slot.subject,
                                  sem: slot.sem,
                                  div: slot.div,
                                  room: slot.room
                                })}
                                title="Click to Take Attendance"
                              >
                                <div style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '12px' }}>
                                  {slot.subject}
                                </div>
                                <div style={{ fontSize: '11px', color: '#475569' }}>
                                  {slot.sem} • {slot.div}
                                </div>
                                {slot.room && (
                                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                                    {slot.room}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================
            VIEW 3: TAKE ATTENDANCE (CORE ATTENDANCE MODULE)
            ================================================================= */}
        {facultyTab === 'take' && (
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
              
              {/* Form Title */}
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', fontFamily: "'Outfit', sans-serif" }}>
                  Record Lecture Attendance
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Take official attendance for your scheduled lecture. System verifies class roster and prevents duplicates.
                </p>
              </div>

              {/* Lecture Selection Strip */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                backgroundColor: '#f8fafc',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px'
              }}>
                {/* Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Lecture Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    style={{ height: '38px', fontSize: '13px', fontWeight: '600' }}
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Time Slot
                  </label>
                  <select
                    className="form-control"
                    value={attTimeSlot}
                    onChange={(e) => setAttTimeSlot(e.target.value)}
                    style={{ height: '38px', fontSize: '13px', fontWeight: '600' }}
                  >
                    {TIME_SLOTS.filter(t => !t.includes('12:40')).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={attSubjectName}
                    onChange={(e) => {
                      setAttSubjectName(e.target.value);
                      setAttSubjectId(e.target.value);
                    }}
                    style={{ height: '38px', fontSize: '13px', fontWeight: '600' }}
                  />
                </div>

                {/* Class / Sem / Div */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Semester &amp; Division
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select
                      className="form-control"
                      value={attSem}
                      onChange={(e) => setAttSem(e.target.value)}
                      style={{ height: '38px', fontSize: '13px', fontWeight: '600', flex: 1 }}
                    >
                      {['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <select
                      className="form-control"
                      value={attDiv}
                      onChange={(e) => setAttDiv(e.target.value)}
                      style={{ height: '38px', fontSize: '13px', fontWeight: '600', width: '90px' }}
                    >
                      {['Div 1', 'Div 2', 'Div 3'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Topic Covered */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Topic Covered in Lecture
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Unit 3: Relational Algebra & SQL Query Optimization"
                    value={attTopic}
                    onChange={(e) => setAttTopic(e.target.value)}
                    style={{ height: '38px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Roster Controls & Stats Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                </div>

                {/* Live Attendance Counter Badges */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    border: '1px solid #bfdbfe'
                  }}>
                    Total: {classStudents.length} ({attendancePct}%)
                  </span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
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
                  {['all', 'present', 'absent'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setStatusFilter(f)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: statusFilter === f ? '#0f172a' : '#ffffff',
                        color: statusFilter === f ? '#ffffff' : '#475569',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Roster Table */}
              <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', maxHeight: '480px', overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: '13px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                    <tr>
                      <th style={{ width: '80px' }}>Roll No</th>
                      <th>Student Name</th>
                      <th>Enrollment No</th>
                      <th style={{ textAlign: 'center', width: '220px' }}>Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No students found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(st => {
                        const isPresent = (attRecords[st.id] || 'present') === 'present';
                        return (
                          <tr key={st.id}>
                            <td style={{ fontWeight: '700' }}>{st.rollNo}</td>
                            <td style={{ fontWeight: '600', color: '#0f172a' }}>{st.name}</td>
                            <td style={{ color: '#64748b', fontSize: '12px' }}>{st.enrollmentNo}</td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleStudentStatusToggle(st.id, 'present')}
                                  style={{
                                    padding: '5px 14px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: isPresent ? '#059669' : 'transparent',
                                    color: isPresent ? '#ffffff' : '#64748b',
                                    fontWeight: '700',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    boxShadow: isPresent ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                  }}
                                >
                                  Present
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStudentStatusToggle(st.id, 'absent')}
                                  style={{
                                    padding: '5px 14px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: !isPresent ? '#e11d48' : 'transparent',
                                    color: !isPresent ? '#ffffff' : '#64748b',
                                    fontWeight: '700',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    boxShadow: !isPresent ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                  }}
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Submit Button Bar */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFacultyTab('dashboard')}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (activeClass?.id) setRegClassId(activeClass.id);
                    if (attSubjectId) setRegSubjectId(attSubjectId);
                    setFacultyTab('register');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileSpreadsheet size={15} color="#059669" />
                  <span>View Class Register</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitAttendance}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 24px',
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
                  <Save size={16} />
                  <span>Submit &amp; Save Attendance</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            VIEW 3.5: OFFICIAL COLLEGE ATTENDANCE REGISTER (ERP MATRIX VIEW)
            ================================================================= */}
        {facultyTab === 'register' && (
          <div className="erp-attendance-view" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Control & Filter Bar (Hidden on Print) */}
            <div className="card no-print" style={{ marginBottom: '20px', padding: '18px 22px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                
                {/* Left Side Filters */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  
                  {/* Class / Div Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                      Class / Division
                    </label>
                    <select
                      className="form-control"
                      value={regClassId}
                      onChange={(e) => setRegClassId(e.target.value)}
                      style={{ height: '38px', minWidth: '220px', fontWeight: '700', fontSize: '13px' }}
                    >
                      {facultyClasses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.departmentName ? (c.departmentName.length > 18 ? c.departmentName.split(' ')[0] : c.departmentName) : 'Dept'} • {c.semester} • {c.division} ({c.academicYear})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Course / Subject Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                      Course / Subject
                    </label>
                    <select
                      className="form-control"
                      value={regSubjectId}
                      onChange={(e) => setRegSubjectId(e.target.value)}
                      style={{ height: '38px', minWidth: '240px', fontWeight: '700', fontSize: '13px' }}
                    >
                      {facultySubjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.code ? `${s.code} - ` : ''}{s.shortName || s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Term & Year */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                      Term &amp; Year
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        className="form-control"
                        value={regTerm}
                        onChange={(e) => setRegTerm(e.target.value)}
                        style={{ height: '38px', width: '85px', fontWeight: '600', fontSize: '13px' }}
                      >
                        <option value="Odd">Odd</option>
                        <option value="Even">Even</option>
                      </select>
                      <select
                        className="form-control"
                        value={regAcademicYear}
                        onChange={(e) => setRegAcademicYear(e.target.value)}
                        style={{ height: '38px', width: '105px', fontWeight: '600', fontSize: '13px' }}
                      >
                        {ACADEMIC_YEARS.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                      Date Range
                    </label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="date"
                        className="form-control"
                        value={regDateFrom}
                        onChange={(e) => setRegDateFrom(e.target.value)}
                        style={{ height: '38px', width: '130px', fontSize: '12px' }}
                        title="From date"
                      />
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>to</span>
                      <input
                        type="date"
                        className="form-control"
                        value={regDateTo}
                        onChange={(e) => setRegDateTo(e.target.value)}
                        style={{ height: '38px', width: '130px', fontSize: '12px' }}
                        title="To date"
                      />
                      {(regDateFrom || regDateTo) && (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => { setRegDateFrom(''); setRegDateTo(''); }}
                          style={{ height: '36px', padding: '0 8px', fontSize: '11px' }}
                          title="Clear date filter"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                      Attendance Filter
                    </label>
                    <select
                      className="form-control"
                      value={regStatusFilter}
                      onChange={(e) => setRegStatusFilter(e.target.value)}
                      style={{ height: '38px', minWidth: '160px', fontSize: '13px' }}
                    >
                      <option value="ALL">All Students ({registerStudents.length})</option>
                      <option value="SHORTAGE">Shortage &lt; 75% ({shortageStudentsCount})</option>
                      <option value="ELIGIBLE">Eligible &ge; 75% ({eligibleStudentsCount})</option>
                    </select>
                  </div>

                  {/* Search Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                      Search Student
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enrollment / Name..."
                        value={regSearchQuery}
                        onChange={(e) => setRegSearchQuery(e.target.value)}
                        style={{ height: '38px', paddingLeft: '32px', width: '170px', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleExportExcel}
                    style={{ height: '38px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Export formatted Excel (.xlsx) file"
                  >
                    <FileSpreadsheet size={16} color="#059669" />
                    <span>Export Excel</span>
                  </button>

                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePrint}
                    style={{ height: '38px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Print official academic sheet"
                  >
                    <Printer size={16} color="#2563eb" />
                    <span>Print Sheet</span>
                  </button>

                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      if (selectedRegClass) {
                        setAttDept(selectedRegClass.departmentName || currentFaculty.dept);
                        setAttSem(selectedRegClass.semester);
                        setAttDiv(selectedRegClass.division);
                      }
                      if (selectedRegSubject) {
                        setAttSubjectId(selectedRegSubject.id);
                        setAttSubjectName(selectedRegSubject.name || selectedRegSubject.shortName);
                      }
                      setFacultyTab('take');
                    }}
                    style={{ height: '38px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Record attendance for this class"
                  >
                    <UserCheck size={16} />
                    <span>Take Attendance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Official College Attendance Matrix Card */}
            <div className="erp-sheet-card">
              
              {/* College Header */}
              <div className="erp-sheet-header">
                <h2 className="erp-college-title">{getCollegeName()}</h2>
                <div className="erp-header-row">
                  <span>Academic Year : {regAcademicYear}</span>
                  <span>Term: {regTerm}</span>
                </div>
                <div className="erp-header-row erp-course-title">
                  <span>Course Code : {selectedRegSubject?.code || ''} {selectedRegSubject?.name || selectedRegSubject?.shortName || 'Course'}</span>
                </div>
                <div className="erp-header-row">
                  <span>Department : {selectedRegClass?.departmentName || currentFaculty.dept}</span>
                  <span>Class : {selectedRegClass?.semester || ''} {selectedRegClass?.division || ''}</span>
                  <span style={{ color: '#2563eb' }}>Faculty : {currentFaculty.name}</span>
                </div>
              </div>

              {/* Attendance Matrix Table */}
              <div className="erp-table-scroll-container">
                <table className="erp-attendance-table">
                  <thead>
                    <tr>
                      <th className="erp-th-sticky-sr">Sr No</th>
                      <th className="erp-th-sticky-enroll">Enrollment No</th>
                      <th style={{ minWidth: '150px', textAlign: 'left', paddingLeft: '12px' }}>Student Name</th>
                      
                      {/* Dynamic Session Date Columns */}
                      {registerSessions.map((sess) => {
                        const hdr = formatSessionHeader(sess, registerSessions);
                        return (
                          <th 
                            key={sess.id} 
                            className="erp-th-date"
                            title={`Date: ${sess.date}\nTime: ${sess.timeSlot || 'Slot'}\nTopic: ${sess.topic || 'Lecture'}\nFaculty: ${sess.facultyName || currentFaculty.name}`}
                          >
                            <div style={{ fontWeight: '700', fontSize: '11px', color: '#0f172a' }}>
                              {hdr.main}
                            </div>
                            {hdr.sub && (
                              <div style={{ fontSize: '9.5px', color: '#2563eb', fontWeight: '800' }}>
                                {hdr.sub}
                              </div>
                            )}
                          </th>
                        );
                      })}

                      {/* Summary Columns */}
                      <th className="erp-th-stat" style={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '800' }}>
                        Total Present
                      </th>
                      <th className="erp-th-stat" style={{ backgroundColor: '#f1f5f9' }}>
                        Total Lectures
                      </th>
                      <th className="erp-th-stat" style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', fontWeight: '800' }}>
                        Percentage (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {registerStudentsFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={registerSessions.length + 6} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                          <Users size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                          <div style={{ fontWeight: '700', color: '#334155', fontSize: '14px' }}>
                            {registerStudents.length === 0 
                              ? `No students enrolled in ${selectedRegClass?.departmentName || currentFaculty.dept} (${selectedRegClass?.semester || ''} ${selectedRegClass?.division || ''}) yet.`
                              : 'No students found matching your search or status filter.'}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
                            {registerStudents.length === 0 
                              ? 'Students added or imported in the Admin Panel for this class will automatically be loaded here.' 
                              : 'Try adjusting your search query or attendance filter.'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      registerStudentsFiltered.map((student, idx) => {
                        let presentCount = 0;
                        let odCount = 0;
                        const total = registerSessions.length;

                        return (
                          <tr key={student.id}>
                            {/* Sr No */}
                            <td className="erp-td-sticky-sr">{idx + 1}</td>
                            
                            {/* Enrollment No */}
                            <td className="erp-td-sticky-enroll" title={`Enrollment: ${student.enrollmentNo}`}>
                              {student.enrollmentNo}
                            </td>

                            {/* Student Name */}
                            <td style={{ textAlign: 'left', paddingLeft: '12px', fontWeight: '600', color: '#0f172a' }}>
                              <span>{student.name}</span>
                              {student.rollNo && (
                                <span style={{ marginLeft: '6px', fontSize: '11px', color: '#64748b', fontWeight: '400' }}>
                                  (#{student.rollNo})
                                </span>
                              )}
                            </td>

                            {/* Date Cells: P / A / OD */}
                            {registerSessions.map(sess => {
                              const status = (sess.records && sess.records[student.id]) || '';
                              let cellClass = 'erp-cell-empty';
                              let displayText = '-';

                              if (status === 'present' || status === 'late') {
                                presentCount++;
                                cellClass = 'erp-cell-p';
                                displayText = 'P';
                              } else if (status === 'absent') {
                                cellClass = 'erp-cell-a';
                                displayText = 'A';
                              } else if (status === 'od') {
                                odCount++;
                                presentCount++;
                                cellClass = 'erp-cell-od';
                                displayText = 'O*';
                              }

                              return (
                                <td 
                                  key={sess.id} 
                                  className={`erp-attendance-cell ${cellClass}`}
                                  onClick={() => handleRegisterCellClick(sess, student.id)}
                                  title={`Click to toggle status for ${student.name} on ${sess.date} ${sess.timeSlot ? `(${sess.timeSlot})` : ''} - Current: ${status ? status.toUpperCase() : 'NOT RECORDED'}`}
                                >
                                  {displayText}
                                </td>
                              );
                            })}

                            {/* Total Present */}
                            <td className="erp-td-stat" style={{ fontWeight: '800', color: '#059669', backgroundColor: '#f0fdf4' }}>
                              {presentCount}
                            </td>

                            {/* Total Lectures */}
                            <td className="erp-td-stat" style={{ color: '#475569' }}>
                              {total}
                            </td>

                            {/* Percentage */}
                            <td 
                              className="erp-td-stat" 
                              style={{ 
                                fontWeight: '800', 
                                color: (total > 0 && ((presentCount / total) * 100) < 75) ? '#e11d48' : '#059669',
                                backgroundColor: (total > 0 && ((presentCount / total) * 100) < 75) ? '#fff1f2' : '#f0fdf4'
                              }}
                            >
                              {total > 0 ? ((presentCount / total) * 100).toFixed(2) : '0.00'}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* Table Footer: Total Present per Lecture */}
                  {registerStudentsFiltered.length > 0 && registerSessions.length > 0 && (
                    <tfoot>
                      <tr className="erp-footer-row">
                        <td colSpan="3" style={{ textAlign: 'right', paddingRight: '16px', fontWeight: '800', color: '#0f172a' }}>
                          Total Present in Lecture:
                        </td>
                        {registerSessions.map(sess => {
                          let count = 0;
                          registerStudentsFiltered.forEach(st => {
                            const s = sess.records && sess.records[st.id];
                            if (s === 'present' || s === 'late' || s === 'od') count++;
                          });
                          return (
                            <td key={sess.id} style={{ fontWeight: '800', color: '#059669' }}>
                              {count}
                            </td>
                          );
                        })}
                        <td style={{ fontWeight: '800', color: '#059669', backgroundColor: '#ecfdf5' }}>
                          -
                        </td>
                        <td style={{ color: '#475569' }}>
                          -
                        </td>
                        <td style={{ fontWeight: '800', color: Number(classAveragePct) < 75 ? '#e11d48' : '#059669' }}>
                          Avg: {classAveragePct}%
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Register Summary Strip */}
              <div style={{
                marginTop: '20px',
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <span>
                    Official Academic Register • Click any cell to toggle <strong>P / A / O*</strong> • Live auto-saving enabled
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', padding: '5px 10px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1e3a8a' }}>
                    Enrolled: {registerStudents.length} Students
                  </span>

                  <span style={{ fontSize: '12.5px', fontWeight: '700', padding: '5px 10px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                    Conducted: {registerSessions.length} Sessions
                  </span>

                  <span style={{ fontSize: '12.5px', fontWeight: '800', padding: '5px 10px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669' }}>
                    Eligible (&ge;75%): {eligibleStudentsCount}
                  </span>

                  <span style={{ fontSize: '12.5px', fontWeight: '800', padding: '5px 10px', borderRadius: '8px', backgroundColor: '#fff1f2', color: '#e11d48' }}>
                    Shortage (&lt;75%): {shortageStudentsCount}
                  </span>

                  <span style={{ fontSize: '13px', fontWeight: '800', padding: '5px 12px', borderRadius: '8px', backgroundColor: '#0f172a', color: '#ffffff' }}>
                    Class Avg: {classAveragePct}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            VIEW 4: ATTENDANCE HISTORY
            ================================================================= */}
        {facultyTab === 'history' && (
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', fontFamily: "'Outfit', sans-serif" }}>
                    Attendance History &amp; Records
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Log of past attendance sessions recorded by {currentFaculty.name}.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setFacultyTab('take')}
                  >
                    <UserCheck size={15} />
                    <span>Record New Attendance</span>
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div style={{ marginBottom: '16px', maxWidth: '320px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search history by subject, date, topic..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    style={{ height: '36px', paddingLeft: '32px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* History Table */}
              <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table className="data-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Subject</th>
                      <th>Class / Div</th>
                      <th>Topic Covered</th>
                      <th style={{ textAlign: 'center' }}>Attendance</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistorySessions.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                          No attendance records found. Start taking attendance from your schedule!
                        </td>
                      </tr>
                    ) : (
                      filteredHistorySessions.map(sess => (
                        <tr key={sess.id}>
                          <td style={{ fontWeight: '700', color: '#0f172a' }}>{sess.date}</td>
                          <td style={{ color: '#475569', fontSize: '12px' }}>{sess.timeSlot || '-'}</td>
                          <td style={{ fontWeight: '600' }}>{sess.subjectName || sess.subjectId}</td>
                          <td>{sess.sem} • {sess.division}</td>
                          <td style={{ color: '#64748b', fontSize: '12.5px' }}>{sess.topic || '-'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '20px',
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              fontSize: '11.5px',
                              fontWeight: '700'
                            }}>
                              {sess.presentCount || 0} / {(sess.presentCount || 0) + (sess.absentCount || 0)} ({sess.percentage || '0'}%)
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setViewingSession(sess)}
                                title="View Student Records"
                                style={{ padding: '4px 8px' }}
                              >
                                <Eye size={13} />
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEditSession(sess)}
                                title="Edit Attendance"
                                style={{ padding: '4px 8px' }}
                              >
                                <Edit3 size={13} />
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleDeleteSession(sess.id)}
                                title="Delete Record"
                                style={{ padding: '4px 8px', color: '#e11d48' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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

      {/* ===================================================================
          MODAL 1: VIEW ATTENDANCE SESSION DETAILS
          =================================================================== */}
      {viewingSession && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={20} color="#2563eb" />
                <span>Attendance Session Details</span>
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewingSession(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '15px' }}>
                  {viewingSession.subjectName || viewingSession.subjectId}
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '3px' }}>
                  {viewingSession.date} • {viewingSession.timeSlot || 'Time N/A'} • {viewingSession.sem} • {viewingSession.division}
                </div>
                <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: '600', marginTop: '4px' }}>
                  Topic: {viewingSession.topic || 'N/A'}
                </div>
              </div>

              <div className="table-responsive" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: '12.5px' }}>
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map(st => {
                      const stStatus = viewingSession.records ? viewingSession.records[st.id] : 'absent';
                      const isPresent = stStatus === 'present';
                      return (
                        <tr key={st.id}>
                          <td style={{ fontWeight: '700' }}>{st.rollNo}</td>
                          <td>{st.name}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              backgroundColor: isPresent ? '#ecfdf5' : '#fff1f2',
                              color: isPresent ? '#059669' : '#e11d48',
                              fontWeight: '700',
                              fontSize: '11px'
                            }}>
                              {isPresent ? 'Present' : 'Absent'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setViewingSession(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: EDIT ATTENDANCE SESSION
          =================================================================== */}
      {editingSession && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} color="#2563eb" />
                <span>Edit Attendance Record</span>
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingSession(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSession}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Topic Covered
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                  />
                </div>

                <div className="table-responsive" style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '12.5px' }}>
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map(st => {
                        const stStatus = editRecords[st.id] || 'present';
                        const isPresent = stStatus === 'present';
                        return (
                          <tr key={st.id}>
                            <td style={{ fontWeight: '700' }}>{st.rollNo}</td>
                            <td>{st.name}</td>
                            <td style={{ textAlign: 'center' }}>
                              <select
                                className="form-control"
                                value={stStatus}
                                onChange={(e) => setEditRecords({ ...editRecords, [st.id]: e.target.value })}
                                style={{ height: '32px', fontSize: '12px', padding: '2px 8px' }}
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSession(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
