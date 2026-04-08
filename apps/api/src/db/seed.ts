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
import { buildLocalizedField } from "../utils/i18n";

const SEED_SOURCE_LOCALE = "cs" as const;

const localizedText = (value?: string | null) =>
  buildLocalizedField(SEED_SOURCE_LOCALE, value ?? null);

const localizedTextWithEnglish = (
  csValue?: string | null,
  enValue?: string | null,
) => ({
  ...buildLocalizedField(SEED_SOURCE_LOCALE, csValue ?? null),
  ...(typeof enValue === "string" && enValue.trim()
    ? { en: enValue.trim() }
    : {}),
});

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

const sampleCourseTranslationsEn = [
  {
    nameEn: "Introduction to Python",
    descriptionEn:
      "Master the fundamentals of Python programming, from variables to object-oriented design. Ideal for beginners and aspiring data analysts.",
  },
  {
    nameEn: "Advanced React Patterns",
    descriptionEn:
      "Dive into React hooks, context, performance optimization, and scalable architecture. Learn to build enterprise-grade frontend applications.",
  },
  {
    nameEn: "System Design 101",
    descriptionEn:
      "Learn to design scalable, reliable, and maintainable software systems for large applications. Covers microservices, databases, caching, and more.",
  },
  {
    nameEn: "Data Science with R",
    descriptionEn:
      "Explore data analysis, visualization, and machine learning using the R programming language, with a focus on practical applications and case studies.",
  },
  {
    nameEn: "Cloud Fundamentals",
    descriptionEn:
      "Understand the core concepts of cloud platforms such as AWS, Azure, and Google Cloud. Learn about IaaS, PaaS, SaaS, and deployment strategies.",
  },
  {
    nameEn: "Cybersecurity Fundamentals",
    descriptionEn:
      "An introduction to network security, common vulnerabilities, and protection strategies. Essential knowledge for anyone working with sensitive data.",
  },
  {
    nameEn: "Frontend Web Development with Vue.js",
    descriptionEn:
      "Build dynamic and responsive user interfaces with Vue.js. Covers components, routing, state management, and API integration.",
  },
  {
    nameEn: "Backend API Development with Node.js & Express",
    descriptionEn:
      "Build robust and efficient RESTful APIs with Node.js and Express. Learn about routing, middleware, database integration, and authentication.",
  },
  {
    nameEn: "Mobile App Development with Flutter",
    descriptionEn:
      "Develop beautiful, natively compiled apps for mobile, web, and desktop from a single codebase using Flutter and Dart.",
  },
  {
    nameEn: "Machine Learning with TensorFlow",
    descriptionEn:
      "Discover the principles and applications of machine learning with TensorFlow. Includes neural networks, deep learning, and model deployment.",
  },
  {
    nameEn: "Advanced JavaScript and ES6",
    descriptionEn:
      "Explore modern JavaScript, ES6+, asynchronous programming, and advanced concepts for professional development.",
  },
  {
    nameEn: "Database Systems with PostgreSQL",
    descriptionEn:
      "Learn to design and manage relational databases with PostgreSQL, including SQL, optimization, and transactions.",
  },
  {
    nameEn: "DevOps and CI/CD",
    descriptionEn:
      "Implement continuous integration and deployment using tools such as Docker, Kubernetes, and Jenkins.",
  },
  {
    nameEn: "Cybersecurity for Developers",
    descriptionEn:
      "Protect your applications from common vulnerabilities, and learn about OWASP and secure coding practices.",
  },
  {
    nameEn: "Mobile Development with React Native",
    descriptionEn:
      "Build cross-platform mobile applications using React Native and JavaScript.",
  },
  {
    nameEn: "Machine Learning with Python",
    descriptionEn:
      "Learn the basics of machine learning, algorithms, and practical applications using Python and libraries such as scikit-learn.",
  },
  {
    nameEn: "Blockchain and Cryptocurrencies",
    descriptionEn:
      "Understand the principles of blockchain technology, smart contracts, and decentralized application development.",
  },
  {
    nameEn: "Graphic Design for the Web",
    descriptionEn:
      "Learn UI/UX design principles, tools such as Figma, and how to create attractive user interfaces.",
  },
  {
    nameEn: "Software Testing",
    descriptionEn:
      "Master unit testing, integration testing, and automated testing using frameworks such as Jest and Selenium.",
  },
  {
    nameEn: "Microservices and Architecture",
    descriptionEn:
      "Learn to design scalable applications using microservices, API gateways, and distributed systems.",
  },
  {
    nameEn: "Big Data with Apache Spark",
    descriptionEn:
      "Process large-scale datasets using Apache Spark, Hadoop, and analytical tools.",
  },
  {
    nameEn: "Internet of Things (IoT)",
    descriptionEn:
      "Develop applications for IoT devices, sensors, and cloud platforms such as AWS IoT.",
  },
  {
    nameEn: "Game Development with Unity",
    descriptionEn:
      "Create 2D and 3D games using the Unity engine and C# programming.",
  },
  {
    nameEn: "Artificial Intelligence and Neural Networks",
    descriptionEn:
      "Learn the basics of AI, neural networks, deep learning, and applications across different domains.",
  },
  {
    nameEn: "Agile Methodologies and Scrum",
    descriptionEn:
      "Learn agile development processes, the Scrum framework, and effective team collaboration.",
  },
] as const;
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
  const translation = sampleCourseTranslationsEn[index];
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
    nameEn: translation?.nameEn,
    descriptionEn: translation?.descriptionEn,
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
    name: "Start a orientace",
    nameI18n: {
      cs: "Start a orientace",
      en: "Start and orientation",
    },
    description:
      "Úvodní tematický blok se základními pojmy, orientací v kurzu a prvními studijními materiály.",
    descriptionI18n: {
      cs: "Úvodní tematický blok se základními pojmy, orientací v kurzu a prvními studijními materiály.",
      en: "Introductory thematic block with basic concepts, course orientation and first study materials.",
    },
    status: "active" as const,
  },
  {
    position: 2,
    name: "Modul 2: Praktická cvičení a miniprojekt",
    nameI18n: {
      cs: "Modul 2: Praktická cvičení a miniprojekt",
      en: "Module 2: Practical Exercises and Mini-project",
    },
    description:
      "Procvičování a prohloubení hlavních konceptů pomocí cvičení, diskuze a průběžného ověření znalostí.",
    descriptionI18n: {
      cs: "Procvičování a prohloubení hlavních konceptů pomocí cvičení, diskuze a průběžného ověření znalostí.",
      en: "Practice and deepening of main concepts through exercises, discussion and ongoing knowledge verification.",
    },
    status: "passive" as const,
  },
];

