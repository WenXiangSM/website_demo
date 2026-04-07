import React, { useState } from 'react';
import { ManualInputModal } from './Dashboard-2';

const CONNECTED_SOURCES = [
  { name: 'DBS/POSB', type: 'Bank', status: 'connected', lastSync: '2 hours ago' },
  { name: 'OCBC', type: 'Bank', status: 'connected', lastSync: '2 hours ago' },
  { name: 'IRAS MyTax Portal', type: 'Government', status: 'connected', lastSync: '2 hours ago' },
  { name: 'CPF Board', type: 'Government', status: 'connected', lastSync: '2 hours ago' },
  { name: 'HSBC', type: 'Bank', status: 'disconnected', lastSync: 'Never' },
];

const TAX_HISTORY = [
  { ya: 'YA 2026', income: 122000, reliefs: 48500, tax: 5092, saved: 2965 },
  { ya: 'YA 2025', income: 112000, reliefs: 42000, tax: 4830, saved: 1200 },
  { ya: 'YA 2024', income: 105000, reliefs: 38000, tax: 5120, saved: 800 },
  { ya: 'YA 2023', income: 98000, reliefs: 35000, tax: 4560, saved: 0 },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showManualInput, setShowManualInput] = useState(false);

  return (
    <div>
      {showManualInput && <ManualInputModal onClose={() => setShowManualInput(false)} />}
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account, data connections, and tax history</p>
      </div>

      <div className="profile-grid">
        {/* Left sidebar */}
        <div>
          <div className="card profile-sidebar-card" style={{ marginBottom: 16 }}>
            <div className="profile-avatar">WX</div>
            <div className="profile-name">Lum Wen Xiang</div>
            <div className="profile-email">wenxiang@taxsg.sg</div>
            <span className="tag tag-green" style={{ marginBottom: 16 }}>Premium Plan</span>
            <div className="profile-stat-row">
              <div className="profile-stat">
                <div className="profile-stat-val">$4,965</div>
                <div className="profile-stat-lbl">Total Saved</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">4</div>
                <div className="profile-stat-lbl">Years</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Settings</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Push Notifications', enabled: true },
                { label: 'Email Reminders', enabled: true },
                { label: 'Household Mode', enabled: true },
                { label: 'Auto-Sync SGFinDex', enabled: false },
              ].map((setting, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{setting.label}</span>
                  <div style={{
                    width: 38,
                    height: 20,
                    borderRadius: 10,
                    background: setting.enabled ? 'var(--accent)' : 'var(--bg-elevated)',
                    border: `1px solid ${setting.enabled ? 'var(--accent)' : 'var(--border)'}`,
                    position: 'relative',
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: setting.enabled ? 'var(--bg-primary)' : 'var(--text-muted)',
                      position: 'absolute',
                      top: 2,
                      left: setting.enabled ? 21 : 2,
                      transition: 'var(--transition)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right content */}
        <div>
          <div className="toggle-group" style={{ marginBottom: 20 }}>
            {['overview', 'connections', 'history'].map((tab) => (
              <button
                key={tab}
                className={`toggle-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                style={{ textTransform: 'capitalize' }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <span className="card-title">Personal Information</span>
                  <button className="btn btn-ghost btn-sm">Edit</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Full Name', value: 'Lum Wen Xiang' },
                    { label: 'NRIC', value: '•••••194A' },
                    { label: 'Date of Birth', value: '15 Mar 1999' },
                    { label: 'Marital Status', value: 'Single' },
                    { label: 'Tax Residency', value: 'Singapore Resident' },
                    { label: 'Employment', value: 'Full-time Employed' },
                  ].map((field, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                        {field.label}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Dependants</span>
                  <button className="btn btn-ghost btn-sm">+ Add</button>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Relationship</th>
                        <th>Age</th>
                        <th>Relief Claimed</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Lum Ah Ma</td>
                        <td>Mother</td>
                        <td>72</td>
                        <td><span className="tag tag-green">Parent Relief</span></td>
                      </tr>
                      <tr>
                        <td>Lum Xiao Ming</td>
                        <td>Child</td>
                        <td>5</td>
                        <td><span className="tag tag-green">QCR</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'connections' && (
            <div>
              {/* Manual Input banner for users without SGFinDex */}
              <div className="manual-input-banner" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>No bank account or SGFinDex?</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Enter your income and relief figures manually to get personalised recommendations.
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowManualInput(true)}>
                  ✎ Manual Input
                </button>
              </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">SGFinDex Data Sources</span>
                <button className="btn btn-secondary btn-sm">Sync All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {CONNECTED_SOURCES.map((src, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: src.status === 'connected' ? 'var(--accent-dim)' : 'var(--danger-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                      }}>
                        {src.status === 'connected' ? '✓' : '✕'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{src.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{src.type} · Last sync: {src.lastSync}</div>
                      </div>
                    </div>
                    <button className={`btn btn-sm ${src.status === 'connected' ? 'btn-ghost' : 'btn-primary'}`}>
                      {src.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Tax Filing History</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th style={{ textAlign: 'right' }}>Income</th>
                      <th style={{ textAlign: 'right' }}>Reliefs</th>
                      <th style={{ textAlign: 'right' }}>Tax Paid</th>
                      <th style={{ textAlign: 'right' }}>Savings via TaxSG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TAX_HISTORY.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{row.ya}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          ${row.income.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          ${row.reliefs.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          ${row.tax.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {row.saved > 0 ? (
                            <span className="tag tag-green">${row.saved.toLocaleString()}</span>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
