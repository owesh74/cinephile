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

import { SearchBox } from "@/components/search-box";

import Link from "next/link";

import {
    Sparkles,
    Users,
    Flame,
    Clock3,
    Compass,
} from "lucide-react";

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
        <main className="min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
            <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

                {/* MOBILE SEARCH */}

                <div className="mb-6 lg:hidden">
                    <SearchBox />
                </div>

                {/* HERO HEADER */}

                <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

                    <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                        <div className="max-w-3xl">

                            <div className="mb-4 flex items-center gap-2 text-primary">
                                <Compass className="h-4 w-4" />

                                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                                    Explore Cinephile
                                </span>
                            </div>

                            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Discover something
                                <span className="text-primary">
                                    {" "}worth watching.
                                </span>
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Explore popular movies, fresh arrivals,
                                personalized recommendations, and movies
                                your friends are watching.
                            </p>

                            {/* QUICK NAV */}

                            <div className="mt-7 flex flex-wrap gap-2">
                                <DiscoverChip
                                    href="#popular"
                                    icon={Flame}
                                    label="Popular"
                                />

                                <DiscoverChip
                                    href="#recently-added"
                                    icon={Clock3}
                                    label="Recently Added"
                                />

                                {user && personalized.length > 0 && (
                                    <DiscoverChip
                                        href="#for-you"
                                        icon={Sparkles}
                                        label="For You"
                                    />
                                )}

                                {user && friends.length > 0 && (
                                    <DiscoverChip
                                        href="#friends"
                                        icon={Users}
                                        label="Friends"
                                    />
                                )}

                                <DiscoverChip
                                    href="#genres"
                                    icon={Compass}
                                    label="Genres"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* PERSONALIZED */}

                {personalized.length > 0 && (
                    <section
                        id="for-you"
                        className="mt-12 scroll-mt-24"
                    >
                        <SectionHeader
                            eyebrow="Picked for you"
                            title="Because you liked..."
                            description="Movies selected from your taste and viewing history."
                            icon={Sparkles}
                        />

                        <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/[0.03] p-4 sm:p-5">
                            <MoviePosterGrid
                                movies={personalized}
                            />
                        </div>
                    </section>
                )}

                {/* FRIENDS */}

                {friends.length > 0 && (
                    <section
                        id="friends"
                        className="mt-12 scroll-mt-24"
                    >
                        <SectionHeader
                            eyebrow="Your cinema circle"
                            title="Friends are watching"
                            description="Movies your friends have watched and rated."
                            icon={Users}
                        />

                        <div className="mt-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
                            <FriendRecommendationGrid
                                movies={friends}
                            />
                        </div>
                    </section>
                )}

                {/* POPULAR */}

                <section
                    id="popular"
                    className="mt-12 scroll-mt-24"
                >
                    <SectionHeader
                        eyebrow="Trending now"
                        title="Popular"
                        description="The movies getting the most attention on Cinephile."
                        icon={Flame}
                    />

                    <div className="mt-5">
                        <MoviePosterGrid
                            movies={popular}
                        />
                    </div>
                </section>

                {/* RECENTLY ADDED */}

                <section
                    id="recently-added"
                    className="mt-14 scroll-mt-24"
                >
                    <SectionHeader
                        eyebrow="Fresh arrivals"
                        title="Recently Added"
                        description="The latest movies added to the Cinephile catalog."
                        icon={Clock3}
                    />

                    <div className="mt-5">
                        <MoviePosterGrid
                            movies={recentlyAdded}
                        />
                    </div>
                </section>

                {/* GENRES */}

                <section
                    id="genres"
                    className="mt-14 scroll-mt-24"
                >
                    <div className="mb-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            Browse by mood
                        </p>

                        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                            Explore by Genre
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Find something that matches the kind of
                            movie you feel like watching.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {genreSections.map((section) => (
                            <section
                                key={section.genre}
                                className="scroll-mt-24"
                            >
                                <div className="mb-4 flex items-end justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {section.genre}
                                        </h3>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            More{" "}
                                            {section.genre.toLowerCase()}{" "}
                                            movies to explore.
                                        </p>
                                    </div>

                                    <span className="hidden text-xs font-medium uppercase tracking-wider text-muted-foreground sm:block">
                                        {section.movies.length} movies
                                    </span>
                                </div>

                                <div className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
                                    <MoviePosterGrid
                                        movies={section.movies}
                                    />
                                </div>
                            </section>
                        ))}
                    </div>
                </section>

                {/* BOTTOM CTA */}

                <section className="mt-16 overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="relative px-6 py-10 text-center sm:px-10 sm:py-14">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

                        <div className="relative mx-auto max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                Keep exploring
                            </p>

                            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                                Your next favorite movie is out there.
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Browse your watchlist, create a list,
                                or discover something completely new.
                            </p>

                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <Link
                                    href="/lists"
                                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                    Browse Lists
                                </Link>

                                <Link
                                    href="/"
                                    className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                                >
                                    Back Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

/* ------------------------------------------------ */
/* SECTION HEADER                                   */
/* ------------------------------------------------ */

function SectionHeader({
    eyebrow,
    title,
    description,
    icon: Icon,
}: {
    eyebrow: string;
    title: string;
    description: string;
    icon: typeof Flame;
}) {
    return (
        <div className="flex items-end justify-between gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        {eyebrow}
                    </p>
                </div>

                <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {title}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

/* ------------------------------------------------ */
/* DISCOVER CHIP                                    */
/* ------------------------------------------------ */

function DiscoverChip({
    href,
    label,
    icon: Icon,
}: {
    href: string;
    label: string;
    icon: typeof Flame;
}) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
            <Icon className="h-4 w-4" />

            {label}
        </Link>
    );
}