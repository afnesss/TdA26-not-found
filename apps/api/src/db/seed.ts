import { db } from "./index";
import { courses, courseMaterials, quizzes, feedItems } from "./schema";
import { v4 as uuidv4 } from "uuid";

const sampleCourses = [
  {
    name: "Introduction to Python",
    description: "Master the basics of Python programming, from variables to object-oriented design. Perfect for beginners and aspiring data scientists.",
  },
  {
    name: "Advanced React Patterns",
    description: "Deep dive into React hooks, context, performance optimization, and scalable architecture. Learn to build enterprise-grade frontend applications.",
  },
  {
    name: "System Design 101",
    description: "Learn how to design scalable, reliable, and maintainable software systems for large-scale applications. Covers microservices, databases, caching, and more.",
  },
  {
    name: "Data Science with R",
    description: "Explore data analysis, visualization, and machine learning using the R programming language. Focus on practical applications and case studies.",
  },
  {
    name: "Cloud Computing Fundamentals",
    description: "Understand the core concepts of cloud platforms like AWS, Azure, and Google Cloud. Learn about IaaS, PaaS, SaaS, and deployment strategies.",
  },
  {
    name: "Cybersecurity Essentials",
    description: "An introduction to network security, common vulnerabilities, and protection strategies. Essential knowledge for anyone handling sensitive data.",
  },
  {
    name: "Frontend Web Development with Vue.js",
    description: "Build dynamic and responsive user interfaces using the Vue.js framework. Covers components, routing, state management, and API integration.",
  },
  {
    name: "Backend API Development with Node.js & Express",
    description: "Create robust and efficient RESTful APIs using Node.js and Express. Learn about routing, middleware, database integration, and authentication.",
  },
  {
    name: "Mobile App Development with Flutter",
    description: "Develop beautiful, natively compiled applications for mobile, web, and desktop from a single codebase using Flutter and Dart.",
  },
  {
    name: "Machine Learning with TensorFlow",
    description: "Discover the principles and applications of machine learning using TensorFlow. Covers neural networks, deep learning, and model deployment.",
  },
];

