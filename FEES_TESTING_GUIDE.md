# Fees Module - Testing Guide

## 🎯 Role-Based Fee Management Overview

### **Accountant Role** - Fee Creation & Management
- **Email:** `accountant@school.com`
- **Password:** `password123`
- **Access:** `/accountant/fees`
- **Capabilities:**
  - ✅ Create fees for individual students
  - ✅ Bulk create fees for entire class/section
  - ✅ Update fee details
  - ✅ View all fees (read-only after creation)

### **Admin Role** - Fee Monitoring & Reporting
- **Email:** `admin@school.com`
- **Password:** `password123`
- **Access:** `/admin/fees`
- **Capabilities:**
  - ✅ View all fees and statistics
  - ✅ Filter fees by class, section, student, status, type
  - ✅ Monitor fee collection and due amounts
  - ✅ Export fee reports to CSV
  - ❌ Cannot create or modify fees (view-only)

### **Student Role** - Fee Payment
- **Email:** `student1@school.com`
- **Password:** `password123`
- **Access:** `/student/fees`
- **Capabilities:**
  - ✅ View assigned fees
  - ✅ Record payments (partial or full)
  - ✅ View payment history
  - ✅ Track fee status

---

## Quick Testing Overview

You can test the fees module using:
1. **Postman** - Test API endpoints directly
2. **Frontend UI** - Test components in the browser
3. **Browser Console** - Check for errors
4. **Database** - Verify data creation

---

## Part 1: Testing Backend API

### Setup Postman

1. **Download Postman** from https://www.postman.com/downloads/
2. **Create a new collection** called "Fees Module"
3. **Set base URL** as environment variable: `{{BASE_URL}}`
   - Value: `http://localhost:5000/api`

### Step 1: Get Authentication Token

**Endpoint:** `POST {{BASE_URL}}/auth/login`

**Body (Accountant - For Creating Fees):**
```json
{
  "email": "accountant@school.com",
  "password": "password123"
}
```

**Alternative Body (Admin - For Viewing/Monitoring Fees):**
```json
{
  "email": "admin@school.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "role": "accountant",
    "name": "Your Name"
  }
}
```

**Save Token:** Copy the token value and use it in all subsequent requests.

**IMPORTANT:** 
- Use **accountant** credentials to **CREATE** fees
- Use **admin** credentials to **VIEW** fees and monitoring dashboard

**How to Add Token to Headers:**
- In Postman: Go to "Authorization" tab
- Type: "Bearer Token"
- Token: `{{TOKEN}}` (set in environment)

---

### Step 2: Test Get All Fees

**Endpoint:** `GET {{BASE_URL}}/fees`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Response (Success):**
```json
{
  "fees": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "pages": 0
  }
}
```

**Status:** Should be 200 if successful

---

### Step 3: Get Classes (Needed for Creating Fees)

**Endpoint:** `GET {{BASE_URL}}/class-assignments/classes`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:** Array of classes
```json
[
  {
    "_id": "class_id_1",
    "className": "Class 10",
    "section": "A",
    "students": ["student_id_1", "student_id_2"]
  }
]
```

**Note:** Save a `class_id` for next step

---

### Step 4: Get Students from Class

**Endpoint:** `GET {{BASE_URL}}/students/class/{{CLASS_ID}}`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:** Array of students
```json
{
  "students": [
    {
      "_id": "student_id_1",
      "name": "John Doe",
      "studentId": "STU001",
      "class": "10A"
    }
  ]
}
```

**Note:** Save a `student_id` for next step

---

### Step 5: Create Individual Fee

**Endpoint:** `POST {{BASE_URL}}/fees`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "studentId": "PASTE_STUDENT_ID_HERE",
  "classId": "PASTE_CLASS_ID_HERE",
  "feeType": "tuition",
  "totalAmount": 5000,
  "dueDate": "2024-03-31",
  "academicYear": "2024-2025",
  "remarks": "Monthly tuition fee"
}
```

**Expected Response:**
```json
{
  "message": "Fee added successfully",
  "fee": {
    "_id": "fee_id_1",
    "studentId": {
      "_id": "student_id_1",
      "name": "John Doe"
    },
    "totalAmount": 5000,
    "paidAmount": 0,
    "dueAmount": 5000,
    "status": "pending",
    "feeType": "tuition",
    "dueDate": "2024-03-31",
    "academicYear": "2024-2025",
    "paymentHistory": []
  }
}
```

**Status:** Should be 201 (Created)

**Note:** Save the `fee._id` for payment testing

---

### Step 6: Record Payment

**Endpoint:** `POST {{BASE_URL}}/fees/pay`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "feeId": "PASTE_FEE_ID_HERE",
  "amountPaid": 2500,
  "paymentMethod": "online",
  "transactionId": "TXN-001",
  "remarks": "First installment"
}
```

