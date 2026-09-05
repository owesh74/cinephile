import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
  uniqueIndex,
  numeric,
  primaryKey,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Users ──────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

// ── Movies / Media ─────────────────────────────────────────

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
  imdbScore: numeric("imdb_score", {
    precision: 3,
    scale: 1,
  }),

  // movie | series | game
  mediaType: text("media_type").notNull().default("movie"),

  // Used for series summary display.
  // Movies and games simply keep these at 0.
  seasonCount: integer("season_count").notNull().default(0),
  episodeCount: integer("episode_count").notNull().default(0),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

// ── Genres ────────────────────────────────────────────────

export const genres = pgTable("genres", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

// ── Countries ─────────────────────────────────────────────

export const countries = pgTable("countries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
});

// ── People ────────────────────────────────────────────────

export const people = pgTable("people", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
});

// ── Liked People ──────────────────────────────────────────

export const likedPeople = pgTable(
  "liked_people",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.personId],
    }),
  ]
);

export const likedPeopleRelations = relations(
  likedPeople,
  ({ one }) => ({
    user: one(users, {
      fields: [likedPeople.userId],
      references: [users.id],
    }),

    person: one(people, {
      fields: [likedPeople.personId],
      references: [people.id],
    }),
  })
);

// ── Movie Genres ──────────────────────────────────────────

export const movieGenres = pgTable(
  "movie_genres",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, {
        onDelete: "cascade",
      }),

    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, {
        onDelete: "cascade",
      }),
  },
  (t) =>
    [
      primaryKey({
        columns: [t.movieId, t.genreId],
      }),
    ]
);

// ── Movie Countries ──────────────────────────────────────

export const movieCountries = pgTable(
  "movie_countries",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, {
        onDelete: "cascade",
      }),

    countryId: uuid("country_id")
      .notNull()
      .references(() => countries.id, {
        onDelete: "cascade",
      }),
  },
  (t) =>
    [
      primaryKey({
        columns: [t.movieId, t.countryId],
      }),
    ]
);

// ── Movie Cast ────────────────────────────────────────────

export const movieCast = pgTable(
  "movie_cast",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, {
        onDelete: "cascade",
      }),

    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, {
        onDelete: "cascade",
      }),

    role: text("role").notNull(),

    characterName: text("character_name"),

    billingOrder: integer("billing_order"),
  },
  (t) =>
    [
      primaryKey({
        columns: [
          t.movieId,
          t.personId,
          t.role,
        ],
      }),
    ]
);

// ── Relations ─────────────────────────────────────────────

export const moviesRelations = relations(
  movies,
  ({ one, many }) => ({
    genres: many(movieGenres),
    countries: many(movieCountries),
    cast: many(movieCast),

  })
);

export const movieGenresRelations = relations(
  movieGenres,
  ({ one }) => ({
    movie: one(movies, {
      fields: [movieGenres.movieId],
      references: [movies.id],
    }),

    genre: one(genres, {
      fields: [movieGenres.genreId],
      references: [genres.id],
    }),
  })
);

export const movieCountriesRelations = relations(
  movieCountries,
  ({ one }) => ({
    movie: one(movies, {
      fields: [movieCountries.movieId],
      references: [movies.id],
    }),

    country: one(countries, {
      fields: [movieCountries.countryId],
      references: [countries.id],
    }),
  })
);

export const movieCastRelations = relations(
  movieCast,
  ({ one }) => ({
    movie: one(movies, {
      fields: [movieCast.movieId],
      references: [movies.id],
    }),

    person: one(people, {
      fields: [movieCast.personId],
      references: [people.id],
    }),
  })
);

// ── Watchlist ─────────────────────────────────────────────

export const watchlist = pgTable(
  "watchlist",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, {
        onDelete: "cascade",
      }),

    addedAt: timestamp("added_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (t) =>
    [
      primaryKey({
        columns: [t.userId, t.movieId],
      }),
    ]
);

// ── Watched ───────────────────────────────────────────────

export const watched = pgTable(
  "watched",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, {
        onDelete: "cascade",
      }),

    watchedAt: timestamp("watched_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (t) =>
    [
      primaryKey({
        columns: [t.userId, t.movieId],
      }),
    ]
);

// ── Ratings ───────────────────────────────────────────────

export const ratings = pgTable(
  "ratings",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, {
        onDelete: "cascade",
      }),

    score: integer("score").notNull(),

    ratedAt: timestamp("rated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (t) =>
    [
      primaryKey({
        columns: [t.userId, t.movieId],
      }),
    ]
);

// ── Lists ────────────────────────────────────────────────

export const lists = pgTable("lists", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: text("title").notNull(),

  description: text("description"),

  size: integer("size").notNull(),

  isSystem: boolean("is_system")
    .notNull()
    .default(true),

  ownerId: uuid("owner_id").references(() => users.id, {
    onDelete: "cascade",
  }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

// ── List Movies ──────────────────────────────────────────

export const listMovies = pgTable(
  "list_movies",
  {
    listId: uuid("list_id")
      .notNull()
      .references(() => lists.id, {
        onDelete: "cascade",
      }),

    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, {
        onDelete: "cascade",
      }),

    rank: integer("rank").notNull(),
  },
  (t) =>
    [
      primaryKey({
        columns: [t.listId, t.movieId],
      }),
    ]
);

// ── Friendships ──────────────────────────────────────────

export const friendships = pgTable(
  "friendships",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    friendId: uuid("friend_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    status: text("status")
      .notNull()
      .default("pending"),

    requestedAt: timestamp("requested_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (t) =>
    [
      primaryKey({
        columns: [t.userId, t.friendId],
      }),
    ]
);

// ── Activities ──────────────────────────────────────────

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  type: text("type").notNull(),

  movieId: uuid("movie_id").references(() => movies.id, {
    onDelete: "cascade",
  }),

  listId: uuid("list_id").references(() => lists.id, {
    onDelete: "cascade",
  }),

  metadata: jsonb("metadata").$type<
    Record<string, unknown>
  >(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

// ── Achievements ─────────────────────────────────────────

export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    key: text("key").notNull().unique(),

    name: text("name").notNull(),

    description: text("description").notNull(),

    criteriaType: text("criteria_type").notNull(),

    criteriaValue: jsonb("criteria_value").$type<
      Record<string, unknown>
    >(),
  }
);

// ── User Achievements ────────────────────────────────────

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, {
        onDelete: "cascade",
      }),

    unlockedAt: timestamp("unlocked_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (t) =>
    [
      primaryKey({
        columns: [
          t.userId,
          t.achievementId,
        ],
      }),
    ]
);