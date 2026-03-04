import { db } from "./index";
import { courses, modules, courseMaterials, quizzes, feedItems } from "./schema";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

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

export async function seed() {
  console.log("Seeding database...");

  try {
    const seedAssetsDir = path.join(process.cwd(), "seed_assets");
    const uploadsDir = path.join(process.cwd(), "uploads");

    await fs.mkdir(uploadsDir, { recursive: true });

    const files = await fs.readdir(seedAssetsDir);
    for (const file of files) {
      await fs.copyFile(path.join(seedAssetsDir, file), path.join(uploadsDir, file));
      console.log(`Copied ${file} to uploads directory`);
    }
  } catch (error) {
    console.warn("Failed to copy seed assets (ignoring if dev environment issue):", error);
  }

  const existingCourses = await db.select().from(courses);
  if (existingCourses.length > 0) {
    console.log("Courses already exist, skipping seed");
    return;
  }

  const createdCourses = await db.insert(courses).values(sampleCourses).returning();
  console.log(`Created ${createdCourses.length} courses`);

  for (const course of createdCourses) {
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

    const moduleByPosition = new Map(createdModules.map((m) => [m.position, m.uuid]));
    const module1Id = moduleByPosition.get(1)!;
    const module2Id = moduleByPosition.get(2)!;

    const materials = [
      {
        moduleId: module1Id,
        type: "url" as const,
        name: "Oficiální sylabus kurzu",
        description: "Podrobný přehled témat, hodnocení a rozvrhu pro semestr.",
        url: "https://example.com/syllabus",
        faviconUrl: "https://www.google.com/s2/favicons?domain=example.com&sz=64",
      },
      {
        moduleId: module1Id,
        type: "url" as const,
        name: "Doplňková četba - Modul 1: Základy",
        description:
          "Externí články a blogové příspěvky pro prohloubení pochopení základních konceptů.",
        url: "https://medium.com/tag/programming-basics",
        faviconUrl: "https://www.google.com/s2/favicons?domain=medium.com&sz=64",
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
      },
      {
        moduleId: module1Id,
        type: "url" as const,
        name: "Interaktivní programovací prostředí",
        description:
          "Procvičujte si své dovednosti s živým spouštěním kódu a interaktivními cvičeními.",
        url: "https://replit.com/",
        faviconUrl: "https://www.google.com/s2/favicons?domain=replit.com&sz=64",
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
        description: "Komunitní fórum pro diskuzi o pokročilých tématech a získání pomoci.",
        url: `https://stackoverflow.com/tags/${course.name.split(" ")[0].toLowerCase()}`,
        faviconUrl: "https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=64",
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
        description: "Vybraný seznam externích knih, tutoriálů a online kurzů.",
        url: `https://www.freecodecamp.org/news/tag/${course.name
          .split(" ")[0]
          .toLowerCase()}`,
        faviconUrl: "https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=64",
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
            question: "Které z těchto programovacích paradigmat jsou relevantní pro tento kurz?",
            options: ["Objektově orientované", "Funkcionální", "Procedurální", "Logické"],
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

    await db.insert(quizzes).values(quizzesData);

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
        message: "Skvělá práce na posledních úkolech! Pokračujte v tom výborném úsilí.",
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

  console.log("Seeding complete with rich, production-ready data!");
}
