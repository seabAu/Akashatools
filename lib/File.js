
/**
 * Imports a file at a given path. 
 * @param {string} filepath 
 * @returns {object} File data if successful, error data if an error occurred. 
 */
export function importFile ( filepath ) {
    if ( filepath ) {
        let data;
        fetch( `${ filepath }` )
            .catch( ( error ) => {
                return;
            } )
            .then( ( response ) => {
                if ( response ) {
                    if ( !response.ok ) {
                        throw new Error( "Http error: " + response.status );
                    } else {
                        return response.json();
                    }
                }
            } )
            .catch( ( error ) => {
                return error;
            } )
            .then( ( result ) => {
                data = result;
            } );
        if ( data ) {
            return data;
        }
    }
}

/**
 * Determines if a URL is of an image file. 
 * @param {string} url URL to test.
 * @returns {boolean} 
 */
// Source: https://gist.github.com/ZeeshanMukhtar1/d313da2c0aaa997c4125fcb2e2ca9c77
export const checkImageURL = ( url ) => {
    if ( !url ) return false;
    else {
        const pattern = new RegExp( '^https?:\\/\\/.+\\.(png|jpg|jpeg|bmp|gif|webp)$', 'i' );
        return pattern.test( url );
    }
};