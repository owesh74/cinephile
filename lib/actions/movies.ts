"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  movies,
  genres,
  countries,
  people,
  movieGenres,
  movieCountries,
  movieCast,
} from "@/db/schema";
import { ilike } from "drizzle-orm";
import { createMovieSchema } from "@/lib/validations/movie";

export async function searchExistingMovies(query: string) {
  if (!query.trim()) return [];

  const results = await db
    .select({ id: movies.id, title: movies.title, releaseDate: movies.releaseDate })
    .from(movies)
    .where(ilike(movies.title, `%${query}%`))
    .limit(10);

  return results;
}

async function findOrCreateGenre(name: string) {
  const trimmed = name.trim();
  const existing = await db.query.genres.findFirst({
    where: (g, { eq }) => eq(g.name, trimmed),
  });
  if (existing) return existing.id;
  const [created] = await db.insert(genres).values({ name: trimmed }).returning();
  return created.id;
}

async function findOrCreateCountry(name: string) {
  const trimmed = name.trim();
  const existing = await db.query.countries.findFirst({
    where: (c, { eq }) => eq(c.name, trimmed),
  });
  if (existing) return existing.id;
  const [created] = await db
    .insert(countries)
    .values({ name: trimmed, code: trimmed.slice(0, 2).toUpperCase() })
    .returning();
  return created.id;
}

async function findOrCreatePerson(name: string) {
  const trimmed = name.trim();
  const existing = await db.query.people.findFirst({
    where: (p, { eq }) => eq(p.name, trimmed),
  });
  if (existing) return existing.id;
  const [created] = await db.insert(people).values({ name: trimmed }).returning();
  return created.id;
}

export async function createMovieAction(formData: FormData) {
  await requireUser(); // must be logged in to add a movie

  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = createMovieSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // final duplicate check server-side, in case of a race condition
  const duplicate = await db.query.movies.findFirst({
    where: (m, { eq }) => eq(m.title, data.title),
  });
  if (duplicate) {
    return { error: "duplicate", movieId: duplicate.id };
  }

  // handle poster upload
  let posterUrl: string | undefined;
  const posterFile = formData.get("poster") as File | null;
  if (posterFile && posterFile.size > 0) {
    if (posterFile.size > 5 * 1024 * 1024) {
      return { error: "Poster image must be under 5MB" };
    }
    const supabase = await createClient();
    const ext = posterFile.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("posters")
      .upload(path, posterFile);
    if (uploadError) {
      return { error: uploadError.message };
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("posters").getPublicUrl(path);
    posterUrl = publicUrl;
  }

  const [movie] = await db
    .insert(movies)
    .values({
      title: data.title,
      originalTitle: data.originalTitle || null,
      posterUrl: posterUrl ?? null,
      releaseDate: data.releaseYear ? `${data.releaseYear}-01-01` : null,
      runtimeMinutes: data.runtimeMinutes ? parseInt(data.runtimeMinutes) : null,
      description: data.description || null,
      language: data.language || null,
      imdbScore: data.imdbScore || null,
    })
    .returning();

  // genres
  if (data.genres) {
    const genreNames = data.genres.split(",").map((g) => g.trim()).filter(Boolean);
    for (const name of genreNames) {
      const genreId = await findOrCreateGenre(name);
      await db.insert(movieGenres).values({ movieId: movie.id, genreId });
    }
  }

  // countries
  if (data.countries) {
    const countryNames = data.countries.split(",").map((c) => c.trim()).filter(Boolean);
    for (const name of countryNames) {
      const countryId = await findOrCreateCountry(name);
      await db.insert(movieCountries).values({ movieId: movie.id, countryId });
    }
  }

  // director
  if (data.director) {
    const personId = await findOrCreatePerson(data.director);
    await db.insert(movieCast).values({ movieId: movie.id, personId, role: "director" });
  }

  // writers
  if (data.writers) {
    const writerNames = data.writers.split(",").map((w) => w.trim()).filter(Boolean);
    for (const name of writerNames) {
      const personId = await findOrCreatePerson(name);
      await db.insert(movieCast).values({ movieId: movie.id, personId, role: "writer" });
    }
  }

  // cast — format: "Actor Name as Character Name, Actor Name2 as Character Name2"
  if (data.cast) {
    const castEntries = data.cast.split(",").map((c) => c.trim()).filter(Boolean);
    for (let i = 0; i < castEntries.length; i++) {
      const entry = castEntries[i];
      const [actorName, characterName] = entry.split(" as ").map((s) => s.trim());
      if (!actorName) continue;
      const personId = await findOrCreatePerson(actorName);
      await db.insert(movieCast).values({
        movieId: movie.id,
        personId,
        role: "actor",
        characterName: characterName || null,
        billingOrder: i + 1,
      });
    }
  }

  redirect(`/movie/${movie.id}`);
}