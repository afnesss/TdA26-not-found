import { db } from "./index";
import { courses } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const LECTURER_USERNAME = "lecturer";
const LECTURER_PASSWORD = "TdA26!";

const sampleCourses = [
  { name: "Introduction to Programming", description: "Learn the basics of programming with hands-on examples." },
  { name: "Web Development Fundamentals", description: "HTML, CSS, and JavaScript essentials for building websites." },
  { name: "Database Design", description: "Understanding relational databases and SQL." },
];

export async function seed() {
  console.log("Seeding database...");

  // const existingLecturer = await db.select().from(users).where(eq(users.username, LECTURER_USERNAME));
  
  // if (existingLecturer.length === 0) {
  //   const passwordHash = await bcrypt.hash(LECTURER_PASSWORD, 10);
  //   await db.insert(users).values({
  //     username: LECTURER_USERNAME,
  //     passwordHash: passwordHash,
  //   });
  //   console.log("Lecturer account created");
  // } else {
  //   console.log("Lecturer account already exists");
  // }

  const existingCourses = await db.select().from(courses);
  
  if (existingCourses.length === 0) {
    await db.insert(courses).values(sampleCourses);
    console.log("Sample courses created");
  } else {
    console.log("Courses already exist, skipping seed");
  }

  console.log("Seeding complete");
}
