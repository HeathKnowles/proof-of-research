import fs from "fs/promises";
import { validateWithGemini, ExperimentMetadata } from "../ai_validator.js";

export interface Submission {
  metadata: ExperimentMetadata;
  code: string;
}

export async function runValidation(): Promise<void> {
  const raw = await fs.readFile(
  "submissions/sample_submission.json",
  "utf-8"
);

  const submission: Submission = JSON.parse(raw);

  console.log("🔍 Running AI validation...");
  const report = await validateWithGemini(
    submission.code,
    submission.metadata
  );

  console.log("✅ Reproducibility Score:", report.score);

console.log("🔧 Limitations:");
report.limitations.forEach((lim, i) => console.log(`  ${i + 1}. ${lim}`));

console.log("💡 Suggestions:");
report.suggestions.forEach((sugg, i) => console.log(`  ${i + 1}. ${sugg}`));

}
