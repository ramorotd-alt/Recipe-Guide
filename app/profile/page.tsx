import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileFormSkeleton } from "@/components/skeleton";
import { ensureProfile, isMissingBioColumn } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Profile · Recipe Guide",
};

export default function ProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Update the name and bio other cooks see with your recipes.
        </p>
        <Link href="/saved" className="text-sm font-medium underline-offset-4 hover:underline">
          Saved recipes
        </Link>
      </div>
      <Suspense fallback={<ProfileFormSkeleton />}>
        <ProfileEditor />
      </Suspense>
    </main>
  );
}

async function ProfileEditor() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const email = typeof data?.claims?.email === "string" ? data.claims.email : "";

  if (!userId || !email) {
    redirect("/sign-in?next=/profile");
  }

  const ensured = await ensureProfile(supabase, userId, email);
  if (!ensured.ok) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">{ensured.message}</p>;
  }

  const profile = await loadProfile(supabase, userId);
  if (!profile) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Your profile could not be loaded.</p>;
  }

  return <ProfileForm email={email} profile={profile} />;
}

async function loadProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const withBio = await supabase
    .from("profiles")
    .select("user_name, full_name, bio")
    .eq("id", userId)
    .maybeSingle();

  if (!withBio.error && withBio.data) {
    return {
      fullName: withBio.data.full_name ?? "",
      userName: withBio.data.user_name,
      bio: withBio.data.bio ?? "",
    };
  }

  const missingBio = withBio.error ? isMissingBioColumn(withBio.error) : false;
  if (!missingBio) return null;

  const withoutBio = await supabase
    .from("profiles")
    .select("user_name, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (withoutBio.error || !withoutBio.data) return null;

  return {
    fullName: withoutBio.data.full_name ?? "",
    userName: withoutBio.data.user_name,
    bio: "",
  };
}
