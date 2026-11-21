@echo off
echo ========================================================
echo Building Care Platform: Single Combined Production WAR
echo ========================================================

cd /d "%~dp0backend"
echo [1/2] Compiling Frontend and Packaging Spring Boot Backend into ROOT.war...
call mvn clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed! Check the errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/2] Build successful!
echo.
echo Output Archive: %~dp0backend\target\ROOT.war
echo Deploy this file to your Apache Tomcat 10.1+ server:
echo   $CATALINA_BASE/webapps/ROOT.war
echo.
echo ========================================================
pause