**Expected Response:**
```json
{
  "message": "Payment recorded successfully",
  "fee": {
    "_id": "fee_id_1",
    "paidAmount": 2500,
    "dueAmount": 2500,
    "status": "partially_paid",
    "paymentHistory": [
      {
        "amount": 2500,
        "paymentMethod": "online",
        "transactionId": "TXN-001",
        "paidDate": "2024-01-15T10:30:00Z",
        "remarks": "First installment"
      }
    ]
  },
  "paymentDetails": {
    "amountPaid": 2500,
    "previousDue": 5000,
    "newDue": 2500,
    "totalPaid": 2500,
    "status": "partially_paid"
  }
}
```

---

### Step 7: Record Second Payment (Complete Fee)

**Endpoint:** `POST {{BASE_URL}}/fees/pay`

**Body:**
```json
{
  "feeId": "PASTE_FEE_ID_HERE",
  "amountPaid": 2500,
  "paymentMethod": "online",
  "transactionId": "TXN-002",
  "remarks": "Final installment"
}
```

**Expected Response:** Status should now be "paid", dueAmount should be 0

---

### Step 8: Get Fee Summary for Student

**Endpoint:** `GET {{BASE_URL}}/fees/summary/{{STUDENT_ID}}?academicYear=2024-2025`

**Expected Response:**
```json
{
  "student": {
    "_id": "student_id_1",
    "name": "John Doe",
    "studentId": "STU001",
    "class": "10A"
  },
  "academicYear": "2024-2025",
  "totalFees": 1,
  "totalAmount": 5000,
  "paidAmount": 5000,
  "dueAmount": 0,
  "paidCount": 1,
  "pendingCount": 0,
  "overdueCount": 0,
  "fees": [
    {
      "_id": "fee_id_1",
      "feeType": "tuition",
      "totalAmount": 5000,
      "paidAmount": 5000,
      "dueAmount": 0,
      "status": "paid",
      "dueDate": "2024-03-31",
      "paymentCount": 2
    }
  ]
}
```

---

### Step 9: Get Fee Statistics

**Endpoint:** `GET {{BASE_URL}}/fees/statistics?classId={{CLASS_ID}}&academicYear=2024-2025`

**Expected Response:**
```json
{
  "overall": {
    "totalRecords": 1,
    "paidRecords": 1,
    "pendingRecords": 0,
    "overdueRecords": 0,
    "partiallyPaidRecords": 0,
    "totalAmount": 5000,
    "paidAmount": 5000,
    "dueAmount": 0
  },
  "byType": [
    {
      "_id": "tuition",
      "count": 1,
      "total": 5000,
      "paid": 5000,
      "due": 0
    }
  ]
}
```

---

### Step 10: Bulk Add Fees to Class

**Endpoint:** `POST {{BASE_URL}}/fees/bulk`

**Body:**
```json
{
  "classId": "PASTE_CLASS_ID_HERE",
  "feeType": "transport",
  "totalAmount": 2000,
  "dueDate": "2024-02-28",
  "academicYear": "2024-2025"
}
```

**Expected Response:**
```json
{
  "message": "Bulk fees created",
  "createdCount": 3,
  "createdFees": [
    {
      "_id": "fee_id_2",
      "studentId": "student_id_1",
      "totalAmount": 2000,
      "status": "pending"
    },
    // ... more fees for other students
  ],
  "errors": []
}
```

---

## Part 2: Testing Frontend Components

### Test 1: Accountant Fee Creation Dashboard

**Steps:**
1. **Navigate to** `http://localhost:3001`
2. **Login** with accountant credentials:
   - Email: `accountant@school.com`
   - Password: `password123`
3. **Click** "Create Student Fees" button on dashboard
4. You should see:
   - "Select Class" dropdown
   - "Select Section" dropdown (populated after class selection)
   - Student list for selected class/section
   - "Create Fees" button

**Test Actions:**

a) **Select Class & Section:**
   - Click "Select Class" dropdown
   - Choose a class (e.g., "Class 10")
   - Click "Select Section" dropdown
   - Choose a section (e.g., "Section A")
   - Student list should populate below

