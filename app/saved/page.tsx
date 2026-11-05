import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { RecipeCards } from "@/components/recipes/recipe-cards";
import { SavedResultsSkeleton } from "@/components/skeleton";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Saved · Recipe Guide",
};

const recipeColumns = "id, title, category, ingredients, cooking_time, difficulty, user_id";

export default function SavedPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Saved</h1>
        <p className="max-w-xl text-zinc-600 dark:text-zinc-400">Recipes you liked.</p>
      </div>
      <Suspense fallback={<SavedResultsSkeleton />}>
        <SavedRecipes />
      </Suspense>
    </main>
  );
}

async function SavedRecipes() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/sign-in?next=/saved");
  }

  const likesResult = await supabase
    .from("likes")
    .select("recipe_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (likesResult.error) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Saved recipes could not be loaded.</p>;
  }

  const recipeIds = (likesResult.data ?? []).map((like) => like.recipe_id);
  if (recipeIds.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        You have not liked a recipe yet.{" "}
        <Link href="/dashboard" className="font-medium underline-offset-4 hover:underline">
          Browse recipes
        </Link>
      </p>
    );
  }

  const recipesResult = await supabase.from("recipes").select(recipeColumns).in("id", recipeIds);
  if (recipesResult.error) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Saved recipes could not be loaded.</p>;
  }

  const recipesById = new Map((recipesResult.data ?? []).map((recipe) => [recipe.id, recipe]));
  const recipes = recipeIds.flatMap((id) => {
    const recipe = recipesById.get(id);
    return recipe ? [recipe] : [];
  });
  const authorIds = [...new Set(recipes.map((recipe) => recipe.user_id))];
  const [profilesResult, allLikesResult, commentsResult] = await Promise.all([
    authorIds.length
      ? supabase.from("profiles").select("id, user_name, full_name").in("id", authorIds)
      : Promise.resolve({ data: [] }),
    supabase.from("likes").select("recipe_id").in("recipe_id", recipeIds),
    supabase.from("comments").select("recipe_id").in("recipe_id", recipeIds),
  ]);
  const likeCounts = countByRecipe(allLikesResult.data ?? []);
  const commentCounts = countByRecipe(commentsResult.data ?? []);
  const authors = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));

  return (
    <RecipeCards
      recipes={recipes.map((recipe) => ({
        ...recipe,
        likeCount: likeCounts.get(recipe.id) ?? 0,
        commentCount: commentCounts.get(recipe.id) ?? 0,
      }))}
      authors={authors}
    />
  );
}

function countByRecipe(rows: { recipe_id: string }[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.recipe_id, (counts.get(row.recipe_id) ?? 0) + 1);
  }
  return counts;
}
