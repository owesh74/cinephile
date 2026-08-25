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
    const [
        popular,
        recentlyAdded,
        genreSections,
    ] = await Promise.all([
        getPopularMovies(10),
        getRecentlyAddedMovies(10),
        getGenreSections(6, 6),
    ]);

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    /*
     * Keep the recommendation values undefined when
     * there is no logged-in user. This avoids the
     * implicit any[] problem.
     */
    const personalized = user
        ? await getPersonalizedRecommendations(
              user.id,
              10
          )
        : [];

    const friends = user
        ? await getFriendsRecommendations(
              user.id,
              10
          )
        : [];

    return (
        <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 sm:py-12">

            {/* HEADER */}

            <section>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                    Explore
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Discover
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Find something new to watch based on what's
                    popular, what's recently been added, and what
                    matches your taste.
                </p>
            </section>

            {/* PERSONALIZED */}

            {personalized.length > 0 && (
                <section className="space-y-5">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Because you liked...
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Movies selected from your taste and
                            viewing history.
                        </p>
                    </div>

                    <MoviePosterGrid
                        movies={personalized}
                    />
                </section>
            )}

            {/* FRIENDS */}

            {friends.length > 0 && (
                <section className="space-y-5">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Friends are watching
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Movies that your friends have watched
                            and rated.
                        </p>
                    </div>

                    <FriendRecommendationGrid
                        movies={friends}
                    />
                </section>
            )}

            {/* POPULAR */}

            <section className="space-y-5">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">
                        Trending
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                        Popular
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Popular movies on Cinephile.
                    </p>
                </div>

                <MoviePosterGrid movies={popular} />
            </section>

            {/* RECENTLY ADDED */}

            <section className="space-y-5">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">
                        Fresh arrivals
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                        Recently Added
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        The latest movies added to Cinephile.
                    </p>
                </div>

                <MoviePosterGrid
                    movies={recentlyAdded}
                />
            </section>

            {/* GENRES */}

            {genreSections.map((section) => (
                <section
                    key={section.genre}
                    className="space-y-5"
                >
                    <div>
                        <h2 className="text-xl font-semibold">
                            {section.genre}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            More {section.genre.toLowerCase()} movies
                            to explore.
                        </p>
                    </div>

                    <MoviePosterGrid
                        movies={section.movies}
                    />
                </section>
            ))}
        </div>
    );
}