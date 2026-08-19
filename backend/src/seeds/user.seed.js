import "dotenv/config";

import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

const seedUsers = [
  ["seed_dhruv", "Dhruv", "dhruv@gmail.com", ""],
  ["seed_ankit", "Ankit", "ankit10@gmail.com", ""],
  ["seed_arvind", "Arvind", "arvind15@gmail.com", ""],
  ["seed_dev", "Dev", "devji@gmail.com", ""],
  ["seed_devendra", "Devendra", "devendra23@gmail.com", ""],
   ["seed_aryan", "Aryan", "aryan@gmail.com", ""],
];
async function seedDatabase() {
  await connectDB();

  const result = await User.bulkWrite(
    seedUsers.map(([clerkId, fullName, email, profilePic]) => ({
      updateOne: {
        filter: { clerkId },
        update: {
          $set: { clerkId, fullName, email, profilePic },
        },
        upsert: true,
      },
    })),
  );

  console.log(
    `Seeded users. Inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}, matched: ${result.matchedCount}`,
  );
}

seedDatabase()
  .catch((error) => {
    console.error("Failed to seed users:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
