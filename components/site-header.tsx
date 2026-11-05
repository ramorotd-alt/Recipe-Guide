import Link from "next/link";
import { Suspense } from "react";

import { AuthMenu } from "@/components/auth-menu";
import { AccountMenuSkeleton } from "@/components/skeleton";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          Recipe Guide
        </Link>
        <nav className="flex items-center gap-4">
          <Suspense fallback={<AccountMenuSkeleton />}>
            <AuthMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
