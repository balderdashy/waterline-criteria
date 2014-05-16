/**
 * Module dependencies
 */

var _ = require('lodash');
var util = require('util');


/**
 * Sort the tuples in `data` using `comparator`.
 *
 * @param  { Object[] }  data
 * @param  { Object }    comparator
 * @param  { Function }    when
 * @return { Object[] }
 */
module.exports = function(data, comparator, when) {
  if (!comparator || !data) return data;

  // Equivalent to a SQL "WHEN"
  when = when||function rankSpecialCase (record, attrName) {

    // null ranks lower than anything else
    if ( typeof record[attrName]==='undefined' || record[attrName] === null ) {
      return false;
    }
    else return true;
  };

  return sortData(_.cloneDeep(data), comparator, when);
};



//////////////////////////
///
/// private methods   ||
///                   \/
///                   
//////////////////////////



/**
 * Coerce a value to its probable intended type for sorting.
 * 
 * @param  {???} x
 * @return {???}
 */
function coerceIntoBestGuessType (x) {

  if (typeof x !== 'string') {
    return x;
  }
  // Probably meant to be a boolean
  else if (x === 'true' || x === 'false') {
    return (x==='true')?true:false;
  }

  // Probably meant to be a number
  else if (+x === x) {
    return +x;
  }

  // Probably meant to be a date
  else if (new Date(x)) {

  }
  
}


function guessType (x) {
  if (typeof x !== 'string') {
    return typeof x;
  }
  // Probably meant to be a boolean
  else if (x === 'true' || x === 'false') {
    return 'booleanish';
  }

  // Probably meant to be a number
  else if (+x === x) {
    return 'numberish';
  }

  // Probably meant to be a date
  else if (new Date(x)) {
    return 'dateish';
  }
}


function rankValue(x) {
  return x;
}


/**
 * Sort `data` (tuples) using `sortVector` (comparator obj)
 *
 * Based on method described here:
 * http://stackoverflow.com/a/4760279/909625
 *
 * @param  { Object[] } data         [tuples]
 * @param  { Object }   sortVector [mongo-style comparator object]
 * @return { Object[] }
 */

function sortData(data, sortVector, when) {

  // Constants
  var GREATER_THAN = 1;
  var LESS_THAN = -1;
  var EQUAL = 0;
  
  return data.sort(function comparator(a, b) {
    return _(sortVector).reduce(function (flagSoFar, sortDirection, attrName){

      // Handle special cases defined by WHEN fn
      var $a = when(a, attrName);
      var $b = when(b, attrName);

      var outcome;

      // Special cases
      if (!$a && !$b) outcome = EQUAL;
      else if (!$a && $b) outcome = LESS_THAN;
      else if ($a && !$b) outcome = GREATER_THAN;

      // General case:
      else {
        // Coerce types
        $a = a[attrName];
        $b = b[attrName];
        if ( $a < $b ) outcome = LESS_THAN;
        else if ( $a > $b ) outcome = GREATER_THAN;
        else outcome = EQUAL;
      }

      // Less-Than case (-1)
      // (leaves flagSoFar untouched if it has been set, otherwise sets it)
      if ( outcome === LESS_THAN ) {
        return flagSoFar || -sortDirection;
      }
      // Greater-Than case (1)
      // (leaves flagSoFar untouched if it has been set, otherwise sets it)
      else if ( outcome === GREATER_THAN ) {
        return flagSoFar || sortDirection;
      }
      // Equals case (0)
      // (always leaves flagSoFar untouched)
      else return flagSoFar;

    }, 0);
  });

  // // Reference: http://lodash.com/docs#sortBy
  // _(data).sortBy(function rankEachRecord (record) {

  //   var ranking;

  //   // Determine this record's ranking using `sortVector`
  //   _(sortVector).each(function (sortDirection, attrName){
  //     var ascending = sortDirection>0;
  //     _.sortedIndex(results, function (){});
      
  //     if (rankValue(record[attrName]) < NUMBER_MAX) {

  //     }
  //   });

  //   return ranking;
  // })
  // .valueOf();

  // function dynamicSort(property) {
  //   var sortOrder = 1;
  //   if (property[0] === '-') {
  //     sortOrder = -1;
  //     property = property.substr(1);
  //   }

  //   return function(a, b) {
  //     var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
  //     return result * sortOrder;
  //   };
  // }

  // function dynamicSortMultiple() {
  //   var props = arguments;
  //   return function(obj1, obj2) {
  //     var i = 0,
  //       result = 0,
  //       numberOfProperties = props.length;

  //     while (result === 0 && i < numberOfProperties) {
  //       result = dynamicSort(props[i])(obj1, obj2);
  //       i++;
  //     }
  //     return result;
  //   };
  // }

  // // build sort criteria in the format ['firstName', '-lastName']
  // var sortArray = [];
  // _.each(_.keys(sortVector), function(key) {
  //   if (sortVector[key] === -1) sortArray.push('-' + key.toLowerCase());
  //   else sortArray.push(key.toLowerCase());
  // });

  // data.sort(dynamicSortMultiple.apply(null, sortArray));
  // return data;
}


// function sortData(data, sortVector) {

//   function dynamicSort(property) {
//     var sortOrder = 1;
//     if (property[0] === '-') {
//       sortOrder = -1;
//       property = property.substr(1);
//     }

//     return function(a, b) {
//       var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
//       return result * sortOrder;
//     };
//   }

//   function dynamicSortMultiple() {
//     var props = arguments;
//     return function(obj1, obj2) {
//       var i = 0,
//         result = 0,
//         numberOfProperties = props.length;

//       while (result === 0 && i < numberOfProperties) {
//         result = dynamicSort(props[i])(obj1, obj2);
//         i++;
//       }
//       return result;
//     };
//   }

//   // build sort criteria in the format ['firstName', '-lastName']
//   var sortArray = [];
//   _.each(_.keys(sortVector), function(key) {
//     if (sortVector[key] === -1) sortArray.push('-' + key.toLowerCase());
//     else sortArray.push(key.toLowerCase());
//   });

//   data.sort(dynamicSortMultiple.apply(null, sortArray));
//   return data;
// }
