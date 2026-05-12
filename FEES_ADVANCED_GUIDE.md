# Fees Module - Advanced Features & Best Practices

## Table of Contents
1. Advanced Features
2. Best Practices
3. Production Considerations
4. Security Guidelines
5. Performance Optimization
6. Troubleshooting Guide

---

## Advanced Features

### 1. Payment History Tracking

Every payment is recorded with full audit trail:

```javascript
paymentHistory: [
  {
    _id: ObjectId,
    amount: 5000,
    paymentMethod: 'online',
    transactionId: 'TXN-1234567890',
    paidDate: Date,
    remarks: 'First installment',
    recordedBy: ObjectId // User who recorded
  }
]
```

**Use Case:**
- Verify payment details at any time
- Track who recorded each payment
- Maintain audit compliance

---

### 2. Fee Templates for Efficiency

### Create Template
```javascript
// One-time template creation
POST /api/fees/templates
{
  "name": "Monthly Tuition - 2024-2025",
  "description": "Regular monthly tuition for all classes",
  "feeType": "tuition",
  "amount": 5000,
  "academicYear": "2024-2025",
  "applicableClasses": [], // Empty = all classes
  "dueDate": "2024-04-30"
}
```

### Apply Template to Class
```javascript
// Bulk add using template
POST /api/fees/bulk
{
  "classId": "class123",
  "feeTemplateId": "template123",
  "academicYear": "2024-2025"
}
```

**Benefits:**
- Consistency across classes
- Reduced manual entry
- Easy to update for all classes

---

### 3. Advanced Filtering & Statistics

### Dashboard Statistics
```javascript
// Get comprehensive statistics
GET /api/fees/statistics?classId=class123&academicYear=2024-2025

Response:
{
  "overall": {
    "totalRecords": 200,
    "paidRecords": 80,
    "pendingRecords": 60,
    "overdueRecords": 40,
    "partiallyPaidRecords": 20,
    "totalAmount": 500000,
    "paidAmount": 200000,
    "dueAmount": 300000
  },
  "byType": [
    {
      "_id": "tuition",
      "count": 150,
      "total": 400000,
      "paid": 160000,
      "due": 240000
    },
    {
      "_id": "transport",
      "count": 50,
      "total": 100000,
      "paid": 40000,
      "due": 60000
    }
  ]
}
```

### Dynamic Filtering
```javascript
// Multiple filter combinations
GET /api/fees?
  classId=class123&
  status=overdue&
  feeType=tuition&
  academicYear=2024-2025&
  page=1&
  limit=20

// Filter by student + status + date range
GET /api/fees?
  studentId=student123&
  status=pending&
  academicYear=2024-2025
```

---

### 4. Partial Payment Management

### Multiple Installments

**Scenario:** Student pays ₹5000 in 2 installments

**Transaction 1:**
```javascript
POST /api/fees/pay
{
  "feeId": "fee123",
  "amountPaid": 2500,
  "paymentMethod": "online",
  "remarks": "First installment"
}

Response: status = "partially_paid", dueAmount = 2500
```

**Transaction 2:**
```javascript
POST /api/fees/pay
{
  "feeId": "fee123",
  "amountPaid": 2500,
  "paymentMethod": "online",
  "remarks": "Final installment"
}

Response: status = "paid", dueAmount = 0
```

**Payment History:**
```javascript
paymentHistory: [
  {
    amount: 2500,
    paidDate: "2024-01-15",
    paymentMethod: "online"
  },
  {
    amount: 2500,
    paidDate: "2024-02-15",
    paymentMethod: "online"
  }
]
```

---

### 5. Overdue Fee Management

**Automatic Detection:**
```javascript
// Pre-save middleware in Fee model
if (this.dueDate < new Date() && this.status === 'pending') {
  this.status = 'overdue';
}
```

**Query Overdue:**
```javascript
// Get all overdue fees
GET /api/fees?status=overdue

// Get overdue fees for specific class
GET /api/fees?status=overdue&classId=class123

// Statistics on overdue
GET /api/fees/statistics
// Response includes: overdueRecords and due breakdown
```

---

## Best Practices

### 1. Data Validation

