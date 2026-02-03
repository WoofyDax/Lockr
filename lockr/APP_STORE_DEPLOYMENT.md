# Lockr - Apple App Store Deployment Guide

Complete step-by-step guide to get Lockr on the Apple App Store.

---

## PHASE 1: Initial Setup (30 minutes)

### Step 1.1: Install Capacitor Dependencies

```bash
# Install Capacitor packages
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/camera @capacitor/splash-screen @capacitor/status-bar

# Or if using yarn
yarn add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/camera @capacitor/splash-screen @capacitor/status-bar
```

### Step 1.2: Build Your Web App

```bash
npm run build
```

This creates the `dist` folder with your production-ready app.

### Step 1.3: Add iOS Platform

```bash
# Add iOS platform (only do this once)
npx cap add ios

# Sync your web code to native
npx cap sync ios
```

This creates the `ios/` folder with your native iOS project.

---

## PHASE 2: Configure iOS Project (45 minutes)

### Step 2.1: Open Xcode

```bash
npx cap open ios
```

### Step 2.2: Update Bundle Identifier

1. In Xcode, click **App** (blue icon) in the left sidebar
2. Under **General** tab, find **Bundle Identifier**
3. Change from `com.lockr.app` to your unique ID:
   - Format: `com.yourname.lockr` or `com.yourcompany.lockr`
   - Example: `com.johnsmith.lockr`
   - Must be unique across all App Store apps
   - Use lowercase, no spaces or special characters

### Step 2.3: Set App Information

Still in the **General** tab:
- **Display Name**: Lockr
- **Version**: 1.0.0
- **Build**: 1
- **Minimum Deployments**: iOS 15.0
- **Supports iPad**: Unchecked (iPhone only for now)
- **Device Orientation**: Portrait only

### Step 2.4: Configure Signing & Capabilities

1. Click **Signing & Capabilities** tab
2. **Team**: Select your Apple Developer team from dropdown
   - If not listed, add account: Xcode > Preferences > Accounts > + > Sign in with Apple ID
3. Check **Automatically manage signing**
4. **Provisioning Profile**: Xcode Managed Profile (automatic)

### Step 2.5: Add Required Permissions

1. In left sidebar, navigate to: `App/App/Info.plist`
2. Right-click in the editor and select **Open As > Source Code**
3. Add these permission descriptions (paste inside `<dict>` tag):

```xml
<key>NSCameraUsageDescription</key>
<string>Lockr needs camera access to capture moments for your time capsules</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Lockr needs access to your photo library to share memories with friends</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Lockr needs permission to save unlocked memories to your photo library</string>

<key>NSMicrophoneUsageDescription</key>
<string>Lockr needs microphone access to record videos for your capsules</string>

<key>UIUserInterfaceStyle</key>
<string>Dark</string>

<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleLightContent</string>

<key>UIViewControllerBasedStatusBarAppearance</key>
<false/>
```

### Step 2.6: Disable Landscape Orientations

1. In **App** target settings > **General** tab
2. Scroll to **Deployment Info**
3. Under **iPhone Orientation**, uncheck:
   - Landscape Left
   - Landscape Right
4. Keep only **Portrait** checked

---

## PHASE 3: Create App Icons & Assets (1 hour)

### Step 3.1: Generate App Icons

You need a 1024x1024px icon. Create it or use a design tool:

**Option A: Use App Icon Generator (Recommended)**
1. Go to https://www.appicon.co or https://easyappicon.com
2. Upload a square 1024x1024 PNG of your Lockr logo
3. Download the iOS icon set
4. Extract and find the `Assets.xcassets` folder

**Option B: Design Your Own**
- Create 1024x1024px PNG
- Purple-to-pink gradient background
- White padlock or "L" symbol
- No transparency
- Name it `AppIcon-1024.png`

### Step 3.2: Add Icons to Xcode

1. In Xcode left sidebar: `App/App/Assets.xcassets`
2. Click **AppIcon**
3. Drag your 1024x1024 icon into the **App Store iOS 1024pt** slot
4. Or drag the entire icon set if using a generator

### Step 3.3: Create Launch Screen (Splash Screen)

