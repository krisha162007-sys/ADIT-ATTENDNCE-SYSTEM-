import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UploadCloud, 
  BookOpen, 
  Building2, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  FileSpreadsheet, 
  Search, 
  ChevronRight, 
  Download, 
  KeyRound, 
  Clock, 
  Layers,
  ArrowRight,
  UserPlus,
  BookPlus,
  ArrowLeft,
  Award,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  SEMESTERS, 
  getDepartments, 
  saveDepartment, 
  deleteDepartment, 
  getSubjects, 
  saveSubject, 
  deleteSubject, 
  getFaculties, 
  saveFaculty, 
  deleteFaculty, 
  getAllocations, 
  saveSubjectAllocation, 
  getStudents, 
  saveStudent, 
  deleteStudent, 
  assignStudentDivision, 
  bulkImportStudents, 
  verifyAdminPin, 
  updateAdminPin, 
  resetToDefault,
  getCollegeName,
  setCollegeName,
  getClasses,
  getExceptions,
  updateExceptionStatus,
  deleteException,
  getInstitutionalExceptionPolicy,
  setInstitutionalExceptionPolicy,
  INSTITUTIONAL_POLICIES,
  EXCEPTION_CATEGORIES
} from '../services/attendanceStorage';
import { 
  getAllFacultyTimetables, 
  resetFacultyTimetablesToDefault,
  TIME_SLOTS,
  TIMETABLE_DAYS,
  updateFacultyNameInEntries,
  updateSubjectInEntries,
  notifyTimetableSync,
  getTimetableEntries
} from '../services/timetableStorage';
import FacultyTimetablePanel from './FacultyTimetablePanel';
import ClassTimetablePanel from './ClassTimetablePanel';
import ClassManagementPanel from './ClassManagementPanel';
import TimetableUploadModal from './TimetableUploadModal';
import DepartmentAdminPanel from './DepartmentAdminPanel';

