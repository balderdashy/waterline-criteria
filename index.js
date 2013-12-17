var _ = require('lodash');

// Find models in data which satisfy the options criteria,
// then return their indices in order
module.exports = function filterData(collectionName, data, options) {

  // Remember original indices
  var origIndexKey = '__origindex';
  var matches = _.cloneDeep(data[collectionName]);

  // Determine origIndex key
  _.each(matches, function(model, index) {
    model[origIndexKey] = index;
  });

  // Query and return result set using criteria
  matches = applyFilter(matches, options.where);
  matches = applySort(matches, options.sort);
  matches = applySkip(matches, options.skip);
  matches = applyLimit(matches, options.limit);
  matches = applyJoins(matches, data, options.joins);

  // Grab the index values of matched results
  // used to update the original values in the data source (sails-disk, sails-memory)
  var matchIndices = _.pluck(matches, origIndexKey);

  // Remove original index key which is keeping track of the index in the unsorted data
  _.each(matches, function(datum) {
    delete datum[origIndexKey];
  });

  return { results: matches, indicies: matchIndices };
};

// Run criteria query against data set
function applyFilter(data, criteria) {
  if(!data) return data;
  return _.filter(data, function(model) {
    return matchSet(model, criteria);
  });
}

function applySort(data, sort) {
  if(!sort || !data) return data;
  var records = sortData(_.clone(data), sort);
  return records;
}

// Sort Function
// Taken From: http://stackoverflow.com/a/4760279/909625
function sortData(data, sortCriteria) {

  function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }

    return function (a,b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    };
  }

  function dynamicSortMultiple() {
    var props = arguments;
    return function (obj1, obj2) {
      var i = 0, result = 0, numberOfProperties = props.length;

      while(result === 0 && i < numberOfProperties) {
        result = dynamicSort(props[i])(obj1, obj2);
        i++;
      }
      return result;
    };
  }

  // build sort criteria in the format ['firstName', '-lastName']
  var sortArray = [];
  _.each(_.keys(sortCriteria), function(key) {
    if(sortCriteria[key] === -1) sortArray.push('-' + key.toLowerCase());
    else sortArray.push(key.toLowerCase());
  });

  data.sort(dynamicSortMultiple.apply(null, sortArray));
  return data;
}

// Grab a key/pair from an object based on array index
function getKeyPair(obj, i) {
  var key = _.keys(obj)[i];
  return { key: key, val: obj[key] };
}

// Ignore the first *skip* models
function applySkip(data, skip) {
  if(!skip || !data) return data;
  else {
    return _.rest(data, skip);
  }
}

function applyLimit(data, limit) {
  if(!limit || !data) return data;
  else {
    return _.first(data, limit);
  }
}

function applyJoins(data, collections, joins) {

  // Don't process if there are no joins
  if(_.isUndefined(joins)) return data;

  var results = buildJoins(data, collections, joins);
  results = cleanseJoins(results, joins);

  return results;
}

function buildJoins(data, collections, joins) {

  // For Each Join find all matching records
  _.each(joins, function(join) {

    // For Each Record get values that match the join clause
    _.each(data, function(record) {

      // Build where clause
      var where = {};

      // Handle Many-To-Many joins where a join table is involved
      if(join.junctionTable) {
        var manyToManyAlias;

        joins.forEach(function(otherJoin) {
          if(otherJoin.child === join.parent) {
            manyToManyAlias = otherJoin.alias + '_' + otherJoin.child;
          }
        });

        if(record.hasOwnProperty(manyToManyAlias) && _.isArray(record[manyToManyAlias])) {
          where[join.childKey] = _.pluck(record[manyToManyAlias], join.parentKey);
        }
      }

      // Handle normal Belongs To / Has Many joins
      else {
        if(!record.hasOwnProperty(join.parentKey) && !join.junctionTable) return;
        where[join.childKey] = record[join.parentKey];
      }

      // Find all the children records that match the where criteria
      var children = _.filter(collections[join.child], function(model) {
        return matchSet(model, where);
      });

      // Delete the original key
      if(join.hasOwnProperty('removeParentKey') && join.removeParentKey) {
        delete record[join.parentKey];
      }

      var alias = join.alias.toLowerCase() + '_' + join.child.toLowerCase(),
          key;

      // If a junctionTable is used, the child value should be used as the key name
      if(join.junctionTable) {
        key = alias;

        // Find the corresponding join in order to figure out which key was used and remove the join
        // table data from the record.
        joins.forEach(function(otherJoin) {
          if(otherJoin.child === join.parent) {
            var criteriaKey = otherJoin.alias.toLowerCase() + '_' + otherJoin.child.toLowerCase();
            delete record[criteriaKey];
          }
        });

        record[key] = _.cloneDeep(children);
        return;
      }

      // If this is a belongs_to relationship, keep the "foreign key" part and let Waterline
      // handle the transformations
      if(join.model) key = join.parentKey;

      // If no model is defined and it's not a junctionTable attach values to the alias
      if(!join.model) key = alias;

      // Attach children to key
      record[key] = _.cloneDeep(children);
    });
  });

  return data;
}

