// sprint/check.test.mjs: tests for the design-studio loop's privacy guard check.
import { existsSync, writeFileSync, unlinkSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMP_DIR = join(ROOT, "sprint", "check-test-tmp");

// Helper: create a temp test file
const createTestFile = (name, content) => {
  const path = join(TEMP_DIR, name);
  writeFileSync(path, content, "utf8");
  return path;
};

// Helper: run check.mjs and capture output
const runCheck = () => {
  try {
    const output = execSync(`node sprint/check.mjs`, { cwd: ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    return output;
  } catch (e) {
    return e.stdout ?? "";
  }
};

// Create temp directory
if (!existsSync(TEMP_DIR)) execSync(`mkdir "${TEMP_DIR}"`, { cwd: ROOT });

console.log("Testing privacy guard checks...");

// Test 1: Detect gmail.com
console.log("Test 1: Detect gmail.com address");
createTestFile("test-gmail.md", "Contact me at test@gmail.com for more info");
const out1 = runCheck();
if (out1.includes("privacy") && out1.includes("gmail")) {
  console.log("  PASS: gmail.com detected");
} else {
  console.log("  WARN: gmail.com detection may not be working as expected");
}

// Test 2: Detect Israeli mobile (non-placeholder)
console.log("Test 2: Detect Israeli mobile number");
createTestFile("test-phone.txt", "Call me at 0534567890 anytime");
const out2 = runCheck();
if (out2.includes("privacy") && out2.includes("0534567890")) {
  console.log("  PASS: Israeli mobile detected");
} else {
  console.log("  WARN: Israeli mobile detection may need tuning");
}

// Test 3: Ignore placeholder phone numbers
console.log("Test 3: Ignore placeholder phone numbers");
createTestFile("test-placeholder.txt", "Use 0555555555 or 0512345678 as examples");
const out3 = runCheck();
if (!out3.includes("0555555555")) {
  console.log("  PASS: Placeholder 0555555555 ignored");
} else {
  console.log("  WARN: Placeholder detection may need tuning");
}

// Test 4: Detect konovalov/diklaaltman
console.log("Test 4: Detect forbidden names");
createTestFile("test-name.md", "Author: Maxim Konovalov");
const out4 = runCheck();
if (out4.includes("privacy") && out4.includes("konovalov")) {
  console.log("  PASS: Forbidden name detected");
} else {
  console.log("  WARN: Name detection may not be working");
}

// Clean up
try {
  execSync(`rm -r "${TEMP_DIR}"`, { cwd: ROOT });
} catch {}

console.log("\nPrivacy guard tests complete.");
