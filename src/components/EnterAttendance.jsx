import React, { useState, useEffect } from 'react';
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
  UploadCloud 
} from 'lucide-react';
import { getStudents, getSubjects, saveSession } from '../services/attendanceStorage';
import { getScheduledLecturesForDate } from '../services/timetableStorage';
import TimetableModal from './TimetableModal';

export default function EnterAttendance({ onSaved, showToast }) {
  const students = getStudents();
  const subjects = getSubjects();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sem, setSem] = useState('5th Sem');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [topic, setTopic] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showTimetableModal, setShowTimetableModal] = useState(false);

  // Scheduled lectures for active date
  const { dayName, lectures: scheduledLectures } = getScheduledLecturesForDate(date);

  // Auto-schedule subject when date changes
  useEffect(() => {
    if (scheduledLectures && scheduledLectures.length > 0) {
      const firstSess = scheduledLectures[0];
      setSubjectId(firstSess.subjectId);
      setSelectedTimeSlot(firstSess.time);
    }
  }, [date]);

  // Initial attendance record map: default all 'present'
  const [records, setRecords] = useState(() => {
    const initial = {};
    students.forEach(s => {
      initial[s.id] = 'present';
    });
    return initial;
  });

  const [remarks, setRemarks] = useState({});

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
    students.forEach(s => {
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
    if (!topic.trim()) {
      if (!window.confirm('Topic field is empty. Do you want to submit attendance without entering a topic?')) {
        return;
      }
    }

    const newSession = {
      date,
      subjectId,
      sem,
      timeSlot: selectedTimeSlot,
      topic: topic.trim(),
      records,
      remarks,
    };

    saveSession(newSession);
    if (showToast) showToast('Attendance session successfully recorded!');
    if (onSaved) onSaved();

    setTopic('');
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNo.includes(studentSearch) ||
    s.enrollmentNo.includes(studentSearch)
  );

  const presentCount = Object.values(records).filter(st => st === 'present').length;
  const absentCount = Object.values(records).filter(st => st === 'absent').length;

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
            Select session details, enter topic covered, and mark student attendance status.
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
            justify: 'space-between',
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
              const lectureSem = lec.sem || subj.sem || '5th Sem';
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSubjectId(lec.subjectId);
                    setSelectedTimeSlot(lec.time);
                    if (lec.sem || subj.sem) setSem(lec.sem || subj.sem);
                  }}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: isSelected ? 'var(--navy-primary)' : 'white',
                    color: isSelected ? 'white' : 'var(--navy-dark)',
                    border: isSelected ? '1px solid var(--navy-primary)' : '1px solid var(--blue-sky)',
                    fontWeight: '700',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: isSelected ? '0 2px 6px rgba(30, 58, 138, 0.25)' : 'none'
                  }}
                >
                  <Clock size={13} style={{ color: isSelected ? 'white' : 'var(--blue-primary)' }} />
                  <span>Lecture #{idx + 1}: {lec.time}</span>
                  <span style={{ opacity: 0.8, fontSize: '11px', marginLeft: '4px' }}>({subj.code} • {lectureSem})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        {/* Form Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="form-group">
            <label>Attendance Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Lecture Time Slot</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 10:00 AM - 11:00 AM"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              style={{ fontWeight: '700' }}
            />
          </div>

          <div className="form-group">
            <label>Academic Semester</label>
            <select
              className="form-control"
              value={sem}
              onChange={(e) => setSem(e.target.value)}
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
            <label>Subject / Course</label>
            <select
              className="form-control"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.faculty})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Lecture Topic Covered *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. React Hooks, Database Normalization BCNF..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Action Header Banner */}
        <div 
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            backgroundColor: 'var(--blue-light)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--blue-sky)',
            marginBottom: '20px'
          }}
        >
          {/* Quick Filter Search */}
          <div className="input-with-icon" style={{ flex: 1, minWidth: '220px', maxWidth: '320px' }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="form-control"
              placeholder="Filter student list..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>

          {/* Quick Mark All Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => markAllStatus('present')}
            >
              <CheckSquare size={14} style={{ color: 'var(--status-present)' }} />
              All Present
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => markAllStatus('absent')}
            >
              <XSquare size={14} style={{ color: 'var(--status-absent)' }} />
              All Absent
            </button>
          </div>

          {/* Realtime Counters */}
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontWeight: '700' }}>
            <span className="badge badge-present">Present: {presentCount}</span>
            <span className="badge badge-absent">Absent: {absentCount}</span>
          </div>
        </div>

        {/* Student Attendance Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Enrollment No</th>
                <th style={{ textAlign: 'center' }}>Attendance Status</th>
                <th>Remarks / Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No matching students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentStatus = records[student.id] || 'present';
                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: '800', color: 'var(--navy-primary)' }}>{student.rollNo}</td>
                      <td style={{ fontWeight: '600' }}>{student.name}</td>
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
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '16px' }}>
            <Save size={18} />
            Save Attendance Session
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
