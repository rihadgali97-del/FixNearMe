# FixNearMe — Neighborhood Problem Reporting & Resolution Tracking

> Built for the Student Hackathon at **Bahir Dar Institute of Technology (BiT)**, Ethiopia.

FixNearMe is a civic-tech web application that connects residents of Bahir Dar with local municipal and utility services (Water & Sewerage Service, Ethiopian Electric Utility, Solid Waste Management Agency). Residents can report infrastructure hazards (potholes, dark streetlights, leaking water pipes, blocked drainage channels, overflowing waste bins), verify existing problems, and monitor the official resolution journey from initial report to verified repair.

---

## Key Features

1. **Civic Dashboard (`/`)**
   - Live metrics derived from actual backend API: Total Reports, Unresolved Issues, In Progress, and Resolved Issues.
   - Categorical breakdown across all public service sectors.
   - Neighborhood activity metrics for Bahir Dar Kebeles (Kebele 03, Poly Campus, Shimbit, Belay Zeleke, Fasilo, Gish Abay, Tana Waterfront, Diaspora Sefer).
   - Recently reported community issues with fast links to full dossier.

2. **Explore Reports (`/reports`)**
   - Multi-field search across titles, descriptions, neighborhoods, and landmarks.
   - Filter by Category, Lifecycle Status, Triage Priority, and Kebele.
   - Sorting options: Newest, Highest Priority, Most Confirmed, Oldest.
   - Interactive View Toggle:
     - **List / Card View** with confirmation buttons, category icons, and status badges.
     - **Interactive Leaflet Map View** showing exact GPS pins across Bahir Dar with click-to-view popups.
   - Client-side confirmation upvoting with backend single-confirmation enforcement per device.

3. **Report a Problem (`/reports/new`)**
   - Guided reporting workflow: Category selection, Title, Description, Kebele dropdown, Landmark reference.
   - **Interactive GPS Location Picker**: Click directly on the Bahir Dar map or use device GPS geolocation.
   - Photographic evidence attachment with instant client-side preview.
   - **Smart Duplicate Detection**: Calls `POST /api/reports/check-duplicates` before submission. If similar reports exist nearby, displays potential matches allowing the resident to confirm/upvote an existing ticket or proceed with acknowledged justification.
   - Confirmed success screen showing assigned ticket ID (`#REP-2026-xxx`).

4. **Report Dossier & Resolution Timeline (`/reports/:id`)**
   - Full problem description, photographic evidence, and location details.
   - Interactive map showing the issue pin.
   - **One-Click Community Confirmation** with duplicate-submission prevention handled by backend.
   - **Resolution Timeline**: Complete chronological audit trail showing status transitions, field inspector notes, and official repair timestamps.
   - **Verified Resolution Proof**: When marked resolved, displays official resolution note and before/after verification evidence photo.
   - Duplicate banner and link to primary canonical ticket if merged.

5. **Municipality Admin Portal (`/admin`)**
   - Clearly separated administrative control center protected by HTTP Bearer token authorization.
   - Report triage table with real-time status and priority management.
   - Triage modal to adjust priority, change lifecycle status, add public timeline notes, and log confidential internal notes.
   - **Duplicate Merger Action**: Merge duplicate resident reports into a primary canonical ticket, automatically consolidating confirmation votes.
   - **Export CSV**: Instant export of all municipal reports for local spreadsheet analysis.
   - Access-denied screen with demo passkey login (`bdu-admin-2026`).

6. **Bilingual Support (English & አማርኛ)**
   - Complete language toggle (English / Amharic) across all navigation items, badges, buttons, and civic labels.

---

## Technology Stack

- **Frontend**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4
- **Navigation**: React Router DOM v7
- **Icons**: Lucide React
- **Mapping**: Leaflet + OpenStreetMap tiles with offline fallback
- **Backend API**: Full-stack Express server (`server.ts`) implementing all civic contracts
- **Language**: TypeScript & JavaScript

---

## Implemented Routes

| Route | View | Description |
|---|---|---|
| `/` | `Dashboard.jsx` | City infrastructure health metrics, category distributions, recent tickets |
| `/reports` | `ExploreReports.jsx` | Search, filter, sort, paginate, List & Map view, quick confirmation |
| `/reports/new` | `CreateReport.jsx` | Problem submission, photo upload, map picker, duplicate warning dialog |
| `/reports/:id` | `ReportDetails.jsx` | Problem details, community support, resolution audit timeline |
| `/admin` | `AdminDashboard.jsx` | Authenticated admin triage table, status updater, duplicate merger |
| `*` | `NotFound.jsx` | Friendly 404 handler |