b) **Create Fees:**
   - Fill in the fee form:
     - Fee Type: "Tuition" (dropdown)
     - Total Amount: `5000`
     - Due Date: `2024-03-31`
     - Academic Year: `2024-2025`
     - Remarks: `Monthly tuition fee` (optional)
   - Click "Create Fees" button
   - Confirmation modal should show: "Fees will be created for all X students"
   - Click "Confirm"
   - Success message: "✓ Successfully created fees for X students"
   - Fees should appear in database immediately

c) **Verify Fee Creation:**
   - Check browser console (F12) for success response
   - Check Network tab - POST /fees should return 201
   - Fees should be visible to students immediately

---

### Test 2: Admin Fee Monitoring Dashboard

**Steps:**
1. **Logout** from accountant (or use new browser)
2. **Login as Admin:**
   - Email: `admin@school.com`
   - Password: `password123`
3. **Navigate to** `/admin/fees`
4. You should see:
   - 4 KPI cards (Total Amount, Collected, Pending/Due, Overdue)
   - Filter section with dropdowns
   - Fee records table with student names

**Test Actions:**

a) **View Statistics:**
   - See KPI cards update with real fee data
   - Check totals match fees created by accountant
   - Review payment status breakdown

b) **Filter Fees:**
   - Filter by Class: Select class created by accountant
   - Filter by Student: Select student name
   - Filter by Status: "Pending"
   - Table should show only matching fees
   - Try combining multiple filters

c) **Verify Cannot Create:**
   - Notice NO "Add Individual Fee" or "Bulk Add" buttons
   - Admin interface is view-only ✓
   - Try accessing POST /fees endpoint directly → should get 403 Forbidden

d) **Export CSV:**
   - Click "Export CSV" button
   - File downloads as `fees-report-YYYY-MM-DD.csv`
   - Open in Excel/Sheets - verify data structure
   - Columns: Student Name, Class, Fee Type, Total, Collected, Due, Status, Due Date

---

### Test 3: Student Fee Payment Portal

**Steps:**
1. **Logout** from admin
2. **Login as Student:**
   - Email: `student1@school.com`
   - Password: `password123`
3. **Navigate to** `/student/fees`
4. You should see:
   - 4 summary cards (Total, Collected, Pending, Overdue)
   - Fees table with fees created by accountant

**Test Actions:**

a) **View Fees:**
   - Verify fees created by accountant appear here
   - Check amounts are correct (₹5000 from tuition fee)
   - Status should show "Pending"

b) **Make Payment:**
   - Click "Pay" button on pending fee
   - Payment modal opens
   - Enter amount: `2500` (partial payment)
   - Select payment method: "Online Transfer"
   - Enter Transaction ID: `TXN-001`
   - Click "Record Payment"
   - Fee status changes to "Partially Paid"
   - Due amount updates to `₹2500`

c) **Complete Payment:**
   - Click "Pay" again on same fee
   - Enter remaining amount: `2500`
   - Enter Transaction ID: `TXN-002`
   - Click "Record Payment"
   - Status changes to "Paid"
   - Summary cards update automatically

---

## Part 3: Complete Accountant-First Workflow

### **Scenario: Accountant Creates Fees → Student Pays → Admin Monitors**

**Time:** ~10 minutes

**Step 1: Accountant Creates Fees**
```
1. Login as: accountant@school.com / password123
2. Click: "Create Student Fees"
3. Select: Class 10
4. Select: Section A
5. View: 5 students displayed
6. Fill Form:
   - Fee Type: Tuition
   - Amount: ₹5,000
   - Due Date: 2024-03-31
   - Academic Year: 2024-2025
7. Click: "Create Fees"
8. Confirm: "Create fees for 5 students"
9. Result: ✓ 5 fees created in database
```

**Step 2: Admin Monitors Fees**
```
1. Logout & Login as: admin@school.com / password123
2. Navigate: /admin/fees
3. View:
   - Total Amount: ₹25,000 (5 students × ₹5,000)
   - Collected: ₹0
   - Due: ₹25,000
   - Status breakdown
4. Filter: By Class 10
5. Verify: 5 fee records shown with student names
```

**Step 3: Student Pays Fees**
```
1. Logout & Login as: student1@school.com / password123
2. Navigate: /student/fees
3. View:
   - Tuition Fee: ₹5,000 (Pending)
4. Click: "Pay"
5. Pay:
   - Amount: ₹2,500
   - Method: Online
   - Transaction ID: TXN-001
6. Status: Partially Paid (₹2,500 due)
7. Click "Pay" again
8. Pay:
   - Amount: ₹2,500
   - Transaction ID: TXN-002
9. Status: Paid (₹0 due)
```

