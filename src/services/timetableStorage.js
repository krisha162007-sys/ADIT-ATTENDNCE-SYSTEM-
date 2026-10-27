import * as XLSX from 'xlsx';
import { getSubjects, getFaculties, getCurrentUser, getDepartments, resolveDepartment, isDepartmentMatch } from './attendanceStorage';

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

export const OFFICIAL_TEMPLATE_TIME_SLOTS = [
  '9:05 to 9:55am',
  '10:00 to 10:50am',
  '10:55 to 11:45am',
  '11:50 to 12:40pm',
  '12:40 to 1:25pm (Break)',
  '1:25 to 2:15pm',
  '2:20 to 3:10pm',
  '3:15 to 4:05pm',
  '4:10 to 5:00pm'
];

export const isLunchTime = (slot) => {
  if (!slot) return false;
  const s = String(slot).toLowerCase().trim();
  return s.startsWith('12:40') || s.includes('break') || s.includes('lunch') || s.includes('recess');
};

export const isLabSession = (slot) => {
  if (!slot) return false;
  const type = String(slot.type || '').trim().toLowerCase();
  if (type === 'lab' || type === 'laboratory' || type === 'practical') return true;
  const subj = String(slot.subject || slot.subjectName || slot.name || slot.subjectFullName || '').toLowerCase();
  if (/\b(lab|laboratory|practical|pr|pract)\b/i.test(subj)) return true;
  const room = String(slot.room || '').toLowerCase();
  if (/\b(lab|laboratory)\b/i.test(room)) return true;
  return false;
};

export const getNextConsecutiveTimeSlot = (timeSlot) => {
  if (!timeSlot) return null;
  const norm = normalizeTimeSlot(timeSlot);
  let idx = TIME_SLOTS.findIndex(s => s === timeSlot || normalizeTimeSlot(s) === norm);
  if (idx === -1) {
    const start = timeSlot.split(/[-–—]/)[0]?.trim();
    if (start) {
      idx = TIME_SLOTS.findIndex(s => s.startsWith(start) || normalizeTimeSlot(s).startsWith(start));
    }
  }
  if (idx === -1) return null;
  const nextIdx = idx + 1;
  if (nextIdx >= TIME_SLOTS.length) return null;
  const nextSlot = TIME_SLOTS[nextIdx];
  if (nextSlot === '12:40 - 1:25' || isLunchTime(nextSlot)) {
    return null;
  }
  return nextSlot;
};

export const getCombinedTimeSlot = (slot1, slot2) => {
  if (!slot1) return slot2 || '';
  if (!slot2) return slot1 || '';
  const s1Start = slot1.split(/[-–—]/)[0]?.trim() || slot1;
  const s2Parts = slot2.split(/[-–—]/);
  const s2End = (s2Parts[1] || s2Parts[0]).trim();
  return `${s1Start} - ${s2End}`;
};

export const formatOfficialTimeSlot = (slotStr) => {
  if (!slotStr) return '';
  const s = String(slotStr).trim();
  if (s.toLowerCase().includes('break') || s.toLowerCase().includes('lunch')) return '12:40 to 1:25pm (Break)';

  // Multi-slot lab combinations
  if (/^9:0[05].*?10:50/i.test(s)) return '9:05 to 10:50am';
  if (/^10:00.*?11:45/i.test(s)) return '10:00 to 11:45am';
  if (/^10:55.*?12:40/i.test(s)) return '10:55 to 12:40pm';
  if (/^1:25.*?3:10/i.test(s)) return '1:25 to 3:10pm';
  if (/^2:20.*?4:05/i.test(s)) return '2:20 to 4:05pm';
  if (/^3:15.*?5:00/i.test(s)) return '3:15 to 5:00pm';

  // Standard single slots
  if (s.startsWith('9:00') || s.startsWith('9:05')) return '9:05 to 9:55am';
  if (s.startsWith('10:00')) return '10:00 to 10:50am';
  if (s.startsWith('10:55')) return '10:55 to 11:45am';
  if (s.startsWith('11:50')) return '11:50 to 12:40pm';
  if (s.startsWith('12:40')) return '12:40 to 1:25pm (Break)';
  if (s.startsWith('1:25')) return '1:25 to 2:15pm';
  if (s.startsWith('2:20')) return '2:20 to 3:10pm';
  if (s.startsWith('3:15')) return '3:15 to 4:05pm';
  if (s.startsWith('4:10')) return '4:10 to 5:00pm';
  return s;
};


export const getCoveredConsecutiveSlots = (timeRangeStr) => {
  if (!timeRangeStr) return [];
  const sStr = String(timeRangeStr).trim();
  if (isLunchTime(sStr)) return [];

  const rng = parseTimeRangeMinutes(sStr);
  if (!rng) return [];
  const { startMin, endMin } = rng;
  if (endMin <= startMin) return [];

  const covered = [];
  for (const s of TIME_SLOTS) {
    if (s === '12:40 - 1:25' || isLunchTime(s)) continue;
    const sRng = parseTimeRangeMinutes(s);
    if (!sRng) continue;
    const overlap = Math.min(endMin, sRng.endMin) - Math.max(startMin, sRng.startMin);
    if (overlap >= 20) {
      covered.push(s);
    }
  }

  if (covered.length <= 1) return covered;
  for (let i = 0; i < covered.length - 1; i++) {
    if (getNextConsecutiveTimeSlot(covered[i]) !== covered[i + 1]) {
      return [];
    }
  }
  return covered;
};

