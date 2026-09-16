import React, { useState } from 'react';
import { Calendar as CalendarIcon, BookOpen, Clock, UserX, CheckCircle, AlertTriangle } from 'lucide-react';
import { getSessions, getSubjects, getStudents } from '../services/attendanceStorage';

export default function DateView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const sessions = getSessions();
  const subjects = getSubjects();
  const students = getStudents();

  // Filter sessions for selected date
  const daySessions = sessions.filter(s => s.date === selectedDate);

  const getSubjectObj = (subjId) => subjects.find(s => s.id === subjId) || { code: subjId, name: subjId };

  return (
    <div className="card">
      <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '22px' }}>
            <CalendarIcon size={24} style={{ color: 'var(--blue-primary)' }} />
            Date-wise Attendance Inspector
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Select any date to inspect all lectures, topics covered, and attendance records on that date.
          </p>
        </div>

        {/* Date Selector input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: '700', fontSize: '14px' }}>Select Date:</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: '180px' }}
          />
        </div>
      </div>

      {daySessions.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3>No Lectures Recorded on {selectedDate}</h3>
          <p style={{ fontSize: '14px', marginTop: '6px' }}>Select another date or enter attendance for this date.</p>
        </div>
      ) : (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {daySessions.map((sess, idx) => {
            const subj = getSubjectObj(sess.subjectId);
            const recs = sess.records || {};
            
            const presentStudents = students.filter(s => recs[s.id] === 'present');
            const absentStudents = students.filter(s => recs[s.id] === 'absent');
            const lateStudents = students.filter(s => recs[s.id] === 'late');
            
            const total = students.length;
            const pct = total > 0 ? (((presentStudents.length + lateStudents.length * 0.8) / total) * 100).toFixed(1) : 0;

            return (
              <div 
                key={sess.id || idx}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Session Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span className="badge" style={{ backgroundColor: 'var(--blue-light)', color: 'var(--navy-primary)', marginBottom: '8px' }}>
                      Lecture #{idx + 1} - {subj.code}
                    </span>
                    <h3 style={{ fontSize: '18px', color: 'var(--navy-dark)', marginTop: '4px' }}>
                      {subj.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Faculty: {subj.faculty || 'Faculty'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Lecture Attendance %</span>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: pct >= 75 ? 'var(--status-present)' : 'var(--status-absent)' }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Topic Banner */}
                <div 
                  style={{
                    backgroundColor: 'var(--blue-light)',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '16px',
                    border: '1px solid var(--blue-sky)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <BookOpen size={20} style={{ color: 'var(--blue-primary)' }} />
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--blue-accent)', fontWeight: '700', letterSpacing: '0.05em' }}>
                      Topic Covered in Lecture
                    </span>
                    <h4 style={{ fontSize: '15px', color: 'var(--navy-primary)', fontWeight: '700' }}>
                      {sess.topic || 'No topic entered'}
                    </h4>
                  </div>
                </div>

                {/* Status Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                  <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-present-bg)', border: '1px solid var(--status-present-border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--status-present)', fontWeight: '700' }}>Present Students</span>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--status-present)' }}>{presentStudents.length}</div>
                  </div>

                  <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-absent-bg)', border: '1px solid var(--status-absent-border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--status-absent)', fontWeight: '700' }}>Absent Students</span>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--status-absent)' }}>{absentStudents.length}</div>
                  </div>

                  <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-late-bg)', border: '1px solid var(--status-late-border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--status-late)', fontWeight: '700' }}>Late Arrivals</span>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--status-late)' }}>{lateStudents.length}</div>
                  </div>
                </div>

                {/* Absent Student List Warning */}
                {absentStudents.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--status-absent)', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserX size={15} /> Absent Students List:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {absentStudents.map(s => (
                        <span key={s.id} className="badge badge-absent">
                          Roll #{s.rollNo}: {s.name} {sess.remarks && sess.remarks[s.id] ? `(${sess.remarks[s.id]})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
