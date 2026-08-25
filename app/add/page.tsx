import { getPeople } from "@/lib/data/people";
import { AddMovieForm } from "@/components/add-movie-form";

export default async function AddMoviePage() {
  const people = await getPeople();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Cinephile library</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Add a movie
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Add a movie with its poster, metadata, people and cast. Cinephile
          will suggest existing people, genres and countries as you enter them.
        </p>
      </div>

      <AddMovieForm people={people} />
    </main>
  );
}