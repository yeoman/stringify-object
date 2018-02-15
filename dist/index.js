'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isRegexp = require('is-regexp');
var isObj = require('is-obj');
var getOwnEnumPropSymbols = require('get-own-enumerable-property-symbols').default;

module.exports = function (val, opts, pad) {
	var seen = [];

	return function stringify(val, opts, pad) {
		opts = opts || {};
		opts.indent = opts.indent || '\t';
		pad = pad || '';

		var tokens = void 0;

		if (opts.inlineCharacterLimit === undefined) {
			tokens = {
				newLine: '\n',
				newLineOrSpace: '\n',
				pad: pad,
				indent: pad + opts.indent
			};
		} else {
			tokens = {
				newLine: '@@__STRINGIFY_OBJECT_NEW_LINE__@@',
				newLineOrSpace: '@@__STRINGIFY_OBJECT_NEW_LINE_OR_SPACE__@@',
				pad: '@@__STRINGIFY_OBJECT_PAD__@@',
				indent: '@@__STRINGIFY_OBJECT_INDENT__@@'
			};
		}

		var expandWhiteSpace = function expandWhiteSpace(string) {
			if (opts.inlineCharacterLimit === undefined) {
				return string;
			}

			var oneLined = string.replace(new RegExp(tokens.newLine, 'g'), '').replace(new RegExp(tokens.newLineOrSpace, 'g'), ' ').replace(new RegExp(tokens.pad + '|' + tokens.indent, 'g'), '');

			if (oneLined.length <= opts.inlineCharacterLimit) {
				return oneLined;
			}

			return string.replace(new RegExp(tokens.newLine + '|' + tokens.newLineOrSpace, 'g'), '\n').replace(new RegExp(tokens.pad, 'g'), pad).replace(new RegExp(tokens.indent, 'g'), pad + opts.indent);
		};

		if (seen.indexOf(val) !== -1) {
			return '"[Circular]"';
		}

		if (val === null || val === undefined || typeof val === 'number' || typeof val === 'boolean' || typeof val === 'function' || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'symbol' || isRegexp(val)) {
			return String(val);
		}

		if (val instanceof Date) {
			return 'new Date(\'' + val.toISOString() + '\')';
		}

		if (Array.isArray(val)) {
			if (val.length === 0) {
				return '[]';
			}

			seen.push(val);

			var ret = '[' + tokens.newLine + val.map(function (el, i) {
				var eol = val.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
				var value = stringify(el, opts, pad + opts.indent);
				if (opts.transform) {
					value = opts.transform(val, i, value);
				}
				return tokens.indent + value + eol;
			}).join('') + tokens.pad + ']';

			seen.pop(val);

			return expandWhiteSpace(ret);
		}

		if (isObj(val)) {
			var objKeys = Object.keys(val).concat(getOwnEnumPropSymbols(val));

			if (opts.filter) {
				objKeys = objKeys.filter(function (el) {
					return opts.filter(val, el);
				});
			}

			if (objKeys.length === 0) {
				return '{}';
			}

			seen.push(val);

			var _ret = '{' + tokens.newLine + objKeys.map(function (el, i) {
				var eol = objKeys.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
				var isSymbol = (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'symbol';
				var isClassic = !isSymbol && /^[a-z$_][a-z$_0-9]*$/i.test(el);
				var key = isSymbol || isClassic ? el : stringify(el, opts);
				var value = stringify(val[el], opts, pad + opts.indent);
				if (opts.transform) {
					value = opts.transform(val, el, value);
				}
				return tokens.indent + String(key) + ': ' + value + eol;
			}).join('') + tokens.pad + '}';

			seen.pop(val);

			return expandWhiteSpace(_ret);
		}

		val = String(val).replace(/[\r\n]/g, function (x) {
			return x === '\n' ? '\\n' : '\\r';
		});

		if (opts.singleQuotes === false) {
			val = val.replace(/"/g, '\\"');
			return '"' + val + '"';
		}

		val = val.replace(/\\?'/g, '\\\'');
		return '\'' + val + '\'';
	}(val, opts, pad);
};
