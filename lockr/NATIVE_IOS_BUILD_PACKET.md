# Lockr — Native iOS Build Packet (SwiftUI + Supabase)

This document is the single source of truth for rebuilding Lockr as a fully native SwiftUI iOS app using Supabase. All items are verified against the current codebase with file citations.

---

## A) Verified Feature Checklist (CONFIRMED / MISSING / DIFFERS)

| Item | Status | Notes / Difference |
|------|--------|--------------------|
| **Auth: Email/Password** | CONFIRMED | `AuthScreen.tsx` — sign up & login with email + password. |
| **Auth: Phone** | CONFIRMED | UI supports phone (`authMethod === 'phone'`); server supports `phone` in signup (`index.tsx` signup). |
| **Auth: Magic link** | MISSING | Not implemented. |
| **Auth: Session persistence** | CONFIRMED | `lib/supabase.ts`: `persistSession: true`, `storageKey: 'lockr_auth_token'`. |
| **Onboarding: username** | CONFIRMED | Signup requires username; server checks uniqueness via KV `username:${lowerUsername}`. |
| **Onboarding: display_name** | CONFIRMED | Signup sends `displayName`; stored in `user_metadata` and KV `profile:${id}`. |
| **Onboarding: avatar** | CONFIRMED | Optional; signup sends `avatarUrl`; can upload via `/upload` before signup. |
| **Password reset / recovery** | MISSING | No flow in `AuthScreen.tsx` or Edge Function. |
| **Capsules (groups)** | CONFIRMED | Create, list, delete; members; `LockrMain.tsx`, `CreateGroupView.tsx`, Edge `/groups`, `/groups/:id`. |
| **Capsule unlock time** | CONFIRMED | Group has `unlockTimestamp` (and `defaultUnlockTime`); `LockrMain.tsx` `getGroupUnlockTime()`. |
| **Moments (photos/videos)** | CONFIRMED | Post to group; per-moment `unlockTime` = group `unlockTimestamp`; `PhotoPreview.tsx`, Edge `/groups/:id/photos`. |
| **Lock/unlock UI** | CONFIRMED | Group locked if `unlockAt > currentTime`; moment locked if `p.unlockTime > currentTime`; blur + lock icon when locked. |
| **Camera: photo** | CONFIRMED | Tap = photo; `CameraView.tsx` `takePhoto()`. |
| **Camera: video** | CONFIRMED | Hold = record; swipe right to lock recording. |
| **Camera: front/back flip** | CONFIRMED | `isFrontCamera`, `RotateCcw` button. |
| **Camera: mirror button** | CONFIRMED | Mirror toggle (FlipHorizontal icon) added next to flash and flip; toggles preview and captured image/video mirroring when front camera. |
| **Camera: flash/torch** | CONFIRMED | `isFlashOn`, torch on back camera, flash effect on front. |
| **Camera: zoom** | CONFIRMED | Pinch and vertical swipe during record. |
| **Friends** | CONFIRMED | List, suggestions, request, accept/decline; `FriendsView.tsx`, Edge `/friends`, `/friends/request`, `/friends/respond`. |
| **User search** | CONFIRMED | By username/displayName; Edge `/users/search?q=`. |
| **Add members to capsule** | CONFIRMED | `AddMembersView.tsx`, Edge `POST /groups/:id/members`. |
| **Notifications list** | CONFIRMED | `NotificationsView.tsx`, Edge `GET /notifications`. |
| **Notifications: mark all read** | CONFIRMED | Frontend calls `POST /notifications/read`; Edge Function has `POST /make-server-5015c705/notifications/read` (marks all as read in KV). |
| **Settings: profile (name, avatar)** | CONFIRMED | Name + avatar; Settings currently persist to localStorage only for avatar/name; auth metadata + KV profile are source of truth for username. |
| **Settings: theme** | CONFIRMED | Cool/Warm; `ThemeProvider`, `lib/theme.ts`. |
| **Settings: Notifications** | CONFIRMED | Opens Notifications screen (same as bell in header). |
| **Settings: Privacy** | CONFIRMED | Modal with “Searchable by username” toggle; stored in localStorage (`lockr_privacy_searchable`); backend can later enforce. |
| **Settings: Change password** | CONFIRMED | Modal with new + confirm password; calls `supabase.auth.updateUser({ password })`. |
| **Settings: Help Center** | REMOVED | Row removed from Settings. |
| **Settings: Contact Us** | REMOVED | Row removed from Settings. |
| **Settings: About** | CONFIRMED | Keep “About” with version. |
| **Bottom nav** | CONFIRMED | Capsules, Camera, Friends, Profile; `BottomNav.tsx`. |
| **Home filters** | CONFIRMED | All / Locked / Unlocked; `LockrMain.tsx` `homeFilter`. |
| **Group detail: delete (creator only)** | CONFIRMED | `handleDeleteGroup`, Edge checks `group.creatorId !== user.id`. |
| **Storage: upload** | CONFIRMED | Avatars and moments via Edge `POST /upload`; bucket `make-5015c705-assets`. |
| **Realtime** | MISSING | No Supabase realtime subscriptions; all data via Edge Function REST. |

