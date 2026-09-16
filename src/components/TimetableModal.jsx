import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon, 
  UploadCloud, 
  X, 
  Check, 
  Calendar, 
  Clock, 
  Sparkles, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';
import { 
  getTimetable, 
  saveTimetable, 
  getUploadedFileInfo, 
  parseExcelFile, 
  parseImageOrPdfFile 
} from '../services/timetableStorage';
import { getSubjects } from '../services/attendanceStorage';

export default function TimetableModal({ onClose, onApplied, showToast }) {
  const [timetable, setTimetable] = useState(getTimetable());
  const [fileInfo, setFileInfo] = useState(getUploadedFileInfo());
  const [previewUrl, setPreviewUrl] = useState(fileInfo?.dataUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const subjects = getSubjects();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getSubjectObj = (subjId) => subjects.find(s => s.id === subjId) || { code: subjId, name: subjId };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        const parsed = await parseExcelFile(file);
        setTimetable(parsed);
        setFileInfo({
          name: file.name,
          type: 'excel',
          size: (file.size / 1024).toFixed(1) + ' KB',
          uploadTime: new Date().toLocaleDateString()
        });
        if (showToast) showToast(`Excel Timetable "${file.name}" successfully parsed & loaded!`);
      } else if (file.type.includes('image') || fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        const res = await parseImageOrPdfFile(file);
        setPreviewUrl(res.dataUrl);
        setFileInfo({
          name: file.name,
          type: 'image',
          dataUrl: res.dataUrl,
          size: (file.size / 1024).toFixed(1) + ' KB',
          uploadTime: new Date().toLocaleDateString()
        });
        if (showToast) showToast(`Image Timetable "${file.name}" uploaded! Schedule auto-synced.`);
      } else if (file.type.includes('pdf') || fileName.endsWith('.pdf')) {
        await parseImageOrPdfFile(file);
        setFileInfo({
          name: file.name,
          type: 'pdf',
          size: (file.size / 1024).toFixed(1) + ' KB',
          uploadTime: new Date().toLocaleDateString()
        });
        if (showToast) showToast(`PDF Timetable "${file.name}" loaded!`);
      } else {
        alert('Unsupported file format. Please upload a PNG, JPG, PDF, or Excel file.');
      }
    } catch (err) {
      console.error(err);
      alert('Error reading timetable file. Please try another format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAndApply = () => {
    saveTimetable(timetable, fileInfo);
    if (showToast) showToast('Timetable schedule saved & auto-sync active!');
    if (onApplied) onApplied();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-primary)' }}>
            <Calendar size={22} />
            Timetable Auto-Schedule Manager
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* File Upload Zone */}
          <div 
            style={{
              border: '2px dashed var(--blue-accent)',
              backgroundColor: 'var(--blue-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'center',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="file"
              accept=".png, .jpg, .jpeg, .pdf, .xlsx, .xls, .csv"
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />

            <UploadCloud size={40} style={{ color: 'var(--blue-primary)', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '16px', color: 'var(--navy-dark)', fontWeight: '700' }}>
              Upload Timetable File (PNG, JPG, PDF, Excel)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Drag & drop or click to upload your official class timetable spreadsheet or image.
            </p>
            
            <div style={{ marginTop: '12px', display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                <FileSpreadsheet size={12} /> Excel (.xlsx, .csv)
              </span>
              <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
                <ImageIcon size={12} /> Images (.png, .jpg)
              </span>
              <span className="badge" style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
                <FileText size={12} /> Document (.pdf)
              </span>
            </div>
          </div>

          {/* Active File Info Badge */}
          {fileInfo && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'white',
                border: '1px solid var(--blue-sky)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--status-present)' }} />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--navy-dark)' }}>
                    Active Timetable: {fileInfo.name}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                    Uploaded on {fileInfo.uploadTime} • {fileInfo.size} ({fileInfo.type.toUpperCase()})
                  </span>
                </div>
              </div>

              {fileInfo.dataUrl && (
                <a 
                  href={fileInfo.dataUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <Eye size={14} /> Preview Image
                </a>
              )}
            </div>
          )}

          {/* Weekly Schedule Day Tabs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--navy-dark)', fontWeight: '700' }}>
                Weekly Scheduled Lectures
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--blue-accent)', fontWeight: '700' }}>
                ⚡ Auto-syncs with Enter Attendance date picker
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
              {days.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`btn btn-sm ${selectedDay === day ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedDay(day)}
                  style={{ minWidth: '90px' }}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Selected Day Schedule Table */}
            <div className="table-responsive" style={{ marginTop: '12px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    <th>Subject Code & Name</th>
                    <th>Classroom / Lab</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {(!timetable[selectedDay] || timetable[selectedDay].length === 0) ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No lectures scheduled for {selectedDay}.
                      </td>
                    </tr>
                  ) : (
                    timetable[selectedDay].map((item, idx) => {
                      const subj = getSubjectObj(item.subjectId);
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: '800', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={14} style={{ color: 'var(--blue-primary)' }} />
                              {item.time}
                            </span>
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: 'var(--blue-light)', color: 'var(--navy-primary)' }}>
                              {subj.code}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '700', marginLeft: '8px' }}>
                              {subj.name}
                            </span>
                          </td>
                          <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.room}</td>
                          <td>
                            <span className={`badge ${item.type === 'Lab' ? 'badge-late' : 'badge-present'}`}>
                              {item.type}
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

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSaveAndApply}>
            <Check size={16} /> Save & Apply Timetable
          </button>
        </div>
      </div>
    </div>
  );
}
