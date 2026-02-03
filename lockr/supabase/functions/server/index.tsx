import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.48.1";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const BUCKET_NAME = "make-5015c705-assets";

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Client-Info", "X-Lockr-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const getAuthUser = async (c: any) => {
  const token = c.req.header('X-Lockr-Token');
  if (!token || token === 'undefined' || token === 'null' || token === Deno.env.get('SUPABASE_ANON_KEY')) return null;
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error) return null;
    return user;
  } catch (err) {
    return null;
  }
};

const sendNotification = async (userId: string, title: string, message: string, type: string = 'info') => {
  const id = Math.random().toString(36).substring(7);
  const notification = { id, userId, title, message, timestamp: Date.now(), read: false, type };
  await kv.set(`notification:${userId}:${id}`, notification);
};

// --- ROUTES ---

app.get("/make-server-5015c705/health", (c) => c.json({ status: "ok" }));

app.post("/make-server-5015c705/signup", async (c) => {
  try {
    const { email, password, username, displayName, phone, avatarUrl } = await c.req.json();
    if (!username) return c.json({ error: 'Username is required' }, 400);
    const lowerUsername = username.toLowerCase();
    const existingUserId = await kv.get(`username:${lowerUsername}`);
    if (existingUserId) return c.json({ error: 'Username is already taken' }, 400);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email || undefined,
      phone: phone || undefined,
      password: password,
      user_metadata: { name: displayName, username: username, avatar_url: avatarUrl },
      email_confirm: true,
      phone_confirm: true
    });
    if (error) return c.json({ error: error.message }, 400);
    if (data.user) {
      const profile = { id: data.user.id, username, displayName, avatarUrl, email: data.user.email, phone: data.user.phone, createdAt: new Date().toISOString() };
      await kv.set(`profile:${data.user.id}`, profile);
      await kv.set(`username:${lowerUsername}`, data.user.id);
      return c.json({ user: data.user, profile });
    }
    return c.json({ error: "User creation failed" }, 400);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-5015c705/friends", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized', message: 'Invalid JWT' }, 401);
  const friends = await kv.get(`friends:${user.id}`) || [];
  const requests = await kv.get(`friend_requests:${user.id}`) || [];
  const friendProfiles = await Promise.all(friends.map((id: string) => kv.get(`profile:${id}`)));
  const requestProfiles = await Promise.all(requests.map(async (req: any) => ({ ...req, profile: await kv.get(`profile:${req.fromId}`) })));
  return c.json({ friends: friendProfiles.filter(Boolean), requests: requestProfiles.filter(r => r.profile) });
});

app.get("/make-server-5015c705/friends/suggestions", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  // Just return some random profiles that aren't friends
  const profiles = await kv.getByPrefix(`profile:`) || [];
  const friendIds = await kv.get(`friends:${user.id}`) || [];
  const suggestions = profiles
    .filter((p: any) => p.id !== user.id && !friendIds.includes(p.id))
    .slice(0, 5);
  return c.json({ suggestions });
});

app.post("/make-server-5015c705/friends/request", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const { targetUsername } = await c.req.json();
  const targetId = await kv.get(`username:${targetUsername.toLowerCase()}`);
  if (!targetId) return c.json({ error: 'User not found' }, 404);
  
  const requests = await kv.get(`friend_requests:${targetId}`) || [];
  if (requests.some((r: any) => r.fromId === user.id)) return c.json({ error: 'Request already sent' });
  
  const newRequest = {
    id: Math.random().toString(36).substring(7),
    fromId: user.id,
    fromUsername: user.user_metadata.username,
    timestamp: Date.now()
  };
  
  await kv.set(`friend_requests:${targetId}`, [...requests, newRequest]);
  await sendNotification(targetId, "New Friend Request", `@${user.user_metadata.username} wants to be friends!`, 'friend_request');
  return c.json({ success: true });
});

app.post("/make-server-5015c705/friends/respond", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const { requestId, action } = await c.req.json();
  const requests = await kv.get(`friend_requests:${user.id}`) || [];
  const request = requests.find((r: any) => r.id === requestId);
  if (!request) return c.json({ error: 'Request not found' }, 404);
  
  if (action === 'accept') {
    const userFriends = await kv.get(`friends:${user.id}`) || [];
    const senderFriends = await kv.get(`friends:${request.fromId}`) || [];
    
    await kv.set(`friends:${user.id}`, Array.from(new Set([...userFriends, request.fromId])));
    await kv.set(`friends:${request.fromId}`, Array.from(new Set([...senderFriends, user.id])));
    
    await sendNotification(request.fromId, "Friend Request Accepted", `@${user.user_metadata.username} accepted your request!`, 'friend_accept');
  }
  
  await kv.set(`friend_requests:${user.id}`, requests.filter((r: any) => r.id !== requestId));
  return c.json({ success: true });
});

app.get("/make-server-5015c705/users/search", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const q = c.req.query('q')?.toLowerCase() || '';
  if (!q) return c.json({ users: [] });
  
  const profiles = await kv.getByPrefix(`profile:`) || [];
  const friends = await kv.get(`friends:${user.id}`) || [];
  
  const results = profiles
    .filter((p: any) => p.id !== user.id && (p.username.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q)))
    .map((p: any) => ({
      ...p,
      isFriend: friends.includes(p.id)
    }))
    .slice(0, 10);
    
  return c.json({ users: results });
});

app.get("/make-server-5015c705/groups", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const groupIds = await kv.get(`user_groups:${user.id}`) || [];
  const groups = await Promise.all(groupIds.map(async (id: string) => {
    const group = await kv.get(`group:${id}`);
    if (!group) return null;
    const photos = await kv.get(`group_photos:${id}`) || [];
    return { ...group, photos };
  }));
  return c.json({ groups: groups.filter(Boolean) });
});

