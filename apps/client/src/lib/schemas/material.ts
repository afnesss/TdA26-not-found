import { z } from 'zod'
import {
  LocaleSchema,
  LocalizedEntityMetaSchema,
  LocalizedFieldSchema,
} from './i18n'

export const FileMaterialSchema = z.object({
  uuid: z.string().uuid(),
  type: z.literal('file'),
  name: z.string(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  fileUrl: z.string().refine(
    (val) => {
      try {
        new URL(val)
        return true
      } catch {
        return val.startsWith('/')
      }
    },
    { message: 'Invalid URL' },
  ),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().optional(),
  originalFilename: z.string().optional(),
  downloadCount: z.number().int().nonnegative().optional(),
}).merge(LocalizedEntityMetaSchema).extend({
  resolvedLocale: LocaleSchema.optional(),
  isFallback: z.boolean().optional(),
})

export const UrlMaterialSchema = z.object({
  uuid: z.string().uuid(),
  type: z.literal('url'),
  name: z.string(),
  nameI18n: LocalizedFieldSchema.optional(),
  description: z.string().optional(),
  descriptionI18n: LocalizedFieldSchema.optional(),
  url: z.string().url(),
  faviconUrl: z.string().url().optional(),
  copyCount: z.number().int().nonnegative().optional(),
  openCount: z.number().int().nonnegative().optional(),
}).merge(LocalizedEntityMetaSchema).extend({
  resolvedLocale: LocaleSchema.optional(),
  isFallback: z.boolean().optional(),
})

export const MaterialSchema = z.discriminatedUnion('type', [
  FileMaterialSchema,
  UrlMaterialSchema,
])

export const FileMaterialCreateRequestSchema = z.object({
  type: z.literal('file'),
  name: z.string(),
  description: z.string().optional(),
  file: z.any(), // File uploads are handled via multipart/form-data, validation might need specific handling
})

export const UrlMaterialCreateRequestSchema = z.object({
  type: z.literal('url'),
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
})

export const FileMaterialUpdateRequestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  file: z.any().optional(),
})

export const UrlMaterialUpdateRequestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
})

export const MaterialInteractionActionSchema = z.enum([
  'download',
  'copy',
  'open',
])

export const MaterialValidationSchema = z.discriminatedUnion('type', [
  z.object({
    uuid: z.string().optional(),
    type: z.literal('file'),
    name: z
      .string()
      .min(1, 'Název je povinný')
      .refine((val) => val.trim().length > 0, {
        message: 'Název je povinný',
      }),
    description: z.string().optional(),
    fileUrl: z.string().optional(),
    originalFilename: z.string().optional(),
    mimeType: z.string().optional(),
    sizeBytes: z.number().int().optional(),
  }),
  // URL material validation
  z.object({
    uuid: z.string().optional(),
    type: z.literal('url'),
    name: z
      .string()
      .min(1, 'Název je povinný')
      .refine((val) => val.trim().length > 0, {
        message: 'Název je povinný',
      }),
    description: z.string().optional(),
    url: z
      .string()
      .min(1, 'URL nemůže být prázdné')
      .url('Neplatný formát URL')
      .refine((val) => val.trim().length > 0, {
        message: 'URL nemůže být prázdné',
      }),
    faviconUrl: z.string().optional(),
  }),
])

export const MaterialCreateSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('file'),
    name: z
      .string()
      .min(1, 'Název je povinný')
      .refine((val) => val.trim().length > 0, {
        message: 'Název je povinný',
      }),
    description: z.string().optional(),
    file: z.instanceof(File, { message: 'Vyberte soubor' }),
  }),
  // URL link
  z.object({
    type: z.literal('url'),
    name: z
      .string()
      .min(1, 'Název je povinný')
      .refine((val) => val.trim().length > 0, {
        message: 'Název je povinný',
      }),
    description: z.string().optional(),
    url: z
      .string()
      .min(1, 'URL nemůže být prázdné')
      .url('Neplatný formát URL')
      .refine((val) => val.trim().length > 0, {
        message: 'URL nemůže být prázdné',
      }),
  }),
])
export type MaterialValidation = z.infer<typeof MaterialValidationSchema>
export type MaterialCreate = z.infer<typeof MaterialCreateSchema>
export type FileMaterial = z.infer<typeof FileMaterialSchema>
export type UrlMaterial = z.infer<typeof UrlMaterialSchema>
export type Material = z.infer<typeof MaterialSchema>
export type FileMaterialCreateRequest = z.infer<
  typeof FileMaterialCreateRequestSchema
>
export type UrlMaterialCreateRequest = z.infer<
  typeof UrlMaterialCreateRequestSchema
>
export type FileMaterialUpdateRequest = z.infer<
  typeof FileMaterialUpdateRequestSchema
>
export type UrlMaterialUpdateRequest = z.infer<
  typeof UrlMaterialUpdateRequestSchema
>
export type MaterialInteractionAction = z.infer<
  typeof MaterialInteractionActionSchema
>
