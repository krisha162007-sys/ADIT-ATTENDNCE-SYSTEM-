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
  Database
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
  clearAllAttendanceData,
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
import FacultyTimetablePanel from './FacultyTimetablePanel';
import ClassTimetablePanel from './ClassTimetablePanel';
import ClassManagementPanel from './ClassManagementPanel';
import TimetableUploadModal from './TimetableUploadModal';
import DepartmentAdminPanel from './DepartmentAdminPanel';
import { 
  migrateLocalDataToFirestore, 
  fetchAllFromFirestore 
} from '../services/firestoreSync';

// Sidebar Menu Items
const SettingsIcon = typeof Settings !== 'undefined' ? Settings : (typeof LucideIcons !== 'undefined' ? LucideIcons.Settings : null);
const DatabaseIcon = (typeof Database !== 'undefined' ? Database : ((typeof LucideIcons !== 'undefined' && LucideIcons.Database) ? LucideIcons.Database : null)) || ((props) => React.createElement('span', { ...props }, '🗄️'));

const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: typeof LayoutDashboard !== 'undefined' ? LayoutDashboard : null },
  { id: 'timetable', label: 'Faculty Timetable', icon: typeof Calendar !== 'undefined' ? Calendar : null },
  { id: 'faculty', label: 'Faculty Roster', icon: typeof Users !== 'undefined' ? Users : null },
  { id: 'classes', label: 'Student Management', icon: typeof GraduationCap !== 'undefined' ? GraduationCap : null },
  { id: 'subjects', label: 'Subjects', icon: typeof BookOpen !== 'undefined' ? BookOpen : null },
  { id: 'departments', label: 'Departments', icon: typeof Building2 !== 'undefined' ? Building2 : null },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];
if (typeof window !== 'undefined') {
  window.adminMenuItems = adminMenuItems;
}

