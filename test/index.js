import fs from 'fs';
import path from 'path';
import test from 'ava';
import stringifyObject from '..';

test('stringify an object', t => {
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
		fn: function fn() {}, // eslint-disable-line func-names
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

	t.is(actual + '\n', fs.readFileSync(path.resolve(__dirname, 'fixtures/object.js'), 'utf8'));
	t.is(
		stringifyObject({foo: 'a \' b \' c \\\' d'}, {singleQuotes: true}),
		'{\n\tfoo: \'a \\\' b \\\' c \\\' d\'\n}'
	);
});

test('detect reused object values as circular reference', t => {
	const val = {val: 10};
	const obj = {foo: val, bar: val};
	t.is(stringifyObject(obj), '{\n\tfoo: {\n\t\tval: 10\n\t},\n\tbar: {\n\t\tval: 10\n\t}\n}');
});

test('detect reused array values as false circular references', t => {
	const val = [10];
	const obj = {foo: val, bar: val};
	t.is(stringifyObject(obj), '{\n\tfoo: [\n\t\t10\n\t],\n\tbar: [\n\t\t10\n\t]\n}');
});

test('considering filter option to stringify an object', t => {
	const val = {val: 10};
	const obj = {foo: val, bar: val};
	const actual = stringifyObject(obj, {
		filter: (obj, prop) => prop !== 'foo'
	});
	t.is(actual, '{\n\tbar: {\n\t\tval: 10\n\t}\n}');

	const actual2 = stringifyObject(obj, {
		filter: (obj, prop) => prop !== 'bar'
	});
	t.is(actual2, '{\n\tfoo: {\n\t\tval: 10\n\t}\n}');

	const actual3 = stringifyObject(obj, {
		filter: (obj, prop) => prop !== 'val' && prop !== 'bar'
	});
	t.is(actual3, '{\n\tfoo: {}\n}');
});

test('allows an object to be transformed', t => {
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

	t.is(actual, '{\n\tfoo: {\n\t\tval: 11\n\t},\n\tbar: \'9L\',\n\tbaz: [\n\t\tLOL\n\t]\n}');
});

test('doesn\'t  crash with circular references in arrays', t => {
	const array = [];
	array.push(array);
	t.notThrows(() => {
		stringifyObject(array);
	});

	const nestedArray = [[]];
	nestedArray[0][0] = nestedArray;
	t.notThrows(() => {
		stringifyObject(nestedArray);
	});
});

test('handle circular references in arrays', t => {
	const array2 = [];
	const array = [array2];
	array2[0] = array2;

	t.notThrows(() => {
		stringifyObject(array);
	});
});

test('stringify complex circular arrays', t => {
	const array = [[[]]];
	array[0].push(array);
	array[0][0].push(array);
	array[0][0].push(10);
	array[0][0][0] = array;
	t.is(stringifyObject(array), '[\n\t[\n\t\t[\n\t\t\t"[Circular]",\n\t\t\t10\n\t\t],\n\t\t"[Circular]"\n\t]\n]');
});

test('allows short objects to be one-lined', t => {
	const object = {id: 8, name: 'Jane'};

	t.is(stringifyObject(object), '{\n\tid: 8,\n\tname: \'Jane\'\n}');
	t.is(stringifyObject(object, {inlineCharacterLimit: 21}), '{id: 8, name: \'Jane\'}');
	t.is(stringifyObject(object, {inlineCharacterLimit: 20}), '{\n\tid: 8,\n\tname: \'Jane\'\n}');
});

test('allows short arrays to be one-lined', t => {
	const array = ['foo', {id: 8, name: 'Jane'}, 42];

	t.is(stringifyObject(array), '[\n\t\'foo\',\n\t{\n\t\tid: 8,\n\t\tname: \'Jane\'\n\t},\n\t42\n]');
	t.is(stringifyObject(array, {inlineCharacterLimit: 34}), '[\'foo\', {id: 8, name: \'Jane\'}, 42]');
	t.is(stringifyObject(array, {inlineCharacterLimit: 33}), '[\n\t\'foo\',\n\t{id: 8, name: \'Jane\'},\n\t42\n]');
});

test('does not mess up indents for complex objects', t => {
	const object = {
		arr: [1, 2, 3],
		nested: {hello: 'world'}
	};

	t.is(stringifyObject(object), '{\n\tarr: [\n\t\t1,\n\t\t2,\n\t\t3\n\t],\n\tnested: {\n\t\thello: \'world\'\n\t}\n}');
	t.is(stringifyObject(object, {inlineCharacterLimit: 12}), '{\n\tarr: [1, 2, 3],\n\tnested: {\n\t\thello: \'world\'\n\t}\n}');
});

test('handles non-plain object', t => {
	t.not(stringifyObject(fs.statSync(__filename)), '[object Object]');
});

test('don\'t stringify non-enumerable symbols', t => {
	const obj = {
		[Symbol('for enumerable key')]: undefined
	};
	const symbol = Symbol('for non-enumerable key');
	Object.defineProperty(obj, symbol, {enumerable: false});

	t.is(stringifyObject(obj), '{\n\tSymbol(for enumerable key): undefined\n}');
});
