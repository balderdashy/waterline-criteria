/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var flaverr = require('flaverr');


// A prefix string to use at the beginning of error messages
// relating to this `sort` clause being unparseable.
var E_SORT_CLAUSE_UNPARSEABLE_MSG_PREFIX =
'Could not parse the provided `sort` clause.  Refer to the Sails documentation '+
'for up-to-date info on supported query language syntax:\n'+
'(http://sailsjs.com/documentation/concepts/models-and-orm/query-language)\n'+
'Details: ';


/**
 * validateSortClause()
 *
 * Check the `SORT` clause for obviously unsupported usage.
 *
 * This does not do any schema-aware validation-- its job is merely
 * to check for structural issues, and to provide a better experience
 * when integrating from userland code.
 *
 * @param  {String|Dictionary} sort
 *         A hypothetically well-formed `sort` clause from
 *         a Waterline criteria.
 *
 * @throws {Error} If SORT clause cannot be parsed.
 *         @property {String} `code: 'E_SORT_CLAUSE_UNPARSEABLE'`
 */

module.exports = function validateSortClause(sort) {

  if (_.isUndefined(sort)) {
    throw new Error('Cannot call validateSortClause() when `sort` is undefined.');
  }

  if (_.isString(sort)) {

    if (!sort) {
      throw flaverr('E_SORT_CLAUSE_UNPARSEABLE', new Error(E_SORT_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'If `sort` is specified as a string, it must not be the empty string ("")!'));
    }
    // FUTURE: more strict validations

  }
  else if (_.isArray(sort)) {

    throw flaverr('E_SORT_CLAUSE_UNPARSEABLE', new Error(E_SORT_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Expected `sort` to be a string or dictionary, but instead got an array: `'+util.inspect(sort,{depth: null})+'`  Arrays are not allowed in the current version of Waterline query language. (However, note that arrays _are_ a valid way to indicate `sort` preferences when building lower-level prepared statements in Sails >= v1.0)'));

  }
  else if (_.isObject(sort) && !_.isArray(sort) && !_.isFunction(sort)) {

    // If the dictionary is empty, then this is a bit strange.
    // e.g. `{ sort: {} }`
    if (_.keys(sort).length === 0) {
      // ...but technically allowed-- so we'll tolerate it.
    }

    // FUTURE: more strict validations

  }
  else {
    throw flaverr('E_SORT_CLAUSE_UNPARSEABLE', new Error(E_SORT_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Expected `sort` to be a string or dictionary, but instead got: `'+util.inspect(sort,{depth: null})+'`'));
  }

};
