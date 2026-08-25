import { getMovieById } from "@/lib/data/movies";
import { getPeople } from "@/lib/data/people";
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

  // Load all existing people so the edit form
  // can provide actor/director/writer suggestions.
  const people = await getPeople();

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
      : person.name
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Movie management
          </p>

          <h1 className="text-2xl font-semibold">
            Edit movie
          </h1>
        </div>

        <Link
          href={`/movie/${movie.id}`}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          Cancel
        </Link>
      </div>

      {/* Edit form */}
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
        people={people}
      />
    </div>
  );
}