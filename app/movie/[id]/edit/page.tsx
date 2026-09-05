import { getMovieById } from "@/lib/data/movies";
import { getPeople } from "@/lib/data/people";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditMovieForm } from "@/components/edit-movie-form";

type MediaType = "movie" | "series" | "game";

export default async function EditMoviePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const movie = await getMovieById(id);

    if (!movie) {
        notFound();
    }

    const people = await getPeople();

    const mediaType: MediaType =
        movie.mediaType === "series"
            ? "series"
            : movie.mediaType === "game"
              ? "game"
              : "movie";

    const mediaLabel =
        mediaType === "series"
            ? "Series"
            : mediaType === "game"
              ? "Game"
              : "Movie";

    const releaseYear = movie.releaseDate
        ? new Date(movie.releaseDate).getFullYear().toString()
        : "";

    const directors = movie.directors
        .map((director) => director.name)
        .join(", ");

    const writers = movie.writers.map((writer) => writer.name);

    const cast = movie.cast.map((person) =>
        person.characterName
            ? `${person.name} as ${person.characterName}`
            : person.name,
    );

    return (
        <div className="mx-auto max-w-3xl space-y-8 py-12">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {mediaLabel} management
                    </p>

                    <h1 className="text-2xl font-semibold">
                        Edit {mediaLabel.toLowerCase()}
                    </h1>
                </div>

                <Link
                    href={`/movie/${movie.id}`}
                    className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                    Cancel
                </Link>
            </div>

            {/* Main media form */}
            <EditMovieForm
                movieId={movie.id}
                title={movie.title}
                originalTitle={movie.originalTitle}
                posterUrl={movie.posterUrl}
                mediaType={mediaType}
                releaseYear={releaseYear}
                runtimeMinutes={movie.runtimeMinutes}
                seasonCount={movie.seasonCount}
                episodeCount={movie.episodeCount}
                description={movie.description}
                language={movie.language}
                imdbScore={movie.imdbScore}
                genres={movie.genres}
                countries={movie.countries}
                director={directors}
                writers={writers}
                cast={cast}
                people={people}
            />
        </div>
    );
}