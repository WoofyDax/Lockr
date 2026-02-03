# Locket - Supabase Integration Guide

## 📋 Overview
This guide will walk you through integrating Supabase into your Locket app for real-time syncing, authentication, and cloud storage.

---

## 🚀 Step 1: Create Your Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Choose your organization (or create one)
4. Fill in project details:
   - **Name**: `Locket` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

---

## 🔑 Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon in sidebar)
2. Go to **API** section
3. Copy these two values (you'll need them):
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## 📝 Step 3: Create Environment Variables File

1. In your project root (same level as `package.json`), create a file called `.env`
2. Add these lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

> **Important**: Make sure `.env` is in your `.gitignore` file to keep your keys secure!

---

## 🗄️ Step 4: Create Database Tables

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New query"**
3. Copy and paste this ENTIRE SQL script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (User accounts)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- ============================================
-- 2. CAPSULES TABLE (Groups/Time Capsules)
-- ============================================
CREATE TABLE capsules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  global_unlock_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;

-- Policies for capsules
CREATE POLICY "Users can view capsules they're members of"
  ON capsules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM capsule_members
      WHERE capsule_members.capsule_id = capsules.id
      AND capsule_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create capsules"
  ON capsules FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update capsules"
  ON capsules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM capsule_members
      WHERE capsule_members.capsule_id = capsules.id
      AND capsule_members.user_id = auth.uid()
      AND capsule_members.is_admin = true
    )
  );


-- ============================================
-- 3. CAPSULE_MEMBERS TABLE (Who's in each capsule)
-- ============================================
CREATE TABLE capsule_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  UNIQUE(capsule_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE capsule_members ENABLE ROW LEVEL SECURITY;

-- Policies for capsule_members
CREATE POLICY "Users can view members of their capsules"
  ON capsule_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM capsule_members cm
      WHERE cm.capsule_id = capsule_members.capsule_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can add members"
  ON capsule_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM capsule_members
      WHERE capsule_members.capsule_id = capsule_members.capsule_id
      AND capsule_members.user_id = auth.uid()
      AND capsule_members.is_admin = true
    )
  );


-- ============================================
-- 4. MOMENTS TABLE (Photos/Videos in capsules)
-- ============================================
CREATE TABLE moments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
  caption TEXT,
  unlock_time TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;

-- Policies for moments
CREATE POLICY "Users can view moments in their capsules"
  ON moments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM capsule_members
      WHERE capsule_members.capsule_id = moments.capsule_id
      AND capsule_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create moments"
  ON moments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM capsule_members
      WHERE capsule_members.capsule_id = moments.capsule_id
      AND capsule_members.user_id = auth.uid()
    )
  );


-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_capsule_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE capsules
  SET last_active = NOW()
  WHERE id = NEW.capsule_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active when new moment is added
CREATE TRIGGER on_moment_created
  AFTER INSERT ON moments
  FOR EACH ROW
  EXECUTE FUNCTION update_capsule_last_active();

-- Function to automatically add creator as admin member
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO capsule_members (capsule_id, user_id, is_admin)
  VALUES (NEW.id, NEW.created_by, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add creator as admin when capsule is created
CREATE TRIGGER on_capsule_created
  AFTER INSERT ON capsules
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_admin();


-- ============================================
-- 6. INDEXES for better performance
-- ============================================
CREATE INDEX idx_capsule_members_user_id ON capsule_members(user_id);
CREATE INDEX idx_capsule_members_capsule_id ON capsule_members(capsule_id);
CREATE INDEX idx_moments_capsule_id ON moments(capsule_id);
CREATE INDEX idx_moments_unlock_time ON moments(unlock_time);
```

4. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
5. You should see "Success. No rows returned" message

---

## 📦 Step 5: Set Up Storage for Photos/Videos

1. In Supabase dashboard, click **Storage** in sidebar
2. Click **"New bucket"**
3. Name it: `moments`
4. Toggle **Public bucket** to **ON** (so users can view photos)
5. Click **"Create bucket"**

### Set Storage Policies:

1. Click on your `moments` bucket
2. Click **"Policies"** tab
3. Click **"New policy"**
4. Choose **"Custom"** policy
5. Create **Upload Policy**:
   - **Policy name**: `Users can upload moments`
   - **Allowed operation**: INSERT
   - **Policy definition**:
   ```sql
   ((auth.uid())::text = (storage.foldername(name))[1])
   ```
   - Click **"Review"** → **"Save policy"**

6. Create **Read Policy**:
   - Click **"New policy"** again
   - **Policy name**: `Public can view moments`
   - **Allowed operation**: SELECT
   - **Policy definition**:
   ```sql
   true
   ```
   - Click **"Review"** → **"Save policy"**

---

## 🔐 Step 6: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Click on **Email**
3. Make sure **"Enable Email provider"** is toggled **ON**
4. Toggle **"Confirm email"** to **OFF** (for easier testing, you can enable later)
5. Click **"Save"**

---

## 📱 Step 7: Install Supabase Client Library

In your project terminal, run:

```bash
npm install @supabase/supabase-js
```

---

## ⚙️ Step 8: Update Your App Code

The file `/lib/supabase.ts` has already been created for you!

**Just update it with your credentials:**

1. Open `/lib/supabase.ts`
2. Replace `'YOUR_SUPABASE_URL'` with your actual Supabase URL
3. Replace `'YOUR_SUPABASE_ANON_KEY'` with your actual anon key

**OR** (recommended) - it will automatically read from your `.env` file if you created it in Step 3!

---

## 🎯 Step 9: Test Your Connection

1. Restart your dev server (if it's running):
   ```bash
   npm run dev
   ```

2. Open your browser console (F12)
3. Check for any Supabase connection errors
4. Try signing up with a new account in the app

---

## 🔍 Step 10: Verify Everything Works

### Check in Supabase Dashboard:

1. **Authentication** → **Users**: You should see new users appear when they sign up
2. **Table Editor** → **profiles**: User profiles should be created
3. **Table Editor** → **capsules**: New capsules should appear when created
4. **Storage** → **moments**: Photos/videos should appear when uploaded

---

## 🎨 Next Steps - Features You'll Get:

✅ **Real-time sync** - All users see updates instantly  
✅ **Cloud storage** - Photos/videos stored securely  
✅ **Proper authentication** - Secure user accounts  
✅ **Multi-device support** - Same account on phone & desktop  
✅ **No more localStorage** - Data persists forever  
✅ **Invite system** - Share capsules with friends  
✅ **Time-lock enforcement** - Server-side, can't be bypassed  

---

## 🐛 Troubleshooting

### "Invalid API key" error:
- Double-check your `.env` file has the correct values
- Make sure you restart your dev server after adding `.env`

### Can't sign up:
- Check Authentication → Providers → Email is enabled
- Check browser console for specific error messages
- Verify your Supabase project isn't paused (free tier pauses after inactivity)

### Photos not uploading:
- Check Storage → moments bucket exists
- Verify storage policies are set correctly
- Check browser console for permission errors

### Database errors:
- Make sure you ran the ENTIRE SQL script from Step 4
- Check SQL Editor → History to see if any commands failed

---

## 📚 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🎉 You're Ready!

Once you complete all these steps, your Locket app will be fully integrated with Supabase. All your data will be in the cloud, synced in real-time, and accessible from any device!

Let me know if you run into any issues during setup!