export const reconcileConsecutiveLabEntries = (entries) => {
  if (!Array.isArray(entries)) return entries;
  const groupMap = {};
  entries.forEach(e => {
    const facId = e.facultyId || 'default';
    const day = e.day || 'default';
    const k = `${facId}___${day}`;
    if (!groupMap[k]) groupMap[k] = [];
    groupMap[k].push(e);
  });

  Object.values(groupMap).forEach(list => {
    list.sort((a, b) => {
      const ma = parseTimeRangeMinutes(a.timeSlot || a.time)?.startMin ?? 0;
      const mb = parseTimeRangeMinutes(b.timeSlot || b.time)?.startMin ?? 0;
      return ma - mb;
    });

    for (let i = 0; i < list.length - 1; i++) {
      const e1 = list[i];
      const e2 = list[i + 1];
      if (!e1 || !e2) continue;

      const slot1Time = e1.timeSlot || e1.time;
      const slot2Time = e2.timeSlot || e2.time;
      if (getNextConsecutiveTimeSlot(slot1Time) !== slot2Time) continue;

      if (!canMergeConsecutiveSlots(e1, e2)) continue;

      const sharedSessionId = e1.sessionId || e2.sessionId || ('sess_lab_reconcile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
      const combinedTime = getCombinedTimeSlot(slot1Time, slot2Time);

      e1.sessionId = sharedSessionId;
      e1.span = 2;
      e1.duration = '2 Hours';
      e1.combinedTimeSlot = combinedTime;
      e1.isMultiSlot = true;
      e1.type = 'Lab';

      e2.sessionId = sharedSessionId;
      e2.span = 2;
      e2.duration = '2 Hours';
      e2.combinedTimeSlot = combinedTime;
      e2.isMultiSlot = true;
      e2.isContinuation = true;
      e2.type = 'Lab';

      i++;
    }
  });

  return entries;
};

export const mergeConsecutiveLabSessionsInParsedResult = ({ timetable, validLectures, previewLectures }) => {
  if (!timetable || typeof timetable !== 'object') return;

  TIMETABLE_DAYS.forEach(day => {
    const daySlots = timetable[day] || {};
    const sortedTimes = TIME_SLOTS.filter(s => s !== '12:40 - 1:25' && !isLunchTime(s));

    for (let i = 0; i < sortedTimes.length - 1; i++) {
      const t1 = sortedTimes[i];
      const t2 = sortedTimes[i + 1];
      if (getNextConsecutiveTimeSlot(t1) !== t2) continue;

      const s1 = daySlots[t1];
      const s2 = daySlots[t2];
      if (!s1 || !s2 || !s1.subject || !s2.subject) continue;

      if (!canMergeConsecutiveSlots(s1, s2)) continue;

      const sharedSessionId = s1.sessionId || s2.sessionId || ('sess_lab_xl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
      const combinedTime = getCombinedTimeSlot(t1, t2);

      s1.span = 2;
      s1.duration = '2 Hours';
      s1.combinedTimeSlot = combinedTime;
      s1.sessionId = sharedSessionId;
      s1.isMultiSlot = true;
      s1.type = 'Lab';

      s2.span = 2;
      s2.duration = '2 Hours';
      s2.combinedTimeSlot = combinedTime;
      s2.sessionId = sharedSessionId;
      s2.isMultiSlot = true;
      s2.isContinuation = true;
      s2.type = 'Lab';

      if (Array.isArray(validLectures)) {
        const vl1 = validLectures.find(l => l.day === day && (l.time === t1 || l.timeSlot === t1));
        const vl2 = validLectures.find(l => l.day === day && (l.time === t2 || l.timeSlot === t2));
        if (vl1) {
          vl1.time = t1;
          vl1.timeSlot = t1;
          vl1.sessionId = sharedSessionId;
          vl1.span = 2;
          vl1.duration = '2 Hours';
          vl1.combinedTimeSlot = combinedTime;
          vl1.isMultiSlot = true;
          vl1.type = 'Lab';
        }
        if (vl2) {
          vl2.time = t2;
          vl2.timeSlot = t2;
          vl2.sessionId = sharedSessionId;
          vl2.span = 2;
          vl2.duration = '2 Hours';
          vl2.combinedTimeSlot = combinedTime;
          vl2.isMultiSlot = true;
          vl2.isContinuation = true;
          vl2.type = 'Lab';
        }
      }

      if (Array.isArray(previewLectures)) {
        const pIdx1 = previewLectures.findIndex(l => l.day === day && (l.time === t1 || l.timeSlot === t1));
        const pIdx2 = previewLectures.findIndex(l => l.day === day && (l.time === t2 || l.timeSlot === t2));
        if (pIdx1 !== -1) {
          previewLectures[pIdx1] = {
            ...previewLectures[pIdx1],
            time: combinedTime,
            span: 2,
            duration: '2 Hours',
            sessionId: sharedSessionId,
            type: 'Lab',
            isMultiSlot: true
          };
        }
        if (pIdx2 !== -1) {
          previewLectures.splice(pIdx2, 1);
        }
      }

      i++;
    }
  });
};

export const calculateFacultyTeachingMetrics = (timetableGrid) => {
  let ugL = 0;
  let ugPT = 0;
  let pgL = 0;
  let pgPT = 0;
  let guidanceL = 0;
  let guidancePT = 0;

  const subjectMap = {};

  if (timetableGrid && typeof timetableGrid === 'object') {
    TIMETABLE_DAYS.forEach(day => {
      const daySlots = timetableGrid[day] || {};
      Object.entries(daySlots).forEach(([timeSlot, slot]) => {
        if (!slot || !slot.subject) return;
        const subj = String(slot.subject).trim();
        if (/^(lunch|break|lb|-+)$/i.test(subj)) return;

        const isLab = slot.type === 'Lab' || /lab|practical/i.test(subj) || /lab/i.test(slot.room || '');
        const isPG = /pg|m\.?tech|master/i.test(slot.sem || '') || /pg/i.test(subj);
        const isGuidance = /seminar|project|internship|guidance/i.test(subj);

        if (isGuidance) {
          if (isLab) guidancePT++; else guidanceL++;
        } else if (isPG) {
          if (isLab) pgPT++; else pgL++;
        } else {
          if (isLab) ugPT++; else ugL++;
        }

        const sKey = subj.toUpperCase();
        if (!subjectMap[sKey]) {
          subjectMap[sKey] = {
            code: slot.subjectCode || slot.code || '',
            name: slot.name || slot.subjectFullName || subj,
            L: 0,
            T: 0,
            P: 0,
            C: 0
          };
        }
        if (isLab) {
          subjectMap[sKey].P += 1;
        } else {
          subjectMap[sKey].L += 1;
        }
      });
    });
  }

  const subjectDetailsList = Object.values(subjectMap).map((s, idx) => {
    const code = s.code || `20234010${idx + 1}`;
    const credits = Math.round(s.L + (s.P / 2));
    return {
      code,
      name: s.name,
      L: s.L,
      T: s.T,
      P: s.P,
      C: credits > 0 ? credits : 4
    };
  });

  if (subjectDetailsList.length === 0) {
    subjectDetailsList.push({
      code: '(example) 202340104',
      name: '(example) Python Programming',
      L: 3,
      T: 0,
      P: 2,
      C: 4
    });
  }

  const ugTotal = ugL + ugPT;
  const pgTotal = pgL + pgPT;
  const diplomaTotal = 0;
  const guidanceTotal = guidanceL + guidancePT;
  const otherTotal = 0;

  const totalTeachingLoadL = ugL + pgL + guidanceL;
  const totalTeachingLoadPT = ugPT + pgPT + guidancePT;
  const totalTeachingLoad = totalTeachingLoadL + totalTeachingLoadPT;

  return {
    ugL,
    ugPT,
    ugTotal,
    pgL,
    pgPT,
    pgTotal,
    diplomaL: 0,
    diplomaPT: 0,
    diplomaTotal: 0,
    guidanceL,
    guidancePT,
    guidanceTotal,
    otherL: 0,
    otherPT: 0,
    otherTotal: 0,
    totalTeachingLoadL,
    totalTeachingLoadPT,
    totalTeachingLoad,
    subjectDetailsList
  };
};

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
    .split(/[-–—]/)
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
  const parts = timeSlotStr.split(/[-–—]/).map(s => s.trim());
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

export const getSessionIdentity = (entry) => {
  if (!entry) return null;
  return entry.sessionId || 
         entry.sessionGroupId || 
         entry.lectureId || 
         entry.sharedSessionId || 
         entry.batchSessionId || 
         entry.labGroupId || 
         entry.multiSlotId || 
         null;
};

export const canMergeConsecutiveSlots = (slotA, slotB) => {
  if (!slotA || !slotB) return false;

  // 0. Do not merge across lunch break or recess
  if (isLunchTime(slotA.timeSlot || slotA.time) || isLunchTime(slotB.timeSlot || slotB.time)) {
    return false;
  }

  // 1. Explicit shared session identity OR matching Laboratory session
  const idA = getSessionIdentity(slotA);
  const idB = getSessionIdentity(slotB);
  const hasSharedSessionId = idA && idB && String(idA).trim() === String(idB).trim();
  const bothAreLab = isLabSession(slotA) && isLabSession(slotB);

  // If neither shared session ID nor both are lab sessions, they cannot be merged
  if (!hasSharedSessionId && !bothAreLab) {
    return false;
  }

  // If both have explicit different session IDs, do not merge!
  if (idA && idB && String(idA).trim() !== String(idB).trim()) {
    return false;
  }

  // 2. Same subject (ID, code, or name)
  const subA = (slotA.subject || slotA.subjectId || slotA.subjectName || '').trim().toLowerCase();
  const subB = (slotB.subject || slotB.subjectId || slotB.subjectName || '').trim().toLowerCase();
  if (subA !== subB) return false;

  // 3. Same semester (e.g. 'Semester 1' or '1st Sem')
  if (normalizeSem(slotA.semId || slotA.sem) !== normalizeSem(slotB.semId || slotB.sem)) {
    return false;
  }

  // 4. Same division (e.g. 'Division 1' or 'Div 1')
  if (normalizeDiv(slotA.divId || slotA.div) !== normalizeDiv(slotB.divId || slotB.div)) {
    return false;
  }

  // 5. Same class or batch, wherever applicable
  const batchA = (slotA.batch || 'ALL').trim().toUpperCase();
  const batchB = (slotB.batch || 'ALL').trim().toUpperCase();
  if (batchA !== batchB) {
    return false;
  }

  // 6. Same classroom / room
  const roomA = (slotA.room || '').trim().toLowerCase();
  const roomB = (slotB.room || '').trim().toLowerCase();
  if (roomA && roomB && roomA !== roomB) {
    return false;
  }

  // 7. Same department
  const deptA = (slotA.departmentId || slotA.department || '').trim().toLowerCase();
  const deptB = (slotB.departmentId || slotB.department || '').trim().toLowerCase();
  if (deptA && deptB && deptA !== deptB) {
    return false;
  }

  // 8. Same faculty member
  const facA = (slotA.facultyId || '').trim();
  const facB = (slotB.facultyId || '').trim();
  if (facA && facB && facA !== facB) {
    return false;
  }

  // 9. Same scheduled day and date (rescheduledDate)
  if (slotA.day && slotB.day && slotA.day !== slotB.day) return false;
  const dateA = slotA.rescheduledDate || '';
  const dateB = slotB.rescheduledDate || '';
  if (dateA !== dateB) return false;

  return true;
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

  const targetEntry = entryId ? entries.find(e => e.id === entryId) : null;
  const targetSessionId = params.sessionId || getSessionIdentity(targetEntry);

  entries.forEach(e => {
    if (entryId && e.id === entryId) return; // skip self
    if (targetSessionId && getSessionIdentity(e) === targetSessionId) return; // skip constituent entries of the same session
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

  const targetSessionId = getSessionIdentity(targetEntry);

  entries[targetIndex] = updatedEntry;

  // If this entry was part of a multi-slot session, update the entire scheduled session
  if (targetSessionId) {
    entries.forEach((e, idx) => {
      if (idx !== targetIndex && getSessionIdentity(e) === targetSessionId && e.facultyId === targetEntry.facultyId) {
        entries[idx] = {
          ...e,
          day: newDay,
          room: finalRoom,
          isRescheduled: true,
          rescheduledDate: newDate,
          rescheduleReason: reason.trim(),
          originalDay: e.originalDay || e.day,
          originalTimeSlot: e.originalTimeSlot || e.timeSlot,
          originalRoom: e.originalRoom || e.room,
          rescheduledAt: new Date().toISOString(),
          rescheduledBy: userFacultyId
        };
      }
    });
  }

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
  const isLab = slotData.type === 'Lab' || isLabSession(slotData);

  let nextSlot = null;
  let combinedTime = timeSlot;

  if (isLab) {
    nextSlot = getNextConsecutiveTimeSlot(timeSlot);
    if (!nextSlot) {
      throw new Error(`Cannot schedule a 2-hour laboratory session at ${timeSlot}. The session crosses the lunch recess or exceeds timetable hours.`);
    }
    combinedTime = getCombinedTimeSlot(timeSlot, nextSlot);

    // Validate that nextSlot is not occupied by another session
    const normSem = normalizeSem(slotData.sem || '3rd Sem');
    const normDiv = normalizeDiv(slotData.div || 'Div 1');
    const existingAtNext = entries.find(e => {
      if (e.day !== day || e.timeSlot !== nextSlot) return false;
      if (slotData.sessionId && e.sessionId === slotData.sessionId) return false;
      if (e.facultyId === facultyId) return true;
      if (normalizeSem(e.semId || e.sem) === normSem && normalizeDiv(e.divId || e.div) === normDiv) return true;
      if (slotData.room && e.room && e.room !== 'TBD' && e.room.toLowerCase() === slotData.room.toLowerCase()) return true;
      return false;
    });

    if (existingAtNext) {
      const reason = existingAtNext.facultyId === facultyId 
        ? `Faculty is already teaching ${existingAtNext.subjectName} in ${existingAtNext.room}`
        : `Class ${normSem} ${normDiv} already has ${existingAtNext.subjectName}`;
      throw new Error(`Slot ${nextSlot} is already occupied: ${reason}. Cannot allocate 2-hour laboratory session.`);
    }
  }

  // Find existing slot being edited (to clear previous multi-slot session if moving or changing type)
  const existingSlot = entries.find(e => e.facultyId === facultyId && e.day === day && e.timeSlot === timeSlot);
  const targetSessionId = slotData.sessionId || existingSlot?.sessionId;

  // Remove existing
  let filtered = entries.filter(e => {
    if (targetSessionId && e.sessionId === targetSessionId) return false;
    if (e.facultyId === facultyId && e.day === day && e.timeSlot === timeSlot) return false;
    if (isLab && nextSlot && e.facultyId === facultyId && e.day === day && e.timeSlot === nextSlot) return false;
    return true;
  });

  const sessionId = targetSessionId || ('sess_lab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));

  const baseEntry = {
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
    room: slotData.room || (isLab ? 'Lab 1' : 'Room 201'),
    color: slotData.color,
    type: isLab ? 'Lab' : (slotData.type || 'Lecture'),
    batch: slotData.batch || 'All',
    day
  };

  if (isLab && nextSlot) {
    filtered.push({
      ...baseEntry,
      id: generateId(),
      timeSlot,
      sessionId,
      span: 2,
      duration: '2 Hours',
      combinedTimeSlot: combinedTime,
      isMultiSlot: true
    });
    filtered.push({
      ...baseEntry,
      id: generateId(),
      timeSlot: nextSlot,
      sessionId,
      span: 2,
      duration: '2 Hours',
      combinedTimeSlot: combinedTime,
      isMultiSlot: true,
      isContinuation: true
    });
  } else {
    filtered.push({
      ...baseEntry,
      id: generateId(),
      timeSlot,
      span: 1,
      isMultiSlot: false
    });
  }

  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return getFacultyTimetable(facultyId);
};

export const clearFacultySlot = (facultyId, day, timeSlot) => {
  const entries = getTimetableEntries();
  const target = entries.find(e => e.facultyId === facultyId && e.day === day && e.timeSlot === timeSlot);
  let filtered;
  if (target && target.sessionId) {
    filtered = entries.filter(e => e.sessionId !== target.sessionId);
  } else {
    filtered = entries.filter(e => !(e.facultyId === facultyId && e.day === day && e.timeSlot === timeSlot));
  }
  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return getFacultyTimetable(facultyId);
};

export const updateClassSlot = (sem, div, day, timeSlot, slotData, deptId = null) => {
  const entries = getTimetableEntries();
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);
  const isLab = slotData.type === 'Lab' || isLabSession(slotData);

  let nextSlot = null;
  let combinedTime = timeSlot;

  if (isLab) {
    nextSlot = getNextConsecutiveTimeSlot(timeSlot);
    if (!nextSlot) {
      throw new Error(`Cannot schedule a 2-hour laboratory session at ${timeSlot}. The session crosses the lunch recess or exceeds timetable hours.`);
    }
    combinedTime = getCombinedTimeSlot(timeSlot, nextSlot);

    // Validate that nextSlot is not occupied by another session for this class or faculty
    const existingAtNext = entries.find(e => {
      if (e.day !== day || e.timeSlot !== nextSlot) return false;
      if (slotData.sessionId && e.sessionId === slotData.sessionId) return false;
      const matchSem = normalizeSem(e.semId || e.sem) === normSem;
      const matchDiv = normalizeDiv(e.divId || e.div) === normDiv;
      if (matchSem && matchDiv) return true;
      if (slotData.facultyId && e.facultyId === slotData.facultyId) return true;
      if (slotData.room && e.room && e.room !== 'TBD' && e.room.toLowerCase() === slotData.room.toLowerCase()) return true;
      return false;
    });

    if (existingAtNext) {
      const reason = (normalizeSem(existingAtNext.semId || existingAtNext.sem) === normSem && normalizeDiv(existingAtNext.divId || existingAtNext.div) === normDiv)
        ? `Class already has ${existingAtNext.subjectName} scheduled`
        : `Faculty ${existingAtNext.facultyName} is teaching ${existingAtNext.subjectName}`;
      throw new Error(`Slot ${nextSlot} is already occupied: ${reason}. Cannot allocate 2-hour laboratory session.`);
    }
  }

  // Find existing slot being edited (to clear previous multi-slot session if moving or changing type)
  const existingSlot = entries.find(e => {
    const matchSem = normalizeSem(e.semId || e.sem) === normSem;
    const matchDiv = normalizeDiv(e.divId || e.div) === normDiv;
    return matchSem && matchDiv && e.day === day && e.timeSlot === timeSlot;
  });
  const targetSessionId = slotData.sessionId || existingSlot?.sessionId;

  // Clear existing slot(s) for this class
  let filtered = entries.filter(e => {
    if (targetSessionId && e.sessionId === targetSessionId) return false;
    const matchSem = normalizeSem(e.semId || e.sem) === normSem;
    const matchDiv = normalizeDiv(e.divId || e.div) === normDiv;
    if (matchSem && matchDiv && e.day === day && e.timeSlot === timeSlot) return false;
    if (isLab && nextSlot && matchSem && matchDiv && e.day === day && e.timeSlot === nextSlot) return false;
    return true;
  });

  const sessionId = targetSessionId || ('sess_lab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));

  const baseEntry = {
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
    room: slotData.room || (isLab ? 'Lab 1' : 'Room 201'),
    color: slotData.color,
    type: isLab ? 'Lab' : (slotData.type || 'Lecture'),
    batch: slotData.batch || 'All',
    day
  };

  if (isLab && nextSlot) {
    filtered.push({
      ...baseEntry,
      id: generateId(),
      timeSlot,
      sessionId,
      span: 2,
      duration: '2 Hours',
      combinedTimeSlot: combinedTime,
      isMultiSlot: true
    });
    filtered.push({
      ...baseEntry,
      id: generateId(),
      timeSlot: nextSlot,
      sessionId,
      span: 2,
      duration: '2 Hours',
      combinedTimeSlot: combinedTime,
      isMultiSlot: true,
      isContinuation: true
    });
  } else {
    filtered.push({
      ...baseEntry,
      id: generateId(),
      timeSlot,
      span: 1,
      isMultiSlot: false
    });
  }

  localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(filtered));
  notifyTimetableSync();
  return convertEntriesToGrid(getEntriesByClass(deptId, sem, div));
};

export const clearClassSlot = (sem, div, day, timeSlot, deptId = null) => {
  const entries = getTimetableEntries();
  const normSem = normalizeSem(sem);
  const normDiv = normalizeDiv(div);
  const target = entries.find(e => {
    const semMatch = normalizeSem(e.semId || e.sem) === normSem;
    const divMatch = normalizeDiv(e.divId || e.div) === normDiv;
    return semMatch && divMatch && e.day === day && e.timeSlot === timeSlot;
  });

  let filtered;
  if (target && target.sessionId) {
    filtered = entries.filter(e => e.sessionId !== target.sessionId);
  } else {
    filtered = entries.filter(e => {
      const semMatch = normalizeSem(e.semId || e.sem) === normSem;
      const divMatch = normalizeDiv(e.divId || e.div) === normDiv;
      const deptMatch = !deptId || !e.departmentId || e.departmentId === deptId;
      return !(semMatch && divMatch && deptMatch && e.day === day && e.timeSlot === timeSlot);
    });
  }
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
  const resolvedFacDept = resolveDepartment(faculty?.dept);
  let facultyDeptId = resolvedFacDept ? resolvedFacDept.id : 'DEP_AI';

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
        batch: slot.batch || 'All',
        room: slot.room || 'Room 201',
        color: slot.color || getSubjectColor(slot.subject),
        type: slot.type || 'Lecture',
        day,
        timeSlot,
        sessionId: slot.sessionId || (slot.span > 1 ? slot.sessionId : null),
        span: slot.span || 1,
        duration: slot.duration,
        combinedTimeSlot: slot.combinedTimeSlot,
        isContinuation: slot.isContinuation || false,
        isMultiSlot: slot.span > 1
      });
    });
  });
  
  console.log('[STORAGE] applyUploadedFacultyTimetable: saving', filtered.length, 'total entries (', filtered.filter(e => e.facultyId === facultyId).length, 'for this faculty )');
  reconcileConsecutiveLabEntries(filtered);
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
    const resolved = resolveDepartment(deptNameOrId);
    targetDeptId = resolved ? resolved.id : deptNameOrId;
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
        batch: slot.batch || 'All',
        room: slot.room || 'Room 201',
        color: slot.color || getSubjectColor(slot.subject),
        type: slot.type || 'Lecture',
        day,
        timeSlot,
        sessionId: slot.sessionId || (slot.span > 1 ? slot.sessionId : null),
        span: slot.span || 1,
        duration: slot.duration,
        combinedTimeSlot: slot.combinedTimeSlot,
        isContinuation: slot.isContinuation || false,
        isMultiSlot: slot.span > 1
      });
    });
  });
  
  reconcileConsecutiveLabEntries(filtered);
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
// Support newline, slash (/), or comma separated cell content e.g. "5IT1 / DBMS / IT-5"
  const lines = raw.split(/\r?\n|\/|,/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  if (lines.some(l => /^(lunch|break|lb|-+)$/i.test(l))) return null;

  let subject = '';
  let room = 'Room 201';
  let sem = null;
  let div = null;
  let batch = 'ALL';
  let deptId = null;

  // Extract Batch if present e.g. "Batch A", "(B1)", "B2", "-A"
  for (const line of lines) {
    const bMatch = line.match(/\b(?:batch\s*([A-Za-z0-9]+)|\(([A-Za-z0-9]+)\)|-(?:B|Batch)?([A-Za-z0-9]+))\b/i);
    if (bMatch) {
      batch = `Batch ${bMatch[1] || bMatch[2] || bMatch[3]}`;
      break;
    }
  }

  const deptsList = getDepartments(true);
  const deptCodeMap = {
    'AE': 'DEP_AE',
    'CL': 'DEP_CL',
    'EE': 'DEP_EE',
    'EC': 'DEP_EC',
    'ME': 'DEP_ME',
    'FPT': 'DEP_FPT',
    'DT': 'DEP_DT',
    'CE': 'DEP_CE',
    'CP': 'DEP_CE',
    'IT': 'DEP_IT',
    'AI': 'DEP_AI'
  };
  deptsList.forEach(d => {
    if (d.code) deptCodeMap[d.code.toUpperCase()] = d.id;
  });

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
    const validCodes = Object.keys(deptCodeMap).join('|');
    const tokenRegex = new RegExp(`\\b([1-8])\\s*(${validCodes}|PG)(\\d?)\\b`, 'i');
    const tokenMatch = line.match(tokenRegex);
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
    batch: batch || 'ALL',
    deptId: deptId || defaultDeptId,
    room,
    type: isLab ? 'Lab' : 'Lecture'
  };
};

