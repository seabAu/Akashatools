## Akashatools

This is a collection of useful utility functions for processing and rendering data, handling large or deeply-nested object-arrays, searching large JSON objects or databases for deeply nested values, and verification of most data-types in javascript. 

To install, put `npm i akashatools@latest` into your terminal. 

Monolithic import into your project with: 
```
    import * as utils from "akashatools/lib";
```

Once imported, you can make use of functions imported this way with: 
```
    utils.val.isObject( data );
    utils.ao.has( data, "keytofind" );
    utils.math.wrap( 0.5, 2.13, 4.l );
    etc.
```

Modular imports: 
~~~
    import * as ao from "akashatools/lib/AO.js";
    import * as debug from "akashatools/lib/Debug.js";
    import * as file from "akashatools/lib/File.js";
    import * as http from "akashatools/lib/Http.js";
    import * as math from "akashatools/lib/Math.js";
    import * as rand from "akashatools/lib/Rand.js";
    import * as str from "akashatools/lib/String.js";
    import * as time from "akashatools/lib/Time.js";
    import * as val from "akashatools/lib/Val.js";
~~~

or 

~~~
import {
    ao,
    debug,
    file,
    http,
    math,
    rand,
    str,
    time,
    val
} from 'akashatools/lib';
~~~