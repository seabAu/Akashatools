import * as utils from ".";


// Source: https://masteringjs.io/tutorials/fundamentals/enum
export function arrayToEnum ( input ) {
	const enumObject = {};
	for ( const val of input ) {
		enumObject[ val ] = val;
	}
	return Object.freeze( enumObject );
}


/**
 * Checks if a given value is found in an array of values.
 * @param {string} value 
 * @param {[string]} array Array of values
 * @returns {boolean} True if value is found in the array, false if not. 
 */
export const isOneOf = ( value, array = [] ) => array.includes( value );

/**
 * Removes any duplicates from an array. 
 * @param {[*]} input Array containing any data types. 
 * @returns {[*]} Array with duplicates removed.
 */
export const uniqueArray = ( input ) => {
	return utils.val.isValidArray( input, true ) ? [ ...new Set( input ) ] : [];
}

/**
 * Merges two arrays and (optionally) removes duplicates. 
 * @param {[*]} array1 
 * @param {[*]} array2 
 * @param {boolean} removeDuplicates (OPTIONAL) Toggle for removing duplicates from the combined array. Default is false, so will return array with potential duplicates by default.
 * @returns {[*]}
 */
export const mergeArray = ( array1 = [], array2 = [], removeDuplicates = false ) => {
	let combined = array1.concat( array2 );
	return removeDuplicates ? uniqueArray( combined ) : combined;
}

/**
 * Accepts a value to check if valid, and a second value to return if the first value is invalid. 
 * @param {string} value 
 * @param {string} replace Value to replace the input string if it is invalid, null, undefined, or empty. 
 * @returns 
 */
export const replaceIfInvalid = ( value, replace ) => ( ( value === null || value === undefined || value === "" || value === " " ) ? replace : value );

/**
 * Utility to remove any null, undefined, or empty entries in an array, except for "" and 0.
 * @param {[any]} input Input array
 * @returns {[any]} Array with null, undefined, or empty values cleaned out. 
 */
export const removeEmpty = ( input ) => {
	return utils.val.isValidArray( input, true ) ? input.filter( ( val, index ) => val !== "" && val !== undefined && val !== null ) : input;
};

/**
 * Splits a string into an array by given separator(s). 
 * Accepts a string and a split value, containing either a single string or an array of strings as separators.
 * @param {string} text Input text
 * @param {[string]} split Separator(s) to split the text by. Can pass either a string, or an array of strings. 
 * @returns {[string]} An array of the input text divided by the split value(s).
 */
export const parseTextToArray = ( text, split ) => {
	if ( !utils.val.isString( text ) ) {
		text = text.toString();
	}
	if ( split ) {
		if ( utils.val.isString( split ) ) {
			// Split is just one string. 
			return text.toString().split( split );
		} else if ( Array.isArray( split ) ) {
			// Split is an array. 
			// Since we're using multiple separators, we swap out all instances of each separating character for a unique string that is unlikely to appear as a temporary divider. 
			// Once all of them have been turned into the same separator, we split the string up into its final array form. 
			if ( split[ 0 ] !== undefined ) {
				let temp = text;
				split.forEach( ( separator, index ) => {
					if ( separator ) {
						temp = temp.replaceAll( separator, "******" );
					}
				} );
				return temp.split( "******" );
			}
		}
	}
	return [ text ];
};

/**
 * Handles cleanly parsing deeply nested data that was converted to/from stringified JSON. 
 * Recursively runs through each branch of the nested data
 * @param {[any]} input An array, object, or array of objects. Will parse differently depending on which is given.
 * @returns {[any]} Cleaned input
 */
export const cleanJSON = ( input ) => {
	if ( input ) {
		if ( utils.val.isObject( input ) && !utils.val.isArray( input ) ) {
			// Nested object. Need to go deeper.
			let cleanedObj = {};
			Object.keys( input ).forEach( ( key, index ) => {
				// Run through each key-value pair in the object. If we encounter a value that is an array or object, we go deeper. 
				let value = input[ key ];
				let cleanedValue;
				// Get type of value.
				if ( utils.val.isObject( value ) ) {
					// Nested object. Need to go deeper.
					cleanedValue = cleanJSON( value );
				} else if ( utils.val.isArray( value ) ) {
					// Nested array. Need to go deeper.
					if ( utils.val.isValidArray( value, true ) ) {
						// Has more than one entry.
						let testValue = value[ 0 ];
						cleanedValue = [ cleanJSON( testValue ) ];
					} else {
						// Is an array datatype, but nothing is present here. Push a [] into the cleanedObj. 
						cleanedValue = [];
					}
				} else {
					cleanedValue = cleanJSON( value );
				}
				cleanedObj[ key ] = cleanedValue;
			} );
			return cleanedObj;
		} else if ( utils.val.isArray( input ) ) {
			// Nested array. Need to go deeper.
			if ( utils.val.isValidArray( input, true ) ) {
				// Has more than one entry.
				let testValue = input[ 0 ];
				return [ cleanJSON( testValue ) ];
			} else {
				return [];
			}
		} else if ( utils.val.isNumber( input ) ) {
			return 0;
		} else if ( utils.val.isString( input ) ) {
			return "";
		} else if ( utils.val.isBool( input ) ) {
			return false;
		}
	}
	return input;
};