export default function AdminPanel({ showToast, onExit }) {
  // Navigation inside Admin Panel
  // Options: 'faculty' (default, matches screenshot), 'class-timetables', 'dashboard', 'timetables', 'upload', 'subjects', 'departments', 'settings'
  const [adminTab, setAdminTab] = useState('faculty');

  // Master data states
  const [departments, setDepartments] = useState(getDepartments());
  const [subjects, setSubjects] = useState(getSubjects());
  const [faculties, setFaculties] = useState(getFaculties());
  const [students, setStudents] = useState(getStudents());
  const [allocations, setAllocations] = useState(getAllocations());

  // Department and Semester selections for administration views
  const [activeDept, setActiveDept] = useState('AI & Data Science');
  const [activeSem, setActiveSem] = useState('3rd Semester');

  // Modals & form states
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ id: '', code: '', name: '' });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: '', code: '', name: '', shortName: '', credits: 4, sem: '3rd Semester', dept: 'AI & Data Science' });

  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ id: '', name: '', dept: 'AI & Data Science', designation: 'Assistant Professor', email: '', phone: '', subjects: '' });

  // PIN change state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // Exceptions management state
  const [adminExceptions, setAdminExceptions] = useState(getExceptions());
  const [adminExcPolicy, setAdminExcPolicy] = useState(getInstitutionalExceptionPolicy());
  const [adminExcFilterStatus, setAdminExcFilterStatus] = useState('All');
  const [adminExcFilterCat, setAdminExcFilterCat] = useState('All');
  const [adminExcSearch, setAdminExcSearch] = useState('');
  const [adminExcDept, setAdminExcDept] = useState('All');
  const [reviewRemarksModal, setReviewRemarksModal] = useState(null);
  const [viewLecturesModal, setViewLecturesModal] = useState(null);

  // Sidebar Menu Items
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faculty', label: 'Faculty Timetables', icon: Users },
    { id: 'class-timetables', label: 'Class Timetables', icon: Layers },
    { id: 'classes', label: 'Classes', icon: GraduationCap },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'exceptions', label: 'Attendance Exceptions', icon: Award },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Refresh all state from localStorage
  const refreshState = () => {
    setDepartments(getDepartments());
    setSubjects(getSubjects());
    setFaculties(getFaculties());
    setStudents(getStudents());
    setAllocations(getAllocations());
    setAdminExceptions(getExceptions());
    setAdminExcPolicy(getInstitutionalExceptionPolicy());
  };

  // Listen for faculty, timetable, and exceptions updates
  React.useEffect(() => {
    const handleFacultyUpdated = () => {
      setFaculties([...getFaculties()]);
    };
    const handleTimetableSynced = () => {
      setAllocations(getAllocations());
    };
    const handleExceptionsUpdated = () => {
      setAdminExceptions(getExceptions());
      setAdminExcPolicy(getInstitutionalExceptionPolicy());
    };
    window.addEventListener('adit-faculty-updated', handleFacultyUpdated);
    window.addEventListener('adit-timetable-synced', handleTimetableSynced);
    window.addEventListener('adit-exceptions-updated', handleExceptionsUpdated);
    return () => {
      window.removeEventListener('adit-faculty-updated', handleFacultyUpdated);
      window.removeEventListener('adit-timetable-synced', handleTimetableSynced);
      window.removeEventListener('adit-exceptions-updated', handleExceptionsUpdated);
    };
  }, []);

  // Exception Review Handlers
  const handleReviewException = (exc, newStatus, defaultRemarks = '') => {
    setReviewRemarksModal({
      exc,
      newStatus,
      remarks: defaultRemarks || (newStatus === 'Approved' ? 'Verified official documentation. Approved by Principal.' : 'Documentation incomplete or event not authorized.')
    });
  };

  const handleReviewExceptionConfirm = () => {
    if (!reviewRemarksModal) return;
    const res = updateExceptionStatus(
      reviewRemarksModal.exc.id,
      reviewRemarksModal.newStatus,
      { role: 'admin', name: 'Administrator' },
      reviewRemarksModal.remarks
    );
    if (res.success) {
      if (showToast) showToast(`Exception ${reviewRemarksModal.newStatus} for ${reviewRemarksModal.exc.studentName}`);
      setReviewRemarksModal(null);
    } else {
      alert(res.error || 'Failed to update status.');
    }
  };

  // Faculty Save Handler
  const handleSaveFaculty = (facultyData) => {
    const updated = saveFaculty(facultyData);
    updateFacultyNameInEntries(facultyData.id, facultyData.name);
    notifyTimetableSync();
    setFaculties([...updated]);
    if (showToast) showToast('Faculty details updated successfully!');
  };

  // Department Save Handler
  const handleSaveDepartment = (e) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) {
      alert('Department Code and Name are required.');
      return;
    }
    const updated = saveDepartment(deptForm);
    setDepartments([...updated]);
    setShowDeptModal(false);
    setDeptForm({ id: '', code: '', name: '' });
    if (showToast) showToast(`Department ${deptForm.name} saved!`);
  };

  // Subject Save Handler
  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) {
      alert('Subject Code and Name are required.');
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
    setSubjectForm({ id: '', code: '', name: '', shortName: '', credits: 4, sem: activeSem, dept: activeDept });
    if (showToast) showToast(`Subject ${subjectForm.name} saved to ${activeDept}!`);
  };

  // PIN Update Handler
  const handlePinUpdate = (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinChangeMsg('PIN must be at least 4 digits.');
      return;
    }
    if (updateAdminPin(oldPin, newPin)) {
      setPinChangeMsg('Security PIN updated successfully!');
      setOldPin('');
      setNewPin('');
      if (showToast) showToast('Security PIN updated!');
    } else {
      setPinChangeMsg('Incorrect current PIN.');
    }
  };

  // Reset all academic data to defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all academic departments, faculty, subjects and timetables back to default sample records?')) {
      resetToDefault();
      resetFacultyTimetablesToDefault();
      refreshState();
      if (showToast) showToast('Academic data and timetables reset to defaults!');
    }
  };

  // Filtered subjects for active dept & sem
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchDept = !s.dept || s.dept.toLowerCase().includes(activeDept.toLowerCase().slice(0, 4));
      return matchDept;
    });
  }, [subjects, activeDept]);

  const subjectEntryCounts = useMemo(() => {
    const entries = getTimetableEntries();
    const counts = {};
    entries.forEach(e => { counts[e.subjectId] = (counts[e.subjectId] || 0) + 1; });
    return counts;
  }, [subjects]);

  return (
    <div className="admin-root-container">
      
      {/* ===================================================================
          LEFT DARK SIDEBAR: ADIT Attendance Admin Panel
          =================================================================== */}
      <aside className="admin-dark-sidebar no-print">
        {/* Brand */}
        <div className="admin-sidebar-header">
          <div className="admin-brand-icon">
            <GraduationCap size={24} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <h2 className="admin-brand-title">ADIT Attendance</h2>
            <span className="admin-brand-subtitle">Admin Panel</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="admin-sidebar-nav">
          <ul>
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`admin-nav-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setAdminTab(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer: Return to Faculty Attendance Portal / Logout */}
        <div className="admin-sidebar-footer">
          <button 
            className="admin-logout-btn"
            onClick={() => {
              if (onExit) onExit();
              else window.location.reload();
            }}
            title="Return to Attendance Portal"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ===================================================================
          MAIN ADMIN WORKSPACE AREA
          =================================================================== */}
      <div className="admin-main-viewport">
        
        {/* VIEW 1: FACULTY TIMETABLES (Primary View from User Screenshot) */}
        {adminTab === 'faculty' && (
          <FacultyTimetablePanel
            departments={departments}
            faculties={faculties}
            subjects={subjects}
            onSaveFaculty={handleSaveFaculty}
            onSwitchToClassTimetable={() => setAdminTab('class-timetables')}
            showToast={showToast}
          />
        )}

        {/* VIEW: CLASS TIMETABLES (Division/Class-wise Weekly Schedule & Sync) */}
        {adminTab === 'class-timetables' && (
          <ClassTimetablePanel
            departments={departments}
            faculties={faculties}
            subjects={subjects}
            onSwitchToFacultyTimetable={() => setAdminTab('faculty')}
            showToast={showToast}
          />
        )}

        {/* VIEW: CLASS MANAGEMENT (Department + Semester + Division + Academic Year) */}
        {adminTab === 'classes' && (
          <ClassManagementPanel
            departments={departments}
            showToast={showToast}
            onOpenClassTimetable={(dept, sem, div) => setAdminTab('class-timetables')}
          />
        )}

        {/* VIEW 2: DASHBOARD (Overview & High-level Metrics) */}
        {adminTab === 'dashboard' && (
          <div className="admin-subview">
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
                Administration Dashboard
              </h1>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
                High-level academic structure, faculty distribution, and timetable coverage.
              </p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Total Departments</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '10px' }}>
                  {departments.length}
                </div>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>Active Engineering Programs</span>
              </div>

              <div 
                className="card" 
                style={{ padding: '20px', cursor: 'pointer' }}
                onClick={() => setAdminTab('classes')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Active Classes</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '10px' }}>
                  {getClasses().length}
                </div>
                <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>Dept • Sem • Div Rosters</span>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Faculty Members</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '10px' }}>
                  {faculties.length}
                </div>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>Configured Across Depts</span>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Active Subjects</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '10px' }}>
                  {subjects.length}
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Odd & Even Semesters</span>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Timetables Active</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '10px' }}>
                  {faculties.length}
                </div>
                <span style={{ fontSize: '12px', color: '#7e22ce', fontWeight: '600' }}>Individual Faculty Schedules</span>
              </div>
            </div>

            {/* Department Breakdown Cards */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  Departments Overview
                </h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setAdminTab('faculty')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Open Faculty Timetables</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {departments.map((d) => {
                  const facCount = faculties.filter(f => f.dept?.toLowerCase().includes(d.name.toLowerCase().slice(0, 4))).length;
                  const subjCount = subjects.filter(s => s.dept?.toLowerCase().includes(d.name.toLowerCase().slice(0, 4))).length;

                  return (
                    <div 
                      key={d.id || d.code}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '18px',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#1e293b', fontWeight: '800' }}>
                            {d.code}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{facCount} Faculty</span>
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '10px' }}>
                          {d.name}
                        </h4>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                          {subjCount} Configured Subjects
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveDept(d.name);
                          setAdminTab('faculty');
                        }}
                        style={{
                          marginTop: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #bfdbfe',
                          backgroundColor: 'white',
                          color: '#2563eb',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          cursor: 'pointer'
                        }}
                      >
                        <span>View Timetables</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: TIMETABLES (Department Master View) */}
        {adminTab === 'timetables' && (
          <div className="admin-subview">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
                  Department Master Timetables
                </h1>
                <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
                  Comprehensive schedule matrix for {activeDept} ({activeSem}).
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setAdminTab('faculty')}
                >
                  <Users size={14} /> Individual Faculty Timetables
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                >
                  <Download size={14} /> Export Schedule
                </button>
              </div>
            </div>

            {/* Department selector */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <select
                className="form-control"
                value={activeDept}
                onChange={(e) => setActiveDept(e.target.value)}
                style={{ maxWidth: '280px', fontWeight: '700' }}
              >
                {departments.map((d) => (
                  <option key={d.id || d.name} value={d.name}>{d.name}</option>
                ))}
              </select>

              <select
                className="form-control"
                value={activeSem}
                onChange={(e) => setActiveSem(e.target.value)}
                style={{ maxWidth: '180px', fontWeight: '700' }}
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
                <option value="8th Semester">8th Semester</option>
              </select>
            </div>

            {/* Department Master Matrix */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
                Weekly Department Matrix - {activeDept}
              </h3>

              <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 14px', width: '120px' }}>Time Slot</th>
                      {TIMETABLE_DAYS.map(day => (
                        <th key={day} style={{ padding: '10px', textAlign: 'center' }}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slotTime) => {
                      if (slotTime === '12:40 - 1:25') {
                        return (
                          <tr key={slotTime} style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px 14px', fontWeight: '700', color: '#64748b' }}>{slotTime}</td>
                            <td colSpan={6} style={{ textAlign: 'center', fontWeight: '800', color: '#64748b', letterSpacing: '0.1em', fontSize: '11px', textTransform: 'uppercase' }}>
                              LUNCH BREAK
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={slotTime} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px', fontWeight: '700', color: '#475569', backgroundColor: '#fafbfc' }}>
                            {slotTime}
                          </td>
                          {TIMETABLE_DAYS.map(day => (
                            <td key={day} style={{ padding: '8px', borderRight: '1px solid #f1f5f9', textAlign: 'center' }}>
                              <span style={{ color: '#64748b', fontSize: '12px' }}>Scheduled Lectures</span>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: UPLOAD TIMETABLE (Dedicated Upload Hub) */}
        {adminTab === 'upload' && (
          <div className="admin-subview">
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
                Timetable Upload Hub
              </h1>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
                Upload official class or faculty timetable files in Excel (.xlsx, .csv), Image, or PDF format.
              </p>
            </div>

            <div style={{ maxWidth: '720px' }}>
              <div className="card" style={{ padding: '30px' }}>
                <TimetableUploadModal
                  selectedFaculty={faculties[0]}
                  departmentName={activeDept}
                  semesterName={activeSem}
                  onClose={() => setAdminTab('faculty')}
                  onTimetableUpdated={() => {
                    if (showToast) showToast('Timetable successfully loaded!');
                    setAdminTab('faculty');
                  }}
                  showToast={showToast}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: SUBJECTS MANAGEMENT */}
        {adminTab === 'subjects' && (
          <div className="admin-subview">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
                  Subjects Management
                </h1>
                <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
                  Manage course subjects, credits, and syllabus codes for {activeDept}.
                </p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSubjectForm({ id: '', code: '', name: '', shortName: '', credits: 4, sem: activeSem, dept: activeDept });
                  setShowSubjectModal(true);
                }}
              >
                <Plus size={15} /> Add Subject
              </button>
            </div>

            {/* Department Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
              <select
                className="form-control"
                value={activeDept}
                onChange={(e) => setActiveDept(e.target.value)}
                style={{ maxWidth: '280px', fontWeight: '700' }}
              >
                {departments.map((d) => (
                  <option key={d.id || d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Subjects Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Short Name</th>
                      <th>Department</th>
                      <th>Credits</th>
                      <th>Faculty In-Charge</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubjects.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          No subjects configured for {activeDept}. Click "Add Subject" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredSubjects.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '800', color: '#1e3a8a' }}>{s.code}</td>
                          <td style={{ fontWeight: '700' }}>
                            {s.name}
                            {subjectEntryCounts[s.id] > 0 && (
                              <span className="badge" style={{ marginLeft: '8px', backgroundColor: '#ecfdf5', color: '#059669', fontSize: '10px' }}>
                                {subjectEntryCounts[s.id]} slots
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                              {s.shortName || s.name.slice(0, 8)}
                            </span>
                          </td>
                          <td>{s.dept}</td>
                          <td>{s.credits || 4}</td>
                          <td>{s.faculty || 'Unassigned'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                if (window.confirm(`Delete subject ${s.name}?`)) {
                                  const updated = deleteSubject(s.id);
                                  setSubjects([...updated]);
                                  if (showToast) showToast('Subject deleted.');
                                }
                              }}
                              style={{ color: '#e11d48', padding: '4px 8px' }}
                            >
                              <Trash2 size={14} />
                            </button>
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

        {/* VIEW 6: DEPARTMENT ADMINISTRATION PANEL */}
        {adminTab === 'departments' && (
          <DepartmentAdminPanel
            onOpenFacultyTimetable={() => setAdminTab('faculty')}
            showToast={showToast}
          />
        )}

        {/* VIEW 6.5: ATTENDANCE EXCEPTIONS MANAGEMENT & APPROVAL PANEL */}
        {adminTab === 'exceptions' && (
          <div className="admin-subview" style={{ maxWidth: '1400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                  Official Attendance Exceptions & Approvals
                </h1>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                  Review, approve, and manage official sports, hackathon, and college duty attendance exceptions.
                </p>
              </div>

              {/* Policy Selector Card */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '12px 18px',
                boxShadow: '0 2px 6px rgba(37,99,235,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#2563eb" />
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase' }}>
                    Institutional Attendance Policy
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setInstitutionalExceptionPolicy(INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE);
                      setAdminExcPolicy(INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE);
                      if (showToast) showToast('Policy Updated: Approved exceptions count towards attendance eligibility.');
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      border: '1px solid',
                      cursor: 'pointer',
                      backgroundColor: adminExcPolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE ? '#2563eb' : '#f8fafc',
                      color: adminExcPolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE ? '#ffffff' : '#475569',
                      borderColor: adminExcPolicy === INSTITUTIONAL_POLICIES.COUNT_ELIGIBLE ? '#2563eb' : '#cbd5e1'
                    }}
                    title="GTU Standard: Approved exceptions count towards 75% attendance threshold"
                  >
                    Count Toward Eligibility (Default)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInstitutionalExceptionPolicy(INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION);
                      setAdminExcPolicy(INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION);
                      if (showToast) showToast('Policy Updated: Approved exceptions deducted from denominator.');
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      border: '1px solid',
                      cursor: 'pointer',
                      backgroundColor: adminExcPolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION ? '#2563eb' : '#f8fafc',
                      color: adminExcPolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION ? '#ffffff' : '#475569',
                      borderColor: adminExcPolicy === INSTITUTIONAL_POLICIES.EXCLUDE_EXCEPTION ? '#2563eb' : '#cbd5e1'
                    }}
                    title="Exclude exception sessions from total denominator"
                  >
                    Exclude from Denominator
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInstitutionalExceptionPolicy(INSTITUTIONAL_POLICIES.SEPARATE_ONLY);
                      setAdminExcPolicy(INSTITUTIONAL_POLICIES.SEPARATE_ONLY);
                      if (showToast) showToast('Policy Updated: Exceptions recorded separately, physical presence only for percentage.');
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      border: '1px solid',
                      cursor: 'pointer',
                      backgroundColor: adminExcPolicy === INSTITUTIONAL_POLICIES.SEPARATE_ONLY ? '#2563eb' : '#f8fafc',
                      color: adminExcPolicy === INSTITUTIONAL_POLICIES.SEPARATE_ONLY ? '#ffffff' : '#475569',
                      borderColor: adminExcPolicy === INSTITUTIONAL_POLICIES.SEPARATE_ONLY ? '#2563eb' : '#cbd5e1'
                    }}
                    title="Exceptions reported separately without modifying presence percentage"
                  >
                    Separate Report Only
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Requests</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{adminExceptions.length}</div>
              </div>
              <div className="card" style={{ padding: '18px', borderRadius: '12px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Approved Exceptions</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#15803d', marginTop: '4px' }}>
                  {adminExceptions.filter(e => e.status === 'Approved').length}
                </div>
              </div>
              <div className="card" style={{ padding: '18px', borderRadius: '12px', border: '1px solid #fef08a', backgroundColor: '#fefce8' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#854d0e', textTransform: 'uppercase' }}>Pending Review</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#ca8a04', marginTop: '4px' }}>
                  {adminExceptions.filter(e => e.status === 'Pending').length}
                </div>
              </div>
              <div className="card" style={{ padding: '18px', borderRadius: '12px', border: '1px solid #fecdd3', backgroundColor: '#fff1f2' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#9f1239', textTransform: 'uppercase' }}>Rejected</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#e11d48', marginTop: '4px' }}>
                  {adminExceptions.filter(e => e.status === 'Rejected').length}
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="card" style={{ padding: '18px 22px', borderRadius: '14px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search student, enrollment, activity..."
                      value={adminExcSearch}
                      onChange={(e) => setAdminExcSearch(e.target.value)}
                      style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    className="form-control"
                    value={adminExcFilterStatus}
                    onChange={(e) => setAdminExcFilterStatus(e.target.value)}
                    style={{ height: '38px', width: '150px', fontSize: '13px', fontWeight: '600' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending Only</option>
                    <option value="Approved">Approved Only</option>
                    <option value="Rejected">Rejected Only</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    className="form-control"
                    value={adminExcFilterCat}
                    onChange={(e) => setAdminExcFilterCat(e.target.value)}
                    style={{ height: '38px', width: '190px', fontSize: '13px', fontWeight: '600' }}
                  >
                    <option value="All">All Categories</option>
                    {EXCEPTION_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setAdminExcSearch('');
                    setAdminExcFilterStatus('All');
                    setAdminExcFilterCat('All');
                    setAdminExcDept('All');
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>

            {/* Exceptions Requests Table */}
            <div className="card" style={{ padding: '0', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="data-table" style={{ width: '100%', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Student &amp; Class</th>
                      <th>Activity / Event</th>
                      <th>Category</th>
                      <th>Date Range</th>
                      <th>Affected Lectures</th>
                      <th>Status</th>
                      <th>Audit Trail</th>
                      <th style={{ textAlign: 'right', minWidth: '180px' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = adminExceptions.filter(exc => {
                        const q = adminExcSearch.toLowerCase();
                        const matchQ = !q || 
                          exc.studentName.toLowerCase().includes(q) ||
                          exc.enrollmentNo.includes(q) ||
                          exc.activityName.toLowerCase().includes(q);
                        const matchStatus = adminExcFilterStatus === 'All' || exc.status === adminExcFilterStatus;
                        const matchCat = adminExcFilterCat === 'All' || exc.category === adminExcFilterCat;
                        return matchQ && matchStatus && matchCat;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                              <Award size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                              <div style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>
                                No attendance exception requests found
                              </div>
                              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                Requests submitted by faculty members or administrators will be displayed here.
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((exc, index) => {
                        const isPending = exc.status === 'Pending';
                        const isApproved = exc.status === 'Approved';
                        const isRejected = exc.status === 'Rejected';

                        return (
                          <tr key={exc.id}>
                            <td>{index + 1}</td>
                            <td>
                              <div style={{ fontWeight: '800', color: '#0f172a' }}>{exc.studentName}</div>
                              <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: '600' }}>
                                {exc.enrollmentNo}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {exc.departmentName} • {exc.semester} {exc.division}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: '700', color: '#1e3a8a' }}>{exc.activityName}</div>
                              {exc.reason && (
                                <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={exc.reason}>
                                  Reason: {exc.reason}
                                </div>
                              )}
                              {exc.documentName && (
                                <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: '700', marginTop: '2px' }}>
                                  📎 {exc.documentName} {exc.documentSize ? `(${exc.documentSize})` : ''}
                                </div>
                              )}
                            </td>
                            <td>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: exc.category === 'Sports Tournament' ? '#f0fdf4' : exc.category === 'Technical Competition' ? '#faf5ff' : '#eff6ff',
                                color: exc.category === 'Sports Tournament' ? '#166534' : exc.category === 'Technical Competition' ? '#6b21a8' : '#1e40af',
                                border: '1px solid rgba(0,0,0,0.06)'
                              }}>
                                {exc.category}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: '700', color: '#334155', fontSize: '12px' }}>
                                {exc.startDate} to {exc.endDate}
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => setViewLecturesModal(exc)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  backgroundColor: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  cursor: 'pointer'
                                }}
                              >
                                {exc.affectedLecturesCount || (exc.overlappingLectures && exc.overlappingLectures.length) || 0} Lectures →
                              </button>
                            </td>
                            <td>
                              {isApproved && (
                                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', backgroundColor: '#dcfce7', color: '#15803d' }}>
                                  Approved
                                </span>
                              )}
                              {isPending && (
                                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', backgroundColor: '#fef9c3', color: '#854d0e' }}>
                                  Pending Review
                                </span>
                              )}
                              {isRejected && (
                                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '800', backgroundColor: '#ffe4e6', color: '#be123c' }}>
                                  Rejected
                                </span>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                By: <b>{exc.submittedBy || 'Faculty'}</b>
                              </div>
                              {exc.reviewedBy && (
                                <div style={{ fontSize: '10.5px', color: '#0f172a', marginTop: '2px' }}>
                                  Reviewed: <b>{exc.reviewedBy}</b>
                                </div>
                              )}
                              {exc.reviewerRemarks && (
                                <div style={{ fontSize: '10px', color: '#475569', fontStyle: 'italic', maxWidth: '180px' }} title={exc.reviewerRemarks}>
                                  "{exc.reviewerRemarks}"
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                {isPending ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setReviewRemarksModal({ exc, newStatus: 'Approved', remarks: 'Verified official documentation. Approved by Principal.' })}
                                      style={{
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '11.5px',
                                        fontWeight: '700',
                                        backgroundColor: '#16a34a',
                                        color: '#ffffff',
                                        border: 'none',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setReviewRemarksModal({ exc, newStatus: 'Rejected', remarks: 'Documentation incomplete or event not authorized by GTU.' })}
                                      style={{
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        fontSize: '11.5px',
                                        fontWeight: '700',
                                        backgroundColor: '#dc2626',
                                        color: '#ffffff',
                                        border: 'none',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setReviewRemarksModal({
                                      exc,
                                      newStatus: isApproved ? 'Rejected' : 'Approved',
                                      remarks: isApproved ? 'Revoked after re-review.' : 'Re-approved upon submitting valid certificate.'
                                    })}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      backgroundColor: '#f1f5f9',
                                      color: '#475569',
                                      border: '1px solid #cbd5e1',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Change to {isApproved ? 'Reject' : 'Approve'}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete attendance exception for ${exc.studentName}?`)) {
                                      deleteException(exc.id);
                                      if (showToast) showToast('Exception request deleted.');
                                    }
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    border: '1px solid #fecdd3',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete Record"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Review Remarks Confirmation */}
            {reviewRemarksModal && (
              <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="modal-content" style={{ maxWidth: '480px', width: '90%', borderRadius: '16px', padding: '24px' }}>
                  <div className="modal-header" style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      {reviewRemarksModal.newStatus === 'Approved' ? 'Approve' : 'Reject'} Attendance Exception
                    </h3>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px' }}>
                      Student: <b>{reviewRemarksModal.exc.studentName}</b> ({reviewRemarksModal.exc.enrollmentNo})<br />
                      Activity: <b>{reviewRemarksModal.exc.activityName}</b> ({reviewRemarksModal.exc.startDate} to {reviewRemarksModal.exc.endDate})
                    </p>
                    <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Reviewer Remarks / Reason *
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={reviewRemarksModal.remarks}
                      onChange={(e) => setReviewRemarksModal({ ...reviewRemarksModal, remarks: e.target.value })}
                      placeholder="Enter verification comments, circular reference, or reason..."
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setReviewRemarksModal(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`btn ${reviewRemarksModal.newStatus === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                      style={{
                        backgroundColor: reviewRemarksModal.newStatus === 'Approved' ? '#16a34a' : '#dc2626',
                        color: '#ffffff'
                      }}
                      onClick={handleReviewExceptionConfirm}
                    >
                      Confirm {reviewRemarksModal.newStatus}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: View Overlapping Scheduled Lectures */}
            {viewLecturesModal && (
              <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="modal-content" style={{ maxWidth: '650px', width: '92%', borderRadius: '16px', padding: '24px' }}>
                  <div className="modal-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Affected Scheduled Lectures
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                        {viewLecturesModal.studentName} ({viewLecturesModal.semester} {viewLecturesModal.division}) • {viewLecturesModal.startDate} to {viewLecturesModal.endDate}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewLecturesModal(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ maxHeight: '360px', overflowY: 'auto', marginBottom: '20px' }}>
                    {viewLecturesModal.overlappingLectures && viewLecturesModal.overlappingLectures.length > 0 ? (
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
                          {viewLecturesModal.overlappingLectures.map((lec, i) => (
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
                      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        No timetable lecture conflicts found for this class during the selected date range.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setViewLecturesModal(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 7: SETTINGS (Security PIN & College Branding) */}
        {adminTab === 'settings' && (
          <div className="admin-subview" style={{ maxWidth: '640px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
                Admin & Security Settings
              </h1>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
                Manage master administrator PIN code, data synchronization, and college branding.
              </p>
            </div>

            {/* PIN Code Form */}
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} style={{ color: '#2563eb' }} />
                Change Admin Security PIN
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                Default PIN code is <strong>1234</strong>.
              </p>

              <form onSubmit={handlePinUpdate} style={{ marginTop: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Current PIN</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Current 4-digit PIN"
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>New PIN</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="New PIN"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {pinChangeMsg && (
                  <div style={{ fontSize: '12.5px', marginTop: '10px', fontWeight: '700', color: pinChangeMsg.includes('success') ? '#059669' : '#e11d48' }}>
                    {pinChangeMsg}
                  </div>
                )}

                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <ShieldCheck size={14} /> Update PIN Code
                  </button>
                </div>
              </form>
            </div>

            {/* Database Reset Option */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} />
                Reset System Database
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                Restore all faculties, timetables, subjects, and departments to default sample data.
              </p>

              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleResetDefaults}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={14} /> Reset Academic Database to Defaults
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ===================================================================
          MODALS: Add Department & Add Subject
          =================================================================== */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                Add Academic Department
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDeptModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveDepartment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Department Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. AI&DS, CP, IT, EC"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Department Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Artificial Intelligence & Data Science"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeptModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                Add Subject to {activeDept}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSubjectModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveSubject}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Subject Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 3130703"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Subject Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Database Management Systems"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Short Label</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. DBMS"
                      value={subjectForm.shortName}
                      onChange={(e) => setSubjectForm({ ...subjectForm, shortName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Credits</label>
                    <input
                      type="number"
                      className="form-control"
                      value={subjectForm.credits}
                      onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 4 })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
