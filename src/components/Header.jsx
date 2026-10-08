import React from 'react';
import { Calendar, Search, ShieldCheck, UserCheck, Lock, User } from 'lucide-react';
import { getFacultyName } from '../services/attendanceStorage';

export default function Header({ searchQuery, setSearchQuery, activeTab, isUnlocked, onLockToggle }) {
  const facultyName = getFacultyName();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const getTabTitle = () => {
    switch (activeTab) {
      case 'faculty': return 'Faculty Attendance Portal';
      case 'dashboard': return 'Dashboard & Overview';
      case 'enter': return 'Enter Attendance Session';
      case 'list': return 'View, Edit & Delete Attendance';
      case 'dateView': return 'Date-wise Attendance Log';
      case 'topicView': return 'Syllabus & Topic Log';
      case 'analytics': return 'Attendance Analytics & Averages';
      case 'print': return 'Print & Export Attendance Reports';
      case 'manage': return 'Manage Students & Master Subjects';
      default: return 'Attendance Management System';
    }
  };

  return (
    <header className="app-header no-print">
      <div className="header-brand">
        <div className="brand-icon-box">
          <UserCheck size={26} />
        </div>
        <div className="brand-text">
          <h1>ADIT Attendance</h1>
          <span>ADIT College of Engineering</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--navy-dark)', fontWeight: '700' }}>
          {getTabTitle()}
        </h2>
      </div>

      <div className="header-right">
        {['list', 'topicView', 'analytics'].includes(activeTab) && (
          <div className="input-with-icon">
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="form-control"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '220px', height: '38px' }}
            />
          </div>
        )}

        <button 
          className="btn btn-secondary btn-sm"
          onClick={onLockToggle}
          style={{
            borderColor: isUnlocked ? 'var(--status-present-border)' : 'var(--border-color)',
            backgroundColor: isUnlocked ? 'var(--status-present-bg)' : 'white',
            color: isUnlocked ? 'var(--status-present)' : 'var(--text-muted)'
          }}
          title={isUnlocked ? "Admin Unlocked - Click to Lock" : "Click to Enter Admin Security PIN"}
        >
          {isUnlocked ? <ShieldCheck size={16} /> : <Lock size={16} />}
          <span>{isUnlocked ? 'Admin Unlocked' : 'Protected Mode'}</span>
        </button>

        {/* Faculty Name Badge */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, var(--navy-primary) 0%, var(--blue-primary) 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: '700',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
          }}
        >
          <User size={15} />
          <span>{facultyName}</span>
        </div>

        <div className="date-badge">
          <Calendar size={15} />
          <span>{todayFormatted}</span>
        </div>
      </div>
    </header>
  );
}