/**
 * Cleans out invalid, empty, undefined, and null values from an object. 
 * @param {object} obj 
 * @returns {object} Input object with invalid, empty, undefined, or null values removed. 
 */
export const sanitizeObj = ( obj ) => {
	return Object.keys( obj ).forEach( ( key ) => {
		obj[ key ] = cleanInvalid( obj[ key ], "-" );
		if ( obj[ key ] ) {
			if ( typeof obj[ key ] === "object" && !Array.isArray( obj[ key ] ) ) {
				obj[ key ] = sanitizeObj( obj[ key ] );
			} else if ( Array.isArray( obj[ key ] ) ) {
				obj[ key ] = sanitizeObjArray( obj[ key ] );
			}
		}
	} );
};

/**
 * Replaces any null, undefined, empty, or otherwise invalid values with a placeholder, to avoid errors.
 * @param {[object]} objArray 
 * @returns {object} Input object with invalid, empty, undefined, or null values removed. 
 */
export const sanitizeObjArray = ( objArray ) => {
	let sanitized = objArray.map( ( object, index ) => {
		return sanitizeObj( object );
	} );
	return sanitized;
};


/**
 * Formats strings in an array of objects given a splitting string and a joining string. 
 * @param {[object]} array Array of objects
 * @param {string} split String to split each element by
 * @param {string} join String to join each element that was split. 
 * @returns {[object]}
 */
export const formatObjArray = ( array, split = "_", join = " " ) => {
	if ( utils.val.isValidArray( array, true ) ) {
		return array.map( ( element, index ) => {
			if ( utils.val.isObject( element ) ) {
				// Element is an object.
				Object.keys( element ).forEach( ( key ) => {
					element[ key ] = element[ key ].split( split ).join( join );
				} );
				return element;
			} else if ( utils.val.isArray( element ) ) {
				// Element is an array.
				return element.map( ( val ) => {
					return val.split( split ).join( join );
				} );
			} else {
				// Element is a scalar value.
				return element.split( split ).join( join );
			}
		} );
	}
};

/**
 * Filters out falsy values from an array: undefined, null, 0, false, NaN and "" (empty string)
 * @param {[any]} array Array of values
 * @returns Cleaned array
 */
export const cleanArray = ( array ) => {
	var newArray = [];
	for ( var i = 0; i < array.length; i++ ) {
		if ( array[ i ] ) {
			newArray.push( array[ i ] );
		}
	}
	return newArray;
};

/**
 * Removes a key-value pair from an object.
 * @param {object} obj 
 * @param {string} key 
 * @returns {object} Object with the value at [key] removed.
 */
export const removeKey = ( obj, key ) => {
	let temp = { ...obj };
	if ( temp.hasOwnProperty( key ) ) {
		delete temp[ key ];
	}
	return temp;
};

/**
 * Searches an array of objects for an object matching a given { matchKey: matchValue } pair, and returns a specific key's value. 
 * @param {[object]} data Object array to search
 * @param {string} matchKey Key name to match
 * @param {string} matchValue Value to match
 * @param {string} returnKey Key to return from the correct object
 * @param {boolean} matchSubString Toggles substring comparisons
 * @param {boolean} matchCaseInsensitive Toggles case insensitive comparison
 * @returns {any} The value found in the object containing the { matchKey: matchValue } pair, at the returnKey key. 
 */
export const findOne = ( data = [], matchKey = "", matchValue = "", returnKey = "", matchSubString = false, matchCaseInsensitive = true ) => {
	// let found = data.find( ( element ) => { return element[ matchKey ] === matchValue } );
	let found = data.find( ( element ) => {
		let elementValue = element[ matchKey ];
		if ( utils.val.isString( elementValue ) && utils.val.isString( matchValue ) ) {
			if ( matchCaseInsensitive ) {
				elementValue = elementValue.toString().toLowerCase();
				matchValue = matchValue.toString().toLowerCase();
			}

			if ( matchSubString ) {
				return elementValue.includes( matchValue );
			} else {
				return elementValue === matchValue;
			}
		} else {
			return elementValue === matchValue;
		}
	} );
	//console.log("FindOne :: found = ", found);
	return has( found, returnKey ) ? found[ returnKey ] : found;
};

