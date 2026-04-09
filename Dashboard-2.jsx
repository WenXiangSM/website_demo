import { useState } from 'react';
import SimulationReport from './SimulationReport';

const INCOME = 122000;

// ─── BEFORE: only CPF OA + Earned Income Relief (auto-populated by SGFinDex) ─
const BEFORE = {
  reliefs: [
    { name: 'Earned Income Relief',   claimed: 1000,  max: 1000,  pct: 100, type: 'auto' },
    { name: 'CPF Ordinary Account',   claimed: 20400, max: 20400, pct: 100, type: 'auto' },
    { name: 'SRS Contributions',      claimed: 0,     max: 15300, pct: 0,   type: 'optimisable' },
    { name: 'Parent Relief (Mother)', claimed: 0,     max: 9000,  pct: 0,   type: 'auto' },
    { name: 'Qualifying Child Relief',claimed: 0,     max: 8000,  pct: 0,   type: 'optimisable' },
    { name: 'NSman Self Relief',       claimed: 0,     max: 3000,  pct: 0,   type: 'auto' },
    { name: 'Life Insurance Relief',  claimed: 0,     max: 5000,  pct: 0,   type: 'optimisable' },
  ],
  totalReliefs: 21400,
  chargeableIncome: 100600,   // 122000 - 21400
  tax: 5719,                  // calcTax(100600) = 3350 + 20600*0.115 = 5719
  potentialSavings: 3468,
  bracketRate: '11.5%',
  bracketFill: 51,            // 100600 sits 51% into the 80–120k band
  donutSegments: [
    { label: 'CPF', value: 20400, color: '#2dd4bf' },
    { label: 'EIR', value: 1000,  color: '#34d399' },
  ],
  donutTotal: 21400,
  optPct: 0,
  recommendations: [
    {
      label: 'SRS',
      title: 'Top up SRS by $15,300 (max cap)',
      desc: 'Contributing the full annual SRS cap drops your chargeable income by $15,300 — pushing you into the lower 7% bracket.',
      saving: '$1,760',
      headroom: '$15,300 headroom',
      tooltip: 'SRS top-up of $15,300 reduces CI from $100,600 → $85,300. Tax falls from $5,719 → $3,959, saving ~$1,760.',
    },
    {
      label: 'REL',
      title: 'Claim Parent Relief + NSman Relief',
      desc: 'SGFinDex detected you support a parent aged 72 and you are an NSman. These reliefs total $12,000 and require a one-time claim.',
      saving: '$1,035',
      headroom: '$14,000 headroom',
      tooltip: 'Parent Relief ($9,000) + NSman Relief ($3,000) = $12,000 reduction at the 11.5% marginal rate saves ~$1,035.',
    },
    {
      label: 'INS',
      title: 'Claim Life Insurance & QCR',
      desc: 'Your policy premiums qualify for up to $5,000 Life Insurance Relief. Additionally, claim $4,000 QCR for your child.',
      saving: '$630',
      headroom: '$9,000 headroom',
      tooltip: 'Life Insurance ($5,000) + QCR ($4,000) = $9,000 at 7% bracket saves ~$630 in tax.',
    },
  ],
  brackets: [
    { rate: '0%',   range: '0–20k',    fill: 100, active: false },
    { rate: '2%',   range: '20–30k',   fill: 100, active: false },
    { rate: '3.5%', range: '30–40k',   fill: 100, active: false },
    { rate: '7%',   range: '40–80k',   fill: 100, active: false },
    { rate: '11.5%',range: '80–120k',  fill: 51,  active: true  },
    { rate: '15%',  range: '120–160k', fill: 0,   active: false },
    { rate: '18%',  range: '160–200k', fill: 0,   active: false },
  ],
  timeline: [
    { month: 'Jan', done: false, label: 'CPF auto-credited' },
    { month: 'Mar', done: false, label: 'IRAS sync' },
    { month: 'Jun', done: false, label: 'Mid-year review' },
    { month: 'Oct', done: false, label: 'SRS top-up window' },
    { month: 'Dec', done: false, label: 'Final SRS deadline' },
    { month: 'Apr', done: false, label: 'File YA 2026' },
  ],
};

