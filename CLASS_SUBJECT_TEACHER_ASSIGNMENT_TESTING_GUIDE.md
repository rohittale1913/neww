# Class-Subject Teacher Assignment - Quick Testing Guide

## System Status ✅
- **Backend Server:** Running on http://localhost:5000 ✅
- **Frontend Server:** Running on http://localhost:3000 ✅
- **Database:** Connected to MongoDB ✅

---

## Step-by-Step Testing Guide

### 1. Login as Admin
1. Navigate to http://localhost:3000/login
2. Use credentials:
   - **Email:** admin@school.com
   - **Password:** password123
3. Should redirect to `/admin` dashboard

### 2. Access Class-Subject Teacher Assignment Feature
1. From admin dashboard, click sidebar item **"Class Assignments"**
   - OR navigate directly to: http://localhost:3000/admin/class-assignments
2. You should see:
   - Empty table initially (if no assignments exist)
   - Filters section (Class, Section, Assignment Type)
   - "New Assignment" button (top right)

### 3. Create a New Assignment

#### Test Case 1: Assign as Class Teacher
1. Click **"New Assignment"** button
2. **Select Class:** 9
3. **Select Section:** A
4. **Select Teacher:** Choose "John David" (should show available)
5. **Subjects:** Enter "Mathematics, English"
6. **Assignment Type:** Select "Class Teacher" (radio button)
7. **Notes (Optional):** "Primary instructor for 9-A"
8. Click **"Assign"** button
9. Should see success message: "Teacher assigned successfully"
10. Assignment should appear in table

#### Test Case 2: Verify Class Teacher Constraint
1. Click **"New Assignment"** button again
2. **Select Class:** 10
3. **Select Section:** B
4. **Select Teacher:** Choose "John David" again
5. **Subjects:** Enter "Physics"
6. **Assignment Type:** Try to select "Class Teacher"
7. **Expected Result:** 
   - Warning appears: "⚠️ John David is already a class teacher for another class..."
   - Submit button might be disabled
   - OR system returns 409 error on submit

#### Test Case 3: Subject Teacher Assignment (No Constraint)
1. Click **"New Assignment"** button
2. **Select Class:** 10
3. **Select Section:** B
4. **Select Teacher:** Choose "John David"
5. **Subjects:** Enter "Physics, Chemistry"
6. **Assignment Type:** Select "Subject Teacher"
7. Click **"Assign"**
8. **Expected Result:** Success! (No constraint violation)
9. John David can now teach both class 9-A (as class teacher) and 10-B (as subject teacher)

### 4. View Assignment Details
1. Find an assignment in the table
2. Click **"View Details"** button
3. Should see modal with:
   - **Assignment Information:** Class 9-A, Type: Class Teacher, Subjects (badges)
   - **Teacher Information:** Name, Email, Qualification, Experience
   - **Admin Information:** Who created the assignment
   - **Students List:** All 40+ students in 9-A class
4. Click **"Close"** to close modal

### 5. Edit Assignment
1. Find an assignment (e.g., 10-B with John David)
2. Click edit icon (pencil)
3. Modal opens with form pre-filled
4. Change **Subjects:** Add "Computer Science"
5. Change **Assignment Type:** Switch between Class Teacher / Subject Teacher
6. Click **"Update"**
7. Should see success message
8. Table should refresh with updated data

### 6. Delete Assignment
1. Find an assignment
2. Click delete icon (trash)
3. Confirm deletion popup
4. Click "OK" or "Yes"
5. Assignment should disappear from table
6. Should see success message: "Assignment deleted successfully"

### 7. Test Filtering
1. **Filter by Class:** Select "9" → Table shows only class 9 assignments
2. **Filter by Section:** Select "A" → Table shows only section A
3. **Filter by Type:** Select "Class Teacher" → Shows only class teachers
4. Combine filters: Class=9, Section=A, Type=Class Teacher
5. Click filter dropdowns to reset

### 8. Verify Data Connections

#### Check Teacher Model Updated
After assigning John David as class teacher of 9-A:
1. Go to "View Teachers" (/admin/teachers-view)
2. Find John David in the list
3. Should show:
   - ✅ `isClassTeacher: true`
   - ✅ `classTeacherOf: "9-A"`
   - ✅ Classes: [9, 10, ...]
   - ✅ Sections: [A, B, ...]

#### Check Class Model Updated
After assigning teacher:
1. (Backend only) Verify in database:
   - Class (9, A) should have `classTeacher: {teacherId}`
   - This reference connects student→class→teacher

#### Check Student Connection
1. Login as a student from 9-A
2. Go to Student Dashboard → Overview
3. Should see their class teacher information
4. Should see John David as their class teacher

---

## API Testing (Using Postman/curl)

