# Backend API Deployment Guide

## Deploy to Vercel

### 1. Create New Project
- Go to https://vercel.com
- New Project → Import `group-4--project`
- **Root Directory**: `backend`
- **Framework**: Other

### 2. Environment Variables
Add these in Vercel project settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-jwt-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

### 3. Deploy
- Click Deploy
- Get URL like: `https://group-4-backend.vercel.app`

### 4. Test Endpoints
```
GET  https://your-backend.vercel.app/api/health
POST https://your-backend.vercel.app/api/auth/login
GET  https://your-backend.vercel.app/api/auth/profile
```

### 5. Update Frontend
Add environment variable in frontend:
```
REACT_APP_API_BASE_URL=https://your-backend.vercel.app/api
```