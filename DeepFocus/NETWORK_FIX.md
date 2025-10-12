# Fix Network Error - API Connection Issue

## Date: October 8, 2025

## Problem

### Error 1: Metro Bundler

```
Error: ENOENT: no such file or directory, open 'InternalBytecode.js'
```

**Cause**: Metro bundler cache issue

### Error 2: Network Error

```
ERROR ❌ Token verification failed: Network error occurred
LOG 🔒 Token invalid, logged out
```

**Cause**: API URL using wrong IP address

## Root Cause Analysis

### IP Address Mismatch

```javascript
// OLD (Wrong)
API_BASE_URL: "http://192.168.1.11:5000/api";

// Your current IP addresses:
// - 172.16.0.2 (VirtualBox/VMware)
// - 172.29.47.106 (WSL/Docker)
// - 192.168.1.5 (WiFi - CORRECT!)

// NEW (Fixed)
API_BASE_URL: "http://192.168.1.5:5000/api";
```

## Solution Applied

### ✅ Updated env.js

Changed API URL from `192.168.1.11` to `192.168.1.5`

File: `src/config/env.js`

```javascript
const ENV = {
  development: {
    API_BASE_URL: "http://192.168.1.5:5000/api", // ✅ Fixed
    API_BASE_URL_FALLBACK: "http://localhost:5000/api",
    TIMEOUT: 30000,
  },
  production: {
    API_BASE_URL: "https://your-production-api.com/api",
    TIMEOUT: 15000,
  },
};
```

## Steps to Fix

### 1. Stop Current Expo Server

```bash
# Press Ctrl+C in terminal running Expo
# Or close the terminal
```

### 2. Clear Metro Cache

```bash
cd DeepFocus
npx expo start --clear
```

### 3. Clear App Cache on Device

**Option A: Expo Go App**

- Shake device (or press Cmd+D on iOS, Cmd+M on Android)
- Select "Reload"
- Or select "Disable Fast Refresh" then "Reload"

**Option B: Full Reset**

```bash
# Stop Expo
# Delete cache manually
rm -rf node_modules/.cache
rm -rf .expo

# Restart
npx expo start --clear
```

### 4. Verify Backend Running

```bash
# In separate terminal
cd DeepFocus/backend
npm start

# Should see:
# ✅ MongoDB Connected
# 🚀 Server is running on port 5000
```

### 5. Check Connection

```bash
# Test from browser (on same computer)
http://localhost:5000/api/auth/verify

# Should get 401 (Unauthorized) - this is OK, means server works

# Test from mobile network (use your IP)
http://192.168.1.5:5000/api/auth/verify

# Should also get 401 - means mobile can reach server
```

## Verification Steps

### After Restart, Check Logs

**Terminal logs should show:**

```
📱 Platform: ios (or android)
🔗 API URL: http://192.168.1.5:5000/api  ← Must be correct IP!
```

### Test Login

1. Open app on device
2. Try to login
3. Should see logs:

```
🚀 API Request: POST /auth/login
✅ API Response: POST /auth/login
✅ Login successful: [username]
```

### If Still Fails

Check these logs:

```
🚀 API Request: POST /auth/login
❌ Token verification failed: Network error occurred
```

This means:

- Backend not running on 192.168.1.5:5000
- Firewall blocking connection
- Phone and computer on different WiFi networks

## Common Issues & Solutions

### Issue 1: "Network error occurred"

**Symptoms:**

- Can't login
- Can't fetch tasks
- All API calls fail

**Check:**

1. **Backend running?**

   ```bash
   netstat -ano | findstr :5000
   # Should show: LISTENING
   ```

2. **Correct IP in env.js?**

   ```bash
   ipconfig | findstr /i "IPv4"
   # Find your WiFi adapter IP (usually 192.168.x.x)
   ```

3. **Same network?**

   - Computer on WiFi: Network1
   - Phone on WiFi: Network1 (MUST be same!)

4. **Firewall?**
   ```bash
   # Windows: Allow Node.js through firewall
   # Control Panel > Windows Defender Firewall > Allow an app
   # Find Node.js and check both Private and Public
   ```

### Issue 2: "InternalBytecode.js not found"

**Solution:**

```bash
# Clear cache completely
cd DeepFocus
rm -rf node_modules/.cache
rm -rf .expo
rm -rf android/app/build  # If using bare workflow
npx expo start --clear
```

### Issue 3: Different IP Each Time

**Problem:** Your router assigns new IP to your computer

**Solution 1: Set Static IP**

1. Windows Settings > Network & Internet
2. WiFi > Properties
3. Edit IP assignment > Manual
4. Set static IP: `192.168.1.5`
5. Subnet: `255.255.255.0`
6. Gateway: `192.168.1.1` (your router)

