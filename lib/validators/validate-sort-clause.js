/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var flaverr = require('flaverr');


/**
 * validateSortClause()
 *
 * Check the `SORT` clause for obviously unsupported usage.
 *
 * This does not do any schema-aware validation-- its job is merely
 * to check for structural issues, and to provide a better experience
 * when integrating from userland code.
 *
 * @param  {Dictionary} sort
 *         A hypothetically well-formed `sort` clause from
 *         a Waterline criteria.
 *
 * @throws {Error} If SORT clause cannot be parsed.
 *         @property {String} `code: 'E_SORT_CLAUSE_UNPARSEABLE'`
 */

module.exports = function validateSortClause(sort) {

  // TODO

};