---

## Implemented API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health status and city metadata | No |
| `GET` | `/api/dashboard/stats` | Aggregate counts and category statistics | No |
| `GET` | `/api/reports` | Filtered, searched, and paginated reports | No |
| `GET` | `/api/reports/:id` | Full details of a single report | No |
| `POST` | `/api/reports` | Create new problem report | No |
| `POST` | `/api/reports/check-duplicates` | Pre-submission similarity matching | No |
| `POST` | `/api/reports/:id/confirm` | Single-confirm upvote with client prevention | No |
| `GET` | `/api/reports/:id/updates` | Chronological audit history of a report | No |
| `GET` | `/api/admin/reports` | Admin report registry with internal notes | **Yes** (Bearer Token) |
| `PATCH` | `/api/admin/reports/:id` | Update status, priority, resolution note | **Yes** (Bearer Token) |
| `POST` | `/api/admin/reports/:id/merge` | Merge duplicate into canonical report | **Yes** (Bearer Token) |

---

## Installation & Running Locally

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm (version 9 or higher)

### Setup Steps
```bash
# 1. Clone repository or navigate to directory
cd fixnearme

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for same-origin dev)
cp .env.example .env

# 4. Start full-stack development server
npm run dev
```

The application will run on `http://localhost:3000`.

### Environment Configuration (`.env`)
```ini
# Base URL for backend API requests. Leave blank for same-origin (/api) in full-stack mode:
VITE_API_BASE_URL=""

# Administrator Bearer token for municipality actions:
ADMIN_BEARER_TOKEN="bdu-admin-2026"

# Server Port
PORT=3000
```

---

## Manual Test Checklist

1. **Dashboard KPI Inspection**:
   - Open `/` and verify summary cards (Total Reports, Unresolved, In Progress, Resolved) show accurate live numbers.
   - Check that Category pills filter by category when clicked.
2. **Explore Reports & Filtering**:
   - Navigate to `/reports`.
   - Type `pothole` in search input — verify results filter dynamically.
   - Select `Water Leak` category — verify only water leaks show.
   - Switch to **Map View** — verify Leaflet pins display in Bahir Dar and popups open on click.
3. **Problem Confirmation**:
   - Click "Confirm" on any active report card.
   - Observe counter increment and toast notification.
   - Attempt to click confirm again — notice prevention and notification that you have already confirmed.
4. **Create Report with Duplicate Detection**:
   - Navigate to `/reports/new`.
   - Submit empty form — verify field-level validation errors appear.
   - Enter title `Water Pipe Burst`, category `Water Leak`, Kebele `Kebele 03`.
   - Click "Submit" — verify the **Duplicate Detection Dialog** pops up with matching existing water leak reports.
   - Test "Support" button or acknowledge checkbox and click "Submit as Distinct Report".
   - Verify success screen appears with reference ID `#REP-2026-xxx`.
5. **Report Dossier & Timeline**:
   - Open any report (e.g. `/reports/REP-2026-004`).
   - Notice the green "Resolved & Verified" badge and official resolution note.
   - Inspect the chronological timeline showing steps from resident report to sanitation squad resolution.
6. **Municipality Admin Portal**:
   - Click "Municipality Admin" in navbar (`/admin`).
   - If unauthenticated, verify access-denied screen is shown.
   - Enter passkey `bdu-admin-2026`.
   - Select "Manage" on a ticket, change status to `In Progress`, add note, and click "Save".
   - Verify changes persist and appear on the public timeline.
   - Click "Export CSV" to download reports summary.
7. **Bilingual Toggle**:
   - Click the language button in navbar (`አማርኛ`).
   - Verify headers, buttons, and navigation switch to Amharic.
   - Toggle back to English.

---

## Limitations & Future Enhancements

- **SMS / Telegram Bot Gateway**: For residents without continuous mobile internet, integrating Ethio Telecom USSD or a Telegram bot (`@FixNearMeBahirDarBot`) would broaden reporting access in rural Kebele outskirts.
- **Offline PWA Sync**: While offline tile fallback is implemented, background service worker sync for offline draft queueing can be added in future iterations.
