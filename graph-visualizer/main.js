/**
 * Main visualization file.
 * Handles data loading, phase logic, visualization type selection,
 * and coordinates between different visualization modes.
 * 
 * @author Ellora Devulapally, Taft Harrell
 */

let IR_data;
let currentVisualization = 'force-directed'; // default visualization type

/**
 * Load data and wait for it to load before calling any other functions
 * 
 * @returns the loaded data from the JSON
 */
async function loadData() {
    IR_data = await d3.json("../toy-datasets/IR/ir-after-spring-break.json");
    console.log("loaded the data", IR_data);
    return IR_data;
}

/**
 * Initializes the visualization by parsing through the data, getting all phases and phaseIDs, setting
 * initial phase to display, get all nodes and edges, and create options in the HTML select element.
 */
async function initVis() {
    let vis = this;

    vis.data = await loadData();

    vis.tooltipPadding = 15;
    vis.phases = [];
    vis.phaseIDs = [];
    getPhases();

    //Set vis.filter equal to the first phase of optimization to show the graph after first phase of optimization.
    vis.filter = Number(vis.phaseIDs[0]);

    vis.nodes = vis.data.nodes;
    vis.nodeEdges = organizeEdges();
    vis.activeNodesByPhase = determineNodeActiveStatus();

    fillSelectionBox();  // buttons.js
    setupVisualizationToggle(); // Setup visualization type selector
    updateVis();
}

/**
 * Setup the visualization type toggle between static and force-directed
 */
function setupVisualizationToggle() {
    const toggleButton = document.getElementById("visTypeToggle");
    const currentVisType = document.getElementById("currentVisType");
    
    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            // Toggle between visualization types
            currentVisualization = (currentVisualization === 'force-directed') ? 'static' : 'force-directed';
            
            // Update button text
            if (currentVisType) {
                currentVisType.textContent = currentVisualization === 'force-directed' 
                    ? 'Force-Directed' 
                    : 'Static';
            }
            
            // Re-render with new visualization type
            renderVis();
        });
    }
}

/**
 * Sorts through nodes and edges, filtering based on the phase the user has selected.
 */
function updateVis() {
    let vis = this;

    vis.phaseNodes = vis.activeNodesByPhase.get(vis.filter);

    const phaseEdges = [];
    vis.nodes.forEach(node => {
        //Skip if node is not part of this phase
        if (!vis.phaseNodes.has(node.id)) return;

        //Get edges of node
        const phaseDictionary = vis.nodeEdges.get(node.id);
        let activeEdges = null;

        const phases = Array.from(phaseDictionary.keys())
            .map(Number)
            .sort((a, b) => a - b);

        for (const p of phases) {
            if (p <= vis.filter) activeEdges = phaseDictionary.get(p);
            else break;
        }

        if (activeEdges === null) activeEdges = node.initialEdges;

        activeEdges.forEach(targetNode => {
            if (targetNode === -1) return;
            if (!vis.phaseNodes.has(targetNode)) return;
            phaseEdges.push([node.id, targetNode]);
        });
    });

    vis.links = phaseEdges.map(([s, t]) => ({ source: s, target: t, type: "basic" }));

    renderVis();
}

/**
 * Delegates rendering to the appropriate visualization type
 */
function renderVis() {
    if (currentVisualization === 'force-directed') {
        renderForceDirectedVis();  // forcedirected.js
    } else {
        renderStaticVis();  // static.js
    }
}

/**
 * Parses through the entire IR file and generates a data structure containing every single 
 * node's incoming edges for every single phase.
 * 
 * @returns nodeEdges -- a dictionary of the following format: keys with node IDs, values as sub-dictionarys with
 * keys as phase IDs, values as a list of incoming edges.
 */
