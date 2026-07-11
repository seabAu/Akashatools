import * as utils from ".";

/**
 * Checks if a value is undefined, null, empty, or otherwise invalid. 
 * @param {*} value 
 * @returns {boolean} Returns true if valid, false if invalid. 
 */
export function valid ( value ) {
    return ( typeof value !== "undefined" ) && ( variable !== null );
}

/**
 * Type-agnostic method of checking if a value is undefined, null, empty, or otherwise invalid. 
 * @param {*} value 
 * @param {boolean} checkEmpty Toggles checking if the value is empty (ie, "" or 0).
 * @returns {boolean} Returns true if valid, false if invalid. 
 */
export function isValid ( value, checkEmpty = false ) {
    if ( isDefined( value ) ) {
        // if ( value instanceof expectedType )
        if ( checkEmpty ) {
            let type = getType( value );
            return type === "string"
                ? value
                &&
                value !== ""
                : type === "number"
                    ? value !== 0
                    : type === "boolean"
                        ? value
                        : type === "date"
                            ? value !== 0
                            : [ "array", "[array]", "[object]", "[string]", "[number]", "[boolean]", "[date]" ].includes( type )
                                ? isObject( value ) // value !== []
                                : type === "object"
                                    ? Object.keys( value ).length > 0
                                    : false;
        }
        return true;
    }
    return false;
}

/**
 * Type-agnostic method of checking if the values of an array of objects are undefined, null, empty, or otherwise invalid. 
 * @param {[any]} input
 * @returns {boolean} Returns true if valid, false if invalid. 
 */
export const validate = ( input ) => {
    if ( input ) {
        // Input is neither null or undefined, proceed to type-specific checks.
        if ( isArray( input, true ) ) {
            // Input is an array.
            if ( input.length > 0 ) {
                // Array Input has at least 1 entry.
                input.forEach( ( value, index ) => {
                    if ( !utils.val.isTruthy( value ) ) {
                        return false;
                    }
                } );
                return true;
            } else {
                return false;
            }
        } else if ( isObject( input ) ) {
            // Input is an object
            Object.entries( input ).forEach( ( prop, index ) => {
                let key = prop[ 0 ];
                let value = prop[ 1 ];

                if ( !utils.val.isTruthy( value ) || !utils.val.isTruthy( key ) ) {
                    // If either the key or value are invalid, return false for the whole object. 
                    return false;
                }
            } );
            return true;
        } else {
            // Input is something else. Check if it's truthy or not. 
            if ( !utils.val.isTruthy( input ) ) {
                return false;
            } else {
                return true;
            }
        }
    } else {
        return false;
    }
};

/**
 * Accepts a value to check if valid, and a second value to return if the first value is invalid. 
 * @param {string} value 
 * @param {string} replace Value to replace the input string if it is invalid, null, undefined, or empty. 
 * @returns 
 */
export const cleanInvalid = ( value, replace ) => ( ( value === null ) || ( value === undefined ) || ( value === "" ) || ( value === " " ) ? replace : value );

/**
 * Checks if a value is defined
 * @param {*} value 
 * @returns {boolean}
 */
export const isDefined = ( value ) => {
    // return ( ( value ) && ( value !== undefined ) && ( value !== null ) );
    return ( ( value !== undefined ) && ( value !== null ) );
}

/**
 * Checks if a value is truthy
 * @param {*} value 
 * @returns {boolean}
 */
export const isTruthy = ( value ) => {
    return isDefined( value ) && ( value !== "" );
}

/**
 * Checks if a value is a string
 * @param {*} value 
 * @returns {boolean}
 */
export const isString = ( value ) => {
    return Object.prototype.toString.call( value ) === "[object String]";
};

/**
 * Checks if a value is a number
 * @param {*} value 
 * @returns {boolean}
 */
export const isNumber = ( value ) => { return ( typeof value === "number" ); }


/**
 * Checks if a value is a Number
 * @param {*} value 
 * @returns {boolean}
 */
export const isNum = ( value ) => { return ( typeof value === "number" ); }


/**
 * Checks if a value is an Integer
 * @param {*} value 
 * @returns {boolean}
 */
export const isInt = ( value ) => { return ( isNumber( value ) ) && ( Number( value ) === value ) && ( value % 1 === 0 ); }


/**
 * Checks if a value is a SafeInteger
 * @param {*} value 
 * @returns {boolean}
 */
export const isSafeInt = ( value ) => { return ( isNumber( value ) ) && ( Number.isSafeInteger( value ) ); }


