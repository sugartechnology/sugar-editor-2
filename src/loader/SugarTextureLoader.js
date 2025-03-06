import {
	ImageLoader,
	LinearFilter,
	LinearMipMapLinearFilter,
	RepeatWrapping,
	Texture,
	TextureLoader,
	WebGLRenderer,
} from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

export class SugarTextureLoader {
	constructor() {
			this.textureLoader = undefined;
			this.ktxLoader = undefined;
	}

	getKtxLoader() {
			if (!this.ktxLoader) {
					this.ktxLoader = new KTX2Loader();
					this.ktxLoader.setTranscoderPath(
							"https://s3.eu-central-1.amazonaws.com/cdn.sugartech/mottobucket/ktx/"
					);
			}
			return this.ktxLoader;
	}

	getTextureLoader() {
			if (!this.textureLoader) {
					this.textureLoader = new TextureLoader();
			}
			return this.textureLoader;
	}

	/*isPowerOfTwo(image) {
	return (
		MathUtils.isPowerOfTwo(image.width) &&
		MathUtils.isPowerOfTwo(image.height)
	);
}

resize(image) {
	if (this.isPowerOfTwo(image)) return image;
	const canvas = document.createElement("canvas");
	let width = MathUtils.ceilPowerOfTwo(image.width);
	let height = MathUtils.ceilPowerOfTwo(image.height);
	canvas.width = width;
	canvas.height = height;
	canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
	return canvas;
}*/

	load(key) {
			//const resizeFunc = this.resize.bind(this);
			const promise = new Promise((resolve, reject) => {
					const texture = new Texture();
					const url = key; //tex.uri;

					if (url.match(/.ktx2$|.ktx2\?.*/gm)) {
							const ktxLoader = this.getKtxLoader();

							ktxLoader.load(url, (texture) => {
									const renderer = new WebGLRenderer();
									texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
									renderer.dispose();
									texture.wrapS = RepeatWrapping;
									texture.wrapT = RepeatWrapping;
									texture.minFilter = LinearMipMapLinearFilter;
									texture.magFilter = LinearFilter;
									texture.needsUpdate = true;
									resolve(texture);
							});
					} else {
							const imageLoader = new ImageLoader(this.getTextureLoader().manager);

							imageLoader.setCrossOrigin(this.getTextureLoader().crossOrigin);
							imageLoader.setPath(this.getTextureLoader().path);

							imageLoader.load(url, function (image) {
									texture.image = image; // resizeFunc(image);
									texture.wrapS = RepeatWrapping;
									texture.wrapT = RepeatWrapping;
									texture.minFilter = LinearMipMapLinearFilter;
									texture.magFilter = LinearFilter;
									texture.needsUpdate = true;
									resolve(texture);
							});
					}
			});
			return promise;
	}
}
