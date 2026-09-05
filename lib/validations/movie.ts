import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),

  mediaType: z.enum(["movie", "series", "game"]).default("movie"),

  originalTitle: z.string().max(200).optional(),

  releaseYear: z
    .string()
    .regex(/^\d{4}$/, "Enter a 4-digit year")
    .optional()
    .or(z.literal("")),

  runtimeMinutes: z
    .string()
    .regex(/^\d+$/, "Runtime must be a number")
    .optional()
    .or(z.literal("")),

  description: z.string().max(2000).optional(),

  language: z.string().max(50).optional(),

  imdbScore: z
    .string()
    .regex(/^\d(\.\d)?$|^10(\.0)?$/, "Score must be 0–10")
    .optional()
    .or(z.literal("")),

  genres: z.string().optional(),

  countries: z.string().optional(),

  director: z.string().optional(),

  writers: z.string().optional(),

  cast: z.string().optional(),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;