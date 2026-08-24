import { db } from "@/db";
import { movies, movieGenres, genres, movieCountries, countries, movieCast, people } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getMovieById(id: string) {
  const movie = await db.query.movies.findFirst({
    where: eq(movies.id, id),
  });

  if (!movie) return null;

  const genreRows = await db
    .select({ name: genres.name })
    .from(movieGenres)
    .innerJoin(genres, eq(movieGenres.genreId, genres.id))
    .where(eq(movieGenres.movieId, id));

  const countryRows = await db
    .select({ name: countries.name })
    .from(movieCountries)
    .innerJoin(countries, eq(movieCountries.countryId, countries.id))
    .where(eq(movieCountries.movieId, id));

  const castRows = await db
    .select({
      personId: people.id,
      name: people.name,
      photoUrl: people.photoUrl,
      role: movieCast.role,
      characterName: movieCast.characterName,
      billingOrder: movieCast.billingOrder,
    })
    .from(movieCast)
    .innerJoin(people, eq(movieCast.personId, people.id))
    .where(eq(movieCast.movieId, id));

  const directors = castRows.filter((c) => c.role === "director");
  const writers = castRows.filter((c) => c.role === "writer");
  const cast = castRows
    .filter((c) => c.role === "actor")
    .sort((a, b) => (a.billingOrder ?? 999) - (b.billingOrder ?? 999));

  return {
    ...movie,
    genres: genreRows.map((g) => g.name),
    countries: countryRows.map((c) => c.name),
    directors,
    writers,
    cast,
  };
}