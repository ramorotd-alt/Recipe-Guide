import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type AppClient = SupabaseClient<Database>;

export type ProfileResult = { ok: true; userId: string } | { ok: false; message: string };

export function userNameFromEmail(email: string): string {
  const local = (email.split("@")[0] ?? "").toLowerCase();
  const candidate = local.replace(/[^a-z0-9_]/g, "").slice(0, 20);
  return candidate.length >= 2 ? candidate : "member";
}

export function userNameWithSuffix(base: string, userId: string): string {
  const suffix = userId.replace(/-/g, "").slice(0, 8);
  const trimmed = base.slice(0, 30 - suffix.length - 1);
  return `${trimmed}_${suffix}`;
}

export function fullNameFromEmail(email: string): string {
  const local = (email.split("@")[0] ?? "").trim().replace(/\s+/g, " ");
  const name = local.slice(0, 80).trim();
  return name.length >= 1 ? name : "Cook";
}

export async function ensureProfile(
  supabase: AppClient,
  userId: string,
  email: string,
): Promise<ProfileResult> {
  const existing = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (existing.error) return { ok: false, message: "Your profile could not be loaded." };
  if (existing.data) return { ok: true, userId };

  const fullName = fullNameFromEmail(email);
  const baseName = userNameFromEmail(email);
  const first = await insertProfile(supabase, userId, baseName, fullName);
  if (first === "ok" || first === "id") return { ok: true, userId };

  if (first === "name") {
    const second = await insertProfile(
      supabase,
      userId,
      userNameWithSuffix(baseName, userId),
      fullName,
    );
    if (second === "ok" || second === "id") return { ok: true, userId };
  }

  return { ok: false, message: "Your profile could not be saved." };
}

export async function ensureCurrentProfile(supabase: AppClient): Promise<ProfileResult> {
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const email = typeof data?.claims?.email === "string" ? data.claims.email : "";

  if (error || !userId) return { ok: false, message: "Sign in to continue." };
  if (!email) return { ok: false, message: "Your profile could not be saved." };
  return ensureProfile(supabase, userId, email);
}

async function insertProfile(
  supabase: AppClient,
  userId: string,
  userName: string,
  fullName: string,
): Promise<"ok" | "id" | "name" | "other"> {
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    user_name: userName,
    full_name: fullName,
  });

  if (!error) return "ok";
  if (error.code === "23505" && error.message.includes("profiles_pkey")) return "id";
  if (error.code === "23505" && error.message.includes("user_name")) return "name";
  return "other";
}
