import { Request } from "express";

export type AuthActorType = "platform_admin" | "organization_admin";

export type AuthUser =
  | {
      actorType: "platform_admin";
      username: string;
    }
  | {
      actorType: "organization_admin";
      organizationId: string;
      orgSlug: string;
    }
  | {
      actorType: "legacy_user";
      id: string;
      username: string;
      role: string;
    };

export type RequestOrganization = {
  uuid: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  region: string;
  type: string;
  ownerName: string;
  status: string;
  contactEmail: string;
  mustChangePassword: boolean;
};

export type AuthRequest = Request & {
  user?: AuthUser;
  organization?: RequestOrganization;
};
