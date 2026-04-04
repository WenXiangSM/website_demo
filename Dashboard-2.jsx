import { useState } from 'react';
import SimulationReport from './SimulationReport';

const RELIEFS = [
  { name: 'Earned Income Relief', claimed: 1000, max: 1000, pct: 100 },
  { name: 'CPF Ordinary Account', claimed: 20400, max: 20400, pct: 100 },
  { name: 'SRS Contributions', claimed: 11100, max: 15300, pct: 72.5 },
  { name: 'Parent Relief (Mother)', claimed: 9000, max: 9000, pct: 100 },
  { name: 'Qualifying Child Relief', claimed: 4000, max: 8000, pct: 50 },
  { name: 'NSman Relief', claimed: 3000, max: 5000, pct: 60 },
];

const BRACKETS = [
  { rate: '0%', range: '0–20k', fill: 100, active: false },
  { rate: '2%', range: '20–30k', fill: 100, active: false },
  { rate: '3.5%', range: '30–40k', fill: 100, active: false },
  { rate: '7%', range: '40–80k', fill: 100, active: false },
  { rate: '11.5%', range: '80–120k', fill: 65, active: true },
  { rate: '15%', range: '120–160k', fill: 0, active: false },
  { rate: '18%', range: '160–200k', fill: 0, active: false },
];

const RECOMMENDATIONS = [
  {
    label: 'SRS',
    title: 'Top up SRS by $4,200 before 31 Dec',
    desc: 'Maximise your annual SRS cap and move fully into the 7% bracket.',
    saving: '$1,830',
  },
  {
    label: 'QCR',
    title: 'Shift QCR to spouse',
    desc: 'Your spouse is in the 15% bracket — reallocating Qualifying Child Relief saves more at the household level.',
    saving: '$560',
  },
  {
    label: 'INS',
    title: 'Claim Life Insurance Relief',
    desc: 'Your policy premiums are eligible for up to $5,000 of unclaimed relief.',
    saving: '$575',
  },
];

function DonutChart() {
  const segments = [
    { label: 'CPF', value: 20400, color: '#2dd4bf' },
    { label: 'SRS', value: 11100, color: '#60a5fa' },
    { label: 'Parent', value: 9000, color: '#fbbf24' },
    { label: 'QCR', value: 4000, color: '#a78bfa' },
    { label: 'Others', value: 4000, color: '#34d399' },
  ];
  const total = segments.reduce((s, i) => s + i.value, 0);
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut-container">
      <div className="donut-chart" style={{ width: 200, height: 200 }}>
        <svg viewBox="0 0 200 200" width="200" height="200">
          {segments.map((seg, i) => {
            const pct = seg.value / total;
            const dashArray = `${pct * circumference} ${circumference}`;
            const dashOffset = -offset * circumference;
            offset += pct;
            return (
              <circle
                key={i}
                cx="100" cy="100" r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 100 100)"
                style={{ transition: 'all 0.6s ease' }}
              />
            );
          })}
        </svg>
        <div className="donut-center">
          <div className="donut-center-value" style={{ fontSize: 26 }}>$48.5k</div>
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

export default function Dashboard({ onNavigate }) {
  const [showSimulation, setShowSimulation] = useState(false);

  return (
    <div>
      {showSimulation && <SimulationReport onClose={() => setShowSimulation(false)} />}

      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Tax Dashboardd</h1>
            <p>YA 2026 · Last synced with SGFinDex 2 hours ago</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => onNavigate('simulator')}>
              What-If Simulator
            </button>
            <button className="btn btn-primary" onClick={() => setShowSimulation(true)}>
              Run Simulation
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Assessable Income</div>
          <div className="stat-value"><span className="currency">$</span>122,000</div>
          <div className="stat-change positive">+8.9% from YA 2025</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Reliefs Claimed</div>
          <div className="stat-value"><span className="currency">$</span>48,500</div>
          <div className="stat-change neutral">60.6% of $80k cap</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Tax Payable</div>
          <div className="stat-value"><span className="currency">$</span>5,092</div>
          <div className="stat-change negative">Optimisable</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Potential Savings</div>
          <div className="stat-value"><span className="currency">$</span>2,965</div>
          <div className="stat-change positive">3 actions available</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Relief Allocation</span>
            <span className="card-badge">60.6% used</span>
          </div>
          <DonutChart />
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Tax Bracket Position</span>
            <span className="card-badge">11.5% bracket</span>
          </div>
          <div className="bracket-viz">
            {BRACKETS.map((b, i) => (
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

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Relief Breakdown</span>
          <span className="card-badge">{RELIEFS.length} items</span>
        </div>
        <div className="relief-list">
          {RELIEFS.map((r, i) => (
            <div key={i} className="relief-item">
              <div className="relief-header">
                <span className="relief-name">{r.name}</span>
                <span className="relief-amount">
                  ${r.claimed.toLocaleString()} / ${r.max.toLocaleString()}
                </span>
              </div>
              <div className="relief-bar">
                <div
                  className={`relief-bar-fill ${r.pct < 100 ? 'warning' : ''}`}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
              <div className="relief-meta">
                <span>{r.pct}% utilised</span>
                {r.pct < 100 && <span>${(r.max - r.claimed).toLocaleString()} available</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recommendations</span>
          <span className="card-badge">3 actions</span>
        </div>
        {RECOMMENDATIONS.map((rec, i) => (
          <div key={i} className="recommendation">
            <div className="rec-label-badge">{rec.label}</div>
            <div className="rec-content">
              <div className="rec-title">{rec.title}</div>
              <div className="rec-desc">{rec.desc}</div>
            </div>
            <div className="rec-saving">
              <div className="rec-saving-value">{rec.saving}</div>
              <div className="rec-saving-label">potential</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