function organizeEdges() {
    let vis = this;

    const nodeEdges = new Map();

    //Loop through every single node in the IR
    vis.nodes.forEach(node => {

        //Sub dictionary with keys as phaseIDs and values as list of edges
        const phaseDictionary = new Map();
        nodeEdges.set(node.id, phaseDictionary);

        const node_removed = Array.from(Object.entries(node.removed));
        const node_replaced = Array.from(Object.entries(node.replaced));
        const node_added = Array.from(Object.entries(node.added));
        node_instructions = node.instAccess;

        //Retrieve first instruction in which node was created
        const first_instruction = Object.entries(node_instructions)[0][0];
        const first_instruction_phase = node_instructions[first_instruction].phaseFnId;

        var edge_relevant_instructions = [];

        //Add all optimization instructions to a list
        for (const instruction of node_removed) {
            edge_relevant_instructions.push(instruction);
        }

        for (const instruction of node_replaced) {
            edge_relevant_instructions.push(instruction);
        }

        for (const instruction of node_added) {
            edge_relevant_instructions.push(instruction);
        }

        //Sort numerically -- instruction IDs are incremented as they are created; thus sorting numerically
        //is also sorting chronologically
        edge_relevant_instructions.sort((a, b) => Number(a[0]) - Number(b[0]));

        //We use these variables to increment our indices and make sure we're adding a list of edges for
        //every single phase of the IR
        var phaseNumber = 0;
        var phaseID = 0;

        //Add empty lists for all phases before the node was created
        while (first_instruction_phase > Number(vis.phaseIDs[phaseID])) {
            phaseDictionary.set(Number(vis.phaseIDs[phaseID]), []);
            phaseID += 1;
        }

        //Loop through all optimization instructions for this node
        edge_relevant_instructions.forEach(instruction => {

            const instructionID = instruction[0];
            const instructionPhase = node_instructions[instructionID].phaseFnId;

            //If we haven't seen this phaseID yet, add it
            if (!(Array.from(phaseDictionary.keys()).includes(instructionPhase))) {

                //If it's the first phase node was created, set as inital edges
                if (Number(vis.phaseIDs[phaseID]) == first_instruction_phase) {
                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), node.initialEdges);
                }

                //If we've moved onto a new phase, retrieve edges from previous phase
                while (Number(vis.phaseIDs[phaseID]) < instructionPhase) {
                    phaseID += 1;
                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseID - 1]).slice());
                }
            }

            //Carry out replacement instruction
            if (node_replaced.length != 0) {
                if (node_replaced.includes(instruction)) {
                    const replacedEntry = node_replaced.find(([key]) => key === instructionID.toString());
                    if (replacedEntry) {
                        var instruction = replacedEntry[1];
                        var edgePosition = instruction.position;
                        var newValue = instruction.to;
                        var edges = phaseDictionary.get(instructionPhase).slice();
                        edges[edgePosition] = newValue;
                        phaseDictionary.set(instructionPhase, edges);
                    }
                }
            }

            //Carry out removal instruction
            if (node_removed.length != 0) {
                if (node_removed.includes(instruction)) {
                    const removedEntry = node_removed.find(([key]) => key === instructionID.toString());
                    if (removedEntry) {
                        var instruction = removedEntry[1];
                        var removedNode = instruction.nodeId;
                        var edges = phaseDictionary.get(instructionPhase);
                        edges.splice(edges.indexOf(removedNode), 1);
                        phaseDictionary.set(instructionPhase, edges);
                    }
                }
            }

            //Carry out added instruction
            if (node_added.length != 0) {
                console.log("yo");
                if (node_added.includes(instruction)) {
                    const addedEntry = node_added.find(([key]) => key === instructionID.toString());
                    if (addedEntry) {
                        var instruction = addedEntry[1];
                        var addedNode = instruction.nodeId;
                        var position = instruction.position;
                        var edges = phaseDictionary.get(instructionPhase);
                        edges[position] = addedNode;
                        phaseDictionary.set(instructionPhase, edges);
                    }
                }
            }

        });

        //In the case that a node doesn't go through optimization, set all phases after in which node was created
        //to initial edges
        if (edge_relevant_instructions.length == 0) {

            phaseNumber = 0;
            phaseDictionary.set(first_instruction_phase, node.initialEdges);

            vis.phaseIDs.forEach(phase => {
                phase = Number(phase);
                if (!(Array.from(phaseDictionary.keys()).includes(phase))) {
                    if (phase < first_instruction_phase) {
                        phaseDictionary.set(Number(phase), []);
                    } else {
                        phaseDictionary.set(Number(phase), phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseNumber - 1]));
                    }
                }
                phaseNumber += 1;
            });

        } else {

            //Make sure edges are added for phases after last instruction occurred in. E.g. a node might be last optimized
            //in phase 7, but there are 15 phases, so for phases 8 - 15, retrieve the previous edges
            for (let i = 0; i < vis.phaseIDs.length; i++) {
                phaseKeys = Array.from(phaseDictionary.keys());
                if (!(phaseKeys.includes(Number(vis.phaseIDs[i])))) {
                    phaseDictionary.set(Number(vis.phaseIDs[i]), phaseDictionary.get(phaseKeys[i - 1]));
                }
            }
        }
    });

    return nodeEdges;
}

/**
 * Parses through all of the instructions for every node of the JSON file and identifies
 * which nodes are alive and which are dead for every single phase.
 * 
 * @returns activeNodesByPhase -- a dictionary with keys as phase IDs and values as a set
 * of node IDs representing all nodes alive during that phase.
 */
function determineNodeActiveStatus() {
    let vis = this;

    //These types are specified by Dr. Lim's JSON file specification
    const CREATE = 7;
    const KILL = 3;

    const activeNodesByPhase = new Map();
    const alive = new Set();
    const phases = vis.phaseIDs.map(Number).sort((a, b) => a - b);

    for (const phase of phases) {
        activeNodesByPhase.set(phase, new Set());
    }
    
    for (const phase of phases) {
        vis.nodes.forEach(node => {
            //Look through all of a node's instructions and find where type == 3 or 7.
            for (const [instId, rec] of Object.entries(node.instAccess || {})) {
                if (Number(rec.phaseFnId) === phase) {
                    if (rec.type === CREATE) alive.add(node.id);
                    if (rec.type === KILL) alive.delete(node.id);
                }
            }
        });
        activeNodesByPhase.set(phase, new Set(alive));
    }

    return activeNodesByPhase;
}

/**
 * Parses through the fnId2Name dictionary of the IR file to find all phase names
 * and phase IDs of optimization that the compiler went through.
 * 
 * vis.phaseIDs and vis.phases are declared during initVis and are filled using this function.
 */
function getPhases() {
    let vis = this;

    const functionIds = Object.entries(vis.data["fnId2Name"]);

    functionIds.forEach(functionId => {
        if (functionId[1].includes("Phase::Run")) {
            vis.phaseIDs.push(functionId[0]);
            vis.phases.push(functionId[1]);
        }
    });
}

initVis();