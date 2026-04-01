import { db } from "./index";
import {
  courses,
  modules,
  courseMaterials,
  quizzes,
  quizSubmissions,
  feedItems,
  courseStatusEnum,
  organizations,
  merchItems,
  users,
} from "./schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { and, eq, inArray } from "drizzle-orm";
import { logger } from "../utils/logger";

const sampleCourses = [
  {
    name: "Úvod do Pythonu",
    description:
      "Zvládněte základy programování v Pythonu, od proměnných až po objektově orientovaný design. Ideální pro začátečníky a budoucí datové analytiky.",
  },
  {
    name: "Pokročilé vzory v Reactu",
    description:
      "Ponořte se do React hooks, kontextu, optimalizace výkonu a škálovatelné architektury. Naučte se vytvářet frontendové aplikace na podnikové úrovni.",
  },
  {
    name: "Návrh systémů 101",
    description:
      "Naučte se navrhovat škálovatelné, spolehlivé a udržovatelné softwarové systémy pro rozsáhlé aplikace. Zahrnuje mikroslužby, databáze, cachování a další.",
  },
  {
    name: "Datová věda s R",
    description:
      "Prozkoumejte analýzu dat, vizualizaci a strojové učení pomocí programovacího jazyka R. Zaměření na praktické aplikace a případové studie.",
  },
  {
    name: "Základy cloudových technologií",
    description:
      "Pochopte základní koncepty cloudových platforem jako AWS, Azure a Google Cloud. Naučte se o IaaS, PaaS, SaaS a strategiích nasazení.",
  },
  {
    name: "Základy kybernetické bezpečnosti",
    description:
      "Úvod do síťové bezpečnosti, běžných zranitelností a ochranných strategií. Nezbytné znalosti pro každého, kdo pracuje s citlivými daty.",
  },
  {
    name: "Frontendový vývoj webu s Vue.js",
    description:
      "Vytvářejte dynamická a responzivní uživatelská rozhraní pomocí frameworku Vue.js. Zahrnuje komponenty, routing, správu stavu a API integraci.",
  },
  {
    name: "Backendový vývoj API s Node.js & Express",
    description:
      "Vytvářejte robustní a efektivní RESTful API pomocí Node.js a Express. Naučte se o routingu, middleware, integraci databází a autentizaci.",
  },
  {
    name: "Vývoj mobilních aplikací s Flutter",
    description:
      "Vyvíjejte krásné, nativně kompilované aplikace pro mobil, web a desktop z jedné kódové základny pomocí Flutter a Dart.",
  },
  {
    name: "Strojové učení s TensorFlow",
    description:
      "Objevte principy a aplikace strojového učení pomocí TensorFlow. Zahrnuje neuronové sítě, hluboké učení a nasazení modelů.",
  },
  {
    name: "Pokročilé JavaScript a ES6",
    description:
      "Prozkoumejte moderní JavaScript, ES6+, asynchronní programování a pokročilé koncepty pro profesionální vývoj.",
  },
  {
    name: "Databázové systémy s PostgreSQL",
    description:
      "Naučte se navrhovat a spravovat relační databáze pomocí PostgreSQL, včetně SQL, optimalizace a transakcí.",
  },
  {
    name: "DevOps a CI/CD",
    description:
      "Implementujte kontinuální integraci a nasazení pomocí nástrojů jako Docker, Kubernetes a Jenkins.",
  },
  {
    name: "Kybernetická bezpečnost pro vývojáře",
    description:
      "Chraňte své aplikace před běžnými zranitelnostmi, naučte se o OWASP a bezpečném kódování.",
  },
  {
    name: "Mobilní vývoj s React Native",
    description:
      "Vytvářejte cross-platform mobilní aplikace pomocí React Native a JavaScript.",
  },
  {
    name: "Strojové učení s Pythonem",
    description:
      "Základy strojového učení, algoritmy a praktické aplikace pomocí Pythonu a knihoven jako scikit-learn.",
  },
  {
    name: "Blockchain a kryptoměny",
    description:
      "Pochopte principy blockchain technologie, smart kontrakty a vývoj decentralizovaných aplikací.",
  },
  {
    name: "Grafický design pro web",
    description:
      "Naučte se principy UI/UX designu, nástroje jako Figma a vytváření atraktivních uživatelských rozhraní.",
  },
  {
    name: "Testování softwaru",
    description:
      "Zvládněte unit testování, integrace testy a automatizované testování pomocí frameworků jako Jest a Selenium.",
  },
  {
    name: "Mikroslužby a architektura",
    description:
      "Naučte se navrhovat škálovatelné aplikace pomocí mikroslužeb, API gateway a distribuovaných systémů.",
  },
  {
    name: "Big Data s Apache Spark",
    description:
      "Zpracovávání velkých datových sad pomocí Apache Spark, Hadoop a analytické nástroje.",
  },
  {
    name: "Internet věcí (IoT)",
    description:
      "Vývoj aplikací pro IoT zařízení, senzory a cloudové platformy jako AWS IoT.",
  },
  {
    name: "Herní vývoj s Unity",
    description:
      "Vytvářejte 2D a 3D hry pomocí Unity engine a C# programování.",
  },
  {
    name: "Umělá inteligence a neuronové sítě",
    description:
      "Základy AI, neuronové sítě, deep learning a aplikace v různých doménách.",
  },
  {
    name: "Agilní metodologie a Scrum",
    description:
      "Naučte se agilní vývojové procesy, Scrum framework a efektivní týmovou spolupráci.",
  },
];

