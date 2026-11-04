import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { buttonClassName } from "@/components/auth/fields";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard · Recipe Guide",
};

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
            Recipes shared by other cooks.
          </p>
        </div>
        <Link href="/recipes/new" className={`${buttonClassName} inline-flex items-center`}>
          Add a recipe
        </Link>
      </section>
      <Suspense fallback={null}>
        <AddedNotice searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading recipes…</p>}>
        <OtherRecipes />
      </Suspense>
    </main>
  );
}

async function AddedNotice({ searchParams }: { searchParams: Promise<{ added?: string }> }) {
  const params = await searchParams;
  if (params.added !== "1") return null;

  return (
    <p role="status" className="text-sm text-zinc-700 dark:text-zinc-300">
      Your recipe was shared. Other cooks can see it here.
    </p>
  );
}

async function OtherRecipes() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/sign-in?next=/dashboard");
  }

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, category, cooking_time, difficulty, user_id")
    .neq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Recipes could not be loaded.</p>;
  }

  if (!recipes || recipes.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No recipes from other cooks yet.
      </p>
    );
  }

  const authorIds = [...new Set(recipes.map((recipe) => recipe.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, user_name, full_name")
    .in("id", authorIds);
  const authors = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {recipes.map((recipe) => {
        const author = authors.get(recipe.user_id);
        const authorName = author?.full_name || author?.user_name || "Another cook";
        return (
          <li key={recipe.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">{recipe.category}</p>
            <h2 className="mt-1 text-lg font-semibold">{recipe.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{authorName}</p>
            <p className="mt-3 text-sm text-zinc-500">
              {recipe.cooking_time} min · {recipe.difficulty}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
