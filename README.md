# School ERP Platform - Complete Setup Guide

## Overview
This is a complete Industry-Level School ERP (Enterprise Resource Planning) Platform with 12 core modules covering all school operations.

## Features

### 12 Main Modules
1. **Authentication & User Management** - Role-based login system
2. **Student Management** - Complete student profile & documentation
3. **Teacher Management** - Teacher profiles & assignments
4. **Class & Section Management** - Class, subject, and section organization
5. **Attendance Management** - Daily/Monthly attendance tracking
6. **Timetable Management** - Class & teacher scheduling
7. **Fees Management** - Fee structure, collection & receipts
8. **Exam & Result System** - Exam management & result generation
9. **Assignment & Homework** - Task management for students
10. **Notification System** - Announcements & alerts
11. **Library Management** - Book catalog & issue tracking
12. **Transport Management** - Bus routes & student allocation

### User Roles
- **Admin** - Full system access
- **Teacher** - Class management & grading
- **Student** - Academic profile & submissions
- **Parent** - Child progress monitoring
- **Accountant** - Fee management
- **Librarian** - Library operations
- **Transport Manager** - Bus management

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas recommended)
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Additional Tools
- Redis (for caching - optional)
- Socket.io (for real-time notifications - optional)
- Cloudinary/AWS S3 (for file storage - optional)

## Installation & Setup

### Prerequisites
- Node.js 16+ & npm
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Backend Setup