**Frontend Validation:**
```javascript
// Amount validation
if (amountPaid <= 0) {
  alert('Amount must be greater than 0');
  return;
}

if (amountPaid > dueAmount) {
  alert(`Cannot pay more than due amount (${dueAmount})`);
  return;
}

// Date validation
if (new Date(dueDate) < new Date()) {
  alert('Due date cannot be in the past');
  return;
}
```

**Backend Validation:**
```javascript
// Always validate on server
if (amountPaid > fee.dueAmount) {
  return res.status(400).json({ 
    message: 'Payment exceeds due amount' 
  });
}

if (!studentId || !feeType || !totalAmount) {
  return res.status(400).json({ 
    message: 'Missing required fields' 
  });
}
```

---

### 2. Error Handling

**Graceful Error Handling:**
```javascript
// Wrap API calls with try-catch
try {
  const response = await feeAPI.recordPayment(paymentData);
  setFeeSummary(response.data);
} catch (error) {
  // Handle specific error types
  if (error.response?.status === 400) {
    alert('Validation Error: ' + error.response.data.message);
  } else if (error.response?.status === 404) {
    alert('Fee not found');
  } else {
    alert('Network error: ' + error.message);
  }
  
  console.error('Full error:', error);
}
```

---

### 3. Loading States

**Proper Loading Management:**
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feeAPI.getAll();
      setFees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);

// In JSX
{loading && <LoadingSpinner />}
{error && <ErrorMessage message={error} />}
{!loading && !error && <FeesTable data={fees} />}
```

---

### 4. API Call Optimization

**Batch Requests:**
```javascript
// Instead of multiple sequential calls
const [fees, stats, classes] = await Promise.all([
  feeAPI.getAll(),
  feeAPI.getStatistics(),
  classAssignmentAPI.getAllClasses()
]);
```

**Caching:**
```javascript
const [cachedTemplates, setCachedTemplates] = useState(null);

const getTemplates = async (force = false) => {
  if (cachedTemplates && !force) {
    return cachedTemplates;
  }
  
  const data = await feeAPI.getTemplates();
  setCachedTemplates(data);
  return data;
};
```

---

### 5. Form State Management

**Complex Form Handling:**
```javascript
const [formData, setFormData] = useState({
  studentId: '',
  classId: '',
  feeType: 'tuition',
  totalAmount: '',
  dueDate: '',
  remarks: ''
});

const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
  
  // Clear error for this field
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
};

const validateForm = () => {
  const newErrors = {};
  
  if (!formData.studentId) newErrors.studentId = 'Student required';
  if (!formData.totalAmount) newErrors.totalAmount = 'Amount required';
  if (!formData.dueDate) newErrors.dueDate = 'Due date required';
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  // Submit form...
};
```

---

## Production Considerations

### 1. Database Indexing

**Essential Indexes:**
```javascript
// High-priority queries
db.fees.createIndex({ studentId: 1, academicYear: 1 });
db.fees.createIndex({ classId: 1, status: 1 });
db.fees.createIndex({ status: 1, dueDate: 1 });
db.fees.createIndex({ createdAt: -1 });

// For filtering
db.fees.createIndex({ feeType: 1, status: 1 });
db.fees.createIndex({ academicYear: 1, classId: 1 });
```

**Monitor Performance:**
```javascript
// Check query execution
db.fees.find({ status: 'overdue' }).explain('executionStats')
```

---

### 2. Backup Strategy

**Automated Backups:**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
mongodump --db schooldb --out /backups/schooldb_$DATE/

# Retain last 30 days
find /backups -type d -mtime +30 -exec rm -rf {} +
```

**Testing Recovery:**
```bash
# Regular restore testing
mongorestore --db schooldb_test /backups/schooldb_20240101/
```

---

### 3. Audit Logging

**Complete Audit Trail:**
```javascript
// Log all important operations
const logFeeOperation = async (operation, feeId, userId, details) => {
  await AuditLog.create({
    operation,
    entity: 'Fee',
    entityId: feeId,
    userId,
    details,
    timestamp: new Date(),
    ipAddress: req.ip
  });
};

// Use in controller
await logFeeOperation('create', fee._id, userId, {
  amount: fee.totalAmount,
  studentId: fee.studentId
});
```

---

### 4. Rate Limiting

**Prevent Abuse:**
```javascript
import rateLimit from 'express-rate-limit';

const feeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.post('/fees/pay', feeLimiter, recordPayment);
```

