import { z } from "zod";

export const FileMaterialSchema = z.object({
  uuid: z.string().uuid(),
  type: z.literal("file"),
  name: z.string(),
  description: z.string().optional(),
  fileUrl: z.string().refine((val) => {
    try {
        new URL(val);
        return true;
    } catch {
        return val.startsWith("/");
    }
  }, { message: "Invalid URL" }),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().optional(),
  originalFilename: z.string().optional(),
});

export const UrlMaterialSchema = z.object({
  uuid: z.string().uuid(),
  type: z.literal("url"),
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  faviconUrl: z.string().url().optional(),
});

export const MaterialSchema = z.discriminatedUnion("type", [
  FileMaterialSchema,
  UrlMaterialSchema,
]);

export const FileMaterialCreateRequestSchema = z.object({
  type: z.literal("file"),
  name: z.string(),
  description: z.string().optional(),
  file: z.any(), // File uploads are handled via multipart/form-data, validation might need specific handling
});

export const UrlMaterialCreateRequestSchema = z.object({
  type: z.literal("url"),
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
});

export const FileMaterialUpdateRequestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  file: z.any().optional(),
});

export const UrlMaterialUpdateRequestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
});

export type FileMaterial = z.infer<typeof FileMaterialSchema>;
export type UrlMaterial = z.infer<typeof UrlMaterialSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type FileMaterialCreateRequest = z.infer<typeof FileMaterialCreateRequestSchema>;
export type UrlMaterialCreateRequest = z.infer<typeof UrlMaterialCreateRequestSchema>;
export type FileMaterialUpdateRequest = z.infer<typeof FileMaterialUpdateRequestSchema>;
export type UrlMaterialUpdateRequest = z.infer<typeof UrlMaterialUpdateRequestSchema>;