// ─── AFTER: all reliefs applied ───────────────────────────────────────────
// Total reliefs: EI $1k + CPF $20.4k + SRS $15.3k + Parent $9k + NSman $3k + QCR $4k + Life Ins $5k = $57,700
// CI: 122,000 – 57,700 = 64,300  → tax = 550 + 24,300×0.07 = $2,251
const AFTER = {
  reliefs: [
    { name: 'Earned Income Relief',   claimed: 1000,  max: 1000,  pct: 100,   type: 'auto' },
    { name: 'CPF Ordinary Account',   claimed: 20400, max: 20400, pct: 100,   type: 'auto' },
    { name: 'SRS Contributions',      claimed: 15300, max: 15300, pct: 100,   type: 'optimisable' },
    { name: 'Parent Relief (Mother)', claimed: 9000,  max: 9000,  pct: 100,   type: 'auto' },
    { name: 'Qualifying Child Relief (1 of 2 children, spouse claims other $4k)', claimed: 4000, max: 8000, pct: 50, type: 'optimisable' },
    { name: 'NSman Self Relief',       claimed: 3000,  max: 3000,  pct: 100,   type: 'auto' },
    { name: 'Life Insurance Relief',  claimed: 5000,  max: 5000,  pct: 100,   type: 'optimisable' },
  ],
  totalReliefs: 57700,
  chargeableIncome: 64300,    // 122000 - 57700
  tax: 2251,                  // 550 + 24300*0.07
  potentialSavings: 0,
  bracketRate: '7%',
  bracketFill: 61,            // 64300 sits 61% into the 40–80k band
  donutSegments: [
    { label: 'CPF',    value: 20400, color: '#2dd4bf' },
    { label: 'SRS',    value: 15300, color: '#60a5fa' },
    { label: 'Parent', value: 9000,  color: '#fbbf24' },
    { label: 'Life Ins', value: 5000, color: '#f472b6' },
    { label: 'QCR',    value: 4000,  color: '#a78bfa' },
    { label: 'NSman Self', value: 3000, color: '#34d399' },
    { label: 'EIR',    value: 1000,  color: '#fb923c' },
  ],
  donutTotal: 57700,
  optPct: 100,
  recommendations: [],
  brackets: [
    { rate: '0%',   range: '0–20k',    fill: 100, active: false },
    { rate: '2%',   range: '20–30k',   fill: 100, active: false },
    { rate: '3.5%', range: '30–40k',   fill: 100, active: false },
    { rate: '7%',   range: '40–80k',   fill: 61,  active: true  },
    { rate: '11.5%',range: '80–120k',  fill: 0,   active: false },
    { rate: '15%',  range: '120–160k', fill: 0,   active: false },
    { rate: '18%',  range: '160–200k', fill: 0,   active: false },
  ],
  timeline: [
    { month: 'Jan', done: true, label: 'CPF auto-credited' },
    { month: 'Mar', done: true, label: 'IRAS sync' },
    { month: 'Jun', done: true, label: 'Mid-year review' },
    { month: 'Oct', done: true, label: 'SRS topped up' },
    { month: 'Dec', done: true, label: 'All reliefs filed' },
    { month: 'Apr', done: true, label: 'YA 2026 filed' },
  ],
};

