import { useState, useRef, useEffect } from 'react';

// ─── Step 1: Main login ──────────────────────────────────────────
function LoginStep({ onSingpass, onGoSignup }) {
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

        <h2 className="auth-title">Sign in</h2>
        <p className="auth-subtitle">Access your tax optimisation dashboard</p>

        <button className="btn-singpass" onClick={onSingpass}>
          <SingpassIcon />
          Continue with Singpass
        </button>

        <div className="auth-divider"><span>or use email</span></div>

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
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
          onClick={onSingpass}
        >
          Sign In
        </button>

        <p className="auth-footer">
          No account?{' '}
          <button className="auth-link" onClick={onGoSignup}>Create one</button>
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Singpass page ───────────────────────────────────────
function SingpassStep({ onNext, onBack }) {
  const [phone, setPhone] = useState('');
  const [tab, setTab] = useState('app'); // 'app' | 'password'

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        {/* SingPass header */}
        <div className="sp-header">
          <div className="sp-logo">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#C0272D"/>
              <path d="M13 20a7 7 0 1 1 14 0 7 7 0 0 1-14 0z" fill="white"/>
              <path d="M20 15v10M15 20h10" stroke="#C0272D" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="sp-logo-text">Singpass</span>
          </div>
          <button className="auth-link" style={{ fontSize: 12, color: 'var(--text-muted)' }} onClick={onBack}>
            Back
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
          Use your Singpass to log in securely. Your data is retrieved via SGFinDex and is not stored by TaxSG.
        </p>

        {/* Tab toggle */}
        <div className="toggle-group" style={{ marginBottom: 24, width: '100%' }}>
          <button
            className={`toggle-btn ${tab === 'app' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setTab('app')}
          >
            Singpass App
          </button>
          <button
            className={`toggle-btn ${tab === 'password' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setTab('password')}
          >
            Password Login
          </button>
        </div>

        {tab === 'app' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Open your Singpass app and scan the QR code, or enter your phone number to receive a push notification.
            </p>
            {/* Mock QR code */}
            <div className="sp-qr">
              <div className="sp-qr-inner">
                {[...Array(6)].map((_, r) =>
                  [...Array(6)].map((_, c) => (
                    <div
                      key={`${r}-${c}`}
                      className="sp-qr-cell"
                      style={{
                        background: Math.random() > 0.4 ? 'var(--text-primary)' : 'transparent',
                      }}
                    />
                  ))
                )}
              </div>
              <div className="sp-qr-logo">
                <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="#C0272D"/>
                  <path d="M13 20a7 7 0 1 1 14 0 7 7 0 0 1-14 0z" fill="white"/>
                </svg>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 20px' }}>
              QR code expires in <span style={{ color: 'var(--accent)' }}>2:00</span>
            </p>
            <div className="auth-divider"><span>or enter phone number</span></div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="form-input" style={{ width: 64, flexShrink: 0, color: 'var(--text-secondary)', cursor: 'default' }}>
                  +65
                </div>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  type="tel"
                  placeholder="9123 4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
              onClick={onNext}
            >
              Send OTP
            </button>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label className="form-label">NRIC / FIN</label>
              <input className="form-input" type="text" placeholder="e.g. S1234567A" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Singpass password" />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}
              onClick={onNext}
            >
              Log In
            </button>
          </div>
        )}

        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          This is a simulated Singpass interface for demo purposes.
        </p>
      </div>
    </div>
  );
}

// ─── Step 3: OTP verification ────────────────────────────────────
function OTPStep({ onVerify, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const filled = otp.every(d => d !== '');

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

        <h2 className="auth-title">Enter OTP</h2>
        <p className="auth-subtitle" style={{ marginBottom: 28 }}>
          A 6-digit code was sent to your Singpass-registered number ending in{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>****890</span>
        </p>

        <div className="otp-row" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => (inputRefs.current[i] = el)}
              className="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 28 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {seconds > 0 ? `Resend in ${seconds}s` : ''}
          </span>
          {seconds === 0 && (
            <button
              className="auth-link"
              onClick={() => setSeconds(60)}
            >
              Resend code
            </button>
          )}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', opacity: filled ? 1 : 0.5 }}
          onClick={filled ? onVerify : undefined}
        >
          Verify
        </button>

        <p className="auth-footer">
          <button className="auth-link" onClick={onBack}>Go back</button>
        </p>
      </div>
    </div>
  );
}

// ─── SingPass icon SVG ───────────────────────────────────────────
function SingpassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#C0272D"/>
      <path d="M13 20a7 7 0 1 1 14 0 7 7 0 0 1-14 0z" fill="white"/>
      <path d="M20 15v10M15 20h10" stroke="#C0272D" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Main export ─────────────────────────────────────────────────
export default function LoginPage({ onLogin, onGoSignup }) {
  const [step, setStep] = useState('login'); // 'login' | 'singpass' | 'otp'

  if (step === 'singpass') {
    return <SingpassStep onNext={() => setStep('otp')} onBack={() => setStep('login')} />;
  }
  if (step === 'otp') {
    return <OTPStep onVerify={onLogin} onBack={() => setStep('singpass')} />;
  }
  return <LoginStep onSingpass={() => setStep('singpass')} onGoSignup={onGoSignup} />;
}
