/*global describe, it */
'use strict';
var isBrowser = typeof window !== 'undefined';

if (isBrowser) {
	var xhrSync = (function () {
		/*global XMLHttpRequest */
		var xhr = new XMLHttpRequest();
		return function(method, url, callback) {
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					callback(xhr.responseText);
				}
			};
			xhr.open(method, url, false);
			xhr.send();
		};
	})();
} else {
	var fs = require('fs');
	var assert = require('chai').assert;
	var stringifyObject = require('../stringify-object');
}

describe('stringifyObject()', function () {
	/*jshint quotmark:false */
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
			number: 1
		};

		obj.circular = obj;

		var actual = stringifyObject(obj, {
			indent: '  ',
			singleQuotes: false
		});

		if (isBrowser) {
			xhrSync('get', 'fixture/fixture.js', function (data) {
				expected = data;
			});
		} else {
			expected = fs.readFileSync('test/fixture/fixture.js', 'utf8');
		}

		assert.equal(actual + '\n', expected);
	});
});