### Test 1: Create Class Teacher Assignment
```bash
curl -X POST http://localhost:5000/api/class-assignments/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -d '{
    "className": "9",
    "section": "A",
    "teacherId": "507f1f77bcf86cd799439011",
    "subjects": ["Mathematics", "English"],
    "assignmentType": "class_teacher",
    "notes": "Primary instructor"
  }'
```

**Expected Response (201):**
```json
{
  "message": "Teacher assigned to class successfully",
  "assignment": {
    "_id": "...",
    "className": "9",
    "section": "A",
    "subjects": ["Mathematics", "English"],
    "assignmentType": "class_teacher"
  }
}
```

### Test 2: Get Available Teachers
```bash
curl -X GET "http://localhost:5000/api/class-assignments/available-teachers?className=9&section=A" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}"
```

**Expected Response:** Array of teachers with flags showing which can be class teachers

### Test 3: Get All Assignments
```bash
curl -X GET "http://localhost:5000/api/class-assignments/all" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}"
```

### Test 4: Get Assignment with Connected Data
```bash
curl -X GET "http://localhost:5000/api/class-assignments/{ASSIGNMENT_ID}" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}"
```

---

## Expected Test Results

### ✅ Should Pass
- [x] Admin can create class teacher assignment
- [x] Admin can create subject teacher assignment
- [x] Constraint prevents duplicate class teacher assignments
- [x] Subject teacher assignments have no constraints
- [x] Edit functionality updates assignments
- [x] Delete functionality removes assignments
- [x] Filter works for all three criteria
- [x] View Details shows all connected data
- [x] Teacher model updates when assigning
- [x] Class model updates when assigning
- [x] Student sees correct class teacher
- [x] Both servers run without errors

### ❌ Should Fail (Expected Errors)
- [x] Cannot assign same teacher as class teacher to 2 classes → 409 error
- [x] Cannot access without admin role → 403 error
- [x] Cannot access without JWT token → 401 error
- [x] Cannot assign non-existent teacher → 404 error
- [x] Cannot assign without required fields → 400 error

---

## Debugging Tips

### Check Browser Console
1. Open DevTools (F12)
2. Go to "Console" tab
3. Look for red errors (should be none)
4. Check Network tab for API calls
5. Verify JWT token is in Authorization header

### Check Server Logs
1. Look at terminal running backend server
2. Should see:
   - `POST /class-assignments/assign` requests
   - Database queries
   - Any errors logged with stack traces

### Check Database (MongoDB Atlas)
1. Log in to MongoDB Atlas
2. Navigate to your cluster
3. Open Database → Collections → school_erp
4. Search collections:
   - `classsubjectteachers` - Should have your assignments
   - `teachers` - Should show updated `isClassTeacher` flags
   - `classes` - Should show `classTeacher` references

---

## Common Issues & Solutions

### Issue: Modal doesn't show constraint warning
**Solution:** 
- Check that teacher has `canBeClassTeacher: false` in response
- Verify API call returns correct flags

### Issue: Teacher shows dropdown even though already assigned
**Solution:**
- Refresh page (Ctrl+R)
- Check database to see if assignment exists
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Assignment created but doesn't appear in table
**Solution:**
- Check browser console for errors
- Verify API response (Network tab)
- Refresh page to reload from API

### Issue: Can still create duplicate class teacher assignment
**Solution:**
- Check backend server logs for errors
- Verify constraint check is working (look for console.error logs)
- Ensure ClassSubjectTeacher model is imported correctly

### Issue: Server returns 500 error
**Solution:**
- Check server terminal for error message
- Check MongoDB connection
- Verify environment variables in .env

---

## Performance Expectations

- Page load: < 2 seconds
- New assignment submit: < 1 second
- View details modal: < 1 second
- Filter operations: Instant (client-side)
- Delete: < 1 second

---

## Success Criteria

✅ **Feature is successful when:**
1. All CRUD operations work without errors
2. Class teacher constraint prevents duplicates (409 error)
3. Subject teacher assignments have no constraint
4. All connected data (students, teacher, admin) loads correctly
5. UI is responsive and intuitive
6. No console errors or warnings
7. Both servers run stable without crashes
8. Teacher model updates correctly when assigned
9. Students see correct class teacher information
10. Admins can manage assignments easily from UI

---

## Test Data

### Pre-seeded Teachers (from seed.js)
- John David (TCH-001) → Classes: [9, 10], Sections: [A, B]
- Sarah Mitchell (TCH-002) → Classes: [9, 10], Sections: [A, B]
- Rajesh Kumar (TCH-003) → Classes: [9, 10], Sections: [A, B]

### Pre-seeded Classes (from seed.js)
- 5-A, 5-B, 6-A, 6-B, ..., 12-A, 12-B

### Pre-seeded Students (from seed.js)
- Multiple students in each class (40-50 per class)
- Can filter by class/section

---

## Duration
- Expected testing time: **30-45 minutes**
- Includes: UI testing, API testing, constraint testing, data verification

---

**Ready to Test! 🚀**

Proceed with the test cases above in order. Document any issues found.
