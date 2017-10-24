let TEST = {};
TEST.variable = 'good ';
//>include(002.js) dev
//>include(003.js) pro1 pro2
//>include_once(002.js) nod
//>exclude pro
    TEST.variable = null;
//>/exclude

let TEST = {};
TEST.variable = 'good ';
//>include(002.js) dev
//>include(003.js) pro1
//>include_once(002.js) nod
//>exclude dev
    TEST.variable = null;
//>/exclude

let TEST = {};
TEST.variable = 'good ';
//>include(002.js) dev
//>include(003.js) pro2
//>include_once(002.js) nod
//>exclude pro2
    TEST.variable = null;
//>/exclude