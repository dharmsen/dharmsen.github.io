import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

// Build-time hardening: frontmatter URL fields emitted into href/src must be
// http(s) or root-relative. Rejects javascript:/data:/protocol-relative schemes.
// Empty string is allowed (fields are optional). Fails the build on a bad value.
const safeUrl = z
  .string()
  .refine((u) => u === '' || /^https?:\/\//i.test(u) || /^\//.test(u), {
    message: 'must be an http(s) or root-relative URL',
  })
  .optional();

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number().int(),
    type: z.enum(['conference', 'journal', 'workshop', 'preprint', 'thesis']),
    pdf: safeUrl,
    arxiv: z.string().optional(),
    doi: z.string().optional(),
    code: safeUrl,
    slides: safeUrl,
    highlight: z.boolean().default(false),
  }),
});

const talks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    date: z.coerce.date(),
    type: z.enum(['talk', 'poster', 'tutorial', 'invited']),
    location: z.string(),
    slides: safeUrl,
  }),
});

const teaching = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/teaching' }),
  schema: z.object({
    course: z.string(),
    role: z.string(),
    institution: z.string(),
    year: z.number().int(),
    semester: z.string().optional(),
    url: safeUrl,
  }),
});

const supervision = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/supervision' }),
  schema: z.object({
    student: z.string(),
    level: z.enum(['BSc', 'MSc', 'PhD']),
    topic: z.string(),
    year: z.number().int(),
    role: z.string(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

const hobbies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hobbies' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().int().optional(),
    image: z.string().optional(),
  }),
});

const hobbyPosts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hobby-posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    hobby: reference('hobbies'),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: 'about.md', base: './src/content' }),
  schema: z.object({ title: z.string().optional() }),
});

const cv = defineCollection({
  loader: glob({ pattern: 'cv.md', base: './src/content' }),
  schema: z.object({ title: z.string().optional() }),
});

export const collections = {
  publications,
  talks,
  teaching,
  supervision,
  notes,
  hobbies,
  'hobby-posts': hobbyPosts,
  about,
  cv,
};
