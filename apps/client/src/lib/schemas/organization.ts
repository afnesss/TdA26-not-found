import { z } from 'zod'

export const OrganizationStatusSchema = z.enum([
  'waiting',
  'onboarding',
  'active',
])

export const OrganizationRequestStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
])

export const OrganizationSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  country: z.string(),
  city: z.string(),
  address: z.string(),
  postalCode: z.string(),
  region: z.string(),
  type: z.string(),
  ownerName: z.string(),
  contactEmail: z.string().email(),
  status: OrganizationStatusSchema,
  mustChangePassword: z.boolean(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
})

export const OrganizationRequestSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  country: z.string(),
  city: z.string(),
  address: z.string(),
  postalCode: z.string(),
  region: z.string(),
  type: z.string(),
  ownerName: z.string(),
  contactEmail: z.string().email(),
  status: OrganizationRequestStatusSchema,
  adminNote: z.string().nullable().optional(),
  decisionAt: z.date().or(z.string().datetime()).nullable().optional(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
})

export const OrganizationRequestCreateSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  postalCode: z.string().min(1),
  region: z.string().min(1),
  type: z.string().min(1),
  ownerName: z.string().min(1),
  contactEmail: z.string().email(),
})

export const OrganizationRequestSubmissionSchema = z.object({
  requestId: z.string().uuid(),
  status: OrganizationRequestStatusSchema,
  trackingUrl: z.string(),
})

export const OrganizationRequestPublicStatusResponseSchema = z.object({
  requestId: z.string().uuid(),
  status: OrganizationRequestStatusSchema,
  name: z.string(),
  slug: z.string(),
  country: z.string(),
  city: z.string(),
  address: z.string(),
  postalCode: z.string(),
  region: z.string(),
  type: z.string(),
  ownerName: z.string(),
  contactEmail: z.string().email(),
  messageKey: z.enum(['pending', 'approved', 'rejected']),
  adminNote: z.string().optional(),
})

export const AdminAuthMeSchema = z.object({
  actorType: z.literal('platform_admin'),
  username: z.string(),
})

export const AdminLoginResponseSchema = AdminAuthMeSchema.extend({
  token: z.string(),
})

export const OrganizationAuthMeSchema = z.discriminatedUnion('actorType', [
  z.object({
    actorType: z.literal('organization_admin'),
    organizationId: z.string().uuid(),
    orgSlug: z.string(),
    organizationName: z.string(),
    mustChangePassword: z.boolean(),
    status: OrganizationStatusSchema,
  }),
  z.object({
    actorType: z.literal('organization_user'),
    organizationId: z.string().uuid(),
    orgSlug: z.string(),
    organizationName: z.string(),
    id: z.string().uuid(),
    username: z.string(),
    role: z.enum(['lecturer', 'student']),
    xp: z.number().optional(),
    level: z.number().optional(),
  }),
])

export const OrganizationLoginResponseSchema = z.discriminatedUnion('actorType', [
  z.object({
    token: z.string(),
    actorType: z.literal('organization_admin'),
    organizationId: z.string().uuid(),
    orgSlug: z.string(),
    organizationName: z.string(),
    mustChangePassword: z.boolean(),
    status: OrganizationStatusSchema,
  }),
  z.object({
    token: z.string(),
    actorType: z.literal('organization_user'),
    organizationId: z.string().uuid(),
    orgSlug: z.string(),
    organizationName: z.string(),
    id: z.string().uuid(),
    username: z.string(),
    role: z.enum(['lecturer', 'student']),
    xp: z.number().optional(),
    level: z.number().optional(),
  }),
])

export const OrganizationPublicInfoSchema = z.object({
  uuid: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  city: z.string(),
  address: z.string(),
  postalCode: z.string(),
  region: z.string(),
  type: z.string(),
  ownerName: z.string(),
  status: OrganizationStatusSchema,
  contactEmail: z.string().email(),
  mustChangePassword: z.boolean(),
})

export type Organization = z.infer<typeof OrganizationSchema>
export type OrganizationRequest = z.infer<typeof OrganizationRequestSchema>
export type OrganizationRequestCreate = z.infer<
  typeof OrganizationRequestCreateSchema
>
export type OrganizationRequestSubmission = z.infer<
  typeof OrganizationRequestSubmissionSchema
>
export type OrganizationRequestPublicStatusResponse = z.infer<
  typeof OrganizationRequestPublicStatusResponseSchema
>
export type AdminAuthMe = z.infer<typeof AdminAuthMeSchema>
export type AdminLoginResponse = z.infer<typeof AdminLoginResponseSchema>
export type OrganizationAuthMe = z.infer<typeof OrganizationAuthMeSchema>
export type OrganizationLoginResponse = z.infer<typeof OrganizationLoginResponseSchema>
export type OrganizationPublicInfo = z.infer<typeof OrganizationPublicInfoSchema>
