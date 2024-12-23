import clean from "@rollup-extras/plugin-clean";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: [
    "src/SugarRoomDesigner.tsx"
  ],
  output: {
    file: "dist/bundle.js",
    format: "esm",
    inlineDynamicImports: true,
  },
  plugins: [
    clean(),
    resolve(),
    typescript(),
    commonjs(),
    json(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      preventAssignment: true,
    }),
    terser(),
    
  ],
};
