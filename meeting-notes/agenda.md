# Agenda

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

