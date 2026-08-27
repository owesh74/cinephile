import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

import {
    getPopularMovies,
    getContinueWatching,
    getTopRatedMovies,
    getUpcomingMovies,
    getMovieGenreNames,
    getUserMovieStatus,
} from "@/lib/data/discover";

import { MoviePosterGrid } from "@/components/movie-poster-grid";
import {
    MovieHeroSlider,
    type SlideMovie,
} from "@/components/movie-hero-slider";
import { TrendingRow } from "@/components/trending-row";
import {
    TopRatedList,
    UpcomingList,
} from "@/components/movie-lists";
import { HomeSidebar } from "@/components/home-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SearchBox } from "@/components/search-box";
import { FEATURED_MOVIES } from "@/lib/featured-movies";

import { Button } from "@/components/ui/button";

import Link from "next/link";
import type { ReactNode } from "react";

export default async function HomePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const popular = await getPopularMovies(9);
    const topRated = await getTopRatedMovies(5);
    const upcoming = await getUpcomingMovies(5);

    /*
     * HERO
     *
     * Use real movies from the database.
     * No hardcoded/fake featured movie data.
     */
    const featuredIds = FEATURED_MOVIES.map((item) => item.movieId);

   const featuredMovies = featuredIds.length
    ? await db.query.movies.findMany({
          where: (movies) =>
              inArray(movies.id, featuredIds),
      })
    : [];

    const heroSourceMovies =
        featuredIds.length > 0
            ? featuredIds
                .map((id) =>
                    featuredMovies.find((movie) => movie.id === id)
                )
                .filter((movie): movie is NonNullable<typeof movie> => !!movie)
            : popular.slice(0, 5);

    const heroImages = Object.fromEntries(
        heroSourceMovies.map((movie) => {
            const featured = FEATURED_MOVIES.find(
                (item) => item.movieId === movie.id
            );

            return [
                movie.id,
                featured?.image ??
                movie.backdropUrl ??
                movie.posterUrl,
            ];
        })
    );

    const heroGenreEntries = await Promise.all(
        heroSourceMovies.map(async (movie) => [
            movie.id,
            await getMovieGenreNames(movie.id),
        ] as const)
    );

    const heroGenresByMovie = Object.fromEntries(heroGenreEntries);

    const heroStatusByMovie = user
        ? Object.fromEntries(
            await Promise.all(
                heroSourceMovies.map(async (movie) => [
                    movie.id,
                    await getUserMovieStatus(user.id, movie.id),
                ] as const)
            )
        )
        : {};

    const slides: SlideMovie[] = heroSourceMovies.map((movie) => {
        const featured = FEATURED_MOVIES.find(
            (item) => item.movieId === movie.id
        );

        return {
            id: movie.id,
            title: movie.title,
            image: featured?.image ?? movie.backdropUrl ?? movie.posterUrl,
            releaseDate: movie.releaseDate,
            runtimeMinutes: movie.runtimeMinutes,
            imdbScore: movie.imdbScore,
            description: movie.description,
            genres: heroGenresByMovie[movie.id] ?? [],
            trailerUrl: featured?.trailerUrl,
            badge: featured?.badge,
        };
    });

    const heroIds = new Set(
        heroSourceMovies.map((movie) => movie.id)
    );

    const trending = popular.filter(
        (movie) => !heroIds.has(movie.id)
    );

    /*
     * LOGGED OUT
     */
    if (!user) {
        return (
            <main className="min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
                <div className="mx-auto flex max-w-[1600px] gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                    <aside className="hidden w-56 shrink-0 lg:block">
                        <HomeSidebar loggedIn={false} />
                    </aside>

                    <div className="min-w-0 flex-1 space-y-10">
                        <div className="lg:hidden">
                            <SearchBox />
                        </div>

                        <MovieHeroSlider
                            slides={slides}
                            loggedIn={false}
                            statusByMovie={heroStatusByMovie}
                        />

                        <MobileCategoryPills />

                        {trending.length > 0 && (
                            <SectionBlock
                                id="trending"
                                eyebrow="Explore"
                                title="Trending Now"
                                href="/discover"
                            >
                                <TrendingRow movies={trending} />
                            </SectionBlock>
                        )}

                        {topRated.length > 0 && (
                            <SectionBlock
                                id="top-rated"
                                eyebrow="Community favorites"
                                title="Top Rated"
                                href="/discover"
                            >
                                <TopRatedList movies={topRated} />
                            </SectionBlock>
                        )}

                        <section className="grid gap-4 sm:grid-cols-3">
                            <FeatureCard
                                title="Track everything"
                                description="Keep your watched movies, watchlist and ratings organized in one place."
                            />

                            <FeatureCard
                                title="Discover movies"
                                description="Find something worth watching based on your cinema interests."
                            />

                            <FeatureCard
                                title="Connect with friends"
                                description="See what your friends watch and compare your movie taste."
                            />
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
                            <p className="text-xs font-medium uppercase tracking-wider text-primary">
                                Join Cinephile
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold">
                                Track, rate, and discover your next favorite movie.
                            </h2>

                            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                                Create an account to build a watchlist, rate what
                                you've watched, and compare taste with friends.
                            </p>

                            <div className="mt-6 flex justify-center gap-3">
                                <Link href="/register">
                                    <Button size="lg" className="px-6">
                                        Get started
                                    </Button>
                                </Link>

                                <Link href="/login">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="px-6"
                                    >
                                        Log in
                                    </Button>
                                </Link>
                            </div>
                        </section>
                    </div>

                    <aside className="hidden w-72 shrink-0 space-y-8 xl:block">
                        {topRated.length > 0 && (
                            <RightPanel
                                title="Top Rated"
                                href="/discover"
                            >
                                <TopRatedList movies={topRated} />
                            </RightPanel>
                        )}

                        {upcoming.length > 0 && (
                            <RightPanel
                                title="Most Anticipated"
                                href="/discover"
                            >
                                <UpcomingList movies={upcoming} />
                            </RightPanel>
                        )}
                    </aside>
                </div>

                {/* <MobileBottomNav loggedIn={false} /> */}
            </main>
        );
    }

    /*
     * LOGGED IN
     */
    const profile = await db.query.users.findFirst({
        where: eq(users.id, user.id),
    });

    const continueWatching = await getContinueWatching(
        user.id,
        8
    );

    return (
        <main className="min-h-[calc(100vh-4rem)] pb-16 lg:pb-0">
            <div className="mx-auto flex max-w-[1600px] gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <aside className="hidden w-56 shrink-0 lg:block">
                    <HomeSidebar loggedIn={true} />
                </aside>

                <div className="min-w-0 flex-1 space-y-10">
                    <div className="lg:hidden">
                        <SearchBox />
                    </div>

                    <MovieHeroSlider
                        slides={slides}
                        loggedIn={true}
                        statusByMovie={heroStatusByMovie}
                    />

                    <MobileCategoryPills />

                    <section>
                        <div className="mb-4">
                            <p className="text-xs font-medium uppercase tracking-wider text-primary">
                                Welcome back
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                                {profile?.username
                                    ? profile.username
                                    : "Cinephile"}
                            </h1>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <QuickAction
                                href="/watchlist"
                                title="Watchlist"
                                description="Movies you want to watch"
                            />

                            <QuickAction
                                href="/watched"
                                title="Watched"
                                description="Your movie history"
                            />

                            <QuickAction
                                href="/ratings"
                                title="Ratings"
                                description="Movies you've rated"
                            />

                            <QuickAction
                                href="/friends"
                                title="Friends"
                                description="Your cinema network"
                            />
                        </div>
                    </section>

                    <SectionBlock
                        id="continue-watching"
                        eyebrow="Pick up where you left off"
                        title="Continue Watching"
                        href="/watchlist"
                    >
                        {continueWatching.length > 0 ? (
                            <MoviePosterGrid movies={continueWatching} />
                        ) : (
                            <EmptyMovieSection />
                        )}
                    </SectionBlock>

                    {trending.length > 0 && (
                        <SectionBlock
                            id="trending"
                            eyebrow="For you to explore"
                            title="Trending Now"
                            href="/discover"
                        >
                            <TrendingRow movies={trending} />
                        </SectionBlock>
                    )}

                    {topRated.length > 0 && (
                        <SectionBlock
                            id="top-rated"
                            eyebrow="Community favorites"
                            title="Top Rated"
                            href="/discover"
                        >
                            <TopRatedList movies={topRated} />
                        </SectionBlock>
                    )}

                    <section className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
                        <p className="text-xs font-medium uppercase tracking-wider text-primary">
                            Keep exploring
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold">
                            Find your next favorite movie.
                        </h2>

                        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                            Browse the Cinephile catalog and discover movies
                            worth adding to your watchlist.
                        </p>

                        <div className="mt-6 flex justify-center gap-3">
                            <Link href="/discover">
                                <Button>Explore Discover</Button>
                            </Link>

                            <Link href="/lists">
                                <Button variant="outline">
                                    Browse Lists
                                </Button>
                            </Link>
                        </div>
                    </section>
                </div>

                <aside className="hidden w-72 shrink-0 space-y-8 xl:block">
                    {topRated.length > 0 && (
                        <RightPanel
                            title="Top Rated"
                            href="/discover"
                        >
                            <TopRatedList movies={topRated} />
                        </RightPanel>
                    )}

                    {upcoming.length > 0 && (
                        <RightPanel
                            title="Most Anticipated"
                            href="/discover"
                        >
                            <UpcomingList movies={upcoming} />
                        </RightPanel>
                    )}
                </aside>
            </div>

            {/* <MobileBottomNav loggedIn={true} /> */}
        </main>
    );
}

