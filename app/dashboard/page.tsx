import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { buttonClassName } from "@/components/auth/fields";
import { RecipeCards, type RecipeSummary } from "@/components/recipes/recipe-cards";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard · Recipe Guide",
};

const recipeColumns = "id, title, category, cooking_time, difficulty, user_id";

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
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading recipes…</p>}>
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
  const authorIds = [...new Set([...mine, ...others].map((recipe) => recipe.user_id))];
  const { data: profiles } = authorIds.length
    ? await supabase.from("profiles").select("id, user_name, full_name").in("id", authorIds)
    : { data: [] };
  const authors = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <div className="flex flex-col gap-10">
      <RecipeSection
        title="Your recipes"
        recipes={mine}
        authors={authors}
        error={Boolean(mineResult.error)}
        empty="You have not shared a recipe yet."
      />
      <RecipeSection
        title="Recipes from other cooks"
        recipes={others}
        authors={authors}
        error={Boolean(othersResult.error)}
        empty="No recipes from other cooks yet."
      />
    </div>
  );
}

function RecipeSection({
  title,
  recipes,
  authors,
  error,
  empty,
}: {
  title: string;
  recipes: RecipeSummary[];
  authors: Map<string, { full_name: string | null; user_name: string }>;
  error: boolean;
  empty: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {error ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Recipes could not be loaded.</p>
      ) : recipes.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {empty}
        </p>
      ) : (
        <RecipeCards recipes={recipes} authors={authors} />
      )}
    </section>
  );
}
