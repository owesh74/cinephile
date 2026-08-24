import { z } from "zod";

export const LIST_SIZES = [10, 25, 50, 100, 250] as const;

export const createListSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  size: z.coerce.number().refine((n) => LIST_SIZES.includes(n as (typeof LIST_SIZES)[number]), {
    message: "Size must be 10, 25, 50, 100, or 250",
  }),
});

export type CreateListInput = z.infer<typeof createListSchema>;