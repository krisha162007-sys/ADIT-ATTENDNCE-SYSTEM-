const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Central shared Cloud Firestore Database simulating Google Cloud Firestore project 'adit-attendance-system'
const cloudFirestoreDatabase = {
    adit_departments: new Map(),
    adit_faculties: new Map(),
    adit_classes: new Map(),
    adit_subjects: new Map(),
    adit_students: new Map(),
    adit_timetable_entries: new Map(),
    adit_sessions: new Map(),
    adit_exceptions: new Map(),
    adit_system: new Map()
};

function createMockFirebasePrimitives(cloudDb) {
    return {
        initializeApp: (cfg) => ({ name: '[DEFAULT]', options: cfg }),
        getApps: () => [{ name: '[DEFAULT]' }],
        getApp: () => ({ name: '[DEFAULT]' }),
        getFirestore: () => ({ type: 'firestore', projectId: 'adit-attendance-system' }),
        getAuth: () => ({ currentUser: { uid: 'user_test' } }),
        collection: (db, collName) => ({ type: 'collection', collName }),
        doc: (db, collName, docId) => ({ type: 'doc', collName, docId: String(docId).trim() }),
        setDoc: async (docRef, data, options) => {
            const coll = docRef.collName;
            const id = docRef.docId;
            if (!cloudDb[coll]) cloudDb[coll] = new Map();
            if (options && options.merge) {
                const prev = cloudDb[coll].get(id) || {};
                cloudDb[coll].set(id, { ...prev, ...data });
            } else {
                cloudDb[coll].set(id, JSON.parse(JSON.stringify(data)));
            }
            return true;
        },
        getDocs: async (collRef) => {
            const coll = collRef.collName;
            if (!cloudDb[coll]) cloudDb[coll] = new Map();
            const docs = [];
            for (const [id, val] of cloudDb[coll].entries()) {
                docs.push({
                    id: id,
                    data: () => JSON.parse(JSON.stringify(val))
                });
            }
            return {
                empty: docs.length === 0,
                size: docs.length,
                docs: docs,
                forEach: (cb) => docs.forEach(cb)
            };
        },
        deleteDoc: async (docRef) => {
            const coll = docRef.collName;
            const id = docRef.docId;
            if (cloudDb[coll]) cloudDb[coll].delete(id);
            return true;
        },
        serverTimestamp: () => new Date().toISOString()
    };
}

function createDeviceContext(deviceName, cloudDb) {
    const localStorageMap = new Map();
    const localStorage = {
        getItem: (k) => (localStorageMap.has(k) ? localStorageMap.get(k) : null),
        setItem: (k, v) => localStorageMap.set(k, String(v)),
        removeItem: (k) => localStorageMap.delete(k),
        clear: () => localStorageMap.clear()
    };

    const mockPrimitives = createMockFirebasePrimitives(cloudDb);

    const sandbox = {
        window: {
            localStorage: localStorage,
            location: { href: 'https://adit-attendnce-system.vercel.app' },
            Firebase: mockPrimitives,
            dispatchEvent: () => true,
            addEventListener: () => {}
        },
        localStorage: localStorage,
        console: {
            log: (...args) => {},
            error: (...args) => console.error(`[${deviceName} ERROR]`, ...args),
            warn: (...args) => {},
            info: (...args) => {}
        },
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        CustomEvent: class CustomEvent { constructor(type, params) { this.type = type; this.detail = params ? params.detail : null; } },
        Event: class Event { constructor(type) { this.type = type; } },
        document: {
            addEventListener: () => {},
            getElementById: () => null,
            createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }),
            head: { appendChild: () => {} }
        },
        navigator: { userAgent: 'NodeTest/' + deviceName },
        XLSX: {
            utils: {
                book_new: () => ({}),
                aoa_to_sheet: () => ({}),
                book_append_sheet: () => {}
            },
            writeFile: () => {}
        }
    };

    sandbox.window.window = sandbox.window;
    sandbox.window.document = sandbox.document;
    sandbox.window.setTimeout = setTimeout;
    sandbox.window.clearTimeout = clearTimeout;

    const ctx = vm.createContext(sandbox);

    // Load app-bundle.js into context
    const bundlePath = path.join(__dirname, 'app-bundle.js');
    const bundleCode = fs.readFileSync(bundlePath, 'utf8');
    vm.runInContext(bundleCode, ctx);

    return { ctx, localStorage, deviceName };
}