/**
 * Cleanse the record of keys from Join Tables
 */

function cleanseJoins(data, joins) {

  // For Each Join Remove any keys that don't have select set to true
  _.each(joins, function(join) {

    // If the join has the select flag set to true the data needs to stay
    if(join.select) return;

    // Cleanse each record
    _.each(data, function(record) {
      if(!record.hasOwnProperty(join.child)) return;
      delete record[join.child];
    });
  });

  return data;
}


// Match a model against each criterion in a criteria query

function matchSet(model, criteria, parentKey) {

  // Null or {} WHERE query always matches everything
  if(!criteria || _.isEqual(criteria, {})) return true;

  // By default, treat entries as AND
  return _.all(criteria, function(criterion, key) {
    return matchItem(model, key, criterion, parentKey);
  });
}


function matchOr(model, disjuncts) {
  var outcomes = [];
  _.each(disjuncts, function(criteria) {
    if(matchSet(model, criteria)) outcomes.push(true);
  });

  var outcome = outcomes.length > 0 ? true : false;
  return outcome;
}

function matchAnd(model, conjuncts) {
  var outcome = true;
  _.each(conjuncts, function(criteria) {
    if(!matchSet(model, criteria)) outcome = false;
  });
  return outcome;
}

function matchLike(model, criteria) {
  for(var key in criteria) {
    // Return false if no match is found
    if (!checkLike(model[key], criteria[key])) return false;
  }
  return true;
}

function matchNot(model, criteria) {
  return !matchSet(model, criteria);
}

function matchItem(model, key, criterion, parentKey) {

  // Handle special attr query
  if (parentKey) {

    if (key === 'equals' || key === '=' || key === 'equal') {
      return matchLiteral(model,parentKey,criterion, compare['=']);
    }
    else if (key === 'not' || key === '!') {
      return matchLiteral(model,parentKey,criterion, compare['!']);
    }
    else if (key === 'greaterThan' || key === '>') {
      return matchLiteral(model,parentKey,criterion, compare['>']);
    }
    else if (key === 'greaterThanOrEqual' || key === '>=')  {
      return matchLiteral(model,parentKey,criterion, compare['>=']);
    }
    else if (key === 'lessThan' || key === '<')  {
      return matchLiteral(model,parentKey,criterion, compare['<']);
    }
    else if (key === 'lessThanOrEqual' || key === '<=')  {
      return matchLiteral(model,parentKey,criterion, compare['<=']);
    }
    else if (key === 'startsWith') return matchLiteral(model,parentKey,criterion, checkStartsWith);
    else if (key === 'endsWith') return matchLiteral(model,parentKey,criterion, checkEndsWith);
    else if (key === 'contains') return matchLiteral(model,parentKey,criterion, checkContains);
    else if (key === 'like') return matchLiteral(model,parentKey,criterion, checkLike);
    else throw new Error ('Invalid query syntax!');
  }
  else if(key.toLowerCase() === 'or') {
    return matchOr(model, criterion);
  } else if(key.toLowerCase() === 'not') {
    return matchNot(model, criterion);
  } else if(key.toLowerCase() === 'and') {
    return matchAnd(model, criterion);
  } else if(key.toLowerCase() === 'like') {
    return matchLike(model, criterion);
  }
  // IN query
  else if(_.isArray(criterion)) {
    return _.any(criterion, function(val) {
      return compare['='](model[key], val);
    });
  }

  // Special attr query
  else if (_.isObject(criterion) && validSubAttrCriteria(criterion)) {
    // Attribute is being checked in a specific way
    return matchSet(model, criterion, key);
  }

  // Otherwise, try a literal match
  else return matchLiteral(model,key,criterion, compare['=']);

}

