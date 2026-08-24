import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
  numeric,
  primaryKey,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";


// ── Users (from Phase 1/2) ──────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Movies ───────────────────────────────────────────────

export const movies = pgTable("movies", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  originalTitle: text("original_title"),
  posterUrl: text("poster_url"),
  backdropUrl: text("backdrop_url"),
  releaseDate: date("release_date"),
  runtimeMinutes: integer("runtime_minutes"),
  description: text("description"),
  language: text("language"),
  imdbScore: numeric("imdb_score", { precision: 3, scale: 1 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const genres = pgTable("genres", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

export const countries = pgTable("countries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(), // ISO 3166-1 alpha-2, e.g. "IN", "US"
});

export const people = pgTable("people", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
});

// ── Join tables ──────────────────────────────────────────

export const movieGenres = pgTable(
  "movie_genres",
  {
    movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id").notNull().references(() => genres.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.movieId, t.genreId] })]
);

export const movieCountries = pgTable(
  "movie_countries",
  {
    movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
    countryId: uuid("country_id").notNull().references(() => countries.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.movieId, t.countryId] })]
);

// role: "director" | "writer" | "actor"
export const movieCast = pgTable(
  "movie_cast",
  {
    movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
    personId: uuid("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    characterName: text("character_name"), // only meaningful for actors
    billingOrder: integer("billing_order"), // cast display order
  },
  (t) => [primaryKey({ columns: [t.movieId, t.personId, t.role] })]
);

// ── Relations (for easy nested queries via db.query) ─────

export const moviesRelations = relations(movies, ({ many }) => ({
  genres: many(movieGenres),
  countries: many(movieCountries),
  cast: many(movieCast),
}));

export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
  movie: one(movies, { fields: [movieGenres.movieId], references: [movies.id] }),
  genre: one(genres, { fields: [movieGenres.genreId], references: [genres.id] }),
}));

export const movieCountriesRelations = relations(movieCountries, ({ one }) => ({
  movie: one(movies, { fields: [movieCountries.movieId], references: [movies.id] }),
  country: one(countries, { fields: [movieCountries.countryId], references: [countries.id] }),
}));

export const movieCastRelations = relations(movieCast, ({ one }) => ({
  movie: one(movies, { fields: [movieCast.movieId], references: [movies.id] }),
  person: one(people, { fields: [movieCast.personId], references: [people.id] }),
}));

export const watchlist = pgTable(
  "watchlist",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.movieId] })]
);

export const watched = pgTable(
  "watched",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
    watchedAt: timestamp("watched_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.movieId] })]
);

export const ratings = pgTable(
  "ratings",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
    score: integer("score").notNull(), // 1-10
    ratedAt: timestamp("rated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.movieId] })]
);

export const lists = pgTable("lists", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  size: integer("size").notNull(), // 10, 25, 50, 100, or 250 per the spec
  isSystem: boolean("is_system").notNull().default(true),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "cascade" }), // null for system lists
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const listMovies = pgTable(
  "list_movies",
  {
    listId: uuid("list_id").notNull().references(() => lists.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id").notNull().references(() => movies.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(),
  },
  (t) => [primaryKey({ columns: [t.listId, t.movieId] })]
);

export const friendships = pgTable(
  "friendships",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // requester
    friendId: uuid("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }), // recipient
    status: text("status").notNull().default("pending"), // "pending" | "accepted"
    requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.friendId] })]
);

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "watched" | "rated" | "watchlisted" | "list_completed"
  movieId: uuid("movie_id").references(() => movies.id, { onDelete: "cascade" }),
  listId: uuid("list_id").references(() => lists.id, { onDelete: "cascade" }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(), // stable slug, e.g. "first_movie" — used in check logic, not just display
  name: text("name").notNull(),
  description: text("description").notNull(),
  criteriaType: text("criteria_type").notNull(),
  criteriaValue: jsonb("criteria_value").$type<Record<string, unknown>>(),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })]
);