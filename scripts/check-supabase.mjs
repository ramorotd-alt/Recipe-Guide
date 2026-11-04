import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const key = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ""
).trim();

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or a publishable key in .env.local.");
  process.exit(1);
}

if (url === "https://your-project-id.supabase.co" || key === "sb_publishable_your_key") {
  console.error(
    "Saved .env.local still has the example URL and key. Paste the project values, save the file, and run this again.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let result;
try {
  result = await supabase.from("recipes").select("id").limit(1);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Could not reach Supabase: ${message}`);
  process.exit(1);
}

if (result.error) {
  console.error(`Reached Supabase, but the recipes query failed: ${result.error.message}`);
  process.exit(1);
}

const count = result.data?.length ?? 0;
console.log(`Connected to Supabase. The recipes table returned ${count} row(s).`);
