import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const CW = 520;
const CH = 480;
const PADDLE_W = 124;
const PADDLE_H = 14;
const PADDLE_Y = CH - 40;
const ITEM_W = 112;
const ITEM_H = 52;
const CAP = 80000; // IRAS $80k personal relief cap

// ─── Tax brackets (YA 2026) ───────────────────────────────────────────────────
const BRACKETS = [
  { min: 0,      max: 20000,  rate: 0     },
  { min: 20000,  max: 30000,  rate: 0.02  },
  { min: 30000,  max: 40000,  rate: 0.035 },
  { min: 40000,  max: 80000,  rate: 0.07  },
  { min: 80000,  max: 120000, rate: 0.115 },
  { min: 120000, max: 160000, rate: 0.15  },
  { min: 160000, max: 200000, rate: 0.18  },
];
function calcTax(ci) {
  let t = 0;
  for (const b of BRACKETS) {
    if (ci <= b.min) break;
    t += (Math.min(ci, b.max) - b.min) * b.rate;
  }
  return Math.round(t);
}

// ─── Game levels ──────────────────────────────────────────────────────────────
const LEVELS = [
  { income: 80000,  speed: 1.3, spawnMs: 2200, goal: 20000, label: 'Level 1  ·  Junior Employee' },
  { income: 120000, speed: 1.9, spawnMs: 1700, goal: 35000, label: 'Level 2  ·  Senior Professional' },
  { income: 160000, speed: 2.7, spawnMs: 1300, goal: 50000, label: 'Level 3  ·  Executive' },
];

// ─── Valid relief items (catch these!) ────────────────────────────────────────
const VALID = [
  { key: 'srs',    label: 'SRS',          sub: '+$15,300', amount: 15300, col: '#60a5fa',
    tip: 'SRS (Supplementary Retirement Scheme): up to $15,300/yr for SC/PR, $35,700 for foreigners. Reduces chargeable income dollar-for-dollar. Withdrawals at statutory retirement age taxed at 50%.' },
  { key: 'cpf',    label: 'CPF Top-Up',   sub: '+$8,000',  amount: 8000,  col: '#2dd4bf',
    tip: 'CPF Cash Top-Up Relief: up to $8,000 for your own SA (age <55) or RA (age 55+). Voluntary top-ups to MA no longer qualify since 1 Jan 2023.' },
  { key: 'parent', label: 'Parent',       sub: '+$9,000',  amount: 9000,  col: '#fbbf24',
    tip: 'Parent Relief: $9,000 if parent lives with you; $5,500 if not. Parent must be 55+ or physically/mentally incapacitated, with income ≤$4,000/yr. Amounts are fixed.' },
  { key: 'qcr',    label: 'Child QCR',    sub: '+$4,000',  amount: 4000,  col: '#a78bfa',
    tip: 'Qualifying Child Relief (QCR): exactly $4,000 per non-handicapped child. Child must be under 16 or in full-time education. Both parents can claim but combined cannot exceed $4,000/child.' },
  { key: 'nsman',  label: 'NSman',        sub: '+$3,000',  amount: 3000,  col: '#34d399',
    tip: 'NSman Self Relief: $3,000 for Key Appointment Holders & Instructors; $1,500 for operationally-ready NSmen. Auto-granted by IRAS — no manual claim needed.' },
  { key: 'lifins', label: 'Life Ins',     sub: '+$5,000',  amount: 5000,  col: '#f472b6',
    tip: 'Life Insurance Relief: up to $5,000/yr — BUT only if your total CPF contributions are below $5,000/yr. Most salaried employees whose CPF exceeds $5k do NOT qualify.' },
  { key: 'course', label: 'Course Fees',  sub: '+$5,500',  amount: 5500,  col: '#fb923c',
    tip: 'Course Fees Relief: up to $5,500/yr for approved courses relevant to your current or future employment. Course must be undertaken for skills upgrading — recreational courses do not qualify.' },
  { key: 'eir',    label: 'Earned Inc.',  sub: '+$1,000',  amount: 1000,  col: '#e879f9',
    tip: 'Earned Income Relief (EIR): auto-granted at $1,000 (age <55), $6,000 (age 55–59), or $8,000 (age 60+). Handicapped individuals get higher amounts. No manual claim required.' },
];

