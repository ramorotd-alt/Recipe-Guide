"use server";

import { redirect } from "next/navigation";

import { ensureCurrentProfile } from "@/lib/profile";
import { readRecipeForm, validateRecipe, type RecipeFormState } from "@/lib/recipe";
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

  const { error } = await supabase.from("recipes").insert({
    user_id: profile.userId,
    title: parsed.value.title,
    ingredients: parsed.value.ingredients,
    instructions: parsed.value.instructions,
    cooking_time: parsed.value.cookingTime,
    difficulty: parsed.value.difficulty,
    category: parsed.value.category,
  });

  if (error) return { message: "The recipe could not be saved." };

  redirect("/dashboard?added=1");
}
