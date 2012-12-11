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

	function stringifyObject(obj, indent, pad) {
		var objKeys;

		indent = indent || '\t';
		pad = pad || '';

		if (Array.isArray(obj)) {
			if (isEmpty(obj)) {
				return '[]';
			}

			return '[\n' + obj.map(function (el, i) {
				var eol = obj.length - 1 === i ? '\n' : ',\n';
				return pad + indent + stringifyObject(el, indent, pad + indent) + eol;
			}).join('') + pad + ']';
		}

		if (isObject(obj)) {
			if (isEmpty(obj)) {
				return '{}';
			}

			objKeys = Object.keys(obj);

			return '{\n' + objKeys.map(function (el, i) {
				var eol = objKeys.length - 1 === i ? '\n' : ',\n';
				return pad + indent + el + ': ' + stringifyObject(obj[el], indent, pad + indent) + eol;
			}).join('') + pad + '}';
		}

		return '\'' + obj + '\'';
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = stringifyObject;
	} else {
		window.stringifyObject = stringifyObject;
	}
})();
