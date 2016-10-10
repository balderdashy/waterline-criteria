/**
 * Module dependencies
 */

var _ = require('lodash');

var _where = require('./filters/where');
var _limit = require('./filters/limit');
var _skip = require('./filters/skip');
var _select = require('./projections/select');
var _sort = require('./sort');

var validateWhereClause = require('./validators/validate-where-clause');
var validateSortClause = require('./validators/validate-sort-clause');




//  ███████╗██╗  ██╗██████╗  ██████╗ ██████╗ ████████╗
//  ██╔════╝╚██╗██╔╝██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝
//  █████╗   ╚███╔╝ ██████╔╝██║   ██║██████╔╝   ██║
//  ██╔══╝   ██╔██╗ ██╔═══╝ ██║   ██║██╔══██╗   ██║
//  ███████╗██╔╝ ██╗██║     ╚██████╔╝██║  ██║   ██║
//  ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝
//
//   ██████╗ ██╗   ██╗███████╗██████╗ ██╗   ██╗ ██╗██╗
//  ██╔═══██╗██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝██╔╝╚██╗
//  ██║   ██║██║   ██║█████╗  ██████╔╝ ╚████╔╝ ██║  ██║
//  ██║▄▄ ██║██║   ██║██╔══╝  ██╔══██╗  ╚██╔╝  ██║  ██║
//  ╚██████╔╝╚██████╔╝███████╗██║  ██║   ██║   ╚██╗██╔╝
//   ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═╝╚═╝
//

/**
 * waterline-criteria
 * ( query() )
 *
 * Run a query on a dataset.
 *
 * Filter/aggregate/partition/map the tuples known as `classifier`
 * in `data` using `criteria` (a Waterline criteria dictionary).
 *
 * > - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * > NOTE THAT, BESIDES PROVIDING AN ALL-IN-ONE TOP-LEVEL FUNCTION,
 * > WE ALSO EXPOSED DIRECT ACCESS TO THE OTHER LOWER-LEVEL HELPERS
 * > (like "where", "limit", etc.) AS PROPERTIES OF THIS FUNCTION.
 * > See the very bottom of this file for where those get attached.
 * > - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 * @param  { Dictionary[] }           data
 * @param  { Dictionary }             criteria         [the Waterline criteria Dictionary- complete w/ `where`, `limit`, `sort, `skip`, and `joins`]
 *
 * @return { Number | Dictionary | Dictionary[] }
 */

