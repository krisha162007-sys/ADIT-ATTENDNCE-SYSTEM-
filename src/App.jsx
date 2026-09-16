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
import { initializeStorage, resetToDefault, verifyAdminPin } from './services/attendanceStorage';
import { CheckCircle, ShieldCheck, Lock, X, KeyRound } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Security state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    initializeStorage();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
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
        return <ManageMaster showToast={showToast} />;
      default:
        return <Dashboard setActiveTab={handleTabChange} />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
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

        <main className="content-area">
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
