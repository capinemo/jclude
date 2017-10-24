let lib = require('../lib/jnclude'),
    fs = require('fs'),
    assert = require('assert'),
    Jnclude = new lib(),

    result_file = 'result.js',
    sample_file = 'sample.js',
    source_file = '001.js',
    params = {};

    params['include_01'] = {
        name: 'Include-01',
        descript: 'Without options and flags',
        task: {flag: null}
    };
    params['include_02'] = {
        name: 'Include-02',
        descript: 'With flags',
        task: {flag: ['pro', 'nod']}
    };
    params['include_03'] = {
        name: 'Include-03',
        descript: 'With flags and develop option',
        task: {flag: ['pro', 'nod'], develop: true}
    };
    params['include_04'] = {
        name: 'Include-04',
        descript: 'With multiflags',
        task: {flag: ['pro1', 'pro2', 'nod']}
    };


describe('Jnclude tests', () => {
    for (let task in params) {
        if (params.hasOwnProperty(task)) {
            createTest(task);
        };
    };
});

function createTest (task) {
    describe(params[task].name, () => {
        it(params[task].descript, (done) => {
            runTask(task).then (result => {
                let test_path = `./test/${task}`,
                rfile = `${test_path}/${result_file}`,
                bfile = `${test_path}/${sample_file}`;

                if (result) {
                    let blank = fs.readFileSync(bfile, 'utf8'),
                        out = fs.readFileSync(rfile, 'utf8');

                        blank = blank.replace(/\r\n/g, '\n');

                    done(assert.equal(blank, out));
                };
            }).catch(error => {
                console.log(error);
            });
        });
    });
};

function runTask (task) {
    return new Promise( (resolve, reject) => {
        let task_params = params[task].task,
            test_path = `./test/${task}`;

        task_params.in = `${test_path}/${source_file}`;
        task_params.out = `${test_path}/${result_file}`;
        task_params.callback = function () {
            resolve(true);
        };

        Jnclude.execute(task_params);
    });
};