/**
 * Checks if a value is a Float
 * @param {*} value 
 * @returns {boolean}
 */
export const isFloat = ( value ) => { return ( isNumber( value ) ) && ( !isInt( value ) ); }

/**
 * Checks if a value is a boolean
 * @param {*} value 
 * @returns {boolean}
 */
export const isBool = ( value ) => {
    return value === true || value === false;
};

/**
 * Checks if a value is blank (empty, or "" and 0)
 * @param {*} value 
 * @returns {boolean}
 */
export const isBlank = ( value ) => {
    return ( !value || /^\s*$/.test( value ) ) && ( this.length === 0 || !this.trim() );
}

/**
 * Escapes escape strings. 
 * @param {string} value HTML as a string
 * @returns {string} String with escape strings escaped. 
 */
export function escapeHtml ( value ) {
    return String( value )
        .replace( /&/g, "&amp;" )
        .replace( /</g, "&lt;" )
        .replace( />/g, "&gt;" )
        .replace( /"/g, "&quot;" )
        .replace( /'/g, "&#039;" );
}

/**
 * Checks if a string is JSON. 
 * Utilizes regex.
 * Source: https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string
 * @example let isJSON = jsonString.isJSONRegex();
 * @returns True if JSON, false if not. 
 */
export function isJSONRegex () {
    var str = this;
    if ( str.blank() ) return false;
    str = str.replace( /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@" );
    str = str.replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]" );
    str = str.replace( /(?:^|:|,)(?:\s*\[)+/g, "" );
    return /^[\],:{}\s]*$/.test( str );
}

/**
 * Checks if a value is JSON.
 * @example isJSON({}) will be false, isJSON('{}') will be true.
 * @param {string} value 
 * @returns {boolean}
 */
export function isJSON ( value ) {
    if ( !( value && typeof value === "string" ) ) {
        return false;
    }
    try {
        var json = JSON.parse( str );
        return typeof json === "object";
        // return JSON.parse(str) && !!str;
    } catch ( e ) {
        return false;
    }
}

/**
 * Checks if a value is a Map
 * @param {*} input 
 * @returns {boolean} 
 */
export const isMap = ( input ) => ( input instanceof Map );

/**
 * Checks if a value is a Set
 * @param {*} input 
 * @returns {boolean} 
 */
export const isSet = ( input ) => ( input instanceof Set );

/**
 * Checks if a value is a File
 * @param {*} input 
 * @returns {boolean} 
 */
export const isFile = ( input ) => ( 'File' in window && input instanceof File );

/**
 * Checks if a value is a Blob
 * @param {*} input 
 * @returns {boolean} 
 */
export const isBlob = ( input ) => ( 'Blob' in window && input instanceof Blob );

/**
 * Checks if a value is an object.
 * Performs a check that it ISN'T an array, as arrays are considered objects, but objects aren't arrays. 
 * @param {*} value 
 * @returns {boolean}
 */
export const isObject = ( value ) => {
    return isDefined( value ) && typeof value === "object" && !Array.isArray( value );
};

/**
 * Checks if a value is an array
 * @param {*} value 
 * @returns {boolean}
 */
export const isArray = ( value ) => {
    // return ( typeof value === "object" && Array.isArray( value ) );
    return value !== null && Array.isArray( value );
};

/**
 * Checks if a value is a valid array. 
 * @param {*} input 
 * @param {boolean} checklength Toggles checking if the array's length is 0 or not. If true, arrays of valid type but 0 length are counted as invalid. 
 * @returns {boolean} True if a valid array, false if not. 
 */
export const isValidArray = ( input, checklength ) => (
    input && Array.isArray( input )
        ? (
            input[ 0 ] !== undefined
                ? (
                    checklength
                        ? input.length > 0
                        : true
                )
                : false
        )
        : false
);

/**
 * Determines if an array contains any objects. 
 * Input MUST be an array, or an error will occur. It presumes it has been typechecked as an array already. 
 * @param {[*]} input Array of elements to inspect.
 * @returns {boolean} True if array contains any objects, false if none.
 */
export const arrayContainsObjects = ( input ) => {
    return input.some( element => { return typeof element === "object" } );
}

/**
 * Checks if a value is a valid object array. 
 * @param {*} input 
 * @param {boolean} checklength Toggles checking if the array's length is 0 or not. If true, arrays of valid type but 0 length are counted as invalid. 
 * @returns {boolean} True if a valid object array (array containing objects), false if not. 
 */
export const isObjectArray = ( input, checklength ) => {
    return (
        isValidArray( input, checklength )  // Is it an array to begin with? 
            ? arrayContainsObjects( input ) // Does it contain objects? 
            : false
    );
}

/**
 * Checks if a value is either an object or array.
 * @param {*} value 
 * @returns {boolean}
 */
export const isAO = ( value ) => {
    return value instanceof Array || value instanceof Object;
}


/**
 * Determines the data type of an input value and returns the name of that type as a string. 
 * Primarily used for constructing form and other HTML elements from data dynamically. 
 * @param {*} value Value to get the type of. 
 * @returns {string} String name of the input's datatype. 
 */
export const getType = ( value ) => {
    // More useful version of vanilla javascript's typeof.
    if ( value === undefined ) {
        return "undefined";
    } else if ( value === null ) {
        return "null";
    } else if ( typeof value === "object" && Array.isArray( value ) ) {
        // Value is an array.
        if ( utils.val.isValidArray( value, true ) ) {
            // An array of what?
            let test = value[ 0 ];
            // Get the datatype of the array's element to see if it's a scalar array or object array.
            return `[${ getType( test ) }]`;
        } else {
            return "array";
        }
        // Value is a nested object array.
    } else if ( utils.val.isObject( value ) && !utils.val.isArray( value ) ) {
        // Value is an object.
        return "object";
    } else {
        // Value is a scalar of some kind. Dig into the specific type.
        if ( typeof value === "string" ) {
            // Value is a String.
            return "string";
        } else if ( utils.val.isNumber( value ) ) {
            // Value is a Number.
            return "number";
        } else if ( value === true || value === false ) {
            // Value is a Boolean.
            return "boolean";
        } else {
            return "invalid";
        }
    }
};


/**
 * 
 * @param {*} value Value to find a 
 * @returns 
 */
export const getFieldType = ( value ) => {
    // More useful version of vanilla javascript's typeof.
    // Used for generating form elements from data dynamically. 
    if ( typeof value === "object" && Array.isArray( value ) ) {
        // Value is an array.
        if ( isValidArray( value, true ) ) {
            let test = value[ 0 ];
            // Get the datatype of the array's element to see if it's a scalar array or object array.
            if ( typeof test === "object" ) {
                // Value is an array of nested objects.
                // return "list";
                return "data";
            } else if ( Array.isArray( test ) ) {
                // Value is an array of arrays.
                // return "list";
                return "data";
            } else if ( [ "string", "number", "boolean" ].includes( typeof test ) ) {
                // zValue is an array of scalars.
                return getFieldType( test );
            }
        } else {
            // Value is an empty array, but an array nonetheless.
            return "array";
        }
        // Value is a nested object array.
    } else if ( utils.val.isObject( value ) && !utils.val.isArray( value ) ) {
        // Value is an object.
        return "data";
    } else {
        // Value is a scalar of some kind. Dig into the specific type.
        // if (utils.val.isString(value)) {
        if ( typeof value === "string" ) {
            // Value is a String.
            return "text";
        } else if ( utils.val.isNumber( value ) ) {
            // Value is a Number.
            return "number";
            // } else if (utils.val.isBool(value)) {
        } else if ( value === true || value === false || value === "true" || value === "false" ) {
            // Value is a Boolean.
            return "checkbox";
        } else {
            // I dunno lol.
            // return '';
            return "invalid";
        }
    }
};


/**
 * Finds the type(s) of data present in an array and returns it as a descriptive string. 
 * Array types are returned as a normal datatype with braces around it, such as "[string]". 
 * @param {[*]} value Array containing unknown datatypes. 
 * @returns {string}
 */
export const getArrayType = ( value ) => {
    let type;
    // Test the types of a given array and return what type of an array this is.
    if ( typeof value === "object" && Array.isArray( value ) ) {
        // Value is an array.
        type = "array";
        if ( isValidArray( value, true ) ) {
            // An array of what?
            let subtype;
            value.forEach( ( element, index ) => {
                let elementType = getType( element );
                if ( !subtype ) {
                    // Subtype not yet determined. 
                    subtype = elementType;
                }
                else if ( subtype ) {
                    // In the case we encounter multiple subtypes, we want to return "mixed", not the next type we find. 
                    if ( subtype !== "mixed" ) {
                        if ( elementType !== subtype ) {
                            subtype = "mixed";
                        }
                    }
                }
            } );

            // Array types are returned as a normal datatype with braces around it, such as "[string]". 
            return `[${ subtype }]`;
        } else {
            return "array";
        }
        // Value is a nested object array.
    } else {
        // Value is not an array.
        type = "Not an array.";
    }
    return type;
};

