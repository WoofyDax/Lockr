# ✅ Lockr App Store Submission Checklist

Print this and check off items as you complete them!

---

## 📋 Pre-Submission Checklist

### Apple Developer Account
- [ ] Signed up for Apple Developer Program ($99/year)
- [ ] Account activated and confirmed
- [ ] Added to Xcode (Preferences > Accounts)

### Development Setup
- [ ] Xcode installed (latest version)
- [ ] Capacitor dependencies installed
- [ ] iOS platform added (`npx cap add ios`)
- [ ] Project opens in Xcode without errors

### App Configuration in Xcode
- [ ] Bundle Identifier set (unique, format: com.yourname.lockr)
- [ ] Team selected in Signing & Capabilities
- [ ] "Automatically manage signing" enabled
- [ ] Display Name set to "Lockr"
- [ ] Version set to 1.0.0
- [ ] Build number set to 1
- [ ] iOS Deployment Target: 15.0 or higher
- [ ] Only Portrait orientation enabled
- [ ] iPad support disabled (iPhone only)

### Permissions & Info.plist
- [ ] NSCameraUsageDescription added
- [ ] NSPhotoLibraryUsageDescription added
- [ ] NSPhotoLibraryAddUsageDescription added
- [ ] NSMicrophoneUsageDescription added
- [ ] All permission descriptions are clear and user-friendly

### App Assets
- [ ] 1024x1024 app icon created
- [ ] App icon added to Assets.xcassets
- [ ] Launch screen configured
- [ ] App icon displays correctly in Xcode preview

### Testing
- [ ] App builds successfully (⌘+B)
- [ ] App runs on iOS Simulator without crashes
- [ ] App runs on real iPhone device without crashes
- [ ] Camera works on real device
- [ ] Photo upload works
- [ ] Group creation works
- [ ] Friend invites work
- [ ] Time locks work correctly
- [ ] Countdown timers accurate
- [ ] Photos unlock at correct time
- [ ] Download function works
- [ ] All UI elements display correctly
- [ ] No console errors in Xcode debugger
- [ ] App works on different iPhone sizes (test 3+)

---

## 🖼️ App Store Connect - Assets

### Screenshots (Required)
- [ ] 3+ screenshots for 6.7" display (iPhone 15 Pro Max)
- [ ] 3+ screenshots for 6.5" display (iPhone 11 Pro Max)
- [ ] Screenshots show key features:
  - [ ] Home screen with locked capsules
  - [ ] Group chat with photos
  - [ ] Camera interface
  - [ ] Photo preview with time selection
  - [ ] Unlocked photos view
- [ ] Screenshots are high quality (not blurry)
- [ ] Screenshots have no personal/test data visible

### App Preview Video (Optional but Recommended)
- [ ] Video created (max 30 seconds)
- [ ] Shows app workflow end-to-end
- [ ] High quality, smooth recording
- [ ] No audio needed (or appropriate music)
- [ ] Exported in .mov or .mp4 format

### App Icon
- [ ] Same 1024x1024 icon uploaded to App Store Connect
- [ ] Icon looks good in App Store preview

---

## 📝 App Store Connect - Metadata

### Basic Information
- [ ] App Name: Lockr
- [ ] Subtitle (optional): "Time Capsule Moments"
- [ ] Primary Language: English (U.S.)

### Category & Age Rating
- [ ] Primary Category: Photo & Video
- [ ] Secondary Category: Social Networking
- [ ] Age Rating questionnaire completed
- [ ] Expected rating: 4+ or 9+

### Description & Keywords
- [ ] App Description written (engaging, clear, under 4000 chars)
- [ ] Keywords added (100 chars max, comma-separated)
- [ ] Promotional Text added (170 chars, optional)
- [ ] Keywords relevant and searchable

### URLs
- [ ] Support URL added (required)
- [ ] Marketing URL added (optional)
- [ ] Privacy Policy URL added (required)
- [ ] Privacy Policy is live and accessible

### What's New
- [ ] "What's New in This Version" filled
- [ ] For v1.0.0: "Initial release! Welcome to Lockr..."

### App Privacy
- [ ] Privacy questionnaire completed in App Store Connect
- [ ] Data types declared:
  - [ ] Contact Info (email)
  - [ ] User Content (photos/videos)
  - [ ] User ID (username)
- [ ] Data usage purposes specified
- [ ] Tracking status declared (probably No)

### App Review Information
- [ ] Demo account created in your app
- [ ] Demo account credentials provided:
  - [ ] Email/Username: ________________
  - [ ] Password: ________________
- [ ] Demo account tested and works
- [ ] Contact information filled (your real info)
- [ ] Notes for reviewer written (explain demo account, special features)
- [ ] Phone number provided for contact

---

## 🏗️ Build & Upload

### Pre-Archive Checks
- [ ] Latest code changes committed
- [ ] `npm run build` completed successfully
- [ ] `npx cap sync ios` completed successfully
- [ ] No build warnings in Xcode (or all resolved)
- [ ] "Any iOS Device (arm64)" selected in Xcode

### Archive Process
- [ ] Product > Archive clicked
- [ ] Archive completed successfully (no errors)
- [ ] Archive appears in Organizer

### Validation
- [ ] "Validate App" clicked in Organizer
- [ ] Distribution method: App Store Connect
- [ ] Upload symbols: Enabled
- [ ] Manage version automatically: Enabled
- [ ] Signing: Automatic
- [ ] Validation passed ✅
- [ ] All warnings reviewed (none critical)

