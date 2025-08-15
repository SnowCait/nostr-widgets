import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "./src/lib/index.ts",
      name: "nostr-widgets",
      fileName: "nostr-widgets",
    },
    copyPublicDir: false,
  },
  plugins: [svelte({ compilerOptions: { customElement: true } })],
});
