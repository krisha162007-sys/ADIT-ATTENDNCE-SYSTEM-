import * as XLSX from 'xlsx';
import { getSubjects, getFaculties, getCurrentUser, getDepartments } from './attendanceStorage';

export const TT_STORAGE_KEYS = {
  TIMETABLE: 'adit_attendance_timetable',
  TIMETABLE_ENTRIES: 'adit_timetable_entries',
  UPLOADED_FILE_INFO: 'adit_timetable_file_info'
};

export const TIME_SLOTS = [
  '9:00 - 9:55',
  '10:00 - 10:50',
  '10:55 - 11:45',
  '11:50 - 12:40',
  '12:40 - 1:25', // LUNCH BREAK
  '1:25 - 2:15',
  '2:20 - 3:10',
  '3:15 - 4:05',
  '4:10 - 5:00'
];

export const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getSubjectColor = (subjectNameOrCode) => {
  if (!subjectNameOrCode) return 'blue';
  const s = String(subjectNameOrCode).toLowerCase();
  if (s.includes('dbms') || s.includes('database')) return 'purple';
  if (s.includes('ds') || s.includes('data structure')) return 'green';
  if (s.includes('python') || s.includes('py')) return 'coral';
  if (s.includes('math')) return 'amber';
  if (s.includes('os') || s.includes('operating')) return 'indigo';
  if (s.includes('network') || s.includes('cn')) return 'cyan';
  if (s.includes('sna')) return 'cyan';
  if (s.includes('bda')) return 'purple';
  if (s.includes('nlp')) return 'emerald';
  if (s.includes('dwdm')) return 'coral';
  if (s.includes('ase')) return 'indigo';
  if (s.includes('seminar')) return 'blue';
  if (s.includes('analytic') || s.includes('ml')) return 'emerald';
  if (s.includes('humanities') || s.includes('ethics')) return 'slate';
  return 'blue';
};

// normalizeSem and normalizeDiv are defined in and imported from attendanceStorage.js

export const getClassKey = (sem, div) => {
  return `${normalizeSem(sem)}_${normalizeDiv(div)}`;
};

const generateId = () => 'tte_' + Math.random().toString(36).substring(2, 11);

// --- Centralized API ---

export const getTimetableEntries = () => {
  if (typeof localStorage === 'undefined') return [];
  const data = localStorage.getItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      let needsSave = false;
      parsed.forEach(e => {
        if (!e.id) {
          e.id = generateId();
          needsSave = true;
        }
      });
      if (needsSave) {
        localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify([]));
  return [];
};

export const saveTimetableEntry = (entry) => {
  const entries = getTimetableEntries();
  if (!entry.id) entry.id = generateId();
  const idx = entries.findIndex(e => e.id === entry.id);
  if (idx !== -1) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
  notifyTimetableSync();
  return entry;
};

export const deleteTimetableEntry = (id) => {
  let entries = getTimetableEntries();
  entries = entries.filter(e => e.id !== id);
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
  notifyTimetableSync();
};

export const clearAllEntries = () => {
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify([]));
  notifyTimetableSync();
};

export const getEntriesByFaculty = (facultyId) => {
  return getTimetableEntries().filter(e => e.facultyId === facultyId);
};

export const getEntriesByClass = (deptId, semId, divId) => {
  return getTimetableEntries().filter(e => {
    const semMatch = normalizeSem(e.semId || e.sem) === normalizeSem(semId);
    const divMatch = normalizeDiv(e.divId || e.div) === normalizeDiv(divId);
    // Only filter by dept if deptId is provided AND entry has departmentId
    const deptMatch = !deptId || !e.departmentId || e.departmentId === deptId;
    return semMatch && divMatch && deptMatch;
  });
};

export const getEntriesByDept = (deptId) => {
  return getTimetableEntries().filter(e => e.departmentId === deptId);
};

export const replaceFacultyInEntries = (oldFacultyId, newFacultyId, newFacultyName) => {
  let entries = getTimetableEntries();
  let changed = false;
  entries.forEach(e => {
    if (e.facultyId === oldFacultyId) {
      e.facultyId = newFacultyId;
      e.facultyName = newFacultyName;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
    notifyTimetableSync();
  }
};

export const updateFacultyNameInEntries = (facultyId, newName) => {
  let entries = getTimetableEntries();
  let changed = false;
  entries.forEach(e => {
    if (e.facultyId === facultyId) {
      e.facultyName = newName;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
    notifyTimetableSync();
  }
};

export const updateSubjectInEntries = (subjectId, updates) => {
  let entries = getTimetableEntries();
  let changed = false;
  entries.forEach(e => {
    if (e.subjectId === subjectId) {
      if (updates.name) e.subjectFullName = updates.name;
      if (updates.shortName) e.subjectName = updates.shortName;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
    notifyTimetableSync();
  }
};

export const deleteEntriesForFaculty = (facultyId) => {
  let entries = getTimetableEntries();
  const filtered = entries.filter(e => e.facultyId !== facultyId);
  if (filtered.length !== entries.length) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
    notifyTimetableSync();
  }
};

export const deleteEntriesForSubject = (subjectId) => {
  let entries = getTimetableEntries();
  const filtered = entries.filter(e => e.subjectId !== subjectId);
  if (filtered.length !== entries.length) {
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
    notifyTimetableSync();
  }
};

export const checkConflicts = (entry, excludeId = null) => {
  const entries = getTimetableEntries();
  const conflicts = [];
  
  entries.forEach(e => {
    if (excludeId && e.id === excludeId) return;
    if (e.day !== entry.day || e.timeSlot !== entry.timeSlot) return;

    if (e.facultyId && entry.facultyId && e.facultyId === entry.facultyId) {
      conflicts.push(`Faculty ${e.facultyName} is already teaching ${e.subjectName} in ${e.room} at this time.`);
    }
    
    // Check same class
    if (e.sem && e.div && entry.sem && entry.div &&
        normalizeSem(e.sem) === normalizeSem(entry.sem) && 
        normalizeDiv(e.div) === normalizeDiv(entry.div)) {
      conflicts.push(`Class ${normalizeSem(entry.sem)} ${normalizeDiv(entry.div)} already has ${e.subjectName} at this time.`);
    }

    if (e.room === entry.room && entry.room && entry.room !== 'TBD') {
      conflicts.push(`Room ${e.room} is already booked for ${e.subjectName} by ${e.facultyName}.`);
    }
  });

  return conflicts;
};

export const normalizeTimeSlot = (slotStr) => {
  if (!slotStr) return '';
  return slotStr
    .split('-')
    .map(part => {
      const trimmed = part.trim();
      const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        const h = parseInt(match[1], 10);
        const m = match[2];
        return `${h}:${m}`;
      }
      return trimmed;
    })
    .join(' - ');
};

export const parseTimeRangeMinutes = (timeSlotStr) => {
  if (!timeSlotStr) return null;
  const parts = timeSlotStr.split('-').map(s => s.trim());
  if (parts.length < 2) return null;
  const parseMin = (tStr) => {
    let isPM = /pm/i.test(tStr);
    let isAM = /am/i.test(tStr);
    let clean = tStr.replace(/[^\d:]/g, '');
    let [h, m] = clean.split(':').map(Number);
    if (isNaN(h)) return 0;
    if (isNaN(m)) m = 0;
    if (!isAM && !isPM) {
      if (h >= 1 && h <= 7) h += 12;
    } else if (isPM && h < 12) {
      h += 12;
    } else if (isAM && h === 12) {
      h = 0;
    }
    return h * 60 + m;
  };
  const startMin = parseMin(parts[0]);
  const endMin = parseMin(parts[1]);
  return { startMin, endMin };
};

export const doTimeSlotsOverlap = (slot1, slot2) => {
  if (!slot1 || !slot2) return false;
  if (slot1.trim().toLowerCase() === slot2.trim().toLowerCase()) return true;
  if (normalizeTimeSlot(slot1) === normalizeTimeSlot(slot2)) return true;
  const r1 = parseTimeRangeMinutes(slot1);
  const r2 = parseTimeRangeMinutes(slot2);
  if (!r1 || !r2) return false;
  return r1.startMin < r2.endMin && r1.endMin > r2.startMin;
};

export const getDateForDayName = (dayName) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIdx = days.indexOf(dayName);
  const now = new Date();
  if (targetDayIdx === -1) return now.toISOString().split('T')[0];
  const currentDayIdx = now.getDay();
  const diff = targetDayIdx - currentDayIdx;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d.toISOString().split('T')[0];
};

export const checkRescheduleConflicts = (params = {}, entriesList = null) => {
  const { entryId, facultyId, day, timeSlot, room, date } = params;
  const entries = entriesList || getTimetableEntries();
  const conflicts = [];

  if (!day || !timeSlot) return conflicts;

  entries.forEach(e => {
    if (entryId && e.id === entryId) return; // skip self
    if (e.day !== day) return;

    if (doTimeSlotsOverlap(e.timeSlot, timeSlot)) {
      // 1. Faculty conflict: Same faculty already teaching at this time
      if (facultyId && e.facultyId === facultyId) {
        conflicts.push(`Faculty conflict: You already have "${e.subjectName || e.subjectId}" scheduled on ${day} at ${e.timeSlot} in ${e.room || 'Classroom'}.`);
      }

      // 2. Room conflict: Selected room is already booked by another lecture at this time
      if (room && e.room && room.trim().toLowerCase() !== 'tbd' && e.room.trim().toLowerCase() !== 'tbd' &&
          room.trim().toLowerCase() === e.room.trim().toLowerCase()) {
        conflicts.push(`Room conflict: ${room} is already booked on ${day} at ${e.timeSlot} for ${e.subjectName || e.subjectId} (${e.facultyName || 'Another Faculty'}).`);
      }
    }
  });

  return conflicts;
};

export const rescheduleLectureEntry = (params = {}, userContext = null) => {
  const user = userContext || (typeof getCurrentUser === 'function' ? getCurrentUser() : null);
  if (!user) {
    throw new Error('Authentication required: You must be logged in to reschedule a lecture.');
  }

  const { entryId, facultyId, day, timeSlot, newDate, newStartTime, newEndTime, newTimeSlot, newRoom, reason } = params;

  if (!newDate) {
    throw new Error('Validation Error: A new date is required to reschedule a lecture.');
  }
  if (!newStartTime || !newEndTime) {
    if (!newTimeSlot) {
      throw new Error('Validation Error: New start time and end time are required.');
    }
  }
  if (!reason || !reason.trim()) {
    throw new Error('Validation Error: A reason for rescheduling must be provided.');
  }

  const entries = getTimetableEntries();
  let targetIndex = -1;

  if (entryId) {
    targetIndex = entries.findIndex(e => e.id === entryId);
  }

  // Fallback: match by facultyId, day, and timeSlot
  if (targetIndex === -1 && (facultyId || params.slotFacultyId) && (day || params.slotDay) && (timeSlot || params.slotTimeSlot)) {
    const fId = facultyId || params.slotFacultyId;
    const d = day || params.slotDay;
    const ts = timeSlot || params.slotTimeSlot;
    const normTs = normalizeTimeSlot(ts);
    targetIndex = entries.findIndex(e => e.facultyId === fId && e.day === d && (e.timeSlot === ts || normalizeTimeSlot(e.timeSlot) === normTs));
  }

  if (targetIndex === -1) {
    throw new Error('Lecture entry not found in timetable.');
  }

  const targetEntry = entries[targetIndex];

  // Security & Backend Authorization:
  // Faculty members can only reschedule lectures assigned to them.
  const userFacultyId = user.id || user.facultyId;
  const isAdmin = user.role === 'admin' || user.isAdmin || user.id === 'FAC_ADMIN';

  if (!isAdmin && user.role === 'faculty') {
    if (targetEntry.facultyId && targetEntry.facultyId !== userFacultyId) {
      throw new Error(`Unauthorized Security Error: You cannot reschedule lectures assigned to another faculty member (${targetEntry.facultyName || targetEntry.facultyId}).`);
    }
  }

  // Derive new day of week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dateObj = new Date(newDate + 'T00:00:00');
  if (isNaN(dateObj.getTime())) {
    throw new Error('Validation Error: Invalid date format.');
  }
  const newDay = daysOfWeek[dateObj.getDay()];
  if (newDay === 'Sunday') {
    throw new Error('Validation Error: Lectures cannot be rescheduled to Sunday.');
  }

  // Format timeSlot
  let finalTimeSlot = newTimeSlot;
  if (!finalTimeSlot && newStartTime && newEndTime) {
    finalTimeSlot = `${newStartTime} - ${newEndTime}`;
  }

  const finalRoom = (newRoom !== undefined && newRoom !== null && String(newRoom).trim() !== '') ? String(newRoom).trim() : (targetEntry.room || 'Classroom');

  // Conflict validation
  const conflicts = checkRescheduleConflicts({
    entryId: targetEntry.id,
    facultyId: targetEntry.facultyId,
    day: newDay,
    timeSlot: finalTimeSlot,
    room: finalRoom,
    date: newDate
  }, entries);

  if (conflicts.length > 0) {
    throw new Error(`Schedule Conflict Detected:\n• ${conflicts.join('\n• ')}`);
  }

  // Update entry while preserving subject, department, and assigned faculty
  const updatedEntry = {
    ...targetEntry,
    facultyId: targetEntry.facultyId,
    facultyName: targetEntry.facultyName,
    subjectId: targetEntry.subjectId,
    subjectName: targetEntry.subjectName,
    subjectFullName: targetEntry.subjectFullName,
    semId: targetEntry.semId,
    divId: targetEntry.divId,
    sem: targetEntry.sem,
    div: targetEntry.div,
    departmentId: targetEntry.departmentId,
    
    // Updated slot details
    day: newDay,
    timeSlot: finalTimeSlot,
    room: finalRoom,
    
    // Reschedule audit metadata
    isRescheduled: true,
    rescheduledDate: newDate,
    rescheduleReason: reason.trim(),
    originalDay: targetEntry.originalDay || targetEntry.day,
    originalTimeSlot: targetEntry.originalTimeSlot || targetEntry.timeSlot,
    originalRoom: targetEntry.originalRoom || targetEntry.room,
    rescheduledAt: new Date().toISOString(),
    rescheduledBy: userFacultyId
  };

  entries[targetIndex] = updatedEntry;
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
  notifyTimetableSync();

  return updatedEntry;
};

export const notifyTimetableSync = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adit-timetable-synced'));
  }
};

// --- Helpers to convert to old formats ---

export const convertEntriesToGrid = (entries) => {
  const grid = {};
  TIMETABLE_DAYS.forEach(day => { grid[day] = {}; });
  entries.forEach(e => {
    if (!grid[e.day]) grid[e.day] = {};
    grid[e.day][e.timeSlot] = {
      ...e,
      // Compatibility aliases: UI uses 'subject'/'name', entries store 'subjectName'/'subjectFullName'
      subject: e.subject || e.subjectName || e.subjectId || '',
      name: e.name || e.subjectFullName || e.subjectName || '',
      sem: e.semId || e.sem,
      div: e.divId || e.div
    };
  });
  return grid;
};

export const calculateTimetableSummary = (timetableGrid) => {
  if (!timetableGrid) return { subjectCount: 0, totalLectures: 0, activeDays: 0, uniqueSubjects: [], facultyCount: 0 };

  const subjectsSet = new Set();
  const facultySet = new Set();
  let totalLectures = 0;
  let activeDaysCount = 0;

  TIMETABLE_DAYS.forEach(day => {
    const daySlots = timetableGrid[day] || {};
    const slotsCount = Object.keys(daySlots).length;
    if (slotsCount > 0) activeDaysCount++;

    Object.values(daySlots).forEach(slot => {
      if (slot && slot.subjectName) {
        totalLectures++;
        subjectsSet.add(slot.subjectName);
        if (slot.facultyId || slot.facultyName) {
          facultySet.add(slot.facultyId || slot.facultyName);
        }
      } else if (slot && slot.subject) { // fallback
        totalLectures++;
        subjectsSet.add(slot.subject);
        if (slot.facultyId || slot.facultyName) {
          facultySet.add(slot.facultyId || slot.facultyName);
        }
      }
    });
  });

  return {
    subjectCount: subjectsSet.size,
    totalLectures,
    activeDays: activeDaysCount,
    uniqueSubjects: Array.from(subjectsSet),
    facultyCount: facultySet.size
  };
};

export const resetFacultyTimetablesToDefault = () => {
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify([]));
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE, JSON.stringify({}));
  localStorage.setItem(TT_STORAGE_KEYS.UPLOADED_FILE_INFO, 'null');
  notifyTimetableSync();
};

