"use server";

import { redirect } from "next/navigation";

import { readText } from "@/lib/auth";
import { readCommentBody, validateCommentBody, type CommentFormState } from "@/lib/comment";
import { ensureCurrentProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function createComment(
  _state: CommentFormState | undefined,
  formData: FormData,
): Promise<CommentFormState> {
  const recipeId = readText(formData, "recipeId");
  if (!isRecipeId(recipeId)) return { message: "This comment could not be posted." };

  const body = readCommentBody(formData);
  const fieldErrors = validateCommentBody(body);
  if (fieldErrors) return { fieldErrors };

  const supabase = await createClient();
  const profile = await ensureCurrentProfile(supabase);
  if (!profile.ok) redirect(`/sign-in?next=/recipes/${recipeId}`);

  const { error } = await supabase.from("comments").insert({
    user_id: profile.userId,
    recipe_id: recipeId,
    body,
  });

  if (error) return { message: "This comment could not be posted." };

  redirect(`/recipes/${recipeId}`);
}

export async function updateComment(
  _state: CommentFormState | undefined,
  formData: FormData,
): Promise<CommentFormState> {
  const recipeId = readText(formData, "recipeId");
  const commentId = readText(formData, "commentId");
  if (!isRecipeId(recipeId) || !isRecipeId(commentId)) {
    return { message: "This comment could not be updated." };
  }

  const body = readCommentBody(formData);
  const fieldErrors = validateCommentBody(body);
  if (fieldErrors) return { fieldErrors };

  const supabase = await createClient();
  const profile = await ensureCurrentProfile(supabase);
  if (!profile.ok) redirect(`/sign-in?next=/recipes/${recipeId}`);

  const { data, error } = await supabase
    .from("comments")
    .update({ body })
    .eq("id", commentId)
    .eq("recipe_id", recipeId)
    .eq("user_id", profile.userId)
    .select("id")
    .maybeSingle();

  if (error || !data) return { message: "This comment could not be updated." };

  redirect(`/recipes/${recipeId}`);
}

export async function deleteComment(formData: FormData) {
  const recipeId = readText(formData, "recipeId");
  const commentId = readText(formData, "commentId");
  if (!isRecipeId(recipeId) || !isRecipeId(commentId)) redirect("/dashboard");

  const supabase = await createClient();
  const profile = await ensureCurrentProfile(supabase);
  if (!profile.ok) redirect(`/sign-in?next=/recipes/${recipeId}`);

  await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("recipe_id", recipeId)
    .eq("user_id", profile.userId);

  redirect(`/recipes/${recipeId}`);
}

function isRecipeId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
