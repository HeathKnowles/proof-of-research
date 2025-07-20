import { runValidation } from "./skills/validator.ts";

async function main() {
  console.log("🚀 Proof-of-Research Validator Agent ");
  await runValidation();
}

main().catch((err) => {
  console.error("❌ Agent Error:", err.message);
  process.exit(1);
});
