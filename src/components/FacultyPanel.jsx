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
  HelpCircle, 
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
  Info
} from 'lucide-react';
import { 
  getFaculties, 
  getActiveFacultyId, 
  setActiveFacultyId, 
  getActiveFaculty, 
  getFacultyName, 
  setFacultyName,
  getSubjects, 
  getDepartments, 
  getClasses, 
  findClassByCriteria, 
  getOrCreateClass, 
  getStudentsByClassId, 
  getStudentsForClassCriteria, 
  getSessions, 
  saveSession, 
  deleteSession, 
  DEFAULT_ACADEMIC_YEAR, 
  ACADEMIC_YEARS, 
  normalizeSem, 
  normalizeDiv,
  calculateAnalytics
} from '../services/attendanceStorage';
import { 
  getFacultyTimetable, 
  getScheduledLecturesForDate, 
  getEntriesByFaculty, 
  TIME_SLOTS, 
  TIMETABLE_DAYS, 
  getSubjectColor 
} from '../services/timetableStorage';

export default function FacultyPanel({ showToast, onRequestAdminAccess }) {
  // -------------------------------------------------------------
  // 1. FACULTY IDENTITY & CONTEXT
  // -------------------------------------------------------------
  const [facultiesList, setFacultiesList] = useState(getFaculties());
  const [currentFacultyId, setCurrentFacultyId] = useState(getActiveFacultyId());
  
  // Active faculty object
  const currentFaculty = useMemo(() => {
    return facultiesList.find(f => f.id === currentFacultyId) || 
           facultiesList[0] || {
             id: 'FAC_PS',
             name: 'Prof. Priya Shah',
             dept: 'AI & Data Science',
             designation: 'Assistant Professor',
             email: 'priya.shah@adit.ac.in',
             subjects: 'DBMS, Data Structures'
           };
  }, [facultiesList, currentFacultyId]);

  // Handle faculty switch
  const handleFacultyChange = (newId) => {
    setCurrentFacultyId(newId);
    setActiveFacultyId(newId);
    if (showToast) {
      const f = facultiesList.find(fac => fac.id === newId);
      showToast(`Logged in as ${f?.name || 'Faculty Member'}`);
    }
  };

  // Re-sync faculties on events
  useEffect(() => {
    const handleFacultyUpdate = () => {
      setFacultiesList(getFaculties());
    };
    const handleActiveFacultyChange = (e) => {
      if (e?.detail?.facultyId) {
        setCurrentFacultyId(e.detail.facultyId);
      }
    };
    window.addEventListener('adit-faculty-updated', handleFacultyUpdate);
    window.addEventListener('adit-active-faculty-changed', handleActiveFacultyChange);
    return () => {
      window.removeEventListener('adit-faculty-updated', handleFacultyUpdate);
      window.removeEventListener('adit-active-faculty-changed', handleActiveFacultyChange);
    };
  }, []);

  // -------------------------------------------------------------
  // 2. SUB-TABS NAVIGATION IN FACULTY PANEL
  // -------------------------------------------------------------
  // 'take' = Take Attendance
  // 'history' = View & Edit Attendance Sessions
  // 'timetable' = Full Weekly Timetable
  // 'roster' = Class Roster
  const [activeSubTab, setActiveSubTab] = useState('take');

  // -------------------------------------------------------------
  // 3. TIMETABLE INTEGRATION FROM ADMIN PANEL
  // -------------------------------------------------------------
  const [timetableSyncTick, setTimetableSyncTick] = useState(0);

  // Timetable grid from timetableStorage.js
  const facultyTimetableGrid = useMemo(() => {
    return getFacultyTimetable(currentFaculty?.id || 'FAC_PS');
  }, [currentFaculty?.id, timetableSyncTick]);

  // All entries for current faculty
  const facultyEntries = useMemo(() => {
    return getEntriesByFaculty(currentFaculty?.id || 'FAC_PS');
  }, [currentFaculty?.id, timetableSyncTick]);

  useEffect(() => {
    const handleTimetableSync = () => {
      setTimetableSyncTick(prev => prev + 1);
    };
    window.addEventListener('adit-timetable-synced', handleTimetableSync);
    return () => {
      window.removeEventListener('adit-timetable-synced', handleTimetableSync);
    };
  }, []);

  // -------------------------------------------------------------
  // 4. ATTENDANCE ENTRY STATE
  // -------------------------------------------------------------
  const departments = getDepartments();
  const allSubjects = getSubjects();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState(currentFaculty?.dept || departments[0]?.name || 'AI & Data Science');
  const [sem, setSem] = useState('3rd Sem');
  const [division, setDivision] = useState('Div 1');
  const [academicYear, setAcademicYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [subjectId, setSubjectId] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [room, setRoom] = useState('');
  const [topic, setTopic] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // Per-student attendance records & remarks
  // records: { [studentId]: 'present' | 'absent' | 'dont_care' }
  const [records, setRecords] = useState({});
  const [remarks, setRemarks] = useState({});

  // Scheduled lectures for the chosen date for this faculty
  const { dayName, lectures: scheduledLectures } = useMemo(() => {
    return getScheduledLecturesForDate(date, currentFaculty?.id);
  }, [date, currentFaculty?.id, timetableSyncTick]);

  // Sessions state (reloads on storage updates)
  const [sessionsTick, setSessionsTick] = useState(0);
  const allSessions = useMemo(() => getSessions(), [sessionsTick]);

  useEffect(() => {
    const handleSessionsUpdate = () => {
      setSessionsTick(prev => prev + 1);
    };
    window.addEventListener('adit-sessions-updated', handleSessionsUpdate);
    return () => {
      window.removeEventListener('adit-sessions-updated', handleSessionsUpdate);
    };
  }, []);

  // Check which scheduled lectures already have attendance recorded today
  const recordedSessionLookup = useMemo(() => {
    const map = {};
    allSessions.forEach(sess => {
      if (sess.date === date) {
        const key = `${sess.date}_${sess.subjectId}_${normalizeSem(sess.sem)}_${normalizeDiv(sess.division)}`;
        map[key] = sess;
      }
    });
    return map;
  }, [allSessions, date]);

  // Select suitable subject when department or faculty changes
  useEffect(() => {
    if (scheduledLectures && scheduledLectures.length > 0) {
      const first = scheduledLectures[0];
      handleSelectLecture(first);
    } else {
      // Fallback: pick subjects matching department
      const deptSubjs = allSubjects.filter(s => 
        !s.dept || s.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4))
      );
      if (deptSubjs.length > 0) {
        if (!subjectId || !deptSubjs.some(s => s.id === subjectId)) {
          setSubjectId(deptSubjs[0].id);
        }
      }
    }
  }, [date, currentFaculty?.id, selectedDept]);

  // Handler when clicking a scheduled lecture card from Timetable
  const handleSelectLecture = (lec) => {
    if (!lec) return;
    if (lec.time) setTimeSlot(lec.time);
    if (lec.room) setRoom(lec.room);
    if (lec.sem) setSem(normalizeSem(lec.sem));
    if (lec.div) setDivision(normalizeDiv(lec.div));
    if (lec.subjectId) setSubjectId(lec.subjectId);

    if (lec.departmentId) {
      const foundDept = departments.find(d => 
        d.id === lec.departmentId || 
        d.name.toLowerCase().includes(lec.departmentId.toLowerCase())
      );
      if (foundDept) setSelectedDept(foundDept.name);
    }
  };

  // -------------------------------------------------------------
  // 5. CLASS & STUDENT ROSTER FROM ADMIN PANEL
  // -------------------------------------------------------------
  // Resolve active Class entity: Department + Semester + Division + Academic Year
  const activeClass = useMemo(() => {
    return findClassByCriteria(selectedDept, sem, division, academicYear) || 
           getOrCreateClass(selectedDept, sem, division, academicYear);
  }, [selectedDept, sem, division, academicYear]);

  // Load enrolled students directly from Class Management module
  const classStudents = useMemo(() => {
    if (activeClass && activeClass.id) {
      const enrolled = getStudentsByClassId(activeClass.id);
      if (enrolled && enrolled.length > 0) return enrolled;
    }
    // Fallback search by criteria
    const criteriaEnrolled = getStudentsForClassCriteria(selectedDept, sem, division, academicYear);
    if (criteriaEnrolled && criteriaEnrolled.length > 0) return criteriaEnrolled;
    return [];
  }, [activeClass, selectedDept, sem, division, academicYear]);

  // Default records to 'present' when students load
  useEffect(() => {
    setRecords(prev => {
      const nextRecords = { ...prev };
      classStudents.forEach(s => {
        if (!nextRecords[s.id]) {
          nextRecords[s.id] = 'present';
        }
      });
      return nextRecords;
    });
  }, [classStudents]);

  // Status toggle handler: 'present' | 'absent' | 'dont_care'
  const handleStatusChange = (studentId, status) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleRemarkChange = (studentId, text) => {
    setRemarks(prev => ({
      ...prev,
      [studentId]: text
    }));
  };

  // Bulk status marking
  const markAllStatus = (status) => {
    const updated = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  // Count summaries
  const presentCount = classStudents.filter(s => (records[s.id] || 'present') === 'present').length;
  const absentCount = classStudents.filter(s => records[s.id] === 'absent').length;
  const dontCareCount = classStudents.filter(s => records[s.id] === 'dont_care' || records[s.id] === 'od').length;

  const filteredStudents = classStudents.filter(s =>
    (s.name && s.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
    (s.rollNo && String(s.rollNo).includes(studentSearch)) ||
    (s.enrollmentNo && String(s.enrollmentNo).toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // Submit attendance session
  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    if (!subjectId) {
      alert('Please select a subject!');
      return;
    }
    if (!topic.trim()) {
      if (!window.confirm('Topic field is empty. Do you want to submit attendance without entering a topic?')) {
        return;
      }
    }

    const currentSubj = allSubjects.find(s => s.id === subjectId);

    const sessionPayload = {
      date,
      timeSlot,
      room,
      department: selectedDept,
      sem,
      division,
      academicYear,
      classId: activeClass ? activeClass.id : null,
      subjectId,
      subjectName: currentSubj ? currentSubj.name : subjectId,
      facultyId: currentFaculty.id,
      facultyName: currentFaculty.name,
      topic: topic.trim(),
      records,
      remarks,
    };

    saveSession(sessionPayload);
    setSessionsTick(prev => prev + 1);

    if (showToast) {
      showToast(`Attendance successfully saved for ${selectedDept} • ${sem} • ${division}!`);
    }

    // Keep state clean for next entry
    setTopic('');
  };

  // -------------------------------------------------------------
  // 6. EDIT ATTENDANCE SESSIONS STATE & HANDLERS
  // -------------------------------------------------------------
  const [editingSession, setEditingSession] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editRecords, setEditRecords] = useState({});
  const [editRemarks, setEditRemarks] = useState({});
  const [viewingSession, setViewingSession] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  // History filters
  const [historySubjectFilter, setHistorySubjectFilter] = useState('ALL');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Sessions belonging to or taught by this faculty member
  const facultySessions = useMemo(() => {
    return allSessions.filter(sess => {
      const matchFaculty = !sess.facultyId || sess.facultyId === currentFaculty.id || 
        (sess.facultyName && sess.facultyName.toLowerCase() === currentFaculty.name.toLowerCase());
      return matchFaculty;
    });
  }, [allSessions, currentFaculty]);

  const filteredHistorySessions = useMemo(() => {
    return facultySessions.filter(sess => {
      const matchSubj = historySubjectFilter === 'ALL' || sess.subjectId === historySubjectFilter;
      const q = historySearchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        (sess.date && sess.date.includes(q)) ||
        (sess.topic && sess.topic.toLowerCase().includes(q)) ||
        (sess.department && sess.department.toLowerCase().includes(q)) ||
        (sess.sem && sess.sem.toLowerCase().includes(q)) ||
        (sess.division && sess.division.toLowerCase().includes(q));
      return matchSubj && matchQuery;
    });
  }, [facultySessions, historySubjectFilter, historySearchQuery]);

  const handleStartEditSession = (sess) => {
    setEditingSession(sess);
    setEditDate(sess.date);
    setEditTimeSlot(sess.timeSlot || '');
    setEditTopic(sess.topic || '');
    setEditRecords({ ...(sess.records || {}) });
    setEditRemarks({ ...(sess.remarks || {}) });
  };

  const handleSaveEditSession = () => {
    if (!editingSession) return;
    const updated = {
      ...editingSession,
      date: editDate,
      timeSlot: editTimeSlot,
      topic: editTopic.trim(),
      records: editRecords,
      remarks: editRemarks
    };
    saveSession(updated);
    setSessionsTick(prev => prev + 1);
    setEditingSession(null);
    if (showToast) {
      showToast('Attendance session successfully updated!');
    }
  };

  const handleConfirmDelete = () => {
    if (deletingSessionId) {
      deleteSession(deletingSessionId);
      setSessionsTick(prev => prev + 1);
      setDeletingSessionId(null);
      if (showToast) showToast('Attendance session deleted successfully!');
    }
  };

  const getSubjectObj = (id) => allSubjects.find(s => s.id === id) || { code: id, name: id };

  return (
    <div className="faculty-portal-root" style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '40px' }}>
      
      {/* =========================================================
          FACULTY PORTAL TOP HEADER & PROFILE BAR
          ========================================================= */}
      <header 
        className="no-print"
        style={{
          backgroundColor: '#0f172a',
          color: 'white',
          borderBottom: '1px solid #1e293b',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Brand & Portal Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.35)'
            }}>
              <GraduationCap size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  ADIT Faculty Attendance Portal
                </h1>
                <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#1e293b', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', border: '1px solid #334155' }}>
                  FACULTY PANEL
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Academic Session 2026-27 • A D Patel Institute of Technology
              </p>
            </div>
          </div>

          {/* Right Header Controls: Faculty Selector & Admin Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            
            {/* Faculty Profile Switcher Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1e293b', padding: '6px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
              <User size={16} style={{ color: '#38bdf8' }} />
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.04em' }}>
                  Logged-in Faculty Profile
                </div>
                <select
                  value={currentFacultyId}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: 0
                  }}
                >
                  {facultiesList.map(f => (
                    <option key={f.id} value={f.id} style={{ backgroundColor: '#0f172a', color: 'white' }}>
                      {f.name} ({f.dept || 'Engineering'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Switch to Admin Panel Link */}
            {onRequestAdminAccess && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={onRequestAdminAccess}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px'
                }}
                title="Switch to Academic Admin Panel"
              >
                <ShieldCheck size={15} style={{ color: '#38bdf8' }} />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>

        {/* Faculty Profile Info Strip */}
        <div style={{ backgroundColor: '#1e293b', borderTop: '1px solid #334155', padding: '8px 24px' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ color: '#e2e8f0', fontWeight: '700' }}>
                {currentFaculty.name}
              </span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{ color: '#cbd5e1' }}>
                {currentFaculty.designation || 'Faculty'}
              </span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>
                {currentFaculty.dept || 'AI & Data Science'}
              </span>
              {currentFaculty.email && (
                <>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span style={{ color: '#94a3b8' }}>{currentFaculty.email}</span>
                </>
              )}
            </div>

            {/* Quick Stat Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#94a3b8' }}>
                Today: <strong style={{ color: '#ffffff' }}>{dayName || 'Schedule'}</strong>
              </span>
              <span style={{ backgroundColor: scheduledLectures.length > 0 ? '#065f46' : '#334155', color: '#a7f3d0', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                {scheduledLectures.length} Lecture(s) Scheduled
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '2px', overflowX: 'auto' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('take')}
            style={{
              padding: '12px 18px',
              backgroundColor: activeSubTab === 'take' ? '#f8fafc' : 'transparent',
              color: activeSubTab === 'take' ? '#0f172a' : '#94a3b8',
              fontWeight: '700',
              fontSize: '13.5px',
              border: 'none',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={16} style={{ color: activeSubTab === 'take' ? '#2563eb' : 'currentColor' }} />
            <span>Take Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            style={{
              padding: '12px 18px',
              backgroundColor: activeSubTab === 'history' ? '#f8fafc' : 'transparent',
              color: activeSubTab === 'history' ? '#0f172a' : '#94a3b8',
              fontWeight: '700',
              fontSize: '13.5px',
              border: 'none',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <List size={16} style={{ color: activeSubTab === 'history' ? '#2563eb' : 'currentColor' }} />
            <span>View &amp; Edit Attendance</span>
            {facultySessions.length > 0 && (
              <span style={{ fontSize: '11px', backgroundColor: activeSubTab === 'history' ? '#e2e8f0' : '#334155', color: activeSubTab === 'history' ? '#0f172a' : '#f1f5f9', padding: '1px 6px', borderRadius: '10px' }}>
                {facultySessions.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('timetable')}
            style={{
              padding: '12px 18px',
              backgroundColor: activeSubTab === 'timetable' ? '#f8fafc' : 'transparent',
              color: activeSubTab === 'timetable' ? '#0f172a' : '#94a3b8',
              fontWeight: '700',
              fontSize: '13.5px',
              border: 'none',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Calendar size={16} style={{ color: activeSubTab === 'timetable' ? '#2563eb' : 'currentColor' }} />
            <span>My Timetable (Admin Sync)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('roster')}
            style={{
              padding: '12px 18px',
              backgroundColor: activeSubTab === 'roster' ? '#f8fafc' : 'transparent',
              color: activeSubTab === 'roster' ? '#0f172a' : '#94a3b8',
              fontWeight: '700',
              fontSize: '13.5px',
              border: 'none',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={16} style={{ color: activeSubTab === 'roster' ? '#2563eb' : 'currentColor' }} />
            <span>Class Roster &amp; Students</span>
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN WORKSPACE BODY
          ========================================================= */}
      <main style={{ maxWidth: '1440px', margin: '24px auto', padding: '0 24px' }}>
        
        {/* =======================================================
            TAB 1: TAKE ATTENDANCE (TIMETABLE + STUDENTS + P / A / DC)
            ======================================================= */}
        {activeSubTab === 'take' && (
          <div>
            
            {/* Top Timetable Auto-Schedule Strip */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '18px 22px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={20} style={{ color: '#2563eb' }} />
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Timetable Schedule for {currentFaculty.name} ({dayName || 'Today'})
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Pulled directly from Admin Panel timetable records. Click any lecture card to immediately auto-load class details &amp; students roster.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>Date:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ width: '150px', height: '34px', fontSize: '12.5px', fontWeight: '700' }}
                  />
                </div>
              </div>

              {/* Scheduled Lectures Grid */}
              {scheduledLectures.length === 0 ? (
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No lectures scheduled for {currentFaculty.name} on {dayName || 'this date'}.
                  <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    You can still manually select a class &amp; subject below to record extra lectures or lab sessions.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                  {scheduledLectures.map((lec, idx) => {
                    const isSelected = subjectId === lec.subjectId && timeSlot === lec.time;
                    const sessionKey = `${date}_${lec.subjectId}_${normalizeSem(lec.sem)}_${normalizeDiv(lec.div)}`;
                    const existingRecord = recordedSessionLookup[sessionKey];

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectLecture(lec)}
                        style={{
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 10px rgba(37, 99, 235, 0.15)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {lec.time}
                          </span>
                          {existingRecord ? (
                            <span className="badge badge-present" style={{ fontSize: '10px', padding: '2px 6px' }}>
                              ✓ Recorded
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#d97706', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                              ⏱ Pending
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                          {lec.subjectName}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '11.5px', color: '#64748b' }}>
                          <span>{lec.sem} • {lec.div}</span>
                          <span style={{ fontWeight: '700', color: '#0284c7' }}>{lec.room || 'Room TBD'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Attendance Session Details Form */}
            <form onSubmit={handleSubmitAttendance}>
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '22px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <Calendar size={18} style={{ color: '#2563eb' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Class &amp; Session Configuration
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  
                  {/* Department */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={13} style={{ color: '#2563eb' }} /> Department
                    </label>
                    <select
                      className="form-control"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      style={{ fontWeight: '700' }}
                    >
                      {departments.map(d => (
                        <option key={d.id || d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <GraduationCap size={13} style={{ color: '#2563eb' }} /> Semester
                    </label>
                    <select
                      className="form-control"
                      value={sem}
                      onChange={(e) => setSem(e.target.value)}
                      style={{ fontWeight: '700' }}
                    >
                      <option value="1st Sem">1st Semester</option>
                      <option value="2nd Sem">2nd Semester</option>
                      <option value="3rd Sem">3rd Semester</option>
                      <option value="4th Sem">4th Semester</option>
                      <option value="5th Sem">5th Semester</option>
                      <option value="6th Sem">6th Semester</option>
                      <option value="7th Sem">7th Semester</option>
                      <option value="8th Sem">8th Semester</option>
                    </select>
                  </div>

                  {/* Division */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={13} style={{ color: '#2563eb' }} /> Division
                    </label>
                    <select
                      className="form-control"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      style={{ fontWeight: '700' }}
                    >
                      <option value="Div 1">Division 1 (Div 1)</option>
                      <option value="Div 2">Division 2 (Div 2)</option>
                      <option value="Div 3">Division 3 (Div 3)</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={13} style={{ color: '#2563eb' }} /> Course / Subject *
                    </label>
                    <select
                      className="form-control"
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      required
                      style={{ fontWeight: '700' }}
                    >
                      {allSubjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name} ({s.faculty || 'Faculty'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time slot */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} style={{ color: '#2563eb' }} /> Lecture Time Slot
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 9:00 - 9:55"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      style={{ fontWeight: '700' }}
                    />
                  </div>

                  {/* Room */}
                  <div className="form-group">
                    <label>Room / Lab No</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Room 201"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                    />
                  </div>
                </div>

                {/* Topic Covered Field */}
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label style={{ fontWeight: '700' }}>
                    Lecture Topic Covered *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Relational Calculus, B-Trees & Indexing, Process Scheduling Algorithms..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Enrolled Students Roster & 3-Way Attendance Actions */}
              <div 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '22px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Header Strip with Live Counters & Bulk Toggles */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Enrolled Students ({classStudents.length})
                      </h3>
                      <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '700' }}>
                        {selectedDept} • {sem} • {division}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
                      Mark Present, Absent, or Don't Care for each student below.
                    </p>
                  </div>

                  {/* Search and Bulk Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div className="input-with-icon" style={{ width: '180px' }}>
                      <Search className="input-icon" size={14} />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search roll, name..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        style={{ height: '34px', fontSize: '12.5px' }}
                      />
                    </div>

                    {/* Bulk Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => markAllStatus('present')}
                        title="Mark all as Present"
                        style={{ fontWeight: '700' }}
                      >
                        <CheckSquare size={13} style={{ color: '#059669' }} />
                        <span>All Present</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => markAllStatus('absent')}
                        title="Mark all as Absent"
                        style={{ fontWeight: '700' }}
                      >
                        <XSquare size={13} style={{ color: '#e11d48' }} />
                        <span>All Absent</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => markAllStatus('dont_care')}
                        title="Mark all as Don't Care (Neutral Exemption)"
                        style={{ fontWeight: '700' }}
                      >
                        <HelpCircle size={13} style={{ color: '#475569' }} />
                        <span>All Don't Care</span>
                      </button>
                    </div>

                    {/* Live Metric Badges */}
                    <div style={{ display: 'flex', gap: '6px', fontSize: '12px', fontWeight: '800' }}>
                      <span className="badge badge-present">P: {presentCount}</span>
                      <span className="badge badge-absent">A: {absentCount}</span>
                      <span className="badge badge-dontcare">DC: {dontCareCount}</span>
                    </div>
                  </div>
                </div>

                {/* Table of Enrolled Students */}
                <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Roll No</th>
                        <th>Student Name</th>
                        <th>Enrollment No</th>
                        <th style={{ textAlign: 'center', width: '270px' }}>Attendance Status</th>
                        <th>Remarks / Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                            <AlertCircle size={24} style={{ color: '#94a3b8', margin: '0 auto 8px auto', display: 'block' }} />
                            No enrolled students found for <strong>{selectedDept} • {sem} • {division} ({academicYear})</strong>.
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                              Tip: Add or upload student rosters to this class in the <strong>Admin Panel &rarr; Classes</strong> module.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((st) => {
                          const currentStatus = records[st.id] || 'present';
                          return (
                            <tr key={st.id}>
                              <td style={{ fontWeight: '800', color: '#0f172a' }}>{st.rollNo}</td>
                              <td>
                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{st.name}</div>
                                {st.email && <span style={{ fontSize: '11px', color: '#64748b' }}>{st.email}</span>}
                              </td>
                              <td style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                                {st.enrollmentNo}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div className="attendance-toggle-group">
                                  <button
                                    type="button"
                                    className={`toggle-option ${currentStatus === 'present' ? 'active-present' : ''}`}
                                    onClick={() => handleStatusChange(st.id, 'present')}
                                  >
                                    Present
                                  </button>
                                  <button
                                    type="button"
                                    className={`toggle-option ${currentStatus === 'absent' ? 'active-absent' : ''}`}
                                    onClick={() => handleStatusChange(st.id, 'absent')}
                                  >
                                    Absent
                                  </button>
                                  <button
                                    type="button"
                                    className={`toggle-option ${currentStatus === 'dont_care' || currentStatus === 'od' ? 'active-dontcare' : ''}`}
                                    onClick={() => handleStatusChange(st.id, 'dont_care')}
                                    title="Don't Care / Neutral Exemption"
                                  >
                                    Don't Care
                                  </button>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Optional remark..."
                                  value={remarks[st.id] || ''}
                                  onChange={(e) => handleRemarkChange(st.id, e.target.value)}
                                  style={{ height: '32px', fontSize: '12px' }}
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Submit Action */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={classStudents.length === 0}
                    style={{ padding: '12px 32px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Save size={18} />
                    <span>Save Attendance Session</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* =======================================================
            TAB 2: VIEW & EDIT ATTENDANCE HISTORY
            ======================================================= */}
        {activeSubTab === 'history' && (
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Header & Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={22} style={{ color: '#2563eb' }} />
                  Recorded Attendance Sessions
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                  Sessions recorded by <strong>{currentFaculty.name}</strong>. Reopen any session to modify topic or student statuses (Present / Absent / Don't Care).
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div className="input-with-icon" style={{ width: '220px' }}>
                  <Search className="input-icon" size={14} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search topic or date..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    style={{ height: '36px', fontSize: '13px' }}
                  />
                </div>

                <select
                  className="form-control"
                  value={historySubjectFilter}
                  onChange={(e) => setHistorySubjectFilter(e.target.value)}
                  style={{ width: '200px', height: '36px', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="ALL">All Subjects</option>
                  {allSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Sessions Table */}
            <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Topic Covered</th>
                    <th>Breakdown (P / A / DC)</th>
                    <th>Session %</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistorySessions.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No attendance records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredHistorySessions.map((sess) => {
                      const subj = getSubjectObj(sess.subjectId);
                      const recs = Object.values(sess.records || {});
                      const total = recs.length;
                      const pCount = recs.filter(s => s === 'present').length;
                      const aCount = recs.filter(s => s === 'absent').length;
                      const dcCount = recs.filter(s => s === 'dont_care' || s === 'od').length;
                      const lateCount = recs.filter(s => s === 'late').length;
                      
                      const effectivePresent = pCount + (lateCount * 0.8);
                      const gradedTotal = total - dcCount;
                      const pct = gradedTotal > 0 ? ((effectivePresent / gradedTotal) * 100).toFixed(1) : (total > 0 ? '100.0' : 0);

                      return (
                        <tr key={sess.id}>
                          <td style={{ fontWeight: '800', whiteSpace: 'nowrap' }}>{sess.date}</td>
                          <td style={{ fontSize: '12px', color: '#64748b' }}>{sess.timeSlot || '-'}</td>
                          <td>
                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: '700' }}>
                              {sess.sem || '3rd Sem'} • {sess.division || 'Div 1'}
                            </span>
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '700' }}>
                              {subj.code}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', maxWidth: '240px' }}>
                            {sess.topic || <em style={{ color: '#94a3b8' }}>No topic specified</em>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px', fontSize: '11px', fontWeight: '700' }}>
                              <span style={{ color: '#059669' }}>{pCount} P</span>
                              <span style={{ color: '#cbd5e1' }}>/</span>
                              <span style={{ color: '#e11d48' }}>{aCount} A</span>
                              {dcCount > 0 && (
                                <>
                                  <span style={{ color: '#cbd5e1' }}>/</span>
                                  <span style={{ color: '#475569' }}>{dcCount} DC</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${parseFloat(pct) >= 75 ? 'badge-present' : 'badge-absent'}`}>
                              {pct}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setViewingSession(sess)}
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleStartEditSession(sess)}
                                title="Edit Session & Attendance"
                                style={{ color: '#2563eb', borderColor: '#bfdbfe' }}
                              >
                                <Edit3 size={14} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => setDeletingSessionId(sess.id)}
                                title="Delete Record"
                              >
                                <Trash2 size={14} />
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
          </div>
        )}

        {/* =======================================================
            TAB 3: MY TIMETABLE (WEEKLY SCHEDULE)
            ======================================================= */}
        {activeSubTab === 'timetable' && (
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={22} style={{ color: '#2563eb' }} />
                  Weekly Timetable for {currentFaculty.name}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                  Centralized academic timetable synchronized live from Admin Panel. Click any lecture slot to take attendance for it.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800' }}>
                  Total Allocations: {facultyEntries.length} Slots
                </span>
              </div>
            </div>

            {/* Timetable Matrix Grid */}
            <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table className="data-table" style={{ fontSize: '12.5px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Day \ Time</th>
                    {TIME_SLOTS.map((slot, sIdx) => (
                      <th key={sIdx} style={{ textAlign: 'center', minWidth: '130px' }}>
                        {slot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIMETABLE_DAYS.map((dayName) => (
                    <tr key={dayName}>
                      <td style={{ fontWeight: '800', color: '#0f172a', backgroundColor: '#f8fafc' }}>
                        {dayName}
                      </td>
                      {TIME_SLOTS.map((time, tIdx) => {
                        const slotData = facultyTimetableGrid[dayName]?.[time];
                        const isLunch = time.includes('12:40');

                        if (isLunch) {
                          return (
                            <td key={tIdx} style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', textAlign: 'center', fontSize: '11px', fontWeight: '700' }}>
                              LUNCH
                            </td>
                          );
                        }

                        if (!slotData || (!slotData.subject && !slotData.subjectName)) {
                          return (
                            <td key={tIdx} style={{ textAlign: 'center', color: '#cbd5e1' }}>
                              -
                            </td>
                          );
                        }

                        const subjLabel = slotData.subject || slotData.subjectName;
                        const semLabel = slotData.sem || slotData.semId || '3rd Sem';
                        const divLabel = slotData.div || slotData.divId || 'Div 1';

                        return (
                          <td 
                            key={tIdx} 
                            style={{ padding: '6px' }}
                            onClick={() => {
                              // Click to mark attendance for this slot
                              handleSelectLecture({
                                time,
                                room: slotData.room,
                                sem: semLabel,
                                div: divLabel,
                                subjectId: slotData.subjectId || subjLabel,
                                departmentId: slotData.departmentId
                              });
                              setActiveSubTab('take');
                              if (showToast) showToast(`Loaded ${subjLabel} (${semLabel} ${divLabel}) into Take Attendance!`);
                            }}
                          >
                            <div 
                              style={{
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #86efac',
                                borderRadius: '6px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title="Click to take attendance for this slot"
                            >
                              <div style={{ fontWeight: '800', color: '#166534', fontSize: '12px' }}>
                                {subjLabel}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#15803d', marginTop: '2px' }}>
                                {semLabel} • {divLabel}
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                {slotData.room || 'TBD'}
                              </div>
                            </div>
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

        {/* =======================================================
            TAB 4: CLASS ROSTER & STUDENTS
            ======================================================= */}
        {activeSubTab === 'roster' && (
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={22} style={{ color: '#2563eb' }} />
                  Class Roster: {selectedDept} • {sem} • {division}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                  Enrolled students loaded live from the Admin Panel Class module.
                </p>
              </div>

              {/* Class Selectors */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="form-control"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  style={{ width: '180px', height: '36px', fontSize: '13px', fontWeight: '700' }}
                >
                  {departments.map(d => (
                    <option key={d.id || d.code} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <select
                  className="form-control"
                  value={sem}
                  onChange={(e) => setSem(e.target.value)}
                  style={{ width: '140px', height: '36px', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="1st Sem">1st Semester</option>
                  <option value="2nd Sem">2nd Semester</option>
                  <option value="3rd Sem">3rd Semester</option>
                  <option value="4th Sem">4th Semester</option>
                  <option value="5th Sem">5th Semester</option>
                  <option value="6th Sem">6th Semester</option>
                  <option value="7th Sem">7th Semester</option>
                  <option value="8th Sem">8th Semester</option>
                </select>

                <select
                  className="form-control"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  style={{ width: '110px', height: '36px', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="Div 1">Div 1</option>
                  <option value="Div 2">Div 2</option>
                  <option value="Div 3">Div 3</option>
                </select>
              </div>
            </div>

            {/* Students Roster Display */}
            <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Roll No</th>
                    <th>Student Name</th>
                    <th>Enrollment No</th>
                    <th>Email Address</th>
                    <th>Assigned Class ID</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No students enrolled in this class. Add students in Admin Panel &rarr; Classes.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((st) => (
                      <tr key={st.id}>
                        <td style={{ fontWeight: '800', color: '#0f172a' }}>{st.rollNo}</td>
                        <td style={{ fontWeight: '700', color: '#1e293b' }}>{st.name}</td>
                        <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{st.enrollmentNo}</td>
                        <td style={{ color: '#64748b' }}>{st.email || '-'}</td>
                        <td style={{ fontSize: '11px', color: '#94a3b8' }}>{st.classId || activeClass?.id || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL 1: EDIT ATTENDANCE SESSION MODAL
          ========================================================= */}
      {editingSession && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-card" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Edit3 size={20} style={{ color: '#2563eb' }} />
                Edit Attendance Record
              </h3>
              <button 
                type="button"
                className="btn btn-secondary btn-sm" 
                onClick={() => setEditingSession(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {/* Session Meta Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '14px', marginBottom: '18px' }}>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTimeSlot}
                    onChange={(e) => setEditTimeSlot(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Lecture Topic Covered *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Student Attendance Grid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '14px', margin: 0, color: '#0f172a', fontWeight: '800' }}>
                  Student Attendance Status &amp; Remarks
                </h4>

                {/* Bulk Actions inside Modal */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => {
                      const updated = { ...editRecords };
                      const sList = (editingSession.classId ? getStudentsByClassId(editingSession.classId) : []) || [];
                      const targetList = sList.length > 0 ? sList : classStudents;
                      targetList.forEach(s => { updated[s.id] = 'present'; });
                      setEditRecords(updated);
                    }}
                  >
                    All Present
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => {
                      const updated = { ...editRecords };
                      const sList = (editingSession.classId ? getStudentsByClassId(editingSession.classId) : []) || [];
                      const targetList = sList.length > 0 ? sList : classStudents;
                      targetList.forEach(s => { updated[s.id] = 'absent'; });
                      setEditRecords(updated);
                    }}
                  >
                    All Absent
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => {
                      const updated = { ...editRecords };
                      const sList = (editingSession.classId ? getStudentsByClassId(editingSession.classId) : []) || [];
                      const targetList = sList.length > 0 ? sList : classStudents;
                      targetList.forEach(s => { updated[s.id] = 'dont_care'; });
                      setEditRecords(updated);
                    }}
                  >
                    All Don't Care
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '360px', overflowY: 'auto' }} className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px' }}>Roll</th>
                      <th>Student Name</th>
                      <th style={{ textAlign: 'center', width: '260px' }}>Status</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sList = (editingSession.classId ? getStudentsByClassId(editingSession.classId) : []) || [];
                      const targetList = sList.length > 0 ? sList : classStudents;
                      if (targetList.length === 0) {
                        return (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                              No enrolled students found for this class.
                            </td>
                          </tr>
                        );
                      }
                      return targetList.map(s => {
                        const cur = editRecords[s.id] || 'present';
                        return (
                          <tr key={s.id}>
                            <td style={{ fontWeight: '800' }}>{s.rollNo}</td>
                            <td>
                              <div style={{ fontWeight: '700' }}>{s.name}</div>
                              {s.enrollmentNo && <span style={{ fontSize: '11px', color: '#64748b' }}>{s.enrollmentNo}</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div className="attendance-toggle-group">
                                <button
                                  type="button"
                                  className={`toggle-option ${cur === 'present' ? 'active-present' : ''}`}
                                  onClick={() => setEditRecords({ ...editRecords, [s.id]: 'present' })}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  className={`toggle-option ${cur === 'absent' ? 'active-absent' : ''}`}
                                  onClick={() => setEditRecords({ ...editRecords, [s.id]: 'absent' })}
                                >
                                  Absent
                                </button>
                                <button
                                  type="button"
                                  className={`toggle-option ${cur === 'dont_care' || cur === 'od' ? 'active-dontcare' : ''}`}
                                  onClick={() => setEditRecords({ ...editRecords, [s.id]: 'dont_care' })}
                                  title="Don't Care / Neutral Exemption"
                                >
                                  Don't Care
                                </button>
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={editRemarks[s.id] || ''}
                                onChange={(e) => setEditRemarks({ ...editRemarks, [s.id]: e.target.value })}
                                style={{ height: '32px', fontSize: '12px' }}
                              />
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setEditingSession(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={handleSaveEditSession}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: VIEW SESSION DETAILS MODAL
          ========================================================= */}
      {viewingSession && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-card" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Session Details: {viewingSession.date}</h3>
              <button 
                type="button"
                className="btn btn-secondary btn-sm" 
                onClick={() => setViewingSession(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '16px', padding: '14px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '13px' }}>
                  <strong>Subject:</strong> {getSubjectObj(viewingSession.subjectId).name} ({getSubjectObj(viewingSession.subjectId).code})
                </p>
                <p style={{ margin: '0 0 6px 0', fontSize: '13px' }}>
                  <strong>Topic Covered:</strong> {viewingSession.topic || 'N/A'}
                </p>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  <strong>Faculty:</strong> {viewingSession.facultyName || currentFaculty.name}
                </p>
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sList = (viewingSession.classId ? getStudentsByClassId(viewingSession.classId) : []) || [];
                      const targetList = sList.length > 0 ? sList : classStudents;
                      return targetList.map(s => {
                        const st = viewingSession.records ? viewingSession.records[s.id] : 'absent';
                        const rem = viewingSession.remarks ? viewingSession.remarks[s.id] : '';
                        const isDC = st === 'dont_care' || st === 'od';

                        return (
                          <tr key={s.id}>
                            <td style={{ fontWeight: '800' }}>{s.rollNo}</td>
                            <td>{s.name}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${isDC ? 'badge-dontcare' : `badge-${st}`}`}>
                                {isDC ? "Don't Care" : st}
                              </span>
                            </td>
                            <td style={{ fontSize: '12px', color: '#64748b' }}>{rem || '-'}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setViewingSession(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: DELETE CONFIRMATION MODAL
          ========================================================= */}
      {deletingSessionId && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-card" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <AlertCircle size={20} /> Delete Attendance Session
              </h3>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13.5px', color: '#475569' }}>
                Are you sure you want to delete this recorded attendance session? This operation cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setDeletingSessionId(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-danger" 
                onClick={handleConfirmDelete}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={16} /> Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
