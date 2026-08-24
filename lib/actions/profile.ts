"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();

  const raw = {
    username: formData.get("username") as string,
    bio: (formData.get("bio") as string) || undefined,
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { username, bio } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: and(eq(users.username, username), ne(users.id, user.id)),
  });
  if (existing) {
    return { error: "That username is already taken" };
  }

  await db
    .update(users)
    .set({ username, bio: bio ?? null })
    .where(eq(users.id, user.id));

  revalidatePath("/profile");
  return { success: true };
}

export async function uploadAvatarAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("avatar") as File;

  if (!file || file.size === 0) {
    return { error: "No file selected" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Image must be under 2MB" };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  await db
    .update(users)
    .set({ avatarUrl: publicUrl })
    .where(eq(users.id, user.id));

  revalidatePath("/profile");
  return { success: true, url: publicUrl };
}