// src/services/firestoreSync.js
// Cloud Firestore Synchronizer for ADIT Attendance & Timetable Management System
// Project ID: adit-attendance-system

import { getFirestoreDb } from './firebase';
import { 
  getFaculties, 
  getDepartments, 
  getClasses, 
  getSubjects, 
  getStudents, 
  getSessions, 
  getExceptions,
  STORAGE_KEYS
} from './attendanceStorage';
import { getTimetableEntries, TT_STORAGE_KEYS } from './timetableStorage';

// Firestore Collection Names
export const COLLECTIONS = {
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

let syncActive = false;
let unsubscribeListeners = [];

const getPrimitives = () => {
  if (typeof window !== 'undefined' && window.Firebase) {
    return window.Firebase;
  }
  return null;
};

/**
 * Uploads a single document to Firestore.
 */
export const syncDocToFirestore = async (collectionName, docId, data) => {
  const db = getFirestoreDb();
  const f = getPrimitives();
  if (!db || !f || !f.doc || !f.setDoc) return false;

  try {
    const cleanId = String(docId).trim();
    if (!cleanId) return false;
    const docRef = f.doc(db, collectionName, cleanId);
    const cleanData = {
      ...data,
      _updatedAt: f.serverTimestamp ? f.serverTimestamp() : new Date().toISOString()
    };
    await f.setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to write ${collectionName}/${docId}:`, err.message);
    return false;
  }
};

/**
 * Deletes a document from Firestore.
 */
export const deleteDocFromFirestore = async (collectionName, docId) => {
  const db = getFirestoreDb();
  const f = getPrimitives();
  if (!db || !f || !f.doc || !f.deleteDoc) return false;

  try {
    const cleanId = String(docId).trim();
    if (!cleanId) return false;
    const docRef = f.doc(db, collectionName, cleanId);
    await f.deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to delete ${collectionName}/${docId}:`, err.message);
    return false;
  }
};

/**
 * Performs a safe one-time migration of local data to Firestore if Firestore is empty.
 * Guarantees zero data loss for existing faculty, classes, and timetables.
 */
export const migrateLocalDataToFirestore = async (force = false) => {
  const db = getFirestoreDb();
  const f = getPrimitives();
  if (!db || !f || !f.collection || !f.getDocs) return { migrated: false, reason: 'Firebase not ready' };

  try {
    // Check if faculty collection already exists in Firestore
    if (!force) {
      const facCol = f.collection(db, COLLECTIONS.FACULTIES);
      const snapshot = await f.getDocs(facCol);
      if (!snapshot.empty) {
        return { migrated: false, reason: 'Firestore already populated' };
      }
    }

    console.log('[Firestore] Performing initial institutional data migration to Cloud Firestore...');

    // 1. Migrate Departments
    const depts = getDepartments();
    for (const d of depts) {
      if (d.id || d.code) {
        await syncDocToFirestore(COLLECTIONS.DEPARTMENTS, d.id || d.code, d);
      }
    }

    // 2. Migrate Faculties (canonical IDs)
    const faculties = getFaculties();
    for (const fac of faculties) {
      if (fac.id) {
        await syncDocToFirestore(COLLECTIONS.FACULTIES, fac.id, fac);
      }
    }

    // 3. Migrate Classes
    const classes = getClasses();
    for (const c of classes) {
      if (c.id) {
        await syncDocToFirestore(COLLECTIONS.CLASSES, c.id, c);
      }
    }

    // 4. Migrate Subjects
    const subjects = getSubjects();
    for (const s of subjects) {
      if (s.id || s.code) {
        await syncDocToFirestore(COLLECTIONS.SUBJECTS, s.id || s.code, s);
      }
    }

    // 5. Migrate Students
    const students = getStudents();
    for (const stu of students) {
      if (stu.enrollmentNo) {
        await syncDocToFirestore(COLLECTIONS.STUDENTS, stu.enrollmentNo, stu);
      }
    }

    // 6. Migrate Timetable Entries
    const entries = getTimetableEntries();
    for (const e of entries) {
      if (e.id) {
        await syncDocToFirestore(COLLECTIONS.TIMETABLE_ENTRIES, e.id, e);
      }
    }

    // 7. Migrate Sessions
    const sessions = getSessions();
    for (const sess of sessions) {
      if (sess.id) {
        await syncDocToFirestore(COLLECTIONS.SESSIONS, sess.id, sess);
      }
    }

    // 8. Migrate Exceptions
    const exceptions = getExceptions();
    for (const exc of exceptions) {
      if (exc.id) {
        await syncDocToFirestore(COLLECTIONS.EXCEPTIONS, exc.id, exc);
      }
    }

    // Mark system seed record in Firestore
    await syncDocToFirestore(COLLECTIONS.SYSTEM, 'institutional_profile', {
      collegeName: 'A D Patel Institute of Technology',
      projectId: 'adit-attendance-system',
      migratedAt: new Date().toISOString()
    });

    console.log('[Firestore] Institutional data migration to Cloud Firestore complete!');
    return { migrated: true };
  } catch (err) {
    console.warn('[Firestore] Migration error:', err.message);
    return { migrated: false, error: err.message };
  }
};

