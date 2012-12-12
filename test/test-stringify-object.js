/*global describe, it */
'use strict';
var assert = require('assert');
var fs = require('fs');
var stringifyObject = require('../lib/stringify-object');

describe('stringifyObject()', function () {
	it('should stringify an object', function () {
		var obj = {
			foo: "bar 'bar'",
			foo2: [
				"foo",
				"bar",
				{
					foo: "bar 'bar'"
				}
			],
			"foo-foo": "bar",
			"2foo": "bar",
			"@#": "bar"
		};
		var actual = stringifyObject(obj, {
			indent: '  ',
			singleQuotes: false
		});
		console.log(actual)
		var expected = fs.readFileSync('test/fixture.js', 'utf8');
		assert.equal(actual + '\n', expected);
	});
});
