import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      open: true,
      proxy: {
        "/api-jira": {
          target: `https://${env.VITE_JIRA_DOMAIN}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-jira/, ""),
          configure: (proxy, options) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log("Enviando petición a:", options.target + req.url);
            });
          },
        },
      },
    },
  };
});
