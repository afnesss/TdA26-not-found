import type { Request } from "express";
import { getRequestLocale } from "./i18n";

const messages = {
  serverError: {
    cs: "Došlo k chybě serveru",
    en: "A server error occurred",
  },
  sessionExpired: {
    cs: "Relace vypršela",
    en: "Session expired",
  },
  unauthorized: {
    cs: "Nejste oprávněni",
    en: "You are not authorized",
  },
  insufficientPermissions: {
    cs: "Nedostatečná oprávnění",
    en: "Insufficient permissions",
  },
  adminCredentialsRequired: {
    cs: "Vyplňte prosím jméno a heslo",
    en: "Please enter your username and password",
  },
  invalidCredentials: {
    cs: "Nesprávné přihlašovací údaje",
    en: "Invalid credentials",
  },
  logoutSuccess: {
    cs: "Odhlášení proběhlo úspěšně",
    en: "Signed out successfully",
  },
  platformAdminOnly: {
    cs: "Přístup pouze pro správce platformy",
    en: "Platform admin access only",
  },
  orgAdminOnly: {
    cs: "Přístup pouze pro správce organizace",
    en: "Organization admin access only",
  },
  orgUserOnly: {
    cs: "Přístup pouze pro uživatele organizace",
    en: "Organization user access only",
  },
  crossOrgForbidden: {
    cs: "Přístup do jiné organizace není povolen",
    en: "Access to a different organization is not allowed",
  },
  orgPasswordChangeRequired: {
    cs: "Nejprve změňte výchozí heslo organizace",
    en: "Change the organization's default password first",
  },
  orgMissingSlug: {
    cs: "Chybí slug organizace",
    en: "Organization slug is missing",
  },
  orgNotFound: {
    cs: "Organizace nebyla nalezena",
    en: "Organization not found",
  },
  orgInactive: {
    cs: "Organizace není dostupná",
    en: "Organization is not available",
  },
  courseOrOrgIdMissing: {
    cs: "Chybí identifikátor kurzu nebo organizace",
    en: "Course or organization identifier is missing",
  },
  courseNotFound: {
    cs: "Kurz nebyl nalezen",
    en: "Course not found",
  },
  orgNotAvailableYet: {
    cs: "Organizace ještě není dostupná",
    en: "Organization is not available yet",
  },
  usernameRequired: {
    cs: "Zadejte uživatelské jméno",
    en: "Enter a username",
  },
  unsupportedAccountRole: {
    cs: "Nepodporovaná role účtu",
    en: "Unsupported account role",
  },
  accountModeMismatch: {
    cs: "Tento účet neodpovídá zvolenému režimu",
    en: "This account does not match the selected mode",
  },
  currentPasswordInvalid: {
    cs: "Aktuální heslo není správné",
    en: "Current password is incorrect",
  },
  cartEmpty: {
    cs: "Košík je prázdný.",
    en: "Your cart is empty.",
  },
  cartItemUnavailable: {
    cs: "Některé položky v košíku už nejsou dostupné.",
    en: "Some items in your cart are no longer available.",
  },
  cartItemInvalid: {
    cs: "Neplatná položka v košíku.",
    en: "Invalid cart item.",
  },
  voucherMisconfigured: {
    cs: "Voucher není správně nastaven.",
    en: "Voucher is misconfigured.",
  },
  xpInsufficient: {
    cs: "Nemáte dostatek XP pro nákup voucheru.",
    en: "You do not have enough XP to purchase the voucher.",
  },
  promoInvalidOrUsed: {
    cs: "Promo kód je neplatný nebo již použitý.",
    en: "Promo code is invalid or already used.",
  },
} as const;

export type ApiMessageKey = keyof typeof messages;

export const getApiMessage = (req: Request, key: ApiMessageKey) =>
  messages[key][getRequestLocale(req)];
