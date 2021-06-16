// cs-sketch.js; P5 key animation fcns.  // CF p5js.org/reference
// Time-stamp: <2020-12-3 14:53:44 Colin Hughes>

// Make global g_canvas JS 'object': a key-value 'dictionary'.
//var g_canvas = { cell_size:20, wid:80, hgt:40 }; // JS Global var, w canvas size info.
g_canvas = { wid:1800, hgt:1400 }; // JS Global var, w canvas size info.
var g_frame_cnt = 0; // Setup a P5 display-frame counter, to do anim
var g_frame_mod = 15; // Update every 'mod' frames.
var g_stop = 0; // Go by default.

//array that holds every reachable balloon on the map
let balloons = []

//array functioning as a queue of messages from the bot
let mission_report = []

//reachability matrix
var reach_mat = [];
//shortest distance matrix
var short_mat = [];

//object for bot that moves through the map
let bot = { curr_bal: 0, juice_flag: false, mission_complete: false}

/// SETTING THE RACES UP
function setup()
{
    let width =  g_canvas.wid;
    let height =  g_canvas.hgt;
    createCanvas( width, height );  // Make a P5 canvas.

    //create the array of balloons
    init_array();
    //add all the data from the previous explorations to the map
    previous_records();
    push_report("MISSION START");
}

///FACTORY FUNCTION FOR BALLOONS
function create_balloon( d, p, v, visit, id )
{
    return {
        d,
        p,
        v,
        visit,
        id,
        children: [],
        parents: []
    };
}

///FILL ARRAY WITH ALL REACHABLE BALLOONS AND FIND ALL CONNECTIONS BETWEEN BALLOONS
function init_array( )
{
    let n = 0;
    // display the unexplored map
    for ( var D = 0; D <= 19; D++ )
    {
        for ( var P = 0; P <= 13; P++ )
        {
            for ( var V = 0; V <= 7; V++ )
            {
                if (D+P+V == 19)
                {
                    //create balloon object and add to array of balloons
                    let balloon = create_balloon(D, P, V, 0, n)
                    balloons.push(balloon);
                    //increment ID number for next balloon
                    n++;
                }
            }
        }
    }
    //now loop through the array and have every balloon generate its children and parents
    balloons.forEach((element, index, array) => {
        find_children(element)
    });
}
function previous_records( )
{
    //add balloons from the previous expeditions to the map
    visit_balloon( get_balloon_id( get_balloon_by_dpv(  0, 13,  6 ) ), 2 );
    visit_balloon( get_balloon_id( get_balloon_by_dpv(  0, 12,  7 ) ), 2 );
    visit_balloon( get_balloon_id( get_balloon_by_dpv(  7, 12,  0 ) ), 2 );
    visit_balloon( get_balloon_id( get_balloon_by_dpv(  7,  5,  7 ) ), 2 );
    visit_balloon( get_balloon_id( get_balloon_by_dpv( 12,  0,  7 ) ), 2 );
    visit_balloon( get_balloon_id( get_balloon_by_dpv( 14,  5,  0 ) ), 2 );
    visit_balloon( get_balloon_id( get_balloon_by_dpv(  6, 13,  0 ) ), 2 );

    //location of the balloon juice
    visit_balloon( get_balloon_id( get_balloon_by_dpv(  3, 13,  3 ) ), 1 );
    // */

    //set bot to start at the begining of map
    bot.curr_bal = get_balloon_by_dpv(  0, 13,  6 ) ;
}


