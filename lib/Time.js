const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const months = {
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December",
};

/**
 * Formats a date object into a string in the format: {Dayname}, DD MM YYYY
 * @param {Date} newDate 
 * @returns {string}
 */
export function convertDate ( newDate ) {
    const days = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
    const d = newDate;
    const year = d.getFullYear();
    const date = d.getDate();
    const monthName = months[ d.getMonth() ];
    const dayName = days[ d.getDay() ]; // Thu
    const formatted = `${ dayName }, ${ date } ${ monthName } ${ year }`;
    return formatted.toString();
}

/**
 * Expresses a number of seconds in DD:HH:MM:SS format. 
 * @param {number} t Time expressed in seconds.
 * @returns {string} Time expressed in DD:HH:MM:SS format. 
 */
export function sec2str ( t ) {
    var d = Math.floor( t / 86400 ),
        h = ( "0" + ( Math.floor( t / 3600 ) % 24 ) ).slice( -2 ),
        m = ( "0" + ( Math.floor( t / 60 ) % 60 ) ).slice( -2 ),
        s = ( "0" + ( t % 60 ) ).slice( -2 );
    return (
        ( d > 0 ? d + "d " : "" ) +
        ( h > 0 ? h + ":" : "" ) +
        ( m > 0 ? m + ":" : "" ) +
        ( t > 60 ? s : s + "s" )
    );
}

/**
 * Gives the time elapsed in seconds
 * @param {number} start Unix time in seconds at start
 * @param {number} finish Unix time in seconds at finish
 * @returns {number} Time to completion in seconds. 
 */
export function elapsed ( start, finish ) {
    return ( finish - start ) / 1000;
}

/**
 * Gives the time elapsed in the format: DD:HH:MM:SS
 * @param {number} start Unix time in seconds at start
 * @param {number} finish Unix time in seconds at finish
 * @returns {string} Time to completion in seconds. 
 */
export function timeElapsed ( start, finish ) {
    return sec2str( elapsed( start, finishg ) );
}

/**
 * Gives an estimated time to completion of some progressing process based on how long it has taken to complete (num) items out of (total), expressed in seconds.
 * @param {number} start Unix time in seconds at start
 * @param {number} finish Unix time in seconds at finish
 * @param {number} num Current count of some quantity or process
 * @param {number} total Total count of some quantity or process
 * @returns {number} Estimated time in seconds until completion
 */
export function estimate ( start, finish, num, total ) {
    // It took (seconds) time to reach (total).
    const seconds = ( finish - start ) / 1000;
    const secondsPerCompleted = seconds / num;
    const secondsToComplete = secondsPerCompleted * total;
    // Divide by( num ) and multiply by( total ).
    return sec2str( secondsToComplete );
}

/**
 * Gives an estimated time to completion of some progressing process based on how long it has taken to complete (num) items out of (total), expressed in DD:HH:MM:SS format. 
 * @param {number} start Unix time in seconds at start
 * @param {number} finish Unix time in seconds at finish
 * @param {number} num Current count of some quantity or process
 * @param {number} total Total count of some quantity or process
 * @returns {number} Estimated time in seconds until completion
 */
export function timeEstimate ( start, finish, num, total ) {
    sec2str( estimate( start, finish, num, total ) );
}

/**
 * Converts a time as a string to a date object. 
 * @param {string} datestr 
 * @returns {Date}
 */
export const dateStr2LocaleDateStr = ( datestr ) => {
    if ( datestr.toLowerCase() === "present" ) {
        // Replace "present" with current date.
        datestr = [
            monthNames[ new Date().getMonth() ],
            new Date().getFullYear()
        ].join( " " );
    }
    let date = datestr.split( " " );
    let month = monthNames.indexOf( date[ 0 ] );
    let year = date[ 1 ];

    return new Date( year, month ).toLocaleDateString();
};

