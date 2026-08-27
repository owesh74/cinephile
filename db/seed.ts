import { db } from "./index";
import {
  movies,
  genres,
  countries,
  people,
  movieGenres,
  movieCountries,
  movieCast,
} from "./schema";
import { eq } from "drizzle-orm";

type MovieSeed = {
  title: string;
  originalTitle?: string;
  releaseDate: string;
  runtimeMinutes: number;
  description: string;
  language: string;
  imdbScore: string;
  genres: string[];
  country: {
    name: string;
    code: string;
  };
  director: string;
  writers: string[];
  cast: {
    name: string;
    characterName: string;
  }[];
};

async function getOrCreateGenre(name: string) {
  const existing = await db
    .select()
    .from(genres)
    .where(eq(genres.name, name))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const [created] = await db
    .insert(genres)
    .values({ name })
    .returning();

  return created.id;
}

async function getOrCreateCountry(name: string, code: string) {
  const existing = await db
    .select()
    .from(countries)
    .where(eq(countries.code, code))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const [created] = await db
    .insert(countries)
    .values({ name, code })
    .returning();

  return created.id;
}

async function getOrCreatePerson(name: string) {
  const existing = await db
    .select()
    .from(people)
    .where(eq(people.name, name))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const [created] = await db
    .insert(people)
    .values({ name })
    .returning();

  return created.id;
}

async function getOrCreateMovie(movie: MovieSeed) {
  const existing = await db
    .select()
    .from(movies)
    .where(eq(movies.title, movie.title))
    .limit(1);

  if (existing[0]) {
    console.log(`Movie already exists: ${movie.title}`);
    return existing[0];
  }

  const [created] = await db
    .insert(movies)
    .values({
      title: movie.title,
      originalTitle: movie.originalTitle,
      releaseDate: movie.releaseDate,
      runtimeMinutes: movie.runtimeMinutes,
      description: movie.description,
      language: movie.language,
      imdbScore: movie.imdbScore,
      posterUrl: null,
      backdropUrl: null,
    })
    .returning();

  return created;
}