///DRAW THE MAP OF VISITED BALLOONS
function draw_map( )
{
    clear(); // remove everything from the canvas

    //iterate through all balloons and draw them
    balloons.forEach((element, index, array) => {
        draw_balloon(element, "white");
    });

    //draw speicif balloons to make map more readable
    draw_balloon_color( 0, 13, 6, "cyan");

    draw_balloon_color( 3, 13, 3, "purple");
    draw_balloon_color( bot.curr_bal.d, bot.curr_bal.p, bot.curr_bal.v, "gold");
}
///DRAW A BALLOON AND ITS EXITS
function draw_balloon( balloon, color )
{
    //don't draw unvisited balloons
    if ( balloon.visit != 0 ) {
        //get screen dimensions
        var w = (width/20);
        var h = (height/14);
        textSize(16);
        if (color == "white") { stroke( "gray" ); } //grey lines for most balloons
        else { stroke( color ); }

        //draw lines to children for visited balloons
        if (balloon.visit == 2)
        {
            //iterate through the array of children
            balloon.children.forEach((element, index, array) => {
                child_bal = get_balloon_by_id(element);
                //get reference to child and draw a curve from parent to child
                draw_curve_between_balloons(balloon, child_bal);
            });
        }

        //draw a representation of the balloon
        //determine color based on if balloons been visited
        if (balloon.visit == 2) { stroke( color ); }
        else if (balloon.visit == 1) 
        { 
            stroke( color );
            if (color == "white") { stroke( "gray" ); } //unknown balloons stay grey
        }
        //draw a circle
        fill( "black" );
        circle( (w/2)+w*balloon.d, (h/2)+h*balloon.p, 32 );

        //write coordinate
        fill( color );
        stroke( "black" );
        text( balloon.d + ", " + balloon.p + ", " + balloon.v, (w/6)+w*balloon.d, (h/4)+h*balloon.p );
    }
}
///DRAW A SPECIFIED BALLOON (used for entrance, exit, and current location)
function draw_balloon_color( d, p, v, color )
{
    //get balloon via coordinates
    balloon = get_balloon_by_dpv(d, p, v);

    draw_balloon( balloon, color );
    
}


///BALLOON IDENTIFYING FUNCTIONS
function get_balloon_by_id( id )
{
    //find the first (and only) object with the given id and return that object
    var bal = balloons.find(bal => bal.id === id);
    //return reference to balloon
    return bal;
}
function get_balloon_by_dpv(d, p, v)
{
    //find the first (and only) object with the given coordinates
    var bal = balloons.find(bal => bal.d === d && bal.p === p && bal.v === v);
    //return reference to balloon
    return bal;
}
function get_balloon_id( bal )
{
    //getter function for balloon id
    return bal.id;
}


///CURVE DRAWING FUNCTIONS
function draw_curve( x1, y1, x2, y2 )
{
    //determine the direction of a line from position 1 to position 2
    var bx = Math.sign(x1-x2);
    var by = Math.sign(y1-y2);

    if ( bx == by ) { curve( x1,y2, x1,y1, x2,y2, x1,y2 ); } //if both signs are the same
    else { curve( x2,y1, x1,y1, x2,y2, x2,y1 ); } //if signs are different
}
function draw_curve_between_balloons(bal1, bal2)
{
    //get screen dimensions
    var w = (width/20);
    var h = (height/14);
    noFill();
    //draw curve between centers of each balloon
    draw_curve( (w/2)+w*bal1.d, (h/2)+h*bal1.p, (w/2)+w*bal2.d, (h/2)+h*bal2.p);
}


///KNOT TRANSFER FUNCTIONS
function find_child( bal, d, p, v )
{
    //bal is the balloon to find a child for
    //d, p, and v should be -1, 0, or 1 to indicate which coordinate should gain or lose knots
    //catch invalid transfer
    if ( (d + p + v) != 0 ) { return bal;}

    //get current DPV of balloon
    var dc = bal.d;
    var pc = bal.p;
    var vc = bal.v;

    var loop_flag = true;
    //continuously move knots until a limit is reached
    while ( loop_flag )
    {
        //check if an increment can occur without breaking any limitations
        if ( !(19 >= dc + d && dc + d >= 0) ) { loop_flag = false; }
        if ( !(13 >= pc + p && pc + p >= 0) ) { loop_flag = false; }
        if ( !( 7 >= vc + v && vc + v >= 0) ) { loop_flag = false; }

        //if no limit was broken, perform the increment
        if ( loop_flag )
        {
            dc += d;
            pc += p;
            vc += v;
        }
    }

    //now that a limit has been reached, return the balloon at the new coordinates 
    //if no such child exists, the original balloon will be returned
    return ( get_balloon_by_dpv(dc, pc, vc) );
}
function find_children_step( bal, d, p ,v )
{
    var temp_bal = bal; //variable to hold reference to child

    //find child in given direction
    temp_bal = find_child(bal, d, p, v);

    //confirm child is different from parent
    if (temp_bal != bal)
    {
        //add child to list of children
        bal.children.push( temp_bal.id );
        //add self to children's list of parents
        temp_bal.parents.push( bal.id );
    }
}
function find_children( bal )
{
    //try all 6 possible changes to DPV coordinate to find all possible children
    find_children_step(bal, 1, -1, 0 );
    find_children_step(bal, 1, 0, -1 );
    find_children_step(bal, -1, 1, 0 );
    find_children_step(bal, -1, 0, 1 );
    find_children_step(bal, 0, 1, -1 );
    find_children_step(bal, 0, -1, 1 );
}