async function runTest() {
    console.log("=== ADIT FIREBASE CROSS-DEVICE SYNCHRONIZATION TEST ===");

    // Setup Device A (Admin on Laptop) and Device B (Faculty on Mobile)
    const deviceA = createDeviceContext("Device-A-AdminLaptop", cloudFirestoreDatabase);
    const deviceB = createDeviceContext("Device-B-FacultyMobile", cloudFirestoreDatabase);

    console.log("1. Initializing Devices A and B...");
    console.log("   Device A storage: Local isolated");
    console.log("   Device B storage: Local isolated");
    console.log("   Shared Backing Store: Google Cloud Firestore ('adit-attendance-system')");

    // Step 1: Device A (Admin) creates a new Faculty Member
    console.log("\n2. Device A (Admin) registers faculty Dr. Rajesh Patel...");
    const newFaculty = {
        id: 'FAC_RPATEL',
        name: 'Dr. Rajesh Patel',
        shortName: 'RP',
        email: 'rajesh.patel@adit.ac.in',
        phone: '9876543210',
        departments: ['DEP_IT'],
        primaryDepartment: 'DEP_IT',
        designation: 'Associate Professor',
        active: true
    };

    await vm.runInContext(`
        (async () => {
            window.saveFaculty(${JSON.stringify(newFaculty)});
            if (window.syncFacultyToFirestore) {
                await window.syncFacultyToFirestore(${JSON.stringify(newFaculty)});
            }
        })()
    `, deviceA.ctx);

    // Verify Device A has the faculty in its storage
    const facultyListA = JSON.parse(deviceA.localStorage.getItem('adit_attendance_faculties') || '[]');
    const foundA = facultyListA.find(f => f.id === 'FAC_RPATEL');
    if (!foundA) throw new Error("Faculty not found on Device A localStorage!");
    console.log("   ✓ Faculty saved on Device A with canonical ID: " + foundA.id);

    // Verify it was pushed to Cloud Firestore
    const cloudFac = cloudFirestoreDatabase.adit_faculties.get('FAC_RPATEL');
    if (!cloudFac) throw new Error("Faculty was not persisted to Cloud Firestore!");
    console.log("   ✓ Faculty synchronized to Cloud Firestore collection 'adit_faculties': " + cloudFac.name);

    // Step 2: Device B (Faculty on phone) syncs from Cloud Firestore
    console.log("\n3. Device B pulls updates from Cloud Firestore...");
    await vm.runInContext(`
        (async () => {
            if (window.syncAllFromFirestore) {
                return await window.syncAllFromFirestore();
            }
        })()
    `, deviceB.ctx);

    const facultyListB = JSON.parse(deviceB.localStorage.getItem('adit_attendance_faculties') || '[]');
    const foundB = facultyListB.find(f => f.id === 'FAC_RPATEL');
    if (!foundB) throw new Error("Faculty failed to synchronize to Device B!");
    if (foundB.id !== foundA.id) throw new Error(`Faculty ID mismatch! Device A: ${foundA.id}, Device B: ${foundB.id}`);
    console.log("   ✓ Verified: Device B received identical faculty ID: " + foundB.id);
    console.log("   ✓ Faculty Name on Device B: " + foundB.name);

    // Step 3: Device A assigns a 2-Hour Laboratory Timetable entry to Dr. Rajesh Patel
    console.log("\n4. Device A assigns a 2-Hour Laboratory Timetable entry to Dr. Rajesh Patel...");
    const labEntry = {
        id: 'tte_lab_it_batch_b',
        facultyId: 'FAC_RPATEL',
        facultyName: 'Dr. Rajesh Patel',
        departmentId: 'DEP_IT',
        dept: 'Information Technology',
        subjectId: 'SUB_DBMS_LAB',
        subjectName: 'DBMS Lab',
        semId: '3rd Sem',
        divId: 'Div 1',
        batch: 'Batch B',
        room: 'Lab 102',
        type: 'Lab / Practical',
        day: 'Monday',
        timeSlot: '09:00 - 10:45',
        duration: '2 Hours',
        span: 2,
        isMultiSlot: true
    };

    await vm.runInContext(`
        (async () => {
            window.saveTimetableEntry(${JSON.stringify(labEntry)});
            if (window.syncTimetableEntryToFirestore) {
                await window.syncTimetableEntryToFirestore(${JSON.stringify(labEntry)});
            }
        })()
    `, deviceA.ctx);

    // Step 4: Device B pulls timetable entries from Cloud Firestore
    console.log("\n5. Device B syncs timetable entries from Cloud Firestore...");
    await vm.runInContext(`
        (async () => {
            if (window.syncAllFromFirestore) {
                return await window.syncAllFromFirestore();
            }
        })()
    `, deviceB.ctx);

    const timetableEntriesB = JSON.parse(deviceB.localStorage.getItem('adit_timetable_entries') || '[]');
    const foundEntryB = timetableEntriesB.find(e => e.id === 'tte_lab_it_batch_b');
    if (!foundEntryB) throw new Error("Timetable entry failed to synchronize to Device B!");
    if (foundEntryB.facultyId !== 'FAC_RPATEL') throw new Error("Timetable entry facultyId mismatch on Device B!");
    console.log("   ✓ Verified: Timetable entry synced to Device B with facultyId: " + foundEntryB.facultyId);
    console.log("   ✓ Subject: " + foundEntryB.subjectName + " | Batch: " + foundEntryB.batch + " | Room: " + foundEntryB.room);

    // Step 5: Device B (Faculty) takes attendance for this Lab Session
    console.log("\n6. Device B (Dr. Rajesh Patel on Mobile) takes attendance for Batch B...");
    const sessionRecord = {
        id: 'session_2026_10_29_dbms_b',
        date: '2026-10-29',
        facultyId: 'FAC_RPATEL',
        facultyName: 'Dr. Rajesh Patel',
        departmentId: 'DEP_IT',
        dept: 'Information Technology',
        semId: '3rd Sem',
        divId: 'Div 1',
        batch: 'Batch B',
        subjectId: 'SUB_DBMS_LAB',
        subjectName: 'DBMS Lab',
        type: 'Lab / Practical',
        totalStudents: 22,
        presentCount: 20,
        absentCount: 2,
        records: [
            { studentId: '202401IT001', rollNo: '1', name: 'Aarav Shah', status: 'Present', batch: 'Batch B' },
            { studentId: '202401IT002', rollNo: '2', name: 'Bhavik Patel', status: 'Absent', batch: 'Batch B' }
        ]
    };

    const adminUser = {
        id: 'admin_1',
        role: 'admin',
        name: 'ADIT Administrator'
    };

    await vm.runInContext(`
        (async () => {
            window.saveSession(${JSON.stringify(sessionRecord)}, ${JSON.stringify(adminUser)});
            if (window.syncSessionToFirestore) {
                await window.syncSessionToFirestore(${JSON.stringify(sessionRecord)});
            }
        })()
    `, deviceB.ctx);

    // Step 6: Device A (Admin on Laptop) pulls attendance sessions from Cloud Firestore
    console.log("\n7. Device A (Admin) pulls latest sessions from Cloud Firestore...");
    await vm.runInContext(`
        (async () => {
            if (window.syncAllFromFirestore) {
                return await window.syncAllFromFirestore();
            }
        })()
    `, deviceA.ctx);

    const sessionsA = JSON.parse(deviceA.localStorage.getItem('adit_attendance_sessions') || '[]');
    const foundSessionA = sessionsA.find(s => s.id === 'session_2026_10_29_dbms_b');
    if (!foundSessionA) throw new Error("Attendance session failed to sync back to Admin Device A!");
    if (foundSessionA.facultyId !== 'FAC_RPATEL') throw new Error("Attendance session facultyId mismatch on Device A!");
    if (foundSessionA.presentCount !== 20 || foundSessionA.absentCount !== 2) throw new Error("Attendance counts mismatch on Device A!");
    console.log("   ✓ Verified: Attendance session synced back to Admin Device A!");
    console.log("   ✓ Faculty ID: " + foundSessionA.facultyId + " | Present: " + foundSessionA.presentCount + " | Absent: " + foundSessionA.absentCount);

    // Step 7: Check Firestore Security Rules
    console.log("\n8. Checking firestore.rules...");
    const rulesPath = path.join(__dirname, 'firestore.rules');
    if (!fs.existsSync(rulesPath)) throw new Error("firestore.rules does not exist!");
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    if (!rulesContent.includes('adit_faculties') || !rulesContent.includes('adit_sessions')) {
        throw new Error("firestore.rules missing expected collections!");
    }
    console.log("   ✓ firestore.rules verified with role-based collection permissions.");

    console.log("\n==================================================================");
    console.log("ALL STEP 7 MULTI-DEVICE FIRESTORE SYNC TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================================");
}

runTest().catch(err => {
    console.error("TEST FAILED:", err);
    process.exit(1);
});
