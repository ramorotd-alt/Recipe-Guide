"use server";

import { redirect } from "next/navigation";

import { readText } from "@/lib/auth";
import { ensureCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function toggleLike(formData: FormData) {
  const recipeId = readText(formData, "recipeId");
  if (!isRecipeId(recipeId)) redirect("/dashboard");

  const supabase = await createClient();
  const profile = await ensureCurrentProfile(supabase);
  if (!profile.ok) redirect(`/sign-in?next=/recipes/${recipeId}`);

  const existing = await supabase
    .from("likes")
    .select("id")
    .eq("recipe_id", recipeId)
    .eq("user_id", profile.userId)
    .maybeSingle();

  if (existing.data) {
    await supabase.from("likes").delete().eq("id", existing.data.id).eq("user_id", profile.userId);
  } else {
    await supabase.from("likes").insert({ user_id: profile.userId, recipe_id: recipeId });
  }

  redirect(`/recipes/${recipeId}`);
}

function isRecipeId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
