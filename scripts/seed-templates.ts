/**
 * Seed templates into Supabase from templates.json
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/seed-templates.ts
 *
 * Or set it in .env.local and run:
 *   npx tsx scripts/seed-templates.ts
 *
 * This script:
 * - Reads templates from scripts/templates.json
 * - Inserts them into the skills table as public templates
 * - Uses the SkillSmith system user (00000000-0000-0000-0000-000000000000)
 * - Assigns deterministic UUIDs starting from 10000000-0000-0000-0000-000000000021
 * - Skips templates that already exist (by title)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ptxhkvblqizemgfsidqf.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or service role key");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SYSTEM_AUTHOR_ID = "00000000-0000-0000-0000-000000000000";
// Existing templates use IDs 001-020, so we start at 021
const ID_START = 21;

interface Template {
  title: string;
  description: string;
  category: string;
  tags: string[];
  featured: boolean;
  content: string;
}

function makeUUID(index: number): string {
  const padded = String(index).padStart(3, "0");
  return `10000000-0000-0000-0000-000000000${padded}`;
}

async function main() {
  const templatesPath = join(__dirname, "templates.json");
  const templates: Template[] = JSON.parse(
    readFileSync(templatesPath, "utf-8")
  );

  console.log(`Found ${templates.length} templates to seed\n`);

  // Get existing template titles to avoid duplicates
  const { data: existing } = await supabase
    .from("skills")
    .select("title")
    .eq("is_template", true);

  const existingTitles = new Set((existing || []).map((s) => s.title));

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    const id = makeUUID(ID_START + i);

    if (existingTitles.has(template.title)) {
      console.log(`  SKIP: "${template.title}" (already exists)`);
      skipped++;
      continue;
    }

    // Random usage count between 50 and 250 for social proof
    const usageCount = Math.floor(Math.random() * 200) + 50;

    const { error } = await supabase.from("skills").upsert(
      {
        id,
        title: template.title,
        description: template.description,
        content: template.content,
        author_id: SYSTEM_AUTHOR_ID,
        visibility: "public",
        category: template.category,
        tags: template.tags,
        is_template: true,
        usage_count: usageCount,
        featured: template.featured,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error(`  ERROR: "${template.title}" — ${error.message}`);
    } else {
      console.log(
        `  ✓ "${template.title}" (${template.category}) [${id}]`
      );
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`);
}

main().catch(console.error);
