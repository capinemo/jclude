/* global error */

let fs = require('fs'),
    path = require('path');

Jnclude = function(args) {
    let _src_dir,
        _dest_dir,
        _options = {},
        _error = {},
        _buffer = '',
        _buffer_size = 100,
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

    _copyContext = async function (src, dest) {
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


    return new Promise((resolve, reject) => {
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
        
        // TODO create registration
        if (args.nodebug) _options.nodebug = true;


        _copyContext(args.in, args.out);
    });
};

module.exports = Jnclude;