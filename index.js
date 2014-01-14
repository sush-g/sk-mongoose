/*	batchStream : For batchwise full collection scan.
	- input : (model, query, options, processing callback, callback)
		- options :
			- selection : mongo query select filter.
			- sort : mongo query sort.
			- batchSize : Integer specifying batch size.
		- processingCb : 
			Function to be called on batch.
		- callback :
			Final callback to be called after full collection streaming.
*/
exports.batchStream = function (model, query, options, processingCb, callback) {
	// Cleaning options.
	options = options || {};
	options.batchSize = options.batchSize || 1;

	// Building cursor.
	var modelCursor = model.find(query);
	if (options.selection) modelCursor.select(options.selection);
	if (options.sort) modelCursor.sort(options.sort);

	// Streaming cursor.
	var modelStream = modelCursor.stream();

	var batch = [];
	modelStream.on('data', function (doc) {
		if (batch.length < options.batchSize) {
			batch.push(doc);
		} else {
			modelStream.pause();
			processingCb(batch, function() {
				// After processing batch, initilize batch to [doc] and resume stream.
				batch = [doc];
				modelStream.resume();
			});
		}
	}).on('error', function (err) {	// Error handling...
		callback({error: "Failed batch streaming..."});
	}).on('close', function () {	// On closing stream...
		if (batch.length > 0) {
			processingCb(batch, function () {
				console.log("Completed batched collection streaming, query:", JSON.stringify(query));
				callback();
			})
		}
	});
};

/*	getCountMap : Get the count for field's values.
	- input : (model, field, options, callback)
		- field :
			Field for whose value you want counts.
		- options :
			- match : mongo query to filter as per need.
			- unwind : For arrays values.
		- callback :
			Final callback to be called when aggregation is done.
*/
exports.getCountMap = function(model, field, options, callback) {
	// Cleaning options.
	options = options || {};
	options.match = options.match || {};
	options.unwind = options.unwind || false;

	// Building aggregation query components.
	var matchQuery = {$match: options.match};
	
	var unwindQuery = null;
	if (options.unwind)
		unwindQuery = {$unwind: "$" + field};

	var groupElement = {};
	groupElement[field] = "$" + field;
	var groupQuery = {$group: {_id: groupElement, count: {$sum: 1}}};

	var sortQuery = {$sort: {count: -1}};

	if (options.unwind)
		model.aggregate(matchQuery, unwindQuery, groupQuery, sortQuery, callback);
	else
		model.aggregate(matchQuery, groupQuery, sortQuery, callback);
};