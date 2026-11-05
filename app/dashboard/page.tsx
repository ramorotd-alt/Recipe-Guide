import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { buttonClassName } from "@/components/auth/fields";
import { RecipeSearch } from "@/components/recipes/recipe-search";
import { DashboardResultsSkeleton } from "@/components/skeleton";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard · Recipe Guide",
};

const recipeColumns = "id, title, category, ingredients, cooking_time, difficulty, user_id";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
            Recipes you shared, and recipes from other cooks.
          </p>
        </div>
        <Link href="/recipes/new" className={`${buttonClassName} inline-flex items-center`}>
          Add a recipe
        </Link>
      </section>
      <Suspense fallback={<DashboardResultsSkeleton />}>
        <RecipeLists />
      </Suspense>
    </main>
  );
}

async function RecipeLists() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/sign-in?next=/dashboard");
  }

  const [mineResult, othersResult] = await Promise.all([
    supabase
      .from("recipes")
      .select(recipeColumns)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("recipes")
      .select(recipeColumns)
      .neq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const mine = mineResult.data ?? [];
  const others = othersResult.data ?? [];
  const recipes = [...mine, ...others];
  const authorIds = [...new Set(recipes.map((recipe) => recipe.user_id))];
  const recipeIds = recipes.map((recipe) => recipe.id);
  const [profilesResult, likesResult, commentsResult] = await Promise.all([
    authorIds.length
      ? supabase.from("profiles").select("id, user_name, full_name").in("id", authorIds)
      : Promise.resolve({ data: [] }),
    recipeIds.length
      ? supabase.from("likes").select("recipe_id").in("recipe_id", recipeIds)
      : Promise.resolve({ data: [] }),
    recipeIds.length
      ? supabase.from("comments").select("recipe_id").in("recipe_id", recipeIds)
      : Promise.resolve({ data: [] }),
  ]);
  const likeCounts = countByRecipe(likesResult.data ?? []);
  const commentCounts = countByRecipe(commentsResult.data ?? []);

  return (
    <RecipeSearch
      mine={withActivity(mine, likeCounts, commentCounts)}
      others={withActivity(others, likeCounts, commentCounts)}
      authors={profilesResult.data ?? []}
      mineError={Boolean(mineResult.error)}
      othersError={Boolean(othersResult.error)}
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

function withActivity<T extends { id: string }>(
  recipes: T[],
  likeCounts: Map<string, number>,
  commentCounts: Map<string, number>,
) {
  return recipes.map((recipe) => ({
    ...recipe,
    likeCount: likeCounts.get(recipe.id) ?? 0,
    commentCount: commentCounts.get(recipe.id) ?? 0,
  }));
}
