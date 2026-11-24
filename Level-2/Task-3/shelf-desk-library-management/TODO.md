# Library Management System — Delivery Outcomes

## 1. Dashboard and navigation
- [x] Provide sections for Dashboard, Add Book, Manage Books, Issue Book, Return Book, Available Books and Issue History.
- [x] Show dashboard summary cards for total books, total available copies, issued books and returned books.
- [x] Keep the interface responsive for desktop, tablet and mobile with sidebar navigation, organized tables/forms, consistent buttons, typography, spacing and colors.

## 2. Add and manage books
- [x] Provide a form with book ID, title, author, category, ISBN and total quantity.
- [x] Validate input fields and display a clear success or error message after submission.
- [x] Save book details through the Java/JDBC/MySQL implementation using `PreparedStatement`.
- [x] View all books, edit/update book details, and delete a book only when it has no issue history; historical issue/return rows are preserved.
- [x] Confirm before deleting any book.

## 3. Issue books
- [x] Collect borrower name or student ID, book ID and issue date.
- [x] Check whether the selected book is available before issuing it.
- [x] Prevent issuing a book when no copies are available.
- [x] Record every issue transaction in MySQL and correctly decrease available quantity.
- [x] Use a JDBC transaction and row-level locking so the issue record and quantity update remain consistent.

## 4. Return books
- [x] Allow the librarian to identify an issue transaction and record its return date.
- [x] Update issue status to returned and increase available quantity after a successful return.
- [x] Prevent the same issued book from being returned multiple times.
- [x] Use a JDBC transaction and row-level locking so the return record and quantity update remain consistent.

## 5. Available books and history
- [x] Display book ID, title, author, category, total quantity and available quantity.
- [x] Search by title, author or ISBN and clearly indicate available/out-of-stock state.
- [x] View the list of currently issued books.
- [x] View issue and return transaction history.

## 6. Backend, database and handoff
- [x] Organize frontend, backend, database and configuration folders with beginner-friendly Java OOP.
- [x] Separate database connection logic from application logic and handle connection errors.
- [x] Validate inputs on frontend and backend, use reusable methods, and avoid hardcoded records as a replacement for database operations.
- [x] Include `library_management` MySQL creation script with primary keys, foreign keys, suitable types, constraints and sample records.
- [x] Include README setup instructions, MySQL credential configuration, local run instructions, Tomcat deployment notes and project structure.

## 7. Verification evidence
- [x] The frontend production build passes with `npm run build` and the managed preview serves `/` plus `/manus-routes.json` on port 3000.
- [x] The Java handoff packages successfully as `backend/target/library-management.war` with Maven.
- [x] The Java source, SQL schema and README align on table/field names and quantity rules.
- [x] A temporary local MariaDB/Tomcat runtime was exercised on 2026-11-16: reads, add/refresh persistence, search, issue decrement, unavailable-issue prevention, return increment/status/date, duplicate-return prevention, active-loan-preserving update, historical-delete protection, clean deletion and validation errors all returned the expected results; test-only rows were removed afterward.
- [x] The Vite frontend on port 3000 successfully proxied `/library-management/api/books` to the live Tomcat API. The managed preview remains intentionally separate and does not claim a database-backed remote connection.
