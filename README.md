# jnclude


## Console Options
*-in* - Main source file name.

*-out* - Destination file name. If PATH of destination not specified, file create in source PATH. But if source PATH contain file with specified name, *_jnclude_* returns error.

*-flags* - Activate including for blocks marked with flags. But of option 'flags' not given include all files.

*-nodebug* - Drop debug and testing blocks written between /\*>\*/ and /\*<\*/.


## Console samples
Reading src/main.js and generating build/result.js with rewriting and **with offsets from line begin**.
```
jnclude -in="src/main.js" -out="build/result.js"
```


Reading src/main.js and generating src/result.js with file creation. If file src/result.j exists, return error.
```
jnclude -in="src/main.js" -out="result.js"
```


Reading src/main.js and generating build/result.js with rewriting, deleting code between /\*>\*/ and /\*<\*/, and including files with flags 'logic_1' and 'logic_2'.
```
jnclude -in="src/main.js" -out="build/result.js" -nodebug -flags="logic_1 logic_2"
```


## Jnclude syntax
```
    /*include(vars.js)*/
```
```
    /*include_once(vars.js)*/
```
```
    /*include(vars.js) logic_1 logic_3*/
```
```
    /*>*/
    debug_code();
    /*<*/
```
## Examples

**include**

main.js
```
fuction Test () {
    /*include(vars.js)*/
/*include(objects.js)*/

    if (appendix) return true;

    return false;
};
```

vars.js
```
let appendix = true;
```

objects.js
```
let my_object = {go: 1};
```


result.js
```
fuction Test () {
    let appendix = true;
let my_object = {go: 1};

    if (appendix) return true;

    return false;
};
```
