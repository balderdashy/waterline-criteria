# waterline-criteria

Utilities for working with Waterline criterias, especially for applying them to in-memory datasets.

> This module was designed for adapters which communicate with key/value stores such as [`sails-disk`](https://github.com/balderdashy/sails-disk), [sails-memory](https://github.com/balderdashy/sails-memory), and [sails-redis](https://github.com/balderdashy/sails-redis) (i.e. they already implement the `semantic` interface, but need to implement the `queryable` interface).


## For Node.js

#### Installation

```sh
$ npm install waterline-criteria --save
```

#### Basic Usage

```js
var wlFilter = require('waterline-criteria');

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

var results = wlFilter(SOME_DATASET, {
  where: {
    name: { contains: 'lyr' }
  }
}).results;

// x ==> [{name: 'Lyra', id: 1}]
```

## Bugs &nbsp; [![NPM version](https://badge.fury.io/js/waterline-criteria.svg)](http://npmjs.com/package/waterline-criteria)

To report a bug, [click here](http://sailsjs.com/bugs).

> This is a built-in module in the Sails framework and the `sails-disk` adapter.  It is installed automatically when you run `npm install sails`.

#### Version notes

The master branch of this repository holds `waterline-criteria` used in Sails versions 0.10.0 and up.  If you're looking for the version for the v0.9.x releases of Sails, the source is [located here](https://github.com/balderdashy/waterline-criteria/releases/tag/v0.9.7).

## Contributing &nbsp; [![Build Status](https://travis-ci.org/balderdashy/waterline-criteria.svg?branch=master)](https://travis-ci.org/balderdashy/waterline-criteria)

Please observe the guidelines and conventions laid out in the [Sails project contribution guide](http://sailsjs.com/contribute) when opening issues or submitting pull requests.

[![NPM](https://nodei.co/npm/waterline-criteria.png?downloads=true)](http://npmjs.com/package/waterline-criteria)

## License

The [Sails framework](http://sailsjs.com) is free and open-source under the [MIT License](http://sailsjs.com/license).
