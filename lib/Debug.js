import * as utils from "./index.js";

/**
 * Handler for parsing information to be displayed in the console for debug purposes. 
 * Allows for dynamically filling in variable names and their values at various points in a function for easy display. 
 * Has options for format, spacing, use of newlines between items, etc. 
 * @example 
    console.log( 
        utils.debug.debug(
            'Home.js',
            Object.fromEntries(
                Object.keys( data ).map( ( item, index ) => {
                    return { item: item.label };
                } ) 
            )
        )
    );
 * @param {string} src Calling function's name. Can be passed either as a string, or an array of strings, the latter in the case you wish to display a full path for more detailed output. 
 * @param {object} vars Key-value pairs of variable names and those variables' current values. 
 *                      This will also accept an array. 
 * @param {object} options 
 * @param  {...any} values 
 * @returns {string} Compiled string to present in console. 
 */
export function debug (
    src,
    vars,
    options,
    ...values
) {
    let config = {
        ...options,
        format: 'default',
        location: '',
        spacer: ' :: ',
        newlines: true
    };

    let output = [ 'DEBUG' ];

    if ( utils.val.isArray( src ) && utils.val.isValidArray( src, true ) ) {
        // Src is an array, ie it has multiple parts like a path. 
        output.push( src.join( config.spacer ) );
    }
    else {
        output.push( src.toString() );
    }

    if ( utils.val.isObject( vars ) && !utils.val.isArray( vars ) ) {
        // Vars is an object.
        Object.keys( vars ).forEach( ( key, index ) => {
            let value = vars[ key ];
            if ( utils.val.isObject( value ) || utils.val.isArray( value ) || utils.val.isObjectArray ) {
                // Json pretty print it for now.
                // value = JSON.stringify( value, Object.keys( value ), 2 );
                value = value.toString();
            }
            output.push(
                `${ key } = ${ value }`
            );
        } );
    }
    else if ( utils.val.isArray( vars ) && utils.val.isValidArray( vars, true ) ) {
        // Vars is an array.
        vars.forEach( ( value, index ) => {
            let name = Object.keys( value )[ 0 ];
            output.push(
                // `${ index }: ${ value }`
                `${ index }: ${ name } = ${ value }`

            );
        } );
    }

    // Compile all output strings into a single printable display.
    let compiled = output.join( ( config.newlines ? '\n' : '' ) + config.spacer );
    console.log( compiled );
    return compiled;
}

