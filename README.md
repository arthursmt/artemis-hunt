Product case study and MVP design of a multi-app credit platform for microfinance and lending operations.

1. Overview
Artemis is a digital credit platform designed for field credit officers and back-office teams working with microfinance and small-ticket lending.

The platform is built around group lending, thin-file customers (including immigrants and foreign nationals), and the reality that most credit origination still happens through human relationships in the field — not from behind a desktop.

This repository currently contains the MVP for Artemis Hunting, the commercial app used by credit agents to:

Prospect and qualify clients,
Originate individual or group loans,
Run basic risk checks,
Configure loan products,
And manage in-progress proposals.
The rest of the platform (operational, client, and public-facing apps) is documented as product scope and roadmap.

2. Product context & problem
Traditional microfinance operations still rely heavily on:

Paper forms and manual data entry,
Fragmented tools (WhatsApp, spreadsheets, legacy core systems),
Limited or no support for group lending,
Poor visibility of portfolio quality at the agent level,
Weak support for clients without standard credit files (no SSN, recent immigrants, informal businesses).
This creates a few core problems:

Inefficient origination: agents spend time chasing documents instead of selling and managing risk.
Opaque risk: little real-time visibility into delinquency and exposure per agent.
Exclusion of non-standard clients: foreign nationals and informal businesses are often rejected by process, not by actual risk.
Artemis aims to fix this by:

Digitizing the entire field workflow end-to-end,
Structuring data so underwriting and operations can scale,
Supporting group-based guarantees rather than collateral,
Still keeping the human relationship at the center of the model.
3. Artemis platform – app ecosystem
The full platform is designed as four interconnected applications:

Artemis Hunting – Commercial App (this MVP)

Tablet-first app for field credit officers.
Prospecting, group formation, loan origination, and pipeline management.
Artemis Care – Operational / Back-office App (planned)

Web application for risk, compliance, and operations teams.
Document review, risk workflows, exception handling, disbursement approvals.
Artemis Harvesting – Client App (planned)

Mobile app for borrowers.
Payment schedule, reminders, renewals, and basic self-service.
Artemis Web – Public site (planned)

Marketing and information hub.
Education, product information, and lead capture.
This repository focuses on the Hunting MVP, but its data model and flows are designed to plug into the broader platform later.

4. Artemis Hunting MVP – what this app does
The Artemis Hunting MVP is a tablet-oriented web app for Samsung Active-class devices (10" screens), built as a responsive React application.

4.1. Dashboard
The Dashboard gives the credit officer a portfolio-level view of their performance:

Credit Portfolio – total outstanding portfolio and target progress.
Active Clients – current count and target progress.
Delinquency Rate – % of portfolio in arrears with target tracking.
Pipeline Overview – cards by workflow stage:
On Going (incomplete proposals),
Under Eval (completed, under review),
Completed (recent approvals),
Renewals (contracts near maturity),
Collections (past-due cases).
Each pipeline card can surface priority markers so the agent knows where to act first (prospecting, renewing, or collecting).

4.2. New Proposal & members
From New Proposal, the agent can originate:

Group loans (default and key differentiator),
Individual loans (optional mode).
Key behaviors:

Each member has:
First, middle (optional), and last name,
ID document type (SSN, ITIN, US Driver’s License / State ID, Passport, Foreign Government ID),
Document number,
Requested amount (with currency formatting and maximum loan limit per client).
Group proposals support multiple members, with:
Add/remove member tabs,
Validation on required fields,
Confirmation when removing existing members.
This design explicitly supports immigrant and foreign clients, not just people with US SSN.

4.3. Credit validation (mock risk engine)
After data entry, the app runs a validation step (front-end only for now, with mocked statuses) to simulate:

Credit bureau checks,
AML / anti-money-laundering screening,
Internal risk criteria.
Per member, the UI shows:

Pending → Approved / Denied per check,
A global status panel (Validation in Progress, Validation Approved, or Validation Denied),
The requested amount for that member.
Rules:

If all members are denied and removed, the flow returns to Home.
If there is at least one approved member, the group can proceed, but all denied members must be removed before continuing.
4.4. Product Configuration (multi-step form per member)
Once validation passes, the agent clicks Continue to Product Config.
At this moment, the app creates a Proposal record in a local store so it can be resumed later.

For each member, Product Config is structured as:

Personal Details

Reuses name + document data from New Proposal,
US-style address (Address 1, Address 2, State, City, ZIP),
Up to three contact numbers (first mobile number required),
Optional references.
Business Details

Business name and phone,
Business address (with “Same as client address” checkbox + auto-fill).
Financial Profile

Simplified assets and liabilities (cash, inventory, equipment, debts, etc.),
Automatic calculation of:
Total assets,
Total liabilities,
Net position / payment capacity (assets – liabilities).
Loan Proposal

Requested amount (validated and formatted; max 50,000),
Number of installments (4–12),
Loan purpose (Working capital or Investment),
Interest rate (pre-defined range, e.g. 14–16%),
First repayment date:
60-day grace period from today,
First payment scheduled in the first half of the following month (days 1–15).
The UI is designed so the agent can move between members and steps without losing data.

4.5. On Going proposals & resume flow
After or during Product Config, the officer can go Back to Home.
The proposal is kept as ON GOING in a central store.

From the Dashboard:

The On Going card opens a list of active proposals.
Each row shows:
Leader name,
Total requested amount,
Date created,
Status pill (ON GOING),
Actions:
Keep filling → returns to Product Config for that specific proposal,
View details → group/members summary (names, primary phone, requested amount, address),
Delete → with confirmation, removes the proposal and all local data.
This mirrors the real-world reality of agents starting, pausing, and resuming proposals across multiple days and visits.

5. Architecture & tech stack
Current implementation (MVP):

Front-end: React (JavaScript), single-page application.
State management: React state + custom context for Proposals store.
UI: custom components styled to match the Artemis brand (white background, blue primary, yellow/green accents).
The proposals store:

Holds all ON GOING proposals in memory (and can optionally be persisted to localStorage),
Exposes basic operations:
Create from validated group,
Update as forms are filled,
Delete proposals,
Query by id for Product Config and Details screens.
As the platform evolves, this front-end is intended to integrate with:

Real credit bureau APIs,
AML / KYC services,
A core banking or loan management system.
6. Repository layout
The exact layout may evolve, but the intent is to host all apps and docs in a single repository.

Suggested structure:

.
├── apps
│   └── hunting-mvp        # Front-end for Artemis Hunting (this MVP)
├── docs
│   ├── concept-deck       # Pitch deck / product concept slides
│   └── ux                 # Screen designs and UX flows
├── LICENSE
└── README.md
