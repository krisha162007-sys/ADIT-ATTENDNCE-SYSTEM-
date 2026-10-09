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
  ArrowLeft
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
  getClasses
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
import ClassTimetablePanel from './ClassTimetablePanel';
import ClassManagementPanel from './ClassManagementPanel';
import TimetableUploadModal from './TimetableUploadModal';
import DepartmentAdminPanel from './DepartmentAdminPanel';

export default function AdminPanel({ showToast, onExit }) {
  // Navigation inside Admin Panel
  // Options: 'dashboard' (default), 'class-timetables', 'classes', 'subjects', 'departments', 'settings'
  const [adminTab, setAdminTab] = useState('dashboard');

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

  // Sidebar Menu Items
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'class-timetables', label: 'Class Timetables', icon: Layers },
    { id: 'classes', label: 'Classes', icon: GraduationCap },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Refresh all state from localStorage
  const refreshState = () => {
    setDepartments(getDepartments());
    setSubjects(getSubjects());
    setFaculties(getFaculties());
    setStudents(getStudents());
    setAllocations(getAllocations());
  };

  // Listen for faculty updates dispatched from DepartmentAdminPanel
  React.useEffect(() => {
    const handleFacultyUpdated = () => {
      setFaculties([...getFaculties()]);
    };
    window.addEventListener('adit-faculty-updated', handleFacultyUpdated);
    return () => {
      window.removeEventListener('adit-faculty-updated', handleFacultyUpdated);
    };
  }, []);

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
        
        {/* VIEW: CLASS TIMETABLES (Division/Class-wise Weekly Schedule & Sync) */}
        {adminTab === 'class-timetables' && (
          <ClassTimetablePanel
            departments={departments}
            faculties={faculties}
            subjects={subjects}
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
                  onClick={() => setAdminTab('class-timetables')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Open Class Timetables</span>
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
                          setAdminTab('class-timetables');
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
                  onClick={() => setAdminTab('class-timetables')}
                >
                  <Layers size={14} /> Class Timetables
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
                  onClose={() => setAdminTab('class-timetables')}
                  onTimetableUpdated={() => {
                    if (showToast) showToast('Timetable successfully loaded!');
                    setAdminTab('class-timetables');
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
            onOpenFacultyTimetable={() => setAdminTab('class-timetables')}
            showToast={showToast}
          />
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