export const resetAllTimetablesToDefault = resetFacultyTimetablesToDefault;

// Seed Master Map
export const DEFAULT_FACULTY_TIMETABLES = {};

const FACULTY_NAMES = {
  'FAC_PS': 'Prof. Priya Shah',
  'FAC_RP': 'Prof. Rahul Patel',
  'FAC_AK': 'Prof. A. Kumar',
  'FAC_SM': 'Prof. Sneha Mehta',
  'FAC_DT': 'Prof. Dev Trivedi',
  'FAC01': 'Prof. R. K. Patel',
  'FAC02': 'Dr. S. M. Mehta',
  'FAC_DJP': 'Dr. Dinesh Prajapati'
};

const getSeedEntries = () => [];


// Download Class Timetable Template stub
export const downloadClassTimetableTemplate = (deptName = 'Department', semName = '3rd Semester', divName = 'Div 1') => {
  // GRID FORMAT matching faculty timetable template:
  // Row 0: time | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday
  // Row 1+: time slot | subject (each day's cell)
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const headerRow = ['time', ...days];
  const aoa = [headerRow];

  TIME_SLOTS.forEach(slot => {
    const row = [slot];
    days.forEach(() => {
      row.push(slot === '12:40 - 1:25' ? 'LUNCH' : '');
    });
    aoa.push(row);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Column widths: time col + one col per day
  ws['!cols'] = [{wch:16}, ...days.map(() => ({wch:22}))];
  // Enable wrap text for all data cells so multi-line content shows
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:G10');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };
      ws[addr].s = ws[addr].s || {};
      ws[addr].s.alignment = { wrapText: true, vertical: 'top' };
    }
  }
  XLSX.utils.book_append_sheet(wb, ws, 'Class Timetable');

  // Instructions sheet
  const iws = XLSX.utils.aoa_to_sheet([
    ['Department', deptName],
    ['Semester', semName],
    ['Division', divName],
    ['', ''],
    ['HOW TO FILL:', 'In each cell (Mon-Sat column), type the subject short name.'],
    ['Multi-line:', 'Line 1: Subject code (e.g. DBMS)'],
    ['', 'Line 2: Faculty Name (e.g. Prof. Priya Shah) — optional'],
    ['', 'Line 3: Room / Lab (e.g. Room 201 or Lab 2) — optional'],
    ['Example cell:', 'DBMS\nProf. Priya Shah\nRoom 201'],
    ['', ''],
    ['Leave blank', 'for free periods'],
    ['For Lab:', 'Add "Lab" anywhere in cell, e.g. DBMS Lab\nProf. Priya Shah\nLab 2'],
    ['Time slots', TIME_SLOTS.join(', ')]
  ]);
  XLSX.utils.book_append_sheet(wb, iws, 'Instructions');

  try {
    XLSX.writeFile(wb, 'class_timetable_template_' + (deptName + '_' + semName + '_' + divName).replace(/[\s.]/g, '_') + '.xlsx');
  } catch(e) { throw new Error('Failed to download template: ' + e.message); }
};

export const getAllFacultyTimetables = () => {
  const entries = getTimetableEntries();
  const result = {};
  entries.forEach(e => {
    if (!result[e.facultyId]) {
      result[e.facultyId] = {};
      TIMETABLE_DAYS.forEach(day => result[e.facultyId][day] = {});
    }
    if (!result[e.facultyId][e.day]) result[e.facultyId][e.day] = {};
    result[e.facultyId][e.day][e.timeSlot] = {
      ...e,
      // Compatibility aliases: UI uses 'subject'/'name', entries store 'subjectName'/'subjectFullName'
      subject: e.subject || e.subjectName || e.subjectId || '',
      name: e.name || e.subjectFullName || e.subjectName || ''
    };
  });
  return result;
};

// Legacy API wrappers pointing to central storage
export const getFacultyTimetable = (facultyId) => {
  const all = getAllFacultyTimetables();
  if (all[facultyId]) return JSON.parse(JSON.stringify(all[facultyId]));
  const empty = {};
  TIMETABLE_DAYS.forEach(day => empty[day] = {});
  return empty;
};

export const getClassTimetable = (sem, div, deptId = null) => {
  const entries = getEntriesByClass(deptId, sem, div);
  return convertEntriesToGrid(entries);
};

export const updateFacultySlot = (facultyId, day, timeSlot, slotData, deptId = null) => {
  const entries = getTimetableEntries();
  // Remove existing
  const filtered = entries.filter(e => !(e.facultyId === facultyId && e.day === day && e.timeSlot === timeSlot));
  const newEntry = {
    id: generateId(),
    facultyId,
    facultyName: slotData.facultyName || 'Faculty',
    subjectId: slotData.subject,
    subjectName: slotData.subject,
    subjectFullName: slotData.name,
    semId: normalizeSem(slotData.sem || '3rd Sem'),
    divId: normalizeDiv(slotData.div || 'Div 1'),
    sem: normalizeSem(slotData.sem || '3rd Sem'),
    div: normalizeDiv(slotData.div || 'Div 1'),
    departmentId: deptId,
    room: slotData.room || 'Room 201',
    color: slotData.color,
    type: slotData.type || 'Lecture',
    day,
    timeSlot
  };
  filtered.push(newEntry);
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return getFacultyTimetable(facultyId);
};

export const clearFacultySlot = (facultyId, day, timeSlot) => {
  const entries = getTimetableEntries();
  const filtered = entries.filter(e => !(e.facultyId === facultyId && e.day === day && e.timeSlot === timeSlot));
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return getFacultyTimetable(facultyId);
};

export const updateClassSlot = (sem, div, day, timeSlot, slotData, deptId = null) => {
  const entries = getTimetableEntries();
  // Clear any existing slot for this class at this day and time
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);
  const filtered = entries.filter(e => !(
    normalizeSem(e.semId || e.sem) === normSem &&
    normalizeDiv(e.divId || e.div) === normDiv &&
    e.day === day &&
    e.timeSlot === timeSlot
  ));
  const newEntry = {
    id: generateId(),
    facultyId: slotData.facultyId,
    facultyName: slotData.facultyName || 'Faculty',
    subjectId: slotData.subject,
    subjectName: slotData.subject,
    subjectFullName: slotData.name,
    semId: normSem,
    divId: normDiv,
    sem: normSem,
    div: normDiv,
    departmentId: deptId,
    room: slotData.room || 'Room 201',
    color: slotData.color,
    type: slotData.type || 'Lecture',
    day,
    timeSlot
  };
  filtered.push(newEntry);
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return convertEntriesToGrid(getEntriesByClass(deptId, sem, div));
};

export const clearClassSlot = (sem, div, day, timeSlot, deptId = null) => {
  const entries = getTimetableEntries();
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);
  const filtered = entries.filter(e => {
    const semMatch = normalizeSem(e.semId || e.sem) === normSem;
    const divMatch = normalizeDiv(e.divId || e.div) === normDiv;
    const deptMatch = !deptId || !e.departmentId || e.departmentId === deptId;
    return !(semMatch && divMatch && deptMatch && e.day === day && e.timeSlot === timeSlot);
  });
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return convertEntriesToGrid(getEntriesByClass(deptId, sem, div));
};

export const copyFacultyTimetable = (fromId, toId) => {
  const entries = getTimetableEntries();
  const fromEntries = entries.filter(e => e.facultyId === fromId);
  const withoutTo = entries.filter(e => e.facultyId !== toId);
  fromEntries.forEach(e => {
    withoutTo.push({
      ...e,
      id: generateId(),
      facultyId: toId,
      facultyName: FACULTY_NAMES[toId] || toId
    });
  });
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(withoutTo));
  notifyTimetableSync();
};

