import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock, 
  HelpCircle,
  Building2,
  Calendar,
  Layers,
  ChevronDown,
  PlusCircle,
  AlertCircle,
  Award,
  ShieldCheck,
  ShieldAlert,
  Lock,
  RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  getStudents, 
  getSubjects, 
  getSessions, 
  saveSession, 
  getCollegeName, 
  getDepartments,
  getClasses,
  getStudentsForAcademicGroup,
  DEFAULT_ACADEMIC_YEAR,
  ACADEMIC_YEARS,
  normalizeSem,
  normalizeDiv,
  getAuthorizedFacultyClasses,
  getAuthorizedFacultySubjects,
  canFacultyTeachClassAndSubject,
  getInstitutionalExceptionPolicy,
  INSTITUTIONAL_POLICIES,
  isStudentExcusedForSession,
  getExceptions,
  isBatchMatch
} from '../services/attendanceStorage';

export default function AttendanceSheetView({ 
  currentUser, 
  facultyRole = false, 
  showToast, 
  onNavigateToTake,
  initialDepartment,
  initialSemester,
  initialDivision,
  initialBatch,
  initialSubjectId
}) {
  const isFaculty = facultyRole || currentUser?.role === 'faculty';
  const allDepartments = useMemo(() => getDepartments(), []);

  // -------------------------------------------------------------
  // 1. Live Synchronization Listeners
  // -------------------------------------------------------------
  const [sessionsTick, setSessionsTick] = useState(0);
  const [studentsTick, setStudentsTick] = useState(0);

  useEffect(() => {
    const handleSessionsUpdate = () => setSessionsTick(t => t + 1);
    const handleStudentsUpdate = () => setStudentsTick(t => t + 1);

    window.addEventListener('adit-sessions-updated', handleSessionsUpdate);
    window.addEventListener('adit-students-updated', handleStudentsUpdate);
    window.addEventListener('adit-classes-updated', handleStudentsUpdate);
    window.addEventListener('adit-exceptions-updated', handleSessionsUpdate);

    return () => {
      window.removeEventListener('adit-sessions-updated', handleSessionsUpdate);
      window.removeEventListener('adit-students-updated', handleStudentsUpdate);
      window.removeEventListener('adit-classes-updated', handleStudentsUpdate);
      window.removeEventListener('adit-exceptions-updated', handleSessionsUpdate);
    };
  }, []);

  // -------------------------------------------------------------
  // 2. Faculty Access Control & Scoped Authorization
  // -------------------------------------------------------------
  const allSessions = useMemo(() => {
    return getSessions({}, currentUser);
  }, [sessionsTick, currentUser]);

  const authClasses = useMemo(() => {
    if (isFaculty && currentUser) {
      return getAuthorizedFacultyClasses(currentUser);
    }
    return null;
  }, [isFaculty, currentUser, sessionsTick]);

  // Restrict departments to authorized list when in faculty mode
  const departments = useMemo(() => {
    if (!isFaculty || !authClasses || authClasses.length === 0) return allDepartments;
    const authDeptNames = new Set(authClasses.map(a => (a.departmentName || a.department || '').toLowerCase()));
    allSessions.forEach(s => {
      const facId = currentUser?.facultyId || currentUser?.id;
      if (s.facultyId === facId || s.takenBy === facId) {
        if (s.department) authDeptNames.add(s.department.toLowerCase());
      }
    });
    const filtered = allDepartments.filter(d => 
      authDeptNames.has(d.name.toLowerCase()) || 
      authDeptNames.has(d.id.toLowerCase()) ||
      authDeptNames.has(d.code?.toLowerCase())
    );
    return filtered.length > 0 ? filtered : allDepartments;
  }, [allDepartments, isFaculty, authClasses, allSessions, currentUser]);

  // Initial Filter States
  const [selectedDepartment, setSelectedDepartment] = useState(() => {
    if (initialDepartment) return initialDepartment;
    if (isFaculty && authClasses && authClasses.length > 0) {
      return authClasses[0].departmentName || authClasses[0].department || 'Computer Engineering';
    }
    if (isFaculty && currentUser?.dept) {
      const match = allDepartments.find(d => d.name.toLowerCase().includes(currentUser.dept.toLowerCase()) || currentUser.dept.toLowerCase().includes(d.name.toLowerCase()));
      if (match) return match.name;
    }
    return allDepartments[0]?.name || 'Computer Engineering';
  });

  const [selectedSemester, setSelectedSemester] = useState(() => {
    if (initialSemester) return initialSemester;
    if (isFaculty && authClasses && authClasses.length > 0) {
      return authClasses[0].semester || '3rd Sem';
    }
    return '3rd Sem';
  });

  const [selectedDivision, setSelectedDivision] = useState(() => {
    if (initialDivision) return initialDivision;
    if (isFaculty && authClasses && authClasses.length > 0) {
      return authClasses[0].division || 'Div 1';
    }
    return 'Div 3';
  });

  const [selectedBatch, setSelectedBatch] = useState(initialBatch || 'ALL');
  const [selectedTerm, setSelectedTerm] = useState('Odd');
  const [academicYear, setAcademicYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SHORTAGE, ELIGIBLE
  const [showClassExceptionsModal, setShowClassExceptionsModal] = useState(false);

  // Update selection if initial props change
  useEffect(() => {
    if (initialDepartment) setSelectedDepartment(initialDepartment);
    if (initialSemester) setSelectedSemester(initialSemester);
    if (initialDivision) setSelectedDivision(initialDivision);
    if (initialBatch) setSelectedBatch(initialBatch);
    if (initialSubjectId) setSelectedSubjectId(initialSubjectId);
  }, [initialDepartment, initialSemester, initialDivision, initialBatch, initialSubjectId]);

  // Available semesters strictly based on authorized assignments or recorded sessions
  const availableSemesters = useMemo(() => {
    if (!isFaculty || !authClasses || authClasses.length === 0) {
      return ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];
    }
    const sems = new Set(authClasses.map(a => a.semester).filter(Boolean));
    allSessions.forEach(s => {
      const facId = currentUser?.facultyId || currentUser?.id;
      if (s.facultyId === facId || s.takenBy === facId) {
        if (s.sem) sems.add(s.sem);
      }
    });
    return Array.from(sems);
  }, [isFaculty, authClasses, allSessions, currentUser]);

  // Available divisions strictly based on authorized assignments or recorded sessions
  const availableDivisions = useMemo(() => {
    if (!isFaculty || !authClasses || authClasses.length === 0) {
      return ['ALL', 'Div 1', 'Div 2', 'Div 3'];
    }
    const divs = new Set(authClasses
      .filter(a => normalizeSem(a.semester) === normalizeSem(selectedSemester))
      .map(a => a.division)
      .filter(Boolean));
    allSessions.forEach(s => {
      const facId = currentUser?.facultyId || currentUser?.id;
      if (s.facultyId === facId || s.takenBy === facId) {
        if (normalizeSem(s.sem) === normalizeSem(selectedSemester) && s.division) {
          divs.add(s.division);
        }
      }
    });
    return ['ALL', ...Array.from(divs)];
  }, [isFaculty, authClasses, selectedSemester, allSessions, currentUser]);

  // Available subjects strictly constrained by faculty assignments or recorded sessions
  const allSubjects = useMemo(() => getSubjects(), []);
  const availableSubjects = useMemo(() => {
    if (isFaculty && currentUser) {
      const list = [];
      const authSubs = getAuthorizedFacultySubjects(currentUser, selectedSemester, selectedDivision);
      list.push(...authSubs);
      const facId = currentUser.facultyId || currentUser.id;
      allSessions.forEach(s => {
        if (s.facultyId === facId || s.takenBy === facId) {
          if (normalizeSem(s.sem) === normalizeSem(selectedSemester)) {
            const matchSub = allSubjects.find(sub => sub.id === s.subjectId || sub.code === s.subjectId || sub.name === s.subjectName);
            if (matchSub && !list.some(x => x.id === matchSub.id)) {
              list.push(matchSub);
            }
          }
        }
      });
      if (list.length > 0) return list;
    }

    const normSem = normalizeSem(selectedSemester);
    const targetDept = (selectedDepartment || '').toLowerCase();
    const filtered = allSubjects.filter(s => {
      const sDept = (s.dept || '').toLowerCase();
      const sSem = normalizeSem(s.sem);
      const deptMatches = !selectedDepartment || sDept.includes(targetDept) || targetDept.includes(sDept) ||
        (targetDept.includes('computer') && (sDept.includes('cp') || sDept.includes('computer'))) ||
        (targetDept.includes('ai') && (sDept.includes('ai') || sDept.includes('data science'))) ||
        (targetDept.includes('it') && (sDept.includes('it') || sDept.includes('information')));
      const semMatches = !selectedSemester || sSem === normSem;
      return deptMatches && semMatches;
    });

    if (filtered.length > 0) return filtered;
    return allSubjects;
  }, [allSubjects, isFaculty, currentUser, selectedDepartment, selectedSemester, selectedDivision, allSessions]);

  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    if (initialSubjectId) return initialSubjectId;
    return availableSubjects[0]?.id || 'SUB_DS';
  });

  // Ensure selectedSubjectId is valid when department/semester/division changes
  useEffect(() => {
    if (initialSubjectId && initialSubjectId !== selectedSubjectId && availableSubjects.some(s => s.id === initialSubjectId)) {
      setSelectedSubjectId(initialSubjectId);
    } else if (availableSubjects.length > 0 && !availableSubjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(availableSubjects[0].id);
    }
  }, [availableSubjects, initialSubjectId, selectedSubjectId]);

  // Active Subject details
  const activeSubject = useMemo(() => {
    return allSubjects.find(s => s.id === selectedSubjectId || s.code === selectedSubjectId) || 
      availableSubjects[0] || {
        id: selectedSubjectId,
        code: '102040304',
        name: 'DATA STRUCTURES',
        shortName: 'DS',
        dept: selectedDepartment,
        sem: selectedSemester
      };
  }, [allSubjects, availableSubjects, selectedSubjectId, selectedDepartment, selectedSemester]);

  // -------------------------------------------------------------
  // 3. Strict Backend Authorization Validation Guard
  // -------------------------------------------------------------
  const isAuthorized = useMemo(() => {
    if (!isFaculty || !currentUser) return true;
    const canTeach = canFacultyTeachClassAndSubject(
      currentUser,
      selectedDepartment,
      selectedSemester,
      selectedDivision,
      selectedSubjectId
    );
    const facId = currentUser.facultyId || currentUser.id;
    const facName = (currentUser.name || '').trim().toLowerCase();
    const hasRecorded = allSessions.some(s => 
      (s.facultyId === facId || s.takenBy === facId || (s.facultyName && s.facultyName.trim().toLowerCase() === facName)) &&
      (s.subjectId === selectedSubjectId || s.subjectName === selectedSubjectId) &&
      (!selectedDepartment || s.department === selectedDepartment) &&
      (!selectedDivision || selectedDivision === 'ALL' || normalizeDiv(s.division) === normalizeDiv(selectedDivision))
    );
    return canTeach || hasRecorded;
  }, [isFaculty, currentUser, selectedDepartment, selectedSemester, selectedDivision, selectedSubjectId, allSessions]);

  // Auto-switch to authorized class if user somehow lands on unauthorized view
  const handleSwitchToAuthorized = () => {
    if (authClasses && authClasses.length > 0) {
      const first = authClasses[0];
      const subs = getAuthorizedFacultySubjects(currentUser, first.semester, first.division);
      if (first.departmentName) setSelectedDepartment(first.departmentName);
      if (first.semester) setSelectedSemester(first.semester);
      if (first.division) setSelectedDivision(first.division);
      if (subs && subs.length > 0) setSelectedSubjectId(subs[0].id);
      if (showToast) showToast(`Switched to assigned class: ${first.semester} ${first.division}`);
    }
  };

  // -------------------------------------------------------------
  // 4. Institutional Policy & Excused Attendance
  // -------------------------------------------------------------
  const activePolicy = useMemo(() => getInstitutionalExceptionPolicy(), [sessionsTick]);
  const classExceptions = useMemo(() => {
    const list = getExceptions(currentUser);
    return list.filter(e => {
      const matchSem = !selectedSemester || normalizeSem(e.semester) === normalizeSem(selectedSemester);
      const matchDiv = !selectedDivision || selectedDivision === 'ALL' || normalizeDiv(e.division) === normalizeDiv(selectedDivision);
      return matchSem && matchDiv && e.status === 'Approved';
    });
  }, [currentUser, selectedSemester, selectedDivision, sessionsTick]);

  // -------------------------------------------------------------
  // 5. Dynamic Lecture Sessions: strictly filtered by user context & class
  // -------------------------------------------------------------

  const subjectSessions = useMemo(() => {
    if (!isAuthorized) return [];
    return allSessions
      .filter(s => {
        // Must match Subject (by ID, code, or name)
        const matchSubject = s.subjectId === selectedSubjectId || 
          s.subjectId === activeSubject.code || 
          s.subjectName === activeSubject.name ||
          (activeSubject.shortName && s.subjectName === activeSubject.shortName);
        if (!matchSubject) return false;

        // Match Semester if present on session
        if (s.sem && selectedSemester && normalizeSem(s.sem) !== normalizeSem(selectedSemester)) {
          return false;
        }

        // Match Division if not ALL
        if (selectedDivision !== 'ALL' && s.division) {
          if (normalizeDiv(s.division) !== normalizeDiv(selectedDivision)) return false;
        }

        // Match Batch if not ALL
        if (selectedBatch !== 'ALL' && !isBatchMatch(s.batch, selectedBatch)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateDiff = new Date(a.date) - new Date(b.date);
        if (dateDiff !== 0) return dateDiff;
        const timeA = a.startTime || (a.timeSlot ? a.timeSlot.split('-')[0].trim() : '');
        const timeB = b.startTime || (b.timeSlot ? b.timeSlot.split('-')[0].trim() : '');
        if (timeA && timeB && timeA !== timeB) return timeA.localeCompare(timeB);
        return (a.submittedAt || a.id || '').localeCompare(b.submittedAt || b.id || '');
      });
  }, [allSessions, isAuthorized, selectedSubjectId, activeSubject, selectedSemester, selectedDivision, selectedBatch]);

  // -------------------------------------------------------------
  // 6. Students strictly fetched with backend access control
  // -------------------------------------------------------------
  const enrolledStudents = useMemo(() => {
    if (!isAuthorized) return [];
    return getStudentsForAcademicGroup({
      department: selectedDepartment,
      semester: selectedSemester,
      division: selectedDivision,
      batch: selectedBatch,
      academicYear: academicYear
    }, currentUser);
  }, [isAuthorized, selectedDepartment, selectedSemester, selectedDivision, selectedBatch, academicYear, studentsTick, currentUser]);

  // Filter students based on search query and attendance status filter
  const filteredStudents = useMemo(() => {
    return enrolledStudents.filter(student => {
      // Search filter
      const query = searchQuery.trim().toLowerCase();
      const matchQuery = !query || 
        student.enrollmentNo.toLowerCase().includes(query) ||
        (student.name && student.name.toLowerCase().includes(query)) ||
        (student.rollNo && String(student.rollNo).includes(query));

      if (!matchQuery) return false;

      // Attendance percentage calculation according to institutional policy
      let presentCount = 0;
      let exceptionCount = 0;
      const totalConducted = subjectSessions.length;

      subjectSessions.forEach(sess => {
        const rawStatus = (sess.records && (sess.records[student.id] || (student.enrollmentNo && sess.records[student.enrollmentNo]))) || '';
        const excCheck = isStudentExcusedForSession(student.id, sess.date, sess.timeSlot, selectedSubjectId, sess.batch);
        const isExplicitPresent = rawStatus === 'present' || rawStatus === 'late';
        const isOD = rawStatus === 'od' || rawStatus === 'exception';
        const isEX = isOD || (!isExplicitPresent && excCheck.isExcused);
        if (isExplicitPresent) {
          presentCount++;
        } else if (isEX) {
          exceptionCount++;
        }
      });

      let effNum = presentCount;
      let effDen = totalConducted;
      if (activePolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE) {
        effNum = presentCount + exceptionCount;
      } else if (activePolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION) {
        effDen = Math.max(0, totalConducted - exceptionCount);
      }

      const pct = effDen > 0 ? (effNum / effDen) * 100 : 0;

      if (statusFilter === 'SHORTAGE') return pct < 75;
      if (statusFilter === 'ELIGIBLE') return pct >= 75;
      return true;
    });
  }, [enrolledStudents, searchQuery, statusFilter, subjectSessions, selectedSubjectId, activePolicy]);

  // Format date header to DD-MM
  const formatDateHeader = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}`;
    }
    return dateStr;
  };

  // Toggle attendance status for a student on a session on click
  const handleCellClick = (session, studentId) => {
    // Authorization check
    if (isFaculty && !canFacultyTeachClassAndSubject(currentUser, selectedDepartment, selectedSemester, selectedDivision, selectedSubjectId)) {
      alert('Security Alert: You are not authorized to modify attendance for this lecture session.');
      return;
    }

    const currentStatus = (session.records && session.records[studentId]) || 'absent';
    let nextStatus = 'present';
    if (currentStatus === 'present' || currentStatus === 'late') nextStatus = 'absent';
    else if (currentStatus === 'absent') nextStatus = 'od';
    else if (currentStatus === 'od') nextStatus = 'present';

    const updatedRecords = { ...(session.records || {}), [studentId]: nextStatus };
    const updatedSession = { ...session, records: updatedRecords };
    
    saveSession(updatedSession, currentUser);
    if (showToast) {
      showToast(`Updated Roll #${studentId}: marked as ${nextStatus === 'od' ? 'EX (Excused)' : nextStatus.toUpperCase()}`);
    }
  };

  // Export to Excel file using SheetJS (.xlsx)
  const handleExportExcel = () => {
    if (!isAuthorized) {
      alert('Unauthorized: You cannot export attendance for an unassigned class.');
      return;
    }

    const headerRow1 = ['A D Patel Institute of Technology'];
    const headerRow2 = [`Academic Year : ${academicYear}`, `Term: ${selectedTerm}`];
    const headerRow3 = [`Course Code : ${activeSubject.code} ${activeSubject.name}`];
    const headerRow4 = [
      `Department : ${selectedDepartment}`, 
      `Class : ${selectedSemester} ${selectedDivision} ${selectedBatch !== 'ALL' ? `(${selectedBatch})` : ''}`,
      `Faculty : ${currentUser?.name || 'Authorized Faculty'}`
    ];
    const headerRow5 = [
      `Institutional Policy : ${activePolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE ? 'Approved Exceptions Count Toward Eligibility' : activePolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION ? 'Exceptions Deducted from Total Conducted' : 'Exceptions Tracked Separately'}`
    ];
    const emptyRow = [];

    // Table Column Headers
    const dateHeaders = subjectSessions.map(s => formatDateHeader(s.date));
    const tableHeader = [
      'Sr No',
      'Enrollment No',
      'Student Name',
      ...dateHeaders,
      'Present',
      'Exceptions (EX)',
      'Out of',
      'Percentage (%)'
    ];

    // Data rows
    const dataRows = filteredStudents.map((st, idx) => {
      let present = 0;
      let exceptionCount = 0;
      const total = subjectSessions.length;

      const dateStatuses = subjectSessions.map(sess => {
        const rawStatus = (sess.records && (sess.records[st.id] || (st.enrollmentNo && sess.records[st.enrollmentNo]))) || '';
        const excCheck = isStudentExcusedForSession(st.id, sess.date, sess.timeSlot, selectedSubjectId, sess.batch);
        const isExplicitPresent = rawStatus === 'present' || rawStatus === 'late';
        const isOD = rawStatus === 'od' || rawStatus === 'exception';
        const isEX = isOD || (!isExplicitPresent && excCheck.isExcused);
        
        if (isExplicitPresent) {
          present++;
          return 'P';
        } else if (isEX) {
          exceptionCount++;
          return 'EX';
        } else if (rawStatus === 'absent') {
          return 'A';
        }
        return '-';
      });

      let effNum = present;
      let effDen = total;
      if (activePolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE) {
        effNum = present + exceptionCount;
      } else if (activePolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION) {
        effDen = Math.max(0, total - exceptionCount);
      }

      const pct = effDen > 0 ? ((effNum / effDen) * 100).toFixed(2) : '0.00';

      return [
        idx + 1,
        st.enrollmentNo,
        st.name || '',
        ...dateStatuses,
        present,
        exceptionCount,
        total,
        Number(pct)
      ];
    });

    // Summary totals row
    const summaryRow = ['Total Present', '', ''];
    subjectSessions.forEach(sess => {
      let count = 0;
      filteredStudents.forEach(st => {
        const s = (sess.records && (sess.records[st.id] || (st.enrollmentNo && sess.records[st.enrollmentNo])));
        const excCheck = isStudentExcusedForSession(st.id, sess.date, sess.timeSlot, selectedSubjectId, sess.batch);
        const isExplicitPresent = s === 'present' || s === 'late';
        const isEX = s === 'od' || s === 'exception' || (!isExplicitPresent && excCheck.isExcused);
        if (isExplicitPresent || isEX) count++;
      });
      summaryRow.push(count);
    });
    summaryRow.push('', '', '', '');

    const sheetData = [
      headerRow1,
      headerRow2,
      headerRow3,
      headerRow4,
      headerRow5,
      emptyRow,
      tableHeader,
      ...dataRows,
      summaryRow
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    ws['!cols'] = [
      { wch: 8 },  // Sr No
      { wch: 18 }, // Enrollment No
      { wch: 22 }, // Student Name
      ...subjectSessions.map(() => ({ wch: 8 })), // Dates
      { wch: 10 }, // Present
      { wch: 16 }, // Exceptions (EX)
      { wch: 10 }, // Out of
      { wch: 14 }  // Percentage
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet");
    const cleanSubj = (activeSubject.shortName || activeSubject.name || 'Subject').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${cleanSubj}_${selectedDivision}_Attendance_${academicYear}.xlsx`;
    XLSX.writeFile(wb, fileName);

    if (showToast) showToast('Official Excel attendance sheet downloaded!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Class analytics summary
  const totalConducted = subjectSessions.length;
  let totalPctSum = 0;
  let eligibleCount = 0;
  let shortageCount = 0;

  filteredStudents.forEach(st => {
    let p = 0;
    let ex = 0;
    subjectSessions.forEach(sess => {
      const s = sess.records && (sess.records[st.id] || (st.enrollmentNo && sess.records[st.enrollmentNo]));
      const excCheck = isStudentExcusedForSession(st.id, sess.date, sess.timeSlot, selectedSubjectId, sess.batch);
      const isExplicitPresent = s === 'present' || s === 'late';
      const isOD = s === 'od' || s === 'exception';
      const isEX = isOD || (!isExplicitPresent && excCheck.isExcused);
      if (isExplicitPresent) {
        p++;
      } else if (isEX) {
        ex++;
      }
    });

    let effNum = p;
    let effDen = totalConducted;
    if (activePolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE) {
      effNum = p + ex;
    } else if (activePolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION) {
      effDen = Math.max(0, totalConducted - ex);
    }
    const pct = effDen > 0 ? (effNum / effDen) * 100 : 0;
    totalPctSum += pct;
    if (pct >= 75) eligibleCount++;
    else shortageCount++;
  });

  const classAverage = filteredStudents.length > 0 ? (totalPctSum / filteredStudents.length).toFixed(2) : '0.00';

  return (
    <div className="erp-attendance-view" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* =====================================================================
          CONTROL & FILTER BAR (Hidden during printing)
          ===================================================================== */}
      <div className="card no-print" style={{ marginBottom: '20px', padding: '16px 20px', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Cascading Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* 1. Department */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                Department
              </label>
              <select
                className="form-control"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{ height: '36px', minWidth: '180px', fontWeight: '600', fontSize: '12.5px' }}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Semester */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                Semester
              </label>
              <select
                className="form-control"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                style={{ height: '36px', minWidth: '95px', fontWeight: '600', fontSize: '12.5px' }}
              >
                {availableSemesters.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 3. Division */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                Division
              </label>
              <select
                className="form-control"
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                style={{ height: '36px', minWidth: '95px', fontWeight: '600', fontSize: '12.5px' }}
              >
                {availableDivisions.map(d => (
                  <option key={d} value={d}>{d === 'ALL' ? 'All Divs' : d}</option>
                ))}
              </select>
            </div>

            {/* 4. Batch */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                Batch
              </label>
              <select
                className="form-control"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{ height: '36px', minWidth: '100px', fontWeight: '600', fontSize: '12.5px' }}
              >
                <option value="ALL">All Batches</option>
                <option value="Batch A">Batch A</option>
                <option value="Batch B">Batch B</option>
                <option value="Batch C">Batch C</option>
                <option value="Batch D">Batch D</option>
                {selectedBatch && !['ALL', 'Batch A', 'Batch B', 'Batch C', 'Batch D'].includes(selectedBatch) && (
                  <option value={selectedBatch}>{selectedBatch}</option>
                )}
              </select>
            </div>

            {/* 5. Subject */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                Course / Subject
              </label>
              <select
                className="form-control"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                style={{ height: '36px', minWidth: '220px', fontWeight: '700', fontSize: '12.5px' }}
              >
                {availableSubjects.map(s => (
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
              <div style={{ display: 'flex', gap: '5px' }}>
                <select
                  className="form-control"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  style={{ height: '36px', width: '75px', fontWeight: '600', fontSize: '12px' }}
                >
                  <option value="Odd">Odd</option>
                  <option value="Even">Even</option>
                </select>
                <select
                  className="form-control"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  style={{ height: '36px', width: '95px', fontWeight: '600', fontSize: '12px' }}
                >
                  {ACADEMIC_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                Attendance Status
              </label>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '36px', minWidth: '140px', fontSize: '12.5px' }}
              >
                <option value="ALL">All ({enrolledStudents.length})</option>
                <option value="SHORTAGE">Shortage &lt; 75% ({shortageCount})</option>
                <option value="ELIGIBLE">Eligible &ge; 75% ({eligibleCount})</option>
              </select>
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                Search Student
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name / Enr..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ height: '36px', paddingLeft: '30px', width: '145px', fontSize: '12.5px' }}
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowClassExceptionsModal(true)}
              style={{ height: '38px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
              title="View approved duty exceptions for this class"
            >
              <Award size={15} style={{ color: '#2563eb' }} />
              <span>Class Exceptions ({classExceptions.length})</span>
            </button>

            {onNavigateToTake && isAuthorized && (
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigateToTake({
                  department: selectedDepartment,
                  semester: selectedSemester,
                  division: selectedDivision === 'ALL' ? 'Div 1' : selectedDivision,
                  batch: selectedBatch,
                  subjectId: selectedSubjectId
                })}
                style={{ height: '38px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                title="Record attendance for this class"
              >
                <PlusCircle size={15} />
                <span>+ Take Attendance</span>
              </button>
            )}

            <button 
              type="button"
              className="btn btn-secondary"
              onClick={handleExportExcel}
              disabled={!isAuthorized}
              style={{ height: '38px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Download formatted Excel (.xlsx) file"
            >
              <FileSpreadsheet size={15} style={{ color: '#059669' }} />
              <span>Export</span>
            </button>

            <button 
              type="button"
              className="btn btn-secondary"
              onClick={handlePrint}
              disabled={!isAuthorized}
              style={{ height: '38px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Print official academic sheet"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
          </div>

        </div>
      </div>

      {/* =====================================================================
          SECURITY ACCESS CONTROL ALERT: WHEN ATTEMPTING UNAUTHORIZED ACCESS
          ===================================================================== */}
      {!isAuthorized ? (
        <div className="card" style={{
          padding: '40px 24px',
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px solid #fecdd3',
          backgroundColor: '#fff1f2',
          margin: '20px 0'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ffe4e6',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={32} />
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#9f1239', margin: '0 0 8px', fontFamily: "'Outfit', sans-serif" }}>
            Access Restricted: Unauthorized Attendance Record
          </h3>

          <p style={{ fontSize: '14px', color: '#881337', maxWidth: '620px', margin: '0 auto 18px', lineHeight: 1.5 }}>
            You do not have authorization to view or manage attendance for <strong>{activeSubject.name || selectedSubjectId}</strong> in <strong>{selectedDepartment} ({selectedSemester} {selectedDivision})</strong>.
            According to institutional access control rules, faculty members can only view attendance for subjects and classes assigned to them in the timetable.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSwitchToAuthorized}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: '700' }}
            >
              <RotateCcw size={15} />
              <span>Switch to My Assigned Class</span>
            </button>
          </div>
        </div>
      ) : (
        /* =====================================================================
            OFFICIAL COLLEGE ATTENDANCE MATRIX SHEET (ERP View)
            ===================================================================== */
        <div className="erp-sheet-card">
          
          {/* Official Header strictly identifying A D Patel Institute of Technology */}
          <div className="erp-sheet-header">
            <h2 className="erp-college-title">A D Patel Institute of Technology</h2>
            <div className="erp-header-row">
              <span>Academic Year : {academicYear}</span>
              <span>Term: {selectedTerm}</span>
            </div>
            <div className="erp-header-row erp-course-title">
              <span>Course Code : {activeSubject.code ? `${activeSubject.code} ` : ''}{activeSubject.name}</span>
            </div>
            <div className="erp-header-row">
              <span>Department : {selectedDepartment}</span>
              <span>
                Class : {selectedSemester} • {selectedDivision} {selectedBatch !== 'ALL' ? `• ${selectedBatch}` : ''}
              </span>
            </div>
          </div>

          {/* Institutional Exception Policy Banner */}
          <div className="no-print" style={{
            margin: '12px 20px 0',
            padding: '10px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12px',
            color: '#475569'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#2563eb" />
              <span>
                <strong>Institutional Attendance Policy:</strong> {activePolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE ? 'Approved Exceptions Count Toward Eligibility (Counted in Attended Numerator)' : activePolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION ? 'Approved Exceptions Deducted from Total Lectures' : 'Tracked Separately (Physical Attendance Preserved)'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                Approved Class Exceptions: <strong>{classExceptions.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowClassExceptionsModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline'
                }}
              >
                View Details
              </button>
            </div>
          </div>

          {/* Informative notification banner when no sessions have been taken yet */}
          {subjectSessions.length === 0 && (
            <div className="no-print" style={{
              margin: '14px 20px 0',
              padding: '14px 18px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: 1.4 }}>
                  <strong>No attendance sessions recorded yet</strong> for <strong>{activeSubject.shortName || activeSubject.name}</strong> ({selectedSemester} • {selectedDivision} {selectedBatch !== 'ALL' ? `• ${selectedBatch}` : ''}).
                  <span style={{ display: 'block', color: '#3b82f6', fontSize: '12px' }}>
                    Student roster ({filteredStudents.length} enrolled) is loaded below. Click below to take your first lecture session!
                  </span>
                </div>
              </div>
              {onNavigateToTake && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => onNavigateToTake({
                    department: selectedDepartment,
                    semester: selectedSemester,
                    division: selectedDivision === 'ALL' ? 'Div 1' : selectedDivision,
                    batch: selectedBatch,
                    subjectId: selectedSubjectId
                  })}
                  style={{ whiteSpace: 'nowrap', fontWeight: '700' }}
                >
                  + Record Attendance
                </button>
              )}
            </div>
          )}

          {/* Matrix Table with Horizontal Scrolling */}
          <div className="erp-table-scroll-container">
            <table className="erp-attendance-table">
              <thead>
                <tr>
                  <th className="erp-th-sticky-sr">Sr No</th>
                  <th className="erp-th-sticky-enroll">Enrollment No</th>
                  <th className="erp-th-sticky-name">Student Name</th>
                  
                  {/* Dynamic Lecture Date Columns from Actual Sessions */}
                  {subjectSessions.map((sess, sessIdx) => {
                    const datePart = formatDateHeader(sess.date);
                    const sameDateSessions = subjectSessions.filter(s => s.date === sess.date);
                    const slotPart = sess.startTime ? `${sess.startTime}` : (sess.timeSlot ? sess.timeSlot.split('-')[0].trim() : `L${sessIdx + 1}`);
                    const fullTime = sess.timeSlot || (sess.startTime ? `${sess.startTime} - ${sess.endTime}` : 'Regular Slot');

                    return (
                      <th 
                        key={sess.id} 
                        className="erp-th-date"
                        title={`Lecture #${sessIdx + 1}\nDate: ${sess.date}\nTime: ${fullTime}\nTopic: ${sess.topic || 'Regular Lecture'}\nFaculty: ${sess.facultyName || 'Faculty'}\nSession ID: ${sess.id}`}
                      >
                        <div style={{ fontWeight: '800' }}>{datePart}</div>
                        {sameDateSessions.length > 1 && (
                          <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '700' }}>{slotPart}</div>
                        )}
                      </th>
                    );
                  })}

                  {/* Summary Columns */}
                  <th className="erp-th-enroll-repeat">Enrollment No</th>
                  <th className="erp-th-stat">Present</th>
                  <th className="erp-th-stat">Exceptions (EX)</th>
                  <th className="erp-th-stat">Out of</th>
                  <th className="erp-th-stat">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={subjectSessions.length + 8} 
                      style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}
                    >
                      <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                        No students found for this academic group.
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                        Selected: {selectedDepartment} • {selectedSemester} • {selectedDivision} {selectedBatch !== 'ALL' ? `(${selectedBatch})` : ''}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    let presentCount = 0;
                    let exceptionCount = 0;
                    const total = subjectSessions.length;

                    return (
                      <tr key={student.id}>
                        {/* Sr No */}
                        <td className="erp-td-sticky-sr">{idx + 1}</td>
                        
                        {/* Enrollment No */}
                        <td 
                          className="erp-td-sticky-enroll" 
                          title={`Roll #${student.rollNo || (idx + 1)}: ${student.name} (${student.batch || 'Batch A'})`}
                        >
                          {student.enrollmentNo}
                        </td>

                        {/* Student Name */}
                        <td 
                          className="erp-td-sticky-name" 
                          title={`Roll #${student.rollNo || (idx + 1)}: ${student.name}`}
                        >
                          {student.name}
                        </td>

                        {/* Dynamic Lecture Date Cells: P / A / EX */}
                        {subjectSessions.map(sess => {
                          const rawStatus = (sess.records && (sess.records[student.id] || (student.enrollmentNo && sess.records[student.enrollmentNo]))) || '';
                          const excCheck = isStudentExcusedForSession(student.id, sess.date, sess.timeSlot, selectedSubjectId, sess.batch);
                          const isExplicitPresent = rawStatus === 'present' || rawStatus === 'late';
                          const isOD = rawStatus === 'od' || rawStatus === 'exception';
                          const isEX = isOD || (!isExplicitPresent && excCheck.isExcused);
                          
                          let cellClass = 'erp-cell-empty';
                          let displayText = '-';
                          let tooltip = `Roll #${student.rollNo}: ${student.name} on ${sess.date} (${sess.timeSlot || 'Slot'})`;

                          if (isExplicitPresent) {
                            presentCount++;
                            cellClass = 'erp-cell-p';
                            displayText = 'P';
                            tooltip += ' (Present)';
                          } else if (isEX) {
                            exceptionCount++;
                            cellClass = 'erp-cell-ex';
                            displayText = 'EX';
                            tooltip += excCheck.exception ? ` (Approved Exception: ${excCheck.exception.category} - ${excCheck.exception.title || excCheck.exception.reason})` : ' (Approved Exception)';
                          } else if (rawStatus === 'absent') {
                            cellClass = 'erp-cell-a';
                            displayText = 'A';
                            tooltip += ' (Absent)';
                          }

                          return (
                            <td 
                              key={sess.id} 
                              className={`erp-attendance-cell ${cellClass}`}
                              onClick={() => handleCellClick(sess, student.id)}
                              title={`${tooltip} — Click to toggle (P ↔ A ↔ EX)`}
                            >
                              {displayText}
                            </td>
                          );
                        })}

                        {/* Right-side Metrics */}
                        <td className="erp-td-enroll-repeat">{student.enrollmentNo}</td>
                        <td className="erp-td-stat" style={{ fontWeight: '700' }}>{presentCount}</td>
                        <td className="erp-td-stat" style={{ fontWeight: '700', color: exceptionCount > 0 ? '#1e40af' : '#64748b' }}>
                          {exceptionCount > 0 ? `${exceptionCount} (EX)` : '0'}
                        </td>
                        <td className="erp-td-stat">{total}</td>
                        <td 
                          className="erp-td-stat" 
                          style={(() => {
                            let effNum = presentCount;
                            let effDen = total;
                            if (activePolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE) {
                              effNum = presentCount + exceptionCount;
                            } else if (activePolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION) {
                              effDen = Math.max(0, total - exceptionCount);
                            }
                            const pct = effDen > 0 ? (effNum / effDen) * 100 : 0;
                            return {
                              fontWeight: '800',
                              color: pct < 75 ? '#b91c1c' : '#15803d'
                            };
                          })()}
                        >
                          {(() => {
                            let effNum = presentCount;
                            let effDen = total;
                            if (activePolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE) {
                              effNum = presentCount + exceptionCount;
                            } else if (activePolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION) {
                              effDen = Math.max(0, total - exceptionCount);
                            }
                            const pct = effDen > 0 ? (effNum / effDen) * 100 : 0;
                            return total > 0 ? pct.toFixed(pct === 100 ? 0 : 2) + '%' : '0.00%';
                          })()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              
              {/* Table Footer Summary Row */}
              {filteredStudents.length > 0 && subjectSessions.length > 0 && (
                <tfoot>
                  <tr className="erp-footer-row">
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: '800', paddingRight: '12px' }}>
                      Total Present:
                    </td>
                    {subjectSessions.map(sess => {
                      let count = 0;
                      filteredStudents.forEach(st => {
                        const s = sess.records && (sess.records[st.id] || (st.enrollmentNo && sess.records[st.enrollmentNo]));
                        const excCheck = isStudentExcusedForSession(st.id, sess.date, sess.timeSlot, selectedSubjectId, sess.batch);
                        const isExplicitPresent = s === 'present' || s === 'late';
                        const isEX = s === 'od' || s === 'exception' || (!isExplicitPresent && excCheck.isExcused);
                        if (isExplicitPresent || isEX) count++;
                      });
                      return (
                        <td key={sess.id} className="erp-td-stat" style={{ fontWeight: '800' }}>
                          {count}
                        </td>
                      );
                    })}
                    <td className="erp-td-enroll-repeat">-</td>
                    <td className="erp-td-stat">-</td>
                    <td className="erp-td-stat">-</td>
                    <td className="erp-td-stat">-</td>
                    <td className="erp-td-stat" style={{ fontWeight: '800', color: Number(classAverage) < 75 ? '#b91c1c' : '#15803d' }}>
                      {classAverage}%
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Legend & Summary Info Bar at bottom */}
          <div className="erp-sheet-footer-info">
            <div className="erp-legend-box">
              <span style={{ fontWeight: '700', color: '#475569', marginRight: '6px' }}>Legend:</span>
              <span className="erp-legend-item">
                <span className="erp-legend-swatch erp-cell-p">P</span> Present
              </span>
              <span className="erp-legend-item">
                <span className="erp-legend-swatch erp-cell-a">A</span> Absent
              </span>
              <span className="erp-legend-item">
                <span className="erp-legend-swatch erp-cell-ex">EX</span> Approved Exception
              </span>
              <span className="erp-legend-item">
                <span className="erp-legend-swatch erp-cell-empty">-</span> Unrecorded
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '12px' }}>
                (Click any cell to toggle P ↔ A ↔ EX)
              </span>
            </div>

            <div className="erp-stats-strip">
              <span>Enrolled Students: <strong>{filteredStudents.length}</strong></span>
              <span>Total Lectures Conducted: <strong>{totalConducted}</strong></span>
              <span>Class Average: <strong>{classAverage}%</strong></span>
              <span>Shortage (&lt;75%): <strong style={{ color: '#b91c1c' }}>{shortageCount}</strong></span>
              <span>Eligible (&ge;75%): <strong style={{ color: '#15803d' }}>{eligibleCount}</strong></span>
            </div>
          </div>

        </div>
      )}

      {/* =====================================================================
          MODAL: VIEW CLASS ATTENDANCE EXCEPTIONS
          ===================================================================== */}
      {showClassExceptionsModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="modal-content" style={{ maxWidth: '720px', width: '92%', borderRadius: '16px', padding: '24px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Award size={20} color="#2563eb" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                    Approved Exceptions for {selectedSemester} {selectedDivision}
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Official duty exemptions authorized for students in this class.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowClassExceptionsModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
              {classExceptions.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                  <Award size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>No Approved Exceptions</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    There are currently no approved exceptions recorded for students in this class.
                  </div>
                </div>
              ) : (
                <table className="data-table" style={{ width: '100%', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th>Student</th>
                      <th>Category</th>
                      <th>Activity / Reason</th>
                      <th>Dates</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classExceptions.map(exc => (
                      <tr key={exc.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{exc.studentName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{exc.enrollmentNo}</div>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {exc.category}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{exc.title || exc.activityName || 'Official Duty'}</div>
                          {exc.reason && <div style={{ fontSize: '11px', color: '#64748b' }}>{exc.reason}</div>}
                        </td>
                        <td style={{ fontSize: '11.5px', color: '#475569' }}>
                          {exc.startDate} {exc.endDate && exc.endDate !== exc.startDate ? `to ${exc.endDate}` : ''}
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            ✓ {exc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowClassExceptionsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
