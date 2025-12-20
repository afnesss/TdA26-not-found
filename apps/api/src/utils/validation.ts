import { z } from "zod";

export const linkMaterialSchema = z.object({
  type: z
    .union([z.literal("link"), z.string()])
    .transform(() => "link" as const),
  name: z.string().min(1).max(255),
  description: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .transform((val: any) => val || null),
  url: z.string().url(),
});

export const fileMaterialBaseSchema = z.object({
  type: z
    .union([z.literal("file"), z.string()])
    .transform(() => "file" as const),
  name: z.string().min(1).max(255),
  description: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .transform((val) => val || null),
});

export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
