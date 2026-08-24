import { db } from "@/db";
import { movies } from "@/db/schema";
import { ilike } from "drizzle-orm";

export async function searchMovies(query: string) {
  if (!query.trim()) return [];

  return db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      releaseDate: movies.releaseDate,
    })
    .from(movies)
    .where(ilike(movies.title, `%${query.trim()}%`))
    .limit(20);
}