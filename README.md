# Tým: Not Found

Tento repozitář obsahuje naši implementaci projektu pro Tour de App 2026.

## Členové týmu

- [**Team Leader**](https://github.com/bondar7)
- [**Frontend Developer & UI/UX**](https://github.com/afnesss)
- [**Backend Developer**](https://github.com/Shadowinger)

## Architektura a Dokumentace

Projekt je strukturován jako monorepo. Pro detailní informace o jednotlivých částech systému prosím navštivte příslušné dokumentace:

- **[Frontend Dokumentace](apps/client/README.md)**
- **[Backend Dokumentace](apps/api/README.md)**

### Použité technologie

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Databáze**: PostgreSQL, Drizzle ORM
- **Infrastruktura**: Docker, Docker Compose, Caddy

---

## Lokální Vývoj a Spuštění

Pro konzistentní vývojové prostředí používáme Docker.

### 1. Doporučené spuštění (Docker Compose)

Nejjednodušší způsob, jak spustit celý stack (Client, API, DB, Caddy), je pomocí Docker Compose. Tento způsob simuluje produkční prostředí včetně reverzní proxy.

```bash
docker-compose up --build
```

> **Doba nasazení:** První build může trvat **5-10 minut** (stahování image, instalace závislostí). Další spuštění jsou v řádu sekund.

### 2. Alternativní spuštění (Manuální)

Pokud potřebujete spustit například pouze databázi a zbytek spouštět lokálně na hostitelském stroji (např. pro rychlejší debugování):

```bash
# Spustí pouze databázi na portu 5433
docker-compose up db
```

_Při manuálním spouštění API/Clienta mimo Docker nezapomeňte vytvořit `.env` soubory v příslušných složkách (`apps/client/.env`, `apps/api/.env`)._

---

## Infrastruktura a Konfigurace

### Caddy (Reverse Proxy)

Caddy funguje jako vstupní brána pro celou aplikaci. Řeší směrování požadavků, což zjednodušuje komunikaci mezi frontendem a backendem bez nutnosti CORS konfigurace pro vývoj.

- **Frontend requests**: Všechny požadavky na `/` jsou směrovány na React aplikaci.
- **API requests**: Všechny požadavky začínající na `/api` jsou směrovány na backend kontejner.

Díky tomu může frontend volat API jednoduše pomocí relativních cest (např. `fetch("/api/courses")`), což funguje identicky lokálně i v produkci.

**Konfigurační soubory:**

- `caddy/Caddyfile.development`: Používá se pro lokální vývoj (`localhost:8080`).
- `caddy/Caddyfile.production`: Používá se pro produkční nasazení.

### Produkční nasazení (Deployment)

Nasazení je automatizováno pomocí GitHub Actions a konfigurace `tourdeapp.yaml`.

- **Kritické soubory**:
  - `tourdeapp.yaml`: Definuje služby pro Tour de Cloud platformu.
  - `.github/workflows/deploy.yml`: CI/CD pipeline, která se spouští při pushnutí do `main`.
  - `Dockerfile` (v každé složce): Optimalizované instrukce pro sestavení produkčních image (multi-stage builds).
