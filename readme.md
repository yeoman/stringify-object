# stringify-object [![Build Status](https://secure.travis-ci.org/yeoman/stringify-object.png?branch=master)](http://travis-ci.org/yeoman/stringify-object)

Stringify an object using a custom indentation


## Node.js

Install and add to package.json using NPM: `npm install --save stringify-object`

```js
var stringifyObject = require('stringify-object');
var pretty = stringifyObject({foo: 'bar'}, '  ');
console.log(pretty);
/*
{
  foo: 'bar'
}
*/
```

## Browser

Available on [Bower](https://github.com/twitter/bower): `bower install stringify-object`
 or manually download it.

```html
<script src="object-stringify.js"></script>
```

```js
var pretty = stringifyObject({foo: 'bar'}, '  ');
console.log(pretty);
/*
{
  foo: 'bar'
}
*/
```



## Documentation

### stringifyObject(obj, [indentation])

Accepts a plain object and stringifies it with a custom indentation (default tab).


## License

[BSD license](http://opensource.org/licenses/bsd-license.php) and copyright Google
