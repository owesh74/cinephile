import { getPeople } from "@/lib/data/people";
import { updatePersonPhotoAction } from "@/lib/actions/people";

export default async function PeoplePage() {
    const people = await getPeople();

    return (
        <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    People
                </h1>

                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                    Add photos for actors, directors, and writers in your
                    movie database.
                </p>
            </div>

            {people.length === 0 ? (
                <div className="rounded-lg border border-border p-8 text-center">
                    <p className="font-medium">No people yet</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Add a movie with a director or cast member first.
                    </p>
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {people.map((person) => (
                        <div
                            key={person.id}
                            className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                        >
                            {/* PHOTO */}
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted sm:h-20 sm:w-20">
                                {person.photoUrl ? (
                                    <img
                                        src={person.photoUrl}
                                        alt={person.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground sm:text-2xl">
                                        {person.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* INFO */}
                            <div className="min-w-0 flex-1">
                                <h2 className="font-medium">
                                    {person.name}
                                </h2>

                                <form
                                    action={async (formData) => {
                                        "use server";

                                        await updatePersonPhotoAction(
                                            person.id,
                                            formData
                                        );
                                    }}
                                    className="mt-3 flex flex-col gap-2 sm:flex-row"
                                >
                                    <input
                                        type="url"
                                        name="photoUrl"
                                        defaultValue={person.photoUrl ?? ""}
                                        placeholder="https://example.com/person.jpg"
                                        className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                                    />

                                    <button
                                        type="submit"
                                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                    >
                                        Save photo
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}