/**
 * Searches an array of objects for any objects matching a given { matchKey: matchValue } pair, and returns the values found at the specified key in each match. 
 * @param {[object]} data Object array to search
 * @param {string} matchKey Key name to match
 * @param {string} matchValue Value to match
 * @param {string} returnKey Key to return from the correct object
 * @returns {any} The value found in the object containing the { matchKey: matchValue } pair, at the returnKey key. 
 */
export const findAll = ( data = [], matchKey = "", matchValue = "", returnKey = "" ) => {
	let found = [];
	data.forEach( ( element ) => {
		if ( element[ matchKey ] === matchValue ) {
			if ( has( element, returnKey ) ) {
				found.push( element[ returnKey ] );
			} else {
				found.push( element );
			}
		}
		return false;
	} );

	return found;
};

// Source: https://stackoverflow.com/questions/7364150/find-object-by-id-in-an-array-of-javascript-objects
/**
 * Provided an array of objects with identical properties, returns an object containing an identifying key-value pair. 
 * Useful for fetching a specific entry in a database or table. 
 * @param {array} input Input array
 * @param {string} key The key of the identifying key-value pair
 * @param {any} value The value of the identifying key-value pair
 * @returns {object} The object containing the correct identifying key-value pair.
 */
export const objectFindByKey = ( input, key, value ) => {
	for ( var i = 0; i < input.length; i++ ) {
		if ( input[ i ][ key ] === value ) {
			return input[ i ];
		}
	}
	return { "error": "Not found" };
}

/**
 * Splices the properties of an object onto each element contained in a given array of objects. 
 * @param {[object]} input Array of objects
 * @param {object} splice An object, whose properties will be added to each object in the input object array. 
 * @returns {[object]} The spliced object array
 */
export const splice = ( input, splice ) => {
	if ( Array.isArray( input ) ) {
		return input.map( ( obj ) => {
			return Object.assign( obj, splice );
		} );
	} else {
		return input;
	}
};

/**
 * Flattens an array containing nested objects or arrays into a single level. 
 * @example let flattenedArray = nestedArray.flatten();
 * @returns {[any]} The input array flattened into a single level, if its elements contained nested objects or arrays.
 */
// Array.prototype.flatten = function () {
export const flatten = function () {
	let flatArray = [];
	for ( let index = 0; index < this.length; index++ ) {
		const element = this[ index ];
		if ( Array.isArray( element ) ) {
			flatArray = flatArray.concat( this.flatten.call( element ) );
		} else {
			flatArray.push( element );
		}
	}
	return flatArray;
};

/**
 * Flattens an object with nested objects or arrays to a single level. The path to each value from the "top" of the object, concatenated with "_", becomes each value's new key name. 
 * @param {object} obj Object to flatten to a single leve. 
 * @returns {[any]} The flattened object
 */
export const flattenObj = ( obj ) => {
	// The object which contains the final result
	let result = {};

	Object.keys( obj ).forEach( ( key ) => {
		// Sanitize the value if it's null or undefined.
		if ( obj[ key ] === null || obj[ key ] === undefined || obj[ key ] === "" ) {
			obj[ key ] = "-";
		}
		if ( typeof obj[ key ] === "object" && !Array.isArray( obj[ key ] ) ) {
			const temp = flattenObj( obj[ key ] );
			for ( const j in temp ) {
				// Store temp in result
				result[ key + "_" + j ] = temp[ j ];
			}
		}

		// Else store obj[key] in result directly
		else {
			result[ key ] = obj[ key ];
		}
	} );
	return result;
};

/**
 * Flattens an array of objects that may contain deep nesting, to an array of objects each with a single level. 
 * For each object in the array, the path to each value from the "top" of the object, concatenated with "_", becomes each value's new key name. 
 * @param {[object]} input Array of objects to flatten to a single level. 
 * @returns {[object]} The flattened array of objects.
 */
export const flattenObjArray = ( input ) => {
	return input.map( ( element, index ) => {
		if ( typeof element === "object" && !Array.isArray( element ) ) {
			return flattenObj( element );
		} else if ( utils.val.isValidArray( element, true ) ) {
			return [ ...flattenObjArray( element ) ];
		} else {
			return element;
		}
	} );
};

