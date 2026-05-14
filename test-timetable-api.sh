#!/bin/bash

# Timetable Module Testing Guide
# Run these commands to test the timetable API endpoints

# Base URL
BASE_URL="http://localhost:5000/api"

# Get your admin token first from login
# Example: Extract token from login response and set it here
TOKEN="your_admin_token_here"

echo "=== TIMETABLE API TESTING ==="
echo ""

# 1. Create a class first (if not exists)
echo "1. Create a test class:"
curl -X POST "$BASE_URL/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "className": "Class 10A",
    "section": "A",
    "capacity": 40,
    "room": "R101",
    "academicYear": "2024-2025"
  }' | jq .

echo ""
echo "Note: Copy the classId from the response above"
echo ""

# 2. Get all teachers (to select one)
echo "2. Get all teachers:"
curl -X GET "$BASE_URL/teachers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "Note: Copy a teacherId from the response"
echo ""

# 3. Get all subjects
echo "3. Get all subjects:"
curl -X GET "$BASE_URL/classes/subjects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "Note: Copy a subjectId from the response"
echo ""

# 4. Create a timetable entry (MAIN TEST)
echo "4. Create a timetable entry:"
curl -X POST "$BASE_URL/timetables" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "PASTE_CLASS_ID_HERE",
    "subject": "PASTE_SUBJECT_ID_HERE",
    "teacherId": "PASTE_TEACHER_ID_HERE",
    "day": "Monday",
    "startTime": "08:00",
    "endTime": "09:00",
    "room": "R101",
    "academicYear": "2024-2025"
  }' | jq .

echo ""

# 5. Get class timetable
echo "5. Get class timetable:"
curl -X GET "$BASE_URL/timetables/class/PASTE_CLASS_ID_HERE" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""

# 6. Get all timetables (admin view)
echo "6. Get all timetables:"
curl -X GET "$BASE_URL/timetables" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""

# 7. Test conflict detection (should fail)
echo "7. Test conflict detection - Same teacher, overlapping time (SHOULD FAIL):"
curl -X POST "$BASE_URL/timetables" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "PASTE_CLASS_ID_HERE",
    "subject": "PASTE_SUBJECT_ID_HERE",
    "teacherId": "PASTE_TEACHER_ID_HERE",
    "day": "Monday",
    "startTime": "08:30",
    "endTime": "09:30",
    "room": "R102",
    "academicYear": "2024-2025"
  }' | jq .

echo ""

# 8. Test teacher personal timetable
echo "8. Get teacher's personal timetable (Teacher role):"
curl -X GET "$BASE_URL/timetables/teacher-portal/my-timetable" \
  -H "Authorization: Bearer PASTE_TEACHER_TOKEN_HERE" | jq .

echo ""

# 9. Test student timetable
echo "9. Get student's class timetable (Student role):"
curl -X GET "$BASE_URL/timetables/student-portal/my-timetable" \
  -H "Authorization: Bearer PASTE_STUDENT_TOKEN_HERE" | jq .

echo ""

# 10. Update a timetable entry
echo "10. Update a timetable entry:"
curl -X PUT "$BASE_URL/timetables/PASTE_TIMETABLE_ENTRY_ID_HERE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "09:00",
    "endTime": "10:00"
  }' | jq .

echo ""

# 11. Delete a timetable entry
echo "11. Delete a timetable entry:"
curl -X DELETE "$BASE_URL/timetables/PASTE_TIMETABLE_ENTRY_ID_HERE" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "=== TESTING COMPLETE ==="