const courseStatusByIndex = new Map<number, (typeof courseStatusEnum)[number]>([
  [0, "live"],
  [1, "live"],
  [2, "live"],
  [3, "planned"],
  [4, "planned"],
  [5, "paused"],
]);

const now = new Date();
const plannedFor = new Date(now);
plannedFor.setDate(plannedFor.getDate() + 1);
plannedFor.setHours(12, 0, 0, 0);

const liveStartedAt = new Date(now);
liveStartedAt.setDate(liveStartedAt.getDate() - 4);
liveStartedAt.setHours(9, 0, 0, 0);

const pausedAt = new Date(now);
pausedAt.setDate(pausedAt.getDate() - 1);
pausedAt.setHours(16, 0, 0, 0);

const archivedStartedAt = new Date(now);
archivedStartedAt.setDate(archivedStartedAt.getDate() - 14);
archivedStartedAt.setHours(10, 0, 0, 0);

const archivedAt = new Date(now);
archivedAt.setDate(archivedAt.getDate() - 6);
archivedAt.setHours(11, 0, 0, 0);

const getCreatedAt = (
  status: (typeof courseStatusEnum)[number],
  index: number,
) => {
  const createdAt = new Date(now);

  if (status === "live") {
    createdAt.setDate(createdAt.getDate() - (10 + index));
  } else if (status === "planned") {
    createdAt.setDate(createdAt.getDate() - (5 + index));
  } else if (status === "paused") {
    createdAt.setDate(createdAt.getDate() - (8 + index));
  } else if (status === "archived") {
    createdAt.setDate(createdAt.getDate() - (20 + index));
  }

  createdAt.setHours(9, 0, 0, 0);
  return createdAt;
};

const seedCourses = sampleCourses.map((course, index) => {
  const status = courseStatusByIndex.get(index) ?? "draft";
  const createdAt = getCreatedAt(status, index);
  const status_history =
    status === "paused"
      ? [
          {
            status: "live" as (typeof courseStatusEnum)[number],
            timestamp: liveStartedAt.toISOString(),
          },
          {
            status: "paused" as (typeof courseStatusEnum)[number],
            timestamp: pausedAt.toISOString(),
          },
        ]
      : status === "archived"
        ? [
            {
              status: "live" as (typeof courseStatusEnum)[number],
              timestamp: archivedStartedAt.toISOString(),
            },
            {
              status: "archived" as (typeof courseStatusEnum)[number],
              timestamp: archivedAt.toISOString(),
            },
          ]
        : status === "live"
          ? [
              {
                status: "live" as (typeof courseStatusEnum)[number],
                timestamp: liveStartedAt.toISOString(),
              },
            ]
          : [];

  return {
    ...course,
    status,
    scheduledFor: status === "planned" ? plannedFor : null,
    createdAt,
    updatedAt: createdAt,
    startedAt:
      status === "live"
        ? liveStartedAt
        : status === "paused"
          ? liveStartedAt
          : status === "archived"
            ? archivedStartedAt
            : null,
    status_history,
  };
});