/**
 * Flattens an object with nested objects or arrays to a single level as text. 
 * Useful for displaying as HTML elements. 
 * @param {object} obj Object to flatten to a single level.
 * @returns {string} The flattened object
 */
export const flatMapObjText = ( obj ) => {
	return Object.entries( obj )
		.map( ( objProperty ) => {
			if ( typeof objProperty[ 1 ] === "object" && objProperty[ 1 ] !== null ) {
				return `${ flatMapObjText( objProperty[ 1 ] ) }`;
			} else {
				return `${ objProperty[ 0 ] }: ${ objProperty[ 1 ] }`;
			}
		} )
		.join( "" );
};


/**
 * Determines if an object contains all keys given in an array. 
 * @param {object} input Input object to validate
 * @param {[string]} keys Keys that each object must contain to be returned. 
 * @returns {boolean} True if input object contains all of the provided keys. 
 */
export const validateObject = ( input, keys = [] ) => {
	if ( input ) {
		keys.forEach( ( key, index ) => {
			if ( !has( input, key ) ) {
				// Does not have at least required prop, return false.
				return false;
			}
		} );

		// If we made it here, return true, we have all required props.
		return true;
	}
	return false;
};

/**
 * Filters out any objects in an object array that do not contain all of the provided keys. 
 * @param {[object]} input Input object array to validate
 * @param {[string]} keys Keys that each object must contain to be returned. 
 * @returns {[object]} Object array with any invalid entries removed. 
 */
export const validateObjectArray = ( input, keys = [] ) => {
	let output = [];
	// if ( typeof input === "object" && !Array.isArray( input ) ) {
	if ( utils.val.isObject( input ) ) {
		// Is an object.
		input = [ input ];
	}
	if ( utils.val.isValidArray( input, true ) ) {
		// Is an array
		output = input.filter( ( element, index ) => validateObject( element, keys ) );
	}
	return output;
};

/**
 * Filters out any objects in an object array that do not contain all of the provided keys. 
 * @param {[object]} input Input object array to validate
 * @param {[string]} keys Keys that each object must contain to be returned. 
 * @returns {[object]} Object array with any invalid entries removed. 
 */
export const hasKeys = ( input, props = [] ) => {
	if ( input ) {
		if ( has( input, "props" ) ) {
			let props = input.props;
			props.forEach( ( prop, index ) => {
				if ( !props.includes( prop ) ) {
					return false;
				}
			} );
		}
		return true;
	}
	return false;
};


// * Data extraction from objects or arrays * //

/**
 * Extracts a value from each object in an array of objects. 
 * @param {[object]} objs Array of objects
 * @param {string} key Key-name to extract
 * @returns {[string]} An array containing the values found at the given key in each object in the object array. 
 */
export const extractKey = ( objs, key ) => objs.map( ( obj ) => obj[ key ] );

/**
 * Extracts a value from each object in an array of objects, returning as an array of values. 
 * @param {[object]} objs Array of objects
 * @param {string} key Key-name to extract
 * @returns {[string]} An array containing the values found at the given key in each object in the object array. 
 */
export const extractKeyArray = ( data, key = "" ) => {
	let list = [];
	if ( utils.val.isValidArray( data, true ) ) {
		data.forEach( ( item, index ) => {
			if ( utils.val.isObject( item ) ) {
				let val = deepGetKey( item, key );
				if ( val && val !== "" ) {
					list.push( val );
				}
			}
		} );
	}
	return list;
};


/**
 * Fetches specific keys from an object array. 
 * Returns an array of objects that contain only the provided keys. 
 * @param {[object]} objs Array of objects
 * @param {string} keys Keys to extract
 * @returns {[object]} An array of objects containing the provided keys from each of the input objects. 
 */
export const extractKeys = ( data, keys = [] ) => {
	let list = [];
	if ( utils.val.isValidArray( data, true ) ) {
		// Run for each element in the array.
		data.forEach( ( item, index ) => {
			if ( utils.val.isObject( item ) ) {
				// Run for each key given.
				let res = {};
				let skip = false;
				keys.forEach( ( key, i ) => {
					let val = deepGetKey( item, key );
					if ( val && val !== "" && val !== "''" ) {
						res[ key ] = val;
					} else {
						skip = true;
					}
				} );
				if ( !skip ) {
					list.push( res );
				}
				// Reset skip temp value.
				skip = false;
			}
		} );
	}
	return list;
};

