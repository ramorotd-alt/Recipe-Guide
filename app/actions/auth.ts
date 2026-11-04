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
import { createClient } from "@/lib/supabase/server";

export async function signIn(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readText(formData, "email").trim();
  const password = readText(formData, "password");
  const nextPath = safeNextPath(readText(formData, "next"));
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
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const unconfirmed = error.message.toLowerCase().includes("email not confirmed");
    return {
      message: unconfirmed
        ? "Confirm your email before signing in."
        : "Email or password is incorrect.",
    };
  }

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

  redirect("/");
}

export async function requestPasswordReset(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readText(formData, "email").trim();
  const emailError = validateEmail(email);
  if (emailError) {
    return { fieldErrors: { email: emailError } };
  }

  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password/update`,
  });

  if (error) {
    return { message: "Could not send the reset email. Try again in a minute." };
  }

  return { message: "If an account exists for that email, a reset link is on the way." };
}

export async function updatePassword(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const password = readText(formData, "password");
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { fieldErrors: { password: passwordError } };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { message: "This reset link is no longer valid. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { message: error.message };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
