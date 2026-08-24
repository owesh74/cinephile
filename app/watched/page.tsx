import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import { watched, movies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MoviePosterGrid } from "@/components/movie-poster-grid";

export default async function WatchedPage() {
  const user = await requireUser();

  const items = await db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      watchedAt: watched.watchedAt,
    })
    .from(watched)
    .innerJoin(movies, eq(watched.movieId, movies.id))
    .where(eq(watched.userId, user.id))
    .orderBy(desc(watched.watchedAt));

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-12">
      <h1 className="text-2xl font-semibold">
        Movies You've Watched
      </h1>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing here yet — mark movies watched from their detail pages.
        </div>
      ) : (
        <MoviePosterGrid movies={items} />
      )}
    </div>
  );
}