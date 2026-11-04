import Link from "next/link";
import { Suspense } from "react";

import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/auth";

export const metadata = {
  title: "Sign in · Recipe Guide",
};

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Use the email and password for your account.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading sign in…</p>}>
        <SignInPanel searchParams={searchParams} />
      </Suspense>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/reset-password" className="underline-offset-4 hover:underline">
          Forgot password
        </Link>
        {" · "}
        <Link href="/sign-up" className="underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}

async function SignInPanel({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const notice = params.error === "link" ? "That email link is invalid or has expired." : undefined;

  return <SignInForm nextPath={safeNextPath(params.next)} notice={notice} />;
}