const merchCatalogSeed = [
  {
    slug: "platform-backpack",
    name: "TDA Batoh",
    nameEn: "TDA Backpack",
    descriptionEn: "Limited Think Different Academy merch item.",
    description: "Limitovaná merch položka Think Different Academy.",
    imageUrl: "/api/uploads/bag123.png",
    unitPriceCents: 99900,
    purchaseMode: "money" as const,
    xpCost: null,
    voucherDiscountPercent: null,
    active: true,
  },
  {
    slug: "platform-tshirt",
    name: "TDA T-Shirt",
    nameEn: "TDA T-Shirt",
    descriptionEn: "Classic T-shirt with platform branding.",
    description: "Klasické tričko s brandingem platformy.",
    imageUrl: "/api/uploads/tshirt.png",
    unitPriceCents: 59900,
    purchaseMode: "money" as const,
    xpCost: null,
    voucherDiscountPercent: null,
    active: true,
  },
  {
    slug: "platform-earrings",
    name: "Signal Earrings",
    nameEn: "Signal Earrings",
    descriptionEn: "Accessory merch item for platform fans.",
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
    nameEn: "TDA Signal Cap",
    descriptionEn:
      "Minimalist white cap with the iconic 'Tada' mark, a symbol of ideas.",
    description:
      "Minimalistická bílá kšiltovka s ikonickým 'Tádou' – symbolem nápadů.",
    imageUrl: "/api/uploads/cap.png",
    unitPriceCents: 35000,
    purchaseMode: "money" as const,
    xpCost: null,
    voucherDiscountPercent: null,
    active: true,
  },
  {
    slug: "platform-sale10",
    nameEn: "10% discount coupon",
    descriptionEn: "Voucher with 10% off your next order.",
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
    nameEn: "20% discount coupon",
    descriptionEn: "Voucher with 20% off your next order.",
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

const merchCatalogSeedNormalized = merchCatalogSeed.map((item) => {
  switch (item.slug) {
    case "platform-backpack":
      return {
        ...item,
        name: "Batoh TDA",
        description: "Limitovaná merch položka Think Different Academy.",
      };
    case "platform-tshirt":
      return {
        ...item,
        name: "Tričko TDA",
        description: "Klasické tričko s brandingem platformy.",
      };
    case "platform-earrings":
      return {
        ...item,
        name: "Náušnice Signal",
        description: "Doplňková merch položka pro fanoušky platformy.",
      };
    case "platform-cap":
      return {
        ...item,
        name: "Kšiltovka TDA Signal",
        description:
          "Minimalistická bílá kšiltovka s ikonickým 'Tádou' – symbolem nápadů.",
      };
    case "platform-sale10":
      return {
        ...item,
        name: "10% slevový kupon",
        description: "Voucher se slevou 10 % na další objednávku.",
      };
    case "platform-sale20":
      return {
        ...item,
        name: "20% slevový kupon",
        description: "Voucher se slevou 20 % na další objednávku.",
      };
    default:
      return item;
  }
});

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

  const merchSlugs = merchCatalogSeedNormalized.map((item) => item.slug);
  const existingMerch = await db
    .select({ uuid: merchItems.uuid, slug: merchItems.slug })
    .from(merchItems)
    .where(inArray(merchItems.slug, merchSlugs));
  const existingMerchBySlug = new Map(
    existingMerch.map((item) => [item.slug, item.uuid]),
  );
  const existingMerchSlugs = new Set(existingMerch.map((item) => item.slug));
  const merchToInsert = merchCatalogSeedNormalized.filter(
    (item) => !existingMerchSlugs.has(item.slug),
  );

  for (const item of merchCatalogSeedNormalized) {
    const existingMerchId = existingMerchBySlug.get(item.slug);
    if (!existingMerchId) {
      continue;
    }

    await db
      .update(merchItems)
      .set({
        sourceLocale: SEED_SOURCE_LOCALE,
        name: item.name,
        nameI18n: localizedTextWithEnglish(item.name, item.nameEn),
        description: item.description,
        descriptionI18n: localizedTextWithEnglish(
          item.description,
          item.descriptionEn,
        ),
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
    await db.insert(merchItems).values(
      merchToInsert.map((item) => ({
        slug: item.slug,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        unitPriceCents: item.unitPriceCents,
        purchaseMode: item.purchaseMode,
        xpCost: item.xpCost,
        voucherDiscountPercent: item.voucherDiscountPercent,
        active: item.active,
        sourceLocale: SEED_SOURCE_LOCALE,
        nameI18n: localizedTextWithEnglish(item.name, item.nameEn),
        descriptionI18n: localizedTextWithEnglish(
          item.description,
          item.descriptionEn,
        ),
      })),
    );
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

  const existingCourses = await db
    .select({
      uuid: courses.uuid,
      name: courses.name,
      nameI18n: courses.nameI18n,
    })
    .from(courses)
    .where(eq(courses.organizationId, tdaOrganization.uuid));

  const existingCoursesBySeedKey = new Map<string, string>();
  for (const course of existingCourses) {
    existingCoursesBySeedKey.set(course.name, course.uuid);

    const csName = course.nameI18n?.cs?.trim();
    if (csName) {
      existingCoursesBySeedKey.set(csName, course.uuid);
    }

    const enName = course.nameI18n?.en?.trim();
    if (enName) {
      existingCoursesBySeedKey.set(enName, course.uuid);
    }
  }

  for (const course of seedCourses) {
    const existingCourseId =
      existingCoursesBySeedKey.get(course.name) ??
      (course.nameEn ? existingCoursesBySeedKey.get(course.nameEn) : undefined);
    if (!existingCourseId) {
      continue;
    }

    await db
      .update(courses)
      .set({
        sourceLocale: SEED_SOURCE_LOCALE,
        name: course.name,
        nameI18n: localizedTextWithEnglish(course.name, course.nameEn),
        description: course.description,
        descriptionI18n: localizedTextWithEnglish(
          course.description,
          course.descriptionEn,
        ),
        status: course.status,
        scheduledFor: course.scheduledFor,
        startedAt: course.startedAt,
        status_history: course.status_history,
        updatedAt: new Date(),
      })
      .where(eq(courses.uuid, existingCourseId));
  }

  const coursesToInsert = seedCourses.filter(
    (course) =>
      !existingCoursesBySeedKey.has(course.name) &&
      !(course.nameEn && existingCoursesBySeedKey.has(course.nameEn)),
  );

  if (coursesToInsert.length > 0) {
    const createdCourses = await db
      .insert(courses)
      .values(
        coursesToInsert.map(({ nameEn, descriptionEn, ...course }) => ({
          ...course,
          sourceLocale: SEED_SOURCE_LOCALE,
          nameI18n: localizedTextWithEnglish(course.name, nameEn),
          descriptionI18n: localizedTextWithEnglish(
            course.description,
            descriptionEn,
          ),
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
            sourceLocale: SEED_SOURCE_LOCALE,
            name: m.name,
            nameI18n: m.nameI18n ?? localizedText(m.name),
            description: m.description,
            descriptionI18n: m.descriptionI18n ?? localizedText(m.description),
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
          nameI18n: { cs: "Oficiální sylabus kurzu", en: "Official Course Syllabus" },
          description:
            "Podrobný přehled témat, hodnocení a rozvrhu pro semestr.",
          descriptionI18n: {
            cs: "Podrobný přehled témat, hodnocení a rozvrhu pro semestr.",
            en: "A detailed overview of topics, grading and schedule for the semester.",
          },
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
          nameI18n: { cs: "Doplňková četba - Modul 1: Základy", en: "Supplementary Reading - Module 1: Basics" },
          description:
            "Externí články a blogové příspěvky pro prohloubení pochopení základních konceptů.",
          descriptionI18n: {
            cs: "Externí články a blogové příspěvky pro prohloubení pochopení základních konceptů.",
            en: "External articles and blog posts to deepen understanding of basic concepts.",
          },
          url: "https://medium.com/tag/programming-basics",
          faviconUrl:
            "https://www.google.com/s2/favicons?domain=medium.com&sz=64",
        },
        {
          moduleId: module1Id,
          type: "file" as const,
          name: "Prezentace z přednášky - Týden 1: Úvod",
          nameI18n: { cs: "Prezentace z přednášky - Týden 1: Úvod", en: "Lecture Slides - Week 1: Introduction" },
          description:
            "Ke stažení prezentace z první úvodní přednášky. Zahrnuje nastavení a základní koncepty.",
          descriptionI18n: {
            cs: "Ke stažení prezentace z první úvodní přednášky. Zahrnuje nastavení a základní koncepty.",
            en: "Downloadable slides from the first introductory lecture. Includes setup and basic concepts.",
          },
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
          nameI18n: { cs: "Interaktivní programovací prostředí", en: "Interactive Programming Environment" },
          description:
            "Procvičujte si své dovednosti s živým spouštěním kódu a interaktivními cvičeními.",
          descriptionI18n: {
            cs: "Procvičujte si své dovednosti s živým spouštěním kódu a interaktivními cvičeními.",
            en: "Practice your skills with live code execution and interactive exercises.",
          },
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
          nameI18n: { cs: "Cvičení - Modul 2: Datové struktury", en: "Exercises - Module 2: Data Structures" },
          description: "Úkoly k řešení zaměřené na běžné datové struktury.",
          descriptionI18n: {
            cs: "Úkoly k řešení zaměřené na běžné datové struktury.",
            en: "Problem sets focused on common data structures.",
          },
          fileUrl: "/api/uploads/exercise-sheet-module2.txt",
          mimeType: "text/plain",
          sizeBytes: 1024 * 250,
          originalFilename: "exercise-sheet-module2.txt",
        },
        {
          moduleId: module2Id,
          type: "url" as const,
          name: "Fórum pro pokročilá témata",
          nameI18n: { cs: "Fórum pro pokročilá témata", en: "Advanced Topics Forum" },
          description:
            "Komunitní fórum pro diskuzi o pokročilých tématech a získání pomoci.",
          descriptionI18n: {
            cs: "Komunitní fórum pro diskuzi o pokročilých tématech a získání pomoci.",
            en: "Community forum for discussing advanced topics and getting help.",
          },
          url: `https://stackoverflow.com/tags/${course.name.split(" ")[0].toLowerCase()}`,
          faviconUrl:
            "https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=64",
        },
        {
          moduleId: module2Id,
          type: "file" as const,
          name: "Pokyny k miniprojektu",
          nameI18n: { cs: "Pokyny k miniprojektu", en: "Mini-project Guidelines" },
          description:
            "Podrobný dokument s požadavky na miniprojekt, kritérii hodnocení a procesem odevzdání.",
          descriptionI18n: {
            cs: "Podrobný dokument s požadavky na miniprojekt, kritérii hodnocení a procesem odevzdání.",
            en: "Detailed document with mini-project requirements, grading criteria and submission process.",
          },
          fileUrl: "/api/uploads/project-guidelines.txt",
          mimeType: "text/plain",
          sizeBytes: 1024 * 900,
          originalFilename: "project-guidelines.txt",
        },
        {
          moduleId: module2Id,
          type: "url" as const,
          name: "Externí zdroje kurzu",
          nameI18n: { cs: "Externí zdroje kurzu", en: "External Course Resources" },
          description:
            "Vybraný seznam externích knih, tutoriálů a online kurzů.",
          descriptionI18n: {
            cs: "Vybraný seznam externích knih, tutoriálů a online kurzů.",
            en: "Curated list of external books, tutorials and online courses.",
          },
          url: `https://www.freecodecamp.org/news/tag/${course.name
            .split(" ")[0]
            .toLowerCase()}`,
          faviconUrl:
            "https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=64",
        },
      ];

      await db.insert(courseMaterials).values(
        materials.map((material) => ({
          ...material,
          sourceLocale: SEED_SOURCE_LOCALE,
          nameI18n: material.nameI18n,
          descriptionI18n: material.descriptionI18n,
        })),
      );

      const quizzesData = [
        {
          moduleId: module1Id,
          title: "Modul 1: Kvíz ze základů",
          titleI18n: { cs: "Modul 1: Kvíz ze základů", en: "Module 1: Basics Quiz" },
          questions: [
            {
              uuid: uuidv4(),
              type: "singleChoice" as const,
              question: `Jaký je hlavní cíl úvodního modulu v ${course.name}?`,
              questionEn: `What is the main goal of the introductory module in ${course.nameI18n?.en ?? course.name}?`,
              options: [
                "Zapamatovat si definice",
                "Pochopit základní koncepty a terminologii",
                "Vytvořit kompletní aplikaci",
                "Provádět pokročilé optimalizace",
              ],
              optionsEn: [
                "Memorize definitions",
                "Understand basic concepts and terminology",
                "Build a complete application",
                "Perform advanced optimizations",
              ],
              correctIndex: 1,
            },
            {
              uuid: uuidv4(),
              type: "multipleChoice" as const,
              question:
                "Které z těchto programovacích paradigmat jsou relevantní pro tento kurz?",
              questionEn:
                "Which of these programming paradigms are relevant to this course?",
              options: [
                "Objektově orientované",
                "Funkcionální",
                "Procedurální",
                "Logické",
              ],
              optionsEn: [
                "Object-oriented",
                "Functional",
                "Procedural",
                "Logical",
              ],
              correctIndices: [0, 1, 2],
            },
            {
              uuid: uuidv4(),
              type: "singleChoice" as const,
              question:
                "V kterém roce byl vyvinut první široce uznávaný vysokoúrovňový programovací jazyk?",
              questionEn:
                "In which year was the first widely recognized high-level programming language developed?",
              options: ["1940", "1950", "1960", "1970"],
              optionsEn: ["1940", "1950", "1960", "1970"],
              correctIndex: 1,
            },
          ],
        },
        {
          moduleId: module2Id,
          title: "Modul 2: Hodnocení klíčových konceptů",
          titleI18n: { cs: "Modul 2: Hodnocení klíčových konceptů", en: "Module 2: Key Concepts Assessment" },
          questions: [
            {
              uuid: uuidv4(),
              type: "multipleChoice" as const,
              question:
                "Které z následujících jsou výhody použití verzovacích systémů jako Git?",
              questionEn:
                "Which of the following are advantages of using version control systems like Git?",
              options: [
                "Sledování změn",
                "Spolupráce s ostatními",
                "Automatické nasazování aplikací",
                "Vytváření uživatelských rozhraní",
              ],
              optionsEn: [
                "Tracking changes",
                "Collaborating with others",
                "Automatically deploying applications",
                "Creating user interfaces",
              ],
              correctIndices: [0, 1],
            },
            {
              uuid: uuidv4(),
              type: "singleChoice" as const,
              question: "Co je to algoritmus?",
              questionEn: "What is an algorithm?",
              options: [
                "Programovací jazyk",
                "Sada instrukcí pro řešení problému",
                "Typ databáze",
                "Prvek uživatelského rozhraní",
              ],
              optionsEn: [
                "A programming language",
                "A set of instructions for solving a problem",
                "A type of database",
                "A user interface element",
              ],
              correctIndex: 1,
            },
            {
              uuid: uuidv4(),
              type: "multipleChoice" as const,
              question: "Běžné webové technologie zahrnují:",
              questionEn: "Common web technologies include:",
              options: ["HTML", "CSS", "JavaScript", "SQL"],
              optionsEn: ["HTML", "CSS", "JavaScript", "SQL"],
              correctIndices: [0, 1, 2],
            },
          ],
        },
      ];

      const createdQuizzes = await db
        .insert(quizzes)
        .values(
          quizzesData.map((quiz) => ({
            moduleId: quiz.moduleId,
            sourceLocale: SEED_SOURCE_LOCALE,
            title: quiz.title,
            titleI18n: quiz.titleI18n,
            questions: quiz.questions,
            questionsI18n: quiz.questions.map((q) => ({
              uuid: q.uuid,
              type: q.type,
              questionI18n: { cs: q.question, en: q.questionEn },
              optionsI18n: q.options.map((opt, i) => ({
                cs: opt,
                en: q.optionsEn[i],
              })),
              ...(typeof q.correctIndex === "number"
                ? { correctIndex: q.correctIndex }
                : {}),
              ...(Array.isArray(q.correctIndices)
                ? { correctIndices: q.correctIndices }
                : {}),
            })),
          })),
        )
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

      const normalizedFeedMessages = [
        `Vítejte v kurzu '${course.name}'! Připravte se na zajímavou cestu učení.`,
        "Připomínka: První živá diskuze je naplánována na příští úterý. Připravte si své otázky!",
        "Konzultační hodiny tento týden: Pondělí 14-15 a Středa 11-12. Přijďte prodiskutovat cokoliv!",
        "Termín odevzdání úkolu 1 prodloužen o 3 dny na základě vašich požadavků. Nový termín je v pátek!",
        "Příští týden nás čeká hostem přednáška: 'Budoucnost AI v softwarovém inženýrství'. Podrobnosti brzy.",
        "Nezapomeňte odevzdat úkoly z modulu 2 do konce dne. Pokud potřebujete pomoc, ozvěte se!",
        "Skvělá práce na posledních úkolech! Pokračujte v tom výborném úsilí.",
        "Krátká anketa: Jaká témata byste rádi probírali podrobněji? Vaše zpětná vazba je cenná!",
      ];

      feed.forEach((item, index) => {
        item.message = normalizedFeedMessages[index] ?? item.message;
      });

      await db.insert(feedItems).values(
        feed.map((item) => ({
          ...item,
          sourceLocale: SEED_SOURCE_LOCALE,
          messageI18n: localizedText(item.message),
        })),
      );
    }
  } else {
    logger.info(
      "Courses already exist for organization tda, synchronized translations",
    );
  }

  logger.info("Seeding complete with production-ready data");
}
