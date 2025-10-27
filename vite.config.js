import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": {
        target: "http://192.168.0.59:7770/",
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket 및 SSE 지원
        timeout: 0, // SSE는 긴 연결이므로 타임아웃 비활성화
      },
    },
  },
});
