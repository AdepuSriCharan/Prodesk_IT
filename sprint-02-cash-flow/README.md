# Sprint 02 - Cash-Flow (Salary & Expense Tracker)

Vanilla JavaScript implementation for Sprint 02 assignment.

## Features Completed

- Salary input and expense input forms
- Real-time calculations:
  - Total Salary
  - Total Expenses
  - Remaining Balance
- Validation for empty or negative inputs
- Dynamic expense list rendering
- Delete expense operation with instant recalculation
- LocalStorage persistence across reloads
- Chart.js pie chart (Expenses vs Remaining)
- Threshold alert when remaining balance < 10% salary
- PDF report generation using jsPDF
- Currency toggle INR <-> USD using Frankfurter API

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Chart.js (CDN)
- jsPDF (CDN)
- Frankfurter API

## Run

Open `index.html` in a browser.

## Live URL

https://sprint-02-cash-flow.vercel.app/

## QA Demo Points (2 Minutes)

1. Set salary and add multiple expenses.
2. Show auto calculations.
3. Delete one expense and show instant update.
4. Refresh page and show data persists.
5. Show pie chart updates.
6. Show critical alert by dropping balance below 10%.
7. Export PDF report.
8. Switch INR/USD.
