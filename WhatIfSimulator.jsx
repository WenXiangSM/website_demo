import React, { useState, useMemo } from 'react';

// ─── IRAS YA 2026 Tax Brackets ────────────────────────────────────────────────
const TAX_BRACKETS = [
  { min: 0,      max: 20000,   rate: 0     },
  { min: 20000,  max: 30000,   rate: 0.02  },
  { min: 30000,  max: 40000,   rate: 0.035 },
  { min: 40000,  max: 80000,   rate: 0.07  },
  { min: 80000,  max: 120000,  rate: 0.115 },
  { min: 120000, max: 160000,  rate: 0.15  },
  { min: 160000, max: 200000,  rate: 0.18  },
  { min: 200000, max: 240000,  rate: 0.19  },
  { min: 240000, max: 280000,  rate: 0.195 },
  { min: 280000, max: 320000,  rate: 0.20  },
  { min: 320000, max: Infinity, rate: 0.22 },
];

function calcTax(chargeableIncome) {
  let tax = 0;
  for (const bracket of TAX_BRACKETS) {
    if (chargeableIncome <= bracket.min) break;
    const taxable = Math.min(chargeableIncome, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }
  return tax;
}

function getCurrentBracket(income) {
  for (let i = TAX_BRACKETS.length - 1; i >= 0; i--) {
    if (income > TAX_BRACKETS[i].min) return TAX_BRACKETS[i].rate * 100;
  }
  return 0;
}

// ─── IRAS Parent Relief — discrete fixed amounts only ────────────────────────
// Source: IRAS.gov.sg — Parent Relief / Handicapped Parent Relief
// You may claim for up to 2 dependants (parents, in-laws, grandparents).
// Only one claimant per dependant; amounts are fixed — no partial claims.
const PARENT_RELIEF_OPTIONS = [
  { label: '— Not claiming —',                                   value: 0     },
  { label: '1 parent, not living with you',                      value: 5500  },
  { label: '1 parent, living with you',                          value: 9000  },
  { label: '1 handicapped parent, not living with you',          value: 10000 },
  { label: '1 handicapped parent, living with you',              value: 14000 },
  { label: '2 parents, not living with you',                     value: 11000 },  // 5,500 × 2
  { label: '2 parents, living with you',                         value: 18000 },  // 9,000 × 2
  { label: '2 handicapped parents, not living',                  value: 20000 },  // 10,000 × 2
  { label: '2 handicapped parents, living',                      value: 28000 },  // 14,000 × 2
];

// ─── IRAS NSman Relief — fixed, non-discretionary ────────────────────────────
// Source: IRAS.gov.sg — NSman Relief
// Self-relief is auto-granted based on NS appointment. Cannot be partially claimed.
// NSman Wife ($750) and NSman Parent ($750) are claimed by spouse/parents respectively.
const NSMAN_OPTIONS = [
  { label: 'Not an NSman',                               value: 0    },
  { label: 'Operationally Ready (OR) NSman — $1,500',    value: 1500 },
  { label: 'Key Appointment Holder / Instructor — $3,000', value: 3000 },
];

export default function WhatIfSimulator() {
  // ── Inputs ──────────────────────────────────────────────────────────────────
  const [income, setIncome] = useState(122000);

  // Voluntary / adjustable reliefs
  const [srs, setSrs] = useState(11100);
  const [cpfTopUp, setCpfTopUp] = useState(0);
  const [parentRelief, setParentRelief] = useState(9000);  // discrete select
  const [numChildren, setNumChildren] = useState(1);        // QCR: $4,000/child
  const [lifeInsurance, setLifeInsurance] = useState(0);

  // Auto-granted fixed reliefs (user selects their situation)
  const [nsmanValue, setNsmanValue] = useState(3000);       // fixed by NS appointment

  // ── Derived values ──────────────────────────────────────────────────────────
  // QCR: $4,000 per qualifying child (non-handicapped).
  // Handicapped Child Relief (HCR) is $7,500/child — use QCR rate here for non-handicapped.
  // Combined claim by both parents cannot exceed the per-child cap.
  // Subject to the $80,000 overall personal income tax relief cap.
  const qcrAmount = numChildren * 4000;

  // Auto-reliefs: Earned Income Relief (below age 55 = $1,000) + CPF employee OA contribution
  // CPF OA employee rate: 23% of monthly wages up to OW ceiling ($8,000/month from Jan 2026)
  // = 23% × $8,000 × 12 ≈ $22,080; however capped at CPF Annual Limit ($37,740)
  // Using $20,400 as the demo employee CPF contribution figure (matches dashboard scenario)
  const EIR   = 1000;   // Earned Income Relief (age < 55; IRAS auto-grants)
  const CPF_OA = 20400; // Employee CPF contribution (auto, based on payroll)

  const fixedReliefs = EIR + CPF_OA + nsmanValue;

  // Life Insurance Relief eligibility:
  // IRAS rule: only claimable if total CPF contributions (employee + employer) < $5,000/year.
  // Employees earning above ~$12,000/year already exceed this threshold via mandatory CPF.
  // We show the slider as educational but flag ineligibility when CPF clearly exceeds $5,000.
  const lifeInsuranceEligible = (CPF_OA < 5000);

  // ── Tax computation ─────────────────────────────────────────────────────────
  const results = useMemo(() => {
    // Baseline: only fixed auto-reliefs (no voluntary top-ups)
    const baseRelief     = Math.min(80000, fixedReliefs);
    const baseChargeable = Math.max(0, income - baseRelief);
    const baseTax        = calcTax(baseChargeable);

    // Simulated: all sliders applied
    const simReliefs     = Math.min(80000,
      fixedReliefs + srs + cpfTopUp + parentRelief + qcrAmount +
      (lifeInsuranceEligible ? lifeInsurance : 0)
    );
    const simChargeable  = Math.max(0, income - simReliefs);
    const simTax         = calcTax(simChargeable);

    return {
      baseTax,
      simTax,
      savings:          baseTax - simTax,
      baseChargeable,
      simChargeable,
      totalReliefs:     simReliefs,
      baseBracket:      getCurrentBracket(baseChargeable),
      simBracket:       getCurrentBracket(simChargeable),
      reliefUtilization: (simReliefs / 80000) * 100,
      qcrAmount,
    };
  }, [income, srs, cpfTopUp, parentRelief, qcrAmount, lifeInsurance,
      nsmanValue, fixedReliefs, lifeInsuranceEligible]);

  return (
    <div>
      <div className="page-header">
        <h1>What-If Simulator</h1>
        <p>Adjust your contributions and reliefs to see the real-time tax impact</p>
      </div>

      <div className="grid-2">
        {/* ── Left: Controls ── */}
        <div>
          {/* Income */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Income</span>
            </div>
            <div className="form-group">
              <label className="form-label">Assessable Income (YA 2026)</label>
              <input
                type="range" min={30000} max={400000} step={1000}
                value={income} onChange={(e) => setIncome(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>$30,000</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
                  ${income.toLocaleString()}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>$400,000</span>
              </div>
            </div>
          </div>

          {/* Auto-reliefs (fixed by situation) */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Fixed Auto-Reliefs</span>
              <span className="card-badge">Non-discretionary</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Auto-granted by IRAS based on your situation. Cannot be partially claimed.
            </div>

            {/* Earned Income Relief — read-only */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 12px', background: 'var(--bg-muted, rgba(255,255,255,0.04))', borderRadius: 6 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Earned Income Relief</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Age &lt;55 — auto-granted</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>$1,000</span>
            </div>

            {/* CPF OA — read-only */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 12px', background: 'var(--bg-muted, rgba(255,255,255,0.04))', borderRadius: 6 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>CPF Employee Contribution</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mandatory; auto-deducted from payroll</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>$20,400</span>
            </div>

            {/* NSman Relief — select (fixed by NS appointment) */}
            <div>
              <label className="form-label" style={{ fontSize: 13, marginBottom: 6, display: 'block' }}>
                NSman Self Relief
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                  Fixed by NS appointment — not adjustable
                </span>
              </label>
              <select
                className="form-input"
                value={nsmanValue}
                onChange={(e) => setNsmanValue(Number(e.target.value))}
                style={{ fontSize: 13 }}
              >
                {NSMAN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Adjustable Reliefs */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Adjustable Reliefs</span>
              <span className="card-badge">{results.reliefUtilization.toFixed(0)}% of cap</span>
            </div>

            {/* SRS Contributions */}
            <div className="slider-container" style={{ marginBottom: 20 }}>
              <div className="slider-header">
                <span className="slider-label">SRS Contributions</span>
                <span className="slider-value">${srs.toLocaleString()}</span>
              </div>
              <input
                type="range" min={0} max={15300} step={100}
                value={srs} onChange={(e) => setSrs(Number(e.target.value))}
              />
              <div className="relief-meta">
                <span>Max $15,300/year (SC/PR); $35,700 for foreigners</span>
                <span>${(15300 - srs).toLocaleString()} headroom</span>
              </div>
            </div>

            {/* CPF Cash Top-Up (RSTU) */}
            <div className="slider-container" style={{ marginBottom: 20 }}>
              <div className="slider-header">
                <span className="slider-label">CPF Cash Top-Up (SA / RA)</span>
                <span className="slider-value">${cpfTopUp.toLocaleString()}</span>
              </div>
              <input
                type="range" min={0} max={8000} step={100}
                value={cpfTopUp} onChange={(e) => setCpfTopUp(Number(e.target.value))}
              />
              <div className="relief-meta">
                <span>Max $8,000/year (own account). SA for age &lt;55; RA for 55+. MA top-ups excluded since Jan 2023.</span>
                <span>${(8000 - cpfTopUp).toLocaleString()} headroom</span>
              </div>
            </div>

            {/* Parent Relief — discrete select (IRAS only allows fixed amounts) */}
            <div style={{ marginBottom: 20 }}>
              <div className="slider-header" style={{ marginBottom: 8 }}>
                <span className="slider-label">Parent / Handicapped Parent Relief</span>
                <span className="slider-value">${parentRelief.toLocaleString()}</span>
              </div>
              <select
                className="form-input"
                value={parentRelief}
                onChange={(e) => setParentRelief(Number(e.target.value))}
                style={{ fontSize: 13, marginBottom: 6 }}
              >
                {PARENT_RELIEF_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}{o.value > 0 ? ` — $${o.value.toLocaleString()}` : ''}
                  </option>
                ))}
              </select>
              <div className="relief-meta">
                <span>
                  Fixed amounts only: $5,500 (not living) / $9,000 (living) / $10,000 or $14,000 (handicapped).
                  One claimant per dependant. Dependant must be ≥55 yrs old or incapacitated.
                </span>
              </div>
            </div>

            {/* Qualifying Child Relief — $4,000 per child (IRAS rule) */}
            <div style={{ marginBottom: 20 }}>
              <div className="slider-header" style={{ marginBottom: 8 }}>
                <span className="slider-label">Qualifying Child Relief (QCR)</span>
                <span className="slider-value">${results.qcrAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Number of children:</span>
                <button
                  onClick={() => setNumChildren(Math.max(0, numChildren - 1))}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-primary)',
                    cursor: 'pointer', fontSize: 16, lineHeight: 1,
                  }}
                >−</button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--accent)', minWidth: 24, textAlign: 'center' }}>
                  {numChildren}
                </span>
                <button
                  onClick={() => setNumChildren(Math.min(10, numChildren + 1))}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-primary)',
                    cursor: 'pointer', fontSize: 16, lineHeight: 1,
                  }}
                >+</button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  × $4,000 = <strong style={{ color: 'var(--accent)' }}>${results.qcrAmount.toLocaleString()}</strong>
                </span>
              </div>
              <div className="relief-meta">
                <span>$4,000 per non-handicapped child ($7,500 for Handicapped Child Relief). Shareable between spouses — combined claim cannot exceed $4,000/child. Subject to $80,000 overall relief cap.</span>
              </div>
            </div>

            {/* Life Insurance Relief */}
            <div className="slider-container">
              <div className="slider-header">
                <span className="slider-label">Life Insurance Relief</span>
                <span className="slider-value">${lifeInsurance.toLocaleString()}</span>
              </div>
              {!lifeInsuranceEligible && (
                <div style={{
                  fontSize: 12, color: 'var(--warning, #f59e0b)',
                  background: 'rgba(245,158,11,0.08)', borderRadius: 6,
                  padding: '6px 10px', marginBottom: 8,
                  border: '1px solid rgba(245,158,11,0.2)',
                }}>
                  Note: Life Insurance Relief requires total CPF contributions &lt; $5,000/year.
                  As an employee with CPF contributions of $20,400, you likely do not qualify.
                  Shown here for simulation purposes only.
                </div>
              )}
              <input
                type="range" min={0} max={5000} step={100}
                value={lifeInsurance} onChange={(e) => setLifeInsurance(Number(e.target.value))}
              />
              <div className="relief-meta">
                <span>Max $5,000/year. Only claimable if total CPF contributions &lt; $5,000.</span>
                <span>${(5000 - lifeInsurance).toLocaleString()} headroom</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Simulation Result</span>
              {results.savings > 0 && <span className="tag tag-green">Savings Found</span>}
            </div>

            <div className="comparison-result">
              <div className="comparison-item">
                <div className="comparison-label">Without Optimisation</div>
                <div className="comparison-value" style={{ color: 'var(--text-secondary)' }}>
                  ${results.baseTax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>
              <div className="comparison-arrow">→</div>
              <div className="comparison-item">
                <div className="comparison-label">With Reliefs Applied</div>
                <div className="comparison-value comparison-savings">
                  ${results.simTax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>
            </div>

            {results.savings > 0 && (
              <div style={{
                textAlign: 'center', marginTop: 20, padding: '16px',
                background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Annual Savings
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-1px' }}>
                  ${results.savings.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Breakdown</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th style={{ textAlign: 'right' }}>Without Opt.</th>
                    <th style={{ textAlign: 'right' }}>Simulated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Assessable Income</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${income.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${income.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Total Reliefs</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${Math.min(80000, fixedReliefs).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>${results.totalReliefs.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Chargeable Income</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${results.baseChargeable.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>${results.simChargeable.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Marginal Tax Rate</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{results.baseBracket}%</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: results.simBracket < results.baseBracket ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {results.simBracket}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Tax Payable</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      ${results.baseTax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
                      ${results.simTax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Relief Cap Utilisation</span>
            </div>
            <div className="relief-item">
              <div className="relief-header">
                <span className="relief-name">Personal Relief Cap ($80,000)</span>
                <span className="relief-amount">${results.totalReliefs.toLocaleString()} / $80,000</span>
              </div>
              <div className="relief-bar">
                <div
                  className={`relief-bar-fill ${results.reliefUtilization > 90 ? 'warning' : ''}`}
                  style={{ width: `${Math.min(100, results.reliefUtilization)}%` }}
                />
              </div>
              <div className="relief-meta">
                <span>{results.reliefUtilization.toFixed(1)}% utilised</span>
                <span>${Math.max(0, 80000 - results.totalReliefs).toLocaleString()} remaining</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, padding: '0 2px' }}>
              The $80,000 cap applies to the total of all personal income tax reliefs combined (excl. Parenthood Tax Rebate and rebates). CPF employee contributions and SRS are included in this cap.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
