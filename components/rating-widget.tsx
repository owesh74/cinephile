"use client";

import { useState, useTransition } from "react";

import {
    rateMovieAction,
    removeRatingAction,
} from "@/lib/actions/ratings";

export function RatingWidget({
    movieId,
    initialScore,
}: {
    movieId: string;
    initialScore: number | null;
}) {
    const [score, setScore] = useState(initialScore);
    const [hovered, setHovered] = useState<number | null>(null);
    const [pending, startTransition] = useTransition();

    function handleRate(value: number) {
        setScore(value);

        startTransition(async () => {
            await rateMovieAction(movieId, value);
        });
    }

    function handleClear() {
        setScore(null);

        startTransition(async () => {
            await removeRatingAction(movieId);
        });
    }

    const display = hovered ?? score;

    return (
        <div className="flex items-center gap-1">
            {Array.from(
                { length: 10 },
                (_, i) => i + 1
            ).map((n) => (
                <button
                    key={n}
                    type="button"
                    disabled={pending}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleRate(n)}
                    className={`h-6 w-6 rounded text-xs font-mono ${
                        display !== null && n <= display
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    aria-label={`Rate ${n} out of 10`}
                >
                    {n}
                </button>
            ))}

            {score !== null && (
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={pending}
                    className="ml-2 text-xs text-muted-foreground underline hover:text-foreground disabled:opacity-50"
                >
                    {pending ? "..." : "Clear"}
                </button>
            )}
        </div>
    );
}