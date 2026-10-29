// src/services/firebase.js
// Centralized Reusable Firebase & Cloud Database Engine
// Project ID: adit-attendance-system
// Realtime Database URL: https://adit-attendance-system-default-rtdb.asia-southeast1.firebasedatabase.app

// Modular SDK imports (used by Vite in production/bundler builds)
import * as firebaseApp from 'firebase/app';
import * as firebaseFirestore from 'firebase/firestore';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseDatabase from 'firebase/database';

/**
 * Global bridge resolving Firebase primitives across both
 * Vite module bundler and app-bundle.js runtime environment.
 */
const getFirebasePrimitives = () => {
  if (typeof window !== 'undefined' && window.Firebase) {
    return window.Firebase;
  }
  return {
    initializeApp: firebaseApp.initializeApp,
    getApps: firebaseApp.getApps,
    getApp: firebaseApp.getApp,
    getFirestore: firebaseFirestore.getFirestore,
    collection: firebaseFirestore.collection,
    doc: firebaseFirestore.doc,
    getDoc: firebaseFirestore.getDoc,
    getDocs: firebaseFirestore.getDocs,
    setDoc: firebaseFirestore.setDoc,
    updateDoc: firebaseFirestore.updateDoc,
    deleteDoc: firebaseFirestore.deleteDoc,
    query: firebaseFirestore.query,
    where: firebaseFirestore.where,
    orderBy: firebaseFirestore.orderBy,
    onSnapshot: firebaseFirestore.onSnapshot,
    serverTimestamp: firebaseFirestore.serverTimestamp,
    writeBatch: firebaseFirestore.writeBatch,
    getAuth: firebaseAuth.getAuth,
    signInWithEmailAndPassword: firebaseAuth.signInWithEmailAndPassword,
    signOut: firebaseAuth.signOut,
    onAuthStateChanged: firebaseAuth.onAuthStateChanged,
    createUserWithEmailAndPassword: firebaseAuth.createUserWithEmailAndPassword,
    getDatabase: firebaseDatabase.getDatabase,
    ref: firebaseDatabase.ref,
    set: firebaseDatabase.set,
    get: firebaseDatabase.get,
    child: firebaseDatabase.child,
    update: firebaseDatabase.update,
    remove: firebaseDatabase.remove,
    onValue: firebaseDatabase.onValue,
    off: firebaseDatabase.off,
    push: firebaseDatabase.push,
    rtdbServerTimestamp: firebaseDatabase.serverTimestamp,
    goOnline: firebaseDatabase.goOnline,
    goOffline: firebaseDatabase.goOffline
  };
};

/**
 * Project ID and Default Configuration for Firebase Project: adit-attendance-system
 */
export const FIREBASE_PROJECT_ID = 'adit-attendance-system';
export const DEFAULT_DATABASE_URL = 'https://adit-attendance-system-default-rtdb.asia-southeast1.firebasedatabase.app';

const getEnvVar = (key) => {
  try {
    if (typeof window !== 'undefined' && window.__ADIT_ENV && window.__ADIT_ENV[key]) {
      return window.__ADIT_ENV[key];
    }
    const metaEnv = typeof Function !== 'undefined' ? new Function("try { return import.meta.env; } catch(e) { return null; }")() : null;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch (e) {}
  return '';
};

export const getFirebaseConfig = () => {
  const apiKey = getEnvVar('VITE_FIREBASE_API_KEY') || (typeof window !== 'undefined' && window.__ADIT_FIREBASE_API_KEY) || '';
  const authDomain = getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || `${FIREBASE_PROJECT_ID}.firebaseapp.com`;
  const projectId = getEnvVar('VITE_FIREBASE_PROJECT_ID') || FIREBASE_PROJECT_ID;
  const storageBucket = getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || `${FIREBASE_PROJECT_ID}.appspot.com`;
  const messagingSenderId = getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || '';
  const appId = getEnvVar('VITE_FIREBASE_APP_ID') || '';
  const databaseURL = getEnvVar('VITE_FIREBASE_DATABASE_URL') || (typeof window !== 'undefined' && window.__ADIT_FIREBASE_DATABASE_URL) || DEFAULT_DATABASE_URL;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    databaseURL
  };
};

// Singleton references
let appInstance = null;
let firestoreDb = null;
let realtimeDb = null;
let authInstance = null;

/**
 * Initializes and returns the Firebase app singleton.
 * Guaranteed never to initialize repeatedly.
 */
export const initFirebase = (customConfig = null) => {
  const f = getFirebasePrimitives();
  if (!f || !f.initializeApp) {
    console.warn('[Firebase] Firebase SDK primitives not loaded.');
    return null;
  }

  const existingApps = typeof f.getApps === 'function' ? f.getApps() : [];
  if (existingApps && existingApps.length > 0) {
    appInstance = existingApps[0];
  } else {
    const config = customConfig || getFirebaseConfig();
    try {
      appInstance = f.initializeApp(config);
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        appInstance = f.getApp ? f.getApp() : existingApps[0];
      } else {
        console.warn('[Firebase] Initialization notice:', err.message);
      }
    }
  }

  // Initialize Realtime Database
  if (appInstance && !realtimeDb && typeof f.getDatabase === 'function') {
    try {
      const dbUrl = (customConfig && customConfig.databaseURL) || getFirebaseConfig().databaseURL || DEFAULT_DATABASE_URL;
      realtimeDb = f.getDatabase(appInstance, dbUrl);
    } catch (err) {
      console.warn('[Firebase] Realtime Database init notice:', err.message);
    }
  }

  // Initialize Firestore
  if (appInstance && !firestoreDb && typeof f.getFirestore === 'function') {
    try {
      firestoreDb = f.getFirestore(appInstance);
    } catch (err) {
      console.warn('[Firebase] Firestore init notice:', err.message);
    }
  }

  // Initialize Auth
  if (appInstance && !authInstance && typeof f.getAuth === 'function') {
    try {
      authInstance = f.getAuth(appInstance);
    } catch (err) {
      console.warn('[Firebase] Auth init notice:', err.message);
    }
  }

  return appInstance;
};

export const getFirebaseApp = () => appInstance || initFirebase();

export const getRealtimeDatabase = () => {
  if (!realtimeDb) initFirebase();
  return realtimeDb;
};

export const getFirestoreDb = () => {
  if (!firestoreDb) initFirebase();
  return firestoreDb;
};

export const getFirebaseAuth = () => {
  if (!authInstance) initFirebase();
  return authInstance;
};

export const isFirebaseConfigured = () => {
  const cfg = getFirebaseConfig();
  return Boolean(cfg.databaseURL || (cfg.apiKey && cfg.projectId));
};

// Global browser window bindings
if (typeof window !== 'undefined') {
  window.initFirebase = initFirebase;
  window.getFirebaseApp = getFirebaseApp;
  window.getRealtimeDatabase = getRealtimeDatabase;
  window.getFirestoreDb = getFirestoreDb;
  window.getFirebaseAuth = getFirebaseAuth;
  window.isFirebaseConfigured = isFirebaseConfigured;
  window.FIREBASE_PROJECT_ID = FIREBASE_PROJECT_ID;
  window.DEFAULT_DATABASE_URL = DEFAULT_DATABASE_URL;
}
