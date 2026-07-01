import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Translate raw Supabase auth errors into user-facing copy.
// Relethe runs an invite-only cohort, so unknown emails get a friendlier
// message that points them at the waitlist instead of leaking the raw
// "Signups not allowed for otp" Supabase string.
function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("signups not allowed")) {
    return "We don't recognize this email. If you were invited, double-check it matches your invitation. Otherwise, request access from the home page.";
  }
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithEmail(email: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        // Send the magic link back to a dedicated callback route that
        // establishes the session and forwards to onboarding. Uses the
        // current origin so it works for localhost and each deployed URL.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error ? translateAuthError(error.message) : null };
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  const getAccessToken = useCallback(async (): Promise<string | undefined> => {
    if (session?.access_token) return session.access_token;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? undefined;
  }, [session]);

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, signInWithEmail, signOut, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
