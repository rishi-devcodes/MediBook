import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { Doctor } from "../models/Doctor";
import { doctors as mockDoctors } from "../mock/doctors";

// Standalone scripts run via `tsx` don't get Next.js's automatic
// .env.local loading, so we do a minimal version of it here rather than
// add a dotenv dependency for one script.
function loadEnvFile(filename: string) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf-8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    const isQuoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (isQuoted) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error(
      "MONGODB_URI is not set. Add it to a .env.local file at the project root before running the seed script (see .env.example)."
    );
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  console.log(`Seeding ${mockDoctors.length} doctors...`);

  let created = 0;
  let updated = 0;

  for (const doctor of mockDoctors) {
    const { id, ...rest } = doctor;

    // Upsert by slug so re-running this script updates existing doctors
    // in place instead of creating duplicates.
    const result = await Doctor.findOneAndUpdate(
  { slug: id },
  { $set: { slug: id, ...rest } },
  {
    upsert: true,
    new: true,
    includeResultMetadata: true,
  }
);

    if (result.lastErrorObject?.updatedExisting) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`Done. Created ${created}, updated ${updated} doctor(s).`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});