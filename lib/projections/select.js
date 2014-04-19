/**
 * Module dependencies
 */

var _ = require('lodash')
  , util = require('util');


/**
 * Project `tuples` on `fields`.
 * 
 * @param  { Object[] }  tuples    [i.e. filteredData]
 * @param  { String[]/Object{} }  fields    [i.e. schema]
 * @return { Object[] }
 */
module.exports = function (tuples, fields) {

  // If `fields` are not an Object or Array, don't modify the output.
  if (typeof fields !== 'object') return tuples;

  // If `fields` are specified as an Object, convert them to an Array.
  if (!_.isArray(fields)) {
    fields = _.reduce(fields, function dictionary2Array(memo, v, k) {
      memo.push(v);
      return memo;
    }, []);
  }

  // Flatten nested SELECT clauses into `true`.
  fields = _.map(fields, function (field) {
    if (typeof field === 'object') return true;
    else return field;
  });

  // Finally, select fields from tuples.
  return _.map(tuples, function (tuple) {
    return _.pick(tuple,fields);
  });
};
