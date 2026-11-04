"use server";

import { readText } from "@/lib/auth";
import {
  ensureCurrentProfile,
  isMissingBioColumn,
  validateProfileDetails,
  type ProfileFormState,
} from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(
  _state: ProfileFormState | undefined,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = validateProfileDetails({
    fullName: readText(formData, "fullName"),
    userName: readText(formData, "userName"),
    bio: readText(formData, "bio"),
  });
  if (parsed.fieldErrors || !parsed.value) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const current = await ensureCurrentProfile(supabase);
  if (!current.ok) return { message: current.message };

  const details = {
    user_name: parsed.value.userName,
    full_name: parsed.value.fullName,
    updated_at: new Date().toISOString(),
  };
  const withBio = await supabase
    .from("profiles")
    .update({ ...details, bio: parsed.value.bio || null })
    .eq("id", current.userId)
    .select("id");

  if (!withBio.error) {
    if (!withBio.data || withBio.data.length === 0) {
      return { message: "Your profile could not be saved." };
    }
    return { message: "Profile saved." };
  }

  if (withBio.error.code === "23505") {
    return { fieldErrors: { userName: "That username is already taken." } };
  }

  const missingBio = isMissingBioColumn(withBio.error);
  if (!missingBio) return { message: "Your profile could not be saved." };

  const withoutBio = await supabase
    .from("profiles")
    .update(details)
    .eq("id", current.userId)
    .select("id");

  if (withoutBio.error || !withoutBio.data || withoutBio.data.length === 0) {
    return { message: "Your profile could not be saved." };
  }

  if (parsed.value.bio) {
    return {
      message:
        "Full name and username saved. Bio could not be saved because that column is not on the profiles table yet.",
    };
  }

  return { message: "Profile saved." };
}
