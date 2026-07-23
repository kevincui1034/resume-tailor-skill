#!/usr/bin/env node
// Deterministic helpers for /tailor — no LLM involved.
//
//   node jd-match.mjs match <jd-text-file> [--json]
//     Scores the JD against bank.md themes by trigger-keyword hits and prints,
//     per matched theme: the anchor guidance, projects, candidate bullet ids,
//     cover proof-point ids, and aggregated skills fragments.
//
//   node jd-match.mjs coverage <target-note.md> <draft.tex> [--json]
//     Extracts keywords from the target note (frontmatter tech/tools/domains
//     arrays + "## Must-haves" / "## Keywords" bullet lines) and reports which
//     appear in the draft — the keyword-coverage check, computed not eyeballed.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const bankPath = join(dirname(fileURLToPath(import.meta.url)), "..", "bank.md");

function loadBank() {
  const md = readFileSync(bankPath, "utf8");
  const m = md.match(/```json\s*\n([\s\S]*?)\n```/);
  if (!m) throw new Error("bank.md: no ```json block found");
  return JSON.parse(m[1]);
}

const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ");

// substring match at word-ish boundaries so "render" doesn't hit "surrender"
function hits(text, trigger) {
  const t = trigger.toLowerCase();
  const re = new RegExp("(^|[^a-z0-9])" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?($|[^a-z0-9])", "i");
  return re.test(text);
}

// small variant table so Postgres/PostgreSQL-style pairs count as covered
const VARIANTS = {
  postgresql: ["postgres"], postgres: ["postgresql"],
  javascript: ["js"], typescript: ["ts"],
  "next.js": ["nextjs", "next js"], "node.js": ["nodejs", "node"],
  "react native": ["react-native"], "ci/cd": ["ci cd", "cicd"],
  "rest apis": ["rest api", "rest"], kubernetes: ["k8s"],
};

function covered(keyword, text) {
  const k = keyword.toLowerCase();
  if (hits(text, k)) return true;
  if (k.length > 3 && k.endsWith("s") && hits(text, k.slice(0, -1))) return true;
  return (VARIANTS[k] || []).some((v) => hits(text, v));
}

function cmdMatch(jdFile, asJson) {
  const bank = loadBank();
  const jd = norm(readFileSync(jdFile, "utf8"));
  const themes = bank.themes
    .map((t) => ({ ...t, matched: t.triggers.filter((tr) => hits(jd, tr)) }))
    .filter((t) => t.matched.length)
    .sort((a, b) => b.matched.length - a.matched.length);
  const ids = new Set(themes.map((t) => t.id));
  const bullets = bank.bullets.filter((b) => b.themes.some((t) => ids.has(t)));
  const cover = bank.cover.filter((c) => c.themes.some((t) => ids.has(t)));
  const skills = {};
  for (const t of themes)
    for (const [cat, items] of Object.entries(bank.skills[t.id] || {}))
      (skills[cat] = skills[cat] || new Set()) && items.forEach((i) => skills[cat].add(i));
  const out = {
    themes: themes.map((t) => ({ id: t.id, hits: t.matched, anchor: t.anchor, projects: t.projects })),
    bullets: bullets.map((b) => ({ id: b.id, project: b.project, themes: b.themes.filter((t) => ids.has(t)) })),
    cover: cover.map((c) => c.id),
    skills: Object.fromEntries(Object.entries(skills).map(([k, v]) => [k, [...v]])),
    unmatchedNote: "Requirements with no theme hit above still need fresh LLM work — check the JD manually for them.",
  };
  if (asJson) return console.log(JSON.stringify(out, null, 2));
  console.log(`Matched themes (${themes.length}):\n`);
  for (const t of themes) {
    console.log(`  ${t.id}  [${t.matched.join(", ")}]`);
    console.log(`    anchor: ${t.anchor}`);
    console.log(`    projects: ${t.projects.join(", ")}`);
    const bs = bullets.filter((b) => b.themes.some((x) => x === t.id));
    if (bs.length) console.log(`    bullets: ${bs.map((b) => b.id).join(", ")}`);
    const cs = cover.filter((c) => c.themes.includes(t.id));
    if (cs.length) console.log(`    cover: ${cs.map((c) => c.id).join(", ")}`);
    console.log();
  }
  if (Object.keys(out.skills).length) {
    console.log("Skills fragments to merge:");
    for (const [cat, items] of Object.entries(out.skills)) console.log(`  ${cat}: ${items.join(", ")}`);
  }
  console.log("\n" + out.unmatchedNote);
}

function targetKeywords(md) {
  const kws = new Set();
  const add = (k) => {
    k = k.replace(/\*\*/g, "").replace(/[.:]+$/, "").trim();
    if (k.length >= 2 && k.length <= 40) kws.add(k);
  };
  const fm = md.match(/^---\n([\s\S]*?)\n---/);
  if (fm)
    for (const line of fm[1].split("\n")) {
      const m = line.match(/^(tech|tools|domains):\s*\[(.*)\]\s*$/);
      if (m) m[2].split(",").forEach(add);
    }
  const secRe = /^## (Must-haves?|Keywords?|Keyword language|Nice to haves?|What they'?re looking for)[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/gim;
  for (const [, heading, body] of md.matchAll(secRe)) {
    const isKeywordSec = /^keyword/i.test(heading);
    for (const raw of body.split("\n")) {
      const line = raw.replace(/^\s*[-*]\s+/, "").trim();
      if (!line) continue;
      if (isKeywordSec) {
        // curated keyword lists: split comma/slash-separated phrases and keep them whole
        line.split(/[,;]/).forEach((seg) => {
          seg = seg.trim();
          if (/\//.test(seg) && seg.length <= 60) seg.split("/").forEach(add);
          else add(seg);
        });
      } else {
        // requirement prose: only technical-looking tokens (capitalized mid-sentence, or with . # + digits)
        for (const m of line.matchAll(/\b([A-Z][A-Za-z0-9.+#-]{1,15}(?:\.js)?|[A-Z]{2,})\b/g)) {
          const before = line.slice(0, m.index).trimEnd();
          const startsSentence = !before || /[.!?]$/.test(before);
          if ((!startsSentence || /[.\d#+]/.test(m[1])) && !/^(The|And|Or|A|An|In|On|For|With|Some|Any|Basic|Strong|Less|More|Not|I|We|You)$/.test(m[1])) add(m[1]);
        }
      }
    }
  }
  // dedupe case-insensitively, keeping the first casing seen
  const seen = new Map();
  for (const k of kws) if (!seen.has(k.toLowerCase())) seen.set(k.toLowerCase(), k);
  return [...seen.values()];
}

function cmdCoverage(targetFile, draftFile, asJson) {
  const target = readFileSync(targetFile, "utf8");
  const draft = norm(
    readFileSync(draftFile, "utf8")
      .replace(/\\(textbf|texttt|emph|underline|href|small|footnotesize)\b/g, " ")
      .replace(/[{}\\]/g, " ")
  );
  const kws = targetKeywords(target);
  if (!kws.length) throw new Error("No keywords found in target note (need tech/tools/domains frontmatter or ## Must-haves / ## Keywords bullets)");
  const cov = kws.map((k) => ({ keyword: k, covered: covered(k, draft) }));
  const yes = cov.filter((c) => c.covered);
  const out = {
    pct: Math.round((100 * yes.length) / cov.length),
    covered: yes.map((c) => c.keyword),
    missing: cov.filter((c) => !c.covered).map((c) => c.keyword),
  };
  if (asJson) return console.log(JSON.stringify(out, null, 2));
  console.log(`Coverage: ${out.pct}% (${yes.length}/${cov.length})`);
  console.log(`Covered: ${out.covered.join(", ") || "—"}`);
  console.log(`Missing: ${out.missing.join(", ") || "—"}`);
}

const [cmd, ...args] = process.argv.slice(2);
const asJson = args.includes("--json");
const files = args.filter((a) => a !== "--json");
try {
  if (cmd === "match" && files.length === 1) cmdMatch(files[0], asJson);
  else if (cmd === "coverage" && files.length === 2) cmdCoverage(files[0], files[1], asJson);
  else {
    console.error("usage:\n  node jd-match.mjs match <jd-file> [--json]\n  node jd-match.mjs coverage <target-note.md> <draft.tex> [--json]");
    process.exit(2);
  }
} catch (e) {
  console.error("error: " + e.message);
  process.exit(1);
}
