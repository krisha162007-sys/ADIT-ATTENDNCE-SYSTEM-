import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Building2,
  GraduationCap,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { loginUser, getFaculties, getCollegeName } from '../services/attendanceStorage';

export default function LoginView({ onLoginSuccess, showToast }) {
  const [roleTab, setRoleTab] = useState('faculty'); // 'faculty' or 'admin'
  const [identifier, setIdentifier] = useState('FAC_PS'); // default for quick demo
  const [password, setPassword] = useState('faculty123'); // default password
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const faculties = getFaculties();
  const collegeName = getCollegeName();

  const handleRoleTabChange = (newRole) => {
    setRoleTab(newRole);
    setErrorMsg('');
    if (newRole === 'admin') {
      setIdentifier('admin');
      setPassword('1234');
    } else {
      setIdentifier('FAC_PS');
      setPassword('faculty123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = loginUser(identifier, password);
      setLoading(false);

      if (result.success) {
        if (showToast) {
          showToast(`Welcome back, ${result.user.name}!`);
        }
        if (onLoginSuccess) {
          onLoginSuccess(result.user.role, result.user);
        }
      } else {
        setErrorMsg(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('An unexpected error occurred during login. Please try again.');
    }
  };

  const handleQuickFacultySelect = (facId) => {
    setRoleTab('faculty');
    setIdentifier(facId);
    setPassword('faculty123');
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        overflow: 'hidden'
      }}>
        {/* Top Header & Branding */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
          padding: '36px 32px 30px',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            marginBottom: '16px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
          }}>
            <GraduationCap size={32} color="#ffffff" />
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
            color: '#ffffff',
            fontFamily: "'Outfit', sans-serif"
          }}>
            ADIT Attendance Portal
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#bfdbfe',
            margin: 0,
            fontWeight: '500'
          }}>
            {collegeName}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '6px',
          margin: '24px 28px 0',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => handleRoleTabChange('faculty')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: roleTab === 'faculty' ? '#ffffff' : 'transparent',
              color: roleTab === 'faculty' ? '#1e3a8a' : '#64748b',
              fontWeight: roleTab === 'faculty' ? '700' : '600',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: roleTab === 'faculty' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <UserCheck size={16} color={roleTab === 'faculty' ? '#2563eb' : '#94a3b8'} />
            <span>Faculty Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('admin')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: roleTab === 'admin' ? '#ffffff' : 'transparent',
              color: roleTab === 'admin' ? '#0f172a' : '#64748b',
              fontWeight: roleTab === 'admin' ? '700' : '600',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: roleTab === 'admin' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <ShieldCheck size={16} color={roleTab === 'admin' ? '#0f172a' : '#94a3b8'} />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '10px',
              padding: '12px 14px',
              color: '#e11d48',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Identifier Field */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '12.5px',
              fontWeight: '700',
              color: '#334155',
              marginBottom: '7px'
            }}>
              {roleTab === 'admin' ? 'Administrator Username / Email' : 'Faculty ID / Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center'
              }}>
                {roleTab === 'admin' ? <ShieldCheck size={18} /> : <User size={18} />}
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={roleTab === 'admin' ? 'Enter admin or email' : 'e.g. FAC_PS or email'}
                style={{
                  width: '100%',
                  height: '44px',
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
              <label style={{
                fontSize: '12.5px',
                fontWeight: '700',
                color: '#334155'
              }}>
                {roleTab === 'admin' ? 'Admin Password / Security PIN' : 'Password'}
              </label>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                {roleTab === 'admin' ? 'Default: 1234' : 'Default: faculty123'}
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Lock size={18} />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  height: '44px',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: roleTab === 'admin' ? '#0f172a' : '#2563eb',
              color: '#ffffff',
              fontSize: '14.5px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: roleTab === 'admin' 
                ? '0 4px 12px rgba(15, 23, 42, 0.25)' 
                : '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{loading ? 'Authenticating...' : `Log in to ${roleTab === 'admin' ? 'Admin Panel' : 'Faculty Panel'}`}</span>
            <ArrowRight size={17} />
          </button>

          {/* Quick Demo Credentials Assistant */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              fontWeight: '700',
              color: '#64748b',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <Sparkles size={13} color="#2563eb" />
              <span>Quick Login (Click to Auto-fill)</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickFacultySelect('FAC_PS')}
                style={{
                  fontSize: '11.5px',
                  fontWeight: '600',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                  backgroundColor: identifier === 'FAC_PS' ? '#eff6ff' : '#f8fafc',
                  color: '#1d4ed8',
                  cursor: 'pointer'
                }}
              >
                Prof. Priya Shah (FAC_PS)
              </button>

              <button
                type="button"
                onClick={() => handleQuickFacultySelect('FAC_DJP')}
                style={{
                  fontSize: '11.5px',
                  fontWeight: '600',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                  backgroundColor: identifier === 'FAC_DJP' ? '#eff6ff' : '#f8fafc',
                  color: '#1d4ed8',
                  cursor: 'pointer'
                }}
              >
                Dr. Dinesh Prajapati (FAC_DJP)
              </button>

              <button
                type="button"
                onClick={() => handleQuickFacultySelect('FAC_RP')}
                style={{
                  fontSize: '11.5px',
                  fontWeight: '600',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                  backgroundColor: identifier === 'FAC_RP' ? '#eff6ff' : '#f8fafc',
                  color: '#1d4ed8',
                  cursor: 'pointer'
                }}
              >
                Prof. Rahul Patel (FAC_RP)
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                style={{
                  fontSize: '11.5px',
                  fontWeight: '600',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: roleTab === 'admin' ? '#f1f5f9' : '#f8fafc',
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                Admin (admin / 1234)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
