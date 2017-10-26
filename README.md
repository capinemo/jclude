# jnclude

[Документация на русском](https://github.com/capinemo/jnclude/blob/master/README_ru.md) 

_**Jnclude**_ builds the application file from a several source files and cuts a sections of the code what don't used in application production version. Using flags allow to create application files with different logic or leave special debug code for testing certain algorithm.

## Getting started
1. Install [node.js](https://nodejs.org/en/) 
2. Run command:
```
npm install jnclude -g
```
3. For get help of using _**jnclude**_ run:
```
jnclude -h
```
4. To run _**jnclude**_, you can use the following command:
```
jnclude -in=path/source.js -out=path/destination.js [options]
```

## Console Options
`-in` - Main source file name.

`-out` - Destination file name. If path of destination not specified, file creates in the source folder. But if source path contain file with specified name, _**jnclude**_ returns error.

`-flag="flag_1 [other_flags]"` - Activate including or excluding for blocks marked with flags. If the flags option is given, directives without flag or other flags **don't work**.

`-develop` - If develop option is given all exclude directives don't work

`-fullinfo` - Shows detail information after building:
```
Jnclude done!
Done: 449.801ms
CPU usage:  { user: 15000, system: 0 }
Memory usage:
 { rss: 20500480,
  heapTotal: 8421376,
  heapUsed: 3805416,
  external: 8380 }
Loaded files:
    src/core.js - 1 times
    src/source.js - 1 times
```
without `-fullinfo`
```
Jnclude done!
Loaded files:
    src/core.js - 1 times
    src/source.js - 1 times
```

## Directives
1. **include** - copy the given file content and put it instead directive **with offsets from line begin**
```js
    //>include(002.js) dev pro
____|_________|______| _______
 1        2      3        4
```
**where:** 1 - offset, 2 - command, 3 - source file name, 4 - flags


2. **include_once** - checks that this file not used by _**jnclude**_ earlier and copy the given file content and put it instead directive
```js
    //>include_once(002.js) dev
```

3. **exclude** - remove code beetween `exclude` and `/exclude` if not given `-develop` option
```js
    //>exclude pro
        alert(error);
    //>/exclude
```

## Run example
```
jnclude -in=src/main.js -out=build/result.js
jnclude -in=src/main.js -out=build/result.js -develop -flag="dev_1 dev_2 pro"
jnclude -in=src/main.js -out=build/result.js -flag="pro" -fullinfo
```

## Examples
_sample/main.js_
```js
console.log(1);
//>include(add.js) dev
    //>exclude pro
        console.log(4);
    //>/exclude
//>include_once(add.js) dev pro
```

_sample/add.js_
```js
console.log(2);
//>include_once(appendix.js) dev
```

_sample/appendix.js_
```js
    console.log(3);
```

run `jnclude -in=sample/main.js -out=sample/result.js`

_sample/result.js_
```js
console.log(1);
console.log(2);
    console.log(3);   

```

run `jnclude -in=sample/main.js -out=sample/result.js -develop`

_sample/result.js_
```js
console.log(1);
console.log(2);
    console.log(3);
        console.log(4);

```

run `jnclude -in=sample/main.js -out=sample/result.js -flag="dev"`

_sample/result.js_
```js
console.log(1);
console.log(2);
    console.log(3);
        console.log(4);

```

run `jnclude -in=sample/main.js -out=sample/result.js -flag="pro"`

_sample/result.js_
```js
console.log(1);
console.log(2);

```
