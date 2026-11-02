import { HomeRecipes, type HomeRecipe } from "@/components/home-recipes";

const recipes: HomeRecipe[] = [
  {
    id: "tomato-lentil-soup",
    title: "Tomato lentil soup",
    category: "Soup",
    minutes: 45,
    servings: 4,
    description: "Red lentils and tomatoes simmered with cumin.",
    ingredient: "lentils tomato cumin",
  },
  {
    id: "lemon-herb-chicken",
    title: "Lemon herb roast chicken",
    category: "Dinner",
    minutes: 95,
    servings: 4,
    description: "A simple roast chicken with lemon, garlic, and herbs.",
    ingredient: "chicken lemon garlic",
  },
  {
    id: "berry-yogurt-bowls",
    title: "Berry yogurt bowls",
    category: "Breakfast",
    minutes: 15,
    servings: 2,
    description: "Yogurt topped with warm berries and pumpkin seeds.",
    ingredient: "yogurt berries honey",
  },
  {
    id: "chickpea-sandwiches",
    title: "Chickpea smash sandwiches",
    category: "Lunch",
    minutes: 20,
    servings: 2,
    description: "Mashed chickpeas with celery, mustard, and lemon.",
    ingredient: "chickpeas bread lemon",
  },
  {
    id: "cabbage-salad",
    title: "Sesame cabbage salad",
    category: "Salad",
    minutes: 15,
    servings: 4,
    description: "Shredded cabbage with sesame oil and lime.",
    ingredient: "cabbage sesame lime",
  },
  {
    id: "sheet-pan-potatoes",
    title: "Garlic sheet-pan potatoes",
    category: "Side",
    minutes: 45,
    servings: 4,
    description: "Crisp potato wedges roasted with garlic and rosemary.",
    ingredient: "potatoes garlic rosemary",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <p className="text-lg font-semibold">Recipe Guide</p>
          <a href="#recipes" className="text-sm font-medium underline-offset-4 hover:underline">
            Recipes
          </a>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Find a recipe</h1>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
            Browse a few dishes by name, ingredient, or category.
          </p>
        </section>
        <section id="recipes" aria-label="Recipe list">
          <HomeRecipes recipes={recipes} />
        </section>
      </main>
    </div>
  );
}
