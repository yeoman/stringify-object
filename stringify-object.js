/*global window */
(function () {
	'use strict';

	function isObject(val) {
		return val === Object(val);
	}

	function isEmpty(val) {
		if (val === undefined || val === null) {
			return true;
		}

		if (Array.isArray(val) || typeof val === 'string') {
			return val.length === 0;
		}

		for (var key in val) {
			if (Object.prototype.hasOwnProperty.call(val, key)) {
				return false;
			}
		}

		return true;
	}

	function stringifyObject (val, opts, pad) {
		var objKeys;
		opts = opts || {};
		opts.indent = opts.indent || '\t';
		opts.quote = opts.singleQuotes === false ? '"' : '\'';
		pad = pad || '';

		if (Array.isArray(val)) {
			if (isEmpty(val)) {
				return '[]';
			}

			return '[\n' + val.map(function (el, i) {
				var eol = val.length - 1 === i ? '\n' : ',\n';
				return pad + opts.indent + stringifyObject(el, opts, pad + opts.indent) + eol;
			}).join('') + pad + ']';
		}

		if (isObject(val)) {
			if (isEmpty(val)) {
				return '{}';
			}

			objKeys = Object.keys(val);

			return '{\n' + objKeys.map(function (el, i) {
				var eol = objKeys.length - 1 === i ? '\n' : ',\n';
				// quote key if the first character is not `a-z` or
				// the rest contains something other than `a-z0-9_`
				// TODO: Find out why this don't work: `/^[^a-z_\$]|\W+/ig`
				var key = /^[^a-z_]|\W+/ig.test(el) && el[0] !== '$' ? stringifyObject(el, opts) : el;
				return pad + opts.indent + key + ': ' + stringifyObject(val[el], opts, pad + opts.indent) + eol;
			}).join('') + pad + '}';
		}

		return opts.quote + val.replace(
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
