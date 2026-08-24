import Link from "next/link";
import Image from "next/image";
import { getComparisonStats, getFriendRecommendations } from "@/lib/data/compare";

export async function FriendComparison({
  userId,
  friendId,
  friendUsername,
}: {
  userId: string;
  friendId: string;
  friendUsername: string;
}) {
  const [stats, recommendations] = await Promise.all([
    getComparisonStats(userId, friendId),
    getFriendRecommendations(userId, friendId),
  ]);

  return (
    <div className="space-y-6 rounded-md border p-4">
      <h2 className="text-lg font-medium">You vs {friendUsername}</h2>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-semibold">{stats.myTotal}</p>
          <p className="text-xs text-muted-foreground">You've watched</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{stats.sharedCount}</p>
          <p className="text-xs text-muted-foreground">Watched by both</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{stats.theirTotal}</p>
          <p className="text-xs text-muted-foreground">{friendUsername} has watched</p>
        </div>
      </div>

      {stats.theyHaveYouDontMovies.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {friendUsername} has watched ({stats.theyHaveYouDontCount}) you haven't
          </p>
          <div className="flex flex-wrap gap-3">
            {stats.theyHaveYouDontMovies.map((m) => (
              <Link key={m.id} href={`/movie/${m.id}`} className="w-16 text-center text-xs">
                <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted">
                  {m.posterUrl && (
                    <Image src={m.posterUrl} alt={m.title} fill className="object-cover" />
                  )}
                </div>
                <p className="mt-1 truncate">{m.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{friendUsername} rated these highly</p>
          <div className="flex flex-wrap gap-3">
            {recommendations.map((r) => (
              <Link
                key={r.movieId}
                href={`/movie/${r.movieId}`}
                className="w-16 text-center text-xs"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted">
                  {r.posterUrl && (
                    <Image src={r.posterUrl} alt={r.title} fill className="object-cover" />
                  )}
                </div>
                <p className="mt-1 truncate">{r.title}</p>
                <p className="text-muted-foreground">{r.score}/10</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}