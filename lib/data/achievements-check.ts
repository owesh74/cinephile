import { db } from "@/db";
import {
  achievements,
  userAchievements,
  watched,
  movies,
  movieGenres,
  genres,
  movieCountries,
  movieCast,
  activities,
} from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";

type Achievement = typeof achievements.$inferSelect;

async function getWatchedSignals(userId: string) {
  const watchedRows = await db
    .select({ movieId: watched.movieId })
    .from(watched)
    .where(eq(watched.userId, userId));
  const watchedIds = watchedRows.map((r) => r.movieId);

  if (watchedIds.length === 0) {
    return {
      watchedCount: 0,
      countryCount: 0,
      decadeCount: 0,
      genreCount: 0,
      horrorCount: 0,
      directorIds: new Set<string>(),
    };
  }

  const [countryRows, genreRows, watchedMovies, castRows] = await Promise.all([
    db
      .selectDistinct({ countryId: movieCountries.countryId })
      .from(movieCountries)
      .where(inArray(movieCountries.movieId, watchedIds)),
    db
      .select({ name: genres.name, movieId: movieGenres.movieId })
      .from(movieGenres)
      .innerJoin(genres, eq(movieGenres.genreId, genres.id))
      .where(inArray(movieGenres.movieId, watchedIds)),
    db
      .select({ releaseDate: movies.releaseDate })
      .from(movies)
      .where(inArray(movies.id, watchedIds)),
    db
      .select({ personId: movieCast.personId, movieId: movieCast.movieId })
      .from(movieCast)
      .where(and(inArray(movieCast.movieId, watchedIds), eq(movieCast.role, "director"))),
  ]);

  const decadeSet = new Set(
    watchedMovies
      .map((m) => m.releaseDate)
      .filter(Boolean)
      .map((d) => Math.floor(new Date(d as string).getFullYear() / 10) * 10)
  );

  const genreNameSet = new Set(genreRows.map((g) => g.name));
  const horrorCount = new Set(
    genreRows.filter((g) => g.name === "Horror").map((g) => g.movieId)
  ).size;

  const directorIds = new Set(castRows.map((c) => c.personId));

  return {
    watchedCount: watchedIds.length,
    countryCount: countryRows.length,
    decadeCount: decadeSet.size,
    genreCount: genreNameSet.size,
    horrorCount,
    directorIds,
    watchedIds,
    castRows,
  };
}

async function checkDirectorCompletionist(
  userId: string,
  directorIds: Set<string>
): Promise<boolean> {
  if (directorIds.size === 0) return false;

  for (const directorId of directorIds) {
    const [allByDirector, watchedByDirector] = await Promise.all([
      db
        .select({ movieId: movieCast.movieId })
        .from(movieCast)
        .where(and(eq(movieCast.personId, directorId), eq(movieCast.role, "director"))),
      db
        .select({ movieId: movieCast.movieId })
        .from(movieCast)
        .innerJoin(watched, eq(watched.movieId, movieCast.movieId))
        .where(
          and(
            eq(movieCast.personId, directorId),
            eq(movieCast.role, "director"),
            eq(watched.userId, userId)
          )
        ),
    ]);

    // a director with only 1 movie in the catalog is a trivial "completion" —
    // require at least 2 movies by the director to count, so this actually means something
    if (allByDirector.length >= 2 && allByDirector.length === watchedByDirector.length) {
      return true;
    }
  }

  return false;
}

async function meetsCriteria(
  achievement: Achievement,
  userId: string,
  signals: Awaited<ReturnType<typeof getWatchedSignals>>
): Promise<boolean> {
  const value = (achievement.criteriaValue ?? {}) as Record<string, number | string>;

  switch (achievement.criteriaType) {
    case "movie_count":
      return signals.watchedCount >= (value.count as number);
    case "countries_count":
      return signals.countryCount >= (value.count as number);
    case "decades_explored_count":
      return signals.decadeCount >= (value.count as number);
    case "genres_explored_count":
      return signals.genreCount >= (value.count as number);
    case "genre_watch_count":
      // only "Horror" is wired up today — extend this if you add genre-specific
      // achievements for other genres later
      if (value.genre === "Horror") {
        return signals.horrorCount >= (value.count as number);
      }
      return false;
    case "director_completionist":
      return checkDirectorCompletionist(userId, signals.directorIds);
    case "list_completed_count": {
      const completed = await db
        .selectDistinct({ listId: activities.listId })
        .from(activities)
        .where(and(eq(activities.userId, userId), eq(activities.type, "list_completed")));
      return completed.length >= (value.count as number);
    }
    default:
      return false;
  }
}

export async function checkAndAwardAchievements(userId: string) {
  const [allAchievements, alreadyUnlocked, signals] = await Promise.all([
    db.select().from(achievements),
    db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId)),
    getWatchedSignals(userId),
  ]);

  const unlockedIds = new Set(alreadyUnlocked.map((r) => r.achievementId));
  const candidates = allAchievements.filter((a) => !unlockedIds.has(a.id));

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of candidates) {
    const met = await meetsCriteria(achievement, userId, signals);
    if (met) {
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    await db
      .insert(userAchievements)
      .values(newlyUnlocked.map((a) => ({ userId, achievementId: a.id })))
      .onConflictDoNothing();
  }

  return newlyUnlocked;
}

export async function getUserAchievements(userId: string) {
  return db
    .select({
      id: achievements.id,
      key: achievements.key,
      name: achievements.name,
      description: achievements.description,
      unlockedAt: userAchievements.unlockedAt,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId));
}

export async function getAllAchievementsWithStatus(userId: string) {
  const [all, unlocked] = await Promise.all([
    db.select().from(achievements),
    getUserAchievements(userId),
  ]);

  const unlockedMap = new Map(unlocked.map((u) => [u.id, u.unlockedAt]));

  return all.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }));
}