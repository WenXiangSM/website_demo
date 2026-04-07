import { useState, useEffect } from 'react';

const WIZARD_STEPS = ['Review Data', 'Reliefs', 'Declare', 'Submit'];

const PREFILLED_DATA = {
  name: 'Lum Wen Xiang',
  nric: 'S****789A',
  ya: '2026',
  residency: 'Singapore Citizen',
  assessableIncome: 122000,
  employment: 'Full-time Employed',
  employer: 'TechCorp Pte Ltd',
  cpfEmployee: 20400,
  srs: 11100,
  bonus: 18000,
  otherIncome: 0,
};

const INITIAL_RELIEFS = [
  { id: 1, name: 'Earned Income Relief', amount: 1000, max: 1000, source: 'Auto — IRAS', editable: false },
  { id: 2, name: 'CPF (OA) Contribution Relief', amount: 20400, max: 20400, source: 'Auto — CPF Board', editable: false },
  { id: 3, name: 'SRS Contributions Relief', amount: 11100, max: 15300, source: 'Auto — SRS Operator', editable: false },
  { id: 4, name: 'Parent Relief (Mother)', amount: 9000, max: 9000, source: 'Auto — CPF Board', editable: false },
  { id: 5, name: 'NSman (Active) Relief', amount: 3000, max: 5000, source: 'Auto — MINDEF', editable: false },
  { id: 6, name: 'Life Insurance Relief', amount: 5000, max: 5000, source: 'Recommended — unclaimed', editable: true, recommended: true },
];

const SUBMIT_STEPS = [
  { label: 'Encrypting filing data...', detail: 'AES-256 end-to-end encryption via Singpass PKI' },
  { label: 'Connecting to MyTax Portal...', detail: 'Establishing secure session with IRAS API gateway' },
  { label: 'Submitting YA 2026 return...', detail: 'Uploading income, reliefs and declarations' },
  { label: 'Awaiting IRAS acknowledgement...', detail: 'Reference number being generated' },
];

