import React, { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Connecting to SGFinDex...', detail: 'Authenticating via Singpass — CPF Board, IRAS, DBS' },
  { label: 'Fetching financial data...', detail: 'Retrieving income, CPF contributions, SRS balance' },
  { label: 'Running compliance checks...', detail: 'Validating 12 relief eligibility rules against IRAS guidelines' },
  { label: 'Computing optimisation permutations...', detail: 'Evaluating 847 relief combinations under $80k cap' },
  { label: 'Resolving dependency conflicts...', detail: 'Checking household allocation overlaps across spouses' },
  { label: 'Generating savings report...', detail: 'Finalising personalised recommendations' },
];

const REPORT = {
  currentTax: 5092,
  optimisedTax: 2127,
  totalSavings: 2965,
  reliefHeadroom: 31500,
  actions: [
    {
      priority: 'HIGH',
      icon: 'SRS',
      title: 'Top up SRS by $4,200 before 31 Dec 2026',
      desc: 'Drops your effective bracket from 11.5% to 7%, maximising the annual SRS cap of $15,300.',
      saving: 1830,
      deadline: '31 Dec 2026',
      tag: 'Deadline',
    },
    {
      priority: 'HIGH',
      icon: 'QCR',
      title: 'Reallocate QCR to spouse',
      desc: 'Your spouse is in the 15% bracket. Shifting Qualifying Child Relief ($4,000) saves more household tax.',
      saving: 560,
      deadline: 'YA 2026 filing',
      tag: 'Household',
    },
    {
      priority: 'MEDIUM',
      icon: 'INS',
      title: 'Claim Life Insurance Relief',
      desc: 'Your policy premiums qualify for up to $5,000 of unclaimed relief — currently $0 claimed.',
      saving: 575,
      deadline: 'YA 2026 filing',
      tag: 'Unclaimed',
    },
  ],
  compliance: [
    { status: 'ok', label: 'Earned Income Relief — within cap' },
    { status: 'ok', label: 'CPF OA contributions — fully verified' },
    { status: 'warn', label: 'SRS contributions — $4,200 below annual max' },
    { status: 'ok', label: 'Parent Relief — no duplicate detected' },
    { status: 'warn', label: 'Life Insurance Relief — unclaimed, eligible' },
    { status: 'ok', label: 'NSman Relief — correctly applied' },
  ],
};

export default function SimulationReport({ onClose }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    let current = 0;
    const advance = () => {
      current += 1;
      if (current < STEPS.length) {
        setStepIndex(current);
        setTimeout(advance, 700 + Math.random() * 500);
      } else {
        setTimeout(() => setDone(true), 600);
      }
    };
    setTimeout(advance, 800);
  }, []);

  const priorityColor = p =>
    p === 'HIGH' ? 'var(--danger)' : p === 'MEDIUM' ? 'var(--warning)' : 'var(--info)';

  return (
    <div className={`sim-overlay ${visible ? 'sim-overlay-visible' : ''}`}>
      <div className="sim-modal">

        {/* Header */}
        <div className="sim-header">
          <div>
            <div className="sim-header-label">TaxSG Simulation Engine</div>
            <h2 className="sim-header-title">
              {done ? 'Optimisation Report — YA 2026' : 'Running simulation...'}
            </h2>
          </div>
          {done && (
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          )}
        </div>

        {/* Running steps */}
        <div className="sim-steps">
          {STEPS.map((step, i) => {
            const isActive = i === stepIndex && !done;
            const isDone = i < stepIndex || done;
            return (
              <div key={i} className={`sim-step ${isDone ? 'sim-step-done' : ''} ${isActive ? 'sim-step-active' : ''}`}>
                <div className="sim-step-icon">
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill="var(--accent)" fillOpacity="0.2"/>
                      <path d="M4 7l2.5 2.5L10 5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : isActive ? (
                    <div className="sim-spinner" />
                  ) : (
                    <div className="sim-step-dot" />
                  )}
                </div>
                <div className="sim-step-text">
                  <div className="sim-step-label">{step.label}</div>
                  {(isActive || isDone) && (
                    <div className="sim-step-detail">{step.detail}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Report (shown after done) */}
        {done && (
          <div className="sim-report">
            <div className="section-divider" />

            {/* Summary stats */}
            <div className="sim-summary-grid">
              <div className="sim-summary-card">
                <div className="sim-summary-label">Current Tax Payable</div>
                <div className="sim-summary-value" style={{ color: 'var(--text-primary)' }}>
                  ${REPORT.currentTax.toLocaleString()}
                </div>
              </div>
              <div className="sim-arrow">→</div>
              <div className="sim-summary-card sim-summary-card-highlight">
                <div className="sim-summary-label">Optimised Tax Payable</div>
                <div className="sim-summary-value" style={{ color: 'var(--accent)' }}>
                  ${REPORT.optimisedTax.toLocaleString()}
                </div>
              </div>
              <div className="sim-summary-card">
                <div className="sim-summary-label">Total Savings Found</div>
                <div className="sim-summary-value" style={{ color: 'var(--accent)' }}>
                  +${REPORT.totalSavings.toLocaleString()}
                </div>
                <div className="sim-summary-sub">3 actions required</div>
              </div>
              <div className="sim-summary-card">
                <div className="sim-summary-label">Relief Headroom Left</div>
                <div className="sim-summary-value" style={{ color: 'var(--warning)' }}>
                  ${REPORT.reliefHeadroom.toLocaleString()}
                </div>
                <div className="sim-summary-sub">of $80k cap unused</div>
              </div>
            </div>

            {/* Recommended actions */}
            <div className="sim-section-title">Recommended Actions</div>
            {REPORT.actions.map((action, i) => (
              <div key={i} className="sim-action">
                <div className="sim-action-left">
                  <div className="sim-action-icon" style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-active)',
                    borderRadius: 8,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--accent)',
                    letterSpacing: '0.3px',
                    flexShrink: 0,
                  }}>{action.icon}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        className="sim-priority-badge"
                        style={{ background: priorityColor(action.priority) + '22', color: priorityColor(action.priority) }}
                      >
                        {action.priority}
                      </span>
                      <span className="tag tag-blue" style={{ fontSize: 10 }}>{action.tag}</span>
                    </div>
                    <div className="sim-action-title">{action.title}</div>
                    <div className="sim-action-desc">{action.desc}</div>
                    <div className="sim-action-deadline">Deadline: {action.deadline}</div>
                  </div>
                </div>
                <div className="sim-action-saving">
                  <div className="sim-saving-value">+${action.saving.toLocaleString()}</div>
                  <div className="sim-saving-label">savings</div>
                </div>
              </div>
            ))}

            {/* Compliance checks */}
            <div className="sim-section-title" style={{ marginTop: 24 }}>Compliance Checks</div>
            <div className="sim-compliance-grid">
              {REPORT.compliance.map((c, i) => (
                <div key={i} className="sim-compliance-item">
                  <span className={`sim-compliance-dot ${c.status === 'ok' ? 'dot-ok' : 'dot-warn'}`} />
                  <span className="sim-compliance-label">{c.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="sim-cta">
              <button className="btn btn-primary" style={{ gap: 8 }} onClick={onClose}>
                Apply All Recommendations
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Review Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
