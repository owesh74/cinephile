import { getAllAchievementsWithStatus } from "@/lib/data/achievements-check";

export async function AchievementsGrid({
  userId,
}: {
  userId: string;
}) {
  const items = await getAllAchievementsWithStatus(userId);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((a) => (
        <div
          key={a.id}
          className={`rounded-md border p-3 text-sm ${
            a.unlocked
              ? "border-primary/40"
              : "opacity-40 grayscale"
          }`}
        >
          <p className="font-medium">{a.name}</p>

          <p className="text-xs text-muted-foreground">
            {a.description}
          </p>

          {a.unlocked && a.unlockedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Unlocked {a.unlockedAt.toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}