---

## B) Native iOS Screen Map (Final, Corrected)

| Screen | Purpose | Key UI / Behavior |
|--------|---------|-------------------|
| **Auth** | Login / Sign up | Email or Phone, Password; Sign up: Display Name, Username, Avatar (optional). Toggle Login/Sign up. |
| **Home** | Capsule list | Header: LOCKR, refresh, notifications. “New Capsule” card. Filter: All / Locked / Unlocked. List: capsule cards (thumbnail, name, moment count, last active, countdown or “OPEN & VIEWABLE”), sorted locked first then by unlock time. Tap → Group Detail. |
| **Group Detail** | Moments in one capsule | Back, title, Add Members, Delete (creator only). Grid of moments (locked: blur + lock + countdown; unlocked: image, download, author). Floating camera button → Camera. |
| **Create Group** | New capsule | Name, Unlock time (1h / 12h / 24h / 1 week / custom date), Invite friends (search + select). Create. |
| **Add Members** | Add to existing capsule | Search friends, select, Add to capsule. |
| **Camera** | Capture photo/video | Full-screen preview; close; **mirror toggle** (new); flash; flip front/back; tap = photo, hold = video; swipe right to lock recording; zoom (pinch / swipe). |
| **Preview** | Before sending moment | Media preview; caption; overlay text; “SEND TO” or pre-selected group; select capsules; Send. |
| **Friends** | Friends + requests | Search; Results; Pending requests (accept/decline); Suggestions; My Friends. |
| **Notifications** | Inbox | List; “Read All”; empty state “All caught up!”. |
| **Settings (Profile)** | Profile & app settings | Avatar, display name, @username. Theme. Friends list. **Notifications** (in-app prefs). **Privacy** (e.g. search visibility). **Change password.** About (version). **No Help Center, No Contact Us.** Sign out. |

---

## C) Final Supabase Schema (Postgres + KV)

The app currently uses **Supabase Auth** + **Edge Function** + **KV store** (table `kv_store_5015c705`) + **Storage**. There are no direct Postgres tables for app entities (capsules, moments, friends); everything is in the KV table.

### KV store (source: `supabase/functions/server/kv_store.tsx`)

- **Table:** `kv_store_5015c705`
- **Columns:** `key TEXT PRIMARY KEY`, `value JSONB`

### Key patterns (from `supabase/functions/server/index.tsx`)

| Key pattern | Value shape | Purpose |
|-------------|-------------|---------|
| `profile:{userId}` | `{ id, username, displayName, avatarUrl, email?, phone?, createdAt }` | User profile (created at signup). |
| `username:{lowercaseUsername}` | `userId` (string) | Username → user id lookup. |
| `friends:{userId}` | `[friendUserId, ...]` | Friend list. |
| `friend_requests:{userId}` | `[{ id, fromId, fromUsername, timestamp }, ...]` | Incoming requests. |
| `user_groups:{userId}` | `[groupId, ...]` | Groups the user is in. |
| `group:{groupId}` | `{ id, name, creatorId, memberUsernames, memberIds, createdAt, lastActive, defaultUnlockTime, unlockTimestamp }` | Capsule. |
| `group_photos:{groupId}` | `[{ id, url, type, caption, author, authorId, authorUsername, timestamp, unlockTime }, ...]` | Moments (photos/videos). |
| `notification:{userId}:{notificationId}` | `{ id, userId, title, message, timestamp, read, type }` | One notification. |

