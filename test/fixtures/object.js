{
  foo: "bar 'bar'",
  foo2: [
    "foo",
    "bar",
    {
      foo: "bar 'bar'"
    }
  ],
  "foo-foo": "bar",
  "2foo": "bar",
  "@#": "bar",
  $el: "bar",
  _private: "bar",
  number: 1,
  boolean: true,
  date: new Date('2014-01-29T22:41:05.665Z'),
  escapedString: "\"\"",
  null: null,
  undefined: undefined,
  function: function () {},
  regexp: /./,
  NaN: NaN,
  Infinity: Infinity,
  newlines: "foo\nbar\r\nbaz",
  circular: "[Circular]",
  Symbol(): Symbol(),
  Symbol(foo): Symbol(foo),
  Symbol(foo): Symbol(foo)
}