/**
 * Fetches all keys of a given object and returns them in a format usable for selector HTML elements. 
 * @param {object} input An object
 * @returns {[object]} An array of objects containing the keys found in the input object, with the following format: 
 * 	{
 * 		id: 
 * 		key: 
 * 		value: 
 * 		label: 
 * 	}
 */
export const getObjKeys = ( input ) => {
	try {
		return Object.keys( input ).map( ( key, index ) => {
			return {
				id: index,
				key: key,
				value: key,
				label: key.replace( "_", " " ).charAt( 0 ).toUpperCase() + key.replace( "_", " " ).slice( 1 ),
			};
		} );
	} catch ( error ) {
		return [
			{
				no_data: "No data",
			},
		];
	}
};

/**
 * Fetches all values of a given object and returns them as an array. The object's keys are discarded. 
 * @param {object} input An object
 * @returns {[string]} An array of the values found in the input object.
 */
export const objValsToArray = ( input ) => {
	try {
		return Object.keys( input ).map( ( key, index ) => {
			return input[ key ];
		} );
	} catch ( error ) {
		return [
			{
				no_data: "No data",
			},
		];
	}
};

/**
 * Converts an array of generic values into an array of objects with each array item set to the provided key-name. 
 * @param {[any]} input An array, can contain data of any type. 
 * @param {string} key 
 * @returns An array of objects in the format: [ { key: element[n] } ]
 */
export const arrayToObjArray = ( input = [], key = "" ) => {
	if ( utils.val.isValidArray( input, true ) ) {
		return input.map( ( element, index ) => {
			return { [ key ]: element.toString() };
		} );
	} else {
		return input;
	}
};

/**
 * Sorts an array of objects by the value found at a given key. 
 * @param {[object]} data 
 * @param {string} key 
 * @param {string} order Sorting order; "asc" for ascending, anything else for descending. 
 * @returns {[object]} The sorted array of objects.  
 */
export const keySortData = ( data, key, order = "asc" ) => {
	if ( key ) {
		const sortedData = [ ...data ].sort( ( a, b ) => {
			if ( a[ key ] === null ) return 1;
			if ( b[ key ] === null ) return -1;
			if ( a[ key ] === null && b[ key ] === null ) return 0;
			// if ( !a.hasOwnProperty.call( key ) && !b.hasOwnProperty.call( key ) ) return 0;
			if ( !a.hasOwnProperty( key ) && !b.hasOwnProperty( key ) ) return 0;
			return (
				a[ key ]
					.toString()
					.localeCompare(
						b[ key ].toString(),
						"en",
						{
							numeric: true,
						}
					) * ( order === "asc" ? 1 : -1 )
			);
		} );
		return sortedData;
	}
};


/**
 * Filters keys out of a given object.
 * @param {object} input 
 * @param {[string]} keys Array of keys
 * @returns {object} Object with the provided keys filtered out.
 */
export const filterKeys = ( input, keys = [] ) => {
	let output = {};
	if ( utils.val.isObject( input ) ) {
		Object.keys( input ).forEach( ( key, index ) => {
			if ( !keys.includes( key ) ) {
				output[ key ] = input[ key ];
			}
		} );
		return output;
	}
	return input;
};


/**
 * Filters an array of objects by the criteria defined in the filters array. 
 * The input array of objects is filtered by comparing each given filter key-value pair to each input object's value at that same key. 
 * Uses a recursive, thorough algorithm and may be slow for large data sets, but is more precise. 
 * @param {[object]} data An array of objects
 * @param {[object]} filters An array of objects defining the filtering terms, consisting only of single key value pairs. Each filter object must be in the format: { key: key, value: filterString }
 * @returns {[object]} The filtered array of objects
 */
