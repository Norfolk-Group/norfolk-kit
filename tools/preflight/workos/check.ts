import { validateAuthEnvironment } from "../../../src/modules/auth/runtime.js";

const errors = validateAuthEnvironment();
if (errors.length) {
  for (const error of errors) console.error(`WorkOS preflight: ${error}`);
  process.exitCode = 1;
} else {
  console.log("WorkOS local configuration is structurally ready. Run the official WorkOS diagnostic and staging login to verify dashboard configuration.");
}
