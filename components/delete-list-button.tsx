"use client";

import { useState, useTransition } from "react";

import { deleteListAction } from "@/lib/actions/lists";

import { Button } from "@/components/ui/button";

export function DeleteListButton({
    listId,
}: {
    listId: string;
}) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pending, startTransition] =
        useTransition();

    function handleDelete() {
        setError(null);

        startTransition(async () => {
            const result = await deleteListAction(listId);

            /*
             * deleteListAction redirects on success,
             * so this code only continues when there
             * is an error.
             */

            if (result?.error) {
                setError(result.error);
            }
        });
    }

    if (confirming) {
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                <div className="space-y-1">
                    <p className="text-sm font-semibold">
                        Delete this list?
                    </p>

                    <p className="text-sm text-muted-foreground">
                        This will permanently delete the list
                        and all movies saved inside it.
                    </p>

                    <p className="text-xs text-muted-foreground">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="mt-4 flex gap-2">
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={pending}
                    >
                        {pending
                            ? "Deleting..."
                            : "Delete list"}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setConfirming(false)
                        }
                        disabled={pending}
                    >
                        Keep list
                    </Button>
                </div>

                {error && (
                    <p className="mt-3 text-sm text-red-500">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirming(true)}
        >
            Delete list
        </Button>
    );
}