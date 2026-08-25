import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import { ProfileForm } from "@/components/profile-form";
import { AvatarUploader } from "@/components/avatar-uploader";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";

import { ScoreBadge } from "@/components/score-badge";
import { StatsDashboard } from "@/components/stats-dashboard";
import { AchievementsGrid } from "@/components/achievements-grid";

import { getUserCreatedLists } from "@/lib/data/user-lists";
import { getLikedPeople } from "@/lib/data/people";

import Link from "next/link";

export default async function ProfilePage() {
    const user = await requireUser();

    const profile = await db.query.users.findFirst({
        where: eq(users.id, user.id),
    });

    if (!profile) {
        return (
            <div className="mx-auto max-w-5xl p-6">
                <p>Profile not found.</p>
            </div>
        );
    }

    const [ownedLists, likedPeople] = await Promise.all([
        getUserCreatedLists(user.id),
        getLikedPeople(user.id),
    ]);

    const initials =
        profile.username
            ?.slice(0, 2)
            .toUpperCase() || "U";

    return (
        <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

            {/* PROFILE HERO */}
            <section className="overflow-hidden rounded-2xl border bg-card">

                <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent sm:h-40" />

                <div className="px-6 pb-6 sm:px-8">

                    <div className="-mt-16 flex flex-col gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                            <Avatar className="h-28 w-28 border-4 border-card shadow-lg sm:h-36 sm:w-36">
                                <AvatarImage
                                    src={profile.avatarUrl ?? undefined}
                                    alt={profile.username}
                                />

                                <AvatarFallback className="text-3xl">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            <div className="pb-1">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {profile.username}
                                </h1>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {profile.email}
                                </p>

                                {profile.bio && (
                                    <p className="mt-3 max-w-xl text-sm leading-6">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href="/watchlist"
                                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                            >
                                Watchlist
                            </Link>

                            <Link
                                href="/watched"
                                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                            >
                                Watched
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS + SCORE */}
            <section className="grid gap-6 lg:grid-cols-[1fr_280px]">

                <div className="rounded-2xl border bg-card p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold">
                            Your Cinema Journey
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Everything you've watched, rated and collected.
                        </p>
                    </div>

                    <StatsDashboard userId={profile.id} />
                </div>

                <div className="rounded-2xl border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Your Cinephile Score
                    </h2>

                    <ScoreBadge userId={profile.id} />

                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        Your score reflects your activity and participation
                        across Cinephile.
                    </p>
                </div>
            </section>

            {/* QUICK LINKS */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                <Link
                    href="/watchlist"
                    className="rounded-xl border bg-card p-4 transition hover:bg-muted"
                >
                    <p className="font-medium">Watchlist</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Movies to watch
                    </p>
                </Link>

                <Link
                    href="/watched"
                    className="rounded-xl border bg-card p-4 transition hover:bg-muted"
                >
                    <p className="font-medium">Watched</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Your movie history
                    </p>
                </Link>

                <Link
                    href="/ratings"
                    className="rounded-xl border bg-card p-4 transition hover:bg-muted"
                >
                    <p className="font-medium">Ratings</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Your movie ratings
                    </p>
                </Link>

                <Link
                    href="/lists"
                    className="rounded-xl border bg-card p-4 transition hover:bg-muted"
                >
                    <p className="font-medium">Lists</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Your collections
                    </p>
                </Link>
            </section>

            {/* LIKED PEOPLE */}
            <section className="rounded-2xl border bg-card p-6 sm:p-8">

                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            People You Like
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Actors, directors and writers you're following.
                        </p>
                    </div>

                    <Link
                        href="/people/browse"
                        className="shrink-0 text-sm underline"
                    >
                        Browse people
                    </Link>
                </div>

                {likedPeople.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <p className="font-medium">
                            No liked people yet
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Find your favorite actors, directors and writers
                            and like them.
                        </p>

                        <Link
                            href="/people/browse"
                            className="mt-4 inline-block rounded-md border px-4 py-2 text-sm hover:bg-muted"
                        >
                            Find People
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {likedPeople.map((person) => (
                            <Link
                                key={person.id}
                                href={`/people/${person.id}`}
                                className="group rounded-xl border p-3 transition hover:bg-muted"
                            >
                                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                    {person.photoUrl ? (
                                        <img
                                            src={person.photoUrl}
                                            alt={person.name}
                                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-muted-foreground">
                                            {person.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <p className="mt-3 line-clamp-2 text-sm font-medium group-hover:underline">
                                    {person.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* ACHIEVEMENTS */}
            <section className="rounded-2xl border bg-card p-6 sm:p-8">

                <div className="mb-6">
                    <h2 className="text-xl font-semibold">
                        Achievements
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Milestones you've unlocked through your cinema journey.
                    </p>
                </div>

                <AchievementsGrid userId={profile.id} />
            </section>

            {/* YOUR LISTS */}
            <section className="rounded-2xl border bg-card p-6 sm:p-8">

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Your Lists
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Your personal movie collections.
                        </p>
                    </div>

                    <Link
                        href="/lists/create"
                        className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                    >
                        + Create List
                    </Link>
                </div>

                {ownedLists.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <p className="font-medium">
                            No lists yet
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Create your first collection of movies.
                        </p>

                        <Link
                            href="/lists/create"
                            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                        >
                            Create your first list
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {ownedLists.map((list) => (
                            <Link
                                key={list.id}
                                href={`/lists/${list.id}`}
                                className="rounded-xl border p-4 transition hover:bg-muted"
                            >
                                <p className="font-medium">
                                    {list.title}
                                </p>

                                {list.description && (
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {list.description}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* PROFILE SETTINGS */}
            <section className="grid gap-6 lg:grid-cols-2">

                <div className="rounded-2xl border bg-card p-6">
                    <h2 className="text-xl font-semibold">
                        Profile
                    </h2>

                    <p className="mt-1 mb-6 text-sm text-muted-foreground">
                        Update your username and bio.
                    </p>

                    <ProfileForm
                        defaultUsername={profile.username}
                        defaultBio={profile.bio ?? ""}
                    />
                </div>

                <div className="rounded-2xl border bg-card p-6">
                    <h2 className="text-xl font-semibold">
                        Profile Photo
                    </h2>

                    <p className="mt-1 mb-6 text-sm text-muted-foreground">
                        Choose the avatar other Cinephile users will see.
                    </p>

                    <AvatarUploader />
                </div>
            </section>

        </main>
    );
}