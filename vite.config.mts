import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "findmuskist",
  description: "An extension that find hidden Muskists",
  version: "1.0",
  //   icons: {
  //     "16": "images/icon-16.png",
  //     "32": "images/icon-32.png",
  //     "48": "images/icon-48.png",
  //     "128": "images/icon-128.png",
  //   },
  content_scripts: [
    {
      matches: ["https://*.twitter.com/*", "https://*.x.com/*"],
      run_at: "document_start",
      js: ["injecter.js"],
    },
  ],
  web_accessible_resources: [
    {
      resources: ["injected.js", "node_modules/xhook/es/main.js"],
      matches: ["https://*.twitter.com/*", "https://*.x.com/*"],
    },
  ],
});

export default defineConfig({
  plugins: [crx({ manifest })],
});
