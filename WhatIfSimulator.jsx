import React, { useState, useMemo } from 'react';

const TAX_BRACKETS = [
  { min: 0, max: 20000, rate: 0 },
  { min: 20000, max: 30000, rate: 0.02 },
  { min: 30000, max: 40000, rate: 0.035 },
  { min: 40000, max: 80000, rate: 0.07 },
  { min: 80000, max: 120000, rate: 0.115 },
  { min: 120000, max: 160000, rate: 0.15 },
  { min: 160000, max: 200000, rate: 0.18 },
  { min: 200000, max: 240000, rate: 0.19 },
  { min: 240000, max: 280000, rate: 0.195 },
  { min: 280000, max: 320000, rate: 0.20 },
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

export default function WhatIfSimulator() {
  const [income, setIncome] = useState(122000);
  const [srs, setSrs] = useState(11100);
  const [cpfTopUp, setCpfTopUp] = useState(0);
  const [parentRelief, setParentRelief] = useState(9000);
  const [qcr, setQcr] = useState(4000);
  const [lifeInsurance, setLifeInsurance] = useState(0);

  const baseReliefs = 1000 + 20400 + 3000; // Earned Income + CPF OA + NSman
  
  const results = useMemo(() => {
    const currentReliefs = baseReliefs + 11100 + 9000 + 4000;
    const currentChargeable = Math.max(0, income - currentReliefs);
    const currentTax = calcTax(currentChargeable);

    const newReliefs = Math.min(80000, baseReliefs + srs + cpfTopUp + parentRelief + qcr + lifeInsurance);
    const newChargeable = Math.max(0, income - newReliefs);
    const newTax = calcTax(newChargeable);

    return {
      currentTax,
      newTax,
      savings: currentTax - newTax,
      currentChargeable,
      newChargeable,
      totalReliefs: newReliefs,
      currentBracket: getCurrentBracket(currentChargeable),
      newBracket: getCurrentBracket(newChargeable),
      reliefUtilization: (newReliefs / 80000) * 100,
    };
  }, [income, srs, cpfTopUp, parentRelief, qcr, lifeInsurance, baseReliefs]);

  return (
    <div>
      <div className="page-header">
        <h1>What-If Simulator</h1>
        <p>Adjust your contributions and reliefs to see the real-time tax impact</p>
      </div>

      <div className="grid-2">
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Income</span>
            </div>
            <div className="form-group">
              <label className="form-label">Assessable Income (YA 2026)</label>
              <input
                type="range"
                min={30000}
                max={400000}
                step={1000}
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
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

          <div className="card">
            <div className="card-header">
              <span className="card-title">Adjustable Reliefs</span>
              <span className="card-badge">{results.reliefUtilization.toFixed(0)}% of cap</span>
            </div>

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
                <span>Max $15,300/year</span>
                <span>${(15300 - srs).toLocaleString()} headroom</span>
              </div>
            </div>

            <div className="slider-container" style={{ marginBottom: 20 }}>
              <div className="slider-header">
                <span className="slider-label">CPF Cash Top-Up (SA/MA)</span>
                <span className="slider-value">${cpfTopUp.toLocaleString()}</span>
              </div>
              <input
                type="range" min={0} max={8000} step={100}
                value={cpfTopUp} onChange={(e) => setCpfTopUp(Number(e.target.value))}
              />
              <div className="relief-meta">
                <span>Max $8,000/year</span>
                <span>${(8000 - cpfTopUp).toLocaleString()} headroom</span>
              </div>
            </div>

            <div className="slider-container" style={{ marginBottom: 20 }}>
              <div className="slider-header">
                <span className="slider-label">Parent Relief</span>
                <span className="slider-value">${parentRelief.toLocaleString()}</span>
              </div>
              <input
                type="range" min={0} max={14000} step={1000}
                value={parentRelief} onChange={(e) => setParentRelief(Number(e.target.value))}
              />
              <div className="relief-meta">
                <span>$5,500 (not living) / $9,000 (living) / $14,000 (handicapped)</span>
              </div>
            </div>

            <div className="slider-container" style={{ marginBottom: 20 }}>
              <div className="slider-header">
                <span className="slider-label">Qualifying Child Relief</span>
                <span className="slider-value">${qcr.toLocaleString()}</span>
              </div>
              <input
                type="range" min={0} max={8000} step={1000}
                value={qcr} onChange={(e) => setQcr(Number(e.target.value))}
              />
              <div className="relief-meta">
                <span>$4,000 per child (max $50k cap)</span>
              </div>
            </div>

            <div className="slider-container">
              <div className="slider-header">
                <span className="slider-label">Life Insurance Relief</span>
                <span className="slider-value">${lifeInsurance.toLocaleString()}</span>
              </div>
              <input
                type="range" min={0} max={5000} step={100}
                value={lifeInsurance} onChange={(e) => setLifeInsurance(Number(e.target.value))}
              />
              <div className="relief-meta">
                <span>Max $5,000/year</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Simulation Result</span>
              {results.savings > 0 && <span className="tag tag-green">Savings Found</span>}
            </div>

            <div className="comparison-result">
              <div className="comparison-item">
                <div className="comparison-label">Current Tax</div>
                <div className="comparison-value" style={{ color: 'var(--text-secondary)' }}>
                  ${results.currentTax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>
              <div className="comparison-arrow">→</div>
              <div className="comparison-item">
                <div className="comparison-label">Optimised Tax</div>
                <div className="comparison-value comparison-savings">
                  ${results.newTax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>
            </div>

            {results.savings > 0 && (
              <div style={{
                textAlign: 'center',
                marginTop: 20,
                padding: '16px',
                background: 'var(--accent-dim)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Annual Savings
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 36,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  letterSpacing: '-1px',
                }}>
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
                    <th style={{ textAlign: 'right' }}>Current</th>
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
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${(baseReliefs + 11100 + 9000 + 4000).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>${results.totalReliefs.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Chargeable Income</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${results.currentChargeable.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>${results.newChargeable.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Marginal Tax Rate</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{results.currentBracket}%</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: results.newBracket < results.currentBracket ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {results.newBracket}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Tax Payable</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      ${results.currentTax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
                      ${results.newTax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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
          </div>
        </div>
      </div>
    </div>
  );
}
