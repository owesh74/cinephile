import { getListWithMovies } from "@/lib/data/lists";
import { isListOwner } from "@/lib/data/user-lists";

import { updateListDetailsAction } from "@/lib/actions/lists";

import { createClient } from "@/lib/supabase/server";

import { db } from "@/db";
import { users } from "@/db/schema";

import { eq } from "drizzle-orm";

import { notFound } from "next/navigation";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ListMovieAdder } from "@/components/list-movie-adder";
import { ListItemControls } from "@/components/list-item-controls";
import { DeleteListButton } from "@/components/delete-list-button";

import { LIST_SIZES } from "@/lib/validations/list";

export default async function ListDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const list = await getListWithMovies(
        id,
        user?.id
    );

    if (!list) {
        notFound();
    }

    const isOwner = user
        ? await isListOwner(id, user.id)
        : false;

    let ownerUsername: string | null = null;

    if (list.ownerId) {
        const owner =
            await db.query.users.findFirst({
                where: eq(
                    users.id,
                    list.ownerId
                ),
            });

        ownerUsername =
            owner?.username ?? null;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 sm:py-12">

            {/* HEADER */}

            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                {list.title}
                            </h1>

                            {list.isSystem && (
                                <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                                    Official
                                </span>
                            )}
                        </div>

                        {!list.isSystem &&
                            ownerUsername && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    A list by{" "}
                                    <Link
                                        href={`/user/${ownerUsername}`}
                                        className="font-medium text-foreground hover:underline"
                                    >
                                        {ownerUsername}
                                    </Link>
                                </p>
                            )}

                        {list.description && (
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                                {list.description}
                            </p>
                        )}

                        {user && (
                            <div className="mt-4 inline-flex rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                <span className="font-medium">
                                    {list.watchedCount}
                                </span>

                                <span className="mx-1 text-muted-foreground">
                                    /
                                </span>

                                <span>
                                    {list.totalCount}
                                </span>

                                <span className="ml-1 text-muted-foreground">
                                    watched
                                </span>
                            </div>
                        )}
                    </div>

                    {isOwner && (
                        <Link href="/lists">
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                My Lists
                            </Button>
                        </Link>
                    )}
                </div>
            </section>

            {/* OWNER CONTROLS */}

            {isOwner && (
                <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                    <details>
                        <summary className="cursor-pointer list-none">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold">
                                        List settings
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Edit your list or manage it.
                                    </p>
                                </div>

                                <span className="text-sm text-muted-foreground">
                                    Edit
                                </span>
                            </div>
                        </summary>

                        <div className="mt-6 border-t border-border pt-6">
                            <form
                                action={async (fd) => {
                                    "use server";

                                    await updateListDetailsAction(
                                        id,
                                        fd
                                    );
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        Title
                                    </label>

                                    <input
                                        name="title"
                                        defaultValue={list.title}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        defaultValue={
                                            list.description ??
                                            ""
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        List size
                                    </label>

                                    <select
                                        name="size"
                                        defaultValue={list.size}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                                    >
                                        {LIST_SIZES.map(
                                            (size) => (
                                                <option
                                                    key={size}
                                                    value={size}
                                                >
                                                    Top {size}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    size="sm"
                                >
                                    Save changes
                                </Button>
                            </form>

                            {/* DELETE */}

                            <div className="mt-8 border-t border-border pt-6">
                                <div className="mb-3">
                                    <h3 className="text-sm font-semibold">
                                        Delete list
                                    </h3>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Permanently remove this list
                                        and all of its movie entries.
                                    </p>
                                </div>

                                <DeleteListButton
                                    listId={id}
                                />
                            </div>
                        </div>
                    </details>
                </section>
            )}

            {/* ADD MOVIES */}

            {isOwner && (
                <section>
                    <ListMovieAdder listId={id} />
                </section>
            )}

            {/* MOVIES */}

            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        Movies
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {list.items.length}{" "}
                        {list.items.length === 1
                            ? "movie"
                            : "movies"}{" "}
                        in this list
                    </p>
                </div>

                {list.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                        <p className="font-medium">
                            This list is empty
                        </p>

                        {isOwner && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Use the movie search above to
                                start building your list.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {list.items.map(
                            (item, index) => (
                                <div
                                    key={item.movieId}
                                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/40 sm:gap-4 sm:p-4"
                                >
                                    {/* RANK */}

                                    <span className="w-6 shrink-0 text-center text-sm font-medium text-muted-foreground">
                                        {item.rank}
                                    </span>

                                    {/* MOVIE */}

                                    <Link
                                        href={`/movie/${item.movieId}`}
                                        className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
                                    >
                                        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-muted sm:h-20 sm:w-14">
                                            {item.posterUrl ? (
                                                <img
                                                    src={
                                                        item.posterUrl
                                                    }
                                                    alt={
                                                        item.title
                                                    }
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                                    No poster
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {item.title}
                                            </p>

                                            {item.isWatched && (
                                                <span className="mt-1 inline-block text-xs text-green-600">
                                                    ✓ Watched
                                                </span>
                                            )}
                                        </div>
                                    </Link>

                                    {/* CONTROLS */}

                                    {isOwner && (
                                        <ListItemControls
                                            listId={id}
                                            movieId={
                                                item.movieId
                                            }
                                            isFirst={
                                                index === 0
                                            }
                                            isLast={
                                                index ===
                                                list.items
                                                    .length -
                                                    1
                                            }
                                        />
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}