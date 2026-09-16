import React from 'react';
import { 
  Users, 
  Percent, 
  BookOpen, 
  AlertTriangle, 
  UserCheck, 
  PlusCircle, 
  ArrowRight, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { calculateAnalytics, getSessions, getSubjects } from '../services/attendanceStorage';

export default function Dashboard({ setActiveTab, onSelectSessionForEdit }) {
  const analytics = calculateAnalytics();
  const recentSessions = getSessions().slice(0, 5);
  const subjects = getSubjects();

  const getSubjectName = (subjId) => {
    const s = subjects.find(item => item.id === subjId);
    return s ? `${s.code} - ${s.name}` : subjId;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          border: 'none',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9 }}>
              ADIT Academic Attendance Portal
            </span>
            <h2 style={{ color: 'white', fontSize: '26px', marginTop: '6px', fontWeight: '800' }}>
              Welcome to ADIT Attendance System
            </h2>
            <p style={{ marginTop: '6px', opacity: 0.9, maxWidth: '600px', fontSize: '14px' }}>
              Track daily student attendance, log covered topics, monitor class averages, handle date-wise logs, and generate printable reports.
            </p>
          </div>
          <button
            className="btn"
            style={{
              backgroundColor: 'white',
              color: 'var(--navy-primary)',
              fontWeight: '700',
              padding: '12px 24px',
              fontSize: '15px'
            }}
            onClick={() => setActiveTab('enter')}
          >
            <PlusCircle size={18} />
            Enter Attendance Session
          </button>
        </div>
      </div>



      {/* Main Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Recent Attendance Sessions Card */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-title">
              <Clock size={20} style={{ color: 'var(--blue-primary)' }} />
              Recent Attendance Sessions
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('list')}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Semester</th>
                  <th>Subject</th>
                  <th>Topic Covered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No attendance sessions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentSessions.map((sess) => {
                    const subj = subjects.find(s => s.id === sess.subjectId);
                    const semLabel = sess.sem || (subj && subj.sem) || '5th Sem';
                    return (
                      <tr key={sess.id}>
                        <td style={{ fontWeight: '700', whiteSpace: 'nowrap' }}>{sess.date}</td>
                        <td>
                          <span className="badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--navy-dark)', border: '1px solid var(--border-color)', fontWeight: '700' }}>
                            {semLabel}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: 'var(--blue-light)', color: 'var(--blue-primary)', border: '1px solid var(--blue-sky)' }}>
                            {subj ? subj.code : sess.subjectId}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sess.topic || 'No topic entered'}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              if (onSelectSessionForEdit) onSelectSessionForEdit(sess);
                              setActiveTab('list');
                            }}
                          >
                            Details
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

        {/* Subject Performance & Progress Card */}
        <div className="card">
          <div className="card-header-flex">
            <h3 className="card-title">
              <CheckCircle2 size={20} style={{ color: 'var(--blue-primary)' }} />
              Subject Attendance Rates
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('analytics')}>
              Full Analytics <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analytics.subjectStats.map((subj) => (
              <div key={subj.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700' }}>
                  <span>{subj.code} - {subj.name}</span>
                  <span style={{ color: subj.percentage >= 75 ? 'var(--status-present)' : 'var(--status-absent)' }}>
                    {subj.percentage}% ({subj.sessionCount} sessions)
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar-fill ${subj.percentage >= 75 ? 'good' : 'warning'}`}
                    style={{ width: `${subj.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
