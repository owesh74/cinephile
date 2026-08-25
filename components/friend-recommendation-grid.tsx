import Link from "next/link";

type FriendRecMovie = {
    id: string;
    title: string;
    posterUrl: string | null;
    friendCount: number;
    avgScore: string;
};

type FriendRecommendationGridProps = {
    movies?: FriendRecMovie[];
};

export function FriendRecommendationGrid({
    movies = [],
}: FriendRecommendationGridProps) {
    if (movies.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm font-medium">
                    Nothing here yet.
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                    Recommendations from your friends will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            {movies.map((movie) => (
                <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    className="group space-y-2"
                >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted ring-1 ring-border transition-all duration-200 group-hover:-translate-y-1 group-hover:ring-primary/50">
                        {movie.posterUrl ? (
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                                No poster
                            </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

                        <div className="absolute bottom-2 left-2 right-2">
                            <div className="flex items-center justify-between gap-2 text-xs text-white">
                                <span>
                                    {movie.friendCount}{" "}
                                    {movie.friendCount === 1
                                        ? "friend"
                                        : "friends"}
                                </span>

                                <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono">
                                    {movie.avgScore}/10
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="truncate text-sm font-medium">
                        {movie.title}
                    </p>
                </Link>
            ))}
        </div>
    );
}