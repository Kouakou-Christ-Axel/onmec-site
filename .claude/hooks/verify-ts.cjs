#!/usr/bin/env node
const { execFileSync } = require("child_process");

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(input || "{}");
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path || payload?.tool_response?.filePath;
  if (!filePath || !/\.tsx?$/.test(filePath)) {
    process.exit(0);
  }

  const errors = [];
  const nodeBin = process.execPath;

  try {
    execFileSync(nodeBin, ["node_modules/typescript/bin/tsc", "--noEmit"], { stdio: "pipe" });
  } catch (err) {
    errors.push("## tsc --noEmit\n" + (err.stdout?.toString() || err.message));
  }

  try {
    execFileSync(nodeBin, ["node_modules/eslint/bin/eslint.js", filePath], { stdio: "pipe" });
  } catch (err) {
    errors.push(`## eslint ${filePath}\n` + (err.stdout?.toString() || err.message));
  }

  if (errors.length > 0) {
    process.stdout.write(
      JSON.stringify({
        decision: "block",
        reason: errors.join("\n\n"),
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: errors.join("\n\n"),
        },
      }),
    );
  }
  process.exit(0);
});
