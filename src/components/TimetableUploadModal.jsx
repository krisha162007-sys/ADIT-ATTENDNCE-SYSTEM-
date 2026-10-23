import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Check, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Loader2,
  Calendar,
  Clock,
  BookOpen,
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  parseExcelTimetableForFaculty, 
  parseExcelTimetableForClass,
  parsePdfTimetable,
  parseImageTimetable,
  parseImageOrPdfFile,
  normalizeTimetable,
  validateTimetable,
  commitUploadedTimetable,
  applyUploadedFacultyTimetable,
  applyUploadedClassTimetable,
  TIME_SLOTS, 
  TIMETABLE_DAYS,
  downloadFacultyTimetableTemplate,
  downloadClassTimetableTemplate
} from '../services/timetableStorage';
import { getFaculties } from '../services/attendanceStorage';

export default function TimetableUploadModal({
  selectedFaculty: initialFaculty,
  departmentName = 'AI & Data Science',
  semesterName = '3rd Semester',
  divisionName = 'Div 1',
  initialScope = 'faculty',
  onClose,
  onTimetableUpdated,
  showToast
}) {
  const [targetScope, setTargetScope] = useState(initialScope); // 'faculty' or 'class'
  const [selectedFaculty, setSelectedFaculty] = useState(initialFaculty || { id: 'FAC_PS', name: 'Prof. Priya Shah' });
  const [selectedSem, setSelectedSem] = useState(semesterName);
  const [selectedDiv, setSelectedDiv] = useState(divisionName);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  // Debug pipeline tracking
  const [debugInfo, setDebugInfo] = useState(null);


  const allFaculties = getFaculties();

  // Handle file input
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setErrorMessage('');
    setIsProcessing(true);
    setPreviewData(null);
    setPreviewImage(null);
    setDebugInfo(null);

    const fileName = file.name.toLowerCase();
    const debug = {
      stage: 'started',
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + ' KB',
      fileType: file.type || 'unknown',
      textExtracted: false,
      textLength: 0,
      entriesDetected: 0,
      validEntries: 0,
      timetableBuilt: false,
      error: null,
      note: ''
    };

    console.log('[UPLOAD] File selected:', file.name, file.type, file.size, 'bytes');

    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
        debug.stage = 'parsing-excel';
        console.log('[UPLOAD] Parsing Excel/CSV...');
        let res;
        if (targetScope === 'faculty') {
          res = await parseExcelTimetableForFaculty(file, selectedFaculty?.id || 'FAC_PS', selectedSem, selectedDiv, departmentName);
        } else {
          res = await parseExcelTimetableForClass(file, selectedSem, selectedDiv, departmentName);
        }
        console.log("Excel parsed:", res.previewLectures);
        console.log("Normalized entries:", res.previewLectures);
        debug.stage = 'excel-done';
        debug.entriesDetected = res.previewLectures?.length || 0;
        debug.validEntries = res.previewLectures?.length || 0;
        debug.timetableBuilt = !!res.timetable;
        setDebugInfo(debug);
        setPreviewData(res);
        if (showToast) showToast(`Spreadsheet parsed: ${res.summary?.totalLectures || 0} lectures detected!`);

      } else if (file.type.startsWith('image/') || /\.(png|jpe?g|gif|bmp|webp)$/i.test(fileName)) {
        debug.stage = 'parsing-image';
        console.log('[UPLOAD] Reading image file with OCR...');
        const res = await parseImageTimetable(file, targetScope, selectedFaculty?.id || 'FAC_PS', selectedSem, selectedDiv, departmentName);
        console.log("Image OCR text:", res.note);
        console.log("Image parsed entries:", res.previewLectures);
        console.log("Normalized entries:", res.previewLectures);
        debug.stage = 'image-done';
        debug.note = res.note || '';
        debug.timetableBuilt = !!res.timetable;
        debug.entriesDetected = res.previewLectures?.length || 0;
        debug.validEntries = res.previewLectures?.length || 0;
        setDebugInfo(debug);
        setPreviewImage(res.dataUrl);
        setPreviewData(res);
        if (showToast) showToast(`Image parsed: ${res.summary?.totalLectures || 0} lectures recognized via OCR!`);

      } else if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        debug.stage = 'parsing-pdf';
        console.log('[UPLOAD] Reading PDF file via PDF.js...');
        const res = await parsePdfTimetable(file, targetScope, selectedFaculty?.id || 'FAC_PS', selectedSem, selectedDiv, departmentName);
        console.log("PDF parsed entries:", res.previewLectures);
        console.log("Normalized entries:", res.previewLectures);
        debug.stage = 'pdf-done';
        debug.textExtracted = (res.previewLectures?.length || 0) > 0;
        debug.textLength = (res.previewLectures?.length || 0) > 0 ? 'yes' : 'none';
        debug.entriesDetected = res.previewLectures?.length || 0;
        debug.validEntries = res.previewLectures?.length || 0;
        debug.timetableBuilt = !!res.timetable;
        debug.note = res.note || '';
        setDebugInfo(debug);
        setPreviewData(res);

        if (res.previewLectures?.length > 0) {
          if (showToast) showToast(`PDF parsed: ${res.summary?.totalLectures || res.previewLectures.length} timetable entries detected!`);
        } else {
          if (showToast) showToast(`PDF loaded - review details below`);
        }

      } else {
        setErrorMessage('Unsupported file format. Please upload Excel (.xlsx, .csv), Image (.png, .jpg), or PDF.');
      }
    } catch (err) {
      console.error('[UPLOAD] Error:', err);
      debug.error = err.message;
      debug.stage = 'error';
      setDebugInfo(debug);
      setErrorMessage(err.message || 'Error reading timetable file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Appropriate Template
  const handleDownloadTemplate = () => {
    if (targetScope === 'faculty') {
      downloadFacultyTimetableTemplate(selectedFaculty?.name || 'Faculty Member', departmentName, selectedSem);
      if (showToast) showToast('Faculty timetable template downloaded!');
    } else {
      downloadClassTimetableTemplate(departmentName, selectedSem, selectedDiv);
      if (showToast) showToast('Class timetable template downloaded!');
    }
  };

  // Apply Changes & Commit to Storage
  const handleApply = () => {
    if (!previewData || !previewData.timetable) {
      alert('Please upload a timetable file with recognizable entries first.');
      return;
    }

    const validation = validateTimetable(previewData);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Timetable data is incomplete or invalid.');
      return;
    }

    console.log("Entries being saved:", previewData.timetable);

    try {
      if (targetScope === 'faculty') {
        commitUploadedTimetable('faculty', selectedFaculty.id, previewData);
        if (onTimetableUpdated) onTimetableUpdated(previewData.timetable, selectedFaculty.id);
        if (showToast) showToast(`Timetable updated & synced for ${selectedFaculty?.name || 'Faculty'}!`);
      } else {
        commitUploadedTimetable('class', null, previewData, { sem: selectedSem, div: selectedDiv, departmentName });
        if (onTimetableUpdated) onTimetableUpdated(previewData.timetable, null, selectedSem, selectedDiv);
        if (showToast) showToast(`Class timetable updated & synced for ${selectedSem} ${selectedDiv}!`);
      }
      onClose();
    } catch (err) {
      console.error('Error applying timetable:', err);
      setErrorMessage('Failed to apply timetable: ' + err.message);
    }
  };



  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <UploadCloud size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                Upload Academic Timetable
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {departmentName} • Bi-directional sync across all related faculty & class schedules
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Target Scope Switcher */}
          <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setTargetScope('faculty');
                setPreviewData(null);
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: targetScope === 'faculty' ? 'white' : 'transparent',
                color: targetScope === 'faculty' ? '#2563eb' : '#64748b',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: targetScope === 'faculty' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Faculty Member Timetable
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetScope('class');
                setPreviewData(null);
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: targetScope === 'class' ? 'white' : 'transparent',
                color: targetScope === 'class' ? '#2563eb' : '#64748b',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: targetScope === 'class' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Class / Division Timetable
            </button>
          </div>

          {/* Scope Target Selectors */}
          {targetScope === 'faculty' ? (
            <div className="form-group">
              <label style={{ fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} style={{ color: '#2563eb' }} />
                Target Faculty Member
              </label>
              <select
                className="form-control"
                value={selectedFaculty?.id}
                onChange={(e) => {
                  const fac = allFaculties.find(f => f.id === e.target.value);
                  if (fac) setSelectedFaculty(fac);
                }}
              >
                {allFaculties.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.dept || departmentName})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '12.5px' }}>Semester</label>
                <select
                  className="form-control"
                  value={selectedSem}
                  onChange={(e) => setSelectedSem(e.target.value)}
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '12.5px' }}>Division</label>
                <select
                  className="form-control"
                  value={selectedDiv}
                  onChange={(e) => setSelectedDiv(e.target.value)}
                >
                  <option value="Div 1">Div 1</option>
                  <option value="Div 2">Div 2</option>
                  <option value="Div 3">Div 3</option>
                </select>
              </div>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div 
            style={{
              border: '2px dashed #93c5fd',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '24px 20px',
              textAlign: 'center',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="file"
              accept=".xlsx, .xls, .csv, .png, .jpg, .jpeg, .pdf"
              onChange={handleFileChange}
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

            {isProcessing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={36} className="animate-spin" style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a' }}>
                  Processing and mapping timetable lectures...
                </span>
              </div>
            ) : (
              <>
                <UploadCloud size={40} style={{ color: '#2563eb', margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '14.5px', color: '#0f172a', fontWeight: '700' }}>
                  Click to select file or drag & drop here
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Formats: Excel (.xlsx, .csv), Scanned Images (.png, .jpg), PDF documents
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                  <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                    <FileSpreadsheet size={12} /> Excel Sheet
                  </span>
                  <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
                    <ImageIcon size={12} /> Scanned Photo
                  </span>
                  <span className="badge" style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
                    <FileText size={12} /> PDF Document
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              borderRadius: '8px',
              fontSize: '12.5px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── DEBUG PIPELINE PANEL ── shows exactly where PDF data goes */}
          {debugInfo && !errorMessage && (
            <div style={{
              padding: '12px 14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontFamily: 'monospace'
            }}>
              <div style={{ fontWeight: '700', fontSize: '12px', color: '#334155', marginBottom: '8px' }}>
                📊 Upload Pipeline Trace
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                <span style={{ color: '#64748b' }}>File:</span>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>{debugInfo.fileName} ({debugInfo.fileSize})</span>

                <span style={{ color: '#64748b' }}>Type:</span>
                <span style={{ color: '#0f172a' }}>{debugInfo.fileType}</span>

                <span style={{ color: '#64748b' }}>Stage:</span>
                <span style={{ color: debugInfo.stage === 'error' ? '#dc2626' : '#059669', fontWeight: '600' }}>
                  {debugInfo.stage}
                </span>

                <span style={{ color: '#64748b' }}>Entries detected:</span>
                <span style={{
                  color: debugInfo.entriesDetected > 0 ? '#059669' : '#dc2626',
                  fontWeight: '700'
                }}>
                  {debugInfo.entriesDetected}
                  {debugInfo.entriesDetected === 0 && debugInfo.fileType === 'application/pdf' ? ' ← no text layer found' : ''}
                </span>

                <span style={{ color: '#64748b' }}>Timetable built:</span>
                <span style={{ color: debugInfo.timetableBuilt ? '#059669' : '#dc2626', fontWeight: '700' }}>
                  {debugInfo.timetableBuilt ? 'YES ✓' : 'NO ✗'}
                </span>
              </div>

              {debugInfo.note && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: debugInfo.entriesDetected > 0 ? '#ecfdf5' : '#fef9c3',
                  borderRadius: '6px',
                  color: debugInfo.entriesDetected > 0 ? '#065f46' : '#92400e',
                  fontSize: '11px'
                }}>
                  ℹ️ {debugInfo.note}
                </div>
              )}

              {/* Scanned PDF guidance */}
              {debugInfo.fileType === 'application/pdf' && debugInfo.entriesDetected === 0 && (
                <div style={{
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  color: '#7c2d12'
                }}>
                  <strong>⚠️ Scanned/Image PDF detected</strong><br/>
                  This PDF has no selectable text layer (it's a scanned image). In-browser OCR requires
                  Tesseract.js which is not installed. <br/>
                  <strong>Options:</strong> (1) Use the Excel template instead — click "Download Template" above.
                  (2) Re-create the PDF from Excel using "Save as PDF". (3) Add slots manually via the timetable grid.
                </div>
              )}
            </div>
          )}

          {/* Uploaded File Info & Live Slot Preview */}
          {previewData && (

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} style={{ color: '#059669' }} />
                  <div>
                    <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#065f46', display: 'block' }}>
                      {previewData.fileInfo?.name || uploadedFile?.name}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#047857' }}>
                      {previewData.fileInfo?.size} • {previewData.summary?.totalLectures || previewData.previewLectures?.length || 0} lectures mapped across {previewData.summary?.activeDays || 0} days
                    </span>
                  </div>
                </div>

                {previewImage && (
                  <a
                    href={previewImage}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    <Eye size={12} /> View Scan
                  </a>
                )}
              </div>

              {/* Validation Summary and Error Reporting */}
              {previewData.errorRows && previewData.errorRows.length > 0 && (
                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#991b1b'
                }}>
                  <div style={{ fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} />
                    <span>{previewData.errorRows.length} Row Validation Error(s) Detected:</span>
                  </div>
                  <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: 1.5 }}>
                    {previewData.errorRows.slice(0, 5).map((err, i) => (
                      <li key={i}>{err.error || err.message}</li>
                    ))}
                    {previewData.errorRows.length > 5 && (
                      <li>...and {previewData.errorRows.length - 5} more error rows.</li>
                    )}
                  </ul>
                </div>
              )}

              {previewData.conflictRows && previewData.conflictRows.length > 0 && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#92400e'
                }}>
                  <div style={{ fontWeight: '800', marginBottom: '2px' }}>
                    ⚠️ {previewData.conflictRows.length} Potential Conflict(s) Detected:
                  </div>
                  <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: 1.4 }}>
                    {previewData.conflictRows.slice(0, 3).map((c, i) => (
                      <li key={i}>{c.warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detected lectures preview table */}
              {previewData.previewLectures && previewData.previewLectures.length > 0 && (
                <div style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}>
                  <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0 }}>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Day</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Time</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Subject</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Room</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>{targetScope === 'faculty' ? 'Class • Batch' : 'Faculty'}</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.previewLectures.map((lec, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 10px', fontWeight: '700' }}>{lec.day}</td>
                          <td style={{ padding: '6px 10px', color: '#64748b' }}>{lec.time}</td>
                          <td style={{ padding: '6px 10px' }}>
                            <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '700' }}>
                              {lec.subject}
                            </span>
                          </td>
                          <td style={{ padding: '6px 10px', color: '#64748b' }}>{lec.room}</td>
                          <td style={{ padding: '6px 10px', color: '#334155', fontWeight: '600' }}>
                            {targetScope === 'faculty' 
                              ? `${lec.sem} ${lec.div}${lec.batch && lec.batch !== 'All' ? ` (${lec.batch})` : ''}` 
                              : (lec.facultyName || 'Assigned')}
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            {lec.status === 'conflict' ? (
                              <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '10px' }}>
                                Conflict
                              </span>
                            ) : lec.status === 'duplicate' ? (
                              <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', fontSize: '10px' }}>
                                Duplicate
                              </span>
                            ) : (
                              <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '10px' }}>
                                Ready
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Download Preformatted Template Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', display: 'block' }}>
                Download standard spreadsheet template
              </span>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                Pre-formatted for ADIT {targetScope === 'faculty' ? 'Faculty' : 'Class'} with 9 standard time slots.
              </span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadTemplate}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <Download size={13} /> Download Template
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleApply}
            disabled={!previewData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#2563eb', color: 'white', fontWeight: '700' }}
          >
            <Check size={16} /> Apply & Sync Timetable
          </button>
        </div>

      </div>
    </div>
  );
}
