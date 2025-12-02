Write-Host "=== PROXIMITY ASSIGNMENT TEST ===" -ForegroundColor Green
Write-Host "Starting test for proximity-based property assignment..." -ForegroundColor Yellow
Write-Host ""

# Load environment variables if .env file exists
if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], [System.EnvironmentVariableTarget]::Process)
        }
    }
}

# Run the test script
Write-Host "Running proximity assignment test..." -ForegroundColor Yellow
node test_proximity_assignment.js

Write-Host ""
Write-Host "=== TEST COMPLETED ===" -ForegroundColor Green
Write-Host "Check the output above for results." -ForegroundColor White
Write-Host ""
Write-Host "To manually trigger reassignment via API (admin only):" -ForegroundColor Cyan
Write-Host "POST /api/admin/agents/reassign-proximity" -ForegroundColor White
Write-Host ""
Write-Host "Key improvements implemented:" -ForegroundColor Magenta
Write-Host "1. OPTIMAL: Properties assigned to nearest agent within service radius" -ForegroundColor Green
Write-Host "2. FALLBACK: Properties outside all radii assigned to closest available agent" -ForegroundColor Yellow
Write-Host "3. Verified agents are prioritized over unverified ones" -ForegroundColor White
Write-Host "4. Service radius respected but not strictly enforced (smart fallback)" -ForegroundColor White
Write-Host "5. No properties left unassigned (everyone gets service)" -ForegroundColor White
Write-Host "6. Admin endpoint added for manual reassignment" -ForegroundColor White

Write-Host ""
Write-Host "Run demo:" -ForegroundColor Cyan
Write-Host "node demo_hybrid_assignment.js" -ForegroundColor White