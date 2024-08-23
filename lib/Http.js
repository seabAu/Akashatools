import * as utils from ".";

/**
 * Wraps a basic fetch-response function in a promise and returns it. 
 * @param {string} call Endpoint to call
 * @returns {promise} 
 */
export async function handleBasicFetch ( call ) {
    const fetchOptions = {
        method: "GET",
        redirect: "manual",
        crossorigin: true,
        // mode: "no-cors",
    };
    return new Promise( ( resolve, reject ) => {
        fetch( call, fetchOptions )
            .then( ( response ) => response.json() )
            .then( ( data ) => resolve( data ) )
            .catch( ( error ) => reject( error ) );
    } );
}

/**
 * 
 * @param {string} url 
 * @param {[string]} parameters 
 * @param {function} callback 
 * @param {string} method Options: [ "GET", "POST", "PUT", "DELETE" ]
 * @param {object} headers (OPTIONAL) Any additional headers to include in the call. Default is { "Content-Type": "application/json" }.
 */
export function fetchData ( url, parameters, callback, method = "GET", headers = { "Content-Type": "application/json" } ) {
    // Check to make sure the given method is valid. 
    if ( ![ "GET", "POST", "PUT", "DELETE" ].includes( method ) ) {
        console.error( "ERROR: Invalid method given: ", method );
        return; 
    }

    fetch( url, {
        method: method,
        headers: headers,
        body: JSON.stringify( parameters ),
    } )
        .then( async ( response ) => {
            // status 404 or 500 will set ok to false
            if ( response.ok ) {
                // Success: convert data received & run callback
                let result = await response.json();
                callback( result );
            } else {
                throw new Error( response.status + " Failed Fetch " );
            }
        } )
        .catch( ( e ) => console.error( "EXCEPTION: ", e ) );
}


/**
 * Constructor for custom error objects when fetching data.
 * @param {string} src 
 * @param {string} call 
 * @param {[string]} vars 
 * @param {promise} response 
 * @returns {object}
 */
export const constructFetchError = ( src, call, vars, response ) => {
    let errData = {
        source: src ?? "",
        vars: vars ?? [],
        call: call ?? "",
        time: new Date(),
        errorMessage: function () {
            if ( response ) {
                if ( typeof response === "object" ) {
                    if ( "status" in response ) {
                        if ( response.status === 502 ) {
                            return `There was an error: Network response 502.`;
                        } else if ( response.status === 429 ) {
                            return `There was an error: 429 Too Many Requests.`;
                        } else if ( response.status === 404 ) {
                            return `There was an error: 404 Source Not Found.`;
                        } else {
                            return `There was an error: Network response was not OK.`;
                        }
                    }
                } else {
                    return response;
                }
            } else {
                return "No Response";
            }
            return "";
        },
        response: response, // JSON.stringify(response),
        responseClass: function () {
            if ( response ) {
                if ( typeof response === "object" ) {
                    if ( "status" in response ) {
                        if ( response.status >= 100 && response.status < 200 ) {
                            return "100: Informational response";
                        } else if (
                            response.status >= 200 &&
                            response.status < 300
                        ) {
                            return "200: Successful response";
                        } else if (
                            response.status >= 300 &&
                            response.status < 400
                        ) {
                            return "300: Redirection message";
                        } else if (
                            response.status >= 400 &&
                            response.status < 500
                        ) {
                            return "400: Client error response";
                        } else if (
                            response.status >= 500 &&
                            response.status < 600
                        ) {
                            return "500: Server error response";
                        }
                    }
                }
                return response;
            }
            return "No Response";
        },
        status: response
            ? "status" in response
                ? response.status
                    ? response.status
                    : "-"
                : "No status in response"
            : "No Response",
        ok: response
            ? "ok" in response
                ? response.ok
                    ? response.ok
                    : "-"
                : "No ok in response"
            : "No Response",
    };

    return errData;
};

/**
 * Handles received responses from a fetch call. 
 * @param {string} src 
 * @param {string} call 
 * @param {[string]} vars 
 * @param {promise} response 
 * @returns {object} 
 */
