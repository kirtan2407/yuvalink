# YuvaLink — Member & Attendance Management System
## Development Specification & Build Prompt (v2.0)

**Audience:** Development team / AI coding assistant
**Budget target:** ₹0 (100% free-tier cloud stack)
**Delivery model:** 6 sequential phases (0–5). Each phase must be completed, tested and signed off before the next begins.

---

## 0. Role & Objective

You are an expert Full-Stack Engineer and System Architect. Build **YuvaLink**, a **fully responsive, secure and clean website** for managing community/youth members, daily attendance, reports, and data import/export. It must work equally well on **laptop/desktop, tablet and mobile phone**, with every feature and every piece of text fully visible and usable on every screen size. It replaces an existing legacy website and must reproduce its core features with a modern, polished UI and reliable behaviour.

**Global quality rules (apply to every phase):**
- Every screen handles **loading, empty, error and success states**.
- All forms have **client-side and server-side validation** with clear inline messages.
- All destructive actions require **confirmation**; member deletion is **soft delete** (recoverable from Trash).
- **Fully responsive on all devices** (laptop, tablet, phone) — see the mandatory Responsive Design Requirements below. This applies to every page, table, form, modal and button in every phase.
- Modular code, consistent naming, environment variables for all secrets, no hard-coded credentials.
- Each phase ships with a short test checklist (see "Acceptance Criteria") and passes it.

---

## Responsive Design Requirements (Mandatory for All Phases)

YuvaLink is a **website, not a fixed-size desktop app**. Every screen must adapt smoothly to the device it is opened on. **All text, labels, buttons, numbers and features must be fully visible and usable on every device — nothing may be cut off, hidden, overlapping, or require sideways page scrolling.**

**Target devices and breakpoints**

| Device | Screen width | Layout expectation |
|--------|-------------|--------------------|
| Small phone | 320–480 px | Single column, card-style lists, hamburger menu |
| Large phone / small tablet | 481–768 px | Single or two columns, drawer menu |
| Tablet / small laptop | 769–1024 px | Collapsible sidebar, compact tables |
| Laptop / desktop | 1025 px and above | Fixed sidebar, full data tables |

**Rules**
1. **Mobile-first CSS** using flexbox/grid, relative units (`rem`, `%`, `clamp()`), and media queries. Add `<meta name="viewport" content="width=device-width, initial-scale=1">`.
2. **No content loss:** long names, addresses, and headings must wrap to the next line or truncate with a tap/hover to view full text — never overflow the screen or be silently cut. Full details always reachable (e.g. tap a member card to expand).
3. **Tables:** full multi-column table on laptop. On phones, convert each row into a **stacked card** showing every field (Name, Group, Mobile, Address, Study, Occupation, Birth Date/Age, Last Updated) with clearly labelled rows and Edit/Delete actions. No hidden columns.
4. **Navigation:** fixed sidebar on laptop; collapsible sidebar on tablet; hamburger + slide-in drawer on phone. Menu items always readable.
5. **Forms & modals:** modals fit within the screen (max-height with internal scroll); on phones they open full-screen or as bottom sheets. Inputs are full-width, with labels above fields, and the on-screen keyboard must not hide the field being edited.
6. **Touch-friendly:** buttons, toggles and checkboxes at least **44×44 px**; adequate spacing between tap targets; the Present/Absent toggle must be easy to use with one thumb.
7. **Filters, search and toolbars:** on phones, the Group filter, search bar, sort options, and Export buttons stack vertically (or sit in a collapsible "Filters" panel) — all still accessible. Counters (Total / P / A, member count badge) remain visible.
8. **Typography:** minimum 16 px body text on phones (prevents auto-zoom on iOS), readable line-height and colour contrast.
9. **Media & icons** scale with the container (`max-width: 100%`); no fixed-pixel widths for layout containers.
10. **Orientation:** works in both portrait and landscape.
11. **Downloads:** Excel and PDF export buttons work on mobile browsers; PDF layout remains readable (landscape orientation for wide tables).
12. **Testing:** every phase must be verified at **360 px (phone), 768 px (tablet) and 1366 px (laptop)** in Chrome DevTools and on at least one real Android/iOS phone, in Chrome, Safari, Edge and Firefox.

