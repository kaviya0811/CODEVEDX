# Library Management System — Implementation Plan

## Product scope
A responsive library admin workspace for the CODEVEDX Java Development Internship Level 2, Task 3. The visible product is a polished management dashboard with working client-side interactions and realistic sample records. The repository also includes a beginner-friendly Java Servlet/JDBC/MySQL implementation handoff under `backend/` and `database/` so the UI can be connected to the requested stack locally.

## Implementation approach
- Build the browser experience with a small Vite + React + TypeScript app. Keep the app dependency-light and use inline SVG icons so the interface is self-contained.
- Keep sample books and issue records in typed in-memory state for the preview experience, with the same domain rules as the Java service layer: available quantity cannot go below zero, returns are idempotent, and books with active issues cannot be deleted.
- Add forms for books, issue and return operations with validation, toast feedback, search, filters, edit/delete flows, and a responsive sidebar navigation.
- Include the Java backend handoff in `backend/src/main/java/com/codevedx/library/`: `DBConnection`, models, DAO, service transaction logic, and servlet endpoints. Use `PreparedStatement`, row locks and JDBC transactions for issue/return consistency.
- Include `database/schema.sql` with the `library_management` database, foreign keys, constraints, indexes, sample records, and clear credential configuration instructions in `README.md`.
- Serve the application on port 3000 and expose `public/manus-routes.json` for the managed preview route manifest.

## Project structure
- `src/` — React app, typed domain state, UI sections and styles.
- `public/` — route manifest and static metadata.
- `backend/` — Java Servlet/JDBC source, Maven configuration and runtime configuration examples.
- `database/` — MySQL schema, constraints, indexes and sample records.
- `README.md` — project overview, local setup, MySQL credentials, Tomcat deployment notes and feature mapping.
- `TODO.md` — acceptance outcomes tracked against the brief.

## Design direction
### Alternatives considered
- **Quiet academic editorial** — 0.07 probability. A paper-like archive interface with restrained navy rules and bookish typography.
- **Civic operations console** — 0.06 probability. A calm, high-trust public-service dashboard that makes circulation work feel legible and accountable.
- **Mid-century reading room** — 0.04 probability. Warm paper surfaces, brass accents and catalog-card references.

### Chosen: Civic operations console
- **Design Movement:** Contemporary civic service design with editorial catalog cues.
- **Core Principles:** Make circulation status instantly legible; give every action a clear next step; balance operational density with generous whitespace; use restrained motion only to confirm state changes.
- **Color Philosophy:** Deep ink navy conveys trust and institutional continuity; warm ivory prevents the dashboard from feeling clinical; teal signals live availability and successful circulation; amber is reserved for attention and active loans.
- **Layout Paradigm:** Persistent left rail + a broad working canvas. The dashboard uses a narrow “signal strip” for KPI cards, then lets tables and action panels occupy the full reading width instead of forcing everything into centered cards.
- **Signature Elements:** Rounded book-spine mark; thin teal status rail on active/available rows; oversized serif section titles paired with compact uppercase metadata.
- **Interaction Philosophy:** Every mutation produces a concise toast, destructive actions require confirmation, and forms preselect sensible defaults without hiding important fields.
- **Animation:** 160–220ms ease-out fades and short vertical slides for toasts, drawers and row state updates; no decorative looping motion.
- **Typography System:** `DM Sans` for controls and data; `Fraunces` for page titles and editorial labels. Tight uppercase tracking for metadata and navigation groups.
- **Brand Essence:** “A calmer way to keep the stacks moving” for librarians and internship demos; clear, dependable, quietly polished.
- **Brand Voice:** Direct, warm, operational. Example lines: “Keep the stacks moving.” and “One copy left — lend with care.”
- **Wordmark & Logo:** A simple three-spine monogram inside a rounded square, paired with the wordmark “shelf / desk”.
- **Signature Brand Color:** `#168A83` — a library-card teal used only for live circulation states and primary action emphasis.
