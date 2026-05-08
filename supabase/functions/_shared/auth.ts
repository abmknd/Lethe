// Supabase JWT verification + trial users.id resolution for Edge Function routes.
// Verifies the bearer token, then resolves (or provisions on first login) the
// trial users.id (TEXT) keyed off auth.users.id (UUID via users.auth_id).

import { createClient } from "npm:@supabase/supabase-js@2";
import { repository } from "./repository.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

export interface AuthContext {
  authId: string;   // Supabase Auth UUID (auth.users.id)
  userId: string;   // Trial users.id (TEXT) — resolved via users.auth_id
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

  const authId = data.user.id;
  const email = data.user.email ?? null;
  const name = (data.user.user_metadata?.name as string | undefined)
    ?? email?.split("@")[0]
    ?? "New user";

  const userId = await repository.findOrCreateUserByAuthId(authId, name, email);

  return { authId, userId, email, token };
}

export function requireSelf(auth: AuthContext, userId: string): void {
  if (auth.userId !== userId) {
    throw new AuthError(403, "Forbidden: not your resource.");
  }
}
