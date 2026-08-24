import {
  getPopularMovies,
  getRecentlyAddedMovies,
  getGenreSections,
} from "@/lib/data/discover";

import { MoviePosterGrid } from "@/components/movie-poster-grid";

import {
  getPersonalizedRecommendations,
  getFriendsRecommendations,
} from "@/lib/data/recommendations";

import { FriendRecommendationGrid } from "@/components/friend-recommendation-grid";

import { createClient } from "@/lib/supabase/server";

export default async function DiscoverPage() {
  const [popular, recentlyAdded, genreSections] = await Promise.all([
    getPopularMovies(10),
    getRecentlyAddedMovies(10),
    getGenreSections(6, 6),
  ]);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let personalized = [];
  let friends = [];

  if (user) {
    [personalized, friends] = await Promise.all([
      getPersonalizedRecommendations(user.id, 10),
      getFriendsRecommendations(user.id, 10),
    ]);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-12">
      <h1 className="text-2xl font-semibold">Discover</h1>

      {personalized.length > 0 && (
        <section className="space-y-3">
          <h2 className="border-b border-border pb-2 text-lg font-medium">
            Because you liked...
          </h2>

          <MoviePosterGrid movies={personalized} />
        </section>
      )}

      {friends.length > 0 && (
        <section className="space-y-3">
          <h2 className="border-b border-border pb-2 text-lg font-medium">
            Friends are watching
          </h2>

          <FriendRecommendationGrid recommendations={friends} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="border-b border-border pb-2 text-lg font-medium">
          Popular
        </h2>

        <MoviePosterGrid movies={popular} />
      </section>

      <section className="space-y-3">
        <h2 className="border-b border-border pb-2 text-lg font-medium">
          Recently Added
        </h2>

        <MoviePosterGrid movies={recentlyAdded} />
      </section>

      {genreSections.map((section) => (
        <section key={section.genre} className="space-y-3">
          <h2 className="border-b border-border pb-2 text-lg font-medium">
            {section.genre}
          </h2>

          <MoviePosterGrid movies={section.movies} />
        </section>
      ))}
    </div>
  );
}