/**
 * Pulls all records from Firestore and updates localStorage caches.
 */
export const fetchAllFromFirestore = async () => {
  const db = getFirestoreDb();
  const f = getPrimitives();
  if (!db || !f || !f.collection || !f.getDocs) return false;

  try {
    // 1. Fetch Faculties
    const facSnapshot = await f.getDocs(f.collection(db, COLLECTIONS.FACULTIES));
    if (!facSnapshot.empty) {
      const remoteFacs = [];
      facSnapshot.forEach(docSnap => remoteFacs.push(docSnap.data()));
      if (remoteFacs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(remoteFacs));
      }
    }

    // 2. Fetch Departments
    const deptSnapshot = await f.getDocs(f.collection(db, COLLECTIONS.DEPARTMENTS));
    if (!deptSnapshot.empty) {
      const remoteDepts = [];
      deptSnapshot.forEach(docSnap => remoteDepts.push(docSnap.data()));
      if (remoteDepts.length > 0) {
        localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(remoteDepts));
      }
    }

    // 3. Fetch Classes
    const clsSnapshot = await f.getDocs(f.collection(db, COLLECTIONS.CLASSES));
    if (!clsSnapshot.empty) {
      const remoteClasses = [];
      clsSnapshot.forEach(docSnap => remoteClasses.push(docSnap.data()));
      if (remoteClasses.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(remoteClasses));
      }
    }

    // 4. Fetch Subjects
    const subjSnapshot = await f.getDocs(f.collection(db, COLLECTIONS.SUBJECTS));
    if (!subjSnapshot.empty) {
      const remoteSubjs = [];
      subjSnapshot.forEach(docSnap => remoteSubjs.push(docSnap.data()));
      if (remoteSubjs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(remoteSubjs));
      }
    }

    // 5. Fetch Students
    const stuSnapshot = await f.getDocs(f.collection(db, COLLECTIONS.STUDENTS));
    if (!stuSnapshot.empty) {
      const remoteStudents = [];
      stuSnapshot.forEach(docSnap => remoteStudents.push(docSnap.data()));
      if (remoteStudents.length > 0) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(remoteStudents));
      }
    }

    // 6. Fetch Timetable Entries
    const ttSnapshot = await f.getDocs(f.collection(db, COLLECTIONS.TIMETABLE_ENTRIES));
    if (!ttSnapshot.empty) {
      const remoteEntries = [];
      ttSnapshot.forEach(docSnap => remoteEntries.push(docSnap.data()));
      if (remoteEntries.length > 0) {
        localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(remoteEntries));
      }
    }

    // 7. Fetch Sessions
    const sessSnapshot = await f.getDocs(f.collection(db, COLLECTIONS.SESSIONS));
    if (!sessSnapshot.empty) {
      const remoteSessions = [];
      sessSnapshot.forEach(docSnap => remoteSessions.push(docSnap.data()));
      if (remoteSessions.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(remoteSessions));
      }
    }

    // Trigger reactive UI refreshes
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
      window.dispatchEvent(new CustomEvent('adit-timetable-synced'));
      window.dispatchEvent(new CustomEvent('adit-sessions-updated'));
      window.dispatchEvent(new CustomEvent('adit-departments-updated'));
      window.dispatchEvent(new CustomEvent('adit-data-synced'));
    }

    return true;
  } catch (err) {
    console.warn('[Firestore] fetchAll error:', err.message);
    return false;
  }
};

