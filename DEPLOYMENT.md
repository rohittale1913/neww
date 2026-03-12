# Deployment Guide - School ERP

## Backend Deployment on Render

### Step 1: Prepare Your Code
- Ensure all dependencies are in package.json
- Create .env.example with all required variables
- Commit to GitHub

### Step 2: Create Render Account
- Visit https://render.com
- Sign up with GitHub account

### Step 3: Deploy Backend Service
1. Click "New" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name**: school-erp-server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - NODE_ENV=production
5. Deploy

### Step 4: MongoDB Atlas Setup
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Get connection string
5. Add Render IP to whitelist

## Frontend Deployment on Vercel

### Step 1: Prepare Frontend
- Build optimization in vite.config.js
- Add environment variables to .env.production
- Everything else is handled by Vercel

### Step 2: Create Vercel Account
- Visit https://vercel.com
- Sign up with GitHub

### Step 3: Deploy Frontend
1. Click "Add New Project"
2. Import GitHub repository
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: client
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
4. Add environment variable:
   - VITE_API_BASE_URL=https://your-render-backend-url/api
5. Deploy

### Step 4: Custom Domain (Optional)
1. Purchase domain from registrar
2. Add to Vercel project settings
3. Update DNS records

## Alternative: Docker Deployment

### Dockerfile for Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Dockerfile for Frontend
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./client
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=school-erp
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## AWS Deployment (Advanced)

### Backend on EC2
1. Launch EC2 instance
2. Install Node.js
3. Clone repository
4. Install dependencies
5. Use PM2 for process management
6. Set up Nginx as reverse proxy
7. Enable SSL with Let's Encrypt

### Frontend on S3 + CloudFront
1. Build React app
2. Upload to S3 bucket
3. Create CloudFront distribution
4. Point domain to CloudFront

## Environment Variables Checklist

### Production Backend
- [ ] MONGODB_URI (Atlas)
- [ ] JWT_SECRET (strong, unique)
- [ ] PORT (5000)
- [ ] NODE_ENV (production)
- [ ] CORS_ORIGIN (frontend URL)

### Production Frontend
- [ ] VITE_API_BASE_URL (backend URL)
- [ ] VITE_APP_NAME (School ERP)

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Check database connections
- [ ] Test role-based access
- [ ] Monitor error logs
- [ ] Set up backup strategy
- [ ] Configure email notifications
- [ ] Test payment gateway (if implemented)
- [ ] Security audit
- [ ] Performance testing

## Monitoring & Maintenance

### Set Up Monitoring
- Render: Built-in monitoring dashboard
- Vercel: Analytics & monitoring
- MongoDB Atlas: Activity logs & alerts

### Backup Strategy
- Daily automated backups
- MongoDB Atlas: M0 free tier includes backups
- External backup service (AWS S3)

### Updates & Patches
- Keep dependencies updated
- Security patches immediately
- Test before production deployment

## Troubleshooting Deployment

### Backend won't start
- Check environment variables
- Verify MongoDB connection
- Check logs in Render dashboard

### Frontend can't connect to backend
- Verify API_BASE_URL
- Check CORS settings
- Ensure backend is running

### Slow performance
- Enable caching headers
- Optimize images
- Use CDN for assets
- Database indexing

## Cost Estimation

### Monthly Costs
- **Render (Backend)**: $7-12/month
- **Vercel (Frontend)**: Free to $20/month
- **MongoDB Atlas (Free)**: $0
- **Domain**: $12/year

**Total**: ~$20-30/month

## SSL/HTTPS Setup

### Automatic (Recommended)
- Render: Automatic
- Vercel: Automatic
- Both provide free SSL

### Manual (Self-Hosted)
- Use Let's Encrypt
- Auto-renew with Certbot
- Configure in Nginx

## CI/CD Pipeline (Optional GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

**Questions?** Check the main README.md for more details.
