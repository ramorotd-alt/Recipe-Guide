import Link from "next/link";

import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = {
  title: "Create account · Recipe Guide",
};

export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sign up with email. A profile is created from your email address when the account is confirmed.
        </p>
      </div>
      <SignUpForm />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