export const applyUploadedFacultyTimetable = (facultyId, newTimetable) => {
  if (!newTimetable || typeof newTimetable !== 'object') return;
  const entries = getTimetableEntries();
  const filtered = entries.filter(e => e.facultyId !== facultyId);
  
  let faculty = null;
  try {
    const facs = getFaculties();
    faculty = facs.find(f => f.id === facultyId);
  } catch(e) {}

  const facultyName = faculty?.name || FACULTY_NAMES[facultyId] || 'Faculty';
  let facultyDeptId = 'DEP_AI';
  if (faculty?.dept) {
    if (faculty.dept.includes('IT') || faculty.dept.includes('Information')) facultyDeptId = 'DEP_IT';
    else if (faculty.dept.includes('Computer')) facultyDeptId = 'DEP_CP';
    else if (faculty.dept.includes('AI') || faculty.dept.includes('Data')) facultyDeptId = 'DEP_AI';
  }

  TIMETABLE_DAYS.forEach(day => {
    const daySlots = newTimetable[day] || {};
    Object.entries(daySlots).forEach(([timeSlot, slot]) => {
      if (!slot || !slot.subject) return;
      const sem = normalizeSem(slot.sem || '3rd Sem');
      const div = normalizeDiv(slot.div || 'Div 1');
      const deptId = slot.departmentId || facultyDeptId;

      filtered.push({
        id: generateId(),
        facultyId: facultyId,
        facultyName: facultyName,
        departmentId: deptId,
        subjectId: slot.subjectId || slot.subject,
        subjectName: slot.subject,
        subjectFullName: slot.name || slot.subject,
        semId: sem,
        divId: div,
        sem: sem,
        div: div,
        room: slot.room || 'Room 201',
        color: slot.color || getSubjectColor(slot.subject),
        type: slot.type || 'Lecture',
        day,
        timeSlot
      });
    });
  });
  
  console.log('[STORAGE] applyUploadedFacultyTimetable: saving', filtered.length, 'total entries (', filtered.filter(e => e.facultyId === facultyId).length, 'for this faculty )');
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  console.log('[STORAGE] Saved. Notifying sync...');
  notifyTimetableSync();
};

export const applyUploadedClassTimetable = (sem, div, newTimetable, deptNameOrId = null) => {
  if (!newTimetable || typeof newTimetable !== 'object') return;
  const entries = getTimetableEntries();
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);

  let targetDeptId = null;
  if (deptNameOrId) {
    if (deptNameOrId.startsWith('DEP_')) targetDeptId = deptNameOrId;
    else if (deptNameOrId.includes('IT') || deptNameOrId.includes('Information')) targetDeptId = 'DEP_IT';
    else if (deptNameOrId.includes('Computer')) targetDeptId = 'DEP_CP';
    else if (deptNameOrId.includes('Mechanical')) targetDeptId = 'DEP_ME';
    else if (deptNameOrId.includes('Civil')) targetDeptId = 'DEP_CL';
    else if (deptNameOrId.includes('Electronics')) targetDeptId = 'DEP_EC';
    else targetDeptId = 'DEP_AI';
  }
  
  const filtered = entries.filter(e => {
    const semMatch = normalizeSem(e.semId || e.sem) === normSem;
    const divMatch = normalizeDiv(e.divId || e.div) === normDiv;
    const deptMatch = !targetDeptId || !e.departmentId || e.departmentId === targetDeptId;
    return !(semMatch && divMatch && deptMatch);
  });

  let allFaculties = [];
  try { allFaculties = getFaculties(); } catch(e) {}
  
  TIMETABLE_DAYS.forEach(day => {
    const daySlots = newTimetable[day] || {};
    Object.entries(daySlots).forEach(([timeSlot, slot]) => {
      if (!slot || !slot.subject) return;

      let resolvedFacId = slot.facultyId;
      let resolvedFacName = slot.facultyName || 'Faculty Assigned';

      if (!resolvedFacId && slot.facultyName) {
        const found = allFaculties.find(f => 
          f.name.toLowerCase() === slot.facultyName.toLowerCase() ||
          f.name.toLowerCase().includes(slot.facultyName.toLowerCase()) ||
          (f.id && slot.facultyName.toUpperCase().includes(f.id.replace('FAC_', '')))
        );
        if (found) {
          resolvedFacId = found.id;
          resolvedFacName = found.name;
        }
      }

      filtered.push({
        id: generateId(),
        facultyId: resolvedFacId,
        facultyName: resolvedFacName,
        departmentId: slot.departmentId || targetDeptId || 'DEP_AI',
        subjectId: slot.subject,
        subjectName: slot.subject,
        subjectFullName: slot.name || slot.subject,
        semId: normSem,
        divId: normDiv,
        sem: normSem,
        div: normDiv,
        room: slot.room || 'Room 201',
        color: slot.color || getSubjectColor(slot.subject),
        type: slot.type || 'Lecture',
        day,
        timeSlot
      });
    });
  });
  
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
};

// =========================================================================
// BACKWARD COMPATIBLE TIMETABLE API (For EnterAttendance & Legacy View)
// =========================================================================

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getTimetable = () => {
  const data = localStorage.getItem(TT_STORAGE_KEYS.TIMETABLE);
  if (!data) {
    const defaultLegacy = {
      Monday: [
        { time: '09:00 AM - 10:00 AM', subjectId: 'SUB_DS', room: 'Classroom 301', type: 'Theory' },
        { time: '10:00 AM - 11:00 AM', subjectId: 'SUB01', room: 'Classroom 301', type: 'Theory' },
        { time: '11:15 AM - 01:15 PM', subjectId: 'SUB03', room: 'Database Lab 2', type: 'Lab' },
      ],
      Tuesday: [
        { time: '09:00 AM - 10:00 AM', subjectId: 'SUB03', room: 'Classroom 301', type: 'Theory' },
        { time: '10:00 AM - 11:00 AM', subjectId: 'SUB04', room: 'Classroom 301', type: 'Theory' },
      ],
      Wednesday: [
        { time: '09:00 AM - 10:00 AM', subjectId: 'SUB01', room: 'Classroom 301', type: 'Theory' },
        { time: '10:00 AM - 11:00 AM', subjectId: 'SUB_DS', room: 'Classroom 301', type: 'Theory' },
      ],
      Thursday: [
        { time: '09:00 AM - 10:00 AM', subjectId: 'SUB_DS', room: 'Classroom 301', type: 'Theory' },
        { time: '10:00 AM - 11:00 AM', subjectId: 'SUB02', room: 'Classroom 301', type: 'Theory' },
      ],
      Friday: [
        { time: '09:00 AM - 10:00 AM', subjectId: 'SUB04', room: 'Classroom 301', type: 'Theory' },
        { time: '10:00 AM - 11:00 AM', subjectId: 'SUB03', room: 'Classroom 301', type: 'Theory' },
      ],
      Saturday: [
        { time: '09:00 AM - 10:00 AM', subjectId: 'SUB01', room: 'Classroom 301', type: 'Theory' },
      ],
      Sunday: []
    };
    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE, JSON.stringify(defaultLegacy));
    return defaultLegacy;
  }
  return JSON.parse(data);
};

export const saveTimetable = (timetableData, fileInfo = null) => {
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE, JSON.stringify(timetableData));
  if (fileInfo) {
    localStorage.setItem(TT_STORAGE_KEYS.UPLOADED_FILE_INFO, JSON.stringify(fileInfo));
  }
  return timetableData;
};

export const getScheduledLecturesForDate = (dateStr) => {
  if (!dateStr) return { dayName: '', lectures: [] };
  const d = new Date(dateStr + 'T00:00:00');
  const dayName = DAYS[d.getDay()];
  const entries = getTimetableEntries();
  const dayEntries = entries.filter(e => e.day === dayName);
  if (dayEntries.length > 0) {
    const lectures = dayEntries.map(e => ({
      time: e.timeSlot,
      subjectId: e.subjectId,
      subjectName: e.subjectName || e.subjectFullName || e.subjectId,
      facultyId: e.facultyId,
      facultyName: e.facultyName,
      sem: e.semId || e.sem,
      div: e.divId || e.div,
      departmentId: e.departmentId,
      room: e.room,
      type: e.type || 'Lecture'
    }));
    return { dayName, lectures };
  }
  const timetable = getTimetable();
  const lectures = timetable[dayName] || [];
  return { dayName, lectures };
};

export const getFacultyScheduledLecturesForDate = (facultyId, dateStr) => {
  if (!dateStr || !facultyId) return { dayName: '', lectures: [] };
  const d = new Date(dateStr + 'T00:00:00');
  const dayName = DAYS[d.getDay()];
  const entries = getTimetableEntries();
  const dayEntries = entries.filter(e => {
    if (e.facultyId !== facultyId) return false;
    if (e.isRescheduled && e.rescheduledDate) {
      return e.rescheduledDate === dateStr;
    }
    return e.day === dayName;
  });
  if (dayEntries.length > 0) {
    const lectures = dayEntries.map(e => ({
      id: e.id,
      time: e.timeSlot,
      subjectId: e.subjectId,
      subjectName: e.subjectName || e.subjectFullName || e.subjectId,
      facultyId: e.facultyId,
      facultyName: e.facultyName,
      sem: e.semId || e.sem,
      div: e.divId || e.div,
      batch: e.batch,
      departmentId: e.departmentId,
      room: e.room,
      type: e.type || 'Lecture',
      isRescheduled: !!e.isRescheduled,
      rescheduledDate: e.rescheduledDate,
      rescheduleReason: e.rescheduleReason
    }));
    return { dayName, lectures };
  }
  // Fallback to getFacultyTimetable
  const grid = getFacultyTimetable(facultyId);
  const daySlots = grid[dayName] || {};
  const lectures = [];
  Object.keys(daySlots).forEach(time => {
    const s = daySlots[time];
    if (s && s.subject) {
      lectures.push({
        id: s.id,
        time,
        subjectId: s.subject,
        subjectName: s.name || s.subject,
        facultyId,
        sem: s.sem,
        div: s.div,
        batch: s.batch,
        room: s.room,
        type: s.type || 'Lecture',
        color: s.color,
        isRescheduled: !!s.isRescheduled,
        rescheduledDate: s.rescheduledDate,
        rescheduleReason: s.rescheduleReason
      });
    }
  });
  return { dayName, lectures };
};



// =========================================================================
// EXCEL / CSV TIMETABLE PARSERS
// =========================================================================

// ─────────────────────────────────────────────────────────────────────────
// SMART TIMETABLE PARSER — auto-detects two formats:
//
// FORMAT A — GRID (horizontal, user-uploaded real timetables):
//   Row 0:  time  | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday
//   Row 1: 9:00-9:55 | DBMS / Div 1 / 201 |  ...
//   Each cell: subject on line 1, optional class/room on later lines

//
// FORMAT B — LIST (vertical, template generated by this app):
//   Col: Day | TimeSlot | Subject(short) | FullName | Sem | Div | Room | Type
// ─────────────────────────────────────────────────────────────────────────

// Fuzzy-match a cell time value to the nearest known TIME_SLOT
const _fuzzyTimeSlot = (cellTime) => {
  if (!cellTime) return null;
  const s = String(cellTime)
    .replace(/[\u2010-\u2015\u2212\uFF0D]/g, '-')
    .replace(/\s+/g, '')
    .toLowerCase();

  if (s.includes('lunch') || s.includes('break')) return '12:40 - 1:25';

  const exact = TIME_SLOTS.find(ts => ts.replace(/\s/g, '') === s);
  if (exact) return exact;

  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h >= 1 && h <= 5) h += 12;
  const totalMins = h * 60 + min;

  const slotStarts = [
    { start: 9 * 60, slot: '9:00 - 9:55' },
    { start: 10 * 60, slot: '10:00 - 10:50' },
    { start: 10 * 60 + 55, slot: '10:55 - 11:45' },
    { start: 11 * 60 + 50, slot: '11:50 - 12:40' },
    { start: 12 * 60 + 40, slot: '12:40 - 1:25' },
    { start: 13 * 60 + 25, slot: '1:25 - 2:15' },
    { start: 14 * 60 + 20, slot: '2:20 - 3:10' },
    { start: 15 * 60 + 15, slot: '3:15 - 4:05' },
    { start: 16 * 60 + 10, slot: '4:10 - 5:00' }
  ];

  let bestMatch = null;
  let minDiff = 25;
  for (const sDef of slotStarts) {
    const diff = Math.abs(totalMins - sDef.start);
    if (diff < minDiff) {
      minDiff = diff;
      bestMatch = sDef.slot;
    }
  }
  return bestMatch;
};

