import { db } from "./index";
import { achievements } from "./schema";

async function main() {
  const rows = [
    {
      key: "first_movie",
      name: "First Movie",
      description: "Watch your first movie.",
      criteriaType: "movie_count",
      criteriaValue: { count: 1 },
    },
    {
      key: "ten_movies",
      name: "10 Movies",
      description: "Watch 10 movies.",
      criteriaType: "movie_count",
      criteriaValue: { count: 10 },
    },
    {
      key: "hundred_movies",
      name: "100 Movies",
      description: "Watch 100 movies.",
      criteriaType: "movie_count",
      criteriaValue: { count: 100 },
    },
    {
      key: "five_hundred_movies",
      name: "500 Movies",
      description: "Watch 500 movies.",
      criteriaType: "movie_count",
      criteriaValue: { count: 500 },
    },
    {
      key: "around_the_world",
      name: "Around the World",
      description: "Watch movies from 15 different countries.",
      criteriaType: "countries_count",
      criteriaValue: { count: 15 },
    },
    {
      key: "horror_fan",
      name: "Horror Fan",
      description: "Watch 10 horror movies.",
      criteriaType: "genre_watch_count",
      criteriaValue: { genre: "Horror", count: 10 },
    },
    {
      key: "genre_explorer",
      name: "Genre Explorer",
      description: "Watch movies across 8 different genres.",
      criteriaType: "genres_explored_count",
      criteriaValue: { count: 8 },
    },
    {
      key: "time_traveler",
      name: "Time Traveler",
      description: "Watch movies from 5 different decades.",
      criteriaType: "decades_explored_count",
      criteriaValue: { count: 5 },
    },
    {
      key: "director_completionist",
      name: "Director Completionist",
      description: "Watch every movie in the catalog by a single director.",
      criteriaType: "director_completionist",
      criteriaValue: null,
    },
    {
      key: "list_completionist",
      name: "List Completionist",
      description: "Complete a curated list.",
      criteriaType: "list_completed_count",
      criteriaValue: { count: 1 },
    },
  ];

  await db.insert(achievements).values(rows).onConflictDoNothing({ target: achievements.key });

  console.log(`Seeded ${rows.length} achievements.`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});