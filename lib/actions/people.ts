"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import { people, likedPeople } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function updatePersonPhotoAction(
  personId: string,
  formData: FormData
) {
  await requireUser();

  const photoUrl = String(formData.get("photoUrl") ?? "").trim();

  if (!photoUrl) {
    return { error: "Photo URL is required" };
  }

  try {
    new URL(photoUrl);
  } catch {
    return { error: "Please enter a valid photo URL" };
  }

  const existingPerson = await db.query.people.findFirst({
    where: eq(people.id, personId),
  });

  if (!existingPerson) {
    return { error: "Person not found" };
  }

  await db
    .update(people)
    .set({
      photoUrl,
    })
    .where(eq(people.id, personId));

  revalidatePath("/people");
  revalidatePath("/people/browse");
  revalidatePath(`/people/${personId}`);

  return {
    success: true,
    photoUrl,
  };
}

export async function toggleLikedPersonAction(personId: string) {
  const user = await requireUser();

  const person = await db.query.people.findFirst({
    where: eq(people.id, personId),
  });

  if (!person) {
    return { error: "Person not found" };
  }

  const existing = await db.query.likedPeople.findFirst({
    where: and(
      eq(likedPeople.userId, user.id),
      eq(likedPeople.personId, personId)
    ),
  });

  if (existing) {
    await db
      .delete(likedPeople)
      .where(
        and(
          eq(likedPeople.userId, user.id),
          eq(likedPeople.personId, personId)
        )
      );
  } else {
    await db
      .insert(likedPeople)
      .values({
        userId: user.id,
        personId,
      })
      .onConflictDoNothing();
  }

  revalidatePath(`/people/${personId}`);
  revalidatePath("/people/browse");
  revalidatePath("/profile");

  return {
    success: true,
    liked: !existing,
  };
}