### Storage (from Edge `index.tsx`)

- **Bucket:** `make-5015c705-assets`
- **Paths:** `avatars/...` (avatars), `capsules/media_....` (moments). Upload via Edge `POST /upload`; URLs returned as signed URLs (TTL 1 year).

### Auth

- Supabase Auth only (email/password, optional phone). No custom profiles table in Postgres; profile data in KV and `auth.users.user_metadata`.

---

## D) RLS Policies (SQL)

The app does **not** use Postgres tables for app data; it uses the Edge Function with the **service role** and the KV table. Therefore:

- **RLS is not used** for capsules, moments, friends, or notifications (all go through the Edge Function and KV).
- **Storage:** The Edge Function uploads with the service role. For a future direct client upload flow you could add Storage policies; current design uses Edge only.

If you later migrate to Postgres tables (e.g. `profiles`, `capsules`, `capsule_members`, `moments`), use the schema and RLS from `SUPABASE_SETUP.md` and ensure policies match the Edge logic (e.g. “users see only their groups/moments”). For the **current** native app, no RLS changes are required for app data; only ensure the KV table and Storage bucket exist and the Edge Function has the service role.

---

## E) Edge Functions List (Names, Purpose, Triggers)

| Name | Purpose | Trigger / Called from |
|------|---------|------------------------|
| **server** (folder `supabase/functions/server/`) | Single Hono app: auth proxy (signup), friends, groups, moments, upload, notifications. | Client (web/iOS) via `fetchWithAuth(path)` to `https://{project}.supabase.co/functions/v1/make-server-5015c705` + path. |

**Routes (path prefix may be `/make-server-5015c705` depending on deployment; client currently uses paths *without* this prefix, e.g. `/groups`. If iOS gets 404, use paths with prefix.)**

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` or `/make-server-5015c705/health` | Health check. |
| POST | `/signup` or `/make-server-5015c705/signup` | Sign up (email/phone, password, username, displayName, avatarUrl). |
| GET | `/friends` | Friends list + requests. |
| GET | `/friends/suggestions` | Suggestions. |
| POST | `/friends/request` | Send friend request (body: `targetUsername`). |
| POST | `/friends/respond` | Accept/decline (body: `requestId`, `action`). |
| GET | `/users/search?q=` | Search users. |
| GET | `/groups` | User’s groups (with photos). |
| POST | `/groups` | Create group (body: name, members, defaultUnlockTime, customUnlockTimestamp). |
| DELETE | `/groups/:id` | Delete group (creator only). |
| POST | `/groups/:id/photos` | Add moment (body: url, type, caption, mirrored). |
| POST | `/groups/:id/members` | Add members (body: usernames). |
| POST | `/upload` | FormData: file, path → Storage upload → signed URL. |
| GET | `/notifications` | List notifications. |
| POST | `/notifications/read` or `/make-server-5015c705/notifications/read` | Mark all notifications as read (updates KV `notification:{userId}:*` to `read: true`). |

**Auth:** All routes except signup/health use `getAuthUser(c)` which reads `X-Lockr-Token` (user JWT). Client sends `Authorization: Bearer {ANON_KEY}` and `X-Lockr-Token: {userAccessToken}`.

---

## F) iOS Implementation Notes

### Supabase configuration

- **URL:** `https://esrodzhmdubdnoicecfr.supabase.co`
- **Anon key (public):** Use for client only.  
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcm9kemhtZHViZG5vaWNlY2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDM3ODksImV4cCI6MjA4NTMxOTc4OX0.YLlzxwuaSrvjC9DD9v4u9DWCTnBma8YqaWO--Tr2p6k`
- **Do not** ship the service_role or secret key in the app. Use anon key only.

### Auth

- Session: persist (e.g. Keychain), auto-refresh, same semantics as web (`storageKey` equivalent).
- All API calls: `Authorization: Bearer {anon_key}`, `X-Lockr-Token: {user_access_token}`. On 401, refresh session and retry once.

### API base URL

- `https://esrodzhmdubdnoicecfr.supabase.co/functions/v1/make-server-5015c705`
- Paths: `/signup`, `/groups`, `/groups/:id/photos`, `/friends`, `/notifications`, etc. (if 404, try prefix `/make-server-5015c705` before each path).

### Permissions (Info.plist)

