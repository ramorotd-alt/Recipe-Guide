import Link from "next/link";
import { Suspense } from "react";

import { AuthMenu } from "@/components/auth-menu";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          Recipe Guide
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/#recipes" className="text-sm font-medium underline-offset-4 hover:underline">
            Recipes
          </Link>
          <Suspense fallback={<span className="text-sm text-zinc-500">Sign in</span>}>
            <AuthMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
