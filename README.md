# waterline-criteria

Utilities for working with Waterline criterias, especially for applying them to in-memory datasets.

> This module was designed for adapters which communicate with key/value stores such as [`sails-disk`](https://github.com/balderdashy/sails-disk), [sails-memory](https://github.com/balderdashy/sails-memory), and [sails-redis](https://github.com/balderdashy/sails-redis) (i.e. they already implement the `semantic` interface, but need to implement the `queryable` interface).


## Installation

```sh
$ npm install waterline-criteria --save
```

## Filtering an array

Filter an array of dictionaries.

```javascript
var WLCriteria = require('waterline-criteria');

var results = WLCriteria(dataset, criteria);
```

|   |         Argument           | Type                           | Details                                                           |
|---|:-------------------------- | ------------------------------ |:----------------------------------------------------------------- |
| 1 | dataset                    | ((array))                      | An array of dictionaries to filter/sort.
| 2 | criteria                   | ((dictionary))                 | A Waterline criteria dictionary.  See [Concepts > Models & ORM > Query Language](http://sailsjs.com/documentation/concepts/models-and-orm/query-language) for more information.


> Returns a filtered result set.


#### Example

```js
var WLCriteria = require('waterline-criteria');

var SOME_DATASET = [
  {
    id: 1,
    name: 'Lyra'
  },
  {
    id: 2,
    name 'larry'
  }
];

// Filter dataset.
var results = WLCriteria(SOME_DATASET, {
  where: {
    name: { contains: 'lyr' }
  }
}).results;

// x ==> [{name: 'Lyra', id: 1}]
```


## .validateWhereClause()

Check a `where` clause for obviously unsupported usage.

> This does not do any schema-aware validation-- its job is merely to check for structural issues, and to provide a better experience when integrating from userland code.

```javascript
var WLCriteria = require('waterline-criteria');

try {
  WLCriteria.validateWhereClause(where);
} catch (e) {
  switch (e.code) {
    case 'E_WHERE_CLAUSE_UNPARSEABLE':
      // ...
      break;
    default: throw e;
  }
}

// ...
```


|   |         Argument           | Type                | Details                                                           |
|---|:-------------------------- | ------------------- |:----------------------------------------------------------------- |
| 1 | where                      | ((dictionary))      | A hypothetically well-formed `where` clause from a Waterline criteria.


> If `where` clause cannot be parsed, throws an Error with a code property of `'E_WHERE_CLAUSE_UNPARSEABLE'`.


## .validateSortClause()

Check a `sort` clause for obviously unsupported usage.

> This does not do any schema-aware validation-- its job is merely to check for structural issues, and to provide a better experience when integrating from userland code.

```javascript
var WLCriteria = require('waterline-criteria');

try {
  WLCriteria.validateSortClause(sort);
} catch (e) {
  switch (e.code) {
    case 'E_SORT_CLAUSE_UNPARSEABLE':
      // ...
      break;
    default: throw e;
  }
}

// ...
```


|   |         Argument           | Type                           | Details                                                           |
|---|:-------------------------- | ------------------------------ |:----------------------------------------------------------------- |
| 1 | sort                       | ((dictionary)) _or_ ((string)) | A hypothetically well-formed `sort` clause from a Waterline criteria.


> If `sort` clause cannot be parsed, throws an Error with a code property of `'E_SORT_CLAUSE_UNPARSEABLE'`.




## Bugs &nbsp; [![NPM version](https://badge.fury.io/js/waterline-criteria.svg)](http://npmjs.com/package/waterline-criteria)

To report a bug, [click here](http://sailsjs.com/bugs).

> This is a built-in module in the Sails framework and the `sails-disk` adapter.  It is installed automatically when you run `npm install sails`.

#### Version notes

The master branch of this repository holds `waterline-criteria` used in Sails versions 0.10.0 and up.  If you're looking for the version for the v0.9.x releases of Sails, the source is [located here](https://github.com/balderdashy/waterline-criteria/releases/tag/v0.9.7).

## Contributing &nbsp; [![Build Status](https://travis-ci.org/balderdashy/waterline-criteria.svg?branch=master)](https://travis-ci.org/balderdashy/waterline-criteria)

Please observe the guidelines and conventions laid out in the [Sails project contribution guide](http://sailsjs.com/contribute) when opening issues or submitting pull requests.

[![NPM package info](https://nodei.co/npm/waterline-criteria.png?downloads=true)](http://npmjs.com/package/waterline-criteria)

## License

The [Sails framework](http://sailsjs.com) is free and open-source under the [MIT License](http://sailsjs.com/license).
