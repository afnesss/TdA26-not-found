import { z } from "zod";
import {
  LocaleSchema,
  LocalizedEntityMetaSchema,
  LocalizedFieldSchema,
} from "./i18n";

export const FileMaterialSchema = z.object({
  uuid: z.string().uuid(),
  type: z.literal("file"),
  name: z.string(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  fileUrl: z.string().refine(
    (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return val.startsWith("/");
      }
    },
    { message: "Adresa souboru není platná" }
  ),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().optional(),
  originalFilename: z.string().optional(),
  downloadCount: z.number().int().nonnegative(),
}).merge(LocalizedEntityMetaSchema).extend({
  resolvedLocale: LocaleSchema.optional(),
  isFallback: z.boolean().optional(),
});

export const UrlMaterialSchema = z.object({
  uuid: z.string().uuid(),
  type: z.literal("url"),
  name: z.string(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  url: z.string().url(),
  faviconUrl: z.string().url().optional(),
  copyCount: z.number().int().nonnegative(),
  openCount: z.number().int().nonnegative(),
}).merge(LocalizedEntityMetaSchema).extend({
  resolvedLocale: LocaleSchema.optional(),
  isFallback: z.boolean().optional(),
});

export const MaterialSchema = z.discriminatedUnion("type", [
  FileMaterialSchema,
  UrlMaterialSchema,
]);

export const FileMaterialCreateRequestSchema = z.object({
  type: z.literal("file"),
  sourceLocale: LocaleSchema.default("en"),
  name: z.string(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  file: z.any(), // File uploads are handled via multipart/form-data, validation might need specific handling
});

export const UrlMaterialCreateRequestSchema = z.object({
  type: z.literal("url"),
  sourceLocale: LocaleSchema.default("en"),
  name: z.string(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  url: z.string().url(),
});

export const FileMaterialUpdateRequestSchema = z.object({
  sourceLocale: LocaleSchema.optional(),
  name: z.string().optional(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  file: z.any().optional(),
});

export const UrlMaterialUpdateRequestSchema = z.object({
  sourceLocale: LocaleSchema.optional(),
  name: z.string().optional(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  url: z.string().url().optional(),
});

export const MaterialInteractionActionSchema = z.enum([
  "download",
  "copy",
  "open",
]);

export const MaterialInteractionRequestSchema = z.object({
  action: MaterialInteractionActionSchema,
});

export type FileMaterial = z.infer<typeof FileMaterialSchema>;
export type UrlMaterial = z.infer<typeof UrlMaterialSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type FileMaterialCreateRequest = z.infer<
  typeof FileMaterialCreateRequestSchema
>;
export type UrlMaterialCreateRequest = z.infer<
  typeof UrlMaterialCreateRequestSchema
>;
export type FileMaterialUpdateRequest = z.infer<
  typeof FileMaterialUpdateRequestSchema
>;
export type UrlMaterialUpdateRequest = z.infer<
  typeof UrlMaterialUpdateRequestSchema
>;
export type MaterialInteractionAction = z.infer<
  typeof MaterialInteractionActionSchema
>;
export type MaterialInteractionRequest = z.infer<
  typeof MaterialInteractionRequestSchema
>;