// ─── Invalid items (dodge these!) ─────────────────────────────────────────────
const INVALID = [
  { key: 'ma',      label: 'MA Top-Up',   sub: 'REMOVED',  col: '#ef4444',
    tip: 'MediSave Account top-ups NO LONGER qualify for tax relief since 1 Jan 2023. This was removed under the revised CPF relief framework. Claiming it is an invalid deduction!' },
  { key: 'double',  label: 'Duplicate',   sub: 'FRAUD',    col: '#f97316',
    tip: 'Claiming the same relief twice in one YA is tax fraud. IRAS cross-checks declarations across all taxpayers. Penalties include back-taxes plus surcharges.' },
  { key: 'fake',    label: 'Fake Claim',  sub: 'AUDIT!',   col: '#dc2626',
    tip: 'Inflating or fabricating relief claims triggers IRAS audits. Penalties can reach 400% of tax undercharged, plus possible prosecution under the Income Tax Act.' },
  { key: 'biz',     label: 'Biz Expense', sub: 'INVALID',  col: '#b91c1c',
    tip: 'Business expenses (equipment, rent, staff costs) cannot be claimed by salaried employees under personal income tax. Only self-employed persons with trade income may claim these.' },
];

let _id = 0;
function spawnItem(level) {
  const useValid = Math.random() < 0.65;
  const pool = useValid ? VALID : INVALID;
  const tmpl = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: _id++,
    ...tmpl,
    valid: useValid,
    x: Math.random() * (CW - ITEM_W),
    y: -ITEM_H - 10,
    vy: LEVELS[level].speed + Math.random() * 0.4,
  };
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Custom canvas icons (replaces emoji) ────────────────────────────────────
function drawIcon(ctx, key, cx, cy) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  switch (key) {
    case 'srs': {
      // Coin stack (3 stacked gold coins)
      for (let i = 2; i >= 0; i--) {
        const oy = cy - i * 4 + 4;
        ctx.beginPath();
        ctx.ellipse(cx, oy, 9, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#fbbf24' : '#d97706';
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('$', cx, cy - 4);
      break;
    }
    case 'cpf': {
      // Building with columns
      ctx.fillStyle = '#2dd4bf';
      for (let i = -1; i <= 1; i++) {
        ctx.fillRect(cx + i * 6 - 2, cy - 4, 4, 10);
      }
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 4);
      ctx.lineTo(cx, cy - 12);
      ctx.lineTo(cx + 12, cy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(cx - 12, cy + 6, 24, 3);
      break;
    }
    case 'parent': {
      // Two adult silhouettes + small child
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx - 7, cy - 6, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 10, cy - 3, 6, 7);
      ctx.beginPath(); ctx.arc(cx + 7, cy - 6, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx + 4, cy - 3, 6, 7);
      ctx.fillStyle = '#fde68a';
      ctx.beginPath(); ctx.arc(cx, cy - 4, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 2, cy - 2, 4, 5);
      break;
    }
    case 'qcr': {
      // Child figure with arms out
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath(); ctx.arc(cx, cy - 7, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 3);
      ctx.lineTo(cx - 4, cy + 5);
      ctx.lineTo(cx + 4, cy + 5);
      ctx.lineTo(cx + 5, cy - 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 1); ctx.lineTo(cx - 9, cy + 2);
      ctx.moveTo(cx + 5, cy - 1); ctx.lineTo(cx + 9, cy + 2);
      ctx.stroke();
      break;
    }
    case 'nsman': {
      // 5-pointed star (proper star polygon)
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerA = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const innerA = outerA + (2 * Math.PI) / 10;
        const ox = cx + 9 * Math.cos(outerA);
        const oy = cy + 9 * Math.sin(outerA);
        const ix = cx + 4 * Math.cos(innerA);
        const iy = cy + 4 * Math.sin(innerA);
        i === 0 ? ctx.moveTo(ox, oy) : ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      break;
    }
    case 'lifins': {
      // Shield with checkmark
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx + 8, cy - 4);
      ctx.lineTo(cx + 8, cy + 1);
      ctx.quadraticCurveTo(cx + 8, cy + 8, cx, cy + 10);
      ctx.quadraticCurveTo(cx - 8, cy + 8, cx - 8, cy + 1);
      ctx.lineTo(cx - 8, cy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#9d174d';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy + 1); ctx.lineTo(cx, cy + 4); ctx.lineTo(cx + 4, cy - 2);
      ctx.stroke();
      break;
    }
    case 'course': {
      // Graduation cap (mortarboard)
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.moveTo(cx - 11, cy - 1);
      ctx.lineTo(cx, cy - 9);
      ctx.lineTo(cx + 11, cy - 1);
      ctx.lineTo(cx, cy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c2410c';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 1, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 5, cy - 1, 10, 4);
      // tassel
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 11, cy - 1); ctx.lineTo(cx + 11, cy + 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 11, cy + 5, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fde68a';
      ctx.fill();
      break;
    }
    case 'eir': {
      // Person silhouette with $ badge
      ctx.fillStyle = '#e879f9';
      ctx.beginPath(); ctx.arc(cx - 2, cy - 7, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 3);
      ctx.lineTo(cx - 8, cy + 6);
      ctx.lineTo(cx + 4, cy + 6);
      ctx.lineTo(cx + 3, cy - 3);
      ctx.closePath();
      ctx.fill();
      // $ badge circle
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx + 6, cy - 6, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('$', cx + 6, cy - 6);
      break;
    }
    // ── Invalid items ──
    case 'ma': {
      // Circle with diagonal ban line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 5.5, cy - 5.5); ctx.lineTo(cx + 5.5, cy + 5.5);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 5px monospace';
      ctx.fillText('MA', cx + 1, cy - 1);
      break;
    }
    case 'double': {
      // Two overlapping document sheets
      ctx.fillStyle = hexAlpha('#f97316', 0.35);
      roundRect(ctx, cx - 8, cy - 7, 10, 13, 2);
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1;
      ctx.stroke();
      roundRect(ctx, cx - 1, cy - 4, 10, 13, 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.fillStyle = hexAlpha('#f97316', 0.85);
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.stroke();
      // lines on front sheet
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 1, cy + 1); ctx.lineTo(cx + 6, cy + 1);
      ctx.moveTo(cx + 1, cy + 4); ctx.lineTo(cx + 6, cy + 4);
      ctx.stroke();
      // X mark top-right
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 1, cy - 2); ctx.lineTo(cx + 5, cy - 6);
      ctx.moveTo(cx + 5, cy - 2); ctx.lineTo(cx + 1, cy - 6);
      ctx.stroke();
      break;
    }
    case 'fake': {
      // Warning triangle
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx + 10, cy + 7);
      ctx.lineTo(cx - 10, cy + 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('!', cx, cy + 6);
      break;
    }
    case 'biz': {
      // Briefcase with X
      ctx.fillStyle = '#b91c1c';
      roundRect(ctx, cx - 9, cy - 4, 18, 12, 2);
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1;
      ctx.stroke();
      // handle
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx - 4, cy - 7);
      ctx.lineTo(cx + 4, cy - 7); ctx.lineTo(cx + 4, cy - 4);
      ctx.stroke();
      // centre divider
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 8);
      ctx.stroke();
      // X overlay
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy + 8);
      ctx.moveTo(cx + 5, cy); ctx.lineTo(cx - 5, cy + 8);
      ctx.stroke();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// ─── CSS / SVG icon components for overlays & HUD ────────────────────────────
const GameControllerIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect x="5" y="15" width="42" height="24" rx="12" fill="#4ade8022" stroke="#4ade80" strokeWidth="1.8"/>
    {/* d-pad */}
    <rect x="13" y="23" width="4" height="8" rx="1" fill="#4ade80"/>
    <rect x="11" y="25" width="8" height="4" rx="1" fill="#4ade80"/>
    {/* buttons */}
    <circle cx="34" cy="23" r="2.5" fill="#f472b6"/>
    <circle cx="39" cy="27" r="2.5" fill="#60a5fa"/>
    <circle cx="34" cy="31" r="2.5" fill="#fbbf24"/>
    <circle cx="29" cy="27" r="2.5" fill="#34d399"/>
    {/* bumpers */}
    <rect x="7" y="10" width="11" height="7" rx="3.5" fill="#4ade8066"/>
    <rect x="34" y="10" width="11" height="7" rx="3.5" fill="#4ade8066"/>
  </svg>
);

const CelebrationIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="8" fill="#fbbf24"/>
    <circle cx="26" cy="26" r="14" fill="#fbbf2422"/>
    {[0,45,90,135,180,225,270,315].map((deg, i) => {
      const r = deg * Math.PI / 180;
      return <line key={i}
        x1={26 + 16 * Math.cos(r)} y1={26 + 16 * Math.sin(r)}
        x2={26 + 23 * Math.cos(r)} y2={26 + 23 * Math.sin(r)}
        stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>;
    })}
  </svg>
);

const AuditIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect x="7" y="5" width="25" height="33" rx="3" fill="#ef444422" stroke="#ef4444" strokeWidth="1.5"/>
    <line x1="13" y1="15" x2="26" y2="15" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="13" y1="21" x2="26" y2="21" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="13" y1="27" x2="20" y2="27" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="36" cy="36" r="10" fill="#0d1117" stroke="#f87171" strokeWidth="2"/>
    <circle cx="36" cy="36" r="5.5" fill="none" stroke="#f87171" strokeWidth="1.8"/>
    <line x1="40" y1="40" x2="46" y2="46" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="33" y1="33" x2="39" y2="39" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="39" y1="33" x2="33" y2="39" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TrophyIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path d="M15 8 H37 L32 28 Q26 35 20 28 Z" fill="#fbbf24"/>
    <path d="M15 9 Q7 9 7 18 Q7 26 15 24" stroke="#fbbf24" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <path d="M37 9 Q45 9 45 18 Q45 26 37 24" stroke="#fbbf24" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <rect x="23" y="28" width="6" height="9" fill="#d97706"/>
    <rect x="17" y="37" width="18" height="4" rx="2" fill="#d97706"/>
    <path d="M26 14 L27.5 18.5 L32.5 18.5 L28.5 21.5 L30 26 L26 23 L22 26 L23.5 21.5 L19.5 18.5 L24.5 18.5 Z"
      fill="white" opacity="0.85"/>
  </svg>
);

