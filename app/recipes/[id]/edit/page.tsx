import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { RecipeForm } from "@/components/recipes/recipe-form";
import { difficulties, type Difficulty } from "@/lib/recipe";
import { createClient } from "@/lib/supabase/server";

function isRecipeId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

type EditRecipePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Edit recipe · Recipe Guide",
};

export default function EditRecipePage({ params }: EditRecipePageProps) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Edit recipe</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Update a recipe you shared.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading recipe…</p>}>
        <EditRecipeForm params={params} />
      </Suspense>
    </main>
  );
}

async function EditRecipeForm({ params }: EditRecipePageProps) {
  const { id } = await params;
  if (!isRecipeId(id)) notFound();

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect(`/sign-in?next=/recipes/${id}/edit`);
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, title, category, cooking_time, difficulty, ingredients, instructions, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!recipe) notFound();
  if (recipe.user_id !== userId) redirect(`/recipes/${id}`);

  const difficulty = difficulties.includes(recipe.difficulty as Difficulty)
    ? (recipe.difficulty as Difficulty)
    : "easy";

  return (
    <>
      <RecipeForm
        mode="edit"
        recipeId={recipe.id}
        initial={{
          title: recipe.title,
          category: recipe.category,
          cookingTime: recipe.cooking_time,
          difficulty,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
        }}
        submitLabel="Save changes"
        pendingLabel="Saving…"
      />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href={`/recipes/${recipe.id}`} className="underline-offset-4 hover:underline">
          Back to recipe
        </Link>
      </p>
    </>
  );
}