1. In Xcode, navigate to: `App/App/Base.lproj/LaunchScreen.storyboard`
2. Click on the View in the storyboard
3. Set Background Color: `#0f0a1e` (your app's dark background)
4. Optional: Add "LOCKR" text or logo in center

Or replace with a simple PNG:
1. Add a 1125x2436 PNG image to Assets.xcassets
2. Name it `SplashScreen`
3. Update LaunchScreen.storyboard to use it

---

## PHASE 4: Testing (30 minutes)

### Step 4.1: Test on Simulator

1. At top of Xcode, click device selector
2. Choose **iPhone 15 Pro** (or any recent iPhone)
3. Click ▶️ **Play** button (or press Cmd+R)
4. Test all features (camera won't work in simulator)

### Step 4.2: Test on Real Device (Required for Camera)

1. Connect your iPhone via USB cable
2. Unlock phone and tap **Trust This Computer**
3. In Xcode, select your iPhone from device dropdown
4. Click ▶️ **Play** button

**First time setup:**
1. App will fail to launch with "Untrusted Developer" error
2. On iPhone: Settings > General > VPN & Device Management
3. Tap your Apple ID > Trust
4. Go back to Xcode and run again

**Test everything:**
- [ ] Camera capture
- [ ] Photo upload
- [ ] Group creation
- [ ] Friend invites
- [ ] Time locks work
- [ ] Countdown timers accurate
- [ ] UI looks good on different iPhone sizes

---

## PHASE 5: App Store Connect Setup (1 hour)

### Step 5.1: Create App Store Connect Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. Click **My Apps** > **+ (plus icon)** > **New App**

Fill out the form:
- **Platform**: iOS
- **Name**: Lockr
- **Primary Language**: English (U.S.)
- **Bundle ID**: Select `com.yourname.lockr` (the one you set earlier)
- **SKU**: lockr-001 (can be anything unique to you)
- **User Access**: Full Access

Click **Create**

### Step 5.2: Fill App Information

**Category**
- Primary: Photo & Video
- Secondary: Social Networking

**Content Rights**
- ✓ Yes, it contains third-party content
- (Because users upload their own photos)

**Age Rating**
Click **Edit** and answer the questionnaire:
- Most answers will be "No"
- "Users can share their location" > No
- "Users can share personal information" > Yes (they share photos)
- Likely rating: 4+

### Step 5.3: Create App Privacy Policy

You MUST have a privacy policy URL. Quick options:

**Option A: Use a Privacy Policy Generator**
1. Go to https://www.privacypolicies.com or https://www.freeprivacypolicy.com
2. Generate policy for a photo-sharing app
3. Host it somewhere (GitHub Pages, your website, etc.)
4. Get the URL

**Option B: Create Your Own**
Minimum requirements:
- What data you collect (photos, usernames, email)
- How you use it (storing in Supabase, sharing with friends)
- Third-party services (Supabase)
- User rights (can delete account/data)
- Host on a public URL

Enter the URL in App Store Connect under **App Privacy** section.

### Step 5.4: App Privacy Questionnaire

In App Store Connect, go to **App Privacy** > **Get Started**

Answer questions about data collection:
1. **Contact Info**: Yes (email for auth)
2. **User Content**: Yes (photos/videos)
3. **User ID**: Yes (username)
4. **Device ID**: No
5. For each "Yes", specify:
   - Used for App Functionality
   - Data is linked to user
   - Data is not used for tracking

---

## PHASE 6: Prepare Marketing Materials (1-2 hours)

### Step 6.1: App Screenshots (REQUIRED)

You need screenshots for different iPhone sizes. At minimum:
- **6.7" display** (iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max)
- **6.5" display** (iPhone 11 Pro Max, XS Max)

**How to take screenshots:**
1. Run app on iPhone 15 Pro Max simulator
2. Navigate to your best screens:
   - Home screen with locked capsules showing countdown
   - Group chat with locked photos
   - Camera view
   - Photo preview with time selection
   - Friends list
3. Press Cmd+S in simulator to save screenshot
4. Screenshots save to Desktop

**Minimum required:** 3 screenshots, **Maximum:** 10 screenshots

**Pro tip:** Use a tool like [Previewed](https://previewed.app) or [Screenshot.rocks](https://screenshot.rocks) to add device frames and make them look professional.

### Step 6.2: App Preview Video (Optional but Recommended)

30-second video showing the app in action:
1. Record screen in simulator (Cmd+R in simulator)
2. Show: Creating group → Taking photo → Setting timer → Waiting → Unlock
3. Maximum 30 seconds
4. Export as .mov or .mp4
5. Upload to App Store Connect

### Step 6.3: Write App Description

**App Store Description** (Maximum 4000 characters):

```
LOCKR - TIME CAPSULE MOMENTS 🔒⏰

Create digital time capsules with your friends. Capture memories that stay locked until the perfect moment.

✨ HOW IT WORKS

📸 Snap a Photo
Take photos or videos directly in the app with your iPhone camera.

🔐 Lock It Away
Set when your memories unlock: 1 hour, 12 hours, 1 day, or pick a custom date.

👥 Share with Friends
Create group capsules with friends. Everyone can add photos, but nobody can see them until unlock time.

⏰ Watch the Countdown
See your locked moments with animated countdown timers. The anticipation is part of the fun!

🎉 Unlock & Relive
When time's up, all photos unlock simultaneously. Download and share your memories.

🌟 FEATURES

• Beautiful purple-pink gradient design with glassmorphism effects
• Group time capsules with unlimited friends
• Custom unlock times - from 1 hour to months in the future
• Real camera integration for instant captures
• Synchronized unlock - all photos reveal at the same time
• Download unlocked memories to your photo library
• Friend system with invite codes
• Secure cloud storage powered by Supabase
• Works offline - syncs when connected

📱 PERFECT FOR

• Birthday surprises
• Event recaps (parties, trips, concerts)
• New Year's Eve countdowns
• Vacation memories
• Friendship anniversaries
• Daily gratitude journals
• Wedding day reveals

🔒 PRIVACY & SECURITY

Your photos are encrypted and stored securely. Only invited friends in your capsules can access them. Delete anytime.

Download Lockr now and start creating time-locked memories! 💜

---

Made with love for capturing moments that matter.
```

**Keywords** (100 characters max, comma-separated):
```
photo,time capsule,countdown,friends,memories,camera,lock,timer,social,snapchat
```

**Promotional Text** (170 characters, shown above description):
```
Lock your photos until the perfect moment! Create time capsules with friends and watch the countdown to unlock your shared memories. ✨🔐
```

**Support URL**: Your website or GitHub repo
**Marketing URL**: Your landing page (optional)

---

## PHASE 7: Build for App Store (30 minutes)

### Step 7.1: Update Version & Build Number

In Xcode, under **General** tab:
- **Version**: 1.0.0
- **Build**: 1

### Step 7.2: Select "Any iOS Device (arm64)"

At the top of Xcode, click the device selector and choose:
**Any iOS Device (arm64)**

### Step 7.3: Archive the App

1. In Xcode menu: **Product** > **Archive**
2. Wait for build to complete (5-10 minutes)
3. Xcode Organizer window will open showing your archive

### Step 7.4: Validate the Archive

1. In Organizer, select your archive
2. Click **Validate App**
3. Choose your distribution method: **App Store Connect**
4. Select distribution options:
   - Upload your app's symbols: ✓ (checked)
   - Manage Version and Build Number: ✓ (checked)
5. Signing: **Automatically manage signing**
6. Click **Validate**
7. Wait for validation (2-5 minutes)
8. Fix any errors/warnings that appear

### Step 7.5: Upload to App Store Connect

1. Once validation passes, click **Distribute App**
2. Choose **App Store Connect**
3. Same options as validation step
4. Click **Upload**
5. Wait for upload to complete (5-15 minutes depending on app size)
6. You'll get a confirmation: "Upload Successful"

---

## PHASE 8: Submit for Review (30 minutes)

### Step 8.1: Process Build in App Store Connect

1. Go back to [App Store Connect](https://appstoreconnect.apple.com)
2. Click your **Lockr** app
3. Build will appear under **TestFlight** > **iOS Builds** within 10-30 minutes
4. You'll get email: "Your build has been processed"

### Step 8.2: Create App Store Version

1. In App Store Connect, click **App Store** tab
2. Click **+ Version or Platform** > **iOS**
3. Enter version number: **1.0.0**
4. Click **Create**

### Step 8.3: Fill All Required Fields

**Build**
- Click **+ (plus)** next to Build
- Select your uploaded build (1.0.0 build 1)

**Screenshots**
- Upload your prepared screenshots for each device size
- Minimum 3 screenshots per size

**App Preview Video** (if you made one)
- Upload video

**Description**
- Paste your app description

**Keywords**
- Paste your keywords

**Support URL**
- Enter your support URL

**Marketing URL** (optional)
- Enter if you have one

**Version Information**
- What's New: "Initial release of Lockr! Create time-locked photo capsules with friends."

**App Review Information**
- **Sign-in required**: Yes
- **Demo account credentials**:
  - Username: demo@lockr.app (create a real test account!)
  - Password: [your demo password]
  - Notes: "This is a test account. Feel free to create groups and upload test photos."

**Contact Information**
- Fill your real contact info (not shown publicly)

**Age Rating**
- Verify the rating from earlier questionnaire

**App Privacy**
- Complete the privacy questionnaire if not done

### Step 8.4: Submit for Review

1. Review everything one more time
2. Click **Add for Review** (top right)
3. Choose release option:
   - **Manually release this version**: You control when it goes live
   - **Automatically release**: Goes live immediately after approval
4. Click **Submit for Review**

---

## PHASE 9: Wait for Review (1-3 days)

### What Happens Now:

1. **Waiting for Review** (1-2 days)
   - Your app is in queue
   - No action needed

2. **In Review** (12-48 hours)
   - Apple tests your app
   - They'll use your demo account
   - Check email for updates

3. **Possible Outcomes:**

   **✅ Approved (90% of apps)**
   - You'll get email: "Your app status is Ready for Sale"
   - If you chose auto-release, it's live immediately
   - If manual release, click **Release This Version**

   **⚠️ Metadata Rejected**
   - Issue with description/screenshots
   - Fix and resubmit (no new build needed)

   **❌ Rejected (Rare for well-prepared apps)**
   - Issue with functionality
   - Common reasons:
     - Demo account doesn't work
     - Crashes on launch
     - Missing features from description
   - Fix issues in Xcode
   - Upload new build
   - Resubmit

---

## PHASE 10: Your App is Live! 🎉

### Step 10.1: Share Your App

Your App Store URL will be:
```
https://apps.apple.com/app/lockr/[YOUR_APP_ID]
```

Create a short link:
```
https://apps.apple.com/app/id[YOUR_APP_ID]
```

### Step 10.2: Marketing

- Post on social media
- Add "Download on App Store" badge to your website
- Tell your friends!
- Create a landing page
- Consider running ads

### Step 10.3: Monitor & Update

- Check App Store Connect Analytics
- Read user reviews
- Fix bugs quickly
- Release updates every 2-4 weeks

---

## PHASE 11: Releasing Updates

When you want to update your app:

```bash
# 1. Make your code changes
# 2. Build web app
npm run build

# 3. Sync to iOS
npx cap sync ios

# 4. Increment version in Xcode
#    Version: 1.0.0 → 1.1.0 (for features)
#    OR Build: 1 → 2 (for bug fixes)

# 5. Archive and upload (repeat Phase 7)

# 6. In App Store Connect:
#    - Create new version
#    - Add "What's New" description
#    - Select new build
#    - Submit for review
```

Updates usually get reviewed faster (24-48 hours).

---

## Common Issues & Solutions

### ❌ "No bundle identifier found"
**Fix**: Set unique bundle ID in Xcode (Step 2.2)

### ❌ "Provisioning profile error"
**Fix**: Make sure you selected your Team in Signing & Capabilities

### ❌ "Missing compliance" warning
**Fix**: In App Store Connect, answer export compliance questions:
- Does your app use encryption? → No (or Yes if using HTTPS only, then select "No" for proprietary encryption)

### ❌ App crashes on launch
**Fix**: 
1. Make sure `dist` folder exists and has content
2. Run `npx cap sync ios` again
3. Check that `webDir` in capacitor.config.ts matches your build folder

### ❌ Camera permission not working
**Fix**: Double-check Info.plist has all camera permission strings (Step 2.5)

### ❌ "Invalid binary" rejection
**Fix**: Make sure you selected "Any iOS Device (arm64)" before archiving, not a simulator

---

## Checklist Before Submitting

- [ ] App builds and runs on real iPhone without errors
- [ ] All features work (camera, upload, countdown, unlock)
- [ ] Bundle identifier is unique to you
- [ ] App icons added (1024x1024)
- [ ] Launch screen configured
- [ ] Privacy policy URL added
- [ ] 3+ screenshots uploaded
- [ ] App description written
- [ ] Keywords added
- [ ] Demo account created and tested
- [ ] App privacy questionnaire completed
- [ ] Version and build numbers set
- [ ] Archive uploaded successfully
- [ ] All required fields filled in App Store Connect

---

## Timeline Summary

- **Setup & Config**: 2-3 hours
- **Design Assets**: 1-2 hours
- **Testing**: 1 hour
- **App Store Connect**: 1 hour
- **Build & Upload**: 1 hour
- **Apple Review**: 1-3 days
- **TOTAL**: About 1 day of work + waiting for Apple

---

## Next Steps RIGHT NOW

1. **Sign up for Apple Developer** ($99/year):
   https://developer.apple.com/programs/enroll/

2. **While waiting for approval**, run these commands:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/camera
npm run build
npx cap add ios
npx cap open ios
```

3. **Design your 1024x1024 app icon** - use your purple-pink gradient theme with a padlock!

4. **Prepare demo account** - create a real Supabase user you can give to Apple

---

## Help & Resources

- **Capacitor Docs**: https://capacitorjs.com/docs/ios
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **App Store Connect Help**: https://developer.apple.com/support/app-store-connect/
- **Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/ios

---

**You're ready to deploy Lockr to the App Store! 🚀**

Good luck! The hardest part is gathering all the assets and filling forms. The actual technical deployment is straightforward with Capacitor.
