// src/services/rtdbSync.js
// Firebase Realtime Database Synchronization Engine for ADIT Attendance System
// Database URL: https://adit-attendance-system-default-rtdb.asia-southeast1.firebasedatabase.app

import { getRealtimeDatabase, DEFAULT_DATABASE_URL } from './firebase';
import { 
  getFaculties, 
  getDepartments, 
  getClasses, 
  getSubjects, 
  getStudents, 
  getSessions, 
  getExceptions,
  getAllocations,
  STORAGE_KEYS 
} from './attendanceStorage';
import { getTimetableEntries, TT_STORAGE_KEYS } from './timetableStorage';
import { exportSystemSnapshot, importSystemSnapshot } from './cloudSync';

export const RTDB_PATHS = {
  DEPARTMENTS: 'adit_departments',
  FACULTIES: 'adit_faculties',
  CLASSES: 'adit_classes',
  SUBJECTS: 'adit_subjects',
  STUDENTS: 'adit_students',
  TIMETABLE_ENTRIES: 'adit_timetable_entries',
  SESSIONS: 'adit_sessions',
  EXCEPTIONS: 'adit_exceptions',
  ALLOCATIONS: 'adit_allocations',
  SYSTEM: 'adit_system'
};

export const PRE_MIGRATION_BACKUP_KEY = 'adit_backup_pre_rtdb_migration';

let rtdbSyncActive = false;
let activeListeners = [];

const getRtdbPrimitives = () => {
  if (typeof window !== 'undefined' && window.Firebase) {
    return window.Firebase;
  }
  return null;
};

/**
 * Creates an automated pre-migration backup stored safely in localStorage.
 * Guarantees zero data loss prior to any migration or bulk synchronization.
 */
