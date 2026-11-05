import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { buttonClassName } from "@/components/auth/fields";
import { RecipeSearch } from "@/components/recipes/recipe-search";
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

  return (
    <RecipeSearch
      mine={mine}
      others={others}
      authors={profiles ?? []}
      mineError={Boolean(mineResult.error)}
      othersError={Boolean(othersResult.error)}
    />
  );
}
