import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

import clean from "@rollup-extras/plugin-clean";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import babel from "rollup-plugin-babel";
import livereload from "rollup-plugin-livereload";
import postcss from 'rollup-plugin-postcss';
import serve from "rollup-plugin-serve";

export default {
  input: [
    // "src/SugarRoomDesigner.tsx",
    // "src/SugarModelViewer.tsx",
    "src/SugarReactEditor.jsx",
    // "src/SugarModelViewerTrial.tsx",
  ],
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    chunkFileNames: "[name]-[hash].js",
  },
  plugins: [
    resolve(),
    typescript(),
    commonjs(),
    postcss({ // for css import 
      extensions: ['.css']
    }),
    babel({
      exclude: "node_modules/**", // Node modüllerini hariç tut
      presets: ["@babel/preset-env", "@babel/preset-react"], // React ve ES6+
    }),
    json(),
    clean(),
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
      preventAssignment: true,
    }),
    // !process.env.ROLLUP_WATCH && terser(),
    process.env.ROLLUP_WATCH &&
    serve({
      open: true, // Sunucu başladığında tarayıcıyı otomatik aç
      contentBase: ["dist", "public", "src", "lib"], // Hem public hem de dist klasörlerini serve et
      port: 7800,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    }),
    process.env.ROLLUP_WATCH && livereload(),
  ],
};