---

## 1. Key Feature Definition: "Group A–Z" (read carefully)

This is the **new feature** added on top of the legacy application. Behaviour is defined precisely below.

| # | Rule |
|---|------|
| G1 | Every member has an **optional** `group` field. Allowed values: a single letter **A–Z**, or empty ("Unassigned"). |
| G2 | The Group field is **not mandatory** when adding a member. A member can be saved with no group. |
| G3 | Group can be **set or changed at any time** through the Edit Member form. Saving updates the database and the UI immediately, without a page reload. |
| G4 | The Group field is a **dropdown** (options: *Unassigned*, A … Z). Values are always stored uppercase. |
| G5 | The Member List has a **Group filter** at the top (All, Unassigned, A … Z). Selecting a group shows **only** members of that group — no others. |
| G6 | The active group filter is always visible (e.g. a chip "Group S ✕") together with a **count of matching members** (e.g. "15 members"). |
| G7 | **Export respects the filter.** With Group S selected (say 15 members), "Export Excel" and "Export PDF" download **exactly those 15 members** and nothing else. With no filter, all members are exported. |
| G8 | Exported file names include the group, e.g. `YuvaLink_Members_Group-S_2026-09-30.xlsx` / `.pdf`. |
| G9 | Filtering by group is **instant on the client** (data already loaded in React Context) — no server round-trip per click. |
| G10 | **Smart search:** typing a **single letter** (e.g. `S`) in the search bar filters to Group S. Typing 2+ characters performs a normal search on name / mobile / address / occupation. A small hint under the search box explains this: *"Type a single letter to filter by Group."* |
| G11 | Group filter, search, and sort **combine** (e.g. Group S + Name A–Z). Export uses the combined result. |
| G12 | Group can be set in bulk via Excel import (a `Group` column, optional). Invalid group values are flagged in the import preview rather than silently dropped. |

**Edge cases to test:** member with no group; changing group moves member out of the previous filtered list instantly; a group with zero members shows "No members in Group X"; exporting an empty filtered list is blocked with a friendly message.

---

## 2. Technology Stack (Free Tier)

| Layer | Choice | Notes |
|-------|--------|-------|
| Database | MongoDB Atlas **M0** (512 MB) | Free cluster |
| Backend | Node.js + Express on **Render Free** | Low-memory friendly; sleeps after inactivity |
| Frontend | React SPA (Vite) on **Vercel or Netlify Free** | Static production build |
| State | React Context API (+ reducer) | Members loaded once and cached |
| Excel | `xlsx` (SheetJS) | Import/export |
| PDF | `jspdf` + `jspdf-autotable` (client-side) or `pdfmake` | Client-side preferred to save server memory |
| Auth | bcrypt-hashed password, JWT in httpOnly cookie | See Phase 1 |

---

## Phase 0 — Architecture & Infrastructure

**Goal:** A working, deployable skeleton on free tiers.

**0.1 Database (MongoDB Atlas M0)**
- Create the cluster, a restricted DB user, and IP allow-list.
- Collections and indexes:

| Collection | Key fields | Indexes |
|-----------|-----------|---------|
| `members` | name, mobile, address, currentStudy, occupation, birthDate, group, addedInSatsangApp, ybMember, isDeleted, deletedAt, createdAt, updatedAt | `{ group: 1, name: 1 }`, `{ isDeleted: 1 }`, `{ mobile: 1 }`, `{ birthDate: 1 }` |
| `attendance` | date (YYYY-MM-DD), memberId, status (`P`/`A`), markedAt | unique `{ date: 1, memberId: 1 }`, `{ date: 1 }` |
| `societies` | societyName, membersCount, area, landmark | `{ societyName: 1 }` |
| `settings` | passwordHash, autoLogoutMinutes | — |

**0.2 Backend (Express on Render)**
- REST API, `helmet`, `cors` (restricted to frontend origin), `compression`, `express-rate-limit`.
- Health endpoint `GET /api/health` (used for wake-up ping).
- **Cold-start handling:** On app load, the frontend pings `/api/health` and shows a full-screen branded spinner with the message *"Waking up the server, this can take up to 60 seconds…"*. Requests use a long timeout with one automatic retry.

