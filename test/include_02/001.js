let TEST = {};
TEST.variable = 'good ';
//>include(002.js) dev
//>include(003.js) pro
//>include_once(002.js) nod
//>exclude pro
    TEST.variable = null;
//>/exclude

let TEST = {};
TEST.variable = 'good ';
//>include(002.js) dev
//>include(003.js) pro
//>include_once(002.js) nod
//>exclude dev
    TEST.variable = null;
//>/exclude

let TEST = {};
TEST.variable = 'good ';
//>include(002.js) dev
//>include(003.js) pro
//>include_once(002.js) nod
//>exclude
    TEST.variable = null;
//>/exclude