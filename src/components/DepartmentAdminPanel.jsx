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
  ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  getDepartments, 
  saveDepartment, 
  getFaculties, 
  saveFaculty, 
  getSubjects, 
  saveSubject, 
  deleteSubject 
} from '../services/attendanceStorage';
import {
  getAllFacultyTimetables, 
  TIME_SLOTS, 
  TIMETABLE_DAYS, 
  getSubjectColor,
  calculateTimetableSummary,
  updateSubjectInEntries,
  notifyTimetableSync
} from '../services/timetableStorage';

export default function DepartmentAdminPanel({
  onOpenFacultyTimetable,
  showToast
}) {
  // Master data
  const [departments, setDepartments] = useState(getDepartments());
  const [faculties, setFaculties] = useState(getFaculties());
  const [subjects, setSubjects] = useState(getSubjects());

  // Selected Department & Semester
  const [selectedDeptName, setSelectedDeptName] = useState('AI & Data Science');
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

  // Forms
  const [deptEditForm, setDeptEditForm] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
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

  // Current Active Department Object
  const currentDept = useMemo(() => {
    return departments.find(d => d.name === selectedDeptName) || departments[0] || {
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
  }, [departments, selectedDeptName]);

  // Faculties belonging to this department
  const deptFaculties = useMemo(() => {
    return faculties.filter(f => {
      const matchDept = !f.dept || f.dept.toLowerCase().includes(currentDept.name.toLowerCase().slice(0, 4));
      const q = facultySearch.toLowerCase().trim();
      const matchQuery = !q || 
        f.name.toLowerCase().includes(q) || 
        (f.subjects && f.subjects.toLowerCase().includes(q)) ||
        (f.designation && f.designation.toLowerCase().includes(q));
      return matchDept && matchQuery;
    });
  }, [faculties, currentDept, facultySearch]);

  // Subjects belonging to this department
  const deptSubjects = useMemo(() => {
    return subjects.filter(s => {
      return !s.dept || s.dept.toLowerCase().includes(currentDept.name.toLowerCase().slice(0, 4));
    });
  }, [subjects, currentDept]);

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
    const newFac = {
      ...facultyForm,
      dept: currentDept.name
    };
    const updated = saveFaculty(newFac);
    notifyTimetableSync();
    setFaculties([...updated]);
    setShowAddFacultyModal(false);
    setFacultyForm({ name: '', designation: 'Assistant Professor', email: '', phone: '', subjects: '' });
    if (showToast) showToast(`${facultyForm.name} added to ${currentDept.name}!`);
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
              {departments.map((d) => (
                <option key={d.id || d.name} value={d.name}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

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

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (onOpenFacultyTimetable) onOpenFacultyTimetable();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
          >
            <Calendar size={14} /> Open Class Timetables
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
                  {currentDept.code}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  Est. {currentDept.established || '2020'} • ADIT Campus
                </span>
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '6px', lineHeight: 1.2 }}>
                {currentDept.fullName || `Department of ${currentDept.name}`}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Autonomous Department Administration Panel • Curriculum, Faculty Workload & Division Matrix
              </p>
            </div>
          </div>

          {/* Edit Department Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm no-print"
            onClick={handleOpenEditDept}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', borderRadius: '8px' }}
          >
            <Edit3 size={14} /> Edit Department Profile
          </button>
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
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Faculty Strength</span>
            <Users size={18} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {deptFaculties.length}
          </div>
          <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600' }}>
            Full-time Teaching Faculty
          </span>
        </div>

        {/* 2. Divisions & Batches */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Active Divisions</span>
            <Layers size={18} style={{ color: '#7c3aed' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {(currentDept.divisions || []).length || 3}
          </div>
          <span style={{ fontSize: '11.5px', color: '#7c3aed', fontWeight: '600' }}>
            Div 1, Div 2, Div 3
          </span>
        </div>

        {/* 3. Subjects & Curriculum */}
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

        {/* 4. Labs & Classrooms */}
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

        {/* 5. Weekly Scheduled Workload */}
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
          { id: 'faculty', label: 'Faculty Roster & Workload', icon: Users, count: deptFaculties.length },
          { id: 'divisions', label: 'Divisions & Batches', icon: Layers, count: (currentDept.divisions || []).length || 3 },
          { id: 'labs', label: 'Classrooms & Laboratories', icon: Laptop, count: (currentDept.labs || []).length },
          { id: 'subjects', label: 'Curriculum & Subjects', icon: BookOpen, count: deptSubjects.length },
          { id: 'master-timetable', label: 'Department Master Timetable', icon: Calendar }
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
          {/* Header with Search & Add Faculty */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }} className="no-print">
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search faculty in this department..."
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
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No faculty found for this search or department. Click "Add Faculty Member" to register faculty.
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
                                <div style={{ fontSize: '11.5px', color: '#64748b' }}>{fac.id}</div>
                              </div>
                            </div>
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
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                if (onOpenFacultyTimetable) onOpenFacultyTimetable(fac.id);
                              }}
                              style={{ padding: '4px 10px', fontSize: '12px', fontWeight: '700', color: '#2563eb' }}
                            >
                              <Calendar size={13} style={{ marginRight: '4px' }} /> Timetable
                            </button>
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
          TAB 2: DIVISIONS & BATCHES
          =================================================================== */}
      {deptSubTab === 'divisions' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {(currentDept.divisions || [
              { id: '1', name: 'Div 1', counselor: 'Prof. Priya Shah', cr: 'Aarav Patel', studentCount: 60 },
              { id: '2', name: 'Div 2', counselor: 'Prof. Rahul Patel', cr: 'Ananya Sharma', studentCount: 60 },
              { id: '3', name: 'Div 3', counselor: 'Prof. A. Kumar', cr: 'Devansh Verma', studentCount: 60 }
            ]).map((div) => (
              <div 
                key={div.id}
                className="card"
                style={{
                  padding: '24px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800'
                    }}>
                      {div.id}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                        Division {div.id} ({div.name})
                      </h3>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {selectedSem} • {currentDept.code}
                      </span>
                    </div>
                  </div>

                  <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '800' }}>
                    {div.studentCount || 60} Students
                  </span>
                </div>

                <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Class Counselor:</span>
                    <strong style={{ color: '#0f172a' }}>{div.counselor || 'Assigned Faculty'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Class Representative (CR):</span>
                    <strong style={{ color: '#0f172a' }}>{div.cr || 'Student CR'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Designated Classroom:</span>
                    <strong style={{ color: '#2563eb' }}>Room 20{div.id}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (onOpenFacultyTimetable) onOpenFacultyTimetable();
                  }}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: '700'
                  }}
                >
                  <Calendar size={14} /> View Division Schedule
                </button>
              </div>
            ))}
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
          TAB 5: DEPARTMENT MASTER TIMETABLE
          =================================================================== */}
      {deptSubTab === 'master-timetable' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Department Master Timetable Matrix - {currentDept.name}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Consolidated weekly view across all classrooms & laboratories.
              </span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} /> Print Master Matrix
            </button>
          </div>

          <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 14px', width: '110px', textAlign: 'left', fontWeight: '700' }}>Time Slot</th>
                  {TIMETABLE_DAYS.map(day => (
                    <th key={day} style={{ padding: '10px 8px', fontWeight: '700' }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(slotTime => {
                  if (slotTime === '12:40 - 1:25') {
                    return (
                      <tr key={slotTime} style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 14px', textAlign: 'left', fontWeight: '700', color: '#64748b' }}>{slotTime}</td>
                        <td colSpan={6} style={{ padding: '8px', letterSpacing: '0.1em', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', backgroundColor: '#e2e8f0' }}>
                          LUNCH BREAK
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={slotTime} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#475569', backgroundColor: '#fafbfc', whiteSpace: 'nowrap' }}>
                        {slotTime}
                      </td>
                      {TIMETABLE_DAYS.map(day => (
                        <td key={day} style={{ padding: '6px', borderRight: '1px solid #f1f5f9' }}>
                          <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '11px', display: 'inline-block' }}>
                            {currentDept.code} • Scheduled
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                Add Faculty to {currentDept.name}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddFacultyModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFaculty}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Faculty Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Prof. Priya Shah"
                    value={facultyForm.name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                    required
                  />
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

    </div>
  );
}
