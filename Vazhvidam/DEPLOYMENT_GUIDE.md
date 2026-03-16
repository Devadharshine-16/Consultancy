# Frontend Deployment Guide - Render

## 🚀 Ready for Deployment

Your frontend is now configured to work with your backend at:
**Backend URL**: `https://consultancy-ol25.onrender.com`

## 📋 Deployment Steps

### 1. Build the Frontend
```bash
cd "d:\CONSULTANCY PRO\Vazhvidam"
npm run build
```

### 2. Deploy to Render

#### Option A: Direct Upload (Recommended)
1. **Create a new Web Service** on Render Dashboard
2. **Connect Repository** or **Manual Deploy**
3. **Upload Build**: Upload the `dist` folder created after build
4. **Configure**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `18.x` or higher

#### Option B: GitHub Integration
1. **Push to GitHub**:
```bash
git add .
git commit -m "Configure for production deployment"
git push origin main
```
2. **Connect GitHub** in Render Dashboard
3. **Auto-deploy** on every push

### 3. Environment Variables (if needed)
Render will automatically use production settings. No additional configuration needed.

## ✅ What's Configured

### API Configuration
- ✅ **Production Backend**: All API calls now point to `https://consultancy-ol25.onrender.com`
- ✅ **Environment Config**: Centralized in `src/config/api.js`
- ✅ **Build Optimized**: Vite config optimized for production

### Files Updated
- ✅ `src/config/api.js` - Production API URL
- ✅ `src/pages/Properties.jsx` - Uses production API
- ✅ `src/pages/OwnerDashboard.jsx` - Uses production API
- ✅ `src/pages/Login.jsx` - Uses production API
- ✅ `src/pages/Register.jsx` - Uses production API
- ✅ `src/components/BookingModal.jsx` - Uses production API
- ✅ `src/components/Chatbot.jsx` - Uses production API
- ✅ `vite.config.js` - Production build settings

## 🎯 Expected Result

After deployment, your frontend will:
- ✅ Connect to your Render backend
- ✅ Allow user registration/login
- ✅ Display properties from backend
- ✅ Handle bookings and property management
- ✅ Work with chatbot functionality

## 🔧 Troubleshooting

### If API Calls Fail
1. **Check Backend URL**: Verify backend is running at `https://consultancy-ol25.onrender.com`
2. **CORS Issues**: Ensure backend allows frontend origin
3. **Network Tab**: Check browser dev tools for API errors

### If Build Fails
```bash
# Clear dependencies
rm -rf node_modules package-lock.json
npm install

# Build again
npm run build
```

## 📱 Testing After Deployment

1. **Visit Frontend URL** (provided by Render)
2. **Test Registration**: Create new user account
3. **Test Login**: Login with created account
4. **Test Properties**: Browse and book properties
5. **Test Dashboard**: Access owner features

## 🎉 Success!

Your frontend is now production-ready and will work seamlessly with your Render backend!