export const filterData = ( data, filters ) => {
	// Data is an array of objects.
	// Filters is an array of objects consisting only of single key value pairs.
	if ( filters.length > 0 ) {
		let filteredData = data;
		// Filters in the format {key: key, value: filterString}.
		filters.forEach( ( element ) => {
			if ( element.key && element.value ) {
				// Run for each filter.
				let filterKey = element.key;
				let filterValue = element.value.toLowerCase();
				filteredData = filteredData.filter( ( obj, index ) => {
					// Filter for each object in the array.
					if ( obj ) {
						// Object is valid. Check if it contains the key of the filter we're currently filtering for.
						if ( obj.hasOwnProperty( filterKey ) ) {
							// Object contains the key we're filtering for.
							if ( obj[ filterKey ] ) {
								// Object has a valid value.
								if ( typeof obj[ filterKey ] === "object" ) {
									// The value contained in this key is a nested object. Rather than run through each key value pair recursively, just convert to a string and see if it has the substring we're looking for.
									return Object.values( obj[ filterKey ] ).toString().toLowerCase().includes( filterValue );
								} else if ( Array.isArray( obj[ filterKey ] ) ) {
									// The value contained in this key is an array. Have to see if any of its elements contains the value we're looking for.
									return obj[ filterKey ].some( ( item ) => {
										return item.toLowerCase().includes( filterValue );
									} );
								} else {
									// The value contained in this key is anything else; a scalar;
									return obj[ filterKey ].toString().toLowerCase().includes( filterValue );
								}
							} else {
								// Object does not have a valid value.
								// This could be something like undefined, null, '', or some other invalid value.
								return true;
							}
						} else {
							// Object does not contain the key we're filtering for.
							return true;
						}
					} else {
						// Object is invalid.
						return true;
					}
				} );
			}
		} );
		return filteredData;
	} else {
		// Return data as-is.
		return data;
	}
};


/**
 * Filters an array of objects by the criteria defined in the filters array. 
 * The input array of objects is filtered by comparing each given filter key-value pair to each input object's value at that same key. 
 * Achieves filtering with a much faster but less precise method by stringifying the data and seeing if it includes each given filter term. 
 * @param {[object]} data An array of objects
 * @param {[object]} filters An array of objects defining the filtering terms, consisting only of single key value pairs. Each filter object must be in the format: { key: key, value: filterString }
 * @returns {[object]} The filtered array of objects
 */
export const filterDataFast = ( data, filters ) => {
	// Data is an array of objects.
	// Filters is an array of objects consisting only of single key value pairs.
	if ( filters.length > 0 ) {
		let filteredData = data;
		// Filters in the format {key: key, value: filterString}.
		filters.forEach( ( element ) => {
			if ( element.key && element.value ) {
				// Run for each filter.
				let filterKey = element.key;
				let filterValue = element.value.toLowerCase();
				filteredData = filteredData.filter( ( obj, index ) => {
					// Filter for each object in the array.
					if ( obj ) {
						// Object is valid. Check if it contains the key of the filter we're currently filtering for.
						// To do this quick, just turn the whole object into a string and see if it contains the filter value as a substring.
						// Lol.
						if ( obj.hasOwnProperty( filterKey ) ) {
							return JSON.stringify( obj[ filterKey ] ).toLowerCase().includes( filterValue );
						} else {
							return false;
						}
					} else {
						// Object is invalid.
						return true;
					}
				} );
			}
		} );
		return filteredData;
	} else {
		// Return data as-is.
		return data;
	}
};

/**
 * Deep-Searches through an object and checks if it has the desired key(s).
 * Input may be an input array, object, or object array.
 * @param {[object]} input Array, object, or object array that may have arrays, objects, or object arrays nested within it. 
 * @param {string} key The key we're looking for
 * @returns {boolean} True if input contains the provided key, false if not.
 */
export const has = ( input, key = "" ) => {
	if ( input ) {
		if ( utils.val.isObject( input ) ) {
			// Input is an object.
			if ( key === "" ) {
				// If key is left blank, just return obj-is-valid check results.
				return true;
			}
			return input.hasOwnProperty( key );
		} else if ( utils.val.isArray( input ) ) {
			// Input is an array.
			if ( input.length > 0 ) {
				// Arr has at least one element.
				if ( input[ 0 ] !== undefined ) {
					// return input.indexOf(key) >= 0;
					return input.includes( key );
				}
			}
		} else {
			// Input is anything else.
			return valContains( input, key );
		}
	}
	return false;
};

/**
 * Deep-searches an input array, object, or object array for the existance of all the keys provided in the keys array. 
 * Is an all-or-nothing function; input must contain every key for it to return true. 
 * @param {[object]} input Array, object, or object array that may have arrays, objects, or object arrays nested within it. 
 * @param {[string]} keys An array of keys
 * @returns {boolean} True if input contains the provided key, false if not.
 */
export const hasAll = ( input, keys ) => {
	// Version of has() for searching for multiple keys in one object.
	if ( utils.val.isValidArray( keys, true ) ) {
		// keys is a valid array of keys.
		return keys.every( ( str ) => ( utils.val.isString( str ) ? hasAll( input, str ) : false ) );
	} else {
		if ( utils.val.isValidArray( input ) ) {
			return input.every( ( obj ) => ( utils.val.isObject( obj ) ? hasAll( obj, keys ) : false ) );
		} else if ( utils.val.isObject( input ) ) {
			return input ? hasOwnProperty.call( input, keys ) : false;
		}
	}
	return false;
};

