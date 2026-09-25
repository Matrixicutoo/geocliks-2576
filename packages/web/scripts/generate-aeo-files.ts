/**
 * Regenerates every file an answer engine reads instead of our JavaScript:
 * public/sitemap.xml and public/llms.txt.
 *
 *   cd packages/web && bun run scripts/generate-aeo-files.ts
 *
 * One command on purpose. Both files are derived from the post catalog in
 * src/web/lib/posts, so a new post that lands in one and not the other is not a
 * half-finished job — it is a post that some crawlers cannot find and others
 * cannot read. Making that impossible to do by hand is the whole point: a run
 * that publishes a post invokes this, and cannot regenerate the sitemap while
 * forgetting llms.txt. A third generator added here keeps every caller working
 * without anyone editing the command they invoke.
 *
 * `bun run build` still calls the two scripts directly. That is deliberate — it
 * already runs both in sequence and its failure is loud, so wrapping it would
 * only add a layer between the build and its own error messages.
 *
 * Failure is loud by design. A sub-script that exits non-zero stops the run and
 * takes the exit code with it. And because a generator can fail by writing
 * nothing at all rather than by throwing, each output is checked afterwards: it
 * has to exist, be non-empty, and be newer than the moment this run started.
 * The quiet version of this failure is the expensive one — a post published
 * against a stale llms.txt is invisible to the readers it was written for, and
 * nothing about the run would look wrong.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

type Generator = {
  /** Script to run, relative to this directory. */
  readonly script: string;
  /** File it must have written, relative to packages/web. */
  readonly output: string;
};

const GENERATORS: readonly Generator[] = [
  { script: "gen-sitemap.ts", output: "public/sitemap.xml" },
  { script: "gen-llms.ts", output: "public/llms.txt" },
];

const webRoot = path.join(import.meta.dirname, "..");

/** Millisecond floor for "newer than this run", less a second of filesystem slack. */
const startedAt = Date.now() - 1000;

function fail(message: string): never {
  console.error(`\naeo: ${message}`);
  process.exit(1);
}

async function run({ script, output }: Generator): Promise<string> {
  const scriptPath = path.join(import.meta.dirname, script);

  // Inherited stdio: each generator already prints what it wrote, and its own
  // stack trace is more useful than anything this wrapper could say about it.
  const proc = Bun.spawn(["bun", scriptPath], {
    cwd: webRoot,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) fail(`${script} exited ${code} — ${output} was not regenerated.`);

  const outputPath = path.join(webRoot, output);
  const stat = await fs.stat(outputPath).catch(() => null);
  if (!stat) fail(`${script} exited 0 but ${output} does not exist.`);
  if (stat.size === 0) fail(`${script} exited 0 but ${output} is empty.`);
  if (stat.mtimeMs < startedAt) {
    fail(
      `${script} exited 0 but ${output} was not written this run ` +
        `(last modified ${new Date(stat.mtimeMs).toISOString()}). Treat it as stale.`,
    );
  }

  return `${output} — ${stat.size.toLocaleString()} bytes`;
}

const written: string[] = [];
for (const generator of GENERATORS) {
  written.push(await run(generator));
}

console.log(`\naeo: regenerated ${written.length} files`);
for (const line of written) console.log(`  ${line}`);
