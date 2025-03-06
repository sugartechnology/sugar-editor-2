import {
	Mesh
} from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import addBeforeCompile from "./shader/MultiplMapShader";

export class Sugar3DLoader {
	constructor( renderer ) {
		this._loader = this.getGLTFLoader();
		this.renderer = renderer;
	}

	load( url, options ) {
		return new Promise( ( resolve, reject ) => {
			this._loader.load(
				url,
				( returnObject ) => {
					returnObject.scene.traverse( ( mesh ) => {
						if ( mesh instanceof Mesh ) {
							this.resolveShadaw( mesh );
							this.resolveMaterial( mesh );
						}
					} );
					resolve( returnObject.scene );
				},
				options?.onProgress,
				reject
			);
		} );
	}

	getGLTFLoader() {
		const loader = new GLTFLoader();
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath(
			"https://s3.eu-central-1.amazonaws.com/cdn.sugartech/mottobucket/draco/161/"
		);
		loader.setDRACOLoader( dracoLoader );

		const ktxLoader = new KTX2Loader();
		ktxLoader
			.setTranscoderPath(
				"https://s3.eu-central-1.amazonaws.com/cdn.sugartech/mottobucket/ktx/"
			);
		// TODO: detect support
		// ktxLoader.detectSupport( renderer );
		loader.setKTX2Loader( ktxLoader );
		return loader;
	}

	resolveShadaw( mesh ) {
		mesh.castShadow = true;
		mesh.receiveShadow = true;
	}

	resolveMaterial( mesh ) {
		addBeforeCompile(
			mesh.material
		);
	}
}