export async function seed() {
  console.log("Seeding database...");

  const existingCourses = await db.select().from(courses);

  if (existingCourses.length > 0) {
    console.log("Courses already exist, skipping seed");
    return;
  }

  // Insert Courses
  const createdCourses = await db.insert(courses).values(sampleCourses).returning();
  console.log(`Created ${createdCourses.length} courses`);

  for (const course of createdCourses) {
    // 1. Materials
    const materials = [
      {
        courseId: course.uuid,
        type: "url" as const,
        name: "Official Course Syllabus",
        description: "Detailed overview of topics, grading, and schedule for the semester.",
        url: "https://example.com/syllabus",
        faviconUrl: "https://www.google.com/s2/favicons?domain=example.com&sz=64",
      },
      {
        courseId: course.uuid,
        type: "url" as const,
        name: "Supplementary Readings - Module 1: Foundations",
        description: "External articles and blog posts to deepen your understanding of core concepts.",
        url: "https://medium.com/tag/programming-basics",
        faviconUrl: "https://www.google.com/s2/favicons?domain=medium.com&sz=64",
      },
      {
        courseId: course.uuid,
        type: "file" as const,
        name: "Lecture Slides - Week 1: Introduction",
        description: "Downloadable slides from the first introductory lecture. Covers setup and initial concepts.",
        fileUrl: "https://www.africau.edu/images/default/sample.pdf", // Placeholder PDF
        mimeType: "application/pdf",
        sizeBytes: 1024 * 700,
        // originalFilename: "lecture-slides-week1.pdf",
      },
      {
        courseId: course.uuid,
        type: "url" as const,
        name: "Interactive Coding Playground",
        description: "Practice your skills with live code execution and interactive exercises.",
        url: "https://replit.com/",
        faviconUrl: "https://www.google.com/s2/favicons?domain=replit.com&sz=64",
      },
      {
        courseId: course.uuid,
        type: "file" as const,
        name: "Exercise Sheet - Module 2: Data Structures",
        description: "Problems to solve for homework, focusing on common data structures.",
        fileUrl: "https://www.orimi.com/pdf-test.pdf", // Another placeholder PDF
        mimeType: "application/pdf",
        sizeBytes: 1024 * 250,
        // originalFilename: "exercise-sheet-module2.pdf",
      },
      {
        courseId: course.uuid,
        type: "url" as const,
        name: "Advanced Topics Forum",
        description: "A community forum for discussing advanced topics and getting help.",
        url: "https://stackoverflow.com/tags/" + course.name.split(" ")[0].toLowerCase(),
        faviconUrl: "https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=64",
      },
      {
        courseId: course.uuid,
        type: "file" as const,
        name: "Project Guidelines",
        description: "Detailed document outlining the final project requirements, rubrics, and submission process.",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/2pages.pdf", // Another placeholder PDF
        mimeType: "application/pdf",
        sizeBytes: 1024 * 900,
        // originalFilename: "project-guidelines.pdf",
      },
      {
        courseId: course.uuid,
        type: "url" as const,
        name: "External Course Resources",
        description: "Curated list of external books, tutorials, and online courses.",
        url: "https://www.freecodecamp.org/news/tag/" + course.name.split(" ")[0].toLowerCase(),
        faviconUrl: "https://www.google.com/s2/favicons?domain=freecodecamp.org&sz=64",
      },
    ];

    await db.insert(courseMaterials).values(materials);

    // 2. Quizzes
    const quizzesData = [
      {
        courseId: course.uuid,
        title: "Module 1: Foundations Quiz",
        questions: [
          {
            uuid: uuidv4(),
            type: "singleChoice",
            question: `What is the primary objective of the introductory module in ${course.name}?`,
            options: ["To memorize definitions", "To grasp fundamental concepts and terminology", "To build a complete application", "To perform advanced optimizations"],
            correctIndex: 1,
          },
          {
            uuid: uuidv4(),
            type: "multipleChoice",
            question: "Which of these programming paradigms are relevant to this course?",
            options: ["Object-Oriented", "Functional", "Procedural", "Logic-based"],
            correctIndices: [0, 1, 2],
          },
          {
            uuid: uuidv4(),
            type: "singleChoice",
            question: "What year was the first widely recognized high-level programming language developed?",
            options: ["1940s", "1950s", "1960s", "1970s"],
            correctIndex: 1,
          },
        ],
      },
      {
        courseId: course.uuid,
        title: "Module 2: Core Concepts Assessment",
        questions: [
          {
            uuid: uuidv4(),
            type: "multipleChoice",
            question: "Which of the following are benefits of using version control systems like Git?",
            options: ["Tracking changes", "Collaborating with others", "Deploying applications automatically", "Creating user interfaces"],
            correctIndices: [0, 1],
          },
          {
            uuid: uuidv4(),
            type: "singleChoice",
            question: "What is an algorithm?",
            options: ["A programming language", "A set of instructions to solve a problem", "A type of database", "A user interface element"],
            correctIndex: 1,
          },
          {
            uuid: uuidv4(),
            type: "multipleChoice",
            question: "Common web technologies include:",
            options: ["HTML", "CSS", "JavaScript", "SQL"],
            correctIndices: [0, 1, 2],
          },
        ],
      },
      {
        courseId: course.uuid,
        title: "Final Exam Practice Quiz",
        questions: [
          {
            uuid: uuidv4(),
            type: "singleChoice",
            question: "What is the time complexity of searching an element in a balanced binary search tree?",
            options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"],
            correctIndex: 1,
          },
          {
            uuid: uuidv4(),
            type: "multipleChoice",
            question: "Which of these are principles of clean code?",
            options: ["Readability", "Maintainability", "Scalability", "Obfuscation"],
            correctIndices: [0, 1, 2],
          },
          {
            uuid: uuidv4(),
            type: "singleChoice",
            question: "What is the purpose of a foreign key in a relational database?",
            options: ["To enforce referential integrity", "To uniquely identify a record", "To speed up data retrieval", "To define a primary key"],
            correctIndex: 1,
          },
          {
            uuid: uuidv4(),
            type: "multipleChoice",
            question: "Cloud service models include:",
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
        message: "Just a reminder: Our first live Q&A session is scheduled for next Tuesday. Bring your questions!",
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
        message: "Office hours for this week: Monday 2-3 PM and Wednesday 11 AM-12 PM. Drop in to discuss anything!",
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
        message: "Assignment 1 deadline extended by 3 days due to popular demand. New deadline is Friday!",
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
        message: "Upcoming guest lecture next week: 'The Future of AI in Software Engineering'. Details to follow.",
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
        message: "Don't forget to submit your Module 2 assignments by end of day. Reach out if you need help!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      },
      {
        courseId: course.uuid,
        type: "manual" as const,
        message: "Great work on the recent assignments! Keep up the excellent effort everyone.",
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
        message: "A quick poll: What topics would you like to see covered in more depth? Your feedback is valuable!",
        createdAt: new Date(), // Just now
      },
    ];

    await db.insert(feedItems).values(feed);
  }

  console.log("Seeding complete with rich, production-ready data!");
}