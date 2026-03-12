# 🎓 School ERP Quick Start Guide

## ✅ System is READY! Here's how to get started:

### **Step 1: Seed Test Data**

Run this command in your **server** folder to populate the database with test users:

```bash
cd server
node seed.js
```

You should see output like:
```
✓ Database seeded successfully!

========================================
        TEST CREDENTIALS
========================================
ADMIN: admin@school.com / password123
TEACHER: john@school.com / password123
STUDENT: jane@school.com / password123
ACCOUNTANT: accountant@school.com / password123
LIBRARIAN: librarian@school.com / password123
TRANSPORT_MANAGER: transport@school.com / password123
PARENT: parent@school.com / password123
```

---

## 🔓 Login & Dashboard Access

### **1. Admin** 👨‍💼
- **Email:** `admin@school.com`
- **Password:** `password123`
- **Dashboard:** http://localhost:3000/
- **Features:**
  - View Dashboard
  - User Management (Register Students, Teachers, Staff)
  - Student Management
  - Teacher Management

### **2. Teacher** 👨‍🏫
- **Email:** `john@school.com`
- **Password:** `password123`
- **Dashboard:** Shows classes, subjects, assignments
- **Features:**
  - View assigned classes
  - Track assignments
  - Mark attendance
  - View exam records

### **3. Student** 👨‍🎓
- **Email:** `jane@school.com`
- **Password:** `password123`
- **Dashboard:** Shows attendance, fees, results
- **Features:**
  - View attendance
  - Check assignments
  - View results/grades
  - Fee status

### **4. Accountant** 📊
- **Email:** `accountant@school.com`
- **Password:** `password123`
- **Dashboard:** Finance overview
- **Features:**
  - Fee collection tracking
  - Revenue reports
  - Transaction history

### **5. Librarian** 📚
- **Email:** `librarian@school.com`
- **Password:** `password123`
- **Dashboard:** Library management
- **Features:**
  - Book inventory
  - Issue/Return tracking
  - Member management
  - Overdue books

### **6. Transport Manager** 🚌
- **Email:** `transport@school.com`
- **Password:** `password123`
- **Dashboard:** Bus & route management
- **Features:**
  - Bus routes
  - Driver management
  - Maintenance schedule

### **7. Parent** 👨‍👩‍👧
- **Email:** `parent@school.com`
- **Password:** `password123`
- **Dashboard:** Child monitoring
- **Features:**
  - Child's attendance
  - Academic results
  - Fee status
  - Notifications

---

## 📝 How to Register New Users (As Admin)

1. **Login as Admin:**
   - Use credentials: `admin@school.com` / `password123`

2. **Go to User Management:**
   - Click "User Management" in sidebar
   - Or navigate to: http://localhost:3000/admin/users

3. **Register Users by Type:**

   **Register a Student:**
   - Select "Student" as user type
   - Fill basic account info (Name, Email, Password, Phone)
   - Fill admission details (Class, Section, Roll Number, DOB, Blood Group, Address)
   - Click "Register User"

   **Register a Teacher:**
   - Select "Teacher" as user type
   - Fill account info
   - Fill professional details (Qualification, Subjects, Classes, Experience)
   - Select employment type (Full-time/Part-time/Contractual)
   - Click "Register User"

   **Register Staff:**
   - Select "Staff" as user type
   - Choose staff role (Admin, Accountant, Librarian, Transport Manager, Parent)
   - Fill account info
   - Click "Register User"

4. **Share Credentials:**
   - Share the email and password with the newly registered user
   - They can login immediately with their credentials

---

## 🔗 Key URLs

| Role | URL | Dashboard |
|------|-----|-----------|
| Admin | http://localhost:3000 | `/admin` |
| Teacher | http://localhost:3000 | `/teacher` |
| Student | http://localhost:3000 | `/student` |
| Accountant | http://localhost:3000 | `/accountant` |
| Librarian | http://localhost:3000 | `/librarian` |
| Transport Manager | http://localhost:3000 | `/transport_manager` |
| Parent | http://localhost:3000 | `/parent` |

---

## ⚙️ Backend Server

**Status:** ✅ Running on `http://localhost:5000`

**API Endpoints Format:**
```
POST   /api/auth/login        - Login
GET    /api/auth/me           - Get current user
POST   /api/students          - Create student
GET    /api/students          - List students
POST   /api/teachers          - Create teacher
GET    /api/teachers          - List teachers
POST   /api/fees              - Create fee record
GET    /api/fees              - List fees
```

---

## 📊 Database

**MongoDB Connection:**
```
mongodb://localhost:27017/school-erp
```

**Collections:**
- users
- students
- teachers
- fees
- attendance
- exams
- results
- assignments
- books
- notifications
- classes
- subjects
- timetables
- bookissues
- transport

---

## 🚀 Troubleshooting

**Issue:** Login page shows blank
- Solution: Refresh browser (F5 or Ctrl+R)

**Issue:** Can't register new users
- Make sure you're logged in as Admin
- Check URL: `/admin/users`

**Issue:** Dashboard doesn't show data
- Run the seed.js script first
- Check browser console (F12) for errors

**Issue:** API errors
- Verify backend is running on port 5000
- Check .env file has correct MONGODB_URI

---

## ✨ Features Summary

✅ Multi-role authentication (7 roles)
✅ Admin user management
✅ Student admission & tracking
✅ Teacher management
✅ Fee management
✅ Role-based dashboards
✅ Secure JWT authentication
✅ MongoDB Atlas ready
✅ Responsive UI (Tailwind CSS)
✅ Real-time data sync

---

## 📞 Support

For issues, check:
1. Backend terminal (port 5000)
2. Frontend terminal (port 3000)
3. Browser console (F12)
4. MongoDB connection in .env file

**Happy Testing!** 🎉