function StepIndicator({ current }) {
  return (
    <div className="filing-step-indicator">
      {WIZARD_STEPS.map((label, i) => (
        <div key={i} className={`filing-step-item ${i === current ? 'active' : i < current ? 'done' : ''}`}>
          <div className="filing-step-circle">
            {i < current ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span className="filing-step-label">{label}</span>
          {i < WIZARD_STEPS.length - 1 && <div className={`filing-step-line ${i < current ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

function DataRow({ label, value, source, highlight }) {
  return (
    <div className={`filing-data-row ${highlight ? 'highlight' : ''}`}>
      <div className="filing-data-label">{label}</div>
      <div className="filing-data-right">
        <div className="filing-data-value">{value}</div>
        {source && <div className="filing-data-source">{source}</div>}
      </div>
    </div>
  );
}

/* ─── Step 1: Review pre-filled data ─── */
function StepReviewData({ onNext }) {
  return (
    <div className="filing-step-content">
      <div className="filing-section-header">
        <h2 className="filing-section-title">Pre-filled Income Data</h2>
        <p className="filing-section-desc">
          The following information was automatically retrieved via SGFinDex and Singpass.
          Verify the figures before proceeding.
        </p>
      </div>

      <div className="filing-data-card">
        <div className="filing-data-card-title">Personal Details</div>
        <DataRow label="Full Name" value={PREFILLED_DATA.name} source="Singpass" />
        <DataRow label="NRIC" value={PREFILLED_DATA.nric} source="Singpass" />
        <DataRow label="Year of Assessment" value={`YA ${PREFILLED_DATA.ya}`} />
        <DataRow label="Residency Status" value={PREFILLED_DATA.residency} source="ICA via Singpass" />
      </div>

      <div className="filing-data-card">
        <div className="filing-data-card-title">Employment Income</div>
        <DataRow label="Employment Type" value={PREFILLED_DATA.employment} source="IRAS employer records" />
        <DataRow label="Employer" value={PREFILLED_DATA.employer} source="IRAS employer records" />
        <DataRow label="Basic Salary" value="$104,000" source="Auto — IR8A" />
        <DataRow label="Annual Bonus" value={`$${PREFILLED_DATA.bonus.toLocaleString()}`} source="Auto — IR8A" />
        <DataRow label="Other Income" value="$0" source="Auto — IR8A" />
        <DataRow label="Assessable Income" value={`$${PREFILLED_DATA.assessableIncome.toLocaleString()}`} highlight />
      </div>

      <div className="filing-data-card">
        <div className="filing-data-card-title">Mandatory Contributions</div>
        <DataRow label="CPF Employee Contribution (OA)" value={`$${PREFILLED_DATA.cpfEmployee.toLocaleString()}`} source="Auto — CPF Board" />
        <DataRow label="SRS Contributions" value={`$${PREFILLED_DATA.srs.toLocaleString()}`} source="Auto — SRS Operator" />
      </div>

      <div className="filing-sync-note">
        <span className="filing-sync-dot" />
        Last synced with SGFinDex: <strong>2 hours ago</strong> · Data verified by IRAS, CPF Board, DBS
      </div>

      <div className="filing-actions">
        <button className="btn btn-primary" onClick={onNext}>Confirm & Review Reliefs →</button>
      </div>
    </div>
  );
}

/* ─── Step 2: Relief allocation ─── */
function StepReliefs({ reliefs, setReliefs, onNext, onBack }) {
  const total = reliefs.reduce((s, r) => s + r.amount, 0);
  const chargeableIncome = PREFILLED_DATA.assessableIncome - total;

  const updateAmount = (id, val) => {
    setReliefs(prev => prev.map(r =>
      r.id === id ? { ...r, amount: Math.min(Number(val) || 0, r.max) } : r
    ));
  };

  return (
    <div className="filing-step-content">
      <div className="filing-section-header">
        <h2 className="filing-section-title">Relief Allocation</h2>
        <p className="filing-section-desc">
          TaxSG has pre-computed your optimal relief set. Reliefs marked <strong>Auto</strong> are
          confirmed by government agencies. Recommended reliefs can be adjusted.
        </p>
      </div>

      <div className="filing-relief-summary">
        <div className="filing-relief-stat">
          <div className="filing-relief-stat-val">${total.toLocaleString()}</div>
          <div className="filing-relief-stat-lbl">Total Reliefs</div>
        </div>
        <div className="filing-relief-arrow">→</div>
        <div className="filing-relief-stat highlight">
          <div className="filing-relief-stat-val">${chargeableIncome.toLocaleString()}</div>
          <div className="filing-relief-stat-lbl">Chargeable Income</div>
        </div>
        <div className="filing-relief-stat">
          <div className="filing-relief-stat-val" style={{ color: 'var(--accent)' }}>$2,127</div>
          <div className="filing-relief-stat-lbl">Estimated Tax</div>
        </div>
      </div>

      <div className="filing-relief-list">
        {reliefs.map(r => (
          <div key={r.id} className="filing-relief-item">
            <div className="filing-relief-item-left">
              <div className="filing-relief-item-name">{r.name}</div>
              <div className="filing-relief-item-source">
                {r.recommended ? (
                  <span className="filing-badge recommended">★ Recommended</span>
                ) : (
                  <span className="filing-badge auto">🔒 Auto-verified</span>
                )}
                <span className="filing-source-text">{r.source}</span>
              </div>
            </div>
            <div className="filing-relief-item-right">
              {r.editable ? (
                <div className="filing-relief-editable">
                  <span className="filing-relief-currency">$</span>
                  <input
                    className="filing-relief-input"
                    type="number"
                    value={r.amount}
                    min={0}
                    max={r.max}
                    onChange={e => updateAmount(r.id, e.target.value)}
                  />
                  <span className="filing-relief-max">/ ${r.max.toLocaleString()}</span>
                </div>
              ) : (
                <div className="filing-relief-fixed">
                  ${r.amount.toLocaleString()}
                  <span className="filing-relief-max">/ ${r.max.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="filing-cap-note">
        Relief cap: <strong>${total.toLocaleString()}</strong> of <strong>$80,000</strong> used
        ({Math.round(total / 800)}%)
        <div className="filing-cap-bar">
          <div className="filing-cap-fill" style={{ width: `${Math.min(total / 800, 100)}%` }} />
        </div>
      </div>

      <div className="filing-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>Proceed to Declaration →</button>
      </div>
    </div>
  );
}

/* ─── Step 3: Declaration ─── */
function StepDeclare({ reliefs, declared, setDeclared, onNext, onBack }) {
  const total = reliefs.reduce((s, r) => s + r.amount, 0);
  const chargeableIncome = PREFILLED_DATA.assessableIncome - total;

  return (
    <div className="filing-step-content">
      <div className="filing-section-header">
        <h2 className="filing-section-title">Review & Declare</h2>
        <p className="filing-section-desc">
          Review your final figures before submitting to IRAS. This is your YA 2026 tax return summary.
        </p>
      </div>

      <div className="filing-declare-summary">
        <div className="filing-declare-row">
          <span>Assessable Income</span>
          <span>${PREFILLED_DATA.assessableIncome.toLocaleString()}</span>
        </div>
        <div className="filing-declare-row">
          <span>Total Reliefs Claimed</span>
          <span className="negative">− ${total.toLocaleString()}</span>
        </div>
        <div className="filing-declare-divider" />
        <div className="filing-declare-row total">
          <span>Chargeable Income</span>
          <span>${chargeableIncome.toLocaleString()}</span>
        </div>
        <div className="filing-declare-row">
          <span>Estimated Tax Payable (YA 2026)</span>
          <span className="accent">$2,127</span>
        </div>
        <div className="filing-declare-row">
          <span>Tax Savings vs. Non-Optimised</span>
          <span className="positive">− $2,965</span>
        </div>
      </div>

      <div className="filing-declare-box">
        <label className="filing-declare-check">
          <input
            type="checkbox"
            checked={declared}
            onChange={e => setDeclared(e.target.checked)}
          />
          <span>
            I declare that the information given in this return is true, correct and complete.
            I understand that penalties may be imposed for false declarations under the
            Income Tax Act (Cap. 134).
          </span>
        </label>
      </div>

      <div className="filing-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!declared}
          style={{ opacity: declared ? 1 : 0.45 }}
        >
          Submit to IRAS →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 4: Submit ─── */
function StepSubmit() {
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const advance = () => {
      i += 1;
      if (i < SUBMIT_STEPS.length) {
        setStepIndex(i);
        setTimeout(advance, 900 + Math.random() * 400);
      } else {
        setTimeout(() => setDone(true), 700);
      }
    };
    setTimeout(advance, 900);
  }, []);

  const refNo = 'YA2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  if (done) {
    return (
      <div className="filing-step-content">
        <div className="filing-success">
          <div className="filing-success-icon">✓</div>
          <h2 className="filing-success-title">Return Successfully Filed</h2>
          <p className="filing-success-desc">
            Your YA 2026 income tax return has been submitted to IRAS and acknowledged.
          </p>

          <div className="filing-receipt">
            <div className="filing-receipt-row">
              <span>Reference Number</span>
              <span className="filing-receipt-val accent">{refNo}</span>
            </div>
            <div className="filing-receipt-row">
              <span>Filed On</span>
              <span className="filing-receipt-val">7 Apr 2026, 10:24 AM</span>
            </div>
            <div className="filing-receipt-row">
              <span>Tax Payable</span>
              <span className="filing-receipt-val">$2,127</span>
            </div>
            <div className="filing-receipt-row">
              <span>Payment Deadline</span>
              <span className="filing-receipt-val">30 Nov 2026</span>
            </div>
            <div className="filing-receipt-row">
              <span>Status</span>
              <span className="filing-receipt-val positive">Acknowledged by IRAS</span>
            </div>
          </div>

          <div className="filing-success-notes">
            <div className="filing-success-note">
              <span className="filing-success-note-icon">📧</span>
              A confirmation email has been sent to wenxiang@taxsg.sg
            </div>
            <div className="filing-success-note">
              <span className="filing-success-note-icon">📄</span>
              Your Notice of Assessment will be issued within 30 days
            </div>
            <div className="filing-success-note">
              <span className="filing-success-note-icon">💳</span>
              Payment options available via PayNow, GIRO, or AXS
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="filing-step-content">
      <div className="filing-section-header">
        <h2 className="filing-section-title">Submitting to IRAS...</h2>
        <p className="filing-section-desc">Please do not close this window.</p>
      </div>

      <div className="filing-submit-steps">
        {SUBMIT_STEPS.map((s, i) => {
          const isActive = i === stepIndex;
          const isDone = i < stepIndex;
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
                <div className="sim-step-label">{s.label}</div>
                {(isActive || isDone) && <div className="sim-step-detail">{s.detail}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main TaxFiling page ─── */
export default function TaxFiling() {
  const [step, setStep] = useState(0);
  const [reliefs, setReliefs] = useState(INITIAL_RELIEFS);
  const [declared, setDeclared] = useState(false);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Auto Tax Filing</h1>
            <p>YA 2026 · Income Tax Return · Powered by SGFinDex &amp; Singpass</p>
          </div>
        </div>
      </div>

      <StepIndicator current={step} />

      <div className="filing-wizard-body">
        {step === 0 && <StepReviewData onNext={next} />}
        {step === 1 && <StepReliefs reliefs={reliefs} setReliefs={setReliefs} onNext={next} onBack={back} />}
        {step === 2 && (
          <StepDeclare
            reliefs={reliefs}
            declared={declared}
            setDeclared={setDeclared}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && <StepSubmit />}
      </div>
    </div>
  );
}
