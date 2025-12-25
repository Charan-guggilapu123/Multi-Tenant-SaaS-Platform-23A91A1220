#!/bin/bash

# Multi-Tenant SaaS Platform - Automated Test Script
# This script verifies all services are running correctly

echo "🧪 Multi-Tenant SaaS Platform - Automated Tests"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0
PASSED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    local method=${4:-GET}
    local data=${5:-}
    local token=${6:-}
    
    echo -n "Testing $name... "
    
    if [ -n "$token" ]; then
        HEADER="Authorization: Bearer $token"
    else
        HEADER=""
    fi
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -H "$HEADER" \
            -d "$data")
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" "$url" -H "$HEADER")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $HTTP_CODE)"
        echo "Response: $BODY"
        ((FAILED++))
        return 1
    fi
}

echo "Step 1: Checking Docker Services"
echo "-----------------------------------"

if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}✗ Docker services are not running!${NC}"
    echo "Please run: docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✓ Docker services are running${NC}"
echo ""

echo "Step 2: Testing Health Check"
echo "-----------------------------------"
test_endpoint "Health Check" "http://localhost:5000/api/health" "200"
echo ""

echo "Step 3: Testing Authentication"
echo "-----------------------------------"

# Test Login
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@demo.com","password":"Demo@123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Token: ${TOKEN:0:20}..."
    ((PASSED++))
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    ((FAILED++))
fi
echo ""

echo "Step 4: Testing Authenticated Endpoints"
echo "-----------------------------------"
test_endpoint "Get Current User" "http://localhost:5000/api/auth/me" "200" "GET" "" "$TOKEN"
test_endpoint "List Projects" "http://localhost:5000/api/projects" "200" "GET" "" "$TOKEN"
test_endpoint "List Users" "http://localhost:5000/api/tenants/1/users" "200" "GET" "" "$TOKEN"
echo ""

echo "Step 5: Testing Frontend"
echo "-----------------------------------"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Frontend is not accessible (HTTP $FRONTEND_STATUS)${NC}"
    ((FAILED++))
fi
echo ""

echo "Step 6: Testing Database Connection"
echo "-----------------------------------"
DB_TEST=$(docker exec database psql -U postgres -d saas_db -c "SELECT COUNT(*) FROM \"Users\";" 2>&1)
if echo "$DB_TEST" | grep -q "count"; then
    echo -e "${GREEN}✓ Database is accessible and seeded${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Database connection failed${NC}"
    ((FAILED++))
fi
echo ""

# Summary
echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Application is ready for submission.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
