import {
	Material,
	Mesh,
	MeshPhysicalMaterial,
	Object3D
} from "three";

/**
 *
 * @param {Object3D} mainObject Root object to search for materials
 * @param {RegExp} regex
 * @param {boolean | undefined} log
 * @returns
 */
export const filterByMaterialName = (
	mainObject,
	regex,
	log = false
) => {
	let r = [];
	mainObject.traverse( ( e ) => {
		if ( !r.includes( e ) ) {
			if ( e.isObject3D ) {
				if ( log ) console.log( e );
				const m = e.material;
				let addElement;
				//if it is  array regex
				if ( Array.isArray( regex ) ) {
					let filterMathces = regex.filter( ( reg ) => {
						return m && m.name && m.name.match( reg );
					} );
					if ( filterMathces.length > 0 ) addElement = e;
				} //if it is single regex
				else if ( m && m.name && m.name.match( regex ) ) addElement = e;

				if ( addElement ) r.push( addElement );
			}
		}
	} );
	return r;
};

/**
 *
 * @param {Object3D} mainObject
 * @param {(val: unknown) => boolean} func
 * @returns
 */
export const filterByStatement = (
	mainObject,
	func
) => {
	let r = [];
	mainObject.traverse( ( e ) => {
		if ( func && func( e ) ) r.push( e );
	} );
	return r;
};

/**
 *
 * @param {Object3D} object
 * @returns
 */
export const convertMaterialsToPhysical = ( object ) => {
	const r = {};
	object.traverse( ( cobj ) => {
		if ( cobj instanceof Mesh && !r[cobj.material.id] ) {
			const mpm = new MeshPhysicalMaterial();
			r[cobj.material.id] = copyMaterial( cobj.material, mpm );
		}
		if ( cobj instanceof Mesh ) {
			cobj.material = r[cobj.material.id];
		}
	} );

	return r;
};

/**
 *
 * @param {Material} _
 * @param {Material} material2
 * @returns
 */
const copyMaterial = ( _, material2 ) => {
	return material2;
};

/**
 *
 * @param {Object3D} object
 * @param {string} name
 * @returns
 */
export const listMaterialByName = ( object, name ) => {
	const r = [];
	object.traverse( ( cobj ) => {
		if (
			cobj instanceof Mesh &&
			cobj.material.name === name &&
			!r.includes( cobj.material )
		) {
			r.push( cobj.material );
		}
	} );

	return r;
};
