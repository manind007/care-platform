Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Building Care Platform: Single Combined Production WAR" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location "$scriptDir\backend"

try {
    Write-Host "[1/2] Compiling Frontend and Packaging Spring Boot Backend into ROOT.war..." -ForegroundColor Yellow
    mvn clean package -DskipTests
    if ($LASTEXITCODE -ne 0) {
        throw "Maven build failed with exit code $LASTEXITCODE"
    }

    $warPath = Resolve-Path "$scriptDir\backend\target\ROOT.war"
    Write-Host "[2/2] Build Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Output Archive: $warPath" -ForegroundColor Green
    Write-Host "Deployment target: `$CATALINA_BASE/webapps/ROOT.war (Apache Tomcat 10.1+)" -ForegroundColor Cyan
} finally {
    Pop-Location
}

