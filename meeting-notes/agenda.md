# Agenda
## Tues, May 5 - last day! Group meeting
We'll make a list of the final coding TODOs and edits for READMEs (48 hours worth). Over the Exam Period, you should only be working on the [Poster Deliverable Specifications](https://docs.google.com/document/d/14zl3wYsOKsWY_auNssoloWtEfIbF8OW2TYotmk6d420/edit?usp=sharing).

## Thurs, April 30 - canceled/asynchronous
Send questions over Slack or stop by office hours 1-3 PM.

## Tues, April 28 - Individual Meeting
Ellora worked on Python-parsing code and verified it with the map in JS. She and Taft checked the nodes and edges and found some bugs. Fixed them. She merged the new formatting changes into main (tooltip, edges styling, button). 

Ellora & Taft realized the trees are really shallow -- edges are generally strictly parent-child, no grandchildren. So Sugiyama doesn't make sense because there aren't mulitple levels in the graph. Suggestion is to move to force-directed instead. Found example of force-directed with directional straight arrows on Observable. 

Taft commented a lot on main.js. Ellora made a readme for the processing code. 

**TODO:**
* Dr. W sends out the poster information by Thursday 9 AM
* Due Thursday 1 PM: T&E read the poster information and Dr. W's feedback on their Intro + Related Work submissions (the PDFs have my red/blue comments, located in "Name - 395 Feedback"
    * Stop by my lab from 1-3 PM on Thursday to ask questions. Otherwise, I'll answer questions asynchronously over Slack.
