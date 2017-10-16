#!/usr/bin/env node
/* global process */

let fs = require('fs'),
    jnclude = require('../libs/Jclude'),
    args = {},
    help = '',
    error = {},
    output;

error.exec = '\n\
\x1b[31mERROR\x1b[0m: Bad parameters.\n\
Usage: jnclude -in=<file name> -out=<file name> \
[ [-option1] [-option2] ... ]\n\
Help: jnclude -help\n\
';

help = '\n\
\x1b[32mUsage\x1b[0m: jnclude -in=<file name> -out=<file name> \
[ [-option1] ... ]\n\n\
Options:\n\
-in=<file name>         Set main source file.\n\
-out=<file name>        Destination file name.\n\
-help                   Show this help.\n\
-nodebug                Delete debug code between /*>*/ and /*<*/\n\
-flag=<flags>           Flags for file merging. Sets flags for conditions\n\
                        checking in concatenation process.\n\n\
Syntax:\n\
// #include(file.js)        Replaces this block on given file content with\n\
                            offset from line begining.\n\
// #include_once(file.js)   Replaces this block on given file content with\n\
                            offset from line begining. Checks previous \n\
                            include and return error if file already used.\n\
/*>*/ [code] /*<*/          Marks this [code] as debug and if given nodebug\n\
                            flag, exclude it from destination file.\n\
';

process.argv.slice(2).forEach((arg) => {
    let arg_check = /^-/;

    if (arg_check.test(arg)) {
        let option = arg.substr(1),
            pos,
            size = option.length;
            
        if (option.indexOf('=') !== -1) {
            let name,
                value;

            pos = option.match(/=/i);
            name = option.substr(0, pos.index);
            value = option.substr(pos.index + 1, size);
            args[name] = value;
        } else {
            args[option] = true;
        }
    } else {
        console.log(error.exec);
        process.exit(0);
    };

    if (args['flag']) {
        args['flag'] = args['flag'].split(' ');
    };
});

if (args['help']) {
    console.log(help);
    process.exit(0);
};

if (!args['in'] && !args['out']) {
    console.log(error.exec);
    process.exit(0);
};

jnclude(args).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
    process.exit(0);
});





