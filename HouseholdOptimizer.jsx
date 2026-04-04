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

function calcTax(income) {
  let tax = 0;
  for (const b of TAX_BRACKETS) {
    if (income <= b.min) break;
    tax += (Math.min(income, b.max) - b.min) * b.rate;
  }
  return tax;
}

function getBracket(income) {
  for (let i = TAX_BRACKETS.length - 1; i >= 0; i--) {
    if (income > TAX_BRACKETS[i].min) return `${TAX_BRACKETS[i].rate * 100}%`;
  }
  return '0%';
}

const SHAREABLE_RELIEFS = [
  { id: 'parent', name: 'Parent Relief (Mother)', max: 9000 },
  { id: 'parentF', name: 'Parent Relief (Father)', max: 9000 },
  { id: 'qcr', name: 'Qualifying Child Relief', max: 8000 },
];

export default function HouseholdOptimizer() {
  const [husbandIncome, setHusbandIncome] = useState(155000);
  const [wifeIncome, setWifeIncome] = useState(88000);
  const [allocations, setAllocations] = useState({
    parent: 80,
    parentF: 50,
    qcr: 70,
  });

  const results = useMemo(() => {
    const hFixed = 1000 + 20400 + 3000 + 15300;
    const wFixed = 1000 + 20400 + 3000 + 11100;

    let hShareable = 0;
    let wShareable = 0;
    SHAREABLE_RELIEFS.forEach((r) => {
      const pct = allocations[r.id] / 100;
      hShareable += r.max * pct;
      wShareable += r.max * (1 - pct);
    });

    const hRelief = Math.min(80000, hFixed + hShareable);
    const wRelief = Math.min(80000, wFixed + wShareable);
    const hChargeable = Math.max(0, husbandIncome - hRelief);
    const wChargeable = Math.max(0, wifeIncome - wRelief);
    const hTax = calcTax(hChargeable);
    const wTax = calcTax(wChargeable);

    // baseline: 50/50 split
    let hBase = 0, wBase = 0;
    SHAREABLE_RELIEFS.forEach((r) => {
      hBase += r.max * 0.5;
      wBase += r.max * 0.5;
    });
    const hBaseRelief = Math.min(80000, hFixed + hBase);
    const wBaseRelief = Math.min(80000, wFixed + wBase);
    const baseTax = calcTax(Math.max(0, husbandIncome - hBaseRelief)) + calcTax(Math.max(0, wifeIncome - wBaseRelief));

    return {
      husbandTax: hTax,
      wifeTax: wTax,
      householdTax: hTax + wTax,
      baseTax,
      savings: baseTax - (hTax + wTax),
      hChargeable,
      wChargeable,
      hRelief,
      wRelief,
      hBracket: getBracket(hChargeable),
      wBracket: getBracket(wChargeable),
    };
  }, [husbandIncome, wifeIncome, allocations]);

  const updateAlloc = (id, val) => {
    setAllocations((prev) => ({ ...prev, [id]: val }));
  };

  const optimise = () => {
    // Greedy: give each relief to whoever has higher marginal rate
    const newAlloc = {};
    SHAREABLE_RELIEFS.forEach((r) => {
      newAlloc[r.id] = husbandIncome > wifeIncome ? 100 : 0;
    });
    setAllocations(newAlloc);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Household Optimiser</h1>
            <p>Allocate shareable reliefs between spouses to maximise household savings</p>
          </div>
          <button className="btn btn-primary" onClick={optimise}>⚡ Auto-Optimise</button>
        </div>
      </div>

      {/* Income inputs */}
      <div className="household-split" style={{ marginBottom: 24 }}>
        <div className="card spouse-card">
          <h3>Husband</h3>
          <div className="spouse-income">Bracket: {results.hBracket}</div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assessable Income</label>
            <input
              type="range" min={30000} max={400000} step={1000}
              value={husbandIncome}
              onChange={(e) => setHusbandIncome(Number(e.target.value))}
            />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--accent)', textAlign: 'center', marginTop: 4 }}>
              ${husbandIncome.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="vs-divider">
          <div className="vs-text">VS</div>
        </div>

        <div className="card spouse-card">
          <h3>Wife</h3>
          <div className="spouse-income">Bracket: {results.wBracket}</div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assessable Income</label>
            <input
              type="range" min={30000} max={400000} step={1000}
              value={wifeIncome}
              onChange={(e) => setWifeIncome(Number(e.target.value))}
            />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--accent)', textAlign: 'center', marginTop: 4 }}>
              ${wifeIncome.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Relief Allocation Sliders */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Shareable Relief Allocation</span>
          <span className="card-badge">Drag to allocate</span>
        </div>

        {SHAREABLE_RELIEFS.map((relief) => {
          const pct = allocations[relief.id];
          const hAmount = (relief.max * pct / 100);
          const wAmount = (relief.max * (100 - pct) / 100);
          return (
            <div key={relief.id} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{relief.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Max ${relief.max.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', width: 70, textAlign: 'right' }}>
                  H: ${hAmount.toLocaleString()}
                </span>
                <input
                  type="range" min={0} max={100} step={5}
                  value={pct}
                  onChange={(e) => updateAlloc(relief.id, Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--info)', width: 70 }}>
                  W: ${wAmount.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>← Husband ({pct}%)</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Wife ({100 - pct}%) →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results */}
      <div className="grid-3">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-header" style={{ justifyContent: 'center' }}>
            <span className="card-title">Husband's Tax</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            ${results.husbandTax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Chargeable: ${results.hChargeable.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Reliefs: ${results.hRelief.toLocaleString()}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-header" style={{ justifyContent: 'center' }}>
            <span className="card-title">Wife's Tax</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            ${results.wifeTax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Chargeable: ${results.wChargeable.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Reliefs: ${results.wRelief.toLocaleString()}
          </div>
        </div>

        <div className="card" style={{
          textAlign: 'center',
          background: results.savings > 0
            ? 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(34,197,94,0.03))'
            : 'var(--bg-card)',
          borderColor: results.savings > 0 ? 'var(--border-active)' : 'var(--border)',
        }}>
          <div className="card-header" style={{ justifyContent: 'center' }}>
            <span className="card-title">Household Total</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
            ${results.householdTax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </div>
          {results.savings > 0 ? (
            <div className="tag tag-green" style={{ display: 'inline-flex' }}>
              Save ${results.savings.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} vs 50/50 split
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>vs baseline: ${results.baseTax.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
          )}
        </div>
      </div>

      {/* Detailed comparison */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <span className="card-title">Allocation Summary</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Relief</th>
                <th style={{ textAlign: 'right' }}>Husband</th>
                <th style={{ textAlign: 'right' }}>Wife</th>
                <th style={{ textAlign: 'center' }}>Split</th>
              </tr>
            </thead>
            <tbody>
              {SHAREABLE_RELIEFS.map((r) => {
                const pct = allocations[r.id];
                return (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      ${(r.max * pct / 100).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--info)' }}>
                      ${(r.max * (100 - pct) / 100).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="tag tag-green">{pct}% / {100 - pct}%</span>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ fontWeight: 600 }}>Total Shareable</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
                  ${SHAREABLE_RELIEFS.reduce((s, r) => s + r.max * allocations[r.id] / 100, 0).toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--info)' }}>
                  ${SHAREABLE_RELIEFS.reduce((s, r) => s + r.max * (100 - allocations[r.id]) / 100, 0).toLocaleString()}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
