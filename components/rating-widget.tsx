"use client";

import { useState, useTransition } from "react";

import {
  rateMovieAction,
  removeRatingAction,
} from "@/lib/actions/ratings";

import { Button } from "@/components/ui/button";

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
    startTransition(() => rateMovieAction(movieId, value));
  }

  function handleClear() {
    setScore(null);
    startTransition(() => removeRatingAction(movieId));
  }

  const display = hovered ?? score;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          disabled={pending}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleRate(n)}
          className={`h-6 w-6 rounded text-xs font-mono ${
            display !== null && n <= display
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted-2"
          }`}
        >
          {n}
        </button>
      ))}

      {score !== null && (
        <button
          onClick={handleClear}
          className="ml-2 text-xs text-muted-foreground underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}