/* ------------------------------------------------ */
/* COMPONENTS                                       */
/* ------------------------------------------------ */

function SectionBlock({
    id,
    eyebrow,
    title,
    href,
    children,
}: {
    id: string;
    eyebrow: string;
    title: string;
    href: string;
    children: ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">
                        {eyebrow}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
                        {title}
                    </h2>
                </div>

                <Link
                    href={href}
                    className="shrink-0 text-sm font-medium text-primary hover:underline"
                >
                    View all →
                </Link>
            </div>

            {children}
        </section>
    );
}

function RightPanel({
    title,
    href,
    children,
}: {
    title: string;
    href: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                    {title}
                </h3>

                <Link
                    href={href}
                    className="text-xs font-medium text-primary hover:underline"
                >
                    View all
                </Link>
            </div>

            {children}
        </div>
    );
}

function MobileCategoryPills() {
    const items = [
        {
            href: "#top-rated",
            label: "Top Rated",
        },
        {
            href: "#trending",
            label: "Trending",
        },
        {
            href: "/discover",
            label: "Explore",
        },
    ];

    return (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="shrink-0 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                    {item.label}
                </Link>
            ))}
        </div>
    );
}

function FeatureCard({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function QuickAction({
    href,
    title,
    description,
}: {
    href: string;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
        >
            <div className="flex items-center justify-between">
                <h3 className="font-medium">
                    {title}
                </h3>

                <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
                    →
                </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
                {description}
            </p>
        </Link>
    );
}

function EmptyMovieSection() {
    return (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <h3 className="font-medium">
                Your watchlist is empty
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
                Add movies to your watchlist and they'll appear here.
            </p>

            <Link
                href="/discover"
                className="mt-4 inline-block text-sm font-medium underline"
            >
                Find movies
            </Link>
        </div>
    );
}