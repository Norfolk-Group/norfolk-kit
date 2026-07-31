#!/usr/bin/env node
/**
 * db-guard — refuses to let a destructive command run against the wrong database.
 *
 * WHY THIS EXISTS: Ricardo lost months of work when agents (Replit, Claude Code)
 * became confused about which database to seed, and corrupted both dev and
 * production. That is not a discipline problem to be solved with better
 * instructions — an agent that is confident and wrong reads instructions fine.
 * It is a design problem, and the design was wrong in one specific way:
 *
 *   Safety depended on the CONFIG being right.
 *
 * A connection string is a string. Strings get swapped, copied between .env
 * files, cached in a shell, or resolved from the wrong Doppler config. When
 * that happens every check that reads the config agrees with the mistake.
 *
 * So this asks the DATABASE what it is, not the config.
 *
 * Every database carries one row saying which environment it is, written when
 * the database is created and never by application code. A destructive command
 * connects, asks, and refuses unless the answer is the one it requires. Point
 * a seed script at production and it stops — because production says
 * "production" no matter which variable pointed you there.
 *
 * Usage, in front of anything destructive:
 *   node tools/db-guard/assert-target.mjs --require development && npm run seed
 *
 * Setup, once per database:
 *   node tools/db-guard/assert-target.mjs --stamp production
 */


const args = process.argv.slice(2);
const argOf = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : null;
};

const VALID = ["development", "staging", "production"];
const required = argOf("--require");
const stamp = argOf("--stamp");
const url = process.env.DATABASE_URL;

function die(lines) {
  console.error("\n  ⛔ db-guard\n");
  lines.forEach((l) => console.error("     " + l));
  console.error("");
  process.exit(1);
}

if (!url) {
  die([
    "DATABASE_URL is not set.",
    "",
    "Nothing will run without it. Use the Doppler launcher for the",
    "environment you mean:",
    "",
    "  doppler run --config dev -- npm run <command>",
  ]);
}

if (!required && !stamp) {
  die(["Pass --require <environment> or --stamp <environment>.", "Valid: " + VALID.join(", ")]);
}
for (const v of [required, stamp].filter(Boolean)) {
  if (!VALID.includes(v)) die([`"${v}" is not a valid environment.`, "Valid: " + VALID.join(", ")]);
}

// postgres driver is resolved from the host project, not vendored here
let sql;
try {
  const { neon } = await import("@neondatabase/serverless");
  sql = neon(url);
} catch {
  die([
    "Could not load @neondatabase/serverless.",
    "Install it in this project: npm i @neondatabase/serverless",
  ]);
}

// A redacted description of where we are pointed, so the error is diagnosable
// without ever printing a credential.
function describe(connectionString) {
  try {
    const u = new URL(connectionString);
    return `${u.hostname}${u.pathname}`;
  } catch {
    return "(unparseable connection string)";
  }
}

async function readStamp() {
  const rows = await sql`
    SELECT environment, stamped_at
    FROM _db_environment
    LIMIT 1
  `;
  return rows[0] || null;
}

if (stamp) {
  const existing = await readStamp().catch(() => null);
  if (existing) {
    die([
      `This database is already stamped "${existing.environment}".`,
      `Target: ${describe(url)}`,
      "",
      "A database is stamped once, when it is created. Re-stamping is how a",
      "production database quietly becomes labelled 'development' and then",
      "gets seeded. If this is genuinely wrong, change it by hand in SQL and",
      "record why.",
    ]);
  }
  await sql`
    CREATE TABLE IF NOT EXISTS _db_environment (
      environment  text        NOT NULL,
      stamped_at   timestamptz NOT NULL DEFAULT now(),
      note         text
    )
  `;
  await sql`
    INSERT INTO _db_environment (environment, note)
    VALUES (${stamp}, 'stamped by db-guard')
  `;
  console.log(`  ✅ db-guard: ${describe(url)} is now stamped "${stamp}".`);
  process.exit(0);
}

const found = await readStamp().catch((e) => {
  if (String(e.message || e).includes("_db_environment")) {
    die([
      "This database carries no environment stamp.",
      `Target: ${describe(url)}`,
      "",
      "An unstamped database is treated as dangerous, because the most likely",
      "explanation is that you are pointed somewhere unexpected.",
      "",
      "If it is genuinely a new development database:",
      "  node tools/db-guard/assert-target.mjs --stamp development",
    ]);
  }
  die(["Could not read the environment stamp.", `Target: ${describe(url)}`, String(e.message || e)]);
});

if (!found) {
  die([
    "The stamp table exists but is empty.",
    `Target: ${describe(url)}`,
    "Refusing to guess. Stamp it deliberately.",
  ]);
}

if (found.environment !== required) {
  die([
    `This command requires a "${required}" database.`,
    `The database you are pointed at says it is "${found.environment}".`,
    "",
    `Target: ${describe(url)}`,
    `Stamped: ${new Date(found.stamped_at).toISOString().slice(0, 10)}`,
    "",
    found.environment === "production"
      ? "This is PRODUCTION. Nothing destructive runs here. If you meant to"
      : "If you meant to",
    "run against development, you are using the wrong Doppler config:",
    "",
    "  doppler run --config dev -- npm run <command>",
  ]);
}

console.log(`  ✅ db-guard: confirmed "${found.environment}" — ${describe(url)}`);
