import { requireUser } from "@/lib/auth/require-user";
import { createListAction } from "@/lib/actions/lists";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LIST_SIZES } from "@/lib/validations/list";

export default async function CreateListPage() {
    await requireUser();

    async function handleCreateList(formData: FormData) {
        "use server";

        const result = await createListAction(formData);

        if (result?.error) {
            throw new Error(result.error);
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="mb-6">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">
                        Your collection
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                        Create a list
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Give your list a title and choose how many
                        movies it can contain. You can add and rank
                        movies on the next page.
                    </p>
                </div>

                <form
                    action={handleCreateList}
                    className="space-y-5"
                >
                    <div>
                        <label
                            htmlFor="title"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            List title
                        </label>

                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g. My Top 10 Movies"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            placeholder="What is this list about?"
                            rows={4}
                            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="size"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            List size
                        </label>

                        <select
                            id="size"
                            name="size"
                            defaultValue="10"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                        >
                            {LIST_SIZES.map((size) => (
                                <option
                                    key={size}
                                    value={size}
                                >
                                    Top {size}
                                </option>
                            ))}
                        </select>

                        <p className="mt-1.5 text-xs text-muted-foreground">
                            Choose the maximum number of movies
                            this list can contain.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                    >
                        Create list
                    </Button>
                </form>
            </div>
        </div>
    );
}