import { searchMovies } from "@/lib/data/search";
import Link from "next/link";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const results = q ? await searchMovies(q) : [];

    return (
        <div className="mx-auto w-full max-w-... space-y-... px-4 py-8 sm:px-6 sm:py-12">
            <div>
                <h1 className="text-2xl font-semibold">
                    Search results
                </h1>

                {q && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        Results for "{q}"
                    </p>
                )}
            </div>

            {!q && (
                <p className="text-sm text-muted-foreground">
                    Use the search box in the navigation bar to search for movies.
                </p>
            )}

            {q && results.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No movies found for "{q}".
                </p>
            )}

            <div className="space-y-2">
                {results.map((movie) => (
                    <Link
                        key={movie.id}
                        href={`/movie/${movie.id}`}
                        className="flex items-center gap-4 rounded-md border p-3 hover:bg-muted"
                    >
                        <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded bg-muted">
                            {movie.posterUrl ? (
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                    No poster
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="font-medium">
                                {movie.title}
                            </p>

                            {movie.releaseDate && (
                                <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        movie.releaseDate
                                    ).getFullYear()}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}