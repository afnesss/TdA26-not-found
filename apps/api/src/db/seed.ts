import { db } from "./index";
import { courses, courseMaterials, quizzes, feedItems } from "./schema";
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
      "Pochopte základní koncepty cloudových platform jako AWS, Azure a Google Cloud. Naučte se o IaaS, PaaS, SaaS a strategiích nasazení.",
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
];

export async function seed() {
  console.log("Seeding database...");

  // Copy seed assets to uploads directory
  try {
    const seedAssetsDir = path.join(process.cwd(), "seed_assets");
    const uploadsDir = path.join(process.cwd(), "uploads");

    // Ensure uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    const files = await fs.readdir(seedAssetsDir);
    for (const file of files) {
      await fs.copyFile(
        path.join(seedAssetsDir, file),
        path.join(uploadsDir, file)
      );
      console.log(`Copied ${file} to uploads directory`);
    }
  } catch (error) {
    console.warn(
      "Failed to copy seed assets (ignoring if dev environment issue):",
      error
    );
  }

  const existingCourses = await db.select().from(courses);

  if (existingCourses.length > 0) {
    console.log("Courses already exist, skipping seed");
    return;
  }

  // Insert Courses
  const createdCourses = await db
    .insert(courses)
    .values(sampleCourses)
    .returning();
  console.log(`Created ${createdCourses.length} courses`);

  for (const course of createdCourses) {
    // 1. Materials
    const materials = [
      {
        courseId: course.uuid,
        type: "url" as const,
        name: "Oficiální sylabus kurzu",
        description: "Podrobný přehled témat, hodnocení a rozvrhu pro semestr.",
        url: "https://example.com/syllabus",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=example.com&sz=64",
      },
      {
        courseId: course.uuid,
        type: "url" as const,
        name: "Doplňková četba - Modul 1: Základy",
        description:
          "Externí články a blogové příspěvky pro prohloubení pochopení základních konceptů.",
        url: "https://medium.com/tag/programming-basics",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=medium.com&sz=64",
      },
      {
        courseId: course.uuid,
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
        courseId: course.uuid,
        type: "url" as const,
        name: "Interaktivní programovací prostředí",
        description:
          "Procvičujte si své dovednosti s živým spouštěním kódu a interaktivními cvičeními.",
        url: "https://replit.com/",
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=replit.com&sz=64",
      },
      {
        courseId: course.uuid,
        type: "file" as const,
        name: "Cvičení - Modul 2: Datové struktury",
        description: "Úkoly k řešení zaměřené na běžné datové struktury.",
        fileUrl: "/api/uploads/exercise-sheet-module2.txt",
        mimeType: "text/plain",
        sizeBytes: 1024 * 250,
        originalFilename: "exercise-sheet-module2.txt",
      },
      {
        courseId: course.uuid,
        type: "url" as const,
        name: "Fórum pro pokročilá témata",
        description:
          "Komunitní fórum pro diskuzi o pokročilých tématech a získání pomoci.",
        url:
          "https://stackoverflow.com/tags/" +
          course.name.split(" ")[0].toLowerCase(),
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=64",
      },
      {
        courseId: course.uuid,
        type: "file" as const,
        name: "Pokyny k projektu",
        description:
          "Podrobný dokument s požadavky na závěrečný projekt, kritérii hodnocení a procesem odevzdání.",
        fileUrl: "/api/uploads/project-guidelines.txt",
        mimeType: "text/plain",
        sizeBytes: 1024 * 900,
        originalFilename: "project-guidelines.txt",
      },
      {
        courseId: course.uuid,
        type: "url" as const,
        name: "Externí zdroje kurzu",
        description: "Vybraný seznam externích knih, tutoriálů a online kurzů.",
        url:
          "https://www.freecodecamp.org/news/tag/" +
          course.name.split(" ")[0].toLowerCase(),
        faviconUrl:
          "https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=64",
      },
    ];

    await db.insert(courseMaterials).values(materials);

    // 2. Quizzes
    const quizzesData = [
      {
        courseId: course.uuid,
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
        courseId: course.uuid,
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
      {
        courseId: course.uuid,
        title: "Zkušební kvíz k závěrečné zkoušce",
        questions: [
          {
            uuid: uuidv4(),
            type: "singleChoice",
            question:
              "Jaká je časová složitost vyhledávání prvku ve vyváženém binárním vyhledávacím stromu?",
            options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"],
            correctIndex: 1,
          },
          {
            uuid: uuidv4(),
            type: "multipleChoice",
            question: "Které z těchto jsou principy čistého kódu?",
            options: [
              "Čitelnost",
              "Udržovatelnost",
              "Škálovatelnost",
              "Obfuskace",
            ],
            correctIndices: [0, 1, 2],
          },
          {
            uuid: uuidv4(),
            type: "singleChoice",
            question: "Jaký je účel cizího klíče v relační databázi?",
            options: [
              "Vynucovat referenční integritu",
              "Jednoznačně identifikovat záznam",
              "Zrychlit načítání dat",
              "Definovat primární klíč",
            ],
            correctIndex: 0,
          },
          {
            uuid: uuidv4(),
            type: "multipleChoice",
            question: "Modely cloudových služeb zahrnují:",
            options: ["IaaS", "PaaS", "SaaS", "DaaS"],
            correctIndices: [0, 1, 2],
          },
        ],
      },
    ];

    await db.insert(quizzes).values(quizzesData);

    // 3. Feed Items
    const feed = [
      {
        courseId: course.uuid,
        type: "manual" as const,
        message: `Welcome to '${course.name}'! Get ready for an exciting learning journey.`, // Use course name
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      },
      {
        courseId: course.uuid,
        type: "system" as const,
        message: `New material added: Official Course Syllabus. Please review it carefully.`, // Link to material
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28),
      },
      {
        courseId: course.uuid,
        type: "manual" as const,
        message:
          "Just a reminder: Our first live Q&A session is scheduled for next Tuesday. Bring your questions!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
      },
      {
        courseId: course.uuid,
        type: "system" as const,
        message: `New quiz added: Module 1: Foundations Quiz. Test your understanding of basic concepts.`, // Link to quiz
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      },
      {
        courseId: course.uuid,
        type: "manual" as const,
        message:
          "Office hours for this week: Monday 2-3 PM and Wednesday 11 AM-12 PM. Drop in to discuss anything!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      },
      {
        courseId: course.uuid,
        type: "system" as const,
        message: `New material added: Lecture Slides - Week 1: Introduction. Check out the key takeaways.`, // Another material
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      },
      {
        courseId: course.uuid,
        type: "manual" as const,
        message:
          "Assignment 1 deadline extended by 3 days due to popular demand. New deadline is Friday!",
        edited: true, // Mark as edited
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        courseId: course.uuid,
        type: "system" as const,
        message: `New material added: Exercise Sheet - Module 2: Data Structures. Challenge yourself!`, // Another material
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      },
      {
        courseId: course.uuid,
        type: "manual" as const,
        message:
          "Upcoming guest lecture next week: 'The Future of AI in Software Engineering'. Details to follow.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        courseId: course.uuid,
        type: "system" as const,
        message: `New quiz added: Module 2: Core Concepts Assessment. Sharpen your skills!`, // Another quiz
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      },
      {
        courseId: course.uuid,
        type: "manual" as const,
        message:
          "Don't forget to submit your Module 2 assignments by end of day. Reach out if you need help!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      },
      {
        courseId: course.uuid,
        type: "manual" as const,
        message:
          "Great work on the recent assignments! Keep up the excellent effort everyone.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        courseId: course.uuid,
        type: "system" as const,
        message: `New material added: Project Guidelines. Start planning your final projects!`, // Another material
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        courseId: course.uuid,
        type: "manual" as const,
        message:
          "A quick poll: What topics would you like to see covered in more depth? Your feedback is valuable!",
        createdAt: new Date(), // Just now
      },
    ];

    await db.insert(feedItems).values(feed);
  }

  console.log("Seeding complete with rich, production-ready data!");
}
