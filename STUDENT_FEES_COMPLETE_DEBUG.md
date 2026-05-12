# Complete Student Fees Debugging

## Step 1: Check Student ID & Login Data

**Run this in browser console AFTER logging in as Rohan Verma:**

```javascript
console.log('=== STEP 1: CHECK LOGIN DATA ===');

// Get token
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// Decode token
if (token) {
  const parts = token.split('.');
  const decoded = JSON.parse(atob(parts[1]));
  console.log('🎫 Token decoded:', decoded);
  console.log('📱 Student ID in token:', decoded.id);
}

// Check page title
console.log('👤 Page title shows:', document.querySelector('h1')?.textContent);
```

**Expected output:**
```
🎫 Token decoded: {id: '..something..', role: 'student', ...}
📱 Student ID in token: 69fba3cefd864cc7227b9096 (or similar)
```

**Copy the Student ID - you'll need it next!**

---

## Step 2: Check API Response

**After you get the Student ID, run this:**

```javascript
console.log('=== STEP 2: CHECK API RESPONSE ===');

const token = localStorage.getItem('token');
const studentId = 'PASTE_STUDENT_ID_HERE'; // Replace with ID from Step 1

fetch(`http://localhost:5000/api/fees/summary/${studentId}?academicYear=2024-2025`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => {
  console.log('HTTP Status:', r.status);
  return r.json();
})
.then(data => {
  console.log('✅ API Response:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.totalAmount === 0) {
    console.log('⚠️ WARNING: No fees found for this student');
  } else {
    console.log('✅ Fees found:', data.totalAmount);
  }
})
.catch(e => console.error('❌ API Error:', e));
```

**Expected output:**
```
HTTP Status: 200
✅ API Response:
{
  "student": {...},
  "totalFees": 2,
  "totalAmount": 50000,
  "paidAmount": 0,
  "dueAmount": 50000,
  "fees": [...]
}
```

**Or:**
```
⚠️ WARNING: No fees found for this student
```

---

## Step 3: Check Database for Rohan's Fees

**In MongoDB/mongosh, run:**

```javascript
// Connect to database
use schooldb

// Find Rohan Verma's student record
db.students.find({ name: /Rohan/i }).pretty()

// Get Rohan's student ID from above result
// Then check fees for that ID
db.fees.find({ studentId: ObjectId("ROHAN_STUDENT_ID") }).pretty()

// Or list ALL fees to see what exists
db.fees.find().pretty()
```

**Expected output:**
```
{
  "_id": ObjectId(...),
  "studentId": ObjectId("..."),
  "feeType": "tuition",
  "totalAmount": 50000,
  "status": "pending",
  ...
}
```

**Or:**
```
[]  // Empty - no fees found!
```

---

## Step 4: Check What's in Browser Network Tab

1. Open DevTools: `F12`
2. Go to **Network** tab
3. Go back to Fees page or refresh
4. Look for API calls like:
   - `GET /api/fees/summary/...`
   - `GET /api/fees/student/...`

**Click each request and check:**
- Status: Should be **200**
- Response: Should show fees or empty array

---

## Summary Checklist

- [ ] Student name shows: Rohan Verma ✅
- [ ] Token exists in localStorage ✅
- [ ] Student ID extracted from token ✓
- [ ] API returns data (not error) ✓
- [ ] Check if API returns totalAmount > 0 or 0
- [ ] Check database if fees exist for Rohan

---

## What to Report Back

After running these debugging scripts, tell me:

1. **Token Student ID** (from Step 1):
   ```
   📱 Student ID: [paste here]
   ```

2. **API Response Status** (from Step 2):
   ```
   HTTP Status: [200, 404, 500?]
   Total Amount: [0 or some number?]
   ```

3. **Database Result** (from Step 3):
   ```
   Fees found in database: [Yes/No]
   How many: [number]
   ```

4. **Network Tab** (from Step 4):
   ```
   API calls seen: [list them]
   Status codes: [list them]
   ```

---

## Common Issues & Solutions

### Issue: "No fees found for this student" but admin created them

**Cause:** Fees were created for different student ID
**Solution:** 
1. Check if admin selected correct student
2. Verify studentId in fee matches Rohan's student ID
3. Admin needs to create fees for Rohan Verma specifically

### Issue: API returns 404

**Cause:** Student not found in database
**Solution:**
1. Verify Rohan exists in students collection
2. Verify studentId matches exactly
3. Check for typos in name

### Issue: API returns empty fees array `[]`

**Cause:** Fees exist but not for this student
**Solution:**
1. Admin must create fees for Rohan
2. Or admin created fees for wrong student ID

### Issue: Component shows ₹0 but API returns fees

**Cause:** Component not updating after admin creates fees
**Solution:**
1. Refresh page: `F5` or `Ctrl+R`
2. Hard refresh: `Ctrl+Shift+R`
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Logout and login again

---

## If Fees Don't Exist

**Admin needs to create fees for Rohan Verma:**

1. Login as Admin
2. Go to `/admin/fees` or find Fee Management
3. Click "Add Individual Fee"
4. Select **Rohan Verma** from student dropdown
5. Fee Type: tuition
6. Amount: 50000
7. Due Date: 2026-06-30
8. Click "Add Fee"
9. Then Rohan should see it

---

**Run the debugging script and report back what you see!** 🔍
