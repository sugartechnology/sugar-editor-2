import resolve from "@rollup/plugin-node-resolve";

import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";

export default {
  input: [
    "src/SugarReactEditor.jsx",
  ],
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    chunkFileNames: "[name]-[hash].js",
  },
  plugins: [
    replace( {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
      preventAssignment: true,
      "'use client';": "",
      '"use client";': "",
    } ),
    resolve(),
    commonjs(),
    postcss( {
      extensions: [".css"],
    } ),
    babel( {
      exclude: "node_modules/**",
      presets: ["@babel/preset-env", "@babel/preset-react"],
    } ),
    json(),
    del( {
      targets: "dist/*",
      runOnce: true,
    } ),
    terser(),
    serve( {
      contentBase: ["dist", "public", "src"],
      port: 3000,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    } ),
  ],
};
