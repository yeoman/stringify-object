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

it('should not crash with circular references in arrays', function () {
	var array = [];
	array.push(array);
	assert.doesNotThrow(
		function () {
			stringifyObject(array);
		});

	var nestedArray = [[]];
	nestedArray[0][0] = nestedArray;
	assert.doesNotThrow(
		function () {
			stringifyObject(nestedArray);
		});
});

it('should handle circular references in arrays', function () {
	var array2 = [];
	var array = [array2];
	array2[0] = array2;

	assert.doesNotThrow(
		function () {
			stringifyObject(array);
		});
});

it('should stringify complex circular arrays', function () {
	var array = [[[]]];
	array[0].push(array);
	array[0][0].push(array);
	array[0][0].push(10);
	array[0][0][0] = array;
	assert.equal(stringifyObject(array), '[\n\t[\n\t\t[\n\t\t\t"[Circular]",\n\t\t\t10\n\t\t],\n\t\t"[Circular]"\n\t]\n]');
});

it('allows short objects to be one-lined', function () {
	var object = { id: 8, name: 'Jane' }

	assert.equal(stringifyObject(object), "{\n\tid: 8,\n\tname: 'Jane'\n}")
	assert.equal(stringifyObject(object, { inlineCharacterLimit: 21}), "{id: 8, name: 'Jane'}")
	assert.equal(stringifyObject(object, { inlineCharacterLimit: 20}), "{\n\tid: 8,\n\tname: 'Jane'\n}")
});

it('allows short arrays to be one-lined', function () {
	var array = ['foo', { id: 8, name: 'Jane' }, 42]

	assert.equal(stringifyObject(array), "[\n\t'foo',\n\t{\n\t\tid: 8,\n\t\tname: 'Jane'\n\t},\n\t42\n]")
	assert.equal(stringifyObject(array, { inlineCharacterLimit: 34}), "['foo', {id: 8, name: 'Jane'}, 42]")
	assert.equal(stringifyObject(array, { inlineCharacterLimit: 33}), "[\n\t'foo',\n\t{id: 8, name: 'Jane'},\n\t42\n]")
});

it('does not mess up indents for complex objects', function(){
	var object = {
		arr: [1, 2, 3],
		nested: { hello: "world" }
	};

	assert.equal(stringifyObject(object), "{\n\tarr: [\n\t\t1,\n\t\t2,\n\t\t3\n\t],\n\tnested: {\n\t\thello: 'world'\n\t}\n}");
	assert.equal(stringifyObject(object, {inlineCharacterLimit: 12}), "{\n\tarr: [1, 2, 3],\n\tnested: {\n\t\thello: 'world'\n\t}\n}");
});