/**
 * Determines if an input string contains a given string within it. 
 * @param {string} input 
 * @param {string} filter 
 * @param {boolean} caseSensitive Toggle for case sensitivity
 * @returns {boolean} Whether the input string contains the search string. 
 */
export const valContains = ( input, search, caseSensitive = false ) => {
	// let inputstr = utils.val.isJSON( input ) ? JSON.stringify( input ) : input.toString();
	// let searchstr = utils.val.isJSON( search ) ? JSON.stringify( search ) : search.toString();
	let inputstr = JSON.stringify( input );
	let searchstr = JSON.stringify( search );
	if ( caseSensitive ) {
		return inputstr.includes( searchstr );
	}
	else {
		return inputstr.toLowerCase().includes( searchstr.toLowerCase() );
	}
};

/**
 * Determines if an input object contains a given value. 
 * Utilizes a deep-search algorithm. 
 * If the value is nested in an object, array, or object array inside one of the object elements, it will search through each branch of that as well. 
 * If the input value is not an object, it will pass the processing off to the appropriate function for searching to avoid errors. 
 * @param {object} input 
 * @param {string} search 
 * @returns {boolean} Whether input contains the search value, in any form.
 */
export const objContains = ( input, search ) => {
	if ( typeof input === "object" ) {
		// Input is an object
		Object.keys( input ).forEach( ( key ) => {
			if ( input[ key ] ) {
				let val = input[ key ];
				if ( val.toLowerCase().includes( search ) ) {
					return true;
				}
			}
		} );
		return false;
	} else if ( Array.isArray( input ) ) {
		// Input is an array.
		return arrayContains( input, search );
	} else {
		// Input is anything else.
		return input.toString().toLowerCase().includes( search );
	}
};

/**
 * Determines if an input array contains a given value. 
 * Utilizes a deep-search algorithm. 
 * If the value is nested in an object, array, or object array inside one of the array elements, it will search through each branch of that as well. 
 * If the input value is not an array, it will pass the processing off to the appropriate function for searching to avoid errors. 
 * @param {array} input 
 * @param {string} search 
 * @returns {boolean} Whether input contains the search value, in any form.
 */
export const arrayContains = ( input, search ) => {
	if ( typeof input === "object" ) {
		// Input is an object
		return objContains( input, search );
	} else if ( Array.isArray( input ) ) {
		// Input is an array.
		input.forEach( ( value, index ) => {
			if ( typeof value === "object" ) {
				// Input is an object
				return objContains( value, search );
			} else if ( Array.isArray( value ) ) {
				// Input is an array.
				return arrayContains( value, search );
			} else {
				// Input is anything else.
				return value.toString().toLowerCase().includes( search );
			}
		} );
	} else {
		// Input is anything else.
		return input.toString().toLowerCase().includes( search );
	}
};

/**
 * Deep searches an object for the value found at a given key. 
 * If the value is nested within an object, and array, or an object array, it will recursively deep-search each branch. 
 * @param {object} object 
 * @param {string} key 
 * @returns {any} The value found at the provided keyname, if it exists.
 */
export function deepGetKey ( object, key ) {
	return deepSearch( object, key, ( k, v ) => k === key, false );
}

/**
 * Deep searches an object for the value found at a given key. 
 * If the value is nested within an object, and array, or an object array, it will recursively deep-search each branch. 
 * @param {object} object Input object
 * @param {string} key Key to search for
 * @param {function} predicate Defined filtering function, that must take the form of: ( k, v ) => { *filtering logic* }
 * @param {boolean} getParent (OPTIONAL) If true, returns the parent item of the key rather than the contents of the key, if found. Default is false. 
 * @returns {any} The value found at the provided keyname
 */
export function deepSearch ( object, key, predicate, getParent = false ) {
	if ( !object ) return;
	if ( object.hasOwnProperty( key ) && predicate( key, object[ key ] ) === true ) {
		// Return the object or the parent of the object containing the key we're looking for.
		return getParent ? object : object[ key ];
	}
	for ( let i = 0; i < Object.keys( object ).length; i++ ) {
		let value = object[ Object.keys( object )[ i ] ];
		if ( typeof value === "object" && value != null ) {
			// Recursively search deeper. 
			let o = deepSearch(
				object[ Object.keys( object )[ i ] ],
				key,
				predicate,
				getParent
			);
			if ( o != null ) {
				return o;
			}
		}
	}
	return null;
}