// Parse a multi-line cell from grid format → { subject, room, type, sem, div, deptId }
const _parseCellContent = (cellText, defaultSem, defaultDiv, defaultDeptId) => {
  const raw = String(cellText || '').trim();
  if (!raw) return null;
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  if (lines.some(l => /^(lunch|break|lb|-+)$/i.test(l))) return null;

  let subject = '';
  let room = 'Room 201';
  let sem = null;
  let div = null;
  let deptId = null;

  const deptCodeMap = {
    'AI': 'DEP_AI',
    'IT': 'DEP_IT',
    'CP': 'DEP_CP',
    'CE': 'DEP_CP',
    'EC': 'DEP_EC',
    'ME': 'DEP_ME',
    'CL': 'DEP_CL'
  };

  // 1. Room extraction
  // Pure parenthesised room number: (141), (211), (313), (321), etc.
  for (const line of lines) {
    const pMatch = line.match(/\((\d{2,4})\)/);
    if (pMatch) {
      room = pMatch[1];
      break;
    }
    // Standalone room code: 205, IT-6, IT-0, IT-3, 10S, 311, 312
    const sMatch = line.match(/^(IT-?\d+|\d{2,4}[A-Z]?|[A-Z]{1,2}-?\d+|10S)$/i);
    if (sMatch) {
      room = sMatch[1];
      break;
    }
  }

  // 2. Semester, Department & Division extraction
  // Look for tokens like 7IT1, 7IT2, 5AI, 7AI, 3PG, 1AI, etc.
  for (const line of lines) {
    const tokenMatch = line.match(/\b([1-8])\s*(AI|IT|CP|CE|ME|EC|CL|PG)(\d?)\b/i);
    if (tokenMatch) {
      const sNum = tokenMatch[1];
      const dCode = tokenMatch[2].toUpperCase();
      const divNum = tokenMatch[3];

      const suffixes = { '1': 'st', '2': 'nd', '3': 'rd' };
      sem = `${sNum}${suffixes[sNum] || 'th'} Sem`;
      if (divNum) {
        div = `Div ${divNum}`;
      }
      if (deptCodeMap[dCode]) {
        deptId = deptCodeMap[dCode];
      }
      break;
    }
  }

  // 3. Subject extraction
  // Clean away:
  // - Leading schedule codes: 1ZBS, 2XCS, 1WCS, 2XAS, 1AI?, 1PG, 3PG
  // - Course codes in brackets: (202047809)
  // - Known faculty initials: DJP, PS, RP, AK, SM, DT, NM, RJ
  // - Known department/degree codes: AI, IT, CP, CE, ME, EC, CL, PG
  const facultyInitials = ['DJP', 'PS', 'RP', 'AK', 'SM', 'DT', 'NM', 'RJ', 'PB', 'RKU', 'KJP', 'CB', 'VJC', 'KAS', 'KKP', 'SRS', 'HM'];
  const weekdayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'TIME', 'DAY', 'DAYS', 'SLOT', 'HOURS'];
  const ignoredCodes = ['AI', 'IT', 'CP', 'CE', 'ME', 'EC', 'CL', 'PG', 'UG', 'LAB', 'ROOM', 'DIV', 'SEM', ...facultyInitials, ...weekdayNames];

  for (const line of lines) {
    const cleaned = line
      .replace(/^\d[A-Z0-9?!]+\s*/gi, '')
      .replace(/\([^)]*\)/g, '')
      .trim();

    const words = cleaned.split(/\s+/);
    for (const w of words) {
      const cleanWord = w.replace(/[^A-Z]/gi, '').toUpperCase();
      if (cleanWord.length >= 2 && !ignoredCodes.includes(cleanWord)) {
        subject = cleanWord;
        break;
      }
    }
    if (subject) break;
  }

  if (!subject) return null;

  const isLab = /lab/i.test(raw);
  return {
    subject,
    name: subject,
    sem: sem || normalizeSem(defaultSem),
    div: div || normalizeDiv(defaultDiv),
    deptId: deptId || defaultDeptId,
    room,
    type: isLab ? 'Lab' : 'Lecture'
  };
};

// Detect if the spreadsheet uses GRID format (time | Mon | Tue …)
const _isGridFormat = (rows) => {
  if (!rows || rows.length < 2) return false;
  const header = rows[0];
  if (!header || header.length < 3) return false;
  const dayHits = TIMETABLE_DAYS.filter(d =>
    header.some(cell => String(cell || '').toLowerCase().includes(d.toLowerCase()))
  );
  // Grid format: header row contains at least 3 day names
  return dayHits.length >= 3;
};

const _parseSheetRows = (rows, defaultSem, defaultDiv, scopeIsClass, defaultDeptId = 'DEP_AI', targetFacultyId = null) => {
  const timetable = {};
  TIMETABLE_DAYS.forEach(d => { timetable[d] = {}; });
  const previewLectures = [];
  const errorRows = [];
  const conflictRows = [];
  const duplicateRows = [];
  const validLectures = [];

  const registeredFaculties = getFaculties();
  const existingEntries = getTimetableEntries();

  // ── FORMAT A: GRID (time × day) ──
  if (_isGridFormat(rows)) {
    const header = rows[0];
    // Map column index → day name
    const colToDay = {};
    header.forEach((cell, colIdx) => {
      if (colIdx === 0) return;
      const day = TIMETABLE_DAYS.find(d => String(cell || '').toLowerCase().includes(d.toLowerCase()));
      if (day) colToDay[colIdx] = day;
    });

    // Each subsequent row: col 0 = time slot, other cols = cell content
    for (let ri = 1; ri < rows.length; ri++) {
      const row = rows[ri];
      if (!row || row.every(c => !c)) continue;
      const timeSlot = _fuzzyTimeSlot(row[0]);
      if (!timeSlot) continue;
      if (timeSlot === '12:40 - 1:25') continue; // lunch

      Object.entries(colToDay).forEach(([colIdxStr, day]) => {
        const colIdx = parseInt(colIdxStr);
        const cellText = row[colIdx];
        if (!cellText) return;
        const parsed = _parseCellContent(cellText, defaultSem, defaultDiv, defaultDeptId);
        if (!parsed) return;

        const sem = parsed.sem || normalizeSem(defaultSem);
        const div = parsed.div || normalizeDiv(defaultDiv);
        const deptId = parsed.deptId || defaultDeptId || 'DEP_AI';
        const room = parsed.room || 'Room 201';
        const type = parsed.type || 'Lecture';

        timetable[day][timeSlot] = {
          subject: parsed.subject,
          name: parsed.subject,
          sem,
          div,
          departmentId: deptId,
          room,
          type,
          color: getSubjectColor(parsed.subject)
        };
        const lec = {
          day,
          time: timeSlot,
          subject: parsed.subject,
          room,
          sem,
          div,
          departmentId: deptId,
          status: 'valid'
        };
        previewLectures.push(lec);
        validLectures.push(lec);
      });
    }
    return { timetable, previewLectures, errorRows, conflictRows, duplicateRows, validLectures };
  }

  // ── FORMAT C: COLUMNAR TIMETABLE ──
  // Checks if spreadsheet has explicit columns for Faculty, Subject, Day, Time/Start/End, Room, Batch
  let headerRowIdx = -1;
  const colMap = {};
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const r = rows[i].map(c => String(c || '').trim().toLowerCase());
    const hasFac = r.some(c => c.includes('faculty') || c.includes('professor') || c.includes('teacher'));
    const hasSubj = r.some(c => c.includes('subject') || c.includes('course'));
    const hasDay = r.some(c => c.includes('day'));
    const hasTime = r.some(c => c.includes('time') || c.includes('slot') || c.includes('start'));
    if ((hasFac || hasSubj) && (hasDay || hasTime)) {
      headerRowIdx = i;
      r.forEach((h, cIdx) => {
        if (/faculty\s*id|faculty\s*code|fac_id|fac\s*id/i.test(h)) colMap.facId = cIdx;
        else if (/faculty|faculty\s*name|professor|teacher|instructor/i.test(h)) colMap.facName = cIdx;
        else if (/dept|department/i.test(h)) colMap.dept = cIdx;
        else if (/subject|subject\s*name|subject\s*code|course/i.test(h)) colMap.subj = cIdx;
        else if (/semester|sem/i.test(h)) colMap.sem = cIdx;
        else if (/division|div/i.test(h)) colMap.div = cIdx;
        else if (/batch|student\s*batch|group/i.test(h)) colMap.batch = cIdx;
        else if (/^day|day\s*of\s*week/i.test(h)) colMap.day = cIdx;
        else if (/start\s*time|from\s*time|start/i.test(h)) colMap.start = cIdx;
        else if (/end\s*time|to\s*time|end/i.test(h)) colMap.end = cIdx;
        else if (/time\s*slot|time|slot/i.test(h)) colMap.time = cIdx;
        else if (/room|room\s*no|room\s*number|classroom|lab/i.test(h)) colMap.room = cIdx;
        else if (/type|slot\s*type/i.test(h)) colMap.type = cIdx;
      });
      break;
    }
  }

  if (headerRowIdx !== -1 && colMap.subj !== undefined && colMap.day !== undefined) {
    const seenSheetKeys = new Set();
    for (let ri = headerRowIdx + 1; ri < rows.length; ri++) {
      const row = rows[ri];
      if (!row || row.every(c => !c)) continue;
      const rowNum = ri + 1;

      const rawFacId = colMap.facId !== undefined ? String(row[colMap.facId] || '').trim() : '';
      const rawFacName = colMap.facName !== undefined ? String(row[colMap.facName] || '').trim() : '';
      const rawSubj = String(row[colMap.subj] || '').trim();
      const rawDay = String(row[colMap.day] || '').trim();
      const rawDept = colMap.dept !== undefined ? String(row[colMap.dept] || '').trim() : '';
      const rawSem = colMap.sem !== undefined ? String(row[colMap.sem] || '').trim() : defaultSem;
      const rawDiv = colMap.div !== undefined ? String(row[colMap.div] || '').trim() : defaultDiv;
      const rawBatch = colMap.batch !== undefined ? String(row[colMap.batch] || '').trim() : 'All';
      const rawRoom = colMap.room !== undefined ? String(row[colMap.room] || '').trim() : 'Room 201';
      const rawType = colMap.type !== undefined ? String(row[colMap.type] || '').trim() : 'Lecture';

      let rawTime = '';
      if (colMap.start !== undefined && colMap.end !== undefined && row[colMap.start] && row[colMap.end]) {
        rawTime = `${String(row[colMap.start]).trim()} - ${String(row[colMap.end]).trim()}`;
      } else if (colMap.time !== undefined) {
        rawTime = String(row[colMap.time] || '').trim();
      }

      // Check subject
      if (!rawSubj || /lunch|break/i.test(rawSubj)) continue;

      // Validate Day
      const dayHit = TIMETABLE_DAYS.find(d => d.toLowerCase() === rawDay.toLowerCase() || rawDay.toLowerCase().includes(d.toLowerCase()));
      if (!dayHit) {
        const errStr = `Row ${rowNum}: Invalid day "${rawDay}". Must be Monday - Saturday.`;
        errorRows.push({ row: rowNum, error: errStr, reason: errStr, message: errStr });
        continue;
      }

      // Validate Time Slot
      let timeSlot = TIME_SLOTS.find(ts =>
        ts.replace(/\s/g, '') === rawTime.replace(/\s/g, '') ||
        ts.replace(/\s/g, '').startsWith(rawTime.replace(/\s/g, '').slice(0, 5))
      ) || _fuzzyTimeSlot(rawTime);

      if (!timeSlot || !TIME_SLOTS.includes(timeSlot)) {
        const errStr = `Row ${rowNum}: Invalid or unrecognized lecture time "${rawTime}".`;
        errorRows.push({ row: rowNum, error: errStr, reason: errStr, message: errStr });
        continue;
      }

      if (timeSlot === '12:40 - 1:25') continue; // lunch slot

      // Validate Faculty
      let matchedFaculty = null;
      if (rawFacId) {
        matchedFaculty = registeredFaculties.find(f => f.id.toLowerCase() === rawFacId.toLowerCase());
        if (!matchedFaculty) {
          // If ID not found directly, try matching by faculty name
          matchedFaculty = registeredFaculties.find(f => f.name.toLowerCase() === rawFacId.toLowerCase() || (rawFacName && f.name.toLowerCase() === rawFacName.toLowerCase()));
        }
        if (!matchedFaculty) {
          const errStr = `Row ${rowNum}: Faculty ID "${rawFacId}" is not recognized or registered in the system.`;
          errorRows.push({ row: rowNum, error: errStr, reason: errStr, message: errStr });
          continue;
        }
      } else if (rawFacName) {
        matchedFaculty = registeredFaculties.find(f => f.name.toLowerCase().includes(rawFacName.toLowerCase()) || rawFacName.toLowerCase().includes(f.name.toLowerCase()));
      }

      // Fallback faculty if targetFacultyId provided
      if (!matchedFaculty && targetFacultyId) {
        matchedFaculty = registeredFaculties.find(f => f.id === targetFacultyId);
      }

      const assignedFacId = matchedFaculty ? matchedFaculty.id : (targetFacultyId || 'FAC_PS');
      const assignedFacName = matchedFaculty ? matchedFaculty.name : (rawFacName || 'Prof. Priya Shah');

      // Check Conflicts
      let hasConflict = false;
      let conflictMsg = '';

      // 1. Room conflict: same room, same day & time by another class/faculty
      const roomConflict = existingEntries.find(e =>
        e.day === dayHit &&
        e.timeSlot === timeSlot &&
        e.room && e.room.toLowerCase() === rawRoom.toLowerCase() &&
        e.facultyId !== assignedFacId
      );
      if (roomConflict) {
        hasConflict = true;
        conflictMsg = `Room conflict: ${rawRoom} is already occupied by ${roomConflict.facultyName || 'another faculty'} (${roomConflict.subjectName}) on ${dayHit} ${timeSlot}.`;
        conflictRows.push({ row: rowNum, warning: conflictMsg, reason: conflictMsg, message: conflictMsg });
      }

      // 2. Faculty Overlapping conflict: same faculty scheduled for multiple slots
      const facultyOverlap = existingEntries.find(e =>
        e.day === dayHit &&
        e.timeSlot === timeSlot &&
        e.facultyId === assignedFacId &&
        (e.sem !== normalizeSem(rawSem) || e.div !== normalizeDiv(rawDiv))
      );
      if (facultyOverlap) {
        hasConflict = true;
        conflictMsg = `Faculty overlap: ${assignedFacName} already has lecture (${facultyOverlap.subjectName}) on ${dayHit} ${timeSlot}.`;
        conflictRows.push({ row: rowNum, warning: conflictMsg, reason: conflictMsg, message: conflictMsg });
      }

      // 3. Duplicate entry (checks both DB entries and intra-sheet duplicates)
      const semNorm = normalizeSem(rawSem);
      const divNorm = normalizeDiv(rawDiv);
      const sheetKey = `${assignedFacId}_${dayHit}_${timeSlot}_${rawSubj}_${semNorm}_${divNorm}`;
      const isDupInSheet = seenSheetKeys.has(sheetKey);
      const isDupInDb = existingEntries.some(e =>
        e.day === dayHit &&
        e.timeSlot === timeSlot &&
        e.facultyId === assignedFacId &&
        e.subjectName === rawSubj &&
        normalizeSem(e.semId || e.sem) === semNorm &&
        normalizeDiv(e.divId || e.div) === divNorm
      );
      const isDuplicate = isDupInDb || isDupInSheet;
      seenSheetKeys.add(sheetKey);

      if (isDuplicate) {
        const dupMsg = `Duplicate lecture: ${rawSubj} already exists for ${assignedFacName} on ${dayHit} ${timeSlot}.`;
        duplicateRows.push({ row: rowNum, warning: dupMsg, reason: dupMsg, message: dupMsg });
      }

      const color = getSubjectColor(rawSubj);

      const lecObj = {
        rowNum,
        day: dayHit,
        time: timeSlot,
        subject: rawSubj,
        name: rawSubj,
        room: rawRoom,
        sem: semNorm,
        div: divNorm,
        batch: rawBatch,
        department: rawDept || defaultDeptId,
        departmentId: defaultDeptId,
        facultyId: assignedFacId,
        facultyName: assignedFacName,
        type: rawType || (rawSubj.toLowerCase().includes('lab') ? 'Lab' : 'Lecture'),
        color,
        hasConflict,
        conflictMsg,
        isDuplicate,
        status: hasConflict ? 'conflict' : isDuplicate ? 'duplicate' : 'valid'
      };

      previewLectures.push(lecObj);
      if (!hasConflict) {
        validLectures.push(lecObj);
      }

      // If matches target faculty, populate the timetable grid view
      if (!targetFacultyId || assignedFacId === targetFacultyId) {
        timetable[dayHit][timeSlot] = {
          subject: rawSubj,
          name: rawSubj,
          sem: semNorm,
          div: divNorm,
          batch: rawBatch,
          departmentId: defaultDeptId,
          room: rawRoom,
          type: rawType || (rawSubj.toLowerCase().includes('lab') ? 'Lab' : 'Lecture'),
          color,
          facultyId: assignedFacId,
          facultyName: assignedFacName
        };
      }
    }

    return { timetable, previewLectures, errorRows, conflictRows, duplicateRows, validLectures };
  }

  // ── FORMAT B: LIST (Day | TimeSlot | Subject … columns) ──
  let currentDay = '';
  let dataStart = 0;
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const rowText = rows[i].join(' ').toLowerCase();
    if (rowText.includes('day') || rowText.includes('time') || rowText.includes('slot')) {
      dataStart = i + 1; break;
    }
  }

  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every(c => !c)) continue;
    const c0 = String(row[0] || '').trim();
    const c1 = String(row[1] || '').trim();
    const c2 = String(row[2] || '').trim();
    const c3 = String(row[3] || '').trim();
    const c4 = String(row[4] || '').trim();
    const c5 = String(row[5] || '').trim();
    const c6 = String(row[6] || '').trim();
    const c7 = String(row[7] || '').trim();

    const dayHit = TIMETABLE_DAYS.find(d => c0.toLowerCase().includes(d.toLowerCase()));
    if (dayHit) currentDay = dayHit;
    if (!currentDay) continue;

    const timeSlot = TIME_SLOTS.find(ts =>
      ts.replace(/\s/g, '') === c1.replace(/\s/g, '') ||
      ts.replace(/\s/g, '').startsWith(c1.replace(/\s/g, '').slice(0, 5))
    ) || _fuzzyTimeSlot(c1) || c1;
    if (!TIME_SLOTS.includes(timeSlot)) continue;
    if (!c2 || /lunch|break/i.test(c2)) continue;

    if (scopeIsClass) {
      const room = c4 || 'Room 201'; const type = c5 || 'Lecture'; const facultyName = c6 || '';
      timetable[currentDay][timeSlot] = { subject: c2, name: c3 || c2, sem: normalizeSem(defaultSem), div: normalizeDiv(defaultDiv), departmentId: defaultDeptId, room, type, color: getSubjectColor(c2), facultyName };
      previewLectures.push({ day: currentDay, time: timeSlot, subject: c2, room, facultyName, sem: normalizeSem(defaultSem), div: normalizeDiv(defaultDiv), departmentId: defaultDeptId, status: 'valid' });
    } else {
      const sem = normalizeSem(c4 || defaultSem); const div = normalizeDiv(c5 || defaultDiv);
      const room = c6 || 'Room 201'; const type = c7 || 'Lecture';
      timetable[currentDay][timeSlot] = { subject: c2, name: c3 || c2, sem, div, departmentId: defaultDeptId, room, type, color: getSubjectColor(c2) };
      previewLectures.push({ day: currentDay, time: timeSlot, subject: c2, room, sem, div, departmentId: defaultDeptId, status: 'valid' });
    }
  }
  return { timetable, previewLectures, errorRows, conflictRows, duplicateRows, validLectures: previewLectures };
};

