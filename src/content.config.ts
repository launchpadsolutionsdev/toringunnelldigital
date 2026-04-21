/**
 * Content collection schemas. Every .md/.mdx file in src/content/films and
 * src/content/blog is validated against these Zod schemas at build time —
 * a typo in frontmatter fails the build instead of shipping broken pages.
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const films = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/films" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      couple: z.string(),
      date: z.date(),
      venue: z.string(),
      location: z.string().optional(),
      videoId: z.string(),
      platform: z.enum(["youtube", "vimeo"]),
      thumbnail: image(),
      thumbnailAlt: z.string().default(""),
      description: z.string(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      description: z.string(),
      cover: image().optional(),
      coverAlt: z.string().default(""),
      draft: z.boolean().default(false),
    }),
});

export const collections = { films, blog };
