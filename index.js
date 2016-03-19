'use strict';
var isRegexp = require('is-regexp');
var isPlainObj = require('is-plain-obj');

module.exports = function (val, opts, pad) {
	var seen = [];

	return (function stringify(val, opts, pad) {
		opts = opts || {};
		opts.indent = opts.indent || '\t';
		pad = pad || '';
		var tokens;
		if(opts.inlineCharacterLimit == void 0) {
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
			}
		}
		var expandWhiteSpace = function(string) {
			if (opts.inlineCharacterLimit == void 0) { return string; }
			var oneLined = string.
				replace(new RegExp(tokens.newLine, 'g'), '').
				replace(new RegExp(tokens.newLineOrSpace, 'g'), ' ').
				replace(new RegExp(tokens.pad + '|' + tokens.indent, 'g'), '');

			if(oneLined.length <= opts.inlineCharacterLimit) {
				return oneLined;
			} else {
				return string.
					replace(new RegExp(tokens.newLine + '|' + tokens.newLineOrSpace, 'g'), '\n').
					replace(new RegExp(tokens.pad, 'g'), pad).
					replace(new RegExp(tokens.indent, 'g'), pad + opts.indent);
			}
		};

		if (seen.indexOf(val) !== -1) {
			return '"[Circular]"';
		}

		if (val === null ||
			val === undefined ||
			typeof val === 'number' ||
			typeof val === 'boolean' ||
			typeof val === 'function' ||
			isRegexp(val)) {
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
				return tokens.indent + stringify(el, opts, pad + opts.indent) + eol;
			}).join('') + tokens.pad + ']';

			seen.pop(val);

			return expandWhiteSpace(ret);
		}

		if (isPlainObj(val)) {
			var objKeys = Object.keys(val);

			if (objKeys.length === 0) {
				return '{}';
			}

			seen.push(val);

			var ret = '{' + tokens.newLine + objKeys.map(function (el, i) {
				if (opts.filter && !opts.filter(val, el)) {
					return '';
				}

				var eol = objKeys.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
				var key = /^[a-z$_][a-z$_0-9]*$/i.test(el) ? el : stringify(el, opts);
				return tokens.indent + key + ': ' + stringify(val[el], opts, pad + opts.indent) + eol;
			}).join('') + tokens.pad + '}';

			seen.pop(val);

			return expandWhiteSpace(ret);
		}

		val = String(val).replace(/[\r\n]/g, function (x) {
			return x === '\n' ? '\\n' : '\\r';
		});

		if (opts.singleQuotes === false) {
			return '"' + val.replace(/"/g, '\\\"') + '"';
		}

		return '\'' + val.replace(/'/g, '\\\'') + '\'';
	})(val, opts, pad);
};
