#!/bin/bash

# Lockr iOS Deployment Helper Script
# Makes building and deploying to iOS easier

set -e  # Exit on error

echo "🔐 Lockr iOS Deployment Helper"
echo "================================"
echo ""

# Check if Capacitor is installed
if ! command -v cap &> /dev/null; then
    echo "⚠️  Capacitor CLI not found. Installing..."
    npm install -g @capacitor/cli
fi

# Function to display menu
show_menu() {
    echo "What would you like to do?"
    echo ""
    echo "1) 🆕 Initial Setup (first time only)"
    echo "2) 🔄 Sync Changes (after code updates)"
    echo "3) 📱 Open in Xcode"
    echo "4) 🏗️  Build & Open (build + sync + open)"
    echo "5) 🧹 Clean & Rebuild"
    echo "6) ℹ️  Check Status"
    echo "7) 🚀 Prepare for App Store"
    echo "8) ❌ Exit"
    echo ""
    read -p "Enter choice [1-8]: " choice
}

# Initial setup
initial_setup() {
    echo "🆕 Running initial iOS setup..."
    echo ""
    
    # Install dependencies
    echo "📦 Installing Capacitor dependencies..."
    npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/camera @capacitor/splash-screen @capacitor/status-bar
    
    # Build web app
    echo "🏗️  Building web app..."
    npm run build
    
    # Add iOS platform
    echo "📱 Adding iOS platform..."
    npx cap add ios
    
    # Sync
    echo "🔄 Syncing..."
    npx cap sync ios
    
    echo ""
    echo "✅ Initial setup complete!"
    echo "Next step: Run option 3 to open in Xcode and configure signing"
    echo ""
}

# Sync changes
sync_changes() {
    echo "🔄 Syncing changes to iOS..."
    echo ""
    
    # Build web app
    echo "🏗️  Building web app..."
    npm run build
    
    # Sync to iOS
    echo "📱 Syncing to iOS..."
    npx cap sync ios
    
    echo ""
    echo "✅ Sync complete!"
    echo "Xcode will auto-reload, or rebuild manually (Cmd+B)"
    echo ""
}

# Open in Xcode
open_xcode() {
    echo "📱 Opening Xcode..."
    
    if [ ! -d "ios" ]; then
        echo "❌ iOS folder not found. Run initial setup first (option 1)"
        return
    fi
    
    npx cap open ios
    echo "✅ Xcode should open now"
}

# Build and open
build_and_open() {
    echo "🏗️  Building, syncing, and opening..."
    sync_changes
    open_xcode
}

# Clean and rebuild
clean_rebuild() {
    echo "🧹 Cleaning and rebuilding..."
    echo ""
    
    read -p "⚠️  This will delete and recreate the iOS folder. Continue? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Cancelled."
        return
    fi
    
    echo "🗑️  Removing iOS folder..."
    rm -rf ios
    
    echo "🗑️  Cleaning web build..."
    rm -rf dist
    
    echo "🏗️  Rebuilding..."
    initial_setup
    
    echo "✅ Clean rebuild complete!"
}

# Check status
check_status() {
    echo "ℹ️  Lockr iOS Status"
    echo "===================="
    echo ""
    
    # Check if iOS folder exists
    if [ -d "ios" ]; then
        echo "✅ iOS platform: Added"
    else
        echo "❌ iOS platform: Not added (run option 1)"
    fi
    
    # Check if dist folder exists
    if [ -d "dist" ]; then
        echo "✅ Web build: Built"
    else
        echo "❌ Web build: Not built"
    fi
    
    # Check Capacitor config
    if [ -f "capacitor.config.ts" ]; then
        echo "✅ Capacitor config: Found"
        echo ""
        echo "App ID: $(grep 'appId:' capacitor.config.ts | cut -d"'" -f2)"
        echo "App Name: $(grep 'appName:' capacitor.config.ts | cut -d"'" -f2)"
    else
        echo "❌ Capacitor config: Not found"
    fi
    
    echo ""
}

# Prepare for App Store
prepare_app_store() {
    echo "🚀 Preparing for App Store submission..."
    echo ""
    
    echo "Running pre-submission checklist..."
    echo ""
    
    # Build
    echo "1/5 Building production app..."
    npm run build
    
    # Sync
    echo "2/5 Syncing to iOS..."
    npx cap sync ios
    
    # Check for required files
    echo "3/5 Checking required files..."
    
    if [ ! -f "ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json" ]; then
        echo "⚠️  Warning: App icon may not be set"
    else
        echo "✅ App icon found"
    fi
    
    # Version check
    echo "4/5 Current version info:"
    if [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
        echo "Check version in Xcode: General > Identity > Version"
    fi
    
    echo "5/5 Opening in Xcode..."
    npx cap open ios
    
    echo ""
    echo "✅ Pre-submission complete!"
    echo ""
    echo "📋 Next steps in Xcode:"
    echo "1. Verify Bundle Identifier is unique"
    echo "2. Set version to 1.0.0, build to 1"
    echo "3. Select 'Any iOS Device (arm64)'"
    echo "4. Product > Archive"
    echo ""
    echo "📚 See APP_STORE_DEPLOYMENT.md for full guide"
    echo ""
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1)
            initial_setup
            ;;
        2)
            sync_changes
            ;;
        3)
            open_xcode
            ;;
        4)
            build_and_open
            ;;
        5)
            clean_rebuild
            ;;
        6)
            check_status
            ;;
        7)
            prepare_app_store
            ;;
        8)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-8."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
