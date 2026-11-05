import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { authorLabel } from "@/components/recipes/recipe-cards";
import { DeleteRecipeButton } from "@/components/recipes/delete-recipe-button";
import { RecipeComments } from "@/components/recipes/recipe-comments";
import { RecipeLikes } from "@/components/recipes/recipe-likes";
import { RecipeDetailLoading } from "@/components/skeleton";
import { commentWasEdited, commentWhen } from "@/lib/comment";
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
    <Suspense fallback={<RecipeDetailLoading />}>
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

  const userId = claimsData?.claims?.sub ?? null;
  const [authorResult, likesResult, mineLikeResult, commentsResult] = await Promise.all([
    supabase.from("profiles").select("full_name, user_name").eq("id", recipe.user_id).maybeSingle(),
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("recipe_id", recipe.id),
    userId
      ? supabase.from("likes").select("id").eq("recipe_id", recipe.id).eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("comments")
      .select("id, body, created_at, updated_at, user_id")
      .eq("recipe_id", recipe.id)
      .order("created_at", { ascending: true }),
  ]);

  const comments = commentsResult.data ?? [];
  const commentAuthorIds = [...new Set(comments.map((comment) => comment.user_id))];
  const { data: commentProfiles } = commentAuthorIds.length
    ? await supabase.from("profiles").select("id, user_name, full_name").in("id", commentAuthorIds)
    : { data: [] };
  const commentAuthors = new Map((commentProfiles ?? []).map((profile) => [profile.id, profile]));
  const isOwner = userId === recipe.user_id;
  const signInHref = `/sign-in?next=/recipes/${recipe.id}`;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-500">{recipe.category}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{recipe.title}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {authorLabel(authorResult.data ?? undefined)} · {recipe.cooking_time} min · {recipe.difficulty}
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
      <RecipeLikes
        recipeId={recipe.id}
        count={likesResult.count ?? 0}
        liked={Boolean(mineLikeResult.data)}
        signedIn={Boolean(userId)}
        signInHref={signInHref}
        error={Boolean(likesResult.error)}
      />
      <RecipeComments
        recipeId={recipe.id}
        signedIn={Boolean(userId)}
        signInHref={signInHref}
        error={Boolean(commentsResult.error)}
        comments={comments.map((comment) => ({
          id: comment.id,
          author: authorLabel(commentAuthors.get(comment.user_id)),
          when: commentWhen(comment.created_at),
          edited: commentWasEdited(comment.created_at, comment.updated_at),
          body: comment.body,
          isOwner: userId === comment.user_id,
        }))}
      />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/dashboard" className="underline-offset-4 hover:underline">
          Back to dashboard
        </Link>
      </p>
    </main>
  );
}
