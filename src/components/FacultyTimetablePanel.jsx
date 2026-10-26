import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Search, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Printer, 
  Plus, 
  Copy, 
  Trash2, 
  Download, 
  BookOpen, 
  Layers, 
  Calendar, 
  Building2, 
  Mail, 
  UploadCloud, 
  Sparkles, 
  Check, 
  Clock,
  UserCheck,
  X
} from 'lucide-react';
import { 
  TIME_SLOTS, 
  TIMETABLE_DAYS, 
  getFacultyTimetable, 
  saveFacultyTimetable, 
  updateFacultySlot, 
  clearFacultySlot, 
  copyFacultyTimetable, 
  calculateTimetableSummary,
  getSubjectColor,
  getEntriesByFaculty,
  checkConflicts,
  downloadFacultyTimetableTemplate,
  downloadFacultyTimetableCsv,
  formatOfficialTimeSlot
} from '../services/timetableStorage';
import { saveFaculty } from '../services/attendanceStorage';
import FacultyEditModal from './FacultyEditModal';
import SlotEditModal from './SlotEditModal';
import TimetableUploadModal from './TimetableUploadModal';

export default function FacultyTimetablePanel({
  departments,
  faculties,
  subjects,
  onSaveFaculty,
  onSwitchToClassTimetable,
  showToast
}) {
  // Department & Semester Filter
  const [selectedDept, setSelectedDept] = useState('AI & Data Science');
  const [selectedSem, setSelectedSem] = useState('3rd Semester');
  const [selectedWeek, setSelectedWeek] = useState('Current Week');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Faculty
  const [selectedFacultyId, setSelectedFacultyId] = useState('FAC_PS');

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditFacultyModal, setShowEditFacultyModal] = useState(false);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [activeSlotData, setActiveSlotData] = useState(null); // { day, timeSlot, existingSlot }
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargetFacultyId, setCopyTargetFacultyId] = useState('');

  // Dropdown menus
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Filter faculties by selected department & search query
  const deptFaculties = useMemo(() => {
    return faculties.filter(f => {
      const matchDept = !f.dept || f.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4));
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        f.name.toLowerCase().includes(q) || 
        (f.subjects && f.subjects.toLowerCase().includes(q)) ||
        (f.email && f.email.toLowerCase().includes(q));
      return matchDept && matchQuery;
    });
  }, [faculties, selectedDept, searchQuery]);

  // Active Faculty Object
  const currentFaculty = useMemo(() => {
    return deptFaculties.find(f => f.id === selectedFacultyId) || 
           faculties.find(f => f.id === selectedFacultyId) || 
           deptFaculties[0] || 
           faculties[0] || {
             id: 'FAC_PS',
             name: 'Prof. Priya Shah',
             dept: 'AI & Data Science',
             email: 'priya.shah@adit.ac.in',
             subjects: 'DBMS, Data Structures'
           };
  }, [deptFaculties, faculties, selectedFacultyId]);

  // Timetable for current faculty
  const [timetable, setTimetable] = useState(() => getFacultyTimetable(currentFaculty?.id || 'FAC_PS'));

  // Update timetable when currentFaculty changes or when timetable sync event fires
  React.useEffect(() => {
    if (currentFaculty?.id) {
      setTimetable(getFacultyTimetable(currentFaculty.id));
    }
  }, [currentFaculty?.id]);

  React.useEffect(() => {
    const handleSync = () => {
      if (currentFaculty?.id) {
        setTimetable(getFacultyTimetable(currentFaculty.id));
      }
    };
    window.addEventListener('adit-timetable-synced', handleSync);
    return () => {
      window.removeEventListener('adit-timetable-synced', handleSync);
    };
  }, [currentFaculty?.id]);

  // Summary Metrics
  const summary = useMemo(() => {
    return calculateTimetableSummary(timetable);
  }, [timetable]);

  // Filtered department subjects for slot picker
  const departmentSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchDept = !s.dept || s.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4));
      return matchDept;
    });
  }, [subjects, selectedDept]);

  // Helper for faculty initials
  const getInitials = (name) => {
    if (!name) return 'FC';
    const parts = name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/i, '').trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Cell Click Handler
  const handleCellClick = (day, timeSlot) => {
    const existing = timetable[day]?.[timeSlot] || null;
    setActiveSlotData({ day, timeSlot, existingSlot: existing });
    setShowSlotModal(true);
  };

  // Save Slot Handler
  const handleSaveSlot = (day, timeSlot, slotData) => {
    const updated = updateFacultySlot(currentFaculty.id, day, timeSlot, slotData);
    setTimetable({ ...updated });
    if (showToast) showToast(`Saved ${slotData.subject} for ${day} ${timeSlot}`);
    setShowSlotModal(false);
  };

  // Clear Slot Handler
  const handleClearSlot = (day, timeSlot) => {
    const updated = clearFacultySlot(currentFaculty.id, day, timeSlot);
    setTimetable({ ...updated });
  };

  // Copy Timetable Handler
  const handleExecuteCopy = () => {
    if (!copyTargetFacultyId) {
      alert('Please select a target faculty to copy this timetable to.');
      return;
    }
    copyFacultyTimetable(currentFaculty.id, copyTargetFacultyId);
    const targetFac = faculties.find(f => f.id === copyTargetFacultyId);
    if (showToast) showToast(`Timetable copied to ${targetFac?.name || 'faculty'}!`);
    setShowCopyModal(false);
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  // Render badge with theme styling matching screenshot
  const renderSlotCard = (slot) => {
    if (!slot || !slot.subject) return '-';

    const color = slot.color || getSubjectColor(slot.subject);

    // Color definitions matching screenshot
    const colorStyles = {
      purple: { bg: '#f3e8ff', border: '#e9d5ff', text: '#581c87', subText: '#6b21a8' }, // DBMS
      green: { bg: '#dcfce7', border: '#bbf7d0', text: '#14532d', subText: '#15803d' },  // DS
      coral: { bg: '#ffe4e6', border: '#fecdd3', text: '#881337', subText: '#9f1239' },  // Python
      blue: { bg: '#e0f2fe', border: '#bae6fd', text: '#075985', subText: '#0369a1' },   // Seminar
      amber: { bg: '#fef3c7', border: '#fde68a', text: '#78350f', subText: '#b45309' },  // Math
      cyan: { bg: '#cffafe', border: '#a5f3fc', text: '#164e63', subText: '#0e7490' },
      indigo: { bg: '#e0e7ff', border: '#c7d2fe', text: '#312e81', subText: '#4338ca' },
    };

    const style = colorStyles[color] || colorStyles.blue;

    return (
      <div 
        style={{
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: '8px',
          padding: '6px 8px',
          textAlign: 'center',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
        className="timetable-cell-badge"
      >
        <div style={{ fontWeight: '800', fontSize: '13px', color: style.text, lineHeight: 1.2 }}>
          {slot.subject}
        </div>
        <div style={{ fontSize: '11px', color: style.subText, fontWeight: '600', marginTop: '2px' }}>
          {slot.sem || '3rd Sem'} • {slot.div || 'Div 1'}{slot.batch && slot.batch !== 'All' ? ` • ${slot.batch}` : ''}
        </div>
        <div style={{ fontSize: '10.5px', color: style.subText, opacity: 0.85, marginTop: '1px' }}>
          {slot.room || 'Room 201'}
        </div>
      </div>
    );
  };

  return (
    <div className="faculty-timetables-view">
      
      {/* ===================================================================
          TOP BAR: Department & Semester Dropdowns, Notifications & Admin
          =================================================================== */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}
        className="no-print"
      >
        {/* Department & Semester Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '9999px',
            border: '1px solid #cbd5e1',
            padding: '6px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginRight: '6px' }}>
              Department:
            </span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                // Auto select first faculty in new department
                const facInDept = faculties.filter(f => f.dept?.toLowerCase().includes(e.target.value.toLowerCase().slice(0, 4)));
                if (facInDept.length > 0) setSelectedFacultyId(facInDept[0].id);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: '700',
                fontSize: '13.5px',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {departments.map((d) => (
                <option key={d.id || d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '9999px',
            border: '1px solid #cbd5e1',
            padding: '6px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginRight: '6px' }}>
              Semester:
            </span>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: '700',
                fontSize: '13.5px',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none'
              }}
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
        </div>

        {/* Right Nav & Profile Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onSwitchToClassTimetable && (
            <button
              type="button"
              onClick={onSwitchToClassTimetable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 15px',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Calendar size={14} />
              <span>Switch to Class Timetable</span>
              <ArrowRight size={14} />
            </button>
          )}

          {/* Notification Bell with red dot */}
          <button 
            style={{
              position: 'relative',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569'
            }}
            title="Notifications"
          >
            <Bell size={18} />
            <span 
              style={{
                position: 'absolute',
                top: '7px',
                right: '7px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                border: '2px solid white'
              }} 
            />
          </button>

          {/* Admin Profile Pill */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '4px 14px 4px 6px',
              cursor: 'pointer'
            }}
          >
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#93c5fd',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '14px'
              }}
            >
              A
            </div>
            <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
              Admin
            </span>
            <ChevronDown size={14} style={{ color: '#64748b' }} />
          </div>
        </div>
      </div>

      {/* ===================================================================
          MAIN CONTENT HEADER: Title, Subtitle, and "+ Upload Timetable"
          =================================================================== */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
        className="no-print"
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Faculty Timetables
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            View, edit and manage individual faculty timetables.
          </p>
        </div>

        {/* Action Buttons: Download Template (Excel & CSV) and Upload Timetable */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              downloadFacultyTimetableTemplate(currentFaculty?.name || 'Faculty', selectedDept, selectedSem, currentFaculty?.id);
              if (showToast) showToast('Official Faculty Excel template downloaded!');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'white',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: '8px',
              padding: '10px 16px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
            title="Download Official ADIT CVM University Faculty Template (.xlsx)"
          >
            <Download size={15} color="#16a34a" />
            <span>Download Excel Template</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              downloadFacultyTimetableCsv(currentFaculty?.name || 'Faculty', selectedDept, selectedSem, currentFaculty?.id);
              if (showToast) showToast('Official Faculty CSV template downloaded!');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'white',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: '8px',
              padding: '10px 16px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
            title="Download Official Faculty Template in CSV format"
          >
            <Download size={15} color="#2563eb" />
            <span>Download CSV Template</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              padding: '10px 18px',
              fontWeight: '700',
              fontSize: '13.5px',
              border: 'none',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.35)'
            }}
          >
            <UploadCloud size={16} />
            <span>Upload Timetable</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          TWO-COLUMN MAIN LAYOUT: Faculty List (Left) & Timetable Grid (Right)
          =================================================================== */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '310px minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start'
        }}
        className="faculty-grid-layout"
      >
        
        {/* LEFT COLUMN: Faculty Search & List */}
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
          className="no-print"
        >
          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} 
            />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* Faculty Card List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '680px', overflowY: 'auto' }}>
            {deptFaculties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 14px', color: '#64748b', fontSize: '13px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  <Users size={22} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  No faculty member found
                </div>
                {searchQuery ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                    No results matching "{searchQuery}"
                  </p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                    No faculty found in {selectedDept}
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddFacultyModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: '4px auto 0 auto',
                    fontWeight: '700',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  <Plus size={15} />
                  <span>Add Faculty</span>
                </button>
              </div>
            ) : (
              deptFaculties.map((fac) => {
                const isSelected = fac.id === currentFaculty.id;
                const initials = getInitials(fac.name);

                return (
                  <div
                    key={fac.id}
                    onClick={() => setSelectedFacultyId(fac.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #f1f5f9',
                      backgroundColor: isSelected ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.08)' : 'none'
                    }}
                    className="faculty-list-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      {/* Avatar Circle */}
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#dbeafe' : '#e2e8f0',
                          color: isSelected ? '#1d4ed8' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '13.5px',
                          flexShrink: 0
                        }}
                      >
                        {initials}
                      </div>

                      {/* Name & Subjects */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '13.5px', 
                          fontWeight: '700', 
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {fac.name}
                        </div>
                        <div style={{ 
                          fontSize: '11.5px', 
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px'
                        }}>
                          {fac.subjects || fac.designation || 'Faculty'}
                        </div>
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      type="button"
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: isSelected ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? 'white' : '#f8fafc',
                        color: isSelected ? '#2563eb' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Faculty Header, Timetable Grid, Quick Actions & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* 1. FACULTY DETAILS HEADER CARD */}
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Large Avatar */}
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '20px'
                  }}
                >
                  {getInitials(currentFaculty.name)}
                </div>

                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                    {currentFaculty.name}
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    {currentFaculty.designation || 'Faculty Member'}
                  </span>
                </div>
              </div>

              {/* Edit Details Button */}
              <button
                className="btn btn-secondary btn-sm no-print"
                onClick={() => setShowEditFacultyModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#1e293b'
                }}
              >
                <Edit3 size={14} /> Edit Details
              </button>
            </div>

            {/* Meta Row: Department, Subjects, Email */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={18} style={{ color: '#64748b' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                    Department
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {currentFaculty.dept || selectedDept}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={18} style={{ color: '#64748b' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                    Subjects
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {currentFaculty.subjects || 'DBMS, Data Structures'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} style={{ color: '#64748b' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>
                    Email
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {currentFaculty.email || `${currentFaculty.name.toLowerCase().replace(/[^a-z]/g, '')}@adit.ac.in`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. TIMETABLE CARD WITH GRID */}
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            {/* Header: Title, Click note, and Week / Print controls */}
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  Timetable
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Click on a cell to edit.
                </span>
              </div>

              {/* Right: Week selector & Print button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="no-print">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '3px'
                }}>
                  <button 
                    type="button" 
                    className="btn-icon" 
                    style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', color: '#64748b' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', padding: '0 8px', color: '#1e293b' }}>
                    {selectedWeek}
                  </span>
                  <ChevronDown size={13} style={{ color: '#94a3b8', marginRight: '4px' }} />
                  <button 
                    type="button" 
                    className="btn-icon" 
                    style={{ background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', color: '#64748b' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: '700'
                  }}
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            {/* INTERACTIVE TIMETABLE GRID */}
            <div className="table-responsive" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 14px', width: '110px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>
                      Time
                    </th>
                    {TIMETABLE_DAYS.map(day => (
                      <th key={day} style={{ padding: '12px 8px', fontWeight: '700', color: '#475569' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((slotTime) => {
                    // Check if this slot is the LUNCH BREAK
                    const isLunch = slotTime === '12:40 - 1:25';

                    if (isLunch) {
                      return (
                        <tr key={slotTime} style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px 14px', textAlign: 'left', fontWeight: '700', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {formatOfficialTimeSlot(slotTime)}
                          </td>
                          <td 
                            colSpan={6} 
                            style={{ 
                              padding: '8px', 
                              letterSpacing: '0.1em', 
                              fontWeight: '800', 
                              color: '#64748b', 
                              textTransform: 'uppercase',
                              fontSize: '11.5px',
                              backgroundColor: '#e2e8f0'
                            }}
                          >
                            LUNCH BREAK
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={slotTime} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {/* Time Column */}
                        <td style={{ 
                          padding: '10px 14px', 
                          textAlign: 'left', 
                          fontWeight: '700', 
                          color: '#475569', 
                          whiteSpace: 'nowrap',
                          backgroundColor: '#fcfdfe',
                          borderRight: '1px solid #f1f5f9'
                        }}>
                          {formatOfficialTimeSlot(slotTime)}
                        </td>

                        {/* Day Slots */}
                        {TIMETABLE_DAYS.map(day => {
                          const slot = timetable[day]?.[slotTime];

                          return (
                            <td 
                              key={day}
                              onClick={() => handleCellClick(day, slotTime)}
                              style={{
                                padding: '6px',
                                borderRight: '1px solid #f1f5f9',
                                height: '62px',
                                verticalAlign: 'middle',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease',
                                width: '14.6%'
                              }}
                              className="timetable-cell-interactive"
                              title={`Click to edit ${day} at ${slotTime}`}
                            >
                              {slot ? (
                                renderSlotCard(slot)
                              ) : (
                                <span style={{ color: '#94a3b8', fontWeight: '500' }}>-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. BOTTOM ROW: Quick Actions & Summary Widgets */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: '20px',
              alignItems: 'stretch'
            }}
            className="no-print timetable-bottom-widgets"
          >
            {/* Quick Actions Card */}
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
                Quick Actions
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {/* 1. Add Lecture */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveSlotData({ day: 'Monday', timeSlot: '9:00 - 9:55', existingSlot: null });
                    setShowSlotModal(true);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px 6px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="quick-action-btn"
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Plus size={16} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Add Lecture</span>
                </button>

                {/* 2. Copy Timetable */}
                <button
                  type="button"
                  onClick={() => setShowCopyModal(true)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px 6px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="quick-action-btn"
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Copy size={15} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Copy Timetable</span>
                </button>

                {/* 3. Clear Slot */}
                <button
                  type="button"
                  onClick={() => {
                    const daysWithSlots = TIMETABLE_DAYS.filter(d => Object.keys(timetable[d] || {}).length > 0);
                    if (daysWithSlots.length === 0) {
                      alert('Timetable is already empty.');
                      return;
                    }
                    if (window.confirm(`Clear all scheduled slots for ${currentFaculty.name}?`)) {
                      saveFacultyTimetable(currentFaculty.id, {});
                      setTimetable({});
                      if (showToast) showToast('All slots cleared for ' + currentFaculty.name);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px 6px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="quick-action-btn"
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Trash2 size={15} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Clear Slot</span>
                </button>

                {/* 4. Download PDF / Print */}
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px 6px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="quick-action-btn"
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Download size={15} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Summary Card */}
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
                Summary
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {/* 1. Subjects */}
                <div style={{
                  padding: '12px 8px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc'
                }}>
                  <BookOpen size={18} style={{ color: '#2563eb', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {summary.subjectCount}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                    Subjects
                  </div>
                </div>

                {/* 2. Total Lectures */}
                <div style={{
                  padding: '12px 8px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc'
                }}>
                  <Layers size={18} style={{ color: '#2563eb', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {summary.totalLectures}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                    Total Lectures
                  </div>
                </div>

                {/* 3. Active Days */}
                <div style={{
                  padding: '12px 8px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc'
                }}>
                  <Calendar size={18} style={{ color: '#2563eb', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {summary.activeDays}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                    Active Days
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ===================================================================
          MODALS
          =================================================================== */}
      
      {/* 1. Upload Modal */}
      {showUploadModal && (
        <TimetableUploadModal
          selectedFaculty={currentFaculty}
          departmentName={selectedDept}
          semesterName={selectedSem}
          onClose={() => setShowUploadModal(false)}
          onTimetableUpdated={(newTt, uploadedFacultyId) => {
            // Always re-read from storage so we get the correctly persisted data
            // (the modal may have saved to a different faculty than currently selected)
            const targetId = uploadedFacultyId || currentFaculty.id;
            const refreshed = getFacultyTimetable(targetId);
            setTimetable({ ...refreshed });
            // If upload was for a different faculty, switch the panel to that faculty
            if (uploadedFacultyId && uploadedFacultyId !== selectedFacultyId) {
              setSelectedFacultyId(uploadedFacultyId);
            }
          }}
          showToast={showToast}
        />
      )}


      {/* 2. Edit Faculty Details Modal */}
      {showEditFacultyModal && (
        <FacultyEditModal
          faculty={currentFaculty}
          departments={departments}
          onClose={() => setShowEditFacultyModal(false)}
          onSave={(updatedData) => {
            onSaveFaculty(updatedData);
          }}
          showToast={showToast}
        />
      )}

      {/* 2b. Add Faculty Modal (When Search Has No Results) */}
      {showAddFacultyModal && (
        <FacultyEditModal
          faculty={{
            name: searchQuery.trim(),
            dept: selectedDept,
            designation: 'Assistant Professor',
            email: '',
            phone: '',
            subjects: ''
          }}
          departments={departments}
          onClose={() => setShowAddFacultyModal(false)}
          onSave={(formData) => {
            const updatedFacs = saveFaculty(formData);
            const newlyCreated = updatedFacs.find(f => f.name.toLowerCase() === formData.name.toLowerCase()) || updatedFacs[updatedFacs.length - 1];
            if (onSaveFaculty) {
              onSaveFaculty(newlyCreated || formData);
            }
            if (newlyCreated?.id) {
              setSelectedFacultyId(newlyCreated.id);
            }
            setSearchQuery(formData.name);
            setShowAddFacultyModal(false);
            if (showToast) showToast(`Faculty "${formData.name}" added successfully!`);
          }}
          showToast={showToast}
        />
      )}

      {/* 3. Edit / Add Slot Modal */}
      {showSlotModal && activeSlotData && (
        <SlotEditModal
          day={activeSlotData.day}
          timeSlot={activeSlotData.timeSlot}
          existingSlot={activeSlotData.existingSlot}
          availableSubjects={departmentSubjects}
          availableFaculties={deptFaculties}
          departmentName={selectedDept}
          semesterName={selectedSem}
          onClose={() => setShowSlotModal(false)}
          onSave={handleSaveSlot}
          onClear={handleClearSlot}
          showToast={showToast}
        />
      )}

      {/* 4. Copy Timetable Dialog */}
      {showCopyModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-primary)' }}>
                <Copy size={18} />
                Copy Timetable
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCopyModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Copy the complete weekly schedule of <strong>{currentFaculty.name}</strong> ({summary.totalLectures} lectures) to another faculty:
              </p>

              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '13px' }}>Target Faculty Member</label>
                <select
                  className="form-control"
                  value={copyTargetFacultyId}
                  onChange={(e) => setCopyTargetFacultyId(e.target.value)}
                >
                  <option value="">-- Choose Target Faculty --</option>
                  {faculties.filter(f => f.id !== currentFaculty.id).map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.dept})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCopyModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExecuteCopy}
                disabled={!copyTargetFacultyId}
              >
                <Check size={16} /> Copy Timetable
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
