import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  X, 
  ArrowRightLeft, 
  BookOpen, 
  Building2, 
  Calendar,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  SEMESTERS, 
  ACADEMIC_YEARS, 
  DEFAULT_ACADEMIC_YEAR,
  getDepartments, 
  getClasses, 
  saveClass, 
  deleteClass, 
  getClassById, 
  findClassByCriteria,
  getStudents, 
  getStudentsByClassId, 
  saveStudent, 
  deleteStudent, 
  removeStudentFromClass,
  moveStudentToClass, 
  bulkImportStudentsToClass,
  checkStudentEnrollment,
  normalizeSem,
  normalizeDiv
} from '../services/attendanceStorage';

export default function ClassManagementPanel({ departments: initialDepts, showToast, onOpenClassTimetable }) {
  const departments = initialDepts || getDepartments();
  const [classes, setClasses] = useState(getClasses());
  const [students, setStudents] = useState(getStudents());

  // Navigation: null = list of all classes, or string classId = viewing class detail
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Filters for classes list
  const [filterYear, setFilterYear] = useState('2026-27');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterSem, setFilterSem] = useState('ALL');
  const [filterDiv, setFilterDiv] = useState('ALL');
  const [classSearch, setClassSearch] = useState('');

  // Class detail search
  const [studentSearch, setStudentSearch] = useState('');

  // Modals state
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    departmentName: 'AI & Data Science',
    semester: '3rd Sem',
    division: 'Div 1',
    academicYear: '2026-27'
  });
  const [classModalError, setClassModalError] = useState('');

  // Single Student Modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    enrollmentNo: '',
    rollNo: '',
    email: '',
    batch: 'Batch A'
  });
  const [studentModalError, setStudentModalError] = useState('');
  const [otherClassConflict, setOtherClassConflict] = useState(null);

  // Remove Student Modal
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // Move Student Modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [studentToMove, setStudentToMove] = useState(null);
  const [targetClassIdForMove, setTargetClassIdForMove] = useState('');

  // Bulk Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreviewRows, setUploadPreviewRows] = useState(null);
  const [uploadStats, setUploadStats] = useState({ total: 0, valid: 0, duplicates: 0, conflicts: 0, invalid: 0 });
  const [moveExistingOnImport, setMoveExistingOnImport] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Refresh data from storage
  const refreshData = () => {
    setClasses([...getClasses()]);
    setStudents([...getStudents()]);
  };

  const selectedClass = useMemo(() => {
    if (!selectedClassId) return null;
    return classes.find(c => c.id === selectedClassId) || null;
  }, [selectedClassId, classes]);

  const studentsInSelectedClass = useMemo(() => {
    if (!selectedClassId) return [];
    return getStudentsByClassId(selectedClassId);
  }, [selectedClassId, students]);

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchYear = filterYear === 'ALL' || cls.academicYear === filterYear;
      const matchDept = filterDept === 'ALL' || cls.departmentName === filterDept || cls.departmentId === filterDept;
      const matchSem = filterSem === 'ALL' || normalizeSem(cls.semester) === normalizeSem(filterSem);
      const matchDiv = filterDiv === 'ALL' || normalizeDiv(cls.division) === normalizeDiv(filterDiv);
      const q = classSearch.toLowerCase().trim();
      const matchSearch = !q || 
        cls.departmentName.toLowerCase().includes(q) || 
        cls.semester.toLowerCase().includes(q) || 
        cls.division.toLowerCase().includes(q);
      return matchYear && matchDept && matchSem && matchDiv && matchSearch;
    });
  }, [classes, filterYear, filterDept, filterSem, filterDiv, classSearch]);

  // Filtered students inside class details view
  const filteredClassStudents = useMemo(() => {
    if (!studentSearch.trim()) return studentsInSelectedClass;
    const q = studentSearch.toLowerCase().trim();
    return studentsInSelectedClass.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.enrollmentNo.toLowerCase().includes(q) ||
      String(s.rollNo || '').includes(q) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  }, [studentsInSelectedClass, studentSearch]);

  // -------------------------------------------------------------------------
  // CLASS HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassForm({
      departmentName: filterDept !== 'ALL' ? filterDept : (departments[0]?.name || 'AI & Data Science'),
      semester: filterSem !== 'ALL' ? filterSem : '3rd Sem',
      division: filterDiv !== 'ALL' ? filterDiv : 'Div 1',
      academicYear: filterYear !== 'ALL' ? filterYear : '2026-27'
    });
    setClassModalError('');
    setShowClassModal(true);
  };

  const handleOpenEditClass = (cls, e) => {
    if (e) e.stopPropagation();
    setEditingClass(cls);
    setClassForm({
      departmentName: cls.departmentName,
      semester: cls.semester,
      division: cls.division,
      academicYear: cls.academicYear
    });
    setClassModalError('');
    setShowClassModal(true);
  };

  const handleSaveClassSubmit = (e) => {
    e.preventDefault();
    setClassModalError('');
    try {
      const res = saveClass({
        ...(editingClass ? { id: editingClass.id } : {}),
        departmentName: classForm.departmentName,
        semester: classForm.semester,
        division: classForm.division,
        academicYear: classForm.academicYear
      });
      refreshData();
      setShowClassModal(false);
      if (showToast) showToast(editingClass ? 'Class updated successfully!' : 'New class created successfully!');
    } catch (err) {
      setClassModalError(err.message || 'Error saving class.');
    }
  };

  const handleDeleteClass = (cls, e) => {
    if (e) e.stopPropagation();
    const enrolled = getStudentsByClassId(cls.id);
    const msg = enrolled.length > 0 
      ? `This class has ${enrolled.length} enrolled student(s). Are you sure you want to delete "${cls.departmentName} • ${cls.semester} • ${cls.division} (${cls.academicYear})"?`
      : `Are you sure you want to delete "${cls.departmentName} • ${cls.semester} • ${cls.division} (${cls.academicYear})"?`;

    if (window.confirm(msg)) {
      deleteClass(cls.id, false);
      refreshData();
      if (selectedClassId === cls.id) {
        setSelectedClassId(null);
      }
      if (showToast) showToast('Class deleted.');
    }
  };

  // -------------------------------------------------------------------------
  // STUDENT HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: '',
      enrollmentNo: '',
      rollNo: String(studentsInSelectedClass.length + 1),
      email: '',
      batch: 'Batch A'
    });
    setStudentModalError('');
    setOtherClassConflict(null);
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (st) => {
    setEditingStudent(st);
    setStudentForm({
      name: st.name,
      enrollmentNo: st.enrollmentNo,
      rollNo: st.rollNo || '',
      email: st.email || '',
      batch: st.batch || 'Batch A'
    });
    setStudentModalError('');
    setOtherClassConflict(null);
    setShowStudentModal(true);
  };

  const handleStudentFormChange = (field, val) => {
    setStudentForm(prev => ({ ...prev, [field]: val }));
    setStudentModalError('');

    if (field === 'enrollmentNo' && val.trim().length >= 3) {
      const check = checkStudentEnrollment(val.trim(), selectedClassId, editingStudent?.id);
      if (check.exists) {
        if (check.inSameClass) {
          setStudentModalError('Student with this enrollment number already exists in this class.');
          setOtherClassConflict(null);
        } else {
          setStudentModalError(`Student is already enrolled in ${check.currentClassName}.`);
          setOtherClassConflict(check);
        }
      } else {
        setOtherClassConflict(null);
      }
    }
  };

  const handleSaveStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.enrollmentNo.trim()) {
      setStudentModalError('Enrollment Number and Student Name are required.');
      return;
    }

    // Check duplicate within this class
    const check = checkStudentEnrollment(studentForm.enrollmentNo.trim(), selectedClassId, editingStudent?.id);
    if (check.exists) {
      if (check.inSameClass) {
        setStudentModalError('Student with this enrollment number already exists in this class.');
        return;
      } else if (!otherClassConflict) {
        setStudentModalError(`Student with this enrollment number is already enrolled in ${check.currentClassName}.`);
        setOtherClassConflict(check);
        return;
      }
    }

    try {
      saveStudent({
        ...(editingStudent ? { id: editingStudent.id } : {}),
        name: studentForm.name.trim(),
        enrollmentNo: studentForm.enrollmentNo.trim(),
        rollNo: studentForm.rollNo.trim(),
        email: studentForm.email.trim(),
        batch: studentForm.batch ? studentForm.batch.trim() : 'Batch A',
        classId: editingStudent ? (editingStudent.classId || selectedClassId) : selectedClassId
      });
      refreshData();
      setShowStudentModal(false);
      if (showToast) showToast(editingStudent ? 'Student details updated!' : 'Student added to class!');
    } catch (err) {
      setStudentModalError(err.message);
    }
  };

  const handleMoveConflictStudent = () => {
    if (!otherClassConflict?.existingStudent?.id) return;
    try {
      moveStudentToClass(otherClassConflict.existingStudent.id, selectedClassId);
      refreshData();
      setShowStudentModal(false);
      if (showToast) showToast(`Student moved to this class successfully!`);
    } catch (err) {
      setStudentModalError(err.message);
    }
  };

  // Initiate Remove Confirmation Dialog
  const handleInitiateRemoveStudent = (st) => {
    setStudentToRemove(st);
    setShowRemoveModal(true);
  };

  // Confirm Remove from Class (Preserves Historical Attendance)
  const handleConfirmRemoveStudent = () => {
    if (!studentToRemove) return;
    removeStudentFromClass(studentToRemove.id, selectedClassId);
    refreshData();
    setShowRemoveModal(false);
    if (showToast) showToast(`Student "${studentToRemove.name}" removed from class.`);
    setStudentToRemove(null);
  };

  // Open Move Modal
  const handleOpenMoveModal = (st) => {
    setStudentToMove(st);
    // Default to the first different class
    const otherClasses = classes.filter(c => c.id !== selectedClassId);
    setTargetClassIdForMove(otherClasses[0]?.id || '');
    setShowMoveModal(true);
  };

  const handleConfirmMove = () => {
    if (!studentToMove || !targetClassIdForMove) return;
    try {
      moveStudentToClass(studentToMove.id, targetClassIdForMove);
      refreshData();
      setShowMoveModal(false);
      if (showToast) showToast(`Student "${studentToMove.name}" moved to new class!`);
    } catch (err) {
      alert('Error moving student: ' + err.message);
    }
  };

  // -------------------------------------------------------------------------
  // EXCEL / CSV BULK UPLOAD & PREVIEW
  // -------------------------------------------------------------------------
  const handleDownloadSampleTemplate = () => {
    const wb = XLSX.utils.book_new();
    const sampleData = [
      ['Roll No', 'Enrollment No', 'Student Name', 'Batch', 'Email'],
      ['1', '24AD001', 'Aarav Patel', 'Batch A', 'aarav.patel@adit.ac.in'],
      ['2', '24AD002', 'Ananya Sharma', 'Batch A', 'ananya.sharma@adit.ac.in'],
      ['3', '24AD003', 'Devansh Verma', 'Batch B', 'devansh.verma@adit.ac.in'],
      ['4', '24AD004', 'Diyansh Joshi', 'Batch B', 'diyansh.joshi@adit.ac.in'],
      ['5', '24AD005', 'Isha Mehta', 'Batch C', 'isha.mehta@adit.ac.in']
    ];
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `Class_${selectedClass?.semester || 'Sem'}_${selectedClass?.division || 'Div'}_Template.xlsx`);
  };

  const handleExportClassStudents = () => {
    if (!selectedClass || studentsInSelectedClass.length === 0) {
      alert('No students to export.');
      return;
    }
    const wb = XLSX.utils.book_new();
    const header = [
      ['ADIT Attendance Management System - Official Class Roster'],
      [`Department: ${selectedClass.departmentName}`, `Semester: ${selectedClass.semester}`, `Division: ${selectedClass.division}`, `Academic Year: ${selectedClass.academicYear}`],
      [`Total Students: ${studentsInSelectedClass.length}`, `Export Date: ${new Date().toLocaleDateString()}`],
      [],
      ['Roll No', 'Enrollment No', 'Student Name', 'Batch', 'Email', 'Department', 'Semester', 'Division', 'Academic Year']
    ];
    const rows = studentsInSelectedClass.map(s => [
      s.rollNo || '',
      s.enrollmentNo || '',
      s.name || '',
      s.batch || 'Batch A',
      s.email || '',
      selectedClass.departmentName,
      selectedClass.semester,
      selectedClass.division,
      selectedClass.academicYear
    ]);
    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Enrolled Students');
    const safeName = `${selectedClass.departmentName.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedClass.semester}_${selectedClass.division}`.replace(/\s+/g, '_');
    XLSX.writeFile(wb, `${safeName}_Roster_${selectedClass.academicYear}.xlsx`);
  };

  // Parse Upload File and Generate Preview
  const handleUploadFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setIsProcessingUpload(true);
    setUploadPreviewRows(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      if (!firstSheet) throw new Error('Spreadsheet has no readable sheets.');

      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      if (!rawRows || rawRows.length < 2) {
        throw new Error('Spreadsheet is empty or lacks headers.');
      }

      // Detect header row index
      let headerIdx = 0;
      for (let i = 0; i < Math.min(5, rawRows.length); i++) {
        const rowStr = rawRows[i].join(' ').toLowerCase();
        if (rowStr.includes('enroll') || rowStr.includes('name') || rowStr.includes('roll')) {
          headerIdx = i;
          break;
        }
      }

      const headers = rawRows[headerIdx].map(h => String(h || '').trim().toLowerCase());
      
      // Column index mapping
      let rollCol = headers.findIndex(h => /^(roll|roll\s*no|rno|sr|sr\s*no|no)$/i.test(h));
      let enrCol = headers.findIndex(h => /^(enroll|enrollment|enrollment\s*no|enrolment|id|enr)$/i.test(h));
      let nameCol = headers.findIndex(h => /^(name|student\s*name|full\s*name|student)$/i.test(h));
      let batchCol = headers.findIndex(h => /^(batch|group|subgroup|section|lab\s*batch)$/i.test(h));
      let emailCol = headers.findIndex(h => /^(email|e-mail|email\s*address|mail)$/i.test(h));

      // Fallbacks if columns not strictly matched
      if (enrCol === -1) {
        enrCol = headers.findIndex(h => h.includes('enr') || h.includes('enroll'));
      }
      if (nameCol === -1) {
        nameCol = headers.findIndex(h => h.includes('name') || h.includes('student'));
      }
      if (rollCol === -1) {
        rollCol = headers.findIndex(h => h.includes('roll') || h.includes('sr'));
      }
      if (batchCol === -1) {
        batchCol = headers.findIndex(h => h.includes('batch') || h.includes('group'));
      }
      if (emailCol === -1) {
        emailCol = headers.findIndex(h => h.includes('mail'));
      }

      if (enrCol === -1 && nameCol === -1) {
        // Fallback positional: col 0 roll, col 1 enr, col 2 name
        rollCol = 0; enrCol = 1; nameCol = 2; emailCol = 3;
      }

      const fileEnrollmentSeen = new Set();
      const analyzedRows = [];
      let valid = 0, duplicates = 0, conflicts = 0, invalid = 0;

      for (let r = headerIdx + 1; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row || row.every(cell => !cell)) continue; // skip blank row

        const rollNo = rollCol !== -1 ? String(row[rollCol] || '').trim() : '';
        const enr = enrCol !== -1 ? String(row[enrCol] || '').trim() : '';
        const name = nameCol !== -1 ? String(row[nameCol] || '').trim() : '';
        const batch = batchCol !== -1 ? String(row[batchCol] || '').trim() : 'Batch A';
        const email = emailCol !== -1 ? String(row[emailCol] || '').trim() : '';

        const rowItem = {
          rowNumber: r + 1,
          rollNo: rollNo || String(r - headerIdx),
          enrollmentNo: enr,
          name,
          batch: batch || 'Batch A',
          email,
          status: 'valid',
          reason: 'Ready to import'
        };

        if (!name || !enr) {
          rowItem.status = 'invalid';
          rowItem.reason = !name ? 'Missing student name' : 'Missing enrollment number';
          invalid++;
        } else if (fileEnrollmentSeen.has(enr.toLowerCase())) {
          rowItem.status = 'duplicate';
          rowItem.reason = 'Duplicate enrollment number inside this file';
          duplicates++;
        } else {
          fileEnrollmentSeen.add(enr.toLowerCase());

          // Check against database
          const check = checkStudentEnrollment(enr, selectedClassId);
          if (check.exists) {
            if (check.inSameClass) {
              rowItem.status = 'duplicate';
              rowItem.reason = 'Already enrolled in this class (will update details)';
              duplicates++;
            } else {
              rowItem.status = 'conflict';
              rowItem.reason = `Enrolled in ${check.currentClassName}`;
              rowItem.otherClass = check.currentClass;
              conflicts++;
            }
          } else {
            valid++;
          }
        }

        analyzedRows.push(rowItem);
      }

      setUploadPreviewRows(analyzedRows);
      setUploadStats({
        total: analyzedRows.length,
        valid,
        duplicates,
        conflicts,
        invalid
      });

    } catch (err) {
      alert('Error parsing uploaded file: ' + err.message);
      setUploadFile(null);
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleConfirmBulkImport = () => {
    if (!uploadPreviewRows || !selectedClassId) return;

    const validRowsToImport = uploadPreviewRows.filter(r => 
      r.status === 'valid' || 
      r.status === 'duplicate' || 
      (r.status === 'conflict' && moveExistingOnImport)
    );

    if (validRowsToImport.length === 0) {
      alert('No valid students to import. Please review the errors in the preview table.');
      return;
    }

    try {
      const result = bulkImportStudentsToClass(selectedClassId, validRowsToImport, {
        moveExisting: moveExistingOnImport
      });

      refreshData();
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreviewRows(null);

      const msg = `Successfully imported ${result.importedCount} new student(s)${result.updatedCount ? `, updated ${result.updatedCount}` : ''}${result.movedCount ? `, moved ${result.movedCount} from other classes` : ''}!`;
      if (showToast) showToast(msg);

      if (result.errors?.length > 0) {
        alert('Some rows were skipped during import:\n' + result.errors.slice(0, 5).join('\n'));
      }
    } catch (err) {
      alert('Failed to import students: ' + err.message);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER: CLASS DETAILS VIEW (When a Class is Selected)
  // -------------------------------------------------------------------------
  if (selectedClass) {
    return (
      <div className="admin-subview">
        {/* Navigation Breadcrumb & Back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedClassId(null);
              setStudentSearch('');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Classes</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(e) => handleOpenEditClass(selectedClass, e)}
            >
              <Edit2 size={14} />
              <span>Edit Class Details</span>
            </button>
          </div>
        </div>

        {/* Class Overview Hero Banner */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge" style={{ backgroundColor: '#2563eb', color: 'white', fontWeight: '800', fontSize: '12px', padding: '4px 10px' }}>
                  {selectedClass.departmentName}
                </span>
                <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#1e293b', fontWeight: '800' }}>
                  {selectedClass.academicYear}
                </span>
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '12px' }}>
                {selectedClass.semester} • {selectedClass.division}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                <span><strong>Department:</strong> {selectedClass.departmentName}</span>
                <span>•</span>
                <span><strong>Academic Year:</strong> {selectedClass.academicYear}</span>
                <span>•</span>
                <span><strong>Enrolled:</strong> <span style={{ color: '#059669', fontWeight: '800' }}>{studentsInSelectedClass.length} Students</span></span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenAddStudent}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} />
                <span>Add Student</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setUploadFile(null);
                  setUploadPreviewRows(null);
                  setShowUploadModal(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
              >
                <UploadCloud size={16} />
                <span>Bulk Upload (.xlsx, .csv)</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleExportClassStudents}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={16} />
                <span>Export Roster</span>
              </button>
            </div>
          </div>
        </div>

        {/* Student List Section */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a' }}>
                Students ({filteredClassStudents.length})
              </h3>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                {selectedClass.departmentName} • {selectedClass.semester} • {selectedClass.division} ({selectedClass.academicYear})
              </span>
            </div>

            {/* Quick Actions & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="input-with-icon" style={{ minWidth: '220px' }}>
                <Search className="input-icon" size={15} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Enrollment No, Name..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{ height: '36px', fontSize: '13px' }}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenAddStudent}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', height: '36px' }}
              >
                <Plus size={15} />
                <span>+ Add Student</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setUploadFile(null);
                  setUploadPreviewRows(null);
                  setShowUploadModal(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', height: '36px', color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
              >
                <UploadCloud size={15} />
                <span>Upload Student List</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleExportClassStudents}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', height: '36px' }}
                title="Export Roster to Excel"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Student Table */}
          {filteredClassStudents.length > 0 ? (
            <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', width: '70px', fontWeight: '800', color: '#475569' }}>Roll No</th>
                    <th style={{ padding: '12px 16px', width: '160px', fontWeight: '800', color: '#475569' }}>Enrollment No.</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Student Name</th>
                    <th style={{ padding: '12px 16px', width: '120px', fontWeight: '800', color: '#475569' }}>Batch</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800', color: '#475569' }}>Email Address</th>
                    <th style={{ padding: '12px 16px', width: '190px', textAlign: 'right', fontWeight: '800', color: '#475569' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassStudents.map((st, idx) => (
                    <tr 
                      key={st.id || idx}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: idx % 2 === 0 ? 'white' : '#fafbfc'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '3px 8px', 
                          backgroundColor: '#f1f5f9', 
                          borderRadius: '6px',
                          textAlign: 'center',
                          minWidth: '28px'
                        }}>
                          {st.rollNo || (idx + 1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>
                        {st.enrollmentNo}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                        {st.name}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          padding: '3px 9px', 
                          backgroundColor: st.batch?.includes('B') ? '#fef3c7' : st.batch?.includes('C') ? '#f3e8ff' : '#eff6ff', 
                          color: st.batch?.includes('B') ? '#b45309' : st.batch?.includes('C') ? '#7e22ce' : '#1d4ed8', 
                          borderRadius: '6px', 
                          fontWeight: '700', 
                          fontSize: '12px', 
                          border: `1px solid ${st.batch?.includes('B') ? '#fde68a' : st.batch?.includes('C') ? '#e9d5ff' : '#bfdbfe'}` 
                        }}>
                          {st.batch || 'Batch A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {st.email || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditStudent(st)}
                            title="Edit Student"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', fontSize: '12.5px', fontWeight: '700' }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleInitiateRemoveStudent(st)}
                            title="Remove Student from this class"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', fontSize: '12.5px', fontWeight: '700', color: '#e11d48', borderColor: '#fecdd3', backgroundColor: '#fff1f2' }}
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', border: '2px dashed #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
              <Users size={36} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {studentSearch ? 'No matching students found' : 'No students enrolled in this class yet'}
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '6px auto 18px auto' }}>
                {studentSearch 
                  ? 'Try adjusting your search criteria.' 
                  : 'Add students individually or import a student roster spreadsheet (.xlsx, .csv).'}
              </p>
              {!studentSearch && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAddStudent}>
                    <Plus size={15} /> Add First Student
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => {
                      setUploadFile(null);
                      setUploadPreviewRows(null);
                      setShowUploadModal(true);
                    }}
                  >
                    <UploadCloud size={15} /> Upload Excel / CSV
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RENDER MODALS (Shared across views) */}
        {renderModals()}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: ALL CLASSES VIEW (List / Grid of Classes)
  // -------------------------------------------------------------------------
  return (
    <div className="admin-subview">
      {/* Header & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
              Academic Classes
            </h1>
            <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800', fontSize: '12px' }}>
              Academic Year {filterYear}
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            Organize students into distinct classes based on Department + Semester + Division + Academic Year.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleOpenCreateClass}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}
        >
          <Plus size={16} />
          <span>Create Class</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Total Classes</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {classes.length}
          </div>
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>Active Across Departments</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Total Students</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {students.length}
          </div>
          <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>Enrolled & Tracked</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748b' }}>Academic Year</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
            {filterYear}
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Selected Session</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Filters Group */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: 1 }}>
            {/* Academic Year Filter */}
            <div style={{ minWidth: '130px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Academic Year
              </label>
              <select
                className="form-control"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                style={{ fontSize: '13px', fontWeight: '700' }}
              >
                <option value="ALL">All Years</option>
                {ACADEMIC_YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div style={{ minWidth: '180px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Department
              </label>
              <select
                className="form-control"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                style={{ fontSize: '13px', fontWeight: '700' }}
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d.id || d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div style={{ minWidth: '130px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Semester
              </label>
              <select
                className="form-control"
                value={filterSem}
                onChange={(e) => setFilterSem(e.target.value)}
                style={{ fontSize: '13px', fontWeight: '700' }}
              >
                <option value="ALL">All Semesters</option>
                {SEMESTERS.map(s => (
                  <option key={s.id} value={s.id}>{s.id}</option>
                ))}
              </select>
            </div>

            {/* Division Filter */}
            <div style={{ minWidth: '110px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Division
              </label>
              <select
                className="form-control"
                value={filterDiv}
                onChange={(e) => setFilterDiv(e.target.value)}
                style={{ fontSize: '13px', fontWeight: '700' }}
              >
                <option value="ALL">All Divs</option>
                <option value="Div 1">Div 1</option>
                <option value="Div 2">Div 2</option>
                <option value="Div 3">Div 3</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div style={{ minWidth: '220px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              Search
            </label>
            <div className="input-with-icon">
              <Search className="input-icon" size={15} />
              <input
                type="text"
                className="form-control"
                placeholder="Search classes..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
          {filteredClasses.map((cls) => {
            const studentCount = getStudentsByClassId(cls.id).length;
            const deptObj = departments.find(d => d.id === cls.departmentId || d.name === cls.departmentName);

            return (
              <div 
                key={cls.id}
                className="card"
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setStudentSearch('');
                }}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  {/* Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: '800', fontSize: '11px', padding: '4px 8px' }}>
                      {deptObj?.code || 'DEPT'}
                    </span>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '11px' }}>
                      {cls.academicYear}
                    </span>
                  </div>

                  {/* Class Name */}
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    {cls.semester} • {cls.division}
                  </h3>

                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '16px' }}>
                    {cls.departmentName}
                  </div>

                  {/* Student Count Badge */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    backgroundColor: studentCount > 0 ? '#ecfdf5' : '#f8fafc',
                    color: studentCount > 0 ? '#065f46' : '#64748b',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}>
                    <Users size={16} />
                    <span>{studentCount} Students Enrolled</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setStudentSearch('');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
                  >
                    <span>View Students</span>
                    <ChevronRight size={14} />
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleOpenEditClass(cls, e)}
                      title="Edit Class Details"
                      style={{ padding: '6px 8px' }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleDeleteClass(cls, e)}
                      title="Delete Class"
                      style={{ padding: '6px 8px', color: '#e11d48' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <GraduationCap size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            No classes match your filter
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '6px auto 18px auto' }}>
            Try clearing filters or create a new class for this academic year.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenCreateClass}>
            <Plus size={15} /> Create Class Now
          </button>
        </div>
      )}

      {/* RENDER MODALS */}
      {renderModals()}
    </div>
  );

  // -------------------------------------------------------------------------
  // HELPER: RENDER ALL MODALS
  // -------------------------------------------------------------------------
  function renderModals() {
    return (
      <>
        {/* ===================================================================
            MODAL 1: CREATE / EDIT CLASS
            =================================================================== */}
        {showClassModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '480px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={20} style={{ color: '#2563eb' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    {editingClass ? 'Edit Class Details' : 'Create New Class'}
                  </h3>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowClassModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveClassSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {classModalError && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecdd3', color: '#991b1b', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} />
                      <span>{classModalError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Department *</label>
                    <select
                      className="form-control"
                      value={classForm.departmentName}
                      onChange={(e) => setClassForm(prev => ({ ...prev, departmentName: e.target.value }))}
                      required
                    >
                      {departments.map(d => (
                        <option key={d.id || d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Semester *</label>
                      <select
                        className="form-control"
                        value={classForm.semester}
                        onChange={(e) => setClassForm(prev => ({ ...prev, semester: e.target.value }))}
                        required
                      >
                        {SEMESTERS.map(s => (
                          <option key={s.id} value={s.id}>{s.id}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Division *</label>
                      <select
                        className="form-control"
                        value={classForm.division}
                        onChange={(e) => setClassForm(prev => ({ ...prev, division: e.target.value }))}
                        required
                      >
                        <option value="Div 1">Division 1 (Div 1)</option>
                        <option value="Div 2">Division 2 (Div 2)</option>
                        <option value="Div 3">Division 3 (Div 3)</option>
                        <option value="Div 4">Division 4 (Div 4)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Academic Year *</label>
                    <select
                      className="form-control"
                      value={classForm.academicYear}
                      onChange={(e) => setClassForm(prev => ({ ...prev, academicYear: e.target.value }))}
                      required
                    >
                      {ACADEMIC_YEARS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Classes are strictly separated across academic years to preserve cohort rosters.
                    </span>
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowClassModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingClass ? 'Save Changes' : 'Create Class'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 2: MANUAL ADD / EDIT STUDENT
            =================================================================== */}
        {showStudentModal && selectedClass && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '480px' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {editingStudent ? 'Edit Student' : 'Add Student'}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {selectedClass.departmentName} • {selectedClass.semester} • {selectedClass.division}
                  </span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowStudentModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveStudentSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {studentModalError && (
                    <div style={{ padding: '10px 14px', backgroundColor: otherClassConflict ? '#eff6ff' : '#fef2f2', border: `1px solid ${otherClassConflict ? '#bfdbfe' : '#fecdd3'}`, color: otherClassConflict ? '#1e40af' : '#991b1b', borderRadius: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>{studentModalError}</strong>
                          {otherClassConflict && (
                            <div style={{ marginTop: '8px' }}>
                              <span>This student already exists in {otherClassConflict.currentClassName}. Would you like to move this student to this class instead of creating a duplicate?</span>
                              <div style={{ marginTop: '8px' }}>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={handleMoveConflictStudent}
                                >
                                  Move Student to this Class
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Enrollment Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 24AD001"
                      value={studentForm.enrollmentNo}
                      onChange={(e) => handleStudentFormChange('enrollmentNo', e.target.value)}
                      required
                      style={{ fontFamily: 'monospace', fontWeight: '700' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Student Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Student Name"
                      value={studentForm.name}
                      onChange={(e) => handleStudentFormChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Roll Number (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 1"
                        value={studentForm.rollNo}
                        onChange={(e) => handleStudentFormChange('rollNo', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Assigned Batch *</label>
                      <select
                        className="form-control"
                        value={studentForm.batch || 'Batch A'}
                        onChange={(e) => handleStudentFormChange('batch', e.target.value)}
                        style={{ fontWeight: '700' }}
                      >
                        <option value="Batch A">Batch A</option>
                        <option value="Batch B">Batch B</option>
                        <option value="Batch C">Batch C</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Email Address (Optional)</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. student@adit.ac.in"
                      value={studentForm.email}
                      onChange={(e) => handleStudentFormChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={!!otherClassConflict}>
                    {editingStudent ? 'Save Changes' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 2b: REMOVE STUDENT CONFIRMATION MODAL
            =================================================================== */}
        {showRemoveModal && studentToRemove && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '440px' }}>
              <div className="modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontSize: '18px', fontWeight: '800' }}>
                  <Trash2 size={20} />
                  Remove Student?
                </h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowRemoveModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
                  Are you sure you want to remove:
                </p>

                <div style={{
                  padding: '14px 16px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fecdd3'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    {studentToRemove.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                    Enrollment No: <strong>{studentToRemove.enrollmentNo}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  The student will be removed from this class roster. Historical attendance records will remain safe.
                </p>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRemoveModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleConfirmRemoveStudent}
                  style={{ backgroundColor: '#e11d48', borderColor: '#e11d48', fontWeight: '700' }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 3: MOVE STUDENT TO ANOTHER CLASS
            =================================================================== */}
        {showMoveModal && studentToMove && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '460px' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowRightLeft size={18} style={{ color: '#2563eb' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    Move Student to Another Class
                  </h3>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowMoveModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <div><strong>Student:</strong> {studentToMove.name}</div>
                  <div><strong>Enrollment:</strong> <span style={{ fontFamily: 'monospace' }}>{studentToMove.enrollmentNo}</span></div>
                  <div><strong>Current Class:</strong> {selectedClass?.departmentName} • {selectedClass?.semester} • {selectedClass?.division} ({selectedClass?.academicYear})</div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Select Destination Class *</label>
                  <select
                    className="form-control"
                    value={targetClassIdForMove}
                    onChange={(e) => setTargetClassIdForMove(e.target.value)}
                    required
                  >
                    {classes.filter(c => c.id !== selectedClassId).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.departmentName} • {c.semester} • {c.division} ({c.academicYear})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowMoveModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmMove}>
                  Move Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 4: BULK STUDENT UPLOAD WITH PREVIEW
            =================================================================== */}
        {showUploadModal && selectedClass && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    Bulk Student Upload (Excel / CSV)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Target Class: <strong>{selectedClass.departmentName} • {selectedClass.semester} • {selectedClass.division} ({selectedClass.academicYear})</strong>
                  </span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowUploadModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Step 1: Upload & Download Template */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    <strong>Expected Columns:</strong> <code>Roll No</code>, <code>Enrollment No</code>, <code>Student Name</code>, <code>Email</code>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleDownloadSampleTemplate}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>Download Excel Template</span>
                  </button>
                </div>

                {/* File input box */}
                <div style={{ 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  textAlign: 'center',
                  backgroundColor: uploadFile ? '#f0fdf4' : 'white'
                }}>
                  <input
                    type="file"
                    id="bulkStudentFileInput"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleUploadFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="bulkStudentFileInput" style={{ cursor: 'pointer', display: 'block' }}>
                    <UploadCloud size={36} style={{ color: uploadFile ? '#059669' : '#2563eb', margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                      {uploadFile ? uploadFile.name : 'Choose Excel (.xlsx, .xls) or CSV file'}
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB • Click to change file` : 'Drag and drop file here, or click to browse'}
                    </span>
                  </label>
                </div>

                {/* Step 2: Upload Preview Table */}
                {uploadPreviewRows && (
                  <div>
                    {/* Stats Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>TOTAL ROWS</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{uploadStats.total}</div>
                      </div>
                      <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857' }}>READY / VALID</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>{uploadStats.valid}</div>
                      </div>
                      <div style={{ backgroundColor: '#fffbeb', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309' }}>DUPLICATES</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#d97706' }}>{uploadStats.duplicates}</div>
                      </div>
                      <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#1d4ed8' }}>OTHER CLASS</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>{uploadStats.conflicts}</div>
                      </div>
                      <div style={{ backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#b91c1c' }}>INVALID</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>{uploadStats.invalid}</div>
                      </div>
                    </div>

                    {/* Conflict Handler Checkbox */}
                    {uploadStats.conflicts > 0 && (
                      <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          id="moveConflictCheckbox"
                          checked={moveExistingOnImport}
                          onChange={(e) => setMoveExistingOnImport(e.target.checked)}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <label htmlFor="moveConflictCheckbox" style={{ fontSize: '13px', color: '#1e40af', fontWeight: '700', cursor: 'pointer' }}>
                          Move {uploadStats.conflicts} student(s) currently enrolled in other classes to this class automatically
                        </label>
                      </div>
                    )}

                    {/* Preview Table */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                          <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '8px 12px', width: '50px' }}>#</th>
                            <th style={{ padding: '8px 12px', width: '80px' }}>Status</th>
                            <th style={{ padding: '8px 12px', width: '60px' }}>Roll</th>
                            <th style={{ padding: '8px 12px', width: '120px' }}>Enrollment</th>
                            <th style={{ padding: '8px 12px' }}>Name</th>
                            <th style={{ padding: '8px 12px', width: '80px' }}>Batch</th>
                            <th style={{ padding: '8px 12px' }}>Email</th>
                            <th style={{ padding: '8px 12px' }}>Validation Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadPreviewRows.map((row, idx) => {
                            const badgeColors = {
                              valid: { bg: '#ecfdf5', color: '#047857' },
                              duplicate: { bg: '#fffbeb', color: '#b45309' },
                              conflict: { bg: '#eff6ff', color: '#1d4ed8' },
                              invalid: { bg: '#fef2f2', color: '#b91c1c' }
                            };
                            const b = badgeColors[row.status] || badgeColors.valid;

                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '8px 12px', color: '#64748b' }}>{row.rowNumber}</td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    backgroundColor: b.bg, 
                                    color: b.color, 
                                    fontWeight: '800', 
                                    fontSize: '10.5px',
                                    textTransform: 'uppercase'
                                  }}>
                                    {row.status}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: '700' }}>{row.rollNo}</td>
                                <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: '700' }}>{row.enrollmentNo}</td>
                                <td style={{ padding: '8px 12px', fontWeight: '600' }}>{row.name}</td>
                                <td style={{ padding: '8px 12px', fontWeight: '700', color: '#2563eb' }}>{row.batch || 'Batch A'}</td>
                                <td style={{ padding: '8px 12px', color: '#64748b' }}>{row.email || '—'}</td>
                                <td style={{ padding: '8px 12px', color: row.status === 'invalid' ? '#b91c1c' : '#64748b' }}>
                                  {row.reason}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmBulkImport}
                  disabled={!uploadPreviewRows || (uploadStats.valid === 0 && uploadStats.duplicates === 0 && (!moveExistingOnImport || uploadStats.conflicts === 0))}
                >
                  Import Students ({uploadStats.valid + uploadStats.duplicates + (moveExistingOnImport ? uploadStats.conflicts : 0)} eligible)
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}
