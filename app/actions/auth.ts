"use server";

import { redirect } from "next/navigation";

import {
  getRequestOrigin,
  readText,
  safeNextPath,
  validateEmail,
  validatePassword,
  type AuthFormState,
} from "@/lib/auth";
import { ensureProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function signIn(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readText(formData, "email").trim();
  const password = readText(formData, "password");
  const nextPath = safeNextPath(readText(formData, "next"), "/dashboard");
  const emailError = validateEmail(email);

  if (emailError || password.length === 0) {
    return {
      fieldErrors: {
        email: emailError,
        password: password.length === 0 ? "Enter your password." : undefined,
      },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const unconfirmed = error.message.toLowerCase().includes("email not confirmed");
    return {
      message: unconfirmed
        ? "Confirm your email before signing in."
        : "Email or password is incorrect.",
    };
  }

  const profileError = await saveProfile(supabase, data.user?.id, data.user?.email);
  if (profileError) return { message: profileError };

  redirect(nextPath);
}

export async function signUp(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readText(formData, "email").trim();
  const password = readText(formData, "password");
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError || passwordError) {
    return { fieldErrors: { email: emailError, password: passwordError } };
  }

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { message: error.message };
  }

  if (!data.session) {
    return { message: "Check your email to confirm your account." };
  }

  const profileError = await saveProfile(supabase, data.user?.id, data.user?.email);
  if (profileError) return { message: profileError };

  redirect("/dashboard");
}

async function saveProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | undefined,
  email: string | undefined,
): Promise<string | undefined> {
  if (!userId || !email) return "Your profile could not be saved.";
  const profile = await ensureProfile(supabase, userId, email);
  return profile.ok ? undefined : profile.message;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