**Step 4: Admin Sees Updated Statistics**
```
1. Switch back to: admin@school.com
2. Refresh: /admin/fees
3. View:
   - Collected: ₹5,000 (1 student paid)
   - Due: ₹20,000 (4 students pending)
   - 1 "Paid" record
   - 4 "Pending" records
```

---

## Part 4: API Testing with Postman (Accountant)

### Create Individual Fee (As Accountant)

**Endpoint:** `POST {{BASE_URL}}/fees`

**Headers:**
```
Authorization: Bearer [ACCOUNTANT_TOKEN]
Content-Type: application/json
```

**Body:**
```json
{
  "studentId": "STUDENT_ID_HERE",
  "classId": "CLASS_ID_HERE",
  "feeType": "tuition",
  "totalAmount": 5000,
  "dueDate": "2024-03-31",
  "academicYear": "2024-2025",
  "remarks": "Monthly tuition"
}
```

**Expected Response:** 
- Status: `201 Created`
- Fee object with all fields populated

**If Admin Tries:**
- Status: `403 Forbidden`
- Message: "You don't have permission to create fees"

### Bulk Create Fees (As Accountant)

**Endpoint:** `POST {{BASE_URL}}/fees/bulk`

**Body:**
```json
{
  "classId": "CLASS_ID_HERE",
  "feeType": "transport",
  "totalAmount": 2000,
  "dueDate": "2024-02-28",
  "academicYear": "2024-2025"
}
```

**Expected Response:**
- Status: `201 Created`
- Message: "Bulk fees created"
- Created count and fee array

**If Admin Tries:**
- Status: `403 Forbidden`

---

## Part 5: Browser Testing Checklist

### Accountant Workflow

### Console Errors
Open browser Developer Tools (F12) and check:
```
✓ No red errors in Console tab
✓ No 404 errors for API calls
✓ No undefined variable errors
✓ Network requests show 200/201 status
```

### Network Requests
In Network tab, check:
```
✓ POST /fees returns 201
✓ POST /fees/pay returns 200
✓ GET /fees returns 200
✓ POST /fees/bulk returns 201
```

### Local Storage
Check if token is saved:
```javascript
// Open Console and run:
console.log(localStorage.getItem('token'))
// Should display a long token string
```

---

## Part 4: Database Testing

### Check Fees Collection

**Using MongoDB Compass or mongosh:**

```javascript
// Connect to database
use schooldb

// View all fees
db.fees.find()

// View specific student's fees
db.fees.find({ studentId: ObjectId("...") })

// Count by status
db.fees.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// View payment history for a fee
db.fees.findOne({ _id: ObjectId("...") }, { paymentHistory: 1 })
```

### Check Fee Templates Collection

```javascript
// View all templates
db.feetemplates.find()

// View active templates
db.feetemplates.find({ isActive: true })
```

---

## Part 5: Complete Test Scenario

### Scenario: Student Pays Fees in Installments

**Time:** ~15 minutes

**Steps:**

1. **Admin Creates Multiple Fees**
   ```
   Admin → Fee Management
   → Add Individual Fee
   → Student: John Doe
   → Fee Type: Tuition
   → Amount: 5000
   → Due Date: 2024-03-31
   → Add Fee
   ```

2. **Admin Adds Transport Fee (Bulk)**
   ```
   Admin → Bulk Add (Class)
   → Select Class: 10A
   → Fee Type: Transport
   → Amount: 2000
   → Add Fees to Class
   ```

3. **Student Views Dashboard**
   ```
   Student → My Fees & Payments
   → See 2 fees (Tuition + Transport)
   → Total: 7000
   → Due: 7000
   ```

4. **Student Makes First Payment**
   ```
   Student → Click Pay on Tuition
   → Amount: 2500
   → Payment Method: Online
   → Record Payment
   → Status changes to Partially Paid
   ```

5. **Student Completes Tuition**
   ```
   Student → Click Pay on Tuition again
   → Amount: 2500
   → Record Payment
   → Status changes to Paid
   ```

6. **Student Pays Transport**
   ```
   Student → Click Pay on Transport
   → Amount: 2000
   → Record Payment
   → Status changes to Paid
   ```