const moduleBlueprints = [
  {
    position: 1,
    name: "Modul 1: Start a orientace",
    description:
      "Úvodní tematický blok se základními pojmy, orientací v kurzu a prvními studijními materiály.",
    status: "active" as const,
  },
  {
    position: 2,
    name: "Modul 2: Praktická cvičení a miniprojekt",
    description:
      "Procvičování a prohloubení hlavních konceptů pomocí cvičení, diskuze a průběžného ověření znalostí.",
    status: "passive" as const,
  },
];

const merchCatalogSeed = [
  {
    slug: "platform-backpack",
    name: "TDA Batoh",
    description: "Limitovaná merch položka Think Different Academy.",
    imageUrl: "/api/uploads/bag123.png",
    unitPriceCents: 129900,
    purchaseMode: "money" as const,
    xpCost: null,
    voucherDiscountPercent: null,
    active: true,
  },
  {
    slug: "platform-tshirt",
    name: "TDA T-Shirt",
    description: "Klasické tričko s brandingem platformy.",
    imageUrl: "/api/uploads/tshirt.png",
    unitPriceCents: 69900,
    purchaseMode: "money" as const,
    xpCost: null,
    voucherDiscountPercent: null,
    active: true,
  },
  {
    slug: "platform-earrings",
    name: "Signal Earrings",
    description: "Doplňková merch položka pro fanoušky platformy.",
    imageUrl: "/api/uploads/earrings.png",
    unitPriceCents: 39900,
    purchaseMode: "money" as const,
    xpCost: null,
    voucherDiscountPercent: null,
    active: true,
  },
  {
    slug: "platform-cap",
    name: "TDA Signal Cap",
    description:
      "Minimalistická bílá kšiltovka s ikonickým 'Tádou' – symbolem nápadů.",
    imageUrl: "/api/uploads/cap.png",
    unitPriceCents: 44900,
    purchaseMode: "money" as const,
    xpCost: null,
    voucherDiscountPercent: null,
    active: true,
  },
  {
    slug: "platform-sale10",
    name: "10% slevový kupon",
    description: "Voucher se slevou 10 % na další objednávku.",
    imageUrl: "/api/uploads/10sleva.png",
    unitPriceCents: 0,
    purchaseMode: "xp" as const,
    xpCost: 250,
    voucherDiscountPercent: 10,
    active: true,
  },
  {
    slug: "platform-sale20",
    name: "20% slevový kupon",
    description: "Voucher se slevou 20 % na další objednávku.",
    imageUrl: "/api/uploads/20sleva.png",
    unitPriceCents: 0,
    purchaseMode: "xp" as const,
    xpCost: 450,
    voucherDiscountPercent: 20,
    active: true,
  },
];