**Solution 2: Use Tunnel** (Easier!)

```bash
# Expo can create public URL
npx expo start --tunnel

# App will work from anywhere (slower but reliable)
```

### Issue 4: Works on Emulator, Not Real Device

**Cause:** Emulator uses localhost, real device needs IP

**Check env.js:**

```javascript
const getApiUrl = () => {
  if (Platform.OS === "web") {
    return ENV.development.API_BASE_URL_FALLBACK; // localhost
  }
  // For mobile (iOS/Android), use network IP
  return ENV.development.API_BASE_URL; // 192.168.1.5
};
```

## Debug Network Connection

### Test Backend from Mobile Browser

1. Open Safari (iOS) or Chrome (Android)
2. Go to: `http://192.168.1.5:5000/api/auth/verify`
3. **Expected**: JSON error `{ "error": "No token provided" }`
4. **If works**: Backend reachable from mobile
5. **If timeout**: Network issue

### Test with cURL

```bash
# From computer
curl http://localhost:5000/api/auth/verify

# Should get: {"error":"No token provided"}

# From another device on same network
curl http://192.168.1.5:5000/api/auth/verify

# Should get same error (proves network connectivity)
```

## Environment Variables Summary

### What Changed

```diff
// src/config/env.js

- API_BASE_URL: "http://192.168.1.11:5000/api"
+ API_BASE_URL: "http://192.168.1.5:5000/api"
```

### How to Find Your IP

**Windows:**

```bash
ipconfig | findstr /i "IPv4"
# Look for WiFi adapter IP (usually 192.168.x.x)
```

**macOS/Linux:**

```bash
ifconfig | grep "inet "
# Look for your WiFi IP (usually en0 or wlan0)
```

**Quick method:**

```bash
# Windows
ipconfig

# Look for:
# Wireless LAN adapter Wi-Fi:
#   IPv4 Address: 192.168.1.5  ← This one!
```

## After Fix Checklist

- [ ] Updated `src/config/env.js` with correct IP
- [ ] Stopped Expo server (Ctrl+C)
- [ ] Cleared cache: `npx expo start --clear`
- [ ] Backend running on correct port (5000)
- [ ] Firewall allows Node.js connections
- [ ] Computer and phone on same WiFi
- [ ] App reloaded on device
- [ ] Checked terminal logs show correct IP
- [ ] Tested login
- [ ] API calls working

## Expected Behavior After Fix

### Login Flow

```
1. User enters credentials
   ↓
2. App sends to: http://192.168.1.5:5000/api/auth/login
   ↓
3. Backend validates
   ↓
4. Returns token
   ↓
5. App stores token
   ↓
6. Redirects to home
   ↓
7. Auto-verifies token: http://192.168.1.5:5000/api/auth/verify
   ↓
8. Success! ✅
```

### Console Logs (Success)

```
📱 Platform: ios
🔗 API URL: http://192.168.1.5:5000/api
🚀 API Request: POST /auth/login
📤 Request Data: {email: "...", password: "..."}
✅ API Response: POST /auth/login
📥 Response Data: {success: true, data: {...}}
✅ Login successful: username
🚀 API Request: GET /auth/verify
✅ API Response: GET /auth/verify
```

### Console Logs (Still Failing)

```
📱 Platform: ios
🔗 API URL: http://192.168.1.5:5000/api
🚀 API Request: POST /auth/login
❌ Network error occurred
🔒 Token invalid, logged out
```

If still failing after fix:

1. Check backend is running
2. Verify IP address is correct
3. Test backend URL in mobile browser
4. Check firewall settings
5. Confirm same WiFi network

## Alternative: Use Tunnel

If all else fails, use Expo tunnel:

```bash
cd DeepFocus
npx expo start --tunnel

# Expo creates public URL like:
# exp://xxx.xxx.xxx.xxx:19000
# Works from anywhere!
```

**Pros:**

- Works from any network
- No IP configuration needed
- No firewall issues

**Cons:**

- Slower (goes through Expo servers)
- Requires Expo account

## Quick Fix Commands

```bash
# 1. Get your current IP
ipconfig | findstr /i "IPv4"

# 2. Update env.js with your IP (already done)

# 3. Stop Expo (Ctrl+C)

# 4. Clear cache and restart
cd DeepFocus
npx expo start --clear

# 5. In another terminal, ensure backend running
cd DeepFocus/backend
npm start

# 6. Reload app on device (shake + reload)
```

---

## Status

✅ **Fixed**: API URL updated to `192.168.1.5`

⚠️ **Next**:

1. Clear cache: `npx expo start --clear`
2. Reload app on device
3. Test login

🎯 **Expected Result**: Login works, no network errors!
