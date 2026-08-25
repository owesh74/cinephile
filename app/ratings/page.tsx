import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import { ratings, movies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function RatingsPage() {
  const user = await requireUser();

  const items = await db
    .select({
      movieId: movies.id,
      title: movies.title,
      posterUrl: movies.posterUrl,
      score: ratings.score,
      ratedAt: ratings.ratedAt,
    })
    .from(ratings)
    .innerJoin(movies, eq(ratings.movieId, movies.id))
    .where(eq(ratings.userId, user.id))
    .orderBy(desc(ratings.ratedAt));

  return (
    <div className="mx-auto w-full max-w-... space-y-... px-4 py-8 sm:px-6 sm:py-12">
      
      <h1 className="text-2xl font-semibold">Your Ratings</h1>
<div className="h-4" />
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          You haven't rated anything yet.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.movieId}
              href={`/movie/${item.movieId}`}
              className="flex items-center gap-4 rounded-md bg-card p-3 ring-1 ring-border hover:ring-primary/50"
            >
              <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded bg-muted">
                {item.posterUrl && (
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>

              <p className="flex-1 font-medium">{item.title}</p>

              <p className="font-mono text-lg font-semibold text-secondary">
                {item.score}/10
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}