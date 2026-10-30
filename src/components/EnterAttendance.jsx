import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  CheckSquare, 
  XSquare, 
  Search, 
  BookOpen, 
  Calendar, 
  Check, 
  AlertCircle, 
  Clock, 
  FileSpreadsheet, 
  Sparkles, 
  UploadCloud,
  GraduationCap,
  Layers,
  Building2,
  Users
} from 'lucide-react';
import { 
  getStudents, 
  getSubjects, 
  getDepartments,
  getClasses,
  findClassByCriteria,
  getOrCreateClass,
  getStudentsByClassId,
  getStudentsForClassCriteria,
  saveSession,
  DEFAULT_ACADEMIC_YEAR,
  ACADEMIC_YEARS,
  normalizeSem,
  normalizeDiv,
  getStudentsForAcademicGroup
} from '../services/attendanceStorage';
import { getScheduledLecturesForDate } from '../services/timetableStorage';
import TimetableModal from './TimetableModal';

export default function EnterAttendance({ onSaved, showToast }) {
  const departments = getDepartments();
  const subjects = getSubjects();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState(departments[0]?.name || 'AI & Data Science');
  const [sem, setSem] = useState('3rd Sem');
  const [division, setDivision] = useState('Div 1');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [academicYear, setAcademicYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [subjectId, setSubjectId] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [topic, setTopic] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  // Scheduled lectures for active date
  const { dayName, lectures: scheduledLectures } = getScheduledLecturesForDate(date);

  // Automatically select suitable subject when department or subjects change
  useEffect(() => {
    const deptSubjs = subjects.filter(s => 
      !s.dept || s.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4))
    );
    if (deptSubjs.length > 0) {
      if (!subjectId || !deptSubjs.some(s => s.id === subjectId)) {
        setSubjectId(deptSubjs[0].id);
      }
    } else if (subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
  }, [selectedDept, subjects]);

  // Auto-schedule lecture quick-selection when date changes
  useEffect(() => {
    if (scheduledLectures && scheduledLectures.length > 0) {
      const firstSess = scheduledLectures[0];
      setSubjectId(firstSess.subjectId);
      setSelectedTimeSlot(firstSess.time);
      if (firstSess.sem) setSem(normalizeSem(firstSess.sem));
      if (firstSess.div) setDivision(normalizeDiv(firstSess.div));
      if (firstSess.departmentId) {
        const foundDept = departments.find(d => 
          d.id === firstSess.departmentId || 
          d.name.toLowerCase().includes(firstSess.departmentId.toLowerCase())
        );
        if (foundDept) setSelectedDept(foundDept.name);
      }
    }
  }, [date]);

  // Handler when clicking a scheduled lecture quick pill
  const handleSelectScheduledLecture = (lec) => {
    setSubjectId(lec.subjectId);
    setSelectedTimeSlot(lec.time);
    if (lec.sem) setSem(normalizeSem(lec.sem));
    if (lec.div) setDivision(normalizeDiv(lec.div));
    if (lec.departmentId) {
      const foundDept = departments.find(d => 
        d.id === lec.departmentId || 
        d.name.toLowerCase().includes(lec.departmentId.toLowerCase())
      );
      if (foundDept) setSelectedDept(foundDept.name);
    }
  };

  // Resolve active Class entity: Department + Semester + Division + Academic Year
  const activeClass = useMemo(() => {
    return findClassByCriteria(selectedDept, sem, division, academicYear) || 
           getOrCreateClass(selectedDept, sem, division, academicYear);
  }, [selectedDept, sem, division, academicYear]);

  // Retrieve enrolled students strictly from Admin Panel records (single source of truth)
  const classStudents = useMemo(() => {
    return getStudentsForAcademicGroup({
      department: selectedDept,
      semester: sem,
      division: division,
      batch: selectedBatch,
      academicYear: academicYear
    });
  }, [selectedDept, sem, division, selectedBatch, academicYear]);

  // Attendance record status map: studentId -> 'present' | 'absent'
  const [records, setRecords] = useState({});
  const [remarks, setRemarks] = useState({});

  // When class students change, reset records map completely to prevent stale student data
  useEffect(() => {
    const nextRecords = {};
    const nextRemarks = {};
    classStudents.forEach(s => {
      nextRecords[s.id] = 'present';
      nextRemarks[s.id] = '';
    });
    setRecords(nextRecords);
    setRemarks(nextRemarks);
  }, [classStudents]);

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

  const markAllStatus = (status) => {
    const updated = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subjectId) {
      alert('Please select a subject!');
      return;
    }
    if (!topic || !topic.trim()) {
      alert('Topic / Syllabus Covered is required. Please specify what was taught in this session before saving.');
      return;
    }

    const newSession = {
      date,
      subjectId,
      department: selectedDept,
      sem,
      division,
      batch: selectedBatch,
      academicYear,
      classId: activeClass ? activeClass.id : null,
      timeSlot: selectedTimeSlot,
      topic: topic.trim(),
      records,
      remarks,
    };

    saveSession(newSession);
    if (showToast) showToast(`Attendance recorded for ${selectedDept} • ${sem} • ${division}!`);
    if (onSaved) onSaved();

    setTopic('');
  };

  const filteredStudents = classStudents.filter(s =>
    (s.name && s.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
    (s.rollNo && String(s.rollNo).includes(studentSearch)) ||
    (s.enrollmentNo && String(s.enrollmentNo).toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const presentCount = classStudents.filter(s => (records[s.id] || 'present') === 'present').length;
  const absentCount = classStudents.filter(s => records[s.id] === 'absent').length;

  const getSubjectObj = (id) => subjects.find(s => s.id === id) || { code: id, name: id };

  return (
    <div className="card">
      <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '22px' }}>
            <Calendar size={24} style={{ color: 'var(--blue-primary)' }} />
            Enter Lecture Attendance
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Select class &amp; session details, enter topic covered, and mark enrolled student attendance.
          </p>
        </div>

        {/* Upload Timetable Button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowTimetableModal(true)}
          style={{ borderColor: 'var(--blue-accent)', color: 'var(--blue-primary)', fontWeight: '700' }}
        >
          <UploadCloud size={16} />
          Upload Timetable (PNG, JPG, PDF, Excel)
        </button>
      </div>

      {/* Auto-Schedule Timetable Banner */}
      {scheduledLectures && scheduledLectures.length > 0 && (
        <div 
          style={{
            backgroundColor: 'var(--blue-light)',
            border: '1px solid var(--blue-sky)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} style={{ color: 'var(--blue-primary)' }} />
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--navy-primary)', letterSpacing: '0.05em' }}>
                Timetable Auto-Schedule ({dayName})
              </span>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-dark)' }}>
                {scheduledLectures.length} Lecture(s) Scheduled on {dayName}
              </div>
            </div>
          </div>

          {/* Lecture Quick Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {scheduledLectures.map((lec, idx) => {
              const isSelected = subjectId === lec.subjectId && selectedTimeSlot === lec.time;
              const subj = getSubjectObj(lec.subjectId);
              const lectureSem = lec.sem || subj.sem || '3rd Sem';
              const lectureDiv = lec.div || 'Div 1';
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectScheduledLecture(lec)}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: isSelected ? 'var(--navy-primary)' : 'white',
                    color: isSelected ? 'white' : 'var(--navy-dark)',
                    border: isSelected ? '1px solid var(--navy-primary)' : '1px solid var(--blue-sky)',
                    fontWeight: '700',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: isSelected ? '0 2px 6px rgba(30, 58, 138, 0.25)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Clock size={13} style={{ color: isSelected ? 'white' : 'var(--blue-primary)' }} />
                  <span>Lecture #{idx + 1}: {lec.time}</span>
                  <span style={{ opacity: 0.8, fontSize: '11px', marginLeft: '4px' }}>
                    ({subj.code} • {lectureSem} • {lectureDiv})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        {/* Form Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} style={{ color: '#2563eb' }} />
              <span>Attendance Date</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} style={{ color: '#2563eb' }} />
              <span>Lecture Time Slot</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 10:00 - 10:50"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              style={{ fontWeight: '700' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} style={{ color: '#2563eb' }} />
              <span>Department</span>
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

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={14} style={{ color: '#2563eb' }} />
              <span>Academic Semester</span>
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

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} style={{ color: '#2563eb' }} />
              <span>Division</span>
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

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} style={{ color: '#2563eb' }} />
              <span>Batch</span>
            </label>
            <select
              className="form-control"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              style={{ fontWeight: '700' }}
            >
              <option value="ALL">All Batches</option>
              <option value="Batch A">Batch A</option>
              <option value="Batch B">Batch B</option>
              <option value="Batch C">Batch C</option>
              <option value="Batch D">Batch D</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} style={{ color: '#2563eb' }} />
              <span>Subject / Course</span>
            </label>
            <select
              className="form-control"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.faculty || 'Faculty'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Lecture Topic Covered *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. React Hooks, Database Normalization BCNF, Graph Algorithms..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Active Class & Enrolled Roster Banner */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            backgroundColor: '#f8fafc',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginBottom: '18px'
          }}
        >
          {/* Class Identity Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800'
            }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                  {selectedDept} • {sem} • {division}
                </span>
                <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '700' }}>
                  {academicYear}
                </span>
                <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '700' }}>
                  {classStudents.length} Enrolled Students
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Students dynamically loaded from Class Roster
              </span>
            </div>
          </div>

          {/* Quick Filter Search & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="input-with-icon" style={{ minWidth: '180px', maxWidth: '240px' }}>
              <Search className="input-icon" size={15} />
              <input
                type="text"
                className="form-control"
                placeholder="Search roll, name..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{ height: '34px', fontSize: '12.5px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => markAllStatus('present')}
                title="Mark all as Present"
              >
                <CheckSquare size={13} style={{ color: 'var(--status-present)' }} />
                <span>All Present</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => markAllStatus('absent')}
                title="Mark all as Absent"
              >
                <XSquare size={13} style={{ color: 'var(--status-absent)' }} />
                <span>All Absent</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
              <span className="badge badge-present">Present: {presentCount}</span>
              <span className="badge badge-absent">Absent: {absentCount}</span>
            </div>
          </div>
        </div>

        {/* Student Attendance Table */}
        <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Roll No</th>
                <th>Student Name</th>
                <th>Enrollment No</th>
                <th style={{ textAlign: 'center', width: '200px' }}>Attendance Status</th>
                <th>Remarks / Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No enrolled students found for <strong>{selectedDept} • {sem} • {division} ({academicYear})</strong>.
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                      Tip: Go to <strong>Admin Panel &rarr; Classes</strong> to add or bulk upload students to this class.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentStatus = records[student.id] || 'present';
                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: '800', color: 'var(--navy-primary)' }}>{student.rollNo}</td>
                      <td style={{ fontWeight: '600' }}>
                        <div>{student.name}</div>
                        {student.email && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{student.email}</span>
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{student.enrollmentNo}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="attendance-toggle-group">
                          <button
                            type="button"
                            className={`toggle-option ${currentStatus === 'present' ? 'active-present' : ''}`}
                            onClick={() => handleStatusChange(student.id, 'present')}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            className={`toggle-option ${currentStatus === 'absent' ? 'active-absent' : ''}`}
                            onClick={() => handleStatusChange(student.id, 'absent')}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Optional remarks..."
                          value={remarks[student.id] || ''}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          style={{ height: '34px', fontSize: '13px' }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Submit Action */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '12px 32px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} />
            <span>Save Attendance Session</span>
          </button>
        </div>
      </form>

      {/* Timetable File Upload & Schedule Modal */}
      {showTimetableModal && (
        <TimetableModal
          onClose={() => setShowTimetableModal(false)}
          onApplied={() => {
            if (showToast) showToast('Timetable schedule updated & synced!');
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
