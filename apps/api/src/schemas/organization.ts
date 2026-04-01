import { z } from "zod";

export const OrganizationStatusSchema = z.enum([
  "waiting",
  "onboarding",
  "active",
]);

export const OrganizationRequestStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);

export const OrganizationBaseSchema = z.object({
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
});

const OrganizationRequestFieldsSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  postalCode: z.string().min(1),
  region: z.string().min(1),
  type: z.string().min(1),
  ownerName: z.string().min(1),
  contactEmail: z.string().email(),
});

export const OrganizationRequestSchema = OrganizationRequestFieldsSchema.extend({
  uuid: z.string().uuid(),
  slug: z.string(),
  status: OrganizationRequestStatusSchema,
  adminNote: z.string().nullable().optional(),
  decisionAt: z.date().or(z.string().datetime()).nullable().optional(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});

export const OrganizationCreateRequestSchema = OrganizationRequestFieldsSchema;

export const OrganizationRequestDecisionSchema = z.object({
  adminNote: z.string().trim().max(2000).optional(),
});

export const OrganizationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  ownerName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  status: OrganizationStatusSchema.optional(),
});

export const OrganizationAuthLoginSchema = z.object({
  mode: z.enum(["admin", "lecturer", "student"]).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1),
});

export const OrganizationChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const AdminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const OrganizationPublicStatusSchema = z.object({
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
  messageKey: z.enum(["pending", "approved", "rejected"]),
  adminNote: z.string().optional(),
});

export const AuthMeSchema = z.discriminatedUnion("actorType", [
  z.object({
    actorType: z.literal("platform_admin"),
    username: z.string(),
  }),
  z.object({
    actorType: z.literal("organization_admin"),
    organizationId: z.string().uuid(),
    orgSlug: z.string(),
    organizationName: z.string(),
    mustChangePassword: z.boolean(),
    status: OrganizationStatusSchema,
  }),
  z.object({
    actorType: z.literal("organization_user"),
    organizationId: z.string().uuid(),
    orgSlug: z.string(),
    organizationName: z.string(),
    id: z.string().uuid(),
    username: z.string(),
    role: z.enum(["lecturer", "student"]),
    xp: z.number().optional(),
    level: z.number().optional(),
  }),
]);

export type Organization = z.infer<typeof OrganizationBaseSchema>;
export type OrganizationRequest = z.infer<typeof OrganizationRequestSchema>;
export type OrganizationCreateRequest = z.infer<
  typeof OrganizationCreateRequestSchema
>;