app.post("/make-server-5015c705/groups", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const { name, members, defaultUnlockTime, customUnlockTimestamp } = await c.req.json(); 
  if (!name) return c.json({ error: 'Name required' }, 400);
  const groupId = Math.random().toString(36).substring(7);
  const memberIds = await Promise.all(members.map(async (uname: string) => await kv.get(`username:${uname.toLowerCase()}`)));
  const allParticipantIds = Array.from(new Set([user.id, ...memberIds.filter(Boolean)]));
  const defaultDuration = defaultUnlockTime || 3600000;
  const group = {
    id: groupId,
    name,
    creatorId: user.id,
    memberUsernames: members,
    memberIds: allParticipantIds,
    createdAt: new Date().toISOString(),
    lastActive: 'Just now',
    defaultUnlockTime: defaultDuration,
    unlockTimestamp: customUnlockTimestamp || (Date.now() + defaultDuration) // Fixed unlock time for all photos
  };
  await kv.set(`group:${groupId}`, group);
  for (const pid of allParticipantIds) {
    const current = await kv.get(`user_groups:${pid}`) || [];
    await kv.set(`user_groups:${pid}`, [...current, groupId]);
    if (pid !== user.id) await sendNotification(pid, "New Capsule", `You were added to "${name}"!`, 'group_added');
  }
  return c.json({ group: { ...group, photos: [] } });
});

app.delete("/make-server-5015c705/groups/:id", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const groupId = c.req.param('id');
  const group = await kv.get(`group:${groupId}`);
  if (!group) return c.json({ error: 'Group not found' }, 404);
  if (group.creatorId !== user.id) return c.json({ error: 'Only the creator can delete this capsule' }, 403);
  
  // Remove from all members' indices
  for (const mid of group.memberIds) {
    const current = await kv.get(`user_groups:${mid}`) || [];
    await kv.set(`user_groups:${mid}`, current.filter((id: string) => id !== groupId));
  }
  
  await kv.del(`group:${groupId}`);
  await kv.del(`group_photos:${groupId}`);
  return c.json({ success: true });
});

app.post("/make-server-5015c705/groups/:id/photos", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const groupId = c.req.param('id');
  const { url, type, caption, unlockTime } = await c.req.json();
  const group = await kv.get(`group:${groupId}`);
  if (!group) return c.json({ error: 'Group not found' }, 404);
  const photo = {
    id: Math.random().toString(36).substring(7),
    url, type, caption,
    author: user.user_metadata.name || user.email,
    authorId: user.id,
    authorUsername: user.user_metadata.username,
    timestamp: Date.now(),
    unlockTime: group.unlockTimestamp || unlockTime || (Date.now() + (group.defaultUnlockTime || 3600000))
  };
  const photos = await kv.get(`group_photos:${groupId}`) || [];
  await kv.set(`group_photos:${groupId}`, [photo, ...photos]);
  group.lastActive = 'Just now';
  await kv.set(`group:${groupId}`, group);
  for (const mid of group.memberIds) {
    if (mid !== user.id) await sendNotification(mid, "New Locked Photo", `A new photo was added to "${group.name}"`, 'photo_added');
  }
  return c.json({ photo });
});

app.post("/make-server-5015c705/groups/:id/members", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const groupId = c.req.param('id');
  const { usernames } = await c.req.json();
  
  const group = await kv.get(`group:${groupId}`);
  if (!group) return c.json({ error: 'Group not found' }, 404);

  // Resolve new usernames
  const newMemberIds = await Promise.all(usernames.map(async (uname: string) => await kv.get(`username:${uname.toLowerCase()}`)));
  const validNewMemberIds = newMemberIds.filter(id => id && !group.memberIds.includes(id));
  
  if (validNewMemberIds.length === 0) return c.json({ message: 'No new members to add' });

  group.memberIds = [...group.memberIds, ...validNewMemberIds];
  group.memberUsernames = [...group.memberUsernames, ...usernames];
  await kv.set(`group:${groupId}`, group);

  // Update indices for new members
  for (const mid of validNewMemberIds) {
    const current = await kv.get(`user_groups:${mid}`) || [];
    if (!current.includes(groupId)) {
      await kv.set(`user_groups:${mid}`, [...current, groupId]);
      await sendNotification(mid, "Added to Capsule", `You were added to "${group.name}"`, 'group_added');
    }
  }

  return c.json({ success: true, memberCount: group.memberIds.length });
});

app.post("/make-server-5015c705/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;
    if (!file || !path) return c.json({ error: 'Missing file or path' }, 400);
    const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data: signedData, error: signedError } = await supabaseAdmin.storage.from(BUCKET_NAME).createSignedUrl(path, 31536000);
    if (signedError) throw signedError;
    return c.json({ url: signedData.signedUrl, path });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.get("/make-server-5015c705/notifications", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const notifications = await kv.getByPrefix(`notification:${user.id}:`) || [];
  return c.json({ notifications: notifications.sort((a: any, b: any) => b.timestamp - a.timestamp) });
});

app.post("/make-server-5015c705/notifications/read", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const prefix = `notification:${user.id}:`;
  const notifications = await kv.getByPrefix(prefix) || [];
  for (const n of notifications) {
    if (n && !n.read) {
      const key = `${prefix}${n.id}`;
      await kv.set(key, { ...n, read: true });
    }
  }
  return c.json({ success: true });
});

Deno.serve(app.fetch);