---

### 5. Monitoring & Alerts

**Key Metrics to Monitor:**
- Payment recording failures
- Overdue fees accumulation
- Bulk operation performance
- Database query times
- API response times

**Alert Triggers:**
```javascript
// Alert if overdue fees exceed threshold
const checkOverdueThreshold = async () => {
  const overdueCount = await Fee.countDocuments({ status: 'overdue' });
  
  if (overdueCount > THRESHOLD) {
    sendAlert('High overdue fee count: ' + overdueCount);
  }
};

// Run periodically
cron.schedule('0 8 * * *', checkOverdueThreshold);
```

---

## Security Guidelines

### 1. Input Validation

```javascript
// Validate all inputs
const validateFeeInput = (data) => {
  const schema = Joi.object({
    studentId: Joi.string().required(),
    totalAmount: Joi.number().positive().required(),
    dueDate: Joi.date().greater('now').required(),
    feeType: Joi.string().valid('tuition', 'transport', ...).required()
  });
  
  return schema.validate(data);
};
```

### 2. Authorization Checks

```javascript
// Verify user has permission
export const recordPayment = async (req, res) => {
  const { feeId } = req.body;
  const fee = await Fee.findById(feeId).populate('studentId');
  
  // Student can only pay their own fees
  if (req.user.role === 'student') {
    if (fee.studentId._id.toString() !== req.user.studentDetails._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
  }
  
  // Proceed...
};
```

### 3. Data Sanitization

```javascript
// Sanitize inputs
const sanitizeInput = (data) => {
  return {
    remarks: data.remarks?.trim().substring(0, 500),
    transactionId: data.transactionId?.trim(),
    // ... other fields
  };
};
```

---

## Performance Optimization

### 1. Query Optimization

```javascript
// Efficient population
const fees = await Fee.find(filter)
  .populate('studentId', 'name class section') // Only needed fields
  .populate('classId', 'className section')
  .lean() // Returns plain JS objects (faster)
  .limit(20);
```

### 2. Pagination

```javascript
// Always paginate large datasets
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const fees = await Fee.find(filter)
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });
```

### 3. Aggregation Pipeline

```javascript
// Complex queries use aggregation
const stats = await Fee.aggregate([
  { $match: { academicYear: '2024-2025' } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$totalAmount' }
    }
  }
]);
```

---

## Troubleshooting Guide

### Issue 1: "Cannot read property 'map' of undefined"

**Cause:** API returns object instead of array

**Solution:**
```javascript
const feesArray = Array.isArray(response.data) 
  ? response.data 
  : (response.data?.fees || []);

setFees(feesArray);
```

### Issue 2: Fees not showing after creation

**Cause:** Filter mismatch or academic year difference

**Solution:**
```javascript
// Verify academicYear
console.log('Created fee academicYear:', fee.academicYear);
console.log('Filter academicYear:', filters.academicYear);

// Ensure they match
```

### Issue 3: Payment not updating status

**Cause:** Middleware not running or validation failing

**Solution:**
```javascript
// Check pre-save middleware
fee.save(); // Triggers middleware

// Verify status calculation
console.log('Before: status =', fee.status, 'paid =', fee.paidAmount);
fee.paidAmount += 1000;
await fee.save();
console.log('After: status =', fee.status);
```

### Issue 4: Bulk add creates duplicates

**Cause:** Duplicate check not working

**Solution:**
```javascript
// Add this check before creating
const existing = await Fee.findOne({
  studentId: sid,
  feeType: feeData.feeType,
  academicYear: feeData.academicYear
});

if (existing) {
  errors.push(`Fee already exists for ${student.name}`);
  continue;
}
```

### Issue 5: Performance slow with many records

**Solution:**
- Ensure indexes are created
- Implement pagination
- Use filters to reduce dataset
- Check database logs for slow queries

```javascript
// Monitor query performance
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
```

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check payment alerts
- Verify database connectivity

### Weekly
- Review overdue fee reports
- Check backup integrity
- Monitor API performance

### Monthly
- Analyze payment patterns
- Review and clean logs
- Test disaster recovery

### Quarterly
- Review and optimize queries
- Update security patches
- Plan database growth

---

**Last Updated:** 2024
**Status:** Production Ready ✅
