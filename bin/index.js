#!/usr/bin/env node
/* global process */

let JCL = {},
    Jclude;

JCL.module = require('../libs/Jclude');
JCL.args = {};
JCL.error = {};
Jclude = new JCL.module();

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
            JCL.args[name] = value;
        } else {
            JCL.args[option] = true;
        }
    } else {
        Jclude.showError(101);
    };

    if (JCL.args['flag']) {
        JCL.args['flag'] = JCL.args['flag'].split(' ');
    };
});

if (JCL.args['help']) {
    Jclude.showHelp();
};

if (!JCL.args['in'] || !JCL.args['out']) {
    Jclude.showError(102);
};

Jclude.execute(JCL.args);
