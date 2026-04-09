# TaxSG — Demo Guide for Professor
## YA 2026 Personal Income Tax Optimisation App

---

## 1. What the App Does

TaxSG is a personal income tax optimisation tool for Singapore residents. It connects to financial data (simulated via SGFinDex), identifies unclaimed tax reliefs, calculates the optimal relief strategy, and lets users run "what-if" simulations — all based on IRAS rules for YA 2026.

---

## 2. App Structure (3 Pages)

| Page | Purpose |
|---|---|
| **Tax Dashboard** | Shows current vs. optimised tax, relief breakdown, and actionable recommendations |
| **What-If Simulator** | Interactive sliders and inputs to model different relief scenarios in real time |
| **Household Optimiser** | Allocates shareable reliefs (QCR, Parent Relief) between spouses to minimise combined household tax |

---

## 3. How to Demo — Step by Step

### Step 1 — Start on the Tax Dashboard (BEFORE state)

- The banner at the top says: *"You have not optimised your taxes yet — $3,468 in unclaimed reliefs detected."*
- Point out the **4 stat cards**:
  - Assessable Income: $122,000
  - Total Reliefs Claimed: $21,400 (only 26.8% of the $80k cap)
  - Tax Payable: $5,719
  - Potential Savings: $3,468

- Explain: *"SGFinDex auto-populated the mandatory reliefs — Earned Income Relief ($1,000) and CPF contributions ($20,400). But the voluntary and lifestyle reliefs are unclaimed."*

- Show the **Relief Breakdown** section:
  - Earned Income Relief and CPF show 100% utilised (auto)
  - SRS, NSman, QCR, Life Insurance show 0% — "Not claimed"

- Show the **3 Recommendations**:
  1. SRS top-up $15,300 → saves $1,760 by crossing into the 7% bracket
  2. Parent Relief + NSman Relief → $12,000 reduction, saves $1,035
  3. Life Insurance + QCR → $9,000, saves $630

- Show the **Tax Bracket Position** chart: currently sitting in the 11.5% band at 51% fill

---

### Step 2 — Click "Optimise Now" (AFTER state)

- A loading animation plays for ~1.4 seconds
- The dashboard transitions to the optimised state

- Point out the changes:
  - Tax drops from **$5,719 → $2,251** (saving $3,468)
  - Chargeable income drops from **$100,600 → $64,300**
  - Bracket drops from **11.5% → 7%**
  - Relief utilisation: 21,400 → 57,700 (72.1% of cap)

- Show the donut chart now populated with all 7 relief segments

- The Recommendations section now shows "All done ✓"

**Key talking point:** *"The system applied all eligible reliefs in priority order — mandatory first, then high-impact voluntary (SRS because it changes bracket), then lifestyle reliefs."*

---

### Step 3 — Navigate to the What-If Simulator

- Point to the **Fixed Auto-Reliefs** section (top of left panel):
  - Earned Income Relief $1,000 — read-only, auto-granted
  - CPF Employee Contribution $20,400 — read-only, mandatory
  - NSman Self Relief — **dropdown**, not a slider (because IRAS only grants $0 / $1,500 / $3,000 based on NS appointment)

- Explain: *"We separated fixed reliefs from adjustable ones. This follows IRAS rules — you cannot choose how much NSman Relief to claim. It's fixed by your appointment."*

- Show the **Adjustable Reliefs** section:

  **SRS Contributions:**
  - Slide from $0 to $15,300 — watch the tax number change in real time
  - Explain: *"SRS is the most powerful lever. At $15,300 you cross from 11.5% to 7% bracket — that alone saves over $1,700."*

  **CPF Cash Top-Up (SA / RA):**
  - Note the label says "SA/RA" — not "SA/MA"
  - Explain: *"Before Jan 2023, MediSave top-ups also qualified. IRAS removed that. The app reflects the current rule — only Special Account (below 55) and Retirement Account (55+) top-ups qualify."*
  - Max $8,000 for own account

  **Parent / Handicapped Parent Relief:**
  - This is a **dropdown**, not a slider
  - Explain: *"Parent Relief only comes in fixed discrete amounts — $5,500 if your parent doesn't live with you, $9,000 if they do, $10,000 or $14,000 for handicapped dependants. A continuous slider would allow $7,000 or $11,000 which IRAS does not recognise."*
  - Show the dropdown options including 2-parent combinations

  **Qualifying Child Relief (QCR):**
  - This uses a +/− children counter, not a free slider
  - Explain: *"QCR is $4,000 per child — it's a per-child fixed amount. A slider stepping by $1,000 would imply you can claim $3,000 or $5,000 per child which is wrong. The counter enforces the correct $4,000 increments."*
  - Also explain: *"There is no $50,000 QCR-specific cap — that was a bug. The only cap is the $80,000 overall personal income tax relief cap."*

  **Life Insurance Relief:**
  - Show the yellow warning banner: *"Only claimable if total CPF contributions < $5,000/year."*
  - Explain: *"Most salaried employees earning above ~$12,000/year already exceed this through mandatory CPF. The app flags this so users don't wrongly claim it."*

- Point to the **Simulation Result** panel:
  - "Without Optimisation" = EIR + CPF + NSman only (no voluntary reliefs)
  - "With Reliefs Applied" = all slider values applied
  - The savings figure updates live as you adjust any input

