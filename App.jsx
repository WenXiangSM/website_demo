import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Dashboard from './Dashboard-2';
import WhatIfSimulator from './WhatIfSimulator';
import HouseholdOptimizer from './HouseholdOptimizer';
import Alerts from './Alerts';
import Profile from './Profile';
import TaxFiling from './TaxFiling';
import './App.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◎' },
  { id: 'simulator', label: 'What-If', icon: '⟡' },
  { id: 'household', label: 'Household', icon: '⌂' },
  { id: 'filing', label: 'File Tax', icon: '✦' },
  { id: 'alerts', label: 'Alerts', icon: '◈', badge: 3 },
  { id: 'profile', label: 'Profile', icon: '○' },
];

export default function App() {
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'signup'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLoggedIn) {
    if (authPage === 'signup') {
      return (
        <SignupPage
          onSignup={() => setIsLoggedIn(true)}
          onGoLogin={() => setAuthPage('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={() => setIsLoggedIn(true)}
        onGoSignup={() => setAuthPage('signup')}
      />
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'simulator': return <WhatIfSimulator />;
      case 'household': return <HouseholdOptimizer />;
      case 'filing': return <TaxFiling />;
      case 'alerts': return <Alerts />;
      case 'profile': return <Profile />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  const handleNavClick = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  return (
    <div className="app">
      {/* Mobile top bar */}
      <header className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
        <span className="mobile-brand">TaxSG</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Sidebar drawer overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M10 12h12M10 16h8M10 20h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="23" cy="21" r="5" fill="var(--accent)" stroke="var(--bg-primary)" strokeWidth="2"/>
              <path d="M21.5 21l1 1 2.5-2.5" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="brand-text">TaxSG</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">✕</button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card user-card-clickable" onClick={() => handleNavClick('profile')} title="Go to Profile">
            <div className="user-avatar">WX</div>
            <div className="user-info">
              <span className="user-name">Wen Xiang</span>
              <span className="user-plan">Premium</span>
            </div>
            <span className="user-card-arrow">›</span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}
            onClick={() => setIsLoggedIn(false)}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
