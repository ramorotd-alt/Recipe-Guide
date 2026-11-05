import Link from "next/link";

export type RecipeSummary = {
  id: string;
  title: string;
  category: string;
  cooking_time: number;
  difficulty: string;
  user_id: string;
};

export function authorLabel(
  author: { full_name: string | null; user_name: string } | undefined,
) {
  return author?.full_name || author?.user_name || "Another cook";
}

export function RecipeCards({
  recipes,
  authors,
}: {
  recipes: RecipeSummary[];
  authors: Map<string, { full_name: string | null; user_name: string }>;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <Link
            href={`/recipes/${recipe.id}`}
            className="block rounded-lg border border-zinc-200 p-4 outline-none hover:border-zinc-400 focus-visible:border-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-600 dark:focus-visible:border-zinc-100"
          >
            <p className="text-sm text-zinc-500">{recipe.category}</p>
            <h3 className="mt-1 text-lg font-semibold">{recipe.title}</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {authorLabel(authors.get(recipe.user_id))}
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              {recipe.cooking_time} min · {recipe.difficulty}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
