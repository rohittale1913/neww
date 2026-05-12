# Fees Module - Integration & Setup Guide

## Quick Start Guide

### 1. Installation & Setup

#### Backend Setup
1. All models are already created:
   - `server/models/Fee.js` ✅
   - `server/models/FeeTemplate.js` ✅

2. Controller is enhanced:
   - `server/controllers/feeController.js` ✅

3. Routes are updated:
   - `server/routes/feeRoutes.js` ✅

#### Frontend Setup
1. Components are created:
   - `client/src/pages/FeeManagement.jsx` ✅ (Admin Dashboard)
   - `client/src/pages/StudentFeePayment.jsx` ✅ (Student Portal)
   - `client/src/pages/AdminFeeTemplate.jsx` ✅ (Template Management)

2. API client updated:
   - `client/src/services/api.js` ✅

---

### 2. Navigation Setup

Add these routes to your navigation/sidebar:

**For Admin Dashboard:**
```javascript
// Add to admin sidebar/navigation
{
  label: 'Fees',
  icon: <FiDollarSign />,
  submenu: [
    { label: 'Fee Management', path: '/admin/fees' },
    { label: 'Fee Templates', path: '/admin/fee-templates' },
    { label: 'Statistics', path: '/admin/fees?status=all' }
  ]
}
```

**For Student Dashboard:**
```javascript
// Add to student sidebar/navigation
{
  label: 'My Fees',
  icon: <FiDollarSign />,
  path: '/student/fees'
}
```

**For Parent Dashboard (Optional):**
```javascript
{
  label: 'Child Fees',
  icon: <FiDollarSign />,
  path: '/parent/fees'
}
```

---

### 3. Component Integration

#### Add to Router Configuration

```javascript
// In your router setup (e.g., App.jsx or Routes.jsx)

import FeeManagement from './pages/FeeManagement';
import StudentFeePayment from './pages/StudentFeePayment';
import AdminFeeTemplate from './pages/AdminFeeTemplate';

// Admin Routes
<Route path="/admin/fees" element={<ProtectedRoute roles={['admin', 'accountant']}><FeeManagement /></ProtectedRoute>} />
<Route path="/admin/fee-templates" element={<ProtectedRoute roles={['admin', 'accountant']}><AdminFeeTemplate /></ProtectedRoute>} />

// Student Routes
<Route path="/student/fees" element={<ProtectedRoute roles={['student']}><StudentFeePayment /></ProtectedRoute>} />
```

---

### 4. Required API Dependencies

Ensure these API methods are available:

```javascript
// classAssignmentAPI
classAssignmentAPI.getAllClasses() // Returns array of classes

// studentAPI
studentAPI.getByClass(classId) // Returns students in a class

// Both should be already implemented in your api.js
```

If missing, add them:

```javascript
export const classAssignmentAPI = {
  getAllClasses: () => api.get('/class-assignments/classes'),
  // ... other methods
};

export const studentAPI = {
  getByClass: (classId) => api.get(`/students/class/${classId}`),
  // ... other methods
};
```

---

### 5. Database Setup

**Ensure MongoDB indexes are created:**

```javascript
// In your database initialization or migration script
db.fees.createIndex({ studentId: 1, academicYear: 1 });
db.fees.createIndex({ classId: 1, status: 1 });
db.fees.createIndex({ status: 1, dueDate: 1 });
db.fees.createIndex({ academicYear: 1, feeType: 1 });

db.feetemplates.createIndex({ academicYear: 1, isActive: 1 });
db.feetemplates.createIndex({ feeType: 1 });
```

---

### 6. User Roles & Permissions

Ensure your role system supports:

```javascript
// Required roles
const ROLES = {
  ADMIN: 'admin',           // Full access
  ACCOUNTANT: 'accountant', // Fee management (create, edit, delete)
  STUDENT: 'student',       // View own fees, record payments
  PARENT: 'parent'          // View child fees (optional)
};
```

---

### 7. Data Migration (If Upgrading)

If you have existing fees in the old format:

```javascript
// Migration script to update existing fees
db.fees.updateMany(
  { paidAmount: { $exists: false } },
  [
    {
      $set: {
        paidAmount: {
          $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
        },
        totalAmount: '$amount',
        paymentHistory: {
          $cond: [
            { $eq: ['$status', 'paid'] },
            [{
              amount: '$amount',
              paymentMethod: { $ifNull: ['$paymentMethod', 'other'] },
              transactionId: { $ifNull: ['$transactionId', ''] },
              paidDate: { $ifNull: ['$paidDate', new Date()] }
            }],
            []
          ]
        }
      }
    }
  ]
);
```

---

### 8. Testing the Module

