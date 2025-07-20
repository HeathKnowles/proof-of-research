import fs from "fs/promises";
import { validateWithGemini } from "../ai_validator.js";
export async function runValidation() {
    const raw = await fs.readFile("submissions/sample_submission.json", "utf-8");
    const submission = JSON.parse(raw);
    console.log("🔍 Running AI validation...");
    const report = await validateWithGemini(submission.code, submission.metadata);
    console.log("✅ Reproducibility Score:", report.score);
    console.log("🔧 Limitations:");
    report.limitations.forEach((lim, i) => console.log(`  ${i + 1}. ${lim}`));
    console.log("💡 Suggestions:");
    report.suggestions.forEach((sugg, i) => console.log(`  ${i + 1}. ${sugg}`));
}
