/**
 * Main visualization file.
 * Handles data loading, phase logic, and coordinates between
 * static (static.js) and force-directed (forcedirected.js) renderers.
 *
 * vis.links      → coordinate-based links used by static renderer
 * vis.fdLinks    → ID-based links used by force-directed renderer
 *
 * @author Ellora Devulapally, Taft Harrell
 */

let IR_data;
let currentVisualization = 'static'; // default view


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

    vis.filter = Number(vis.phaseIDs[0]);

    vis.nodes = vis.data.nodes;
    vis.nodeEdges = organizeEdges();
    vis.activeNodesByPhase = determineNodeActiveStatus();

    // vis.circles: fixed grid positions keyed by node array index.
    // Used by the static renderer (same formula as original main.js).
    const radius = 35;
    const cols = 10;
    vis.circles = vis.nodes.map((node, i) => {
        const cx = (i * (radius * 2) + radius) % (cols * radius * 2);
        const cy = (2 * radius) * Math.floor(i / cols) + radius * 2;
        return { x: cx, y: cy };
    });

    // linkPath: used by static renderer to draw curved paths
    vis.linkPath = d3.linkHorizontal()
        .x(d => d.x)
        .y(d => d.y);

    fillSelectionBox();           // buttons.js
    setupVisualizationToggle();
    updateVis();
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

/**
 * Creates and updates the visualization toggle, allowing the user to switch
 * between static and force-directed views.
 */
function setupVisualizationToggle() {
    const toggleButton = document.getElementById("visTypeToggle");
    const currentVisLabel = document.getElementById("currentVisType");

    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            currentVisualization = (currentVisualization === 'static') ? 'force-directed' : 'static';
            if (currentVisLabel) {
                currentVisLabel.textContent = currentVisualization === 'static' ? 'Static' : 'Force-Directed';
            }
            // Data hasn't changed, just re-render in the new mode
            renderVis();
        });
    }
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Sorts through nodes and edges, filtering based on the phase the user has selected.
 * Builds both link formats so either renderer can be called without re-filtering.
 */
function updateVis() {
    let vis = this;

    vis.phaseNodes = vis.activeNodesByPhase.get(vis.filter);

    const phaseEdges = []; // [ [sourceId, targetId], ... ]

    vis.nodes.forEach(node => {
        if (!vis.phaseNodes.has(node.id)) return;

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

    // Format for static renderer: coordinate objects using vis.circles
    vis.links = phaseEdges.map(([s, t]) => ({
        source: vis.circles[s],
        target: vis.circles[t]
    }));

    // Format for force-directed renderer: node ID references + type
    vis.fdLinks = phaseEdges.map(([s, t]) => ({ source: s, target: t, type: "basic" }));

    renderVis();
}


/**
 * Delegates rendering to the appropriate visualization type.
 */
function renderVis() {
    if (currentVisualization === 'static') {
        renderStaticVis();        // static.js
    } else {
        renderForceDirectedVis(); // forcedirected.js
    }
}


/**
 * Parses through the entire IR file and generates a data structure containing every single 
 * node's incoming edges for every single phase.
 * 
 * @returns nodeEdges -- a Map with node IDs as keys, values as sub-Maps with
 * phase IDs as keys and lists of incoming edges as values.
 */
function organizeEdges() {
    let vis = this;

    const nodeEdges = new Map();

    vis.nodes.forEach(node => {

        const phaseDictionary = new Map();
        nodeEdges.set(node.id, phaseDictionary);

        const node_removed = Array.from(Object.entries(node.removed));
        const node_replaced = Array.from(Object.entries(node.replaced));
        const node_added = Array.from(Object.entries(node.added));
        node_instructions = node.instAccess;

        const first_instruction = Object.entries(node_instructions)[0][0];
        const first_instruction_phase = node_instructions[first_instruction].phaseFnId;

        var edge_relevant_instructions = [];

        for (const instruction of node_removed) edge_relevant_instructions.push(instruction);
        for (const instruction of node_replaced) edge_relevant_instructions.push(instruction);
        for (const instruction of node_added) edge_relevant_instructions.push(instruction);

        // Sort numerically — instruction IDs are incremented as created, so this is also chronological
        edge_relevant_instructions.sort((a, b) => Number(a[0]) - Number(b[0]));

        var phaseNumber = 0;
        var phaseID = 0;

        // Add empty lists for all phases before the node was created
        while (first_instruction_phase > Number(vis.phaseIDs[phaseID])) {
            phaseDictionary.set(Number(vis.phaseIDs[phaseID]), []);
            phaseID += 1;
        }

        edge_relevant_instructions.forEach(instruction => {

            const instructionID = instruction[0];
            const instructionPhase = node_instructions[instructionID].phaseFnId;

            if (!(Array.from(phaseDictionary.keys()).includes(instructionPhase))) {

                if (Number(vis.phaseIDs[phaseID]) == first_instruction_phase) {
                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), node.initialEdges);
                }

                while (Number(vis.phaseIDs[phaseID]) < instructionPhase) {
                    phaseID += 1;
                    phaseDictionary.set(Number(vis.phaseIDs[phaseID]), phaseDictionary.get(Array.from(phaseDictionary.keys())[phaseID - 1]).slice());
                }
            }

            if (node_replaced.length != 0 && node_replaced.includes(instruction)) {
                const replacedEntry = node_replaced.find(([key]) => key === instructionID.toString());
                if (replacedEntry) {
                    var instruction = replacedEntry[1];
                    var edges = phaseDictionary.get(instructionPhase).slice();
                    edges[instruction.position] = instruction.to;
                    phaseDictionary.set(instructionPhase, edges);
                }
            }

            if (node_removed.length != 0 && node_removed.includes(instruction)) {
                const removedEntry = node_removed.find(([key]) => key === instructionID.toString());
                if (removedEntry) {
                    var instruction = removedEntry[1];
                    var edges = phaseDictionary.get(instructionPhase);
                    edges.splice(edges.indexOf(instruction.nodeId), 1);
                    phaseDictionary.set(instructionPhase, edges);
                }
            }

            if (node_added.length != 0 && node_added.includes(instruction)) {
                const addedEntry = node_added.find(([key]) => key === instructionID.toString());
                if (addedEntry) {
                    var instruction = addedEntry[1];
                    var edges = phaseDictionary.get(instructionPhase);
                    edges[instruction.position] = instruction.nodeId;
                    phaseDictionary.set(instructionPhase, edges);
                }
            }
        });

        // Node doesn't go through optimization: fill all phases from initialEdges or empty
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
            // Carry forward edges for phases after the last instruction
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
 * @returns activeNodesByPhase -- a Map with phase IDs as keys and Sets of alive node IDs as values.
 */
function determineNodeActiveStatus() {
    let vis = this;

    // These types are specified by Dr. Lim's JSON file specification
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