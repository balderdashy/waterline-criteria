/**
 * Module dependencies
 */

var _ = require('lodash');


/**
 * Apply a `skip` modifier to `data` using `numToSkip`.
 *
 * @param  { Dictionary[] }  data
 * @param  { Integer }   numToSkip
 * @return { Dictionary[] }
 */
module.exports = function (data, numToSkip) {

  if(!numToSkip || !data) {
    return data;
  }

  // Ignore the first `numToSkip` tuples
  return _.slice(data, numToSkip);
};