**0.3 Frontend (React on Vercel/Netlify)**
- Vite production build, route-based code splitting, `_redirects`/`vercel.json` for SPA routing.
- `MembersContext` loads all members once; group filter, search and sort run in memory.

**0.4 File utilities**
- SheetJS for parsing/generating `.xlsx` (stream/limit file size to 5 MB).
- jsPDF + autotable for PDF with header, generated date, group label and page numbers.

**Acceptance criteria:** app deploys from Git on all three free services; health check works; cold-start spinner appears when API is asleep; indexes exist.

---

## Phase 1 — Authentication, Layout & Security

**1.1 Login page**
- Centered card, YuvaLink logo/title, **password-only** field with show/hide toggle, submit button with loading state.
- Client-side: required, min length. Server-side: bcrypt compare, generic error message ("Incorrect password").
- Rate-limit login attempts (e.g. 5 per 15 minutes) with a clear lock message.

**1.2 App shell & navigation**
- Sidebar: **Members, Attendance, Report, Trash, Settings**, plus Logout.
- Desktop: fixed sidebar. Mobile: hamburger menu with slide-in drawer and overlay. Active-route highlight.

**1.3 Session management (auto-logout)**
- Inactivity timer (default 15 minutes, configurable in Settings) listening to mouse move, key press, click, touch.
- On timeout, open a **60-second warning modal** with a **live countdown** and two buttons: **Stay Logged In** (resets timer) and **Logout Now** (ends session immediately). At 0 the user is logged out automatically.
- Timer state must survive tab switching (use timestamps, not only `setInterval`).

**Acceptance criteria:** protected routes redirect to login; wrong password rejected; modal countdown accurate; Logout Now clears the session; layout works on phone, tablet and laptop.

---

## Phase 2 — Member Management & Group Assignment

**2.1 Add / Edit Member form (modal)**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | text | **Yes** | 2–80 chars |
| Mobile Number | text | **Yes** | 10 digits (India), numeric only |
| Address | textarea | No | max 250 chars |
| Current Study | text | No | max 100 chars |
| Occupation | text | No | max 100 chars |
| Birth Date | date | No | not in the future |
| **Group** | dropdown (Unassigned, A–Z) | **No — optional** | single letter A–Z or empty |
| Added in Satsang App | toggle | No | default off |
| YB Member | toggle | No | default off |

- Group is optional on create and editable any time from the Edit form (see Section 1, rules G1–G4).
- Duplicate-mobile warning on save.

**2.2 Member directory**
- **Total Members** badge (reflects the current filter, with overall total shown, e.g. "15 of 240").
- Table columns: **Name, Group, Mobile, Address, Study, Occupation, Birth Date (Age), Last Updated, Actions (Edit / Delete)**.
- Group shown as a coloured badge; blank shown as "—".
- Empty state: **"No members added yet"** with an *Add Member* button.
- Mobile: table becomes a card list.

**2.3 Sorting**
- Quick sort: **Name A–Z, Name Z–A, Newest First, Oldest First**.

**2.4 Satsang segment view**
- Dedicated sub-section **"Satsang Members"** (members flagged *Added in Satsang App*) with a **Show Deleted** toggle acting as an inline soft-trash viewer, allowing restore.

**Acceptance criteria:** create with and without group; edit group later and see it update instantly; delete moves to Trash; sorting correct; empty state shown.

---

## Phase 3 — Group Filtering, Search & Attendance

**3.1 Group filter & smart search**
- Group dropdown/filter bar at the top of the Member List: **All, Unassigned, A–Z**.
- Selecting a group shows **only** that group's members (rules G5, G6, G9).
- Smart search per rules G10–G11.

**3.2 Daily attendance**
- Live counters: **Total, P (Present), A (Absent)**.
- Date defaults to today; one-tap Present/Absent toggle per member; bulk actions "Mark all present / absent".
- Two live lists: **Present Members** and **Absent Members**, updating instantly.
- Attendance can also be viewed/marked **by Group** using the same filter.
- Saves are optimistic with error rollback.

**3.3 Attendance report**
- **From** and **To** date pickers, optional Group filter.
- Empty state: **"No attendance data to display."**
- Results show per-member present/absent totals and percentage.

