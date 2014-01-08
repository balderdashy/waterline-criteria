Waterline-Criteria
=======================

Helper module designed for adapters which communicate with key/value stores such as [Sails-Disk](https://github.com/balderdashy/sails-disk), [Sails-Memory](https://github.com/balderdashy/sails-memory), and [sails-redis](https://github.com/balderdashy/sails-redis) (i.e. they already implement the `semantic` interface, but need to implement the `queryable` interface)


## Roadmap

1. Benchmark
2. Optimize
3. There is a possibility that waterline-criteria will eventually become a dependency of Waterline core, since it may make sense to merge the integrator submodule from Waterline core (in-memory populates/joins) into this library.


