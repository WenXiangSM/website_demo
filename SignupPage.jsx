import React, { useState } from 'react';

export default function SignupPage({ onSignup, onGoLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M10 12h12M10 16h8M10 20h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="23" cy="21" r="5" fill="var(--accent)" stroke="var(--bg-primary)" strokeWidth="2"/>
              <path d="M21.5 21l1 1 2.5-2.5" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="brand-text">TaxSG</span>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start optimising your taxes in minutes</p>

        <button className="btn-singpass" onClick={onSignup}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="currentColor"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Sign up with Singpass
        </button>

        <div className="auth-divider"><span>or sign up with email</span></div>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            type="text"
            placeholder="Wen Xiang"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div className="auth-terms">
          By signing up, you agree to our{' '}
          <span className="auth-link-inline">Terms of Service</span>{' '}
          and{' '}
          <span className="auth-link-inline">Privacy Policy</span>.
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 14 }}
          onClick={onSignup}
        >
          Create Account
        </button>

        <p className="auth-footer">
          Already have an account?{' '}
          <button className="auth-link" onClick={onGoLogin}>Sign in</button>
        </p>
      </div>
    </div>
  );
}