- Camera usage.
- Microphone (for video).
- Photo Library if you allow picking from library.

### Camera / video

- Mirror button: same style as flash and flip; toggles mirroring of preview (and optionally saved image/video when front camera).
- Front camera preview: mirror (scaleX -1) so it looks natural.
- Video: prefer MP4; fallback WebM. Same MIME priority as in `CameraView.tsx` (mp4, webm vp9/vp8).

### Push notifications

- Not implemented in backend. Plan: register device with Supabase or your own service; Edge Function or Supabase Edge can send push when e.g. capsule unlocks or friend request (requires FCM/APNs setup).

### Notifications (in-app)

- Notifications screen and “Read All” are implemented; backend `POST /notifications/read` (or `/make-server-5015c705/notifications/read`) marks all as read.

### Privacy

- No backend model yet. Options: add KV key `privacy:{userId}` with e.g. `{ searchVisible: true }`, or add a small Postgres table later. Native app can add a “Who can find you” toggle and call a new Edge route to save it.

### Change password

- Use Supabase Swift client: `supabase.auth.update(user: UserAttributes(password: newPassword))` or trigger “reset password” email. No Edge route required.

### Remove from Settings

- Do not show “Help Center” or “Contact Us” rows.

---

## G) Open Questions

1. **Edge path prefix:** Client uses `/groups` etc.; Edge defines `/make-server-5015c705/groups`. Confirm how the function is actually deployed (path after function name). If 404 on iOS, use `/make-server-5015c705/...` for all paths.
2. **Mark notifications read:** Implemented; Edge `POST /make-server-5015c705/notifications/read` marks all notifications for the user as read.
3. **Privacy:** Stored in localStorage on web; backend has no key yet; can add KV `privacy:{userId}` when enforcing search visibility.
4. **hasUnreadNotifications:** Currently not set from API. Options: derive from `GET /notifications` (any `read: false`) or add a small “unread count” endpoint.

---

## Time-Lock / Unlock Rule Set (for native app)

- **Group unlock:**  
  `groupUnlockTime = group.unlockTimestamp ?? max(moment.unlockTime)` (fallback for legacy).  
  `isGroupLocked = (groupUnlockTime > nowMs)`.
- **Moment unlock:**  
  `isMomentUnlocked = (moment.unlockTime <= nowMs)`.  
  Each moment’s `unlockTime` is set by the server to the group’s `unlockTimestamp` when the moment is created (see Edge `groups/:id/photos`).
- **UI:** When locked: blur media, show lock icon and countdown. When unlocked: show media, optional download, author. Use a 1s timer to refresh “now” for countdowns.
- **Enforcement:** Purely UI + Edge: server returns moment URLs to members; lock/unlock is not enforced by Storage RLS. Native app must hide content until `unlockTime <= now`.

---

## File Citations (key behaviors)

| Behavior | File(s) |
|----------|--------|
| Supabase client, fetchWithAuth, serverUrl | `lib/supabase.ts` |
| Project id & anon key | `utils/supabase/info.tsx` |
| Auth screen, sign up/login, avatar upload | `components/AuthScreen.tsx` |
| Session check, group fetch, views, filters, unlock logic | `components/LockrMain.tsx` |
| Camera capture, flash, flip, zoom, record lock | `components/CameraView.tsx` |
| Preview, caption, overlay, send to groups | `components/PhotoPreview.tsx` |
| Create group, unlock options, invite friends | `components/CreateGroupView.tsx` |
| Add members to group | `components/AddMembersView.tsx` |
| Friends, requests, search | `components/FriendsView.tsx` |
| Notifications list, mark all read | `components/NotificationsView.tsx` |
| Settings, theme, profile, “coming soon” rows | `components/SettingsView.tsx` |
| Bottom nav | `components/BottomNav.tsx` |
| Edge routes, auth, KV, upload, notifications | `supabase/functions/server/index.tsx` |
| KV get/set/getByPrefix | `supabase/functions/server/kv_store.tsx` |
| Storage bucket name | `supabase/functions/server/index.tsx` (BUCKET_NAME) |
| Schema (reference only; not used for app data) | `SUPABASE_SETUP.md` |

---

*End of Native iOS Build Packet. Use this with the Supabase keys you provided (anon only in the app) and the same Edge base URL and path convention as the web client.*
