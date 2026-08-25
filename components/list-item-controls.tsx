"use client";

import { useTransition } from "react";

import {
    removeMovieFromListAction,
    reorderListMovieAction,
} from "@/lib/actions/lists";

import { Button } from "@/components/ui/button";

export function ListItemControls({
    listId,
    movieId,
    isFirst,
    isLast,
}: {
    listId: string;
    movieId: string;
    isFirst: boolean;
    isLast: boolean;
}) {
    const [pending, startTransition] = useTransition();

    function moveUp() {
        startTransition(async () => {
            await reorderListMovieAction(
                listId,
                movieId,
                "up"
            );
        });
    }

    function moveDown() {
        startTransition(async () => {
            await reorderListMovieAction(
                listId,
                movieId,
                "down"
            );
        });
    }

    function removeMovie() {
        startTransition(async () => {
            await removeMovieFromListAction(
                listId,
                movieId
            );
        });
    }

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="sm"
                disabled={pending || isFirst}
                onClick={moveUp}
                aria-label="Move movie up"
            >
                ↑
            </Button>

            <Button
                variant="ghost"
                size="sm"
                disabled={pending || isLast}
                onClick={moveDown}
                aria-label="Move movie down"
            >
                ↓
            </Button>

            <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={removeMovie}
            >
                {pending ? "..." : "Remove"}
            </Button>
        </div>
    );
}