/* global Buffer */

let fs = require('fs'),
    path = require('path');

module.exports = class Jnclude {
    /**
     * @constructor
     *
     * @returns {Object} Jnclude
     */
   constructor () {
        console.time('Done');
        this._start_cpu = process.cpuUsage();

        this._console = {
            c_black:       '\x1b[30m',
            c_red:         '\x1b[31m',
            c_green:       '\x1b[32m',
            c_yellow:      '\x1b[33m',
            c_blue:        '\x1b[34m',
            c_magenta:     '\x1b[35m',
            c_cyan:        '\x1b[36m',
            c_white:       '\x1b[37m',
            b_black:       '\x1b[40m',
            b_red:         '\x1b[41m',
            b_green:       '\x1b[42m',
            b_yellow:      '\x1b[43m',
            b_blue:        '\x1b[44m',
            b_magenta:     '\x1b[45m',
            b_cyan:        '\x1b[46m',
            b_white:       '\x1b[47m',
            reset:         '\x1b[0m',
            bright:        '\x1b[1m',
            dim:           '\x1b[2m',
            underscore:    '\x1b[4m',
            blink:         '\x1b[5m',
            reverse:       '\x1b[7m',
            hidden:        '\x1b[8m'
        };

        // stack of buffer for constructor
        this._buffer = {};
        // objects stack
        this._buffer.obj = {};
        // files stack
        this._buffer.file = [];
        // included files collection
        this._buffer.include = [];
        // included files counts collection
        this._buffer.inc_count = [];
        // boffer size for createReadStream function
        this._file_buffer_size = 1024;
        // default encoding for createReadStream function
        this._encoding = 'utf8';
   };


    /**
     *
     * @param {Object} params External object with parameters for using class
     *      params.in - source file (required)
     *      params.out - destination file (required)
     *      params.flag - object with flags for builder (required)
     *      params.develop - boolean for deleting debug blocks (optional)
     *      params.offsets - boolean for saving offsets in copy process to
     *                       parent file (optional)
     */
    execute (params) {
        // parsing options
        this._options = {develop: null, offsets: true};
        // source file
        this._source = params.in;
        // target file
        this._dest = params.out;
        // source path
        this._src_dir = path.dirname(this._source);
        // target path
        this._dest_dir = path.dirname(this._dest);
        // flags for constructor
        this._flags = {};

        for (let option in this._options) {
            if (params[option]) {
                this._options[option] = params[option];
            };
        };

        for (let i = params.flag.length; i--; ) {
            this._flags[params.flag[i]] = true;
        };

        if (!fs.existsSync(this._source)) {
            this.showError(201, this._source);
        };

        //target path not given
        if (this._dest_dir === '.') {
            this._dest_dir = this._src_dir;
            this._dest = `${_dest_dir}/${this._dest}`;

            if (fs.existsSync(this._dest)) {
                this.showError(202, this._dest);
            };
        };

        if (fs.existsSync(this._dest)) {
            fs.unlinkSync(this._dest);
        };

        // TODO create options registration
        
        this._buffer.include.push(this._source);
        this._buffer.inc_count.push(1);
        
        this.readFile(this._source);
    };

    /**
     * readFile - reads file block to buffer, analyze it and write to target
     *
     * @param {type} src Source file
     * @param {type} offset Offsets for included files
     * @param {type} callback function for executing after finish
     */
    readFile (src, offset = '', callback = null) {
        let highWaterMark = this._file_buffer_size,
            encoding = this._encoding;

        // init actual file buffer
        this._buffer.obj[src] = {};
        this._buffer.obj[src].a2s = '';
        this._buffer.obj[src].read = 0;
        this._buffer.obj[src].drop = false;
        this._buffer.file.push(src);

        // read file block
        this._buffer.obj[src].stream = fs.createReadStream(src, {encoding, highWaterMark})
        .on('data', (chunk) => {
            let blocks = [],
                count = 0,
                last_block = false,
                eof = false,
                that = this,
                i = 0,
                tick, timer;

            this._buffer.obj[src].read += chunk.length;

            blocks = this.convertChunk(chunk, src);
            count = blocks.length;

            // stop next block reading before analyzing and writing this block
            this._buffer.obj[src].stream.pause();

            if (count) {
                timer = setTimeout (function tick() {
                    if (that._buffer.obj[src].read === fs.statSync(src).size
                            && i === count - 1) {
                        last_block = true;

                        if (src === that._source){
                            eof = true;
                        }
                    };

                    if (i === count ) {
                        that._buffer.obj[src].stream.resume();
                    } else {
                        that.checkDirectives(blocks, i, offset, last_block, eof)
                        .then(result => {
                            // end writing
                            if (result === 'end') {
                                that.showResult();
                            };

                            //included file finish with other inlcude directive
                            if (result === 'next' && last_block) {
                                if (typeof callback === 'function') {
                                    callback();
                                };
                            };

                            // read next block
                            if (result === 'next' && i < count ) {
                                i++;
                            };

                            // readed last block in file
                            if (result === 'done' || result === 'end') {
                                if (typeof callback === 'function') {
                                    callback();
                                };
                            } else {
                                timer = setTimeout(tick, 1);
                            };
                        });
                    };
                }, 10);
            } else {
                this._buffer.obj[src].stream.resume();
            };
        })
        .on('end', () =>  {
            this._buffer.obj[src].stream.destroy();
            //this._buffer.file.pop(src);
        });
    };


    /**
     * convertChunk - get strings array from readed file block
     *
     * @param {string} read_str readed block
     * @param {string} source source file name
     * @returns {Array} file block converting result
     */
    convertChunk (read_str, source) {
        let lines = read_str.replace(/\r/g, '').split('\n'),
            last_index = lines.length - 1;

        if (lines.length === 1) {
            // send to buffer because line end not find
            this._buffer.obj[source].a2s += lines[last_index];
        } else {
            lines[0] = this._buffer.obj[source].a2s + lines[0];
            this._buffer.obj[source].a2s = '';
            this._buffer.obj[source].a2s = lines[last_index];
        };

        if (this._buffer.obj[source].read < fs.statSync(source).size) {
            lines.splice(last_index, 1);
        } else {
            // this last block from createReadStream and we must clear buffer
            lines[last_index] = this._buffer.obj[source].a2s;
            this._buffer.obj[source].a2s = '';
        };

        return lines;
    };


    /**
     * checkDirectives - writing and analyzing blocks if contains directives
     *
     * @param {Array} arr Actual array of strings readed by stream
     * @param {number} index Actual index of array
     * @param {string} prefx Offset from the beginning of line
     * @param {boolean} last Bit for marking block as last reading
     * @param {boolean} eof Bit for marking reseived block as last in dest
     * @returns {Promise} For checking and writing
     */
    checkDirectives (arr, index, prefx = '', last = false, eof = false) {
        let command = /(\s*?)\/\/\>(\/?[a-zA-Z_]+)(\(.*\))? ?(.*)?(\r)?$/,
            parent_break = false;

        return new Promise ( (resolve, reject) => {
            let line = arr[index],
                find = line.match(command),
                offset, com, path, flag,
                include_stack = this._buffer.include,
                count_stack = this._buffer.inc_count,
                file_stack = this._buffer.file,
                file = file_stack[file_stack.length - 1],
                full_offset = prefx,
                position,
                _;

            if (find) {
                offset = find[1];
                com = find[2];
                path = find[3]
                    ? `${this._src_dir}/` + find[3].replace(/[\(\)]/g, '')
                    : null;
                flag = find[4]? find[4] : null;

                full_offset = full_offset + offset;

                if (com === 'include') {
                    if (include_stack.indexOf(path) === -1) {
                        include_stack.push(path);
                    };

                    position = include_stack.indexOf(path);
                    if (count_stack[position]) {
                        count_stack[position]++;
                    } else {
                        count_stack[position] = 1;
                    };

                    parent_break = true;
                    this.readFile(path, full_offset, () => {
                        parent_break = false;
                        resolve('next');
                    });
                };

                if (com === 'include_once') {
                    if (include_stack.indexOf(path) === -1) {
                        include_stack.push(path);

                        position = include_stack.indexOf(path);
                        if (count_stack[position]) {
                            count_stack[position]++;
                        } else {
                            count_stack[position] = 1;
                        };

                        parent_break = true;
                        this.readFile(path, full_offset, () => {
                            parent_break = false;
                            resolve('next');
                        });
                    };
                };

                if (com === 'exclude' && !this._options.develop) {
                    this._buffer.obj[file].drop = true;
                };

                if (com === '/exclude') {
                    this._buffer.obj[file].drop = false;
                };
            };

            // not save directives and exclude content
            if (com !== 'include' && com !== 'include_once'
                        && com !== 'exclude' && com !== '/exclude'
                        && !this._buffer.obj[file].drop ) {
                arr[index] = full_offset + arr[index];

                this.writeBlock(arr[index], last, eof, () => {
                    parent_break = false;
                    if (last) {
                        if (eof) {
                            resolve('end');
                        }
                        resolve('done');
                    };
                });
            };

            if (!parent_break) {
                resolve('next');
            };
        });
    };

    /**
     * writeBlock - write string to destination file
     *
     * @param {string} block String for writing
     * @param {boolean} last_bit Bit for marking reseived block as last in src
     * @param {boolean} eof Bit for marking reseived block as last in dest
     * @param {Function} callback Execution and write last block
     * @returns {undefined}
     */
    writeBlock (block, last_bit = false, eof = false, callback) {
        let encoding = this._encoding;

        if (!eof) {
            block += '\n';
        }

        fs.appendFileSync(this._dest, block, {encoding});

        if (last_bit) {
            callback();
        };
    };

    /**
     * showResult - show end result information
     */
    showResult() {
        let inc_result = '';
        for(let i = 0, count = this._buffer.include.length; i < count; i++) {
            inc_result += `\t${this._buffer.include[i]} - ${this._buffer.inc_count[i]} times\n`;
        };

        console.log(`${this._console.c_green}Jclude ready!${this._console.reset}`);
        console.timeEnd('Done');
        console.log('CPU usage: ', process.cpuUsage(this._start_cpu));
        console.log('Memory usage: \n', process.memoryUsage());
        console.log('Loaded files:');
        console.log(inc_result);
    };


    /**
     * showError - send to console error information
     *
     * @param {number} key Error number ID
     * @param {string} addon Additional information for showing
     * @returns {undefined}
     */
    showError (key, addon = '') {
        let error_list = [];

        //syntax
        error_list[101] = 'Parameters define error\n' + `Use ${this._console.c_cyan}jnclude -help${this._console.reset} for more information`;
        error_list[102] = 'Not source or destination\n' + `Use ${this._console.c_cyan}jnclude -help${this._console.reset} for more information`;

        //fs
        error_list[201] = 'Can not read source';
        error_list[201] = 'Destination file already exists in sourse path. Rename destination file or select other path';

        console.log(`${this._console.c_red}ERROR ${key}${this._console.reset}:`, error_list[key], addon);
        process.exit(0);
    };


    /**
     * showHelp - show help in console
     *
     * jnclude -help
     */
    showHelp () {
        console.log(`
${this._console.c_green}Usage${this._console.reset}: jnclude -in=<file name> -out=<file name>[ [-option1] ... ]

Options:
-in=<file name>         Set main source file.
-out=<file name>        Destination file name.
-help                   Show this help.
-develop                Delete debug code between /*>*/ and /*<*/
-flag=<flags>           Flags for file merging. Sets flags for conditions
                        checking in concatenation process.


Syntax:
// #include(file.js)        Replaces this block on given file content with
                            offset from line begining.
// #include_once(file.js)   Replaces this block on given file content with
                            offset from line begining. Checks previous
                            include and return error if file already used.
/*>*/ [code] /*<*/          Marks this [code] as debug and if given nodebug
                            flag, exclude it from destination file.
        `);
        process.exit(0);
    };
};