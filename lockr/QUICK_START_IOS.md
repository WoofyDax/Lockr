# 🚀 Lockr iOS - Quick Start Guide

**Get Lockr on the App Store in ~1 day (excluding Apple review time)**

---

## Prerequisites

- [ ] Mac with Xcode installed (get from Mac App Store)
- [ ] Apple Developer Account ($99/year) - [Sign up here](https://developer.apple.com/programs/)
- [ ] Your Lockr app working locally
- [ ] 1024x1024 app icon ready

---

## Step 1: Install & Setup (15 minutes)

### Option A: Use the Helper Script (Easiest)

```bash
# Make script executable
chmod +x ios-deploy.sh

# Run it
./ios-deploy.sh

# Choose option 1 (Initial Setup)
```

### Option B: Manual Commands

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/camera @capacitor/splash-screen @capacitor/status-bar

# Build your app
npm run build

# Add iOS platform
npx cap add ios

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

---

## Step 2: Configure Xcode (20 minutes)

### 2.1 Set Bundle Identifier
1. Click **App** (blue icon) in left sidebar
2. Under **General** > **Identity**
3. Change **Bundle Identifier** to: `com.yourname.lockr`
   - Must be unique across all App Store apps
   - Example: `com.johnsmith.lockr`

### 2.2 Configure Signing
1. Click **Signing & Capabilities** tab
2. **Team**: Select your Apple Developer team
3. ✓ Check **Automatically manage signing**

### 2.3 Add App Icon
1. Left sidebar: `App/App/Assets.xcassets`
2. Click **AppIcon**
3. Drag your 1024x1024 icon into the **App Store iOS 1024pt** slot

### 2.4 Test on Device
1. Connect iPhone via USB
2. Select your iPhone from device dropdown (top of Xcode)
3. Click ▶️ Play button
4. On iPhone: Settings > General > VPN & Device Management > Trust developer

---

## Step 3: App Store Connect (30 minutes)

### 3.1 Create App Listing
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. **My Apps** > **+** > **New App**
3. Fill form:
   - **Name**: Lockr
   - **Primary Language**: English
   - **Bundle ID**: Select the one from Xcode
   - **SKU**: lockr-001

### 3.2 Required Materials

**Screenshots** (3 minimum):
- Run app on iPhone 15 Pro Max simulator
- Navigate to best screens
- Press `Cmd+S` to screenshot
- Upload to App Store Connect

**App Description**:
```
LOCKR - TIME CAPSULE MOMENTS 🔒⏰

Create digital time capsules with your friends. Capture memories that stay locked until the perfect moment.

✨ HOW IT WORKS
📸 Snap a photo with built-in camera
🔐 Set unlock time (1hr to months)
👥 Share with friend groups
⏰ Watch the countdown
🎉 Unlock & relive together

Perfect for birthdays, trips, New Year's, and special moments.
```

**Keywords**:
```
photo,time capsule,countdown,friends,memories,camera,lock,timer,social
```

**Privacy Policy**:
- Create one at [PrivacyPolicies.com](https://www.privacypolicies.com) (free)
- Host on GitHub Pages or your website
- Add URL to App Store Connect

**Demo Account**:
- Create test account in your app
- Email: demo@lockr.app
- Password: [create one]
- Give credentials to Apple reviewers

---

## Step 4: Build & Upload (30 minutes)

### 4.1 In Xcode

1. **Set Version**:
   - General > Identity
   - Version: `1.0.0`
   - Build: `1`

2. **Select Device**:
   - Top device selector
   - Choose: **Any iOS Device (arm64)**

3. **Archive**:
   - Menu: **Product** > **Archive**
   - Wait 5-10 minutes

4. **Validate & Upload**:
   - Organizer window opens
   - Click **Validate App**
   - Wait for validation ✅
   - Click **Distribute App**
   - Choose **App Store Connect**
   - Click **Upload**
   - Wait 5-15 minutes

### 4.2 In App Store Connect

1. Wait 10-30 min for build to process
2. You'll get email: "Build processed"
3. Go to **App Store** tab > **+ Version** > iOS
4. Version: `1.0.0`
5. Click **Build** > **+** > Select your build
6. Upload screenshots
7. Fill all required fields
8. Click **Submit for Review**

---

## Step 5: Wait for Apple Review

- **Waiting for Review**: 1-2 days
- **In Review**: 12-48 hours
- **Approved**: You get email!
- **Release**: Goes live immediately (or when you click Release)

**Your app is now on the App Store! 🎉**

---

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| "No team found" | Add Apple ID in Xcode > Preferences > Accounts |
| "Bundle identifier unavailable" | Change to unique ID (add your name) |
| Camera not working | Must test on real iPhone, not simulator |
| Build fails | Run `npx cap sync ios` and rebuild |
| App crashes on launch | Check `capacitor.config.ts` webDir matches build folder |

---

## After Code Changes

```bash
# Quick workflow
npm run build
npx cap sync ios
# Then rebuild in Xcode (Cmd+R)

# Or use helper script
./ios-deploy.sh
# Choose option 2 (Sync Changes)
```

---

## Updating Your App

1. Make changes to code
2. Increment version in Xcode:
   - `1.0.0` → `1.1.0` (features)
   - `1.0.0` build `1` → build `2` (bug fixes)
3. Archive and upload again
4. Submit new version in App Store Connect
5. Updates usually approved in 24-48 hours

---

## Full Documentation

- **Complete Guide**: See `APP_STORE_DEPLOYMENT.md`
- **Capacitor Docs**: https://capacitorjs.com/docs/ios
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/

---

## Quick Command Reference

```bash
# Initial setup
npx cap add ios

# After code changes
npm run build && npx cap sync ios

# Open Xcode
npx cap open ios

# Check status
npx cap doctor

# Update Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/ios@latest
npx cap sync ios

# Clean rebuild
rm -rf ios && npx cap add ios
```

---

## Next Step RIGHT NOW

1. **Sign up for Apple Developer** ($99/year):
   ```
   https://developer.apple.com/programs/enroll/
   ```

2. **While waiting, run this**:
   ```bash
   chmod +x ios-deploy.sh
   ./ios-deploy.sh
   ```
   Choose option 1 (Initial Setup)

3. **Design your app icon** (1024x1024):
   - Purple-pink gradient background (#7c3aed → #ec4899)
   - White padlock or "L" symbol
   - No rounded corners (iOS adds them)
   - Save as PNG

---

**You're ready! The whole process takes about 6-8 hours of actual work, then 1-3 days waiting for Apple's review. Good luck! 🚀🔐**
