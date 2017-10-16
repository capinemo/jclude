let fs = require('fs'),
    path = require('path');

module.exports = class Analyzer {

    /**
     * 
     *
     * @param {string} source_file Main source file name
     * @param {string} target_file Target file name
     * @param {Object} options Build options (nodebug, offsets)
     * @param {Array} flags Constructor flags for include, exclude directives
     * @returns {nm$_Analyzer.Analyzer}
     */
    constructor (source_file, target_file, options, flags) {
        this._options = {nodebug: null, offsets: true};
        this._flags = {};
        //this._commands = {};
        //this._errors = [];
        this._buffer = '';
        this._source = source_file;
        this._destination = target_file;
        this._src_dir = path.dirname(source_file);
        this._destination;

        for (let option in this._options) {
            if (options[option]) {
                this._options[option] = options[option];
            };
        };

        for (let i = flags.length; i--; ) {
            this._flags[flags[i]] = true;
        };

        if (fs.existsSync(target_file)) {
            fs.unlinkSync(target_file);
        };

        //this._src_size = fs.statSync(source).size;
    };



    startProcess () {
        return new Promise ( (resolve, reject) => {
            this.readSourceFile(this._source, true)
                .then( result => {
                    resolve(result);
                });
        });


    };

    readSourceFile (source, main_file = false) {
        let encoding = 'utf8',
            highWaterMark = 20;

        return new Promise ( (resolve, reject) => {
            let read = fs.createReadStream(source, {encoding, highWaterMark})
                .on('data', (chunk) => {
                    this.analyzeString(chunk);
                    //console.log(chunk);
                })
                .on('end', () =>  {
                    read.destroy();
                    resolve('END');
                });
        });
    };

    analyzeString(write_str) {
        let encoding = 'utf8',
            get_size = 0;

        function createPromise (string) {
            return new Promise ( (resolve, reject) => {
                get_size += string.length;
                resolve(string);
            });
        };

        createPromise(write_str)
            .then(result => {
                // str to array
                let lines = result.split('\n'),
                    drop_index = lines.length - 1;

                if (lines.length === 1) {
                    this._buffer += lines[drop_index];
                } else {
                    lines[0] = this._buffer + lines[0];
                    this._buffer = '';
                    this._buffer = lines[drop_index];
                };

                if (get_size !== this._src_size) {
                    lines.splice(drop_index, 1);
                };
                return lines;
            })
            .then(result => {
                // analyze array
                let command = /(\s*?)\/\/\>(\/?[a-zA-Z]+)(\(.*\))? ?(.*)?$/;
                let drop_lines = [];

                for (let i = 0, count = result.length, line; i < count; i++) {
                    let line = result[i],
                        find = line.match(command),
                        offset, com, path, flag;

                    if (!find) {
                        continue;
                    };

                    offset = find[1];
                    com = find[2];
                    path = find[3]
                        ? `${this._src_dir}/` + find[3].replace(/[\(\)]/g, '')
                        : null;
                    flag = find[4]? find[4] : null;

                    if (com === 'include' || com === 'include_once'
                            || com === 'exclude' || com === '/exclude') {
                        drop_lines.push(i);
                    };
                };

                for (let i = drop_lines.length; i--; ) {
                    result.splice(drop_lines[i], 1);
                };

                return result;
            })
            .then(result => {
                // write to destination
                for (let i = 0, count = result.length, line; i < count; i++) {
                    line = result[i];

                    if (get_size === this._src_size) {
                        if (i !== count -1) {
                            line += '\n';
                        };
                    } else {
                        line += '\n';
                    };

                    fs.appendFileSync(this._destination, line, {encoding});
                };

                resolve('WRITE');
            })
            .catch(error => {

            });
    };
};