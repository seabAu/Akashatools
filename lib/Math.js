// A set of useful math functions. 

/**
 * Clamps a value (num) between (min) and (max). 
 * @param {number} num 
 * @param {number} min 
 * @param {number} max 
 * @returns {number} Value clamped between min and max
 */
export const clamp = ( num, min, max ) => Math.min( Math.max( num, min ), max );

/**
 * Wraps a value (num) over a range defined by (min) and (max). 
 * If num is over max, it wraps around to min and continues up.
 * If num is under min, it wraps around to max and continues down. 
 * @param {number} num 
 * @param {number} min 
 * @param {number} max 
 * @returns {number} Value clamped between min and max
 */
export const wrap = ( num, min, max ) => {
    var r = max - min;
    return min + ( ( ( ( num - min ) % r ) + r ) % r );
};

/**
 * Rounds a number (n) to a set number of decimal places (d)
 * @param {number} n 
 * @param {number} d Number of decimal points to round to. 
 * @returns {number} 
 */
export const round = ( n, d = 0 ) => Number( `${ Math.round( `${ n }e${ d }` ) }e-${ d }` );

/**
 * Adds any number of values together. 
 * @param  {...number} nums Any number of numbers
 * @returns {number} The sum of the given numbers
 */
export function add ( ...nums ) {
    let total = 0;
    for ( const num of nums ) { total += num; }
    return total;
}

/**
 * Subtracts any number of values. 
 * @param  {...number} nums Any number of numbers
 * @returns {number}
 */
// export const sub = ( ...nums ) => nums.reduce( ( a, b ) => a - b );
export function sub ( ...nums ) {
    let total = 0;
    for ( const num of nums ) { total -= num; }
    return total;
}

/**
 * Calculates the difference between two numbers. 
 * @param {number} numA 
 * @param {number} numB 
 * @returns {number} The distance between the two points
 */
export const distance = ( numA, numB ) => {
    return Math.abs( numA - numB );
}

/**
 * Calculates the distance between two 2D points. 
 * @returns {number} The distance between the two points
 */
export const distance2 = ( pointA, pointB ) => {
    const xDiff = ( pointB.x - pointA.x ) ** 2;
    const yDiff = ( pointB.y - pointA.y ) ** 2;

    return Math.sqrt( xDiff + yDiff );
}

/**
 * Performs a coin flip, returns either true or false. 
 * @returns {boolean} Either true or false.
 */
export const boolRand = () => ( Math.random() >= 0.5 ? 1 : -1 );

/**
 * Converts a decimal value to binary
 * @param {number} num 
 * @returns {number}
 */
export const decToBinary = ( num ) => ( num === 0 ? 0 : ( num % 2 ) + 10 * decToBinary( ~~( num / 2 ) ) );
