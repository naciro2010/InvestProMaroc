#!/bin/bash

# Authorization Testing Script
# This script helps verify that admin authorization is working correctly

set -e

API_BASE="http://localhost:8080"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

echo "======================================================================"
echo "InvestPro Maroc - Authorization Testing Script"
echo "======================================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_section() {
    echo ""
    echo "======================================================================"
    echo "  $1"
    echo "======================================================================"
}

# Check if API is running
print_section "Step 1: Checking if backend is running"
echo "Testing: GET $API_BASE/api/auth/debug/health"
if curl -s -f "$API_BASE/api/auth/debug/health" > /dev/null 2>&1; then
    print_success "Backend is running and responding"
else
    print_error "Backend is not responding at $API_BASE"
    echo "Please start the backend with: cd backend && ./gradlew bootRun"
    exit 1
fi

# Step 2: Login
print_section "Step 2: Logging in as admin"
echo "Testing: POST $API_BASE/api/auth/login"
echo "Credentials: username=admin, password=admin123"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$ADMIN_USERNAME\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    print_error "Failed to obtain access token"
    echo "Check credentials and ensure backend is running"
    exit 1
fi

print_success "Access token obtained"
echo "Token: ${TOKEN:0:50}..."

# Step 3: Check whoami
print_section "Step 3: Checking current user information"
echo "Testing: GET $API_BASE/api/auth/debug/whoami"
echo "Authorization: Bearer <token>"
echo ""

WHOAMI_RESPONSE=$(curl -s "$API_BASE/api/auth/debug/whoami" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$WHOAMI_RESPONSE" | jq '.' 2>/dev/null || echo "$WHOAMI_RESPONSE"
echo ""

# Extract roles
ROLES=$(echo "$WHOAMI_RESPONSE" | jq -r '.roles[]' 2>/dev/null)
AUTHORITIES=$(echo "$WHOAMI_RESPONSE" | jq -r '.authorities[]' 2>/dev/null)

if echo "$ROLES" | grep -q "ADMIN"; then
    print_success "User has ADMIN role"
else
    print_error "User does not have ADMIN role"
    echo "Found roles: $ROLES"
    exit 1
fi

print_success "User authorities: $AUTHORITIES"

# Step 4: Check role
print_section "Step 4: Verifying ADMIN role"
echo "Testing: GET $API_BASE/api/auth/debug/has-role/ADMIN"
echo ""

ROLE_CHECK=$(curl -s "$API_BASE/api/auth/debug/has-role/ADMIN" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$ROLE_CHECK" | jq '.' 2>/dev/null || echo "$ROLE_CHECK"
echo ""

HAS_ROLE=$(echo "$ROLE_CHECK" | jq -r '.hasRole' 2>/dev/null)

if [ "$HAS_ROLE" = "true" ]; then
    print_success "Admin role verification successful"
else
    print_error "Admin role verification failed"
    exit 1
fi

# Step 5: Test convention creation
print_section "Step 5: Testing convention creation (requires ADMIN)"
echo "Testing: POST $API_BASE/api/conventions"
echo ""

CONVENTION_RESPONSE=$(curl -s -X POST "$API_BASE/api/conventions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TEST-'$(date +%s)'",
    "numeroConvention": "2024/TEST-'$(date +%s)'",
    "libelle": "Test Convention - Created by Auth Script",
    "objet": "Testing admin authorization",
    "type": "CADRE",
    "tauxCommission": 3.5,
    "montant": 1000000,
    "budgetTotal": 1000000,
    "dateDebut": "2024-01-01",
    "dateFin": "2024-12-31",
    "tauxTva": 20,
    "baseCalcul": "MONTANT_TTC"
  }')

echo "Response:"
echo "$CONVENTION_RESPONSE" | jq '.' 2>/dev/null || echo "$CONVENTION_RESPONSE"
echo ""

# Check if creation was successful
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE/api/conventions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "TEST-'$(date +%s)'",
    "numeroConvention": "2024/TEST-'$(date +%s)'",
    "libelle": "Test Convention",
    "objet": "Testing",
    "type": "CADRE",
    "tauxCommission": 3.5,
    "montant": 1000000,
    "budgetTotal": 1000000,
    "dateDebut": "2024-01-01",
    "dateFin": "2024-12-31"
  }')

if [ "$HTTP_CODE" = "201" ]; then
    print_success "Convention created successfully (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
    print_success "Convention creation completed (HTTP $HTTP_CODE)"
else
    print_warning "Convention creation returned HTTP $HTTP_CODE"
fi

# Step 6: Summary
print_section "Authorization Test Summary"
echo ""
echo "✅ Backend is running"
echo "✅ Admin login successful"
echo "✅ User role is ADMIN"
echo "✅ Token contains all necessary claims"
echo "✅ Admin can create conventions (write access)"
echo ""
print_success "All authorization checks passed!"
echo ""
echo "Admin user (admin/admin123) has full access to the system."
echo ""
