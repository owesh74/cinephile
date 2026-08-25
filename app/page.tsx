import { createClient } from "@/lib/supabase/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import {
    getPopularMovies,
    getContinueWatching,
} from "@/lib/data/discover";

import { MoviePosterGrid } from "@/components/movie-poster-grid";

import { Button } from "@/components/ui/button";

import Link from "next/link";

export default async function HomePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    /* ------------------------------------------------ */
    /* LOGGED OUT                                      */
    /* ------------------------------------------------ */

    if (!user) {
        const popular = await getPopularMovies(8);

        return (
            <main className="min-h-[calc(100vh-4rem)]">
                {/* HERO */}

                <section className="relative overflow-hidden border-b border-border">
                    <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
                        <div className="max-w-3xl">
                            <div className="mb-5 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                                Your personal cinema journal
                            </div>

                            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                Your movies.
                                <br />
                                <span className="text-primary">
                                    Your taste.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                Track what you watch, rate the movies
                                you love, build your watchlist, discover
                                something new, and compare your taste
                                with friends.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link href="/register">
                                    <Button
                                        size="lg"
                                        className="px-6"
                                    >
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
                        </div>
                    </div>
                </section>

                {/* POPULAR */}

                {popular.length > 0 && (
                    <section className="mx-auto max-w-6xl space-y-6 px-6 py-12 sm:py-16">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                                    Explore
                                </p>

                                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                                    Popular on Cinephile
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Movies people are watching and rating.
                                </p>
                            </div>

                            <Link
                                href="/discover"
                                className="hidden text-sm font-medium hover:underline sm:block"
                            >
                                Explore all →
                            </Link>
                        </div>

                        <MoviePosterGrid movies={popular} />

                        <Link
                            href="/discover"
                            className="block text-center text-sm font-medium hover:underline sm:hidden"
                        >
                            Explore all →
                        </Link>
                    </section>
                )}

                {/* FEATURES */}

                <section className="border-t border-border">
                    <div className="mx-auto grid max-w-6xl gap-4 px-6 py-12 sm:grid-cols-3 sm:py-16">
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
                    </div>
                </section>
            </main>
        );
    }

    /* ------------------------------------------------ */
    /* LOGGED IN                                       */
    /* ------------------------------------------------ */

    const profile = await db.query.users.findFirst({
        where: eq(users.id, user.id),
    });

    const continueWatching =
        await getContinueWatching(user.id, 8);

    const popular = await getPopularMovies(6);

    return (
        <main className="mx-auto max-w-6xl space-y-12 px-6 py-10 sm:py-14">
            {/* HEADER */}

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-primary">
                            Welcome back
                        </p>

                        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                            {profile?.username
                                ? profile.username
                                : "Cinephile"}
                        </h1>

                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Keep exploring movies, update your watchlist,
                            and see what your friends are watching.
                        </p>
                    </div>

                    <Link href="/discover">
                        <Button>
                            Discover movies
                        </Button>
                    </Link>
                </div>
            </section>

            {/* QUICK ACTIONS */}

            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Your cinema
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Jump straight into your movie activity.
                    </p>
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

            {/* CONTINUE WATCHING */}

            <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Continue watching
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Pick up where you left off.
                        </p>
                    </div>

                    <Link
                        href="/watchlist"
                        className="text-sm font-medium hover:underline"
                    >
                        View watchlist →
                    </Link>
                </div>

                {continueWatching.length > 0 ? (
                    <MoviePosterGrid
                        movies={continueWatching}
                    />
                ) : (
                    <EmptyMovieSection />
                )}
            </section>

            {/* POPULAR */}

            {popular.length > 0 && (
                <section>
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-primary">
                                For you to explore
                            </p>

                            <h2 className="mt-1 text-xl font-semibold">
                                Popular movies
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                See what's getting attention on Cinephile.
                            </p>
                        </div>

                        <Link
                            href="/discover"
                            className="text-sm font-medium hover:underline"
                        >
                            See more →
                        </Link>
                    </div>

                    <MoviePosterGrid movies={popular} />
                </section>
            )}

            {/* FINAL CTA */}

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
                        <Button>
                            Explore Discover
                        </Button>
                    </Link>

                    <Link href="/lists">
                        <Button variant="outline">
                            Browse Lists
                        </Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}

/* ------------------------------------------------ */
/* COMPONENTS                                      */
/* ------------------------------------------------ */

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