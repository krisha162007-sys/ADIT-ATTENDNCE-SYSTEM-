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
  History,
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

  // Timetable synchronization tick for real-time live sync from Admin Panel
  const [timetableSyncTick, setTimetableSyncTick] = useState(0);

  // Listen for admin timetable updates & faculty updates
  useEffect(() => {
    const handleSync = () => setTimetableSyncTick(t => t + 1);
    const handleFacultyUpdate = () => setFacultiesList(getFaculties());

    window.addEventListener('adit-timetable-synced', handleSync);
    window.addEventListener('adit-faculty-updated', handleFacultyUpdate);
    return () => {
      window.removeEventListener('adit-timetable-synced', handleSync);
      window.removeEventListener('adit-faculty-updated', handleFacultyUpdate);
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

  // Retrieve enrolled students for this Class
  const classStudents = useMemo(() => {
    if (activeClass && activeClass.id) {
      const enrolled = getStudentsByClassId(activeClass.id);
      if (enrolled && enrolled.length > 0) return enrolled;
    }
    const criteriaEnrolled = getStudentsForClassCriteria(attDept, attSem, attDiv, attYear);
    if (criteriaEnrolled && criteriaEnrolled.length > 0) return criteriaEnrolled;
    return getStudents();
  }, [activeClass, attDept, attSem, attDiv, attYear]);

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
      s.subjectId === attSubjectId &&
      s.classId === activeClass?.id
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
      showToast(`Attendance successfully saved! (${presentCount} Present, ${absentCount} Absent)`);
    }
    setFacultyTab('history');
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
    { id: 'history', label: 'Attendance History', icon: History },
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

              <div style={{ display: 'flex', gap: '10px' }}>
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
                    <History size={18} />
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
                    <History size={22} />
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
