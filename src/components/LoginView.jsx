import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  GraduationCap,
  Eye,
  EyeOff
} from 'lucide-react';
import { loginUser, getCollegeName } from '../services/attendanceStorage';

export default function LoginView({ onLoginSuccess, showToast }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const collegeName = getCollegeName();

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
        setErrorMsg(result.error || 'Invalid User ID or Password. Access denied.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('An unexpected error occurred during authentication. Please try again.');
    }
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
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
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

        {/* Single Common Login Form */}
        <form onSubmit={handleSubmit} style={{ padding: '32px 28px 36px' }}>
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

          {/* User ID Field */}
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="userIdInput"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '8px'
              }}
            >
              User ID
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
                <User size={18} />
              </div>
              <input
                id="userIdInput"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your User ID"
                autoComplete="username"
                style={{
                  width: '100%',
                  height: '46px',
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
          <div style={{ marginBottom: '26px' }}>
            <label 
              htmlFor="passwordInput"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '8px'
              }}
            >
              Password
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
                <Lock size={18} />
              </div>

              <input
                id="passwordInput"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  height: '46px',
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Login'}</span>
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