export async function seed() {
  logger.info("Seeding database...");

  try {
    const seedAssetsDir = path.join(process.cwd(), "seed_assets");
    const uploadsDir = path.join(process.cwd(), "uploads");

    await fs.mkdir(uploadsDir, { recursive: true });

    const files = await fs.readdir(seedAssetsDir);
    for (const file of files) {
      await fs.copyFile(
        path.join(seedAssetsDir, file),
        path.join(uploadsDir, file),
      );
      logger.info(`Copied ${file} to uploads directory`);
    }
  } catch (error) {
    logger.warn(
      { err: error },
      "Failed to copy seed assets (ignoring if dev environment issue)",
    );
  }

  const defaultPassword = process.env.ORG_DEFAULT_PASSWORD || "TdA26!";

  let [tdaOrganization] = await db
    .select({
      uuid: organizations.uuid,
      slug: organizations.slug,
    })
    .from(organizations)
    .where(eq(organizations.slug, "tda"));

  if (!tdaOrganization) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    [tdaOrganization] = await db
      .insert(organizations)
      .values({
        name: "TdA",
        slug: "tda",
        country: "Czech Republic",
        city: "Brno",
        address: "Veveří 95",
        postalCode: "602 00",
        region: "Central Europe",
        type: "HO",
        ownerName: "TdA Platform",
        contactEmail: "admin@tda-app.com",
        status: "active",
        passwordHash,
        mustChangePassword: false,
      })
      .returning({
        uuid: organizations.uuid,
        slug: organizations.slug,
      });
    logger.info("Created default TdA organization");
  }

  const orgUserDefaultPassword =
    process.env.ORG_USER_DEFAULT_PASSWORD || defaultPassword;
  const seedOrganizationUsers = [
    {
      organizationId: tdaOrganization.uuid,
      username: "lecturer",
      role: "lecturer" as const,
      password: orgUserDefaultPassword,
    },
    {
      organizationId: tdaOrganization.uuid,
      username: "student",
      role: "student" as const,
      password: orgUserDefaultPassword,
    },
  ];

  for (const account of seedOrganizationUsers) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    const [existingUser] = await db
      .select({ id: users.uuid })
      .from(users)
      .where(
        and(
          eq(users.organizationId, account.organizationId),
          eq(users.username, account.username),
        ),
      )
      .limit(1);

    if (existingUser) {
      await db
        .update(users)
        .set({
          role: account.role,
          passwordHash,
        })
        .where(eq(users.uuid, existingUser.id));
      continue;
    }

    await db.insert(users).values({
      organizationId: account.organizationId,
      username: account.username,
      role: account.role,
      passwordHash,
    });
  }

  const merchSlugs = merchCatalogSeed.map((item) => item.slug);
  const existingMerch = await db
    .select({ uuid: merchItems.uuid, slug: merchItems.slug })
    .from(merchItems)
    .where(inArray(merchItems.slug, merchSlugs));
  const existingMerchBySlug = new Map(
    existingMerch.map((item) => [item.slug, item.uuid]),
  );
  const existingMerchSlugs = new Set(existingMerch.map((item) => item.slug));
  const merchToInsert = merchCatalogSeed.filter(
    (item) => !existingMerchSlugs.has(item.slug),
  );

  for (const item of merchCatalogSeed) {
    const existingMerchId = existingMerchBySlug.get(item.slug);
    if (!existingMerchId) {
      continue;
    }

    await db
      .update(merchItems)
      .set({
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        unitPriceCents: item.unitPriceCents,
        purchaseMode: item.purchaseMode,
        xpCost: item.xpCost,
        voucherDiscountPercent: item.voucherDiscountPercent,
        active: item.active,
        updatedAt: new Date(),
      })
      .where(eq(merchItems.uuid, existingMerchId));
  }

  if (merchToInsert.length > 0) {
    await db.insert(merchItems).values(merchToInsert);
    logger.info(`Inserted ${merchToInsert.length} shop seed items`);
  }

  await db
    .update(merchItems)
    .set({
      active: false,
      updatedAt: new Date(),
    })
    .where(
      inArray(merchItems.slug, [
        "platform-hoodie",
        "platform-water-bottle",
        "platform-notebook",
      ]),
    );

  logger.info("Shop catalog synchronized");

  const [existingCourse] = await db
    .select({ uuid: courses.uuid })
    .from(courses)
    .where(eq(courses.organizationId, tdaOrganization.uuid))
    .limit(1);

  if (existingCourse) {
    logger.info("Courses already exist for organization tda, skipping seed");
  } else {
    const createdCourses = await db
      .insert(courses)
      .values(
        seedCourses.map((course) => ({
          ...course,
          organizationId: tdaOrganization.uuid,
        })),
      )
      .returning();
    logger.info(
      `Created ${createdCourses.length} courses for organization tda`,
    );

    for (const course of createdCourses) {
      const analyticsScale =
        course.status === "live"
          ? 3
          : course.status === "paused"
            ? 2
            : course.status === "archived"
              ? 1
              : 0;
      const shouldSeedAnalytics = analyticsScale > 0;

      const createdModules = await db
        .insert(modules)
        .values(
          moduleBlueprints.map((m) => ({
            courseId: course.uuid,
            name: m.name,
            description: m.description,
            status: m.status,
            position: m.position,
          })),
        )
        .returning({
          uuid: modules.uuid,
          position: modules.position,
        });

      const moduleByPosition = new Map(
        createdModules.map((m) => [m.position, m.uuid]),
      );
      const module1Id = moduleByPosition.get(1)!;
      const module2Id = moduleByPosition.get(2)!;

      const materials = [
        {
          moduleId: module1Id,
          type: "url" as const,
          name: "Oficiální sylabus kurzu",
          description:
            "Podrobný přehled témat, hodnocení a rozvrhu pro semestr.",
          url: "https://example.com/syllabus",
          faviconUrl:
            "https://www.google.com/s2/favicons?domain=example.com&sz=64",
          ...(shouldSeedAnalytics
            ? { openCount: 8 * analyticsScale, copyCount: 2 * analyticsScale }
            : {}),
        },
        {
          moduleId: module1Id,
          type: "url" as const,
          name: "Doplňková četba - Modul 1: Základy",
          description:
            "Externí články a blogové příspěvky pro prohloubení pochopení základních konceptů.",
          url: "https://medium.com/tag/programming-basics",
          faviconUrl:
            "https://www.google.com/s2/favicons?domain=medium.com&sz=64",
        },
        {
          moduleId: module1Id,
          type: "file" as const,
          name: "Prezentace z přednášky - Týden 1: Úvod",
          description:
            "Ke stažení prezentace z první úvodní přednášky. Zahrnuje nastavení a základní koncepty.",
          fileUrl: "/api/uploads/lecture-slides-week1.txt",
          mimeType: "text/plain",
          sizeBytes: 1024 * 700,
          originalFilename: "lecture-slides-week1.txt",
          ...(shouldSeedAnalytics ? { downloadCount: 5 * analyticsScale } : {}),
        },
        {
          moduleId: module1Id,
          type: "url" as const,
          name: "Interaktivní programovací prostředí",
          description:
            "Procvičujte si své dovednosti s živým spouštěním kódu a interaktivními cvičeními.",
          url: "https://replit.com/",
          faviconUrl:
            "https://www.google.com/s2/favicons?domain=replit.com&sz=64",
          ...(shouldSeedAnalytics
            ? { openCount: 6 * analyticsScale, copyCount: 1 * analyticsScale }
            : {}),
        },
        {
          moduleId: module2Id,
          type: "file" as const,
          name: "Cvičení - Modul 2: Datové struktury",
          description: "Úkoly k řešení zaměřené na běžné datové struktury.",
          fileUrl: "/api/uploads/exercise-sheet-module2.txt",
          mimeType: "text/plain",
          sizeBytes: 1024 * 250,
          originalFilename: "exercise-sheet-module2.txt",
        },
        {
          moduleId: module2Id,
          type: "url" as const,
          name: "Fórum pro pokročilá témata",
          description:
            "Komunitní fórum pro diskuzi o pokročilých tématech a získání pomoci.",
          url: `https://stackoverflow.com/tags/${course.name.split(" ")[0].toLowerCase()}`,
          faviconUrl:
            "https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=64",
        },
        {
          moduleId: module2Id,
          type: "file" as const,
          name: "Pokyny k miniprojektu",
          description:
            "Podrobný dokument s požadavky na miniprojekt, kritérii hodnocení a procesem odevzdání.",
          fileUrl: "/api/uploads/project-guidelines.txt",
          mimeType: "text/plain",
          sizeBytes: 1024 * 900,
          originalFilename: "project-guidelines.txt",
        },
        {
          moduleId: module2Id,
          type: "url" as const,
          name: "Externí zdroje kurzu",
          description:
            "Vybraný seznam externích knih, tutoriálů a online kurzů.",
          url: `https://www.freecodecamp.org/news/tag/${course.name
            .split(" ")[0]
            .toLowerCase()}`,
          faviconUrl:
            "https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=64",
        },
      ];

      await db.insert(courseMaterials).values(materials);

      const quizzesData = [
        {
          moduleId: module1Id,
          title: "Modul 1: Kvíz ze základů",
          questions: [
            {
              uuid: uuidv4(),
              type: "singleChoice",
              question: `Jaký je hlavní cíl úvodního modulu v ${course.name}?`,
              options: [
                "Zapamatovat si definice",
                "Pochopit základní koncepty a terminologii",
                "Vytvořit kompletní aplikaci",
                "Provádět pokročilé optimalizace",
              ],
              correctIndex: 1,
            },
            {
              uuid: uuidv4(),
              type: "multipleChoice",
              question:
                "Které z těchto programovacích paradigmat jsou relevantní pro tento kurz?",
              options: [
                "Objektově orientované",
                "Funkcionální",
                "Procedurální",
                "Logické",
              ],
              correctIndices: [0, 1, 2],
            },
            {
              uuid: uuidv4(),
              type: "singleChoice",
              question:
                "V kterém roce byl vyvinut první široce uznávaný vysokoúrovňový programovací jazyk?",
              options: ["1940", "1950", "1960", "1970"],
              correctIndex: 1,
            },
          ],
        },
        {
          moduleId: module2Id,
          title: "Modul 2: Hodnocení klíčových konceptů",
          questions: [
            {
              uuid: uuidv4(),
              type: "multipleChoice",
              question:
                "Které z následujících jsou výhody použití verzovacích systémů jako Git?",
              options: [
                "Sledování změn",
                "Spolupráce s ostatními",
                "Automatické nasazování aplikací",
                "Vytváření uživatelských rozhraní",
              ],
              correctIndices: [0, 1],
            },
            {
              uuid: uuidv4(),
              type: "singleChoice",
              question: "Co je to algoritmus?",
              options: [
                "Programovací jazyk",
                "Sada instrukcí pro řešení problému",
                "Typ databáze",
                "Prvek uživatelského rozhraní",
              ],
              correctIndex: 1,
            },
            {
              uuid: uuidv4(),
              type: "multipleChoice",
              question: "Běžné webové technologie zahrnují:",
              options: ["HTML", "CSS", "JavaScript", "SQL"],
              correctIndices: [0, 1, 2],
            },
          ],
        },
      ];

      const createdQuizzes = await db
        .insert(quizzes)
        .values(quizzesData)
        .returning({ uuid: quizzes.uuid, moduleId: quizzes.moduleId });

      if (shouldSeedAnalytics && createdQuizzes.length > 0) {
        const quizAttempts =
          course.status === "live" ? 3 : course.status === "paused" ? 2 : 1;
        const quizSeed = quizzesData[0];
        const questions = quizSeed?.questions ?? [];
        const maxScore = questions.length || 1;

        const buildAnswers = (variant: "correct" | "partial") =>
          questions.map((question) =>
            question.type === "singleChoice"
              ? {
                  uuid: question.uuid,
                  selectedIndex:
                    variant === "correct"
                      ? typeof question.correctIndex === "number"
                        ? question.correctIndex
                        : 0
                      : typeof question.correctIndex === "number"
                        ? (question.correctIndex + 1) % question.options.length
                        : 0,
                }
              : {
                  uuid: question.uuid,
                  selectedIndices:
                    variant === "correct"
                      ? (question.correctIndices ?? [])
                      : Array.isArray(question.correctIndices)
                        ? question.correctIndices.slice(0, 1)
                        : [],
                },
          );

        const submissions = Array.from(
          { length: quizAttempts },
          (_, index) => ({
            quizId: createdQuizzes[0].uuid,
            score: index === 0 ? maxScore : Math.max(1, maxScore - (index + 1)),
            maxScore,
            answers: buildAnswers(index === 0 ? "correct" : "partial"),
          }),
        );

        await db.insert(quizSubmissions).values(submissions);
      }

      const feed = [
        {
          courseId: course.uuid,
          type: "manual" as const,
          message: `Vítejte v kurzu '${course.name}'! Připravte se na zajímavou cestu učení.`,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        },
        {
          courseId: course.uuid,
          type: "manual" as const,
          message:
            "Připomínka: První živá diskuze je naplánována na příští úterý. Připravte si své otázky!",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
        },
        {
          courseId: course.uuid,
          type: "manual" as const,
          message:
            "Konzultační hodiny tento týden: Pondělí 14-15 a Středa 11-12. Přijďte prodiskutovat cokoliv!",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        },
        {
          courseId: course.uuid,
          type: "manual" as const,
          message:
            "Termín odevzdání úkolu 1 prodloužen o 3 dny na základě vašich požadavků. Nový termín je v pátek!",
          edited: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        },
        {
          courseId: course.uuid,
          type: "manual" as const,
          message:
            "Příští týden nás čeká hostem přednáška: 'Budoucnost AI v softwarovém inženýrství'. Podrobnosti brzy.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        },
        {
          courseId: course.uuid,
          type: "manual" as const,
          message:
            "Nezapomeňte odevzdat úkoly z modulu 2 do konce dne. Pokud potřebujete pomoc, ozvěte se!",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        },
        {
          courseId: course.uuid,
          type: "manual" as const,
          message:
            "Skvělá práce na posledních úkolech! Pokračujte v tom výborném úsilí.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          courseId: course.uuid,
          type: "manual" as const,
          message:
            "Krátká anketa: Jaká témata byste rádi probírali podrobněji? Vaše zpětná vazba je cenná!",
          createdAt: new Date(),
        },
      ];

      await db.insert(feedItems).values(feed);
    }
  }

  logger.info("Seeding complete with production-ready data");
}