export const handleFetchResponse = ( src, call, vars, response ) => {
    // console.log( "Handlefetchresponse :: ", src, call, vars, response );
    if ( response ) {
        if ( typeof response === "object" ) {
            if ( "ok" in response ) {
                if ( response.ok === true ) {
                    let data = response.json();
                    return data;
                } else {
                    let errData = constructFetchError(
                        src,
                        call,
                        vars,
                        response,
                    );
                    throw new Error( JSON.stringify( errData ) );
                }
            } else {
                // No "ok" in response. It is an object, but for some reason does not contain the right keys.
                throw new Error(
                    JSON.stringify(
                        constructFetchError( src, call, vars, response ),
                    ),
                );
            }
        } else {
            // Response was not an object.
            throw new Error(
                JSON.stringify( constructFetchError( src, call, vars, response ) ),
            );
        }
    } else {
        // Response was undefined.
        throw new Error(
            JSON.stringify(
                constructFetchError( src, call, vars, {
                    body: "",
                    bodyUsed: false,
                    headers: {},
                    ok: false,
                    redirected: false,
                    status: 429,
                    statusText: "TypeError: Failed to fetch",
                    type: "cors",
                    url: call,
                } ),
            ),
        );
    }
};

/**
 * Error parsing for our custom error handler. Ensures it's valid and readable. 
 * @param {object} error 
 * @returns {object}
 */
// Generic function to handle the errors that can be caught by the post-fetch promise catch block.
export const parseError = ( error ) => {
    if ( utils.val.isJSON( error ) ) {
        // The error itself is a custom error object.
        return JSON.parse( error );
    } else if ( error.toString().toLowerCase().includes( "error: " ) ) {
        // Most of the time we get this: Our custom error object, combined with the word "Error: " in front. Split it off and return the object part.
        let err = error.toString().substring( "Error: ".length );
        if ( utils.val.isJSON( err ) ) {
            return JSON.parse( err );
        } else {
            return error;
        }
    } else {
        return error;
    }
};

// Generic function to handle fetch requests, wrapping it in a promise, and handling errors from both the fetch and the promise.
// If an error is encountered, this will return a detailed summary of the error as an object.
/**
 * 
 * @param {string} call Endpoint to call
 * @param {string} src (OPTIONAL) Name of calling function, for error tracking.
 * @param {[string]} vars (OPTIONAL) 
 * @param {object} options (OPTIONAL) 
 * @param {number} API_DELAY (OPTIONAL) Delay to wait between calls to prevent rate limiting. Default is 100. 
 * @returns {promise}
 */
export async function handleFetch ( call, src = "", vars = [], options = {}, API_DELAY = 100 ) {
    if ( !utils.val.validate( vars ) ) {
        return "ERR: INVALID/UNDEFINED INPUT";
    }
    // Destructure options, assigning default values if none are provided. 
    const { timeout = 8000, abortSignal = false } = options;
    const controller = new AbortController();
    const id = setTimeout( () => controller.abort(), timeout );

    return new Promise( ( resolve, reject ) => {
        setTimeout( () => {
            let res;
            try {
                res = fetch( call, {
                    ...options,
                    method: "GET",
                    redirect: "manual",
                    crossorigin: true,
                    // mode: "no-cors",
                    signal: abortSignal || controller.signal,
                } )
                    .catch( ( error ) => {
                        // This block will primarily catch undefined or invalid responses if the request failed to fetch.
                        // This is some hacky nonsense but nothing else was catching 429 errors.
                        return handleFetchResponse( src, call, vars, undefined );
                    } )
                    // .then((response) => handleErrors(src, call, response))
                    .then( ( response ) => {
                        return handleFetchResponse( src, call, vars, response );
                    } )
                    .catch( ( error ) => {
                        // Catch the error thrown by handleFetchResponse.
                        return reject(
                            error,
                        );
                    } )
                    .then( ( data ) => {
                        // If no error is thrown by handleFetchResponse, it returns response.json(). Resolve the result of that.
                        return resolve( data );
                    } );
            } catch ( error ) {
                return parseError( error, "try-catch-fetchCatch" );
            }
            clearTimeout( id );
        }, API_DELAY );
    } ).catch( ( error ) => {
        // This is the catch block for the promise as a whole. Only executed if the promise is rejected.
        return parseError( error, "promiseCatch" );
    } );
}
