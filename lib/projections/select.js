/**
 * Module dependencies
 */

var _ = require('lodash');


/**
 * Project `tuples` on `fields`.
 *
 * @param  { Dictionary[] }  tuples    [i.e. filteredData]
 * @param  { String[]/Dictionary{} }  fields    [i.e. schema]
 * @return { Dictionary[] }
 */
module.exports = function select (tuples, fields) {

  // Expand splat shortcut syntax
  if (fields === '*') {
    fields = { '*': true };
  }

  // If `fields` is not a dictionary or array, don't modify the output.
  // (Just return it as-is.)
  if (typeof fields !== 'object') {
    return tuples;
  }

  // If `fields` are specified as an Array, convert them to a dictionary.
  if (_.isArray(fields)) {
    fields = _.reduce(fields, function arrayToDict(memo, attrName) {
      memo[attrName] = true;
      return memo;
    }, {});
  }

  // If the '*' key is specified, the projection algorithm is flipped:
  // only keys which are explicitly set to `false` will be excluded--
  // all other keys will be left alone (this lasts until the recursive step.)
  var hasSplat = !!fields['*'];
  var fieldsToExplicitlyOmit = _.filter(_.keys(fields), function (key){
    // If value is explicitly false, then this key is a field to omit.
    return fields[key] === false;
  });

  delete fields['*'];


  // Finally, select fields from tuples.
  return _.map(tuples, function (tuple) {

    // Select the requested attributes of the tuple
    if (hasSplat) {
      tuple = _.omit(tuple, function (value, attrName){
        return _.contains(fieldsToExplicitlyOmit, attrName);
      });
    }
    else {
      tuple = _.pick(tuple, Object.keys(fields));
    }


    // || NOTE THAT THIS APPROACH WILL CHANGE IN AN UPCOMING RELEASE
    // \/ TO MATCH THE CONVENTIONS ESTABLISHED IN WL2.

    // Take recursive step if necessary to support nested
    // SELECT clauses (NOT nested modifiers- more like nested
    // WHEREs)
    //
    // e.g.:
    // like this:
    //   -> { select: { pet: { collarSize: true } } }
    //
    // not this:
    //   -> { select: { pet: { select: { collarSize: true } } } }
    //
    _.each(fields, function (subselect, attrName) {

      // (WARNING: this conditional is true when `subselect` is `null`!)
      // (Leaving it as-is for now to avoid breaking backwards-compatibility.)
      if (typeof subselect === 'object') {

        if (_.isArray(tuple[attrName])) {
          tuple[attrName] = select(tuple[attrName], subselect);
        }
        else if (_.isObject(tuple[attrName])) {
          tuple[attrName] = select([tuple[attrName]], subselect)[0];
        }
      }

    });

    return tuple;
  });
};

