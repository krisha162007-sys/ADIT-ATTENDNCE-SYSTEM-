import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Calendar, 
  Laptop, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Printer, 
  Download, 
  ChevronRight, 
  Check, 
  X, 
  Layers, 
  Clock, 
  Briefcase, 
  Cpu, 
  Network, 
  Brain, 
  Cog, 
  GraduationCap,
  Sparkles,
  UserCheck,
  UserPlus,
  ShieldCheck,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  getDepartments, 
  saveDepartment, 
  deactivateDepartment,
  reactivateDepartment,
  isDepartmentMatch,
  getFaculties, 
  saveFaculty, 
  deleteFaculty,
  getSubjects, 
  saveSubject, 
  deleteSubject,
  getStudents
  generateSuggestedFacultyId
} from '../services/attendanceStorage';
import {
  getAllFacultyTimetables, 
  TIME_SLOTS, 
  TIMETABLE_DAYS, 
  getSubjectColor,
  calculateTimetableSummary,
  updateSubjectInEntries,
  notifyTimetableSync,
  getEntriesByFaculty,
  deleteEntriesForFaculty,
  getTimetableEntries,
  saveTimetableEntry
} from '../services/timetableStorage';

export default function DepartmentAdminPanel({
  initialDept = 'ALL',
  onOpenFacultyTimetable,
  showToast
}) {
  // Master data
  const [departments, setDepartments] = useState(getDepartments());
  const [faculties, setFaculties] = useState(getFaculties());
  const [subjects, setSubjects] = useState(getSubjects());
  const [students, setStudents] = useState(getStudents ? getStudents() : []);

  // Listen for faculty roster updates
  React.useEffect(() => {
    const handleFacultyUpdated = () => {
      setFaculties([...getFaculties()]);
    };
    window.addEventListener('adit-faculty-updated', handleFacultyUpdated);
    return () => {
      window.removeEventListener('adit-faculty-updated', handleFacultyUpdated);
    };
  }, []);

  // Selected Department Filter (Defaults to 'ALL' for unified college-wide roster)
  const [selectedDeptName, setSelectedDeptName] = useState(initialDept || 'ALL');
  const [selectedSem, setSelectedSem] = useState('3rd Semester');

  // Sub-tabs inside Department Admin Panel:
  // 'faculty', 'divisions', 'labs', 'subjects', 'master-timetable'
  const [deptSubTab, setDeptSubTab] = useState('faculty');

  // Search filter
  const [facultySearch, setFacultySearch] = useState('');

  // Modals
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showEditFacultyModal, setShowEditFacultyModal] = useState(false);
  const [editingFacultyForm, setEditingFacultyForm] = useState(null);
  const [newDeptForm, setNewDeptForm] = useState({
    code: '',
    name: '',
    fullName: '',
    hod: '',
    hodEmail: '',
    hodPhone: '',
    cabin: '',
    established: '2026'
  });

  // Replace Faculty Modal state
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [facultyToReplace, setFacultyToReplace] = useState(null);
  const [targetReplacementFacultyId, setTargetReplacementFacultyId] = useState('');
  const [selectedLectureIdsForReplace, setSelectedLectureIdsForReplace] = useState([]);
  const [replaceSearch, setReplaceSearch] = useState('');

  // Remove Faculty Modal state
  const [showRemoveFacultyModal, setShowRemoveFacultyModal] = useState(false);
  const [facultyToRemove, setFacultyToRemove] = useState(null);
  const [removeWarningAcknowledged, setRemoveWarningAcknowledged] = useState(false);

  // Forms
  const [deptEditForm, setDeptEditForm] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
    id: '',
    name: '',
    designation: 'Assistant Professor',
    email: '',
    phone: '',
    subjects: ''
  });
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    shortName: '',
    credits: 4,
    theoryHours: 3,
    labHours: 2,
    faculty: ''
  });
  const [labForm, setLabForm] = useState({
    name: '',
    code: '',
    room: '',
    pcs: 30,
    inCharge: ''
  });

  const isAllDepts = selectedDeptName === 'ALL' || selectedDeptName === 'All Departments' || !selectedDeptName;

  // Current Active Department Object
  const currentDept = useMemo(() => {
    if (isAllDepts) {
      return {
        name: 'All Departments',
        code: 'ALL',
        fullName: 'Centralized Faculty Management • All Departments',
        hod: 'Dean / Academic Office',
        hodEmail: 'academic@adit.ac.in',
        hodPhone: '+91 2692 233680',
        cabin: 'Administrative Block',
        established: '2000',
        totalStudents: (students || []).length || 1800,
        classrooms: ['Campus-Wide Blocks'],
        labs: [],
        divisions: []
      };
    }
    return departments.find(d => d.name === selectedDeptName || d.code === selectedDeptName || d.id === selectedDeptName) || departments[0] || {
      name: 'AI & Data Science',
      code: 'AI&DS',
      fullName: 'Department of Artificial Intelligence & Data Science',
      hod: 'Prof. Priya Shah',
      hodEmail: 'priya.shah@adit.ac.in',
      hodPhone: '+91 98250 11111',
      cabin: 'Academic Block B, Room 201-A',
      established: '2021',
      totalStudents: 180,
      classrooms: ['Room 201', 'Room 202', 'Room 203', 'Room 204', 'Room 205', 'Seminar Hall 301'],
      labs: [
        { name: 'AI & Deep Learning Lab', code: 'AI-LAB', room: 'Lab 301', pcs: 35, inCharge: 'Prof. Dev Trivedi' },
        { name: 'Data Engineering & Analytics Lab', code: 'DE-LAB', room: 'Lab 302', pcs: 35, inCharge: 'Prof. R. Jain' },
        { name: 'Database & Systems Lab', code: 'DBS-LAB', room: 'Lab 201', pcs: 30, inCharge: 'Prof. Priya Shah' },
        { name: 'Network & Cloud Lab', code: 'NET-LAB', room: 'Lab 202', pcs: 30, inCharge: 'Prof. Sneha Mehta' }
      ],
      divisions: [
        { id: '1', name: 'Div 1', counselor: 'Prof. Priya Shah', cr: 'Aarav Patel', studentCount: 60 },
        { id: '2', name: 'Div 2', counselor: 'Prof. Rahul Patel', cr: 'Ananya Sharma', studentCount: 60 },
        { id: '3', name: 'Div 3', counselor: 'Prof. A. Kumar', cr: 'Devansh Verma', studentCount: 60 }
      ]
    };
  }, [departments, selectedDeptName, isAllDepts, students]);

  // Faculties belonging to this department (Category) or all if 'ALL'
  const deptFaculties = useMemo(() => {
    return faculties.filter(f => {
      const matchDept = isAllDepts || !f.dept || isDepartmentMatch(f.dept, selectedDeptName) || isDepartmentMatch(f.dept, currentDept.name);
      const q = facultySearch.toLowerCase().trim();
      const matchQuery = !q || 
        f.name.toLowerCase().includes(q) || 
        (f.id && f.id.toLowerCase().includes(q)) ||
        (f.dept && f.dept.toLowerCase().includes(q)) ||
        (f.subjects && f.subjects.toLowerCase().includes(q)) ||
        (f.designation && f.designation.toLowerCase().includes(q)) ||
        (f.email && f.email.toLowerCase().includes(q));
      return matchDept && matchQuery;
    });
  }, [faculties, currentDept, facultySearch, isAllDepts, selectedDeptName]);

  // Subjects belonging to this department or all if 'ALL'
  const deptSubjects = useMemo(() => {
    return subjects.filter(s => {
      if (isAllDepts) return true;
      return !s.dept || isDepartmentMatch(s.dept, currentDept.name) || isDepartmentMatch(s.dept, selectedDeptName);
    });
  }, [subjects, currentDept, isAllDepts, selectedDeptName]);

  // Timetables master
  const allTimetables = useMemo(() => {
    return getAllFacultyTimetables();
  }, [faculties]);

  // Workload calculations per faculty
  const facultyWorkloads = useMemo(() => {
    const map = {};
    deptFaculties.forEach(f => {
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

  // Total department weekly scheduled hours
  const totalWeeklyHours = useMemo(() => {
    return Object.values(facultyWorkloads).reduce((acc, curr) => acc + curr.totalLectures, 0);
  }, [facultyWorkloads]);

  // Department icon mapping
  const renderDeptIcon = (iconName) => {
    switch (iconName) {
      case 'Brain': return <Brain size={26} />;
      case 'Laptop': return <Laptop size={26} />;
      case 'Network': return <Network size={26} />;
      case 'Cpu': return <Cpu size={26} />;
      case 'Cog': return <Cog size={26} />;
      default: return <Building2 size={26} />;
    }
  };

  // Helper initials
  const getInitials = (name) => {
    if (!name) return 'FC';
    const parts = name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/i, '').trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Open Edit Department Modal
  const handleOpenEditDept = () => {
    setDeptEditForm({
      id: currentDept.id,
      code: currentDept.code || 'AI&DS',
      name: currentDept.name || 'AI & Data Science',
      fullName: currentDept.fullName || `Department of ${currentDept.name}`,
      hod: currentDept.hod || 'Prof. Priya Shah',
      hodEmail: currentDept.hodEmail || 'hod@adit.ac.in',
      hodPhone: currentDept.hodPhone || '+91 98250 11111',
      cabin: currentDept.cabin || 'Academic Block B, Room 201',
      established: currentDept.established || '2021',
      totalStudents: currentDept.totalStudents || 180,
      classrooms: currentDept.classrooms || ['Room 201', 'Room 202', 'Room 203'],
      labs: currentDept.labs || [],
      divisions: currentDept.divisions || []
    });
    setShowEditDeptModal(true);
  };

  // Toggle Department Active / Inactive Status
  const handleToggleDepartmentStatus = () => {
    const isInactive = currentDept.status === 'inactive';
    if (isInactive) {
      const updated = reactivateDepartment(currentDept.id);
      setDepartments([...updated]);
      if (showToast) showToast(`Department "${currentDept.name}" reactivated!`);
    } else {
      if (window.confirm(`Are you sure you want to deactivate ${currentDept.name}? Historical attendance records and data will be fully preserved.`)) {
        const updated = deactivateDepartment(currentDept.id);
        setDepartments([...updated]);
        if (showToast) showToast(`Department "${currentDept.name}" deactivated. Historical records preserved.`);
      }
    }
  };

  // Save New Department
  const handleSaveNewDepartment = (e) => {
    e.preventDefault();
    if (!newDeptForm.code || !newDeptForm.name) {
      alert('Department Code and Name are required');
      return;
    }
    const updated = saveDepartment({
      ...newDeptForm,
      status: 'active'
    });
    setDepartments([...updated]);
    setSelectedDeptName(newDeptForm.name);
    setShowAddDeptModal(false);
    setNewDeptForm({ code: '', name: '', fullName: '', hod: '', hodEmail: '', hodPhone: '', cabin: '', established: '2026' });
    if (showToast) showToast(`Department "${newDeptForm.name}" created!`);
  };

  // Open Edit Faculty Modal
  const handleOpenEditFaculty = (fac) => {
    setEditingFacultyForm({
      id: fac.id,
      name: fac.name || '',
      dept: fac.dept || currentDept.name,
      designation: fac.designation || 'Assistant Professor',
      email: fac.email || '',
      phone: fac.phone || '',
      subjects: fac.subjects || '',
      password: fac.password || 'faculty123'
    });
    setShowEditFacultyModal(true);
  };

  // Save Faculty Edit
  const handleSaveFacultyEdit = (e) => {
    e.preventDefault();
    if (!editingFacultyForm.name.trim()) {
      alert('Faculty name is required');
      return;
    }
    const updated = saveFaculty(editingFacultyForm);
    notifyTimetableSync();
    setFaculties([...updated]);
    setShowEditFacultyModal(false);
    if (showToast) showToast(`Faculty details updated for ${editingFacultyForm.name}!`);
    window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
  };

  // Save Department Edit
  const handleSaveDeptEdit = (e) => {
    e.preventDefault();
    const updated = saveDepartment(deptEditForm);
    setDepartments([...updated]);
    setSelectedDeptName(deptEditForm.name);
    setShowEditDeptModal(false);
    if (showToast) showToast(`Department profile updated for ${deptEditForm.name}!`);
  };

  // Add Faculty to this department
  const handleAddFaculty = (e) => {
    e.preventDefault();
    if (!facultyForm.name.trim()) {
      alert('Faculty name is required');
      return;
    }
    const defaultDept = isAllDepts ? (departments[0]?.name || 'Information Technology') : currentDept.name;
    const newFac = {
      ...facultyForm,
      dept: facultyForm.dept || defaultDept
    };
    const updated = saveFaculty(newFac);
    notifyTimetableSync();
    setFaculties([...updated]);
    setShowAddFacultyModal(false);
    setFacultyForm({ id: '', name: '', designation: 'Assistant Professor', email: '', phone: '', subjects: '', dept: '' });
    if (showToast) showToast(`${facultyForm.name} added to ${newFac.dept}!`);
    // Notify parent/sibling panels that faculty list changed
    window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
  };

  // Add Subject to this department
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) {
      alert('Subject code and name are required');
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
    setSubjectForm({ code: '', name: '', shortName: '', credits: 4, theoryHours: 3, labHours: 2, faculty: '' });
    if (showToast) showToast(`Subject ${subjectForm.name} added to ${currentDept.name}!`);
  };

  // Add Lab to this department
  const handleAddLab = (e) => {
    e.preventDefault();
    if (!labForm.name) {
      alert('Lab name is required');
      return;
    }
    const updatedDept = {
      ...currentDept,
      labs: [...(currentDept.labs || []), labForm]
    };
    const updated = saveDepartment(updatedDept);
    setDepartments([...updated]);
    setShowAddLabModal(false);
    setLabForm({ name: '', code: '', room: '', pcs: 30, inCharge: '' });
    if (showToast) showToast(`Lab "${labForm.name}" added to ${currentDept.name}!`);
  };

  // Entries for faculty to replace
  const entriesForReplace = useMemo(() => {
    if (!facultyToReplace) return [];
    return getEntriesByFaculty(facultyToReplace.id);
  }, [facultyToReplace]);

  // Entries for faculty to remove
  const entriesForRemove = useMemo(() => {
    if (!facultyToRemove) return [];
    return getEntriesByFaculty(facultyToRemove.id);
  }, [facultyToRemove]);

  // Toggle individual lecture for replacement
  const handleToggleLectureSelect = (id) => {
    setSelectedLectureIdsForReplace(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Select / Deselect all lectures for replacement
  const handleSelectAllLectures = () => {
    if (selectedLectureIdsForReplace.length === entriesForReplace.length) {
      setSelectedLectureIdsForReplace([]);
    } else {
      setSelectedLectureIdsForReplace(entriesForReplace.map(e => e.id));
    }
  };

  // Open Replace Modal
  const handleOpenReplaceModal = (fac) => {
    setFacultyToReplace(fac);
    const assigned = getEntriesByFaculty(fac.id);
    setSelectedLectureIdsForReplace(assigned.map(a => a.id));
    setTargetReplacementFacultyId('');
    setReplaceSearch('');
    setShowReplaceModal(true);
  };

  // Open Remove Modal
  const handleOpenRemoveModal = (fac) => {
    setFacultyToRemove(fac);
    setRemoveWarningAcknowledged(false);
    setShowRemoveFacultyModal(true);
  };

  // Execute Replace
  const handleConfirmReplaceFaculty = () => {
    if (!facultyToReplace || !targetReplacementFacultyId) {
      alert('Please select an eligible replacement faculty member.');
      return;
    }
    if (targetReplacementFacultyId === facultyToReplace.id) {
      alert('Cannot select the same faculty member as their own replacement.');
      return;
    }
    const targetFaculty = faculties.find(f => f.id === targetReplacementFacultyId);
    if (!targetFaculty) {
      alert('Selected replacement faculty not found.');
      return;
    }

    const allEntries = getTimetableEntries();
    let replacedCount = 0;
    allEntries.forEach(e => {
      if (e.facultyId === facultyToReplace.id && selectedLectureIdsForReplace.includes(e.id)) {
        e.facultyId = targetFaculty.id;
        e.facultyName = targetFaculty.name;
        replacedCount++;
      }
    });

    localStorage.setItem('adit_timetable_entries', JSON.stringify(allEntries));
    notifyTimetableSync();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
    }
    setFaculties([...getFaculties()]);
    setShowReplaceModal(false);
    if (showToast) {
      showToast(`Successfully reassigned ${replacedCount} lecture(s) from ${facultyToReplace.name} to ${targetFaculty.name}!`);
    }
  };

  // Execute Remove
  const handleConfirmRemoveFaculty = () => {
    if (!facultyToRemove) return;
    const assigned = getEntriesByFaculty(facultyToRemove.id);
    if (assigned.length > 0 && !removeWarningAcknowledged) {
      alert('Please acknowledge that scheduled lectures will be unassigned before proceeding.');
      return;
    }

    if (assigned.length > 0) {
      deleteEntriesForFaculty(facultyToRemove.id);
    }
    deleteFaculty(facultyToRemove.id);
    notifyTimetableSync();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
    }
    setFaculties([...getFaculties()]);
    setShowRemoveFacultyModal(false);
    if (showToast) {
      showToast(`Faculty member "${facultyToRemove.name}" removed from active roster. Historical attendance preserved.`);
    }
  };

  // Export Department Dossier to Excel
  const handleExportDossier = () => {
    const headerInfo = [
      [`ADIT - Department Administration Dossier: ${currentDept.fullName || currentDept.name}`],
      [`Head of Department: ${currentDept.hod} | Cabin: ${currentDept.cabin} | Email: ${currentDept.hodEmail}`],
      [`Total Faculty: ${deptFaculties.length} | Total Enrolled Students: ${currentDept.totalStudents || 180} | Weekly Lecture Load: ${totalWeeklyHours} Hours`],
      []
    ];

    const facultyHeaders = ['Faculty Name', 'Designation', 'Official Email', 'Contact Phone', 'Subjects Handled', 'Weekly Scheduled Lectures'];
    const facultyRows = deptFaculties.map(f => [
      f.name,
      f.designation || 'Faculty',
      f.email || '',
      f.phone || '',
      f.subjects || '',
      facultyWorkloads[f.id]?.totalLectures || 0
    ]);

    const subjectHeaders = ['Subject Code', 'Subject Name', 'Short Label', 'Credits', 'Faculty In-Charge', 'Semester'];
    const subjectRows = deptSubjects.map(s => [
      s.code,
      s.name,
      s.shortName || s.name,
      s.credits || 4,
      s.faculty || 'Unassigned',
      s.sem || selectedSem
    ]);

    const wb = XLSX.utils.book_new();

    const wsFaculty = XLSX.utils.aoa_to_sheet([...headerInfo, ['FACULTY DIRECTORY & WORKLOAD'], facultyHeaders, ...facultyRows]);
    XLSX.utils.book_append_sheet(wb, wsFaculty, 'Faculty_Roster');

    const wsSubjects = XLSX.utils.aoa_to_sheet([...headerInfo, ['CURRICULUM & SUBJECTS'], subjectHeaders, ...subjectRows]);
    XLSX.utils.book_append_sheet(wb, wsSubjects, 'Subjects_Curriculum');

    XLSX.writeFile(wb, `${currentDept.code || 'Dept'}_Administration_Dossier.xlsx`);
    if (showToast) showToast('Department Dossier successfully exported to Excel!');
  };

  return (
    <div className="department-admin-panel">
      
      {/* ===================================================================
          TOP BAR: Department & Semester Selector + Actions
          =================================================================== */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}
        className="no-print"
      >
        {/* Department Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '9999px',
            border: '1px solid #cbd5e1',
            padding: '6px 18px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginRight: '8px' }}>
              Department Admin:
            </span>
            <select
              id="select-active-department"
              value={selectedDeptName}
              onChange={(e) => setSelectedDeptName(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: '800',
                fontSize: '14px',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="ALL">All Departments (College-Wide)</option>
              {departments.map((d) => (
                <option key={d.id || d.name} value={d.name}>
                  {d.name} ({d.code}){d.status === 'inactive' ? ' [Deactivated]' : ''}
                </option>
              ))}
            </select>
          </div>

          {!isAllDepts && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDeptName('ALL')}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', color: '#475569' }}
              title="Clear department filter to view complete college roster"
            >
              <X size={14} /> Clear Filter (View All)
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAddDeptModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700' }}
          >
            <Plus size={14} /> Add Department
          </button>

          {!isAllDepts && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleToggleDepartmentStatus}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: '700',
                backgroundColor: currentDept.status === 'inactive' ? '#ecfdf5' : '#fff1f2',
                color: currentDept.status === 'inactive' ? '#059669' : '#e11d48',
                border: `1px solid ${currentDept.status === 'inactive' ? '#a7f3d0' : '#fecdd3'}`
              }}
            >
              {currentDept.status === 'inactive' ? 'Reactivate Department' : 'Deactivate Department'}
            </button>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '9999px',
            border: '1px solid #cbd5e1',
            padding: '6px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginRight: '6px' }}>
              Semester:
            </span>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: '700',
                fontSize: '13.5px',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none'
              }}
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
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportDossier}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
          >
            <Download size={14} /> Export Dossier
          </button>
        </div>
      </div>

      {/* ===================================================================
          DEPARTMENT EXECUTIVE HEADER & HOD PROFILE CARD
          =================================================================== */}
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          {/* Department Branding & Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                flexShrink: 0
              }}
            >
              {renderDeptIcon(currentDept.icon)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '12px' }}>
                  {isAllDepts ? 'COLLEGE-WIDE' : currentDept.code}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  Est. {isAllDepts ? '2000' : (currentDept.established || '2020')} • ADIT Campus
                </span>
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '6px', lineHeight: 1.2 }}>
                {isAllDepts ? 'College-Wide Faculty Roster' : (currentDept.fullName || `Department of ${currentDept.name}`)}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                {isAllDepts 
                  ? 'Centralized Institutional Faculty Management • Unified Roster & Workload Across All Departments'
                  : 'Autonomous Department Administration Panel • Curriculum & Faculty Roster'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {!isAllDepts ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm no-print"
              onClick={handleOpenEditDept}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', borderRadius: '8px' }}
            >
              <Edit3 size={14} /> Edit Department Profile
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm no-print"
              onClick={() => setShowAddFacultyModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', borderRadius: '8px' }}
            >
              <UserPlus size={14} /> Add Faculty Member
            </button>
          )}
        </div>

        {/* HOD Profile Details Row */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginTop: '22px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9'
          }}
        >
          {/* HOD Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '15px'
            }}>
              {getInitials(currentDept.hod)}
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                Head of Department (HOD)
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                {currentDept.hod || 'Prof. Priya Shah'}
              </div>
            </div>
          </div>

          {/* Cabin Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={20} style={{ color: '#64748b' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                HOD Cabin / Office
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                {currentDept.cabin || 'Academic Block B, Room 201-A'}
              </div>
            </div>
          </div>

          {/* HOD Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={20} style={{ color: '#64748b' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                Departmental Email
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                {currentDept.hodEmail || 'priya.shah@adit.ac.in'}
              </div>
            </div>
          </div>

          {/* Contact Phone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={20} style={{ color: '#64748b' }} />
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                Office Contact
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                {currentDept.hodPhone || '+91 98250 11111'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          DEPARTMENT EXECUTIVE KPI METRICS
          =================================================================== */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
        className="no-print"
      >
        {/* 1. Faculty Strength */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>
              {isAllDepts ? 'Total Faculty Strength' : 'Department Faculty'}
            </span>
            <Users size={18} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {deptFaculties.length}
          </div>
          <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600' }}>
            {isAllDepts ? 'Full-time Faculty Across College' : `Teaching Faculty in ${currentDept.name}`}
          </span>
        </div>

        {/* 2. Subjects & Curriculum */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Department Subjects</span>
            <BookOpen size={18} style={{ color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {deptSubjects.length}
          </div>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
            Active Course Catalog
          </span>
        </div>

        {/* 3. Labs & Classrooms */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Labs & Classrooms</span>
            <Laptop size={18} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {(currentDept.labs || []).length + (currentDept.classrooms || []).length}
          </div>
          <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: '600' }}>
            {(currentDept.labs || []).length} Labs • {(currentDept.classrooms || []).length} Classrooms
          </span>
        </div>

        {/* 4. Weekly Scheduled Workload */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Weekly Lecture Load</span>
            <Clock size={18} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {totalWeeklyHours} Hrs
          </div>
          <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600' }}>
            Across 6 Working Days
          </span>
        </div>
      </div>

      {/* ===================================================================
          DEPARTMENT NAVIGATION TABS
          =================================================================== */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '2px',
          marginBottom: '20px',
          overflowX: 'auto'
        }}
        className="no-print"
      >
        {[
          { id: 'faculty', label: 'Faculty Roster', icon: Users, count: deptFaculties.length },
          { id: 'labs', label: 'Classrooms & Laboratories', icon: Laptop, count: (currentDept.labs || []).length },
          { id: 'subjects', label: 'Curriculum & Subjects', icon: BookOpen, count: deptSubjects.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = deptSubTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDeptSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                backgroundColor: isActive ? 'white' : 'transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span 
                  style={{
                    backgroundColor: isActive ? '#dbeafe' : '#f1f5f9',
                    color: isActive ? '#1d4ed8' : '#64748b',
                    padding: '1px 7px',
                    borderRadius: '9999px',
                    fontSize: '11.5px',
                    fontWeight: '800'
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===================================================================
          TAB 1: FACULTY ROSTER & WORKLOAD
          =================================================================== */}
      {deptSubTab === 'faculty' && (
        <div>
          {/* Header with Search & Optional Department Filter & Add Faculty */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }} className="no-print">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by name, ID, department..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    backgroundColor: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Department Filter (Optional) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={15} style={{ color: '#64748b' }} />
                <select
                  value={selectedDeptName}
                  onChange={(e) => setSelectedDeptName(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#0f172a',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  title="Filter unified faculty roster by department"
                >
                  <option value="ALL">All Departments (College-Wide)</option>
                  {departments.map((d) => (
                    <option key={d.id || d.name} value={d.name}>
                      {d.name} ({d.code}){d.status === 'inactive' ? ' [Deactivated]' : ''}
                    </option>
                  ))}
                </select>

                {!isAllDepts && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedDeptName('ALL')}
                    style={{ fontSize: '12px', padding: '6px 10px', color: '#475569', fontWeight: '700' }}
                    title="Clear filter and show all departments"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddFacultyModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={15} /> Add Faculty Member
            </button>
          </div>

          {/* Faculty Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Faculty Member</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Official Email & Contact</th>
                    <th>Subjects Taught</th>
                    <th style={{ textAlign: 'center' }}>Weekly Load</th>
                    <th style={{ textAlign: 'center' }}>Active Days</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptFaculties.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No faculty found for this search or department filter. Click "Add Faculty Member" to register faculty.
                      </td>
                    </tr>
                  ) : (
                    deptFaculties.map((fac) => {
                      const load = facultyWorkloads[fac.id] || { totalLectures: 0, activeDays: 0 };
                      const isHOD = fac.name === currentDept.hod;

                      return (
                        <tr key={fac.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                backgroundColor: isHOD ? '#fef3c7' : '#eff6ff',
                                color: isHOD ? '#b45309' : '#1d4ed8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '800',
                                fontSize: '13px'
                              }}>
                                {getInitials(fac.name)}
                              </div>
                              <div>
                                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {fac.name}
                                  {isHOD && (
                                    <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '10px', padding: '1px 5px' }}>
                                      HOD
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                                  <span style={{ fontWeight: '700' }}>{fac.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: '700',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Building2 size={12} />
                              {fac.dept || 'General Category'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                              {fac.designation || 'Assistant Professor'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '12.5px', color: '#1e293b' }}>{fac.email || '—'}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748b' }}>{fac.phone || '—'}</div>
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: '700' }}>
                              {fac.subjects || 'General Curriculum'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span 
                              className="badge" 
                              style={{ 
                                backgroundColor: load.totalLectures > 0 ? '#ecfdf5' : '#f8fafc', 
                                color: load.totalLectures > 0 ? '#059669' : '#94a3b8',
                                fontWeight: '800',
                                fontSize: '12.5px'
                              }}
                            >
                              {load.totalLectures} Lectures/wk
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: '#475569' }}>
                            {load.activeDays} Days
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                title="Edit Faculty Profile & Home Department"
                                onClick={() => handleOpenEditFaculty(fac)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  color: '#0f172a',
                                  backgroundColor: '#f1f5f9',
                                  border: '1px solid #cbd5e1'
                                }}
                              >
                                <Edit3 size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                title="Replace Faculty Assignment"
                                onClick={() => handleOpenReplaceModal(fac)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  color: '#2563eb',
                                  backgroundColor: '#eff6ff',
                                  border: '1px solid #bfdbfe'
                                }}
                              >
                                <ArrowRightLeft size={13} />
                                <span>Replace</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                title="Remove Faculty Member"
                                onClick={() => handleOpenRemoveModal(fac)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  color: '#e11d48',
                                  backgroundColor: '#fff1f2',
                                  border: '1px solid #fecdd3'
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Remove</span>
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
        </div>
      )}

      {/* ===================================================================
          TAB 3: LABORATORIES & CLASSROOMS
          =================================================================== */}
      {deptSubTab === 'labs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Labs Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  Specialized Department Laboratories
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Hardware & software testing facilities assigned to {currentDept.name}.
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm no-print"
                onClick={() => setShowAddLabModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add Laboratory
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {(currentDept.labs || []).map((lab, i) => (
                <div key={i} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Laptop size={18} />
                    </div>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '800' }}>
                      {lab.pcs || 30} Workstations
                    </span>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '12px' }}>
                    {lab.name}
                  </h4>
                  <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: '700', marginTop: '2px' }}>
                    {lab.room} • Code: {lab.code || 'LAB'}
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12.5px', color: '#64748b' }}>
                    Lab In-Charge: <strong>{lab.inCharge || 'Faculty In-Charge'}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Classrooms Section */}
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
              Allocated Lecture Classrooms
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {(currentDept.classrooms || ['Room 201', 'Room 202', 'Room 203', 'Room 204', 'Room 205', 'Seminar Hall 301']).map((room, i) => (
                <div 
                  key={i} 
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Building2 size={18} style={{ color: '#64748b' }} />
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{room}</strong>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Ready / Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 4: CURRICULUM & SUBJECTS
          =================================================================== */}
      {deptSubTab === 'subjects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }} className="no-print">
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                Course Subjects Catalog - {currentDept.name}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Semester: {selectedSem} • Credits & syllabus definitions
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddSubjectModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> Add Department Subject
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Short Code</th>
                    <th>Credits</th>
                    <th>Faculty In-Charge</th>
                    <th>Semester</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No subjects configured for {currentDept.name}. Click "Add Department Subject" to define course syllabus.
                      </td>
                    </tr>
                  ) : (
                    deptSubjects.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: '800', color: '#1e3a8a' }}>{s.code}</td>
                        <td style={{ fontWeight: '700' }}>{s.name}</td>
                        <td>
                          <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                            {s.shortName || s.name.slice(0, 8)}
                          </span>
                        </td>
                        <td>{s.credits || 4} Credits</td>
                        <td>{s.faculty || 'Assigned per Division'}</td>
                        <td>{s.sem || selectedSem}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              if (window.confirm(`Delete subject ${s.name}?`)) {
                                const updated = deleteSubject(s.id);
                                setSubjects([...updated]);
                                if (showToast) showToast('Subject removed.');
                              }
                            }}
                            style={{ color: '#e11d48', padding: '4px 8px' }}
                          >
                            <Trash2 size={13} />
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


      {/* ===================================================================
          MODAL 1: EDIT DEPARTMENT PROFILE
          =================================================================== */}
      {showEditDeptModal && deptEditForm && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <Building2 size={20} />
                Edit Department Profile
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEditDeptModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveDeptEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={deptEditForm.code}
                      onChange={(e) => setDeptEditForm({ ...deptEditForm, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Short Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={deptEditForm.name}
                      onChange={(e) => setDeptEditForm({ ...deptEditForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Department Full Formal Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={deptEditForm.fullName}
                    onChange={(e) => setDeptEditForm({ ...deptEditForm, fullName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Head of Department (HOD) *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={deptEditForm.hod}
                      onChange={(e) => setDeptEditForm({ ...deptEditForm, hod: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>HOD Cabin / Room</label>
                    <input
                      type="text"
                      className="form-control"
                      value={deptEditForm.cabin}
                      onChange={(e) => setDeptEditForm({ ...deptEditForm, cabin: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Department Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={deptEditForm.hodEmail}
                      onChange={(e) => setDeptEditForm({ ...deptEditForm, hodEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Contact Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={deptEditForm.hodPhone}
                      onChange={(e) => setDeptEditForm({ ...deptEditForm, hodPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditDeptModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Save Department Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: ADD FACULTY MEMBER
          =================================================================== */}
      {showAddFacultyModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <UserPlus size={18} />
                Add Faculty to {isAllDepts ? 'College Roster' : currentDept.name}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddFacultyModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFaculty}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Faculty Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Prof. Priya Shah"
                      value={facultyForm.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const prevSuggested = typeof generateSuggestedFacultyId === 'function' ? generateSuggestedFacultyId(facultyForm.name) : '';
                        const shouldAutoUpdateId = !facultyForm.id || facultyForm.id === prevSuggested;
                        setFacultyForm({
                          ...facultyForm,
                          name: val,
                          id: shouldAutoUpdateId && typeof generateSuggestedFacultyId === 'function' ? generateSuggestedFacultyId(val) : (facultyForm.id || '')
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Faculty ID / Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. FAC_PS, FAC_PB"
                      value={facultyForm.id || ''}
                      onChange={(e) => setFacultyForm({ ...facultyForm, id: e.target.value.trim().toUpperCase() })}
                      required
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Links timetable slots across devices.
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Home Department / Category *</label>
                  <select
                    className="form-control"
                    value={facultyForm.dept || currentDept.name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, dept: e.target.value })}
                    required
                  >
                    {departments.map(d => (
                      <option key={d.id || d.name} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                    Organizational category. Faculty can be assigned to teach classes across all departments.
                  </span>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Designation</label>
                  <select
                    className="form-control"
                    value={facultyForm.designation}
                    onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                  >
                    <option value="Professor & HOD">Professor & HOD</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Visiting Faculty">Visiting Faculty</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Official Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. faculty@adit.ac.in"
                      value={facultyForm.email}
                      onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Contact Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 9825012345"
                      value={facultyForm.phone}
                      onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Subjects Handled</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. DBMS, Data Structures, Python"
                    value={facultyForm.subjects}
                    onChange={(e) => setFacultyForm({ ...facultyForm, subjects: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddFacultyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Register Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 3: ADD DEPARTMENT SUBJECT
          =================================================================== */}
      {showAddSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <BookOpen size={18} />
                Add Subject to {currentDept.name}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddSubjectModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubject}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
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
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Short Label</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. DBMS"
                      value={subjectForm.shortName}
                      onChange={(e) => setSubjectForm({ ...subjectForm, shortName: e.target.value })}
                    />
                  </div>
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
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Credits</label>
                    <input
                      type="number"
                      className="form-control"
                      value={subjectForm.credits}
                      onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 4 })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Faculty In-Charge</label>
                    <select
                      className="form-control"
                      value={subjectForm.faculty}
                      onChange={(e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })}
                    >
                      <option value="">-- Choose Faculty --</option>
                      {deptFaculties.map(f => (
                        <option key={f.id} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSubjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4: ADD LABORATORY
          =================================================================== */}
      {showAddLabModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <Laptop size={18} />
                Add Laboratory to {currentDept.name}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddLabModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddLab}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Laboratory Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. AI & Robotics Lab"
                    value={labForm.name}
                    onChange={(e) => setLabForm({ ...labForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Room / Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Lab 304"
                      value={labForm.room}
                      onChange={(e) => setLabForm({ ...labForm, room: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Workstation / PC Count</label>
                    <input
                      type="number"
                      className="form-control"
                      value={labForm.pcs}
                      onChange={(e) => setLabForm({ ...labForm, pcs: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Lab In-Charge Faculty</label>
                  <select
                    className="form-control"
                    value={labForm.inCharge}
                    onChange={(e) => setLabForm({ ...labForm, inCharge: e.target.value })}
                  >
                    <option value="">-- Choose Faculty --</option>
                    {deptFaculties.map(f => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddLabModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Save Laboratory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 5: REPLACE FACULTY ASSIGNMENT
          =================================================================== */}
      {showReplaceModal && facultyToReplace && (() => {
        const activeLectures = entriesForReplace;
        const eligibleFaculties = faculties.filter(f => {
          if (f.id === facultyToReplace.id) return false;
          if (!replaceSearch.trim()) return true;
          const q = replaceSearch.toLowerCase();
          return (f.name && f.name.toLowerCase().includes(q)) ||
                 (f.dept && f.dept.toLowerCase().includes(q)) ||
                 (f.id && f.id.toLowerCase().includes(q));
        });
        const targetFaculty = faculties.find(f => f.id === targetReplacementFacultyId);
        const selectedLectures = activeLectures.filter(l => selectedLectureIdsForReplace.includes(l.id));
        const affectedSubjects = Array.from(new Set(selectedLectures.map(l => l.subjectName || l.subjectCode))).filter(Boolean);
        const affectedClasses = Array.from(new Set(selectedLectures.map(l => l.division || l.className))).filter(Boolean);

        return (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontSize: '18px' }}>
                  <ArrowRightLeft size={20} style={{ color: '#2563eb' }} />
                  Replace Faculty Assignment
                </h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowReplaceModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Current Faculty Card */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Currently Selected Faculty
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                        {facultyToReplace.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        ID: <strong>{facultyToReplace.id}</strong> • {facultyToReplace.designation || 'Assistant Professor'} • {facultyToReplace.dept || currentDept.name}
                      </div>
                    </div>
                    <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '700' }}>
                      {activeLectures.length} Total Lectures
                    </span>
                  </div>
                </div>

                {/* Replacement Faculty Selection */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Select Replacement Faculty *
                  </label>
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search eligible faculty by name, department, or ID..."
                      value={replaceSearch}
                      onChange={(e) => setReplaceSearch(e.target.value)}
                      style={{ paddingLeft: '32px', height: '36px', fontSize: '12.5px' }}
                    />
                  </div>

                  <select
                    className="form-control"
                    value={targetReplacementFacultyId}
                    onChange={(e) => setTargetReplacementFacultyId(e.target.value)}
                    style={{ fontWeight: '700', fontSize: '13px' }}
                    required
                  >
                    <option value="">-- Choose Replacement Faculty Member --</option>
                    {eligibleFaculties.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.id} • {f.dept || 'Engineering'} • {f.designation || 'Faculty'})
                      </option>
                    ))}
                  </select>
                  {eligibleFaculties.length === 0 && (
                    <div style={{ fontSize: '11.5px', color: '#e11d48', marginTop: '4px' }}>
                      No eligible replacement faculty found matching "{replaceSearch}".
                    </div>
                  )}
                </div>

                {/* Select Lectures to Replace */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                        Select Scheduled Lectures to Transfer
                      </label>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        Choose individual lectures or transfer all scheduled lectures.
                      </div>
                    </div>

                    {activeLectures.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllLectures}
                        style={{
                          fontSize: '11.5px',
                          color: '#2563eb',
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {selectedLectureIdsForReplace.length === activeLectures.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>

                  {activeLectures.length === 0 ? (
                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', fontSize: '12.5px', color: '#64748b' }}>
                      This faculty member currently has no scheduled timetable assignments.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      {activeLectures.map((lec) => {
                        const isChecked = selectedLectureIdsForReplace.includes(lec.id);
                        return (
                          <div
                            key={lec.id}
                            onClick={() => handleToggleLectureSelect(lec.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderBottom: '1px solid #f1f5f9',
                              backgroundColor: isChecked ? '#eff6ff' : 'white',
                              cursor: 'pointer',
                              transition: 'background-color 0.1s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleLectureSelect(lec.id)}
                                onClick={(e) => e.stopPropagation()}
                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                              />
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                                  {lec.subjectName || lec.subjectCode}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                  {lec.day} • {lec.timeSlot} • {lec.division || 'Div'} • {lec.room || 'Room'}
                                </div>
                              </div>
                            </div>
                            <span className="badge" style={{ backgroundColor: isChecked ? '#dbeafe' : '#f1f5f9', color: isChecked ? '#1d4ed8' : '#64748b', fontSize: '11px', fontWeight: '700' }}>
                              {lec.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confirmation Summary Card */}
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} />
                    Transfer Confirmation Summary
                  </div>
                  <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                    <div>
                      <span style={{ color: '#78350f', fontWeight: '600' }}>Previous Faculty:</span>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>{facultyToReplace.name}</div>
                    </div>
                    <div>
                      <span style={{ color: '#78350f', fontWeight: '600' }}>New Faculty:</span>
                      <div style={{ fontWeight: '800', color: targetFaculty ? targetFaculty.name : '#e11d48' }}>
                        {targetFaculty ? targetFaculty.name : '— Select faculty above —'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#78350f', fontWeight: '600' }}>Lectures Transferring:</span>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>
                        {selectedLectureIdsForReplace.length} of {activeLectures.length} selected
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#78350f', fontWeight: '600' }}>Affected Classes & Subjects:</span>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>
                        {affectedClasses.join(', ') || 'None'} {affectedSubjects.length > 0 ? `(${affectedSubjects.join(', ')})` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#92400e', fontStyle: 'italic' }}>
                    Historical attendance sessions and student records will remain preserved and unaffected.
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReplaceModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmReplaceFaculty}
                  disabled={!targetReplacementFacultyId || selectedLectureIdsForReplace.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm & Replace Assignments</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===================================================================
          MODAL 6: REMOVE FACULTY MEMBER
          =================================================================== */}
      {showRemoveFacultyModal && facultyToRemove && (() => {
        const activeLectures = entriesForRemove;
        const hasActiveLectures = activeLectures.length > 0;

        return (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '540px' }}>
              <div className="modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontSize: '18px' }}>
                  <AlertTriangle size={20} />
                  Remove Faculty Member
                </h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowRemoveFacultyModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Faculty Details */}
                <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#9f1239', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Faculty Member to be Removed
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                    {facultyToRemove.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    ID: <strong>{facultyToRemove.id}</strong> • {facultyToRemove.designation || 'Faculty'} • {facultyToRemove.dept || currentDept.name}
                  </div>
                </div>

                {/* Active Assignments Check */}
                {hasActiveLectures ? (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: '800', fontSize: '13.5px' }}>
                      <AlertTriangle size={18} />
                      Active Timetable Assignments Warning
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#991b1b', marginTop: '6px', lineHeight: 1.5 }}>
                      This faculty member currently has <strong>{activeLectures.length} active scheduled lecture(s)</strong> across the academic timetable. Removing this faculty member will unassign all their lecture slots.
                    </p>

                    <div style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '10px', border: '1px solid #fecaca', borderRadius: '6px', backgroundColor: 'white' }}>
                      {activeLectures.map(lec => (
                        <div key={lec.id} style={{ padding: '6px 10px', borderBottom: '1px solid #fef2f2', fontSize: '11.5px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>{lec.subjectName || lec.subjectCode} ({lec.division || 'Class'})</span>
                          <span style={{ color: '#64748b' }}>{lec.day} • {lec.timeSlot}</span>
                        </div>
                      ))}
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '14px', cursor: 'pointer', fontSize: '12.5px', fontWeight: '700', color: '#7f1d1d' }}>
                      <input
                        type="checkbox"
                        checked={removeWarningAcknowledged}
                        onChange={(e) => setRemoveWarningAcknowledged(e.target.checked)}
                        style={{ marginTop: '2px', width: '16px', height: '16px' }}
                      />
                      <span>I understand and acknowledge that {activeLectures.length} scheduled lecture(s) will be unassigned from the timetable.</span>
                    </label>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', fontSize: '12.5px', color: '#166534' }}>
                    <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                    This faculty member has <strong>0 active timetable assignments</strong>. They can be safely removed.
                  </div>
                )}

                {/* Historical Data Notice */}
                <div style={{ fontSize: '12px', color: '#64748b', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong>Data Preservation Guarantee:</strong> Student records, class definitions, and all historical attendance sessions previously recorded by {facultyToRemove.name} will remain permanently preserved in the system.
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRemoveFacultyModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmRemoveFaculty}
                  disabled={hasActiveLectures && !removeWarningAcknowledged}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={16} />
                  <span>Confirm & Remove Faculty</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}


      {/* ===================================================================
          MODAL: EDIT FACULTY MEMBER & HOME DEPARTMENT
          =================================================================== */}
      {showEditFacultyModal && editingFacultyForm && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <Edit3 size={18} />
                Edit Faculty: {editingFacultyForm.name}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEditFacultyModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveFacultyEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Faculty Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingFacultyForm.name}
                    onChange={(e) => setEditingFacultyForm({ ...editingFacultyForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Faculty ID / Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingFacultyForm.id || ''}
                    onChange={(e) => setEditingFacultyForm({ ...editingFacultyForm, id: e.target.value.trim().toUpperCase() })}
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                    Canonical faculty identifier. Editing this updates all linked timetable slots automatically.
                  </span>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Home Department / Category *</label>
                  <select
                    className="form-control"
                    value={editingFacultyForm.dept}
                    onChange={(e) => setEditingFacultyForm({ ...editingFacultyForm, dept: e.target.value })}
                    required
                  >
                    {departments.map(d => (
                      <option key={d.id || d.name} value={d.name}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                    Identifies home department. Faculty can be assigned to teach classes in any department.
                  </span>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Designation</label>
                  <select
                    className="form-control"
                    value={editingFacultyForm.designation}
                    onChange={(e) => setEditingFacultyForm({ ...editingFacultyForm, designation: e.target.value })}
                  >
                    <option value="Professor & HOD">Professor & HOD</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Visiting Faculty">Visiting Faculty</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Official Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editingFacultyForm.email}
                      onChange={(e) => setEditingFacultyForm({ ...editingFacultyForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Contact Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingFacultyForm.phone}
                      onChange={(e) => setEditingFacultyForm({ ...editingFacultyForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Subjects Handled</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingFacultyForm.subjects}
                    onChange={(e) => setEditingFacultyForm({ ...editingFacultyForm, subjects: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditFacultyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Save Faculty Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: ADD NEW ACADEMIC DEPARTMENT
          =================================================================== */}
      {showAddDeptModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <Building2 size={18} />
                Create New Academic Department
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddDeptModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveNewDepartment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ME, EE, IT"
                      value={newDeptForm.code}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Department Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Mechanical Engineering"
                      value={newDeptForm.name}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>HOD Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Prof. R. K. Patel"
                    value={newDeptForm.hod}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, hod: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>HOD Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="hod@adit.ac.in"
                      value={newDeptForm.hodEmail}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, hodEmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Contact Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+91 98250 11111"
                      value={newDeptForm.hodPhone}
                      onChange={(e) => setNewDeptForm({ ...newDeptForm, hodPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDeptModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} /> Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