///TREE AND FRINGE EXPANSION
function visit_balloon( bal_id, level )
{
    //1 marks a node as in the fringe
    //2 marks a node as in the tree
    //find balloon by given id
    bal = get_balloon_by_id(bal_id);

    if (bal.level != level)
    {
        //function will not remove a node from the tree or fringe, only allows increases
        bal.visit = max(bal.visit, level);

        //check if current balloon is already at visit level of 2, ie first time being reached by
        if ( level == 2)
        {
            //recalculate the matrix with the new shortest distances now that a new nodes been reached
            generate_shortest_path_matrix();
        }
    }

    if ( level == 2 )
    {
        //add all children to the fringe when added to the tree
        bal.children.forEach((element, index, array) => {
            visit_balloon(element, 1);
        });
    }

    
}

///REACHABILITY MATRIX
function init_matrix()
{
    //initializes the reachability matrix
    //find only the balloons that have been visited by the bot
    let visited = balloons.filter(bal => bal.visit === 2);
    //empty the reachability matrix
    reach_mat = [];
    for (let i = 0; i < visited.length; i++) 
    {
        //add a new row to the matrix
        reach_mat[i] = [];
        for (let j = 0; j < visited.length; j++) 
        {   
            //default distance between balloons is infinite
            reach_mat[i][j] = Infinity;
            //balloons cannot reach themselves
            if ( i == j ) { reach_mat[i][j] = 0; }
            //if j is a child of i, then the distance is 1
            if ( visited[i].children.includes( visited[j].id ) ) { reach_mat[i][j] = 1; }
        }
    }
}
function generate_shortest_path_matrix()
{
    //update reachability matrix
    init_matrix();
    //use reachability matrix as starting matrix
    short_mat = reach_mat;
    let L = short_mat.length;

    //now loop through every pair and every possible intermediate bubble to find the shortest distance between each pair
    for (k = 0; k < L; k++)  
    {  
        for (i = 0; i < L; i++)  
        {  
            for (j = 0; j < L; j++)  
            {  
                // if using k makes the distance between i and j shorter, then do that
                if (short_mat[i][k] + short_mat[k][j] < short_mat[i][j])  
                {
                    short_mat[i][j] = short_mat[i][k] + short_mat[k][j]; 
                }
            }  
        }  
    }
}
function draw_short_mat()
{
    //find only the balloons that have been visited by the bot
    let visited = balloons.filter(bal => bal.visit === 2);
    let msg = "";

    let size = 16
    textSize(size-4);
    stroke( "black" );
    fill( "white" );

    //print DPV in the top left
    text( "D" , (2)*size, (1)*size );
    text( "P" , (2)*size, (2)*size );
    text( "V" , (2)*size, (3)*size );
    text( "D" , (0)*size, (3)*size );
    text( "P" , (1)*size, (3)*size );

    for (let i = 0; i < short_mat.length; i++) 
    {
        //display coordinates over column
        text( visited[i].d , (i+4)*size, (1)*size );
        text( visited[i].p , (i+4)*size, (2)*size );
        text( visited[i].v , (i+4)*size, (3)*size );
        text( "_" , (i+4)*size, (4)*size );

        for (let j = 0; j < short_mat.length; j++) 
        {   
            //display coordinates next to column
            if (i == 0)
            {
                msg = "|" + visited[j].d + "," + visited[j].p + "," + visited[j].v + "|"
                text( msg , (i+0)*size, (j+5)*size );
            }
            //display the matrix
            if (short_mat[i][j] == Infinity) { short_mat[i][j] = 0; } //display infinity as 0 if it ever comes up, but theres no dead ends so probably redundant
            msg = str(short_mat[i][j])
            if (short_mat[i][j] == 0) { msg = ""; } //display 0s as empty spaces to improve clarity
            text( msg.padStart(2, ' ') , (i+4)*size, (j+5)*size );
        }
    }
}


