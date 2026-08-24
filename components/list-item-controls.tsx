"use client";

import { useTransition } from "react";
import { removeMovieFromListAction, reorderListMovieAction } from "@/lib/actions/lists";
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

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={pending || isFirst}
        onClick={() => startTransition(() => reorderListMovieAction(listId, movieId, "up"))}
      >
        ↑
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending || isLast}
        onClick={() => startTransition(() => reorderListMovieAction(listId, movieId, "down"))}
      >
        ↓
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => removeMovieFromListAction(listId, movieId))}
      >
        Remove
      </Button>
    </div>
  );
}