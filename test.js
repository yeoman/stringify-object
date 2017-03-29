/* eslint-env mocha */
'use strict';
const fs = require('fs');
const assert = require('assert');
const stringifyObject = require('./');

it('should stringify an object', () => {
	/* eslint-disable quotes, object-shorthand */
	const obj = {
		foo: 'bar \'bar\'',
		foo2: [
			'foo',
			'bar',
			{
				foo: "bar 'bar'"
			}
		],
		'foo-foo': 'bar',
		'2foo': 'bar',
		'@#': "bar",
		$el: 'bar',
		_private: 'bar',
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
		newlines: "foo\nbar\r\nbaz",
		[Symbol()]: Symbol(), // eslint-disable-line symbol-description
		[Symbol('foo')]: Symbol('foo'),
		[Symbol.for('foo')]: Symbol.for('foo')
	};
	/* eslint-enable */

	obj.circular = obj;

	const actual = stringifyObject(obj, {
		indent: '  ',
		singleQuotes: false
	});

	assert.equal(actual + '\n', fs.readFileSync('fixture.js', 'utf8'));
	assert.equal(
		stringifyObject({foo: 'a \' b \' c \\\' d'}, {singleQuotes: true}),
		'{\n\tfoo: \'a \\\' b \\\' c \\\' d\'\n}'
	);
});

it('should not detect reused object values as circular reference', () => {
	const val = {val: 10};
	const obj = {foo: val, bar: val};
	assert.equal(stringifyObject(obj), '{\n\tfoo: {\n\t\tval: 10\n\t},\n\tbar: {\n\t\tval: 10\n\t}\n}');
});

it('should not detect reused array values as false circular references', () => {
	const val = [10];
	const obj = {foo: val, bar: val};
	assert.equal(stringifyObject(obj), '{\n\tfoo: [\n\t\t10\n\t],\n\tbar: [\n\t\t10\n\t]\n}');
});

it('considering filter option to stringify an object', () => {
	const val = {val: 10};
	const obj = {foo: val, bar: val};
	const actual = stringifyObject(obj, {
		filter: (obj, prop) => prop !== 'foo'
	});
	assert.equal(actual, '{\n\tbar: {\n\t\tval: 10\n\t}\n}');
});

it('allows an object to be transformed', () => {
	const obj = {
		foo: {
			val: 10
		},
		bar: 9,
		baz: [8]
	};

	const actual = stringifyObject(obj, {
		transform: (obj, prop, result) => {
			if (prop === 'val') {
				return String(obj[prop] + 1);
			} else if (prop === 'bar') {
				return '\'' + result + 'L\'';
			} else if (obj[prop] === 8) {
				return 'LOL';
			}
			return result;
		}
	});

	assert.equal(actual, '{\n\tfoo: {\n\t\tval: 11\n\t},\n\tbar: \'9L\',\n\tbaz: [\n\t\tLOL\n\t]\n}');
});

it('should not crash with circular references in arrays', () => {
	const array = [];
	array.push(array);
	assert.doesNotThrow(() => {
		stringifyObject(array);
	});

	const nestedArray = [[]];
	nestedArray[0][0] = nestedArray;
	assert.doesNotThrow(() => {
		stringifyObject(nestedArray);
	});
});

it('should handle circular references in arrays', () => {
	const array2 = [];
	const array = [array2];
	array2[0] = array2;

	assert.doesNotThrow(() => {
		stringifyObject(array);
	});
});

it('should stringify complex circular arrays', () => {
	const array = [[[]]];
	array[0].push(array);
	array[0][0].push(array);
	array[0][0].push(10);
	array[0][0][0] = array;
	assert.equal(stringifyObject(array), '[\n\t[\n\t\t[\n\t\t\t"[Circular]",\n\t\t\t10\n\t\t],\n\t\t"[Circular]"\n\t]\n]');
});

it('allows short objects to be one-lined', () => {
	const object = {id: 8, name: 'Jane'};

	assert.equal(stringifyObject(object), '{\n\tid: 8,\n\tname: \'Jane\'\n}');
	assert.equal(stringifyObject(object, {inlineCharacterLimit: 21}), '{id: 8, name: \'Jane\'}');
	assert.equal(stringifyObject(object, {inlineCharacterLimit: 20}), '{\n\tid: 8,\n\tname: \'Jane\'\n}');
});

it('allows short arrays to be one-lined', () => {
	const array = ['foo', {id: 8, name: 'Jane'}, 42];

	assert.equal(stringifyObject(array), '[\n\t\'foo\',\n\t{\n\t\tid: 8,\n\t\tname: \'Jane\'\n\t},\n\t42\n]');
	assert.equal(stringifyObject(array, {inlineCharacterLimit: 34}), '[\'foo\', {id: 8, name: \'Jane\'}, 42]');
	assert.equal(stringifyObject(array, {inlineCharacterLimit: 33}), '[\n\t\'foo\',\n\t{id: 8, name: \'Jane\'},\n\t42\n]');
});

it('does not mess up indents for complex objects', () => {
	const object = {
		arr: [1, 2, 3],
		nested: {hello: 'world'}
	};

	assert.equal(stringifyObject(object), '{\n\tarr: [\n\t\t1,\n\t\t2,\n\t\t3\n\t],\n\tnested: {\n\t\thello: \'world\'\n\t}\n}');
	assert.equal(stringifyObject(object, {inlineCharacterLimit: 12}), '{\n\tarr: [1, 2, 3],\n\tnested: {\n\t\thello: \'world\'\n\t}\n}');
});

it('handles non-plain object', () => {
	assert.notStrictEqual(stringifyObject(fs.statSync(__filename)), '[object Object]');
});

it('should not stringify non-enumerable symbols', () => {
	const obj = {
		[Symbol('for enumerable key')]: undefined
	};
	const symbol = Symbol('for non-enumerable key');
	Object.defineProperty(obj, symbol, {enumerable: false});

	assert.equal(stringifyObject(obj), '{\n\tSymbol(for enumerable key): undefined\n}');
});

it('handle linebreaks', () => {
	assert.equal(stringifyObject('line1\nline2'), '\'line1\\nline2\'');
	assert.equal(stringifyObject({twoLines: 'line1\nline2'}), '{\n\ttwoLines: \'line1\\nline2\'\n}');
	assert.equal(stringifyObject('line1\nline2', {joinLines: false}), '\'line1\nline2\'');
	assert.equal(stringifyObject({twoLines: 'line1\nline2'}, {joinLines: false}), '{\n\ttwoLines: \'line1\nline2\'\n}');
});