7. **Admin Checks Statistics**
   ```
   Admin → Fee Management
   → Filter by Class: 10A
   → View statistics
   → Should show: 2 total, 1 paid, 0 pending
   ```

---

## Part 6: Test Different Scenarios

### Scenario 1: Overpayment Prevention
```
Try to pay more than due amount:
Fee Due: 1000
Try to pay: 1500
Expected: Error message "Payment exceeds due amount"
```

### Scenario 2: Partial Payments
```
Fee Amount: 5000
Payment 1: 1000 (Status: partially_paid)
Payment 2: 2000 (Status: partially_paid)
Payment 3: 2000 (Status: paid)
Expected: 3 entries in paymentHistory
```

### Scenario 3: Filtering
```
Create fees:
- Class A: 5 students, Tuition
- Class B: 3 students, Transport
Filter by Class A: Should show 5 fees
Filter by Transport: Should show 3 fees
Filter by Pending: Should show 8 fees
```

### Scenario 4: Bulk Add
```
Bulk add Transport fee to Class A (5 students):
Expected: 5 new fees created
Try again with same class/type: Should show error about duplicates
```

---

## Part 7: Error Testing

### Test These Error Scenarios:

1. **Missing Required Fields**
   ```
   POST /fees
   Body: { "studentId": "..." }
   Expected: 400 Error "Missing required fields"
   ```

2. **Invalid Student ID**
   ```
   POST /fees
   Body: { studentId: "invalid_id", ... }
   Expected: 404 Error "Student not found"
   ```

3. **Overpayment**
   ```
   POST /fees/pay
   Body: { feeId: "...", amountPaid: 10000 } (when due is 5000)
   Expected: 400 Error "Payment exceeds due amount"
   ```

4. **Fee Not Found**
   ```
   POST /fees/pay
   Body: { feeId: "invalid_id", ... }
   Expected: 404 Error "Fee not found"
   ```

---

## Part 8: Performance Testing

### Check Load Times
```
Dashboard load: Should be <1 second
Filter application: Should be <500ms
Payment recording: Should be <1 second
CSV export: Should start within 2 seconds
```

### Check with Large Dataset
```
1. Create 100+ fees
2. Apply filters - should still be fast
3. Export CSV - should work
4. Pagination - should work smoothly
```

---

## Part 9: Browser Compatibility Testing

Test on:
- ✓ Chrome (latest)
- ✓ Firefox (latest)
- ✓ Safari (if on Mac)
- ✓ Edge (if on Windows)
- ✓ Mobile browser (responsive design)

---

## Troubleshooting During Testing

### Issue: "Cannot read property 'map' of undefined"
**Solution:**
1. Check API response in Network tab
2. Verify response is an array
3. Check browser console for details

### Issue: Dropdown empty (no classes/students)
**Solution:**
1. Verify you have classes and students in database
2. Check API calls in Network tab
3. Verify authentication token is valid

### Issue: Payment not recording
**Solution:**
1. Check amount validation (not more than due)
2. Verify fee ID is correct
3. Check Network tab for error response

### Issue: Page shows "Loading..." forever
**Solution:**
1. Check browser console for errors
2. Verify backend server is running
3. Check Network tab for failed requests

---

## Test Data Creation Script

If you want to create test data quickly:

```javascript
// In MongoDB/mongosh

// Create test fees
db.fees.insertMany([
  {
    studentId: ObjectId("student_id_1"),
    feeType: "tuition",
    totalAmount: 5000,
    paidAmount: 0,
    dueAmount: 5000,
    status: "pending",
    dueDate: new Date("2024-03-31"),
    academicYear: "2024-2025"
  },
  {
    studentId: ObjectId("student_id_2"),
    feeType: "transport",
    totalAmount: 2000,
    paidAmount: 1000,
    dueAmount: 1000,
    status: "partially_paid",
    dueDate: new Date("2024-02-28"),
    academicYear: "2024-2025"
  }
])
```

---

## Testing Summary

| Test Area | Status | Notes |
|-----------|--------|-------|
| API Endpoints | ⏳ Test | Use Postman |
| Admin Dashboard | ⏳ Test | Check filters & actions |
| Student Portal | ⏳ Test | Make payments |
| Templates | ⏳ Test | CRUD operations |
| Database | ⏳ Test | Verify data storage |
| Error Handling | ⏳ Test | Try invalid inputs |
| Performance | ⏳ Test | Check response times |
| Browser Compat | ⏳ Test | Test on different browsers |

---

**You're ready to test! Follow the steps above systematically. 🚀**
