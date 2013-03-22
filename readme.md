# stringify-object [![Build Status](https://secure.travis-ci.org/yeoman/stringify-object.png?branch=master)](http://travis-ci.org/yeoman/stringify-object)

Stringify an object using custom indentation


## Node.js

Install and add to package.json using npm: `npm install --save stringify-object`

```js
var stringifyObject = require('stringify-object');
var pretty = stringifyObject({foo: 'bar'}, {
    indent: '    ',
    singleQuotes: false
});
console.log(pretty);
/*
{
    foo: "bar"
}
*/
```

## Browser

Available on [Bower](https://github.com/twitter/bower): `bower install stringify-object`
 or manually download it.

```html
<script src="stringify-object.js"></script>
```

```js
var pretty = stringifyObject({foo: 'bar'}, {
    indent: '  ',
    singleQuotes: false
});
console.log(pretty);
/*
{
    foo: "bar"
}
*/
```



## Documentation

### stringifyObject(object, [options])

Accepts an object to stringify and optionally a option object. Circular references will be replaced with `null`.

#### Options

##### indent

Type: `String`  
Default: `'\t'`

Choose the indentation you prefer.

##### singleQuotes

Type: `Boolean`  
Default: `true`

Set to false to get double-quoted strings.


## License

[BSD license](http://opensource.org/licenses/bsd-license.php) and copyright Google
