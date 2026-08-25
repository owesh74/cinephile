import Link from "next/link";
import { getPeople } from "@/lib/data/people";

export default async function PeopleBrowsePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const query = q?.trim() ?? "";

    const people = await getPeople(query);

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    People
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Discover actors, directors, and writers.
                </p>
            </div>

            {/* SEARCH */}
            <form
                action="/people/browse"
                method="GET"
                className="w-full"
            >
                <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Search people..."
                    className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                />
            </form>

            {/* EMPTY STATE */}
            {people.length === 0 ? (
                <div className="rounded-lg border border-border p-8 text-center">
                    <p className="font-medium">
                        No people found
                    </p>

                    {query && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Nothing matched "{query}".
                        </p>
                    )}
                </div>
            ) : (
                /* PEOPLE GRID */
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5">
                    {people.map((person) => (
                        <Link
                            key={person.id}
                            href={`/people/${person.id}`}
                            className="group min-w-0"
                        >
                            <div className="mx-auto aspect-square w-full max-w-28 overflow-hidden rounded-full bg-muted sm:max-w-36 md:max-w-40">
                                {person.photoUrl ? (
                                    <img
                                        src={person.photoUrl}
                                        alt={person.name}
                                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground sm:text-4xl">
                                        {person.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <p className="mt-2 truncate text-center text-sm font-medium group-hover:underline sm:mt-3">
                                {person.name}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}