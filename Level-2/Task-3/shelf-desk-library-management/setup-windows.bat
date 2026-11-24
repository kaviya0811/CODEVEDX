@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Shelf / Desk - first-time Windows setup
 echo.
where powershell.exe >nul 2>&1 || (echo PowerShell is required and should be included with Windows.& exit /b 1)
where npm.exe >nul 2>&1 || (echo Node.js/npm was not found. Install Node.js 18+ and try again.& exit /b 1)
where mvn.cmd >nul 2>&1 || (echo Maven was not found. Install Maven 3.9+ and ensure mvn is on PATH.& exit /b 1)
where java.exe >nul 2>&1 || (echo Java was not found. Install JDK 17 and ensure java is on PATH.& exit /b 1)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\initialize-database.ps1" -SchemaFile "%~dp0database\schema.sql"
if errorlevel 1 exit /b 1

echo.
echo Installing frontend dependencies...
npm install
if errorlevel 1 exit /b 1

echo.
echo Building the Java 17 backend...
mvn -f backend\pom.xml clean package
if errorlevel 1 exit /b 1

echo.
echo Setup complete. Run run-windows.bat to start Tomcat and the React frontend.
pause