export default function AdminPanel({ showToast, onExit, initialTab = 'faculty' }) {
  // Navigation inside Admin Panel
  // Options: 'faculty' (default, matches screenshot), 'class-timetables', 'dashboard', 'timetables', 'upload', 'subjects', 'departments', 'settings'
  const [adminTab, setAdminTab] = useState(initialTab);

  // Cloud Sync & Cross-Device Management State
  const [syncConfig, setSyncConfig] = useState(() => (typeof getCloudSyncConfig === 'function' ? getCloudSyncConfig() : { enabled: false, syncUrl: '' }));
  const [cloudUrlInput, setCloudUrlInput] = useState(() => (typeof getCloudSyncConfig === 'function' ? (getCloudSyncConfig().syncUrl || '') : ''));
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncTokenInput, setSyncTokenInput] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');

  // Google Cloud Firestore State
  const [firestoreLoading, setFirestoreLoading] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState('');
  const [classesList, setClassesList] = useState(getClasses());

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

  // Refresh all state from localStorage
  const refreshState = () => {
    setDepartments(getDepartments());
    setSubjects(getSubjects());
    setFaculties(getFaculties());
    setStudents(getStudents());
    setAllocations(getAllocations());
  };

  // Listen for faculty and timetable updates
  React.useEffect(() => {
    const handleFacultyUpdated = () => {
      setFaculties([...getFaculties()]);
    };
    const handleTimetableSynced = () => {
      setAllocations(getAllocations());
    };
    window.addEventListener('adit-faculty-updated', handleFacultyUpdated);
    window.addEventListener('adit-timetable-synced', handleTimetableSynced);
    return () => {
      window.removeEventListener('adit-faculty-updated', handleFacultyUpdated);
      window.removeEventListener('adit-timetable-synced', handleTimetableSynced);
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

  // Cloud Synchronization Handlers
  const handleSaveCloudConfig = (e) => {
    e.preventDefault();
    if (typeof saveCloudSyncConfig === 'function') {
      const updated = saveCloudSyncConfig({
        enabled: Boolean(cloudUrlInput.trim()),
        syncUrl: cloudUrlInput.trim()
      });
      setSyncConfig(updated);
      if (showToast) showToast('Cloud Sync settings updated!');
    }
  };

  const handlePushToCloud = async () => {
    if (typeof pushToCloud !== 'function') return;
    setSyncLoading(true);
    setSyncMessage('');
    const res = await pushToCloud(cloudUrlInput.trim());
    setSyncLoading(false);
    if (res.success) {
      if (showToast) showToast('Successfully pushed all changes to cloud!');
      if (typeof getCloudSyncConfig === 'function') setSyncConfig(getCloudSyncConfig());
    } else {
      setSyncMessage(res.error || 'Failed to upload to cloud.');
    }
  };

  const handlePullFromCloud = async () => {
    if (typeof pullFromCloud !== 'function') return;
    setSyncLoading(true);
    setSyncMessage('');
    const res = await pullFromCloud(cloudUrlInput.trim(), true);
    setSyncLoading(false);
    if (res.success) {
      if (showToast) showToast('Successfully downloaded latest changes from cloud!');
      if (typeof getCloudSyncConfig === 'function') setSyncConfig(getCloudSyncConfig());
      refreshState();
    } else {
      setSyncMessage(res.error || 'Failed to pull updates from cloud.');
    }
  };

  const handlePushToFirestore = async () => {
    setFirestoreLoading(true);
    setFirestoreStatus('Pushing institutional data to Cloud Firestore...');
    try {
      const syncFn = (typeof window !== 'undefined' && window.migrateLocalDataToFirestore) 
        ? window.migrateLocalDataToFirestore 
        : migrateLocalDataToFirestore;
      if (typeof syncFn === 'function') {
        const res = await syncFn(true);
        if (res && res.migrated) {
          setFirestoreStatus('✓ Successfully pushed all departments, faculties, timetables, and sessions to Cloud Firestore (adit-attendance-system)!');
          if (showToast) {
            showToast('Cloud Firestore: Institutional data pushed successfully!', 'success');
          }
        } else {
          setFirestoreStatus('⚠️ Cloud Firestore push: ' + (res?.error || res?.reason || 'Verified up to date.'));
        }
      } else {
        setFirestoreStatus('⚠️ Cloud Firestore synchronizer not loaded.');
      }
    } catch (err) {
      setFirestoreStatus('❌ Failed to push to Cloud Firestore: ' + (err.message || 'Unknown error'));
      if (showToast) {
        showToast('Firestore error: ' + err.message, 'error');
      }
    } finally {
      setFirestoreLoading(false);
    }
  };

  const handlePullFromFirestore = async () => {
    setFirestoreLoading(true);
    setFirestoreStatus('Pulling latest institutional data from Cloud Firestore...');
    try {
      const fetchFn = (typeof window !== 'undefined' && (window.syncAllFromFirestore || window.fetchAllFromFirestore))
        ? (window.syncAllFromFirestore || window.fetchAllFromFirestore)
        : fetchAllFromFirestore;
      if (typeof fetchFn === 'function') {
        const ok = await fetchFn();
        if (ok) {
          setFirestoreStatus('✓ Successfully synchronized latest faculties, timetables, and attendance sessions from Cloud Firestore!');
          refreshState();
          if (showToast) {
            showToast('Cloud Firestore: Local data synchronized with cloud!', 'success');
          }
        } else {
          setFirestoreStatus('⚠️ Could not complete Cloud Firestore pull (verify network or permissions).');
        }
      } else {
        setFirestoreStatus('⚠️ Cloud Firestore pull function not loaded.');
      }
    } catch (err) {
      setFirestoreStatus('❌ Failed to pull from Cloud Firestore: ' + (err.message || 'Unknown error'));
      if (showToast) {
        showToast('Firestore error: ' + err.message, 'error');
      }
    } finally {
      setFirestoreLoading(false);
    }
  };

  const handleExportBackup = () => {
    if (typeof downloadSnapshotFile === 'function') {
      downloadSnapshotFile();
      if (showToast) showToast('System backup (.json) downloaded!');
    }
  };

  const handleImportBackupFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (typeof importSystemSnapshot === 'function') {
          const res = importSystemSnapshot(parsed);
          if (res.success) {
            if (showToast) showToast(`Restored ${res.restoredCount} collections from backup!`);
            refreshState();
          } else {
            if (showToast) showToast('Import failed: ' + res.error);
          }
        }
      } catch (err) {
        if (showToast) showToast('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopySyncToken = () => {
    if (typeof generateSyncToken === 'function') {
      const token = generateSyncToken();
      setGeneratedToken(token);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(token).then(() => {
          if (showToast) showToast('Quick Transfer Token copied to clipboard!');
        }).catch(() => {
          if (showToast) showToast('Token generated. Copy from box below.');
        });
      } else {
        if (showToast) showToast('Token generated. Copy from box below.');
      }
    }
  };

  const handleApplySyncToken = () => {
    if (!syncTokenInput.trim()) return;
    if (typeof restoreFromSyncToken === 'function') {
      const res = restoreFromSyncToken(syncTokenInput.trim());
      if (res.success) {
        if (showToast) showToast(`Restored ${res.restoredCount} collections from token!`);
        setSyncTokenInput('');
        refreshState();
      } else {
        if (showToast) showToast('Token restore failed: ' + res.error);
      }
    }
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

  // Clear all attendance records & exceptions (keeps academic database intact)
  const handleClearAttendanceData = () => {
    if (window.confirm('Are you sure you want to clear all recorded attendance sessions and exceptions? Academic data (departments, classes, faculties, subjects, timetables, and student rosters) will be preserved.')) {
      clearAllAttendanceData();
      refreshState();
      if (showToast) showToast('All recorded attendance sessions and exceptions have been cleared!');
    }
  };

  // Wipe all academic data clean
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to wipe ALL academic data (departments, faculty, subjects, classes, students, and timetables) clean to start with a blank database?')) {
      resetToDefault();
      resetFacultyTimetablesToDefault();
      refreshState();
      if (showToast) showToast('All academic data wiped clean! You have a fresh clean slate.');
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
        
        {/* VIEW 0: RESTORED FACULTY TIMETABLE */}
        {adminTab === 'timetable' && (
          <FacultyTimetablePanel
            departments={departments}
            faculties={faculties}
            subjects={subjects}
            onSaveFaculty={handleSaveFaculty}
            showToast={showToast}
          />
        )}

        {/* VIEW 1: FACULTY ROSTER */}
        {adminTab === 'faculty' && (
          <DepartmentAdminPanel
            showToast={showToast}
          />
        )}

        {/* VIEW: STUDENT MANAGEMENT */}
        {adminTab === 'classes' && (
          <ClassManagementPanel
            departments={departments}
            showToast={showToast}
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
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Faculty Strength</span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '10px' }}>
                  {faculties.length}
                </div>
                <span style={{ fontSize: '12px', color: '#7e22ce', fontWeight: '600' }}>Active Teaching Roster</span>
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
                  <span>Open Faculty Roster</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {departments.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <Building2 size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                    <p style={{ margin: 0, fontWeight: '700', color: '#475569', fontSize: '15px' }}>No Departments Created Yet</p>
                    <p style={{ margin: '4px 0 16px', color: '#64748b', fontSize: '13px' }}>Click below to create your institution's departments.</p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowDeptModal(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} /> Add Department
                    </button>
                  </div>
                ) : departments.map((d) => {
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
                        <span>View Faculty Roster</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
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
                {departments.length === 0 ? (
                  <option value="">No Departments (Add Department First)</option>
                ) : (
                  departments.map((d) => (
                    <option key={d.id || d.name} value={d.name}>{d.name}</option>
                  ))
                )}
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

            {/* 0. GOOGLE CLOUD FIRESTORE INTEGRATION (adit-attendance-system) */}
            <div className="card" style={{ padding: '24px', marginBottom: '20px', borderLeft: '5px solid #d97706', border: '1px solid #fed7aa', backgroundColor: '#fffbeb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <DatabaseIcon size={20} style={{ color: '#d97706' }} />
                  Google Cloud Firestore (Project: <code>adit-attendance-system</code>)
                </h3>
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  border: '1px solid #fde68a'
                }}>
                  ● Cloud Database Integrated
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#78350f', marginTop: '6px', lineHeight: '1.5' }}>
                Cloud Firestore is configured as the shared source of truth across all devices. Faculties, students, classes, timetables, and attendance records sync directly with project <strong>adit-attendance-system</strong>.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handlePushToFirestore}
                  disabled={firestoreLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#d97706', borderColor: '#b45309' }}
                >
                  <UploadCloud size={14} />
                  {firestoreLoading ? 'Syncing...' : 'Push All to Cloud Firestore'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handlePullFromFirestore}
                  disabled={firestoreLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} />
                  Pull Latest from Cloud Firestore
                </button>
              </div>

              {firestoreStatus && (
                <div style={{ marginTop: '12px', fontSize: '12.5px', fontWeight: '700', color: firestoreStatus.startsWith('✓') ? '#15803d' : '#b45309' }}>
                  {firestoreStatus}
                </div>
              )}
            </div>

            {/* 1. CLOUD SYNC & MULTI-DEVICE PERSISTENCE */}
            <div className="card" style={{ padding: '24px', marginBottom: '20px', border: '1px solid #bfdbfe', backgroundColor: '#f8faff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <UploadCloud size={20} style={{ color: '#2563eb' }} />
                  Cloud Synchronization (Cross-Device)
                </h3>
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  backgroundColor: syncConfig.enabled ? '#dcfce7' : '#f1f5f9',
                  color: syncConfig.enabled ? '#15803d' : '#64748b'
                }}>
                  {syncConfig.enabled ? '● Cloud Sync Enabled' : '○ Local Storage Mode'}
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px', lineHeight: '1.5' }}>
                Keep your faculties, timetables, and student attendance automatically synchronized across all laptops, phones, and devices.
              </p>

              <form onSubmit={handleSaveCloudConfig} style={{ marginTop: '16px' }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b' }}>
                    Cloud Database URL (Firebase Realtime Database or Custom REST Endpoint)
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://your-project-default-rtdb.firebaseio.com"
                    value={cloudUrlInput}
                    onChange={(e) => setCloudUrlInput(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                  <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Tip: Enter your free Firebase Realtime Database URL to automatically replicate all admin changes across any phone or device worldwide.
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button type="submit" className="btn btn-outline btn-sm" style={{ fontWeight: '700' }}>
                    Save Cloud URL
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handlePushToCloud}
                      disabled={syncLoading || !cloudUrlInput.trim()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <UploadCloud size={14} />
                      {syncLoading ? 'Syncing...' : 'Push to Cloud'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handlePullFromCloud}
                      disabled={syncLoading || !cloudUrlInput.trim()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={14} />
                      Pull from Cloud
                    </button>
                  </div>
                </div>

                {syncMessage && (
                  <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: '700', color: '#e11d48' }}>
                    {syncMessage}
                  </div>
                )}
                {syncConfig.lastSyncTime && (
                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
                    Last Synced: {new Date(syncConfig.lastSyncTime).toLocaleString()}
                  </div>
                )}
              </form>
            </div>

            {/* 2. 1-CLICK INSTANT DEVICE TRANSFER & BACKUP */}
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} style={{ color: '#2563eb' }} />
                Instant Device Transfer & Backup
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px', lineHeight: '1.5' }}>
                Move all admin configuration, faculties, classes, and timetables to another device immediately without typing anything.
              </p>

              {/* Action Buttons: Export & Import File */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleExportBackup}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                >
                  <Download size={15} /> Export System Backup (.json)
                </button>
                <label className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700', cursor: 'pointer', margin: 0 }}>
                  <UploadCloud size={15} /> Restore from Backup File
                  <input type="file" accept=".json" onChange={handleImportBackupFile} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Quick Transfer Token */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  📱 Quick Device Transfer Token (No files needed)
                </label>
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 10px 0' }}>
                  Click <strong>Copy Token</strong> on this computer, send it to your phone (via WhatsApp or email), and click <strong>Apply Token</strong> on your phone to transfer everything instantly.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCopySyncToken}
                    style={{ fontWeight: '700' }}
                  >
                    Copy Transfer Token
                  </button>
                </div>

                {generatedToken && (
                  <div style={{ marginBottom: '12px' }}>
                    <textarea
                      readOnly
                      value={generatedToken}
                      rows={2}
                      className="form-control"
                      style={{ fontSize: '11px', fontFamily: 'monospace', resize: 'none' }}
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Paste Transfer Token on other device here..."
                    value={syncTokenInput}
                    onChange={(e) => setSyncTokenInput(e.target.value)}
                    style={{ fontSize: '12.5px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleApplySyncToken}
                    disabled={!syncTokenInput.trim()}
                    style={{ whiteSpace: 'nowrap', fontWeight: '700' }}
                  >
                    Apply Token
                  </button>
                </div>
              </div>
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

            {/* Clear Attendance Sessions Option */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={18} />
                Clear Recorded Attendance Sessions
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                Wipe all saved attendance registers, lecture sessions, and student exception logs clean. All students, departments, classes, faculties, subjects, and timetables remain preserved.
              </p>

              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={handleClearAttendanceData}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#d97706', color: '#ffffff', border: 'none' }}
                >
                  <Trash2 size={14} /> Clear All Attendance Records & Exceptions
                </button>
              </div>
            </div>

            {/* Database Reset Option */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} />
                Wipe All Academic Data (Clean Slate)
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                Wipe all departments, faculties, classes, students, subjects, and timetables completely clean so you can enter real institutional data from scratch.
              </p>

              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleResetDefaults}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={14} /> Wipe All Data & Start Clean Slate
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

if (typeof window !== 'undefined') {
  window.AdminPanel = AdminPanel;
}
