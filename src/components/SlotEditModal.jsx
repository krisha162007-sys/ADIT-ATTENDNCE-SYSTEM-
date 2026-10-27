import React, { useState } from 'react';
import { X, Clock, Calendar, BookOpen, Layers, MapPin, Trash2, Check, FlaskConical, AlertTriangle, Building2 } from 'lucide-react';
import { 
  checkConflicts, 
  TIME_SLOTS, 
  TIMETABLE_DAYS, 
  getSubjectColor, 
  isLabSession, 
  getNextConsecutiveTimeSlot, 
  getCombinedTimeSlot 
} from '../services/timetableStorage';
import { getDepartments } from '../services/attendanceStorage';

export default function SlotEditModal({
  day: initialDay,
  timeSlot: initialTimeSlot,
  existingSlot,
  availableSubjects,
  availableFaculties = [],
  departments: propDepts,
  departmentName,
  semesterName,
  divisionName,
  onClose,
  onSave,
  onClear,
  showToast
}) {
  const departments = (propDepts && propDepts.length > 0) ? propDepts : getDepartments();

  const [day, setDay] = useState(initialDay || 'Monday');
  const [timeSlot, setTimeSlot] = useState(initialTimeSlot || '9:00 - 9:55');
  // Entries from centralized storage use subjectName; parsed timetables use subject — support both
  const _existingSubject = existingSlot?.subject || existingSlot?.subjectName || existingSlot?.subjectId || '';
  const _existingName    = existingSlot?.name || existingSlot?.subjectFullName || existingSlot?.subjectName || '';
  const [subject, setSubject] = useState(_existingSubject || (availableSubjects[0]?.shortName || availableSubjects[0]?.name || ''));
  const [fullName, setFullName] = useState(_existingName || (availableSubjects[0]?.name || ''));

  // Class Department (students being taught) - separate from faculty home department
  const [classDeptId, setClassDeptId] = useState(() => {
    if (existingSlot?.departmentId) return existingSlot.departmentId;
    if (existingSlot?.department) {
      const match = departments.find(d => d.name === existingSlot.department || d.code === existingSlot.department);
      if (match) return match.id;
    }
    const dMatch = departments.find(d => d.name === departmentName || d.id === departmentName);
    return dMatch ? dMatch.id : (departments[0]?.id || 'DEP_AE');
  });

  const [sem, setSem] = useState(existingSlot?.sem || existingSlot?.semId || semesterName || '3rd Sem');
  const [div, setDiv] = useState(existingSlot?.div || existingSlot?.divId || divisionName || 'Div 1');
  const [batch, setBatch] = useState(existingSlot?.batch || 'All');
  const [room, setRoom] = useState(existingSlot?.room || 'Room 201');
  const [type, setType] = useState(existingSlot?.type || 'Lecture');
  const [color, setColor] = useState(existingSlot?.color || getSubjectColor(_existingSubject || 'DBMS'));
  const [selectedFacultyId, setSelectedFacultyId] = useState(existingSlot?.facultyId || '');
  const [conflicts, setConflicts] = useState([]);

  // Compute 2-hour lab duration and consecutive slot
  const isLab = type === 'Lab' || isLabSession({ type, subject, room });
  const nextSlot = isLab ? getNextConsecutiveTimeSlot(timeSlot) : null;
  const isInvalidLabSlot = isLab && !nextSlot;
  const combinedTime = isLab && nextSlot ? getCombinedTimeSlot(timeSlot, nextSlot) : timeSlot;

  // Handle subject change
  const handleSubjectSelect = (e) => {
    const selectedSubjId = e.target.value;
    const subjObj = availableSubjects.find(s => s.id === selectedSubjId || s.shortName === selectedSubjId || s.name === selectedSubjId);
    if (subjObj) {
      const short = subjObj.shortName || subjObj.code || subjObj.name.slice(0, 10);
      setSubject(short);
      setFullName(subjObj.name);
      setColor(getSubjectColor(short));
      if (isLabSession(subjObj)) {
        setType('Lab');
        if (!room || room === 'Room 201') setRoom('Lab 1');
      }
    } else {
      setSubject(selectedSubjId);
      setFullName(selectedSubjId);
      setColor(getSubjectColor(selectedSubjId));
      if (isLabSession({ subject: selectedSubjId })) {
        setType('Lab');
        if (!room || room === 'Room 201') setRoom('Lab 1');
      }
    }
  };

  const handleSave = (e, ignoreConflicts = false) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert('Please specify a subject');
      return;
    }

    if (isInvalidLabSlot) {
      alert(`Cannot schedule a 2-hour laboratory session at ${timeSlot} because it crosses the lunch recess (12:40 - 1:25) or exceeds timetable hours. Please select an earlier start time.`);
      return;
    }

    const facObj = availableFaculties.find(f => f.id === selectedFacultyId);
    const facultyName = facObj?.name || selectedFacultyId || 'Faculty Assigned';
    const selectedDeptObj = departments.find(d => d.id === classDeptId) || { id: classDeptId, name: classDeptId };

    const slotData = {
      subject: subject.trim(),
      name: fullName || subject.trim(),
      sem,
      div,
      batch,
      room: room.trim() || (isLab ? 'Lab 1' : 'Room 201'),
      type: isLab ? 'Lab' : type,
      color: color || getSubjectColor(subject),
      facultyId: selectedFacultyId || existingSlot?.facultyId,
      facultyName,
      departmentId: selectedDeptObj.id,
      department: selectedDeptObj.name,
      deptId: selectedDeptObj.id,
      dept: selectedDeptObj.name,
      span: isLab ? 2 : 1,
      duration: isLab ? '2 Hours' : '1 Hour',
      combinedTimeSlot: isLab ? combinedTime : timeSlot,
      sessionId: existingSlot?.sessionId,
      isLab
    };

    if (!ignoreConflicts) {
      const entryData = {
        ...slotData,
        semId: sem,
        divId: div,
        day,
        timeSlot
      };
      const foundConflicts = checkConflicts(entryData, existingSlot?.id);
      if (isLab && nextSlot) {
        const entryData2 = {
          ...slotData,
          semId: sem,
          divId: div,
          day,
          timeSlot: nextSlot
        };
        const foundConflicts2 = checkConflicts(entryData2, existingSlot?.id);
        foundConflicts2.forEach(c => {
          if (!foundConflicts.includes(c)) foundConflicts.push(c);
        });
      }
      if (foundConflicts.length > 0) {
        setConflicts(foundConflicts);
        return;
      }
    }

    onSave(day, timeSlot, slotData);
  };

  const handleClear = () => {
    const isMultiSession = existingSlot?.span > 1 || existingSlot?.sessionId || existingSlot?.type === 'Lab';
    const confirmMsg = isMultiSession
      ? `Clear this 2-hour laboratory session on ${day} (${existingSlot?.combinedTimeSlot || timeSlot})?\nBoth consecutive slots will be freed.`
      : `Clear this lecture slot on ${day} (${timeSlot})?`;

    if (window.confirm(confirmMsg)) {
      onClear(day, timeSlot, existingSlot?.sessionId);
      if (showToast) showToast(`Cleared slot on ${day} ${timeSlot}`);
      onClose();
    }
  };

  const selectedClassDeptName = departments.find(d => d.id === classDeptId)?.name || departmentName;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-primary)' }}>
              <Clock size={20} />
              {existingSlot ? 'Edit Timetable Slot' : 'Add Timetable Lecture'}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Class: {selectedClassDeptName} • {sem} • {div}
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Day & Time Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <Calendar size={14} style={{ color: 'var(--blue-primary)' }} />
                  Day
                </label>
                <select
                  className="form-control"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  {TIMETABLE_DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <Clock size={14} style={{ color: 'var(--blue-primary)' }} />
                  Time Slot
                </label>
                <select
                  className="form-control"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  {TIME_SLOTS.filter(s => s !== '12:40 - 1:25').map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2-Hour Laboratory Visual Notification Banner */}
            {isLab && nextSlot && (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FlaskConical size={20} style={{ color: '#059669', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#065f46' }}>
                    2-Hour Laboratory Session (2 Consecutive Slots)
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#047857', marginTop: '2px' }}>
                    Allocates <b>{timeSlot}</b> and <b>{nextSlot}</b> ({combinedTime}) • Merges into 1 continuous cell automatically
                  </div>
                </div>
              </div>
            )}

            {isInvalidLabSlot && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#991b1b' }}>
                    Cannot Allocate 2-Hour Laboratory
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '2px' }}>
                    {timeSlot.startsWith('11:50')
                      ? 'Crosses lunch recess (12:40 - 1:25). Please select an earlier or post-lunch time slot.'
                      : 'Exceeds timetable hours. Please select an earlier time slot.'}
                  </div>
                </div>
              </div>
            )}

            {/* Class Department & Semester */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <Building2 size={14} style={{ color: 'var(--blue-primary)' }} />
                  Class Department *
                </label>
                <select
                  className="form-control"
                  value={classDeptId}
                  onChange={(e) => setClassDeptId(e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d.id || d.name} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  Department of class/students being taught
                </span>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '13px' }}>Semester</label>
                <select
                  className="form-control"
                  value={sem}
                  onChange={(e) => setSem(e.target.value)}
                >
                  <option value="1st Sem">1st Sem</option>
                  <option value="2nd Sem">2nd Sem</option>
                  <option value="3rd Sem">3rd Sem</option>
                  <option value="4th Sem">4th Sem</option>
                  <option value="5th Sem">5th Sem</option>
                  <option value="6th Sem">6th Sem</option>
                  <option value="7th Sem">7th Sem</option>
                  <option value="8th Sem">8th Sem</option>
                </select>
              </div>
            </div>

            {/* Subject Dropdown / Custom Input */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                <BookOpen size={14} style={{ color: 'var(--blue-primary)' }} />
                Subject
              </label>
              <select
                className="form-control"
                onChange={handleSubjectSelect}
                defaultValue=""
              >
                <option value="" disabled>-- Select from Department Subjects --</option>
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code ? `${s.code} - ` : ''}{s.name} ({s.shortName || s.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Code / Short Title & Full Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '12px' }}>Badge Label</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. DBMS"
                  value={subject}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubject(val);
                    setColor(getSubjectColor(val));
                    if (isLabSession({ subject: val })) {
                      setType('Lab');
                      if (!room || room === 'Room 201') setRoom('Lab 1');
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '12px' }}>Subject Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Database Management Systems"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Division & Student Batch */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <Layers size={14} style={{ color: 'var(--blue-primary)' }} />
                  Division
                </label>
                <select
                  className="form-control"
                  value={div}
                  onChange={(e) => setDiv(e.target.value)}
                >
                  <option value="Div 1">Div 1</option>
                  <option value="Div 2">Div 2</option>
                  <option value="Div 3">Div 3</option>
                  <option value="All Div">All Divisions</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '13px' }}>Student Batch</label>
                <select
                  className="form-control"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                >
                  <option value="All">All Batches (Entire Class / Theory)</option>
                  <option value="Batch A">Batch A</option>
                  <option value="Batch B">Batch B</option>
                  <option value="Batch C">Batch C</option>
                  <option value="Batch D">Batch D</option>
                  {batch && !['All', 'ALL', 'Batch A', 'Batch B', 'Batch C', 'Batch D'].includes(String(batch).trim().replace(/^([A-D])$/i, 'Batch $1')) && (
                    <option value={batch}>{batch}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Faculty & Room */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '13px' }}>Assign Faculty</label>
                <select
                  className="form-control"
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                >
                  <option value="">-- Faculty (Optional) --</option>
                  {availableFaculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.dept || 'ADIT'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                  <MapPin size={14} style={{ color: 'var(--blue-primary)' }} />
                  Classroom / Lab
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={isLab ? 'e.g. Lab 1' : 'e.g. Room 201'}
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
            </div>

            {/* Slot Type */}
            <div className="form-group">
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Slot Type</label>
              <select
                className="form-control"
                value={type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setType(newType);
                  if (newType === 'Lab' && (!room || room === 'Room 201')) {
                    setRoom('Lab 1');
                  }
                }}
              >
                <option value="Lecture">Lecture (1 Slot)</option>
                <option value="Lab">Laboratory (2 Slots / 2 Hours)</option>
                <option value="Seminar">Seminar</option>
                <option value="Tutorial">Tutorial</option>
              </select>
            </div>

            {/* Color Accent Preview */}
            <div className="form-group">
              <label style={{ fontWeight: '700', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Badge Theme
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[
                  { id: 'purple', label: 'Purple (DBMS)', bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8' },
                  { id: 'green', label: 'Green (DS)', bg: '#dcfce7', border: '#86efac', text: '#15803d' },
                  { id: 'coral', label: 'Coral (Python)', bg: '#ffe4e6', border: '#fecdd3', text: '#be123c' },
                  { id: 'blue', label: 'Blue (Seminar)', bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1' },
                  { id: 'amber', label: 'Amber (Maths)', bg: '#fef3c7', border: '#fde68a', text: '#b45309' },
                  { id: 'cyan', label: 'Cyan (Networks)', bg: '#cffafe', border: '#a5f3fc', text: '#0e7490' },
                  { id: 'indigo', label: 'Indigo (OS)', bg: '#e0e7ff', border: '#c7d2fe', text: '#4338ca' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    title={c.label}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: c.bg,
                      border: color === c.id ? `2px solid ${c.text}` : `1px solid ${c.border}`,
                      cursor: 'pointer',
                      transform: color === c.id ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: color === c.id ? '0 0 0 2px white, 0 0 0 4px ' + c.text : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <div style={{ backgroundColor: '#fef9c3', padding: '12px', borderRadius: '8px', border: '1px solid #fde047', marginTop: '8px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#a16207', fontSize: '13px', fontWeight: 'bold' }}>Conflicts Detected</h4>
                <ul style={{ margin: '0', paddingLeft: '20px', color: '#854d0e', fontSize: '12px' }}>
                  {conflicts.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <button type="button" className="btn btn-sm" style={{ backgroundColor: '#ca8a04', color: 'white' }} onClick={(e) => handleSave(e, true)}>
                    Save Anyway
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            {existingSlot ? (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleClear}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={15} /> Clear Slot
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isInvalidLabSlot}>
                <Check size={16} /> Save Slot
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
