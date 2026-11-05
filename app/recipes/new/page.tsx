import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { RecipeForm } from "@/components/recipes/recipe-form";
import { RecipeFormSkeleton } from "@/components/skeleton";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Add a recipe · Recipe Guide",
};

export default function NewRecipePage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Add a recipe</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Share a recipe with other cooks. It shows up on their dashboards.
        </p>
      </div>
      <Suspense fallback={<RecipeFormSkeleton />}>
        <SignedInRecipeForm />
      </Suspense>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/dashboard" className="underline-offset-4 hover:underline">
          Back to dashboard
        </Link>
      </p>
    </main>
  );
}

async function SignedInRecipeForm() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) {
    redirect("/sign-in?next=/recipes/new");
  }

  return (
    <RecipeForm mode="create" submitLabel="Share recipe" pendingLabel="Sharing…" />
  );
}
