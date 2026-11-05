import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { authorLabel } from "@/components/recipes/recipe-cards";
import { DeleteRecipeButton } from "@/components/recipes/delete-recipe-button";
import { createClient } from "@/lib/supabase/server";

function isRecipeId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

type RecipePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isRecipeId(id)) return { title: "Recipe · Recipe Guide" };

  const supabase = await createClient();
  const { data } = await supabase.from("recipes").select("title").eq("id", id).maybeSingle();
  return { title: data ? `${data.title} · Recipe Guide` : "Recipe · Recipe Guide" };
}

export default function RecipePage({ params }: RecipePageProps) {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-sm text-zinc-500">Loading recipe…</p>}>
      <RecipeDetail params={params} />
    </Suspense>
  );
}

async function RecipeDetail({ params }: RecipePageProps) {
  const { id } = await params;
  if (!isRecipeId(id)) notFound();

  const supabase = await createClient();
  const [{ data: recipe }, { data: claimsData }] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, title, category, cooking_time, difficulty, ingredients, instructions, user_id")
      .eq("id", id)
      .maybeSingle(),
    supabase.auth.getClaims(),
  ]);

  if (!recipe) notFound();

  const { data: author } = await supabase
    .from("profiles")
    .select("full_name, user_name")
    .eq("id", recipe.user_id)
    .maybeSingle();

  const isOwner = claimsData?.claims?.sub === recipe.user_id;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-500">{recipe.category}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{recipe.title}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {authorLabel(author ?? undefined)} · {recipe.cooking_time} min · {recipe.difficulty}
        </p>
        {isOwner ? (
          <div className="flex items-center gap-4">
            <Link href={`/recipes/${recipe.id}/edit`} className="text-sm font-medium underline-offset-4 hover:underline">
              Edit
            </Link>
            <DeleteRecipeButton id={recipe.id} />
          </div>
        ) : null}
      </div>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Ingredients</h2>
        <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{recipe.ingredients}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{recipe.instructions}</p>
      </section>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/dashboard" className="underline-offset-4 hover:underline">
          Back to dashboard
        </Link>
      </p>
    </main>
  );
}
