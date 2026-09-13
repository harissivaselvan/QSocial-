import { z } from "zod";

export const postSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  mediaKey: z.string().max(500).optional().nullable()
});

export const commentSchema = z.object({
  content: z.string().trim().min(1).max(1000)
});