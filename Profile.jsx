import React, { useState } from 'react';
import { ManualInputModal } from './Dashboard-2';

const CONNECTED_SOURCES = [
  { name: 'DBS/POSB', type: 'Bank', status: 'connected', lastSync: '2 hours ago' },
  { name: 'OCBC', type: 'Bank', status: 'connected', lastSync: '2 hours ago' },
  { name: 'IRAS MyTax Portal', type: 'Government', status: 'connected', lastSync: '2 hours ago' },
  { name: 'CPF Board', type: 'Government', status: 'connected', lastSync: '2 hours ago' },
  { name: 'HSBC', type: 'Bank', status: 'disconnected', lastSync: 'Never' },
];

// YA 2026 has two states: before and after optimisation
const YA2026_BEFORE = {
  ya: 'YA 2026', income: 122000, reliefs: 21400, chargeableIncome: 100600,
  tax: 5719, saved: 0, status: 'unfiled', refNo: '—',
  filedOn: '—', paymentDeadline: '30 Nov 2026', paymentStatus: 'pending',
  reliefItems: ['Earned Income', 'CPF OA'],
};
const YA2026_AFTER = {
  ya: 'YA 2026', income: 122000, reliefs: 57700, chargeableIncome: 64300,
  tax: 2251, saved: 3468, status: 'filed', refNo: 'YA2026-4GH9KX',
  filedOn: '8 Apr 2026', paymentDeadline: '30 Nov 2026', paymentStatus: 'pending',
  reliefItems: ['Earned Income', 'CPF OA', 'SRS', 'Parent Relief', 'NSman', 'Life Insurance', 'QCR'],
};

const TAX_HISTORY_BASE = [
  {
    ya: 'YA 2025', income: 112000, reliefs: 42000, chargeableIncome: 70000,
    tax: 4830, saved: 1200, status: 'filed', refNo: 'YA2025-2MN7PQ',
    filedOn: '3 Apr 2025', paymentDeadline: '30 Nov 2025', paymentStatus: 'paid',
    reliefItems: ['Earned Income', 'CPF OA', 'SRS', 'Parent Relief', 'NSman'],
  },
  {
    ya: 'YA 2024', income: 105000, reliefs: 38000, chargeableIncome: 67000,
    tax: 5120, saved: 800, status: 'filed', refNo: 'YA2024-8RT3WZ',
    filedOn: '10 Apr 2024', paymentDeadline: '30 Nov 2024', paymentStatus: 'paid',
    reliefItems: ['Earned Income', 'CPF OA', 'SRS', 'Parent Relief'],
  },
  {
    ya: 'YA 2023', income: 98000, reliefs: 35000, chargeableIncome: 63000,
    tax: 4560, saved: 0, status: 'filed', refNo: 'YA2023-6VB1CK',
    filedOn: '15 Apr 2023', paymentDeadline: '30 Nov 2023', paymentStatus: 'paid',
    reliefItems: ['Earned Income', 'CPF OA', 'Parent Relief'],
  },
];

