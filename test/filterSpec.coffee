wc = require '../'
assert = require 'assert'

expectMatches = (operators, values, test, expect) ->
  transforms = [((x) -> x), ((x) -> "#{x}")]
  for operator in operators
    for transform in transforms
      for perm in transforms
        data = (key: perm v for v in values)
        where = key: {}
        where.key[operator] = transform test
        assert.equal wc(data, where: where).length, expect


describe 'filter criteria', ->

  it 'always matches empty filter', ->
    data = (a: x for x in [0...3])
    assert.equal wc(data, {}).length, 3
    assert.equal wc(data, where: null).length, 3
    assert.equal wc(data, where: {}).length, 3
    assert.equal wc(data, where: '').length, 3

  it 'matches equal', ->
    # expectMatches ['equal', 'equals', '='], [0...3], 1, 1
    data = (a: x for x in [0...3])
    assert.equal wc(data, where: a: 1).length, 1
    assert.equal wc(data, where: a: '1').length, 1

  it 'matches not', ->
    expectMatches ['not', '!'], [0...3], 1, 2

  it 'matches greater than', ->
    expectMatches ['greaterThan', '>'], [0...3], 1, 1

  it 'matches greater than or equal', ->
    expectMatches ['greaterThanOrEqual', '>='], [0...3], 1, 2

  it 'matches less than', ->
    expectMatches ['lessThan', '<'], [0...3], 1, 1

  it 'matches less than or equal', ->
    expectMatches ['lessThanOrEqual', '<='], [0...3], 1, 2

  it 'matches starts with', ->
    expectMatches ['startsWith'], ['abc', 'bba', 'ccc', 'bcb'], 'b', 2

  it 'matches ends with', ->
    expectMatches ['endsWith'], ['abc', 'bbb', 'ccc', 'bcb'], 'b', 2

  it 'matches contains', ->
    expectMatches ['contains'], ['abc', 'bbb', 'ccc', 'bcb'], 'c', 3

  it 'matches like', ->
    expectMatches ['like'], ['abc', 'bbb', 'ccc', 'bcb'], '%bc%', 2

  it 'matches or', ->
    data = (key: "#{v}" for v in ['abc', 'bcd', 'cde'])
    where = 'or': [{key: contains: 'a'}, {key: startsWith: 'b'}]
    assert.equal wc(data, where: where).length, 2

  it 'matches and', ->
    data = (key: "#{v}" for v in ['abc', 'bcd', 'cde'])
    where = 'and': [{key: contains: 'b'}, {key: startsWith: 'a'}]
    assert.equal wc(data, where: where).length, 1

  it 'matches in array', ->
    data = (key: v for v in [0...3])
    assert.equal wc(data, where: key: [0, 1]).length, 2
