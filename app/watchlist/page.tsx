import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import { watchlist, movies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MoviePosterGrid } from "@/components/movie-poster-grid";

export default async function WatchlistPage() {
  const user = await requireUser();

  const items = await db
    .select({
      id: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      addedAt: watchlist.addedAt,
    })
    .from(watchlist)
    .innerJoin(movies, eq(watchlist.movieId, movies.id))
    .where(eq(watchlist.userId, user.id))
    .orderBy(desc(watchlist.addedAt));

  return (
    <div className="mx-auto w-full max-w-... space-y-... px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold">
        Your Watchlist
      </h1>
      <div className="h-4" />

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing here yet — add movies from their detail pages.
        </div>
      ) : (
        <MoviePosterGrid movies={items} />
      )}
    </div>
  );
}