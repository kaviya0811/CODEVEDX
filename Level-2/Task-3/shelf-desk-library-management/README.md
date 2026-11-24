# Shelf / Desk — Library Management System

CODEVEDX Java Development Internship, Level 2 — Task 3. This is the complete application: React + TypeScript frontend, Java 17 Jakarta Servlet/JDBC backend, and MySQL database.

## Fastest Windows setup

Install these prerequisites first:

- JDK 17
- MySQL Community Server 8.0.x and MySQL Workbench
- Apache Maven 3.9+
- Apache Tomcat 10.1+
- Node.js 18+ (includes npm)

Make sure `java`, `mvn`, `npm`, and `mysql` are available in PATH. Download Apache Maven and Tomcat from their official websites if they are not installed yet.

1. Double-click **`setup-windows.bat`**.
2. When prompted, enter your existing MySQL `root` password. The prompt hides the password; it is not saved in the project.
3. Double-click **`run-windows.bat`**.
4. Enter the path to your Apache Tomcat 10.1 folder when asked, for example `C:\apache-tomcat-10.1.48`.
5. Enter the same MySQL root password again. The script starts the Java backend and React frontend.
6. Open <http://localhost:3000>.

The backend runs at `http://localhost:8080/library-management`. Keep the Tomcat and frontend command windows open while using the application.

## What the scripts do

- `setup-windows.bat` securely initializes `database/schema.sql`, installs frontend packages, and builds `backend/target/library-management.war`.
- `run-windows.bat` copies the WAR to Tomcat, starts Tomcat, sets database connection variables only for the running process, and starts Vite.
- The schema is compatible with MySQL 8.0.46. Its cross-column quantity check is a table-level constraint, avoiding MySQL Error 3813.
- Re-running the schema does not overwrite existing book quantities or duplicate the sample issue records.

## Manual commands

```bash
# Initialize MySQL; enter the password when prompted
mysql -u root -p < database/schema.sql

# Frontend
npm install
npm run dev

# Backend
cd backend
mvn clean package
# Copy target/library-management.war into Tomcat webapps, then start Tomcat.
```

Before starting Tomcat manually, set these environment variables in the same terminal. Never put the password in source code:

```text
DB_URL=jdbc:mysql://localhost:3306/library_management?useSSL=false&serverTimezone=UTC
DB_USER=root
DB_PASSWORD=<your existing MySQL root password>
```

The frontend uses the Vite proxy from port 3000 to Tomcat on port 8080. Existing features remain available: dashboard, add/edit/delete books, search, issue, return, available books, and issue history.
