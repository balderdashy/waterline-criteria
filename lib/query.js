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

module.exports = function query (classifier, data, criteria) {
  
  // Embed an `INDEX_IN_ORIG_DATA` for each tuple to remember its original index
  // within `data`.  At the end, we'll lookup the `INDEX_IN_ORIG_DATA` for each tuple
  // and expose it as part of our results.
  var INDEX_IN_ORIG_DATA = '.(ørigindex)';

  // Get tuples of type `classifier` (i.e. SELECT * FROM __________)
  // and clone 'em.
  var tuples = _.cloneDeep  ( data[classifier] );

  // Embed `INDEX_IN_ORIG_DATA` in each tuple
  _.each(tuples, function(tuple, i) {
    tuple[INDEX_IN_ORIG_DATA] = i;
  });

  // Query and return result set using criteria
  tuples = _where(tuples, criteria.where);
  tuples = _sort(tuples, criteria.sort);
  tuples = _skip(tuples, criteria.skip);
  tuples = _limit(tuples, criteria.limit);

  // TODO:
  // tuples = _select(tuples, criteria.select);
  // tuples = _groupBy(tuples, criteria.groupBy);

  // Grab the INDEX_IN_ORIG_DATA from each matched tuple
  // this is typically used to update the tuples in the external source data.
  var originalIndices = _.pluck(tuples, INDEX_IN_ORIG_DATA);

  // Remove INDEX_IN_ORIG_DATA from each tuple--
  // it is no longer needed.
  _.each(tuples, function(datum) {
    delete datum[INDEX_IN_ORIG_DATA];
  });

  return {
    results: tuples,
    indices: originalIndices
  };
};

