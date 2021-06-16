Readme for balloon_juice_walkin
Time-stamp: <2020-12-3 14:53:44 Colin Hughes>
------------------------------------------------------------

Class Number: 335-02
Team Name: Walkin
Team Member(s): Colin Hughes
Project Number 3, Balloon Juice


Intro

  This HTML page features a bot moving across a map representing balloons at DPV coordinates. The bots goal is to reach the mystical balloon juice and return to the start of the map, while keeping the viewer informed of the map's structure as it is discovered.


Features 

  The bot moves randomly through the map, following the DPV connection rules, and prioretizing unvisited balloons.
  Every action taken by the bot, including locating the mystical balloon juice and completing the mission, is recorded in a 16 message long queue of status updates at the bottom right of the page.
  An expanding shortest-path matrix is shown in the top left of the page, and updates whenever a balloon is visited for the first time.
  The map in the middle of the page shows all the DPV coordinates of each known balloon, and has a few colors to signal the location of the bot, the base, and the mystical juice.
  The base ballon is colored cyan, the bot's location and possible paths are colored gold, and the location of the mystical balloon juice is colored purple.

  The user can pause the bot to read the status report and check the current matrix by pressing the space bar.
  The user can decrease the time between steps by pressing the right CTRL key.
  The user can increase the time between steps by pressing the right ALT key.


Zip Contents

  File readme.txt.  This file.

  File index.html. Drag and drop this into a browser to
    run the example.

  File p5.js. This is the P5 package.  It is loaded inside the html.

  File cs-sketch.js; This contains several P5 user-defined linkage functions
   (setup, draw, and keyPressed), as well as example
    support functions.  P5's setup() is run once before page display.
    P5's draw() is run once per display frame, so you can do animation.
    The majority of the javascript functions handling the mission have also been implemented here.

  File assets/styles.css.  This is an extra-small example of controlling
    webpage styling.

  File 335-02-p3-Running-Time-Writeup.docx. Word file containing runtime analysis report.


Installation & Running

  1. Extract the .zip file into a folder.

  2. Drag the main HTML file, index.html, into a browser
    window.  The program should start immediately with the previous mission data loaded on-screen.


Known Bugs


Warnings

  o- To fit the maximum possible shortest-path matrix, the program window is very large, you may need to scroll up/down and left/right in the window to see the status updates and the full map. If the bot's random movement causes it to visit every balloon on the map, the matrix may overlap the map slightly.

Testing

  o- Following installation instruction, above, watched it run, and confirmed all hotkeys work.
  Only tested on Google Chrome with a single dell keyboard.


Credits

  Code based on Professor Siska's starter code, which was based on Stuart's book.  
    Introducing JavaScript Game Development: Build a 2D Game from the
    Ground Up, by Graeme Stuart, 2018, 209 pages.

  And, of course, thanks to the HTML and P5.js developers.
