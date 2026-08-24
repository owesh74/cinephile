import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPopularMovies, getContinueWatching } from "@/lib/data/discover";
import { MoviePosterGrid } from "@/components/movie-poster-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const popular = await getPopularMovies(6);

    return (
      <div className="mx-auto max-w-3xl space-y-10 py-20 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold">Cinephile</h1>
          <p className="text-muted-foreground">
            Track what you watch, rate what you love, and see how your taste compares
            to your friends'.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
          </div>
        </div>

        {popular.length > 0 && (
          <div className="space-y-3 text-left">
            <h2 className="text-lg font-medium">On Cinephile</h2>
            <MoviePosterGrid movies={popular} />
          </div>
        )}
      </div>
    );
  }

  const profile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  const continueWatching = await getContinueWatching(user.id, 6);

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-12">
      <h1 className="text-2xl font-semibold">
        Welcome back{profile?.username ? `, ${profile.username}` : ""}
      </h1>

      <div className="flex flex-wrap gap-3">
        <Link href="/watchlist">
          <Button variant="outline" size="sm">Watchlist</Button>
        </Link>
        <Link href="/watched">
          <Button variant="outline" size="sm">Watched</Button>
        </Link>
        <Link href="/ratings">
          <Button variant="outline" size="sm">Ratings</Button>
        </Link>
        <Link href="/discover">
          <Button variant="outline" size="sm">Discover</Button>
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Continue Watching</h2>
        {continueWatching.length > 0 ? (
          <MoviePosterGrid movies={continueWatching} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing on your watchlist yet —{" "}
            <Link href="/discover" className="underline">
              browse Discover
            </Link>{" "}
            to find something.
          </p>
        )}
      </section>
    </div>
  );
}