import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  User,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  Lock,
  Shield,
  FileText,
  BarChart2,
  ArrowLeft,
  Mail,
  Phone,
  Key,
  Check,
  AlertCircle,
  Layers,
  ChevronRight
} from 'lucide-react';

import {
  getStudentProfile,
  updateStudentProfile,
  getStudentEnrolledSubjects,
  getStudentOverallAttendance,
  getSubjectAttendanceDetails,
  getCollegeName
} from '../services/attendanceStorage';

export default function StudentPanel({ currentUser, showToast, onExit }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'subjects' | 'subject-detail' | 'overview' | 'profile'
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  // Live data states
  const [profile, setProfile] = useState(() => getStudentProfile(currentUser));
  const [enrolledSubjects, setEnrolledSubjects] = useState(() => getStudentEnrolledSubjects(currentUser));
  const [overallStats, setOverallStats] = useState(() => getStudentOverallAttendance(currentUser));
  const [subjectDetailData, setSubjectDetailData] = useState(null);

  // Profile edit form state
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  const collegeName = getCollegeName ? getCollegeName() : 'A. D. Patel Institute of Technology';

  // Load latest data from storage
  const refreshAllData = () => {
    const prof = getStudentProfile(currentUser);
    const subs = getStudentEnrolledSubjects(currentUser);
    const overall = getStudentOverallAttendance(currentUser);

    setProfile(prof);
    setEnrolledSubjects(subs);
    setOverallStats(overall);

    if (prof) {
      setEditPhone(prof.phone || '');
      setEditEmail(prof.email || '');
    }

    if (selectedSubjectId) {
      const details = getSubjectAttendanceDetails(selectedSubjectId, currentUser);
      setSubjectDetailData(details);
    }
  };

  // Sync data on mount and whenever relevant storage events occur
  useEffect(() => {
    refreshAllData();

    const handleDataUpdate = () => {
      refreshAllData();
    };

    window.addEventListener('adit-sessions-updated', handleDataUpdate);
    window.addEventListener('adit-students-updated', handleDataUpdate);
    window.addEventListener('adit-classes-updated', handleDataUpdate);
    window.addEventListener('adit-exceptions-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('adit-sessions-updated', handleDataUpdate);
      window.removeEventListener('adit-students-updated', handleDataUpdate);
      window.removeEventListener('adit-classes-updated', handleDataUpdate);
      window.removeEventListener('adit-exceptions-updated', handleDataUpdate);
    };
  }, [selectedSubjectId]);

  // Handle drill-down into subject attendance
  const handleOpenSubjectDetail = (subId) => {
    setSelectedSubjectId(subId);
    const details = getSubjectAttendanceDetails(subId, currentUser);
    setSubjectDetailData(details);
    setActiveTab('subject-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle profile save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileSaving(true);

    try {
      const payload = {
        phone: editPhone,
        email: editEmail
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }

      const res = updateStudentProfile(payload, currentUser);
      setProfileSaving(false);

      if (res.success) {
        setProfileMsg({ type: 'success', text: 'Profile & contact details updated successfully!' });
        if (showToast) showToast('Profile updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        refreshAllData();
      }
    } catch (err) {
      setProfileSaving(false);
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  };

  // Low attendance warning subjects (< 75%)
  const lowAttendanceSubjects = useMemo(() => {
    return enrolledSubjects.filter(s => s.stats && s.stats.hasConductedLectures && s.stats.percentage < 75);
  }, [enrolledSubjects]);

  const studentName = profile?.name || currentUser?.name || 'Student';
  const enrollmentNo = profile?.enrollmentNo || currentUser?.enrollmentNo || '';
  const departmentName = profile?.department || currentUser?.dept || 'Engineering';
  const semesterStr = profile?.semester || currentUser?.sem || '3rd Sem';
  const divisionStr = profile?.division || currentUser?.class || 'Div 1';
  const batchStr = profile?.batch || currentUser?.batch || 'Batch A';
  const academicYear = profile?.academicYear || currentUser?.academicYear || '2026-27';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#0f172a'
    }}>
      {/* ============================================================== */}
      {/* 1. TOP HEADER / BRANDING BANNER                                */}
      {/* ============================================================== */}
      <header style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        color: '#ffffff',
        padding: '18px 24px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Logo & Portal Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
            }}>
              <GraduationCap size={26} color="#ffffff" />
            </div>
            <div>
              <div style={{
                fontSize: '19px',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.2
              }}>
                ADIT Student Attendance Portal
              </div>
              <div style={{
                fontSize: '12px',
                color: '#bfdbfe',
                fontWeight: '500',
                marginTop: '2px'
              }}>
                {collegeName} • Academic Year {academicYear}
              </div>
            </div>
          </div>

          {/* Student Identity Badge & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '14px'
              }}>
                {studentName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', lineHeight: 1.2 }}>
                  {studentName}
                </div>
                <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: '600' }}>
                  {enrollmentNo} • {semesterStr} {divisionStr}
                </div>
              </div>
            </div>

            <button
              onClick={onExit}
              title="Logout from session"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. NAVIGATION BAR                                              */}
      {/* ============================================================== */}
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
            { id: 'subjects', label: 'My Subjects', icon: BookOpen },
            { id: 'overview', label: 'Attendance Overview', icon: FileText },
            { id: 'profile', label: 'My Profile', icon: User }
          ].map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'subjects' && activeTab === 'subject-detail');
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'subjects') setSelectedSubjectId(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 18px',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive ? '#2563eb' : '#64748b',
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <IconComponent size={17} color={isActive ? '#2563eb' : '#64748b'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT CONTAINER                                      */}
      {/* ============================================================== */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 48px' }}>
        {/* ========================================================== */}
        {/* VIEW: DASHBOARD                                            */}
        {/* ========================================================== */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Student Welcome Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#93c5fd',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '10px'
                }}>
                  <GraduationCap size={14} />
                  <span>Student Portal • Active Enrolled</span>
                </div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                  margin: '0 0 8px',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  Welcome back, {studentName}
                </h2>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  fontSize: '13px',
                  color: '#cbd5e1',
                  fontWeight: '500'
                }}>
                  <span><strong>Enrollment:</strong> {enrollmentNo}</span>
                  <span>•</span>
                  <span><strong>Department:</strong> {departmentName}</span>
                  <span>•</span>
                  <span><strong>Class:</strong> {semesterStr} {divisionStr} ({batchStr})</span>
                </div>
              </div>

              {/* Threshold Quick Status */}
              <div style={{
                backgroundColor: overallStats?.meetsThreshold ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: overallStats?.meetsThreshold ? '1px solid #10b981' : '1px solid #ef4444',
                borderRadius: '14px',
                padding: '14px 20px',
                textAlign: 'center',
                minWidth: '180px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: overallStats?.meetsThreshold ? '#6ee7b7' : '#fca5a5',
                  marginBottom: '4px'
                }}>
                  Institutional Requirement
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  fontFamily: "'Outfit', sans-serif",
                  color: overallStats?.meetsThreshold ? '#34d399' : '#f87171'
                }}>
                  {overallStats?.percentageFormatted || 'N/A'}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: overallStats?.meetsThreshold ? '#a7f3d0' : '#fecaca',
                  marginTop: '2px'
                }}>
                  {overallStats?.hasConductedLectures 
                    ? (overallStats?.meetsThreshold ? '✓ Eligible (≥ 75%)' : '⚠ Shortage (< 75%)')
                    : 'No lectures yet'}
                </div>
              </div>
            </div>

            {/* Attendance Shortage Warning Banner (if any) */}
            {lowAttendanceSubjects.length > 0 && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px'
              }}>
                <AlertTriangle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: '#92400e' }}>
                    Attendance Shortage Warning (Below 75% Institutional Threshold)
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#78350f', lineHeight: 1.5 }}>
                    As per ADIT and University guidelines, a minimum of <strong>75% attendance</strong> is mandatory to remain eligible for end-semester examinations. You currently have low attendance in:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {lowAttendanceSubjects.map(sub => (
                      <span
                        key={sub.id}
                        onClick={() => handleOpenSubjectDetail(sub.id)}
                        style={{
                          backgroundColor: '#fef3c7',
                          border: '1px solid #f59e0b',
                          color: '#b45309',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {sub.name}: {sub.stats?.percentageFormatted} →
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Metric Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px'
            }}>
              {/* Card 1: Overall Percentage */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Overall Attendance</span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: overallStats?.meetsThreshold ? '#ecfdf5' : '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {overallStats?.meetsThreshold 
                      ? <CheckCircle size={20} color="#10b981" /> 
                      : <AlertTriangle size={20} color="#ef4444" />}
                  </div>
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: overallStats?.meetsThreshold ? '#059669' : '#dc2626',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {overallStats?.percentageFormatted || 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  {overallStats?.hasConductedLectures 
                    ? `Min required: 75.0%` 
                    : 'Awaiting first session'}
                </div>
              </div>

              {/* Card 2: Total Subjects */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Enrolled Subjects</span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={20} color="#2563eb" />
                  </div>
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#1e293b',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {enrolledSubjects.length}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  Regular &amp; Elective Courses
                </div>
              </div>

              {/* Card 3: Total Conducted */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Classes Conducted</span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={20} color="#475569" />
                  </div>
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#1e293b',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {overallStats?.totalConducted || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  Total sessions recorded
                </div>
              </div>

              {/* Card 4: Total Attended */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Classes Attended</span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle size={20} color="#059669" />
                  </div>
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#059669',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {overallStats?.totalAttended || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  {overallStats?.totalExceptions > 0 ? `Includes ${overallStats.totalExceptions} approved duty leave` : 'Present in session'}
                </div>
              </div>

              {/* Card 5: Classes Missed */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Classes Missed</span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <XCircle size={20} color="#dc2626" />
                  </div>
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#dc2626',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {overallStats?.totalMissed || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  Recorded absent
                </div>
              </div>
            </div>

            {/* Quick Enrolled Subjects Preview */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    margin: '0 0 4px',
                    fontFamily: "'Outfit', sans-serif"
                  }}>
                    Enrolled Courses &amp; Real-time Attendance
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Click any subject card to inspect lecture-by-lecture attendance records and topics covered.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('subjects')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    cursor: 'pointer'
                  }}
                >
                  <span>View All Subjects</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {enrolledSubjects.map(sub => {
                  const stats = sub.stats;
                  const pct = stats?.percentage;
                  const hasLectures = stats?.hasConductedLectures;
                  const isEligible = stats?.meetsThreshold;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleOpenSubjectDetail(sub.id)}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '18px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div>
                        {/* Tags */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{
                            backgroundColor: sub.isElective ? '#f3e8ff' : '#eff6ff',
                            color: sub.isElective ? '#7e22ce' : '#1d4ed8',
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase'
                          }}>
                            {sub.isElective ? 'Elective' : 'Regular'}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>
                            {sub.code}
                          </span>
                        </div>

                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '800',
                          color: '#0f172a',
                          margin: '0 0 6px',
                          lineHeight: 1.3
                        }}>
                          {sub.name}
                        </h4>

                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                          Faculty: <strong>{sub.facultyName}</strong>
                        </div>
                      </div>

                      {/* Attendance Meter */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                            {hasLectures ? `${stats.totalAttended} of ${stats.totalConducted} attended` : 'No sessions held yet'}
                          </span>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: '900',
                            color: hasLectures ? (isEligible ? '#059669' : '#dc2626') : '#64748b',
                            fontFamily: "'Outfit', sans-serif"
                          }}>
                            {hasLectures ? stats.percentageFormatted : 'No lectures conducted yet'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                          height: '8px',
                          width: '100%',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            height: '100%',
                            width: hasLectures ? `${Math.min(100, pct || 0)}%` : '0%',
                            backgroundColor: isEligible ? '#10b981' : '#ef4444',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#2563eb'
                        }}>
                          <span>View Lecture History</span>
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW: MY SUBJECTS                                          */}
        {/* ========================================================== */}
        {activeTab === 'subjects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  margin: '0 0 4px',
                  fontFamily: "'Outfit', sans-serif",
                  color: '#0f172a'
                }}>
                  My Enrolled Subjects ({enrolledSubjects.length})
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  All regular and elective courses assigned to your enrollment for {semesterStr}.
                </p>
              </div>
            </div>

            {/* Subjects Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '20px'
            }}>
              {enrolledSubjects.map(sub => {
                const stats = sub.stats;
                const hasLectures = stats?.hasConductedLectures;
                const isEligible = stats?.meetsThreshold;

                return (
                  <div
                    key={sub.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{
                          backgroundColor: sub.isElective ? '#f3e8ff' : '#eff6ff',
                          color: sub.isElective ? '#7e22ce' : '#1d4ed8',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          textTransform: 'uppercase'
                        }}>
                          {sub.isElective ? 'Elective Course' : 'Regular Course'}
                        </span>

                        <span style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#475569',
                          backgroundColor: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          Code: {sub.code}
                        </span>
                      </div>

                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: '#0f172a',
                        margin: '0 0 8px',
                        fontFamily: "'Outfit', sans-serif",
                        lineHeight: 1.3
                      }}>
                        {sub.name}
                      </h3>

                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                        <div>Assigned Faculty: <strong style={{ color: '#1e293b' }}>{sub.facultyName}</strong></div>
                        <div style={{ marginTop: '3px' }}>Class / Division: <strong>{sub.division}</strong></div>
                      </div>

                      {/* Metrics 3-Col Box */}
                      <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        textAlign: 'center',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Conducted</div>
                          <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                            {stats?.totalConducted || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669' }}>Attended</div>
                          <div style={{ fontSize: '17px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                            {stats?.totalAttended || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626' }}>Missed</div>
                          <div style={{ fontSize: '17px', fontWeight: '800', color: '#dc2626', marginTop: '2px' }}>
                            {stats?.totalMissed || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & CTA */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                          Attendance Percentage
                        </span>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '900',
                          color: hasLectures ? (isEligible ? '#059669' : '#dc2626') : '#64748b',
                          fontFamily: "'Outfit', sans-serif"
                        }}>
                          {hasLectures ? stats.percentageFormatted : 'No lectures conducted yet'}
                        </span>
                      </div>

                      {/* Bar */}
                      <div style={{
                        height: '10px',
                        width: '100%',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          height: '100%',
                          width: hasLectures ? `${Math.min(100, stats.percentage || 0)}%` : '0%',
                          backgroundColor: isEligible ? '#10b981' : '#ef4444',
                          borderRadius: '5px'
                        }} />
                      </div>

                      <button
                        onClick={() => handleOpenSubjectDetail(sub.id)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                      >
                        <FileText size={16} />
                        <span>View Lecture Records &amp; Topics</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW: SUBJECT-WISE ATTENDANCE DETAIL                       */}
        {/* ========================================================== */}
        {activeTab === 'subject-detail' && subjectDetailData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Back Button */}
            <div>
              <button
                onClick={() => {
                  setActiveTab('subjects');
                  setSelectedSubjectId(null);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#1e293b',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to My Subjects</span>
              </button>
            </div>

            {/* Subject Detail Header Card */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    backgroundColor: subjectDetailData.subject.isElective ? '#f3e8ff' : '#eff6ff',
                    color: subjectDetailData.subject.isElective ? '#7e22ce' : '#1d4ed8',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}>
                    {subjectDetailData.subject.isElective ? 'Elective Course' : 'Regular Course'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>
                    Subject Code: {subjectDetailData.subject.code}
                  </span>
                </div>

                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#0f172a',
                  margin: '0 0 8px',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {subjectDetailData.subject.name}
                </h2>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '14px',
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  <span>Faculty: <strong style={{ color: '#0f172a' }}>{subjectDetailData.subject.facultyName}</strong></span>
                  <span>•</span>
                  <span>Semester: <strong>{subjectDetailData.subject.semester}</strong></span>
                  <span>•</span>
                  <span>Division: <strong>{subjectDetailData.subject.division}</strong></span>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{
                backgroundColor: subjectDetailData.stats?.meetsThreshold ? '#ecfdf5' : '#fef2f2',
                border: subjectDetailData.stats?.meetsThreshold ? '1px solid #a7f3d0' : '1px solid #fecaca',
                borderRadius: '14px',
                padding: '16px 24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                  Course Attendance
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: subjectDetailData.stats?.meetsThreshold ? '#059669' : '#dc2626',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {subjectDetailData.stats?.percentageFormatted || 'N/A'}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: subjectDetailData.stats?.meetsThreshold ? '#047857' : '#b91c1c',
                  marginTop: '2px'
                }}>
                  {subjectDetailData.stats?.hasConductedLectures
                    ? (subjectDetailData.stats?.meetsThreshold ? 'Eligible for Exams' : 'Shortage Warning (< 75%)')
                    : 'No lectures conducted yet'}
                </div>
              </div>
            </div>

            {/* Attendance Statistics Pills */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Lectures Conducted</span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                  {subjectDetailData.stats?.totalConducted || 0}
                </div>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#059669' }}>Lectures Attended</span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                  {subjectDetailData.stats?.totalAttended || 0}
                </div>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626' }}>Lectures Missed</span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#dc2626', marginTop: '2px' }}>
                  {subjectDetailData.stats?.totalMissed || 0}
                </div>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed' }}>Approved Duty Leaves</span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>
                  {subjectDetailData.stats?.approvedExceptions || 0}
                </div>
              </div>
            </div>

            {/* Attendance Records Table */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#0f172a',
                  margin: '0 0 4px',
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  Lecture Attendance Records ({subjectDetailData.sessions.length})
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Official historical record of all attendance entries recorded by faculty.
                </p>
              </div>

              {subjectDetailData.sessions.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1'
                }}>
                  <Calendar size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', margin: '0 0 4px' }}>
                    No Lectures Conducted Yet
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Attendance sessions recorded by the faculty member for this course will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '13px'
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8fafc',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#475569'
                      }}>
                        <th style={{ padding: '12px 14px', fontWeight: '700' }}>#</th>
                        <th style={{ padding: '12px 14px', fontWeight: '700' }}>Date</th>
                        <th style={{ padding: '12px 14px', fontWeight: '700' }}>Time Slot</th>
                        <th style={{ padding: '12px 14px', fontWeight: '700' }}>Topic Covered</th>
                        <th style={{ padding: '12px 14px', fontWeight: '700' }}>Status</th>
                        <th style={{ padding: '12px 14px', fontWeight: '700' }}>Faculty / Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectDetailData.sessions.map((sess, idx) => {
                        let badgeBg = '#f1f5f9';
                        let badgeColor = '#475569';
                        let badgeBorder = '#cbd5e1';

                        if (sess.status === 'Present') {
                          badgeBg = '#dcfce7';
                          badgeColor = '#15803d';
                          badgeBorder = '#86efac';
                        } else if (sess.status === 'Absent') {
                          badgeBg = '#fee2e2';
                          badgeColor = '#b91c1c';
                          badgeBorder = '#fca5a5';
                        } else if (sess.status.includes('Duty') || sess.isExcused) {
                          badgeBg = '#ede9fe';
                          badgeColor = '#6d28d9';
                          badgeBorder = '#c4b5fd';
                        }

                        return (
                          <tr
                            key={sess.id || idx}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfdfe'
                            }}
                          >
                            <td style={{ padding: '12px 14px', fontWeight: '600', color: '#94a3b8' }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>
                              {sess.date}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#475569', fontWeight: '500' }}>
                              {sess.timeSlot}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#1e293b', fontWeight: '600' }}>
                              {sess.topic}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: badgeBg,
                                color: badgeColor,
                                border: `1px solid ${badgeBorder}`,
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '12px'
                              }}>
                                {sess.status === 'Present' && <Check size={13} strokeWidth={3} />}
                                {sess.status === 'Absent' && <XCircle size={13} />}
                                {sess.status.includes('Duty') && <Shield size={13} />}
                                <span>{sess.status}</span>
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748b' }}>
                              {sess.remark ? (
                                <span style={{ fontStyle: 'italic', color: '#334155' }}>"{sess.remark}"</span>
                              ) : (
                                <span>{sess.facultyName}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW: ATTENDANCE OVERVIEW                                  */}
        {/* ========================================================== */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '800',
                margin: '0 0 4px',
                fontFamily: "'Outfit', sans-serif",
                color: '#0f172a'
              }}>
                Institutional Attendance Overview
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Summary of attendance percentages and exam eligibility across all courses for {semesterStr}.
              </p>
            </div>

            {/* Overview Table Card */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '13px'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f8fafc',
                      borderBottom: '2px solid #e2e8f0',
                      color: '#475569'
                    }}>
                      <th style={{ padding: '12px 14px', fontWeight: '700' }}>Subject</th>
                      <th style={{ padding: '12px 14px', fontWeight: '700' }}>Type</th>
                      <th style={{ padding: '12px 14px', fontWeight: '700' }}>Faculty</th>
                      <th style={{ padding: '12px 14px', fontWeight: '700' }}>Conducted</th>
                      <th style={{ padding: '12px 14px', fontWeight: '700' }}>Attended</th>
                      <th style={{ padding: '12px 14px', fontWeight: '700' }}>Missed</th>
                      <th style={{ padding: '12px 14px', fontWeight: '700' }}>Percentage</th>
                      <th style={{ padding: '12px 14px', fontWeight: '700' }}>Exam Eligibility</th>
                      <th style={{ padding: '12px 14px', fontWeight: '700' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledSubjects.map((sub, idx) => {
                      const stats = sub.stats;
                      const hasLectures = stats?.hasConductedLectures;
                      const isEligible = stats?.meetsThreshold;

                      return (
                        <tr
                          key={sub.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfdfe'
                          }}
                        >
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontWeight: '800', color: '#0f172a' }}>{sub.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {sub.code}</div>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <span style={{
                              backgroundColor: sub.isElective ? '#f3e8ff' : '#eff6ff',
                              color: sub.isElective ? '#7e22ce' : '#1d4ed8',
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase'
                            }}>
                              {sub.isElective ? 'Elective' : 'Regular'}
                            </span>
                          </td>
                          <td style={{ padding: '14px', color: '#334155', fontWeight: '600' }}>
                            {sub.facultyName}
                          </td>
                          <td style={{ padding: '14px', fontWeight: '700', color: '#0f172a' }}>
                            {stats?.totalConducted || 0}
                          </td>
                          <td style={{ padding: '14px', fontWeight: '700', color: '#059669' }}>
                            {stats?.totalAttended || 0}
                          </td>
                          <td style={{ padding: '14px', fontWeight: '700', color: '#dc2626' }}>
                            {stats?.totalMissed || 0}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{
                              fontWeight: '800',
                              fontSize: '14px',
                              color: hasLectures ? (isEligible ? '#059669' : '#dc2626') : '#64748b'
                            }}>
                              {hasLectures ? stats.percentageFormatted : 'No lectures conducted yet'}
                            </div>
                            {hasLectures && (
                              <div style={{
                                width: '100px',
                                height: '6px',
                                backgroundColor: '#e2e8f0',
                                borderRadius: '3px',
                                marginTop: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${Math.min(100, stats.percentage || 0)}%`,
                                  height: '100%',
                                  backgroundColor: isEligible ? '#10b981' : '#ef4444'
                                }} />
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px' }}>
                            {hasLectures ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: isEligible ? '#ecfdf5' : '#fef2f2',
                                color: isEligible ? '#059669' : '#dc2626',
                                border: isEligible ? '1px solid #a7f3d0' : '1px solid #fecaca',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}>
                                {isEligible ? <Check size={12} strokeWidth={3} /> : <AlertTriangle size={12} />}
                                <span>{isEligible ? 'Eligible' : 'Shortage Warning'}</span>
                              </span>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                                Not Applicable
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <button
                              onClick={() => handleOpenSubjectDetail(sub.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #bfdbfe',
                                backgroundColor: '#eff6ff',
                                color: '#2563eb',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Details →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Institutional Minimum 75% Requirement Notice */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <Shield size={28} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: '#1e3a8a' }}>
                  Institutional 75% Attendance Requirement &amp; Academic Policy
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
                  According to official academic regulations of the A. D. Patel Institute of Technology, every student must maintain a minimum attendance of <strong>75% in each enrolled course</strong> to be granted permission to appear for the end-semester examinations. Approved on-duty leaves (OD) and medical exceptions are factored in per institutional policy. Students with attendance below 75% must contact their respective faculty coordinators immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW: MY PROFILE                                           */}
        {/* ========================================================== */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '800',
                margin: '0 0 4px',
                fontFamily: "'Outfit', sans-serif",
                color: '#0f172a'
              }}>
                Student Profile &amp; Account Settings
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                View your official academic records and manage your contact details and login credentials.
              </p>
            </div>

            {/* Profile Feedback Alert */}
            {profileMsg.text && (
              <div style={{
                backgroundColor: profileMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                border: profileMsg.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                fontWeight: '700',
                color: profileMsg.type === 'success' ? '#065f46' : '#991b1b'
              }}>
                {profileMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px'
            }}>
              {/* Left Column: Official Academic Credentials (READ-ONLY) */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={20} color="#2563eb" />
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Academic Credentials
                    </h3>
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    <Lock size={12} />
                    <span>Protected</span>
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', marginTop: 0, marginBottom: '20px' }}>
                  These academic fields are official institutional records and cannot be edited by students directly.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={studentName}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Enrollment Number
                      </label>
                      <input
                        type="text"
                        disabled
                        value={enrollmentNo}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Roll Number
                      </label>
                      <input
                        type="text"
                        disabled
                        value={profile?.rollNo || 'N/A'}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      disabled
                      value={departmentName}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Semester
                      </label>
                      <input
                        type="text"
                        disabled
                        value={semesterStr}
                        style={{
                          width: '100%',
                          padding: '10px 10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Division
                      </label>
                      <input
                        type="text"
                        disabled
                        value={divisionStr}
                        style={{
                          width: '100%',
                          padding: '10px 10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Batch
                      </label>
                      <input
                        type="text"
                        disabled
                        value={batchStr}
                        style={{
                          width: '100%',
                          padding: '10px 10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Academic Year
                    </label>
                    <input
                      type="text"
                      disabled
                      value={academicYear}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Editable Contact Information & Security */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <User size={20} color="#2563eb" />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Contact &amp; Security Settings
                  </h3>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Email */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="student@adit.ac.in"
                        style={{
                          width: '100%',
                          height: '42px',
                          paddingLeft: '38px',
                          paddingRight: '12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Mobile Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        style={{
                          width: '100%',
                          height: '42px',
                          paddingLeft: '38px',
                          paddingRight: '12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Change Password Divider */}
                  <div style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '16px',
                    marginTop: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <Key size={16} color="#475569" />
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                        Change Password (Optional)
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          style={{
                            width: '100%',
                            height: '40px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            New Password
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 4 characters"
                            style={{
                              width: '100%',
                              height: '40px',
                              padding: '0 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '13px'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-type new password"
                            style={{
                              width: '100%',
                              height: '40px',
                              padding: '0 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: '12px' }}>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: profileSaving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                      }}
                    >
                      <Check size={16} />
                      <span>{profileSaving ? 'Saving Updates...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
