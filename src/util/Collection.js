/**
 * @module Collection
 * @description Collection of utility functions
 * @example
 * import { Collection } from './util/Collection';
 * Collection.forEachAsync([1, 2, 3], async (i) => {
 *   console.log(i);
 * }
 */


/**
 *
 * @param {T[]} array
 * @param {(a: T) => {}} predicate
 */
export async function forEachAsync( array, predicate ) {
	await Promise.all( array.map( predicate ) );
};

export const filterAsync = async ( arr, predicate ) => {
	const results = await Promise.all( arr.map( predicate ) );

	return arr.filter( ( _v, index ) => results[index] );
};

export const forEachRunAsync = async ( array ) => {
	await Promise.all( array );
};

export const events = [];

export const addEventListener = async ( name, func ) => {
	let event = events.find( ( e ) => e.name == name );
	if ( !event ) {
		event = { name: name, listeners: [] };
		events.push( event );
	}
	event.listeners.push( func );
};

export const removeEventListener = async ( name, func ) => {
	let event = events.find( ( e ) => e.name == name );
	if ( !event ) return;
	event.listeners = event.listeners.filter( ( e ) => e != func );
};

export const runEventListener = async ( name ) => {
	let event = events.find( ( e ) => e.name == name );
	if ( !event ) return;
	await Promise.all( event.listeners.map( ( lisener ) => lisener() ) );
};
