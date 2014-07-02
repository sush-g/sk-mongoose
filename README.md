sk-mongoose
===========

Open project for having utility methods for mongoose Models, scanning the whole collection or getting count maps.

## Methods ##

* `batchStream` : For batchwise full collection scan.
  - args : (model, query, options, processingCb, callback)
  - options :
    - selection : mongo query select filter.
    - sort : mongo query sort.
    - batchSize : Integer specifying batch size.
  - processingCb : 
    Function to be called on batch.
  - callback :
    Final callback to be called after full collection streaming.

Limitation (sort with complex queries might not work for large collections, make sure to build proper indexes before streaming)

---

* `getCountMap` : Get the count for field's values.
  - args : (model, field, options, callback)
  - field : Field for whose value you want counts.
  - options :
    - match : mongo query to filter as per need.
    - unwind : For arrays values.
  - callback :
    Final callback to be called when aggregation is done.
