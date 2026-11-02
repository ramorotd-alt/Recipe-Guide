"use client";

import { useMemo, useState } from "react";

export type HomeRecipe = {
  id: string;
  title: string;
  category: string;
  minutes: number;
  servings: number;
  description: string;
  ingredient: string;
};

export function HomeRecipes({ recipes }: { recipes: HomeRecipe[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(recipes.map((recipe) => recipe.category))],
    [recipes],
  );

  const visible = recipes.filter((recipe) => {
    const matchesCategory = category === "All" || recipe.category === category;
    const haystack = `${recipe.title} ${recipe.description} ${recipe.ingredient}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="recipe-search" className="text-sm font-medium">
          Search
        </label>
        <input
          id="recipe-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Title or ingredient"
          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base outline-none focus-visible:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-visible:border-zinc-100"
        />
      </form>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
        {categories.map((item) => {
          const selected = item === category;
          return (
            <button
              key={item}
              type="button"
              aria-pressed={selected}
              onClick={() => setCategory(item)}
              className={`h-9 rounded-md border px-3 text-sm ${
                selected
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No recipes match that search.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visible.map((recipe) => (
            <li
              key={recipe.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="text-sm text-zinc-500">{recipe.category}</p>
              <h2 className="mt-1 text-lg font-semibold">{recipe.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {recipe.description}
              </p>
              <p className="mt-3 text-sm text-zinc-500">
                {recipe.minutes} min · {recipe.servings} servings
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
