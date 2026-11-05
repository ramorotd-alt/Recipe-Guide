"use server";

import { redirect } from "next/navigation";

import { readText } from "@/lib/auth";
import { ensureCurrentProfile } from "@/lib/profile";
import {
  readRecipeForm,
  validateRecipe,
  type RecipeFormState,
  type RecipeInput,
} from "@/lib/recipe";
import { createClient } from "@/lib/supabase/server";

export async function createRecipe(
  _state: RecipeFormState | undefined,
  formData: FormData,
): Promise<RecipeFormState> {
  const parsed = validateRecipe(readRecipeForm(formData));
  if (parsed.fieldErrors || !parsed.value) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const profile = await ensureCurrentProfile(supabase);
  if (!profile.ok) return { message: profile.message };

  const { data, error } = await supabase
    .from("recipes")
    .insert({ user_id: profile.userId, ...recipeRow(parsed.value) })
    .select("id")
    .single();

  if (error || !data) return { message: "The recipe could not be saved." };

  redirect(`/recipes/${data.id}`);
}

export async function updateRecipe(
  _state: RecipeFormState | undefined,
  formData: FormData,
): Promise<RecipeFormState> {
  const id = readText(formData, "id");
  if (!isRecipeId(id)) return { message: "This recipe could not be updated." };

  const parsed = validateRecipe(readRecipeForm(formData));
  if (parsed.fieldErrors || !parsed.value) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const profile = await ensureCurrentProfile(supabase);
  if (!profile.ok) return { message: profile.message };

  const { data, error } = await supabase
    .from("recipes")
    .update(recipeRow(parsed.value))
    .eq("id", id)
    .eq("user_id", profile.userId)
    .select("id")
    .maybeSingle();

  if (error || !data) return { message: "This recipe could not be updated." };

  redirect(`/recipes/${id}`);
}

export async function deleteRecipe(formData: FormData) {
  const id = readText(formData, "id");
  if (!isRecipeId(id)) redirect("/dashboard");

  const supabase = await createClient();
  const profile = await ensureCurrentProfile(supabase);
  if (!profile.ok) redirect(`/sign-in?next=/recipes/${id}`);

  const { data, error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", profile.userId)
    .select("id");

  if (error || !data || data.length === 0) redirect(`/recipes/${id}`);

  redirect("/dashboard");
}

function isRecipeId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function recipeRow(value: RecipeInput) {
  return {
    title: value.title,
    ingredients: value.ingredients,
    instructions: value.instructions,
    cooking_time: value.cookingTime,
    difficulty: value.difficulty,
    category: value.category,
  };
}
