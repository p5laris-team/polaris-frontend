import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "../..");
const adsenseClientId = "ca-pub-6769614400082545";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const deploymentEnv = env.VITE_APP_ENV || env.VITE_SENTRY_ENV || mode;
  const enableRealAdRequests =
    command === "build" &&
    deploymentEnv === "production" &&
    env.VITE_ADSENSE_DISABLE_REAL_REQUESTS !== "true";

  return {
    plugins: [
      react(),
      enableRealAdRequests
        ? {
            name: "polaris-adsense-head-script",
            transformIndexHtml: {
              order: "post" as const,
              handler() {
                return [
                  {
                    tag: "script",
                    attrs: {
                      async: true,
                      src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`,
                      crossorigin: "anonymous",
                    },
                    injectTo: "head" as const,
                  },
                ];
              },
            },
          }
        : null,
      process.env.SENTRY_AUTH_TOKEN
        ? sentryVitePlugin({
            org: "polaris-x3",
            project: "polaris-web",
            authToken: process.env.SENTRY_AUTH_TOKEN,
            telemetry: false,
          })
        : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@polaris-assets": path.resolve(workspaceRoot, "assets"),
      },
    },
    server: {
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), workspaceRoot],
      },
    },
    build: {
      sourcemap: true, // Sentry requires sourcemaps to symbolicate minified production stacks
    },
  };
});
