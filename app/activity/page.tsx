import { requireUser } from "@/lib/auth/require-user";
import { getFriendActivityFeed } from "@/lib/data/activity";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import Link from "next/link";

function describeActivity(
  item: Awaited<ReturnType<typeof getFriendActivityFeed>>[number]
) {
  switch (item.type) {
    case "watched":
      return (
        <>
          marked{" "}
          <Link
            href={`/movie/${item.movieId}`}
            className="font-medium underline"
          >
            {item.movieTitle}
          </Link>{" "}
          as watched
        </>
      );

    case "rated": {
      const score = (
        item.metadata as { score?: number } | null
      )?.score;

      return (
        <>
          rated{" "}
          <Link
            href={`/movie/${item.movieId}`}
            className="font-medium underline"
          >
            {item.movieTitle}
          </Link>{" "}
          {score ? `${score}/10` : ""}
        </>
      );
    }

    case "watchlisted":
      return (
        <>
          added{" "}
          <Link
            href={`/movie/${item.movieId}`}
            className="font-medium underline"
          >
            {item.movieTitle}
          </Link>{" "}
          to their watchlist
        </>
      );

    case "list_completed":
      return (
        <>
          completed the list{" "}
          <Link
            href={`/lists/${item.listId}`}
            className="font-medium underline"
          >
            {item.listTitle}
          </Link>
        </>
      );

    default:
      return null;
  }
}

export default async function ActivityPage() {
  const user = await requireUser();
  const feed = await getFriendActivityFeed(user.id);

  return (
        <div className="mx-auto w-full max-w-... space-y-... px-4 py-8 sm:px-6 sm:py-12">

      <h1 className="text-2xl font-semibold">
        Friend Activity
      </h1>
      <div className="h-4" />

      {feed.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing to show yet — once you have friends and they watch,
          rate, or list-complete movies, it'll show up here.
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-md border p-3 text-sm"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={item.avatarUrl ?? undefined}
                />
                <AvatarFallback>
                  {item.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <p>
                  <Link
                    href={`/user/${item.username}`}
                    className="font-medium"
                  >
                    {item.username}
                  </Link>{" "}
                  {describeActivity(item)}
                </p>

                <p className="text-xs text-muted-foreground">
                  {item.createdAt.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}