- Show the **Relief Cap Utilisation** bar at the bottom right

---

### Step 4 — Navigate to the Household Optimiser

- Set husband income to $155,000, wife income to $88,000
- Explain: *"Husband is in the 15% bracket, wife is in the 11.5% bracket. For every $1 of relief, it saves more tax for the husband."*
- Click **Auto-Optimise** — all shareable reliefs (Parent Relief, QCR) shift to the husband
- Show the household tax drops and the savings vs. 50/50 split displayed

---

## 4. IRAS Tax Relief Rules Reference

### How Singapore Personal Income Tax Works

```
Tax Payable = calcTax(Assessable Income − Total Reliefs)
             where Total Reliefs is capped at $80,000
```

### YA 2026 Tax Brackets (used in the app)

| Chargeable Income | Rate |
|---|---|
| First $20,000 | 0% |
| $20,001 – $30,000 | 2% |
| $30,001 – $40,000 | 3.5% |
| $40,001 – $80,000 | 7% |
| $80,001 – $120,000 | 11.5% |
| $120,001 – $160,000 | 15% |
| $160,001 – $200,000 | 18% |
| $200,001 – $240,000 | 19% |
| $240,001 – $280,000 | 19.5% |
| $280,001 – $320,000 | 20% |
| Above $320,000 | 22% |

### Relief-by-Relief Rules (implemented in the app)

| Relief | Amount | How Implemented |
|---|---|---|
| Earned Income Relief (EIR) | $1,000 (age <55); $6,000 (55–59); $8,000 (60+) | Read-only, auto-granted |
| CPF Employee Contributions | Actual contributions up to CPF Annual Limit | Read-only, auto-populated |
| SRS Contributions | Up to $15,300/yr (SC/PR); $35,700 foreigners | Continuous slider, $100 step |
| CPF Cash Top-Up — SA/RA | Up to $8,000/yr (own account) | Continuous slider; MA excluded since Jan 2023 |
| Parent Relief | $5,500 (not living); $9,000 (living) per parent | Dropdown — only valid IRAS amounts |
| Handicapped Parent Relief | $10,000 (not living); $14,000 (living) per parent | Included in same dropdown |
| Qualifying Child Relief (QCR) | $4,000 per child | Children counter × $4,000; no $50k-specific cap |
| Handicapped Child Relief (HCR) | $7,500 per child | Note shown in UI |
| NSman Self Relief | $1,500 (OR NSman); $3,000 (KAH/Instructor) | Dropdown — fixed by NS appointment |
| Life Insurance Relief | Up to $5,000/yr; requires CPF contributions < $5,000 | Slider with eligibility warning |
| **Overall Cap** | **$80,000 total personal reliefs** | Hard cap enforced in all calculations |

### Key Rules to Highlight to Professor

1. **The $80,000 overall cap** — all personal income tax reliefs (including SRS and CPF) are subject to this cap. Claiming more than $80,000 has no additional benefit.

2. **NSman Relief is non-discretionary** — it is auto-granted by IRAS at a fixed amount based on your NS appointment. You cannot choose to claim $2,000 out of a $3,000 entitlement.

3. **Parent Relief has discrete amounts** — IRAS specifies exact fixed amounts. Claiming $7,000 "in between" living and not-living amounts is not permitted.

4. **QCR has no $50,000 specific cap** — the only cap is the $80,000 overall relief cap. Prior version of the app incorrectly stated "$50k cap" for QCR.

5. **Life Insurance Relief eligibility** — requires total CPF contributions (own + employer) to be below $5,000 for the year. Most full-time employees do not qualify.

6. **CPF Cash Top-Up relief** — since 1 January 2023, only top-ups to Special Account (SA, for those below 55) or Retirement Account (RA, for those 55+) qualify. MediSave (MA) top-ups no longer qualify.

7. **QCR is shareable between spouses** — both parents can claim, but their combined claim for the same child cannot exceed $4,000.

---

## 5. Technical Architecture (for Q&A)

- **Frontend:** React (functional components, hooks)
- **Tax engine:** Pure JavaScript — progressive bracket calculation via `calcTax()`
- **State management:** React `useState` + `useMemo` for derived calculations
- **Data source:** SGFinDex simulation (hardcoded YA 2026 scenario for demo)
- **No backend:** All calculations happen client-side in real time
- **Optimisation algorithm (Household):** Greedy marginal-rate assignment — gives each relief to the spouse with the higher marginal tax rate, subject to the $80k relief cap per person

---

## 6. What-If Scenario to Demo Live

For maximum impact during the demo, try this sequence in the What-If Simulator:

1. Start with income = $122,000, all sliders at 0 → Tax shows ~$8,300
2. Set NSman to "Key Appointment Holder ($3,000)" → tax drops slightly
3. Add SRS contributions: slide to $15,300 → watch bracket drop from 11.5% to 7%, saving ~$1,760
4. Select Parent Relief "1 parent, living with you ($9,000)" → further drop
5. Set children to 2 (QCR = $8,000) → further drop
6. Compare final tax to starting tax — show the savings figure

This demonstrates the compounding effect of stacking eligible reliefs within the $80,000 cap.

---

*Document prepared for YA 2026 demo. All figures based on IRAS published rates.*
*Source: https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs*