const _readAsUint8Array = (file) => {
  if (file instanceof Uint8Array) return Promise.resolve(file);
  if (file instanceof ArrayBuffer) return Promise.resolve(new Uint8Array(file));
  if (Array.isArray(file)) return Promise.resolve(new Uint8Array(file));
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => resolve(new Uint8Array(e.target.result));
    r.onerror = () => reject(new Error('Cannot read file. It may be locked or corrupted.'));
    r.readAsArrayBuffer(file);
  });
};

export const parseExcelTimetableForFaculty = async (file, facultyId, semFilter, divFilter, deptNameOrId) => {
  if (!file) throw new Error('No file provided.');
  const bytes = await _readAsUint8Array(file);
  let wb;
  try { wb = XLSX.read(bytes, { type: 'array' }); }
  catch (e) { throw new Error('Could not parse spreadsheet. Ensure the file is a valid .xlsx or .csv.'); }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error('Spreadsheet has no sheets.');
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rows || rows.length < 2) throw new Error('Spreadsheet appears to be empty.');
  let defaultDeptId = 'DEP_AI';
  if (deptNameOrId) {
    if (deptNameOrId.startsWith('DEP_')) defaultDeptId = deptNameOrId;
    else if (deptNameOrId.includes('IT') || deptNameOrId.includes('Information')) defaultDeptId = 'DEP_IT';
    else if (deptNameOrId.includes('Computer')) defaultDeptId = 'DEP_CP';
  } else if (facultyId) {
    try {
      const facs = getFaculties();
      const f = facs.find(fac => fac.id === facultyId);
      if (f && f.dept) {
        if (f.dept.includes('IT') || f.dept.includes('Information')) defaultDeptId = 'DEP_IT';
        else if (f.dept.includes('Computer')) defaultDeptId = 'DEP_CP';
      }
    } catch(e) {}
  }
  const { timetable, previewLectures, errorRows, conflictRows, duplicateRows, validLectures } = _parseSheetRows(rows, semFilter || '3rd Sem', divFilter || 'Div 1', false, defaultDeptId, facultyId);
  const summary = calculateTimetableSummary(timetable);
  const fileName = (file && file.name) ? file.name : 'uploaded_timetable.xlsx';
  const fileSize = (file && file.size) ? (file.size / 1024).toFixed(1) + ' KB' : 'Spreadsheet';
  const fileType = fileName.toLowerCase().endsWith('.csv') ? 'csv' : 'excel';
  const fileInfo = { name: fileName, size: fileSize, type: fileType };
  return { timetable, fileInfo, summary, previewLectures, errorRows, conflictRows, duplicateRows, validLectures };
};

export const parseExcelTimetableForClass = async (file, semFilter, divFilter, deptName) => {
  if (!file) throw new Error('No file provided.');
  const bytes = await _readAsUint8Array(file);
  let wb;
  try { wb = XLSX.read(bytes, { type: 'array' }); }
  catch (e) { throw new Error('Could not parse spreadsheet. Ensure the file is a valid .xlsx or .csv.'); }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error('Spreadsheet has no sheets.');
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rows || rows.length < 2) throw new Error('Spreadsheet appears to be empty.');
  const { timetable, previewLectures } = _parseSheetRows(rows, semFilter || '3rd Sem', divFilter || 'Div 1', true);
  const summary = calculateTimetableSummary(timetable);
  const fileName = (file && file.name) ? file.name : 'class_timetable.xlsx';
  const fileSize = (file && file.size) ? (file.size / 1024).toFixed(1) + ' KB' : 'Spreadsheet';
  const fileInfo = { name: fileName, size: fileSize, type: 'excel' };
  return { timetable, fileInfo, summary, previewLectures };
};

// =========================================================================
// COMMON TIMETABLE NORMALIZATION & VALIDATION PIPELINE
// Used identically by Excel, PDF, and Image parsers
// =========================================================================

export const normalizeTimetable = (rawTimetable, defaultSem = '3rd Sem', defaultDiv = 'Div 1', defaultDeptId = 'DEP_AI', facultyName = '') => {
  const timetable = {};
  TIMETABLE_DAYS.forEach(day => { timetable[day] = {}; });
  const previewLectures = [];
  const subjectsSet = new Set();

  if (rawTimetable && typeof rawTimetable === 'object') {
    TIMETABLE_DAYS.forEach(day => {
      const daySlots = rawTimetable[day] || {};
      Object.entries(daySlots).forEach(([timeSlot, slot]) => {
        if (!slot || !slot.subject) return;
        const subjShort = String(slot.subject).trim();
        if (!subjShort || /^(lunch|break|lb|-+)$/i.test(subjShort)) return;

        const sem = normalizeSem(slot.sem || defaultSem);
        const div = normalizeDiv(slot.div || defaultDiv);
        const deptId = slot.departmentId || defaultDeptId;
        const room = slot.room || 'Room 201';
        const type = slot.type || 'Lecture';
        const name = slot.name || slot.subjectFullName || subjShort;
        const color = slot.color || getSubjectColor(subjShort);
        const facName = slot.facultyName || facultyName || '';

        const normalizedSlot = {
          subject: subjShort,
          name,
          sem,
          div,
          departmentId: deptId,
          room,
          type,
          color,
          facultyName: facName
        };

        timetable[day][timeSlot] = normalizedSlot;
        subjectsSet.add(subjShort);

        previewLectures.push({
          day,
          time: timeSlot,
          subject: subjShort,
          name,
          room,
          sem,
          div,
          departmentId: deptId,
          facultyName: facName
        });
      });
    });
  }

  const activeDays = new Set(previewLectures.map(l => l.day)).size;
  const summary = {
    totalLectures: previewLectures.length,
    activeDays,
    uniqueSubjects: Array.from(subjectsSet),
    subjectCount: subjectsSet.size
  };

  return { timetable, summary, previewLectures };
};

export const validateTimetable = (normalizedResult) => {
  if (!normalizedResult || !normalizedResult.timetable) {
    return { valid: false, error: 'Timetable data is incomplete or invalid.', totalLectures: 0 };
  }
  const total = normalizedResult.summary?.totalLectures || normalizedResult.previewLectures?.length || 0;
  if (total === 0) {
    return { valid: false, error: 'File was read, but no timetable entries could be detected.', totalLectures: 0 };
  }
  return { valid: true, error: null, totalLectures: total };
};

