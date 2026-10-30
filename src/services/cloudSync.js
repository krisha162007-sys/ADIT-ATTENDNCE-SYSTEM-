// src/services/cloudSync.js
// Centralized Cloud Persistence and Cross-Device Synchronization Engine
// Ensures changes made on Admin or Faculty panel sync across laptops, phones, and browsers.

export const SYSTEM_STORAGE_KEYS = [
  'adit_attendance_departments',
  'adit_attendance_faculties',
  'adit_attendance_classes',
  'adit_attendance_subjects',
  'adit_attendance_students',
  'adit_attendance_sessions',
  'adit_attendance_exceptions',
  'adit_attendance_elective_groups',
  'adit_attendance_elective_assignments',
  'adit_attendance_allocations',
  'adit_attendance_promotion_history',
  'adit_attendance_security',
  'adit_attendance_college_name',
  'adit_timetable_entries',
  'adit_timetable_data',
  'adit_timetable_file_info',
  'adit_timetable_settings'
];

export const CLOUD_SYNC_CONFIG_KEY = 'adit_cloud_sync_config';

/**
 * Returns the current cloud synchronization configuration.
 */
export const getCloudSyncConfig = () => {
  if (typeof localStorage === 'undefined') {
    return { enabled: true, syncUrl: 'https://adit-attendance-system-default-rtdb.asia-southeast1.firebasedatabase.app', autoSync: true, lastSyncTime: null, lastStatus: 'idle' };
  }
  try {
    const raw = localStorage.getItem(CLOUD_SYNC_CONFIG_KEY);
    if (!raw) {
      return {
        enabled: false,
        syncUrl: '',
        autoSync: true,
        lastSyncTime: null,
        lastStatus: 'idle',
        lastMessage: ''
      };
    }
    return JSON.parse(raw);
  } catch (err) {
    return { enabled: true, syncUrl: 'https://adit-attendance-system-default-rtdb.asia-southeast1.firebasedatabase.app', autoSync: true, lastSyncTime: null, lastStatus: 'idle' };
  }
};

/**
 * Saves cloud synchronization settings.
 */
export const saveCloudSyncConfig = (config) => {
  if (typeof localStorage === 'undefined') return config;
  const current = getCloudSyncConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(CLOUD_SYNC_CONFIG_KEY, JSON.stringify(updated));
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('adit-cloud-sync-status', { detail: updated }));
  }
  return updated;
};

/**
 * Exports complete institutional state as a structured snapshot object.
 */
export const exportSystemSnapshot = () => {
  if (typeof localStorage === 'undefined') return { error: 'No localStorage available' };

  const snapshotData = {};
  SYSTEM_STORAGE_KEYS.forEach(key => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        snapshotData[key] = JSON.parse(raw);
      } catch (e) {
        snapshotData[key] = raw;
      }
    }
  });

  return {
    appName: 'ADIT_ATTENDANCE_SYSTEM',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    timestamp: Date.now(),
    keysCount: Object.keys(snapshotData).length,
    data: snapshotData
  };
};

/**
 * Imports a structured snapshot object into localStorage and dispatches refresh events.
 */
export const importSystemSnapshot = (snapshot) => {
  if (!snapshot || typeof snapshot !== 'object') {
    return { success: false, error: 'Invalid snapshot data: root must be an object' };
  }

  // Support direct object or wrapped { data: { ... } }
  const payload = snapshot.data && typeof snapshot.data === 'object' ? snapshot.data : snapshot;

  let restoredCount = 0;
  Object.keys(payload).forEach(key => {
    // Only import valid recognized system keys or adit_ prefixed keys
    if (key.startsWith('adit_') || SYSTEM_STORAGE_KEYS.includes(key)) {
      const val = payload[key];
      if (val !== undefined && val !== null) {
        let finalVal = val;
        if (key === 'adit_attendance_faculties') {
          try {
            const parsed = typeof val === 'string' ? JSON.parse(val) : val;
            const dedupFn = (typeof window !== 'undefined' && window.deduplicateFaculties) ? window.deduplicateFaculties : null;
            if (dedupFn && Array.isArray(parsed)) {
              finalVal = dedupFn(parsed);
            }
          } catch (e) {}
        }
        const strVal = typeof finalVal === 'string' ? finalVal : JSON.stringify(finalVal);
        localStorage.setItem(key, strVal);
        restoredCount++;
      }
    }
  });

  // Mark institutional seed version as active
  localStorage.setItem('adit_seed_v3_institutional', 'true');

  // Trigger global reactive updates
  notifySystemDataUpdated();

  return {
    success: true,
    restoredCount,
    timestamp: snapshot.timestamp || Date.now()
  };
};

