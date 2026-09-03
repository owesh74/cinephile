"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";

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
        <div
            className="flex items-center gap-1.5"
            onMouseLeave={() => setHovered(null)}
        >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const active =
                    display !== null && n <= display;

                const selected = score === n;

                return (
                    <button
                        key={n}
                        type="button"
                        disabled={pending}
                        onMouseEnter={() => setHovered(n)}
                        onClick={() => handleRate(n)}
                        aria-label={`Rate ${n} out of 10`}
                        aria-pressed={selected}
                        className={`
                            group relative flex h-7 w-7
                            items-center justify-center
                            transition-all duration-150
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            hover:scale-110
                            focus-visible:outline-2
                            focus-visible:outline-offset-2
                            focus-visible:outline-primary
                            ${
                                active
                                    ? "text-primary"
                                    : "text-muted-foreground/40 hover:text-primary/70"
                            }
                            ${
                                selected
                                    ? "drop-shadow-[0_0_6px_rgba(232,163,61,0.45)]"
                                    : ""
                            }
                        `}
                    >
                        <Star
                            className="absolute h-8 w-8"
                            fill="currentColor"
                            strokeWidth={1.5}
                        />

                        <span className="relative z-10 text-[11px] font-semibold text-background">
                            {n}
                        </span>
                    </button>
                );
            })}

            {score !== null && (
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={pending}
                    className="ml-2 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                    {pending ? "..." : "Clear"}
                </button>
            )}
        </div>
    );
}