**Acceptance criteria:** typing `S` shows only Group S; combined filters work; counters always equal P + A = Total; report respects date range.

---

## Phase 4 — Import & Group-Aware Export

**4.1 Excel import / backup**
- Upload area titled **"Select Backup to Import"** accepting `.xlsx`/`.xls`; downloadable template with columns: Name, Mobile, Address, Current Study, Occupation, Birth Date, Group, Added in Satsang App, YB Member.
- Preview with row-level validation errors before committing.

**4.2 Duplicate handling**
- Duplicates matched by **mobile number** (fallback: name + birth date).
- Modal **"Duplicate Members Found"** listing duplicates with checkboxes and buttons **Cancel Import** / **Import Selected**. Non-duplicates import automatically.

**4.3 Export (group-aware)**
- **Export Excel** and **Export PDF** buttons on the Member List.
- **Exports contain exactly the members currently shown** — group filter, search and sort all applied (rules G7, G8, G11). Example: Group S with 15 members → file with 15 rows.
- PDF includes title, group label, member count, generated date and page numbers; Excel has bold headers and auto-width columns.
- **Export as Excel** button inside the Attendance Report view.
- Exporting zero rows shows "Nothing to export for this selection."

**Acceptance criteria:** filtered export row count equals on-screen count; exports open correctly in Excel/PDF readers; duplicate modal gives correct control; malformed files rejected with a clear message.

---

## Phase 5 — Settings & Administration

**5.1 Delete Attendance Date**
- Calendar picker to choose a date; confirmation modal stating how many records will be permanently removed; then deletes and refreshes reports.

**5.2 Upcoming Birthdays**
- **Show Upcoming Birthdays** lists members with birthdays within **±7 days** of today. Must handle year-end wrap-around and 29 Feb. Show name, group, date, and "in X days / today / X days ago".

**5.3 Society Management**
- Table: **Society Name, Members Count, Area, Landmark, Actions (Edit/Delete)** with Add Society form.
- **Clear All Society Data** button (danger style) behind a mandatory **Yes / No** confirmation modal.

**5.4 Other settings**
- Change password (current + new), auto-logout duration.

**Acceptance criteria:** purge removes only the chosen date; birthday window correct across year boundaries; clear-all requires explicit Yes.

---

## 6. Trash
- Lists soft-deleted members with deletion date, **Restore** and **Delete Permanently** (confirmation required). Empty state: "Trash is empty."

## 7. API Outline

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login`, `/api/auth/logout` | Session |
| GET / POST | `/api/members` | List (all, non-deleted) / create |
| PUT / DELETE | `/api/members/:id` | Edit (including `group`) / soft delete |
| POST | `/api/members/:id/restore` | Restore from Trash |
| GET | `/api/members/trash` | Deleted members |
| POST | `/api/import/preview`, `/api/import/commit` | Excel import |
| GET | `/api/export/members?group=S` | Server-side Excel (optional) |
| GET / POST | `/api/attendance?date=` | Read / mark attendance |
| GET | `/api/attendance/report?from=&to=&group=` | Report |
| DELETE | `/api/attendance/:date` | Purge a date |
| GET | `/api/birthdays` | ±7-day window |
| CRUD | `/api/societies`, DELETE `/api/societies` | Society directory |

## 8. Non-Functional Requirements
- Security: bcrypt, httpOnly + secure cookie, CORS allow-list, input sanitisation, rate limiting, HTTPS only.
- Performance: initial load under 3 s on 4G once server is awake; client-side filtering under 100 ms for 5,000 members.
- Responsiveness: fully responsive website on laptop, tablet and phone. Accessibility: keyboard navigable modals, visible focus, label associations, sufficient contrast.
- Data safety: MongoDB Atlas backups not on free tier — provide an in-app **Full Backup (Excel)** export.
- Browser support: latest Chrome, Edge, Safari, Firefox; Android/iOS mobile browsers.

## 9. Definition of Done (per phase)
1. All acceptance criteria met.
2. Empty, loading and error states implemented.
3. Validation on client and server.
4. Tested at 360 px (phone), 768 px (tablet) and 1366 px (laptop): all text and features fully visible, no horizontal page scroll, nothing cut off.
5. README section updated; deployed to free-tier staging.
