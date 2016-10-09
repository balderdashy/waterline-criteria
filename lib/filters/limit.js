/**
 * Module dependencies
 */

var _ = require('lodash');


/**
 * Apply a `limit` modifier to `data` using `limit`.
 *
 * @param  { Dictionary[] }  data
 * @param  { Integer }    limit
 * @return { Dictionary[] }
 */
module.exports = function (data, limit) {
  if( limit === undefined || !data || limit === 0) {
    return data;
  }
  return _.slice(data, 0, limit);
};
