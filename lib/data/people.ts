import { db } from "@/db";
import { people, likedPeople } from "@/db/schema";
import { asc, ilike, eq } from "drizzle-orm";

export async function getPeople(query?: string) {
    const trimmed = query?.trim() ?? "";

    if (trimmed) {
        return db
            .select({
                id: people.id,
                name: people.name,
                photoUrl: people.photoUrl,
            })
            .from(people)
            .where(ilike(people.name, `%${trimmed}%`))
            .orderBy(asc(people.name));
    }

    return db
        .select({
            id: people.id,
            name: people.name,
            photoUrl: people.photoUrl,
        })
        .from(people)
        .orderBy(asc(people.name));
}

export async function getLikedPeople(userId: string) {
    return db
        .select({
            id: people.id,
            name: people.name,
            photoUrl: people.photoUrl,
        })
        .from(likedPeople)
        .innerJoin(
            people,
            eq(likedPeople.personId, people.id)
        )
        .where(eq(likedPeople.userId, userId))
        .orderBy(asc(people.name));
}