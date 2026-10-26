import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Printer, 
  Download, 
  UploadCloud, 
  Check, 
  X, 
  Layers, 
  Building2, 
  GraduationCap, 
  ArrowRight,
  ChevronDown,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { 
  TIME_SLOTS, 
  TIMETABLE_DAYS, 
  getClassTimetable, 
  saveClassTimetable, 
  updateClassSlot, 
  clearClassSlot, 
  calculateTimetableSummary, 
  getSubjectColor, 
  normalizeSem, 
  normalizeDiv, 
  getClassKey, 
  downloadClassTimetableTemplate, 
  getEntriesByClass, 
  checkConflicts,
  isLunchTime,
  canMergeConsecutiveSlots,
  isLabSession
} from '../services/timetableStorage';
import TimetableUploadModal from './TimetableUploadModal';
import SlotEditModal from './SlotEditModal';

export default function ClassTimetablePanel({
  departments = [],
  faculties = [],
  subjects = [],
  initialDept,
  initialSem,
  initialDiv,
  selectedDept: propDept,
  selectedSem: propSem,
  selectedDiv: propDiv,
  onSwitchToFacultyTimetable,
  showToast
}) {
  // Department, Semester & Division filters
  const [selectedDept, setSelectedDept] = useState(propDept || initialDept || departments[0]?.name || 'AI & Data Science');
  const [selectedSem, setSelectedSem] = useState(propSem || initialSem || '3rd Semester');
  const [selectedDiv, setSelectedDiv] = useState(propDiv || initialDiv || 'Div 1');

  // Timetable state
  const [timetable, setTimetable] = useState(() => {
    const sDept = propDept || initialDept || departments[0]?.name || 'AI & Data Science';
    const sSem = propSem || initialSem || '3rd Semester';
    const sDiv = propDiv || initialDiv || 'Div 1';
    const activeDeptId = departments.find(d => d.name === sDept)?.id || sDept;
    return getClassTimetable(sSem, sDiv, activeDeptId);
  });

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [activeSlotData, setActiveSlotData] = useState(null); // { day, timeSlot, existingSlot }

  // Reload timetable when filter changes
  useEffect(() => {
    const activeDeptId = departments.find(d => d.name === selectedDept)?.id || selectedDept;
    setTimetable(getClassTimetable(selectedSem, selectedDiv, activeDeptId));
  }, [selectedSem, selectedDiv, selectedDept, departments]);

  // Listen to global sync events (e.g. from faculty edits or uploads)
  useEffect(() => {
    const handleSync = () => {
      const activeDeptId = departments.find(d => d.name === selectedDept)?.id || selectedDept;
      setTimetable(getClassTimetable(selectedSem, selectedDiv, activeDeptId));
    };
    window.addEventListener('adit-timetable-synced', handleSync);
    return () => {
      window.removeEventListener('adit-timetable-synced', handleSync);
    };
  }, [selectedSem, selectedDiv, selectedDept, departments]);

  // Filtered department faculties & subjects
  const deptFaculties = useMemo(() => {
    return faculties.filter(f => !f.dept || f.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4)));
  }, [faculties, selectedDept]);

  const deptSubjects = useMemo(() => {
    return subjects.filter(s => !s.dept || s.dept.toLowerCase().includes(selectedDept.toLowerCase().slice(0, 4)));
  }, [subjects, selectedDept]);

  // Timetable Summary
  const summary = useMemo(() => {
    return calculateTimetableSummary(timetable);
  }, [timetable]);

  // Cell Click Handler
  const handleCellClick = (day, timeSlot, existingSlot = null) => {
    const existing = existingSlot || timetable[day]?.[timeSlot] || null;
    setActiveSlotData({ day, timeSlot, existingSlot: existing });
    setShowSlotModal(true);
  };

  // Save Slot Handler
  const handleSaveSlot = (day, timeSlot, slotData) => {
    try {
      const activeDeptId = departments.find(d => d.name === selectedDept)?.id || selectedDept;
      const updated = updateClassSlot(selectedSem, selectedDiv, day, timeSlot, slotData, activeDeptId);
      setTimetable({ ...updated });
      if (showToast) showToast(`Saved & synced ${slotData.subject} for ${day} ${timeSlot}!`);
      setShowSlotModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Clear Slot Handler
  const handleClearSlot = (day, timeSlot, sessionId = null) => {
    const activeDeptId = departments.find(d => d.name === selectedDept)?.id || selectedDept;
    const updated = clearClassSlot(selectedSem, selectedDiv, day, timeSlot, activeDeptId);
    setTimetable({ ...updated });
    if (showToast) showToast(`Cleared slot on ${day} ${timeSlot}`);
    setShowSlotModal(false);
  };

  // Render Slot Card
  const renderSlotCard = (slot, span = 1, timeRange = null) => {
    if (!slot || !slot.subject) return null;

    const color = slot.color || getSubjectColor(slot.subject);
    const colorStyles = {
      purple: { bg: '#f3e8ff', border: '#e9d5ff', text: '#581c87', subText: '#6b21a8' },
      green: { bg: '#dcfce7', border: '#bbf7d0', text: '#14532d', subText: '#15803d' },
      coral: { bg: '#ffe4e6', border: '#fecdd3', text: '#881337', subText: '#9f1239' },
      blue: { bg: '#e0f2fe', border: '#bae6fd', text: '#075985', subText: '#0369a1' },
      amber: { bg: '#fef3c7', border: '#fde68a', text: '#78350f', subText: '#b45309' },
      cyan: { bg: '#cffafe', border: '#a5f3fc', text: '#164e63', subText: '#0e7490' },
      indigo: { bg: '#e0e7ff', border: '#c7d2fe', text: '#312e81', subText: '#4338ca' },
    };

    const style = colorStyles[color] || colorStyles.blue;
    const isMulti = span > 1 || slot.span > 1 || slot.isMultiSlot;
    const isLab = slot.type === 'Lab' || isLabSession(slot);

    return (
      <div 
        style={{
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: '8px',
          padding: isMulti ? '10px 10px' : '8px 10px',
          textAlign: 'left',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          boxShadow: isMulti ? '0 2px 5px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
          position: 'relative',
          height: isMulti ? 'calc(100% - 6px)' : undefined,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMulti ? 'space-between' : 'flex-start',
          boxSizing: 'border-box'
        }}
        className="timetable-cell-badge"
        data-is-multislot={isMulti ? 'true' : undefined}
        data-span={span}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: '800', fontSize: isMulti ? '14px' : '13.5px', color: style.text, lineHeight: 1.2 }}>
              {slot.subject}
            </span>
            <span 
              style={{
                fontSize: '9.5px',
                fontWeight: '800',
                padding: '2px 5px',
                borderRadius: '4px',
                backgroundColor: isMulti ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                color: style.text,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap'
              }}
            >
              {isMulti && isLab ? 'LAB (2 SLOTS)' : (slot.type || 'Lecture')}
            </span>
          </div>

          {slot.name && slot.name !== slot.subject && (
            <div style={{ fontSize: '11px', color: style.subText, fontWeight: '600', marginTop: '2px', lineHeight: 1.2 }}>
              {slot.name}
            </div>
          )}

          <div style={{ fontSize: '11.5px', color: style.subText, fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <UserCheck size={12} />
            <span>{slot.facultyName || 'Faculty Assigned'}</span>
          </div>
        </div>

        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '11px', color: style.subText, opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={11} />
              <span>{slot.room || (isLab ? 'Lab 1' : 'Room 201')}</span>
            </span>
            {slot.batch && slot.batch !== 'All' && (
              <span style={{ fontWeight: '700', fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.7)', padding: '1px 4px', borderRadius: '3px' }}>
                {slot.batch}
              </span>
            )}
          </div>

          {timeRange && isMulti && (
            <div style={{ fontSize: '10.5px', color: style.subText, fontWeight: '700', marginTop: '4px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={10} />
              <span>{timeRange}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="class-timetables-view">
      
      {/* ===================================================================
          TOP BAR: Department, Semester & Division Selectors + Quick Toggle
          =================================================================== */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}
        className="no-print"
      >
        {/* Selectors Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Department */}
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
              onChange={(e) => setSelectedDept(e.target.value)}
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

          {/* Semester */}
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

          {/* Division Pill Buttons */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
            {['Div 1', 'Div 2', 'Div 3'].map((divOption) => {
              const isActive = selectedDiv === divOption;
              return (
                <button
                  key={divOption}
                  type="button"
                  onClick={() => setSelectedDiv(divOption)}
                  style={{
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'white' : 'transparent',
                    color: isActive ? '#2563eb' : '#64748b',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {divOption}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Nav: Switch to Faculty Timetables */}
        {onSwitchToFacultyTimetable && (
          <button
            type="button"
            onClick={onSwitchToFacultyTimetable}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
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
            <Users size={15} />
            <span>Switch to Faculty Timetables</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* ===================================================================
          TITLE, ACTIONS & SUMMARY BAR
          =================================================================== */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
        className="no-print"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800' }}>
              {selectedDept}
            </span>
            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '800' }}>
              {selectedSem} • {selectedDiv}
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', marginTop: '6px' }}>
            Class Timetable & Schedule Matrix
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Click any cell to edit or assign subject, faculty and room. Slots remain in 100% sync with individual faculty schedules.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => downloadClassTimetableTemplate(selectedDept, selectedSem, selectedDiv)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
          >
            <Download size={14} /> Download Template
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
          >
            <Printer size={14} /> Print Timetable
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: '700',
              fontSize: '12.5px'
            }}
          >
            <UploadCloud size={15} />
            <span>Upload Class Timetable</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Current Class */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}
        className="no-print"
      >
        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={18} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{summary.totalLectures}</div>
            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>Weekly Lectures</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{summary.facultyCount || 0}</div>
            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>Faculty Members</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={18} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{summary.subjectCount}</div>
            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>Distinct Subjects</div>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={18} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{summary.activeDays} Days</div>
            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>Active Working Days</div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          WEEKLY TIMETABLE GRID
          =================================================================== */}
      <div 
        className="card"
        style={{
          padding: '0',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          backgroundColor: 'white'
        }}
      >
        <div className="table-responsive">
          <table 
            style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              textAlign: 'center',
              minWidth: '780px'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th 
                  style={{ 
                    padding: '14px 16px', 
                    fontSize: '12.5px', 
                    fontWeight: '800', 
                    color: '#64748b', 
                    textAlign: 'left',
                    width: '130px',
                    borderRight: '1px solid #e2e8f0'
                  }}
                >
                  TIME / DAY
                </th>
                {TIMETABLE_DAYS.map((day) => (
                  <th 
                    key={day}
                    style={{ 
                      padding: '14px 10px', 
                      fontSize: '13px', 
                      fontWeight: '800', 
                      color: '#1e293b',
                      borderRight: '1px solid #e2e8f0'
                    }}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {(() => {
                // Pre-calculate merged cells map for each day
                const dayCellMap = {};
                TIMETABLE_DAYS.forEach(dayName => {
                  dayCellMap[dayName] = new Array(TIME_SLOTS.length);
                });

                TIMETABLE_DAYS.forEach(dayName => {
                  for (let rIdx = 0; rIdx < TIME_SLOTS.length; rIdx++) {
                    if (dayCellMap[dayName][rIdx]) continue;

                    const time = TIME_SLOTS[rIdx];
                    if (time === '12:40 - 1:25' || isLunchTime(time)) {
                      dayCellMap[dayName][rIdx] = { type: 'lunch' };
                      continue;
                    }

                    const slot = timetable[dayName]?.[time];
                    if (!slot || !slot.subject) {
                      dayCellMap[dayName][rIdx] = { type: 'empty' };
                      continue;
                    }

                    let span = 1;
                    const mergedSlotsList = [slot];

                    let checkIdx = rIdx + 1;
                    while (checkIdx < TIME_SLOTS.length) {
                      const nextTime = TIME_SLOTS[checkIdx];
                      if (nextTime === '12:40 - 1:25' || isLunchTime(nextTime)) break;

                      const nextSlot = timetable[dayName]?.[nextTime];

                      // 1. Check if next slot is consecutive and belongs to same session
                      if (nextSlot && canMergeConsecutiveSlots(slot, nextSlot)) {
                        span++;
                        mergedSlotsList.push(nextSlot);
                        dayCellMap[dayName][checkIdx] = { type: 'skip' };
                        checkIdx++;
                        continue;
                      }

                      // 2. Check if current slot has an explicit span > 1
                      if (slot.span && slot.span > 1 && span < slot.span) {
                        span++;
                        if (nextSlot) mergedSlotsList.push(nextSlot);
                        dayCellMap[dayName][checkIdx] = { type: 'skip' };
                        checkIdx++;
                        continue;
                      }

                      break;
                    }

                    let timeRange = slot.combinedTimeSlot || slot.timeSlot || time;
                    if (span > 1) {
                      const firstStart = (slot.timeSlot || time).split(/[-–—]/)[0]?.trim() || '';
                      const lastRowTime = TIME_SLOTS[rIdx + span - 1];
                      const lastEnd = (lastRowTime.split(/[-–—]/)[1] || lastRowTime).trim();
                      timeRange = `${firstStart} - ${lastEnd}`;
                    }

                    const mergedSlot = {
                      ...slot,
                      timeSlot: timeRange,
                      span,
                      isMultiSlot: span > 1,
                      allMergedSlots: mergedSlotsList
                    };

                    dayCellMap[dayName][rIdx] = {
                      type: 'card',
                      slot: mergedSlot,
                      span,
                      timeRange
                    };
                  }
                });

                return TIME_SLOTS.map((timeSlot, rIdx) => {
                  // Lunch Break Banner Row
                  if (timeSlot === '12:40 - 1:25' || isLunchTime(timeSlot)) {
                    return (
                      <tr 
                        key={timeSlot}
                        style={{
                          backgroundColor: '#f1f5f9',
                          borderTop: '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0'
                        }}
                      >
                        <td 
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '11.5px', 
                            fontWeight: '800', 
                            color: '#64748b', 
                            textAlign: 'left',
                            borderRight: '1px solid #e2e8f0'
                          }}
                        >
                          {timeSlot}
                        </td>
                        <td 
                          colSpan={TIMETABLE_DAYS.length}
                          style={{
                            padding: '8px',
                            textAlign: 'center',
                            fontSize: '11px',
                            fontWeight: '800',
                            color: '#64748b',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase'
                          }}
                        >
                          LUNCH BREAK (45 MINS)
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={timeSlot} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Time Slot Label */}
                      <td 
                        style={{ 
                          padding: '12px 16px', 
                          fontSize: '12px', 
                          fontWeight: '700', 
                          color: '#475569', 
                          textAlign: 'left',
                          backgroundColor: '#fafbfc',
                          borderRight: '1px solid #e2e8f0',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} style={{ color: '#94a3b8' }} />
                          <span>{timeSlot}</span>
                        </div>
                      </td>

                      {/* Day Cells */}
                      {TIMETABLE_DAYS.map((day) => {
                        const cellInfo = dayCellMap[day]?.[rIdx];

                        // If covered by an earlier rowSpan, omit the td completely!
                        if (!cellInfo || cellInfo.type === 'skip') {
                          return null;
                        }

                        if (cellInfo.type === 'empty') {
                          return (
                            <td 
                              key={day}
                              onClick={() => handleCellClick(day, timeSlot)}
                              style={{ 
                                padding: '6px 8px', 
                                borderRight: '1px solid #f1f5f9',
                                verticalAlign: 'top',
                                height: '76px',
                                cursor: 'pointer',
                                position: 'relative'
                              }}
                              className="timetable-grid-slot-cell"
                            >
                              <div 
                                style={{
                                  height: '100%',
                                  minHeight: '64px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '6px',
                                  border: '1px dashed transparent',
                                  transition: 'all 0.15s ease'
                                }}
                                className="empty-slot-hover"
                              >
                                <span style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: '600' }}>
                                  -
                                </span>
                              </div>
                            </td>
                          );
                        }

                        const { slot, span, timeRange } = cellInfo;
                        const isMulti = span > 1;

                        return (
                          <td 
                            key={day}
                            rowSpan={isMulti ? span : undefined}
                            onClick={() => handleCellClick(day, timeSlot, slot)}
                            style={{ 
                              padding: '6px 8px', 
                              borderRight: '1px solid #f1f5f9',
                              verticalAlign: 'middle',
                              height: isMulti ? `${span * 76}px` : '76px',
                              cursor: 'pointer',
                              position: 'relative',
                              backgroundColor: '#ffffff'
                            }}
                            className="timetable-grid-slot-cell"
                          >
                            {renderSlotCard(slot, span, timeRange)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================
          MODALS
          =================================================================== */}

      {/* 1. Upload Class Timetable Modal */}
      {showUploadModal && (
        <TimetableUploadModal
          initialScope="class"
          departmentName={selectedDept}
          semesterName={selectedSem}
          divisionName={selectedDiv}
          onClose={() => setShowUploadModal(false)}
          onTimetableUpdated={(newTt) => {
            const refreshed = newTt || getClassTimetable(selectedSem, selectedDiv);
            setTimetable({ ...refreshed });
            if (showToast) showToast('Class timetable uploaded and synced with faculties!');
          }}
          showToast={showToast}
        />
      )}

      {/* 2. Slot Edit Modal */}
      {showSlotModal && activeSlotData && (
        <SlotEditModal
          day={activeSlotData.day}
          timeSlot={activeSlotData.timeSlot}
          existingSlot={activeSlotData.existingSlot}
          availableSubjects={deptSubjects}
          availableFaculties={deptFaculties}
          departmentName={selectedDept}
          semesterName={selectedSem}
          divisionName={selectedDiv}
          onClose={() => setShowSlotModal(false)}
          onSave={handleSaveSlot}
          onClear={handleClearSlot}
          showToast={showToast}
        />
      )}

    </div>
  );
}