export function ManualInputModal({ onClose }) {
  const [form, setForm] = useState({
    income: '',
    employment: 'employed',
    cpf: '',
    srs: '',
    lifeInsurance: '',
    parentRelief: false,
    nsman: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">Data Saved</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>Manual data entered successfully</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Your dashboard has been updated with the figures you provided.
            </div>
            <button className="btn btn-primary" onClick={onClose}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Manual Data Entry</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
          No bank account or SGFinDex connection? Enter your income and relief figures manually below.
        </p>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Annual Income (YA 2026)</label>
            <input className="form-input" type="number" placeholder="e.g. 80000"
              value={form.income} onChange={e => set('income', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Employment Type</label>
            <select className="form-input" value={form.employment} onChange={e => set('employment', e.target.value)}>
              <option value="employed">Full-time / Part-time Employed</option>
              <option value="self">Self-Employed / Freelance</option>
              <option value="retired">Retired / No Employment</option>
            </select>
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">CPF Contribution ($)</label>
              <input className="form-input" type="number" placeholder="e.g. 20400"
                value={form.cpf} onChange={e => set('cpf', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">SRS Contributions ($)</label>
              <input className="form-input" type="number" placeholder="e.g. 11100"
                value={form.srs} onChange={e => set('srs', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Life Insurance Premiums ($)</label>
            <input className="form-input" type="number" placeholder="e.g. 3600"
              value={form.lifeInsurance} onChange={e => set('lifeInsurance', e.target.value)} />
          </div>
          <div className="form-checks">
            <label className="form-check">
              <input type="checkbox" checked={form.parentRelief} onChange={e => set('parentRelief', e.target.checked)} />
              <span>I support a parent/grandparent (Parent Relief)</span>
            </label>
            <label className="form-check">
              <input type="checkbox" checked={form.nsman} onChange={e => set('nsman', e.target.checked)} />
              <span>I am an NSman (NSman Relief)</span>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setSubmitted(true)}>Save & Update Dashboard</button>
        </div>
      </div>
    </div>
  );
}

function DonutChart({ segments, total }) {
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const totalReliefs = total;

  return (
    <div className="donut-container">
      <div className="donut-chart" style={{ width: 200, height: 200 }}>
        <svg viewBox="0 0 200 200" width="200" height="200">
          {segments.map((seg, i) => {
            const pct = seg.value / totalReliefs;
            const dashArray = `${pct * circumference} ${circumference}`;
            const dashOffset = -offset * circumference;
            offset += pct;
            return (
              <circle key={i} cx="100" cy="100" r={radius}
                fill="none" stroke={seg.color} strokeWidth="18"
                strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                transform="rotate(-90 100 100)"
                style={{ transition: 'all 0.6s ease' }}
              />
            );
          })}
        </svg>
        <div className="donut-center">
          <div className="donut-center-value" style={{ fontSize: 26 }}>
            ${(totalReliefs / 1000).toFixed(1)}k
          </div>
          <div className="donut-center-label">of $80k</div>
        </div>
      </div>
      <div className="donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="legend-item">
            <span className="legend-dot" style={{ background: seg.color }} />
            <span>{seg.label}</span>
            <span className="legend-value">${(seg.value / 1000).toFixed(1)}k</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate = () => {}, isOptimised = false, onOptimise = () => {} }) {
  const [showSimulation, setShowSimulation] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [optimising, setOptimising] = useState(false);

  const d = isOptimised ? AFTER : BEFORE;
  const savedAmount = BEFORE.tax - AFTER.tax; // 5719 - 2251 = 3468

  const handleOptimise = () => {
    setOptimising(true);
    setTimeout(() => {
      setOptimising(false);
      onOptimise();
    }, 1400);
  };

  return (
    <div>
      {showSimulation && <SimulationReport onClose={() => setShowSimulation(false)} />}
      {showManualInput && <ManualInputModal onClose={() => setShowManualInput(false)} />}

      {/* ── Optimise Now banner (only shown before optimisation) ── */}
      {!isOptimised && (
        <div className="optimise-banner">
          <div className="optimise-banner-left">
            <div className="optimise-banner-icon">!</div>
            <div>
              <div className="optimise-banner-title">You have not optimised your taxes yet</div>
              <div className="optimise-banner-sub">
                TaxSG detected <strong>$3,468</strong> in unclaimed reliefs. Apply all recommendations below to reduce your tax from <strong>${BEFORE.tax.toLocaleString()}</strong> → <strong>${AFTER.tax.toLocaleString()}</strong>.
              </div>
            </div>
          </div>
          <button
            className={`btn btn-accent ${optimising ? 'btn-loading' : ''}`}
            onClick={handleOptimise}
            disabled={optimising}
          >
            {optimising ? 'Applying…' : '✦ Optimise Now'}
          </button>
        </div>
      )}

      {/* ── Success banner (shown after optimisation) ── */}
      {isOptimised && (
        <div className="optimise-success-banner">
          <span className="optimise-success-icon">✓</span>
          <div>
            <div className="optimise-success-title">Tax fully optimised for YA 2026</div>
            <div className="optimise-success-sub">
              You saved <strong>${savedAmount.toLocaleString()}</strong> — chargeable income reduced from ${BEFORE.chargeableIncome.toLocaleString()} to ${AFTER.chargeableIncome.toLocaleString()}, tax from ${BEFORE.tax.toLocaleString()} to ${AFTER.tax.toLocaleString()}.
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Tax Dashboard</h1>
            <p>YA 2026 · Last synced with SGFinDex 2 hours ago</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setShowManualInput(true)}>
              ✎ Manual Input
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('simulator')}>
              What-If Simulator
            </button>
            <button className="btn btn-primary" onClick={() => setShowSimulation(true)}>
              Run Simulation
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Assessable Income</div>
          <div className="stat-value"><span className="currency">$</span>{INCOME.toLocaleString()}</div>
          <div className="stat-change positive">+8.9% from YA 2025</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Reliefs Claimed</div>
          <div className="stat-value"><span className="currency">$</span>{d.totalReliefs.toLocaleString()}</div>
          <div className="stat-change neutral">{((d.totalReliefs / 80000) * 100).toFixed(1)}% of $80k cap</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Tax Payable</div>
          <div className="stat-value"><span className="currency">$</span>{d.tax.toLocaleString()}</div>
          <div className={`stat-change ${isOptimised ? 'positive' : 'negative'}`}>
            {isOptimised ? `Saved $${savedAmount.toLocaleString()} ✓` : 'Optimisable'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{isOptimised ? 'Tax Saved' : 'Potential Savings'}</div>
          <div className="stat-value"><span className="currency">$</span>{isOptimised ? savedAmount.toLocaleString() : d.potentialSavings.toLocaleString()}</div>
          <div className={`stat-change ${isOptimised ? 'positive' : 'neutral'}`}>
            {isOptimised ? 'Fully optimised ✓' : '3 actions available'}
          </div>
        </div>
      </div>

      {/* ── Year-round optimisation progress tracker ── */}
      <div className="card optimisation-tracker" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Tax Optimisation Progress · YA 2026</span>
          <span className="card-badge">Year-round</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              You've optimised{' '}
              <strong style={{ color: isOptimised ? 'var(--accent)' : 'var(--danger)' }}>
                {d.optPct}%
              </strong>{' '}
              of your tax potential
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isOptimised ? 'All done ✓' : '3 actions remaining'}
            </span>
          </div>
          <div className="opt-progress-bar">
            <div className="opt-progress-fill" style={{ width: `${d.optPct}%` }} />
          </div>
        </div>
        <div className="opt-timeline">
          {d.timeline.map((step, i) => (
            <div key={i} className={`opt-step ${step.done ? 'done' : 'pending'}`}>
              <div className="opt-dot" />
              <span className="opt-month">{step.month}</span>
              <span className="opt-step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Donut + Bracket ── */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Relief Allocation</span>
            <span className="card-badge">{((d.totalReliefs / 80000) * 100).toFixed(1)}% used</span>
          </div>
          <DonutChart segments={d.donutSegments} total={d.donutTotal} />
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Tax Bracket Position</span>
            <span className="card-badge">{d.bracketRate} bracket</span>
          </div>
          <div className="bracket-viz">
            {d.brackets.map((b, i) => (
              <div key={i} className={`bracket-row ${b.active ? 'bracket-current' : ''}`}>
                <span className="bracket-rate">{b.rate}</span>
                <div className="bracket-bar-track">
                  <div
                    className={`bracket-bar-value ${b.active ? 'active' : 'inactive'}`}
                    style={{ width: `${b.fill}%` }}
                  />
                </div>
                <span className="bracket-amount">{b.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Relief breakdown ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Relief Breakdown</span>
          <span className="card-badge">{d.reliefs.length} items</span>
        </div>
        <div className="relief-list">
          {d.reliefs.map((r, i) => (
            <div key={i} className="relief-item">
              <div className="relief-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="relief-name">{r.name}</span>
                  {r.type === 'auto' ? (
                    <span className="relief-type-badge auto">🔒 Auto-allocated (non-transferable)</span>
                  ) : (
                    <span className="relief-type-badge optimisable">⇄ Optimisable (transferable)</span>
                  )}
                </div>
                <span className="relief-amount">
                  ${r.claimed.toLocaleString()} / ${r.max.toLocaleString()}
                </span>
              </div>
              <div className="relief-bar">
                <div
                  className={`relief-bar-fill ${r.pct > 0 && r.pct < 100 ? 'warning' : ''} ${r.pct === 0 ? 'empty' : ''}`}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
              <div className="relief-meta">
                {r.pct === 0
                  ? <span style={{ color: 'var(--danger)' }}>Not claimed</span>
                  : <span>{r.pct}% utilised</span>
                }
                {r.pct < 100 && <span>${(r.max - r.claimed).toLocaleString()} available</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recommendations (hidden after optimisation) ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recommendations</span>
          <span className="card-badge">
            {isOptimised ? 'All done ✓' : `${BEFORE.recommendations.length} actions`}
          </span>
        </div>

        {isOptimised ? (
          <div className="rec-all-done">
            <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--accent)', marginBottom: 6 }}>
              All recommendations applied
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              You've claimed every eligible relief for YA 2026. Check back after Jan 2027 for YA 2027 optimisation.
            </div>
          </div>
        ) : (
          BEFORE.recommendations.map((rec, i) => (
            <div key={i} className="recommendation">
              <div className="rec-label-badge">{rec.label}</div>
              <div className="rec-content">
                <div className="rec-title">{rec.title}</div>
                <div className="rec-desc">{rec.desc}</div>
                {rec.headroom && (
                  <div className="rec-headroom">
                    <span className="headroom-tag">{rec.headroom}</span>
                    <span
                      className="headroom-help"
                      onMouseEnter={() => setActiveTooltip(i)}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      ?
                      {activeTooltip === i && (
                        <span className="headroom-tooltip">{rec.tooltip}</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
              <div className="rec-saving">
                <div className="rec-saving-value">{rec.saving}</div>
                <div className="rec-saving-label">potential</div>
              </div>
            </div>
          ))
        )}

        {!isOptimised && (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <button
              className={`btn btn-accent btn-lg ${optimising ? 'btn-loading' : ''}`}
              onClick={handleOptimise}
              disabled={optimising}
            >
              {optimising ? 'Applying all recommendations…' : '✦ Apply All Recommendations'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