// Helper: Find which row contains the timetable day headers (Monday, Tuesday, etc.)
export const findGridHeaderRowIdx = (rows) => {
  if (!rows || rows.length < 2) return -1;
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    const r = rows[i];
    if (!r || !Array.isArray(r)) continue;
    const dayHits = TIMETABLE_DAYS.filter(d =>
      r.some(cell => String(cell || '').toLowerCase().includes(d.toLowerCase()))
    );
    if (dayHits.length >= 3) return i;
  }
  return -1;
};

// Detect if the spreadsheet uses GRID format (time × Mon × Tue …)
const _isGridFormat = (rows) => {
  return findGridHeaderRowIdx(rows) !== -1;
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
  const gridHeaderIdx = findGridHeaderRowIdx(rows);
  if (gridHeaderIdx !== -1) {
    const header = rows[gridHeaderIdx];

    // Detect faculty details from rows above gridHeaderIdx if present
    let detectedFacultyId = targetFacultyId;
    for (let r = 0; r < gridHeaderIdx; r++) {
      const row = rows[r];
      if (!row || !Array.isArray(row)) continue;
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || '').trim();
        if (/faculty\s*code|faculty\s*id/i.test(val)) {
          const nextVal = String(row[c + 1] || '').trim() || val.replace(/.*?faculty\s*(?:code|id)\s*[:=]?\s*/i, '');
          if (nextVal) {
            const matchedFac = registeredFaculties.find(f => f.id.toLowerCase() === nextVal.toLowerCase() || f.name.toLowerCase().includes(nextVal.toLowerCase()));
            if (matchedFac) detectedFacultyId = matchedFac.id;
          }
        } else if (/name\s*of\s*faculty|faculty\s*name/i.test(val)) {
          const nextVal = String(row[c + 1] || '').trim() || val.replace(/.*?name\s*of\s*faculty\s*[:=]?\s*/i, '');
          if (nextVal && !detectedFacultyId) {
            const matchedFac = registeredFaculties.find(f => f.name.toLowerCase().includes(nextVal.toLowerCase()));
            if (matchedFac) detectedFacultyId = matchedFac.id;
          }
        }
      }
    }

    // Map column index → day name
    const colToDay = {};
    header.forEach((cell, colIdx) => {
      if (colIdx === 0) return;
      const day = TIMETABLE_DAYS.find(d => String(cell || '').toLowerCase().includes(d.toLowerCase()));
      if (day) colToDay[colIdx] = day;
    });

    // Each subsequent row: col 0 = time slot, other cols = cell content
    for (let ri = gridHeaderIdx + 1; ri < rows.length; ri++) {
      const row = rows[ri];
      if (!row || row.every(c => !c)) continue;

      const firstCell = String(row[0] || '').trim();
      // Stop condition: Reached bottom summary tables of official template
      if (/working\s*hours|teaching\s*load|subject\s*code|prepared\s*by|how\s*to\s*use/i.test(firstCell)) {
        break;
      }

      // Check if row has multi-slot lab time (e.g. 10:55 - 12:40 or 10:55 AM–12:40 PM)
      const covered = getCoveredConsecutiveSlots(firstCell);
      if (covered.length === 2) {
        const [slot1, slot2] = covered;
        const combinedTime = getCombinedTimeSlot(slot1, slot2);
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
          const type = parsed.type || (isLabSession(parsed) ? 'Lab' : 'Lecture');
          const sessionId = 'sess_lab_xl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

          timetable[day][slot1] = {
            subject: parsed.subject,
            name: parsed.subject,
            sem,
            div,
            batch: parsed.batch || 'ALL',
            departmentId: deptId,
            room,
            type,
            color: getSubjectColor(parsed.subject),
            span: 2,
            duration: '2 Hours',
            combinedTimeSlot: combinedTime,
            sessionId,
            isMultiSlot: true
          };
          timetable[day][slot2] = {
            subject: parsed.subject,
            name: parsed.subject,
            sem,
            div,
            batch: parsed.batch || 'ALL',
            departmentId: deptId,
            room,
            type,
            color: getSubjectColor(parsed.subject),
            span: 2,
            duration: '2 Hours',
            combinedTimeSlot: combinedTime,
            sessionId,
            isMultiSlot: true,
            isContinuation: true
          };

          previewLectures.push({
            day,
            time: combinedTime,
            subject: parsed.subject,
            room,
            sem,
            div,
            batch: parsed.batch || 'ALL',
            departmentId: deptId,
            status: 'valid',
            span: 2,
            duration: '2 Hours',
            sessionId,
            isMultiSlot: true,
            type
          });

          validLectures.push({
            day,
            time: slot1,
            timeSlot: slot1,
            subject: parsed.subject,
            room,
            sem,
            div,
            batch: parsed.batch || 'ALL',
            departmentId: deptId,
            status: 'valid',
            span: 2,
            duration: '2 Hours',
            combinedTimeSlot: combinedTime,
            sessionId,
            isMultiSlot: true,
            type
          });
          validLectures.push({
            day,
            time: slot2,
            timeSlot: slot2,
            subject: parsed.subject,
            room,
            sem,
            div,
            batch: parsed.batch || 'ALL',
            departmentId: deptId,
            status: 'valid',
            span: 2,
            duration: '2 Hours',
            combinedTimeSlot: combinedTime,
            sessionId,
            isMultiSlot: true,
            isContinuation: true,
            type
          });
        });
        continue;
      }

      const timeSlot = _fuzzyTimeSlot(row[0]);
      if (!timeSlot) continue;
      if (timeSlot === '12:40 - 1:25' || /break|lunch/i.test(firstCell)) continue; // lunch

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
          batch: parsed.batch || 'ALL',
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
          batch: parsed.batch || 'ALL',
          departmentId: deptId,
          status: 'valid'
        };
        previewLectures.push(lec);
        validLectures.push(lec);
      });
    }
    mergeConsecutiveLabSessionsInParsedResult({ timetable, validLectures, previewLectures });
    return { timetable, previewLectures, errorRows, conflictRows, duplicateRows, validLectures, detectedFacultyId };
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

      // Validate Department against database
      const isRowElective = /elective/i.test(rawSubj) || /elective/i.test(rawDept);
      let resolvedDept = null;
      if (rawDept && !isRowElective) {
        resolvedDept = resolveDepartment(rawDept);
        if (!resolvedDept) {
          const errStr = `Row ${rowNum}: Department "${rawDept}" is not recognized or registered in the system.`;
          errorRows.push({ row: rowNum, error: errStr, reason: errStr, message: errStr });
          continue;
        }
      }
      const finalDeptId = isRowElective ? 'DEP_ELECTIVE' : (resolvedDept ? resolvedDept.id : (defaultDeptId || 'DEP_AI'));
      const finalDeptName = isRowElective ? 'Elective (No Department)' : (resolvedDept ? resolvedDept.name : (rawDept || defaultDeptId));

      // Check if time spans 2 consecutive slots (e.g. 10:55 AM–12:40 PM or 10:55 - 12:40)
      const covered = getCoveredConsecutiveSlots(rawTime);
      if (covered.length === 2) {
        const [slot1, slot2] = covered;
        const combinedTime = getCombinedTimeSlot(slot1, slot2);
        const sharedSessionId = 'sess_lab_xl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const color = getSubjectColor(rawSubj);
        const type = rawType || (rawSubj.toLowerCase().includes('lab') ? 'Lab' : 'Lecture');

        const lec1 = {
          rowNum,
          day: dayHit,
          time: slot1,
          timeSlot: slot1,
          subject: rawSubj,
          name: rawSubj,
          room: rawRoom,
          sem: normalizeSem(rawSem),
          div: normalizeDiv(rawDiv),
          batch: rawBatch,
          department: finalDeptName,
          departmentId: finalDeptId,
          facultyId: targetFacultyId || 'FAC_PS',
          facultyName: rawFacName || 'Faculty',
          type,
          color,
          span: 2,
          duration: '2 Hours',
          combinedTimeSlot: combinedTime,
          sessionId: sharedSessionId,
          isMultiSlot: true,
          status: 'valid'
        };

        const lec2 = {
          rowNum,
          day: dayHit,
          time: slot2,
          timeSlot: slot2,
          subject: rawSubj,
          name: rawSubj,
          room: rawRoom,
          sem: normalizeSem(rawSem),
          div: normalizeDiv(rawDiv),
          batch: rawBatch,
          department: finalDeptName,
          departmentId: finalDeptId,
          facultyId: targetFacultyId || 'FAC_PS',
          facultyName: rawFacName || 'Faculty',
          type,
          color,
          span: 2,
          duration: '2 Hours',
          combinedTimeSlot: combinedTime,
          sessionId: sharedSessionId,
          isMultiSlot: true,
          isContinuation: true,
          status: 'valid'
        };

        previewLectures.push({
          ...lec1,
          time: combinedTime
        });
        validLectures.push(lec1);
        validLectures.push(lec2);

        if (!targetFacultyId || lec1.facultyId === targetFacultyId) {
          timetable[dayHit][slot1] = { ...lec1 };
          timetable[dayHit][slot2] = { ...lec2 };
        }
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
        if (!matchedFaculty && targetFacultyId && targetFacultyId.toLowerCase() === rawFacId.toLowerCase()) {
          matchedFaculty = { id: targetFacultyId, name: rawFacName || 'Faculty' };
        }
        if (!matchedFaculty && (registeredFaculties.length === 0 || !scopeIsClass)) {
          matchedFaculty = { id: rawFacId, name: rawFacName || rawFacId };
        }
        if (!matchedFaculty) {
          const errStr = `Row ${rowNum}: Faculty ID "${rawFacId}" is not recognized or registered in the system.`;
          errorRows.push({ row: rowNum, error: errStr, reason: errStr, message: errStr });
          continue;
        }
      } else if (rawFacName) {
        matchedFaculty = registeredFaculties.find(f => f.name.toLowerCase().includes(rawFacName.toLowerCase()) || rawFacName.toLowerCase().includes(f.name.toLowerCase()));
        if (!matchedFaculty && targetFacultyId) {
          matchedFaculty = { id: targetFacultyId, name: rawFacName };
        }
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
        department: finalDeptName,
        departmentId: finalDeptId,
        facultyId: assignedFacId,
        facultyName: assignedFacName,
        type: rawType || (rawSubj.toLowerCase().includes('lab') ? 'Lab' : 'Lecture'),
        color,
        hasConflict,
        conflictMsg,
        isDuplicate,
        status: hasConflict ? 'conflict' : isDuplicate ? 'duplicate' : 'valid'
      };

      previewLectures.push({ ...lecObj });
      if (!hasConflict) {
        validLectures.push({ ...lecObj });
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

    mergeConsecutiveLabSessionsInParsedResult({ timetable, validLectures, previewLectures });
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
  mergeConsecutiveLabSessionsInParsedResult({ timetable, validLectures: previewLectures, previewLectures });
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
    const res = resolveDepartment(deptNameOrId);
    if (res) defaultDeptId = res.id;
    else if (deptNameOrId.startsWith('DEP_')) defaultDeptId = deptNameOrId;
  } else if (facultyId) {
    try {
      const facs = getFaculties();
      const f = facs.find(fac => fac.id === facultyId);
      if (f && f.dept) {
        const res = resolveDepartment(f.dept);
        if (res) defaultDeptId = res.id;
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

      const normalizedDaySlots = {};
      Object.entries(daySlots).forEach(([timeSlot, slot]) => {
        if (!slot || !slot.subject) return;
        const subjShort = String(slot.subject).trim();
        if (!subjShort || /^(lunch|break|lb|-+)$/i.test(subjShort)) return;

        const sem = normalizeSem(slot.sem || defaultSem);
        const div = normalizeDiv(slot.div || defaultDiv);
        const deptId = slot.departmentId || defaultDeptId;
        const room = slot.room || (isLabSession(slot) ? 'Lab 1' : 'Room 201');
        const type = slot.type || (isLabSession(slot) ? 'Lab' : 'Lecture');
        const name = slot.name || slot.subjectFullName || subjShort;
        const color = slot.color || getSubjectColor(subjShort);
        const facName = slot.facultyName || facultyName || '';
        const batch = slot.batch || 'All';

        normalizedDaySlots[timeSlot] = {
          subject: subjShort,
          name,
          sem,
          div,
          batch,
          departmentId: deptId,
          room,
          type,
          color,
          facultyName: facName,
          day,
          timeSlot,
          span: 1
        };
      });

      // Detect and merge consecutive laboratory slots on this day
      const sortedSlots = TIME_SLOTS.filter(s => s !== '12:40 - 1:25' && !isLunchTime(s));
      const processedTimes = new Set();

      sortedSlots.forEach((timeSlot, idx) => {
        if (processedTimes.has(timeSlot)) return;
        const slot = normalizedDaySlots[timeSlot];
        if (!slot) return;

        subjectsSet.add(slot.subject);

        const isLab = slot.type === 'Lab' || isLabSession(slot);
        const nextTime = idx + 1 < sortedSlots.length ? sortedSlots[idx + 1] : null;
        const nextSlot = nextTime ? normalizedDaySlots[nextTime] : null;
        const isConsecutive = nextTime && getNextConsecutiveTimeSlot(timeSlot) === nextTime;

        if (isLab && nextSlot && isConsecutive) {
          const nextIsLab = nextSlot.type === 'Lab' || isLabSession(nextSlot);
          const sameSubject = (slot.subject || '').toLowerCase() === (nextSlot.subject || '').toLowerCase();
          const sameSem = normalizeSem(slot.sem) === normalizeSem(nextSlot.sem);
          const sameDiv = normalizeDiv(slot.div) === normalizeDiv(nextSlot.div);
          const sameBatch = (slot.batch || 'ALL').toUpperCase() === (nextSlot.batch || 'ALL').toUpperCase();
          const sameFaculty = !slot.facultyName || !nextSlot.facultyName || slot.facultyName.toLowerCase() === nextSlot.facultyName.toLowerCase();

          if (nextIsLab && sameSubject && sameSem && sameDiv && sameBatch && sameFaculty) {
            const sessionId = slot.sessionId || nextSlot.sessionId || ('sess_lab_up_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
            const combinedTime = getCombinedTimeSlot(timeSlot, nextTime);

            const mergedSlot1 = {
              ...slot,
              type: 'Lab',
              span: 2,
              duration: '2 Hours',
              combinedTimeSlot: combinedTime,
              sessionId,
              isMultiSlot: true
            };
            const mergedSlot2 = {
              ...nextSlot,
              type: 'Lab',
              span: 2,
              duration: '2 Hours',
              combinedTimeSlot: combinedTime,
              sessionId,
              isMultiSlot: true,
              isContinuation: true
            };

            timetable[day][timeSlot] = mergedSlot1;
            timetable[day][nextTime] = mergedSlot2;

            previewLectures.push({
              day,
              time: combinedTime,
              subject: slot.subject,
              name: slot.name,
              room: slot.room,
              sem: slot.sem,
              div: slot.div,
              batch: slot.batch,
              departmentId: slot.departmentId,
              facultyName: slot.facultyName,
              span: 2,
              type: 'Lab',
              duration: '2 Hours',
              sessionId
            });

            processedTimes.add(timeSlot);
            processedTimes.add(nextTime);
            return;
          }
        }

        timetable[day][timeSlot] = slot;
        previewLectures.push({
          day,
          time: timeSlot,
          subject: slot.subject,
          name: slot.name,
          room: slot.room,
          sem: slot.sem,
          div: slot.div,
          batch: slot.batch,
          departmentId: slot.departmentId,
          facultyName: slot.facultyName,
          span: 1,
          type: slot.type
        });
        processedTimes.add(timeSlot);
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
        timeSlot: lec.timeSlot || lec.time,
        sessionId: lec.sessionId || null,
        span: lec.span || 1,
        duration: lec.duration || (lec.span > 1 ? '2 Hours' : null),
        combinedTimeSlot: lec.combinedTimeSlot || null,
        isMultiSlot: lec.span > 1 || Boolean(lec.isMultiSlot),
        isContinuation: Boolean(lec.isContinuation)
      });
    });

    reconcileConsecutiveLabEntries(updatedEntries);
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
// OFFICIAL FACULTY TIMETABLE TEMPLATE DOWNLOAD (EXCEL & CSV)
// Format strictly matches ADIT CVM University Faculty Timetable Template
// =========================================================================

export const downloadFacultyTimetableTemplate = (facultyName = 'Faculty', deptName = 'Department', semName = '3rd Semester', facultyId = 'FAC_PS') => {
  const wb = XLSX.utils.book_new();
  const faculties = getFaculties();
  const targetFaculty = faculties.find(f => f.id === facultyId || f.name === facultyName);
  const actualFacultyName = targetFaculty?.name || (facultyName !== 'Faculty' ? facultyName : 'Prof. Priya Shah');
  const actualDept = targetFaculty?.dept || (deptName !== 'Department' ? deptName : 'AI & Data Science');
  const actualFacultyId = targetFaculty?.id || facultyId || 'FAC_PS';

  const timetable = getFacultyTimetable(actualFacultyId);
  const metrics = calculateFacultyTeachingMetrics(timetable);

  // Sheet 1: Official ADIT CVM University Faculty Timetable Template
  const rows = [
    ['A D Patel Institute of Technology', '', '', '', '', '', ''],
    ['The Charutar Vidya Mandal (CVM) University', '', '', '', '', '', ''],
    ['Timetable for the ODD / EVEN Semester of Academic Year 2025 - 2026', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Name of Faculty:', actualFacultyName, '', 'Department:', actualDept, 'Faculty Code:', actualFacultyId],
    ['Program Code:', 'B.Tech', '', 'Effective from:', '01/07/2026', '', ''],
    ['', '', '', '', '', '', ''],
    ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  ];

  const timeSlotsMapping = [
    { label: '9:05 to 9:55am', keys: ['9:05 to 9:55am', '9:00 - 9:55', '9:05 - 9:55'] },
    { label: '10:00 to 10:50am', keys: ['10:00 to 10:50am', '10:00 - 10:50'] },
    { label: '10:55 to 11:45am', keys: ['10:55 to 11:45am', '10:55 - 11:45'] },
    { label: '11:50 to 12:40pm', keys: ['11:50 to 12:40pm', '11:50 - 12:40'] },
    { label: '12:40 to 1:25pm (Break)', isBreak: true },
    { label: '1:25 to 2:15pm', keys: ['1:25 to 2:15pm', '1:25 - 2:15'] },
    { label: '2:20 to 3:10pm', keys: ['2:20 to 3:10pm', '2:20 - 3:10'] },
    { label: '3:15 to 4:05pm', keys: ['3:15 to 4:05pm', '3:15 - 4:05'] },
    { label: '4:10 to 5:00pm', keys: ['4:10 to 5:00pm', '4:10 - 5:00'] }
  ];

  timeSlotsMapping.forEach(tsDef => {
    if (tsDef.isBreak) {
      rows.push([tsDef.label, '', '', '', '', '', '']);
      return;
    }

    const row = [tsDef.label];
    TIMETABLE_DAYS.forEach(day => {
      const daySlots = timetable[day] || {};
      let slot = null;
      for (const k of tsDef.keys) {
        if (daySlots[k] && daySlots[k].subject) {
          slot = daySlots[k];
          break;
        }
      }
      if (!slot) {
        for (const k of Object.keys(daySlots)) {
          if (normalizeTimeSlot(k) === normalizeTimeSlot(tsDef.label)) {
            slot = daySlots[k];
            break;
          }
        }
      }

      if (slot && slot.subject) {
        const classBatch = `${slot.sem || ''} ${slot.div || ''}${slot.batch && slot.batch !== 'ALL' ? ` (${slot.batch})` : ''}`.trim();
        const room = slot.room || '';
        row.push(`${classBatch} / ${slot.subject} / ${room}`.trim());
      } else {
        row.push('');
      }
    });
    rows.push(row);
  });

  // Working Hours table
  rows.push(['', '', '', '', '', '', '']);
  rows.push(['Working Hours', 'L', 'P/T', 'Total Load', '', '', '']);
  rows.push(['UG Working Hours', metrics.ugL || '', metrics.ugPT || '', metrics.ugTotal || 0, '', '', '']);
  rows.push(['PG Working Hours', metrics.pgL || '', metrics.pgPT || '', metrics.pgTotal || 0, '', '', '']);
  rows.push(['Diploma Working Hours', '', '', 0, '', '', '']);
  rows.push(['Internship/Project/Seminar (Guidance) Working Hours', metrics.guidanceL || '', metrics.guidancePT || '', metrics.guidanceTotal || 0, '', '', '']);
  rows.push(['Other Institution Working Hours', '', '', 0, '', '', '']);
  rows.push(['TOTAL TEACHING LOAD', metrics.totalTeachingLoadL || 0, metrics.totalTeachingLoadPT || 0, metrics.totalTeachingLoad || 0, '', '', '']);

  // Subject Code table
  rows.push(['', '', '', '', '', '', '']);
  rows.push(['Subject Code', 'Name of Subject', 'L', 'T', 'P', 'C', '']);
  metrics.subjectDetailsList.forEach(s => {
    rows.push([s.code, s.name, s.L, s.T, s.P, s.C, '']);
  });
  for (let i = 0; i < Math.max(1, 6 - metrics.subjectDetailsList.length); i++) {
    rows.push(['', '', '', '', '', '', '']);
  }

  // Signatures
  rows.push(['Prepared by: ____________________      Verified by Head: ____________________      Principal/Director: ____________________', '', '', '', '', '', '']);
  rows.push(['', '', '', '', '', '', '']);

  // How to use
  rows.push(['How to use', '', '', '', '', '', '']);
  rows.push(['Fill only the cream-coloured cells (faculty details, timetable grid, L and P/T hours, subjects).', '', '', '', '', '', '']);
  rows.push(['In each grid cell type: Class/Batch, Subject and Room, e.g. 5IT1 / DBMS / IT-5 (use Alt+Enter for a new line).', '', '', '', '', '', '']);
  rows.push(['Total Load per row and the TOTAL TEACHING LOAD row are calculated automatically (Load = L + P/T).', '', '', '', '', '', '']);
  rows.push(['Grey (example) text in the subject table is only a sample - overwrite or delete it.', '', '', '', '', '', '']);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 24 }, // Time / Working Hours / Subject Code
    { wch: 22 }, // Monday / L / Name of Subject
    { wch: 22 }, // Tuesday / P/T / L
    { wch: 22 }, // Wednesday / Total Load / T
    { wch: 22 }, // Thursday / P
    { wch: 22 }, // Friday / C
    { wch: 22 }  // Saturday
  ];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    { s: { r: 12, c: 1 }, e: { r: 12, c: 6 } }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Faculty Timetable');

  // Sheet 2: Faculty Directory (Reference)
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

  XLSX.writeFile(wb, `ADIT_Faculty_Timetable_${actualFacultyId || 'Template'}.xlsx`);
};

export const getFacultyTimetableCsvString = (facultyName = 'Faculty', deptName = 'Department', facultyId = 'FAC_PS') => {
  const faculties = getFaculties();
  const targetFaculty = faculties.find(f => f.id === facultyId || f.name === facultyName);
  const actualFacultyName = targetFaculty?.name || (facultyName !== 'Faculty' ? facultyName : '');
  const actualDept = targetFaculty?.dept || (deptName !== 'Department' ? deptName : '');
  const actualFacultyId = targetFaculty?.id || facultyId || '';

  const timetable = getFacultyTimetable(actualFacultyId);
  const metrics = calculateFacultyTeachingMetrics(timetable);

  const escapeCsv = (str) => {
    if (!str) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    'A D Patel Institute of Technology,,,,,,',
    'The Charutar Vidya Mandal (CVM) University,,,,,,',
    'Timetable for the ODD / EVEN Semester of Academic Year 20__ - 20__,,,,,,',
    ',,,,,,',
    `Name of Faculty:${escapeCsv(actualFacultyName)},,,Department:${escapeCsv(actualDept)},,Faculty Code:${escapeCsv(actualFacultyId)},`,
    'Program Code:,,,Effective from:,,,',
    ',,,,,,',
    'Time,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'
  ];

  const timeSlotsMapping = [
    { label: '9:05 to 9:55am', keys: ['9:05 to 9:55am', '9:00 - 9:55', '9:05 - 9:55'] },
    { label: '10:00 to 10:50am', keys: ['10:00 to 10:50am', '10:00 - 10:50'] },
    { label: '10:55 to 11:45am', keys: ['10:55 to 11:45am', '10:55 - 11:45'] },
    { label: '11:50 to 12:40pm', keys: ['11:50 to 12:40pm', '11:50 - 12:40'] },
    { label: '12:40 to 1:25pm (Break)', isBreak: true },
    { label: '1:25 to 2:15pm', keys: ['1:25 to 2:15pm', '1:25 - 2:15'] },
    { label: '2:20 to 3:10pm', keys: ['2:20 to 3:10pm', '2:20 - 3:10'] },
    { label: '3:15 to 4:05pm', keys: ['3:15 to 4:05pm', '3:15 - 4:05'] },
    { label: '4:10 to 5:00pm', keys: ['4:10 to 5:00pm', '4:10 - 5:00'] }
  ];

  timeSlotsMapping.forEach(tsDef => {
    if (tsDef.isBreak) {
      lines.push(`${tsDef.label},,,,,,`);
      return;
    }
    const cols = [tsDef.label];
    TIMETABLE_DAYS.forEach(day => {
      const daySlots = timetable[day] || {};
      let slot = null;
      for (const k of tsDef.keys) {
        if (daySlots[k] && daySlots[k].subject) {
          slot = daySlots[k];
          break;
        }
      }
      if (slot && slot.subject) {
        const classBatch = `${slot.sem || ''} ${slot.div || ''}${slot.batch && slot.batch !== 'ALL' ? ` (${slot.batch})` : ''}`.trim();
        cols.push(escapeCsv(`${classBatch} / ${slot.subject} / ${slot.room || ''}`));
      } else {
        cols.push('');
      }
    });
    lines.push(cols.join(','));
  });

  lines.push(',,,,,,');
  lines.push('Working Hours,L,P/T,Total Load,,,');
  lines.push(`UG Working Hours,${metrics.ugL || ''},${metrics.ugPT || ''},${metrics.ugTotal || 0},,,`);
  lines.push(`PG Working Hours,${metrics.pgL || ''},${metrics.pgPT || ''},${metrics.pgTotal || 0},,,`);
  lines.push('Diploma Working Hours,,,0,,,');
  lines.push(`Internship/Project/Seminar (Guidance) Working Hours,${metrics.guidanceL || ''},${metrics.guidancePT || ''},${metrics.guidanceTotal || 0},,,`);
  lines.push('Other Institution Working Hours,,,0,,,');
  lines.push(`TOTAL TEACHING LOAD,${metrics.totalTeachingLoadL || 0},${metrics.totalTeachingLoadPT || 0},${metrics.totalTeachingLoad || 0},,,`);
  lines.push(',,,,,,');
  lines.push('Subject Code,Name of Subject,L,T,P,C,');
  metrics.subjectDetailsList.forEach(s => {
    lines.push(`${escapeCsv(s.code)},${escapeCsv(s.name)},${s.L},${s.T},${s.P},${s.C},`);
  });
  for (let i = 0; i < Math.max(1, 6 - metrics.subjectDetailsList.length); i++) {
    lines.push(',,,,,,');
  }
  lines.push('Prepared by: ____________________      Verified by Head: ____________________      Principal/Director: ____________________,,,,,,');
  lines.push(',,,,,,');
  lines.push('How to use,,,,,,');
  lines.push('"Fill only the cream-coloured cells (faculty details, timetable grid, L and P/T hours, subjects).",,,,,,');
  lines.push('"In each grid cell type: Class/Batch, Subject and Room, e.g. 5IT1 / DBMS / IT-5 (use Alt+Enter for a new line).",,,,,,');
  lines.push('Total Load per row and the TOTAL TEACHING LOAD row are calculated automatically (Load = L + P/T).,,,,,,');
  lines.push('Grey (example) text in the subject table is only a sample - overwrite or delete it.,,,,,,');

  return lines.join('\n');
};

export const downloadFacultyTimetableCsv = (facultyName = 'Faculty', deptName = 'Department', semName = 'ODD/EVEN', facultyId = 'FAC_PS') => {
  const csvContent = getFacultyTimetableCsvString(facultyName, deptName, facultyId);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ADIT_Faculty_Timetable_${facultyId || 'Template'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

if (typeof window !== 'undefined') {
  window.isLunchTime = isLunchTime;
  window.isLabSession = isLabSession;
  window.getNextConsecutiveTimeSlot = getNextConsecutiveTimeSlot;
  window.getCombinedTimeSlot = getCombinedTimeSlot;
  window.formatOfficialTimeSlot = formatOfficialTimeSlot;
  window.calculateFacultyTeachingMetrics = calculateFacultyTeachingMetrics;
  window.downloadFacultyTimetableTemplate = downloadFacultyTimetableTemplate;
  window.downloadFacultyTimetableCsv = downloadFacultyTimetableCsv;
  window.getFacultyTimetableCsvString = getFacultyTimetableCsvString;
  window.OFFICIAL_TEMPLATE_TIME_SLOTS = OFFICIAL_TEMPLATE_TIME_SLOTS;
  window.getSessionIdentity = getSessionIdentity;
  window.canMergeConsecutiveSlots = canMergeConsecutiveSlots;
  window.rescheduleLectureEntry = rescheduleLectureEntry;
  window.checkRescheduleConflicts = checkRescheduleConflicts;
  window.doTimeSlotsOverlap = doTimeSlotsOverlap;
  window.getDateForDayName = getDateForDayName;
  window.normalizeTimeSlot = normalizeTimeSlot;
  window.getTimetableEntries = getTimetableEntries;
  window.getFacultyTimetable = getFacultyTimetable;
  window.notifyTimetableSync = notifyTimetableSync;
  window.clearAllEntries = clearAllEntries;
  window.updateFacultySlot = updateFacultySlot;
  window.clearFacultySlot = clearFacultySlot;
  window.updateClassSlot = updateClassSlot;
  window.clearClassSlot = clearClassSlot;
  window.normalizeTimetable = normalizeTimetable;
  window.getClassTimetable = getClassTimetable;
  window.getCoveredConsecutiveSlots = getCoveredConsecutiveSlots;
  window.mergeConsecutiveLabSessionsInParsedResult = mergeConsecutiveLabSessionsInParsedResult;
  window.reconcileConsecutiveLabEntries = reconcileConsecutiveLabEntries;
  window.commitUploadedTimetable = commitUploadedTimetable;
  window.applyUploadedFacultyTimetable = applyUploadedFacultyTimetable;
  window.applyUploadedClassTimetable = applyUploadedClassTimetable;
  window.parseExcelTimetableForFaculty = parseExcelTimetableForFaculty;
  window.parseExcelTimetableForClass = parseExcelTimetableForClass;
}


// Download Columnar Timetable Template (Excel & CSV) with Department column
export const downloadColumnarTimetableTemplate = (deptName = 'Aeronautical Engineering') => {
  const wb = XLSX.utils.book_new();
  const headers = [
    'Faculty ID',
    'Faculty Name',
    'Department',
    'Semester',
    'Division',
    'Batch',
    'Subject',
    'Day',
    'Start Time',
    'End Time',
    'Room',
    'Type'
  ];

  const sampleRows = [
    headers,
    ['FAC_PS', 'Prof. Priya Shah', deptName, '3rd Sem', 'Div 1', 'ALL', 'DBMS', 'Monday', '10:00 AM', '10:50 AM', 'Room 201', 'Lecture'],
    ['FAC_PS', 'Prof. Priya Shah', deptName, '3rd Sem', 'Div 1', 'Batch A', 'DBMS Lab', 'Monday', '10:55 AM', '12:40 PM', 'Lab 201', 'Lab'],
    ['FAC_PS', 'Prof. Priya Shah', deptName, '3rd Sem', 'Div 1', 'ALL', 'Python', 'Tuesday', '9:05 AM', '9:55 AM', 'Room 201', 'Lecture'],
    ['FAC_PS', 'Prof. Priya Shah', 'Elective (No Department)', '5th Sem', 'Elective Class A', 'ALL', 'Cyber Security', 'Wednesday', '1:25 PM', '2:15 PM', 'Room 302', 'Lecture']
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleRows);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 25 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable Template');

  const depts = getDepartments(true);
  const guideRows = [
    ['ADIT COLLEGE-WIDE TIMETABLE IMPORT GUIDELINES', ''],
    ['', ''],
    ['FIELD', 'ACCEPTED VALUES & INSTRUCTIONS'],
    ['Faculty ID / Faculty Name', 'Registered faculty ID (e.g. FAC_PS) or faculty member full name.'],
    ['Department', 'Accepted: ' + depts.map(d => `${d.name} (${d.code})`).join(', ') + '. For Elective subjects, leave empty or use "Elective".'],
    ['Semester', '1st Sem to 8th Sem.'],
    ['Division', 'Div 1, Div 2, Div 3, or section identifier.'],
    ['Batch', 'ALL, Batch A, Batch B, Batch C.'],
    ['Subject', 'Course subject code or name.'],
    ['Day', 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.'],
    ['Time / Duration', 'Start and End time (e.g. 10:00 AM - 10:50 AM). For 2-Hour Labs, cover 2 consecutive periods (e.g. 10:55 AM - 12:40 PM).'],
    ['Room', 'Classroom or Lab code (e.g. Room 201, Lab 301).'],
    ['Type', 'Lecture or Lab / Practical.']
  ];
  const guideWs = XLSX.utils.aoa_to_sheet(guideRows);
  guideWs['!cols'] = [{ wch: 25 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, guideWs, 'Instructions');

  XLSX.writeFile(wb, `ADIT_Timetable_Import_Template_${deptName.replace(/[^A-Za-z0-9]/g, '_')}.xlsx`);
};

if (typeof window !== 'undefined') {
  window.downloadColumnarTimetableTemplate = downloadColumnarTimetableTemplate;
  window.resolveDepartment = resolveDepartment;
  window.isDepartmentMatch = isDepartmentMatch;
}
