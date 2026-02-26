# Agenda

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