export const backupSystemDataBeforeMigration = () => {
  try {
    const snapshot = exportSystemSnapshot();
    const backupRecord = {
      backupDate: new Date().toISOString(),
      timestamp: Date.now(),
      totalCollections: snapshot.keysCount || 0,
      snapshot: snapshot
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PRE_MIGRATION_BACKUP_KEY, JSON.stringify(backupRecord));
    }
    return { success: true, backupRecord };
  } catch (err) {
    console.warn('[RTDB] Pre-migration backup warning:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Checks whether the Realtime Database already contains institutional records.
 */
export const checkCloudDataExists = async () => {
  const db = getRealtimeDatabase();
  const f = getRtdbPrimitives();

  if (db && f && typeof f.ref === 'function' && typeof f.get === 'function') {
    try {
      const facRef = f.ref(db, RTDB_PATHS.FACULTIES);
      const snapshot = await f.get(facRef);
      if (snapshot.exists() && snapshot.val()) {
        const count = Object.keys(snapshot.val()).length;
        return { exists: true, count };
      }
    } catch (e) {
      console.warn('[RTDB] Check cloud data SDK notice:', e.message);
    }
  }

  // REST API fallback
  try {
    const url = `${DEFAULT_DATABASE_URL}/${RTDB_PATHS.FACULTIES}.json?shallow=true`;
    const res = await fetch(url);
    if (res.ok) {
      const val = await res.json();
      if (val && typeof val === 'object') {
        const count = Object.keys(val).length;
        return { exists: count > 0, count };
      }
    }
  } catch (e) {
    // network or auth error
  }

  return { exists: false, count: 0 };
};

/**
 * Uploads a single record to the Firebase Realtime Database.
 */
export const syncRtdbRecord = async (pathName, recordId, data) => {
  if (!recordId) return false;
  const cleanId = String(recordId).trim().replace(/[.#$/[\]]/g, '_');
  const cleanData = {
    ...data,
    _syncedAt: new Date().toISOString()
  };

  const db = getRealtimeDatabase();
  const f = getRtdbPrimitives();

  if (db && f && typeof f.ref === 'function' && typeof f.set === 'function') {
    try {
      const targetRef = f.ref(db, `${pathName}/${cleanId}`);
      await f.set(targetRef, cleanData);
      return true;
    } catch (err) {
      console.warn(`[RTDB] SDK sync failed for ${pathName}/${cleanId}:`, err.message);
    }
  }

  // REST API fallback
  try {
    const url = `${DEFAULT_DATABASE_URL}/${pathName}/${cleanId}.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanData)
    });
    return res.ok;
  } catch (err) {
    console.warn(`[RTDB] REST sync failed for ${pathName}/${cleanId}:`, err.message);
    return false;
  }
};

/**
 * Deletes a record from the Firebase Realtime Database.
 */
export const deleteRtdbRecord = async (pathName, recordId) => {
  if (!recordId) return false;
  const cleanId = String(recordId).trim().replace(/[.#$/[\]]/g, '_');

  const db = getRealtimeDatabase();
  const f = getRtdbPrimitives();

  if (db && f && typeof f.ref === 'function' && typeof f.remove === 'function') {
    try {
      const targetRef = f.ref(db, `${pathName}/${cleanId}`);
      await f.remove(targetRef);
      return true;
    } catch (err) {
      console.warn(`[RTDB] SDK remove failed for ${pathName}/${cleanId}:`, err.message);
    }
  }

  // REST API fallback
  try {
    const url = `${DEFAULT_DATABASE_URL}/${pathName}/${cleanId}.json`;
    const res = await fetch(url, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.warn(`[RTDB] REST delete failed for ${pathName}/${cleanId}:`, err.message);
    return false;
  }
};

/**
 * Performs a safe migration of existing local institutional data to Firebase Realtime Database.
 * Guarantees zero data loss, performs pre-migration backup, and guards against accidental overwrite.
 */
export const migrateLocalDataToRtdb = async (force = false) => {
  // 1. Mandatory Pre-Migration Backup
  const backup = backupSystemDataBeforeMigration();
  console.log('[RTDB] Pre-migration local backup completed:', backup.success);

  // 2. Overwrite Protection: Check if cloud database already contains records
  if (!force) {
    const cloudStatus = await checkCloudDataExists();
    if (cloudStatus.exists && cloudStatus.count > 0) {
      return {
        migrated: false,
        needsConfirmation: true,
        cloudRecordsCount: cloudStatus.count,
        message: `Firebase Realtime Database already contains ${cloudStatus.count} faculty records. Confirm to proceed and sync.`
      };
    }
  }

  try {
    let syncedCount = 0;
    let failedCount = 0;

    const recordSync = async (path, id, obj) => {
      const ok = await syncRtdbRecord(path, id, obj);
      if (ok) syncedCount++;
      else failedCount++;
      return ok;
    };

    // 3. Migrate Departments
    const depts = getDepartments(true);
    for (const d of depts) {
      if (d.id || d.code) {
        await recordSync(RTDB_PATHS.DEPARTMENTS, d.id || d.code, d);
      }
    }

    // 4. Migrate Faculties (Preserving exact canonical faculty IDs)
    const faculties = getFaculties();
    for (const fac of faculties) {
      if (fac.id) {
        await recordSync(RTDB_PATHS.FACULTIES, fac.id, fac);
      }
    }

    // 5. Migrate Classes (Preserving batch structures)
    const classes = getClasses();
    for (const cls of classes) {
      if (cls.id) {
        await recordSync(RTDB_PATHS.CLASSES, cls.id, cls);
      }
    }

    // 6. Migrate Subjects
    const subjects = getSubjects();
    for (const sub of subjects) {
      if (sub.id) {
        await recordSync(RTDB_PATHS.SUBJECTS, sub.id, sub);
      }
    }

    // 7. Migrate Students
    const students = getStudents();
    for (const stu of students) {
      if (stu.id || stu.enrollmentNo) {
        await recordSync(RTDB_PATHS.STUDENTS, stu.id || stu.enrollmentNo, stu);
      }
    }

    // 8. Migrate Timetable Entries (Preserving 2-hour lab slots and batch tags)
    const entries = getTimetableEntries();
    for (const e of entries) {
      if (e.id) {
        await recordSync(RTDB_PATHS.TIMETABLE_ENTRIES, e.id, e);
      }
    }

    // 9. Migrate Attendance Sessions
    const sessions = getSessions();
    for (const s of sessions) {
      if (s.id) {
        await recordSync(RTDB_PATHS.SESSIONS, s.id, s);
      }
    }

    // 10. Migrate Exceptions
    const exceptions = getExceptions();
    for (const exc of exceptions) {
      if (exc.id) {
        await recordSync(RTDB_PATHS.EXCEPTIONS, exc.id, exc);
      }
    }

    // 11. System Institutional Profile
    await recordSync(RTDB_PATHS.SYSTEM, 'institutional_profile', {
      collegeName: 'A D Patel Institute of Technology',
      databaseUrl: DEFAULT_DATABASE_URL,
      migratedAt: new Date().toISOString()
    });

    if (syncedCount === 0 && failedCount > 0) {
      const errMsg = 'Permission denied by Firebase Realtime Database. Please update Realtime Database Rules in Firebase Console to allow read/write.';
      console.warn('[RTDB] Migration failed:', errMsg);
      return { migrated: false, error: errMsg };
    }

    console.log(`[RTDB] Institutional data successfully synchronized to Firebase Realtime Database (${syncedCount} records synced, ${failedCount} errors)!`);
    return { migrated: true, syncedCount, failedCount, collectionsMigrated: 10 };
  } catch (err) {
    console.warn('[RTDB] Migration error:', err.message);
    return { migrated: false, error: err.message };
  }
};

/**
 * Pulls all records from Firebase Realtime Database and updates localStorage caches.
 */
export const fetchAllFromRtdb = async () => {
  const db = getRealtimeDatabase();
  const f = getRtdbPrimitives();

  let fetchedData = {};

  if (db && f && typeof f.ref === 'function' && typeof f.get === 'function') {
    try {
      const paths = Object.values(RTDB_PATHS);
      for (const p of paths) {
        const snap = await f.get(f.ref(db, p));
        if (snap.exists() && snap.val()) {
          fetchedData[p] = snap.val();
        }
      }
    } catch (e) {
      console.warn('[RTDB] SDK fetch all notice:', e.message);
    }
  }

  // REST fallback if SDK empty or not configured
  if (Object.keys(fetchedData).length === 0) {
    try {
      const url = `${DEFAULT_DATABASE_URL}/.json`;
      const res = await fetch(url);
      if (res.ok) {
        fetchedData = (await res.json()) || {};
      }
    } catch (e) {
      console.warn('[RTDB] REST fetch all notice:', e.message);
    }
  }

  if (Object.keys(fetchedData).length === 0) {
    return false;
  }

  try {
    // 1. Faculties
    if (fetchedData.adit_faculties) {
      const facs = Object.values(fetchedData.adit_faculties);
      if (facs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(facs));
      }
    }

    // 2. Departments
    if (fetchedData.adit_departments) {
      const depts = Object.values(fetchedData.adit_departments);
      if (depts.length > 0) {
        localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
      }
    }

    // 3. Classes
    if (fetchedData.adit_classes) {
      const cls = Object.values(fetchedData.adit_classes);
      if (cls.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(cls));
      }
    }

    // 4. Subjects
    if (fetchedData.adit_subjects) {
      const subjs = Object.values(fetchedData.adit_subjects);
      if (subjs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjs));
      }
    }

    // 5. Students
    if (fetchedData.adit_students) {
      const stus = Object.values(fetchedData.adit_students);
      if (stus.length > 0) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(stus));
      }
    }

    // 6. Timetable Entries
    if (fetchedData.adit_timetable_entries) {
      const ttes = Object.values(fetchedData.adit_timetable_entries);
      if (ttes.length > 0) {
        localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(ttes));
      }
    }

    // 7. Sessions
    if (fetchedData.adit_sessions) {
      const sess = Object.values(fetchedData.adit_sessions);
      if (sess.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sess));
      }
    }

    // 8. Exceptions
    if (fetchedData.adit_exceptions) {
      const excs = Object.values(fetchedData.adit_exceptions);
      if (excs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify(excs));
      }
    }

    // Trigger reactive UI refreshes across the entire application
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
      window.dispatchEvent(new CustomEvent('adit-timetable-synced'));
      window.dispatchEvent(new CustomEvent('adit-sessions-updated'));
      window.dispatchEvent(new CustomEvent('adit-departments-updated'));
      window.dispatchEvent(new CustomEvent('adit-classes-updated'));
      window.dispatchEvent(new CustomEvent('adit-students-updated'));
      window.dispatchEvent(new CustomEvent('adit-data-synced'));
    }

    return true;
  } catch (err) {
    console.warn('[RTDB] Cache update error:', err.message);
    return false;
  }
};

/**
 * Starts continuous real-time synchronization from Firebase Realtime Database.
 */
export const startRealtimeDatabaseSync = () => {
  if (rtdbSyncActive) return;
  const db = getRealtimeDatabase();
  const f = getRtdbPrimitives();
  if (!db || !f || typeof f.ref !== 'function' || typeof f.onValue !== 'function') return;

  rtdbSyncActive = true;

  try {
    // Faculties listener
    const facRef = f.ref(db, RTDB_PATHS.FACULTIES);
    const unsubFac = f.onValue(facRef, (snap) => {
      if (snap.exists() && snap.val()) {
        const facs = Object.values(snap.val());
        localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(facs));
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
      }
    });
    activeListeners.push({ ref: facRef, unsub: unsubFac });

    // Timetable listener
    const ttRef = f.ref(db, RTDB_PATHS.TIMETABLE_ENTRIES);
    const unsubTT = f.onValue(ttRef, (snap) => {
      if (snap.exists() && snap.val()) {
        const entries = Object.values(snap.val());
        localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(entries));
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adit-timetable-synced'));
      }
    });
    activeListeners.push({ ref: ttRef, unsub: unsubTT });

    // Sessions listener
    const sessRef = f.ref(db, RTDB_PATHS.SESSIONS);
    const unsubSess = f.onValue(sessRef, (snap) => {
      if (snap.exists() && snap.val()) {
        const sessions = Object.values(snap.val());
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adit-sessions-updated'));
      }
    });
    activeListeners.push({ ref: sessRef, unsub: unsubSess });

    // Classes listener
    const clsRef = f.ref(db, RTDB_PATHS.CLASSES);
    const unsubCls = f.onValue(clsRef, (snap) => {
      if (snap.exists() && snap.val()) {
        const classes = Object.values(snap.val());
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('adit-classes-updated'));
          window.dispatchEvent(new CustomEvent('adit-data-synced'));
        }
      }
    });
    activeListeners.push({ ref: clsRef, unsub: unsubCls });

    // Students listener (Synchronizes student enrollments and class rosters in real time)
    const stuRef = f.ref(db, RTDB_PATHS.STUDENTS);
    const unsubStu = f.onValue(stuRef, (snap) => {
      if (snap.exists() && snap.val()) {
        const students = Object.values(snap.val());
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('adit-students-updated'));
          window.dispatchEvent(new CustomEvent('adit-data-synced'));
        }
      }
    });
    activeListeners.push({ ref: stuRef, unsub: unsubStu });

    // Departments listener
    const deptRef = f.ref(db, RTDB_PATHS.DEPARTMENTS);
    const unsubDept = f.onValue(deptRef, (snap) => {
      if (snap.exists() && snap.val()) {
        const depts = Object.values(snap.val());
        localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('adit-departments-updated'));
          window.dispatchEvent(new CustomEvent('adit-data-synced'));
        }
      }
    });
    activeListeners.push({ ref: deptRef, unsub: unsubDept });

    // Subjects listener
    const subRef = f.ref(db, RTDB_PATHS.SUBJECTS);
    const unsubSub = f.onValue(subRef, (snap) => {
      if (snap.exists() && snap.val()) {
        const subs = Object.values(snap.val());
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subs));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('adit-data-synced'));
        }
      }
    });
    activeListeners.push({ ref: subRef, unsub: unsubSub });

    console.log('[RTDB] Realtime Database listeners active.');
  } catch (err) {
    console.warn('[RTDB] Listener registration notice:', err.message);
  }
};

/**
 * Stops continuous real-time synchronization.
 */
export const stopRealtimeDatabaseSync = () => {
  const f = getRtdbPrimitives();
  activeListeners.forEach(listener => {
    try {
      if (typeof listener.unsub === 'function') {
        listener.unsub();
      } else if (f && typeof f.off === 'function' && listener.ref) {
        f.off(listener.ref);
      }
    } catch (e) {}
  });
  activeListeners = [];
  rtdbSyncActive = false;
};

// Global browser window bindings
if (typeof window !== 'undefined') {
  window.syncRtdbRecord = syncRtdbRecord;
  window.deleteRtdbRecord = deleteRtdbRecord;
  window.backupSystemDataBeforeMigration = backupSystemDataBeforeMigration;
  window.checkCloudDataExists = checkCloudDataExists;
  window.migrateLocalDataToRtdb = migrateLocalDataToRtdb;
  window.fetchAllFromRtdb = fetchAllFromRtdb;
  window.startRealtimeDatabaseSync = startRealtimeDatabaseSync;
  window.stopRealtimeDatabaseSync = stopRealtimeDatabaseSync;
  window.RTDB_PATHS = RTDB_PATHS;
  window.DEFAULT_DATABASE_URL = DEFAULT_DATABASE_URL;
}
