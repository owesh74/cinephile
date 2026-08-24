import { getMovieById } from "@/lib/data/movies";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditMovieForm } from "@/components/edit-movie-form";

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

    const releaseYear = movie.releaseDate
        ? new Date(movie.releaseDate)
              .getFullYear()
              .toString()
        : "";

    const directors = movie.directors
        .map((director) => director.name)
        .join(", ");

    const writers = movie.writers
        .map((writer) => writer.name)
        .join(", ");

    const cast = movie.cast
        .map((person) =>
            person.characterName
                ? `${person.name} as ${person.characterName}`
                : person.name
        )
        .join(", ");

    return (
        <div className="mx-auto max-w-2xl space-y-8 py-16">

            {/* Header */}
            <div className="flex items-center justify-between">

                <h1 className="text-2xl font-semibold">
                    Edit movie
                </h1>

                <Link
                    href={`/movie/${movie.id}`}
                    className="text-sm underline"
                >
                    Cancel
                </Link>

            </div>

            <EditMovieForm
                movieId={movie.id}
                title={movie.title}
                originalTitle={movie.originalTitle}
                posterUrl={movie.posterUrl}
                releaseYear={releaseYear}
                runtimeMinutes={movie.runtimeMinutes}
                description={movie.description}
                language={movie.language}
                imdbScore={movie.imdbScore}
                genres={movie.genres}
                countries={movie.countries}
                director={directors}
                writers={writers}
                cast={cast}
            />

        </div>
    );
}