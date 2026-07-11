import * as utils from ".";

/**
 * Capitalizes the first letter of a string. 
 * @param {string} text 
 * @returns {string}
 */
export const toCapitalCase = ( text ) => {
	return text.charAt( 0 ).toUpperCase() + text.slice( 1 );
}

/**
 * Converts a string to kebab case. 
 * @param {string} input 
 * @returns {string}
 */
export const toKebabCase = ( input ) => input.replace( /[A-Z]/g, ( m ) => `-${ m.toLowerCase() }` );

/**
 * Converts a string to upper camelcase
 * @param {string} input 
 * @returns {string}
 */
export const toUpperCamelCase = ( input ) => input.replace( /(^|-)([a-z])/g, ( x, y, l ) => `${ l.toUpperCase() }` );

/**
 * Determines if (input) contains (pattern) as a substring. 
 * @param {string} input String to search
 * @param {string} pattern Pattern to search for
 * @param {boolean} caseSensitive Toggle for case sensitivity. 
 * @returns {boolean} True if (input) contains (pattern), false if not. 
 */
export const subStringSearch = ( input = "", pattern = "", caseSensitive = false ) => {
	if ( !caseSensitive ) {
		// Convert to lowercase for when case does not matter. 
		input = input.toLowerCase();
		pattern = pattern.toLowerCase();
	}
	// return input.search( pattern );
	return input.includes( pattern );
};

/**
 * Replaces multiple characters or sub-strings in an input string. 
 * Replacements are represented as an object, with the keys being the text to take out, and the values being the text to insert in its' place. 
 * @example utils.str.replaceMultiple(
 * 							type, { 
 * 								"[": "", 
 * 								"]": "" 
 * 							}
 * 						);
 * @param {string} input 
 * @param {object} replace 
 * @returns {string}
 */
export function replaceMultiple ( input, replace ) {
	if ( input && replace ) {
		for ( const x in replace ) {
			input = input.replace( new RegExp( x, "g" ), replace[ x ] );
		}
		return input;
	}
}

/**
 * Finds the longest string in the input and returns its' length.
 * The input may be an object, an array, or a string. 
 * @param {*} input 
 * @returns {number} The length of the longest string in a set of strings. 
 */
export const getLongest = ( input ) => {
	let longestStr = "";
	if ( utils.val.isValidArray( input, true ) ) {
		// Input is an array. 
		input.forEach( ( element, index ) => {
			if ( element ) {
				let elementStr = element.toString();
				if ( elementStr.length > longestStr.length ) longestStr = elementStr;
			}
		} );
	} else if ( utils.val.isObject( input ) ) {
		// Input is an object.
		Object.keys( input ).forEach( ( key, index ) => {
			if ( key.length > longestStr.length ) longestStr = key;
		} );
	} else {
		// Input is a basic datatype. 
		longestStr = input.toString();
	}
	return longestStr.length;
};
