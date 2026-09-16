// ADIT Attendance System - Timetable Data & Parsing Service
import * as XLSX from 'xlsx';
import { getSubjects } from './attendanceStorage';

const STORAGE_KEYS = {
  TIMETABLE: 'adit_attendance_timetable',
  UPLOADED_FILE_INFO: 'adit_timetable_file_info'
};

// Days of Week Map
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Default Weekly Timetable for ADIT (Computer Engg 5th Sem)
const DEFAULT_TIMETABLE = {
  Monday: [
    { time: '09:00 AM - 10:00 AM', subjectId: 'SUB02', room: 'Classroom 301', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', subjectId: 'SUB01', room: 'Classroom 301', type: 'Theory' },
    { time: '11:15 AM - 01:15 PM', subjectId: 'SUB03', room: 'Database Lab 2', type: 'Lab' },
  ],
  Tuesday: [
    { time: '09:00 AM - 10:00 AM', subjectId: 'SUB03', room: 'Classroom 301', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', subjectId: 'SUB04', room: 'Classroom 301', type: 'Theory' },
    { time: '11:15 AM - 01:15 PM', subjectId: 'SUB01', room: 'Web Tech Lab 1', type: 'Lab' },
  ],
  Wednesday: [
    { time: '09:00 AM - 10:00 AM', subjectId: 'SUB01', room: 'Classroom 301', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', subjectId: 'SUB05', room: 'Classroom 301', type: 'Theory' },
    { time: '11:15 AM - 01:15 PM', subjectId: 'SUB02', room: 'DS Lab 3', type: 'Lab' },
  ],
  Thursday: [
    { time: '09:00 AM - 10:00 AM', subjectId: 'SUB05', room: 'Classroom 301', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', subjectId: 'SUB02', room: 'Classroom 301', type: 'Theory' },
    { time: '11:15 AM - 01:15 PM', subjectId: 'SUB04', room: 'Software Engg Lab', type: 'Lab' },
  ],
  Friday: [
    { time: '09:00 AM - 10:00 AM', subjectId: 'SUB04', room: 'Classroom 301', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', subjectId: 'SUB03', room: 'Classroom 301', type: 'Theory' },
    { time: '11:15 AM - 01:15 PM', subjectId: 'SUB05', room: 'Network Lab 4', type: 'Lab' },
  ],
  Saturday: [
    { time: '09:00 AM - 10:00 AM', subjectId: 'SUB01', room: 'Classroom 301', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', subjectId: 'SUB02', room: 'Classroom 301', type: 'Theory' },
  ],
  Sunday: []
};

export const getTimetable = () => {
  const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(DEFAULT_TIMETABLE));
    return DEFAULT_TIMETABLE;
  }
  return JSON.parse(data);
};

export const saveTimetable = (timetableData, fileInfo = null) => {
  localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetableData));
  if (fileInfo) {
    localStorage.setItem(STORAGE_KEYS.UPLOADED_FILE_INFO, JSON.stringify(fileInfo));
  }
  return timetableData;
};

export const getUploadedFileInfo = () => {
  const info = localStorage.getItem(STORAGE_KEYS.UPLOADED_FILE_INFO);
  return info ? JSON.parse(info) : null;
};

// Auto-Schedule Helper: Given date string (YYYY-MM-DD), returns day name & scheduled lectures
export const getScheduledLecturesForDate = (dateStr) => {
  if (!dateStr) return { dayName: '', lectures: [] };
  const d = new Date(dateStr + 'T00:00:00');
  const dayName = DAYS[d.getDay()];
  const timetable = getTimetable();
  const lectures = timetable[dayName] || [];
  return { dayName, lectures };
};

// Excel File Parser (.xlsx, .xls, .csv)
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Generate schedule from spreadsheet rows
        const subjects = getSubjects();
        const parsedTimetable = { ...getTimetable() };

        // Attempt matching rows to days
        jsonRows.forEach(row => {
          if (!row || row.length === 0) return;
          const rowStr = row.join(' ').toLowerCase();

          DAYS.forEach(day => {
            if (rowStr.includes(day.toLowerCase())) {
              // Extract subjects found in row
              const matchedLectures = [];
              subjects.forEach((subj, i) => {
                if (rowStr.includes(subj.code.toLowerCase()) || rowStr.includes(subj.name.toLowerCase().slice(0, 5))) {
                  matchedLectures.push({
                    time: `10:0${i + 1} AM - 11:00 AM`,
                    subjectId: subj.id,
                    room: 'Classroom 301',
                    type: 'Theory'
                  });
                }
              });

              if (matchedLectures.length > 0) {
                parsedTimetable[day] = matchedLectures;
              }
            }
          });
        });

        saveTimetable(parsedTimetable, {
          name: file.name,
          type: 'excel',
          size: (file.size / 1024).toFixed(1) + ' KB',
          uploadTime: new Date().toLocaleDateString()
        });

        resolve(parsedTimetable);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

// Image / PDF Parser (.png, .jpg, .jpeg, .pdf)
export const parseImageOrPdfFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileDataUrl = e.target.result;
      const subjects = getSubjects();
      const currentTimetable = getTimetable();

      // Store file info
      saveTimetable(currentTimetable, {
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        dataUrl: file.type.includes('image') ? fileDataUrl : null,
        size: (file.size / 1024).toFixed(1) + ' KB',
        uploadTime: new Date().toLocaleDateString()
      });

      resolve({ timetable: currentTimetable, dataUrl: fileDataUrl });
    };
    reader.readAsDataURL(file);
  });
};
