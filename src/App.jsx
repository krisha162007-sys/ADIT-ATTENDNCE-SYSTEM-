import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EnterAttendance from './components/EnterAttendance';
import AttendanceList from './components/AttendanceList';
import DateView from './components/DateView';
import TopicView from './components/TopicView';
import AnalyticsView from './components/AnalyticsView';
import PrintView from './components/PrintView';
import ManageMaster from './components/ManageMaster';
import AdminPanel from './components/AdminPanel';
import FacultyPanel from './components/FacultyPanel';
import StudentPanel from './components/StudentPanel';
import LoginView from './components/LoginView';
import { 
  initializeStorage, 
  resetToDefault, 
  verifyAdminPin,
  getCurrentUser,
  logoutUser,
  setCurrentUser as persistCurrentUser
} from './services/attendanceStorage';
import { CheckCircle, ShieldCheck, Lock, X, KeyRound, LogOut, ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUserSession] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState('manage');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Security PIN modal state for administrative overrides
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    initializeStorage();
    if (typeof initCloudSync === 'function') {
      initCloudSync();
    }
    // Initialize Firebase Realtime Database & Multi-Device Synchronization
    if (typeof initFirebase === 'function') {
      try {
        initFirebase();
        if (typeof startRealtimeDatabaseSync === 'function') {
          startRealtimeDatabaseSync();
        }
        if (typeof startRealtimeSync === 'function') {
          startRealtimeSync();
        }
        if (typeof migrateLocalDataToRtdb === 'function') {
          migrateLocalDataToRtdb().catch(e => console.warn('[RTDB] Startup sync notice:', e));
        }
        if (typeof migrateLocalDataToFirestore === 'function') {
          migrateLocalDataToFirestore().catch(e => console.warn('[Firestore] Sync notice:', e));
        }
      } catch (err) {
        console.warn('[Firebase] Initialization notice:', err);
      }
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleLoginSuccess = (role, user) => {
    setCurrentUserSession(user);
    if (role === 'admin') {
      setActiveTab('manage');
      setIsAdminUnlocked(true);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUserSession(null);
    setIsAdminUnlocked(false);
    showToast('Logged out of session.');
  };

  const requestAdminAccess = (onSuccessAction) => {
    if (isAdminUnlocked) {
      onSuccessAction();
    } else {
      setPendingAction(() => onSuccessAction);
      setShowPinModal(true);
      setPinError('');
      setPinInput('');
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setIsAdminUnlocked(true);
      setShowPinModal(false);
      showToast('Admin Security Authorized!');
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      setPinError('Incorrect Admin Security PIN! Default PIN is 1234');
    }
  };

  const handleResetData = () => {
    requestAdminAccess(() => {
      resetToDefault();
      showToast('Database reset to default sample records.');
      setActiveTab('dashboard');
    });
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'manage') {
      requestAdminAccess(() => setActiveTab(tabId));
    } else {
      setActiveTab(tabId);
    }
  };

  // -------------------------------------------------------------
  // CONDITIONAL ROUTING BASED ON AUTHENTICATION & ROLE
  // -------------------------------------------------------------

  // 1. Not Authenticated -> Show Login View
  if (!currentUser) {
    return (
      <>
        <LoginView onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        {toastMessage && (
          <div className="toast-notification">
            <CheckCircle size={18} style={{ color: '#34d399' }} />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // 2. Faculty User -> Render Dedicated Faculty Panel (Restricted from Admin Panel)
  if (currentUser.role === 'faculty') {
    return (
      <>
        <FacultyPanel 
          currentUser={currentUser} 
          showToast={showToast} 
          onExit={handleLogout} 
        />
        {toastMessage && (
          <div className="toast-notification">
            <CheckCircle size={18} style={{ color: '#34d399' }} />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // 3. Student User -> Render Dedicated Student Panel (Restricted from Faculty & Admin Panels)
  if (currentUser.role === 'student') {
    return (
      <>
        <StudentPanel 
          currentUser={currentUser} 
          showToast={showToast} 
          onExit={handleLogout} 
        />
        {toastMessage && (
          <div className="toast-notification">
            <CheckCircle size={18} style={{ color: '#34d399' }} />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // 4. Admin User -> Render Admin Panel or Portal View
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={handleTabChange} />;
      case 'enter':
        return <EnterAttendance onSaved={() => setActiveTab('list')} showToast={showToast} />;
      case 'list':
        return <AttendanceList searchQuery={searchQuery} showToast={showToast} requestAdminAccess={requestAdminAccess} />;
      case 'dateView':
        return <DateView />;
      case 'topicView':
        return <TopicView searchQuery={searchQuery} />;
      case 'analytics':
        return <AnalyticsView searchQuery={searchQuery} />;
      case 'print':
        return <PrintView showToast={showToast} />;
      case 'manage':
        return <AdminPanel showToast={showToast} onExit={handleLogout} />;
      default:
        return <AdminPanel showToast={showToast} onExit={handleLogout} />;
    }
  };

  return (
    <div className={`app-container ${activeTab === 'manage' ? 'in-admin-mode' : ''}`}>
      {/* Navigation Sidebar (hidden when inside dedicated Admin Panel) */}
      {activeTab !== 'manage' && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          onResetData={handleResetData}
        />
      )}

      {/* Main Content Area */}
      <div className="main-wrapper" style={activeTab === 'manage' ? { width: '100%', maxWidth: '100%' } : {}}>
        {activeTab !== 'manage' && (
          <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            activeTab={activeTab} 
            isUnlocked={isAdminUnlocked}
            onLockToggle={() => {
              if (isAdminUnlocked) {
                setIsAdminUnlocked(false);
                showToast('Admin mode locked.');
              } else {
                requestAdminAccess(() => {});
              }
            }}
          />
        )}

        <main className={activeTab === 'manage' ? 'content-area-admin' : 'content-area'}>
          {renderActiveView()}
        </main>
      </div>

      {/* Security PIN Authorization Modal */}
      {showPinModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-primary)' }}>
                <KeyRound size={20} />
                Admin Security PIN Required
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPinModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePinSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Please enter the Admin Security PIN to access sensitive management features.
                </p>

                <div className="form-group">
                  <label>Security PIN Code (Default: 1234)</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter 4-digit PIN..."
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {pinError && (
                  <div style={{ color: '#e11d48', fontSize: '12px', marginTop: '8px', fontWeight: '700' }}>
                    {pinError}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPinModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <ShieldCheck size={16} /> Unlock Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle size={18} style={{ color: '#34d399' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
