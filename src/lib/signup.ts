import { supabase } from "./supabase";

export type SignupSource = "hero" | "signup" | "diagnostic" | "founding";

export interface SignupInput {
  email: string;
  source: SignupSource;
  name?: string;
  handle?: string;
}

export type SignupResult =
  | { status: "created"; email: string }
  | { status: "duplicate"; email: string }
  | { status: "error" };

export async function signup(input: SignupInput): Promise<SignupResult> {
  const { data, error } = await supabase.functions.invoke<SignupResult>("signup", {
    body: input,
  });
  if (error || !data) return { status: "error" };
  return data;
}
