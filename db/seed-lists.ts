import { db } from "./index";
import { lists, listMovies, movies } from "./schema";

async function main() {
  const allMovies = await db.select().from(movies);

  if (allMovies.length === 0) {
    console.log("No movies found — run db/seed.ts first.");
    return;
  }

  const [list] = await db
    .insert(lists)
    .values({
      title: "Essential Watches",
      description: "A small starter list — swap this out once you have a real catalog.",
      size: 10, // nearest supported size bucket even though we only have a few entries
      isSystem: true,
      ownerId: null,
    })
    .returning();

  const entries = allMovies.map((m, i) => ({
    listId: list.id,
    movieId: m.id,
    rank: i + 1,
  }));

  await db.insert(listMovies).values(entries);

  console.log(`Seeded list "${list.title}" with ${entries.length} movies.`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});