import React, { useState } from 'react';
import { Printer, Download, Filter, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { calculateAnalytics, getSubjects } from '../services/attendanceStorage';

export default function PrintView({ showToast }) {
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const analytics = calculateAnalytics();
  const subjects = getSubjects();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Roll No,Student Name,Enrollment No,Attended Sessions,Total Sessions,Attendance Percentage,Status\n";

    analytics.studentStats.forEach(s => {
      const row = `"${s.rollNo}","${s.name}","${s.enrollmentNo}",${s.attended},${s.totalAssigned},${s.percentage}%,${s.percentage >= 75 ? 'Eligible' : 'Shortage'}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ADIT_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast('Attendance report exported to CSV!');
  };

  const reportDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div>
      {/* Action Controls - Hidden on Print */}
      <div className="card no-print" style={{ marginBottom: '24px' }}>
        <div className="card-header-flex">
          <div>
            <h2 className="card-title" style={{ fontSize: '22px' }}>
              <Printer size={24} style={{ color: 'var(--blue-primary)' }} />
              Print & Export Attendance Report
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Generate official paper attendance sheets or download CSV data.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <FileSpreadsheet size={18} style={{ color: '#059669' }} />
              Export CSV File
            </button>
            
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={18} />
              Print Attendance Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet Card */}
      <div 
        className="card print-only-container"
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Printable Header */}
        <div style={{ borderBottom: '2px solid var(--navy-primary)', paddingBottom: '20px', marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', color: 'var(--navy-primary)', fontWeight: '800', textTransform: 'uppercase' }}>
            ADIT College of Engineering & Technology
          </h1>
          <h3 style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: '600', marginTop: '4px' }}>
            Department of Computer Engineering & Information Technology
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Official Academic Attendance Summary & Eligibility Report
          </p>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '12px', fontWeight: '700' }}>
            <span>Report Date: {reportDate}</span>
            <span>Academic Semester: 5th Sem</span>
            <span>Total Sessions: {analytics.totalSessions}</span>
            <span>Overall Average: {analytics.overallPercentage}%</span>
          </div>
        </div>

        {/* Printable Data Table */}
        <div className="table-responsive">
          <table className="data-table" style={{ width: '100%', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--blue-light)' }}>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Enrollment No</th>
                <th>Attended / Total</th>
                <th>Percentage %</th>
                <th>Exam Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.studentStats.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: '800' }}>{s.rollNo}</td>
                  <td style={{ fontWeight: '700' }}>{s.name}</td>
                  <td>{s.enrollmentNo}</td>
                  <td>{s.attended} / {s.totalAssigned}</td>
                  <td style={{ fontWeight: '800', color: s.percentage >= 75 ? 'var(--status-present)' : 'var(--status-absent)' }}>
                    {s.percentage}%
                  </td>
                  <td>
                    <span className={`badge ${s.percentage >= 75 ? 'badge-present' : 'badge-absent'}`}>
                      {s.percentage >= 75 ? 'Eligible' : 'Shortage'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures & Seal Section */}
        <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '180px', borderBottom: '1px dashed var(--text-dark)', marginBottom: '8px' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-dark)' }}>Class Coordinator</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '180px', borderBottom: '1px dashed var(--text-dark)', marginBottom: '8px' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-dark)' }}>Head of Department (HOD)</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '180px', borderBottom: '1px dashed var(--text-dark)', marginBottom: '8px' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-dark)' }}>Principal / Director</span>
          </div>
        </div>
      </div>
    </div>
  );
}