export const commitUploadedTimetable = (targetScope, targetId, timetableData, options = {}) => {
  // Support overload calls:
  // commitUploadedTimetable(validLecturesArray)
  // commitUploadedTimetable(parseResultObject)
  // commitUploadedTimetable('faculty', 'FAC01', timetableData, options)
  if (Array.isArray(targetScope)) {
    timetableData = { validLectures: targetScope };
    targetScope = 'faculty';
    targetId = null;
  } else if (targetScope && typeof targetScope === 'object' && (targetScope.validLectures || targetScope.timetable)) {
    timetableData = targetScope;
    targetScope = 'faculty';
    targetId = null;
  }

  if (!timetableData) {
    throw new Error('No timetable data provided to save.');
  }

  // If columnar validLectures are available with explicit faculty assignments:
  if (timetableData.validLectures && timetableData.validLectures.length > 0) {
    const existingEntries = getTimetableEntries();
    // Group valid lectures by facultyId
    const facultiesInUpload = new Set(timetableData.validLectures.map(l => l.facultyId).filter(Boolean));
    
    // If targetScope is faculty and no faculty IDs were specified in rows, default to targetId
    if (facultiesInUpload.size === 0 && targetId) {
      facultiesInUpload.add(targetId);
    }

    // Filter out previous entries for these faculties so we replace with the new upload without duplicates
    let updatedEntries = existingEntries.filter(e => !facultiesInUpload.has(e.facultyId));

    timetableData.validLectures.forEach(lec => {
      const facId = lec.facultyId || targetId || 'FAC_PS';
      const facName = lec.facultyName || 'Faculty';
      updatedEntries.push({
        id: generateId(),
        facultyId: facId,
        facultyName: facName,
        departmentId: lec.departmentId || 'DEP_AI',
        subjectId: lec.subject,
        subjectName: lec.subject,
        subjectFullName: lec.name || lec.subject,
        semId: lec.sem,
        divId: lec.div,
        sem: lec.sem,
        div: lec.div,
        batch: lec.batch || 'All',
        room: lec.room || 'Room 201',
        color: lec.color || getSubjectColor(lec.subject),
        type: lec.type || 'Lecture',
        day: lec.day,
        timeSlot: lec.time
      });
    });

    localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(updatedEntries));
    notifyTimetableSync();
    return timetableData.validLectures.length;
  }

  if (targetScope === 'faculty') {
    applyUploadedFacultyTimetable(targetId, timetableData.timetable);
    return true;
  } else {
    const sem = options.sem || '3rd Sem';
    const div = options.div || 'Div 1';
    const dept = options.departmentName || null;
    applyUploadedClassTimetable(sem, div, timetableData.timetable, dept);
    return true;
  }
};

// =========================================================================
// OCR HELPER (Tesseract.js Browser Worker)
// =========================================================================

const _runTesseractOCR = async (imageSource) => {
  if (!window.Tesseract) {
    throw new Error('OCR library (Tesseract.js) is not loaded.');
  }
  console.log('[OCR] Initializing Tesseract worker...');
  let worker = null;
  try {
    worker = await window.Tesseract.createWorker({
      workerPath: '/libs/tesseract-worker.min.js',
      corePath: '/libs/tesseract-core.wasm.js',
      langPath: '/libs/'
    });
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(imageSource);
    await worker.terminate();

    console.log('[OCR] Image OCR text:', data?.text?.slice(0, 300));
    console.log('[OCR] Image OCR positioned data count:', data?.words?.length || 0);

    const items = [];
    if (data && data.words) {
      data.words.forEach(w => {
        if (w.text && w.text.trim()) {
          items.push({
            text: w.text.trim(),
            x: w.bbox.x0,
            y: w.bbox.y0,
            w: w.bbox.x1 - w.bbox.x0,
            h: w.bbox.y1 - w.bbox.y0
          });
        }
      });
    }

    const lines = data && data.lines ? data.lines.map(l => l.text.trim()).filter(Boolean) : (data?.text || '').split('\n').filter(Boolean);

    return { text: data?.text || '', items, lines };
  } catch (err) {
    if (worker) {
      try { await worker.terminate(); } catch(e) {}
    }
    console.error('[OCR] Tesseract error:', err);
    throw new Error('Could not recognize timetable from this image: ' + err.message);
  }
};

// =========================================================================
// SPATIAL TABLE RECONSTRUCTION (For Digital PDFs and OCR Bounding Boxes)
// =========================================================================

const _facultyInitialsMap = {
  'PB': 'Dr. Priyang Bhatt',
  'DJP': 'Dr. Dinesh Prajapati',
  'PS': 'Prof. Priya Shah',
  'AK': 'Prof. A. Kumar',
  'SM': 'Prof. S. Modi',
  'DT': 'Prof. D. Trivedi',
  'NM': 'Prof. N. Modi',
  'RJ': 'Prof. R. Joshi',
  'RKU': 'Dr. R. K. Upadhyay',
  'KJP': 'Prof. K. J. Patel',
  'CB': 'Prof. C. Bhatt',
  'VJC': 'Prof. V. J. Chauhan',
  'KAS': 'Prof. K. A. Shah',
  'KKP': 'Prof. K. K. Patel',
  'SRS': 'Prof. S. R. Sharma',
  'HM': 'Prof. H. Modi'
};

const _deptCodeMap = {
  'AI': 'DEP_AI',
  'IT': 'DEP_IT',
  'CP': 'DEP_CP',
  'CE': 'DEP_CP',
  'EC': 'DEP_EC',
  'ME': 'DEP_ME',
  'CL': 'DEP_CL'
};

const _WEEKDAYS_STRUCTURAL = new Set([
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
  'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN',
  'TIME', 'DAY', 'DAYS', 'SLOT', 'HOURS', 'HOUR'
]);

const _parseCellLines = (lines, defaultSem, defaultDiv, defaultDeptId, facultyName, subjectMap, prevSlotData) => {
  if (!lines || !lines.length) return null;

  // 0. Filter out lunch/breaks, weekday headers, and table labels
  const cleanLines = lines.map(l => String(l || '').trim()).filter(l => {
    if (!l) return false;
    if (/^(lunch|break|lb|-+)$/i.test(l)) return false;
    const upper = l.toUpperCase();
    if (_WEEKDAYS_STRUCTURAL.has(upper)) return false;
    return true;
  });

  if (!cleanLines.length) return null;

  const raw = cleanLines.join('\n');
  let subject = '';
  let fullSubjectName = '';
  let room = 'Room 201';
  let sem = null;
  let div = null;
  let deptId = null;
  let detectedFaculty = facultyName || '';

  // 1. Direct common subject match on cell lines (e.g. PAIML, CPC, SNA, DWDM, NLP)
  const commonSubjects = [
    'CPC', 'PAIML', 'DWDM', 'SNA', 'NLP', 'BDA', 'ASE',
    'MATHS-I', 'MATHS', 'BEE', 'EG', 'ES', 'FOP', 'DBMS',
    'SE', 'OS', 'CN', 'DSA', 'OOP', 'DELD', 'COA', 'WT', 'MAD', 'IS'
  ];
  for (const line of cleanLines) {
    for (const cs of commonSubjects) {
      const csRegex = new RegExp(`\\b${cs.replace('-', '[\\-\\s]?')}\\b`, 'i');
      if (csRegex.test(line)) {
        subject = cs;
        fullSubjectName = cs;
        break;
      }
    }
    if (subject) break;
  }

  // 2. Subject code table lookup (e.g. 202310303 -> Natural Language Processing)
  if (!subject) {
    for (const line of cleanLines) {
      for (const [code, fullName] of Object.entries(subjectMap || {})) {
        if (line.includes(code)) {
          fullSubjectName = fullName;
          const words = fullName.match(/[A-Z][a-z]+/g);
          if (words && words.length >= 2) {
            subject = words.map(w => w[0]).join('').toUpperCase();
          } else {
            subject = fullName.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
          }
          break;
        }
      }
      if (subject) break;
    }
  }

  // 3. Room extraction: (210), (141), 331-B, 331-A, IT-6, IT-1, IT-3, 311, 312, 108, 10S, etc.
  for (const line of cleanLines) {
    const pMatch = line.match(/\((\d{2,4})\)/);
    if (pMatch) {
      room = pMatch[1];
      break;
    }
    const sMatch = line.match(/\b(IT-?\d+|\d{2,4}[A-Z]?|[A-Z]{1,2}-?\d+|10S|108|331-?[AB]?|Room\s*\d+)\b/i);
    if (sMatch) {
      room = sMatch[1];
      break;
    }
  }

  // 4. Sem / Div / Dept extraction: 1IT1, 1IT-1, 7IT1, 5AI, 3PG, 1AI, etc.
  for (const line of cleanLines) {
    const tokenMatch = line.match(/\b([1-8])\s*(AI|IT|CP|CE|ME|EC|CL|PG)(\d?)\b/i);
    if (tokenMatch) {
      const sNum = tokenMatch[1];
      const dCode = tokenMatch[2].toUpperCase();
      const divNum = tokenMatch[3];
      const suffixes = { '1': 'st', '2': 'nd', '3': 'rd' };
      sem = `${sNum}${suffixes[sNum] || 'th'} Sem`;
      if (divNum) {
        div = `Div ${divNum}`;
      }
      if (_deptCodeMap[dCode]) {
        deptId = _deptCodeMap[dCode];
      }
      break;
    }
  }

  // 5. Faculty abbreviation extraction from cell (e.g. PB, DJP, PS)
  for (const line of cleanLines) {
    const words = line.match(/\b[A-Z]{2,4}\b/g) || [];
    for (const w of words) {
      if (_facultyInitialsMap[w]) {
        detectedFaculty = _facultyInitialsMap[w];
        break;
      }
    }
  }

  // 6. Generic word filter for subject
  if (!subject) {
    const ignored = new Set([
      'AI', 'IT', 'CP', 'CE', 'ME', 'EC', 'CL', 'PG', 'UG', 'LAB', 'ROOM', 'DIV', 'SEM', 'TUT', 'LEC', 'LECTURE', 'CLASS',
      ..._WEEKDAYS_STRUCTURAL,
      ...Object.keys(_facultyInitialsMap)
    ]);
    for (const line of cleanLines) {
      const cleaned = line
        .replace(/^\d[A-Z0-9?!]+\s*/gi, '')
        .replace(/\([^)]*\)/g, '')
        .trim();
      const words = cleaned.match(/[A-Za-z0-9\-]+/g) || [];
      for (const w of words) {
        const cleanWord = w.replace(/[^A-Za-z]/g, '').toUpperCase();
        if (cleanWord.length >= 2 && !ignored.has(cleanWord) && !_WEEKDAYS_STRUCTURAL.has(cleanWord)) {
          subject = cleanWord;
          fullSubjectName = cleanWord;
          break;
        }
      }
      if (subject) break;
    }
  }

  // 7. Strict validation: subject, faculty, or room can NEVER be a structural day or header word
  if (subject && _WEEKDAYS_STRUCTURAL.has(subject.toUpperCase())) {
    subject = '';
  }
  if (detectedFaculty && _WEEKDAYS_STRUCTURAL.has(detectedFaculty.toUpperCase())) {
    detectedFaculty = facultyName || '';
  }
  if (room && _WEEKDAYS_STRUCTURAL.has(room.toUpperCase())) {
    room = 'Room 201';
  }

  // 8. Lab Continuation
  if (!subject && prevSlotData && prevSlotData.subject) {
    subject = prevSlotData.subject;
    fullSubjectName = prevSlotData.name || subject;
    if (!sem) sem = prevSlotData.sem;
    if (!div) div = prevSlotData.div;
    if (!deptId) deptId = prevSlotData.departmentId || prevSlotData.deptId;
    if (!detectedFaculty) detectedFaculty = prevSlotData.facultyName;
    if (!room || room === 'Room 201') room = prevSlotData.room;
  }

  if (!subject) return null;

  const isLab = /lab/i.test(raw) || /p\//i.test(raw) || (prevSlotData && prevSlotData.type === 'Lab' && !/lec/i.test(raw));

  return {
    subject,
    name: fullSubjectName || subject,
    sem: sem || normalizeSem(defaultSem),
    div: div || normalizeDiv(defaultDiv),
    departmentId: deptId || defaultDeptId,
    room,
    facultyName: detectedFaculty || facultyName || '',
    type: isLab ? 'Lab' : 'Lecture',
    color: getSubjectColor(subject)
  };
};

