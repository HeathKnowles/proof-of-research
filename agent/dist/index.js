import { runValidation } from "./skills/validator.js";
async function main() {
    console.log("🚀 Proof-of-Research Validator Agent (TypeScript + Gemini)");
    await runValidation();
}
main().catch((err) => {
    console.error("❌ Agent Error:", err.message);
    process.exit(1);
});
