import clean from "@rollup-extras/plugin-clean";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import serve from "rollup-plugin-serve";
import postcss from 'rollup-plugin-postcss'; // for css import 

export default {
  input: [
    "src/SugarRoomDesigner.tsx"
  ],
  output: {
    file: "dist/bundle.js",
    format: "esm",
    sourcemap: true,
    inlineDynamicImports: true,
  },
  plugins: [
    clean(),
    resolve(),
    typescript(),
    commonjs(),
    json(),
    postcss({ //for css import 
      extensions: ['.css']
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      preventAssignment: true,
    }),
    terser(),
    serve({
      open: true,
      contentBase: ["public", "dist"],
      port: 7800,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  ],
};
