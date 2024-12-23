import { Material, WebGLProgramParametersWithUniforms } from "three";

import * as normal_fragment_begin from "./parts/fragment/normal_fragment_begin.glsl";
import * as normal_fragment_maps from "./parts/fragment/normal_fragment_maps.glsl";
import * as normalmap_pars_fragment from "./parts/fragment/normalmap_pars_fragment.glsl";
import * as uv_pars_fragment from "./parts/fragment/uv_pars_fragment.glsl";

import * as normal_pars_vertex from "./parts/vertex/normal_pars_vertex.glsl";
import * as uv_pars_vertex from "./parts/vertex/uv_pars_vertex.glsl";
import * as uv_vertex from "./parts/vertex/uv_vertex.glsl";

const fragmentPatterns: any = {
  "#include <normal_fragment_maps>": [0, normal_fragment_maps.default],
  "#include <normal_fragment_begin>": [0, normal_fragment_begin.default],
  "#include <normalmap_pars_fragment>": [0, normalmap_pars_fragment.default],
  "#include <uv_pars_fragment>": [0, uv_pars_fragment.default],
};
const vertexPatterns: any = {
  "#include <uv_pars_vertex>": [0, uv_pars_vertex.default],
  "#include <uv_vertex>": [0, uv_vertex.default],
  "#include <normal_pars_vertex>": [0, normal_pars_vertex.default],
};

const addBeforeCompile = (material: Material) => {
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    // no base
    let base = material.userData.baseNormalMap ? true : false;
    if (!base) return;

    //yes base yes normal check is it different
    let normalMap = (material as any)?.normalMap;
    if (
      normalMap &&
      (normalMap == material.userData.baseNormalMap ||
        normalMap.uuid == material.userData.baseNormalMap.uuid)
    ) {
      return;
    }

    //yes base no normal, set base to normal
    //recompile it
    if (!normalMap) {
      (material as any).normalMap = normalMap;
      material.needsUpdate = true;
      return;
    }

    let baseNormalMap = {
      value: material.userData.baseNormalMap,
      type: "t",
      name: "baseNormalMap",
    };
    shader.uniforms["baseNormalMap"] = baseNormalMap;
    //change pattersn for base parameters
    let newfragmentPatterns = { ...fragmentPatterns };
    //parse fragment
    let fragmentShader = parseShader(
      shader.fragmentShader,
      newfragmentPatterns
    );
    //parse vertex
    let vertexShader = parseShader(shader.vertexShader, vertexPatterns);

    shader.fragmentShader = "#define USE_BASE_NORMALMAP\n" + fragmentShader;
    shader.vertexShader = "#define USE_BASE_NORMALMAP\n" + vertexShader;

    //clear cache for shader
    //shader.customProgramCacheKey = "withBaseMultipleMapShader";
  };
};

const parseShader = (string: string, patterns: any = {}) => {
  let s = string;
  Object.keys(patterns).forEach((key) => {
    if (patterns[key][0] == 0) s = s.replace(key, patterns[key][1]);
    if (patterns[key][0] == 1) s = splice(s, key, patterns[key][1]);
  });
  return s;
};

const splice = (base: string, key: string, replace: string) => {
  var parts = base.split(key);
  parts.splice(1, 0, key);
  parts.splice(2, 0, replace);
  return parts.join("\n");
};

export default addBeforeCompile;