/**
 * Generates and triggers download of a .json backup file.
 */
export const downloadSnapshotFile = (filename = null) => {
  const snapshot = exportSystemSnapshot();
  const jsonStr = JSON.stringify(snapshot, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const name = filename || `adit_attendance_backup_${dateStr}.json`;

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Compresses system snapshot into a portable base64 Sync Token string for instant copy/pasting.
 */
export const generateSyncToken = () => {
  const snapshot = exportSystemSnapshot();
  const jsonStr = JSON.stringify(snapshot);
  try {
    // UTF-8 safe base64 encoding
    return btoa(encodeURIComponent(jsonStr));
  } catch (err) {
    return btoa(unescape(encodeURIComponent(jsonStr)));
  }
};

/**
 * Restores system state from a portable base64 Sync Token string.
 */
export const restoreFromSyncToken = (tokenStr) => {
  if (!tokenStr || typeof tokenStr !== 'string') {
    return { success: false, error: 'Empty or invalid sync token.' };
  }
  try {
    const cleanToken = tokenStr.trim();
    let jsonStr = '';
    try {
      jsonStr = decodeURIComponent(atob(cleanToken));
    } catch (e1) {
      jsonStr = decodeURIComponent(escape(atob(cleanToken)));
    }
    const snapshot = JSON.parse(jsonStr);
    return importSystemSnapshot(snapshot);
  } catch (err) {
    return { success: false, error: 'Failed to parse sync token: ' + (err.message || 'Corrupted token') };
  }
};

/**
 * Dispatches all update events so all components refresh automatically.
 */
export const notifySystemDataUpdated = () => {
  if (typeof window === 'undefined' || !window.dispatchEvent) return;
  window.dispatchEvent(new CustomEvent('adit-faculty-updated'));
  window.dispatchEvent(new CustomEvent('adit-timetable-synced'));
  window.dispatchEvent(new CustomEvent('adit-departments-updated'));
  window.dispatchEvent(new CustomEvent('adit-sessions-updated'));
  window.dispatchEvent(new CustomEvent('adit-exceptions-updated'));
  window.dispatchEvent(new CustomEvent('adit-data-synced'));
};

/**
 * Pushes the current local system snapshot to the cloud storage endpoint.
 */
export const pushToCloud = async (targetUrl = null) => {
  const config = getCloudSyncConfig();
  const endpoint = targetUrl || config.syncUrl;

  if (!endpoint) {
    return { success: false, error: 'No Cloud Database URL configured. Enter your Cloud URL in Settings.' };
  }

  saveCloudSyncConfig({ lastStatus: 'syncing', lastMessage: 'Uploading to cloud...' });

  try {
    const snapshot = exportSystemSnapshot();

    // Support Firebase Realtime Database (ends with .json) or standard REST API
    const cleanUrl = endpoint.trim();
    const finalUrl = (cleanUrl.includes('firebaseio.com') || cleanUrl.includes('firebasedatabase.app')) && !cleanUrl.endsWith('.json')
      ? `${cleanUrl.replace(/\/$/, '')}/adit_system_state.json`
      : cleanUrl;

    const res = await fetch(finalUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(snapshot)
    });

    if (!res.ok) {
      throw new Error(`Cloud server returned HTTP ${res.status} (${res.statusText})`);
    }

    const updatedConfig = saveCloudSyncConfig({
      lastStatus: 'success',
      lastSyncTime: new Date().toISOString(),
      lastMessage: `Successfully uploaded ${snapshot.keysCount} collections to cloud.`
    });

    return { success: true, timestamp: updatedConfig.lastSyncTime };
  } catch (err) {
    saveCloudSyncConfig({
      lastStatus: 'error',
      lastMessage: err.message || 'Network error during cloud upload.'
    });
    return { success: false, error: err.message };
  }
};

/**
 * Pulls the latest system state from the cloud and updates local storage.
 */
export const pullFromCloud = async (targetUrl = null, force = false) => {
  const config = getCloudSyncConfig();
  const endpoint = targetUrl || config.syncUrl;

  if (!endpoint) {
    return { success: false, error: 'No Cloud Database URL configured.' };
  }

  saveCloudSyncConfig({ lastStatus: 'syncing', lastMessage: 'Checking cloud for updates...' });

  try {
    const cleanUrl = endpoint.trim();
    const finalUrl = (cleanUrl.includes('firebaseio.com') || cleanUrl.includes('firebasedatabase.app')) && !cleanUrl.endsWith('.json')
      ? `${cleanUrl.replace(/\/$/, '')}/adit_system_state.json`
      : cleanUrl;

    const res = await fetch(finalUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Cloud server returned HTTP ${res.status}`);
    }

    const remoteData = await res.json();
    if (!remoteData || typeof remoteData !== 'object') {
      throw new Error('Empty or invalid data received from cloud.');
    }

    const localSnapshot = exportSystemSnapshot();
    const remoteTime = remoteData.timestamp || 0;
    const localTime = localSnapshot.timestamp || 0;

    // Only update if remote is newer or force flag is set
    if (force || remoteTime > localTime || !localStorage.getItem('adit_seed_v3_institutional')) {
      const result = importSystemSnapshot(remoteData);
      saveCloudSyncConfig({
        lastStatus: 'success',
        lastSyncTime: new Date().toISOString(),
        lastMessage: `Synchronized ${result.restoredCount} collections from cloud.`
      });
      return { success: true, updated: true, restoredCount: result.restoredCount };
    } else {
      saveCloudSyncConfig({
        lastStatus: 'success',
        lastSyncTime: new Date().toISOString(),
        lastMessage: 'Local database is already up to date.'
      });
      return { success: true, updated: false, message: 'Already up to date' };
    }
  } catch (err) {
    saveCloudSyncConfig({
      lastStatus: 'error',
      lastMessage: err.message || 'Failed to pull cloud updates.'
    });
    return { success: false, error: err.message };
  }
};

/**
 * Initializes automatic background synchronization on app load.
 */
export const initCloudSync = () => {
  if (typeof window === 'undefined') return;

  const config = getCloudSyncConfig();

  // If cloud URL is configured and autoSync is enabled, pull immediately
  if (config.enabled && config.syncUrl && config.autoSync) {
    pullFromCloud(config.syncUrl).catch(err => {
      console.warn('Initial cloud sync notice:', err.message);
    });
  }

  // Listen to browser storage events (syncs changes instantly between open tabs)
  window.addEventListener('storage', (e) => {
    if (e.key && (e.key.startsWith('adit_') || SYSTEM_STORAGE_KEYS.includes(e.key))) {
      notifySystemDataUpdated();
    }
  });
};

// Global browser window bindings
if (typeof window !== 'undefined') {
  window.exportSystemSnapshot = exportSystemSnapshot;
  window.importSystemSnapshot = importSystemSnapshot;
  window.downloadSnapshotFile = downloadSnapshotFile;
  window.generateSyncToken = generateSyncToken;
  window.restoreFromSyncToken = restoreFromSyncToken;
  window.pushToCloud = pushToCloud;
  window.pullFromCloud = pullFromCloud;
  window.getCloudSyncConfig = getCloudSyncConfig;
  window.saveCloudSyncConfig = saveCloudSyncConfig;
  window.initCloudSync = initCloudSync;
}