export default function Profile({ isOptimised = false }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showManualInput, setShowManualInput] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const ya2026 = isOptimised ? YA2026_AFTER : YA2026_BEFORE;
  const TAX_HISTORY = [ya2026, ...TAX_HISTORY_BASE];
  const totalSaved = TAX_HISTORY.reduce((s, r) => s + r.saved, 0);
  const totalTax   = TAX_HISTORY.reduce((s, r) => s + r.tax,   0);

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
                <div className="profile-stat-val">${totalSaved.toLocaleString()}</div>
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
            <div>
              {/* Summary bar */}
              <div className="history-summary-bar">
                <div className="history-summary-stat">
                  <div className="history-summary-val">{TAX_HISTORY.filter(r => r.status === 'filed').length}</div>
                  <div className="history-summary-lbl">Years Filed</div>
                </div>
                <div className="history-summary-divider" />
                <div className="history-summary-stat">
                  <div className="history-summary-val">${totalSaved.toLocaleString()}</div>
                  <div className="history-summary-lbl">Total Saved via TaxSG</div>
                </div>
                <div className="history-summary-divider" />
                <div className="history-summary-stat">
                  <div className="history-summary-val">${totalTax.toLocaleString()}</div>
                  <div className="history-summary-lbl">Total Tax Paid</div>
                </div>
                <div className="history-summary-divider" />
                <div className="history-summary-stat">
                  <div className={`history-summary-val ${isOptimised ? 'accent' : ''}`}>
                    {isOptimised ? 'All Filed' : 'YA 2026 Pending'}
                  </div>
                  <div className="history-summary-lbl">Filing Status</div>
                </div>
              </div>

              {/* Filing cards */}
              <div className="history-list">
                {TAX_HISTORY.map((row, i) => (
                  <div key={i} className="history-card">
                    <div
                      className="history-card-header"
                      onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                    >
                      <div className="history-card-left">
                        <div className="history-ya">{row.ya}</div>
                        <span className={`history-status-badge ${row.status}`}>
                          {row.status === 'filed' ? '✓ Filed' : '⏳ Not Yet Optimised'}
                        </span>
                        <span className={`history-payment-badge ${row.paymentStatus}`}>
                          {row.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Payment Due'}
                        </span>
                      </div>
                      <div className="history-card-right">
                        <div className="history-card-stats">
                          <div className="history-card-stat">
                            <div className="history-card-stat-val">${row.income.toLocaleString()}</div>
                            <div className="history-card-stat-lbl">Income</div>
                          </div>
                          <div className="history-card-stat">
                            <div className="history-card-stat-val">${row.reliefs.toLocaleString()}</div>
                            <div className="history-card-stat-lbl">Reliefs</div>
                          </div>
                          <div className="history-card-stat">
                            <div className="history-card-stat-val">${row.tax.toLocaleString()}</div>
                            <div className="history-card-stat-lbl">Tax</div>
                          </div>
                          {row.saved > 0 && (
                            <div className="history-card-stat">
                              <div className="history-card-stat-val accent">+${row.saved.toLocaleString()}</div>
                              <div className="history-card-stat-lbl">Saved</div>
                            </div>
                          )}
                        </div>
                        <span className="history-expand-icon">{expandedRow === i ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {expandedRow === i && (
                      <div className="history-card-detail">
                        <div className="history-detail-grid">
                          <div className="history-detail-section">
                            <div className="history-detail-title">Filing Details</div>
                            <div className="history-detail-row">
                              <span>Reference No.</span>
                              <span className="mono accent">{row.refNo}</span>
                            </div>
                            <div className="history-detail-row">
                              <span>Filed On</span>
                              <span>{row.filedOn}</span>
                            </div>
                            <div className="history-detail-row">
                              <span>Chargeable Income</span>
                              <span>${row.chargeableIncome.toLocaleString()}</span>
                            </div>
                            <div className="history-detail-row">
                              <span>Tax Payable</span>
                              <span>${row.tax.toLocaleString()}</span>
                            </div>
                            <div className="history-detail-row">
                              <span>Payment Deadline</span>
                              <span>{row.paymentDeadline}</span>
                            </div>
                            <div className="history-detail-row">
                              <span>Payment Status</span>
                              <span className={row.paymentStatus === 'paid' ? 'positive' : 'warning'}>
                                {row.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <div className="history-detail-section">
                            <div className="history-detail-title">Reliefs Claimed</div>
                            {row.reliefItems.map((item, j) => (
                              <div key={j} className="history-detail-row">
                                <span>{item}</span>
                                <span className="tag tag-green" style={{ fontSize: 10 }}>✓</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="history-detail-actions">
                          <button className="btn btn-ghost btn-sm">⬇ Download NOA</button>
                          <button className="btn btn-ghost btn-sm">📋 View Full Return</button>
                          {row.paymentStatus === 'pending' && (
                            <button className="btn btn-primary btn-sm">Pay Now</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