/**
 * Generated a list of date options between a starting year and month and the present. 
 * @param {number} startYear Year to start the options list at. Default is 2017.
 * @param {number} startMonth Month to start the options list at. Default is 1. 
 * @returns {[object]} Array of objects each for a given month and year, formatted for use in selector HTML elements. 
 */
export const generateDateOptions = ( startYear = 2017, startMonth = 1 ) => {
    const start = new Date( startYear, startMonth );
    const now = new Date();

    var numMonths =
        now.getMonth() -
        start.getMonth() +
        ( now.getYear() - start.getYear() ) * 12;
    const dates = [];
    for ( let y = 0; numMonths >= 0; y++ ) {
        let year = startYear + y;
        // For each year between now and the start date, ascending.
        for (
            let m = year === startYear ? startMonth : 1;
            m <= 12 && numMonths >= 0;
            m++
        ) {
            // For each month in the year.
            let month = monthNames[ m - 1 ];
            dates.unshift( {
                key: `${ year }-${ m }`,
                value: `${ month } ${ year }`,
            } );
            numMonths--;
        }
    }

    return dates;
};

/**
 * Converts a timestamp to YYYYMMDDDD format. 
 * @param {Date} timestamp 
 * @returns {string} Timestamp expressed in YYYYMMDDDD format. 
 */
export const convertTimestampToYYYYMMDDDD = ( timestamp ) => {
    if ( timestamp ) {
        let date = new Date( timestamp );
        return date.getFullYear() + "-" + parseInt( date.getMonth() + 1 ) + "-" + date.getDate()
    }
}

/**
 * Converts a time in YYYYMMDDDD format to timestamp format.
 * @param {string} date 
 * @returns {Date} Timestamp expressed in YYYYMMDDDD format. 
 */
export const convertYYYYMMDDDDtoTimestamp = ( date ) => {
    if ( date ) {
        return new Date( date.split( "-" ) ).getTime();
    }
};

/**
 * Formats date to locale string. 
 * @param {date} date 
 * @param {string} locale (OPTIONAL) Locale string. Default is "en-US",
 * @param {object} options (OPTIONAL) Formatting options. Default is: { year: "numeric", month: "long", day: "numeric" }
 * @returns {string} Date expressed as a locale string. 
 */
export const formatDate = ( date, locale = "en-US", options = { year: "numeric", month: "long", day: "numeric" } ) => {
    if ( !date ) return null;

    const formattedDate = new Date( date );
    return formattedDate.toLocaleDateString( locale, options );
};

/**
 * Formats date to DD/MM/YYYY format. 
 * @param {date} date 
 * @returns {string} Date expressed as a locale string. 
 */
export const formatDateDMY = ( date = new Date() ) => {
    let year, month, day;

    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();

    month = month.toString().padStart( 2, 0 );
    day = day.toString().padStart( 2, 0 );

    return `${ day }/${ month }/${ year }`;
};


/**
 * Formats date to DD/MM/YYYY format. 
 * @param {date} date 
 * @returns {string} Date expressed as a locale string. 
 */
export function formatDateDDMMYYYY ( date = new Date() ) {
    var day, month, year;

    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();

    if ( month < 10 ) {
        month = "0" + month;
    }

    if ( day < 10 ) {
        day = "0" + day;
    }

    return day + "/" + month + "/" + year;
}


/**
 * Formats date to DD/MM/YYYY format. 
 * @param {date} date 
 * @returns {string} Date expressed as a locale string. 
 */
export const formatTimestampDDMMYYYY = ( inputDate ) => {
    // 2023-04-17T16:47:12.141Z
    let date = inputDate;
    let newDate = new Date( date );

    let dd = newDate.getDate();
    let mm = parseInt( newDate.getMonth() + 1 );
    let yyyy = newDate.getFullYear();

    let formattedDate = `${ yyyy }-${ mm < 10 ? `0${ mm }` : mm }-${ dd < 10 ? `0${ dd }` : dd }`;

    return formattedDate;
};
