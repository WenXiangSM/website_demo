import React, { useState } from 'react';

const ICON_COLORS = {
  deadline: '#f87171',
  compliance: '#fbbf24',
  life: '#60a5fa',
  optimise: '#2dd4bf',
  info: '#6b7280',
};

const ICON_LABELS = {
  deadline: 'DL',
  compliance: '!',
  life: 'LE',
  optimise: 'OPT',
  info: 'i',
};

function AlertIcon({ type }) {
  const color = ICON_COLORS[type] || '#6b7280';
  const label = ICON_LABELS[type] || '?';
  return (
    <div style={{
      width: 36,
      height: 36,
      borderRadius: 8,
      background: color + '18',
      border: `1px solid ${color}40`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      fontWeight: 700,
      color,
      letterSpacing: '0.3px',
      flexShrink: 0,
    }}>
      {label}
    </div>
  );
}

const ALERTS = [
  {
    id: 1,
    type: 'deadline',
    urgency: 'high',
    icon: 'deadline',
    title: 'SRS Contribution Deadline — 31 Dec 2026',
    desc: 'You have $4,200 of unused SRS contribution headroom. Contributing before year-end could reduce your tax bracket from 11.5% to 7%, saving approximately $1,830.',
    time: '23 days remaining',
    action: 'Simulate Impact',
    read: false,
  },
  {
    id: 2,
    type: 'compliance',
    urgency: 'high',
    icon: 'compliance',
    title: 'Duplicate Parent Relief Detected',
    desc: 'Both you and your spouse have claimed Parent Relief for your mother (NRIC ending 4521A). IRAS only allows one taxpayer to claim. Recommend allocating to the higher-income earner to maximise savings.',
    time: '2 hours ago',
    action: 'Resolve',
    read: false,
  },
  {
    id: 3,
    type: 'life-event',
    urgency: 'medium',
    icon: 'life',
    title: 'Parent turning 55 — New Relief Eligibility',
    desc: 'Your father will turn 55 in March 2026. This qualifies you for Parent Relief ($9,000 if living together, $5,500 otherwise). Remember to update your claim for YA 2027.',
    time: '1 day ago',
    action: 'View Details',
    read: false,
  },
  {
    id: 4,
    type: 'optimisation',
    urgency: 'medium',
    icon: 'optimise',
    title: 'CPF Top-Up Opportunity',
    desc: "You haven't made a voluntary CPF SA top-up this year. A $8,000 top-up would provide additional tax relief and boost your retirement savings. Deadline: 31 Dec.",
    time: '3 days ago',
    action: 'Learn More',
    read: true,
  },
  {
    id: 5,
    type: 'info',
    urgency: 'low',
    icon: 'info',
    title: 'SGFinDex Data Refreshed',
    desc: 'Your financial data has been synced across 3 banks and 2 government agencies. All relief calculations are up to date.',
    time: '5 days ago',
    action: null,
    read: true,
  },
  {
    id: 6,
    type: 'life-event',
    urgency: 'low',
    icon: 'life',
    title: "Working Mother's Child Relief Update",
    desc: 'Based on your household data, your spouse may be eligible for WMCR on your second child (born 2024). The relief is 20% of earned income. This is automatically applied.',
    time: '1 week ago',
    action: 'View Details',
    read: true,
  },
  {
    id: 7,
    type: 'deadline',
    urgency: 'low',
    icon: 'deadline',
    title: 'Tax Filing Opens 1 March 2026',
    desc: 'The IRAS e-filing portal will open on 1 March. TaxSG will pre-compute your optimal claim set before then. You can review and submit via MyTax Portal.',
    time: '2 weeks ago',
    action: null,
    read: true,
  },
];

const FILTER_OPTIONS = ['All', 'Deadline', 'Compliance', 'Life Event', 'Optimisation'];

export default function Alerts() {
  const [filter, setFilter] = useState('All');

  const filteredAlerts = ALERTS.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Deadline') return a.type === 'deadline';
    if (filter === 'Compliance') return a.type === 'compliance';
    if (filter === 'Life Event') return a.type === 'life-event';
    if (filter === 'Optimisation') return a.type === 'optimisation';
    return true;
  });

  const unreadCount = ALERTS.filter((a) => !a.read).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Alerts & Insights</h1>
            <p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''} · {ALERTS.length} total</p>
          </div>
          <button className="btn btn-secondary btn-sm">Mark all as read</button>
        </div>
      </div>

      <div className="toggle-group" style={{ marginBottom: 24 }}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            className={`toggle-btn ${filter === opt ? 'active' : ''}`}
            onClick={() => setFilter(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert-card urgency-${alert.urgency}`}
            style={{ opacity: alert.read ? 0.7 : 1 }}
          >
            <AlertIcon type={alert.icon} />
            <div className="alert-content">
              <div className="alert-title">
                {!alert.read && (
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    marginRight: 8,
                    verticalAlign: 'middle',
                  }} />
                )}
                {alert.title}
              </div>
              <div className="alert-desc">{alert.desc}</div>
              <div className="alert-time">{alert.time}</div>
            </div>
            {alert.action && (
              <div className="alert-action">
                <button className="btn btn-ghost btn-sm">{alert.action}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