### Upload to App Store Connect
- [ ] "Distribute App" clicked
- [ ] Upload completed successfully
- [ ] Upload confirmation received
- [ ] Email received: "Your build is processing"
- [ ] Build appears in App Store Connect (wait 10-30 min)
- [ ] Build status: "Processing" → "Ready to Submit"

---

## 🚀 Final Submission

### Version Setup
- [ ] New version created (1.0.0)
- [ ] Build selected and attached
- [ ] All screenshots uploaded
- [ ] App icon verified
- [ ] Description proofread
- [ ] URLs tested (all work)

### Pre-Submit Review
- [ ] All required fields filled (no red dots)
- [ ] Preview looks correct
- [ ] Metadata is accurate
- [ ] No typos in description
- [ ] Demo account works
- [ ] Age rating is appropriate

### Release Options
- [ ] Release option selected:
  - [ ] **Manual release** (you control when it goes live)
  - [ ] **Automatic release** (goes live immediately after approval)
- [ ] Phased release decision made (optional)

### Submit!
- [ ] "Submit for Review" clicked
- [ ] Confirmation screen reviewed
- [ ] Final submission confirmed
- [ ] Email received: "Your app is waiting for review"
- [ ] Status changed to "Waiting for Review"

---

## ⏳ During Review (Apple's Turn)

### Monitor Status
- [ ] Check App Store Connect daily
- [ ] Check email for Apple updates
- [ ] Status progression tracked:
  - [ ] Waiting for Review
  - [ ] In Review
  - [ ] Pending Developer Release OR Ready for Sale

### Possible Outcomes

#### ✅ If Approved
- [ ] Email received: "Ready for Sale"
- [ ] If manual release: Click "Release This Version"
- [ ] App appears on App Store
- [ ] App Store URL saved: _________________________
- [ ] Shared with friends/social media
- [ ] 🎉 CELEBRATE! 🎉

#### ⚠️ If Metadata Rejected
- [ ] Read rejection reason
- [ ] Fix metadata issues
- [ ] Resubmit (no new build needed)

#### ❌ If App Rejected
- [ ] Read detailed rejection reason
- [ ] Fix issues in code
- [ ] Test fixes thoroughly
- [ ] Increment build number
- [ ] Archive and upload new build
- [ ] Reply to reviewer or resubmit

---

## 📱 Post-Launch

### Immediate Tasks
- [ ] Test downloading from actual App Store
- [ ] Verify app works when installed via App Store
- [ ] Take screenshot of app in App Store for portfolio
- [ ] Get App Store link: https://apps.apple.com/app/id___________

### Marketing & Sharing
- [ ] Create "Download on App Store" badge for website
- [ ] Post announcement on social media
- [ ] Share with friends and beta testers
- [ ] Ask early users for reviews

### Monitoring
- [ ] Set up App Store Connect analytics monitoring
- [ ] Check for crash reports daily (first week)
- [ ] Read and respond to user reviews
- [ ] Monitor download numbers

### Maintenance Plan
- [ ] Plan first update (bug fixes)
- [ ] Schedule regular updates (every 2-4 weeks)
- [ ] Set up crash reporting (if not already)
- [ ] Create user feedback system

---

## 🔄 For Future Updates

### Before Each Update
- [ ] Increment version or build number
- [ ] Test all features
- [ ] Write "What's New" description
- [ ] Archive new build
- [ ] Upload to App Store Connect
- [ ] Create new version in App Store Connect
- [ ] Submit for review

### Update Checklist
- [ ] Version: _____ → _____
- [ ] Build: _____ → _____
- [ ] Changes documented
- [ ] All features tested
- [ ] No regressions
- [ ] Build uploaded
- [ ] Submitted on: __________
- [ ] Approved on: __________

---

## 📞 Emergency Contacts & Resources

### If You Get Stuck
- **Capacitor Docs**: https://capacitorjs.com/docs/ios
- **App Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **App Store Connect Help**: https://developer.apple.com/support/app-store-connect/
- **Stack Overflow**: Tag [capacitor] [ios]
- **Capacitor Discord**: https://discord.gg/UPYYRhtyzp

### Apple Support
- **Developer Support**: https://developer.apple.com/contact/
- **App Review Status**: https://developer.apple.com/contact/app-store/
- **Technical Support**: 2 tickets per year with membership

### Common Rejection Reasons
1. Demo account doesn't work → Test it!
2. App crashes → Test on real device
3. Missing features → Description matches app
4. Privacy policy → Must be accessible
5. Permissions not explained → Check Info.plist

---

## 🎯 Timeline Estimate

| Phase | Time |
|-------|------|
| Setup & Configuration | 2-3 hours |
| Design Assets | 1-2 hours |
| Testing | 1 hour |
| App Store Connect | 1 hour |
| Build & Upload | 1 hour |
| **Your Total Work** | **6-8 hours** |
| Apple Review | 1-3 days |
| **TOTAL TIME** | **~2-4 days** |

---

## 💡 Pro Tips

1. **Do everything in one day** - Easier to remember context
2. **Test demo account** - Apple WILL try to use it
3. **Take screenshots early** - While testing
4. **Read rejection carefully** - Apple is specific about fixes needed
5. **Update regularly** - Shows app is maintained
6. **Respond to reviews** - Builds trust with users
7. **Start marketing pre-launch** - Build anticipation

---

## 🎊 You're Ready!

- [ ] Read through this entire checklist
- [ ] Understand each step
- [ ] Have all prerequisites
- [ ] Ready to start

**Estimated time to App Store: 1-2 days of work + 1-3 days Apple review**

Good luck! You've got this! 🚀🔐

---

**Questions? Check APP_STORE_DEPLOYMENT.md for detailed explanations of each step.**
