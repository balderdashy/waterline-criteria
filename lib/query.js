/**
 * Module dependencies
 */

var _ = require('lodash')
  , util = require('util')
  , _where = require('./filters/where')
  , _limit = require('./filters/limit')
  , _skip = require('./filters/skip')
  , _sort = require('./filters/sort')
  , _select = require('./projections/select')
  , _groupBy = require('./projections/groupBy');



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
  
  // Embed an `INDEX_IN_ORIG_DATA` for each tuple to remember its original index
  // within `data`.  At the end, we'll lookup the `INDEX_IN_ORIG_DATA` for each tuple
  // and expose it as part of our results.
  var INDEX_IN_ORIG_DATA = '.(ørigindex)';

  var tuples, classifier, data, criteria;

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

  // Clone tuples to avoid dirtying things up
  tuples = _.cloneDeep(tuples);

  // Embed `INDEX_IN_ORIG_DATA` in each tuple
  _.each(tuples, function(tuple, i) {
    tuple[INDEX_IN_ORIG_DATA] = i;
  });

  // Ensure criteria object exists
  criteria = criteria || {};

  // Query and return result set using criteria
  tuples = _where(tuples, criteria.where);
  tuples = _sort(tuples, criteria.sort);
  tuples = _skip(tuples, criteria.skip);
  tuples = _limit(tuples, criteria.limit);
  tuples = _select(tuples, criteria.select);
  
  // TODO:
  // tuples = _groupBy(tuples, criteria.groupBy);

  // Grab the INDEX_IN_ORIG_DATA from each matched tuple
  // this is typically used to update the tuples in the external source data.
  var originalIndices = _.pluck(tuples, INDEX_IN_ORIG_DATA);

  // Remove INDEX_IN_ORIG_DATA from each tuple--
  // it is no longer needed.
  _.each(tuples, function(tuple) {
    delete tuple[INDEX_IN_ORIG_DATA];
  });

  return {
    results: tuples,
    indices: originalIndices
  };
};

