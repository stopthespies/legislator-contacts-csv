var csvFile = __dirname + '/legislator_contacts_with_member_id.csv';
var csvIdxs;

//------------------------------------------------------------------------------

var fs = require('fs');
var csv = require('csv');
var Promise = require('promise');

var promise;

function extractMember(theHonorableMember)
{
	var member = {}, i;

	for (i = 0; i < csvIdxs.length; ++i) {
		member[csvIdxs[i]] = theHonorableMember[i] || null;
	}

	return member;
}

function get()
{
	if (!promise) {
		promise = new Promise(function(resolve, reject) {
			var parser = csv.parse();
			var csvStream = fs.createReadStream(csvFile);
			var records = [];

			csvStream.on('data', function readCSV(data) {
				parser.write(data);
			});

			parser.on('readable', function parseCSV() {
				while (data = parser.read()) {
					if (!csvIdxs) {	// first row is header
						csvIdxs = data;
						return;
					}
					records.push(extractMember(data));
				}
			});

			csvStream.on('end', function() {
				resolve(records);
			});

			function bad(err) {
				reject(err);
			}

			csvStream.on('error', bad);
			parser.on('error', bad);
		});
	}

	return promise;
}

module.exports = {
	get : get
};