// Comparison fns
var compare = {

  // Equalish
  '=' : function (a,b) {
    var x = normalizeComparison(a,b);
    return x[0] == x[1];
  },

  // Not equalish
  '!' : function (a,b) {
    var x = normalizeComparison(a,b);
    return x[0] != x[1];
  },
  '>' : function (a,b) {
    var x = normalizeComparison(a,b);
    return x[0] > x[1];
  },
  '>=': function (a,b) {
    var x = normalizeComparison(a,b);
    return x[0] >= x[1];
  },
  '<' : function (a,b) {
    var x = normalizeComparison(a,b);
    return x[0] < x[1];
  },
  '<=': function (a,b) {
    var x = normalizeComparison(a,b);
    return x[0] <= x[1];
  }
};

// Prepare two values for comparison
function normalizeComparison(a,b) {

  if(_.isUndefined(a) || a === null) a = '';
  if(_.isUndefined(b) || b === null) b = '';

  if (_.isString(a) && _.isString(b)) {
    a = a.toLowerCase();
    b = b.toLowerCase();
  }
  
  // Stringify for comparisons- except for numbers, null, and undefined
  if (!_.isNumber(a)) {
    a = typeof a.toString !== 'undefined' ? a.toString() : '' + a;
  }
  if (!_.isNumber(b)) {
    b = typeof b.toString !== 'undefined' ? b.toString() : '' + b;
  }

  return [a,b];
}

// Return whether this criteria is valid as an object inside of an attribute
function validSubAttrCriteria(c) {

  if(!_.isObject(c)) return false;

  var valid = false;
  var validAttributes = ['not', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual',
    '<', '<=', '!', '>', '>=', 'startsWith', 'endsWith', 'contains', 'like'];

  _.each(validAttributes, function(attr) {
    if(hasOwnProperty(c, attr)) valid = true;
  });

  return valid;
}

// Returns whether this value can be successfully parsed as a finite number
function isNumbery (value) {
  return Math.pow(+value, 2) > 0;
}

// matchFn => the function that will be run to check for a match between the two literals
function matchLiteral(model, key, criterion, matchFn) {

  // If the criterion are both parsable finite numbers, cast them
  if(isNumbery(criterion) && isNumbery(model[key])) {
    criterion = +criterion;
    model[key] = +model[key];
  }

  // ensure the key attr exists in model
  if(!model.hasOwnProperty(key)) return false;
  if(_.isUndefined(criterion)) return false;

  // ensure the key attr matches model attr in model
  if((!matchFn(model[key],criterion))) {
    return false;
  }

  // Otherwise this is a match
  return true;
}


function checkStartsWith (value, matchString) {
  // console.log("CheCKING startsWith ", value, "against matchString:", matchString, "result:",sqlLikeMatch(value, matchString));
  return sqlLikeMatch(value, matchString + '%');
}
function checkEndsWith (value, matchString) {
  return sqlLikeMatch(value, '%' + matchString);
}
function checkContains (value, matchString) {
  return sqlLikeMatch(value, '%' + matchString + '%');
}
function checkLike (value, matchString) {
  // console.log("CheCKING  ", value, "against matchString:", matchString, "result:",sqlLikeMatch(value, matchString));
  return sqlLikeMatch(value, matchString);
}

function sqlLikeMatch (value,matchString) {

  if(_.isRegExp(matchString)) {
    // awesome
  } else if(_.isString(matchString)) {
    // Handle escaped percent (%) signs
    matchString = matchString.replace(/%%%/g, '%');

    // Escape regex
    matchString = escapeRegExp(matchString);

    // Replace SQL % match notation with something the ECMA regex parser can handle
    matchString = matchString.replace(/([^%]*)%([^%]*)/g, '$1.*$2');

    // Case insensitive by default
    // TODO: make this overridable
    var modifiers = 'i';

    matchString = new RegExp('^' + matchString + '$', modifiers);
  }
  // Unexpected match string!
  else {
    console.error('matchString:');
    console.error(matchString);
    throw new Error("Unexpected match string: " + matchString + " Please use a regexp or string.");
  }

  // Deal with non-strings
  if(_.isNumber(value)) value = "" + value;
  else if(_.isBoolean(value)) value = value ? "true" : "false";
  else if(!_.isString(value)) {
    // Ignore objects, arrays, null, and undefined data for now
    // (and maybe forever)
    return false;
  }

  // Check that criterion attribute and is at least similar to the model's value for that attr
  if(!value.match(matchString)) {
    return false;
  }
  return true;
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * Safer helper for hasOwnProperty checks
 *
 * @param {Object} obj
 * @param {String} prop
 * @return {Boolean}
 * @api public
 */

var hop = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, prop) {
  return hop.call(obj, prop);
}
