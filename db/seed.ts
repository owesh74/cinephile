import { db } from "./index";
import { movies, genres, countries, people, movieGenres, movieCountries, movieCast } from "./schema";

async function main() {
  console.log("Seeding genres...");
  const genreRows = await db
    .insert(genres)
    .values(
      ["Drama", "Sci-Fi", "Thriller", "Crime", "Horror", "Animation", "Comedy"].map((name) => ({
        name,
      }))
    )
    .onConflictDoNothing()
    .returning();

  console.log("Seeding countries...");
  const countryRows = await db
    .insert(countries)
    .values([
      { name: "United States", code: "US" },
      { name: "India", code: "IN" },
      { name: "South Korea", code: "KR" },
      { name: "United Kingdom", code: "GB" },
    ])
    .onConflictDoNothing()
    .returning();

  console.log("Seeding people...");
  const peopleRows = await db
    .insert(people)
    .values([
      { name: "Christopher Nolan" },
      { name: "Matthew McConaughey" },
      { name: "Anne Hathaway" },
      { name: "Bong Joon-ho" },
      { name: "Song Kang-ho" },
      { name: "Francis Ford Coppola" },
      { name: "Marlon Brando" },
      { name: "Al Pacino" },
    ])
    .onConflictDoNothing()
    .returning();

  const findGenre = (n: string) => genreRows.find((g) => g.name === n)!.id;
  const findCountry = (n: string) => countryRows.find((c) => c.name === n)!.id;
  const findPerson = (n: string) => peopleRows.find((p) => p.name === n)!.id;

  console.log("Seeding movies...");

  const [interstellar] = await db
    .insert(movies)
    .values({
      title: "Interstellar",
      releaseDate: "2014-11-07",
      runtimeMinutes: 169,
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      language: "English",
      imdbScore: "8.7",
    })
    .returning();

  const [parasite] = await db
    .insert(movies)
    .values({
      title: "Parasite",
      originalTitle: "기생충",
      releaseDate: "2019-05-30",
      runtimeMinutes: 132,
      description:
        "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
      language: "Korean",
      imdbScore: "8.5",
    })
    .returning();

  const [godfather] = await db
    .insert(movies)
    .values({
      title: "The Godfather",
      releaseDate: "1972-03-24",
      runtimeMinutes: 175,
      description:
        "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      language: "English",
      imdbScore: "9.2",
    })
    .returning();

  console.log("Linking genres/countries/cast...");

  await db.insert(movieGenres).values([
    { movieId: interstellar.id, genreId: findGenre("Sci-Fi") },
    { movieId: interstellar.id, genreId: findGenre("Drama") },
    { movieId: parasite.id, genreId: findGenre("Thriller") },
    { movieId: parasite.id, genreId: findGenre("Drama") },
    { movieId: godfather.id, genreId: findGenre("Crime") },
    { movieId: godfather.id, genreId: findGenre("Drama") },
  ]);

  await db.insert(movieCountries).values([
    { movieId: interstellar.id, countryId: findCountry("United States") },
    { movieId: parasite.id, countryId: findCountry("South Korea") },
    { movieId: godfather.id, countryId: findCountry("United States") },
  ]);

  await db.insert(movieCast).values([
    { movieId: interstellar.id, personId: findPerson("Christopher Nolan"), role: "director" },
    {
      movieId: interstellar.id,
      personId: findPerson("Matthew McConaughey"),
      role: "actor",
      characterName: "Cooper",
      billingOrder: 1,
    },
    {
      movieId: interstellar.id,
      personId: findPerson("Anne Hathaway"),
      role: "actor",
      characterName: "Brand",
      billingOrder: 2,
    },
    { movieId: parasite.id, personId: findPerson("Bong Joon-ho"), role: "director" },
    {
      movieId: parasite.id,
      personId: findPerson("Song Kang-ho"),
      role: "actor",
      characterName: "Kim Ki-taek",
      billingOrder: 1,
    },
    { movieId: godfather.id, personId: findPerson("Francis Ford Coppola"), role: "director" },
    {
      movieId: godfather.id,
      personId: findPerson("Marlon Brando"),
      role: "actor",
      characterName: "Vito Corleone",
      billingOrder: 1,
    },
    {
      movieId: godfather.id,
      personId: findPerson("Al Pacino"),
      role: "actor",
      characterName: "Michael Corleone",
      billingOrder: 2,
    },
  ]);

  console.log("Done.");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});