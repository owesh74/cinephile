import { getUserScore } from "@/lib/data/score";

export async function ScoreBadge({
  userId,
}: {
  userId: string;
}) {
  const { score, level } = await getUserScore(userId);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
        level.next === null
          ? "shadow-[0_0_12px_-2px_theme(colors.secondary)]"
          : ""
      }`}
    >
      <span className="text-sm font-medium text-foreground">
        {level.name}
      </span>

      <span className="font-mono text-xs text-secondary">
        {score} pts
      </span>

      {level.next && (
        <span className="text-xs text-muted-foreground">
          · {level.next.pointsAway} to {level.next.name}
        </span>
      )}
    </div>
  );
}