#### Test Admin Fee Creation:
1. Login as admin
2. Navigate to Fee Management
3. Click "Add Individual Fee"
4. Fill in student, fee type, amount, due date
5. Click "Add Fee"
6. Verify fee appears in table

#### Test Bulk Fee Creation:
1. Click "Bulk Add (Class)"
2. Select class
3. Fill in fee details
4. Click "Add Fees to Class"
5. Verify all students in class have the fee

#### Test Student Payment:
1. Login as student
2. Navigate to "My Fees & Payments"
3. See all fees with payment status
4. Click "Pay" on a pending fee
5. Enter payment amount
6. Select payment method
7. Click "Record Payment"
8. Verify status updates

#### Test Filters:
1. In Fee Management, use filters
2. Filter by class, student, status, fee type
3. Verify correct records display
4. Test pagination

---

### 9. API Response Examples

#### Get Student Fees Summary
```javascript
// Request
GET /api/fees/summary/studentId?academicYear=2024-2025

// Response
{
  "student": {
    "_id": "...",
    "name": "John Doe",
    "studentId": "STU001",
    "class": "10A"
  },
  "academicYear": "2024-2025",
  "totalFees": 3,
  "totalAmount": 15000,
  "paidAmount": 5000,
  "dueAmount": 10000,
  "paidCount": 1,
  "pendingCount": 1,
  "overdueCount": 1,
  "fees": [
    {
      "_id": "...",
      "feeType": "tuition",
      "totalAmount": 5000,
      "paidAmount": 5000,
      "dueAmount": 0,
      "status": "paid",
      "dueDate": "2024-03-31",
      "paymentCount": 1
    },
    // ... more fees
  ]
}
```

#### Record Payment
```javascript
// Request
POST /api/fees/pay
{
  "feeId": "...",
  "amountPaid": 3000,
  "paymentMethod": "online",
  "transactionId": "TXN123456",
  "remarks": "First installment"
}

// Response
{
  "message": "Payment recorded successfully",
  "fee": { /* updated fee object */ },
  "paymentDetails": {
    "amountPaid": 3000,
    "previousDue": 5000,
    "newDue": 2000,
    "totalPaid": 3000,
    "status": "partially_paid"
  }
}
```

#### Bulk Add Fees
```javascript
// Request
POST /api/fees/bulk
{
  "classId": "classId",
  "feeType": "tuition",
  "totalAmount": 5000,
  "dueDate": "2024-03-31",
  "academicYear": "2024-2025"
}

// Response
{
  "message": "Bulk fees created",
  "createdCount": 30,
  "createdFees": [ /* array of created fees */ ],
  "errors": [] // or list of errors if any
}
```

---

### 10. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot read property 'map' of undefined" | Check if API returns array; use Array.isArray() check |
| Fees not appearing in admin dashboard | Verify academicYear filter matches created fees |
| Payment not recording | Check amountPaid validation and fee status |
| Bulk fees creating duplicates | Ensure different fee types or check existing fees |
| Class/Student dropdown empty | Verify classAssignmentAPI and studentAPI working |
| Overdue fees not marked | Ensure dueDate is before current date |

---

### 11. Performance Tips

1. **For Large Classes:**
   - Use pagination (already implemented)
   - Filter by status first
   - Limit academic years shown

2. **For High Traffic:**
   - Enable MongoDB query logging
   - Check indexes are created
   - Consider caching templates

3. **For Reporting:**
   - Use CSV export for analysis
   - Run statistics queries during off-peak
   - Archive old academic years

---

### 12. Backup & Recovery

Before going to production:

```javascript
// Backup fees collection
mongoexport --db schooldb --collection fees --out fees_backup.json

// Backup fee templates
mongoexport --db schooldb --collection feetemplates --out feetemplates_backup.json

// Restore if needed
mongoimport --db schooldb --collection fees --file fees_backup.json
```

---

### 13. Monitoring & Alerts

Recommended monitoring:

1. Failed payment recordings
2. Overdue fees accumulation
3. Bulk operation errors
4. API response times
5. Database query performance

---

## Production Deployment Checklist

- [ ] All models deployed and verified
- [ ] All controller functions tested
- [ ] Routes properly configured
- [ ] Frontend components deployed
- [ ] API client updated
- [ ] Routes added to navigation
- [ ] Role-based access configured
- [ ] Database indexes created
- [ ] User testing completed
- [ ] Error handling verified
- [ ] Performance tested
- [ ] Backup strategy in place
- [ ] Monitoring setup

---

## Support Resources

- Error logs: Check browser console and server logs
- API documentation: See FEES_MODULE_DOCUMENTATION.md
- Component structure: Review individual component files
- Database schema: Check model files

---

**Ready for Production! ✅**
