import Link from "next/link";

import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export async function AuthMenu() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;

  if (!email) {
    return (
      <Link href="/sign-in" className="text-sm font-medium underline-offset-4 hover:underline">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard" className="text-sm font-medium underline-offset-4 hover:underline">
        Dashboard
      </Link>
      <form action={signOut} className="flex items-center gap-3">
        <span className="max-w-40 truncate text-sm text-zinc-600 dark:text-zinc-400">{email}</span>
        <button type="submit" className="text-sm font-medium underline-offset-4 hover:underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
