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















Jnclude = function(args) {
    let _src_dir,
        _dest_dir,
        _dest_file,
        _options = {},
        _error = {},
        _buffer = '',
        _buffer_size = 60,
        _encoding = 'utf8',
        _presets = {},
        _;

    _presets.include = /(\s*?)\/\/ #include\(([\S\s]+?)\)/;
    _presets.include_once = /(\s*?)\/\/ #include_once\(([\S\s]+?)\)/;

    _error.read_source = '\n\ERROR: Can not open source file.';
    _error.rewrite_dest = '\n\ERROR: Destination file exists in sourse path!\n\
Rename destination file or select other path to save.';
    _error.create_dest = '\n\ERROR: Can not create destination file.';
    //_error.copy_error = '\n\ERROR: In copy time error.';



    _analyzeContext = function (block, dest) {
        let include = /(\s*?)\/\/ #include\(([\S\s]+?)\)/,
            include_once = /(\s*?)\/\/ #include_once\(([\S\s]+?)\)/,
            start_clear = /-/,
            stop_clear = /-/,
            lines = [],
            drop_index,
            find,
            _;

        if (block !== null) {
            lines = block.split('\n');
            drop_index = lines.length - 1;

            if (lines.length === 1) {
                _buffer += lines[drop_index];
            } else {
                lines[0] = _buffer + lines[0];
                _buffer = '';
                _buffer = lines[drop_index];
            };

            lines.splice(drop_index, 1);
        } else {
            lines.push(_buffer);
            _buffer = '';
        };

        for (let i = 0, count = lines.length; i < count; i++) {
            find = lines[i].match(include);
            if (find) {
                let new_file = `${_src_dir}/${find[2]}`,
                    offset_line = `${find[1]}`;

                _copyContext(new_file, args.out);
            };
        };

        _writeContext(lines, dest);
    };

    _writeContext = function (line_arr, dest) {
        let encoding = _encoding;

        for (let i = 0, count = line_arr.length; i < count; i++) {
            let line = line_arr[i] + '\n';
            fs.appendFileSync(dest, line, {encoding});
        };
    };

    _copyContext = function (src, dest) {
        let _src_size = fs.statSync(src).size,
            start = 0,
            end = start + _buffer_size - 1,
            autoClose = true,
            encoding = 'utf8',
            highWaterMark = _buffer_size,
            block = '',
            list = [],
            _;

            if (fs.existsSync(dest)) {
                fs.unlinkSync(dest);
            }

            fs.createReadStream(src, {encoding, highWaterMark})
                .on('readable', function() {
                    this.on('data',function(chunk) {
                        _analyzeContext(chunk, dest);

                        this.start = this.end + 1;
                        this.end = this.start + _buffer_size - 1;
                    });
                })

                .on('end',function() {
                    _analyzeContext(null, dest);

                    this.destroy();
                });
    };


    //TODO parcer in another module


    function _parseBuffer(line) {
        let include = /\n( *?)\/\/ #include\(([\S\s]+?)\)/,
            find;

        find = line.match(include);
        //console.log(find);

        if (find) {
            let new_file = `${_src_dir}/${find[2]}`,
                offset_line = `${find[1]}`;
                //console.log(offset_line, new_file);
            //_copyContext(new_file, args.out);
        };

        return line;
    }

    function _readSourceFile(source) {
        let _src_size = fs.statSync(source).size,
            encoding = _encoding,
            highWaterMark = _buffer_size,
            _;

        if (fs.existsSync(_dest_file)) {
            fs.unlinkSync(_dest_file);
        };

        return new Promise((resolve, reject) => {
            fs.createReadStream(source, {encoding, highWaterMark})
                .on('readable', function() {
                    this.on('data',function(chunk) {
                        chunk = _parseBuffer(chunk);

                        //console.log(chunk);

                        this.start = this.end + 1;
                        this.end = this.start + _buffer_size - 1;
                    });
                })

                .on('end',function() {
                    //resolve();
                    this.destroy();
                });
        });
    }

    return new Promise((resolve, reject) => {
        let analyzer,
            object = {
                a: '111',
                b: '2c2',
                c: '333',
                _: 'cab'
            }; //must be 33311123332

        if (!fs.existsSync(args.in)) {
            reject(_error.read_source);
        };

        _src_dir = path.dirname(args.in);
        _dest_dir = path.dirname(args.out);

        if (_dest_dir === '.') {
            _dest_dir = _src_dir;
            args.out = `${_dest_dir}/${args.out}`;

            if (fs.existsSync(args.out)) {
                reject(_error.rewrite_dest);
            };
        };

        _dest_file = args.out;

        // TODO create options registration
        if (args.nodebug) _options.nodebug = true;

        analyzer = new Analyzer(args.in, args.out, _options, []);

        analyzer.startProcess().then(result => {
            resolve(result);
        }).catch(() => {
            reject('ERROR');
        });

        //_copyContext(args.in, args.out);
    });
};

module.exports = Jnclude;