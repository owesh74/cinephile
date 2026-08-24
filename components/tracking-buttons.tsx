"use client";

import { useState, useTransition } from "react";

import {
  toggleWatchlistAction,
  toggleWatchedAction,
} from "@/lib/actions/tracking";

import { Button } from "@/components/ui/button";

export function TrackingButtons({
  movieId,
  initialOnWatchlist,
  initialWatched,
}: {
  movieId: string;
  initialOnWatchlist: boolean;
  initialWatched: boolean;
}) {
  const [onWatchlist, setOnWatchlist] = useState(initialOnWatchlist);
  const [isWatched, setIsWatched] = useState(initialWatched);
  const [pending, startTransition] = useTransition();

  function handleWatchlist() {
    const next = !onWatchlist;
    setOnWatchlist(next);
    startTransition(() =>
      toggleWatchlistAction(movieId, onWatchlist)
    );
  }

  function handleWatched() {
    const next = !isWatched;
    setIsWatched(next);
    startTransition(() =>
      toggleWatchedAction(movieId, isWatched)
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={onWatchlist ? "default" : "outline"}
        size="sm"
        onClick={handleWatchlist}
        disabled={pending}
        className={
          onWatchlist
            ? "bg-secondary text-secondary-foreground"
            : undefined
        }
      >
        {onWatchlist ? "On Watchlist" : "Add to Watchlist"}
      </Button>

      <Button
        variant={isWatched ? "default" : "outline"}
        size="sm"
        onClick={handleWatched}
        disabled={pending}
        className={
          isWatched
            ? "bg-secondary text-secondary-foreground"
            : undefined
        }
      >
        {isWatched ? "Watched" : "Mark as Watched"}
      </Button>
    </div>
  );
}