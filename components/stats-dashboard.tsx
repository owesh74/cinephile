import { getUserStats } from "@/lib/data/stats";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-3 text-center">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function BreakdownList({ title, rows }: { title: string; rows: { name: string; count: number }[] }) {
  const sorted = [...rows].sort((a, b) => b.count - a.count).slice(0, 8);
  if (sorted.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <div className="space-y-1">
        {sorted.map((row) => (
          <div key={row.name} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.name}</span>
            <span className="font-medium">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function StatsDashboard({ userId }: { userId: string }) {
  const stats = await getUserStats(userId);

  if (stats.moviesWatched === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No stats yet — mark a few movies watched to start building your Cinema Journey.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Movies" value={stats.moviesWatched} />
        <StatCard label="Countries" value={stats.countries.length} />
        <StatCard label="Languages" value={stats.languages.length} />
        <StatCard label="Genres" value={stats.genres.length} />
        <StatCard label="Decades" value={stats.decades.length} />
        <StatCard label="Directors" value={stats.directors.length} />
        <StatCard label="Avg. Rating Given" value={stats.avgRatingGiven ?? "—"} />
        <StatCard
          label="Favorite Genre"
          value={stats.favoriteGenre?.name ?? "—"}
        />
      </div>

      {(stats.favoriteCountry || stats.favoriteDecade) && (
        <div className="flex flex-wrap gap-6 text-sm">
          {stats.favoriteCountry && (
            <p>
              <span className="text-muted-foreground">Favorite country: </span>
              <span className="font-medium">{stats.favoriteCountry.name}</span>
            </p>
          )}
          {stats.favoriteDecade && (
            <p>
              <span className="text-muted-foreground">Favorite decade: </span>
              <span className="font-medium">{stats.favoriteDecade.name}</span>
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <BreakdownList title="Genres" rows={stats.genres} />
        <BreakdownList title="Countries" rows={stats.countries} />
        <BreakdownList title="Languages" rows={stats.languages} />
        <BreakdownList title="Decades" rows={stats.decades} />
        <BreakdownList title="Directors" rows={stats.directors} />
      </div>

      {stats.moviesPerYear.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Movies logged per year</p>
          <div className="flex items-end gap-2">
            {stats.moviesPerYear.map((row) => {
              const max = Math.max(...stats.moviesPerYear.map((r) => r.count));
              const heightPct = Math.max((row.count / max) * 100, 8);
              return (
                <div key={row.year} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 rounded-t bg-muted-foreground/30"
                    style={{ height: `${heightPct}px`, minHeight: "8px" }}
                  />
                  <p className="text-xs text-muted-foreground">{row.year}</p>
                  <p className="text-xs font-medium">{row.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}