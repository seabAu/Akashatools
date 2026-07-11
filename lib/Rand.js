// A set of useful randomness functions. 

/**
 * Gives a random number between (min) and (max). 
 * @param {number} max The maximum number to return. Default is 1.
 * @param {number} min The minimum number to return. Default is 0.
 * @returns {number} A random number between min and max. 
 */
export const rand = ( max = 1, min = 0 ) => {
    return Math.random() * ( max - min ) + min;
}

/**
 * Gives a random number expressed as an integer between (min) and (max). 
 * Modified from mozilla developer documentation.
 * @param {number} max The maximum number to return. Default is 1.
 * @param {number} min The minimum number to return. Default is 0.
 * @param {boolean} inclusive Toggle for whether the result can be inclusive or exclusive at the maximum.
 * @returns {number} A random number expressed as an integer between min and max. 
 */
function iRand ( max = 1, min = 0, incusive = true ) {
    // Note: Can use ~~ for positive numbers for floor. 
    const minCeiled = Math.ceil( min );
    const maxFloored = Math.floor( max );
    return Math.floor( Math.random() * ( maxFloored - minCeiled + ( incusive ? 1 : 0 ) ) + minCeiled );
}

/**
 * Generates a randomized string of a desired length. 
 * @example randString( 12, '0123456789abcdefghijklmnopqrstuvwxyz' );
 * @param {number} length Desired length of string
 * @param {string} chars (OPTIONAL) Character set to use. Default is full ASCII set. 
 * @returns {string}
 */
export const randString = ( length, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' ) =>
    Array( length )
        .fill( "" )
        .map( ( v ) => chars[ Math.floor( Math.random() * chars.length ) ] )
        .join( "" );
