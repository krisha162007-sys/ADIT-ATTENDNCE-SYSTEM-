import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  Save, 
  AlertCircle,
  Calendar,
  BookOpen,
  Table2,
  List
} from 'lucide-react';
import { getSessions, getSubjects, getStudents, getStudentsByClassId, saveSession, deleteSession } from '../services/attendanceStorage';
import AttendanceSheetView from './AttendanceSheetView';

export default function AttendanceList({ searchQuery, showToast }) {
  const sessions = getSessions();
  const subjects = getSubjects();
  const students = getStudents();

  const [subView, setSubView] = useState('sheet'); // 'sheet' | 'logs'
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [editingSession, setEditingSession] = useState(null);
  const [viewingSession, setViewingSession] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  // Edit form state
  const [editDate, setEditDate] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editRecords, setEditRecords] = useState({});
  const [editRemarks, setEditRemarks] = useState({});

  const getSubjectObj = (subjId) => subjects.find(s => s.id === subjId) || { code: subjId, name: subjId };

  // Filter sessions
  const filteredSessions = sessions.filter(sess => {
    const subjMatch = selectedSubject === 'ALL' || sess.subjectId === selectedSubject;
    const query = searchQuery.toLowerCase();
    const topicMatch = (sess.topic || '').toLowerCase().includes(query);
    const dateMatch = (sess.date || '').toLowerCase().includes(query);
    const subjObj = getSubjectObj(sess.subjectId);
    const subjNameMatch = (subjObj.name || '').toLowerCase().includes(query) || (subjObj.code || '').toLowerCase().includes(query);

    return subjMatch && (topicMatch || dateMatch || subjNameMatch || !query);
  });

  const startEdit = (sess) => {
    setEditingSession(sess);
    setEditDate(sess.date);
    setEditTopic(sess.topic || '');
    setEditRecords({ ...sess.records });
    setEditRemarks({ ...(sess.remarks || {}) });
  };

  const saveEdit = () => {
    if (!editingSession) return;
    const updated = {
      ...editingSession,
      date: editDate,
      topic: editTopic.trim(),
      records: editRecords,
      remarks: editRemarks
    };
    saveSession(updated);
    setEditingSession(null);
    if (showToast) showToast('Attendance session successfully updated!');
  };

  const confirmDelete = () => {
    if (deletingSessionId) {
      deleteSession(deletingSessionId);
      setDeletingSessionId(null);
      if (showToast) showToast('Attendance session deleted!');
    }
  };

  return (
    <div>
      {/* View Mode Switcher Tabs */}
      <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button
          className={`btn ${subView === 'sheet' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubView('sheet')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '9px 18px', 
            fontWeight: '700',
            boxShadow: subView === 'sheet' ? 'var(--shadow-md)' : 'none'
          }}
        >
          <Table2 size={17} />
          <span>College Attendance Sheet (ERP Grid)</span>
        </button>

        <button
          className={`btn ${subView === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubView('logs')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '9px 18px', 
            fontWeight: '700',
            boxShadow: subView === 'logs' ? 'var(--shadow-md)' : 'none'
          }}
        >
          <List size={17} />
          <span>Session Records Log & Edit</span>
        </button>
      </div>

      {subView === 'sheet' ? (
        <AttendanceSheetView showToast={showToast} />
      ) : (
        <div className="card">
      <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '22px' }}>
            <FileText size={24} style={{ color: 'var(--blue-primary)' }} />
            Attendance Records Log
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            View, edit topics/statuses, or delete attendance session records.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            className="form-control"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ width: '220px', height: '38px' }}
          >
            <option value="ALL">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Sessions Table */}
      <div className="table-responsive" style={{ marginTop: '20px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Semester</th>
              <th>Subject</th>
              <th>Topic Covered</th>
              <th>Present / Total</th>
              <th>Session Attendance %</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No attendance records found.
                </td>
              </tr>
            ) : (
              filteredSessions.map((sess) => {
                const subj = getSubjectObj(sess.subjectId);
                const semLabel = sess.sem || (subj && subj.sem) || '5th Sem';
                const recs = Object.values(sess.records || {});
                const total = recs.length;
                const present = recs.filter(st => st === 'present').length;
                const late = recs.filter(st => st === 'late').length;
                const dontCare = recs.filter(st => st === 'dont_care' || st === 'od').length;
                const effectivePresent = present + (late * 0.8);
                const gradedTotal = total - dontCare;
                const pct = gradedTotal > 0 ? ((effectivePresent / gradedTotal) * 100).toFixed(1) : (total > 0 ? '100.0' : 0);

                return (
                  <tr key={sess.id}>
                    <td style={{ fontWeight: '700', whiteSpace: 'nowrap' }}>{sess.date}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--navy-dark)', border: '1px solid var(--border-color)', fontWeight: '700' }}>
                        {semLabel}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--blue-light)', color: 'var(--navy-primary)', border: '1px solid var(--blue-sky)' }}>
                        {subj.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', maxWidth: '280px' }}>
                      {sess.topic || <em style={{ color: 'var(--text-light)' }}>No topic specified</em>}
                    </td>
                    <td>
                      <span style={{ fontWeight: '700' }}>{present}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}> / {total}</span>
                      {late > 0 && <span style={{ fontSize: '11px', color: 'var(--status-late)', marginLeft: '4px' }}>({late} late)</span>}
                      {dontCare > 0 && <span style={{ fontSize: '11px', color: '#475569', marginLeft: '4px', fontWeight: '700' }}>({dontCare} DC)</span>}
                    </td>
                    <td>
                      <span className={`badge ${pct >= 75 ? 'badge-present' : 'badge-absent'}`}>
                        {pct}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewingSession(sess)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEdit(sess)}
                          title="Edit Session & Attendance"
                          style={{ color: 'var(--blue-primary)' }}
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeletingSessionId(sess.id)}
                          title="Delete Session"
                        >
                          <Trash2 size={14} />
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

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} style={{ color: 'var(--blue-primary)' }} />
                Edit Attendance Record
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingSession(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Topic Covered</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '14px', margin: 0, color: 'var(--navy-dark)' }}>
                  Student Attendance & Remarks
                </h4>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => {
                      const updated = { ...editRecords };
                      const sList = (editingSession.classId ? getStudentsByClassId(editingSession.classId) : []) || students;
                      const activeSList = sList.length > 0 ? sList : students;
                      activeSList.forEach(s => { updated[s.id] = 'present'; });
                      setEditRecords(updated);
                    }}
                  >
                    All Present
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => {
                      const updated = { ...editRecords };
                      const sList = (editingSession.classId ? getStudentsByClassId(editingSession.classId) : []) || students;
                      const activeSList = sList.length > 0 ? sList : students;
                      activeSList.forEach(s => { updated[s.id] = 'absent'; });
                      setEditRecords(updated);
                    }}
                  >
                    All Absent
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => {
                      const updated = { ...editRecords };
                      const sList = (editingSession.classId ? getStudentsByClassId(editingSession.classId) : []) || students;
                      const activeSList = sList.length > 0 ? sList : students;
                      activeSList.forEach(s => { updated[s.id] = 'dont_care'; });
                      setEditRecords(updated);
                    }}
                  >
                    All Don't Care
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }} className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sList = (editingSession.classId ? getStudentsByClassId(editingSession.classId) : []) || students;
                      const activeSList = sList.length > 0 ? sList : students;
                      return activeSList.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '700' }}>{s.rollNo}</td>
                          <td>
                            <div>{s.name}</div>
                            {s.enrollmentNo && <span style={{ fontSize: '11px', color: '#64748b' }}>{s.enrollmentNo}</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <select
                              className="form-control"
                              value={editRecords[s.id] || 'present'}
                              onChange={(e) => setEditRecords({ ...editRecords, [s.id]: e.target.value })}
                              style={{ height: '32px', fontSize: '12px', padding: '4px 8px', fontWeight: '700' }}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="dont_care">Don't Care</option>
                              <option value="late">Late</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={editRemarks[s.id] || ''}
                              onChange={(e) => setEditRemarks({ ...editRemarks, [s.id]: e.target.value })}
                              style={{ height: '32px', fontSize: '12px' }}
                            />
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingSession(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Session Details Drawer/Modal */}
      {viewingSession && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Session Details: {viewingSession.date}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewingSession(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--blue-light)', borderRadius: 'var(--radius-md)' }}>
                <p><strong>Subject:</strong> {getSubjectObj(viewingSession.subjectId).name} ({getSubjectObj(viewingSession.subjectId).code})</p>
                <p><strong>Topic Covered:</strong> {viewingSession.topic || 'N/A'}</p>
                {viewingSession.facultyName && <p><strong>Faculty:</strong> {viewingSession.facultyName}</p>}
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sList = (viewingSession.classId ? getStudentsByClassId(viewingSession.classId) : []) || students;
                      const activeSList = sList.length > 0 ? sList : students;
                      return activeSList.map(s => {
                        const st = viewingSession.records ? viewingSession.records[s.id] : 'absent';
                        const rem = viewingSession.remarks ? viewingSession.remarks[s.id] : '';
                        const isDC = st === 'dont_care' || st === 'od';
                        return (
                          <tr key={s.id}>
                            <td>{s.rollNo}</td>
                            <td>{s.name}</td>
                            <td>
                              <span className={`badge ${isDC ? 'badge-dontcare' : `badge-${st}`}`}>
                                {isDC ? "Don't Care" : st}
                              </span>
                            </td>
                            <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{rem || '-'}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingSession(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deletingSessionId && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} /> Delete Attendance Session
              </h3>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to delete this attendance record? This action cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingSessionId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                <Trash2 size={16} /> Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      )}
    </div>
  );
}