const movieData: MovieSeed[] = [
  
  {
    title: "Zootopia",
    releaseDate: "2016-03-04",
    runtimeMinutes: 108,
    description: "Zootopia — add the movie/series description here.",
    language: "English",
    imdbScore: "8.0",
    genres: ["Animation", "Adventure", "Comedy"],
    country: { name: "United States", code: "US" },
    director: "Byron Howard",
    writers: ["Jared Bush", "Phil Johnston"],
    cast: [
      { name: "Ginnifer Goodwin", characterName: "Judy Hopps" },
      { name: "Jason Bateman", characterName: "Nick Wilde" },
      { name: "Idris Elba", characterName: "Chief Bogo" },
      { name: "Jenny Slate", characterName: "Bellwether" },
    ],
  },

  {
    title: "Kung Fu Panda",
    releaseDate: "2008-06-06",
    runtimeMinutes: 92,
    description: "Kung Fu Panda — add the movie/series description here.",
    language: "English",
    imdbScore: "7.6",
    genres: ["Animation", "Action", "Adventure"],
    country: { name: "United States", code: "US" },
    director: "Mark Osborne",
    writers: ["Jonathan Aibel", "Glenn Berger"],
    cast: [
      { name: "Jack Black", characterName: "Po" },
      { name: "Dustin Hoffman", characterName: "Master Shifu" },
      { name: "Angelina Jolie", characterName: "Tigress" },
      { name: "Ian McShane", characterName: "Tai Lung" },
    ],
  },

  {
    title: "Kung Fu Panda 2",
    releaseDate: "2011-05-26",
    runtimeMinutes: 91,
    description: "Kung Fu Panda 2 — add the movie/series description here.",
    language: "English",
    imdbScore: "7.2",
    genres: ["Animation", "Action", "Adventure"],
    country: { name: "United States", code: "US" },
    director: "Jennifer Yuh Nelson",
    writers: ["Jonathan Aibel", "Glenn Berger"],
    cast: [
      { name: "Jack Black", characterName: "Po" },
      { name: "Angelina Jolie", characterName: "Tigress" },
      { name: "Gary Oldman", characterName: "Lord Shen" },
      { name: "Dustin Hoffman", characterName: "Shifu" },
    ],
  },

  {
    title: "Kung Fu Panda 3",
    releaseDate: "2016-01-29",
    runtimeMinutes: 95,
    description: "Kung Fu Panda 3 — add the movie/series description here.",
    language: "English",
    imdbScore: "7.1",
    genres: ["Animation", "Action", "Adventure"],
    country: { name: "United States", code: "US" },
    director: "Jennifer Yuh Nelson",
    writers: ["Jonathan Aibel", "Glenn Berger", "Alessandro Carloni"],
    cast: [
      { name: "Jack Black", characterName: "Po" },
      { name: "Bryan Cranston", characterName: "Li Shan" },
      { name: "Dustin Hoffman", characterName: "Shifu" },
      { name: "J. K. Simmons", characterName: "Kai" },
    ],
  },

  {
    title: "How to Train Your Dragon 2",
    releaseDate: "2014-06-13",
    runtimeMinutes: 102,
    description: "How to Train Your Dragon 2 — add the movie/series description here.",
    language: "English",
    imdbScore: "7.8",
    genres: ["Animation", "Action", "Adventure"],
    country: { name: "United States", code: "US" },
    director: "Dean DeBlois",
    writers: ["Dean DeBlois"],
    cast: [
      { name: "Jay Baruchel", characterName: "Hiccup" },
      { name: "Cate Blanchett", characterName: "Valka" },
      { name: "Gerard Butler", characterName: "Stoick" },
      { name: "Craig Ferguson", characterName: "Gobber" },
    ],
  },

  {
    title: "Spirited Away",
    releaseDate: "2001-07-20",
    runtimeMinutes: 125,
    description: "Spirited Away — add the movie/series description here.",
    language: "Japanese",
    imdbScore: "8.6",
    genres: ["Animation", "Adventure", "Fantasy"],
    country: { name: "Japan", code: "JP" },
    director: "Hayao Miyazaki",
    writers: ["Hayao Miyazaki"],
    cast: [
      { name: "Rumi Hiiragi", characterName: "Chihiro Ogino" },
      { name: "Miyu Irino", characterName: "Haku" },
      { name: "Mari Natsuki", characterName: "Yubaba" },
      { name: "Bunta Sugawara", characterName: "Kamaji" },
    ],
  },

  {
    title: "Your Name.",
    releaseDate: "2016-08-26",
    runtimeMinutes: 106,
    description: "Your Name. — add the movie/series description here.",
    language: "Japanese",
    imdbScore: "8.4",
    genres: ["Animation", "Drama", "Fantasy"],
    country: { name: "Japan", code: "JP" },
    director: "Makoto Shinkai",
    writers: ["Makoto Shinkai"],
    cast: [
      { name: "Ryunosuke Kamiki", characterName: "Taki Tachibana" },
      { name: "Mone Kamishiraishi", characterName: "Mitsuha Miyamizu" },
      { name: "Masami Nagasawa", characterName: "Miki Okudera" },
      { name: "Etsuko Ichihara", characterName: "Hitoha Miyamizu" },
    ],
  },

  {
    title: "WALL-E",
    releaseDate: "2008-06-27",
    runtimeMinutes: 98,
    description: "WALL-E — add the movie/series description here.",
    language: "English",
    imdbScore: "8.4",
    genres: ["Animation", "Adventure", "Family"],
    country: { name: "United States", code: "US" },
    director: "Andrew Stanton",
    writers: ["Andrew Stanton", "Jim Reardon"],
    cast: [
      { name: "Ben Burtt", characterName: "WALL-E" },
      { name: "Elissa Knight", characterName: "EVE" },
      { name: "Jeff Garlin", characterName: "Captain B. McCrea" },
      { name: "Fred Willard", characterName: "Shelby Forthright" },
    ],
  },

  {
    title: "Monsters, Inc.",
    releaseDate: "2001-11-02",
    runtimeMinutes: 92,
    description: "Monsters, Inc. — add the movie/series description here.",
    language: "English",
    imdbScore: "8.1",
    genres: ["Animation", "Comedy", "Family"],
    country: { name: "United States", code: "US" },
    director: "Pete Docter",
    writers: ["Andrew Stanton", "Daniel Gerson"],
    cast: [
      { name: "John Goodman", characterName: "Sullivan" },
      { name: "Billy Crystal", characterName: "Mike Wazowski" },
      { name: "Mary Gibbs", characterName: "Boo" },
      { name: "Steve Buscemi", characterName: "Randall Boggs" },
    ],
  },

  {
    title: "Despicable Me",
    releaseDate: "2010-07-09",
    runtimeMinutes: 95,
    description: "Despicable Me — add the movie/series description here.",
    language: "English",
    imdbScore: "7.6",
    genres: ["Animation", "Comedy", "Family"],
    country: { name: "United States", code: "US" },
    director: "Pierre Coffin",
    writers: ["Cinco Paul", "Ken Daurio"],
    cast: [
      { name: "Steve Carell", characterName: "Gru" },
      { name: "Jason Segel", characterName: "Vector" },
      { name: "Russell Brand", characterName: "Dr. Nefario" },
      { name: "Miranda Cosgrove", characterName: "Margo" },
    ],
  },

  {
    title: "Despicable Me 2",
    releaseDate: "2013-07-03",
    runtimeMinutes: 98,
    description: "Despicable Me 2 — add the movie/series description here.",
    language: "English",
    imdbScore: "7.3",
    genres: ["Animation", "Comedy", "Family"],
    country: { name: "United States", code: "US" },
    director: "Pierre Coffin",
    writers: ["Cinco Paul", "Ken Daurio"],
    cast: [
      { name: "Steve Carell", characterName: "Gru" },
      { name: "Kristen Wiig", characterName: "Lucy Wilde" },
      { name: "Benjamin Bratt", characterName: "Eduardo Pérez" },
      { name: "Miranda Cosgrove", characterName: "Margo" },
    ],
  },

  {
    title: "Despicable Me 3",
    releaseDate: "2017-06-30",
    runtimeMinutes: 90,
    description: "Despicable Me 3 — add the movie/series description here.",
    language: "English",
    imdbScore: "6.2",
    genres: ["Animation", "Comedy", "Family"],
    country: { name: "United States", code: "US" },
    director: "Kyle Balda",
    writers: ["Ken Daurio", "Cinco Paul"],
    cast: [
      { name: "Steve Carell", characterName: "Gru / Dru" },
      { name: "Kristen Wiig", characterName: "Lucy Wilde" },
      { name: "Trey Parker", characterName: "Balthazar Bratt" },
      { name: "Miranda Cosgrove", characterName: "Margo" },
    ],
  },

  {
    title: "The Incredibles 2",
    releaseDate: "2018-06-15",
    runtimeMinutes: 118,
    description: "The Incredibles 2 — add the movie/series description here.",
    language: "English",
    imdbScore: "7.5",
    genres: ["Animation", "Action", "Adventure"],
    country: { name: "United States", code: "US" },
    director: "Brad Bird",
    writers: ["Brad Bird"],
    cast: [
      { name: "Craig T. Nelson", characterName: "Bob Parr / Mr. Incredible" },
      { name: "Holly Hunter", characterName: "Helen Parr / Elastigirl" },
      { name: "Sarah Vowell", characterName: "Violet Parr" },
      { name: "Samuel L. Jackson", characterName: "Frozone" },
    ],
  },

  {
    title: "Big Hero 6",
    releaseDate: "2014-11-07",
    runtimeMinutes: 102,
    description: "Big Hero 6 — add the movie/series description here.",
    language: "English",
    imdbScore: "7.7",
    genres: ["Animation", "Action", "Adventure"],
    country: { name: "United States", code: "US" },
    director: "Don Hall",
    writers: ["Robert L. Baird", "Daniel Gerson", "Jordan Roberts"],
    cast: [
      { name: "Ryan Potter", characterName: "Hiro Hamada" },
      { name: "Scott Adsit", characterName: "Baymax" },
      { name: "Jamie Chung", characterName: "Go Go Tomago" },
      { name: "Damon Wayans Jr.", characterName: "Wasabi" },
    ],
  },

  {
    title: "Encanto",
    releaseDate: "2021-11-24",
    runtimeMinutes: 102,
    description: "Encanto — add the movie/series description here.",
    language: "English",
    imdbScore: "7.2",
    genres: ["Animation", "Comedy", "Family"],
    country: { name: "United States", code: "US" },
    director: "Jared Bush",
    writers: ["Jared Bush", "Charise Castro Smith", "Jason Hand"],
    cast: [
      { name: "Stephanie Beatriz", characterName: "Mirabel Madrigal" },
      { name: "María Cecilia Botero", characterName: "Abuela Alma" },
      { name: "John Leguizamo", characterName: "Bruno Madrigal" },
      { name: "Jessica Darrow", characterName: "Luisa Madrigal" },
    ],
  },

  {
    title: "Luca",
    releaseDate: "2021-06-18",
    runtimeMinutes: 95,
    description: "Luca — add the movie/series description here.",
    language: "English",
    imdbScore: "7.4",
    genres: ["Animation", "Adventure", "Comedy"],
    country: { name: "United States", code: "US" },
    director: "Enrico Casarosa",
    writers: ["Jesse Andrews", "Mike Jones"],
    cast: [
      { name: "Jacob Tremblay", characterName: "Luca Paguro" },
      { name: "Jack Dylan Grazer", characterName: "Alberto Scorfano" },
      { name: "Emma Berman", characterName: "Giulia Marcovaldo" },
      { name: "Maya Rudolph", characterName: "Daniela Paguro" },
    ],
  },

  {
    title: "Turning Red",
    releaseDate: "2022-03-11",
    runtimeMinutes: 100,
    description: "Turning Red — add the movie/series description here.",
    language: "English",
    imdbScore: "7.0",
    genres: ["Animation", "Comedy", "Family"],
    country: { name: "United States", code: "US" },
    director: "Domee Shi",
    writers: ["Domee Shi", "Julia Cho"],
    cast: [
      { name: "Rosalie Chiang", characterName: "Meilin Lee" },
      { name: "Sandra Oh", characterName: "Ming Lee" },
      { name: "Ava Morse", characterName: "Miriam" },
      { name: "Hyein Park", characterName: "Abby" },
    ],
  },

  {
    title: "Soul",
    releaseDate: "2020-12-25",
    runtimeMinutes: 100,
    description: "Soul — add the movie/series description here.",
    language: "English",
    imdbScore: "8.0",
    genres: ["Animation", "Adventure", "Comedy"],
    country: { name: "United States", code: "US" },
    director: "Pete Docter",
    writers: ["Pete Docter", "Mike Jones", "Kemp Powers"],
    cast: [
      { name: "Jamie Foxx", characterName: "Joe Gardner" },
      { name: "Tina Fey", characterName: "22" },
      { name: "Graham Norton", characterName: "Moonwind" },
      { name: "Phylicia Rashad", characterName: "Libba Gardner" },
    ],
  },

  {
    title: "The Croods",
    releaseDate: "2013-03-22",
    runtimeMinutes: 98,
    description: "The Croods — add the movie/series description here.",
    language: "English",
    imdbScore: "7.2",
    genres: ["Animation", "Adventure", "Comedy"],
    country: { name: "United States", code: "US" },
    director: "Kirk DeMicco",
    writers: ["Kirk DeMicco", "Chris Sanders"],
    cast: [
      { name: "Nicolas Cage", characterName: "Grug Crood" },
      { name: "Emma Stone", characterName: "Eep Crood" },
      { name: "Ryan Reynolds", characterName: "Guy" },
      { name: "Catherine Keener", characterName: "Ugga Crood" },
    ],
  },

  {
    title: "The Croods: A New Age",
    releaseDate: "2020-11-25",
    runtimeMinutes: 95,
    description: "The Croods: A New Age — add the movie/series description here.",
    language: "English",
    imdbScore: "6.9",
    genres: ["Animation", "Adventure", "Comedy"],
    country: { name: "United States", code: "US" },
    director: "Joel Crawford",
    writers: ["Dan Hageman", "Kevin Hageman", "Paul Fisher"],
    cast: [
      { name: "Nicolas Cage", characterName: "Grug Crood" },
      { name: "Emma Stone", characterName: "Eep Crood" },
      { name: "Ryan Reynolds", characterName: "Guy" },
      { name: "Peter Dinklage", characterName: "Phil Betterman" },
    ],
  },

  {
    title: "The Nut Job",
    releaseDate: "2014-01-17",
    runtimeMinutes: 85,
    description: "The Nut Job — add the movie/series description here.",
    language: "English",
    imdbScore: "5.7",
    genres: ["Animation", "Adventure", "Comedy"],
    country: { name: "Canada", code: "CA" },
    director: "Peter Lepeniotis",
    writers: ["Lorne Cameron", "Peter Lepeniotis", "Daniel Woo"],
    cast: [
      { name: "Will Arnett", characterName: "Surly" },
      { name: "Brendan Fraser", characterName: "Grayson" },
      { name: "Liam Neeson", characterName: "Raccoon" },
      { name: "Katherine Heigl", characterName: "Andie" },
    ],
  },

  {
    title: "The Nut Job 2: Nutty by Nature",
    releaseDate: "2017-08-11",
    runtimeMinutes: 91,
    description: "The Nut Job 2: Nutty by Nature — add the movie/series description here.",
    language: "English",
    imdbScore: "5.5",
    genres: ["Animation", "Adventure", "Comedy"],
    country: { name: "Canada", code: "CA" },
    director: "Cal Brunker",
    writers: ["Scott Bindley", "Cal Brunker", "Bob Barlen"],
    cast: [
      { name: "Will Arnett", characterName: "Surly" },
      { name: "Maya Rudolph", characterName: "Precious" },
      { name: "Bobby Moynihan", characterName: "Mighty" },
      { name: "Bobby Cannavale", characterName: "Mayor Muldoon" },
    ],
  },

  {
    title: "A Bug's Life",
    releaseDate: "1998-11-25",
    runtimeMinutes: 95,
    description: "A Bug's Life — add the movie/series description here.",
    language: "English",
    imdbScore: "7.2",
    genres: ["Animation", "Adventure", "Comedy"],
    country: { name: "United States", code: "US" },
    director: "John Lasseter",
    writers: ["Andrew Stanton", "Don McEnery", "Bob Shaw"],
    cast: [
      { name: "Dave Foley", characterName: "Flik" },
      { name: "Kevin Spacey", characterName: "Hopper" },
      { name: "Julia Louis-Dreyfus", characterName: "Atta" },
      { name: "Hayden Panettiere", characterName: "Dot" },
    ],
  },

  {
    title: "Delhi Safari",
    releaseDate: "2012-12-07",
    runtimeMinutes: 96,
    description: "Delhi Safari — add the movie/series description here.",
    language: "Hindi",
    imdbScore: "5.6",
    genres: ["Animation", "Adventure", "Comedy"],
    country: { name: "India", code: "IN" },
    director: "Nikhil Advani",
    writers: ["Nikhil Advani", "Girija Joshi", "Suresh Nair"],
    cast: [
      { name: "Govinda", characterName: "Bajrang" },
      { name: "Akshaye Khanna", characterName: "Alex" },
      { name: "Suniel Shetty", characterName: "Sultan" },
      { name: "Boman Irani", characterName: "Bagga" },
    ],
  },

];

