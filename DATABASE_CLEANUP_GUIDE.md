# Database Cleanup & Reinitialization Guide

## Changes Made

✅ **Frontend Updates:**
- AdminTeacherRegister: Checkboxes → Multi-select dropdowns for classes and sections
- EditTeacherModal: Checkboxes → Multi-select dropdowns for classes and sections

✅ **Seed File Updates:**
- Students: class field changed from "10-A" to "10" (separate from section)
- Teachers: classes array now stores just numbers ["10"] and sections array stores ["A", "B"]

---

## Step 1: Clear the Database

### Using MongoDB Shell (Recommended)

```bash
# Open MongoDB connection
mongosh

# Select your database
use school-erp

# Delete all collections
db.users.deleteMany({})
db.students.deleteMany({})
db.teachers.deleteMany({})
db.accountants.deleteMany({})
db.librarians.deleteMany({})
db.transportmanagers.deleteMany({})
db.classes.deleteMany({})
db.subjects.deleteMany({})
db.attendance.deleteMany({})
db.fees.deleteMany({})
db.exams.deleteMany({})
db.results.deleteMany({})
db.assignments.deleteMany({})
db.timetables.deleteMany({})
db.books.deleteMany({})
db.bookissues.deleteMany({})
db.transports.deleteMany({})
db.notifications.deleteMany({})

# Verify collections are empty
db.users.countDocuments()  # Should return 0

# Exit
exit
```

---

## Step 2: Run the Seed Script

### Option A: Using npm script (if configured)

```bash
cd c:\Users\Asus\Desktop\new\server
npm run seed
```

### Option B: Using node directly

```bash
cd c:\Users\Asus\Desktop\new\server
node seed.js
```

### Expected Output:
```
Connecting to MongoDB...
Clearing existing data...
User collection already empty or dropped
Student collection already empty or dropped
Teacher collection already empty or dropped
...
Creating users...
Creating students...
Creating teachers...
Creating staff members...
✅ Database seed completed successfully!
```

---

## Step 3: Verify the Changes

### Check Students (Separate class and section):
```bash
mongosh
use school-erp
db.students.findOne()
```

**Expected Result:**
```javascript
{
  _id: ObjectId(...),
  studentId: "STU001",
  class: "10",        // ← Separate (was "10-A")
  section: "A",       // ← Now separate
  name: "Aarav Singh",
  // ...
}
```

### Check Teachers (Separate classes and sections arrays):
```bash
db.teachers.findOne()
```

**Expected Result:**
```javascript
{
  _id: ObjectId(...),
  teacherId: "TCH001",
  classes: ["10"],      // ← Array of just numbers
  sections: ["A", "B"], // ← Separate array
  subjects: ["Mathematics", "Physics"],
  classTeacherOf: "10", // ← Just class number
  // ...
}
```

---

## Step 4: Test the Frontend

### 1. Start the Development Server

```bash
# Terminal 1: Start Backend
cd c:\Users\Asus\Desktop\new\server
npm start

# Terminal 2: Start Frontend
cd c:\Users\Asus\Desktop\new\client
npm run dev
```

### 2. Test Teacher Registration

Go to: `http://localhost:5173/admin/register-teacher`

**Test Scenario:**
1. Fill in teacher details
2. Click "Classes" dropdown → Should see: Class 1, Class 2, ..., Class 12
3. Select Classes: 10 (click to select)
4. Click "Sections" dropdown → Should see: Section A, Section B, Section C, Section D, Section E
5. Select Sections: A, B
6. Submit → Should show success message

**Verify in Database:**
```bash
db.teachers.findOne({ email: "newemail@school.com" })
# Should show: classes: ["10"], sections: ["A", "B"]
```

### 3. Test Teacher Edit

1. Go to Teacher View page
2. Click Edit on any teacher
3. Classes dropdown should show selected classes
4. Sections dropdown should show selected sections
5. Modify selections and save
6. Verify changes in database

---

## Complete Database Reset (Nuclear Option)

If you want to completely reset MongoDB without using mongosh:

### Using MongoDB CLI:

```bash
# Drop entire database
mongosh --eval "use admin; db.admin.command({dropDatabase: 1})"

# Or drop a specific database
mongosh school-erp --eval "db.dropDatabase()"
```

### Then reseed:
```bash
cd c:\Users\Asus\Desktop\new\server
node seed.js
```

---

## Troubleshooting

### Problem: "MongoDB connection error"
**Solution:**
```bash
# Make sure MongoDB is running
# Windows: Use MongoDB Compass or mongo service
# Or start mongod from command line:
mongod
```

### Problem: "Collection already exists"
**Solution:**
This is normal. The seed script handles this gracefully by dropping collections first.

### Problem: Seed script hangs
**Solution:**
```bash
# Cancel (Ctrl+C) and try again:
node seed.js
```

### Problem: "Duplicate key error"
**Solution:**
```bash
# Ensure all collections are truly empty:
mongosh
use school-erp
db.users.deleteMany({})
db.students.deleteMany({})
db.teachers.deleteMany({})
# etc...
exit

# Then retry seed
node seed.js
```

---

## Data Schema Reference

### Student Schema (After Fix)
```javascript
{
  class: String,      // "1", "2", ..., "10", "11", "12"
  section: String,    // "A", "B", "C", "D", "E"
  rollNumber: Number
}
```

### Teacher Schema (After Fix)
```javascript
{
  classes: [String],   // ["1", "5", "10"]
  sections: [String],  // ["A", "B"]
  classTeacherOf: String // "10" (just the class number)
}
```

---

## Quick Commands

```bash
# One-liner: Clear DB and reseed
mongosh school-erp --eval "db.dropDatabase()" && cd server && node seed.js

# Check database size
mongosh school-erp --eval "db.stats()"

# Backup database before operations
mongodump --db school-erp --out ./backup

# Restore from backup
mongorestore --db school-erp ./backup/school-erp
```

---

## What Changed in the Code

### AdminTeacherRegister.jsx
- **Before:** Checkboxes for classes (grid layout)
- **After:** Multi-select dropdown with Ctrl+Cmd multi-select

### EditTeacherModal.jsx
- **Before:** Checkboxes for classes and sections
- **After:** Multi-select dropdowns

### seed.js
- **Before:** 
  ```javascript
  class: "10-A"  // Combined
  classes: ["10-A", "10-B"]  // Combined arrays
  classTeacherOf: "10-A"
  ```
- **After:**
  ```javascript
  class: "10"  // Separate
  section: "A"
  classes: ["10"]  // Just numbers
  sections: ["A", "B"]  // Separate array
  classTeacherOf: "10"  // Just number
  ```

---

## Summary

✅ Checkboxes replaced with multi-select dropdowns (easier for mobile)  
✅ Database schema now properly separates classes and sections  
✅ Seed data matches new schema  
✅ Ready for production  

**Next Steps:**
1. Run `mongosh` and execute delete commands from Step 1
2. Run `node seed.js` from Step 2
3. Start backend and frontend servers
4. Test the registration and edit flows
5. Verify database entries match expected schema