const _reconstructGridFromItems = (items, defaultSem, defaultDiv, defaultDeptId, facultyName, passedSubjectMap = null) => {
  if (!items || items.length < 5) return null;

  // 1. Detect Subject Code Table at bottom of page
  const subjectMap = passedSubjectMap ? { ...passedSubjectMap } : {};
  const itemsByY = items.slice().sort((a, b) => b.y - a.y || a.x - b.x);
  itemsByY.forEach(it => {
    const m = String(it.text || '').match(/^(20\d{6,8})$/);
    if (m) {
      const code = m[1];
      const sameLine = itemsByY.filter(o => Math.abs(o.y - it.y) <= 6 && o.x > it.x);
      for (const sl of sameLine) {
        const txt = String(sl.text || '').trim();
        // Ignore teacher signature lines or numbers
        if (txt.length > 5 && !/^\d+$/.test(txt) && !/^(prepared|verified|principal|director|dr\.|prof\.)/i.test(txt) && sl.x < 350) {
          subjectMap[code] = txt;
          break;
        }
      }
    }
  });

  // 2. Identify Table Header Row & Weekday Columns
  const dayPatterns = [
    { day: 'Monday', regex: /\b(MON|MONDAY)\b/i },
    { day: 'Tuesday', regex: /\b(TUE|TUESDAY|TUES)\b/i },
    { day: 'Wednesday', regex: /\b(WED|WEDNESDAY)\b/i },
    { day: 'Thursday', regex: /\b(THU|THURSDAY|THURS)\b/i },
    { day: 'Friday', regex: /\b(FRI|FRIDAY)\b/i },
    { day: 'Saturday', regex: /\b(SAT|SATURDAY)\b/i }
  ];

  const dayCols = [];
  const headerYs = [];
  const headerItems = new Set();

  dayPatterns.forEach(({ day, regex }) => {
    for (const it of items) {
      const txt = String(it.text || '').trim();
      if (regex.test(txt)) {
        dayCols.push({ day, x: it.x, y: it.y });
        headerYs.push(it.y);
        headerItems.add(it);
        break;
      }
    }
  });

  dayCols.sort((a, b) => a.x - b.x);
  if (dayCols.length < 3) return null;

  // Add any structural header items in header row (TIME, DAYS, SLOT)
  items.forEach(it => {
    const txt = String(it.text || '').trim().toUpperCase();
    if (_WEEKDAYS_STRUCTURAL.has(txt)) {
      headerItems.add(it);
    }
  });

  // Compute header row vertical boundary
  const minHeaderY = headerYs.length ? Math.min(...headerYs) : null;
  const headerRowBottom = minHeaderY !== null ? (minHeaderY - 2) : null;

  // Establish column horizontal boundaries (left & right)
  for (let i = 0; i < dayCols.length; i++) {
    const left = i > 0 ? (dayCols[i - 1].x + dayCols[i].x) / 2 : dayCols[i].x - 50;
    const right = i < dayCols.length - 1 ? (dayCols[i].x + dayCols[i + 1].x) / 2 : dayCols[i].x + 60;
    dayCols[i].left = left;
    dayCols[i].right = right;
  }

  // 3. Detect Time Slot Rows (Resilient & Deduplicated)
  const seenSlots = new Set();
  const timeRows = [];

  const candidateItems = items
    .filter(it => {
      const clean = String(it.text || '').replace(/[\u2010-\u2015\u2212\uFF0D]/g, '-').trim();
      return /\d{1,2}:\d{2}/.test(clean) && it.x < (dayCols.length > 1 ? dayCols[1].left : dayCols[0].x);
    })
    .sort((a, b) => b.y - a.y);

  candidateItems.forEach(it => {
    const clean = String(it.text || '').replace(/[\u2010-\u2015\u2212\uFF0D]/g, '-').trim();
    const slot = _fuzzyTimeSlot(clean);
    if (slot && !seenSlots.has(slot)) {
      seenSlots.add(slot);
      timeRows.push({ rawTime: clean, slot, y: it.y });
    }
  });

  timeRows.sort((a, b) => b.y - a.y);
  if (timeRows.length < 2) return null;

  // Establish row vertical boundaries (top & bottom), ensuring row 0 never enters header row
  for (let i = 0; i < timeRows.length; i++) {
    const rowHeight = i < timeRows.length - 1 ? (timeRows[i].y - timeRows[i + 1].y) : (i > 0 ? timeRows[i - 1].y - timeRows[i].y : 20);
    const top = i > 0 
      ? (timeRows[i - 1].y + timeRows[i].y) / 2 
      : (headerRowBottom !== null ? Math.min(headerRowBottom, timeRows[i].y + rowHeight * 0.45) : timeRows[i].y + 12);
    const bottom = i < timeRows.length - 1 
      ? (timeRows[i].y + timeRows[i + 1].y) / 2 
      : timeRows[i].y - rowHeight * 0.45;
    timeRows[i].top = top;
    timeRows[i].bottom = bottom;
  }

  // 4. Assign ONLY cell content items to cells (STRICTLY EXCLUDE HEADER ROW & STRUCTURAL ITEMS)
  const cellContentItems = items.filter(it => {
    if (headerItems.has(it)) return false;
    const txt = String(it.text || '').trim().toUpperCase();
    if (_WEEKDAYS_STRUCTURAL.has(txt)) return false;
    if (headerRowBottom !== null && it.y >= headerRowBottom) return false; // In header region
    return true;
  });

  const gridCells = {};
  timeRows.forEach(r => {
    gridCells[r.slot] = {};
    dayCols.forEach(c => { gridCells[r.slot][c.day] = []; });
  });

  cellContentItems.forEach(it => {
    for (const r of timeRows) {
      if (it.y >= r.bottom && it.y <= r.top) {
        for (const c of dayCols) {
          if (it.x >= c.left && it.x <= c.right) {
            gridCells[r.slot][c.day].push(it);
            break;
          }
        }
        break;
      }
    }
  });

  // 5. Build raw timetable from cell contents (empty cells stay empty)
  const rawTimetable = {};
  TIMETABLE_DAYS.forEach(d => { rawTimetable[d] = {}; });

  dayCols.forEach(c => {
    const day = c.day;
    let prevSlotData = null;

    timeRows.forEach(r => {
      const slot = r.slot;
      if (slot === '12:40 - 1:25') return; // lunch slot
      const cellItems = gridCells[slot][day] || [];
      if (!cellItems.length) {
        prevSlotData = null;
        return;
      }

      cellItems.sort((a, b) => b.y - a.y || a.x - b.x);
      const lines = cellItems.map(it => String(it.text || '').trim()).filter(Boolean);
      if (!lines.length || lines.some(l => /^(lunch|break|lb|-+)$/i.test(l))) {
        prevSlotData = null;
        return;
      }

      const parsed = _parseCellLines(lines, defaultSem, defaultDiv, defaultDeptId, facultyName, subjectMap, prevSlotData);

      if (parsed && parsed.subject && !_WEEKDAYS_STRUCTURAL.has(parsed.subject.toUpperCase())) {
        rawTimetable[day][slot] = parsed;
        prevSlotData = parsed;
      } else {
        prevSlotData = null;
      }
    });
  });

  return { rawTimetable, gridCells, subjectMap };
};

export const parsePdfTimetable = async (file, targetScope = 'faculty', targetId = null, semFilter = '3rd Sem', divFilter = 'Div 1', deptNameOrId = null) => {
  if (!file) throw new Error('No file provided.');
  if (!window.pdfjsLib) {
    throw new Error('Unable to open PDF: PDF.js library is not loaded. Please ensure libs/pdf.min.js is present.');
  }

  console.log("PDF file received:", file);
  let pdfDoc;
  try {
    const arrayBuffer = await file.arrayBuffer();
    pdfDoc = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  } catch (err) {
    throw new Error('Unable to open PDF: ' + err.message);
  }

  console.log("PDF loaded:", pdfDoc);
  console.log("Number of pages:", pdfDoc.numPages);

  let targetPageIndex = 1;
  let targetFacultyName = '';
  let defaultDeptId = 'DEP_AI';

  if (deptNameOrId) {
    if (deptNameOrId.startsWith('DEP_')) defaultDeptId = deptNameOrId;
    else if (deptNameOrId.includes('IT') || deptNameOrId.includes('Information')) defaultDeptId = 'DEP_IT';
    else if (deptNameOrId.includes('Computer')) defaultDeptId = 'DEP_CP';
  }

  if (targetId) {
    try {
      const facs = getFaculties();
      const f = facs.find(fac => fac.id === targetId);
      if (f) {
        targetFacultyName = f.name || '';
        if (f.dept?.includes('IT') || f.dept?.includes('Information')) defaultDeptId = 'DEP_IT';
        else if (f.dept?.includes('Computer')) defaultDeptId = 'DEP_CP';
      }
    } catch(e) {}
  }

  // 1. Try finding matched page in multi-page PDF
  if (pdfDoc.numPages > 1) {
    let matched = 0;
    if (targetScope === 'faculty' && targetFacultyName) {
      const searchTarget = targetFacultyName.toLowerCase().replace(/[^a-z]/g, '');
      for (let pi = 1; pi <= pdfDoc.numPages; pi++) {
        const p = await pdfDoc.getPage(pi);
        const tc = await p.getTextContent();
        const pageStr = tc.items.map(it => it.str).join(' ').toLowerCase().replace(/[^a-z]/g, '');
        if (pageStr.includes(searchTarget) || (targetId && pageStr.includes(targetId.toLowerCase()))) {
          matched = pi;
          console.log(`[PDF] Matched faculty "${targetFacultyName}" to Page ${pi}`);
          break;
        }
      }
    } else if (targetScope === 'class') {
      const semNorm = (semFilter || '').replace(/[^0-9]/g, '');
      const divNorm = (divFilter || '').replace(/[^0-9]/g, '');
      const deptShort = defaultDeptId === 'DEP_IT' ? 'it' : defaultDeptId === 'DEP_CP' ? 'cp' : 'ai';
      const classTarget = `${semNorm}${deptShort}${divNorm}`;
      for (let pi = 1; pi <= pdfDoc.numPages; pi++) {
        const p = await pdfDoc.getPage(pi);
        const tc = await p.getTextContent();
        const pageStr = tc.items.map(it => it.str).join(' ').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (pageStr.includes(classTarget) || (pageStr.includes(`sem${semNorm}`) && pageStr.includes(`div${divNorm}`))) {
          matched = pi;
          console.log(`[PDF] Matched class "${classTarget}" to Page ${pi}`);
          break;
        }
      }
    }
    targetPageIndex = matched || 1;
  }

  let rawTimetable = null;
  let cells = null;
  let positionedItems = [];
  let extractedText = '';
  let ocrUsed = false;

  // Process chosen page
  const page = await pdfDoc.getPage(targetPageIndex);
  const textContent = await page.getTextContent();
  console.log("PAGE:", targetPageIndex);
  console.log("RAW PDF TEXT ITEMS:", textContent.items);

  if (textContent.items.length >= 10) {
    positionedItems = textContent.items.map(it => ({
      text: String(it.str || '').trim(),
      x: it.transform[4],
      y: it.transform[5],
      w: it.width,
      h: it.height
    })).filter(it => it.text.length > 0);

    extractedText = positionedItems.map(it => it.text).join(' ');
    console.log("EXTRACTED PDF TEXT:", extractedText);
    console.log("POSITIONED ITEMS:", positionedItems);

    const recon = _reconstructGridFromItems(positionedItems, semFilter, divFilter, defaultDeptId, targetFacultyName);
    if (recon) {
      rawTimetable = recon.rawTimetable;
      cells = recon.gridCells;
    }
  }

  // If page yielded 0 entries and PDF has multiple pages, search other pages for timetable grid
  const digitalEntriesCount = rawTimetable ? Object.values(rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) : 0;
  if (digitalEntriesCount === 0 && pdfDoc.numPages > 1) {
    console.log('[PDF] Page yielded 0 entries. Scanning other pages for timetable...');
    for (let pi = 1; pi <= pdfDoc.numPages; pi++) {
      if (pi === targetPageIndex) continue;
      const altPage = await pdfDoc.getPage(pi);
      const altTc = await altPage.getTextContent();
      if (altTc.items.length >= 10) {
        const altItems = altTc.items.map(it => ({
          text: String(it.str || '').trim(),
          x: it.transform[4],
          y: it.transform[5],
          w: it.width,
          h: it.height
        })).filter(it => it.text.length > 0);
        const altRecon = _reconstructGridFromItems(altItems, semFilter, divFilter, defaultDeptId, targetFacultyName);
        const altCount = altRecon?.rawTimetable ? Object.values(altRecon.rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) : 0;
        if (altCount > 0) {
          targetPageIndex = pi;
          positionedItems = altItems;
          extractedText = altItems.map(it => it.text).join(' ');
          rawTimetable = altRecon.rawTimetable;
          cells = altRecon.gridCells;
          console.log(`[PDF] Recovered ${altCount} entries from Page ${pi}`);
          break;
        }
      }
    }
  }

  // Scanned PDF fallback
  const finalDigitalCount = rawTimetable ? Object.values(rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) : 0;
  if (finalDigitalCount === 0) {
    console.log('No selectable text found. Attempting OCR on rendered PDF page...');
    ocrUsed = true;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 2.0 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/png');

      const ocrResult = await _runTesseractOCR(dataUrl);
      if (ocrResult && ocrResult.items && ocrResult.items.length >= 5) {
        positionedItems = ocrResult.items;
        extractedText = ocrResult.text;
        const ocrRecon = _reconstructGridFromItems(ocrResult.items, semFilter, divFilter, defaultDeptId, targetFacultyName);
        if (ocrRecon) {
          rawTimetable = ocrRecon.rawTimetable;
          cells = ocrRecon.gridCells;
        }
      }
      if (!rawTimetable || Object.values(rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) === 0) {
        if (ocrResult && ocrResult.lines) {
          rawTimetable = _parseSheetRows(ocrResult.lines.map(l => [l]), semFilter, divFilter, targetScope === 'class', defaultDeptId).timetable;
        }
      }
    } catch (ocrErr) {
      console.warn('Scanned PDF OCR failure:', ocrErr);
      throw new Error('Could not read timetable from scanned PDF: ' + ocrErr.message);
    }
  }

  console.log("DETECTED TABLE CELLS:", cells || {});
  console.log("PARSED ENTRIES:", rawTimetable || {});

  const normalized = normalizeTimetable(rawTimetable, semFilter, divFilter, defaultDeptId, targetFacultyName);
  console.log("NORMALIZED ENTRIES:", normalized.previewLectures);

  const validation = validateTimetable(normalized);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileInfo = {
    name: file.name,
    size: (file.size / 1024).toFixed(1) + ' KB',
    type: 'pdf'
  };

  return {
    ...normalized,
    fileInfo,
    note: ocrUsed
      ? `Extracted ${normalized.summary.totalLectures} entries via OCR from scanned PDF.`
      : `Extracted ${normalized.summary.totalLectures} entries from digital PDF (Page ${targetPageIndex}).`
  };
};

