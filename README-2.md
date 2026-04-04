# TaxSG — Smart Tax Optimisation Platform

A polished frontend prototype for TaxSG, an intelligent tax optimisation app for Singapore taxpayers.

## Pages

- **Dashboard** — Overview of your tax position, relief utilisation, bracket visualisation, and AI recommendations
- **What-If Simulator** — Adjust SRS, CPF, parent relief, QCR, and insurance sliders to see real-time tax impact
- **Household Optimiser** — Allocate shareable reliefs between spouses with auto-optimise
- **Alerts & Insights** — Deadline reminders, compliance checks, life-event detection
- **Profile** — Personal info, SGFinDex connections, dependants, tax filing history

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Tech Stack

- React 18
- Vite
- Pure CSS (no external UI library)
- Google Fonts (DM Sans, Playfair Display, JetBrains Mono)

## Project Structure

```
taxsg-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    └── pages/
        ├── Dashboard.jsx
        ├── WhatIfSimulator.jsx
        ├── HouseholdOptimizer.jsx
        ├── Alerts.jsx
        └── Profile.jsx
```
