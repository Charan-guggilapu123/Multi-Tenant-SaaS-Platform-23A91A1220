# Multi-Tenant SaaS Platform - Automated Test Script (PowerShell)
# This script verifies all services are running correctly

Write-Host "🧪 Multi-Tenant SaaS Platform - Automated Tests" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$Script:FAILED = 0
$Script:PASSED = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedCode,
        [string]$Method = "GET",
        [string]$Data = "",
        [string]$Token = ""
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        if ($Method -eq "POST" -and $Data) {
            $response = Invoke-WebRequest -Uri $Url -Method POST -Headers $headers -Body $Data -UseBasicParsing -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -UseBasicParsing -ErrorAction Stop
        }
        
        if ($response.StatusCode -eq $ExpectedCode) {
            Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $($response.StatusCode))"
            $Script:PASSED++
            return $true
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (Expected $ExpectedCode, got $($response.StatusCode))"
            $Script:FAILED++
            return $false
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedCode) {
            Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $statusCode)"
            $Script:PASSED++
            return $true
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (Expected $ExpectedCode, got $statusCode)"
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
            $Script:FAILED++
            return $false
        }
    }
}

Write-Host "Step 1: Checking Docker Services" -ForegroundColor Yellow
Write-Host "-----------------------------------"

$dockerStatus = docker compose ps 2>&1
if ($dockerStatus -match "Up") {
    Write-Host "✓ Docker services are running" -ForegroundColor Green
} else {
    Write-Host "✗ Docker services are not running!" -ForegroundColor Red
    Write-Host "Please run: docker compose up -d"
    exit 1
}
Write-Host ""

Write-Host "Step 2: Testing Health Check" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Start-Sleep -Seconds 2
Test-Endpoint -Name "Health Check" -Url "http://localhost:5000/api/health" -ExpectedCode 200
Write-Host ""

Write-Host "Step 3: Testing Authentication" -ForegroundColor Yellow
Write-Host "-----------------------------------"

try {
    $loginBody = @{
        email = "admin@demo.com"
        password = "Demo@123"
        tenantSubdomain = "demo"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop

    if ($loginResponse.success -and $loginResponse.data.token) {
        Write-Host "✓ Login successful (Demo Admin)" -ForegroundColor Green
        $token = $loginResponse.data.token
        Write-Host "Token: $($token.Substring(0, [Math]::Min(20, $token.Length)))..."
        $Script:PASSED++
    } elseif ($loginResponse.token) {
        Write-Host "✓ Login successful (legacy shape)" -ForegroundColor Green
        $token = $loginResponse.token
        $Script:PASSED++
    } else {
        Write-Host "✗ Login failed - No token received" -ForegroundColor Red
        $Script:FAILED++
    }
} catch {
    Write-Host "✗ Login failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    $Script:FAILED++
    $token = $null
}
Write-Host ""

if ($token) {
    Write-Host "Step 4: Testing Authenticated Endpoints" -ForegroundColor Yellow
    Write-Host "-----------------------------------"
    Test-Endpoint -Name "Get Current User" -Url "http://localhost:5000/api/auth/me" -ExpectedCode 200 -Token $token
    Test-Endpoint -Name "List Projects" -Url "http://localhost:5000/api/projects" -ExpectedCode 200 -Token $token
    # Cross-tenant isolation check: attempt to list users for acme tenant with demo token should be forbidden or not found
    Test-Endpoint -Name "Cross-tenant isolation (users)" -Url "http://localhost:5000/api/tenants/99999999-9999-9999-9999-999999999999/users" -ExpectedCode 403 -Token $token | Out-Null
    Write-Host ""
}

Write-Host "Step 5: Testing Frontend" -ForegroundColor Yellow
Write-Host "-----------------------------------"
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✓ Frontend is accessible" -ForegroundColor Green
        $Script:PASSED++
    }
} catch {
    Write-Host "✗ Frontend is not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    $Script:FAILED++
}
Write-Host ""

Write-Host "Step 6: Testing Database Connection" -ForegroundColor Yellow
Write-Host "-----------------------------------"
try {
    $dbTest = docker exec database psql -U postgres -d saas_db -t -A -c "SELECT COUNT(*) FROM users;" 2>&1
    if ($dbTest -match "^[0-9]+$") {
        Write-Host "✓ Database is accessible and seeded (users=$dbTest)" -ForegroundColor Green
        $Script:PASSED++
    } else {
        Write-Host "✗ Database query failed" -ForegroundColor Red
        Write-Host "$dbTest" -ForegroundColor Yellow
        $Script:FAILED++
    }
} catch {
    Write-Host "✗ Database connection failed" -ForegroundColor Red
    $Script:FAILED++
}
Write-Host ""

# Summary
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Passed: " -NoNewline
Write-Host $Script:PASSED -ForegroundColor Green
Write-Host "Failed: " -NoNewline
Write-Host $Script:FAILED -ForegroundColor Red
Write-Host ""

if ($Script:FAILED -eq 0) {
    Write-Host "🎉 All tests passed! Application is ready for submission." -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some tests failed. Please review the errors above." -ForegroundColor Red
    exit 1
}