export const parseImageTimetable = async (file, targetScope = 'faculty', targetId = null, semFilter = '3rd Sem', divFilter = 'Div 1', deptNameOrId = null) => {
  if (!file) throw new Error('No file provided.');
  console.log('[IMAGE] Loading image:', file.name, file.size, 'bytes');

  let defaultDeptId = 'DEP_AI';
  let targetFacultyName = '';
  if (deptNameOrId) {
    if (deptNameOrId.startsWith('DEP_')) defaultDeptId = deptNameOrId;
    else if (deptNameOrId.includes('IT') || deptNameOrId.includes('Information')) defaultDeptId = 'DEP_IT';
    else if (deptNameOrId.includes('Computer')) defaultDeptId = 'DEP_CP';
  } else if (targetId) {
    try {
      const facs = getFaculties();
      const f = facs.find(fac => fac.id === targetId);
      if (f) {
        targetFacultyName = f.name || '';
        if (f.dept?.includes('IT') || f.dept?.includes('Information')) defaultDeptId = 'DEP_IT';
        else if (f.dept?.includes('Computer')) defaultDeptId = 'DEP_CP';
      }
    } catch(e) {}
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  const ocrResult = await _runTesseractOCR(dataUrl);
  let rawTimetable = null;

  if (ocrResult && ocrResult.items && ocrResult.items.length >= 5) {
    const ocrRecon = _reconstructGridFromItems(ocrResult.items, semFilter, divFilter, defaultDeptId, targetFacultyName);
    if (ocrRecon) {
      rawTimetable = ocrRecon.rawTimetable;
    }
  }

  if (!rawTimetable || Object.values(rawTimetable).reduce((sum, d) => sum + Object.keys(d || {}).length, 0) === 0) {
    if (ocrResult && ocrResult.lines && ocrResult.lines.length > 0) {
      const rows = ocrResult.lines.map(l => [l]);
      rawTimetable = _parseSheetRows(rows, semFilter, divFilter, targetScope === 'class', defaultDeptId).timetable;
    }
  }

  console.log('Image parsed entries:', rawTimetable);

  const normalized = normalizeTimetable(rawTimetable, semFilter, divFilter, defaultDeptId, targetFacultyName);
  console.log('Normalized entries:', normalized.previewLectures);

  const validation = validateTimetable(normalized);
  if (!validation.valid) {
    throw new Error('Could not recognize timetable from this image. Please ensure the image is clear and contains a readable timetable grid.');
  }

  const fileInfo = {
    name: file.name,
    size: (file.size / 1024).toFixed(1) + ' KB',
    type: 'image'
  };

  return {
    ...normalized,
    dataUrl,
    fileInfo,
    note: `Recognized ${normalized.summary.totalLectures} lectures from image via OCR.`
  };
};

export const parseImageOrPdfFile = async (file, targetScope = 'faculty', targetId = null, semFilter = '3rd Sem', divFilter = 'Div 1', deptNameOrId = null) => {
  if (!file) throw new Error('No file provided.');
  const fn = file.name.toLowerCase();
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|gif|bmp|webp)$/.test(fn);
  const isPdf = file.type === 'application/pdf' || fn.endsWith('.pdf');

  if (isPdf) {
    return parsePdfTimetable(file, targetScope, targetId, semFilter, divFilter, deptNameOrId);
  } else if (isImage) {
    return parseImageTimetable(file, targetScope, targetId, semFilter, divFilter, deptNameOrId);
  } else {
    throw new Error('Unsupported file format. Please upload Excel (.xlsx, .csv), PDF, or an image (.png, .jpg).');
  }
};

// =========================================================================
// FACULTY TIMETABLE TEMPLATE DOWNLOAD
// =========================================================================

export const downloadFacultyTimetableTemplate = (facultyName = 'Faculty', deptName = 'Department', semName = '3rd Semester') => {
  const wb = XLSX.utils.book_new();
  const faculties = getFaculties();

  // Sheet 1: Columnar Timetable Schedule Template with realistic sample rows
  const colHeaders = [
    'Faculty ID',
    'Faculty Name',
    'Department',
    'Subject',
    'Semester',
    'Division',
    'Batch',
    'Day',
    'Start Time',
    'End Time',
    'Room Number'
  ];

  const colRows = [
    ['FAC_PS', 'Prof. Priya Shah', 'AI & Data Science', 'DBMS', '3rd Sem', 'Div 1', 'All', 'Monday', '9:00', '9:55', 'Room 201'],
    ['FAC_PS', 'Prof. Priya Shah', 'AI & Data Science', 'DS', '3rd Sem', 'Div 1', 'All', 'Monday', '10:00', '10:50', 'Room 201'],
    ['FAC_PS', 'Prof. Priya Shah', 'AI & Data Science', 'DBMS Lab', '3rd Sem', 'Div 1', 'Batch A', 'Tuesday', '1:25', '3:10', 'Lab 2'],
    ['FAC_PS', 'Prof. Priya Shah', 'AI & Data Science', 'DS Lab', '3rd Sem', 'Div 1', 'Batch B', 'Wednesday', '1:25', '3:10', 'Lab 2'],
    ['FAC_PS', 'Prof. Priya Shah', 'AI & Data Science', 'DBMS Lab', '3rd Sem', 'Div 1', 'Batch C', 'Thursday', '1:25', '3:10', 'Lab 2'],
    ['FAC_SM', 'Dr. S. M. Mehta', 'Computer Engineering', 'OS', '5th Sem', 'Div 1', 'All', 'Monday', '9:00', '9:55', 'Room 301'],
    ['FAC_SM', 'Dr. S. M. Mehta', 'Computer Engineering', 'OS Lab', '5th Sem', 'Div 1', 'Batch A', 'Wednesday', '1:25', '3:10', 'CC-Lab 1'],
    ['FAC_SM', 'Dr. S. M. Mehta', 'Computer Engineering', 'OS Lab', '5th Sem', 'Div 1', 'Batch B', 'Friday', '1:25', '3:10', 'CC-Lab 1']
  ];

  const wsCol = XLSX.utils.aoa_to_sheet([colHeaders, ...colRows]);
  wsCol['!cols'] = [
    { wch: 14 }, // Faculty ID
    { wch: 22 }, // Faculty Name
    { wch: 24 }, // Department
    { wch: 16 }, // Subject
    { wch: 12 }, // Semester
    { wch: 12 }, // Division
    { wch: 12 }, // Batch
    { wch: 14 }, // Day
    { wch: 12 }, // Start Time
    { wch: 12 }, // End Time
    { wch: 14 }  // Room Number
  ];
  XLSX.utils.book_append_sheet(wb, wsCol, 'Timetable Schedule');

  // Sheet 2: Weekly Grid Template
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const gridRows = [['Time Slot', ...days]];
  TIME_SLOTS.forEach(slot => {
    const row = [slot];
    days.forEach(() => {
      row.push(slot === '12:40 - 1:25' ? 'LUNCH' : '');
    });
    gridRows.push(row);
  });
  const wsGrid = XLSX.utils.aoa_to_sheet(gridRows);
  wsGrid['!cols'] = [{ wch: 16 }, ...days.map(() => ({ wch: 20 }))];
  XLSX.utils.book_append_sheet(wb, wsGrid, 'Weekly Grid');

  // Sheet 3: Registered Faculty Directory (Reference)
  const facRefHeaders = ['Faculty ID', 'Faculty Name', 'Department', 'Designation', 'Email'];
  const facRefRows = faculties.map(f => [
    f.id,
    f.name,
    f.dept || f.department || 'AI & Data Science',
    f.designation || 'Assistant Professor',
    f.email || ''
  ]);
  const wsFac = XLSX.utils.aoa_to_sheet([facRefHeaders, ...facRefRows]);
  wsFac['!cols'] = [{ wch: 14 }, { wch: 24 }, { wch: 24 }, { wch: 20 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, wsFac, 'Faculty Directory');

  // Sheet 4: Instructions & Reference Values
  const instRows = [
    ['ADIT FACULTY TIMETABLE UPLOAD TEMPLATE - GUIDELINES', ''],
    ['', ''],
    ['COLUMN', 'REQUIREMENT / ACCEPTED VALUES'],
    ['Faculty ID', 'Must match an existing registered Faculty ID from "Faculty Directory" sheet (e.g., FAC_PS, FAC_SM).'],
    ['Faculty Name', 'Full name of the faculty member.'],
    ['Department', 'Accepted: AI & Data Science, Computer Engineering, Information Technology, EC, ME, Civil.'],
    ['Subject', 'Subject short name or full title (e.g., DBMS, DS, Python, OS).'],
    ['Semester', 'Accepted: 1st Sem to 8th Sem.'],
    ['Division', 'Accepted: Div 1, Div 2, Div 3, or All.'],
    ['Batch', 'Accepted: Batch A, Batch B, Batch C, or All (use specific batch for practical lab sessions).'],
    ['Day', 'Accepted: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.'],
    ['Start Time & End Time', `Use standard lecture slots: ${TIME_SLOTS.filter(s => s !== '12:40 - 1:25').join(', ')}`],
    ['Room Number', 'Classroom or Lab (e.g., Room 201, Room 301, Lab 2, CC-Lab 1).']
  ];
  const wsInst = XLSX.utils.aoa_to_sheet(instRows);
  wsInst['!cols'] = [{ wch: 25 }, { wch: 75 }];
  XLSX.utils.book_append_sheet(wb, wsInst, 'Instructions');

  XLSX.writeFile(wb, 'ADIT_Faculty_Timetable_Template.xlsx');
};

if (typeof window !== 'undefined') {
  window.rescheduleLectureEntry = rescheduleLectureEntry;
  window.checkRescheduleConflicts = checkRescheduleConflicts;
  window.doTimeSlotsOverlap = doTimeSlotsOverlap;
  window.getDateForDayName = getDateForDayName;
  window.normalizeTimeSlot = normalizeTimeSlot;
  window.getTimetableEntries = getTimetableEntries;
  window.getFacultyTimetable = getFacultyTimetable;
  window.notifyTimetableSync = notifyTimetableSync;
}

