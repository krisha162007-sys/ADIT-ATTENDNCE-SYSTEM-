import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Users, 
  UserCheck, 
  Layers, 
  Plus, 
  ChevronRight, 
  Check, 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  FileSpreadsheet, 
  UploadCloud, 
  Search, 
  Save, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  UserPlus,
  BookPlus
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
  getAllocationForSubject, 
  saveSubjectAllocation,
  getStudents, 
  saveStudent, 
  deleteStudent, 
  assignStudentDivision, 
  bulkImportStudents,
  resetToDefault
} from '../services/attendanceStorage';

export default function AdminPanel({ showToast }) {
  // Stepper State: 1 = Semester, 2 = Department, 3 = Subjects, 4 = Divisions & Faculty, 5 = Students in Division
  const [currentStep, setCurrentStep] = useState(1);

  // Selections
  const [selectedSem, setSelectedSem] = useState('3rd Sem');
  const [selectedDept, setSelectedDept] = useState('Computer Engineering');
  const [selectedSubjectId, setSelectedSubjectId] = useState('SUB_DS');
  const [selectedDivision, setSelectedDivision] = useState('3'); // '1', '2', or '3'

  // Data states
  const [departments, setDepartments] = useState(getDepartments());
  const [subjects, setSubjects] = useState(getSubjects());
  const [faculties, setFaculties] = useState(getFaculties());
  const [students, setStudents] = useState(getStudents());
  const [allocations, setAllocations] = useState(getAllocations());

  // Search & Filter
  const [studentSearch, setStudentSearch] = useState('');

  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: '', code: '', name: '', credits: 4, sem: '3rd Sem', dept: 'Computer Engineering' });

  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ id: '', name: '', dept: 'Computer Engineering', designation: 'Assistant Professor', email: '', phone: '' });

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentForm, setStudentForm] = useState({ id: '', rollNo: '', name: '', enrollmentNo: '', class: '1', dept: 'Computer', sem: '3rd Sem' });

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ id: '', code: '', name: '' });

  // Get active subject object
  const activeSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || subjects[0] || {
      id: 'SUB_DS',
      code: '102040304',
      name: 'DATA STRUCTURES',
      dept: 'Computer Engineering',
      sem: '3rd Sem'
    };
  }, [subjects, selectedSubjectId]);

  // Current Subject Allocation
  const activeAllocation = useMemo(() => {
    return allocations[activeSubject.id] || getAllocationForSubject(activeSubject.id);
  }, [allocations, activeSubject.id]);

  // Filtered Subjects for active Semester & Department
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchSem = !s.sem || s.sem === selectedSem || s.sem.toLowerCase().includes(selectedSem.toLowerCase().slice(0, 3));
      const matchDept = !s.dept || s.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4));
      return matchSem && matchDept;
    });
  }, [subjects, selectedSem, selectedDept]);

  // Filtered Students for active Semester, Department & Division
  const divisionStudents = useMemo(() => {
    return students.filter(st => {
      const matchDiv = String(st.class) === String(selectedDivision);
      const query = studentSearch.trim().toLowerCase();
      const matchQuery = !query || 
        (st.name && st.name.toLowerCase().includes(query)) ||
        (st.enrollmentNo && st.enrollmentNo.toLowerCase().includes(query)) ||
        (st.rollNo && st.rollNo.toString().includes(query));
      return matchDiv && matchQuery;
    });
  }, [students, selectedDivision, studentSearch]);

  // Total students in a division helper
  const getDivisionCount = (divId) => {
    return students.filter(st => String(st.class) === String(divId)).length;
  };

  // Step 4: Division count change (1, 2, or max 3 divisions)
  const handleDivisionCountChange = (count) => {
    const validCount = Math.min(3, Math.max(1, count));
    const currentDivs = activeAllocation.divisions || [];
    const newDivs = [];

    for (let i = 1; i <= validCount; i++) {
      const divId = String(i);
      const existing = currentDivs.find(d => d.id === divId);
      if (existing) {
        newDivs.push(existing);
      } else {
        const defaultFaculty = faculties[(i - 1) % faculties.length] || faculties[0];
        newDivs.push({
          id: divId,
          name: `Div ${divId}`,
          facultyId: defaultFaculty?.id || 'FAC01',
          facultyName: defaultFaculty?.name || 'Faculty Member'
        });
      }
    }

    const updated = saveSubjectAllocation(activeSubject.id, {
      ...activeAllocation,
      divisionCount: validCount,
      divisions: newDivs
    });

    setAllocations(getAllocations());
    if (showToast) showToast(`Configured ${validCount} Division(s) for ${activeSubject.code}`);
  };

  // Step 4: Assign Faculty to a Division
  const handleFacultyAssign = (divisionId, facultyId) => {
    const fac = faculties.find(f => f.id === facultyId);
    const updatedDivs = (activeAllocation.divisions || []).map(d => {
      if (d.id === divisionId) {
        return {
          ...d,
          facultyId: fac?.id || facultyId,
          facultyName: fac?.name || 'Faculty Member'
        };
      }
      return d;
    });

    saveSubjectAllocation(activeSubject.id, {
      ...activeAllocation,
      divisions: updatedDivs
    });

    setAllocations(getAllocations());
    if (showToast) showToast(`Assigned ${fac?.name || 'Faculty'} to Division ${divisionId}`);
  };

  // Move Student to another Division
  const handleMoveStudentDivision = (studentId, newDiv) => {
    const updated = assignStudentDivision(studentId, newDiv);
    setStudents([...updated]);
    if (showToast) showToast(`Student moved to Division ${newDiv}!`);
  };

  // Add / Save Student
  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!studentForm.rollNo || !studentForm.name || !studentForm.enrollmentNo) {
      alert('Please fill out Roll No, Student Name, and Enrollment No!');
      return;
    }
    const studentToSave = {
      ...studentForm,
      class: String(selectedDivision),
      sem: selectedSem,
      dept: selectedDept
    };
    const updated = saveStudent(studentToSave);
    setStudents([...updated]);
    setShowStudentModal(false);
    setStudentForm({ id: '', rollNo: '', name: '', enrollmentNo: '', class: selectedDivision, dept: selectedDept, sem: selectedSem });
    if (showToast) showToast('Student saved to Division ' + selectedDivision);
  };

  // Delete Student
  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      const updated = deleteStudent(id);
      setStudents([...updated]);
      if (showToast) showToast('Student removed from database.');
    }
  };

  // Add / Save Subject
  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name) {
      alert('Please enter Subject Code and Name!');
      return;
    }
    const subjectToSave = {
      ...subjectForm,
      sem: selectedSem,
      dept: selectedDept
    };
    const updated = saveSubject(subjectToSave);
    setSubjects([...updated]);
    setShowSubjectModal(false);
    setSubjectForm({ id: '', code: '', name: '', credits: 4, sem: selectedSem, dept: selectedDept });
    if (showToast) showToast('Subject saved to ' + selectedDept);
  };

  // Delete Subject
  const handleDeleteSubject = (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      const updated = deleteSubject(id);
      setSubjects([...updated]);
      if (showToast) showToast('Subject deleted.');
    }
  };

  // Add / Save Faculty
  const handleSaveFaculty = (e) => {
    e.preventDefault();
    if (!facultyForm.name) {
      alert('Please enter Faculty Name!');
      return;
    }
    const updated = saveFaculty(facultyForm);
    setFaculties([...updated]);
    setShowFacultyModal(false);
    setFacultyForm({ id: '', name: '', dept: selectedDept, designation: 'Assistant Professor', email: '', phone: '' });
    if (showToast) showToast('Faculty member added to system!');
  };

  // Excel / CSV File Import for Division Roster
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Find headers or take rows
        const parsedStudents = [];
        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (row && row.length >= 2) {
            parsedStudents.push({
              rollNo: String(row[0] || i),
              name: String(row[1] || `Student ${i}`),
              enrollmentNo: String(row[2] || `1250204050${1000 + i}`),
            });
          }
        }

        if (parsedStudents.length === 0) {
          alert('No student records detected in file. Expected columns: Roll No, Name, Enrollment No');
          return;
        }

        const updated = bulkImportStudents(parsedStudents, selectedSem, selectedDept, selectedDivision);
        setStudents([...updated]);
        if (showToast) showToast(`Successfully imported ${parsedStudents.length} students into Division ${selectedDivision}!`);
      } catch (err) {
        alert('Error parsing file: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  // Export Division Roster (.xlsx)
  const handleExportRoster = () => {
    const headerRow = [`${activeSubject.name} - Division ${selectedDivision} Student Roster`];
    const subHeader = [`Semester: ${selectedSem}`, `Department: ${selectedDept}`, `Total Students: ${divisionStudents.length}`];
    const tableHeader = ['Roll No', 'Student Name', 'Enrollment No', 'Department', 'Semester', 'Division'];

    const dataRows = divisionStudents.map(st => [
      st.rollNo,
      st.name,
      st.enrollmentNo,
      st.dept,
      st.sem,
      `Div ${st.class}`
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headerRow, subHeader, [], tableHeader, ...dataRows]);
    XLSX.utils.book_append_sheet(wb, ws, `Div_${selectedDivision}_Roster`);
    XLSX.writeFile(wb, `${selectedDept.replace(/\s+/g, '_')}_Sem_${selectedSem}_Div_${selectedDivision}_Students.xlsx`);
    if (showToast) showToast('Student roster exported to Excel!');
  };

  // Active divisions list (1, 2, or 3)
  const activeDivisionsList = activeAllocation.divisions || [
    { id: '1', name: 'Div 1', facultyId: 'FAC01', facultyName: 'Prof. R. K. Patel' }
  ];

  return (
    <div className="admin-panel-container">
      
      {/* Top Banner */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={26} style={{ color: 'var(--blue-primary)' }} />
              <h1 style={{ fontSize: '24px', color: 'var(--navy-dark)', fontWeight: '800' }}>
                Academic Administration Panel
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Follow the academic cascade: <strong>Semester &rarr; Department &rarr; Subjects &rarr; Faculty &rarr; Divisions (1 to 3) &rarr; Students</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (window.confirm('Reset all academic master data and divisions to default sample?')) {
                  resetToDefault();
                  setDepartments(getDepartments());
                  setSubjects(getSubjects());
                  setFaculties(getFaculties());
                  setStudents(getStudents());
                  setAllocations(getAllocations());
                  if (showToast) showToast('Database reset to defaults.');
                }
              }}
              title="Reset academic structures to default"
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Hierarchical Stepper / Breadcrumbs Bar */}
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '8px', 
          marginTop: '20px', 
          padding: '12px 16px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)'
        }}>
          {/* Step 1 */}
          <button 
            onClick={() => setCurrentStep(1)}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: currentStep === 1 ? 'var(--blue-primary)' : 'transparent',
              color: currentStep === 1 ? 'white' : 'var(--navy-primary)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <GraduationCap size={16} />
            <span>1. Semester: {selectedSem}</span>
          </button>

          <ChevronRight size={16} style={{ color: '#94a3b8' }} />

          {/* Step 2 */}
          <button 
            onClick={() => setCurrentStep(2)}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: currentStep === 2 ? 'var(--blue-primary)' : 'transparent',
              color: currentStep === 2 ? 'white' : 'var(--navy-primary)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Building2 size={16} />
            <span>2. Department: {selectedDept.replace(' Engineering', '')}</span>
          </button>

          <ChevronRight size={16} style={{ color: '#94a3b8' }} />

          {/* Step 3 */}
          <button 
            onClick={() => setCurrentStep(3)}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: currentStep === 3 ? 'var(--blue-primary)' : 'transparent',
              color: currentStep === 3 ? 'white' : 'var(--navy-primary)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <BookOpen size={16} />
            <span>3. Subject: {activeSubject.code}</span>
          </button>

          <ChevronRight size={16} style={{ color: '#94a3b8' }} />

          {/* Step 4 */}
          <button 
            onClick={() => setCurrentStep(4)}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: currentStep === 4 ? 'var(--blue-primary)' : 'transparent',
              color: currentStep === 4 ? 'white' : 'var(--navy-primary)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Layers size={16} />
            <span>4. Divisions ({activeAllocation.divisionCount || 1}) & Faculty</span>
          </button>

          <ChevronRight size={16} style={{ color: '#94a3b8' }} />

          {/* Step 5 */}
          <button 
            onClick={() => setCurrentStep(5)}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: currentStep === 5 ? 'var(--blue-primary)' : 'transparent',
              color: currentStep === 5 ? 'white' : 'var(--navy-primary)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Users size={16} />
            <span>5. Div {selectedDivision} Students ({getDivisionCount(selectedDivision)})</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          STEP 1: SEMESTER SELECTOR
          =================================================================== */}
      {currentStep === 1 && (
        <div className="card">
          <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--navy-dark)' }}>
                Step 1: Select Academic Semester
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Choose the academic semester to manage departments, subjects, and divisions.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
            {SEMESTERS.map(sem => {
              const isSelected = selectedSem === sem.id;
              const semSubjectCount = subjects.filter(s => s.sem === sem.id).length;

              return (
                <div
                  key={sem.id}
                  onClick={() => {
                    setSelectedSem(sem.id);
                    setCurrentStep(2);
                  }}
                  style={{
                    border: isSelected ? '2px solid var(--blue-primary)' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--blue-light)' : 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge" style={{ backgroundColor: sem.term === 'Odd' ? '#e0e7ff' : '#fef3c7', color: sem.term === 'Odd' ? '#3730a3' : '#b45309', fontWeight: '700' }}>
                      {sem.term} Term ({sem.year})
                    </span>
                    {isSelected && <Check size={18} style={{ color: 'var(--blue-primary)' }} />}
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--navy-primary)', marginTop: '12px' }}>
                    {sem.name}
                  </h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    <span>{semSubjectCount} Configured Subjects</span>
                    <span style={{ color: 'var(--blue-primary)', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
                      Select &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          STEP 2: DEPARTMENT SELECTOR
          =================================================================== */}
      {currentStep === 2 && (
        <div className="card">
          <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft size={14} /> Back
                </button>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--navy-dark)' }}>
                  Step 2: Select Department for {selectedSem}
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Select an academic department or add a new department.
              </p>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setDeptForm({ id: '', code: '', name: '' });
                setShowDeptModal(true);
              }}
            >
              <Plus size={15} /> Add Department
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginTop: '20px' }}>
            {departments.map(dept => {
              const isSelected = selectedDept === dept.name;
              const deptSubjCount = subjects.filter(s => s.dept === dept.name && s.sem === selectedSem).length;

              return (
                <div
                  key={dept.id}
                  onClick={() => {
                    setSelectedDept(dept.name);
                    setCurrentStep(3);
                  }}
                  style={{
                    border: isSelected ? '2px solid var(--blue-primary)' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--blue-light)' : 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: '800' }}>
                      {dept.code}
                    </span>
                    {isSelected && <Check size={18} style={{ color: 'var(--blue-primary)' }} />}
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--navy-dark)', marginTop: '10px' }}>
                    {dept.name}
                  </h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    <span>{deptSubjCount} Subjects in {selectedSem}</span>
                    <span style={{ color: 'var(--blue-primary)', fontWeight: '700' }}>
                      Configure &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          STEP 3: SUBJECTS IN DEPARTMENT
          =================================================================== */}
      {currentStep === 3 && (
        <div className="card">
          <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft size={14} /> Back
                </button>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--navy-dark)' }}>
                  Step 3: Subjects in {selectedDept} ({selectedSem})
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Click <strong>"Configure Divisions & Faculty"</strong> on any subject to assign faculties and set division count (1 to 3).
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setSubjectForm({ id: '', code: '', name: '', credits: 4, sem: selectedSem, dept: selectedDept });
                setShowSubjectModal(true);
              }}
            >
              <BookPlus size={16} /> Add New Subject
            </button>
          </div>

          {/* Subjects Table */}
          <div className="table-responsive" style={{ marginTop: '20px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Divisions (Max 3)</th>
                  <th>Assigned Faculty</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                      No subjects configured for {selectedDept} in {selectedSem}. Click "+ Add New Subject" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map(subj => {
                    const alloc = allocations[subj.id] || getAllocationForSubject(subj.id);
                    const divCount = alloc.divisionCount || 1;
                    const isSelected = selectedSubjectId === subj.id;

                    return (
                      <tr 
                        key={subj.id}
                        style={{ backgroundColor: isSelected ? '#eff6ff' : 'transparent' }}
                      >
                        <td style={{ fontWeight: '800', color: 'var(--navy-primary)' }}>
                          {subj.code}
                        </td>
                        <td style={{ fontWeight: '700' }}>
                          {subj.name}
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: '#f1f5f9', fontWeight: '700' }}>
                            {subj.credits || 4} Credits
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontWeight: '700' }}>
                            {divCount} Division{divCount > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                            {(alloc.divisions || []).map(d => (
                              <span key={d.id}>
                                <strong>{d.name}:</strong> {d.facultyName || 'Unassigned'}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedSubjectId(subj.id);
                                setCurrentStep(4);
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <Layers size={14} />
                              <span>Configure Divisions & Faculty</span>
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSubjectForm(subj);
                                setShowSubjectModal(true);
                              }}
                              title="Edit Subject"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteSubject(subj.id)}
                              title="Delete Subject"
                            >
                              <Trash2 size={13} />
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

      {/* ===================================================================
          STEP 4: DIVISION CONFIGURATION (1, 2, or 3) & FACULTY ASSIGNMENT
          =================================================================== */}
      {currentStep === 4 && (
        <div className="card">
          <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft size={14} /> Back to Subjects
                </button>
                <h2 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--navy-dark)' }}>
                  Step 4: Division & Faculty Allocation for {activeSubject.code}
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Subject: <strong>{activeSubject.name}</strong> ({selectedDept} - {selectedSem})
              </p>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFacultyForm({ id: '', name: '', dept: selectedDept, designation: 'Assistant Professor', email: '', phone: '' });
                setShowFacultyModal(true);
              }}
            >
              <UserPlus size={15} /> Add New Faculty Member
            </button>
          </div>

          {/* Division Count Controller (Max 3, or 2, or 1) */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--navy-primary)' }}>
                  Choose Number of Divisions (Option: 1, 2, or Maximum 3)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Select how many divisions take this subject. You can map a dedicated faculty member and manage students for each division.
                </p>
              </div>

              {/* Toggle Buttons for 1, 2, or 3 Divisions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3].map(cnt => {
                  const isActive = (activeAllocation.divisionCount || 1) === cnt;
                  return (
                    <button
                      key={cnt}
                      onClick={() => handleDivisionCountChange(cnt)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: isActive ? '2px solid var(--blue-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isActive ? 'var(--blue-primary)' : 'white',
                        color: isActive ? 'white' : 'var(--navy-dark)',
                        fontWeight: '800',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isActive && <Check size={16} />}
                      <span>{cnt} Division{cnt > 1 ? 's' : ''}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Division Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeDivisionsList.length}, 1fr)`, gap: '20px', marginTop: '24px' }}>
            {activeDivisionsList.map((div) => {
              const enrolledCount = getDivisionCount(div.id);

              return (
                <div 
                  key={div.id}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Card Header */}
                  <div style={{
                    backgroundColor: 'var(--blue-light)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span className="badge" style={{ backgroundColor: 'white', color: 'var(--navy-primary)', fontWeight: '800', marginBottom: '4px' }}>
                        Division {div.id}
                      </span>
                      <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--navy-dark)' }}>
                        {div.name}
                      </h4>
                    </div>

                    <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '800' }}>
                      {enrolledCount} Students Enrolled
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Faculty Assignment Dropdown */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        Assigned Faculty for {div.name}
                      </label>
                      <select
                        className="form-control"
                        value={div.facultyId}
                        onChange={(e) => handleFacultyAssign(div.id, e.target.value)}
                        style={{ height: '40px', fontWeight: '700' }}
                      >
                        {faculties.map(fac => (
                          <option key={fac.id} value={fac.id}>
                            {fac.name} ({fac.designation})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Faculty Details Preview */}
                    <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                      <div style={{ color: 'var(--navy-primary)', fontWeight: '700' }}>
                        {div.facultyName}
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                        Department: {selectedDept}
                      </div>
                    </div>

                    {/* Button to Manage Students for this Division */}
                    <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedDivision(div.id);
                          setCurrentStep(5);
                        }}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                      >
                        <Users size={16} />
                        <span>Manage Division {div.id} Students ({enrolledCount})</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          STEP 5: STUDENTS IN DIVISION (View, Add, Move, Excel Import)
          =================================================================== */}
      {currentStep === 5 && (
        <div className="card">
          <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentStep(4)}>
                  <ArrowLeft size={14} /> Back to Divisions
                </button>
                <h2 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--navy-dark)' }}>
                  Step 5: Enrolled Students in Division {selectedDivision}
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Course: <strong>{activeSubject.code} - {activeSubject.name}</strong> | Faculty: <strong>{activeDivisionsList.find(d => d.id === selectedDivision)?.facultyName || 'Faculty'}</strong>
              </p>
            </div>

            {/* Division Pill Switcher */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginRight: '4px' }}>Division:</span>
              {activeDivisionsList.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDivision(d.id)}
                  className={`btn btn-sm ${selectedDivision === d.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontWeight: '700' }}
                >
                  Div {d.id} ({getDivisionCount(d.id)})
                </button>
              ))}
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search roll, name, enrollment..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{ paddingLeft: '32px', height: '36px' }}
              />
            </div>

            {/* Roster Actions: Import Excel, Export Excel, Add Student */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              
              {/* Import Excel / CSV Button */}
              <label 
                className="btn btn-secondary"
                style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                title="Upload class roster in .xlsx or .csv format"
              >
                <UploadCloud size={16} style={{ color: 'var(--blue-primary)' }} />
                <span>Import Excel/CSV</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>

              {/* Export Roster Excel Button */}
              <button
                className="btn btn-secondary"
                onClick={handleExportRoster}
                style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Download this division's student roster as an Excel file"
              >
                <FileSpreadsheet size={16} style={{ color: '#059669' }} />
                <span>Export Excel</span>
              </button>

              {/* Add Student Modal Trigger */}
              <button
                className="btn btn-primary"
                onClick={() => {
                  setStudentForm({ 
                    id: '', 
                    rollNo: String(divisionStudents.length + 1), 
                    name: '', 
                    enrollmentNo: '', 
                    class: selectedDivision, 
                    dept: selectedDept, 
                    sem: selectedSem 
                  });
                  setShowStudentModal(true);
                }}
                style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserPlus size={16} />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Enrollment No</th>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Active Division</th>
                  <th style={{ textAlign: 'center' }}>Move Division</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {divisionStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      No students currently assigned to Division {selectedDivision}. Click <strong>"+ Add Student"</strong> or <strong>"Import Excel/CSV"</strong> to enroll students.
                    </td>
                  </tr>
                ) : (
                  divisionStudents.map((st) => (
                    <tr key={st.id}>
                      <td style={{ fontWeight: '800', color: 'var(--navy-primary)' }}>{st.rollNo}</td>
                      <td style={{ fontWeight: '700' }}>{st.name}</td>
                      <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: '13px' }}>{st.enrollmentNo}</td>
                      <td>{st.sem}</td>
                      <td>{st.dept}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontWeight: '800' }}>
                          Div {st.class}
                        </span>
                      </td>
                      
                      {/* Move to another Division action */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Move:</span>
                          {activeDivisionsList
                            .filter(d => d.id !== selectedDivision)
                            .map(targetDiv => (
                              <button
                                key={targetDiv.id}
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleMoveStudentDivision(st.id, targetDiv.id)}
                                style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}
                                title={`Move to Division ${targetDiv.id}`}
                              >
                                &rarr; Div {targetDiv.id}
                              </button>
                            ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setStudentForm(st);
                              setShowStudentModal(true);
                            }}
                            title="Edit student"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteStudent(st.id)}
                            title="Remove student"
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
      )}

      {/* ===================================================================
          MODAL: ADD / EDIT STUDENT
          =================================================================== */}
      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-primary)' }}>
                <UserPlus size={20} />
                {studentForm.id ? 'Edit Student Details' : `Add Student to Division ${selectedDivision}`}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowStudentModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStudent}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Roll Number *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 1, 2, 3..."
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Full Student Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aarav Patel"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>University Enrollment Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 12502040501127"
                    value={studentForm.enrollmentNo}
                    onChange={(e) => setStudentForm({ ...studentForm, enrollmentNo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Division Assignment</label>
                  <select
                    className="form-control"
                    value={studentForm.class || selectedDivision}
                    onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                  >
                    {activeDivisionsList.map(d => (
                      <option key={d.id} value={d.id}>Division {d.id} ({d.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={15} /> Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: ADD / EDIT SUBJECT
          =================================================================== */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-primary)' }}>
                <BookPlus size={20} />
                {subjectForm.id ? 'Edit Subject' : 'Add Subject to ' + selectedDept}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSubjectModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSubject}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Subject / Course Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 102040304"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Subject Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. DATA STRUCTURES"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Credits</label>
                  <input
                    type="number"
                    className="form-control"
                    value={subjectForm.credits || 4}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={15} /> Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: ADD FACULTY
          =================================================================== */}
      {showFacultyModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-primary)' }}>
                <UserPlus size={20} /> Add Faculty Member
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowFacultyModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFaculty}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Faculty Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. A. B. Joshi"
                    value={facultyForm.name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <select
                    className="form-control"
                    value={facultyForm.designation}
                    onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                  >
                    <option value="Professor & HOD">Professor & HOD</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Visiting Lecturer">Visiting Lecturer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select
                    className="form-control"
                    value={facultyForm.dept}
                    onChange={(e) => setFacultyForm({ ...facultyForm, dept: e.target.value })}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFacultyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={15} /> Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: ADD DEPARTMENT
          =================================================================== */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-primary)' }}>
                <Building2 size={20} /> Add Academic Department
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDeptModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!deptForm.name || !deptForm.code) return;
              const updated = saveDepartment(deptForm);
              setDepartments([...updated]);
              setShowDeptModal(false);
              setDeptForm({ id: '', code: '', name: '' });
              if (showToast) showToast('Department created!');
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. AI, EE, CH"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Chemical Engineering"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeptModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={15} /> Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
