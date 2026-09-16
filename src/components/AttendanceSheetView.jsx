import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock, 
  HelpCircle,
  Building2,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  getStudents, 
  getSubjects, 
  getSessions, 
  saveSession, 
  getCollegeName, 
  setCollegeName 
} from '../services/attendanceStorage';

export default function AttendanceSheetView({ showToast }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('SUB_DS');
  const [selectedClass, setSelectedClass] = useState('3');
  const [selectedTerm, setSelectedTerm] = useState('Odd');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SHORTAGE, ELIGIBLE
  const [collegeTitle, setCollegeTitle] = useState(getCollegeName());
  const [showCollegePicker, setShowCollegePicker] = useState(false);
  const [hoveredSession, setHoveredSession] = useState(null);

  const students = getStudents();
  const subjects = getSubjects();
  const allSessions = getSessions();

  // Find active subject object
  const activeSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || subjects[0] || {
      code: '102040304',
      name: 'DATA STRUCTURES',
      dept: 'Computer',
      class: '3'
    };
  }, [subjects, selectedSubjectId]);

  // Filter sessions for the selected subject and sort ascending by date
  const subjectSessions = useMemo(() => {
    return allSessions
      .filter(s => s.subjectId === selectedSubjectId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allSessions, selectedSubjectId]);

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Match query with rollNo, name, enrollmentNo
      const query = searchQuery.trim().toLowerCase();
      const matchQuery = !query || 
        student.enrollmentNo.toLowerCase().includes(query) ||
        (student.name && student.name.toLowerCase().includes(query)) ||
        (student.rollNo && student.rollNo.toString().includes(query));

      if (!matchQuery) return false;

      // Calculate attendance for filtering
      let presentCount = 0;
      let totalConducted = subjectSessions.length;

      subjectSessions.forEach(sess => {
        const st = (sess.records && sess.records[student.id]) || '';
        if (st === 'present' || st === 'late') presentCount++;
      });

      const pct = totalConducted > 0 ? (presentCount / totalConducted) * 100 : 0;

      if (statusFilter === 'SHORTAGE') return pct < 75;
      if (statusFilter === 'ELIGIBLE') return pct >= 75;
      return true;
    });
  }, [students, searchQuery, statusFilter, subjectSessions]);

  // Format date header to DD-MM
  const formatDateHeader = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}`;
    }
    return dateStr;
  };

  // Toggle attendance status for a student on a session on click
  const handleCellClick = (session, studentId) => {
    const currentStatus = (session.records && session.records[studentId]) || 'absent';
    let nextStatus = 'present';
    if (currentStatus === 'present') nextStatus = 'absent';
    else if (currentStatus === 'absent') nextStatus = 'od';
    else if (currentStatus === 'od') nextStatus = 'present';

    const updatedRecords = { ...(session.records || {}), [studentId]: nextStatus };
    const updatedSession = { ...session, records: updatedRecords };
    
    saveSession(updatedSession);
    if (showToast) {
      showToast(`Updated Roll #${studentId}: marked as ${nextStatus.toUpperCase()}`);
    }
  };

  // Export to Excel file using SheetJS (.xlsx)
  const handleExportExcel = () => {
    const headerRow1 = [collegeTitle];
    const headerRow2 = [`Academic Year : ${academicYear}`, `Term: ${selectedTerm}`];
    const headerRow3 = [`Course Code : ${activeSubject.code} ${activeSubject.name}`];
    const headerRow4 = [`Department : ${activeSubject.dept || 'Computer'}`, `Class : ${selectedClass}`];
    const emptyRow = [];

    // Table Column Headers
    const dateHeaders = subjectSessions.map(s => formatDateHeader(s.date));
    const tableHeader = [
      'Sr No',
      'Enrollment No',
      ...dateHeaders,
      'Enrollment No',
      'Present',
      'Out of',
      'Percentage',
      'Percentage(DC)'
    ];

    // Data rows
    const dataRows = filteredStudents.map((st, idx) => {
      let present = 0;
      let od = 0;
      const total = subjectSessions.length;

      const dateStatuses = subjectSessions.map(sess => {
        const status = (sess.records && sess.records[st.id]) || '';
        if (status === 'present') {
          present++;
          return 'P';
        } else if (status === 'od') {
          od++;
          return 'O*';
        } else if (status === 'late') {
          present++;
          return 'P';
        } else if (status === 'absent') {
          return 'A';
        }
        return '-';
      });

      const pct = total > 0 ? ((present / total) * 100).toFixed(2) : '0.00';
      const pctDC = total > 0 ? ((od / total) * 100).toFixed(2) : '0.00';

      return [
        idx + 1,
        st.enrollmentNo,
        ...dateStatuses,
        st.enrollmentNo,
        present,
        total,
        Number(pct),
        Number(pctDC)
      ];
    });

    // Summary totals row
    const summaryRow = ['Total Present', ''];
    subjectSessions.forEach(sess => {
      let count = 0;
      filteredStudents.forEach(st => {
        const s = (sess.records && sess.records[st.id]);
        if (s === 'present' || s === 'late') count++;
      });
      summaryRow.push(count);
    });
    summaryRow.push('', '', '', '', '');

    const sheetData = [
      headerRow1,
      headerRow2,
      headerRow3,
      headerRow4,
      emptyRow,
      tableHeader,
      ...dataRows,
      summaryRow
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },  // Sr No
      { wch: 18 }, // Enrollment No
      ...subjectSessions.map(() => ({ wch: 7 })), // Dates
      { wch: 18 }, // Enrollment No repeated
      { wch: 9 },  // Present
      { wch: 8 },  // Out of
      { wch: 12 }, // Percentage
      { wch: 15 }  // Percentage(DC)
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet");
    const fileName = `${activeSubject.code}_Class_${selectedClass}_Attendance_${academicYear}.xlsx`;
    XLSX.writeFile(wb, fileName);

    if (showToast) showToast('Excel sheet downloaded successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  const changeCollege = (name) => {
    setCollegeTitle(name);
    setCollegeName(name);
    setShowCollegePicker(false);
    if (showToast) showToast(`College set to: ${name}`);
  };

  // Class analytics summary
  const totalConducted = subjectSessions.length;
  let totalPresentSum = 0;
  let eligibleCount = 0;
  let shortageCount = 0;

  filteredStudents.forEach(st => {
    let p = 0;
    subjectSessions.forEach(sess => {
      const s = sess.records && sess.records[st.id];
      if (s === 'present' || s === 'late') p++;
    });
    const pct = totalConducted > 0 ? (p / totalConducted) * 100 : 0;
    totalPresentSum += pct;
    if (pct >= 75) eligibleCount++;
    else shortageCount++;
  });

  const classAverage = filteredStudents.length > 0 ? (totalPresentSum / filteredStudents.length).toFixed(2) : '0.00';

  return (
    <div className="erp-attendance-view">
      {/* Control Bar (Hidden on Print) */}
      <div className="card no-print" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Filters on Left */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            {/* Course Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Select Course / Subject
              </label>
              <select
                className="form-control"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                style={{ height: '36px', minWidth: '260px', fontWeight: '600' }}
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Class / Div
              </label>
              <select
                className="form-control"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ height: '36px', width: '100px', fontWeight: '600' }}
              >
                <option value="3">Class 3</option>
                <option value="1">Class 1</option>
                <option value="2">Class 2</option>
                <option value="4">Class 4</option>
              </select>
            </div>

            {/* Term & Year */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Term & Year
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select
                  className="form-control"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  style={{ height: '36px', width: '85px', fontWeight: '600' }}
                >
                  <option value="Odd">Odd</option>
                  <option value="Even">Even</option>
                </select>
                <select
                  className="form-control"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  style={{ height: '36px', width: '100px', fontWeight: '600' }}
                >
                  <option value="2026-27">2026-27</option>
                  <option value="2025-26">2025-26</option>
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Attendance Status
              </label>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '36px', minWidth: '150px' }}
              >
                <option value="ALL">All Students ({students.length})</option>
                <option value="SHORTAGE">Shortage &lt; 75% ({shortageCount})</option>
                <option value="ELIGIBLE">Eligible &ge; 75% ({eligibleCount})</option>
              </select>
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Search Student
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enrollment / Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ height: '36px', paddingLeft: '32px', width: '170px' }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons on Right */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <button 
              className="btn btn-secondary"
              onClick={handleExportExcel}
              style={{ height: '38px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Download formatted Excel (.xlsx) file"
            >
              <FileSpreadsheet size={16} style={{ color: '#059669' }} />
              <span>Export Excel</span>
            </button>

            <button 
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ height: '38px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Print official academic sheet"
            >
              <Printer size={16} />
              <span>Print Sheet</span>
            </button>
          </div>

        </div>
      </div>

      {/* College Header Switcher Tooltip (Interactive) */}
      <div className="no-print" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          onClick={() => setShowCollegePicker(!showCollegePicker)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--blue-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'underline'
          }}
        >
          <Building2 size={13} />
          <span>Switch College Header ({collegeTitle.includes('GH') ? 'GCET' : 'ADIT'})</span>
          <ChevronDown size={12} />
        </button>
        {showCollegePicker && (
          <div style={{
            position: 'absolute',
            zIndex: 50,
            background: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <button 
              className="btn btn-sm btn-secondary" 
              style={{ textAlign: 'left', fontSize: '12px' }}
              onClick={() => changeCollege('G H Patel College of Engineering & Technology')}
            >
              G H Patel College of Engineering & Technology (GCET)
            </button>
            <button 
              className="btn btn-sm btn-secondary" 
              style={{ textAlign: 'left', fontSize: '12px' }}
              onClick={() => changeCollege('A D Patel Institute of Technology (ADIT)')}
            >
              A D Patel Institute of Technology (ADIT)
            </button>
          </div>
        )}
      </div>

      {/* Official College Attendance Grid Container */}
      <div className="erp-sheet-card">
        
        {/* Exact Header matching the user's reference photo */}
        <div className="erp-sheet-header">
          <h2 className="erp-college-title">{collegeTitle}</h2>
          <div className="erp-header-row">
            <span>Academic Year : {academicYear}</span>
            <span>Term: {selectedTerm}</span>
          </div>
          <div className="erp-header-row erp-course-title">
            <span>Course Code : {activeSubject.code} {activeSubject.name}</span>
          </div>
          <div className="erp-header-row">
            <span>Department : {activeSubject.dept || 'Computer'}</span>
            <span>Class : {selectedClass}</span>
          </div>
        </div>

        {/* Attendance Matrix Table */}
        <div className="erp-table-scroll-container">
          <table className="erp-attendance-table">
            <thead>
              <tr>
                <th className="erp-th-sticky-sr">Sr No</th>
                <th className="erp-th-sticky-enroll">Enrollment No</th>
                
                {/* Horizontal Date Columns */}
                {subjectSessions.map((sess) => {
                  const label = formatDateHeader(sess.date);
                  return (
                    <th 
                      key={sess.id} 
                      className="erp-th-date"
                      title={sess.topic ? `Date: ${sess.date}\nTopic: ${sess.topic}` : `Date: ${sess.date}`}
                    >
                      {label}
                    </th>
                  );
                })}

                {/* Summary Columns matching image */}
                <th className="erp-th-enroll-repeat">Enrollment No</th>
                <th className="erp-th-stat">Present</th>
                <th className="erp-th-stat">Out of</th>
                <th className="erp-th-stat">Percentage</th>
                <th className="erp-th-stat">Percentage(DC)</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={subjectSessions.length + 6} style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                    No students found matching current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  let presentCount = 0;
                  let odCount = 0;
                  const total = subjectSessions.length;

                  return (
                    <tr key={student.id}>
                      {/* Sr No */}
                      <td className="erp-td-sticky-sr">{idx + 1}</td>
                      
                      {/* Enrollment No */}
                      <td 
                        className="erp-td-sticky-enroll" 
                        title={`Roll #${student.rollNo}: ${student.name}`}
                      >
                        {student.enrollmentNo}
                      </td>

                      {/* Date Cells: P / A / OD */}
                      {subjectSessions.map(sess => {
                        const status = (sess.records && sess.records[student.id]) || '';
                        let cellClass = 'erp-cell-empty';
                        let displayText = '-';

                        if (status === 'present') {
                          presentCount++;
                          cellClass = 'erp-cell-p';
                          displayText = 'P';
                        } else if (status === 'late') {
                          presentCount++;
                          cellClass = 'erp-cell-p';
                          displayText = 'P';
                        } else if (status === 'absent') {
                          cellClass = 'erp-cell-a';
                          displayText = 'A';
                        } else if (status === 'od') {
                          odCount++;
                          cellClass = 'erp-cell-od';
                          displayText = 'O*';
                        }

                        return (
                          <td 
                            key={sess.id} 
                            className={`erp-attendance-cell ${cellClass}`}
                            onClick={() => handleCellClick(sess, student.id)}
                            title={`Click to toggle status for ${student.name} on ${sess.date} (Current: ${status.toUpperCase()})`}
                          >
                            {displayText}
                          </td>
                        );
                      })}

                      {/* Right Columns */}
                      <td className="erp-td-enroll-repeat">{student.enrollmentNo}</td>
                      <td className="erp-td-stat" style={{ fontWeight: '700' }}>{presentCount}</td>
                      <td className="erp-td-stat">{total}</td>
                      <td className="erp-td-stat" style={{ fontWeight: '700', color: (total > 0 && (presentCount / total) * 100 < 75) ? '#b91c1c' : '#15803d' }}>
                        {total > 0 ? ((presentCount / total) * 100).toFixed(presentCount / total === 1 ? 0 : 2) : 0}
                      </td>
                      <td className="erp-td-stat">
                        {total > 0 && odCount > 0 ? ((odCount / total) * 100).toFixed(2) : 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            
            {/* Table Footer Summary Row */}
            {filteredStudents.length > 0 && subjectSessions.length > 0 && (
              <tfoot>
                <tr className="erp-footer-row">
                  <td colSpan={2} style={{ textAlign: 'right', fontWeight: '700', paddingRight: '12px' }}>
                    Total Present:
                  </td>
                  {subjectSessions.map(sess => {
                    let count = 0;
                    filteredStudents.forEach(st => {
                      const s = sess.records && sess.records[st.id];
                      if (s === 'present' || s === 'late') count++;
                    });
                    return (
                      <td key={sess.id} className="erp-td-stat" style={{ fontWeight: '700' }}>
                        {count}
                      </td>
                    );
                  })}
                  <td className="erp-td-enroll-repeat">-</td>
                  <td className="erp-td-stat">-</td>
                  <td className="erp-td-stat">-</td>
                  <td className="erp-td-stat" style={{ fontWeight: '800' }}>{classAverage}%</td>
                  <td className="erp-td-stat">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Legend & Summary Info Bar at bottom */}
        <div className="erp-sheet-footer-info">
          <div className="erp-legend-box">
            <span style={{ fontWeight: '700', color: '#475569', marginRight: '6px' }}>Legend:</span>
            <span className="erp-legend-item">
              <span className="erp-legend-swatch erp-cell-p">P</span> Present
            </span>
            <span className="erp-legend-item">
              <span className="erp-legend-swatch erp-cell-a">A</span> Absent
            </span>
            <span className="erp-legend-item">
              <span className="erp-legend-swatch erp-cell-od">O*</span> Duty Certificate (OD)
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '12px' }}>
              (Tip: Click any cell to toggle P &harr; A &harr; O*)
            </span>
          </div>

          <div className="erp-stats-strip">
            <span>Total Students: <strong>{filteredStudents.length}</strong></span>
            <span>Total Lectures: <strong>{totalConducted}</strong></span>
            <span>Class Average: <strong>{classAverage}%</strong></span>
            <span>Shortage (&lt;75%): <strong style={{ color: '#b91c1c' }}>{shortageCount}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
