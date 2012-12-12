/*global window */
(function() {
	'use strict';

	function isObject(obj) {
		return obj === Object(obj);
	}

	function isEmpty(obj) {
		if (obj === null || obj === undefined) {
			return true;
		}

		if (Array.isArray(obj) || typeof obj === 'string') {
			return obj.length === 0;
		}

		for (var key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				return false;
			}
		}

		return true;
	}

	function stringifyObject(obj, opts, pad) {
		var objKeys;
		opts = opts || {};
		opts.indent = opts.indent || '\t';
		opts.quote = opts.singleQuotes === false ? '"' : '\'';
		pad = pad || '';

		if (Array.isArray(obj)) {
			if (isEmpty(obj)) {
				return '[]';
			}

			return '[\n' + obj.map(function (el, i) {
				var eol = obj.length - 1 === i ? '\n' : ',\n';
				return pad + opts.indent + stringifyObject(el, opts, pad + opts.indent) + eol;
			}).join('') + pad + ']';
		}

		if (isObject(obj)) {
			if (isEmpty(obj)) {
				return '{}';
			}

			objKeys = Object.keys(obj);

			return '{\n' + objKeys.map(function (el, i) {
				var eol = objKeys.length - 1 === i ? '\n' : ',\n';
				// quote key if the first character is not `a-z` or
				// the rest contains something other than `a-z0-9_`
				var key = /^[^a-z]|\W+/ig.test(el) ? stringifyObject(el, opts) : el;
				return pad + opts.indent + key + ': ' + stringifyObject(obj[el], opts, pad + opts.indent) + eol;
			}).join('') + pad + '}';
		}

		return opts.quote + obj.replace(
			opts.singleQuotes ? /'/g : /"/g,
			opts.singleQuotes ? '\\\"' : '\\\''
		) + opts.quote;
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = stringifyObject;
	} else {
		window.stringifyObject = stringifyObject;
	}
})();
