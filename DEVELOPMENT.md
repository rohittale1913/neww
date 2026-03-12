# School ERP - Development Guide

## Quick Start Commands

### Backend
```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Create .env file with MongoDB URI and JWT secret
cp .env.example .env

# Run development server
npm run dev
```

### Frontend
```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm run dev
```

## Database Seeding (Optional)

To add sample data, create a seed script:

```javascript
// server/scripts/seed.js
import User from '../models/User.js';
import connectDB from '../config/db.js';

await connectDB();

const users = [
  {
    name: 'Admin User',
    email: 'admin@school.com',
    password: 'password123',
    role: 'admin',
    phone: '1234567890'
  },
  {
    name: 'John Doe',
    email: 'john@school.com',
    password: 'password123',
    role: 'teacher',
    phone: '9876543210'
  }
];

await User.insertMany(users);
console.log('Database seeded!');
```

Run with: `node scripts/seed.js`

## Common API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "token": "jwt_token_here"
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Testing API Endpoints

Use Postman or cURL:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"password123"}'

# Get Students (with token)
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Frontend Component Structure

### Creating a New Page
1. Create `.jsx` file in `pages/`
2. Wrap with `DashboardLayout`
3. Import API functions
4. Use Zustand store for state
5. Add route in `App.jsx`

### Example
```jsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { studentAPI } from '../services/api';

const MyPage = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await studentAPI.getAll();
        setData(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      {/* Your content here */}
    </DashboardLayout>
  );
};

export default MyPage;
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/school-erp
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Common Issues & Solutions

### MongoDB Connection Error
- Check MongoDB Atlas credentials
- Ensure IP is whitelisted
- Verify database name is correct

### CORS Error
- Check frontend URL in server CORS config
- Ensure API_BASE_URL in frontend env is correct

### JWT Token Error
- Clear localStorage in browser
- Login again to get new token
- Check token expiry (7 days)

### Styling Issues
- Run `npm install tailwindcss` in client
- Restart Vite dev server
- Check tailwind.config.js is correct

## Additional Resources

- Express.js Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com
- Zustand Docs: https://github.com/pmndrs/zustand

## Contributing

When adding new features:
1. Create feature branch
2. Make changes following existing patterns
3. Test thoroughly
4. Create pull request
5. Code review & merge

## Performance Tips

1. **Backend**:
   - Use indexes on frequently queried fields
   - Implement pagination for large datasets
   - Cache frequently accessed data

2. **Frontend**:
   - Lazy load pages with React.lazy()
   - Memoize expensive components
   - Use React Query for data caching

## Monitoring & Logging

Add logging utility:
```javascript
// server/utils/logger.js
export const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()}: ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()}: ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()}: ${msg}`)
};
```

## Version Management

- Backend: Node 16+
- Frontend: React 18+
- Database: MongoDB 4.4+

---

Happy developing! 🚀