//REPORT DISPLAY
function push_report( report_str )
{
    //place report at front of queue
    mission_report.unshift(report_str);
    //empty out end of queue if it gets larger than the allowed messages
    while ( mission_report.length > 16 ) { mission_report.pop() }
}
function display_report( )
{
    let size = 16
    let xx = width*(2/3);
    let yy = height*(2/3);
    textSize(size);
    stroke( "black" );
    fill( "white" );

    //iterate through mission report queue
    for (let i = 0; i < mission_report.length; i++) 
    {
        text( mission_report[i], xx, yy+i*size );
    }
}


///ROBOT TRAVERSING THE MAP
function balloon_step( )
{
    //if the mission is not yet finished
    if (!bot.mission_complete)
    {
        //main step for the balloon juice project
        //create an empty string to report movement
        let report_str = "";
        //report position at start of step
        report_str += "Moved from (" + bot.curr_bal.d + ", " + bot.curr_bal.p + ", " + bot.curr_bal.v + ") to (";

        //get the unvisited children of the current balloon
        let unvisited = bot.curr_bal.children.filter(bal => get_balloon_by_id(bal).visit != 2);
        console.log(unvisited);
        let clen = unvisited.length;
        console.log(clen);
        let destination = bot.curr_bal;

        if (clen == 0 || bot.juice_flag)
        {
            //if every child has been visited already, or the juice has been obtained, visit a child at random
            //find out how many children the current balloon has
            clen = bot.curr_bal.children.length;
            //pick a child at random
            destination = bot.curr_bal.children[Math.floor(Math.random() * clen)];
            console.log("No unvisited children");
        }
        else
        {
            //if any unvisited children exist, choose one at random           
            destination = unvisited[Math.floor(Math.random() * clen)];
            console.log("Found unvisited children");
        }

        //move to child
        destination = get_balloon_by_id(destination);
        bot.curr_bal = destination;
        //update visitation level of balloon
        visit_balloon( destination.id, 2);

        //complete report and push to queue
        report_str += bot.curr_bal.d + ", " + bot.curr_bal.p + ", " + bot.curr_bal.v + ")";
        push_report(report_str);

        //check if child is the juice or the base
        if (bot.curr_bal == get_balloon_by_dpv( 3, 13, 3 ) )
        {
            //entering the juice balloon
            if (!bot.juice_flag)
            {
                push_report("MYSTICAL BALLOON JUICE LOCATED");
                bot.juice_flag = true;
            }
        }
        if (bot.curr_bal == get_balloon_by_dpv( 0, 13, 6 ) )
        {
            //entering the base
            if (bot.juice_flag)
            {
                push_report("MYSTICAL BALLOON JUICE BROUGHT TO BASE");
                push_report("MISSION COMPLETE");
                bot.mission_complete = true;
            }
        }
    }
}



/// FRAME HANDLING
function draw()  // P5 Frame Re-draw Fcn, Called for Every Frame.
{
    ++g_frame_cnt;
    if (0 == g_frame_cnt % g_frame_mod)
    {
        if (!g_stop) draw_update();
    }
}

function draw_update()  // Update our display.
{
    //race_step();
    balloon_step();
    //redraw the map to show changes
    draw_map();
    //display matrix and most recent action of bot
    draw_short_mat();
    //display all mission messages
    display_report();
}

/// INPUT HANDLER
document.addEventListener('keydown', function(event) {
    if (event.code == 'AltRight') {
        if (g_frame_mod < 60) { g_frame_mod++; } // decrease speed of sorting
    }
    else if (event.code == 'ControlRight') {
        if (g_frame_mod > 1) { g_frame_mod--; } // increase speed of sorting
    }
    else if (event.code == 'Space') {
        g_stop = ! g_stop; // switch between paused and unpaused
    }
    
});