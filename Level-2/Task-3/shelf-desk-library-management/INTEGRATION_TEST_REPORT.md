# Shelf / Desk — Actual Integration Test Report

**Execution date:** 2026-11-16  
**Runtime:** React/Vite on port 3000, Apache Tomcat 10.1 on port 8080, MariaDB/MySQL-compatible database `library_management`  
**API context:** `/library-management`  
**Test data:** Temporary QA records were created through the API and removed afterward. Seeded records were restored before final verification.

## Test results

| ID | Test case | Expected result | Actual result | Status |
|---|---|---|---|---|
| T01 | Load books and history from the frontend/API | The application should load database-backed books and history rather than sample-only state. | `GET /api/books` returned 8 seeded books and `GET /api/history` returned 6 seeded records. The frontend loaded the same records in the dashboard, Manage Books, Return Book, Available Books and Issue History views. | **PASS** |
| T02 | Add a new book | A valid book should be accepted and saved to MySQL with all copies available. | Added `QA-9001` with quantity 1 through `POST /api/books`; response was HTTP 200 and SQL confirmed `total_quantity=1`, `available_quantity=1`. | **PASS** |
| T03 | Refresh/persistence after add | The added record should remain available after another frontend/API load. | Search/refresh through `GET /api/books?search=Integration%20Test%20Book` returned `QA-9001`. | **PASS** |
| T04 | Issue an available book | The issue should be recorded and available quantity should decrease atomically. | Issued the only copy of `QA-9001`; response was HTTP 200, SQL showed `available_quantity=0`, and a new `Issued` issue row was present. | **PASS** |
| T05 | Issue an unavailable book | The API should reject the issue and leave inventory unchanged. | A second issue attempt for `QA-9001` returned HTTP 409 with `No copies are available.` | **PASS** |
| T06 | Return an issued book | The issue should become returned, return date should be saved, and availability should increase. | Returned issue ID 7; response was HTTP 200, SQL showed `available_quantity=1`, `status=Returned`, and `return_date=2026-11-16`. | **PASS** |
| T07 | Return the same book twice | Duplicate returns should be rejected without a second quantity increment. | Repeated the return; response was HTTP 409 with `Issue is missing or already returned.` | **PASS** |
| T08 | Search books | Search should match title, author or ISBN. | Title search for `Integration Test Book` returned the unique QA record. The live Available Books view also displayed the seeded catalog and search field. | **PASS** |
| T09 | Edit an existing book with an active issue | Total quantity may change, but available quantity must preserve the active-loan count. | Updated seeded `BK-1042` from total 8 to 9 while one issue was active; SQL confirmed `total_quantity=9`, `available_quantity=8`. | **PASS** |
| T10 | Verify issue and return history | History should retain both issued and returned transactions with dates/statuses. | Live history returned 6 seeded records, including 4 `Issued` and 2 `Returned` rows. The temporary QA issue also showed the expected return state before cleanup. | **PASS** |
| T11 | Restart backend and verify persistence | Restarting Tomcat should not erase MySQL records. | Before restart: 8 books and 6 history records. After restarting Tomcat: 8 books and 6 history records. | **PASS** |
| T12 | Delete a book with history | Historical issue/return rows should be preserved and deletion should be blocked. | Deleting `QA-9001` after its return returned HTTP 409 with `This book has issue history and cannot be deleted.` | **PASS** |
| T13 | Delete a book with no history | A clean, unused book should be deletable. | Added `QA-9002`, deleted it successfully with HTTP 200, and SQL confirmed it was absent. | **PASS** |
| T14 | Backend/frontend validation | Invalid IDs, ISBNs or quantities should return meaningful errors. | Invalid ISBN/quantity request returned HTTP 400 with `ISBN must contain 10–17 digits or hyphens.` | **PASS** |
| T15 | Vite proxy | The frontend-origin API path should reach Tomcat. | `GET http://localhost:3000/library-management/api/books` returned 8 live database records from Tomcat. | **PASS** |
| T16 | Production builds | Frontend and Java backend should build from source. | `npm run build` passed; `mvn -q -f backend/pom.xml clean package` passed and produced the WAR. | **PASS** |

## Evidence files

The `screenshots/integration/` folder contains live browser captures of the dashboard, Add Book, Manage Books, Issue Book, Return Book, Available Books and Issue History sections. The dashboard and section views show the database-backed seeded records and the `System healthy / Last synced just now` state.

The SQL schema and sample data are in [`database/schema.sql`](database/schema.sql). The complete project package includes all source, configuration, documentation and screenshots.

## Recording limitation

A genuine interactive screen recording could not be produced with the available sandbox/browser tools: they support live navigation, interaction and still screenshots, but do not expose a screen-recording export API. No simulated slideshow is being presented as a recording. The live walkthrough states are preserved as browser screenshots, and the test matrix above is based on actual HTTP, SQL, Tomcat restart and frontend-proxy execution.

## Technology confirmation

The final application uses Java 17 source configuration, JDBC, MySQL/MariaDB-compatible SQL, Java Servlets, Maven, Apache Tomcat 10.1, and a React + TypeScript frontend. Frontend reads and mutations call the Java API; the Java API uses JDBC prepared statements and transactions against MySQL. The frontend no longer uses in-memory sample records as its source of truth.
