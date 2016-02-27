'use strict';
var fs = require('fs');
var assert = require('assert');
var stringifyObject = require('./');

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
		undefined: undefined,
		function: function () {},
		regexp: /./,
		NaN: NaN,
		Infinity: Infinity,
		newlines: "foo\nbar\r\nbaz"
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

it('should not detect reused object values as circular reference', function () {
	var val = {val: 10};
	var obj = {foo: val, bar: val};
	assert.equal(stringifyObject(obj), '{\n\tfoo: {\n\t\tval: 10\n\t},\n\tbar: {\n\t\tval: 10\n\t}\n}');
});

it('should not detect reused array values as false circular references', function () {
	var val = [10];
	var obj = {foo: val, bar: val};
	assert.equal(stringifyObject(obj), '{\n\tfoo: [\n\t\t10\n\t],\n\tbar: [\n\t\t10\n\t]\n}');
});

it('considering filter option to stringify an object', function () {
	var val = {val: 10};
	var obj = {foo: val, bar: val};
	var actual = stringifyObject(obj, {
		filter: function (obj, prop) {
			return prop !== 'foo';
		}
	});
	assert.equal(actual, '{\n\tbar: {\n\t\tval: 10\n\t}\n}');
});

it('should not crash with circular recursion in arrays', function () {
	var array = [];
	array.push(array);
	assert.doesNotThrow(
		function () {
			stringifyObject(array);
		}, RangeError);

	var nestedArray = [[]];
	nestedArray[0][0] = nestedArray;
	assert.doesNotThrow(
		function () {
			stringifyObject(nestedArray);
		}, RangeError);
});

it('should stringify complex circular arrays', function () {
	var array = [[[]]];
	array[0].push(array);
	array[0][0].push(array);
	array[0][0].push(10);
	array[0][0][0] = array;
	assert.equal(stringifyObject(array), '[\n\t[\n\t\t[\n\t\t\t"[Circular]",\n\t\t\t10\n\t\t],\n\t\t"[Circular]"\n\t]\n]');
});
