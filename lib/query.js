/**
 * Module dependencies
 */

var _ = require('lodash');
var util = require('util');
var _where = require('./filters/where');
var _limit = require('./filters/limit');
var _skip = require('./filters/skip');
var _select = require('./projections/select');
var _groupBy = require('./projections/groupBy');
var _sort = require('./sort');



/**
 * Filter/aggregate/partition/map the tuples known as `classifier`
 * in `data` using `criteria` (a Waterline criteria object)
 *
 * @param  { Object[] }           data
 * @param  { Object }             criteria         [the Waterline criteria object- complete w/ `where`, `limit`, `sort, `skip`, and `joins`]
 *
 * @return { Integer | Object | Object[] }
 */

module.exports = function query ( /* classifier|tuples, data|criteria [, criteria] */ ) {

  var tuples, classifier, data, criteria, schema;

  // If no classifier is provided, and data was specified as an array
  // instead of an object, infer tuples from the array
  if (_.isArray(arguments[0]) && !arguments[2]) {
    tuples = arguments[0];
    criteria = arguments[1];
  }
  // If all three arguments were supplied:
  // get tuples of type `classifier` (i.e. SELECT * FROM __________)
  // and clone 'em.
  else {
    classifier = arguments[0];
    data = arguments[1];
    criteria = arguments[2];
    tuples = data[classifier];
  }

  // If the schema was passed in, it will be the 4th argument (zero based)
  if(arguments[3]) {
    schema = arguments[3];
  }
  // Ensure criteria object exists
  criteria = criteria || {};

  // Query and return result set using criteria
  tuples = _where(tuples, criteria.where, schema);
  tuples = _sort(tuples, criteria.sort);
  tuples = _skip(tuples, criteria.skip);
  tuples = _limit(tuples, criteria.limit);
  tuples = _select(tuples, criteria.select);
  
  // TODO:
  // tuples = _groupBy(tuples, criteria.groupBy);


  return {
    results: tuples
  };
};
