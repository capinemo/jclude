/* global Buffer */

let fs = require('fs'),
    path = require('path');

module.exports = class Jnclude {

   constructor () {
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
        
        this._ar2str_buffer = {};
        this.stream_collection = {};
        this._file_buffer_size = 10;
        this._encoding = 'utf8';
   };


    /**
     *
     * @param {Object} params External object with parameters for using class
     *      params.in - source file (required)
     *      params.out - destination file (required)
     *      params.flag - object with flags for builder (required)
     *      params.nodebug - boolean for deleting debug blocks (optional)
     *      params.offsets - boolean for saving offsets in copy process to
     *                       parent file (optional)
     *
     * @returns {nm$_Jclude.Jnclude}
     */
    execute (params) {
        this._write_fd == null;
        this._options = {nodebug: null, offsets: true};
        this._source = params.in;
        this._dest = params.out;
        this._src_dir = path.dirname(this._source);
        this._dest_dir = path.dirname(this._dest);
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

        if (this._dest_dir === '.') {
            this._dest_dir = this._src_dir;
            this._dest = `${_dest_dir}/${args.out}`;

            if (fs.existsSync(this._dest)) {
                this.showError(202, this._dest);
            };
        };

        if (fs.existsSync(this._dest)) {
            fs.unlinkSync(this._dest);
        };

        // TODO create options registration

        this.readFile(this._source);
    };

    /**
     *
     * @param {type} source
     * @returns {undefined}
     */
    readFile (source, callback = null) {
        let highWaterMark = this._file_buffer_size,
            encoding = this._encoding,
            blocks;

        this._ar2str_buffer[source] = '';

        this.stream_collection[source] = fs.createReadStream(source, {encoding, highWaterMark})
            .on('data', (chunk) => {
                //
                        //console.log('!!!!!!!!!', result);
                        /*if (result === 'next') {
                            this.stream_collection[source].resume();
                        };*/

                this.stream_collection[source].pause();

                blocks = this.analyzeChunk(chunk, source);
                //console.log(blocks);

                let tick;
                let that = this;
                let count = blocks.length;
                let last_block = false;
                let i = 0;


                if (count) {
                    let timer = setTimeout (function tick() {
                        if (chunk.length !== that._file_buffer_size
                                && i === count - 1) {
                            last_block = true;
                        };

                        if (i === count ) {
                            that.stream_collection[source].resume();
                        } else {
                            that.checkirectives(blocks, i, last_block).then(result => {
                                console.log(result);

                                //console.log(result,  i, count);

                                if (result === 'next' && i < count ) {
                                    i++;
                                    timer = setTimeout(tick,10);
                                };


                                if (result !== 'next' && result !== 'done') {
                                    timer = setTimeout(tick,10);
                                }

                                if (result === 'done') {
                                    if (typeof callback === 'function') callback();
                                }
                            });
                        }


                        /*i++;
                        
                        if (i < count) {
                            timer = setTimeout(tick,10);
                        };*/

                        
                    }, 10);
                } else {
                    this.stream_collection[source].resume();
                    
                }

                /*console.log(0);
                let arr = [5,4,3,2,1];
                let i = arr.length - 1;
                let tick;
                

                //let iteration = test();
                let timer = setTimeout (function tick() {
                    that.test(arr[i]).then(result => {
                        if (i !== 0) {
                            timer = setTimeout(tick,10);
                        };

                        console.log(result);
                        i--;
                        
                    });
                }, 10);*/



                /*process.nextTick(() => {
                    if (this.test() === true) {
                        this.stream_collection[source].resume();
                    }
                });*/



                //console.log(blocks);
                /*this.analyzeChunk(chunk, source, this.stream_collection[source])
                    .then(result => {
                        return result;
                    })
                    .then (result => {
                        console.log(result);
                    });*/
            })
            .on('end', () =>  {
                this.stream_collection[source].destroy();
            });

    };

    test (i) {
        return new Promise ((resolve, reject) => {
            //for (let i = 5; i--; ) {
                setTimeout(() => {
                    resolve(i);
                }, 2000);
            //}
        });

    }


    /**
     *
     * @param {type} read_str
     * @returns {Promise}
     */
    analyzeChunk (read_str, source/*, stream_id*/) {
        //return new Promise((resolve, reject) => {
            let lines = read_str.split('\n'),
                drop_index = lines.length - 1;
                /*command = /(\s*?)\/\/\>(\/?[a-zA-Z]+)(\(.*\))? ?(.*)?$/,
                drop_lines = [],
                last_block = false,
                parent_break = false;*/

            if (lines.length === 1) {
                this._ar2str_buffer[source] += lines[drop_index];
            } else {
                lines[0] = this._ar2str_buffer[source] + lines[0];
                this._ar2str_buffer[source] = '';
                this._ar2str_buffer[source] = lines[drop_index];
            };

            if (read_str.length === this._file_buffer_size) {
                lines.splice(drop_index, 1);
            } else {
                lines[lines.length - 1] = this._ar2str_buffer[source];
                this._ar2str_buffer[source] = '';
            }

            return lines;
            //resolve(lines);

            /*this.checkirectives(read_str)
                .then(result => {
                    resolve(result);
                });*/
       // });
    };


    checkirectives (blocks_arr, index, last_block = false) {
        let command = /(\s*?)\/\/\>(\/?[a-zA-Z]+)(\(.*\))? ?(.*)?$/,
            parent_break = false,
            _;
console.log(blocks_arr, index, last_block);
        return new Promise ( (resolve, reject) => {

            //for (let i = 0, count = lines.length; i < count; i++) {
                let line = blocks_arr[index],
                    find = line.match(command),
                    offset, com, path, flag;

                if (find) {
                    offset = find[1];
                    com = find[2];
                    path = find[3]
                        ? `${this._src_dir}/` + find[3].replace(/[\(\)]/g, '')
                        : null;
                    flag = find[4]? find[4] : null;

                    /*if (com === 'include' || com === 'include_once'
                            || com === 'exclude' || com === '/exclude') {
                        //drop_lines.push(i);
                    };*/

                    if (com === 'include') {
                        parent_break = true;
                        this.readFile(path, () => {
                            parent_break = false;
                            console.log('!!!!');
                            resolve('next');
                        });
                    }

                   // continue;
                };



                this.writeBlock(blocks_arr[index], last_block, () => {
                    //console.log('!!!!!!!!!!!!');
                    parent_break = false;
                    if (last_block) {
                        resolve('done');
                    }
                });
            //};

            if (!parent_break) {
                resolve('next');
            }

        });
    }

    /**
     *
     * @returns {undefined}
     */
    writeBlock (block, last_bit = false, callback) {
        let encoding = this._encoding;

        if (!last_bit) {
            block += '\n';
        };

        fs.appendFileSync(this._dest, block, {encoding});

        if (last_bit) {
            callback();
        }
    };


    /**
     *
     * @param {type} key
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
    }


    /**
     *
     * @returns {undefined}
     */
    showHelp () {
        console.log(`
${this._console.c_green}Usage${this._console.reset}: jnclude -in=<file name> -out=<file name>[ [-option1] ... ]

Options:
-in=<file name>         Set main source file.
-out=<file name>        Destination file name.
-help                   Show this help.
-nodebug                Delete debug code between /*>*/ and /*<*/
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