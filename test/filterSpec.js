/**
 * Module dependencies
 */
var wc = require('../'),
  assert = require('assert');

describe('filter criteria', function() {

  it('always matches empty filter', function() {
    var values = [0, 1, 2],
      data = {
        foo: []
      };

    for (var i = 0; i < values.length; i++) {
      data.foo.push({
        a: values[i]
      });
    }

    assert.equal(wc('foo', data, {}).results.length, 3);
    assert.equal(wc('foo', data, {
      where: null
    }).results.length, 3);
    assert.equal(wc('foo', data, {
      where: {}
    }).results.length, 3);
    assert.equal(wc('foo', data, {
      where: ''
    }).results.length, 3);
  });

  it('matches equal', function() {
    var values = [0, 1, 2],
      data = {
        foo: []
      };

    for (var i = 0; i < values.length; i++) {
      data.foo.push({
        a: values[i]
      });
    }

    assert.equal(wc('foo', data, {
      where: {
        a: 1
      }
    }).results.length, 1);
    assert.equal(wc('foo', data, {
      where: {
        a: '1'
      }
    }).results.length, 1);
  });

  it('matches not', function() {
    expectMatches(['not', '!'], [0, 1, 2], 1, 2);
  });

  it('matches greater than', function() {
    expectMatches(['greaterThan', '>'], [0, 1, 2], 1, 1);
  });

  it('matches greater than or equal', function() {
    expectMatches(['greaterThanOrEqual', '>='], [0, 1, 2], 1, 2);
  });

  it('matches less than', function() {
    expectMatches(['lessThan', '<'], [0, 1, 2], 1, 1);
  });

  it('matches less than or equal', function() {
    expectMatches(['lessThanOrEqual', '<='], [0, 1, 2], 1, 2);
  });

  it('matches starts with', function() {
    expectMatches(['startsWith'], ['abc', 'bba', 'ccc', 'bcb'], 'b', 2);
  });

  it('matches ends with', function() {
    expectMatches(['endsWith'], ['abc', 'bbb', 'ccc', 'bcb'], 'b', 2);
  });

  it('matches contains', function() {
    expectMatches(['contains'], ['abc', 'bbb', 'ccc', 'bcb'], 'c', 3);
  });

  it('matches like', function() {
    expectMatches(['like'], ['abc', 'bbb', 'ccc', 'bcb'], '%bc%', 2);
  });

  it('matches or', function() {
    var values = ['abc', 'bcd', 'cde'],
      data = {
        foo: []
      },
      where = {
        'or': [{
          key: {
            contains: 'a'
          }
        }, {
          key: {
            startsWith: 'b'
          }
        }]
      };

    for (var i = 0; i < values.length; i++) {
      data.foo.push({
        key: values[i]
      });
    }

    assert.equal(wc('foo', data, {
      where: where
    }).results.length, 2);
  });

  it('matches and', function() {
    var values = ['abc', 'bcd', 'cde'],
      data = {
        foo: []
      },
      where = {
        'and': [{
          key: {
            contains: 'b'
          }
        }, {
          key: {
            startsWith: 'a'
          }
        }]
      };

    for (var i = 0; i < values.length; i++) {
      data.foo.push({
        key: values[i]
      });
    }

    assert.equal(wc('foo', data, {
      where: where
    }).results.length, 1);
  });

  it('matches in array', function() {
    var values = [0, 1, 2],
      data = {
        foo: []
      };

    for (var i = 0; i < values.length; i++) {
      data.foo.push({
        key: values[i]
      });
    }

    assert.equal(wc('foo', data, {
      where: {
        key: [0, 1]
      }
    }).results.length, 2);
  });
});


describe('projections (select)', function() {

  // Fixtures:
  var DATASET = require('./dataset.fixture');


  // Suites:
  describe('using array syntax', function() {
    it('should select a single field', function() {
      expectResults({
        dataset: DATASET,
        criteria: {
          select: ['id']
        },
        results: [{
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }]
      });
    });
  });


  describe('using object syntax', function() {
    it('should select a single field', function() {
      expectResults({
        dataset: DATASET,
        criteria: {
          select: {
            id: true
          }
        },
        results: [{
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }]
      });
    });

    it('should respect nested selects', function() {
      expectResults({
        dataset: DATASET,
        criteria: {
          select: {
            id: true,
            friends: {
              name: true,
              email: true
            },
            dad: {
              name: true,
              age: true
            }
          }
        },
        results: [{
          id: 1,
          friends: [{
            name: 'friendfoo',
            email: 'friendfoo@gmail.com'
          },{
            name: 'friendbar',
            email: 'friendbar@gmail.com'
          }],
          dad: {
            name: 'grandfoo',
            age: 61
          }
        }, {
          id: 2,
          friends: [{
            name: 'friendbar',
            email: 'friendbar@gmail.com'
          }],
          dad: {
            name: 'grandbar',
            age: 42
          }
        }, {
          id: 3,
          friends: [{
            name: 'friendbaz',
            email: 'friendbaz@gmail.com'
          },
          {
            name: 'friendbar',
            email: 'friendbar@gmail.com'
          }],
          dad: {
            name: 'grandbaz',
            age: 72
          }
        }]
      });

    });
  });
});



///////////////////////////////////////////////////
// Helpers:
///////////////////////////////////////////////////


/**
 *
 * @param  {[type]} operators [description]
 * @param  {[type]} values    [description]
 * @param  {???} test
 * @param  {Number} expect    [num expected results]
 */
function expectMatches(operators, values, test, expect) {
  var transforms = [
    function(x) {
      return x;
    },
    function(x) {
      return x.toString();
    }
  ];
  var transform;

  for (var i = 0; i < operators.length; i++) {
    var operator = operators[i];

    for (var j = 0; j < transforms.length; j++) {
      transform = transforms[j];
    }

    for (var k = 0; k < transforms.length; k++) {
      var perm = transforms[k],
        data = {
          foo: []
        },
        where = {
          key: {}
        };

      for (var l = 0; l < values.length; l++) {
        data.foo.push({
          key: perm(values[l])
        });
      }

      where.key[operator] = transform(test);
      assert.equal(wc('foo', data, {
        where: where
      }).results.length, expect);
    }
  }
}


/**
 * @param  {Object} opts
 */
function expectResults(opts) {
  var dataset = opts.dataset,
    criteria = opts.criteria,
    results = opts.results;

  var r = wc(dataset, criteria).results;
  // console.log('Got results:',results);
  assert.deepEqual(results, r);
}
