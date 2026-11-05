"use client";

import { useMemo, useState } from "react";

import { fieldClassName } from "@/components/auth/fields";
import { authorLabel, RecipeCards, type RecipeSummary } from "@/components/recipes/recipe-cards";

type Author = {
  id: string;
  user_name: string;
  full_name: string | null;
};

const difficulties = ["easy", "medium", "hard"] as const;

export function RecipeSearch({
  mine,
  others,
  authors,
  mineError,
  othersError,
}: {
  mine: RecipeSummary[];
  others: RecipeSummary[];
  authors: Author[];
  mineError: boolean;
  othersError: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const authorMap = useMemo(() => new Map(authors.map((author) => [author.id, author])), [authors]);
  const categories = useMemo(() => {
    const names = [...new Set([...mine, ...others].map((recipe) => recipe.category))].sort((a, b) =>
      a.localeCompare(b),
    );
    return ["All", ...names];
  }, [mine, others]);
  const needle = query.trim().toLowerCase();
  const filtering = needle.length > 0 || category !== "All" || difficulty !== "All";

  const matches = (recipe: RecipeSummary) => {
    if (category !== "All" && recipe.category !== category) return false;
    if (difficulty !== "All" && recipe.difficulty !== difficulty) return false;
    if (!needle) return true;
    const cook = authorLabel(authorMap.get(recipe.user_id));
    const haystack = `${recipe.title} ${recipe.category} ${recipe.ingredients} ${recipe.difficulty} ${cook}`.toLowerCase();
    return haystack.includes(needle);
  };

  const yourRecipes = mine.filter(matches);
  const otherRecipes = others.filter(matches);

  return (
    <div className="flex flex-col gap-10">
      <form className="flex max-w-3xl flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
        <div className="flex max-w-xl flex-col gap-2">
          <label htmlFor="recipe-search" className="text-sm font-medium">
            Search
          </label>
          <input
            id="recipe-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, ingredient, or cook"
            className={fieldClassName}
          />
        </div>
        <FilterGroup
          label="Category"
          value={category}
          options={categories.map((item) => ({ value: item, label: item }))}
          onChange={setCategory}
        />
        <FilterGroup
          label="Difficulty"
          value={difficulty}
          options={[
            { value: "All", label: "All" },
            ...difficulties.map((item) => ({
              value: item,
              label: item.charAt(0).toUpperCase() + item.slice(1),
            })),
          ]}
          onChange={setDifficulty}
        />
      </form>
      <RecipeSection
        title="Your recipes"
        recipes={yourRecipes}
        authors={authorMap}
        error={mineError}
        empty={filtering ? "No recipes match that search." : "You have not shared a recipe yet."}
      />
      <RecipeSection
        title="Recipes from other cooks"
        recipes={otherRecipes}
        authors={authorMap}
        error={othersError}
        empty={filtering ? "No recipes match that search." : "No recipes from other cooks yet."}
      />
    </div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const labelId = `${label.toLowerCase()}-filter`;

  return (
    <div className="flex flex-col gap-2">
      <p id={labelId} className="text-sm font-medium">
        {label}
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={labelId}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`h-9 rounded-md border px-3 text-sm ${
                selected
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
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
