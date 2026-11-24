const { execSync } = require("child_process");
const fs = require("fs");

console.log("Starting Expo web export for Vercel...");

execSync("npx expo export --platform web", {
  stdio: "inherit",
  env: {
    ...process.env,
    EXPO_USE_FAST_RESOLVER: "1",
    NODE_ENV: "production",
  },
});

if (!fs.existsSync("dist") || !fs.existsSync("dist/index.html")) {
  console.error("Build failed: dist/index.html was not created");
  process.exit(1);
}

console.log("Build OK. Files:", fs.readdirSync("dist"));
