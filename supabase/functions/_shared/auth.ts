// Supabase JWT verification for Edge Function routes.
// Resolves the bearer token to a session userId. Throws AuthError on failure.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

export interface AuthContext {
  userId: string;
  email: string | null;
  token: string;
}

export class AuthError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function requireAuth(req: Request): Promise<AuthContext> {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    throw new AuthError(401, "Missing bearer token.");
  }
  const token = header.slice(7).trim();
  if (!token) throw new AuthError(401, "Empty bearer token.");

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) throw new AuthError(401, "Invalid or expired session.");

  return { userId: data.user.id, email: data.user.email ?? null, token };
}

export function requireSelf(auth: AuthContext, userId: string): void {
  if (auth.userId !== userId) {
    throw new AuthError(403, "Forbidden: not your resource.");
  }
}