* For coding:
    * Work on modularizing the code base -- move any code related to drawing the IR graph to a separate JavaScript file. See the zip file example on Slack, which is a completed version of [Lab 7](https://docs.google.com/document/d/1W9aG4BCo4kh5WKXtipFZbDZLx2dM65Ek9fdffiTY6cI/edit?tab=t.0#heading=h.k3uixyfqpxt2). This completed version still isn't amazing, but it gives you the gist of how to have a barchart.js and a scatterplot.js to organize the code (I think barchart is still kind of acting as a main.js, but again, you get the gist).

**No meeting on Thursday due to Dr. Williams' coding interviews.**
  

## Thurs, April 23 - Group Meeting

I'll release the poster and summary information next week (April 30). 

**TODO:**
* Clean up GitHub branches: let's keep `main` (which is always a stable, working version) and have at most 2 other branches with works in progress.
  * Can be 1 branch is Taft's and other is Ellora's
  * Or have 1 branch as "grid version" of our tree and other branch as "tree-layout" versions of trees (where we're experimenting with different layouts)

* Make a new folder with the Python scripts called `data-processing`. Make sure those files are well-commented.
  * Add a README.md file to the Python script folder that describes what each file does and gives enough information that a new person could understand what you're trying to get from the JSON. 

### Timeline for rest of semester
1. April 28
2. April 30
3. May 5 - last meeting
4. May 7 - VMC, no meeting 
5. Poster and 2-page summary due by 11:59 PM on May 11

## Tues, April 21 - Individual Meetings

We reviewed the changes that Taft and Ellora made. I also discussed optimal scheduling times with T&E for the interviews. I sent emails to 2 participants today.

Ellora and I talked about verifying the data. We want to make Python scripts that produces:
* A list of each node's edges for each phase
  * Edges should be denoted by incoming or outgoing
  * Review JITCIR readme page for the words "input nodes."
* also alive status for each node in each phase

* To fix the edges on the JS visualization (they currently disappear after a hover instead of returning to thin edges), check the enter-update-exit part of the code for your edges (might be near the "hover" keyword). Odds are, the opacity for the edges isn't being brought back to normal or the edges are being totally removed and aren't redrawn. Check the diff between the two commits -- see what lines are different in main.js.


Taft and I checked Calendly. We reviewed the bugs Ellora pointed out in the JS visualization and fixed the number layout issue. We talked about writing Python scripts to check the JSON information and also looked at the data structures in main.js and how we could use them in the Sugiyama code. It seems simpler than I initially thought. 

**Notes from Slack:**

Last week, Ellora and I spoke about trying to use different graph drawing algorithms to change the layout of the graphs. One that I mentioned on Tuesday but then forgot today is the [force-directed layout](https://observablehq.com/@d3/force-directed-graph-component). This one might work best for a Sea of Nodes type IR, which (I think) is what we currently have

The Sugiyama might work better for a control flow graph (CFG). But we won't know until we experiment. Try making simple versions of both --> getting 1 phase of our JSON data to be visualized. This might take a week or a little longer
* [Sugiyama examples](https://erikbrinkman.github.io/d3-dag/#examples)
* [Sugiyama codepen](https://codepen.io/brinkbot/pen/oNQwNRv)

## Thurs, April 16 - Met with Ellora (Taft away)
Checking alive/not. Type 3

TODO:
* Add code to determine which phase the node was created and which phase the node was killed (by looking at instruction type:7 (created) and type:3 (killed) and checking the phaseFnId)
* Verify our visualization against IR file.
* Nitpicky changes to make
  * Change blue background to light blue
  * Change location of node ID text to up a little bit and left a little bit
  * Like that the arrows are red (easy to see) but they need to be bigger
  * Move tooltip to side bar (make sure that it's obvious what node I'm looking at) -- I would make the outline slightly heavier (by 3 px) and I would add color to the node (so everything is light blue if alive, but if I'm looking at the node, then it's medium blue)
  * MEREGE THAT BRANCH WITH MAIN

* Next phase: explore graph drawing algorithms. Sugiyama, others that y'all presented. 
  * Example: Sugiyama style d3 code: https://erikbrinkman.github.io/d3-dag/#examples
  * Another example: https://codepen.io/brinkbot/pen/oNQwNRv
* Review the questions doc for people in interviews: https://docs.google.com/document/d/12oJefpEDQESdi6lroOaqXBC7Zy78PaEEyOAMFsbw__Y/edit?usp=drive_link

## Tues, April 14 - Met with Dr. Lim

We validated the GraphBuilderPhase in the IR file, but not against his image (haven't validated the others). Our blue nodes are alive during the phase and the grey means not alive. 


Discussion reveals that our definition of "alive" (which we considered "connected by edges") was wrong and "alive" is defined by type. Our other information seems correct (op code, node, size, created). **At the end of compilation, we know nodes with ids 0-35 should be alive (more or less) and 36+ should not be alive.**


TL says that "dead" means the node was removed from the IR. If a node is alive at the end, that means it was converted into machine instructions. Throughout the process, nodes have opcodes and when they are alive, that means we are using the node and thus, using the opcode. 

Somewhere in the node's instructions, they will have the instruction "DEAD," which means the memory is wiped and replaced with 0s. 
  * Example: Node 92 is actually dead, dead in phase 142962 so the InstructionSelectionPhase.
  * Every instruction has a type. Everything with type 3 "KILL" means the node is dead
  * Theoretically, every 1st instAccess for a node should be type 7 "CREATE"
  * Here's the [**Table of Access Types**](https://github.com/hlim1/JITCIRModeler/blob/code_fix/README.md#access-types)

TL reiterates: "We're interested in what phase did what activity on the node. This can help id which phase caused the killing (possibly incorrectly)."

After the type:3 instruction, there could be other  instructions used for memory overwriting and cleaning. *Can see 4's (value change), 1's (removal), or 5's (read) after 3's.*
  * Problematic of we see 0s or 7s after a 3 --> could mean that the compiler is reusing the memory location and not recognizing that it's a new node that's reusing the location.

TL: "Optimizer traverses the graph many times until it realizes there are no more optimizations to do."
  * The edges have several meanings: could mean control flow or could mean data flow. Depends on Sea of Nodes or SAA (which is CFG).
  * BUT THE EDGE DIRECTION IS STILL USEFUL! Shows what the node value is returning do, shows how data is flowing. Likes both outgoing and incoming edges.

**For graph layout:** would be nice if we could support laying out the Sea of Nodes or SSA (CFG) or data flow. Might have different layout algorithms.

**Unknown**: node 48 has 2 type:3 instructions. It was somehow wiped, and now we're trying to wipe again. *Not sure why.* Between the 3's there are 2x1's, 3x4's, and 2x5's types. 

TODO:
* Make the phase fill (for the selected button) persistent so I know what phase I'm looking at once I move my mouse away
* Fix the killed field based on type: 3

## Thurs, April 9 - Group meeting
We reviewed T&E's current visualization. I gave feedback on things to fix before we meet with Dr. Lim next week.

TODO:
* Rename existing "tooltip" in code to "edge-view" (or similar)
* Make [tooltip](https://docs.google.com/document/d/1Bg9b-rQukDJE4lqDtjT938lENsxKvFe475PhgsCuaBE/edit?tab=t.0#heading=h.h4o0crisufls) (i.e., a hover box) that shows data from the IR
  * We're using this for debugging/confirming accuracy so whatever fields you think are most useful
  * We thought likely mnemonic/op code, initial edges, removed edges, replaced edges
* Add directionality to edges (and ask about what the directions mean)
* Add to the [Questions Page](https://docs.google.com/document/d/13lQUKRDBjBLTygpteZJSBBbJ7kQ6HGnPasy88-a9B0w/edit?tab=t.0)
* Dr. Williams will get the code up on GitHub.io


## Tues, April 7 - No meeting
Tuesday followed Monday schedule, so no meeting.

## Thurs, April 2 - Group Meeting
T&E are updating KPW about the programming they have done for the visualization. 

Goal: make something relatively easily that helps us understand the dataset. 
Goal: makes sure the code is flexible enough to be modified for new datasets.

Updates:
* We think there's a bug with initial edges. TODO on Tuesday (which is a Monday schedule) is fix this bug and make sure organizeEdges() works correctly.
* Ensure the other data-cleaning functions are correct
* Add the edges to the visualization (will look like a hairball). Then try to add a hover effect so if we hover over a node, we see all outgoing edges (or add a hover effect on an edge so that we can see the edge and nodes it connects). Can do this by adding an outline around the nodes and increasing the thickness of the edge and color of the edge (make the other edges lighter and thinner)

## Tues, March 30 - Individual meetings 
Taft and Ellora presented the different graph layout styles and techniques that they researched (my [notes](https://docs.google.com/document/d/1NkDcMBiCtUrvxlRtBJj7Umh8a8dw95E7nx9EhvBm8CI/edit?usp=sharing)). We discussed potentially using Sugiyama layout or a 3-D layout, several others. Ellora had the foresight to consider how we could compare different phases so she proposed radar charts. Taft brought up circle packing and 3-D layouts, which could work but have constraints (circe packing needs to be a hierarchy, 3-D is tricky in 2-D). However, the 3-D idea is probably most intuitive if we can do it well. Another alternative was the idea to lay out the phases sequentially. 

## Tues, March 24 - Group meeting (NO SINGLE MEETINGS THIS WEEK)


Agenda:
* Updates since last time
  * Taft and Ellora worked on [programming a visualization](https://github.com/Davidson-Data-Vis-Lab/JIT-compiler-vis/tree/tool-building), to get their feet wet and to start brainstorming
    * We bound the data to the circles and added text elements to show the ID for each node (circle). 
	* TODO (optional, can be later work):
    	* Figure out the `cx` spacing for the circles and text so that we see all 93 nodes in a nice layout
       	* Add node numbers (done, minor editing needed)
       	* Add buttons to show/hide phases. Buttons should be below the rows of nodes. If I click on a button like button "Phase 8", all of the nodes that are alive in phase 8 should have `opacity: 100%` and all other nodes should have `opacity: 50%`. For now, only allow for one phase to be on/off at a time.
  * Dr. Williams nearly completed the IRB application 
    * Emails, [scripts for interviews](https://docs.google.com/document/d/12oJefpEDQESdi6lroOaqXBC7Zy78PaEEyOAMFsbw__Y/edit?usp=sharing), details
    * T&E can review interview questions and add comments, if desired. Since these will be semi-structured interviews, we can add additional questions as we think of them (or if they come up in the interview).
    * Added Dr. Lim so that he can join interviews. He needs to complete HSIRB training (human-subjects training)
      * Optional for students

  * Keep building over the next week. Individual code review on **Tuesday, March 31** -- I'm looking for a short recap of relevant visualization/graph drawing techniques and sketches of how you think we could use some of these techniques in our visualization.
    * Expected time: 3-4 hours to look up techniques and makes slides, 1-2 hours to make sketches.
    * For example, one we used in [Lab 8 was the Force-Directed Layout](https://docs.google.com/document/d/1aZvdt_JhqttjF-AIbYyCH_p7IgqszKaOBayk_DcrS9A/edit?tab=t.0#heading=h.74fvo7160ixj). How could we use this code? Why would it work or why would it be a poor choice?
    * **Deliverables: quick presentation of 3 types of graph visualizations plus at least 1 technique for graph drawing (review the [Wikipedia article](https://en.wikipedia.org/wiki/Graph_drawing#:~:text=In%20the%20case%20of%20directed,adjacency%20matrix%20of%20the%20graph), especially the Layout Methods and Application-Specific Graph Drawings sections).**
        * All 4 of your choices (3 graph vises and 1 drawing technique) should be reasonable for our dataset -- this will require some reviewing and researching on your part. For example, arc diagrams would *not* be a reasonable choice for this dataset.
        * You two can have up to 2 of the 4 things in common (i.e., 1 vis and 1 drawing technique or 2 vises). The other 2 should be unique from the other person's, although you're welcome to discuss your ideas to see which ones have merit.
        * Use ideas from your research (doesn't have to be *only* the 4 topics you found) to draw 3 different sketches of how we could visualize this data.
          * I'm looking for visualizations that have both nodes and edges, and also provide some way to connect the different phases ("connect" used loosely here).
    * **Submit your slides and sketches to this [Google Form](https://forms.gle/bT1UTtuJ7Ced3JJH8) by 11:59 PM on Monday, March 30.**

  

## Thurs, March 19 - Group meeting w/Dr. Lim
[KPW's notes](https://docs.google.com/document/d/1g4_3888UAilN6SfDOdPocQvBVXiTlIckGliKbLUqvJ8/edit?usp=sharing)

We spoke at the end about visualizing the new IR data, and doing it poorly (meaning, visualizing everything all at once, rather than phase by phase). In our example file, there's 93 nodes and many more edges, so it should end up looking something like in [Dr. Lim's paper](https://drive.google.com/file/d/1aFLgaOMU6KNbhORWCpUZ6YFQkaGEn2yB/view?usp=sharing) (see hairball picture in Figure 2).

To do this, let's make a branch in our [JIT-compiler-vis repository](https://github.com/Davidson-Data-Vis-Lab/JIT-compiler-vis/tree/main) called tool-building. Create a new web tool: you'll need an index.html file, a main.js file, and a style.css file. From there, we'll want to make a disjoint graph, ideally with directed edges:
* Disjoint (maybe) because not all nodes are connected to another node (this could be false)
* Directed edges: have arrows from one to the other. This is a surprisingly tricky thing to include sometimes in JavaScript, so it's ok if we have plain edges to start


Code to use for inspiration:
* [https://observablehq.com/@d3/disjoint-force-directed-graph/2](https://observablehq.com/@d3/disjoint-force-directed-graph/2)
* [Lab 6](https://docs.google.com/document/d/1Bg9b-rQukDJE4lqDtjT938lENsxKvFe475PhgsCuaBE/edit?usp=sharing), specifically the section "Graphs and Hierarchies"

You're welcome to use AI to generate the code so long as it's simple enough for us to understand. This is our first draft of a visualization, so we need to understand it so that we can tweak it and build on it.

**I'll check your Partner Forms on Monday after you two are done working to see the status of your code. Please also push your branch to GitHub at that point so that I can see the code. After that, we'll make the decision about meeting on Tuesday**

## Tues, March 17 - Individual meetings
TODO:
* Discuss Dr. Lim's updates with each student
* Review the [Questions for Dr. Lim document](https://docs.google.com/document/d/13ARp0_arF0h8WDGxUjyThg4U_T_QsfG05Vn2HuBcGC4/edit?tab=t.0#heading=h.sohyrbsvxa6i)

For students:
* Review his code that used Graphviz to generate the graphs in [../toy-datasets/IR/lim-phase-images-and-script/draw_phase_graphs.py](../toy-datasets/IR/lim-phase-images-and-script/draw_phase_graphs.py). The IR JSON is in [../toy-datasets/IR/ir-after-spring-break.json](../toy-datasets/IR/ir-after-spring-break.json)
  * Also stored in KPW's drive at .JIT IR Visualizations/JSON data files for students/[Graph Visualizations by Phase](https://drive.google.com/drive/folders/1Vb22n5hsmY2CDYhQKJQTcxmp7UFpIZoK?usp=drive_link)
* Create a key for interpreting those graphs -- what do all of the nodes and edges mean? What are each of the text attributes? Question for Dr. Lim -- what does this/these graphs tell you?
* Add the key to this repo
* Meet w/Dr. Lim on Thursday afternoon
* If time: this is the new [IR example file](https://drive.google.com/file/d/1ALzo0KvsLXkWG6zpCToMhdYOVQ08Ky4R/view?usp=drive_link) (also at toy-datasets/IR/ir-after-spring-break.json in this repo) and the [explanation of changes](https://docs.google.com/document/d/1jwRePJLvh4XAH4irzjmmdnO3b0wv48TX3sCchfUoRec/edit?usp=drive_link). Start sketching ideas of how to visualize the data, using the Graphvis phase images for inspiration.
  * This might be more beneficial after we meet with Dr. Lim, but some initial thoughts are welcome.
  * Helpful slides for CFGs: https://docs.google.com/presentation/d/1Z9iIHojKDrXvZ27gRX51UxHD-bKf1QcPzSijntpMJBM/edit?slide=id.g19134d40cb_0_193#slide=id.g19134d40cb_0_193
  * Reminder that V8 left the Sea of Nodes and went back to CFG: https://v8.dev/blog/leaving-the-sea-of-nodes



## Fri, March 13 - Update from Dr. Lim
Email:

> During the break, I spent some time improving the tool for modeling and generating an abstract model of V8 IR, considering the questions asked in the document.
>
> You can find the overview of changes I made in the "[JITCIRModeler Output Change](https://docs.google.com/document/d/1jwRePJLvh4XAH4irzjmmdnO3b0wv48TX3sCchfUoRec/edit?tab=t.0#heading=h.anls0jw7z3b9)" file, which is also in the "JSON data files for students" Google Drive folder. You can also see a more detailed description of the ir.json spec in the [code_fix branch](https://github.com/hlim1/JITCIRModeler/tree/code_fix) of the JITCIRModeler repository.
>
> I believe the most useful thing for the group is the phaseFnId in each element of instAccess. This enables all instructions to be properly categorized by phase, as with the IR nodes. I used Graphviz to visualize the graphs for each phase. This does not include any optimizations; it only displays nodes that were "created" during the optimization phase. The PNG files are available [here](https://drive.google.com/drive/u/0/folders/1Vb22n5hsmY2CDYhQKJQTcxmp7UFpIZoK), along with the Python script I used to generate them.
>
> I hope this helps your visualization progress, and let me know if you'd like me to review the changes in person.

* phaseFnId -- categorizes instructions by phase
* Used GraphViz to visualize -- does not include any optimizations, only the nodes that were "created" <-- what does this mean?

## Thurs, March 5 - Group Meeting

We reviewed the scripts that T&E wrote (see [/toy-datesets/IR/test.py](https://github.com/Davidson-Data-Vis-Lab/JIT-compiler-vis/blob/main/toy-datasets/IR/test.py)). We added questions for Dr. Lim to answer to our document "[Questions for Dr. Lim](https://docs.google.com/document/d/13ARp0_arF0h8WDGxUjyThg4U_T_QsfG05Vn2HuBcGC4/edit?tab=t.0#heading=h.sohyrbsvxa6i)". We sent it to him and he answered some questions -- we discussed the responses and we were (mostly) right!
* My [notes](https://docs.google.com/document/d/1X3vzoxyNtBlm-lqao0gwF0n8m4_QRKNz2eLNz-fxHBs/edit?usp=sharing)

## Tues, March 3 - Individual Meetings (Canceled)
Taft and Ellora continued to work on their Python scripts. In our group meeting, we reviewed the code they wrote. They also compiled a list of questions to ask Dr. Lim.

## Thurs, Feb 26 - Group Meeting

We reviewed the [JSON specification](https://github.com/hlim1/JITCIRModeler?tab=readme-ov-file) and compared it to the actual IR file we have. There were some discrepancies in what was defined and what was in the file, and we're still learning what everything is.

The ones that didn't match the specification: "address" in "instruction_id", the "evaluates" attribute, and "memory_reads" and "memory writes"

We compiled a list of questions for Dr. Lim, which need reviewing. We also want to start understanding how the alive/dead of a node corresponds to the phase.

TODO: 
* Dr. Williams will review the [list of questions](https://docs.google.com/document/d/13ARp0_arF0h8WDGxUjyThg4U_T_QsfG05Vn2HuBcGC4/edit?tab=t.0) tomorrow afternoon
* Create a Python script to determine which nodes belong to which phase. See if that belonging corresponds to the alive/dead attribute.
	* Separately validate the code
	* Post it to GitHub --> make a folder called "scripts" and let's call the file "find_node_phases.py"

## Tues, Feb 24 - Individual Meetings
Discussed with students their understanding of the IR file. We have a better grasp, after meeting with Dr. Lim, but need to come up with a shared understanding of the file. We also need to determine the relationships between the data, data structures we may need, and additional questions. <-- That's a TODO before Thursday

## Thurs, Feb 19 - Group Meeting
Briefly met with Taft (Ellora sick) to come up with questions for meeting with Dr. Lim.

## Tues, Feb 17 - Individual Meetings
Optional meeting - can get help with GitHub things.

TODO for Thursday:
* Review the IR output for the Proof Of Concept (PoC) code that Dr. Lim gave us
* Read this article about "recent" changes to V8: [https://v8.dev/blog/leaving-the-sea-of-nodes](https://v8.dev/blog/leaving-the-sea-of-nodes)


## Thurs, Feb 12 - Group Meeting

Taft and Ellora presented on compilers, JIT compilers, and the state of debugging JIT compilers. Today, we'll plan next steps and review GitHub.

TODO:
* T&E: individually complete the [GitHub Practice](https://github.com/kawilliams/github-practice)
* T&E: clone the [JIT-compiler-vis](https://github.com/Davidson-Data-Vis-Lab/JIT-compiler-vis) repository to your own computer. Make a new branch called taft-edits or ellora-edits. Add a file called taft-notes.txt/ellora-notes.txt. Add some text to the notes file. Add your changes, commit them, and push the changes. Then, on the web, open a pull request for your branch. The other student should review your PR and merge it.

## Thurs, Feb 5 - Group Meeting
Talked about Introduction and Related Work. We get the style and how they are written, but we’re unsure what to include. Variety of styles of related works and where they were placed.

* Rubric for [Presentation](https://docs.google.com/document/d/1Tz9T6d7iwNp0dRcxh2uSGbO6rp8iCO-_69IlbvlP610/edit?tab=t.0)
* Rubric for [Introduction and Related Work](https://docs.google.com/document/d/1kFUgIjkBxOPM-TQbMaP3EroqFDjKdrrY9D93fO6KlmU/edit?tab=t.0#heading=h.8146crre185e)
  

## Thurs, Jan 29 - Dr. Lim + Group Meeting
Discussed Lim and Kobourov paper and JITScope paper. 

### Notes
* Compiler = middleware to convert language into machine language
  * Two types: static compilers (gcc, clang) and JIT compiler
  * Big difference between: static – we control them. We have source file, we decide when to compile and what kind of optimizations. We rely on the compiler to make our code more efficient, optimizations. We can control those optimizations
  * JIT compilers; we do not ahve that control
    * Profiler
    * We run the code first through interpreter
  * JIT: lack of control maeks it difficult to debug
    * We debug using the IR
    * Both types of compilers create an IR, which is like a graph. They make and manipulate this graph. Making it “smaller” or more efficient
* During the graph manipulation, the compiler may have a bug. We need to figure out which node or subgraph is part of the problem. Then we go back to the source code of teh JIT compiler to see what’s responsible for the changes
  * IR graph: lots of nodes, lots of edges, non-planar
  * Goal: easy to understand and extract the data
  * MetroMap: stations are codes, lines are optimization phase. If you can click it, get info about the node.
* JITScope is different. 
    * Different way to visualize the graph
    * Visualize phase by phase, make things smaller
    * I can create the data in JSON format
      * Terrence has this info
* Want
  * Click for info but what info is useful for developers?
  * Has a contact from years ago
    * Open bug report committee and make comments about how they work through it
    * They have their own version of IR visualizer
* https://issues.chromium.org/issues/478035107
  * Very good example of solving a bug on Chromium
  * Typing optimization error
  * Converting a float to an int

IRs are not generated by source code. Interpreter creates byte code. Not always a one-to-one mapping

Terrence doing human-in-the-loop automatic debugging


V8 has [tools](https://v8.github.io/tools/head/), specifically Turbolizer
* Current version: [https://v8.github.io/tools/head/turbolizer/index.html](https://v8.github.io/tools/head/turbolizer/index.html) 
* Old version (with a gif showing how it works): [https://github.com/thlorenz/turbolizer](https://github.com/thlorenz/turbolizer ) 

Mozilla has its own JIT compiler called [IonMonkey](https://wiki.mozilla.org/IonMonkey)

### Terrence’s repos
* [https://github.com/hlim1/JITCIRModeler](https://github.com/hlim1/JITCIRModeler)
  * This is what we look at?
* [https://github.com/hlim1/JITCompilerIRViz?tab=readme-ov-file](https://github.com/hlim1/JITCompilerIRViz?tab=readme-ov-file)
  * This is old, likely not what we need


## TODOs 
Read [Design Study Methodology: Reflections from the Trenches and the Stacks](https://drive.google.com/file/d/1PbS8vmUI4WQesHkMsnluOYonrAgspYXJ/view?usp=sharing)
  * Due by: Thurs or next week?

~~On Thursday, we’ll talk about the papers from a content standpoint but also from a style standpoint – how are they written? How are they the same/different?
Specifically, those 3 papers: Lim, JITScope, DisViz
We’ll also review the contents of this meeting~~
**On Thursday, we’ll meet over Zoom with Dr. Kate Isaacs**
* Between now and then, add comments to the week 01 papers on Google Drive to analyze the writing. Think about:
    * Who is the audience for this section? How is that the same/different for the other papers?
    * What information is presented? How is it presented (text, definitions, figures, symbols)?
    * How is the related work section laid out? Do you notice trends across the three papers?


## Thurs, Jan 22 - Group Meeting
Review the syllabus. Intro. Meeting times
* Set those: 2-3 PM on Tuesdays for individual meetings, 9:45-10:45 AM on Thursdays for group
Reviewed grading – breakdown of the sections and deliverables

TODOs:
* Wait for Dr. Williams to finish the syllabus (by EOD Thurs) then submit your Kuali forms for the Registrar
* Read the Lim and Koborouv paper in full
  * Then discuss it together to better understand it
* Read the JITScope paper (by Kyra and Yumna) -- this is what we're going to extend, so be prepared to ask Dr. Lim questions next week
* Shadmaan's paper "DisViz" -- this is a data vis paper, so it's an example of what we hope to write. Closely read the Abstract, Introduction, Background, Methodology, and Visualization Design. I'd like us all to fully understand those sections. The other sections can be read more lightly and it's ok if there is still some confusion
* Redo Lab 7 to refresh your D3 skills
* All papers are linked [here](https://drive.google.com/drive/folders/12Ie1mGx-F6mFgl4Mr23RGoWGHZ8u4YIx?usp=sharing) and I'll put the folder as a link in "Important Links" (at the top of this channel, the button "Important Links") (edited) 

