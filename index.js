// This package exports a function.  But it also exposes a few other functions
// as properties of the main function.  See `lib/index.js` for details.
// (We do this in lib/index.js purely for clarity-- because if we added
//  the other properties here, it would mutate the function globally anyway,
//  even if the function was required directly from `lib/index` instead of here.)
module.exports = require('./lib/index');
