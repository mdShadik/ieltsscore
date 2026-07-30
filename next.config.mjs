import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transformersWeb = path.resolve(
  __dirname,
  "node_modules/@huggingface/transformers/dist/transformers.web.js"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["edge-tts"],
  serverExternalPackages: ["@huggingface/transformers"],
  turbopack: {
    resolveAlias: {
      "@huggingface/transformers":
        "./node_modules/@huggingface/transformers/dist/transformers.web.js",
      sharp: { browser: "" },
      "onnxruntime-node": { browser: "" },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@huggingface/transformers": transformersWeb,
        sharp$: false,
        "onnxruntime-node$": false,
      };
    }
    return config;
  },
};

export default nextConfig;