module.exports = function query ( /* classifier|tuples, data|criteria [, criteria] */ ) {

  // Embed an `INDEX_IN_ORIG_DATA` for each tuple to remember its original index
  // within `data`.  At the end, we'll lookup the `INDEX_IN_ORIG_DATA` for each tuple
  // and expose it as part of our results.
  var INDEX_IN_ORIG_DATA = '.(ørigindex)';

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

  // Clone tuples to avoid dirtying things up
  tuples = _.cloneDeep(tuples);

  // Embed `INDEX_IN_ORIG_DATA` in each tuple
  _.each(tuples, function(tuple, i) {
    tuple[INDEX_IN_ORIG_DATA] = i;
  });

  // Ensure criteria object exists
  criteria = criteria || {};

  // Query and return result set using criteria
  tuples = _where(tuples, criteria.where, schema);
  tuples = _sort(tuples, criteria.sort);
  tuples = _skip(tuples, criteria.skip);
  tuples = _limit(tuples, criteria.limit);
  tuples = _select(tuples, criteria.select);


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




//   █████╗ ████████╗████████╗ █████╗  ██████╗██╗  ██╗    ███╗   ███╗ ██████╗ ██████╗ ███████╗
//  ██╔══██╗╚══██╔══╝╚══██╔══╝██╔══██╗██╔════╝██║  ██║    ████╗ ████║██╔═══██╗██╔══██╗██╔════╝
//  ███████║   ██║      ██║   ███████║██║     ███████║    ██╔████╔██║██║   ██║██████╔╝█████╗
//  ██╔══██║   ██║      ██║   ██╔══██║██║     ██╔══██║    ██║╚██╔╝██║██║   ██║██╔══██╗██╔══╝
//  ██║  ██║   ██║      ██║   ██║  ██║╚██████╗██║  ██║    ██║ ╚═╝ ██║╚██████╔╝██║  ██║███████╗
//  ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
//
//  ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗     ███████╗███╗   ██╗███████╗
//  ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗    ██╔════╝████╗  ██║██╔════╝
//  ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝    █████╗  ██╔██╗ ██║███████╗
//  ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗    ██╔══╝  ██║╚██╗██║╚════██║
//  ██║  ██║███████╗███████╗██║     ███████╗██║  ██║    ██║     ██║ ╚████║███████║
//  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═══╝╚══════╝
//
//   █████╗ ███████╗    ██████╗ ██████╗  ██████╗ ██████╗ ███████╗
//  ██╔══██╗██╔════╝    ██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔════╝
//  ███████║███████╗    ██████╔╝██████╔╝██║   ██║██████╔╝███████╗
//  ██╔══██║╚════██║    ██╔═══╝ ██╔══██╗██║   ██║██╔═══╝ ╚════██║
//  ██║  ██║███████║    ██║     ██║  ██║╚██████╔╝██║     ███████║
//  ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚══════╝
//
// Now, in addition, attach some properties to the `query` function
// so that we can expose some more helper functions at the same time.



//  ╔═╗╔╦╗╔╦╗╔═╗╔═╗╦ ╦  ┬  ┬┌─┐┬  ┬┌┬┐┌─┐┌┬┐┬┌─┐┌┐┌  ┌─┐┌┐┌┌─┐
//  ╠═╣ ║  ║ ╠═╣║  ╠═╣  └┐┌┘├─┤│  │ ││├─┤ │ ││ ││││  ├┤ │││└─┐
//  ╩ ╩ ╩  ╩ ╩ ╩╚═╝╩ ╩   └┘ ┴ ┴┴─┘┴─┴┘┴ ┴ ┴ ┴└─┘┘└┘  └  ┘└┘└─┘
// Expose a handful of criteria validation functions:

module.exports.validateWhereClause = validateWhereClause;
module.exports.validateSortClause = validateSortClause;






//  ╔═╗╔╦╗╔╦╗╔═╗╔═╗╦ ╦  ┬  ┌─┐┬ ┬┌─┐┬─┐   ┬  ┌─┐┬  ┬┌─┐┬    ┌─┐ ┬ ┬┌─┐┬─┐┬ ┬  ┌─┐┌┐┌┌─┐
//  ╠═╣ ║  ║ ╠═╣║  ╠═╣  │  │ ││││├┤ ├┬┘───│  ├┤ └┐┌┘├┤ │    │─┼┐│ │├┤ ├┬┘└┬┘  ├┤ │││└─┐
//  ╩ ╩ ╩  ╩ ╩ ╩╚═╝╩ ╩  ┴─┘└─┘└┴┘└─┘┴└─   ┴─┘└─┘ └┘ └─┘┴─┘  └─┘└└─┘└─┘┴└─ ┴   └  ┘└┘└─┘
//  ┌─    ┌┬┐┌─┐┬ ┬  ┌┐ ┌─┐  ┌┬┐┌─┐┌─┐┬─┐┌─┐┌─┐┌─┐┌┬┐┌─┐┌┬┐    ─┐
//  │───  │││├─┤└┬┘  ├┴┐├┤    ││├┤ ├─┘├┬┘├┤ │  ├─┤ │ ├┤  ││  ───│
//  └─    ┴ ┴┴ ┴ ┴   └─┘└─┘  ─┴┘└─┘┴  ┴└─└─┘└─┘┴ ┴ ┴ └─┘─┴┘    ─┘

// Also export helper functions with lower-level functionality.
// > These *should be avoided*, because direct access to them
// > may be removed in future versions of waterline-criteria.
module.exports._where = _where;
module.exports._limit = _limit;
module.exports._skip = _skip;
module.exports._sort = _sort;
module.exports._select = _select;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// NOTE:
// "Group by" queries (currently experimental, and not implemented in
// _this_ package at all) will be deprecated in the Waterline query
// language as of Sails v1 / Waterline 0.13 in favor of Sails' new support
// for compiled statements and easier-to-use native queries.  For more
// info, see http://sailsjs.com/roadmap.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