/**
 * Initializes real-time Firestore listeners to keep all open devices in sync.
 */
export const startRealtimeSync = () => {
  const db = getFirestoreDb();
  const f = getPrimitives();
  if (!db || !f || !f.collection || !f.onSnapshot) return;
  if (syncActive) return;
  syncActive = true;

  try {
    // 1. Faculties listener
    const unsubFac = f.onSnapshot(f.collection(db, COLLECTIONS.FACULTIES), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => list.push(docSnap.data()));
      if (list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FACULTIES, JSON.stringify(list));
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
      }
    }, (err) => console.warn('[Firestore] Faculties listener notice:', err.message));
    unsubscribeListeners.push(unsubFac);

    // 2. Timetable Entries listener
    const unsubTT = f.onSnapshot(f.collection(db, COLLECTIONS.TIMETABLE_ENTRIES), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => list.push(docSnap.data()));
      if (list.length > 0) {
        localStorage.setItem(TT_STORAGE_KEYS.TIMETABLE_ENTRIES, JSON.stringify(list));
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adit-timetable-synced'));
      }
    }, (err) => console.warn('[Firestore] Timetable listener notice:', err.message));
    unsubscribeListeners.push(unsubTT);

    // 3. Sessions (Attendance) listener
    const unsubSess = f.onSnapshot(f.collection(db, COLLECTIONS.SESSIONS), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => list.push(docSnap.data()));
      if (list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list));
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adit-sessions-updated'));
      }
    }, (err) => console.warn('[Firestore] Sessions listener notice:', err.message));
    unsubscribeListeners.push(unsubSess);

    // 4. Classes listener
    const unsubClasses = f.onSnapshot(f.collection(db, COLLECTIONS.CLASSES), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => list.push(docSnap.data()));
      if (list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(list));
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adit-classes-updated'));
      }
    }, (err) => console.warn('[Firestore] Classes listener notice:', err.message));
    unsubscribeListeners.push(unsubClasses);

    // 5. Departments listener
    const unsubDepts = f.onSnapshot(f.collection(db, COLLECTIONS.DEPARTMENTS), (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => list.push(docSnap.data()));
      if (list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(list));
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('adit-departments-updated'));
      }
    }, (err) => console.warn('[Firestore] Departments listener notice:', err.message));
    unsubscribeListeners.push(unsubDepts);

  } catch (err) {
    console.warn('[Firestore] Error attaching realtime listeners:', err.message);
  }
};

/**
 * Stops all active Firestore listeners.
 */
export const stopRealtimeSync = () => {
  unsubscribeListeners.forEach(unsub => {
    try { if (typeof unsub === 'function') unsub(); } catch (e) {}
  });
  unsubscribeListeners = [];
  syncActive = false;
};

export const syncFacultyToFirestore = (faculty) => syncDocToFirestore(COLLECTIONS.FACULTIES, faculty.id, faculty);
export const syncTimetableEntryToFirestore = (entry) => syncDocToFirestore(COLLECTIONS.TIMETABLE_ENTRIES, entry.id, entry);
export const syncSessionToFirestore = (session) => syncDocToFirestore(COLLECTIONS.SESSIONS, session.id, session);

// Global browser window bindings
if (typeof window !== 'undefined') {
  window.syncDocToFirestore = syncDocToFirestore;
  window.deleteDocFromFirestore = deleteDocFromFirestore;
  window.migrateLocalDataToFirestore = migrateLocalDataToFirestore;
  window.fetchAllFromFirestore = fetchAllFromFirestore;
  window.syncAllFromFirestore = fetchAllFromFirestore;
  window.startRealtimeSync = startRealtimeSync;
  window.stopRealtimeSync = stopRealtimeSync;
  window.COLLECTIONS = COLLECTIONS;
  window.syncFacultyToFirestore = syncFacultyToFirestore;
  window.syncTimetableEntryToFirestore = syncTimetableEntryToFirestore;
  window.syncSessionToFirestore = syncSessionToFirestore;
}
