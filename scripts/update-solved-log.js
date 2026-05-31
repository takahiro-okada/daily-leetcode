const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const readmePath = path.join(repoRoot, "README.md");
const startMarker = "<!-- solved-log:start -->";
const endMarker = "<!-- solved-log:end -->";

function git(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function markdownLink(text, href) {
  return `[${text.replace(/\|/g, "\\|")}](${href})`;
}

function getProblemTitle(problemDir) {
  const problemReadme = path.join(repoRoot, problemDir, "README.md");
  if (!fs.existsSync(problemReadme)) {
    return problemDir;
  }

  const readme = fs.readFileSync(problemReadme, "utf8");
  const h2LinkMatch = readme.match(/<h2><a [^>]+>\s*\d+\.\s*([^<]+)<\/a><\/h2>/);
  if (h2LinkMatch) {
    return h2LinkMatch[1].trim();
  }

  return problemDir
    .replace(/^\d+-/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getDifficulty(problemDir) {
  const problemReadme = path.join(repoRoot, problemDir, "README.md");
  if (!fs.existsSync(problemReadme)) {
    return "";
  }

  const readme = fs.readFileSync(problemReadme, "utf8");
  const difficultyMatch = readme.match(/<h3>(Easy|Medium|Hard)<\/h3>/);
  return difficultyMatch ? difficultyMatch[1] : "";
}

function getSolvedDate(problemDir, solutionFiles) {
  const dates = solutionFiles
    .map((file) => {
      try {
        return git(["log", "--diff-filter=A", "--follow", "--format=%cs", "--", path.join(problemDir, file)])
          .split("\n")
          .filter(Boolean)
          .pop();
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .sort();

  return dates[0] || "";
}

const problemRows = fs
  .readdirSync(repoRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d{4}-.+/.test(entry.name))
  .map((entry) => {
    const problemDir = entry.name;
    const files = fs
      .readdirSync(path.join(repoRoot, problemDir), { withFileTypes: true })
      .filter((file) => file.isFile() && file.name !== "README.md")
      .map((file) => file.name);

    return {
      problemDir,
      title: getProblemTitle(problemDir),
      difficulty: getDifficulty(problemDir),
      solvedDate: getSolvedDate(problemDir, files),
    };
  })
  .filter((row) => row.solvedDate)
  .sort((a, b) => a.solvedDate.localeCompare(b.solvedDate) || a.problemDir.localeCompare(b.problemDir));

const table = [
  "## Solved Log",
  "",
  "| Solved on | Problem | Difficulty |",
  "| --- | --- | --- |",
  ...problemRows.map((row) => {
    const problem = markdownLink(`${row.problemDir} - ${row.title}`, `./${row.problemDir}`);
    return `| ${row.solvedDate} | ${problem} | ${row.difficulty} |`;
  }),
].join("\n");

const readme = fs.readFileSync(readmePath, "utf8");
const start = readme.indexOf(startMarker);
const end = readme.indexOf(endMarker);

if (start === -1 || end === -1 || start > end) {
  throw new Error(`README.md must contain ${startMarker} and ${endMarker}`);
}

const nextReadme = [
  readme.slice(0, start + startMarker.length),
  "\n",
  table,
  "\n",
  readme.slice(end),
].join("");

if (nextReadme !== readme) {
  fs.writeFileSync(readmePath, nextReadme);
}
