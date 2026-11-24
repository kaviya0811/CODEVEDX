@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo Shelf / Desk - starting the complete local application
if not exist "backend\target\library-management.war" (
  echo Backend WAR not found. Run setup-windows.bat first.
  pause
  exit /b 1
)

if "%TOMCAT_HOME%"=="" set /p "TOMCAT_HOME=Enter your Apache Tomcat 10.1 folder path: "
if not exist "%TOMCAT_HOME%\bin\startup.bat" (
  echo Could not find Tomcat startup.bat under "%TOMCAT_HOME%\bin".
  pause
  exit /b 1
)

for /f "usebackq delims=" %%P in (`powershell.exe -NoProfile -Command "$s=Read-Host 'Enter your existing MySQL root password (input is hidden)' -AsSecureString; $b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try {[Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)}"`) do set "DB_PASSWORD=%%P"
if "%DB_PASSWORD%"=="" (
  echo No password was entered. Startup cancelled.
  pause
  exit /b 1
)
set "DB_URL=jdbc:mysql://localhost:3306/library_management?useSSL=false^&serverTimezone=UTC"
set "DB_USER=root"

copy /Y "backend\target\library-management.war" "%TOMCAT_HOME%\webapps\library-management.war" >nul
if errorlevel 1 (
  echo Could not copy the backend WAR into Tomcat webapps.
  pause
  exit /b 1
)

call "%TOMCAT_HOME%\bin\startup.bat"
if errorlevel 1 (
  echo Tomcat did not start.
  pause
  exit /b 1
)

echo.
echo Starting the React frontend at http://localhost:3000 ...
start "Shelf Desk Frontend" /D "%~dp0" cmd /k npm run dev

echo.
echo Backend:  http://localhost:8080/library-management
 echo Frontend: http://localhost:3000
 echo Close the Tomcat and frontend windows to stop the application.
start "" http://localhost:3000
endlocal
