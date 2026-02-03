import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'lockr_auth_token'
  }
});

// Helper for server calls
export const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-5015c705`;

/**
 * Robust fetch helper for Lockr.
 * TRULY bypasses infrastructure-level JWT verification by using the ANON_KEY for the 
 * Authorization header and passing the real user token in X-Lockr-Token.
 */
let refreshPromise: Promise<any> | null = null;

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const isPublicRoute = path === '/signup' || path === '/health';
  
  // Get current session
  const { data: { session: initialSession } } = await supabase.auth.getSession();
  let session = initialSession;

  const performFetch = async (currentSession: any) => {
    const userToken = currentSession?.access_token;
    const headers: Record<string, string> = { ...((options.headers as any) || {}) };

    /**
     * CRITICAL BYPASS STRATEGY:
     * To prevent the Supabase Gateway from returning "Invalid JWT" before our function even runs,
     * we MUST NOT put a user JWT in the "Authorization" header if the gateway might reject it.
     * Instead, we always use the ANON_KEY for Authorization (which the gateway always accepts),
     * and put the real User JWT in a custom header for our function to verify manually.
     */
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
    
    if (userToken) {
      headers['X-Lockr-Token'] = userToken;
    }

    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${serverUrl}${path}`, {
      ...options,
      headers,
    });
    
    return response;
  };

  try {
    let response = await performFetch(session);

    // If our server code returns 401, it means the token in X-Lockr-Token was invalid or missing
    if (response.status === 401 && !isPublicRoute) {
      console.warn(`[FETCH] 401 for ${path}. Attempting session refresh...`);
      
      // Prevent multiple simultaneous refresh attempts
      if (!refreshPromise) {
        refreshPromise = supabase.auth.refreshSession().then(res => {
          if (res.error) {
            console.error('[FETCH] Refresh error:', res.error);
            // Clear local storage if refresh token is invalid
            if (res.error.message.includes('Refresh Token Not Found') || 
                res.error.message.includes('Invalid Refresh Token')) {
              console.warn('[FETCH] Clearing corrupted session...');
              supabase.auth.signOut();
            }
          }
          return res;
        }).finally(() => {
          refreshPromise = null;
        });
      }
      
      const { data: { session: refreshedSession }, error: refreshError } = await refreshPromise;
      
      if (!refreshError && refreshedSession) {
        console.log(`[FETCH] Refresh successful, retrying ${path}...`);
        response = await performFetch(refreshedSession);
      } else {
        console.error(`[FETCH] Refresh failed for ${path}.`);
        throw new Error('AUTH_EXPIRED');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FETCH] Server error for ${path}:`, errorText);
      
      if (errorText.includes("Invalid JWT") || errorText.includes("INVALID_JWT")) {
        console.warn("[FETCH] Persistent Invalid JWT. Session might be corrupted.");
        throw new Error('INVALID_JWT_PERSISTENT');
      }

      let errorMsg = `Error ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error || errorJson.message || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    return response.json();
  } catch (e: any) {
    console.error(`[FETCH] Critical error for ${path}:`, e.message);
    throw e;
  }
}