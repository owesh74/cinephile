import { getListWithMovies } from "@/lib/data/lists";
import { isListOwner } from "@/lib/data/user-lists";
import {
  updateListDetailsAction,
  deleteListAction,
} from "@/lib/actions/lists";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListMovieAdder } from "@/components/list-movie-adder";
import { ListItemControls } from "@/components/list-item-controls";
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

  const list = await getListWithMovies(id, user?.id);

  if (!list) {
    notFound();
  }

  const isOwner = user
    ? await isListOwner(id, user.id)
    : false;

  let ownerUsername: string | null = null;

  if (list.ownerId) {
    const owner = await db.query.users.findFirst({
      where: eq(users.id, list.ownerId),
    });

    ownerUsername = owner?.username ?? null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">
          {list.title}
        </h1>

        {!list.isSystem && ownerUsername && (
          <p className="text-sm text-muted-foreground">
            A list by{" "}
            <Link
              href={`/user/${ownerUsername}`}
              className="underline"
            >
              {ownerUsername}
            </Link>
          </p>
        )}

        {list.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {list.description}
          </p>
        )}

        {user && (
          <p className="mt-2 text-sm font-medium">
            {list.watchedCount} / {list.totalCount} watched
          </p>
        )}
      </div>

      {isOwner && (
        <details className="rounded-md border p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Edit list details
          </summary>

          <form
            action={async (fd) => {
              "use server";
              await updateListDetailsAction(id, fd);
            }}
            className="mt-3 space-y-3"
          >
            <input
              name="title"
              defaultValue={list.title}
              className="w-full rounded-md border bg-transparent p-2 text-sm"
              required
            />

            <textarea
              name="description"
              defaultValue={list.description ?? ""}
              rows={2}
              className="w-full rounded-md border bg-transparent p-2 text-sm"
            />

            <select
              name="size"
              defaultValue={list.size}
              className="w-full rounded-md border bg-transparent p-2 text-sm"
            >
              {LIST_SIZES.map((s) => (
                <option key={s} value={s}>
                  Top {s}
                </option>
              ))}
            </select>

            <Button type="submit" size="sm">
              Save
            </Button>
          </form>

          <form
            action={async () => {
              "use server";
              await deleteListAction(id);
            }}
            className="mt-3"
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-red-500"
            >
              Delete list
            </Button>
          </form>
        </details>
      )}

      {isOwner && <ListMovieAdder listId={id} />}

      <div className="space-y-2">
        {list.items.map((item, i) => (
          <div
            key={item.movieId}
            className="flex items-center gap-4 rounded-md border p-3 hover:bg-muted"
          >
            <span className="w-6 text-sm text-muted-foreground">
              {item.rank}
            </span>

            <Link
              href={`/movie/${item.movieId}`}
              className="flex flex-1 items-center gap-4"
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

              <p className="flex-1 font-medium">
                {item.title}
              </p>

              {item.isWatched && (
                <span className="text-xs text-green-600">
                  ✓ Watched
                </span>
              )}
            </Link>

            {isOwner && (
              <ListItemControls
                listId={id}
                movieId={item.movieId}
                isFirst={i === 0}
                isLast={i === list.items.length - 1}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}