async function seedMovie(movie: MovieSeed) {
  const movieRow = await getOrCreateMovie(movie);

  console.log(`Processing: ${movie.title}`);

  // Genres
  for (const genreName of movie.genres) {
    const genreId = await getOrCreateGenre(genreName);

    await db
      .insert(movieGenres)
      .values({
        movieId: movieRow.id,
        genreId,
      })
      .onConflictDoNothing();
  }

  // Country
  const countryId = await getOrCreateCountry(
    movie.country.name,
    movie.country.code
  );

  await db
    .insert(movieCountries)
    .values({
      movieId: movieRow.id,
      countryId,
    })
    .onConflictDoNothing();

  // Director
  const directorId = await getOrCreatePerson(movie.director);

  await db
    .insert(movieCast)
    .values({
      movieId: movieRow.id,
      personId: directorId,
      role: "director",
    })
    .onConflictDoNothing();

  // Writers
  for (const writer of movie.writers) {
    const writerId = await getOrCreatePerson(writer);

    await db
      .insert(movieCast)
      .values({
        movieId: movieRow.id,
        personId: writerId,
        role: "writer",
      })
      .onConflictDoNothing();
  }

  // Actors
  for (let i = 0; i < movie.cast.length; i++) {
    const actor = movie.cast[i];
    const personId = await getOrCreatePerson(actor.name);

    await db
      .insert(movieCast)
      .values({
        movieId: movieRow.id,
        personId,
        role: "actor",
        characterName: actor.characterName,
        billingOrder: i + 1,
      })
      .onConflictDoNothing();
  }
}

async function main() {
  console.log("🎬 Starting movie seed (batch 2)...");
  console.log(`Movies in batch: ${movieData.length}`);

  for (const movie of movieData) {
    await seedMovie(movie);
  }

  console.log("");
  console.log("✅ Movie seed completed successfully.");
  console.log(`✅ Processed ${movieData.length} movies.`);
  console.log("🖼️ Posters were intentionally left empty.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  });