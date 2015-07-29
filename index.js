'use strict';
var isRegexp = require('is-regexp');
var isPlainObj = require('is-plain-obj');

var stringify = module.exports = function (val, opts, pad, seen) {
	opts = opts || {};
	opts.indent = opts.indent || '\t';
	pad = pad || '';
	seen = seen || [];

	var type = stringify.type(val);
	return stringify[type](val, opts, pad, seen);
};

stringify.typeOrder = [
	'null',
	'undefined',
	'boolean',
	'number',
	'function',
	'regex',
	'date',
	'array',
	'object',
	'string'
];

stringify.types = {
	null: function (val) { return val === null; },
	undefined: function (val) { return val === undefined; },
	boolean: function (val) { return typeof val === 'boolean'; },
	number: function (val) { return typeof val === 'number'; },
	function: function (val) { return typeof val === 'function'; },
	regex: isRegexp,
	date: function (val) { return val instanceof Date; },
	array: function (val) { return Array.isArray(val); },
	object: isPlainObj,
	string: function (val) { return typeof val === 'string' || val instanceof String; }
};

stringify.type = function (val) {
	var type;
	for (var i = 0; i < stringify.typeOrder.length; i++) {
		type = stringify.typeOrder[i];
		if (stringify.types[type](val)) {
			return type;
		}
	}
};

var simpleTypes = ['null', 'undefined', 'boolean', 'number', 'function', 'regex'];
simpleTypes.forEach(function (type) {
	stringify[type] = String;
});

stringify.date = function (val) {
	return 'new Date(\'' + val.toISOString() + '\')';
};

stringify.array = function (val, opts, pad, seen) {
	seen = seen || [];

	if (val.length === 0) {
		return '[]';
	}

	return '[\n' + val.map(function (el, i) {
		var eol = val.length - 1 === i ? '\n' : ',\n';
		return pad + opts.indent + stringify(el, opts, pad + opts.indent, seen) + eol;
	}).join('') + pad + ']';
};

stringify.object = function (val, opts, pad, seen) {
	seen = seen || [];

	if (seen.indexOf(val) !== -1) {
		return '"[Circular]"';
	}

	var objKeys = Object.keys(val);

	if (objKeys.length === 0) {
		return '{}';
	}

	var ret = '{\n' + objKeys.map(function (el, i) {
		if (opts.filter && !opts.filter(val, el)) {
			return '';
		}

		var eol = objKeys.length - 1 === i ? '\n' : ',\n';
		var key = /^[a-z$_][a-z$_0-9]*$/i.test(el) ? el : stringify(el, opts);
		return pad + opts.indent + key + ': ' + stringify(val[el], opts, pad + opts.indent, seen.concat([val])) + eol;
	}).join('') + pad + '}';

	return ret;
};

stringify.string = function (val, opts) {
	val = String(val).replace(/[\r\n]/g, function (x) {
		return x === '\n' ? '\\n' : '\\r';
	});

	if (opts.singleQuotes === false) {
		return '"' + val.replace(/"/g, '\\\"') + '"';
	}

	return '\'' + val.replace(/'/g, '\\\'') + '\'';
};
