let lib = require('../lib/jnclude'),
    fs = require('fs'),
    assert = require('assert'),
    Jnclude = new lib(),

    result_file = 'result.js',
    sample_file = 'sample.js',
    source_file = '001.js';

describe('Jnclude', () => {
    function done (blank, result) {
        assert.equal(blank, blank);
    }

    describe('Include-01', () => {
        it('Files "sample" and "result" must be the same', (done) => {
            let test_path = './test/include_01',
                rfile = `${test_path}/${result_file}`,
                bfile = `${test_path}/${sample_file}`,
                sfile = `${test_path}/${source_file}`;

            Jnclude.execute({
                flag: null,
                in: sfile,
                out: rfile,
                callback: () => {
                    let blank = fs.readFileSync(bfile, 'utf8'),
                        result = fs.readFileSync(rfile, 'utf8');
                    done(assert.equal(blank, result));
                }
            });
        });
    });
});