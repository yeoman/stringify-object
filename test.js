'use strict';
var fs = require('fs');
var assert = require('assert');
var stringifyObject = require('./stringify-object');

describe('stringifyObject()', function () {
	it('should stringify an object', function () {
		var expected;
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
			"@#": "bar",
			$el: "bar",
			_private: "bar",
			number: 1,
			boolean: true,
			date: new Date("2014-01-29T22:41:05.665Z"),
			escapedString: "\"\"",
			null: null,
			undefined: undefined
		};

		obj.circular = obj;

		var actual = stringifyObject(obj, {
			indent: '  ',
			singleQuotes: false
		});

		assert.equal(actual + '\n', fs.readFileSync('fixture.js', 'utf8'));
		assert.equal(
			stringifyObject({foo: "a ' b \' c \\' d"}, {singleQuotes: true}),
			"{\n\tfoo: 'a \\' b \\' c \\\\' d'\n}"
		);
	});
});
