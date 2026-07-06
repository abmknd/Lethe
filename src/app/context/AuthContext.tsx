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
  // Custom-SMTP send failure. Surfaces as raw "Error sending magic link email"
  // otherwise, which reads like a crash to the user.
  if (lower.includes("error sending") || lower.includes("smtp")) {
    return "We couldn't send your sign-in link just now. Give it a minute and try again.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Wait a minute before requesting another link.";
  }
  // Defensive: only fires if project-level sign-up is toggled off. The app now
  // opens sign-up, so this should not normally appear.
  if (lower.includes("signups not allowed")) {
    return "Sign-up isn't open at the moment. Please try again later.";
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
        // Open sign-up: the cohort is now built from scratch, so a first-time
        // email self-provisions on its first magic-link request and lands on
        // onboarding. Requires "Allow new users to sign up" enabled on the
        // Supabase project; with it off, new emails get "Signups not allowed".
        shouldCreateUser: true,
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