// Here is the demo: http://jsfiddle.net/a21dx6c0/
// In the same way you can find more than one object
export function deepSearchItems ( object, key, predicate ) {
	let ret = [];
	if ( object.hasOwnProperty( key ) && predicate( key, object[ key ] ) === true ) {
		ret = [ ...ret, object ];
	}
	if ( Object.keys( object ).length ) {
		for ( let i = 0; i < Object.keys( object ).length; i++ ) {
			let value = object[ Object.keys( object )[ i ] ];
			if ( typeof value === "object" && value != null ) {
				let o = this.deepSearchItems( object[ Object.keys( object )[ i ] ], key, predicate );
				if ( o != null && o instanceof Array ) {
					ret = [ ...ret, ...o ];
				}
			}
		}
	}
	return ret;
}

/**
 * Deep-searches an object for a specific key. If found, sets it to a given value, and returns the updated object. 
 * This skips searching arrays nested within the object's values. 
 * TODO :: Add array-nested-object handling. 
 * @param {object} input 
 * @param {string} key Key to find in the input
 * @param {any} value Value to set if the key is found
 * @returns {object} Updated input with the value at {key} set to {value}
 */
export const deepFindSet = ( input = {}, key = "", value = "" ) => {
	const result = [];
	let inputobj = { ...input };
	const recursiveSearch = ( obj = {}, key, value ) => {
		if ( !obj || typeof obj !== "object" ) {
			return obj;
		}
		if ( obj.hasOwnProperty( key ) ) {
			// Object has the key we're looking for.
			// Object.defineProperty(obj, key, {
			//     value: value,
			//     writable: true,
			//     configurable: true,
			// });
			var newObj = { ...obj, [ key ]: value };
			return newObj;
		}
		Object.keys( obj ).forEach( ( k ) => {
			return recursiveSearch( obj[ k ], key, value );
		} );
	};
	return recursiveSearch( inputobj, key, value );
	// return result;
};


/**
 * Clones an object, useful for instances where an object's properties cannot be modified, such as constants. 
 * @param {object} obj Object to clone
 * @returns {object} The cloned object
 */
// Source: https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript?page=3&tab=scoredesc#tab-top
export const cloneObj = ( obj ) => {
	if ( Object( obj ) !== obj ) return obj;
	else if ( Array.isArray( obj ) ) return obj.map( cloneObj );

	return Object.fromEntries( Object.entries( obj ).map( ( [ k, v ] ) => [ k, cloneObj( v ) ] ) );
};

/**
 * Clones an object that contains deep-nested data structures. 
 * @param {object} input 
 * @returns Cloned object
 */
export function deepCopy ( input ) {
	// Alternative method: 
	//	return Object.keys( input ).reduce(
	//		( v, d ) =>
	//			Object.assign( v, {
	//				[ d ]: input[ d ].constructor === Object ? deepCopy( input[ d ] ) : input[ d ],
	//			} ),
	//		{},
	//	);

	let target = Array.isArray( input ) ? [] : {};
	for ( let prop in input ) {
		let value = input[ prop ];
		if ( value && typeof value === "object" ) {
			target[ prop ] = deepCopy( value );
		} else {
			target[ prop ] = value;
		}
	}
	return target;
}

/**
 * Uses the JSON parse-stringify method to clone an object. 
 * @param {object} input 
 * @returns {object} Copied object
 */
export const deepCopyJSON = ( input ) => JSON.parse( JSON.stringify( input ) );

// Deep nested recursive search of object array and setting a specific value.
export const findAndSetObject = ( obj = {}, key = "", value = "" ) => {
	const recursiveSearch = ( obj = {}, key, value ) => {
		if ( !obj || typeof obj !== "object" ) {
			return;
		}
		if ( obj.hasOwnProperty( key ) ) {
			// Object has the key we're looking for.
			obj[ key ] = value;
			return;
		}
		Object.keys( obj ).forEach( ( k ) => {
			return recursiveSearch( obj[ k ], key, value );
		} );
	};
	recursiveSearch( obj, key, value );
	return obj;
};

/**
 * Sorts an object alphabetically by key.
 * @param {object} obj 
 * @returns {object}
 */
export function sortObject ( obj ) {
	return Object.keys( obj )
		.sort()
		.reduce( function ( result, key ) {
			result[ key ] = obj[ key ];
			return result;
		}, {} );
}

/**
 * Sorts an array of objects based on a specific key found in each object. 
 * @param {[object]} input 
 * @param {string} key 
 * @returns {[object]}
 */
export const sortObjArray = ( input, key ) => {
	return input.sort( ( a, b ) => {
		return a[ key ] - b[ key ];
	} );
};
