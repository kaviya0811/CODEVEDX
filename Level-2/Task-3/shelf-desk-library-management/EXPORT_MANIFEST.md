# Shelf / Desk Export Manifest

## Package

`Shelf-Desk-Library-Management-System.zip` contains the source project, frontend lockfile, Java/Maven source, SQL schema and sample data, configuration, documentation, screenshots, and project planning files. Generated `node_modules`, `dist`, and Maven `target` artifacts are intentionally excluded; they are reproducible from the documented commands.

## Verified before export

- `npm run build` passed for the React/Vite frontend.
- `mvn clean package` passed for the Java backend WAR.
- Port 3000 served the application and `/manus-routes.json` returned valid JSON.
- Local MariaDB/Tomcat smoke tests passed for database reads, add persistence, search, issue decrement, unavailable-issue conflict, return increment/status/date, duplicate-return conflict, active-loan-preserving update, historical-delete conflict, clean deletion and validation errors; test rows were removed afterward.
- The Vite `/library-management` proxy returned the live API response from Tomcat.
- `INTEGRATION_TEST_REPORT.md` records every requested test case with expected result, actual result and PASS status.
- `screenshots/integration/` contains live captures for Dashboard, Add Book, Manage Books, Issue Book, Return Book, Available Books and Issue History.
- The dashboard screenshot was captured from the current managed Preview.

## Actual integration boundary

The Java/JDBC/MySQL implementation is present and buildable. The frontend calls the Java Servlet endpoints for reads and mutations; it does not keep sample state as the source of truth. The managed Preview has no user-owned Tomcat/MySQL instance attached, so it reports the unavailable backend until `VITE_API_BASE_URL` is configured. Local integration was verified against a temporary MariaDB/Tomcat runtime; a user deployment still requires running the SQL script, setting `DB_URL`, `DB_USER`, and `DB_PASSWORD`, and deploying the WAR to Tomcat. Book deletion is blocked for any book with issue history, preserving historical rows.

Interactive screen recording export was not available in the sandbox/browser tooling. The package therefore includes the actual integration report and genuine live screenshots, but does not claim to contain a video recording.