// Shield icon for lives HUD
const ShieldIcon = ({ active }) => (
  <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
    <path d="M11 1.5 L19.5 5.5 L19.5 12 Q19.5 19 11 22.5 Q2.5 19 2.5 12 L2.5 5.5 Z"
      fill={active ? '#4ade8033' : 'transparent'}
      stroke={active ? '#4ade80' : '#374151'}
      strokeWidth="1.6"/>
    {active
      ? <path d="M7.5 12 L10 14.5 L14.5 9.5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      : <>
          <line x1="8" y1="9" x2="14" y2="15" stroke="#4b5563" strokeWidth="1.6" strokeLinecap="round"/>
          <line x1="14" y1="9" x2="8" y2="15" stroke="#4b5563" strokeWidth="1.6" strokeLinecap="round"/>
        </>
    }
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReliefGame() {
  const canvasRef    = useRef(null);
  const canvasWrapRef = useRef(null);
  const stateRef     = useRef(null);
  const rafRef       = useRef(null);
  const keyRef       = useRef({ left: false, right: false });
  const [scale, setScale] = useState(1);

  const [display, setDisplay] = useState({
    phase: 'idle',
    score: 0,
    reliefTotal: 0,
    lives: 3,
    level: 0,
    tip: null,
    tipValid: true,
    taxSaved: 0,
  });

  const initState = useCallback((level = 0) => ({
    phase: 'playing',
    paddleX: CW / 2 - PADDLE_W / 2,
    items: [],
    particles: [],
    flashFrames: 0,
    flashGood: false,
    reliefTotal: 0,
    score: 0,
    lives: 3,
    level,
    lastSpawn: performance.now(),
    tip: null,
    tipTtl: 0,
    tipValid: true,
    taxSaved: 0,
  }), []);

  const loop = useCallback((now) => {
    const s = stateRef.current;
    if (!s || s.phase !== 'playing') return;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const lv  = LEVELS[s.level];

    const SPEED = 7;
    if (keyRef.current.left)  s.paddleX = Math.max(0, s.paddleX - SPEED);
    if (keyRef.current.right) s.paddleX = Math.min(CW - PADDLE_W, s.paddleX + SPEED);

    if (now - s.lastSpawn > lv.spawnMs) {
      s.items.push(spawnItem(s.level));
      s.lastSpawn = now;
    }

    const px = s.paddleX, py = PADDLE_Y;
    for (let i = s.items.length - 1; i >= 0; i--) {
      const it = s.items[i];
      it.y += it.vy;

      const hit =
        it.y + ITEM_H >= py &&
        it.y + ITEM_H <= py + PADDLE_H + 8 &&
        it.x + ITEM_W > px &&
        it.x < px + PADDLE_W;

      if (hit) {
        if (it.valid) {
          const added = Math.min(it.amount, CAP - s.reliefTotal);
          s.reliefTotal = Math.min(CAP, s.reliefTotal + it.amount);
          const income = lv.income;
          const baseRelief = 21400;
          s.score += added;
          const afterTax = calcTax(Math.max(0, income - baseRelief - s.score));
          s.taxSaved = calcTax(Math.max(0, income - baseRelief)) - afterTax;
          s.tip = it.tip;
          s.tipTtl = 180;
          s.tipValid = true;
          for (let p = 0; p < 10; p++) {
            s.particles.push({ x: it.x + ITEM_W / 2, y: it.y, vx: (Math.random() - 0.5) * 4, vy: -(Math.random() * 3 + 1), life: 40, col: it.col });
          }
          s.flashGood = true;
          s.flashFrames = 6;
        } else {
          s.lives = Math.max(0, s.lives - 1);
          s.tip = it.tip;
          s.tipTtl = 200;
          s.tipValid = false;
          s.flashGood = false;
          s.flashFrames = 10;
          for (let p = 0; p < 12; p++) {
            s.particles.push({ x: it.x + ITEM_W / 2, y: it.y, vx: (Math.random() - 0.5) * 5, vy: -(Math.random() * 2 + 1), life: 35, col: '#ef4444' });
          }
        }
        s.items.splice(i, 1);
        continue;
      }

      if (it.y > CH + 10) s.items.splice(i, 1);
    }

    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--;
      if (p.life <= 0) s.particles.splice(i, 1);
    }

    if (s.tipTtl > 0) s.tipTtl--;
    else s.tip = null;
    if (s.flashFrames > 0) s.flashFrames--;

    if (s.lives <= 0) { s.phase = 'gameover'; }
    else if (s.reliefTotal >= lv.goal) {
      if (s.level < LEVELS.length - 1) s.phase = 'levelup';
      else s.phase = 'win';
    }

    // ─── RENDER ──────────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, CW, CH);

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, CW, CH);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CW; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }
    for (let y = 0; y < CH; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }

    // Flash overlay
    if (s.flashFrames > 0) {
      ctx.fillStyle = s.flashGood
        ? `rgba(74,222,128,${s.flashFrames * 0.03})`
        : `rgba(239,68,68,${s.flashFrames * 0.04})`;
      ctx.fillRect(0, 0, CW, CH);
    }

    // Falling items
    for (const it of s.items) {
      ctx.shadowColor = it.col;
      ctx.shadowBlur  = 12;
      roundRect(ctx, it.x, it.y, ITEM_W, ITEM_H, 10);
      ctx.fillStyle = hexAlpha(it.col, 0.18);
      ctx.fill();
      ctx.strokeStyle = it.col;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Custom CSS-drawn icon instead of emoji
      drawIcon(ctx, it.key, it.x + ITEM_W / 2, it.y + 18);

      // Label
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(it.label, it.x + ITEM_W / 2, it.y + 34);

      // Sub-label
      ctx.font = '10px monospace';
      ctx.fillStyle = it.valid ? it.col : '#f87171';
      ctx.fillText(it.sub, it.x + ITEM_W / 2, it.y + 46);
    }

    // Particles
    for (const p of s.particles) {
      ctx.globalAlpha = p.life / 40;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Paddle
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur  = 16;
    roundRect(ctx, s.paddleX, PADDLE_Y, PADDLE_W, PADDLE_H, 7);
    const paddleGrad = ctx.createLinearGradient(s.paddleX, PADDLE_Y, s.paddleX + PADDLE_W, PADDLE_Y);
    paddleGrad.addColorStop(0, '#22d3ee');
    paddleGrad.addColorStop(1, '#4ade80');
    ctx.fillStyle = paddleGrad;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ground line
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, CH - 8); ctx.lineTo(CW, CH - 8); ctx.stroke();

    setDisplay({
      phase: s.phase,
      score: s.score,
      reliefTotal: s.reliefTotal,
      lives: s.lives,
      level: s.level,
      tip: s.tip,
      tipValid: s.tipValid,
      taxSaved: s.taxSaved,
    });

    if (s.phase === 'playing') {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, []);

  const startGame = useCallback((level = 0) => {
    cancelAnimationFrame(rafRef.current);
    stateRef.current = initState(level);
    rafRef.current = requestAnimationFrame(loop);
  }, [initState, loop]);

  const handleMouseMove = useCallback((e) => {
    const s = stateRef.current;
    if (!s || s.phase !== 'playing') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (CW / rect.width);
    s.paddleX = Math.max(0, Math.min(CW - PADDLE_W, mx - PADDLE_W / 2));
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const s = stateRef.current;
    if (!s || s.phase !== 'playing') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const tx = (e.touches[0].clientX - rect.left) * (CW / rect.width);
    s.paddleX = Math.max(0, Math.min(CW - PADDLE_W, tx - PADDLE_W / 2));
  }, []);

  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(Math.min(1, w / CW));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keyRef.current.left  = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyRef.current.right = true;
    };
    const up = (e) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keyRef.current.left  = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyRef.current.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const lv     = LEVELS[display.level];
  const pct    = lv ? Math.min(100, (display.reliefTotal / lv.goal) * 100) : 0;
  const capPct = Math.min(100, (display.reliefTotal / CAP) * 100);

  const Overlay = ({ children }) => (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'rgba(10,12,18,0.88)', borderRadius: 14, padding: 32,
    }}>
      {children}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Relief Catcher</h1>
            <p>Catch valid SG tax reliefs · dodge invalid claims · learn IRAS rules</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="card-badge">{lv?.label}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Game canvas + overlays ── */}
        <div ref={canvasWrapRef} style={{ flex: '1 1 auto', minWidth: 0, maxWidth: CW, position: 'relative' }}>
          <div style={{ width: CW * scale, height: CH * scale, position: 'relative', overflow: 'hidden', borderRadius: 14 }}>
          <canvas
            ref={canvasRef}
            width={CW} height={CH}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            style={{
              display: 'block',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'none',
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
            }}
          />

          {/* IDLE */}
          {display.phase === 'idle' && (
            <Overlay>
              <GameControllerIcon />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff' }}>Relief Catcher</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 340 }}>
                Move your paddle to <span style={{ color: '#4ade80' }}>catch valid SG reliefs</span> and
                {' '}<span style={{ color: '#f87171' }}>dodge invalid claims</span>.
                Learn real IRAS rules as you play!
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Mouse / touch to move  ·  A D or ← → keys</div>
              <button className="btn btn-accent" style={{ marginTop: 8, fontSize: 15, padding: '10px 32px' }} onClick={() => startGame(0)}>
                Start Game
              </button>
            </Overlay>
          )}

          {/* LEVEL UP */}
          {display.phase === 'levelup' && (
            <Overlay>
              <CelebrationIcon />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#4ade80' }}>Level Complete!</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                Relief collected: <strong style={{ color: '#60a5fa' }}>${display.reliefTotal.toLocaleString()}</strong>
                {' '}·{' '}
                Tax saved: <strong style={{ color: '#4ade80' }}>${display.taxSaved.toLocaleString()}</strong>
              </div>
              <button className="btn btn-accent" onClick={() => startGame(display.level + 1)}>
                Next Level →
              </button>
            </Overlay>
          )}

          {/* GAME OVER */}
          {display.phase === 'gameover' && (
            <Overlay>
              <AuditIcon />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#f87171' }}>IRAS Audit!</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 340 }}>
                Too many invalid claims! You triggered an audit and lost all reliefs.
                {' '}Remember: <strong style={{ color: '#fbbf24' }}>always verify before claiming.</strong>
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                Relief saved: <strong style={{ color: '#60a5fa' }}>${display.reliefTotal.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => startGame(display.level)}>Retry Level</button>
                <button className="btn btn-accent" onClick={() => startGame(0)}>Restart</button>
              </div>
            </Overlay>
          )}

          {/* WIN */}
          {display.phase === 'win' && (
            <Overlay>
              <TrophyIcon />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fbbf24' }}>Tax Optimised!</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', textAlign: 'center', maxWidth: 360 }}>
                You mastered all 3 levels! You now understand SG personal income tax reliefs
                — from SRS contributions to the $80k cap.
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 4 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#4ade80' }}>${display.taxSaved.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Tax Saved</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#60a5fa' }}>${display.reliefTotal.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Reliefs Collected</div>
                </div>
              </div>
              <button className="btn btn-accent" onClick={() => startGame(0)} style={{ marginTop: 4 }}>Play Again</button>
            </Overlay>
          )}
          </div>
        </div>

        {/* ── Right panel: HUD + tips ── */}
        <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stats */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Your Tax Return</span>
              <span className="card-badge">YA 2026</span>
            </div>

            {/* Lives — SVG shields instead of emoji */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Audit Shields</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <ShieldIcon key={i} active={i < display.lives} />
                ))}
              </div>
            </div>

            {/* Level goal progress */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
                <span>Level goal</span>
                <span style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
                  ${display.reliefTotal.toLocaleString()} / ${lv?.goal.toLocaleString()}
                </span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: 'linear-gradient(90deg, #22d3ee, #4ade80)',
                  borderRadius: 4, transition: 'width 0.2s ease',
                }} />
              </div>
            </div>

            {/* $80k cap */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                <span>$80k IRAS cap</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: capPct > 80 ? '#fbbf24' : 'var(--text-muted)' }}>
                  {capPct.toFixed(0)}% used
                </span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${capPct}%`,
                  background: capPct > 80 ? '#fbbf24' : '#60a5fa',
                  borderRadius: 3, transition: 'width 0.2s ease',
                }} />
              </div>
            </div>

            {/* Tax saved */}
            <div style={{ textAlign: 'center', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Tax Saved So Far</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#4ade80' }}>
                ${display.taxSaved.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Live tip panel */}
          <div className="card" style={{
            borderColor: display.tip
              ? (display.tipValid ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)')
              : 'var(--border)',
            transition: 'border-color 0.3s',
            minHeight: 100,
          }}>
            <div className="card-header">
              <span className="card-title">{display.tip ? (display.tipValid ? '✓ Correct!' : '✗ Invalid!') : 'IRAS Tip'}</span>
            </div>
            {display.tip ? (
              <p style={{ fontSize: 13, color: display.tipValid ? '#4ade80' : '#f87171', lineHeight: 1.6, margin: 0 }}>
                {display.tip}
              </p>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Catch a relief block to learn its IRAS rule. Dodge the red invalid ones!
              </p>
            )}
          </div>

          {/* Controls reference */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Controls</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>← → or A D</span><span>Move paddle</span>
              <span>Mouse / Touch</span><span>Follow cursor</span>
            </div>
            <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Item guide:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <span style={{ width: 10, height: 10, background: '#4ade80', borderRadius: 2, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ color: '#4ade80' }}>Catch</span>
                  <span style={{ color: 'var(--text-muted)' }}>— valid IRAS reliefs</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ color: '#f87171' }}>Dodge</span>
                  <span style={{ color: 'var(--text-muted)' }}>— invalid / removed reliefs</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Relief reference card (below game) ── */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">IRAS Relief Quick Reference</span>
          <span className="card-badge">YA 2026</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginTop: 4 }}>
          {VALID.map(it => (
            <div key={it.key} style={{
              padding: '10px 12px', borderRadius: 8,
              border: `1px solid ${hexAlpha(it.col, 0.3)}`,
              background: hexAlpha(it.col, 0.06),
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: it.col }}>{it.label}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: it.col }}>{it.sub}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{it.tip}</p>
            </div>
          ))}
          {INVALID.map(it => (
            <div key={it.key} style={{
              padding: '10px 12px', borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.25)',
              background: 'rgba(239,68,68,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>{it.label}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#f87171' }}>AVOID</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{it.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
