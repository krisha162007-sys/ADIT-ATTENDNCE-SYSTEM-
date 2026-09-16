import React, { useState } from 'react';
import { BarChart3, Percent, AlertTriangle, CheckCircle2, Search, Award } from 'lucide-react';
import { calculateAnalytics } from '../services/attendanceStorage';

export default function AnalyticsView({ searchQuery }) {
  const [localSearch, setLocalSearch] = useState('');
  const analytics = calculateAnalytics();

  const query = (searchQuery || localSearch).toLowerCase();

  const filteredStudentStats = analytics.studentStats.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.rollNo.includes(query) ||
    s.enrollmentNo.includes(query)
  );

  const lowAttendanceStudents = analytics.studentStats.filter(s => s.percentage < 75);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner Cards */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-icon">
            <Percent size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Overall Class Average</span>
            <div className="stat-value">{analytics.overallPercentage}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Conducted Sessions</span>
            <div className="stat-value">{analytics.totalSessions}</div>
          </div>
        </div>

        <div className={`stat-card ${lowAttendanceStudents.length > 0 ? 'warning' : 'success'}`}>
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Low Attendance (&lt;75%)</span>
            <div className="stat-value">{lowAttendanceStudents.length} Students</div>
          </div>
        </div>
      </div>

      {/* Low Attendance Warning Alert Banner */}
      {lowAttendanceStudents.length > 0 && (
        <div 
          style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h3 style={{ color: '#e11d48', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangle size={20} />
            Short Attendance Alert (&lt;75% Attendance)
          </h3>
          <p style={{ fontSize: '13px', color: '#9f1239', marginBottom: '16px' }}>
            The following {lowAttendanceStudents.length} students have fallen below the mandatory 75% attendance threshold:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {lowAttendanceStudents.map(s => (
              <div 
                key={s.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #fda4af',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: '800', fontSize: '13px', color: '#9f1239', display: 'block' }}>
                    Roll #{s.rollNo} - {s.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#be123c' }}>
                    {s.attended} / {s.totalAssigned} Sessions
                  </span>
                </div>
                <span className="badge badge-absent" style={{ fontSize: '13px', fontWeight: '800' }}>
                  {s.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Student Averages Table Card */}
      <div className="card">
        <div className="card-header-flex" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '22px' }}>
              <Award size={24} style={{ color: 'var(--blue-primary)' }} />
              Student Attendance Performance
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Detailed attendance breakdown and percentages per student.
            </p>
          </div>

          <div className="input-with-icon" style={{ width: '240px' }}>
            <Search className="input-icon" size={15} />
            <input
              type="text"
              className="form-control"
              placeholder="Search student..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={{ height: '38px' }}
            />
          </div>
        </div>

        <div className="table-responsive" style={{ marginTop: '20px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Enrollment No</th>
                <th>Attended / Total</th>
                <th style={{ width: '220px' }}>Attendance Progress</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudentStats.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudentStats.map((student) => {
                  const isGood = student.percentage >= 75;
                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: '800', color: 'var(--navy-primary)' }}>{student.rollNo}</td>
                      <td style={{ fontWeight: '700' }}>{student.name}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{student.enrollmentNo}</td>
                      <td style={{ fontWeight: '600' }}>
                        {student.attended} / {student.totalAssigned}
                      </td>
                      <td>
                        <div className="progress-bar-container">
                          <div
                            className={`progress-bar-fill ${isGood ? 'good' : 'warning'}`}
                            style={{ width: `${Math.min(student.percentage, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td style={{ fontWeight: '800', color: isGood ? 'var(--status-present)' : 'var(--status-absent)' }}>
                        {student.percentage}%
                      </td>
                      <td>
                        <span className={`badge ${isGood ? 'badge-present' : 'badge-absent'}`}>
                          {isGood ? 'Good Standing' : 'Shortage Alert'}
                        </span>
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
  );
}
