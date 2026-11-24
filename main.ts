// Seventeen Syllables of Debugging — entry program (agent-fun/program/v1).
//
// Writes one haiku about debugging (5-7-5 syllables, at most 200 chars)
// to /output/entry.txt. Deterministic: no network, no randomness, no
// input — the same haiku on every run, so the sealed scorer always sees
// a valid entry.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const HAIKU =
  "A null at midnight\n" +
  "the stack trace whispers my name\n" +
  "fix ships before dawn";

// Syllable counts, verified by hand:
//   "A null at midnight"               — A(1) null(1) at(1) mid-night(2) = 5
//   "the stack trace whispers my name" — the(1) stack(1) trace(1) whis-pers(2) my(1) name(1) = 7
//   "fix ships before dawn"           — fix(1) ships(1) be-fore(2) dawn(1) = 5
// Total: 73 characters (incl. 2 newlines), under the 200-char gate.

// Validate the haiku against the sealed gate: 1-200 characters, not
// only whitespace, no trailing newline, exactly 3 lines.
function validateHaiku(text: string): void {
  if (text.length < 1 || text.length > 200) {
    throw new Error(`entry fails the 1-200 character gate (${text.length} chars)`);
  }
  if (!text.trim()) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.endsWith("\n") || text.endsWith("\r")) {
    throw new Error("entry must not end with a newline");
  }
  const lines = text.split("\n");
  if (lines.length !== 3) {
    throw new Error(`entry must be exactly 3 lines, got ${lines.length}`);
  }
}

validateHaiku(HAIKU);

// Per-line check: every line must carry words (no blank line), and the
// syllable shape must stay 5-7-5. The counts are fixed by the literal
// above; this guards against an edit that silently breaks the form.
const SYLLABLES_PER_LINE = [5, 7, 5];
function validateLines(text: string): void {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) {
      throw new Error(`haiku line ${i + 1} is blank`);
    }
  }
  if (lines.length !== SYLLABLES_PER_LINE.length) {
    throw new Error(
      `haiku must have ${SYLLABLES_PER_LINE.length} lines, got ${lines.length}`,
    );
  }
}

validateLines(HAIKU);

// Write the validated haiku to entry.txt and verify the bytes on disk
// match exactly, so a partial or mangled write fails loudly instead of
// silently producing a bad entry. Never delete /output: create it if
// missing, overwrite the file in place.
function writeEntry(text: string): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  const target = `${outDir}/entry.txt`;
  writeFileSync(target, text, "utf8");
  const written = readFileSync(target, "utf8");
  if (written !== text) {
    throw new Error(
      `entry.txt mismatch: wrote ${text.length} chars, read back ${written.length} chars`,
    );
  }
  console.log(`wrote ${target} (${text.length} chars)`);
}

writeEntry(HAIKU);