#### Clone & Install
\`\`\`bash
cd server
npm install
\`\`\`

#### Environment Configuration
Create `.env` file:
\`\`\`
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-erp
JWT_SECRET=your_very_secure_secret_key_here
PORT=5000
NODE_ENV=development
\`\`\`

#### Run Server
\`\`\`bash
npm run dev
\`\`\`

Server will run on http://localhost:5000

### 2. Frontend Setup

#### Install Dependencies
\`\`\`bash
cd client
npm install
\`\`\`

#### Environment Configuration
Create `.env` file:
\`\`\`
VITE_API_BASE_URL=http://localhost:5000/api
\`\`\`

#### Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Frontend will run on http://localhost:3000

## API Endpoints Reference

### Authentication
\`\`\`
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile
\`\`\`

### Students
\`\`\`
GET    /api/students
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
GET    /api/students/:id
\`\`\`

### Teachers
\`\`\`
GET    /api/teachers
POST   /api/teachers
PUT    /api/teachers/:id
DELETE /api/teachers/:id
GET    /api/teachers/:id
\`\`\`

### Attendance
\`\`\`
GET    /api/attendance (with date & classId filters)
POST   /api/attendance (mark single)
POST   /api/attendance/bulk
GET    /api/attendance/student/:studentId
GET    /api/attendance/report
\`\`\`

### Fees
\`\`\`
GET    /api/fees
GET    /api/fees/student/:studentId
GET    /api/fees/pending
POST   /api/fees
POST   /api/fees/pay
GET    /api/fees/statistics
\`\`\`

### Exams & Results
\`\`\`
GET    /api/exams
POST   /api/exams
POST   /api/exams/marks
GET    /api/exams/student/:studentId
GET    /api/exams/exam/:examId
GET    /api/exams/report-card
\`\`\`

### Assignments
\`\`\`
GET    /api/assignments
POST   /api/assignments
GET    /api/assignments/class/:classId
POST   /api/assignments/submit
POST   /api/assignments/grade
GET    /api/assignments/student/:studentId
\`\`\`

### Notifications
\`\`\`
GET    /api/notifications
POST   /api/notifications
GET    /api/notifications/user/notifications
PUT    /api/notifications/:notificationId/read
DELETE /api/notifications/:notificationId
\`\`\`

### Library
\`\`\`
GET    /api/library
GET    /api/library/search
POST   /api/library
POST   /api/library/issue
POST   /api/library/return
GET    /api/library/student/:studentId
\`\`\`

### Transport
\`\`\`
GET    /api/transport
POST   /api/transport
PUT    /api/transport/:busId
POST   /api/transport/assign
GET    /api/transport/:busId
GET    /api/transport/student/:studentId
\`\`\`

### Classes
\`\`\`
GET    /api/classes
POST   /api/classes
GET    /api/classes/subjects
POST   /api/classes/subjects
GET    /api/classes/timetable/:classId
POST   /api/classes/timetable
\`\`\`

## Database Schema Overview

### User Collections
- **User** - Core user data with roles
- **Student** - Student-specific information
- **Teacher** - Teacher profiles & assignments
- **Class** - Class information
- **Subject** - Subject definitions

### Academic Collections
- **Attendance** - Attendance records
- **Timetable** - Class schedules
- **Exam** - Exam information
- **Result** - Exam results & grades
- **Assignment** - Homework & tasks

### Administrative Collections
- **Fee** - Fee records & payments
- **Transport** - Bus & route information
- **Book** - Library book catalog
- **BookIssue** - Book issue/return records
- **Notification** - System announcements

## Project Structure

```
school-erp/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Class.js
│   │   ├── Subject.js
│   │   ├── Attendance.js
│   │   ├── Timetable.js
│   │   ├── Fee.js
│   │   ├── Exam.js
│   │   ├── Result.js
│   │   ├── Assignment.js
│   │   ├── Notification.js
│   │   ├── Book.js
│   │   ├── BookIssue.js
│   │   └── Transport.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── attendanceController.js
│   │   ├── feeController.js
│   │   ├── examController.js
│   │   ├── assignmentController.js
│   │   ├── notificationController.js
│   │   ├── libraryController.js
│   │   ├── transportController.js
│   │   └── classController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── feeRoutes.js
│   │   ├── examRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── libraryRoutes.js
│   │   ├── transportRoutes.js
│   │   └── classRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── services/
│   ├── utils/
│   ├── package.json
│   ├── server.js
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StudentManagement.jsx
│   │   │   ├── FeeManagement.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── authStore.js
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
└── README.md
```

## Security Features Implemented

✅ **Password Hashing** - bcryptjs with salt rounds
✅ **JWT Authentication** - Token-based auth with 7-day expiry
✅ **Role-Based Access Control** - 7 different user roles
✅ **CORS Protection** - Restricted origin headers
✅ **Helmet Security** - HTTP headers protection
✅ **Rate Limiting** - 100 requests per 15 minutes
✅ **Input Validation** - Required field checking
✅ **Error Handling** - Global error middleware

## Development Tips

### Adding a New Module
1. Create model in `server/models/`
2. Create controller in `server/controllers/`
3. Create routes in `server/routes/`
4. Add API to `client/src/services/api.js`
5. Create page component in `client/src/pages/`
6. Add route in `client/src/App.jsx`

### Database Queries
```javascript
// Example: Get a student with populated references
Student.findById(id).populate('userId').populate('classId')
```

### API Error Handling
All errors return JSON with message and status code. Use try-catch in controllers.

## Deployment

### Backend Deployment (Using Render)
1. Push code to GitHub
2. Create new service on Render
3. Connect GitHub repo
4. Set environment variables
5. Deploy

### Frontend Deployment (Using Vercel)
1. Connect GitHub repo
2. Set environment variables
3. Deploy

## Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Payment integration (Razorpay/Stripe)
- [ ] SMS alerts for important notifications
- [ ] Advanced reporting & analytics
- [ ] Mobile app (React Native)
- [ ] File storage (Cloudinary/S3)
- [ ] Email notifications
- [ ] Bulk import features
- [ ] API documentation (Swagger)
- [ ] Unit & integration tests

## Support & Documentation

For detailed API documentation, check each route file.
For frontend components, see component files for usage patterns.

## License
MIT License - Feel free to use for educational & commercial purposes.

## Contact
For queries or support, reach out to: support@schoolerp.com

---

**Happy Coding! Build something amazing with School ERP.** 🚀
