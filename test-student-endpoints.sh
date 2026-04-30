#!/bin/bash
# Test script for Student Module Endpoints
# Tests all new student-specific endpoints

BASE_URL="http://localhost:5000/api"
STUDENT_TOKEN="" # Will be set after login

echo "================================================"
echo "Student Module Endpoints Test Suite"
echo "================================================"

# Test 1: Login as Student
echo ""
echo "[Test 1] Student Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }')

STUDENT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')
if [ -z "$STUDENT_TOKEN" ]; then
  echo "❌ Login failed. Response: $LOGIN_RESPONSE"
  echo "Creating test student first..."
  exit 1
else
  echo "✅ Login successful. Token: ${STUDENT_TOKEN:0:20}..."
fi

# Test 2: Get Student Profile
echo ""
echo "[Test 2] Get Student Profile..."
curl -s -X GET "$BASE_URL/students/my-profile" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'

# Test 3: Get Attendance
echo ""
echo "[Test 3] Get Student Attendance..."
curl -s -X GET "$BASE_URL/students/my-attendance?month=4&year=2026" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'

# Test 4: Get Assignments
echo ""
echo "[Test 4] Get Student Assignments..."
curl -s -X GET "$BASE_URL/students/my-assignments" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'

# Test 5: Get Assignments (Pending Filter)
echo ""
echo "[Test 5] Get Pending Assignments..."
curl -s -X GET "$BASE_URL/students/my-assignments?filter=pending" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'

# Test 6: Get Exams
echo ""
echo "[Test 6] Get Student Exams..."
curl -s -X GET "$BASE_URL/students/my-exams" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'

# Test 7: Get Results
echo ""
echo "[Test 7] Get Student Results..."
curl -s -X GET "$BASE_URL/students/my-results" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'

# Test 8: Get Fees
echo ""
echo "[Test 8] Get Student Fees..."
curl -s -X GET "$BASE_URL/students/my-fees" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'

# Test 9: Get Fees (Pending Filter)
echo ""
echo "[Test 9] Get Pending Fees..."
curl -s -X GET "$BASE_URL/students/my-fees?status=pending" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'

# Test 10: Get Subjects
echo ""
echo "[Test 10] Get Student Subjects..."
curl -s -X GET "$BASE_URL/students/my-subjects" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.'

echo ""
echo "================================================"
echo "Test Suite Completed"
echo "================================================"
